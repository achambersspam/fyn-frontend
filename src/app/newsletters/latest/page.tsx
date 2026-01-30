"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Mail } from "lucide-react";
import { api } from "@/lib/api";
import type { LatestNewsletter } from "@/lib/apiContracts";

export default function LatestNewsletterPage() {
  const router = useRouter();
  const [latest, setLatest] = useState<LatestNewsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    api
      .get<LatestNewsletter>("/newsletters/latest")
      .then((data) => setLatest(data ?? null))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load your newsletter.";
        setError(message);
        setLatest(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-slate-900"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">My Newsletter</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {isLoading && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading your latest newsletter...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && !latest && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Your latest newsletter will appear here once it is available.
          </div>
        )}

        {latest && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Mail size={22} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    {latest.title ?? "Your Latest Newsletter"}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold dark:text-gray-400 mt-1">
                    <Clock size={12} />
                    <span>
                      {latest.deliveredAt
                        ? new Date(latest.deliveredAt).toLocaleString()
                        : "Delivered by your backend"}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                Most Recent
              </span>
            </div>

            {latest.summary && (
              <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-slate-800 dark:text-gray-300">
                {latest.summary}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 p-5 text-sm text-gray-700 leading-relaxed dark:border-slate-800 dark:text-gray-200 whitespace-pre-line">
              {latest.body ?? "Newsletter content will render here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
