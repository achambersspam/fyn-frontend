"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import Tooltip from "@/components/Tooltip";
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
import type {
  CheckoutResponse,
  Profile,
  SubscriptionCancelResponse,
  SubscriptionInfo,
} from "@/lib/apiContracts";
import { resetAnalyticsIdentity, trackEvent } from "@/lib/analytics";
import { errorMessage } from "@/lib/errorMessage";
import { useToast } from "@/lib/useToast";
import Spinner from "@/components/Spinner";

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
  const [isResumingSubscription, setIsResumingSubscription] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const { toast } = useToast();

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
        } else {
          toast.error(errorMessage(subResult.err, "Unable to load subscription details."));
        }
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          router.replace("/auth");
          return;
        }
        const msg = errorMessage(err, "Unable to load settings.");
        setError(msg);
        toast.error(msg);
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

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setError(null);
    try {
      await api.delete("/api/me");
      void trackEvent("account_deleted", { source: "settings" });
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      resetAnalyticsIdentity();
      if (typeof window !== "undefined") {
        window.sessionStorage.clear();
      }
      router.push("/");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.message || "We couldn't delete your account. Please try again or contact support."
      );
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
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
      } else {
        toast.error(errorMessage(subResult.err, "Unable to load subscription details."));
      }
    } catch (err) {
      const msg = errorMessage(err, "Unable to refresh.");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnsubscribe = async (nextValue: boolean) => {
    if (!profile) return;
    const startedAt = performance.now();
    const previous = profile;
    setProfile({ ...profile, is_unsubscribed: nextValue });
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
      toast.success(nextValue ? "Email delivery paused." : "Email delivery resumed.");
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
    } catch (err) {
      setProfile(previous);
      const msg = errorMessage(err, "Unable to update newsletter subscription state. Please try again.");
      setError(msg);
      toast.error(msg);
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

  const handleResumeSubscription = async () => {
    if (isResumingSubscription) return;
    setIsResumingSubscription(true);
    setError(null);
    try {
      const res = await api.post<SubscriptionCancelResponse>(
        "/api/subscription/cancel",
        { action: "resume" }
      );
      if (res.cancel_at_period_end === true) {
        setError("Could not resume your subscription. Please try again.");
        return;
      }
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              cancel_at_period_end: false,
              current_period_end: res.current_period_end ?? prev.current_period_end,
            }
          : prev
      );
    } catch {
      setError("Could not resume your subscription. Please try again.");
    } finally {
      setIsResumingSubscription(false);
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
              <Spinner size={20} />
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
              <Spinner size={20} />
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
              {subscription.trial_end &&
              new Date(subscription.trial_end).getTime() > Date.now() &&
              (subscription.stripe_subscription_status === "trialing" ||
                subscription.status === "trialing") ? (
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                  Free trial — ends{" "}
                  {new Date(subscription.trial_end).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  . You'll be charged{" "}
                  {subscription.plan === "plus" ||
                  subscription.tier === "minimum"
                    ? "$4.99"
                    : "$9.99"}{" "}
                  on{" "}
                  {new Date(subscription.trial_end).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  unless you cancel.
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
                  <Tooltip label="Open the Stripe portal to update payment or cancel">
                    <button
                      type="button"
                      onClick={() => void handleManageBilling()}
                      className="btn-outline text-sm py-2 px-3"
                      disabled={isLoading || isOpeningPortal}
                    >
                      {isOpeningPortal ? "Opening…" : "Manage billing"}
                    </button>
                  </Tooltip>
                ) : null}
                {paidTier && subscription.cancel_at_period_end ? (
                  <Tooltip label="Keep your plan and continue billing after this period">
                    <button
                      type="button"
                      onClick={() => void handleResumeSubscription()}
                      className="btn-outline text-sm py-2 px-3"
                      disabled={isLoading || isResumingSubscription}
                    >
                      {isResumingSubscription ? "Resuming…" : "Resume subscription"}
                    </button>
                  </Tooltip>
                ) : null}
                {paidTier && !subscription.cancel_at_period_end ? (
                  <Link href="/subscription/cancel" className="btn-outline text-sm py-2 px-3">
                    Cancel subscription (keeps your account and data)
                  </Link>
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

        <Tooltip label="Sign out of your account on this device" className="w-full">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={20} />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </Tooltip>

        {/* Danger zone: permanent account deletion */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/40 dark:bg-red-950/10">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
            Delete account permanently (also cancels billing)
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-red-600/90 dark:text-red-400/90">
            Permanently delete your account, all newsletters, and your data. Any Stripe
            subscription is cancelled immediately. This cannot be undone.
          </p>
          <Tooltip label="Permanently delete your account and all data">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteConfirm(true);
              }}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Delete my account
            </button>
          </Tooltip>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Delete your account?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                This permanently deletes your account, newsletters, and all associated data,
                and immediately cancels any Stripe subscription. This action cannot be undone.
              </p>
              <label className="mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Type <span className="font-black">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 input-field"
                autoFocus
              />
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText !== "DELETE"}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingAccount ? "Deleting..." : "Delete forever"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                ? "Resume email delivery"
                : "Pause email delivery (keeps your account and plan)"}
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
