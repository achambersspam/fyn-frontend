"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Trophy, Clock, Pause, Play } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Newsletter, Achievement, NewsletterIssue } from "@/lib/apiContracts";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [achievements, setAchievements] = useState<Achievement | null>(null);
  const [latestIssueByNewsletter, setLatestIssueByNewsletter] = useState<
    Record<string, NewsletterIssue | null>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingPause, setTogglingPause] = useState<string | null>(null);

  useEffect(() => {
    async function initDashboard() {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push("/auth");
        setIsLoading(false);
        return;
      }

      Promise.all([api.get<Newsletter[]>("/api/newsletters"), api.get<Achievement>("/api/achievements").catch(() => null)])
        .then(async ([nls, ach]) => {
          const safeNewsletters = Array.isArray(nls) ? nls : [];
          setNewsletters(safeNewsletters);
          setAchievements(ach);

          const issueEntries = await Promise.all(
            safeNewsletters.map(async (nl) => {
              try {
                const issue = await api.get<NewsletterIssue>(`/api/newsletters/${nl.id}/latest`);
                return [nl.id, issue] as const;
              } catch {
                return [nl.id, null] as const;
              }
            })
          );
          setLatestIssueByNewsletter(Object.fromEntries(issueEntries));
        })
        .catch((err) => {
          const message =
            err && typeof err === "object" && "message" in err
              ? (err as { message: string }).message
              : "Unable to load dashboard.";
          setError(message);
        })
        .finally(() => setIsLoading(false));
    }

    initDashboard();
  }, [router, supabase]);

  const togglePause = async (nl: Newsletter) => {
    setTogglingPause(nl.id);
    try {
      await api.patch(`/api/newsletters/${nl.id}/pause`);
      setNewsletters((prev) =>
        prev.map((n) => (n.id === nl.id ? { ...n, paused: !n.paused } : n))
      );
    } catch {
      /* silent */
    } finally {
      setTogglingPause(null);
    }
  };

  const primary = newsletters[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm font-medium dark:text-gray-400">
            Your personalized feed is ready.
          </p>
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

        {!isLoading && !primary && !error && (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              No newsletters yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first personalized newsletter to get started.
            </p>
            <Link href="/setup">
              <button className="btn-primary">Create Newsletter</button>
            </Link>
          </div>
        )}

        {primary && (
          <>
            {primary.paused && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                Your newsletter is currently paused. Resume to continue
                receiving deliveries.
              </div>
            )}

            <div className="space-y-3">
              {newsletters.map((nl) => {
                const latest = latestIssueByNewsletter[nl.id] || null;
                const isPreparing = !latest || latest.generation_status === "queued";
                const isFailed = latest?.generation_status === "failed";
                const isReady =
                  latest?.generation_status === "generated" ||
                  latest?.generation_status === "sent";
                return (
                  <div
                    key={nl.id}
                    className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {nl.title || "Newsletter"}
                        </p>
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                          {isReady
                            ? "Read Your Newsletter"
                            : isFailed
                            ? "Issue generation failed"
                            : "Your newsletter is being prepared"}
                        </h2>
                      </div>
                      <Link
                        href={`/newsletter/${nl.id}`}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </div>

                    {isReady ? (
                      <Link href={`/newsletter/${nl.id}/read`}>
                        <button className="w-full btn-primary text-base">
                          Read Your Newsletter
                        </button>
                      </Link>
                    ) : isFailed ? (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                        We hit a generation error. Your next scheduled run will retry automatically.
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-sky-600 dark:text-sky-300">
                        Preparing your latest issue now...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next Send / Pause */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Next Delivery
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {primary.paused
                        ? "Paused"
                        : primary.next_send_at_utc
                          ? new Date(primary.next_send_at_utc).toLocaleString()
                          : "Calculating..."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => togglePause(primary)}
                  disabled={togglingPause === primary.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    primary.paused
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {primary.paused ? (
                    <>
                      <Play size={16} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={16} /> Pause
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Achievements summary */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center dark:bg-amber-900/30">
                    <Trophy size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {achievements
                        ? `${achievements.current_streak}-day streak`
                        : "Start your streak!"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {achievements
                        ? `${achievements.total_reads} total reads`
                        : "Read your first newsletter to begin"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/achievements"
                  className="text-primary font-bold text-sm hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
