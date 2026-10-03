import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let isConfigured = false;

function configureGoogleMaps() {
  if (isConfigured) return;
  const apiKey = import.meta.env.VITE_PUBLIC_GOOGLEMAP_KEY?.trim();
  if (!apiKey) throw new Error('Falta configurar la clave pública de Google Maps.');

  setOptions({ key: apiKey, v: 'weekly' });
  isConfigured = true;
}

export async function loadMapsLibrary(): Promise<google.maps.MapsLibrary> {
  configureGoogleMaps();
  return importLibrary('maps');
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  configureGoogleMaps();
  return importLibrary('places');
}

export async function loadRoutesLibrary(): Promise<google.maps.RoutesLibrary> {
  configureGoogleMaps();
  return importLibrary('routes');
}
