import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopNavbar />

        <div className="p-8">
          <h1 className="text-2xl font-semibold">Profile</h1>

          <div className="mt-4 bg-white border rounded-lg p-6 shadow-sm">
            <p><strong>Name:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
