"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Profile", path: "/profile" },
    { name: "Reports", path: "/reports" },
  ];

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
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`px-4 py-2 rounded-lg transition ${
              pathname === item.path
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-auto w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
