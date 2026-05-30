"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type ApiError } from "@/lib/api";
import type { Newsletter, NewsletterIssue } from "@/lib/apiContracts";
import { getCurrentSession } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export default function ReadNewsletterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [issue, setIssue] = useState<NewsletterIssue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
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
        const [nl, latest] = await Promise.all([
          api.get<Newsletter>(`/api/newsletters/${id}`),
          api.get<NewsletterIssue>(`/api/newsletters/${id}/latest`),
        ]);
        if (cancelled) return;
        setNewsletter(nl);
        setIssue(latest);
        void trackEvent("newsletter_read_in_dashboard", {
          source: "read_page",
          newsletter_id: id,
        });
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          router.replace("/auth");
          return;
        }
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load your newsletter issue.";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

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
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
              <span>Loading your newsletter...</span>
            </div>
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
