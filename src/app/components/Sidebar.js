"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { 
      name: "Maintenance", 
      submenu: [
        { name: "WordPress", path: "/wp" },
        { name: "Support Pal", path: "/sp" },
      ] 
    },
    { name: "Reports", path: "/reports" },
    { name: "Log", path: "/log" },
  ];

  // ถ้าเปลี่ยนหน้าบนมือถือ ให้ปิด Sidebar อัตโนมัติ
  useEffect(() => {
    if (window.innerWidth < 768 && onClose) {
       onClose();
    }
    // เปิดเมนู Maintenance อัตโนมัติถ้าอยู่ในหน้านั้น
    if (pathname === "/wp" || pathname === "/sp") {
      setIsMaintenanceOpen(true);
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop (Overlay สีดำจางๆ) */}
      <div 
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-6 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header & Close Button */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Appy Web</h1>
            <p className="text-gray-400 text-xs mt-1 break-all">{session?.user?.email}</p>
          </div>
          {/* ปุ่มปิด (แสดงเฉพาะมือถือ) */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            if (item.submenu) {
              const isActiveParent = item.submenu.some(sub => pathname === sub.path);
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
                    className={`px-4 py-2 rounded-lg transition flex justify-between items-center text-left font-medium ${
                      isActiveParent ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className={`text-xs transform transition-transform duration-200 ${isMaintenanceOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMaintenanceOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-gray-100 ml-4 mt-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className={`px-4 py-2 rounded-lg transition text-sm ${pathname === subItem.path ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-lg transition font-medium ${pathname === item.path ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-auto w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm font-medium text-sm"
        >
          Logout
        </button>
      </div>
    </>
  );
}