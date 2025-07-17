'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import HealthTip from '@/app/components/HealthTip';

interface MenuItem {
  _id: string;
  name: string;
  calories: number;
  image: string;
  reason?: string;
  description?: string;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ดึง userId จาก URL (id query parameter)
  // หรือให้เป็น string ว่าง ถ้าไม่มี (แต่ควรจะมีเสมอสำหรับการใช้งานจริง)
  const userId = searchParams.get('id') || '';

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [allShownMenuIds, setAllShownMenuIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [specialMenu, setSpecialMenu] = useState<MenuItem | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const displayBubble = () => {
      setShowBubble(true);
      hideTimer = setTimeout(() => setShowBubble(false), 5000);
    };

    const intervalTimer: ReturnType<typeof setInterval> = setInterval(displayBubble, 30000);

    displayBubble();

    return () => {
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const fetchMenus = useCallback(async (refresh = false) => {
    setIsLoadingMenus(true); // ตั้งค่า loading เป็น true ก่อนเริ่ม fetch

    const pageToFetch = refresh ? currentPage + 1 : 0;

    const params = new URLSearchParams({
      userId: userId, // <-- ตรวจสอบให้แน่ใจว่า userId ถูกส่งไปที่ API ด้วย
      page: pageToFetch.toString(),
      limit: '4',
      sortBy: 'relevance'
    });

    if (refresh && allShownMenuIds.length > 0) {
      params.append('excludeIds', allShownMenuIds.join(','));
    }

    const endpoint = refresh
      ? `/api/recommend-ai?${params.toString()}&refresh=true`
      : `/api/recommend-ai?${params.toString()}`;

    const label = refresh ? 'Refresh menus' : 'Fetch recommended menus';

    console.time(label);
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const text = await res.text();

      if (!res.ok) throw new Error(text || res.statusText);
      if (!text) return;

      const data = JSON.parse(text);
      const newMenus: MenuItem[] = Array.isArray(data?.recommendedMenus)
        ? data.recommendedMenus
        : [];


      if (refresh) {
        const filteredNewMenus = newMenus.filter(newMenu =>
          newMenu && newMenu._id && newMenu.name &&
          !allShownMenuIds.includes(newMenu._id)
        );

        if (filteredNewMenus.length > 0) {
          setMenus((prev) => [...prev, ...filteredNewMenus]);
          setAllShownMenuIds(prev => [...prev, ...filteredNewMenus.map(m => m._id)]);
          setCurrentPage(pageToFetch);
        }

        

        
      } else {
        const validMenus = newMenus.filter((m) => m && m._id && m.name);

        const displayMenus = validMenus.slice(0, 4);
        const supplementMenu = validMenus.length > 4 ? validMenus[4] : validMenus[0];

        setMenus(displayMenus);
        setSpecialMenu(supplementMenu);
        setAllShownMenuIds(displayMenus.map(m => m._id));
        setCurrentPage(0);

        
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
     
    } finally {
      setIsLoadingMenus(false);
      
      console.timeEnd(label);
    }
  },[userId]);

  useEffect(() => {
    fetchMenus();
  }, [userId, fetchMenus]);

  

  // **แก้ไข: เพิ่ม userId เข้าไปใน URL เมื่อกดไปหน้า Menu**
  const goto = useCallback((id: string) => {
    if (!id || id === 'undefined') return;
    // ส่ง userId เป็น query parameter ไปยัง MenuPage
    router.push(`/menu/${id}${userId ? `?userId=${userId}` : ''}`);
  }, [router, userId]); // เพิ่ม userId ใน dependency array

  const getImageUrl = useCallback((image: string) =>
    image && image !== 'undefined' ? `/menus/${encodeURIComponent(image)}` : '/default.png',
    []);

  const renderMenuCard = useCallback((item: MenuItem) => (
    <div
      key={item._id}
      // **แก้ไข: ส่ง userId ไปยัง MenuPage จาก MenuCard**
      onClick={() => goto(item._id)}
      className="bg-white w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer shadow-md hover:shadow-lg"
    >
      <div className="flex flex-col items-center">
        <img
          className="h-[8rem] w-[8rem] object-cover animate-Open rounded-lg"
          src={getImageUrl(item.image)}
          alt={item.name || 'เมนู'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/default.png';
          }}
        />
        <div className="flex items-center">
          <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
          <div>
            <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">
              {item.name?.toUpperCase() || 'ไม่มีชื่อเมนู'}
            </h1>
            <div className="flex items-baseline mt-[-0.3rem]">
              <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
              <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [goto, getImageUrl]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // **แก้ไข: ส่ง userId ไปด้วยเมื่อค้นหาเมนู**
      const res = await fetch(`/api/search-menu?query=${encodeURIComponent(searchTerm)}&userId=${userId}`);
      const data = await res.json();
      const foundMenus: MenuItem[] = Array.isArray(data?.menus) ? data.menus : [];

      const displayMenus = foundMenus.slice(0, 4);
      const supplementMenu = foundMenus.length > 4 ? foundMenus[4] : foundMenus[0];

      setMenus(displayMenus);
      setSpecialMenu(supplementMenu);
      
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const gotoChatbot = () => {
    // **แก้ไข: ส่ง userId ไปยัง Chatbot Page ด้วย**
    router.push(`/chatbot?id=${userId}`);
  };


  if (isLoadingMenus) {
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

  return (
    <div className='font-prompt'>
      {/* HealthTip ก็ต้องได้รับ userId ด้วยเช่นกัน ถ้า HealthTip ใช้ */}
      <HealthTip userId={userId} />

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[2rem] text-[#333333] font-prompt mb-[2rem] mr-[9rem] text-[2rem]">
          เมนูแนะนำ
        </h1>

        <div className="flex gap-2 mb-[4rem]">
          <input
            type="text"
            placeholder="ค้นหาเมนู"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-4 py-2 rounded-lg border w-[200px] focus:outline-none focus:ring-2 focus:ring-[#333333]"
          />
          <button
            onClick={handleSearch}
            className="bg-orange-400 text-white items-center flex px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            disabled={isSearching}
          >
            <img className='w-[1rem] h-[1rem] mr-[0.3rem]' src="/search2.png" alt="search" />
            {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>

        <div className="absolute top-[33.3rem] left-[20rem] -translate-x-1/2 md:left-[15rem] md:translate-x-0">
          {showBubble && (
            <div className="w-[150px] h-[50px] z-[-1] absolute top-[1.5rem] shadow-grey shadow-xl left-[-7rem] p-[0.5rem] flex items-center bg-white rounded-md animate-showUp">
              <h1 className="text-[0.7rem]">ผม Mr.Rice อยากรู้อะไรสอบถามผมได้ครับ!</h1>
            </div>
          )}
          <img
            onClick={gotoChatbot}
            className="mt-[3rem] animate-pulse animate-sizeUpdown cursor-pointer transform hover:scale-105 duration-300"
            src="/image%2069.png"
            alt="Chatbot icon"
            width={60}
            height={60}
          />
        </div>

        <div className="flex flex-col items-center gap-4 mb-[4rem]">
          <div className="grid grid-cols-2 gap-4">
            {menus.slice(0, 2).map(renderMenuCard)}
          </div>

          {specialMenu && (
            <div
              className="flex items-center h-[140px] w-[340px] bg-white rounded-bl-4xl rounded-tr-4xl rounded-br-md rounded-tl-md cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              // **แก้ไข: ส่ง userId ไปยัง MenuPage จาก Special Menu**
              onClick={() => goto(specialMenu._id)}
            >
              <img
                src={getImageUrl(specialMenu.image)}
                alt={specialMenu.name || 'เมนูเสริม'}
                className="h-[150px] w-[150px] object-cover animate-Open rounded-lg ml-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/default.png';
                }}
              />
              <div className="ml-[1rem] flex">
                <div className="w-[0.1rem] h-[4rem] mt-[0.8rem] mr-[0.8rem] ml-[-0.8rem] bg-[#333333]"></div>
                <div className="">
                  <h1 className='font-prompt font-bold text-[1.1rem] mb-1 w-[150px] text-gray-800'>
                    {specialMenu.name || 'เมนูพิเศษ'}
                  </h1>
                  <div className="flex items-baseline">
                    <h1 className='font-Unbounded text-[1rem] font-bold text-gray-600 '>
                      {specialMenu.calories}
                    </h1>
                    <h1 className='text-[0.7rem] ml-2 font-Unbounded text-gray-600'>KCAL</h1>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 mb-[2rem] gap-4">
            {menus.slice(2, 4).map(renderMenuCard)}
          </div>
        </div>
      </div>
    </div>
  );
}