/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';
import { loadMapsLibrary, loadRoutesLibrary } from '../../lib/GoogleMapsServices';

type GoogleMainMapProps = { startAddress: string; destinationAddress: string };

export default function GoogleMainMap({ startAddress, destinationAddress }: GoogleMainMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [leg, setLeg] = useState<google.maps.DirectionsLeg | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const initMap = async () => {
      setIsLoading(true);
      setMapError(null);
      setLeg(null);

      try {
        const [{ Map }, { DirectionsService, DirectionsRenderer }] = await Promise.all([
          loadMapsLibrary(),
          loadRoutesLibrary(),
        ]);
        if (!active || !mapRef.current) return;

        const map = new Map(mapRef.current, {
          center: { lat: 53.3498, lng: -6.2603 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });
        const directionsRenderer = new DirectionsRenderer({ map });
        const directionsService = new DirectionsService();

        directionsService.route({
          origin: startAddress,
          destination: destinationAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (!active) return;
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            setLeg(result.routes[0]?.legs[0] ?? null);
            setIsLoading(false);
            return;
          }
          setMapError('No pudimos calcular esta ruta. Revisa las direcciones e intenta nuevamente.');
          setIsLoading(false);
        });
      } catch {
        if (!active) return;
        setMapError('No pudimos cargar Google Maps. Revisa la conexión o el bloqueador del navegador.');
        setIsLoading(false);
      }
    };

    if (startAddress && destinationAddress) void initMap();
    return () => { active = false; };
  }, [startAddress, destinationAddress]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/50 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
      {leg ? (
        <div className="flex flex-wrap items-center justify-center gap-4 border-b border-slate-200/70 px-4 py-3 text-sm dark:border-white/10">
          <p><strong>Distancia:</strong> {leg.distance?.text ?? 'N/D'}</p>
          <p><strong>Duración estimada:</strong> {leg.duration?.text ?? 'N/D'}</p>
        </div>
      ) : null}
      <div className="relative h-[30vh] min-h-64 w-full">
        <div ref={mapRef} className="h-full w-full" aria-label="Mapa de la ruta solicitada" />
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-emerald-700 backdrop-blur-sm dark:bg-slate-950/80 dark:text-emerald-300">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando ruta…
          </div>
        ) : null}
        {mapError ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-6 text-center text-slate-700 backdrop-blur-sm dark:bg-slate-950/90 dark:text-slate-200">
            <MapPinOff className="mb-3 h-8 w-8 text-amber-500" />
            <p className="max-w-md text-sm font-semibold">{mapError}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
