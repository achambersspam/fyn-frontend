"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Plus, ChevronRight } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Newsletter, Profile } from "@/lib/apiContracts";
import { TIER_LIMITS } from "@/lib/apiContracts";
import UpgradeModal from "@/components/UpgradeModal";

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Newsletter[]>("/api/newsletters"),
      api.get<Profile>("/api/me").catch(() => null),
    ])
      .then(([nls, prof]) => {
        setNewsletters(Array.isArray(nls) ? nls : []);
        setProfile(prof);
      })
      .catch((err) => {
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load newsletters.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const tier = profile?.tier ?? "basic";
  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
  const atLimit =
    limits.maxNewsletters !== Infinity &&
    newsletters.length >= limits.maxNewsletters;

  const handleAdd = () => {
    if (atLimit) {
      setShowUpgrade(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            My Newsletters
          </h1>
          {atLimit ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 text-primary font-bold text-sm hover:underline"
            >
              <Plus size={18} /> Add
            </button>
          ) : (
            <Link
              href="/setup"
              className="flex items-center gap-1 text-primary font-bold text-sm hover:underline"
            >
              <Plus size={18} /> Add
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {isLoading && (
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading newsletters...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
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

        {newsletters.map((nl) => (
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
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        message={`Your ${tier} plan allows up to ${limits.maxNewsletters} newsletter${limits.maxNewsletters !== 1 ? "s" : ""}. Upgrade to add more.`}
      />

      <BottomNav />
    </div>
  );
}
