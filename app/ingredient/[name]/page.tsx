'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLoadScript } from '@react-google-maps/api';

interface Ingredient {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function IngredientPage() {
  const { name: rawName } = useParams() as { name: string | string[] };
  const router = useRouter();
  const searchParams = useSearchParams();
  const previousMenuId = searchParams.get('menuId');
  const name = Array.isArray(rawName) ? rawName[0] : rawName;

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<any[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Location error:', err);
          setError('ไม่สามารถดึงตำแหน่งของคุณได้');
        }
      );
    } else {
      setError('เบราว์เซอร์ไม่รองรับการเข้าถึงตำแหน่ง');
    }
  }, []);

  useEffect(() => {
    if (!name) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error('ไม่พบวัตถุดิบนี้');
        const data = await res.json();
        setIngredient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [name]);

  useEffect(() => {
    if (!userLocation || !isLoaded) return;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: userLocation,
      radius: 3000,
      keyword: 'ตลาด',
      type: 'point_of_interest',
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results);
      }
    });
  }, [userLocation, isLoaded]);

  const gotoHome = (menuId: string | null) => {
    if (menuId) router.push(`/menu/${menuId}`);
    else router.back();
  };

  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error || !ingredient) return <div className="text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  return (
    <div className="px-4 py-6 font-prompt bg-yellow-50 min-h-screen">
      <div className="flex justify-between mb-4">
        <button onClick={() => gotoHome(previousMenuId)} className="bg-gray-200 px-4 py-2 rounded">
          ย้อนกลับ
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">{ingredient.name}</h1>
      <Image
        src={ingredient.image ? `/ingredients/${ingredient.image}` : '/default.png'}
        alt={ingredient.name}
        width={400}
        height={300}
        className="rounded-md object-cover max-h-[300px]"
      />
      <p className="mt-2 text-sm text-gray-700">{ingredient.description}</p>
      <p className="mt-1 text-orange-700">ประมาณ {ingredient.price} บาท</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">แหล่งจำหน่ายใกล้คุณ</h2>
      {loadError ? (
        <p className="text-red-500">โหลดแหล่งจำหน่ายไม่สำเร็จ: {loadError.message}</p>
      ) : (
        <div className="overflow-x-auto scroll-smooth flex space-x-4 pb-4">
          {places.map((place) => {
            const photoRef =
              place.photos?.[0]?.getUrl?.({ maxWidth: 400 }) || '/default.png';

            return (
              <div
                key={place.place_id}
                className="min-w-[240px] max-w-[240px] bg-white shadow-md rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition"
                onClick={() =>
                  window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, '_blank')
                }
              >
                <img
                  src={photoRef}
                  alt={place.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/default.png';
                  }}
                />
                <div className="p-3">
                  <h3 className="text-red-700 font-bold text-md flex items-center gap-1">
                    📍 {place.name}
                  </h3>
                  <p className="text-sm text-gray-600">{place.vicinity}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
