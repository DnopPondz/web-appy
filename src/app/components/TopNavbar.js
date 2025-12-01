"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNavbar() {
  const pathname = usePathname(); // Detect page URL
  const [time, setTime] = useState("");

  // Convert pathname to page title
  const formatTitle = (path) => {
    if (path === "/") return "Dashboard";
    return path
      .replace("/", "")
      .replace("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleString());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800">
        {formatTitle(pathname)}
      </h2>

      {/* Date & Time */}
      <div className="text-gray-600 text-sm">{time}</div>
    </div>
  );
}
