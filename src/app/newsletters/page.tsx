"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Plus, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Newsletter } from "@/lib/apiContracts";

export default function NewslettersPage() {
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
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
        <h1 className="text-3xl font-black text-gray-900 text-center dark:text-gray-100">My Newsletter</h1>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        <Link
          href="/preferences"
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Create New Newsletter
        </Link>

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
              No newsletters yet. Create your first one to see it here.
            </div>
          )}
          {newsletters.map((newsletter, i) => (
            <Link
              key={newsletter.id ?? i}
              href={`/newsletters/${newsletter.id}`}
              className="block"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-primary hover:shadow-lg hover:border-primary transition-all cursor-pointer dark:bg-slate-900 dark:border-primary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span className="text-sm text-gray-500 font-bold dark:text-gray-400">
                        {new Date(newsletter.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-2 dark:text-gray-100">
                      {newsletter.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {newsletter.topics.map((topic, j) => (
                        <span
                          key={j}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black dark:bg-slate-800 dark:text-gray-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 dark:text-gray-500" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
