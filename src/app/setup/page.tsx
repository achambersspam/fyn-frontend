"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import {
  TIER_LIMITS,
  type Tier,
  type Profile,
  type Newsletter,
  type NewsletterCreatePayload,
} from "@/lib/apiContracts";
import UpgradeModal from "@/components/UpgradeModal";
import TopicPrioritySelector from "@/components/TopicPrioritySelector";
import { allocateByPriority } from "@/lib/allocateByPriority";
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

function generateTimeOptions(start: number, end: number, incrementMin: number) {
  const times: string[] = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += incrementMin) {
      if (h === end && m > 0) break;
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
}

function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${mStr} ${suffix}`;
}

export default function SetupPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("basic");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicDetails, setTopicDetails] = useState<Record<string, string>>({});
  const [topicPriorities, setTopicPriorities] = useState<Record<string, number>>({});
  const [readTimeMin, setReadTimeMin] = useState(3);
  const [frequency, setFrequency] = useState("Daily");
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) setEmail(data.user.email);
      try {
        const p = await api.get<Profile>("/api/me");
        if (p.tier) setTier(p.tier);
      } catch {
        /* ignore */
      }
    }
    init();
  }, [supabase]);

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
    [totalSeconds, selectedTopicPriorities]
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

  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      setSelectedTopics((prev) => prev.filter((t) => t !== label));
      setTopicPriorities((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
      setTopicDetails((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
    } else {
      if (
        limits.maxTopics !== Infinity &&
        selectedTopics.length >= limits.maxTopics
      ) {
        setUpgradeMsg(
          `Your ${tier} plan allows up to ${limits.maxTopics} topics. Upgrade for more.`
        );
        setShowUpgrade(true);
        return;
      }
      setSelectedTopics((prev) => [...prev, label]);
      setTopicPriorities((prev) => ({ ...prev, [label]: 3 }));
    }
  };

  const requiredFieldsValid =
    selectedTopics.length > 0 &&
    readTimeMin > 0 &&
    deliveryTime.length > 0 &&
    timezone.length > 0 &&
    Boolean(frequency.length > 0);

  const canSubmit = requiredFieldsValid && !isSubmitting;
  const validationMessage = !requiredFieldsValid
    ? "Select at least one topic, read time, delivery time, and timezone to continue."
    : null;

  useEffect(() => {
    console.log("FORM VALIDATION DEBUG", {
      topics: selectedTopics,
      topicDetails,
      readTime: readTimeMin,
      deliveryTime,
      timezone,
      allocatedSum,
      totalSeconds,
      allocationValid,
      isValid: canSubmit,
    });
  }, [
    selectedTopics,
    topicDetails,
    readTimeMin,
    deliveryTime,
    timezone,
    allocatedSum,
    totalSeconds,
    allocationValid,
    canSubmit,
  ]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setIsSubmitting(false);
      router.push("/auth");
      return;
    }

    const payload: NewsletterCreatePayload = {
      email,
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

    try {
      const created = await api.post<Newsletter>("/api/newsletters", payload);
      try {
        await api.patch("/api/me", { onboarding_complete: true });
      } catch {
        /* best effort */
      }
      router.push(`/setup/creating?newsletterId=${created.id}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string; details?: unknown } | null;
      const baseMsg = apiErr?.message || "Failed to create newsletter.";
      const detailsText =
        typeof apiErr?.details === "string"
          ? apiErr.details
          : apiErr?.details &&
            typeof apiErr.details === "object" &&
            "finalAttempt" in (apiErr.details as Record<string, unknown>)
          ? (apiErr.details as { finalAttempt?: { message?: string } }).finalAttempt?.message
          : null;
      const msg = detailsText ? `${baseMsg}: ${detailsText}` : baseMsg;
      if (
        typeof msg === "string" &&
        (msg.toLowerCase().includes("limit") ||
          msg.toLowerCase().includes("tier") ||
          msg.toLowerCase().includes("upgrade"))
      ) {
        setUpgradeMsg(msg);
        setShowUpgrade(true);
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-12 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center px-4 sm:px-6 lg:px-10 py-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Newsletter Setup
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
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

        {/* Topic Selection */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Choose Your Topics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select at least 1 topic.{" "}
            {limits.maxTopics !== Infinity && `Max ${limits.maxTopics} on your plan.`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TOPIC_OPTIONS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.label);
              return (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => toggleTopic(topic.label)}
                  className={`h-full min-h-[108px] p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-gray-200 bg-white hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <span
                    className={`block text-sm font-bold ${
                      isSelected
                        ? "text-primary"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {topic.label}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight break-words">
                    {topic.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Per-Topic Details & Priority */}
        {selectedTopics.length > 0 && (
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Topic Details &amp; Priority
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total read time: {readTimeMin} min. Time is allocated by priority
              (1–5 pigeons).
            </p>

            {selectedTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {topic}
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Specific Details (max 200 chars)
                  </label>
                  <textarea
                    value={topicDetails[topic] ?? ""}
                    onChange={(e) =>
                      setTopicDetails((prev) => ({
                        ...prev,
                        [topic]: e.target.value.slice(0, 200),
                      }))
                    }
                    placeholder={
                      TOPIC_DETAIL_PLACEHOLDERS[topic] || DEFAULT_TOPIC_DETAIL_PLACEHOLDER
                    }
                    maxLength={200}
                    rows={3}
                    className="input-field resize-y overflow-y-auto"
                    style={{ minHeight: "80px", maxHeight: "160px" }}
                  />
                  <span className="text-xs text-gray-400">
                    {(topicDetails[topic] ?? "").length}/200
                  </span>
                </div>
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
              Timezone (IANA)
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

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}
        {!error && validationMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            {validationMessage}
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? "Creating..." : "Create Newsletter"}
        </button>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        message={upgradeMsg}
      />
    </div>
  );
}
