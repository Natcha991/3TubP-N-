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
  const userId = searchParams.get('id') || '';
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [animatingMenuId, setAnimatingMenuId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [specialMenu, setSpecialMenu] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [noMoreMenus, setNoMoreMenus] = useState(false);

  const resetMenus = async () => {
    setIsLoadingMenus(true);
    const seed = Math.random().toString(36).substring(2);
    try {
      const res = await fetch(`/api/menu/nearby?userId=${userId}&seed=${seed}`);
      const data = await res.json();
      const newMenus: MenuItem[] = Array.isArray(data?.menus) ? data.menus : [];

      const displayMenus = newMenus.slice(0, 4);
      const supplementMenu = newMenus.length > 4 ? newMenus[4] : newMenus[0];

      setMenus(displayMenus);
      setSpecialMenu(supplementMenu);
    } catch (err) {
      console.error('Error loading menus:', err);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  useEffect(() => {
    resetMenus();
  }, [userId]);

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

  const goto = useCallback((id: string) => {
    if (!id || id === 'undefined') return;
    setAnimatingMenuId(id);
    setTimeout(() => {
      router.push(`/menu/${id}${userId ? `?userId=${userId}` : ''}`);
      setAnimatingMenuId(null);
    }, 300);
  }, [router, userId]);

  const getImageUrl = useCallback((image: string) =>
    image && image !== 'undefined' ? `/menus/${encodeURIComponent(image)}` : '/default.png',
    []);

  const renderMenuCard = useCallback((item: MenuItem) => (
    <div
      key={item._id}
      onClick={() => goto(item._id)}
      className={`w-[155px] py-[1rem] rounded-2xl bg-[rgba(255,255,255,0.38)] transform transition duration-300 hover:scale-103 cursor-pointer shadow-lg shadow-[#ffac7852] hover:shadow-xl ${animatingMenuId ? "animate-press" : ''}`}
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
    setIsAnimating(true);
    setTimeout(() => {
      router.push(`/chatbot?id=${userId}`);
    }, 300);
  };

  if (isLoadingMenus) {
    return <div className="text-center mt-10">กำลังโหลดเมนู...</div>;
  }

  return (
    <div className='font-prompt'>
      <HealthTip userId={userId} />
      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[2rem] text-[#333333] font-prompt mb-[2rem] mr-[9rem] text-[2rem]">
          เมนูแนะนำ
        </h1>
        <div className="flex gap-2 mb-[1.5rem]">
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
            className="bg-orange-400 text-white z-120 items-center flex px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            disabled={isSearching}
          >
            <img className='w-[1rem] h-[1rem] mr-[0.3rem]' src="/search2.png" alt="search" />
            {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>

        <div className="absolute top-[46.2rem] z-200 left-[20rem] -translate-x-1/2 md:left-[15rem] md:translate-x-0">
          {showBubble && (
            <div className="w-[150px] h-[50px] absolute top-[1.5rem] shadow-grey shadow-xl left-[-7rem] p-[0.5rem] flex items-center bg-white rounded-md animate-showUp z-200">
              <h1 className="text-[0.7rem]">ผม Mr.Rice อยากรู้อะไรสอบถามผมได้ครับ!</h1>
            </div>
          )}
          <img
            onClick={gotoChatbot}
            className={`mt-[3rem] animate-pulse animate-sizeUpdown relative z-10 cursor-pointer transform hover:scale-105 duration-300 ${isAnimating ? "animate-press" : ''}`}
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
              className="flex items-center h-[140px] w-[340px] bg-white rounded-bl-4xl rounded-tr-4xl rounded-br-md rounded-tl-md cursor-pointer shadow-lg shadow-[#ffac7853] hover:scale-102 duration-500"
              onClick={() => goto(specialMenu._id)}
            >
              <img
                src={getImageUrl(specialMenu.image)}
                alt={specialMenu.name || 'เมนูเสริม'}
                className="h-[150px] w-[150px] object-cover animate-Open rounded-lg ml-2 "
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/default.png';
                }}
              />
              <div className="ml-[1rem] flex">
                <div className="w-[0.1rem] h-[4rem] mt-[0.8rem] mr-[0.8rem] ml-[-0.8rem] bg-[#333333]"></div>
                <div className="">
                  <h1 className='font-prompt font-bold text-[1.1rem] mb-1 w-[140px] text-gray-800'>
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

          <button
            onClick={resetMenus}
            className="mt-4 mb-[5rem] px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
          >
            🔄 สุ่มเมนูใหม่ที่ตรงกับคุณ
          </button>

          {noMoreMenus && (
            <p className="text-gray-500 mt-4 mb-[5rem]">ไม่มีเมนูที่สอดคล้องแล้ว</p>
          )}
        </div>
      </div>
    </div>
  );
}
