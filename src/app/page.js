"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "./components/AppLayout";
import StatCard from "./components/StatCard"; // Import StatCard
import { Icons } from "./components/Icons"; // Import Icons

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

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

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

  const isSPPending = (log) => {
    if (!log) return true;
    const lastCheck = new Date(log.checkDate);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return lastCheck < startOfMonth;
  };

  const pendingWP = data.wpSites.filter(site => isWPPending(site.logs[0])).map(s => ({...s, type: 'WP', url_path: '/wp'}));
  const pendingSP = data.spSites.filter(site => isSPPending(site.logs[0])).map(s => ({...s, type: 'SP', url_path: '/sp'}));
  
  const allPending = [...pendingWP, ...pendingSP];
  const totalSites = data.wpSites.length + data.spSites.length;
  
  const allServers = new Set([
    ...data.wpSites.map(s => s.server),
    ...data.spSites.map(s => s.server)
  ]);

  return (
    <AppLayout>
      <style>{styles}</style>
      
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name || "Admin"}</span>!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-up delay-100">
        <StatCard 
          title="Attention Needed" 
          value={allPending.length} 
          icon={allPending.length > 0 ? <Icons.AlertTriangle className="w-6 h-6" /> : <Icons.CheckCircle className="w-6 h-6" />}
          color={allPending.length > 0 ? 'text-red-600' : 'text-green-600'} 
          bg={allPending.length > 0 ? 'bg-red-50' : 'bg-green-50'} 
        />
        <StatCard 
          title="Total Websites" 
          value={totalSites} 
          icon={<Icons.Globe className="w-6 h-6" />} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          title="Active Servers" 
          value={allServers.size} 
          icon={<Icons.Server className="w-6 h-6" />} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-up delay-200">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              ⚡ Tasks & Maintenance
              {allPending.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{allPending.length}</span>}
            </h2>
            <Link href="/reports" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View Full Report <Icons.ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {allPending.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                <div className="bg-green-50 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Icons.CheckCircle className="w-8 h-8" />
                </div>
                <p className="font-medium text-gray-600">All systems are up to date.</p>
                <p className="text-xs mt-1">Great job maintaining the infrastructure!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {allPending.map((site) => (
                  <div key={site.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${site.type === 'WP' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {site.type === 'WP' ? <Icons.WordPress className="w-5 h-5" /> : <Icons.SupportPal className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{site.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-2 truncate">
                          <Icons.Server className="w-3 h-3" /> {site.server} 
                          <span className="text-gray-300">•</span>
                          <span className="text-red-500 font-medium">Due Now</span>
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={site.url_path} 
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm ml-2"
                    >
                      Fix
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/wp" className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Icons.WordPress className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">WordPress</p>
                  <p className="text-xs text-gray-500">Manage WP Sites</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-blue-500 transition">→</span>
            </Link>

            <Link href="/sp" className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Icons.SupportPal className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Support Pal</p>
                  <p className="text-xs text-gray-500">Manage SP Sites</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-indigo-500 transition">→</span>
            </Link>

            <Link href="/reports" className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 text-gray-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Icons.Dashboard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Reports</p>
                  <p className="text-xs text-gray-500">Summary & Logs</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600 transition">→</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}