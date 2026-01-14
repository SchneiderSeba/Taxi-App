/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import  { importLibrary } from '@googlemaps/js-api-loader';

export default function GoogleMainMap( { startAddress, destinationAddress }: { startAddress: string; destinationAddress: string } ) {  

  const mapRef = useRef<HTMLDivElement | null>(null);

  // const [startAddress, setStartAddress] = useState("");
  // const [destinationAddress, setDestinationAddress] = useState("");
  const [leg, setLeg] = useState<google.maps.DirectionsLeg | null>(null);

  useEffect(() => {
  
  const initMap = async () => {

    const { Map } = await importLibrary("maps");
    
    const { DirectionsService, DirectionsRenderer } = await importLibrary("routes");

    const location = { lat: -34.6037, lng: -58.3816 };

    const map = new Map(mapRef.current as HTMLElement, {
      center: location,
      zoom: 13,
    });

    const directionsService = new DirectionsService();
    const directionsRenderer = new DirectionsRenderer({ map: map });

    directionsService.route(
      {
        origin: startAddress || "Buenos Aires, Argentina",
        destination: destinationAddress || "La Plata, Argentina",
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          const routeLeg = result.routes[0].legs[0];
          setLeg(routeLeg);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
  };

    initMap();
  
  }, [startAddress, destinationAddress]);

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        {leg && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
            <p>
              <strong>Distance:</strong> {leg.distance?.text}
            </p>
            <p>
              <strong>Duration:</strong> {leg.duration?.text}
            </p>
          </div>
        )}
      </div>

      <div ref={mapRef} style={{ height: "30vh", width: "100%", margin: "auto" }}></div>
    </>
  );
}