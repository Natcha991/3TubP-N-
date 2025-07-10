'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreMenus, setHasMoreMenus] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // เก็บหน้าปัจจุบัน
  const [allShownMenuIds, setAllShownMenuIds] = useState<string[]>([]); // เก็บ ID เมนูที่แสดงแล้ว

  useEffect(() => {
    fetchMenus(); // โหลดรอบแรก
  }, []);

  const fetchMenus = async (refresh = false) => {
    const pageToFetch = refresh ? currentPage + 1 : 0;
    
    // สร้าง query parameters
    const params = new URLSearchParams({
      userId: userId,
      page: pageToFetch.toString(),
      limit: '4',
      sortBy: 'relevance'
    });

    // เพิ่ม excludeIds ถ้ามี
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

      // Debug: ดูข้อมูลที่ได้จาก API
      console.log('API Response:', { 
        menusCount: newMenus.length, 
        hasMore: data?.hasMore, 
        totalAvailable: data?.totalAvailable,
        isLastPage: data?.isLastPage 
      });

      // เก็บข้อมูลว่ามีเมนูเพิ่มเติมหรือไม่
      const hasMore = data?.hasMore !== undefined ? data.hasMore : newMenus.length >= 4;
      const totalAvailable = data?.totalAvailable || 0;

      if (refresh) {
        // กรองเมนูใหม่ที่ไม่ซ้ำ (เผื่อกรณี API ส่งซ้ำ)
        const filteredNewMenus = newMenus.filter(newMenu => 
          newMenu && newMenu._id && newMenu.name &&
          !allShownMenuIds.includes(newMenu._id)
        );

        if (filteredNewMenus.length > 0) {
          setMenus((prev) => [...prev, ...filteredNewMenus]);
          setAllShownMenuIds(prev => [...prev, ...filteredNewMenus.map(m => m._id)]);
          setCurrentPage(pageToFetch);
        }
        
        // ตรวจสอบว่ามีเมนูเพิ่มเติมหรือไม่
        // จาก API response หรือจากจำนวนเมนูที่ได้
        setHasMoreMenus(hasMore && filteredNewMenus.length > 0);
        
        // หาก API บอกว่าหมดข้อมูลแล้ว
        if (data?.isLastPage || !hasMore || filteredNewMenus.length === 0) {
          setHasMoreMenus(false);
        }
      } else {
        // โหลดครั้งแรก
        const validMenus = newMenus.filter((m) => m && m._id && m.name);
        setMenus(validMenus);
        setAllShownMenuIds(validMenus.map(m => m._id));
        setCurrentPage(0);
        
        // ตั้งค่าเริ่มต้น - ถ้า API ไม่ส่ง hasMore มาให้ถือว่ายังมีเมนูเพิ่มเติม
        const shouldShowMore = data?.hasMore !== undefined 
          ? data.hasMore 
          : validMenus.length >= 4; // ถ้าได้เมนูมา 4 รายการ ถือว่ายังมีเพิ่มเติม
        
        setHasMoreMenus(shouldShowMore);
        
        console.log('Initial load:', { 
          menusCount: validMenus.length, 
          shouldShowMore,
          totalAvailable 
        });
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      // หากเกิดข้อผิดพลาด ให้ซ่อนปุ่ม
      if (refresh) {
        setHasMoreMenus(false);
      }
    } finally {
      setIsLoadingMenus(false);
      setIsRefreshing(false);
      console.timeEnd(label);
    }
  };

  const handleRefreshMenus = () => {
    if (!hasMoreMenus || isRefreshing) return;
    setIsRefreshing(true);
    fetchMenus(true);
  };

  const goto = (id: string) => {
    if (!id || id === 'undefined') return;
    router.push(`/menu/${id}`);
  };

  const getImageUrl = (image: string) =>
    image && image !== 'undefined' ? `/menus/${encodeURIComponent(image)}` : '/default.png';

  const renderMenuCard = (item: MenuItem) => (
    <div
      key={item._id}
      onClick={() => goto(item._id)}
      className="bg-white w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
    >
      <div className="flex flex-col items-center">
        <img
          className="h-[8rem] w-[8rem] object-cover"
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
  );

  if (isLoadingMenus) {
    return (
      <div className="flex font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div>
      <HealthTip userId={userId} />

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">
          เมนูแนะนำ
        </h1>

        {/* 🟧 Grid 2 คอลัมน์ */}
        <div className="grid grid-cols-2 gap-4">
          {menus.map(renderMenuCard)}
        </div>

        {/* 🟧 ปุ่มโหลดเมนูเพิ่มเติม */}
        {hasMoreMenus && (
          <div className="my-6">
            <button
              onClick={handleRefreshMenus}
              disabled={isRefreshing}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-prompt text-sm flex items-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <span className="animate-spin inline-block">🌀</span>
                  กำลังแนะนำเมนูใหม่...
                </>
              ) : (
                'แนะนำเมนูเพิ่มเติม'
              )}
            </button>
          </div>
        )}

        {/* 🟧 Debug info - ลบออกได้เมื่อแก้ไขเสร็จ */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-100 rounded">
            <div>Menus: {menus.length}</div>
            <div>HasMore: {hasMoreMenus ? 'Yes' : 'No'}</div>
            <div>Current Page: {currentPage}</div>
            <div>Shown IDs: {allShownMenuIds.length}</div>
          </div>
        )}

        {/* 🟧 แสดงจำนวนเมนูที่แสดงแล้ว (ถ้าต้องการ) */}
        {menus.length > 0 && (
          <div className="text-sm text-gray-500 mt-2">
            แสดงแล้ว {menus.length} เมนู
          </div>
        )}
      </div>
    </div>
  );
}