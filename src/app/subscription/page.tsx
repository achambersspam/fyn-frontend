"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import type { CheckoutResponse, Profile } from "@/lib/apiContracts";

type PlanCard = {
  id: string;
  name: string;
  price: string;
  priceNote: string | null;
  cadenceNote?: string;
  features: string[];
  cta: string;
  disabled: boolean;
  emphasized: boolean;
  badge?: string;
  anchorPrice?: string;
  savingsNote?: string;
  subtext?: string;
};

const plans: PlanCard[] = [
  {
    id: "basic",
    name: "Free",
    price: "Free",
    priceNote: null,
    cadenceNote: undefined,
    features: [
      "1 newsletter",
      "Up to 6 topics",
      "Weekday delivery windows",
      "Ads enabled",
    ],
    cta: "Current plan",
    disabled: true,
    emphasized: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "$4.99",
    priceNote: " / 4 weeks",
    cadenceNote: undefined,
    features: [
      "Up to 2 newsletters",
      "Up to 6 topics",
      "Expanded delivery windows",
      "Ads enabled",
    ],
    cta: "Upgrade to Plus",
    disabled: false,
    emphasized: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    priceNote: " / 4 weeks",
    cadenceNote: undefined,
    anchorPrice: "$14.99",
    savingsNote: "Save vs. monthly bundles",
    badge: "MOST POPULAR",
    features: [
      "Up to 5 newsletters",
      "Up to 6 topics",
      "Weekend delivery (weekly / bi-weekly)",
      "No ads",
    ],
    cta: "Upgrade to Premium",
    subtext: "Credit card required. Cancel anytime.",
    disabled: false,
    emphasized: true,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const checkoutGuardRef = useRef(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const p = await api.get<Profile>("/api/me");
        if (!cancelled) setProfile(p);
      } catch {
        /* anonymous / handled elsewhere */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tier = profile?.tier ?? "basic";

  const handleCheckout = async (planId: string) => {
    if (planId === "basic") return;
    if (checkoutGuardRef.current || loading !== null) return;
    checkoutGuardRef.current = true;
    setLoading(planId);
    setError(null);
    try {
      const res = await api.post<CheckoutResponse>("/api/stripe/checkout", {
        plan: planId === "plus" ? "plus" : "premium",
      });
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError("Could not start checkout. Please try again.");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      let msg =
        apiErr?.message ||
        (err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Checkout failed.");
      const code = apiErr?.code;
      if (typeof code === "string" && code.startsWith("CHECKOUT_")) {
        msg = `${msg} Use Manage billing to change plans or cancel duplicate subscriptions.`;
      }
      setError(msg);
    } finally {
      checkoutGuardRef.current = false;
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    if (checkoutGuardRef.current || loading !== null) return;
    checkoutGuardRef.current = true;
    setLoading("portal");
    setError(null);
    try {
      const res = await api.post<CheckoutResponse>("/api/stripe/portal", {});
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError("Could not open billing portal.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Portal unavailable.";
      setError(msg);
    } finally {
      checkoutGuardRef.current = false;
      setLoading(null);
    }
  };

  const planLabel = (id: string) => {
    if (id === "basic") return "Free";
    if (id === "plus") return "Plus";
    if (id === "premium") return "Premium";
    return id;
  };

  const isCurrent = (planId: string) =>
    (planId === "basic" && tier === "basic") ||
    (planId === "plus" && tier === "minimum") ||
    (planId === "premium" && tier === "premium");

  const paidSubscriber = tier === "minimum" || tier === "premium";
  const openingPortal = loading === "portal";

  const primaryPlanAction = (planId: string) => {
    if (planId === "premium" && tier === "minimum") {
      void handlePortal();
      return;
    }
    if (!isCurrent(planId)) {
      void handleCheckout(planId);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <button
            type="button"
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

      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-10">
        <div className="text-center space-y-2.5 -mt-1">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">
            Your News. Built For You.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Custom newsletters designed around what you care about. Delivered
            your way.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Cancel anytime. Test mode uses Stripe test cards only.
          </p>
        </div>

        {paidSubscriber ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => void handlePortal()}
              disabled={loading !== null}
              className="btn-outline px-6 py-3 font-bold"
            >
              {loading === "portal" ? "Opening…" : "Manage billing"}
            </button>
          </div>
        ) : null}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 text-center dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
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
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              {isCurrent(plan.id) && (
                <div className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Current plan
                </div>
              )}

              <div className="space-y-6">
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

                <ul className="space-y-3 pb-1">
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
                  type="button"
                  onClick={() =>
                    isCurrent(plan.id)
                      ? undefined
                      : primaryPlanAction(plan.id)
                  }
                  disabled={
                    plan.disabled ||
                    loading !== null ||
                    isCurrent(plan.id)
                  }
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.emphasized
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                      : plan.disabled || isCurrent(plan.id)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-500"
                        : "bg-primary text-white hover:bg-primary-dark active:scale-95"
                  }`}
                >
                  {loading === plan.id
                    ? "Redirecting..."
                    : plan.id === "premium" && tier === "minimum" && openingPortal
                      ? "Opening…"
                      : isCurrent(plan.id)
                        ? `${planLabel(plan.id)} active`
                        : plan.id === "premium" && tier === "minimum"
                          ? "Upgrade via Manage billing"
                          : plan.cta}
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
