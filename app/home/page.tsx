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
  const [currentPage, setCurrentPage] = useState(0);
  const [allShownMenuIds, setAllShownMenuIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  
const [isSearching, setIsSearching] = useState(false);


  useEffect(() => {
    fetchMenus();
  }, []);

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
      const totalAvailable = data?.totalAvailable || 0;

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

        setHasMoreMenus(hasMore && filteredNewMenus.length > 0);

        if (data?.isLastPage || !hasMore || filteredNewMenus.length === 0) {
          setHasMoreMenus(false);
        }
      } else {
        const validMenus = newMenus.filter((m) => m && m._id && m.name);
        setMenus(validMenus);
        setAllShownMenuIds(validMenus.map(m => m._id));
        setCurrentPage(0);

        const shouldShowMore = data?.hasMore !== undefined
          ? data.hasMore
          : validMenus.length >= 4;

        setHasMoreMenus(shouldShowMore);
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

  const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  setIsSearching(true);
  try {
    const res = await fetch(`/api/search-menu?query=${encodeURIComponent(searchTerm)}&userId=${userId}`);
    const data = await res.json();
    const foundMenus: MenuItem[] = Array.isArray(data?.menus) ? data.menus : [];
    setMenus(foundMenus);
    setHasMoreMenus(false); // ปิดปุ่มแนะนำเมนูเพิ่มเมื่อค้นหา
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    setIsSearching(false);
  }
};

  if (isLoadingMenus) {
    return (
      <div className="flex font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className='font-prompt'>
      <HealthTip userId={userId} />

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[2rem] mr-[9rem] text-[1.6rem]">
          เมนูแนะนำ
        </h1>

        <div className="flex gap-2 mb-[4rem]">
            <input
              type="text"
              placeholder="ค้นหาเมนู"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border w-[200px]"
            />
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white items-center flex px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={isSearching}
            >
             <img className='w-[1rem] h-[1rem] mr-[0.3rem]' src="/search2.png"></img>ค้นหา
            </button>
          </div>

        <div className="grid grid-cols-2 gap-4 mb-[4rem]">
          {menus.map(renderMenuCard)}
        </div>  
      </div>
    </div>
  );
}
