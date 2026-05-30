"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "@/lib/api";
import { getCurrentSession } from "@/lib/supabase";
import type { Newsletter, NewsletterUpdatePayload } from "@/lib/apiContracts";
import { allocateByPriority, inferPriorityFromSeconds } from "@/lib/allocateByPriority";
import TopicPrioritySelector from "@/components/TopicPrioritySelector";
import { ChevronLeft } from "@/components/Icons";

type PriorityTopicRow = {
  key: string;
  topic: string;
  specificDetails?: string;
  priority: number;
};

const DEFAULT_PRIORITY = 3;

const buildPriorityRows = (newsletter: Newsletter): PriorityTopicRow[] => {
  const totalSeconds = Math.max(60, (newsletter.read_time_minutes || 1) * 60);
  const rowCount = Math.max(1, newsletter.topics.length);
  return newsletter.topics.map((topic, index) => ({
    key: topic.id || `${topic.topic}-${index}`,
    topic: topic.topic,
    specificDetails: topic.specific_details || undefined,
    priority:
      typeof topic.allocated_seconds === "number"
        ? inferPriorityFromSeconds(topic.allocated_seconds, totalSeconds, rowCount)
        : DEFAULT_PRIORITY,
  }));
};

export default function PigeonTopicPriorityPage() {
  const router = useRouter();

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState("");
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [priorityRows, setPriorityRows] = useState<PriorityTopicRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const session = await getCurrentSession({ retries: 2, retryDelayMs: 180 });
      if (!session?.access_token) {
        router.replace("/auth");
        return;
      }

      try {
        const list = await api.get<Newsletter[]>("/api/newsletters");
        if (cancelled) return;
        setNewsletters(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) {
          setSelectedNewsletterId((prev) => prev || list[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load newsletters.";
        setError(message);
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
    if (!selectedNewsletterId) {
      setSelectedNewsletter(null);
      setPriorityRows([]);
      return;
    }
    let cancelled = false;
    const loadNewsletter = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const newsletter = await api.get<Newsletter>(`/api/newsletters/${selectedNewsletterId}`);
        if (cancelled) return;
        setSelectedNewsletter(newsletter);
        setPriorityRows(buildPriorityRows(newsletter));
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
            : "Unable to load newsletter priorities.";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void loadNewsletter();
    return () => {
      cancelled = true;
    };
  }, [router, selectedNewsletterId]);

  const totalSeconds = useMemo(
    () => Math.max(60, (selectedNewsletter?.read_time_minutes || 1) * 60),
    [selectedNewsletter?.read_time_minutes]
  );

  const priorityMap = useMemo(
    () =>
      priorityRows.reduce<Record<string, number>>((acc, row) => {
        acc[row.key] = row.priority ?? DEFAULT_PRIORITY;
        return acc;
      }, {}),
    [priorityRows]
  );

  const allocatedSecondsByRow = useMemo(
    () => allocateByPriority(totalSeconds, priorityMap),
    [priorityMap, totalSeconds]
  );

  const updatePriority = (rowKey: string, priority: number) => {
    setPriorityRows((prev) =>
      prev.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              priority,
            }
          : row
      )
    );
  };

  const handleSave = async () => {
    if (!selectedNewsletter) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: NewsletterUpdatePayload = {
        email: selectedNewsletter.email,
        topics: priorityRows.map((row) => ({
          topic: row.topic,
          specific_details: row.specificDetails,
          allocated_seconds: allocatedSecondsByRow[row.key] ?? 20,
        })),
        frequency: selectedNewsletter.frequency,
        delivery_time: selectedNewsletter.delivery_time,
        timezone: selectedNewsletter.timezone,
        schedule_weekday: selectedNewsletter.schedule_weekday,
        monthly_day_of_month: selectedNewsletter.monthly_day_of_month,
        read_time_minutes: selectedNewsletter.read_time_minutes,
      };
      await api.put(`/api/newsletters/${selectedNewsletter.id}`, payload);
      setSuccess("Pigeon topic priorities saved.");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to save priorities.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

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
            Pigeon Topic Priority System
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-500/80 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            {success}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Choose a Newsletter
          </h2>
          <select
            value={selectedNewsletterId}
            onChange={(event) => setSelectedNewsletterId(event.target.value)}
            className="input-field"
            disabled={isLoading || newsletters.length === 0}
          >
            {newsletters.length === 0 ? (
              <option value="">No newsletters found</option>
            ) : (
              newsletters.map((newsletter) => (
                <option key={newsletter.id} value={newsletter.id}>
                  {newsletter.title || "Newsletter"}
                </option>
              ))
            )}
          </select>
        </section>

        {!isLoading && selectedNewsletter && priorityRows.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50 space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Adjust Topic Priorities
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              More pigeons allocate more time to that topic in the newsletter.
            </p>
            {priorityRows.map((row) => (
              <div
                key={row.key}
                className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {row.topic}
                </h3>
                {row.specificDetails && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Details: {row.specificDetails}
                  </p>
                )}
                <TopicPrioritySelector
                  topic={row.topic}
                  priority={row.priority}
                  onPriorityChange={(priority) => updatePriority(row.key, priority)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? "Saving..." : "Save Topic Priorities"}
            </button>
          </section>
        )}

        {!isLoading && newsletters.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
            Create a newsletter first, then come back to adjust topic priorities.
          </div>
        )}
      </div>
    </div>
  );
}
