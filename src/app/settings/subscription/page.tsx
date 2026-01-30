"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { Subscription } from "@/lib/apiContracts";

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    api
      .get<Subscription>("/subscription")
      .then((data) => setSubscription(data ?? {}))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load subscription details.";
        setError(message);
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
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">Manage Subscription</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {isLoading && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading subscription...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs font-black text-gray-500 tracking-widest mb-2 dark:text-gray-400">
            CURRENT PLAN
          </p>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {subscription.planName ?? "Free Tier Member"}
          </h2>
          <p className="text-sm text-gray-600 font-medium mt-2 dark:text-gray-300">
            {subscription.description ?? "Subscription details provided by your backend."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-black px-3 py-1">
              <Sparkles size={14} />
              {subscription.statusLabel ?? "Active"}
            </span>
            <span className="text-xs text-gray-500 font-semibold dark:text-gray-400">
              {subscription.renewalDate ? `Renewal: ${subscription.renewalDate}` : "Renewal date"}
            </span>
          </div>
        </div>

        <Link
          href="/settings"
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          Back to Settings
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
