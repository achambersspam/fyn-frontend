"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type ApiError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const START_HEADER = "Your newsletter is being created!";
const DONE_HEADER =
  "Your personalized newsletter is written and ready for you to read!";

type GenerateResponse = {
  success: boolean;
  issue_id: string;
  status?: string;
  duplicate?: boolean;
};

function CreatingNewsletterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get("newsletterId") || "";

  const [header, setHeader] = useState(START_HEADER);
  const [progress, setProgress] = useState(6);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const runFirstIssue = useCallback(async () => {
    if (!newsletterId || inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);
    setHeader(START_HEADER);
    setProgress(6);
    setIsRunning(true);

    const tick = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + 2));
    }, 180);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        window.clearInterval(tick);
        setError("Session expired. Please log in again.");
        setIsRunning(false);
        return;
      }

      await api.post<GenerateResponse>("/api/generate-newsletter", {
        newsletterId,
        mode: "first_issue",
      });

      window.clearInterval(tick);
      setProgress(100);
      setHeader(DONE_HEADER);
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      window.clearInterval(tick);
      const apiErr = err as ApiError | null;
      const msg =
        apiErr?.status === 401
          ? "Session expired. Please log in again."
          : apiErr?.message || "Failed to generate your first newsletter issue.";
      setError(msg);
      setIsRunning(false);
      setProgress((p) => (p > 95 ? 95 : p));
    } finally {
      inFlightRef.current = false;
    }
  }, [newsletterId, router]);

  useEffect(() => {
    if (!newsletterId) {
      setError("Missing newsletter id. Please go back and create a newsletter again.");
      return;
    }
    runFirstIssue();
  }, [newsletterId, runFirstIssue]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
          {header}
        </h1>

        <div className="flex justify-center">
          <img
            src="/logo-pigeon-devices.svg"
            alt="For You Newsletter"
            className="h-44 w-auto object-contain"
          />
        </div>

        <div className="w-full rounded-full bg-sky-100 dark:bg-sky-950/50 h-4 overflow-hidden">
          <div
            className="h-4 bg-[#8ad8ff] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        {error && (
          <div className="space-y-4">
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </p>
            <button
              type="button"
              onClick={runFirstIssue}
              disabled={isRunning}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatingNewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl text-center space-y-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
              {START_HEADER}
            </h1>
            <div className="flex justify-center">
              <img
                src="/logo-pigeon-devices.svg"
                alt="For You Newsletter"
                className="h-44 w-auto object-contain"
              />
            </div>
            <div className="w-full rounded-full bg-sky-100 dark:bg-sky-950/50 h-4 overflow-hidden">
              <div className="h-4 bg-[#8ad8ff] w-1/4" />
            </div>
          </div>
        </div>
      }
    >
      <CreatingNewsletterContent />
    </Suspense>
  );
}
