"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { ChevronRight, CreditCard, Newspaper, LogOut } from "@/components/Icons";
import { api } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Profile, SubscriptionInfo } from "@/lib/apiContracts";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get<Profile>("/api/me"),
      api.get<SubscriptionInfo>("/api/subscription").catch(() => null),
    ])
      .then(([prof, sub]) => {
        setProfile(prof);
        setSubscription(sub);
      })
      .catch((err) => {
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load settings.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

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

        {isLoading && (
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading settings...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-2">
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
              Plan: {(profile.tier ?? "basic").charAt(0).toUpperCase() +
                (profile.tier ?? "basic").slice(1)}
            </p>
          </div>
        )}

        {subscription && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
            <h2 className="font-black text-gray-900 dark:text-gray-100">
              Subscription
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Status: {subscription.status}
            </p>
            {subscription.current_period_end && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Renews:{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 dark:bg-slate-900 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800">
          {menuItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
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

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
