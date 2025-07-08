// components/MapNearby.tsx
'use client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapNearbyProps {
  lat: number;
  lng: number;
}

export default function MapNearby({ lat, lng }: MapNearbyProps) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '16px' }}
        center={{ lat, lng }}
        zoom={15}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </LoadScript>
  );
}