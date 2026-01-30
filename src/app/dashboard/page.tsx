"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Mail, Clock, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/apiContracts";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    api
      .get<DashboardData>("/dashboard")
      .then((payload) => setData(payload ?? {}))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load dashboard data.";
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {data.userName ? `Hello, ${data.userName}!` : "Hello!"}
            </h1>
            <p className="text-gray-500 text-sm font-medium dark:text-gray-400">
              {data.subtitle ?? "Your personalized feed is ready."}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {isLoading && (
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading dashboard...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-1">
                  {data.newsletterTitle ?? "Today's Newsletter"}
                </h2>
                <div className="flex items-center gap-3 text-white/90 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {data.newsletterUpdates ?? "Latest updates"}
                  </span>
                  <span>•</span>
                  <span>{data.newsletterReadTime ?? "3 min read"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/newsletters/latest"
            className="w-full bg-white text-primary py-3 rounded-2xl font-black text-base hover:bg-gray-50 transform hover:scale-105 active:scale-95 transition-all shadow-lg dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 text-center"
          >
            Read Newsletter →
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm dark:bg-slate-900">
              <TrendingUp className="text-gray-700 dark:text-gray-300" size={20} />
            </div>
            <h3 className="font-black text-gray-900 text-xl dark:text-gray-100">Markets</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800">
            <h4 className="font-black text-gray-900 text-base mb-2 dark:text-gray-100">
              {data.marketTitle ?? "Market highlights"}
            </h4>
            <p className="text-gray-600 text-sm font-medium mb-3 leading-relaxed dark:text-gray-300">
              {data.marketSummary ?? "Summary from your backend feed."}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold dark:text-gray-400">
                {data.marketTimestamp ?? "Updated recently"}
              </span>
              <button className="text-primary font-bold text-sm hover:underline">
                Read more →
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
