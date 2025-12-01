"use client";

import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";

const styles = `
  @keyframes springUp { 0% { opacity: 0; transform: translateY(40px) scale(0.9); } 50% { opacity: 1; transform: translateY(-5px) scale(1.02); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
  .animate-spring-up { animation: springUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

export default function SupportPalPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null); 

  const [formData, setFormData] = useState({
    name: "", url: "", server: "", 
    phpVersion: "", spVersion: "", dbVersion: "", nginxVersion: "", 
    note: ""
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/supportpal/websites");
      if (res.ok) {
        const data = await res.json();
        setWebsites(data);
      }
    } catch (error) { console.error("Failed to fetch", error); }
    setLoading(false);
  };

  const getStatus = (logs) => {
    if (!logs || logs.length === 0) {
        return { label: "Pending", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" };
    }

    const lastCheck = new Date(logs[0].checkDate);
    const now = new Date();
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (lastCheck >= startOfMonth) {
      return { label: "Completed", color: "bg-green-50 text-green-700", border: "border-green-200", dot: "bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" };
    } else {
      return { label: "Maintenance Due", color: "bg-red-50 text-red-700", border: "border-red-200", dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" };
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    await fetch(`/api/supportpal/websites?id=${id}`, { method: "DELETE" });
    fetchWebsites();
  };

  const handleSaveWebsite = async () => {
    if(!formData.name || !formData.url) return alert("Please fill Name and URL");
    await fetch("/api/supportpal/websites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    setIsAddModalOpen(false);
    resetForm();
    fetchWebsites();
  };

  const handleSaveLog = async () => {
    const payload = { ...formData, supportPalId: selectedWebsite.id };
    await fetch("/api/supportpal/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setIsLogModalOpen(false);
    fetchWebsites();
  };

  const openLogModal = (site) => {
    setSelectedWebsite(site);
    const latest = site.logs?.[0] || {};
    setFormData({
      server: site.server,
      phpVersion: latest.phpVersion || "",
      spVersion: latest.spVersion || "",
      dbVersion: latest.dbVersion || "",
      nginxVersion: latest.nginxVersion || "",
      note: "", 
    });
    setIsLogModalOpen(true);
  };

  const openDetailModal = (site) => {
    setSelectedWebsite(site);
    setSelectedLog(site.logs?.[0] || {});
    setIsDetailModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", url: "", server: "", phpVersion: "", spVersion: "", dbVersion: "", nginxVersion: "", note: "" });
  };

  const groupedWebsites = websites.reduce((groups, site) => {
    const serverName = site.server || "Unassigned Server";
    if (!groups[serverName]) groups[serverName] = [];
    groups[serverName].push(site);
    return groups;
  }, {});

  const totalSites = websites.length;
  const completedSites = websites.filter(w => getStatus(w.logs).label === "Completed").length;
  const pendingSites = totalSites - completedSites;

  return (
    <AppLayout>
      <style>{styles}</style>
      
      <div className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Support Pal Maintenance</h1>
            <p className="text-gray-500 mt-1">Monthly maintenance tracking for Support Pal systems.</p>
          </div>
          <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 font-semibold transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center">
            <span className="text-lg">+</span> Add Support Pal
          </button>
        </div>

        {pendingSites > 0 && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm flex items-start gap-4 animate-spring-up">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg text-xl">⚠️</div>
            <div>
              <h3 className="text-red-900 font-bold text-sm uppercase tracking-wide">Monthly Action Required</h3>
              <p className="text-red-700 text-sm mt-1">
                <strong className="font-extrabold underline decoration-2">{pendingSites} site(s)</strong> require maintenance this month.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Sites" value={totalSites} icon="🛠️" color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Completed This Month" value={completedSites} icon="✅" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Due" value={pendingSites} icon="🚨" color="text-red-600" bg="bg-red-50" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            Loading dashboard...
        </div>
      ) : Object.keys(groupedWebsites).length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">No sites found.</p>
          <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="text-blue-600 font-semibold hover:underline mt-2">Add your first site</button>
        </div>
      ) : (
        Object.entries(groupedWebsites).map(([serverName, sites]) => (
          <div key={serverName} className="mb-12 animate-spring-up">
            <div className="flex items-center gap-3 mb-5 pl-1">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full shadow-sm"></div>
              <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wider">{serverName}</h2>
              <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{sites.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sites.map((site) => {
                const status = getStatus(site.logs);
                const log = site.logs?.[0] || {};
                const isNew = new Date(log.checkDate).getFullYear() < 2000;

                return (
                  <div key={site.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 text-lg truncate pr-2 group-hover:text-blue-600 transition-colors" title={site.name}>{site.name}</h3>
                        <a href={site.url} target="_blank" className="text-xs text-gray-400 hover:text-blue-500 hover:underline mt-1 block truncate transition-colors">{site.url}</a>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${status.color}`}>
                        <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </div>
                    </div>

                    <div className="p-6 flex-1 bg-gradient-to-b from-white to-gray-50/30">
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                        <InfoBox label="SP Version" value={log.spVersion} />
                        <InfoBox label="PHP Version" value={log.phpVersion} />
                        <InfoBox label="DB Version" value={log.dbVersion} />
                        <InfoBox label="Nginx Version" value={log.nginxVersion} />
                        
                        <div className="col-span-2 pt-2 border-t border-gray-100 mt-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Last Checked</p>
                          <p className={`text-sm font-medium ${isNew ? 'text-red-500' : 'text-gray-600'}`}>
                            {log.checkDate && !isNew ? new Date(log.checkDate).toLocaleString("th-TH") : "Waiting for check"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-b-2xl border-t border-gray-100 flex justify-between items-center gap-2">
                      <button onClick={() => openDetailModal(site)} className="text-gray-500 hover:text-gray-900 text-xs font-bold uppercase tracking-wide px-2 transition-colors">View Details</button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openLogModal(site)} className={`text-xs px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-sm ${status.label === "Completed" ? "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"}`}>Maintenance</button>
                        <button onClick={() => handleDelete(site.id)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* --- MODALS (เหมือนเดิม) --- */}
      {isAddModalOpen && (
        <Modal title="Add New Support Pal" onClose={() => setIsAddModalOpen(false)}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <Input label="Site Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Support Portal" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="URL" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://support.example.com" />
                <Input label="Server Name" value={formData.server} onChange={(e) => setFormData({...formData, server: e.target.value})} placeholder="e.g. DigitalOcean-01" />
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Initial System Info</p>
              <div className="grid grid-cols-2 gap-5">
                <Input label="SP Version" value={formData.spVersion} onChange={(e) => setFormData({...formData, spVersion: e.target.value})} />
                <Input label="PHP Version" value={formData.phpVersion} onChange={(e) => setFormData({...formData, phpVersion: e.target.value})} />
                <Input label="DB Version" value={formData.dbVersion} onChange={(e) => setFormData({...formData, dbVersion: e.target.value})} />
                <Input label="Nginx Version" value={formData.nginxVersion} onChange={(e) => setFormData({...formData, nginxVersion: e.target.value})} />
              </div>
              <div className="mt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Initial Note</label>
                <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm resize-none" rows="2" 
                  value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition active:scale-95">Cancel</button>
              <button onClick={handleSaveWebsite} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg font-semibold transition active:scale-95">Save Site</button>
            </div>
          </div>
        </Modal>
      )}

      {isLogModalOpen && (
        <Modal title={`Perform Maintenance`} subtitle={selectedWebsite?.name} onClose={() => setIsLogModalOpen(false)}>
           <div className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-xl flex items-start gap-3">
                <span className="text-xl">🛠️</span> 
                <div className="mt-0.5">You are in <strong>Maintenance Mode</strong>. Update versions below to complete this <u>month's</u> check.</div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Input label="SP Version" value={formData.spVersion} onChange={(e) => setFormData({...formData, spVersion: e.target.value})} />
                <Input label="PHP Version" value={formData.phpVersion} onChange={(e) => setFormData({...formData, phpVersion: e.target.value})} />
                <Input label="DB Version" value={formData.dbVersion} onChange={(e) => setFormData({...formData, dbVersion: e.target.value})} />
                <Input label="Nginx Version" value={formData.nginxVersion} onChange={(e) => setFormData({...formData, nginxVersion: e.target.value})} />
              </div>
              <div className="mt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Maintenance Note</label>
                <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm resize-none" rows="3" 
                  placeholder="Describe tasks..." 
                  value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setIsLogModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition active:scale-95">Cancel</button>
                <button onClick={handleSaveLog} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-emerald-500/30 font-semibold transition active:scale-95 flex items-center gap-2">
                  <span>Complete</span> ✅
                </button>
              </div>
           </div>
        </Modal>
      )}

      {isDetailModalOpen && (
        <Modal title={`Site Details`} subtitle={selectedWebsite?.name} onClose={() => setIsDetailModalOpen(false)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <DetailItem label="Server" value={selectedWebsite?.server} />
              <DetailItem label="URL" value={selectedWebsite?.url} isLink />
              <DetailItem label="SP Version" value={selectedLog?.spVersion} />
              <DetailItem label="PHP Version" value={selectedLog?.phpVersion} />
              <DetailItem label="DB Version" value={selectedLog?.dbVersion} />
              <DetailItem label="Nginx Version" value={selectedLog?.nginxVersion} />
              <DetailItem label="Last Check" value={selectedLog?.checkDate ? new Date(selectedLog.checkDate).toLocaleString() : "-"} />
            </div>
            
            {selectedLog?.note && (
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm">
                <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2 tracking-wide">📝 Latest Maintenance Note</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedLog.note}</p>
              </div>
            )}
            
            <div className="flex justify-end mt-8">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition active:scale-95">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

// --- Helper Components ---
function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-lg hover:-translate-y-1">
      <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p><p className="text-3xl font-extrabold text-gray-800">{value}</p></div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bg} ${color} shadow-inner`}>{icon}</div>
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-spring-up transform origin-bottom overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-start bg-white z-10">
          <div><h3 className="text-xl font-extrabold text-gray-800">{title}</h3>{subtitle && <p className="text-sm text-blue-600 font-medium mt-0.5">{subtitle}</p>}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full transition-all text-xl leading-none">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input type="text" className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-gray-400" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function DetailItem({ label, value, isLink }) {
  return (
    <div className="group">
      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</span>
      {isLink ? <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold break-all transition-colors">{value}</a> : <span className="text-gray-800 font-medium group-hover:text-gray-900 transition-colors">{value || "-"}</span>}
    </div>
  );
}

function InfoBox({ label, value }) {
    return (
        <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="font-semibold text-gray-700 bg-white border border-gray-100 px-2 py-1 rounded-md inline-block shadow-sm">{value || "-"}</p>
        </div>
    )
}