"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "@/components/Icons";
import { api } from "@/lib/api";
import type { CheckoutResponse } from "@/lib/apiContracts";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    priceNote: null,
    features: [
      "1 newsletter",
      "Up to 6 topics",
      "1–10 min read time",
      "7 AM – 6 PM delivery",
      "Hourly increments",
    ],
    cta: "Current Plan",
    disabled: true,
    emphasized: false,
  },
  {
    id: "minimum",
    name: "Minimum",
    price: "$4.99",
    priceNote: "/month",
    features: [
      "Up to 2 newsletters",
      "Up to 6 topics",
      "Up to 12 min read time",
      "6 AM – 9 PM delivery",
      "30-min increments",
    ],
    cta: "Get Started",
    disabled: false,
    emphasized: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    priceNote: "/month",
    anchorPrice: "$14.99",
    savingsNote: "Save $60/year",
    badge: "MOST POPULAR",
    features: [
      "Unlimited newsletters",
      "Unlimited topics",
      "Up to 25 min read time",
      "5 AM – 10 PM delivery",
      "15-min increments",
      "Priority delivery",
    ],
    cta: "Start Free Trial",
    subtext: "7-day free trial. Credit card required.",
    disabled: false,
    emphasized: true,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "basic") return;
    setLoading(planId);
    setError(null);
    try {
      const res = await api.post<CheckoutResponse>("/api/stripe/checkout", {
        plan: planId,
      });
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError("Could not start checkout. Please try again.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Checkout failed.";
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

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
            Subscription
          </h1>
        </div>
      </div>

      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">
            Your News. Built For You.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Custom newsletters designed around what you care about. Delivered
            your way.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Cancel anytime. No contracts.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 text-center dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Cards - mobile: Premium first stacked, desktop: 3 cols */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
          {/* Mobile order: premium first */}
          {[plans[2], plans[0], plans[1]].map((plan) => (
            <div
              key={plan.id}
              className={`flex-1 rounded-3xl p-6 border-2 transition-all relative ${
                plan.emphasized
                  ? "border-emerald-500 shadow-xl lg:scale-105 lg:-mt-4 lg:pb-8 order-first lg:order-2"
                  : plan.id === "basic"
                    ? "border-gray-200 opacity-80 dark:border-slate-800 order-2 lg:order-1"
                    : "border-gray-200 dark:border-slate-800 order-3 lg:order-3"
              } bg-white dark:bg-slate-900`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                  {plan.name}
                </h3>

                <div>
                  {plan.anchorPrice && (
                    <span className="text-gray-400 line-through text-lg mr-2">
                      {plan.anchorPrice}
                    </span>
                  )}
                  <span className="text-3xl font-black text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.priceNote}
                    </span>
                  )}
                </div>

                {plan.savingsNote && (
                  <p className="text-emerald-600 text-sm font-bold dark:text-emerald-400">
                    {plan.savingsNote}
                  </p>
                )}

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        size={16}
                        className={
                          plan.emphasized
                            ? "text-emerald-500"
                            : "text-primary"
                        }
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={plan.disabled || loading === plan.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.emphasized
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                      : plan.disabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-500"
                        : "bg-primary text-white hover:bg-primary-dark active:scale-95"
                  }`}
                >
                  {loading === plan.id ? "Redirecting..." : plan.cta}
                </button>

                {plan.subtext && (
                  <p className="text-xs text-gray-400 text-center dark:text-gray-500">
                    {plan.subtext}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
