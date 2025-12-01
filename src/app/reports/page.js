"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function ReportsPage() {
  const [data, setData] = useState({ wpSites: [], spSites: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Logic Helpers ---
  const getWPStatus = (log) => {
    if (!log) return "Pending";
    const lastCheck = new Date(log.checkDate);
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return lastCheck >= monday ? "Completed" : "Pending";
  };

  const getSPStatus = (log) => {
    if (!log) return "Pending";
    const lastCheck = new Date(log.checkDate);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return lastCheck >= startOfMonth ? "Completed" : "Pending";
  };

  // Helper สำหรับเทียบ Version ทั่วไป (Core/PHP/DB)
  const getVersionDiff = (current, prev) => {
    if (!prev || current === prev) return current;
    return (
      <span>
        <span className="text-gray-400 line-through mr-1">{prev}</span> 
        <span className="text-gray-400 mx-1">➝</span> 
        <span className="text-green-600 font-bold">{current}</span>
      </span>
    );
  };

  const wpPending = data.wpSites.filter(site => getWPStatus(site.logs[0]) === "Pending");
  const wpCompleted = data.wpSites.filter(site => getWPStatus(site.logs[0]) === "Completed");
  
  const spPending = data.spSites.filter(site => getSPStatus(site.logs[0]) === "Pending");
  const spCompleted = data.spSites.filter(site => getSPStatus(site.logs[0]) === "Completed");

  const totalPending = wpPending.length + spPending.length;
  // นับเฉพาะรายการที่ Completed ในหน้า Dashboard นี้
  // (ถ้าต้องการนับทั้งหมดอาจจะต้องปรับ Logic API แต่เบื้องต้นนับตามที่แสดงผล)
  
  if (loading) return <div className="flex h-screen bg-slate-50"><Sidebar /><div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Maintenance Reports</h1>
          <p className="text-gray-500 mb-8">Summary of updates and pending tasks.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Pending Tasks" value={totalPending} color="text-red-600" bg="bg-red-50" icon="🚨" />
            <StatCard title="Completed (WP)" value={wpCompleted.length} color="text-blue-600" bg="bg-blue-50" icon="Wordpress" />
            <StatCard title="Completed (SP)" value={spCompleted.length} color="text-indigo-600" bg="bg-indigo-50" icon="SupportPal" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* --- Left: Action Required --- */}
            <div className="space-y-8">
              <SectionHeader title="⚠️ Action Required" subtitle="Websites that need maintenance" />
              {totalPending === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-800">🎉 All systems are up to date!</div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">System</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {wpPending.map(site => <PendingRow key={site.id} name={site.name} type="WordPress" url={site.url} typeColor="bg-blue-100 text-blue-700" />)}
                      {spPending.map(site => <PendingRow key={site.id} name={site.name} type="SupportPal" url={site.url} typeColor="bg-indigo-100 text-indigo-700" />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* --- Right: Activity Log --- */}
            <div className="space-y-8">
              <SectionHeader title="✅ Recent Updates" subtitle="Version changes & plugin updates" />
              <div className="space-y-4">
                
                {/* WordPress Completed List */}
                {wpCompleted.map(site => {
                    const latest = site.logs[0];
                    const prev = site.logs[1]; 

                    return (
                        <CompletedCard 
                            key={site.id}
                            name={site.name}
                            type="WordPress"
                            date={latest.checkDate}
                            note={latest.note}
                            versions={
                                <div className="grid grid-cols-2 gap-2">
                                    <div>WP: {getVersionDiff(latest.wordpressVersion, prev?.wordpressVersion)}</div>
                                    <div>PHP: {getVersionDiff(latest.phpVersion, prev?.phpVersion)}</div>
                                </div>
                            }
                            plugins={latest.plugins}
                            prevPlugins={prev?.plugins} // 🔥 ส่ง Plugin เก่าไปเทียบ
                            badgeColor="bg-blue-100 text-blue-700"
                        />
                    );
                })}

                {/* SupportPal Completed List */}
                {spCompleted.map(site => {
                    const latest = site.logs[0];
                    const prev = site.logs[1];

                    return (
                        <CompletedCard 
                            key={site.id}
                            name={site.name}
                            type="SupportPal"
                            date={latest.checkDate}
                            note={latest.note}
                            versions={
                                <div className="grid grid-cols-2 gap-2">
                                    <div>SP: {getVersionDiff(latest.spVersion, prev?.spVersion)}</div>
                                    <div>Nginx: {getVersionDiff(latest.nginxVersion, prev?.nginxVersion)}</div>
                                </div>
                            }
                            plugins={latest.plugins} // ใช้ฟิลด์เดียวกัน (ถ้า SP มี Plugin) หรือใส่ค่าว่างถ้าไม่มี
                            prevPlugins={prev?.plugins}
                            badgeColor="bg-indigo-100 text-indigo-700"
                        />
                    );
                })}

                {(wpCompleted.length === 0 && spCompleted.length === 0) && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        No activity recorded yet.
                    </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p><p className={`text-3xl font-extrabold ${color}`}>{value}</p></div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
    return (<div><h2 className="text-lg font-bold text-gray-800">{title}</h2><p className="text-xs text-gray-500">{subtitle}</p></div>)
}

function PendingRow({ name, type, url, typeColor }) {
    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-6 py-4"><div className="font-semibold text-gray-800">{name}</div><a href={url} target="_blank" className="text-xs text-blue-500 hover:underline">{url}</a></td>
            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${typeColor}`}>{type}</span></td>
            <td className="px-6 py-4 text-right"><span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">Due</span></td>
        </tr>
    )
}

// 🔥 Component แสดงการ์ดที่ทำเสร็จแล้ว พร้อมโชว์ Plugin Update
function CompletedCard({ name, type, date, note, versions, plugins, prevPlugins, badgeColor }) {
    // ฟังก์ชันแปลง String เป็น Array
    const parsePlugins = (str) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    };

    const currentList = plugins ? parsePlugins(plugins) : [];
    const prevList = prevPlugins ? parsePlugins(prevPlugins) : [];

    // หา Plugin ที่มีการเปลี่ยนแปลงเวอร์ชัน
    const updates = currentList.reduce((acc, curr) => {
        const prev = prevList.find(p => p.name === curr.name);
        if (prev && prev.version !== curr.version) {
            acc.push({ name: curr.name, from: prev.version, to: curr.version });
        }
        return acc;
    }, []);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}`}>{type}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Versions Grid */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono mb-3 border border-gray-100">
                {versions}
            </div>

            {/* Note */}
            {note && (
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Update Note:</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-100">{note}</p>
                </div>
            )}

            {/* 🔥 Plugin Updates Section */}
            {updates.length > 0 ? (
                <div className="mt-3 border-t border-gray-100 pt-2 bg-green-50/30 -mx-5 px-5 pb-3">
                     <p className="text-[10px] font-bold text-green-700 uppercase mb-2 mt-2 flex items-center gap-1">
                        <span className="text-sm">⚡</span> Plugin Updates
                     </p>
                     <ul className="space-y-1">
                        {updates.map((u, i) => (
                            <li key={i} className="text-xs text-gray-700 flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-gray-800">• {u.name}</span>
                                <div className="flex items-center bg-white px-1.5 py-0.5 rounded border border-green-200 text-[10px] shadow-sm">
                                    <span className="text-gray-400 line-through mr-1">{u.from}</span>
                                    <span className="text-gray-400 mr-1">➝</span>
                                    <span className="text-green-600 font-bold">{u.to}</span>
                                </div>
                            </li>
                        ))}
                     </ul>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span>{currentList.length} active plugins (No updates)</span>
                </div>
            )}
        </div>
    )
}