"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import {
  ChevronRight,
  CreditCard,
  Newspaper,
  LogOut,
  Target,
  Brain,
} from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import { getCurrentSession, getSupabaseBrowserClient } from "@/lib/supabase";
import type { CheckoutResponse, Profile, SubscriptionInfo } from "@/lib/apiContracts";
import { resetAnalyticsIdentity, trackEvent } from "@/lib/analytics";

const SETUP_DRAFT_STORAGE_KEY = "fyn.setupDraft.v2";
const AUTH_POST_TARGET_KEY = "auth_post_target_v1";
const AUTH_SETUP_BACK_BYPASS_KEY = "auth_setup_back_bypass_v1";

function formatAccountPlanLabel(tier: string | undefined): string {
  const t = tier ?? "basic";
  if (t === "basic") return "Free";
  if (t === "minimum") return "Plus";
  if (t === "premium") return "Premium";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingSubscriptionState, setIsUpdatingSubscriptionState] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const checkoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const session = await getCurrentSession({ retries: 2, retryDelayMs: 180 });
      if (!session?.access_token) {
        router.replace("/auth");
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const [prof, subResult] = await Promise.all([
          api.get<Profile>("/api/me"),
          api
            .get<SubscriptionInfo>("/api/subscription")
            .then((data) => ({ ok: true as const, data }))
            .catch((fetchErr: unknown) => ({ ok: false as const, err: fetchErr })),
        ]);
        if (cancelled) return;
        setProfile(prof);
        if (subResult.ok) {
          setSubscription(subResult.data);
        } else if (process.env.NODE_ENV !== "production") {
          console.warn("settings_subscription_fetch_failed", subResult.err);
        }
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          router.replace("/auth");
          return;
        }
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load settings.";
        setError(msg);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    void router.prefetch("/newsletter");
    void router.prefetch("/subscription");
    void router.prefetch("/settings/feedback");
    void router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      void trackEvent("settings_loaded", {
        has_profile: Boolean(profile?.id),
      });
    }
  }, [isLoading, profile?.id]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      resetAnalyticsIdentity();
      void trackEvent("logout_completed", { source: "settings" });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(SETUP_DRAFT_STORAGE_KEY);
        window.sessionStorage.removeItem(AUTH_POST_TARGET_KEY);
        window.sessionStorage.removeItem(AUTH_SETUP_BACK_BYPASS_KEY);
      }
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  const refreshAccount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await getCurrentSession({ retries: 2, retryDelayMs: 180 });
      if (!session?.access_token) {
        router.replace("/auth");
        return;
      }
      const [prof, subResult] = await Promise.all([
        api.get<Profile>("/api/me"),
        api
          .get<SubscriptionInfo>("/api/subscription")
          .then((data) => ({ ok: true as const, data }))
          .catch((fetchErr: unknown) => ({ ok: false as const, err: fetchErr })),
      ]);
      setProfile(prof);
      if (subResult.ok) {
        setSubscription(subResult.data);
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("settings_subscription_refresh_failed", subResult.err);
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Unable to refresh.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnsubscribe = async (nextValue: boolean) => {
    const startedAt = performance.now();
    setIsUpdatingSubscriptionState(true);
    if (nextValue) {
      void trackEvent("unsubscribe_clicked", { source: "settings" });
    } else {
      void trackEvent("resubscribe_clicked", { source: "settings" });
    }
    try {
      const updated = await api.patch<Profile>("/api/me", {
        is_unsubscribed: nextValue,
      });
      setProfile(updated);
      if (nextValue) {
        void trackEvent("unsubscribe_succeeded", { source: "settings" });
      } else {
        void trackEvent("resubscribe_succeeded", { source: "settings" });
      }
      const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
      if (process.env.NODE_ENV !== "production") {
        console.log("UI_ACTION_TIMING", {
          action: "settings_action",
          sub_action: nextValue ? "unsubscribe" : "resubscribe",
          duration_ms: durationMs,
          success: true,
        });
      }
    } catch {
      setError("Unable to update newsletter subscription state. Please try again.");
      const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
      if (process.env.NODE_ENV !== "production") {
        console.log("UI_ACTION_TIMING", {
          action: "settings_action",
          sub_action: nextValue ? "unsubscribe" : "resubscribe",
          duration_ms: durationMs,
          success: false,
        });
      }
    } finally {
      setIsUpdatingSubscriptionState(false);
    }
  };

  const handleManageBilling = async () => {
    if (isOpeningPortal) return;
    setIsOpeningPortal(true);
    try {
      const res = await api.post<CheckoutResponse>("/api/stripe/portal", {});
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError("Could not open billing portal.");
    } catch {
      setError("Could not open billing portal.");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const paidTier =
    subscription?.tier === "minimum" ||
    subscription?.tier === "premium" ||
    subscription?.plan === "plus" ||
    subscription?.plan === "premium";

  const menuItems = [
    {
      label: "Manage Newsletters",
      href: "/newsletter",
      icon: Newspaper,
    },
    {
      label: "Subscription",
      href: "/subscription",
      icon: CreditCard,
    },
    {
      label: "Feedback Board",
      href: "/settings/feedback",
      icon: Newspaper,
    },
  ];
  const advancedItems = [
    {
      label: "Pigeon Topic Priority System",
      href: "/settings/advanced/pigeon-topic-priority",
      icon: Target,
      comingSoon: false,
    },
    {
      label: "Personality/Writing Style",
      href: "/settings/advanced/personality-writing-style",
      icon: Brain,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center px-4 sm:px-6 lg:px-10 py-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        <div className="flex flex-col items-center">
          <Logo variant="envelope" className="w-[7.5rem] h-[7.5rem]" />
        </div>

        {checkoutSuccess && (
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 px-5 py-4 text-sm text-sky-100 space-y-3">
            <p className="font-semibold">
              Payment received — your subscription updates after Stripe confirms the
              webhook (usually under a minute).
            </p>
            <button
              type="button"
              onClick={() => void refreshAccount()}
              className="btn-outline text-sm py-2 px-4"
              disabled={isLoading}
            >
              Refresh status
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/90 bg-red-500/10 px-5 py-4 text-center font-semibold text-white">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 min-h-[128px]">
          {isLoading ? (
            <div className="h-full min-h-[88px] flex items-center justify-center">
              <span className="h-5 w-5 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
            </div>
          ) : profile ? (
            <div className="space-y-2">
              <h2 className="font-black text-gray-900 dark:text-gray-100">
                Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {profile.email}
              </p>
              {profile.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.name}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Plan: {formatAccountPlanLabel(profile.tier)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 min-h-[110px]">
          {isLoading ? (
            <div className="h-full min-h-[70px] flex items-center justify-center">
              <span className="h-5 w-5 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
            </div>
          ) : subscription ? (
            <div className="space-y-2">
              <h2 className="font-black text-gray-900 dark:text-gray-100">
                Subscription
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Plan:{" "}
                <span className="font-semibold capitalize">
                  {subscription.plan === "plus"
                    ? "Plus"
                    : subscription.plan === "premium"
                      ? "Premium"
                      : subscription.plan === "free"
                        ? "Free"
                        : formatAccountPlanLabel(subscription.tier)}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Billing status: {subscription.stripe_subscription_status || subscription.status}
              </p>
              {subscription.cancel_at_period_end ? (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Cancels at period end — you keep access until then.
                </p>
              ) : null}
              {subscription.current_period_end && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Current period ends:{" "}
                  {new Date(subscription.current_period_end).toLocaleString()}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {paidTier ? (
                  <button
                    type="button"
                    onClick={() => void handleManageBilling()}
                    className="btn-outline text-sm py-2 px-3"
                    disabled={isLoading || isOpeningPortal}
                  >
                    {isOpeningPortal ? "Opening…" : "Manage billing"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void refreshAccount()}
                  className="btn-outline text-sm py-2 px-3"
                  disabled={isLoading}
                >
                  Refresh billing status
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 dark:bg-slate-900 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800">
          {menuItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (label === "Feedback Board") {
                  void trackEvent("feedback_board_clicked", { source: "settings" });
                }
              }}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {label}
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 dark:text-gray-500"
              />
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
              Advanced Newsletter Customizations
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {advancedItems.map(({ label, href, icon: Icon, comingSoon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {label}
                  </span>
                  {comingSoon && (
                    <span className="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      coming soon
                    </span>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut size={20} />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>

        {searchParams.get("unsubscribe") === "true" && !profile?.is_unsubscribed ? (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            You opened Settings from an unsubscribe link — use the link below if you still want to
            unsubscribe.
          </p>
        ) : null}

        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 pb-2 text-xs text-gray-500 dark:text-gray-500"
          aria-label="Legal and newsletter preferences"
        >
          <Link href="/terms" className="hover:text-gray-700 hover:underline dark:hover:text-gray-300">
            Terms of Use
          </Link>
          <span aria-hidden className="text-gray-400 dark:text-gray-600">
            ·
          </span>
          <Link
            href="/privacy"
            className="hover:text-gray-700 hover:underline dark:hover:text-gray-300"
          >
            Privacy Policy
          </Link>
          <span aria-hidden className="text-gray-400 dark:text-gray-600">
            ·
          </span>
          <button
            type="button"
            onClick={() => toggleUnsubscribe(!Boolean(profile?.is_unsubscribed))}
            disabled={isLoading || isUpdatingSubscriptionState || !profile}
            className="bg-transparent p-0 font-normal text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-500 dark:hover:text-gray-300"
          >
            {isUpdatingSubscriptionState
              ? "Updating…"
              : profile?.is_unsubscribed
                ? "Reactivate newsletters"
                : "Unsubscribe from newsletters"}
          </button>
        </nav>
      </div>

      <BottomNav />
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
