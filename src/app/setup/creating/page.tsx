"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type ApiError } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/supabase";

const START_HEADER = "Your newsletter is being created!";
const DONE_HEADER =
  "Your personalized newsletter is written and ready for you to read!";
const firstIssueInFlightByNewsletter = new Set<string>();
const LOADING_MESSAGES = [
  "Generating your first newsletter",
  "Searching top news sources",
  "Pulling Data and News",
  "Summarizing Data and News",
  "Writing your newsletter",
  "Delivering to both your email and in app-dashboard",
  "Check your email or in app-dashboard!",
] as const;
const LOADING_MESSAGE_MIN_VISIBLE_MS = 1500;
const LOADING_MESSAGE_TRANSITION_MS = 460;

type GenerateResponse = {
  success: boolean;
  issue_id?: string;
  status?: string;
  duplicate?: boolean;
  daily_limit_hit?: boolean;
  skipped?: boolean;
  accepted?: boolean;
  processing?: boolean;
};

type LatestIssueResponse = {
  id: string;
  generation_status?: "queued" | "generated" | "sent" | "failed";
};

type LatestIssueStatus = "generated" | "sent" | "queued" | "failed" | "none";

const getLoadingMessageIndex = (
  progressPercent: number,
  isComplete: boolean,
  isRunning: boolean
): number => {
  if (isComplete) return LOADING_MESSAGES.length - 1;
  if (!isRunning) return 0;
  const bounded = Math.max(0, Math.min(99, progressPercent));
  const stageCountBeforeFinal = LOADING_MESSAGES.length - 1;
  return Math.min(
    stageCountBeforeFinal - 1,
    Math.floor((bounded / 100) * stageCountBeforeFinal)
  );
};

function RollingLoadingMessage({
  targetIndex,
}: {
  targetIndex: number;
}) {
  const clampMessageIndex = (value: number) =>
    Math.max(0, Math.min(LOADING_MESSAGES.length - 1, value));
  const [currentIndex, setCurrentIndex] = useState(() =>
    clampMessageIndex(targetIndex)
  );
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [animateTransition, setAnimateTransition] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingTargetRef = useRef<number>(clampMessageIndex(targetIndex));
  const lastSettledAtRef = useRef<number>(Date.now());

  useEffect(() => {
    const clampedTarget = clampMessageIndex(targetIndex);
    if (clampedTarget === currentIndex || incomingIndex !== null) {
      pendingTargetRef.current = clampedTarget;
      return;
    }
    pendingTargetRef.current = clampedTarget;
    const elapsedSinceSettle = Date.now() - lastSettledAtRef.current;
    const holdMs = Math.max(0, LOADING_MESSAGE_MIN_VISIBLE_MS - elapsedSinceSettle);
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = window.setTimeout(() => {
      const nextIndex = pendingTargetRef.current;
      if (nextIndex === currentIndex || incomingIndex !== null) return;
      setIncomingIndex(nextIndex);
      setAnimateTransition(false);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        setAnimateTransition(true);
      });
      transitionTimerRef.current = window.setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIncomingIndex(null);
        setAnimateTransition(false);
        lastSettledAtRef.current = Date.now();
      }, LOADING_MESSAGE_TRANSITION_MS);
    }, holdMs);
  }, [currentIndex, incomingIndex, targetIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <div className="flex min-h-[2rem] items-center justify-center overflow-hidden px-1">
        <div className="relative h-8 min-w-0 flex-1 overflow-hidden">
          <p
            className={`absolute inset-0 flex items-center justify-center text-center text-sm font-semibold text-sky-600 dark:text-sky-300 transition-all duration-[460ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
              incomingIndex !== null
                ? animateTransition
                  ? "translate-y-full rotate-[8deg] opacity-0"
                  : "translate-y-0 rotate-0 opacity-100"
                : "translate-y-0 rotate-0 opacity-100"
            }`}
            style={{ transformOrigin: "center top" }}
            aria-live="polite"
          >
            <span
              className="loading-message-shimmer"
              data-text={LOADING_MESSAGES[currentIndex]}
            >
              {LOADING_MESSAGES[currentIndex]}
            </span>
          </p>
          {incomingIndex !== null && (
            <p
              className={`absolute inset-0 flex items-center justify-center text-center text-sm font-semibold text-sky-600 dark:text-sky-300 transition-all duration-[460ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                animateTransition
                  ? "translate-y-0 rotate-0 opacity-100"
                  : "-translate-y-full -rotate-[8deg] opacity-0"
              }`}
              style={{ transformOrigin: "center bottom" }}
            >
              <span
                className="loading-message-shimmer"
                data-text={LOADING_MESSAGES[incomingIndex]}
              >
                {LOADING_MESSAGES[incomingIndex]}
              </span>
            </p>
          )}
        </div>
      </div>
      <style jsx>{`
        .loading-message-shimmer {
          position: relative;
          display: inline-block;
          color: inherit;
        }

        .loading-message-shimmer::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: transparent;
          background: linear-gradient(
            105deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.12) 38%,
            rgba(255, 255, 255, 0.88) 50%,
            rgba(255, 255, 255, 0.18) 62%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 220% 100%;
          background-position: 120% 0;
          -webkit-background-clip: text;
          background-clip: text;
          animation: loading-text-shimmer 2.2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes loading-text-shimmer {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }
      `}</style>
    </div>
  );
}

function CreatingNewsletterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get("newsletterId") || "";

  const [header, setHeader] = useState(START_HEADER);
  const [isComplete, setIsComplete] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [referralSaved, setReferralSaved] = useState(false);
  const [isSavingReferral, setIsSavingReferral] = useState(false);
  const [referralSource, setReferralSource] = useState("");
  const [referralOther, setReferralOther] = useState("");
  const [firstIssueDailyLimitHit, setFirstIssueDailyLimitHit] = useState(false);
  const [showDashboardButton, setShowDashboardButton] = useState(false);
  const inFlightRef = useRef(false);
  const generationAttemptedRef = useRef(false);
  const mountedRef = useRef(true);
  const firstQueuedSeenAtRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressStartRef.current = Date.now();
    setProgressPercent(8);
    progressTimerRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - progressStartRef.current;
      // Fallback profile: fast for first 6s, slower for second 6s, then gentle creep.
      let nextProgress = 8;
      if (elapsedMs <= 6000) {
        const phase = elapsedMs / 6000;
        nextProgress = 8 + phase * 62; // 8 -> 70
      } else if (elapsedMs <= 12000) {
        const phase = (elapsedMs - 6000) / 6000;
        nextProgress = 70 + phase * 24; // 70 -> 94
      } else {
        const extraMs = elapsedMs - 12000;
        nextProgress = 94 + (99 - 94) * (1 - Math.exp(-extraMs / 4500)); // creep to 99
      }
      setProgressPercent((prev) => Math.max(prev, Math.min(99, nextProgress)));
    }, 140);
  }, [stopProgressTimer]);

  const finishAsSuccess = useCallback(
    (nextHeader = DONE_HEADER, dailyLimitHit = false) => {
      setFirstIssueDailyLimitHit(dailyLimitHit);
      setHeader(nextHeader);
      setError(null);
      stopProgressTimer();
      setProgressPercent(100);
      setIsComplete(true);
      setIsRunning(false);
    },
    [stopProgressTimer]
  );

  const getLatestIssueStatus = useCallback(async (): Promise<LatestIssueStatus> => {
    if (!newsletterId) return "none";
    try {
      const latestIssue = await api.get<LatestIssueResponse>(
        `/api/newsletters/${newsletterId}/latest?status_only=1`,
        { timeoutMs: 8000 }
      );
      const status = latestIssue?.generation_status;
      if (status === "generated" || status === "sent") return status;
      if (status === "failed") return "failed";
      if (status === "queued") return "queued";
      return "none";
    } catch (error) {
      const apiErr = error as ApiError | null;
      if (apiErr?.status === 404 || apiErr?.code === "ISSUE_NOT_FOUND") {
        return "none";
      }
      throw error;
    }
  }, [newsletterId]);

  const pollForIssueReadiness = useCallback(
    async (maxWaitMs = 45000): Promise<LatestIssueStatus> => {
      if (!newsletterId) return "none";
      const startedAt = Date.now();
      while (Date.now() - startedAt < maxWaitMs) {
        try {
          const status = await getLatestIssueStatus();
          if (status === "generated" || status === "sent") {
            return status;
          }
          if (status === "failed") {
            return "failed";
          }
          if (status === "queued") {
            await new Promise((resolve) => window.setTimeout(resolve, 1200));
            continue;
          }
        } catch {
          await new Promise((resolve) => window.setTimeout(resolve, 1200));
          continue;
        }
      }
      return "queued";
    },
    [getLatestIssueStatus, newsletterId]
  );

  const runFirstIssue = useCallback(async () => {
    if (!newsletterId || inFlightRef.current) return;
    inFlightRef.current = true;
    generationAttemptedRef.current = true;
    firstIssueInFlightByNewsletter.add(newsletterId);
    setError(null);
    setHeader(START_HEADER);
    setIsComplete(false);
    setIsRunning(true);
    startProgressTimer();
    const startMs = performance.now();

    try {
      const session = await getCurrentSession({ retries: 2, retryDelayMs: 150 });
      if (!session?.access_token) {
        throw {
          status: 401,
          message: "Session is still loading. Please try again.",
          code: "SESSION_NOT_READY",
        } as ApiError;
      }
      const generationResult = await api.post<GenerateResponse>("/api/generate-newsletter", {
        newsletterId,
        mode: "first_issue",
      }, {
        sessionRetries: 2,
        sessionRetryDelayMs: 150,
        timeoutMs: 55000,
      });
      console.log("FIRST_ISSUE_GENERATION_ELAPSED_MS", Math.round(performance.now() - startMs));

      if (generationResult.daily_limit_hit) {
        finishAsSuccess("Your newsletter preferences are saved.", true);
        return;
      }

      if (generationResult.status === "generated" || generationResult.status === "sent") {
        finishAsSuccess(DONE_HEADER, false);
        return;
      }

      if (generationResult.status === "skipped_unsubscribed" || generationResult.skipped) {
        finishAsSuccess(
          "Your newsletter is currently unsubscribed. Turn it back on in Settings to generate again.",
          false
        );
        return;
      }

      if (generationResult.processing || generationResult.accepted || generationResult.duplicate) {
        setHeader("Still generating your first newsletter...");
        firstQueuedSeenAtRef.current = Date.now();
      }
      const polledStatus = await pollForIssueReadiness();
      if (polledStatus === "generated" || polledStatus === "sent") {
        finishAsSuccess(DONE_HEADER, false);
        return;
      }
      if (polledStatus === "queued") {
        setHeader("Still generating your first newsletter...");
        setError(null);
        setIsRunning(true);
        firstQueuedSeenAtRef.current = Date.now();
        return;
      }

      throw {
        message: "Generation failed. Please retry.",
        status: 500,
      } as ApiError;
    } catch (err: unknown) {
      const apiErr = err as ApiError | null;
      const fallbackStatus = await pollForIssueReadiness(4000);
      if (
        fallbackStatus === "generated" ||
        fallbackStatus === "sent"
      ) {
        finishAsSuccess(DONE_HEADER, false);
        return;
      }
      if (fallbackStatus === "queued") {
        setHeader("Still generating your first newsletter...");
        setError(null);
        setIsRunning(true);
        firstQueuedSeenAtRef.current = Date.now();
        return;
      }
      const msg =
        apiErr?.status === 401
          ? "Session not ready yet. Please retry in a moment."
          : apiErr?.status === 429
          ? "Generation is rate-limited temporarily. Please retry shortly."
          : apiErr?.message || "Failed to generate your first newsletter issue.";
      console.log("FIRST_ISSUE_GENERATION_ELAPSED_MS", Math.round(performance.now() - startMs));
      setError(msg);
      setIsRunning(false);
      stopProgressTimer();
      setProgressPercent(0);
    } finally {
      inFlightRef.current = false;
      firstIssueInFlightByNewsletter.delete(newsletterId);
    }
  }, [
    finishAsSuccess,
    newsletterId,
    pollForIssueReadiness,
    startProgressTimer,
    stopProgressTimer,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (!newsletterId) {
      setError("Missing newsletter id. Please go back and create a newsletter again.");
      return;
    }

    let cancelled = false;
    const begin = async () => {
      try {
        const latestStatus = await getLatestIssueStatus();
        if (cancelled || !mountedRef.current) return;
        if (latestStatus === "generated" || latestStatus === "sent") {
          finishAsSuccess(DONE_HEADER, false);
          return;
        }
        if (latestStatus === "queued" || firstIssueInFlightByNewsletter.has(newsletterId)) {
          setIsRunning(true);
          setError(null);
          setHeader("Still generating your first newsletter...");
          startProgressTimer();
          firstQueuedSeenAtRef.current = Date.now();
          return;
        }
        if (!generationAttemptedRef.current) {
          void runFirstIssue();
        }
      } catch {
        if (!generationAttemptedRef.current) {
          void runFirstIssue();
        }
      }
    };
    void begin();
    return () => {
      cancelled = true;
    };
  }, [finishAsSuccess, getLatestIssueStatus, newsletterId, runFirstIssue, startProgressTimer]);

  useEffect(() => {
    if (!newsletterId || !isRunning || isComplete || error) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const status = await getLatestIssueStatus();
        if (cancelled || !mountedRef.current) return;
        if (status === "generated" || status === "sent") {
          finishAsSuccess(DONE_HEADER, false);
          return;
        }
        if (status === "failed") {
          setError("Generation failed. Please retry.");
          setIsRunning(false);
          stopProgressTimer();
          setProgressPercent(0);
          return;
        }
        if (status === "queued") {
          const firstQueuedAt = firstQueuedSeenAtRef.current;
          if (!firstQueuedAt) {
            firstQueuedSeenAtRef.current = Date.now();
            return;
          }
          if (Date.now() - firstQueuedAt > 180000) {
            setError(
              "Still generating longer than expected. Please retry once, or go to Dashboard in a moment."
            );
            setIsRunning(false);
            stopProgressTimer();
            return;
          }
        }
      } catch {
        // Ignore transient polling errors while generation is still in progress.
      }
    };
    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    error,
    finishAsSuccess,
    getLatestIssueStatus,
    isComplete,
    isRunning,
    newsletterId,
    stopProgressTimer,
  ]);

  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, [stopProgressTimer]);

  useEffect(() => {
    if (!isComplete) {
      setShowDashboardButton(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setShowDashboardButton(true);
    }, 480);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isComplete]);

  const loadingMessageIndex = getLoadingMessageIndex(
    progressPercent,
    isComplete,
    isRunning
  );

  const saveReferral = async () => {
    if (!referralSource.trim()) {
      return;
    }
    setIsSavingReferral(true);
    try {
      await api.patch("/api/me", {
        referral_source: referralSource,
        referral_other: referralSource === "other" ? referralOther : "",
      });
      void trackEvent("setup_referral_captured", {
        referral_source: referralSource,
      });
      setReferralSaved(true);
    } catch {
      // Non-blocking for launch flow.
    } finally {
      setIsSavingReferral(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="text-center space-y-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
              {header}
            </h1>

            <div className="flex justify-center">
              <img
                src="/logo-pigeon-devices.svg"
                alt="For You Newsletter"
                className="h-44 w-auto object-contain"
              />
            </div>

            {error && (
              <div className="mx-auto max-w-xl space-y-4">
                <p className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={runFirstIssue}
                  disabled={isRunning}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Retry
                </button>
              </div>
            )}

            {isRunning && !error && (
              <div className="mx-auto w-full max-w-md space-y-3">
                <RollingLoadingMessage targetIndex={loadingMessageIndex} />
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-[width] duration-200 ease-out dark:bg-sky-400"
                    style={{ width: `${Math.max(8, Math.round(progressPercent))}%` }}
                  />
                </div>
              </div>
            )}

            {isComplete && showDashboardButton && (
              <button
                type="button"
                className="btn-primary w-full max-w-md"
                onClick={() =>
                  router.push(
                    firstIssueDailyLimitHit
                      ? "/dashboard?firstIssueLimitHit=1"
                      : "/dashboard"
                  )
                }
              >
                Go to Dashboard
              </button>
            )}
          </div>

          <div className="lg:self-start lg:pt-10">
            <div className="text-left rounded-2xl border border-gray-200 p-4 space-y-3 bg-white dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                Where did you hear about us?
              </p>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                disabled={referralSaved}
                className="input-field disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">Select one (optional)</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
                <option value="friend_referral">Friend Referral</option>
                <option value="other">Other</option>
              </select>
              {referralSource === "other" && (
                <input
                  value={referralOther}
                  onChange={(e) => setReferralOther(e.target.value)}
                  disabled={referralSaved}
                  className="input-field disabled:cursor-not-allowed disabled:opacity-70"
                  placeholder="Tell us where"
                />
              )}
              {referralSaved && (
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Thank you!
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveReferral}
                  disabled={
                    isSavingReferral ||
                    referralSaved ||
                    !referralSource.trim() ||
                    (referralSource === "other" && !referralOther.trim())
                  }
                  className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingReferral ? "Saving..." : referralSaved ? "Saved" : "Save"}
                </button>
                {referralSaved ? (
                  <button
                    type="button"
                    onClick={() => setReferralSaved(false)}
                    className="btn-outline flex-1"
                  >
                    Change selection
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReferralSource("");
                      setReferralOther("");
                    }}
                    className="btn-outline flex-1"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatingNewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl text-center space-y-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
              {START_HEADER}
            </h1>
            <div className="flex justify-center">
              <img
                src="/logo-pigeon-devices.svg"
                alt="For You Newsletter"
                className="h-44 w-auto object-contain"
              />
            </div>
            <div className="mx-auto w-full max-w-md space-y-3">
              <p className="text-center text-sm font-semibold text-sky-600 dark:text-sky-300">
                {LOADING_MESSAGES[0]}
              </p>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-slate-800">
                <div className="h-full w-1/4 rounded-full bg-sky-500 dark:bg-sky-400" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CreatingNewsletterContent />
    </Suspense>
  );
}
