import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AppLayout from "../components/AppLayout";
import prisma from "@/lib/prisma";

// --- CSS Animation (Fade Up เหมือน Dashboard) ---
const styles = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;

// ฟังก์ชันดึงข้อมูล Log
async function getLogs() {
  const logs = await prisma.loginLog.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    take: 100, // เพิ่มจำนวนที่แสดงเป็น 100 รายการ
  });
  return logs;
}

// ฟังก์ชันสร้าง Avatar จากชื่อ (แสดงตัวอักษรแรก)
function UserAvatar({ name }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const colors = [
    "bg-red-100 text-red-600", "bg-blue-100 text-blue-600", 
    "bg-green-100 text-green-600", "bg-yellow-100 text-yellow-600", 
    "bg-purple-100 text-purple-600", "bg-indigo-100 text-indigo-600"
  ];
  // สุ่มสีตามตัวอักษรแรกเพื่อให้เหมือนเดิมตลอดสำหรับชื่อเดิม
  const colorIndex = initial.charCodeAt(0) % colors.length;
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${colors[colorIndex]} shadow-sm`}>
      {initial}
    </div>
  );
}

export default async function LogsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const logs = await getLogs();

  return (
    <AppLayout>
      <style>{styles}</style>
      
      <div className="max-w-6xl mx-auto animate-fade-up">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              📜 Login Activity
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor user access and authentication history.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 shadow-sm">
                Total Logs: <span className="font-bold text-gray-900">{logs.length}</span>
             </div>
          </div>
        </div>

        {/* Log Table Card */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl mb-2">📭</span>
                        <p className="text-sm">No login records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                      
                      {/* Name Column with Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={log.name} />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                              {log.name || "Unknown User"}
                            </span>
                            {/* Show email here on mobile only */}
                            <span className="text-xs text-gray-400 sm:hidden">{log.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email Column (Hidden on mobile) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {log.email}
                      </td>

                      {/* Timestamp Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status Column (Mockup for now as 'Success') */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Success
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer of Table */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
             <span>Showing latest {logs.length} records</span>
             <span>Real-time Sync</span>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}