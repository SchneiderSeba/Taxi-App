let googleMapsPromise: Promise<void> | null = null;

export async function loadGoogleMaps(): Promise<void> {

  if (googleMapsPromise) {
    
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      
      window.google.maps.importLibrary('places')
        .then(() => {
          
          resolve();
        })
        .catch((err) => {
          console.error('[GoogleMaps] importLibrary("places") failed', err);
          reject(err);
        });
      return;
    }

    const apiKey = import.meta.env.VITE_PUBLIC_GOOGLEMAP_KEY;
    
    const existing = document.querySelector('script[data-gmaps="true"]') as HTMLScriptElement | null;
    if (existing) {

      if (existing.getAttribute('data-loaded') === 'true') {
        
        resolve();
        return;
      }
      existing.addEventListener('load', () => {
        
        resolve();
      });
      existing.addEventListener('error', (e) => {
        console.error('[GoogleMaps] Existing script error', e);
        reject(e);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta&loading=async`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmaps', 'true');

    script.onload = () => {
      
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = (e) => {
      console.error('[GoogleMaps] Script onerror', e);
      reject(e);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}