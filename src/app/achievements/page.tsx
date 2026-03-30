"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, Trophy, Flame, Check } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Achievement } from "@/lib/apiContracts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AchievementsPage() {
  const router = useRouter();
  const [data, setData] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Achievement>("/api/achievements")
      .then((d) => setData(d))
      .catch((err) => {
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load achievements.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Achievements
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {isLoading && (
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading achievements...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Streak Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center dark:bg-amber-900/30">
                  <Flame size={32} className="text-amber-500" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100">
                {data.current_streak}
              </h2>
              <p className="text-gray-500 font-semibold dark:text-gray-400">
                Day Streak
              </p>
            </div>

            {/* 7-Day Progress */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <h3 className="font-black text-gray-900 dark:text-gray-100">
                Last 7 Days
              </h3>
              <div className="flex justify-between">
                {data.last_7_days.map((read, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        read
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500"
                      }`}
                    >
                      {read ? <Check size={18} /> : "—"}
                    </div>
                    <span className="text-xs text-gray-500 font-semibold dark:text-gray-400">
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200 text-center dark:bg-slate-900 dark:border-slate-800">
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {data.longest_streak}
                </p>
                <p className="text-sm text-gray-500 font-semibold dark:text-gray-400">
                  Longest Streak
                </p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-gray-200 text-center dark:bg-slate-900 dark:border-slate-800">
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {data.total_reads}
                </p>
                <p className="text-sm text-gray-500 font-semibold dark:text-gray-400">
                  Total Reads
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
