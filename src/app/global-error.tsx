"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => {
        /* Sentry is optional */
      });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 px-6 py-16 antialiased dark:bg-slate-950">
        <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            We hit an unexpected error. You can try again or return home.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-2xl bg-[#1CB0F6] px-5 py-3 font-black text-white"
            >
              Try again
            </button>
            <a
              href="/"
              className="w-full rounded-2xl border-2 border-gray-200 px-5 py-3 font-black text-gray-700 dark:border-slate-800 dark:text-gray-200"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
