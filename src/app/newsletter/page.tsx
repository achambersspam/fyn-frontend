"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "@/components/Icons";
import PageSkeleton from "@/components/PageSkeleton";
import { api } from "@/lib/api";
import { getCurrentSession } from "@/lib/supabase";
import type { Newsletter, Profile } from "@/lib/apiContracts";
import { TIER_LIMITS } from "@/lib/apiContracts";

export default function NewsletterPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isNavigatingCreate, setIsNavigatingCreate] = useState(false);

  useEffect(() => {
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
        const [nls, prof] = await Promise.all([
          api.get<Newsletter[]>("/api/newsletters"),
          api.get<Profile>("/api/me").catch(() => null),
        ]);
        if (cancelled) return;
        setNewsletters(Array.isArray(nls) ? nls : []);
        setProfile(prof);
      } catch (err) {
        if (cancelled) return;
        const status =
          err && typeof err === "object" && "status" in err
            ? (err as { status?: number }).status
            : undefined;
        if (status === 401) {
          router.replace("/auth");
          return;
        }
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load newsletters.";
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    void router.prefetch("/setup");
    void router.prefetch("/dashboard");
    void router.prefetch("/subscription");
  }, [router]);

  useEffect(() => {
    newsletters.forEach((nl) => {
      void router.prefetch(`/newsletter/${nl.id}`);
    });
  }, [newsletters, router]);

  const tier = profile?.tier ?? "basic";
  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
  const atLimit =
    limits.maxNewsletters !== Infinity &&
    newsletters.length >= limits.maxNewsletters;
  const createButtonLabel =
    newsletters.length > 0 ? "Create Another Newsletter" : "Create Newsletter";

  const handleCreateNewsletter = () => {
    if (atLimit) {
      setShowLimitModal(true);
      return;
    }
    setIsNavigatingCreate(true);
    router.push("/setup");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            My Newsletters
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {isLoading && (
          <PageSkeleton rows={3} />
        )}

        {error && (
          <div className="rounded-2xl p-5 text-center font-semibold bg-red-600 text-white">
            {error}
          </div>
        )}

        {!isLoading && newsletters.length === 0 && !error && (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              No newsletters yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first personalized newsletter.
            </p>
            <Link href="/setup">
              <button className="btn-primary">Create Newsletter</button>
            </Link>
          </div>
        )}

        {!isLoading && newsletters.map((nl) => (
          <Link
            key={nl.id}
            href={`/newsletter/${nl.id}`}
            className="block bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {nl.title || nl.email}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nl.topics.length} topic{nl.topics.length !== 1 ? "s" : ""} ·{" "}
                  {nl.frequency} · {nl.paused ? "Paused" : "Active"}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
          </Link>
        ))}
        {!isLoading && !error && (
          <button
            type="button"
            onClick={handleCreateNewsletter}
            disabled={isNavigatingCreate}
            className="w-full btn-primary text-base"
          >
            {isNavigatingCreate ? "Opening setup..." : createButtonLabel}
          </button>
        )}
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {tier === "premium"
                ? "You already have the maximum number of newsletters included in Premium."
                : tier === "minimum"
                  ? "Plus includes up to 2 newsletters. Upgrade to Premium for up to 5."
                  : "Free includes 1 newsletter. Upgrade to add more."}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(false);
                  router.push("/subscription");
                }}
                className="w-full btn-primary"
              >
                Go to subscription page
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(false);
                  router.push("/dashboard");
                }}
                className="w-full btn-outline"
              >
                Go back to home page
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
