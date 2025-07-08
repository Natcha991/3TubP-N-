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

  // ✅ ดึงตำแหน่งผู้ใช้
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

  // ✅ ดึงข้อมูลวัตถุดิบ
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

  // ✅ ค้นหาตลาดใกล้ผู้ใช้
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

      <h2 className="text-xl font-semibold mt-6 mb-3">แหล่งจำหน่ายใกล้คุณ</h2>
      {loadError ? (
        <p className="text-red-500">โหลดข้อมูลแหล่งจำหน่ายไม่สำเร็จ: {loadError.message}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place) => {
            const photoUrl = place.photos?.[0]
              ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
              : '/default.png';

            return (
              <div
                key={place.place_id}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.place_id}`,
                    '_blank'
                  )
                }
              >
                <img src={photoUrl} alt={place.name} className="w-full h-40 object-cover rounded-md mb-2" />
                <div className="text-red-600 font-bold text-lg mb-1">📍 {place.name}</div>
                <p className="text-sm text-gray-700">{place.vicinity}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
