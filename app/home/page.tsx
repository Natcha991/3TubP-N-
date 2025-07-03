// app/home/page.tsx (สำหรับ App Router)
// หรือ pages/home.tsx (สำหรับ Pages Router)

'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// กำหนด Interface สำหรับข้อมูลเมนู
interface MenuItem {
  _id: string; // ควรมี _id สำหรับ key ใน React list
  name: string;
  calories: number;
  image: string; // URL ของรูปภาพเมนู
  reason?: string; // เหตุผลที่แนะนำ (ใช้ในการกรองเมนูเบาหวาน)
  // เพิ่ม field อื่นๆ ที่คุณต้องการจาก API
}

// กำหนด Interface สำหรับข้อมูล Profile ผู้ใช้ (Sushi)
interface UserProfile {
  name: string;
  kcal: number; // อาจจะเป็นแคลอรี่ที่บริโภคไปแล้ว หรือแคลอรี่ที่แนะนำ
  nutrients: {
    label: string;
    value: string | number;
  }[];
  profileImage: string; // URL รูปโปรไฟล์
}

export default function Home() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // สถานะสำหรับข้อมูล Profile ของ Sushi
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true); // สถานะโหลดโปรไฟล์
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(true); // สถานะโหลดเมนู

  // -----------------------------------------------------
  // useEffect สำหรับดึงข้อมูล User Profile (Sushi)
  // -----------------------------------------------------
  useEffect(() => {
    const fetchUserProfile = async () => {
      // ดึง userId จาก Local Storage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('No userId found in localStorage. Cannot fetch user profile.');
        setIsLoadingProfile(false);
        // หากไม่มี userId อาจจะ redirect กลับไปหน้า login/register
        // router.push('/login');
        return;
      }

      try {
        // Fetch ข้อมูลผู้ใช้จาก Backend API (เช่น /api/user/[id])
        // สมมติว่าคุณมี API ที่คืนข้อมูลผู้ใช้เมื่อส่ง userId ไป
        const res = await fetch(`/api/user/${userId}`); // แก้ URL ตาม API จริงของคุณ
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch user profile: ${errorData.message || res.statusText}`);
        }
        const data = await res.json();

        // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
        console.log("Fetched User Profile Data:", data);

        // Map ข้อมูลจาก API ให้เข้ากับ UserProfile interface
        setUserProfile({
          name: data.name || 'Unknown', // ใช้ data.name แทน username
          kcal: data.caloriesConsumed || 70, // สมมติว่ามี field caloriesConsumed
          nutrients: [ // ดึงจาก data.nutrient1, data.nutrient2, etc. หรือ loop ผ่าน array ถ้ามี
            { label: 'Nutrient1', value: data.nutrient1 || 'N/A' },
            { label: 'Nutrient2', value: data.nutrient2 || 'N/A' },
            { label: 'Nutrient3', value: data.nutrient3 || 'N/A' },
          ],
          profileImage: data.profileImage || 'https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg', // ใช้รูป default ถ้าไม่มี
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ // ตั้งค่า default หรือแสดงข้อผิดพลาด
          name: 'Guest',
          kcal: 0,
          nutrients: [{ label: 'Error', value: 'Loading failed' }],
          profileImage: 'https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []); // [] เพื่อให้รันแค่ครั้งเดียวเมื่อ component mount

  // -----------------------------------------------------
  // useEffect สำหรับดึงข้อมูลเมนูแนะนำ
  // -----------------------------------------------------
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/recommend-ai'); // API สำหรับเมนูแนะนำ
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        // ตรวจสอบโครงสร้างข้อมูลที่ได้รับจาก API /api/recommend-ai
        console.log("Fetched Recommended Menus Data:", data);

        // สมมติว่า API คืนข้อมูลเป็น { recommendedMenus: MenuItem[] } หรือ [MenuItem1, MenuItem2, ...]
        setMenus(data.recommendedMenus || data || []); // ปรับตาม response จริงของ API
      } catch (error) {
        console.error('Error fetching AI menus:', error);
        setMenus([]); // ตั้งค่าเป็น array ว่างหากเกิดข้อผิดพลาด
      } finally {
        setIsLoadingMenus(false);
      }
    };

    fetchMenus();
  }, []); // [] เพื่อให้รันแค่ครั้งเดียวเมื่อ component mount

  const goto = () => router.push("/menu"); // ฟังก์ชันสำหรับนำทางไปหน้าเมนู (ทั่วไป)

  // ถ้าข้อมูลกำลังโหลดอยู่ (ทั้งโปรไฟล์และเมนู)
  if (isLoadingProfile || isLoadingMenus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex relative justify-center">
        <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
          <div className="absolute top-[2rem]">
            <img className="w-[41px] h-[41px] rounded-full object-cover" src={userProfile?.profileImage || "https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg"} alt="Profile" />
          </div>
          <h1 className="text-[#333333] font-Unbounded text-2xl font-bold font-unbounded">{userProfile?.name || 'Loading...'}</h1> {/* แสดงชื่อผู้ใช้ */}
          <div className="py-[2rem] flex items-baseline">
            <h1 className="text-[#333333] font-Unbounded text-6xl font-bold">{userProfile?.kcal || 0}</h1> {/* แสดงแคลอรี่ */}
            <h1 className="text-[#333333] font-Unbounded text-[0.7rem] ml-[0.2rem]">KCAL</h1>
          </div>
          <div className="flex justify-between">
            <div className="gap-[1rem]">
              {userProfile?.nutrients.map((n, index) => (
                <p key={index} className="text-[#333333] font-Unbounded text-[1rem]">{n.label}</p>
              ))}
            </div>
            <div className="gap-[1rem]">
              {userProfile?.nutrients.map((n, index) => (
                <p key={index} className="text-[#333333] font-Unbounded text-[1rem]">{n.value}</p>
              ))}
            </div>
          </div>
        </div>
        <img className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" src="/image%2048.png" alt="Hero Background" />
      </div>


      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {menus.length === 0 && !isLoadingMenus ? ( // เพิ่ม !isLoadingMenus เพื่อแสดงเมื่อโหลดเสร็จแล้วแต่ไม่มีข้อมูล
            <p>ไม่พบเมนูแนะนำ</p>
          ) : (
            menus.slice(0, 2).map((item, idx) => ( // ตัวอย่าง: แสดงแค่ 2 เมนูแรก
              <div
                key={item._id || idx} // ใช้ item._id เป็น key ถ้ามี
                onClick={goto}
                className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                  <div className="flex items-center">
                    <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                    <div className="">
                      <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt ">{item.name.toUpperCase()}</h1> {/*ชื่อเมนู*/}
                      <div className="flex items-baseline mt-[-0.3rem]">
                        <h1 className="text-[0.8rem] font-Unbounded ">{item.calories}</h1> {/*จำนวนแคล*/}
                        <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded ">KCAL</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="relative">
          <h1 className="font-[600] my-[1.5rem] text-center mb-[2rem] text-[1.6rem] font-Pro text-[#333333] font-prompt">เมนูสำหรับผู้เป็นเบาหวาน</h1>
          {/* ส่วนของเมนูเบาหวานแบบคงที่ (Stir Cauliflower) */}
          <div className="flex items-center gap-4 bg-white pl-[0.5rem] rounded-br-2xl rounded-tl-2xl rounded-bl-[45px] rounded-tr-[45px] h-[150px] w-[330px]">
            <img className="h-[140px] transform transition duration-500 hover:scale-110" src="/image%2055.png" alt="Stir Cauliflower" />
            <div className="relative top-[-2.3rem] left-[-0.5rem]">
              <h1 className="text-[1rem] leading-6 font-Unbounded font-bold text-[#333333]">STIR CAULIFLOWER</h1>
              <h1 className="text-[0.5rem] font-Unbounded absolute top-[0.45rem] left-[3.2rem]">150 KCAL</h1>
            </div>
            <div className="absolute left-[10rem] mt-[3rem]">
              <div className="grid grid-cols-2">
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">น้ำตาลต่ำ</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ผัดแบบใช้น้ำมันน้อย</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ไฟเบอร์สูง</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ควบคุมน้ำตาลในเลือด</h1>
                </div>
              </div>
              <div className="flex gap-1.5 mt-[0.5rem] items-center">
                <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                <h1 className="text-[0.5rem] text-[#333333] font-prompt">อร่อยและดีต่อสุขภาพได้ง่าย ๆ</h1>
              </div>
            </div>
          </div>
          {/* ส่วนของเมนูเบาหวานที่ดึงจาก API */}
          <div className="flex justify-center gap-3 my-5">
            {menus.length === 0 && !isLoadingMenus ? (
              <p>ไม่พบเมนูสำหรับผู้เป็นเบาหวาน</p>
            ) : (
              menus
                .filter(item => item.reason?.includes('เบาหวาน') || item.name.toLowerCase().includes('เบาหวาน')) // กรองเมนูสำหรับเบาหวาน (ปรับ logic ตาม data ที่ได้จริง)
                .slice(0, 2)
                .map((item, idx) => (
                  <div
                    key={item._id || idx} // ใช้ item._id เป็น key ถ้ามี
                    onClick={goto}
                    className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                      <div className="flex items-center">
                        <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                        <div>
                          <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">
                            {item.name.toUpperCase()}
                          </h1>
                          <div className="flex items-baseline mt-[-0.3rem]">
                            <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
                            <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}