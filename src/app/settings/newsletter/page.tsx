"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import type { Newsletter } from "@/lib/apiContracts";

export default function NewsletterSettingsPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    api
      .get<Newsletter[]>("/newsletters")
      .then((data) => setNewsletters(Array.isArray(data) ? data : []))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load newsletters.";
        setError(message);
        setNewsletters([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-slate-900"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">Manage Newsletter</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        <div className="space-y-4">
          {isLoading && (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
              Loading newsletters...
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-center font-semibold dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-200">
              {error}
            </div>
          )}
          {newsletters.length === 0 && !isLoading && !error && (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
              No newsletters yet. Create your first one to edit it here.
            </div>
          )}
          {newsletters.map((newsletter, index) => (
            <Link
              key={newsletter.id ?? index}
              href={`/newsletters/${newsletter.id}`}
              className="block bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary transition-all dark:bg-slate-900 dark:border-slate-800"
            >
              <p className="text-xs font-black text-gray-500 tracking-widest mb-2 dark:text-gray-400">
                YOUR NEWSLETTER
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    {newsletter.title}
                  </h2>
                  <p className="text-sm text-gray-600 font-medium mt-2 dark:text-gray-300">
                    Topics, frequency, and delivery time can be updated anytime.
                  </p>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0 dark:text-gray-500" size={20} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {newsletter.topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black dark:bg-slate-800 dark:text-gray-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/preferences"
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          <SlidersHorizontal size={18} />
          Create New Newsletter
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
