"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Newsletter, NewsletterIssue } from "@/lib/apiContracts";

export default function ReadNewsletterPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [issue, setIssue] = useState<NewsletterIssue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      api.get<Newsletter>(`/api/newsletters/${id}`),
      api.get<NewsletterIssue>(`/api/newsletters/${id}/latest`),
    ])
      .then(([nl, latest]) => {
        setNewsletter(nl);
        setIssue(latest);
      })
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load your newsletter issue.";
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-10">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            {newsletter?.title || "Your Newsletter"}
          </h1>
          <Link href="/dashboard" className="text-sm font-bold text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {isLoading && (
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            Loading your newsletter...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          issue &&
          (issue.body_html?.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: issue.body_html }} />
          ) : (
            <article className="bg-white rounded-3xl border border-gray-200 p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
              {issue.subject && (
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  {issue.subject}
                </h2>
              )}
              {issue.body_text?.trim() ? (
                <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-7 whitespace-pre-wrap">
                  {issue.body_text}
                </div>
              ) : (
                <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-7">
                  This issue is still being prepared.
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
}
