"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import type {
  Newsletter,
  NewsletterUpdatePayload,
  Profile,
} from "@/lib/apiContracts";
import { TIER_LIMITS, type Tier } from "@/lib/apiContracts";
import SaveNotification from "@/components/SaveNotification";
import UnsavedChangesModal from "@/components/UnsavedChangesModal";
import TopicPrioritySelector from "@/components/TopicPrioritySelector";
import {
  allocateByPriority,
  inferPriorityFromSeconds,
} from "@/lib/allocateByPriority";
import {
  DEFAULT_TOPIC_DETAIL_PLACEHOLDER,
  TOPIC_DETAIL_PLACEHOLDERS,
  TOPIC_OPTIONS,
} from "@/lib/topics/topicConfig";

const FREQUENCIES = ["Daily", "Mon/Wed/Fri", "Weekly", "Bi-Weekly", "Monthly"];
const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

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
  return Math.round(value * 2) / 2;
}

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
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [email, setEmail] = useState("");
  const [nextSend, setNextSend] = useState<string | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [nearSendWarning, setNearSendWarning] = useState(false);

  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
  const totalSeconds = readTimeMin * 60;
  const topicSeconds = useMemo(
    () => allocateByPriority(totalSeconds, topicPriorities),
    [totalSeconds, topicPriorities]
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
        timezone,
      }),
    [
      selectedTopics,
      topicDetails,
      topicPriorities,
      readTimeMin,
      frequency,
      deliveryTime,
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
          : timeOpts[0] ?? "08:00";

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
            dets[t.topic] = t.specific_details;
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
        setDeliveryTime(clampedDeliveryTime);
        setTimezone(
          TIMEZONE_OPTIONS.includes(nl.timezone) ? nl.timezone : "America/New_York"
        );
        setEmail(nl.email ?? "");
        setNextSend(nl.next_send_at_utc ?? null);

        const snap = JSON.stringify({
          selectedTopics: topics,
          topicDetails: dets,
          topicPriorities: prios,
          readTimeMin: clampedReadTime,
          frequency: nl.frequency,
          deliveryTime: clampedDeliveryTime,
          timezone: TIMEZONE_OPTIONS.includes(nl.timezone)
            ? nl.timezone
            : "America/New_York",
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

  const handleSave = useCallback(async () => {
    if (!id) {
      setError("Missing newsletter id.");
      return;
    }
    if (selectedTopics.length === 0) {
      setError("Select at least one topic.");
      return;
    }
    if (
      limits.maxTopics !== Infinity &&
      selectedTopics.length > limits.maxTopics
    ) {
      setError(`Your ${tier} plan allows up to ${limits.maxTopics} topics.`);
      return;
    }
    if (readTimeMin < limits.minReadTimeMin || readTimeMin > limits.maxReadTimeMin) {
      setError(
        `Read time must be between ${limits.minReadTimeMin} and ${limits.maxReadTimeMin} minutes for your plan.`
      );
      return;
    }
    if (!timeOptions.includes(deliveryTime)) {
      setError("Delivery time is outside your plan's allowed schedule window.");
      return;
    }
    if (!allocationValid) {
      setError(`Allocations must sum to exactly ${totalSeconds}s.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    setNearSendWarning(false);

    const payload: NewsletterUpdatePayload = {
      email: email || undefined,
      topics: selectedTopics.map((t) => ({
        topic: t,
        specific_details: topicDetails[t] || undefined,
        allocated_seconds: topicSeconds[t] ?? 20,
      })),
      frequency,
      delivery_time: deliveryTime,
      timezone,
      read_time_minutes: readTimeMin,
    };
    const saveEndpoint = `/api/newsletters/${id}`;

    try {
      console.debug("Newsletter save request", {
        id,
        endpoint: saveEndpoint,
        payloadSummary: {
          topicCount: payload.topics?.length ?? 0,
          read_time_minutes: payload.read_time_minutes,
          frequency: payload.frequency,
          delivery_time: payload.delivery_time,
          timezone: payload.timezone,
        },
      });
      await api.put(saveEndpoint, payload);
      setSavedSnapshot(currentSnapshot);
      setShowSaved(true);

      if (nextSend) {
        const diff =
          new Date(nextSend).getTime() - Date.now();
        if (diff > 0 && diff < 30 * 60 * 1000) {
          setNearSendWarning(true);
        }
      }
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
      console.error("Newsletter save failed", {
        id,
        endpoint: saveEndpoint,
        payload,
        error: err,
      });
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedTopics,
    topicDetails,
    topicSeconds,
    topicPriorities,
    frequency,
    deliveryTime,
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
  ]);

  const handleBack = () => {
    if (isDirty) {
      setPendingNav(() => () => router.back());
      setShowUnsaved(true);
    } else {
      router.back();
    }
  };

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
    !isSaving;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <p className="text-gray-500 font-semibold dark:text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12 dark:bg-slate-950">
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
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

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

        {/* Topics */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Topics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {renderTopicLabels.map((t) => {
              const sel = selectedTopics.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`h-full min-h-[88px] p-3 rounded-2xl border-2 text-left text-sm font-bold transition-all ${
                    sel
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 text-gray-900 dark:border-slate-800 dark:text-gray-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        {/* Per-topic details & priority */}
        {selectedTopics.length > 0 && (
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Details &amp; Priority
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Time is allocated by priority (1–5 pigeons).
            </p>
            {selectedTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {topic}
                </h3>
                <textarea
                  value={topicDetails[topic] ?? ""}
                  onChange={(e) =>
                    setTopicDetails((p) => ({
                      ...p,
                      [topic]: e.target.value.slice(0, 200),
                    }))
                  }
                  maxLength={200}
                  rows={3}
                  placeholder={
                    TOPIC_DETAIL_PLACEHOLDERS[topic] || DEFAULT_TOPIC_DETAIL_PLACEHOLDER
                  }
                  className="input-field resize-y overflow-y-auto"
                  style={{ minHeight: "80px", maxHeight: "160px" }}
                />
                <TopicPrioritySelector
                  topic={topic}
                  priority={topicPriorities[topic] ?? 3}
                  onPriorityChange={(p) =>
                    setTopicPriorities((prev) => ({ ...prev, [topic]: p }))
                  }
                />
              </div>
            ))}
          </section>
        )}

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Your Delivery Settings
          </h2>

          {/* Read Time */}
          <section className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Read Time: {readTimeMin} min
            </label>
            <input
              type="range"
              min={limits.minReadTimeMin}
              max={limits.maxReadTimeMin}
              step={0.5}
              value={readTimeMin}
              onChange={(e) => setReadTimeMin(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
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
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </section>
        </section>


        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <UnsavedChangesModal
        open={showUnsaved}
        onSave={async () => {
          setShowUnsaved(false);
          await handleSave();
          pendingNav?.();
        }}
        onDiscard={() => {
          setShowUnsaved(false);
          pendingNav?.();
        }}
        onCancel={() => {
          setShowUnsaved(false);
          setPendingNav(null);
        }}
      />
    </div>
  );
}
