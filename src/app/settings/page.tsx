"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { api, setAuthToken } from "@/lib/api";
import type { Profile, Subscription } from "@/lib/apiContracts";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Mail,
  Newspaper,
} from "lucide-react";


export default function SettingsPage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<Profile>({});
  const [subscription, setSubscription] = useState<Subscription>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = () => {
    api
      .post("/auth/signout")
      .catch(() => null)
      .finally(() => {
        setAuthToken(null);
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (err) {
          console.error("Failed to clear storage", err);
        }
        router.push("/");
      });
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([api.get<Profile>("/user/profile"), api.get<Subscription>("/subscription")])
      .then(([profileData, subscriptionData]) => {
        setProfile(profileData ?? {});
        setSubscription(subscriptionData ?? {});
      })
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load settings.";
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const subscriptionItems = useMemo(
    () => [
      {
        label: "Manage Subscription",
        description: subscription.planName ?? "Subscription details",
        icon: CreditCard,
        href: "/settings/subscription",
      },
      {
        label: "Manage Newsletter",
        description: "Topics & delivery settings",
        icon: Newspaper,
        href: "/settings/newsletter",
      },
    ],
    [subscription.planName]
  );

  const accountItems = useMemo(
    () => [
      {
        label: "Email",
        description: profile.email ?? "Your email address",
        icon: Mail,
        href: "/settings/email",
      },
      {
        label: "Change Password",
        description: "Update your password",
        icon: Lock,
        href: "/settings/password",
      },
    ],
    [profile.email]
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-slate-900"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">Settings</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        <div className="text-center space-y-2">
          <Logo variant="envelope" className="w-[7.5rem] h-[7.5rem] mx-auto" />
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              {profile.name ?? "Your Account"}
            </h2>
            <p className="text-sm text-gray-500 font-semibold dark:text-gray-400">
              {subscription.statusLabel ?? "Subscription status"}
            </p>
          </div>
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

        <div className="space-y-3">
          <p className="text-xs font-black text-gray-500 tracking-widest dark:text-gray-400">SUBSCRIPTION</p>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800">
            {subscriptionItems.map(({ label, description, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-500 font-semibold dark:text-gray-400">{description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black text-gray-500 tracking-widest dark:text-gray-400">ACCOUNT</p>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800">
            {accountItems.map(({ label, description, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-500 font-semibold dark:text-gray-400">{description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black text-gray-500 tracking-widest dark:text-gray-400">APP PREFERENCES</p>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100">Notifications</p>
                  <p className="text-xs text-gray-500 font-semibold dark:text-gray-400">
                    Toggle app alerts
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={() => setNotificationsEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? "bg-primary" : "bg-gray-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
