"use client";

import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import StatCard from "../components/StatCard";
import { Icons } from "../components/Icons";
import toast from "react-hot-toast";

const styles = `
  @keyframes springUp {
    0% { opacity: 0; transform: translateY(40px) scale(0.9); }
    50% { opacity: 1; transform: translateY(-5px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-spring-up {
    animation: springUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const formatUrl = (url) => {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
};

function PluginManager({ plugins, setPlugins }) {
  const [tempName, setTempName] = useState("");
  const [tempVersion, setTempVersion] = useState("");

  const handleAdd = () => {
    if (!tempName.trim()) return;
    const newPlugin = { name: tempName, version: tempVersion || "latest" };
    setPlugins([...plugins, newPlugin]);
    setTempName("");
    setTempVersion("");
  };

  const handleDelete = (index) => {
    const newPlugins = plugins.filter((_, i) => i !== index);
    setPlugins(newPlugins);
  };

  const handleVersionChange = (index, newVersion) => {
    const newPlugins = [...plugins];
    newPlugins[index].version = newVersion;
    setPlugins(newPlugins);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 shadow-inner">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icons.Code className="w-4 h-4" /> Manage Plugins
      </label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Plugin Name"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          placeholder="Ver."
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm text-center"
          value={tempVersion}
          onChange={(e) => setTempVersion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-md"
        >
          Add
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-48 overflow-y-auto shadow-sm custom-scrollbar">
        {plugins.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-6 italic">No plugins added yet.</p>
        ) : (
          plugins.map((plugin, index) => (
            <div key={index} className="flex justify-between items-center px-4 py-3 hover:bg-blue-50 transition group">
              <div className="flex-1 text-sm text-gray-700 font-medium flex items-center gap-2">
                <span className="truncate max-w-[180px] text-gray-800">{plugin.name}</span>
                <div className="flex items-center bg-gray-100 group-hover:bg-white border border-gray-200 rounded-md px-2 py-0.5 ml-auto mr-2 transition-colors">
                    <span className="text-[10px] text-gray-400 mr-1 select-none">v</span>
                    <input 
                        type="text"
                        className="bg-transparent border-none outline-none text-xs text-gray-600 w-12 font-bold text-center p-0"
                        value={plugin.version}
                        onChange={(e) => handleVersionChange(index, e.target.value)}
                    />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="text-gray-400 hover:text-red-500 bg-transparent hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-full transition-all"
                title="Remove"
              >
                <Icons.Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null); 

  const [formData, setFormData] = useState({
    name: "", url: "", server: "", wordpressVersion: "", phpVersion: "", dbVersion: "", theme: "", note: "", plugins: []
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/websites");
      if (res.ok) {
        const data = await res.json();
        setWebsites(data);
      }
    } catch (error) { toast.error("Failed to fetch websites"); }
    setLoading(false);
  };

  const parsePlugins = (jsonString) => {
    try {
      if (!jsonString) return [];
      if (!jsonString.startsWith("[")) return [{ name: jsonString, version: "-" }];
      return JSON.parse(jsonString);
    } catch (e) { return []; }
  };

  const getStatus = (logs) => {
    if (!logs || logs.length === 0) {
        return { label: "Pending", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
    }
    const lastCheck = new Date(logs[0].checkDate);
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return lastCheck >= monday 
      ? { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" }
      : { label: "Maintenance Due", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    const promise = fetch(`/api/websites?id=${id}`, { method: "DELETE" });
    toast.promise(promise, { loading: 'Deleting...', success: 'Deleted successfully', error: 'Failed to delete' });
    await promise;
    fetchWebsites();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (site) => {
    setIsEditing(true);
    setEditingId(site.id);
    const latest = site.logs?.[0] || {};
    
    setFormData({
      name: site.name,
      url: site.url,
      server: site.server,
      wordpressVersion: latest.wordpressVersion || "",
      phpVersion: latest.phpVersion || "",
      dbVersion: latest.dbVersion || "",
      theme: latest.theme || "",
      note: latest.note || "",
      plugins: parsePlugins(latest.plugins)
    });
    setIsAddModalOpen(true);
  };

  const handleSaveWebsite = async () => {
    if(!formData.name || !formData.url) return toast.error("Please fill Name and URL");
    
    try {
      if (isEditing) {
        const payload = { id: editingId, name: formData.name, url: formData.url, server: formData.server };
        const res = await fetch("/api/websites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if(res.ok) {
            toast.success("Website updated successfully!");
            setIsAddModalOpen(false);
            resetForm();
            fetchWebsites();
        } else { toast.error("Failed to update website"); }

      } else {
        const payload = { ...formData, plugins: JSON.stringify(formData.plugins) };
        const res = await fetch("/api/websites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if(res.ok) {
            toast.success("Website added successfully!");
            setIsAddModalOpen(false);
            resetForm();
            fetchWebsites();
        } else { toast.error("Failed to add website"); }
      }
    } catch(err) { toast.error("Something went wrong"); }
  };

  const handleSaveLog = async () => {
    try {
        const payload = { ...formData, websiteId: selectedWebsite.id, plugins: JSON.stringify(formData.plugins) };
        const res = await fetch("/api/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if(res.ok) {
            toast.success("Maintenance log saved!");
            setIsLogModalOpen(false);
            fetchWebsites();
        } else { toast.error("Failed to save log"); }
    } catch(err) { toast.error("Something went wrong"); }
  };

  const openLogModal = (site) => {
    setSelectedWebsite(site);
    const latest = site.logs?.[0] || {};
    setFormData({
      server: site.server,
      wordpressVersion: latest.wordpressVersion || "",
      phpVersion: latest.phpVersion || "",
      dbVersion: latest.dbVersion || "",
      theme: latest.theme || "",
      plugins: parsePlugins(latest.plugins),
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
    setFormData({ name: "", url: "", server: "", wordpressVersion: "", phpVersion: "", dbVersion: "", theme: "", note: "", plugins: [] });
  };

  const groupedWebsites = websites.reduce((groups, site) => {
    const lowerSearch = searchTerm.toLowerCase();
    const match = site.name.toLowerCase().includes(lowerSearch) || 
                  site.url.toLowerCase().includes(lowerSearch) ||
                  site.server.toLowerCase().includes(lowerSearch);

    if (!match) return groups;

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
      
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
              <Icons.WordPress className="w-8 h-8 text-blue-600" /> 
              WordPress Maintenance
            </h1>
            <p className="text-gray-500 mt-1">Manage, monitor, and update your WordPress portfolio.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Search sites..." 
                    className="border border-gray-200 bg-white rounded-xl pl-10 pr-4 py-2.5 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={openAddModal} 
                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl shadow-md font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
             >
                <span className="text-lg leading-none">+</span> New Site
             </button>
          </div>
        </div>

        {pendingSites > 0 && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm flex items-start gap-4 animate-spring-up">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg"><Icons.AlertTriangle className="w-5 h-5" /></div>
            <div>
              <h3 className="text-red-900 font-bold text-sm uppercase tracking-wide">Attention Needed</h3>
              <p className="text-red-700 text-sm mt-1">
                <strong className="font-bold underline decoration-2">{pendingSites} website(s)</strong> require maintenance this week.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Websites" value={totalSites} icon={<Icons.Globe className="w-6 h-6" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Completed This Week" value={completedSites} icon={<Icons.CheckCircle className="w-6 h-6" />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Maintenance Due" value={pendingSites} icon={<Icons.AlertTriangle className="w-6 h-6" />} color="text-red-600" bg="bg-red-50" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            Loading dashboard...
        </div>
      ) : Object.keys(groupedWebsites).length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Icons.Globe className="w-8 h-8" /></div>
          <p className="text-gray-500 text-base">No websites found.</p>
          {searchTerm === "" && <button onClick={openAddModal} className="text-blue-600 font-semibold hover:underline mt-2 text-sm">Create your first website</button>}
        </div>
      ) : (
        Object.entries(groupedWebsites).map(([serverName, sites]) => (
          <div key={serverName} className="mb-10 animate-spring-up">
            <div className="flex items-center gap-3 mb-4 pl-1">
              <div className="h-5 w-1 bg-blue-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Icons.Server className="w-4 h-4 text-gray-400" /> {serverName}
              </h2>
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">{sites.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sites.map((site) => {
                const status = getStatus(site.logs);
                const log = site.logs?.[0] || {};
                const isNew = new Date(log.checkDate).getFullYear() < 2000;

                return (
                  <div key={site.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-white">
                      <div className="overflow-hidden pr-2">
                        <h3 className="font-bold text-gray-900 text-base truncate flex items-center gap-2" title={site.name}>
                            <Icons.WordPress className="w-4 h-4 text-blue-500" />
                            {site.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <UptimeBadge url={site.url} />
                            <a 
                              href={formatUrl(site.url)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs text-gray-400 hover:text-blue-600 hover:underline block truncate transition-colors font-medium"
                            >
                              {site.url}
                            </a>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${status.color} border-opacity-50`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shadow-sm`}></span>
                        {status.label}
                      </div>
                    </div>

                    {/* Stats Body */}
                    <div className="p-5 flex-1 bg-white">
                      <div className="flex divide-x divide-gray-100 text-center">
                        <div className="flex-1 px-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">WP Ver.</p>
                            <p className="text-sm font-semibold text-gray-700">{log.wordpressVersion || "-"}</p>
                        </div>
                        <div className="flex-1 px-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">PHP</p>
                            <p className="text-sm font-semibold text-gray-700">{log.phpVersion || "-"}</p>
                        </div>
                        <div className="flex-1 px-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">DB</p>
                            <p className="text-sm font-semibold text-gray-700">{log.dbVersion || "-"}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                         <span className="text-gray-400 flex items-center gap-1"><Icons.Clock className="w-3 h-3" /> Last check:</span>
                         <span className={`font-medium ${isNew ? 'text-gray-300' : 'text-gray-600'}`}>
                            {log.checkDate && !isNew ? new Date(log.checkDate).toLocaleDateString() : "Never"}
                         </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <button onClick={() => openDetailModal(site)} className="text-gray-500 hover:text-gray-800 text-xs font-bold uppercase px-2 py-1 rounded hover:bg-gray-100 transition-colors">Details</button>
                      
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(site)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Edit">
                          <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(site.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Delete">
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <button 
                          onClick={() => openLogModal(site)} 
                          className={`ml-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                            status.label === "Completed" 
                              ? "bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                              : "bg-gray-900 border border-transparent text-white hover:bg-black shadow-md"
                          }`}
                        >
                          <Icons.Wrench className="w-3 h-3" />
                          <span>Fix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* --- Modals (Logic เหมือนเดิม แต่เปลี่ยน Design เล็กน้อย) --- */}
      {isAddModalOpen && (
        <Modal title={isEditing ? "Edit Website" : "Add New Website"} onClose={() => setIsAddModalOpen(false)}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <Input label="Website Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="My Awesome Site" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="URL" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://example.com" />
                <Input label="Server Name" value={formData.server} onChange={(e) => setFormData({...formData, server: e.target.value})} placeholder="e.g. AWS-01" />
              </div>
            </div>
            
            {!isEditing && (
              <div className="border-t border-gray-100 pt-5 animate-fadeIn">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Server className="w-4 h-4" /> Initial System Info</p>
                <div className="grid grid-cols-2 gap-5">
                  <Input label="WordPress Ver." value={formData.wordpressVersion} onChange={(e) => setFormData({...formData, wordpressVersion: e.target.value})} />
                  <Input label="PHP Ver." value={formData.phpVersion} onChange={(e) => setFormData({...formData, phpVersion: e.target.value})} />
                  <Input label="Database Ver." value={formData.dbVersion} onChange={(e) => setFormData({...formData, dbVersion: e.target.value})} />
                  <Input label="Theme Name" value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
                </div>
                <div className="mt-5"><PluginManager plugins={formData.plugins} setPlugins={(newPlugins) => setFormData({ ...formData, plugins: newPlugins })} /></div>
                <div className="mt-5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Initial Note</label>
                  <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm resize-none" rows="2" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition active:scale-95 text-sm">Cancel</button>
              <button onClick={handleSaveWebsite} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg font-semibold transition active:scale-95 text-sm">
                {isEditing ? "Update Website" : "Save Website"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isLogModalOpen && (
        <Modal title={`Perform Maintenance`} subtitle={selectedWebsite?.name} onClose={() => setIsLogModalOpen(false)}>
           <div className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-xl flex items-start gap-3">
                <span className="text-xl mt-0.5"><Icons.Wrench className="w-5 h-5" /></span> 
                <div className="mt-0.5">You are in <strong>Maintenance Mode</strong>. Update system versions and plugins below to mark this week as completed.</div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Input label="WordPress Ver." value={formData.wordpressVersion} onChange={(e) => setFormData({...formData, wordpressVersion: e.target.value})} />
                <Input label="PHP Ver." value={formData.phpVersion} onChange={(e) => setFormData({...formData, phpVersion: e.target.value})} />
                <Input label="Database Ver." value={formData.dbVersion} onChange={(e) => setFormData({...formData, dbVersion: e.target.value})} />
                <Input label="Theme Name" value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
              </div>
              <div className="mt-2"><PluginManager plugins={formData.plugins} setPlugins={(newPlugins) => setFormData({ ...formData, plugins: newPlugins })} /></div>
              <div className="mt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Maintenance Note</label>
                <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm resize-none" rows="3" placeholder="Describe tasks..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setIsLogModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition active:scale-95 text-sm">Cancel</button>
                <button onClick={handleSaveLog} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-emerald-500/30 font-semibold transition active:scale-95 flex items-center gap-2 text-sm"><span>Complete</span> <Icons.CheckCircle className="w-4 h-4" /></button>
              </div>
           </div>
        </Modal>
      )}

      {isDetailModalOpen && (
        <Modal title={`Website Details`} subtitle={selectedWebsite?.name} onClose={() => setIsDetailModalOpen(false)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <DetailItem label="Server" value={selectedWebsite?.server} />
              <DetailItem label="URL" value={selectedWebsite?.url} isLink />
              <DetailItem label="Theme" value={selectedLog?.theme} />
              <DetailItem label="WordPress" value={selectedLog?.wordpressVersion} />
              <DetailItem label="PHP" value={selectedLog?.phpVersion} />
              <DetailItem label="Database" value={selectedLog?.dbVersion} />
              <DetailItem label="Last Check" value={selectedLog?.checkDate ? new Date(selectedLog.checkDate).toLocaleString() : "-"} />
              <DetailItem label="Updated By" value={selectedLog?.actionBy || "-"} />
            </div>
            
            {selectedLog?.note && (
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm">
                <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2 tracking-wide flex items-center gap-1"><Icons.Edit className="w-3 h-3" /> Maintenance Note</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedLog.note}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2"><Icons.Code className="w-4 h-4 text-gray-400" /> Installed Plugins</h4>
              <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 text-sm max-h-60 overflow-y-auto custom-scrollbar">
                {(() => {
                    const plugins = parsePlugins(selectedLog?.plugins);
                    if (plugins.length === 0) return <p className="text-gray-400 text-center py-8">No plugins listed.</p>;
                    return (
                        <div className="divide-y divide-gray-200">
                            {plugins.map((p, i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-3 hover:bg-white transition-colors">
                                    <span className="font-semibold text-gray-700">{p.name}</span> 
                                    <span className="text-gray-500 text-xs bg-white border border-gray-200 px-2 py-1 rounded-md font-mono">v{p.version}</span>
                                </div>
                            ))}
                        </div>
                    );
                })()}
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition active:scale-95 text-sm">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

// ... Helper Components ...
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
      {isLink ? <a href={formatUrl(value)} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold break-all transition-colors">{value}</a> : <span className="text-gray-800 font-medium group-hover:text-gray-900 transition-colors">{value || "-"}</span>}
    </div>
  );
}

function UptimeBadge({ url }) {
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/uptime?url=${encodeURIComponent(formatUrl(url))}`);
        const data = await res.json();
        setStatus(data.status === "up" ? "up" : "down");
      } catch { setStatus("down"); }
    };
    check();
  }, [url]);

  if (status === "loading") return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 animate-pulse" title="Checking..."></span>;
  if (status === "up") return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="Online"></span>;
  return <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Offline"></span>;
}