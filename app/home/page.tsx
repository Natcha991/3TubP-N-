'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import HealthTip from '@/app/components/HealthTip';

interface MenuItem {
  _id: string;
  name: string;
  calories: number;
  image: string;
  reason?: string;
  description?: string;
}

interface MenuSession {
  menus: MenuItem[];
  allShownMenuIds: string[];
  currentPage: number;
  hasMoreMenus: boolean;
  lastUpdated: number;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id') || '';

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreMenus, setHasMoreMenus] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [allShownMenuIds, setAllShownMenuIds] = useState<string[]>([]);
  
  // 🚀 Queue สำหรับเก็บเมนูที่เตรียมไว้
  const [menuQueue, setMenuQueue] = useState<MenuItem[][]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedPages, setPreloadedPages] = useState<number[]>([]);
  
  // 🚀 ใช้ useRef เพื่อเก็บ interval
  const preloadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPreloadPages = 10;
  
  // 🚀 Session key สำหรับเก็บข้อมูลเฉพาะ session นี้
  const sessionKey = `menu_session_${userId}`;

  useEffect(() => {
    loadMenuSession();
  }, [userId]);

  // 🚀 ฟังก์ชันโหลดข้อมูล session
  const loadMenuSession = () => {
    try {
      // ใช้ sessionStorage แทน localStorage เพื่อให้ข้อมูลหายเมื่อปิด browser
      const savedSession = sessionStorage.getItem(sessionKey);
      
      if (savedSession) {
        const session: MenuSession = JSON.parse(savedSession);
        console.log('🔄 Loading saved session:', session.menus.length, 'menus');
        
        // โหลดข้อมูลจาก session
        setMenus(session.menus);
        setAllShownMenuIds(session.allShownMenuIds);
        setCurrentPage(session.currentPage);
        setHasMoreMenus(session.hasMoreMenus);
        setIsLoadingMenus(false);
        
        // เริ่ม preload ต่อจากที่เหลือ
        if (session.hasMoreMenus) {
          startPreloading();
        }
      } else {
        // ถ้าไม่มี session ให้โหลดใหม่
        fetchMenus();
      }
    } catch (error) {
      console.error('Error loading menu session:', error);
      fetchMenus();
    }
  };

  // 🚀 ฟังก์ชันบันทึกข้อมูล session
  const saveMenuSession = (menuData: MenuItem[], shownIds: string[], page: number, hasMore: boolean) => {
    try {
      const session: MenuSession = {
        menus: menuData,
        allShownMenuIds: shownIds,
        currentPage: page,
        hasMoreMenus: hasMore,
        lastUpdated: Date.now()
      };
      
      sessionStorage.setItem(sessionKey, JSON.stringify(session));
      console.log('💾 Saved session:', menuData.length, 'menus');
    } catch (error) {
      console.error('Error saving menu session:', error);
    }
  };

  // 🚀 ฟังก์ชันเริ่มการ preload ทุกวินาที
  const startPreloading = () => {
    if (preloadIntervalRef.current) {
      clearInterval(preloadIntervalRef.current);
    }
    
    preloadIntervalRef.current = setInterval(() => {
      preloadNextPage();
    }, 1000);
  };

  // 🚀 ฟังก์ชัน preload หน้าถัดไป
  const preloadNextPage = async () => {
    if (isPreloading || !hasMoreMenus) return;
    
    const nextPage = currentPage + menuQueue.length + 1;
    
    if (preloadedPages.includes(nextPage) || menuQueue.length >= maxPreloadPages) {
      return;
    }
    
    setIsPreloading(true);
    
    try {
      const params = new URLSearchParams({
        userId: userId,
        page: nextPage.toString(),
        limit: '4',
        sortBy: 'relevance'
      });

      // 🔥 รวม ID ของเมนูที่แสดงแล้ว + ที่อยู่ใน queue (ป้องกันเมนูซ้ำ)
      const queueMenuIds = menuQueue.flat().map(m => m._id);
      const allExistingIds = [...new Set([...allShownMenuIds, ...queueMenuIds])];

      if (allExistingIds.length > 0) {
        params.append('excludeIds', allExistingIds.join(','));
      }

      const endpoint = `/api/recommend-ai?${params.toString()}&refresh=true`;
      
      console.log(`🚀 Preloading page ${nextPage}... (excluding ${allExistingIds.length} IDs)`);
      
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const text = await res.text();
      if (!res.ok || !text) return;

      const data = JSON.parse(text);
      const newMenus: MenuItem[] = Array.isArray(data?.recommendedMenus)
        ? data.recommendedMenus
        : [];

      // 🔥 กรองเมนูที่ไม่ซ้ำกับที่มีอยู่แล้ว
      const validMenus = newMenus.filter(newMenu => {
        if (!newMenu || !newMenu._id || !newMenu.name) return false;
        
        // ตรวจสอบกับเมนูที่แสดงแล้ว
        if (allShownMenuIds.includes(newMenu._id)) return false;
        
        // ตรวจสอบกับเมนูที่อยู่ใน queue
        if (queueMenuIds.includes(newMenu._id)) return false;
        
        return true;
      });

      if (validMenus.length > 0) {
        setMenuQueue(prev => [...prev, validMenus]);
        setPreloadedPages(prev => [...prev, nextPage]);
        console.log(`✅ Preloaded page ${nextPage}: ${validMenus.length} unique menus`);
      } else {
        console.log(`⚠️ No new unique menus found for page ${nextPage}`);
      }

      // ถ้าไม่มีเมนูใหม่แล้ว หยุด preload
      if (validMenus.length === 0 || data?.isLastPage) {
        setHasMoreMenus(false);
        if (preloadIntervalRef.current) {
          clearInterval(preloadIntervalRef.current);
        }
      }

    } catch (error) {
      console.error('Error preloading menus:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const fetchMenus = async (refresh = false) => {
    const pageToFetch = refresh ? currentPage + 1 : 0;
    
    const params = new URLSearchParams({
      userId: userId,
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

      const hasMore = data?.hasMore !== undefined ? data.hasMore : newMenus.length >= 4;

      if (refresh) {
        // 🔥 กรองเมนูที่ไม่ซ้ำ
        const filteredNewMenus = newMenus.filter(newMenu => 
          newMenu && newMenu._id && newMenu.name &&
          !allShownMenuIds.includes(newMenu._id)
        );

        if (filteredNewMenus.length > 0) {
          const updatedMenus = [...menus, ...filteredNewMenus];
          const updatedShownIds = [...allShownMenuIds, ...filteredNewMenus.map(m => m._id)];
          const updatedPage = pageToFetch;
          
          setMenus(updatedMenus);
          setAllShownMenuIds(updatedShownIds);
          setCurrentPage(updatedPage);
          setHasMoreMenus(hasMore && filteredNewMenus.length > 0);
          
          // 🚀 บันทึก session
          saveMenuSession(updatedMenus, updatedShownIds, updatedPage, hasMore);
        }
        
        if (data?.isLastPage || !hasMore || filteredNewMenus.length === 0) {
          setHasMoreMenus(false);
        }
      } else {
        // โหลดครั้งแรก
        const validMenus = newMenus.filter((m) => m && m._id && m.name);
        const shownIds = validMenus.map(m => m._id);
        
        setMenus(validMenus);
        setAllShownMenuIds(shownIds);
        setCurrentPage(0);
        
        const shouldShowMore = data?.hasMore !== undefined 
          ? data.hasMore 
          : validMenus.length >= 4;
        
        setHasMoreMenus(shouldShowMore);
        
        // 🚀 บันทึก session
        saveMenuSession(validMenus, shownIds, 0, shouldShowMore);
        
        // เริ่ม preload
        if (shouldShowMore) {
          setTimeout(() => startPreloading(), 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      if (refresh) {
        setHasMoreMenus(false);
      }
    } finally {
      setIsLoadingMenus(false);
      setIsRefreshing(false);
      console.timeEnd(label);
    }
  };

  // 🚀 ฟังก์ชันใหม่: ใช้เมนูจาก queue ทันที
  const handleRefreshMenus = () => {
    if (!hasMoreMenus || isRefreshing) return;
    
    // 🚀 ถ้ามีเมนูใน queue แล้ว ให้แสดงทันที
    if (menuQueue.length > 0) {
      console.log('🚀 Using preloaded menus from queue');
      
      const nextMenuBatch = menuQueue[0];
      
      // 🔥 ตรวจสอบเมนูซ้ำอีกครั้งก่อนแสดง
      const uniqueMenus = nextMenuBatch.filter(menu => !allShownMenuIds.includes(menu._id));
      
      if (uniqueMenus.length > 0) {
        const updatedMenus = [...menus, ...uniqueMenus];
        const updatedShownIds = [...allShownMenuIds, ...uniqueMenus.map(m => m._id)];
        const updatedPage = currentPage + 1;
        
        setMenus(updatedMenus);
        setAllShownMenuIds(updatedShownIds);
        setCurrentPage(updatedPage);
        
        // 🚀 บันทึก session
        saveMenuSession(updatedMenus, updatedShownIds, updatedPage, hasMoreMenus);
      }
      
      // ลบเมนูที่ใช้ไปแล้วออกจาก queue
      setMenuQueue(prev => prev.slice(1));
      
      // ถ้าไม่มีเมนูใน queue แล้ว ให้เริ่ม preload ใหม่
      if (menuQueue.length === 1) {
        startPreloading();
      }
      
      return;
    }

    // 🚀 ถ้าไม่มีใน queue ให้ fetch ปกติ
    setIsRefreshing(true);
    fetchMenus(true);
  };

  // 🚀 ทำความสะอาดเมื่อ component unmount
  useEffect(() => {
    return () => {
      if (preloadIntervalRef.current) {
        clearInterval(preloadIntervalRef.current);
      }
    };
  }, []);

  const goto = (id: string) => {
    if (!id || id === 'undefined') return;
    router.push(`/menu/${id}`);
  };

  const getImageUrl = (image: string) =>
    image && image !== 'undefined' ? `/menus/${encodeURIComponent(image)}` : '/default.png';

  // 🚀 Skeleton loading component
  const renderSkeletonCard = () => (
    <div className="bg-white w-[155px] py-[1rem] rounded-2xl animate-pulse">
      <div className="flex flex-col items-center">
        <div className="h-[8rem] w-[8rem] bg-gray-200 rounded"></div>
        <div className="flex items-center mt-4">
          <div className="w-[0.1rem] h-[2rem] bg-gray-200 mr-[0.4rem]"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );

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
          loading="lazy"
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

        {/* 🚀 Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
            Session: {menus.length} menus | 
            Queue: {menuQueue.length} batches ({menuQueue.flat().length} menus) | 
            Unique IDs: {allShownMenuIds.length} | 
            {isPreloading ? 'Loading...' : 'Ready'}
          </div>
        )}

        {/* 🟧 Grid 2 คอลัมน์ */}
        <div className="grid grid-cols-2 gap-4">
          {menus.map(renderMenuCard)}
          
          {/* 🚀 แสดง skeleton loading เมื่อกำลังโหลด */}
          {isRefreshing && (
            <>
              {renderSkeletonCard()}
              {renderSkeletonCard()}
              {renderSkeletonCard()}
              {renderSkeletonCard()}
            </>
          )}
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
                  Mr.Rice กำลังหาเมนูที่เหมาะกับคุณ...
                </>
              ) : (
                <>
                  แนะนำเมนูเพิ่มเติม
                  {/* 🚀 แสดงจำนวนเมนูที่พร้อมแล้ว */}
                  {menuQueue.length > 0 && (
                    <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
                      ⚡ พร้อม {menuQueue.flat().length} เมนู
                    </span>
                  )}
                </>
              )}
            </button>
            
            {/* 🚀 แสดงสถานะการ preload */}
            {isPreloading && (
              <div className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
                <span className="animate-pulse">🔄</span>
                กำลังเตรียมเมนูถัดไป...
              </div>
            )}
          </div>
        )}

        {!hasMoreMenus && menus.length > 4 && (
          <div className="text-sm text-gray-500 mt-4 text-center">
            ✅ แสดงเมนูที่เหมาะสมกับคุณทุกรายการแล้ว
          </div>
        )}
      </div>
    </div>
  );
}