import { Loader2, Send } from 'lucide-react';
import { TripRequestForm } from './CostumerView';
import { Profile } from '../types';
/// <reference types="@types/google.maps" />
import { useEffect, useRef } from 'react';
import  { importLibrary } from '@googlemaps/js-api-loader';

interface NewTripFormProps {
  handleSubmitRequest: (e: React.FormEvent) => void;
  handleChange: (field: keyof TripRequestForm, value: string) => void;
    passengerName: string;
    pickup: string;
    destination: string;
    phone: string;
    preferredTime: string;
    formError: string | null;
    setSelectedDriver: (driver: Profile | null) => void;
    submitting: boolean;
    pickupInputRef?: React.RefObject<HTMLInputElement>;
    destinationInputRef?: React.RefObject<HTMLInputElement>;
}

export default function GooglePlaces() {
    
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const destinationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  
  const autoComplete = async () => {

    const { Autocomplete } = await importLibrary("places");

    const pickupInputAutoComplete = new Autocomplete(pickupInputRef.current!, {
      fields: ["formatted_address"],
      types: ["geocode"],
    });

    const destinationInputAutoComplete = new Autocomplete(destinationInputRef.current!, {
      fields: ["formatted_address"],
      types: ["geocode"],
    });

    pickupInputAutoComplete.addListener("place_changed", () => {
      const place = pickupInputAutoComplete.getPlace();
      if (!place.formatted_address) return;
        pickupInputRef.current!.value = place.formatted_address;
    });

    destinationInputAutoComplete.addListener("place_changed", () => {
      const place = destinationInputAutoComplete.getPlace();
      if (!place.formatted_address) return;
        destinationInputRef.current!.value = place.formatted_address;
    })
  };

  autoComplete();
  
  }, []);
}

export const NewTripForm: React.FC<NewTripFormProps> = ({
  handleSubmitRequest,
  handleChange,
  passengerName,
  pickup,
  destination,
  phone,
  preferredTime,
  formError,
  setSelectedDriver,
  submitting,
  pickupInputRef,
  destinationInputRef,
}) => {
  // Si no se pasan refs, crea internos
  const localPickupRef = useRef<HTMLInputElement>(null);
  const localDestinationRef = useRef<HTMLInputElement>(null);

  // Usa los que vienen por props o los internos
  const pickupRef = pickupInputRef || localPickupRef;
  const destinationRef = destinationInputRef || localDestinationRef;

  useEffect(() => {
    let pickupInputAutoComplete: google.maps.places.Autocomplete | null = null;
    let destinationInputAutoComplete: google.maps.places.Autocomplete | null = null;

    const autoComplete = async () => {
      const { Autocomplete } = await importLibrary("places");
      if (pickupRef.current) {
        pickupInputAutoComplete = new Autocomplete(pickupRef.current, {
          fields: ["formatted_address"],
          types: ["geocode"],
        });
        pickupInputAutoComplete.addListener("place_changed", () => {
          const place = pickupInputAutoComplete!.getPlace();
          if (!place.formatted_address) return;
          pickupRef.current!.value = place.formatted_address;
          handleChange('pickup', place.formatted_address);
        });
      }
      if (destinationRef.current) {
        destinationInputAutoComplete = new Autocomplete(destinationRef.current, {
          fields: ["formatted_address"],
          types: ["geocode"],
        });
        destinationInputAutoComplete.addListener("place_changed", () => {
          const place = destinationInputAutoComplete!.getPlace();
          if (!place.formatted_address) return;
          destinationRef.current!.value = place.formatted_address;
          handleChange('destination', place.formatted_address);
        });
      }
    };

    autoComplete();
    // Limpieza opcional
    return () => {
      // No hay método oficial para destruir Autocomplete, pero puedes limpiar listeners si lo necesitas
    };
  }, [pickupRef, destinationRef]);

  return (
    <form onSubmit={handleSubmitRequest} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="passengerName" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Nombre y apellido *</label>
                <input
                  id="passengerName"
                  type="text"
                  value={passengerName}
                  onChange={event => handleChange('passengerName', event.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                  placeholder="Ej: Carla Gómez"
                />
              </div>

              <div>
                <label htmlFor="pickup" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Punto de partida *</label>
                <input
                  id="pickup"
                  type="text"
                  ref={pickupRef}
                  value={pickup}
                  onChange={event => handleChange('pickup', event.target.value)}
                  required
                  autoComplete="street-address"
                  className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                  placeholder="Dirección exacta"
                />
              </div>

              <div>
                <label htmlFor="destination" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Destino *</label>
                <input
                  id="destination"
                  type="text"
                  ref={destinationRef}
                  value={destination}
                  onChange={event => handleChange('destination', event.target.value)}
                  required
                  autoComplete="street-address"
                  className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                  placeholder="Ciudad o dirección"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Teléfono de contacto</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={event => handleChange('phone', event.target.value)}
                    autoComplete="tel"
                    className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                    placeholder="Con código de área"
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Horario preferido</label>
                  <input
                    id="preferredTime"
                    type="text"
                    value={preferredTime}
                    onChange={event => handleChange('preferredTime', event.target.value)}
                    className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                    placeholder="Ej: Mañana 8:00"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 sm:px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDriver(null)}
                  className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm sm:text-base min-h-[48px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base min-h-[48px]"
                >
                  {submitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                  {submitting ? 'Enviando...' : 'Confirmar solicitud'}
                </button>
              </div>
            </form>
  );
}