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
  price: string;
}

export default function IngredientPage() {
  const { name: rawName } = useParams() as { name: string | string[] };
  const router = useRouter();
  const searchParams = useSearchParams();
  const previousMenuId = searchParams.get('menuId');
  const name = Array.isArray(rawName) ? rawName[0] : rawName

  const currentUserId = searchParams.get('userId');

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [randomIngredients, setRandomIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    let intervalTimer: NodeJS.Timeout;

    const displayBubble = () => {
      setShowBubble(true); // แสดง bubble
      hideTimer = setTimeout(() => {
        setShowBubble(false); // ซ่อน bubble หลังจาก 5 วินาที
      }, 5000); // ระยะเวลาแสดง bubble
    };

    // ตั้งค่าให้แสดง bubble ครั้งแรกหลังจาก component mount (หรือหลังจากโหลดข้อมูลเสร็จ)
    // คุณสามารถเลือกได้ว่าจะให้แสดงทันที หรือรอจน isLoadingMenus เป็น false
    // ในตัวอย่างนี้ ผมจะให้มันแสดงครั้งแรกทันทีที่ useEffect นี้รัน

    // เรียก displayBubble ครั้งแรกทันที
    displayBubble();

    // ตั้งค่า setInterval ให้เรียก displayBubble ทุกๆ 30 วินาที
    // (5 วินาทีที่แสดง + 25 วินาทีที่ซ่อน)
    intervalTimer = setInterval(() => {
      displayBubble();
    }, 30000); // 30 วินาที คือรวมเวลาที่แสดงและเวลาที่หายไป

    // Cleanup function: เคลียร์ timers เมื่อ component unmounts
    return () => {
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, []); //

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  // Get user location
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

  // Fetch ingredient data
  useEffect(() => {
    if (!name) {
      setError("ไม่พบชื่อวัตถุดิบใน URL");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching ingredient: /api/ingredient/${encodeURIComponent(name)}`);
      try {
        const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`API Error: ${res.status} - ${errorText}`);
          throw new Error("ไม่พบวัตถุดิบที่ต้องการ หรือมีข้อผิดพลาดทางเซิร์ฟเวอร์");
        }

        const data = await res.json();
        if (!data || data.error) {
          console.error("Data received:", data);
          throw new Error(data.error || "เกิดข้อผิดพลาดในการประมวลผลข้อมูล");
        }

        setIngredient(data);
      } catch (err: any) {
        console.error("Error fetching ingredient details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลวัตถุดิบได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name]);

  // Fetch random ingredients for "วัตถุดิบอื่นๆ" section
  useEffect(() => {
    const fetchRandomIngredients = async () => {
      try {
        const res = await fetch('/api/ingredient/random?limit=3');
        if (res.ok) {
          const data = await res.json();
          setRandomIngredients(data);
        }
      } catch (error) {
        console.error('Error fetching random ingredients:', error);
      }
    };

    fetchRandomIngredients();
  }, []);

  // Search for nearby places using Google Places API
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

  // Navigation functions
  const gotoHome = (menuId: string | null) => {
    if (menuId) {
      router.push(`/menu/${menuId}`);
    } else {
      console.warn('No previous menu ID found. Navigating back in history.');
      router.back();
    }
  };

  const gotoChatbot = () => {
    // ใช้ currentUserId ที่ดึงมาจาก useSearchParams
    router.push(`/chatbot${currentUserId ? `?id=${currentUserId}` : ''}`);
  };

  const gotoIngredient = (ingredientName: string) => {
    const currentMenuId = searchParams.get('menuId');
    const queryParams = currentMenuId ? `?menuId=${currentMenuId}` : '';
    router.push(`/ingredient/${encodeURIComponent(ingredientName)}${queryParams}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="">
        <div className="absolute left-0">
          <img src="/group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute right-0 rotate-[180deg] top-[30rem]">
          <img src="/group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[44rem] left-[1.5rem] animate-shakeright">
          <img className='' src="/image%2084.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
          <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
        </div>
        <div className="flex flex-col font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
          <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-center font-prompt text-lg text-red-500">
        {error}
      </div>
    );
  }

  // No ingredient found
  if (!ingredient) {
    return (
      <div className="flex justify-center items-center h-screen text-center font-prompt text-lg text-gray-700">
        ไม่พบข้อมูลวัตถุดิบนี้
      </div>
    );
  }

  const ingredientImageUrl = ingredient.image
    ? `/ingredients/${ingredient.image}`
    : '/default-ingredient.png';

  return (
    <div className="relative font-prompt min-h-screen bg-yellow overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute h-[400px] w-full z-[-2] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] bg-white"></div>
      <div className="absolute top-20 z-[-1]">
        <Image
          className="h-[400px] w-auto object-cover"
          src="/image%2070.png"
          alt="background pattern"
          width={800}
          height={400}
        />
      </div>

      {/* Header with Back Button */}
      <div className="absolute z-10 top-0 left-0 right-0 flex justify-between p-4 items-center w-full max-w-2xl mx-auto">
        <div
          onClick={() => gotoHome(previousMenuId)}
          className="bg-white h-[50px] flex justify-center cursor-pointer transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full shadow-grey shadow-xl"
        >
          <Image className="h-[15px] w-auto" src="/Group%2084.png" alt="back" width={15} height={15} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center pt-[4rem] px-4 w-full max-w-2xl mx-auto">
        {/* Ingredient Name */}
        <div className="font-prompt font-[600] text-center mt-[1rem] mb-[1rem]">
          <h1 className="text-4xl text-[#333333]">{ingredient.name}</h1>
          <h1 className='text-[#953333] mt-1 text-[1rem]'>จากเกษตรกรไทย</h1>
        </div>

        {/* Ingredient Image */}
        <div className="my-4 animate-sizeUpdown">
          <Image
            src={ingredientImageUrl}
            alt={ingredient.name}
            className="w-full max-h-[300px] object-contain rounded-lg"
            width={350}
            height={300}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/default-ingredient.png';
            }}
            priority
          />
        </div>

        {/* Price and Chatbot Bubble */}
        <div className="max-w-[360px] relative">
          <h1 className="m-[0.5rem] text-[#611E1E] text-lg">ประมาณ {ingredient.price}</h1>
          <div className="absolute top-[-3.3rem] left-[18rem] -translate-x-1/2 md:left-[15rem] md:translate-x-0">
            {showBubble && (
              <div className="w-[150px] animate-showUp h-[40px] z-[-1] absolute top-[1.5rem] shadow-grey shadow-xl left-[-7rem] p-[0.5rem] flex items-center bg-white rounded-md">
                <h1 className="text-[0.7rem]">เป็นวัตถุดิบที่มีคุณค่ามาก!</h1>
              </div>
            )}
            <Image
              onClick={gotoChatbot}
              className="mt-[3rem] animate-pulse animate-sizeUpdown cursor-pointer transform hover:scale-105 duration-300"
              src="/image%2069.png"
              alt="Chatbot icon"
              width={60}
              height={60}
            />
          </div>

          {/* Ingredient Description */}
          <div className="h-full p-[1rem] rounded-2xl border-[#FFAC64] bg-[#FFFAD2] border-2 mt-8">
            <p className="text-[#953333] text-[0.8rem]">{ingredient.description}</p>
          </div>

          {/* ร้านค้าร่วมรายการ */}
          {(ingredient as any).shopLinks && (
            <div className="relative w-full justify-center items-center flex mt-[1.5rem]">
              <div className="flex gap-2 items-center">
                <img src="/cart.png" className='w-[20px] h-[20px]'></img>
                <h1 className="text-[#611E1E] text-lg mr-[1.5rem] text-[1rem]">สั่งซื้อวัตถุดิบ</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries((ingredient as any).shopLinks).map(([shop, url]) => (
                  <a
                    key={shop}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1 rounded-lg text-white text-sm font-medium ${shop === 'makro' ? 'bg-red-600' :
                        shop === 'lotus' ? 'bg-green-600' :
                          shop === 'bigc' ? 'bg-yellow-500 text-black' :
                            'bg-gray-500'
                      }`}
                  >
                    {shop.charAt(0).toUpperCase() + shop.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nearby Stores - Using Google Places API data */}
        <div className="relative w-full max-w-[360px] mt-[3rem]">
          <h1 className="font-[600] text-[#333333] mb-[1rem] text-[1.6rem]">แหล่งจำหน่ายใกล้คุณ</h1>
          {loadError ? (
            <p className="text-red-500">โหลดแหล่งจำหน่ายไม่สำเร็จ: {loadError.message}</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4">
              {places.length > 0 ? (
                places.map((place) => {
                  const photoRef = place.photos?.[0]?.getUrl?.({ maxWidth: 400 }) || '/image%2071.png';

                  return (
                    <div
                      key={place.place_id}
                      className="flex bg-white rounded-2xl border-2 border-[#C9AF90] px-[1rem] items-center flex-shrink-0 shadow-sm cursor-pointer hover:shadow-lg transition"
                      onClick={() =>
                        window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, '_blank')
                      }
                    >
                      <img
                        className="h-[80px] w-auto ml-[-1rem] mr-[1rem] rounded-l-2xl object-cover"
                        src={photoRef}
                        alt={place.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/image%2071.png';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center relative">
                          <Image className="h-[20px] w-auto absolute left-[-0.5rem]" src="/image%2072.png" alt="location icon" width={20} height={20} />
                          <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">{place.name}</h1>
                        </div>
                        <p className="w-[150px] text-[0.5rem] text-[#953333] truncate">
                          {place.vicinity}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback to hardcoded data if no places found
                <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0 shadow-sm">
                  <Image className="h-[80px] w-auto mr-[1rem] rounded-l-2xl object-cover" src="/image%2071.png" alt="store" width={80} height={80} />
                  <div className="flex-1">
                    <div className="flex items-center relative">
                      <Image className="h-[20px] w-auto absolute left-[-0.5rem]" src="/image%2072.png" alt="location icon" width={20} height={20} />
                      <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดใกล้เคียง</h1>
                    </div>
                    <p className="w-[100px] text-[0.5rem] text-[#953333]">
                      กำลังค้นหาร้านค้าใกล้เคียง...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Random Ingredients Section */}
        <div className="relative w-full max-w-[360px] mt-[3rem] mb-[5rem]">
          <h1 className="font-[600] text-[#333333] mb-[2rem] text-[1.6rem]">วัตถุดิบอื่นๆ</h1>
          <div className="flex gap-2 justify-center">
            {randomIngredients.length > 0 ? (
              randomIngredients.map((randomIngredient) => {
                const randomIngredientImageUrl = randomIngredient.image
                  ? `/ingredients/${randomIngredient.image}`
                  : '/default-ingredient.png';

                return (
                  <div
                    key={randomIngredient._id}
                    className="flex flex-col items-center w-[130px] bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm cursor-pointer"
                    onClick={() => gotoIngredient(randomIngredient.name)}
                  >
                    <Image
                      className="h-[90px] animate-sizeUpdown w-auto transform transition duration-300 hover:scale-105"
                      src={randomIngredientImageUrl}
                      alt={randomIngredient.name}
                      width={90}
                      height={90}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default-ingredient.png';
                      }}
                    />
                    <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333] text-center px-2">
                      {randomIngredient.name}
                    </h1>
                  </div>
                );
              })
            ) : (
              // Fallback display while loading random ingredients
              <>
                <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                  <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105" src="/image%2073.png" alt="loading ingredient" width={90} height={90} />
                  <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">กำลังโหลด...</h1>
                </div>
                <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                  <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105" src="/image%2073.png" alt="loading ingredient" width={90} height={90} />
                  <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">กำลังโหลด...</h1>
                </div>
                <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                  <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105" src="/image%2073.png" alt="loading ingredient" width={90} height={90} />
                  <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">กำลังโหลด...</h1>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}