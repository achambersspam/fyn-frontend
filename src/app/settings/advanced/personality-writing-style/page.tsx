"use client";

import Link from "next/link";
import { ChevronLeft, Sparkles } from "@/components/Icons";

export default function PersonalityWritingStylePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center px-4 sm:px-6 lg:px-10 py-4">
          <Link
            href="/settings"
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-900"
            aria-label="Back to settings"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Personality/Writing Style
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              coming soon
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Personality and writing-style controls are coming in a future release.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your newsletter will continue using the current default writing style for now.
          </p>
        </div>
      </div>
    </div>
  );
}
