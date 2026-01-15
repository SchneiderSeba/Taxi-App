import { useEffect, useMemo, useState } from 'react';
import {
  Car,
  Phone,
  MapPin,
  Search,
  Loader2,
  Send,
  Clock,
  CheckCircle,
  Moon,
  Sun
} from 'lucide-react';
import { clientSupaBase } from '../supabase/client';
import type { Profile, Trip } from '../types';
import CustomerTripCard from './CustomerTripCard';
// import { setOptions } from '@googlemaps/js-api-loader';
// import { NewTripForm } from './NewTripForm';
import { NewTripFormV2 } from './NewTripFormV2';
import { loadGoogleMaps } from '../lib/GoogleMapsServices';
export interface TripRequestForm {
  passengerName: string;
  pickup?: string;
  destination?: string;
  phone?: string;
  preferredTime?: string;
  customerId: string;
}

export interface RequestStatusCard {
  driverName: string;
  pickup?: string;
  destination?: string;
  preferredTime?: string;
  createdAt: string;
  status: Trip['done'];
  customerId: string;
  ownerId: string; // ID del driver
  price?: number;
  driverAvailable?: boolean;
}

const initialFormState: TripRequestForm = {
  passengerName: '',
  pickup: '',
  destination: '',
  phone: '',
  preferredTime: '',
  customerId: '' // This will be set from localStorage`
};

const CostumerView = () => {
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Profile | null>(null);
  const [form, setForm] = useState<TripRequestForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<RequestStatusCard | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // useEffect(() => {
  //   setOptions({
  //     key: import.meta.env.VITE_PUBLIC_GOOGLEMAP_KEY,
  //   });
  // }, []);

  useEffect(() => {
    const load = async () => {
      console.log('[CostumerView] calling loadGoogleMaps()');
      await loadGoogleMaps();
      console.log('[CostumerView] loadGoogleMaps() resolved');
    };
    load();
  }, []);

// Generar un id unico para el Customer 
  const [customerId, setCustomerId] = useState<string | null>(null);
// Guardarlo customerId en localstorage
  useEffect(() => {
    const storedCustomerId = localStorage.getItem('customerId');
    if (!storedCustomerId) {
      const newCustomerId = String(Math.floor(10000000 + Math.random() * 90000000));
      localStorage.setItem('customerId', newCustomerId);
      setCustomerId(newCustomerId);
      console.log('Nuevo customerId generado:', newCustomerId);
    } else {
      setCustomerId(storedCustomerId);
      console.log('customerId recuperado de localStorage:', storedCustomerId);
    }
  }, []);

  // Load last request when customerId is available
  useEffect(() => {
    if (!customerId) {
      console.log('customerId no disponible aún, esperando...');
      return;
    }

    console.log('Cargando última solicitud para customerId:', customerId);

    const loadLastRequest = async () => {
      const { data: tripData, error } = await clientSupaBase
        .from('Trips')
        .select('done, created_at, owner_id, name, pickup, destination, preferred_time, price')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log('No se encontró solicitud previa:', error.message);
        return;
      }

      if (tripData) {
        console.log('Solicitud encontrada:', tripData);
        // Get driver name
        const { data: driverData } = await clientSupaBase
          .from('UsersProfile')
          .select('username, displayName, available')
          .eq('owner_id', tripData.owner_id)
          .maybeSingle();

        setLastRequest({
          driverName: driverData?.displayName || driverData?.username || 'Conductor',
          pickup: tripData.pickup,
          destination: tripData.destination,
          preferredTime: tripData.preferred_time || 'N/D',
          createdAt: tripData.created_at,
          status: tripData.done as Trip['done'],
          customerId: customerId,
          ownerId: tripData.owner_id,
          price: tripData.price,
          driverAvailable: driverData?.available ?? false
        });
      }
    };

    loadLastRequest();
  }, [customerId]);


  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setListError(null);

      const { data, error: supaError } = await clientSupaBase
        .from('UsersProfile')
        .select('id, owner_id, username, email, phone, carModel, carPlate, pictureUrl, created_at, displayName, available')
        .order('created_at', { ascending: false });

      if (supaError) {
        console.error('Error loading drivers', supaError);
        setListError('No pudimos cargar la lista de conductores. Intenta nuevamente en unos segundos.');
      } else if (data) {
        setDrivers(data);
      }

      setLoading(false);
    };

    fetchDrivers();

    // Suscripción en tiempo real a cambios en UsersProfile
    const subscription = clientSupaBase
      .channel('drivers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'UsersProfile'
        },
        () => {
          console.log('Cambio detectado en UsersProfile, recargando conductores...');
          fetchDrivers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Poll for trip status updates when there's an active request
  useEffect(() => {
    if (!customerId || !lastRequest) return;

    const currentStatus = lastRequest.status;

    const pollTripStatus = async () => {
      const { data, error } = await clientSupaBase
        .from('Trips')
        .select('done, created_at, owner_id, price')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && (data.done !== currentStatus || data.price !== lastRequest.price)) {
        // Get driver name
        const { data: driverData } = await clientSupaBase
          .from('UsersProfile')
          .select('username, displayName, available')
          .eq('owner_id', data.owner_id)
          .maybeSingle();

        setLastRequest(prev => prev ? {
          ...prev,
          status: data.done as Trip['done'],
          createdAt: data.created_at,
          driverName: driverData?.username ?? prev.driverName,
          price: data.price
        } : null);
      }
    };

    // Check immediately
    pollTripStatus();

    // Then poll every 10 seconds
    const interval = setInterval(pollTripStatus, 10000);

    return () => clearInterval(interval);
  }, [customerId, lastRequest]);

  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;
    const term = search.toLowerCase();
    return drivers.filter(driver => {
      const fields = [driver.username, driver.carModel, driver.carPlate, driver.phone, driver.displayName, driver.available?.toString()].filter(
        (value): value is string => Boolean(value)
      );
      return fields.some(field => field.toLowerCase().includes(term));
    });
  }, [drivers, search]);

  const handleOpenRequest = (driver: Profile) => {
    setSelectedDriver(driver);
    setForm(initialFormState);
    setConfirmation(null);
    setFormError(null);
  };

  const handleChange = (field: keyof TripRequestForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDriver) return;

    const { passengerName, pickup, destination, phone, preferredTime } = form;

    if (!passengerName?.trim() || !pickup?.trim() || !destination?.trim()) {
      setFormError('Nombre, punto de partida y destino son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: passengerName,
      pickup,
      destination,
      passenger_phone: phone || null,
      preferred_time: preferredTime || null,
      owner_id: selectedDriver.owner_id,
      done: 'pending' as Trip['done'],
      customer_id: customerId || '' // Use the customerId from localStorage
    };

    const { error: supaError, data } = await clientSupaBase
      .from('Trips')
      .insert(payload)
      .select()
      .single();

    if (supaError) {
      console.error('Error creating trip', supaError);
      setFormError('No pudimos enviar la solicitud. Intenta nuevamente.');
      setSubmitting(false);
      return;
    }

    setConfirmation('Tu solicitud fue enviada. Espera la confirmación del conductor.');
    setLastRequest({
      driverName: selectedDriver.username ?? 'Conductor',
      pickup,
      destination,
      preferredTime: preferredTime || 'N/D',
      createdAt: data?.created_at ?? new Date().toISOString(),
      status: 'pending',
      customerId: customerId || '',
      ownerId: selectedDriver.owner_id
    });
    setSubmitting(false);
    setSelectedDriver(null);
    setForm(initialFormState);
  };

  return (
    <>
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex justify-end px-3 sm:px-6 pt-4 sm:pt-6">
          <button
            type="button"
            onClick={() => setDarkMode(prev => !prev)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 text-xs sm:text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[40px]"
          >
            {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            <span className="hidden xs:inline">{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
        </div>

        <section className="px-4 sm:px-6 pt-8 sm:pt-16 pb-6 sm:pb-10 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Solicita tu viaje sin registrarte
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Encuentra conductores de confianza en segundos
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Explora la flota disponible, conoce a cada conductor y envía una solicitud de viaje. Tu pedido queda en estado
            "pendiente" hasta que el conductor lo apruebe.
          </p>
          {confirmation && (
            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {confirmation}
            </div>
          )}
        </section>

        {lastRequest && (
          <CustomerTripCard lastRequest={lastRequest} />
        )}

        <section className="px-4 sm:px-6 pb-12 sm:pb-20 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Conductores verificados</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{drivers.length} disponibles</p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <label className="sr-only" htmlFor="driver-search">
                  Buscar conductor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" size={18} />
                  <input
                    id="driver-search"
                    type="text"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Buscar por nombre, auto, patente o teléfono"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm sm:text-base min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12 sm:py-16">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 animate-spin" />
            </div>
          )}

          {!loading && listError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 text-center text-sm sm:text-base">
              {listError}
            </div>
          )}

          {!loading && !listError && filteredDrivers.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center">
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">No encontramos conductores con ese criterio.</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Prueba con otro nombre o revisa más tarde.</p>
            </div>
          )}

          {!loading && !listError && filteredDrivers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDrivers.map(driver => (
                <article
                  key={driver.id}
                  className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col ${
                    !driver.available ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase shrink-0">
                      {driver.pictureUrl ? (
                        <img src={driver.pictureUrl} alt={driver.username ?? 'Conductor'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm sm:text-base">{driver.username?.slice(0, 2) || 'DR'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{driver.displayName || driver.username}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">{driver.available ? 'Disponible hoy' : 'No disponible'}</span>
                        <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ml-1 shrink-0 ${
                          driver.available ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 flex-1">
                    <p className="text-[10px] sm:text-sm text-gray-500 uppercase tracking-wide">Vehículo</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mt-0.5 sm:mt-1 truncate">{driver.carModel || 'Modelo no informado'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Patente: {driver.carPlate || 'N/D'}</p>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">{driver.phone || 'Sin teléfono'}</span>
                  </div>

                  <button
                    onClick={() => handleOpenRequest(driver)}
                    disabled={!driver.available}
                    className={`mt-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 w-full py-2.5 sm:py-3 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors text-sm sm:text-base min-h-[44px] ${
                      driver.available
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    {driver.available ? 'Solicitar viaje' : 'No disponible'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedDriver && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            // Cerrar si se hace clic en el fondo
            if (e.target === e.currentTarget) {
              setSelectedDriver(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full my-4 sm:my-8">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Solicitar viaje con</p>
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{selectedDriver.displayName || selectedDriver.username}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
              >
                ×
              </button>
            </div>

            {/* <NewTripForm
              handleSubmitRequest={handleSubmitRequest}
              handleChange={handleChange}
              passengerName={form.passengerName}
              pickup={form.pickup || ''}
              destination={form.destination || ''}
              phone={form.phone || ''}
              preferredTime={form.preferredTime || ''}
              formError={formError}
              setSelectedDriver={setSelectedDriver}
              submitting={submitting}
            /> */}

            <NewTripFormV2
              handleSubmitRequest={handleSubmitRequest}
              handleChange={handleChange}
              passengerName={form.passengerName}
              pickup={form.pickup || ''}
              destination={form.destination || ''}
              phone={form.phone || ''}
              preferredTime={form.preferredTime || ''}
              formError={formError}
              setSelectedDriver={setSelectedDriver}
              submitting={submitting}
            />

          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CostumerView;
