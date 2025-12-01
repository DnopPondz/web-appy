import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar />

        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-2">
            This page contains summary data and system reports.
          </p>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white shadow-md border rounded-xl p-6">
              <h2 className="font-semibold text-lg">Monthly Report</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Overview of this month's activities.
              </p>
            </div>

            <div className="bg-white shadow-md border rounded-xl p-6">
              <h2 className="font-semibold text-lg">User Statistics</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Summary of user login and activity.
              </p>
            </div>

            <div className="bg-white shadow-md border rounded-xl p-6">
              <h2 className="font-semibold text-lg">System Logs</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Recent system logs and status.
              </p>
            </div>
          </div>

          {/* Placeholder for more content */}
          <div className="mt-10 bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
            <p className="text-gray-600 mt-2">
              Coming soon — charts, tables, metrics, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
