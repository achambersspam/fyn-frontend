"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, Trophy, Flame, Check } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Achievement } from "@/lib/apiContracts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BADGE_THRESHOLDS = [
  2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140,
];

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
  const badgeSlots =
    data?.badges && data.badges.length > 0
      ? data.badges
      : BADGE_THRESHOLDS.map((threshold) => ({
          id: `streak_${threshold}`,
          threshold_days: threshold,
          label: `${threshold}d`,
          unlocked: (data?.unlocked_badges || []).includes(`streak_${threshold}`),
          asset_url: null,
          locked_asset_url: null,
        }));

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
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse dark:bg-slate-900 dark:border-slate-800" />
            <div className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse dark:bg-slate-900 dark:border-slate-800" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-5 text-center font-semibold bg-red-600 text-white">
            {error}
          </div>
        )}

        {!isLoading && data && (
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

            <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <h3 className="font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                Pigeon Badges
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {badgeSlots.map((badge) => {
                  const unlocked = badge.unlocked;
                  const iconUrl = unlocked ? badge.asset_url : badge.locked_asset_url;
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        unlocked
                          ? "border-sky-300 bg-sky-50 shadow-sm dark:border-sky-700 dark:bg-sky-950/30"
                          : "border-gray-200 bg-gray-100 opacity-60 blur-[0.4px] dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-center">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={badge.label}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <div className="text-lg">{unlocked ? "🏅" : "🔒"}</div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {badge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
