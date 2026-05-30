"use client";

import { useEffect, useState } from "react";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";
import { getCurrentSession } from "@/lib/supabase";

export default function HowItWorksPage() {
  const [settingsHref, setSettingsHref] = useState("/auth?mode=signin");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const session = await getCurrentSession();
      if (!cancelled && session?.access_token) {
        setSettingsHref("/settings");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicSiteNav settingsHref={settingsHref} />
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">How It Works</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">1. Pick topics</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Select the sections you want in your newsletter based on your interests.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">2. Add details</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Customize with symbols, locations, teams, subtopics, and preferences.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">3. Receive daily</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Read in-app and by email at your preferred cadence and delivery time.
            </p>
          </article>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}

