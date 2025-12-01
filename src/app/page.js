"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

// --- CSS Animation ---
const styles = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
`;

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState({ wpSites: [], spSites: [] });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

  // Fetch Data
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/reports")
        .then((res) => res.json())
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-gray-400">Loading Dashboard...</div>;
  }

  // --- Logic คำนวณงานค้าง (Pending Tasks) ---
  
  // 1. WP Helper (Weekly)
  const isWPPending = (log) => {
    if (!log) return true;
    const lastCheck = new Date(log.checkDate);
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return lastCheck < monday;
  };

  // 2. SP Helper (Monthly)
  const isSPPending = (log) => {
    if (!log) return true;
    const lastCheck = new Date(log.checkDate);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return lastCheck < startOfMonth;
  };

  // รวมรายการที่ต้องทำ (Pending List)
  const pendingWP = data.wpSites.filter(site => isWPPending(site.logs[0])).map(s => ({...s, type: 'WP', url_path: '/maintenance'}));
  const pendingSP = data.spSites.filter(site => isSPPending(site.logs[0])).map(s => ({...s, type: 'SP', url_path: '/supportpal'}));
  
  const allPending = [...pendingWP, ...pendingSP];
  const totalSites = data.wpSites.length + data.spSites.length;
  
  // รวม Server ทั้งหมด (unique)
  const allServers = new Set([
    ...data.wpSites.map(s => s.server),
    ...data.spSites.map(s => s.server)
  ]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-900">
      <style>{styles}</style>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* 1. Welcome Section */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name || "Admin"}</span>! Here's what's happening today.</p>
          </div>

          {/* 2. Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-up delay-100">
            {/* Card 1: Pending Tasks (High Priority) */}
            <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1 ${allPending.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${allPending.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>Attention Needed</p>
                <p className={`text-4xl font-extrabold ${allPending.length > 0 ? 'text-red-700' : 'text-gray-800'}`}>{allPending.length}</p>
                <p className="text-xs text-gray-500 mt-1">Sites require maintenance</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${allPending.length > 0 ? 'bg-red-200 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {allPending.length > 0 ? '🚨' : '✅'}
              </div>
            </div>

            {/* Card 2: Total Sites */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Websites</p>
                <p className="text-4xl font-extrabold text-gray-800">{totalSites}</p>
                <p className="text-xs text-gray-500 mt-1">Across all platforms</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-blue-50 text-blue-600 shadow-inner">
                🌐
              </div>
            </div>

            {/* Card 3: Servers */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Servers</p>
                <p className="text-4xl font-extrabold text-gray-800">{allServers.size}</p>
                <p className="text-xs text-gray-500 mt-1">Infrastructure nodes</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                🖥️
              </div>
            </div>
          </div>

          {/* 3. Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-up delay-200">
            
            {/* Left Column: Action List (2/3 width) */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  ⚡ Tasks & Maintenance
                  {allPending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{allPending.length}</span>}
                </h2>
                <Link href="/reports" className="text-xs font-semibold text-blue-600 hover:underline">View Full Report →</Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {allPending.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                    <div className="text-4xl mb-3">🎉</div>
                    <p>All systems are up to date.</p>
                    <p className="text-xs mt-1">Great job maintaining the infrastructure!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {allPending.map((site) => (
                      <div key={site.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${site.type === 'WP' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {site.type}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{site.name}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              {site.server} • <span className="text-red-500 font-medium">Due Now</span>
                            </p>
                          </div>
                        </div>
                        <Link 
                          href={site.url_path} 
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase rounded-lg hover:bg-blue-600 hover:text-white hover:border-transparent transition shadow-sm"
                        >
                          Fix
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Links & Summary (1/3 width) */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/maintenance" className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition flex items-center justify-between group">
                  <div>
                    <p className="font-bold">WordPress</p>
                    <p className="text-xs text-blue-100 opacity-80 mt-0.5">Manage WP Sites</p>
                  </div>
                  <span className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition">→</span>
                </Link>

                <Link href="/supportpal" className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition flex items-center justify-between group">
                  <div>
                    <p className="font-bold">Support Pal</p>
                    <p className="text-xs text-indigo-100 opacity-80 mt-0.5">Manage SP Sites</p>
                  </div>
                  <span className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition">→</span>
                </Link>

                <Link href="/reports" className="p-4 bg-white border border-gray-200 rounded-xl text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition flex items-center justify-between group">
                  <div>
                    <p className="font-bold">View Reports</p>
                    <p className="text-xs text-gray-400 mt-0.5">Summary & Logs</p>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 transition">📊</span>
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}