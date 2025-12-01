"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleLogin = () => {
    setLoading(true);
    signIn("azure-ad");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-sm p-10 animate-fadeIn">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Use your Microsoft Azure Account
          </p>
        </div>

        {/* Button / Loading */}
        {!loading ? (
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Sign In with Microsoft
          </button>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4 text-sm">Redirecting...</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-10">
          © {new Date().getFullYear()} Movaci.
        </p>
      </div>
    </div>
  );
}
