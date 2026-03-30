"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "@/components/Icons";
import { api } from "@/lib/api";
import type { StripePortalPayload } from "@/lib/apiContracts";

type Step = "reason" | "warning" | "confirm";

const REASONS = [
  "Too expensive",
  "Not using it enough",
  "Found an alternative",
  "Missing features",
  "Other",
];

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      const payload: StripePortalPayload = { action: "cancel", reason };
      await api.post("/api/stripe/portal", payload);
      setCancelled(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Unable to cancel. Please try again.";
      setError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (cancelled) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Subscription Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your subscription has been cancelled. You will retain access until
            the end of your current billing period.
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
            onClick={() => {
              if (step === "reason") router.back();
              else if (step === "warning") setStep("reason");
              else setStep("warning");
            }}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Cancel Subscription
          </h1>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <div className="flex gap-2">
          {(["reason", "warning", "confirm"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <=
                ["reason", "warning", "confirm"].indexOf(step)
                  ? "bg-red-500"
                  : "bg-gray-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Reason */}
        {step === "reason" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                We&apos;re sorry to see you go
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Could you tell us why you&apos;re cancelling?
              </p>
            </div>

            <div className="space-y-3">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
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
                onClick={() => router.back()}
                className="flex-1 btn-outline py-3"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => setStep("warning")}
                disabled={!reason}
                className="flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Warning */}
        {step === "warning" && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  size={24}
                  className="text-amber-600 shrink-0"
                />
                <h2 className="text-lg font-black text-amber-800 dark:text-amber-300">
                  What happens when you cancel
                </h2>
              </div>
              <ul className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
                <li>
                  • You will lose access to premium features at the end of your
                  billing period.
                </li>
                <li>
                  • If you have more newsletters than the free tier allows, your{" "}
                  <strong>oldest newsletter will be preserved</strong> and the
                  remaining newsletters will be <strong>paused</strong>. Paused
                  newsletters will eventually be <strong>deleted</strong> if not
                  reactivated.
                </li>
                <li>
                  • Your reading streak and achievements history will be
                  preserved.
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 btn-primary py-3"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 transition-all dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
              >
                Continue Cancellation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                Final Confirmation
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to cancel your subscription? This action
                will take effect at the end of your current billing period.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 btn-primary py-3"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 transition-all disabled:opacity-60 active:scale-95"
              >
                {isCancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
