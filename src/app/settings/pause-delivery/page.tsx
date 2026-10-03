"use client";

import Link from "next/link";
import { ERROR_BOX_CLASS } from "@/lib/errorBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ChooseActiveNewslettersModal from "@/components/ChooseActiveNewslettersModal";
import Spinner from "@/components/Spinner";
import Tooltip, { TooltipWithAria } from "@/components/Tooltip";
import { ChevronLeft, Clock, Pause, Play } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import { TIER_LIMITS, type Newsletter, type Profile } from "@/lib/apiContracts";
import { errorMessage } from "@/lib/errorMessage";
import { newsletterName, orderNewsletters } from "@/lib/newsletterNames";
import { getCurrentSession } from "@/lib/supabase";

export default function PauseDeliveryPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingPause, setTogglingPause] = useState<string | null>(null);
  const [showChooseActive, setShowChooseActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const session = await getCurrentSession({ retries: 2, retryDelayMs: 180 });
      if (!session?.access_token) {
        router.replace("/auth");
        return;
      }
      try {
        const [list, prof] = await Promise.all([
          api.get<Newsletter[]>("/api/newsletters"),
          api.get<Profile>("/api/me").catch(() => null),
        ]);
        if (cancelled) return;
        setNewsletters(Array.isArray(list) ? list : []);
        setProfile(prof);
      } catch (err) {
        if (cancelled) return;
        if ((err as ApiError)?.status === 401) {
          router.replace("/auth");
          return;
        }
        setError(errorMessage(err, "Unable to load your newsletters."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const togglePause = async (nl: Newsletter) => {
    if (nl.disabled) {
      setShowChooseActive(true);
      return;
    }
    setTogglingPause(nl.id);
    setError(null);
    const previousPaused = nl.paused;
    setNewsletters((prev) =>
      prev.map((n) => (n.id === nl.id ? { ...n, paused: !previousPaused } : n))
    );
    try {
      await api.patch(`/api/newsletters/${nl.id}/pause`);
    } catch (err) {
      setNewsletters((prev) =>
        prev.map((n) => (n.id === nl.id ? { ...n, paused: previousPaused } : n))
      );
      const apiErr = err as ApiError;
      if (apiErr?.code === "NEWSLETTER_ACTIVE_CAP") {
        setShowChooseActive(true);
        setError(errorMessage(apiErr));
      } else {
        setError("Couldn't update your newsletter. Please try again.");
      }
    } finally {
      setTogglingPause(null);
    }
  };

  const cap = TIER_LIMITS[profile?.tier ?? "basic"]?.maxNewsletters ?? 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <TooltipWithAria label="Back to Settings">
            <Link
              href="/settings"
              aria-label="Back to Settings"
              className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ChevronLeft size={24} />
            </Link>
          </TooltipWithAria>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            Pause Newsletter Delivery
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Pausing stops new issues until you resume. Your topics and settings are kept.
        </p>

        {error && (
          <div className={ERROR_BOX_CLASS}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size={20} />
          </div>
        )}

        {!isLoading && newsletters.length === 0 && !error && (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              No newsletters yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Create a newsletter first, then you can pause or resume it here.
            </p>
            <Link href="/setup">
              <Tooltip label="Start the setup wizard to build your personalized newsletter">
                <button className="btn-primary">Create Newsletter</button>
              </Tooltip>
            </Link>
          </div>
        )}

        {!isLoading &&
          orderNewsletters(newsletters).map((nl) => (
            <div
              key={nl.id}
              className={`bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4 ${
                nl.disabled ? "opacity-80" : ""
              }`}
            >
              <p className="text-base font-bold text-gray-900 truncate dark:text-gray-100">
                {newsletterName(nl.id, newsletters)}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Next Delivery
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {nl.disabled
                        ? "Disabled on this plan"
                        : nl.paused
                          ? "Paused"
                          : nl.next_send_at_utc
                            ? new Date(nl.next_send_at_utc).toLocaleString()
                            : "Calculating..."}
                    </p>
                  </div>
                </div>

                <Tooltip
                  label={
                    nl.disabled
                      ? "This newsletter is Disabled on your current plan"
                      : nl.paused
                        ? "Resume scheduled delivery of this newsletter"
                        : "Pause delivery — no new issues until you resume"
                  }
                >
                  <button
                    onClick={() => void togglePause(nl)}
                    disabled={togglingPause === nl.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shrink-0 ${
                      nl.paused && !nl.disabled
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {nl.disabled ? (
                      "Choose enabled"
                    ) : nl.paused ? (
                      <>
                        <Play size={16} /> Resume
                      </>
                    ) : (
                      <>
                        <Pause size={16} /> Pause
                      </>
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
      </div>

      <ChooseActiveNewslettersModal
        open={showChooseActive}
        newsletters={newsletters}
        cap={cap}
        onClose={() => setShowChooseActive(false)}
        onSaved={setNewsletters}
      />

      <BottomNav />
    </div>
  );
}
