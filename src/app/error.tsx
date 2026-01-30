"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          We hit an unexpected error. You can try again or return to the dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full rounded-2xl bg-primary px-5 py-3 text-white font-black hover:bg-primary-dark transition-all"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="w-full rounded-2xl border-2 border-gray-200 text-gray-700 px-5 py-3 font-black hover:border-primary hover:text-primary transition-all dark:border-slate-800 dark:text-gray-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
