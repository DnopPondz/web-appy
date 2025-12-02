"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full">
        <div className="text-5xl mb-4">💥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 mb-6 text-sm">
          An unexpected error occurred. Please try again or contact support.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-md"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}