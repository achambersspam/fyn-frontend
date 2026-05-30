"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/supabase";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";

export default function LandingPage() {
  const [settingsHref, setSettingsHref] = useState("/auth?mode=signin");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const session = await getCurrentSession();
      if (!cancelled && session?.access_token) {
        setSettingsHref("/settings");
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicSiteNav settingsHref={settingsHref} />
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-5">
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              Personalized AI Newsletter
            </p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 sm:text-5xl">
              News that is actually for you.
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Choose the topics and details you care about. Get one clean, focused daily digest in your
              inbox and your dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Get Started
              </Link>
              <Link
                href="/auth?mode=signin"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img src="/logo-FYN-cursive-script.svg" alt="For You Newsletter" className="mx-auto h-28 w-auto" />
            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">Stock Market: NVDA, TSLA + Japanese market focus</p>
              <p className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">Weather: Charlotte, Atlanta, Scottsdale</p>
              <p className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">Sports: Falcons, Hawks, Atlanta United, Georgia Football</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">How It Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Choose your topics</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Select only the sections you want in your newsletter.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add details that make it yours</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Pick subtopics, symbols, teams, cities, and preference presets.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Receive in app and email</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Read from your dashboard and get the same issue delivered to your inbox.</p>
            </article>
          </div>
        </section>

        <section id="about" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">About Us</h2>
            <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
              For You Newsletter exists to deliver personalized updates without noise. We focus on helping
              people follow exactly what matters to them in a format they can read quickly every day.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Feature Highlights</h2>
          <ul className="mt-6 grid gap-3 text-sm text-slate-700 dark:text-slate-300 md:grid-cols-2">
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">Personalized topic and detail selection</li>
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">In-app dashboard and email delivery</li>
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">Stock, weather, sports, crypto, and more</li>
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">Readable summaries with structure and context</li>
          </ul>
        </section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
