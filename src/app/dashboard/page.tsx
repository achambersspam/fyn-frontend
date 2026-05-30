"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Trophy, Clock, Pause, Play } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type {
  Newsletter,
  Achievement,
  NewsletterIssue,
  Profile,
} from "@/lib/apiContracts";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function formatDeliveryTime(deliveryTime: string): string {
  const [hStr = "09", mStr = "00"] = deliveryTime.split(":");
  const hour = Number.parseInt(hStr, 10);
  const minute = Number.parseInt(mStr, 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return deliveryTime;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

function ordinalDay(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  const mod10 = day % 10;
  if (mod10 === 1) return `${day}st`;
  if (mod10 === 2) return `${day}nd`;
  if (mod10 === 3) return `${day}rd`;
  return `${day}th`;
}

function buildScheduleMessage(newsletter: Newsletter): string {
  const atTime = formatDeliveryTime(newsletter.delivery_time || "09:00");
  const weekday = WEEKDAY_LABELS[newsletter.schedule_weekday ?? 1] || "Monday";
  const monthlyDay = newsletter.monthly_day_of_month ?? 1;

  switch (newsletter.frequency) {
    case "Weekly":
      return `Your newsletter will arrive every ${weekday} at ${atTime}`;
    case "Bi-Weekly":
      return `Your newsletter will arrive every other ${weekday} at ${atTime}`;
    case "Monthly":
      return `Your newsletter will arrive on the ${ordinalDay(monthlyDay)} of each month at ${atTime}`;
    case "Mon/Wed/Fri":
      return `Your newsletter will arrive every Monday, Wednesday, and Friday at ${atTime}`;
    case "Daily":
    default:
      return `Your newsletter will arrive every day at ${atTime}`;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [achievements, setAchievements] = useState<Achievement | null>(null);
  const [latestIssueByNewsletter, setLatestIssueByNewsletter] = useState<
    Record<string, NewsletterIssue | null>
  >({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingPause, setTogglingPause] = useState<string | null>(null);
  const [isResubscribing, setIsResubscribing] = useState(false);
  const showFirstIssueLimitNotice = searchParams.get("firstIssueLimitHit") === "1";

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

      Promise.all([
        api.get<Newsletter[]>("/api/newsletters"),
        api.get<Achievement>("/api/achievements").catch(() => null),
        api.get<Profile>("/api/me").catch(() => null),
      ])
        .then(async ([nls, ach, prof]) => {
          const safeNewsletters = Array.isArray(nls) ? nls : [];
          setNewsletters(safeNewsletters);
          setAchievements(ach);
          setProfile(prof);
          if (safeNewsletters.length === 0) {
            setLatestIssueByNewsletter({});
            return;
          }
          const idList = safeNewsletters.map((nl) => nl.id).join(",");
          try {
            const latestMap = await api.get<Record<string, NewsletterIssue | null>>(
              `/api/newsletters/latest-batch?ids=${encodeURIComponent(idList)}`
            );
            setLatestIssueByNewsletter(latestMap || {});
          } catch {
            const issueEntries = await Promise.all(
              safeNewsletters.map(async (nl) => {
                try {
                  const issue = await api.get<NewsletterIssue>(
                    `/api/newsletters/${nl.id}/latest?status_only=1`
                  );
                  return [nl.id, issue] as const;
                } catch {
                  return [nl.id, null] as const;
                }
              })
            );
            setLatestIssueByNewsletter(Object.fromEntries(issueEntries));
          }
        })
        .catch((err) => {
          const apiErr = err as ApiError;
          if (apiErr?.status === 401) {
            router.replace("/auth");
            return;
          }
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

  useEffect(() => {
    void router.prefetch("/settings");
    void router.prefetch("/newsletter");
    void router.prefetch("/settings/feedback");
    void router.prefetch("/achievements");
  }, [router]);

  useEffect(() => {
    newsletters.forEach((nl) => {
      void router.prefetch(`/newsletter/${nl.id}`);
      void router.prefetch(`/newsletter/${nl.id}/read`);
    });
  }, [newsletters, router]);

  useEffect(() => {
    if (!isLoading) {
      void trackEvent("dashboard_loaded", {
        newsletter_count: newsletters.length,
      });
    }
  }, [isLoading, newsletters.length]);

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

  const handleResubscribe = async () => {
    setIsResubscribing(true);
    void trackEvent("resubscribe_clicked", { source: "dashboard" });
    try {
      const updated = await api.patch<Profile>("/api/me", { is_unsubscribed: false });
      setProfile(updated);
      void trackEvent("resubscribe_succeeded", { source: "dashboard" });
    } catch {
      setError("Unable to reactivate newsletter right now. Please try again.");
    } finally {
      setIsResubscribing(false);
    }
  };

  const primary = newsletters[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-3 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-300">
              <span className="h-4 w-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/90 bg-red-500/10 px-5 py-4 text-center font-semibold text-white">
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

        {!isLoading && primary && (
          <>
            {showFirstIssueLimitNotice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                Your preferences are saved. You already generated a first issue today, so your next issue will arrive at your scheduled delivery time.
              </div>
            )}
            {primary.paused && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                Your newsletter is currently paused. Resume to continue
                receiving deliveries.
              </div>
            )}

            <div className="space-y-4">
              {newsletters.map((nl) => {
                const latest = latestIssueByNewsletter[nl.id] || null;
                const isGenerating = latest?.generation_status === "queued";
                const isFailed = latest?.generation_status === "failed";
                const isReady =
                  latest?.generation_status === "generated" ||
                  latest?.generation_status === "sent" ||
                  Boolean(latest?.delivered_at);
                return (
                  <div
                    key={nl.id}
                    className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 flex-1 text-base font-bold text-gray-900 truncate dark:text-gray-100">
                        {nl.title || "Newsletter"}
                      </p>
                      <Link
                        href={`/newsletter/${nl.id}`}
                        onClick={() =>
                          {
                            void trackEvent("newsletter_edit_clicked", {
                              source: "dashboard",
                              newsletter_id: nl.id,
                            });
                            void trackEvent("dashboard_navigation", {
                              destination: "newsletter_edit",
                              newsletter_id: nl.id,
                            });
                          }
                        }
                        className="shrink-0 text-sm font-bold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </div>

                    {isReady ? (
                      <Link
                        href={`/newsletter/${nl.id}/read`}
                        className="block pt-1"
                        onClick={() =>
                          {
                            void trackEvent("newsletter_read_in_dashboard", {
                              newsletter_id: nl.id,
                              source: "dashboard_card",
                            });
                            void trackEvent("dashboard_navigation", {
                              destination: "newsletter_read",
                              newsletter_id: nl.id,
                            });
                          }
                        }
                      >
                        <button className="w-full btn-primary text-base">
                          Read Your Newsletter
                        </button>
                      </Link>
                    ) : isFailed ? (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                        We hit a generation error. Your next scheduled run will retry automatically.
                      </p>
                    ) : isGenerating ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                        <span className="h-4 w-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
                        <span>Generating your latest issue...</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-sky-600 dark:text-sky-300">
                        {buildScheduleMessage(nl)}
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
                  onClick={() =>
                    void trackEvent("dashboard_navigation", {
                      destination: "achievements",
                    })
                  }
                  className="text-primary font-bold text-sm hover:underline"
                >
                  View All
                </Link>
              </div>
              {profile?.is_unsubscribed ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Your newsletter is unsubscribed. Click below to turn it back on.
                  </p>
                  <button
                    type="button"
                    onClick={handleResubscribe}
                    disabled={isResubscribing}
                    className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResubscribing ? "Turning back on..." : "Turn newsletter back on"}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
