"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // State สำหรับเปิด/ปิดเมนู Maintenance
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(true);

  // กำหนดโครงสร้างเมนู
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { 
      name: "Maintenance", 
      // กำหนดรายการย่อยตรงนี้
      submenu: [
        { name: "WordPress", path: "/wp" },
        { name: "Support Pal", path: "/sp" },
      ] 
    },
    // { name: "Profile", path: "/profile" },
    { name: "Reports", path: "/reports" },
    { name: "Log", path: "/log" },
  ];

  // Effect: ถ้าอยู่ในหน้าย่อย ให้เปิดเมนู Maintenance อัตโนมัติ
  useEffect(() => {
    if (pathname === "/wp" || pathname === "/sp") {
      setIsMaintenanceOpen(true);
    }
  }, [pathname]);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-6 flex flex-col">
      {/* User Info */}
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-gray-800">Welcome</h1>
        {/* <p className="mt-1 text-gray-600">{session?.user?.name}</p> */}
        <p className="text-gray-400 text-sm">{session?.user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          // --- กรณีเป็นเมนูที่มี Submenu (Maintenance) ---
          if (item.submenu) {
            const isActiveParent = item.submenu.some(sub => pathname === sub.path);
            
            return (
              <div key={item.name} className="flex flex-col gap-1">
                <button
                  onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
                  className={`px-4 py-2 rounded-lg transition flex justify-between items-center text-left font-medium ${
                    isActiveParent 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.name}</span>
                  {/* ไอคอนลูกศรหมุนตามสถานะ */}
                  <span className={`text-xs transform transition-transform duration-200 ${isMaintenanceOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                
                {/* แสดงรายการย่อย */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isMaintenanceOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-gray-100 ml-4 mt-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={`px-4 py-2 rounded-lg transition text-sm ${
                          pathname === subItem.path
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // --- กรณีเป็นเมนูธรรมดา ---
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                pathname === item.path
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-auto w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
      >
        Logout
      </button>
    </div>
  );
}