"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "@/components/Icons";
import * as Icons from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import type {
  Newsletter,
  NewsletterUpdatePayload,
  Profile,
} from "@/lib/apiContracts";
import { TIER_LIMITS, type Tier } from "@/lib/apiContracts";
import SaveNotification from "@/components/SaveNotification";
import UnsavedChangesModal from "@/components/UnsavedChangesModal";
import {
  allocateByPriority,
  inferPriorityFromSeconds,
} from "@/lib/allocateByPriority";
import {
  TOPIC_OPTIONS,
} from "@/lib/topics/topicConfig";
import {
  DEFAULT_TIMEZONE_VALUE,
  getTimezoneOptionByIana,
  getTimezoneOptionByValue,
  TIMEZONE_OPTIONS,
} from "@/lib/timezones";
import { validateTopicDetailsPreflight } from "@/lib/topics/validateTopicDetails";
import { normalizeTopicDetailsForSave } from "@/lib/topics/normalizeTopicDetailsForSave";
import TopicDetailEditor from "@/components/topic-details/TopicDetailEditor";
import { trackEvent } from "@/lib/analytics";

const FREQUENCIES = ["Daily", "Mon/Wed/Fri", "Weekly", "Bi-Weekly", "Monthly"];
const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];
const MONTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, idx) => idx + 1);

function generateTimeOptions(start: number, end: number, inc: number) {
  const t: string[] = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += inc) {
      if (h === end && m > 0) break;
      t.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return t;
}

function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${d}:${mStr} ${suffix}`;
}

function roundToHalfMin(value: number): number {
  return Math.round(value);
}

const INVALID_DETAILS_PAUSE_WARNING =
  "We could not understand part of your newsletter details. If you leave this page, your newsletter will be fully paused until valid details are saved.";
const SAVE_SLOW_THRESHOLD_MS = 1200;

export default function EditNewsletterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [tier, setTier] = useState<Tier>("basic");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicDetails, setTopicDetails] = useState<Record<string, string>>({});
  const [topicPriorities, setTopicPriorities] = useState<Record<string, number>>({});
  const [readTimeMin, setReadTimeMin] = useState(3);
  const [frequency, setFrequency] = useState("Daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [scheduleWeekday, setScheduleWeekday] = useState<number>(1);
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(1);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE_VALUE);
  const [email, setEmail] = useState("");
  const [nextSend, setNextSend] = useState<string | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [hasInvalidDetailsState, setHasInvalidDetailsState] = useState(false);
  const [showInvalidLeaveWarning, setShowInvalidLeaveWarning] = useState(false);
  const [isPausingForExit, setIsPausingForExit] = useState(false);
  const [nearSendWarning, setNearSendWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
  const totalSeconds = readTimeMin * 60;
  const selectedTopicPriorities = useMemo(
    () =>
      selectedTopics.reduce<Record<string, number>>((acc, topic) => {
        acc[topic] = topicPriorities[topic] ?? 3;
        return acc;
      }, {}),
    [selectedTopics, topicPriorities]
  );
  const topicSeconds = useMemo(
    () => allocateByPriority(totalSeconds, selectedTopicPriorities),
    [selectedTopicPriorities, totalSeconds]
  );
  const allocatedSum = useMemo(
    () => selectedTopics.reduce((s, t) => s + (topicSeconds[t] ?? 0), 0),
    [selectedTopics, topicSeconds]
  );
  const allocationValid = allocatedSum === totalSeconds;

  const timeOptions = useMemo(
    () =>
      generateTimeOptions(
        limits.deliveryWindowStart,
        limits.deliveryWindowEnd,
        limits.incrementMinutes
      ),
    [limits]
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        selectedTopics,
        topicDetails,
        topicPriorities,
        readTimeMin,
        frequency,
        deliveryTime,
        scheduleWeekday,
        monthlyDayOfMonth,
        timezone,
      }),
    [
      selectedTopics,
      topicDetails,
      topicPriorities,
      readTimeMin,
      frequency,
      deliveryTime,
      scheduleWeekday,
      monthlyDayOfMonth,
      timezone,
    ]
  );

  const isDirty = savedSnapshot !== "" && currentSnapshot !== savedSnapshot;
  const knownTopicLabels = useMemo(
    () => TOPIC_OPTIONS.map((topic) => topic.label),
    []
  );
  const renderTopicLabels = useMemo(() => {
    const known = new Set(knownTopicLabels);
    const selectedLegacy = selectedTopics.filter((topic) => !known.has(topic));
    return [...knownTopicLabels, ...selectedLegacy];
  }, [knownTopicLabels, selectedTopics]);

  useEffect(() => {
    Promise.all([
      api.get<Newsletter>(`/api/newsletters/${id}`),
      api.get<Profile>("/api/me").catch(() => null),
    ])
      .then(([nl, prof]) => {
        const resolvedTier: Tier = prof?.tier ?? "basic";
        setTier(resolvedTier);
        const resolvedLimits = TIER_LIMITS[resolvedTier] ?? TIER_LIMITS.basic;

        const timeOpts = generateTimeOptions(
          resolvedLimits.deliveryWindowStart,
          resolvedLimits.deliveryWindowEnd,
          resolvedLimits.incrementMinutes
        );
        const clampedDeliveryTime = timeOpts.includes(nl.delivery_time)
          ? nl.delivery_time
          : timeOpts[0] ?? "09:00";

        const clampedReadTime = roundToHalfMin(
          Math.max(
            resolvedLimits.minReadTimeMin,
            Math.min(resolvedLimits.maxReadTimeMin, nl.read_time_minutes)
          )
        );

        let topics = nl.topics.map((t) => t.topic);
        let dets: Record<string, string> = {};
        let prios: Record<string, number> = {};

        if (topics.length > resolvedLimits.maxTopics) {
          topics = topics.slice(0, resolvedLimits.maxTopics);
        }
        nl.topics.forEach((t) => {
          if (topics.includes(t.topic) && t.specific_details) {
            const nextDetails = t.specific_details.trim();
            if (!nextDetails) return;
            dets[t.topic] = dets[t.topic]
              ? `${dets[t.topic]}; ${nextDetails}`
              : nextDetails;
          }
        });

        const totalSec = clampedReadTime * 60;
        nl.topics.forEach((t) => {
          if (topics.includes(t.topic)) {
            prios[t.topic] = inferPriorityFromSeconds(
              t.allocated_seconds,
              totalSec,
              topics.length
            );
          }
        });
        topics.forEach((t) => {
          if (prios[t] === undefined) prios[t] = 3;
        });

        setSelectedTopics(topics);
        setTopicDetails(dets);
        setTopicPriorities(prios);
        setReadTimeMin(clampedReadTime);
        setFrequency(nl.frequency);
        setScheduleWeekday(nl.schedule_weekday ?? 1);
        setMonthlyDayOfMonth(nl.monthly_day_of_month ?? 1);
        setDeliveryTime(clampedDeliveryTime);
        setTimezone(getTimezoneOptionByIana(nl.timezone)?.value || DEFAULT_TIMEZONE_VALUE);
        setEmail(nl.email ?? "");
        setNextSend(nl.next_send_at_utc ?? null);

        const snap = JSON.stringify({
          selectedTopics: topics,
          topicDetails: dets,
          topicPriorities: prios,
          readTimeMin: clampedReadTime,
          frequency: nl.frequency,
          deliveryTime: clampedDeliveryTime,
          scheduleWeekday: nl.schedule_weekday ?? 1,
          monthlyDayOfMonth: nl.monthly_day_of_month ?? 1,
          timezone: getTimezoneOptionByIana(nl.timezone)?.value || DEFAULT_TIMEZONE_VALUE,
        });
        setSavedSnapshot(snap);
      })
      .catch((err) => {
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load newsletter.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    void router.prefetch("/dashboard");
    void router.prefetch("/newsletter");
    if (id) {
      void router.prefetch(`/newsletter/${id}/read`);
    }
  }, [id, router]);

  const isInvalidDetailsApiError = useCallback((msg: string, details: unknown) => {
    const code =
      details &&
      typeof details === "object" &&
      "code" in details &&
      typeof (details as { code?: unknown }).code === "string"
        ? String((details as { code: string }).code)
        : "";
    const lowered = msg.toLowerCase();
    return (
      code === "SPORT_RESOLUTION_REJECTED" ||
      lowered.includes("could not recognize one or more teams") ||
      lowered.includes("could not understand part of your newsletter details")
    );
  }, []);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const saveStartedAt = performance.now();
    if (!id) {
      setError("Missing newsletter id.");
      return false;
    }
    if (selectedTopics.length === 0) {
      void trackEvent("validation_error_seen", {
        flow: "newsletter_edit",
        reason: "no_topics_selected",
      });
      setError("Select at least one topic.");
      return false;
    }
    if (
      limits.maxTopics !== Infinity &&
      selectedTopics.length > limits.maxTopics
    ) {
      setError(`Your ${tier} plan allows up to ${limits.maxTopics} topics.`);
      return false;
    }
    if (readTimeMin < limits.minReadTimeMin || readTimeMin > limits.maxReadTimeMin) {
      setError(
        `Read time must be between ${limits.minReadTimeMin} and ${limits.maxReadTimeMin} minutes for your plan.`
      );
      return false;
    }
    if (!timeOptions.includes(deliveryTime)) {
      setError("Delivery time is outside your plan's allowed schedule window.");
      return false;
    }
    const needsWeekday = frequency === "Weekly" || frequency === "Bi-Weekly";
    const needsMonthlyDay = frequency === "Monthly";
    if (needsWeekday) {
      if (!Number.isInteger(scheduleWeekday) || scheduleWeekday < 1 || scheduleWeekday > 7) {
        setError("Please choose one weekday for your selected frequency.");
        return false;
      }
      if (tier !== "premium" && scheduleWeekday > 5) {
        setError("Weekend delivery is only available for premium.");
        return false;
      }
    }
    if (needsMonthlyDay && (!Number.isInteger(monthlyDayOfMonth) || monthlyDayOfMonth < 1 || monthlyDayOfMonth > 31)) {
      setError("Please choose a valid monthly day between 1 and 31.");
      return false;
    }
    if (!allocationValid) {
      setError(`Allocations must sum to exactly ${totalSeconds}s.`);
      return false;
    }
    const detailsForValidation = selectedTopics.reduce<Record<string, string>>((acc, topic) => {
      acc[topic] = normalizeTopicDetailsForSave(topic, topicDetails[topic]) || "";
      return acc;
    }, {});
    const preflightIssues = validateTopicDetailsPreflight(detailsForValidation);
    if (preflightIssues.length > 0) {
      const firstIssue = preflightIssues[0];
      void trackEvent("topic_detail_validation_failed", {
        topic: firstIssue.topic,
      });
      setError(`${firstIssue.topic} details need a fix before saving. ${firstIssue.message}`);
      setHasInvalidDetailsState(true);
      return false;
    }

    setIsSaving(true);
    setError(null);
    setNearSendWarning(false);

    const selectedTimezone = getTimezoneOptionByValue(timezone);
    const payload: NewsletterUpdatePayload = {
      email: email || undefined,
      topics: selectedTopics.map((t) => ({
        topic: t,
        specific_details: normalizeTopicDetailsForSave(t, topicDetails[t]),
        allocated_seconds: topicSeconds[t] ?? 20,
      })),
      frequency,
      delivery_time: deliveryTime,
      timezone: selectedTimezone?.iana || "America/New_York",
      schedule_weekday: needsWeekday ? scheduleWeekday : undefined,
      monthly_day_of_month: needsMonthlyDay ? monthlyDayOfMonth : undefined,
      read_time_minutes: readTimeMin,
    };
    const saveEndpoint = `/api/newsletters/${id}`;

    try {
      await api.put(saveEndpoint, payload);
      const saveDurationMs = Math.max(0, Math.round(performance.now() - saveStartedAt));
      if (process.env.NODE_ENV !== "production") {
        console.log("UI_ACTION_TIMING", {
          action: "save_newsletter",
          duration_ms: saveDurationMs,
          success: true,
        });
      }
      if (saveDurationMs >= SAVE_SLOW_THRESHOLD_MS) {
        void trackEvent("ui_action_timing", {
          action: "save_newsletter",
          duration_ms: saveDurationMs,
          success: true,
        });
      }
      void trackEvent("newsletter_updated", {
        source: "newsletter_edit_page",
        topic_count: selectedTopics.length,
        frequency,
      });
      setSavedSnapshot(currentSnapshot);
      setShowSaved(true);
      setHasInvalidDetailsState(false);

      if (nextSend) {
        const diff =
          new Date(nextSend).getTime() - Date.now();
        if (diff > 0 && diff < 30 * 60 * 1000) {
          setNearSendWarning(true);
        }
      }
      return true;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const details =
        Array.isArray(apiErr?.details) && apiErr.details.length > 0
          ? apiErr.details.filter((item): item is string => typeof item === "string")
          : [];
      const msg =
        details.length > 0
          ? details.join(" ")
          : err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to save changes.";
      setHasInvalidDetailsState(isInvalidDetailsApiError(msg, apiErr?.details));
      const saveDurationMs = Math.max(0, Math.round(performance.now() - saveStartedAt));
      if (process.env.NODE_ENV !== "production") {
        console.log("UI_ACTION_TIMING", {
          action: "save_newsletter",
          duration_ms: saveDurationMs,
          success: false,
        });
      }
      void trackEvent("validation_error_seen", {
        flow: "newsletter_edit_save",
        reason: "api_error",
      });
      setError(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedTopics,
    topicDetails,
    topicSeconds,
    selectedTopicPriorities,
    frequency,
    deliveryTime,
    scheduleWeekday,
    monthlyDayOfMonth,
    timezone,
    email,
    readTimeMin,
    id,
    currentSnapshot,
    nextSend,
    limits,
    tier,
    timeOptions,
    allocationValid,
    totalSeconds,
    isInvalidDetailsApiError,
  ]);

  const promptLeaveForInvalidDetails = useCallback((nextNav: () => void) => {
    setPendingNav(() => nextNav);
    setShowInvalidLeaveWarning(true);
  }, []);

  const handleBack = () => {
    if (hasInvalidDetailsState) {
      promptLeaveForInvalidDetails(() => router.back());
      return;
    }
    if (isDirty) {
      setPendingNav(() => () => router.back());
      setShowUnsaved(true);
    } else {
      router.back();
    }
  };

  const handleDelete = useCallback(async () => {
    if (!id || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/newsletters/${id}`);
      router.push("/newsletter");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to delete newsletter.";
      setError(message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [id, isDeleting, router]);

  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      setSelectedTopics((p) => p.filter((t) => t !== label));
    } else {
      setSelectedTopics((p) => [...p, label]);
      setTopicPriorities((prev) => ({ ...prev, [label]: 3 }));
    }
  };

  const canSave =
    selectedTopics.length > 0 &&
    frequency.length > 0 &&
    deliveryTime.length > 0 &&
    timezone.length > 0 &&
    allocationValid &&
    !isSaving &&
    !isDeleting;
  const requiresWeekday = frequency === "Weekly" || frequency === "Bi-Weekly";
  const requiresMonthlyDay = frequency === "Monthly";
  const tierDisallowsWeekend = tier !== "premium";
  const weekdayHelperText =
    frequency === "Bi-Weekly"
      ? "Choose your bi-weekly delivery day"
      : "Choose one delivery weekday";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 dark:bg-slate-950">
        <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-300">
              <span className="h-4 w-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400" />
              <span>Loading newsletter settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 dark:bg-slate-950">
      <SaveNotification
        show={showSaved}
        onDone={() => setShowSaved(false)}
      />

      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Edit Newsletter
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        {nearSendWarning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            Your next newsletter is scheduled within 30 minutes. Changes may
            apply to the following delivery cycle.
          </div>
        )}

        <div className="flex justify-center mb-8">
          <img
            src="/logo-pigeon-newsletter-header.svg"
            alt="For You Newsletter"
            className="h-60 w-auto"
          />
        </div>

        {/* Delivery Email */}
        <section className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Delivery Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="input-field bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
          />
        </section>

        {/* Topics */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Choose Your Topics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select at least 1 topic.{" "}
            {limits.maxTopics !== Infinity && `Max ${limits.maxTopics} on your plan.`}
          </p>
          <div className="grid grid-cols-2 items-stretch sm:grid-cols-3 gap-4">
            {renderTopicLabels.map((t) => {
              const sel = selectedTopics.includes(t);
              const option = TOPIC_OPTIONS.find((topic) => topic.label === t);
              const isMotivational = t === "Motivational Quotes/Stories";
              const TopicIcon =
                (Icons as Record<
                  string,
                  ComponentType<{ size?: number; className?: string }>
                >)[option?.icon || ""] || Icons.ChevronRight;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`flex h-full min-h-[94px] w-full flex-col self-stretch p-3.5 rounded-2xl border-2 text-left transition-all ${
                    sel
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-gray-200 bg-white hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div
                    className={
                      isMotivational
                        ? "flex h-[2.625rem] shrink-0 items-start justify-between gap-2"
                        : "flex shrink-0 items-start justify-between gap-2"
                    }
                  >
                    <span
                      className={`min-w-0 flex-1 text-sm font-bold leading-snug line-clamp-2 ${
                        sel ? "text-primary" : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {t}
                    </span>
                    <span className="-mt-0.5 inline-flex shrink-0 items-center justify-center self-start w-6 h-6 rounded-md border border-sky-300 text-sky-500 dark:border-sky-700 dark:text-sky-300">
                      <TopicIcon size={13} />
                    </span>
                  </div>
                  <span
                    className={`block text-xs text-gray-500 dark:text-gray-400 leading-snug break-words ${
                      isMotivational ? "mt-1" : "mt-0.5"
                    }`}
                  >
                    {option?.description || ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Per-topic details */}
        {selectedTopics.length > 0 && (
          <div className="relative">
            <div className="absolute left-[-250px] top-[118px] hidden md:block">
              <img
                src="/logo-pigeon-instructions-details.svg"
                alt="instructions"
                className="h-56 w-auto object-contain"
              />
            </div>
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Topic Details
            </h2>
            {selectedTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {topic}
                </h3>
                <div>
                  <TopicDetailEditor
                    topic={topic}
                    value={topicDetails[topic] ?? ""}
                    tier={tier}
                    onChange={(nextValue) =>
                      setTopicDetails((p) => ({
                        ...p,
                        [topic]: nextValue,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </section>
          </div>
        )}

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Your Delivery Settings
          </h2>

          {/* Read Time */}
          <section className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Total Read Time: {readTimeMin} min
            </label>
            <input
              type="range"
              min={limits.minReadTimeMin}
              max={limits.maxReadTimeMin}
              step={1}
              value={readTimeMin}
              onChange={(e) => setReadTimeMin(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{limits.minReadTimeMin} min</span>
              <span>{limits.maxReadTimeMin} min</span>
            </div>
          </section>

          {/* Frequency */}
          <section className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`tag-chip ${
                    frequency === f ? "tag-chip-selected" : "tag-chip-unselected"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {requiresWeekday && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {weekdayHelperText}
                </p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((day) => {
                    const weekendBlocked = tierDisallowsWeekend && day.value >= 6;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setScheduleWeekday(day.value)}
                        disabled={weekendBlocked}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          scheduleWeekday === day.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-gray-200 dark:bg-slate-900 dark:text-gray-200 dark:border-slate-700"
                        } ${weekendBlocked ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {requiresMonthlyDay && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Choose a day of month
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {MONTH_DAY_OPTIONS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setMonthlyDayOfMonth(day)}
                      className={`h-8 rounded-md text-xs font-bold border transition-all ${
                        monthlyDayOfMonth === day
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-200 dark:bg-slate-900 dark:text-gray-200 dark:border-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Delivery Time */}
          <section className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Delivery Time
            </label>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="input-field"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </select>
          </section>

          {/* Timezone */}
          <section className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-field"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </section>
        </section>


        {error && (
          <div className="rounded-xl border border-red-500/80 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSaving || isDeleting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isDeleting ? "Deleting..." : "Delete Newsletter"}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Delete Newsletter
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This action is not reversible. Deleting this newsletter will permanently remove it.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Newsletter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvalidLeaveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-100">
              Invalid Details Detected
            </h3>
            <p className="text-sm font-semibold text-white">
              {INVALID_DETAILS_PAUSE_WARNING}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowInvalidLeaveWarning(false)}
                disabled={isPausingForExit}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-bold text-gray-200 transition-all hover:bg-slate-800 disabled:opacity-60"
              >
                Stay on page
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!id || isPausingForExit) return;
                  setIsPausingForExit(true);
                  try {
                    await api.patch(`/api/newsletters/${id}/pause`, { is_paused: true });
                  } catch {
                    // best-effort pause before navigating away
                  } finally {
                    setIsPausingForExit(false);
                    setShowInvalidLeaveWarning(false);
                    const targetNav = pendingNav;
                    setPendingNav(null);
                    targetNav?.();
                  }
                }}
                disabled={isPausingForExit}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
              >
                {isPausingForExit ? "Pausing..." : "Leave and pause"}
              </button>
            </div>
          </div>
        </div>
      )}

      <UnsavedChangesModal
        open={showUnsaved}
        onSave={async () => {
          const targetNav = pendingNav;
          const saveSucceeded = await handleSave();
          if (!saveSucceeded) return;
          setShowUnsaved(false);
          setPendingNav(null);
          targetNav?.();
        }}
        onDiscard={() => {
          setShowUnsaved(false);
          if (hasInvalidDetailsState) {
            setShowInvalidLeaveWarning(true);
            return;
          }
          pendingNav?.();
          setPendingNav(null);
        }}
        onCancel={() => {
          setShowUnsaved(false);
          setPendingNav(null);
        }}
      />
    </div>
  );
}
