/// <reference types="@types/google.maps" />
import { Loader2, Send } from 'lucide-react';
import { TripRequestForm } from './CostumerView';
import { Profile } from '../types';
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/GoogleMapsServices';

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

export const NewTripFormV2: React.FC<NewTripFormProps> = ({
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
}) => {
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [placesReady, setPlacesReady] = useState(false);
  const [pickupPredictions, setPickupPredictions] = useState<any[]>([]);
  const [destinationPredictions, setDestinationPredictions] = useState<any[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const AutocompleteSuggestionRef = useRef<any>(null);
  const AutocompleteSessionTokenRef = useRef<any>(null);
  const PlaceRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initPlacesAPI = async () => {
      

      await loadGoogleMaps();
      

      if (!mounted || !window.google?.maps?.places) {
        
        return;
      }

      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken, Place } = await window.google.maps.importLibrary('places') as any;

        AutocompleteSuggestionRef.current = AutocompleteSuggestion;
        AutocompleteSessionTokenRef.current = AutocompleteSessionToken;
        PlaceRef.current = Place;
        sessionTokenRef.current = new AutocompleteSessionToken();

        if (mounted) {
          setPlacesReady(true);
        }
      } catch (error) {
        console.error('[NewTripFormV2] Error initializing Places API:', error);
      }
    };

    initPlacesAPI();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePickupInputChange = async (value: string) => {
    handleChange('pickup', value);

    if (!placesReady || !AutocompleteSuggestionRef.current || value.length < 2) {
      setPickupPredictions([]);
      return;
    }

    try {
      const request = {
        input: value,
        sessionToken: sessionTokenRef.current,
      };

      const result = await AutocompleteSuggestionRef.current.fetchAutocompleteSuggestions(request);
      
      setPickupPredictions(result.suggestions || []);
      setShowPickupDropdown(true);
    } catch (error) {
      console.error('[NewTripFormV2] Error getting pickup suggestions:', error);
      setPickupPredictions([]);
    }
  };

  const handleDestinationInputChange = async (value: string) => {
    handleChange('destination', value);

    if (!placesReady || !AutocompleteSuggestionRef.current || value.length < 2) {
      setDestinationPredictions([]);
      return;
    }

    try {
      const request = {
        input: value,
        sessionToken: sessionTokenRef.current,
      };

      const result = await AutocompleteSuggestionRef.current.fetchAutocompleteSuggestions(request);
      
      setDestinationPredictions(result.suggestions || []);
      setShowDestinationDropdown(true);
    } catch (error) {
      console.error('[NewTripFormV2] Error getting destination suggestions:', error);
      setDestinationPredictions([]);
    }
  };

  const handlePickupSelect = async (suggestion: any) => {
    
    const text = suggestion.placePrediction?.text?.text || '';
    handleChange('pickup', text);
    setShowPickupDropdown(false);
    setPickupPredictions([]);
    
    // Obtener detalles completos del lugar
    if (suggestion.placePrediction?.toPlace) {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
      
    }
  };

  const handleDestinationSelect = async (suggestion: any) => {
    
    const text = suggestion.placePrediction?.text?.text || '';
    handleChange('destination', text);
    setShowDestinationDropdown(false);
    setDestinationPredictions([]);
    
    // Obtener detalles completos del lugar
    if (suggestion.placePrediction?.toPlace) {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
      
    }
  };

  return (
    <form onSubmit={handleSubmitRequest} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div>
        <label htmlFor="passengerName" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
          Nombre y apellido *
        </label>
        <input
          id="passengerName"
          type="text"
          value={passengerName}
          onChange={(event) => handleChange('passengerName', event.target.value)}
          required
          autoComplete="name"
          className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
          placeholder="Ej: Carla Gómez"
        />
      </div>

      <div className="relative">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
          Punto de partida *
        </label>
        <input
          ref={pickupInputRef}
          type="text"
          value={pickup}
          onChange={(e) => handlePickupInputChange(e.target.value)}
          onFocus={() => pickup.length >= 2 && setShowPickupDropdown(true)}
          disabled={!placesReady}
          className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
          placeholder={placesReady ? 'Dirección exacta' : 'Cargando...'}
        />
        {showPickupDropdown && pickupPredictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 shadow-lg max-h-64 overflow-y-auto">
            {pickupPredictions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => handlePickupSelect(suggestion)}
                className="px-3 sm:px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.placePrediction?.mainText?.text || suggestion.placePrediction?.text?.text}
                    </p>
                    {suggestion.placePrediction?.secondaryText?.text && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {suggestion.placePrediction.secondaryText.text}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
          Destino *
        </label>
        <input
          ref={destinationInputRef}
          type="text"
          value={destination}
          onChange={(e) => handleDestinationInputChange(e.target.value)}
          onFocus={() => destination.length >= 2 && setShowDestinationDropdown(true)}
          disabled={!placesReady}
          className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
          placeholder={placesReady ? 'Ciudad o dirección' : 'Cargando...'}
        />
        {showDestinationDropdown && destinationPredictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 shadow-lg max-h-64 overflow-y-auto">
            {destinationPredictions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => handleDestinationSelect(suggestion)}
                className="px-3 sm:px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.placePrediction?.mainText?.text || suggestion.placePrediction?.text?.text}
                    </p>
                    {suggestion.placePrediction?.secondaryText?.text && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {suggestion.placePrediction.secondaryText.text}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
            Teléfono de contacto
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            autoComplete="tel"
            className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
            placeholder="Con código de área"
          />
        </div>
        <div>
          <label htmlFor="preferredTime" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
            Horario preferido
          </label>
          <input
            id="preferredTime"
            type="text"
            value={preferredTime}
            onChange={(event) => handleChange('preferredTime', event.target.value)}
            className="mt-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
            placeholder="Ej: Mañana 8:00"
          />
        </div>
      </div>

      {formError && (
        <p className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 sm:px-3 py-2">
          {formError}
        </p>
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
          {submitting ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          )}
          {submitting ? 'Enviando...' : 'Confirmar solicitud'}
        </button>
      </div>
    </form>
  );
};