import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Components
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex">
      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        <TopNavbar />

        {/* Page Content */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}!
          </p>
        </div>
      </div>
    </div>
  );
}
