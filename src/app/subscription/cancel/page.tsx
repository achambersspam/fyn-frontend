"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import type {
  SubscriptionCancelResponse,
  SubscriptionInfo,
} from "@/lib/apiContracts";

const REASONS = [
  "Too expensive",
  "Not using it enough",
  "Found an alternative",
  "Missing features",
  "Other",
];

function formatPeriodEnd(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [alreadyScheduled, setAlreadyScheduled] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelledLoad = false;
    void (async () => {
      try {
        const sub = await api.get<SubscriptionInfo>("/api/subscription");
        if (cancelledLoad) return;
        const formatted = formatPeriodEnd(sub.current_period_end);
        if (formatted) setPeriodEnd(formatted);
        const paid =
          sub.plan === "plus" ||
          sub.plan === "premium" ||
          sub.tier === "minimum" ||
          sub.tier === "premium";
        if (!paid) {
          router.replace("/subscription");
          return;
        }
        if (sub.cancel_at_period_end) {
          setAlreadyScheduled(true);
        }
      } catch (err: unknown) {
        if (cancelledLoad) return;
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          router.replace("/auth");
          return;
        }
        setLoadError("Unable to load your subscription. Please try again.");
      }
    })();
    return () => {
      cancelledLoad = true;
    };
  }, [router]);

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    setError(null);
    try {
      const payload: SubscriptionCancelResponse = await api.post(
        "/api/subscription/cancel",
        reason ? { reason } : {}
      );
      if (payload.cancel_at_period_end !== true) {
        setError("Cancellation did not complete. Please try again.");
        return;
      }
      setPeriodEnd(formatPeriodEnd(payload.current_period_end) || periodEnd);
      setCancelled(true);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.message || "Unable to cancel. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResume = async () => {
    if (isResuming) return;
    setIsResuming(true);
    setError(null);
    try {
      const payload: SubscriptionCancelResponse = await api.post(
        "/api/subscription/cancel",
        { action: "resume" }
      );
      if (payload.cancel_at_period_end === true) {
        setError("Could not resume your subscription. Please try again.");
        return;
      }
      router.push("/settings");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || "Could not resume your subscription. Please try again.");
    } finally {
      setIsResuming(false);
    }
  };

  if (cancelled) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Cancellation scheduled
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Billing will stop at the end of your current period
            {periodEnd ? (
              <>
                {" "}
                (<span className="font-semibold">{periodEnd}</span>)
              </>
            ) : null}
            . You keep access until then. You can resume anytime from Settings.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Cancel subscription
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
        {(error || loadError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error || loadError}
          </div>
        )}

        {alreadyScheduled ? (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30 space-y-3">
              <h2 className="text-lg font-black text-amber-800 dark:text-amber-300">
                Cancellation already scheduled
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your plan stays active
                {periodEnd ? (
                  <>
                    {" "}
                    until <span className="font-semibold">{periodEnd}</span>
                  </>
                ) : (
                  " until the end of the current billing period"
                )}
                . No further charges after that unless you resume.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/settings")}
                className="flex-1 btn-outline py-3"
              >
                Back to Settings
              </button>
              <button
                onClick={() => void handleResume()}
                disabled={isResuming}
                className="flex-1 btn-primary py-3"
              >
                {isResuming ? "Resuming..." : "Resume subscription"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  size={24}
                  className="text-amber-600 shrink-0"
                />
                <h2 className="text-lg font-black text-amber-800 dark:text-amber-300">
                  Confirm cancellation
                </h2>
              </div>
              <ul className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
                <li>
                  • Billing stops at the end of your current period
                  {periodEnd ? (
                    <>
                      {" "}
                      (<strong>{periodEnd}</strong>)
                    </>
                  ) : null}
                  . You keep access until then.
                </li>
                <li>
                  • Your account and data stay. This is not account deletion and
                  does not pause email delivery by itself.
                </li>
                <li>
                  • If you later fall to the free tier and have more newsletters
                  than it allows, your oldest newsletter is kept and extras are
                  paused.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Optional: why are you cancelling?
              </p>
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason((current) => (current === r ? "" : r))}
                  className={`w-full text-left p-4 rounded-2xl border-2 font-semibold transition-all ${
                    reason === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-700 dark:border-slate-800 dark:text-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/settings")}
                className="flex-1 btn-primary py-3"
              >
                Keep subscription
              </button>
              <button
                onClick={() => void handleCancel()}
                disabled={isCancelling}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 transition-all disabled:opacity-60 active:scale-95"
              >
                {isCancelling ? "Cancelling..." : "Confirm cancellation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
