"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNavbar({ onMenuClick }) {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  const formatTitle = (path) => {
    if (path === "/") return "Dashboard";
    return path
      .replace("/", "")
      .replace("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleString('th-TH', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* ปุ่มเมนู (แสดงเฉพาะมือถือ) */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[200px] md:max-w-none">
          {formatTitle(pathname)}
        </h2>
      </div>

      <div className="text-gray-500 text-xs md:text-sm font-medium">{time}</div>
    </div>
  );
}