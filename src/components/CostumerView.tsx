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
  Sun,
  DollarSign
} from 'lucide-react';
import { clientSupaBase } from '../supabase/client';
import type { Profile, Trip } from '../types';

interface TripRequestForm {
  passengerName: string;
  pickup?: string;
  destination?: string;
  phone?: string;
  preferredTime?: string;
  customerId: string;
}

interface RequestStatusCard {
  driverName: string;
  pickup?: string;
  destination?: string;
  preferredTime?: string;
  createdAt: string;
  status: Trip['done'];
  customerId: string;
  price?: number;
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
    if (!customerId) return;

    const loadLastRequest = async () => {
      const { data: tripData, error } = await clientSupaBase
        .from('Trips')
        .select('done, created_at, owner_id, name, pickup, destination, preferred_time, price')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && tripData) {
        // Get driver name
        const { data: driverData } = await clientSupaBase
          .from('UsersProfile')
          .select('username')
          .eq('owner_id', tripData.owner_id)
          .single();

        setLastRequest({
          driverName: driverData?.username ?? 'Conductor',
          pickup: tripData.pickup,
          destination: tripData.destination,
          preferredTime: tripData.preferred_time || 'N/D',
          createdAt: tripData.created_at,
          status: tripData.done as Trip['done'],
          customerId: customerId,
          price: tripData.price
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
        .select('id, owner_id, username, email, phone, carModel, carPlate, pictureUrl, created_at')
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
        .single();

      if (!error && data && (data.done !== currentStatus || data.price !== lastRequest.price)) {
        // Get driver name
        const { data: driverData } = await clientSupaBase
          .from('UsersProfile')
          .select('username')
          .eq('owner_id', data.owner_id)
          .single();

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
      const fields = [driver.username, driver.carModel, driver.carPlate, driver.phone].filter(
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
      customerId: customerId || ''
    });
    setSubmitting(false);
    setSelectedDriver(null);
    setForm(initialFormState);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex justify-end px-6 pt-6">
          <button
            type="button"
            onClick={() => setDarkMode(prev => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>

        <section className="px-6 pt-16 pb-10 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            <Clock className="w-4 h-4" />
            Solicita tu viaje sin registrarte
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Encuentra conductores de confianza en segundos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explora la flota disponible, conoce a cada conductor y envía una solicitud de viaje. Tu pedido queda en estado
            "pendiente" hasta que el conductor lo apruebe.
          </p>
          {confirmation && (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              {confirmation}
            </div>
          )}
        </section>

        {lastRequest && (
          <section className="px-6 pb-10 max-w-4xl mx-auto">
            <div className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-md p-6 flex flex-col gap-4 ${
              lastRequest.status === 'completed' 
                ? 'border-green-200 dark:border-green-800' 
                : lastRequest.status === 'cancelled' 
                ? 'border-red-200 dark:border-red-800' 
                : 'border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Estado de tu solicitud</p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{lastRequest.driverName}</h3>
                </div>
                {lastRequest.status === 'pending' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    Pendiente
                  </span>
                )}
                {lastRequest.status === 'completed' && (
                <>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Aceptado
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    {lastRequest.price?.toFixed(2)}
                  </span>
                </>
                )}

                {lastRequest.status === 'cancelled' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 text-sm font-semibold">
                    <span className="text-xl leading-none">×</span>
                    Cancelado
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <p className="uppercase text-xs text-gray-500 tracking-wide">Origen</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{lastRequest.pickup}</p>
                </div>
                <div>
                  <p className="uppercase text-xs text-gray-500 tracking-wide">Destino</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{lastRequest.destination}</p>
                </div>
                <div>
                  <p className="uppercase text-xs text-gray-500 tracking-wide">Horario</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{lastRequest.preferredTime}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {new Date(lastRequest.createdAt).toLocaleString()}.
                {lastRequest.status === 'pending' && ' Te avisaremos cuando el conductor confirme o rechace la solicitud.'}
                {lastRequest.status === 'completed' && ' ¡Tu viaje ha sido aceptado! El conductor se pondrá en contacto contigo.'}
                {lastRequest.status === 'cancelled' && ' Lo sentimos, tu solicitud fue rechazada. Puedes intentar con otro conductor.'}
              </p>
            </div>
          </section>
        )}

        <section className="px-6 pb-20 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Conductores verificados</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{drivers.length} disponibles</p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <label className="sr-only" htmlFor="driver-search">
                  Buscar conductor
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="driver-search"
                    type="text"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Buscar por nombre, auto, patente o teléfono"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}

          {!loading && listError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              {listError}
            </div>
          )}

          {!loading && !listError && filteredDrivers.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">No encontramos conductores con ese criterio.</p>
              <p className="text-sm text-gray-500 mt-2">Prueba con otro nombre o revisa más tarde.</p>
            </div>
          )}

          {!loading && !listError && filteredDrivers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map(driver => (
                <article
                  key={driver.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase">
                      {driver.pictureUrl ? (
                        <img src={driver.pictureUrl} alt={driver.username ?? 'Conductor'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        driver.username?.slice(0, 2) || 'DR'
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{driver.username}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Disponible hoy
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 flex-1">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Vehículo</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{driver.carModel || 'Modelo no informado'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Patente: {driver.carPlate || 'N/D'}</p>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
                    <Phone className="w-4 h-4" />
                    <span>{driver.phone || 'Sin teléfono'}</span>
                  </div>

                  <button
                    onClick={() => handleOpenRequest(driver)}
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Solicitar viaje
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-sm text-gray-500">Solicitar viaje con</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedDriver.username}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nombre y apellido *</label>
                <input
                  type="text"
                  value={form.passengerName}
                  onChange={event => handleChange('passengerName', event.target.value)}
                  required
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ej: Carla Gómez"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Punto de partida *</label>
                <input
                  type="text"
                  value={form.pickup}
                  onChange={event => handleChange('pickup', event.target.value)}
                  required
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Dirección exacta"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Destino *</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={event => handleChange('destination', event.target.value)}
                  required
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ciudad o dirección"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Teléfono de contacto</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={event => handleChange('phone', event.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Con código de área"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Horario preferido</label>
                  <input
                    type="text"
                    value={form.preferredTime}
                    onChange={event => handleChange('preferredTime', event.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: Mañana 8:00"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDriver(null)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? 'Enviando...' : 'Confirmar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostumerView;
