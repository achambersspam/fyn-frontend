"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import * as Icons from "@/components/Icons";
import {
  TIER_LIMITS,
  type Tier,
  type Profile,
  type Newsletter,
  type NewsletterCreatePayload,
} from "@/lib/apiContracts";
import UpgradeModal from "@/components/UpgradeModal";
import {
  TOPIC_GENERIC_FALLBACK_DETAILS,
  TOPIC_OPTIONS,
} from "@/lib/topics/topicConfig";
import {
  DEFAULT_TIMEZONE_VALUE,
  getTimezoneOptionByValue,
  TIMEZONE_OPTIONS,
} from "@/lib/timezones";
import { validateTopicDetailsPreflight } from "@/lib/topics/validateTopicDetails";
import { normalizeTopicDetailsForSave } from "@/lib/topics/normalizeTopicDetailsForSave";
import { allocateByPriority } from "@/lib/allocateByPriority";
import TopicDetailEditor from "@/components/topic-details/TopicDetailEditor";

const FREQUENCIES = ["Daily", "Mon/Wed/Fri", "Weekly", "Bi-Weekly", "Monthly"];
const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
];
const MONTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, idx) => idx + 1);
const WEATHER_TOPIC_LABEL = "Weather Forecasts";
const TYPED_ENTRY_TOPICS = new Set(["Stock Market", "Crypto News"]);
const SETUP_DRAFT_STORAGE_KEY = "fyn.setupDraft.v2";
const SETUP_DRAFT_STORAGE_KEY_PREFIX = "fyn.setupDraft.v2.user.";
const AUTH_SETUP_BACK_BYPASS_KEY = "auth_setup_back_bypass_v1";
const ACTION_SLOW_MS = 1200;

type SetupStep = 1 | 2 | 3;

type SetupValidationModalState = {
  topic: string;
  message: string;
  allowGeneric: boolean;
};

type PersistedSetupDraft = {
  ownerUserId: string;
  selectedTopics: string[];
  topicDetails: Record<string, string>;
  readTimeMin: number;
  frequency: string;
  deliveryTime: string;
  scheduleWeekday: number;
  monthlyDayOfMonth: number;
  timezone: string;
  genericFallbackTopics: Record<string, boolean>;
  weatherMissingPromptCount: number;
};

const normalizeTier = (value: unknown): Tier => {
  if (value === "basic" || value === "minimum" || value === "premium") {
    return value;
  }
  return "basic";
};

const generateTimeOptions = (start: number, end: number, incrementMin: number) => {
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
};

const formatTime = (t: string) => {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${mStr} ${suffix}`;
};

const buildUserDraftKey = (userId: string) =>
  `${SETUP_DRAFT_STORAGE_KEY_PREFIX}${userId}`;

const loadPersistedDraft = (userId: string): PersistedSetupDraft | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(buildUserDraftKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedSetupDraft;
    if (parsed?.ownerUserId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const savePersistedDraft = (userId: string, draft: PersistedSetupDraft) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(buildUserDraftKey(userId), JSON.stringify(draft));
};

const buildCurrentDraft = (input: {
  ownerUserId: string;
  selectedTopics: string[];
  topicDetails: Record<string, string>;
  readTimeMin: number;
  frequency: string;
  deliveryTime: string;
  scheduleWeekday: number;
  monthlyDayOfMonth: number;
  timezone: string;
  genericFallbackTopics: Record<string, boolean>;
  weatherMissingPromptCount: number;
}): PersistedSetupDraft => ({
  ownerUserId: input.ownerUserId,
  selectedTopics: input.selectedTopics,
  topicDetails: input.topicDetails,
  readTimeMin: input.readTimeMin,
  frequency: input.frequency,
  deliveryTime: input.deliveryTime,
  scheduleWeekday: input.scheduleWeekday,
  monthlyDayOfMonth: input.monthlyDayOfMonth,
  timezone: input.timezone,
  genericFallbackTopics: input.genericFallbackTopics,
  weatherMissingPromptCount: input.weatherMissingPromptCount,
});

const clearPersistedDraft = (userId: string) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(buildUserDraftKey(userId));
};

const clearLegacyDraftStorage = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SETUP_DRAFT_STORAGE_KEY);
};

export default function SetupWizard({ step }: { step: SetupStep }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("basic");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicDetails, setTopicDetails] = useState<Record<string, string>>({});
  const [readTimeMin, setReadTimeMin] = useState(3);
  const [frequency, setFrequency] = useState("Daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [scheduleWeekday, setScheduleWeekday] = useState<number>(1);
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(1);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE_VALUE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [navigationIntent, setNavigationIntent] = useState<
    "step2" | "step3" | "back" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");
  const [hasExistingNewsletter, setHasExistingNewsletter] = useState(false);
  const [validationModal, setValidationModal] =
    useState<SetupValidationModalState | null>(null);
  const [genericFallbackTopics, setGenericFallbackTopics] = useState<
    Record<string, boolean>
  >({});
  const [weatherMissingPromptCount, setWeatherMissingPromptCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const hasTopicInteractionRef = useRef(false);
  const onboardingTrackedRef = useRef(false);
  const submitInFlightRef = useRef(false);
  const createClickStartedAtRef = useRef<number | null>(null);

  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
  const totalSeconds = readTimeMin * 60;

  const timeOptions = useMemo(
    () =>
      generateTimeOptions(
        limits.deliveryWindowStart,
        limits.deliveryWindowEnd,
        limits.incrementMinutes
      ),
    [limits]
  );

  const defaultPriorityMap = useMemo(
    () =>
      selectedTopics.reduce<Record<string, number>>((acc, topic) => {
        acc[topic] = 3;
        return acc;
      }, {}),
    [selectedTopics]
  );

  const topicSeconds = useMemo(
    () => allocateByPriority(totalSeconds, defaultPriorityMap),
    [totalSeconds, defaultPriorityMap]
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth?mode=signin");
        return;
      }
      const nextUserId = data.user.id;
      setCurrentUserId(nextUserId);
      clearLegacyDraftStorage();
      if (data.user.email) setEmail(data.user.email);
      let resolvedTier: Tier = "basic";
      try {
        const [p, newsletters] = await Promise.all([
          api.get<Profile>("/api/me"),
          api.get<Newsletter[]>("/api/newsletters").catch(() => []),
        ]);
        if (cancelled) return;
        resolvedTier = normalizeTier(p?.tier);
        setTier(resolvedTier);
        setHasExistingNewsletter(Array.isArray(newsletters) && newsletters.length > 0);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          const draft = loadPersistedDraft(nextUserId);
          if (draft) {
            const resolvedLimits = TIER_LIMITS[resolvedTier] ?? TIER_LIMITS.basic;
            const clampedRead = Math.max(
              resolvedLimits.minReadTimeMin,
              Math.min(resolvedLimits.maxReadTimeMin, draft.readTimeMin || 3)
            );
            const validTimes = generateTimeOptions(
              resolvedLimits.deliveryWindowStart,
              resolvedLimits.deliveryWindowEnd,
              resolvedLimits.incrementMinutes
            );
            setSelectedTopics(draft.selectedTopics || []);
            setTopicDetails(draft.topicDetails || {});
            setReadTimeMin(clampedRead);
            setFrequency(draft.frequency || "Daily");
            setDeliveryTime(
              validTimes.includes(draft.deliveryTime)
                ? draft.deliveryTime
                : validTimes[0] || "09:00"
            );
            setScheduleWeekday(draft.scheduleWeekday || 1);
            setMonthlyDayOfMonth(draft.monthlyDayOfMonth || 1);
            setTimezone(draft.timezone || DEFAULT_TIMEZONE_VALUE);
            setGenericFallbackTopics(draft.genericFallbackTopics || {});
            setWeatherMissingPromptCount(draft.weatherMissingPromptCount || 0);
          }
          setIsHydrated(true);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (step !== 1 || onboardingTrackedRef.current) return;
    onboardingTrackedRef.current = true;
    void trackEvent("onboarding_started", { source: "setup_step_1" });
  }, [step]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    if (selectedTopics.length === 0) {
      const existingDraft = loadPersistedDraft(currentUserId);
      if (
        existingDraft?.selectedTopics?.length &&
        !hasTopicInteractionRef.current
      ) {
        // Avoid clobbering an existing draft during step rehydration.
        return;
      }
    }
    savePersistedDraft(currentUserId, {
      ownerUserId: currentUserId,
      selectedTopics,
      topicDetails,
      readTimeMin,
      frequency,
      deliveryTime,
      scheduleWeekday,
      monthlyDayOfMonth,
      timezone,
      genericFallbackTopics,
      weatherMissingPromptCount,
    });
  }, [
    isHydrated,
    currentUserId,
    selectedTopics,
    topicDetails,
    readTimeMin,
    frequency,
    deliveryTime,
    scheduleWeekday,
    monthlyDayOfMonth,
    timezone,
    genericFallbackTopics,
    weatherMissingPromptCount,
    step,
  ]);

  useEffect(() => {
    const weatherDetails = topicDetails[WEATHER_TOPIC_LABEL]?.trim() ?? "";
    if (weatherDetails.length > 0) {
      setWeatherMissingPromptCount(0);
    }
  }, [topicDetails]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    if (step !== 1 && selectedTopics.length === 0) {
      const draft = loadPersistedDraft(currentUserId);
      if (draft?.selectedTopics?.length) {
        setSelectedTopics(draft.selectedTopics);
        if (Object.keys(topicDetails).length === 0 && draft.topicDetails) {
          setTopicDetails(draft.topicDetails);
        }
        return;
      }
      router.replace("/setup/step-1");
    }
  }, [isHydrated, currentUserId, router, selectedTopics.length, step, topicDetails]);

  useEffect(() => {
    if (!isHydrated || !currentUserId || step !== 1 || hasTopicInteractionRef.current) return;
    if (selectedTopics.length > 0) return;
    const draft = loadPersistedDraft(currentUserId);
    if (!draft?.selectedTopics?.length) return;
    setSelectedTopics(draft.selectedTopics);
    if (Object.keys(topicDetails).length === 0 && draft.topicDetails) {
      setTopicDetails(draft.topicDetails);
    }
  }, [isHydrated, currentUserId, selectedTopics.length, step, topicDetails]);

  const requiredFieldsValid =
    selectedTopics.length > 0 &&
    readTimeMin > 0 &&
    deliveryTime.length > 0 &&
    timezone.length > 0 &&
    Boolean(frequency.length > 0);
  const requiresWeekday = frequency === "Weekly" || frequency === "Bi-Weekly";
  const requiresMonthlyDay = frequency === "Monthly";
  const weekdayHelperText =
    frequency === "Bi-Weekly"
      ? "Choose your bi-weekly delivery day"
      : "Choose one delivery weekday";
  const scheduleValid =
    (!requiresWeekday || (scheduleWeekday >= 1 && scheduleWeekday <= 5)) &&
    (!requiresMonthlyDay || (monthlyDayOfMonth >= 1 && monthlyDayOfMonth <= 31));
  const canSubmit = requiredFieldsValid && scheduleValid && !isSubmitting;

  const reportActionTiming = (action: string, startedAt: number, success: boolean) => {
    const duration = Math.max(0, Math.round(performance.now() - startedAt));
    if (process.env.NODE_ENV !== "production") {
      console.log("UI_ACTION_TIMING", { action, duration_ms: duration, success });
    }
    if (duration >= ACTION_SLOW_MS) {
      void trackEvent("ui_action_timing", {
        action,
        duration_ms: duration,
        success,
      });
    }
  };

  const buildResolvedTopicDetails = () => {
    return selectedTopics.reduce<Record<string, string>>((acc, topic) => {
      const typedDetails = (topicDetails[topic] ?? "").trim();
      if (typedDetails.length > 0) {
        const normalized = normalizeTopicDetailsForSave(topic, typedDetails);
        if (normalized) {
          acc[topic] = normalized;
        }
      } else if (genericFallbackTopics[topic] && TYPED_ENTRY_TOPICS.has(topic)) {
        const normalized = normalizeTopicDetailsForSave(
          topic,
          TOPIC_GENERIC_FALLBACK_DETAILS[topic] ?? ""
        );
        if (normalized) {
          acc[topic] = normalized;
        }
      }
      return acc;
    }, {});
  };

  const validateDetailsBeforeProceed = () => {
    const resolvedTopicDetails = buildResolvedTopicDetails();
    const missingTopics = selectedTopics.filter(
      (topic) => !(resolvedTopicDetails[topic] ?? "").trim()
    );
    if (missingTopics.length > 0) {
      void trackEvent("validation_error_seen", {
        flow: "setup",
        reason: "missing_topic_details",
        missing_count: missingTopics.length,
      });
      const missingWeather = missingTopics.includes(WEATHER_TOPIC_LABEL);
      if (missingWeather) {
        const message =
          weatherMissingPromptCount > 0
            ? "Please choose your location details for the Weather Forecasts topic."
            : `You forgot to choose your details for ${WEATHER_TOPIC_LABEL} topic. Please choose your details so we can finish making your very own For You Newsletter!`;
        setValidationModal({
          topic: WEATHER_TOPIC_LABEL,
          message,
          allowGeneric: false,
        });
        setWeatherMissingPromptCount((prev) => prev + 1);
        return null;
      }

      const topic = missingTopics[0];
      setValidationModal({
        topic,
        message: `You forgot to choose your details for ${topic} topic. Please choose your details so we can finish making your very own For You Newsletter!`,
        allowGeneric: TYPED_ENTRY_TOPICS.has(topic),
      });
      return null;
    }

    const preflightIssues = validateTopicDetailsPreflight(resolvedTopicDetails);
    if (preflightIssues.length > 0) {
      const firstIssue = preflightIssues[0];
      void trackEvent("topic_detail_validation_failed", {
        topic: firstIssue.topic,
      });
      const quotedPortion = firstIssue.problematicPortion
        ? `\nQuoted details: "${firstIssue.problematicPortion.replace(/\s+/g, " ")}"`
        : "";
      setValidationModal({
        topic: firstIssue.topic,
        message: `${firstIssue.topic} details need a fix before creation.\n${firstIssue.message}${quotedPortion}\nPlease update this topic detail before continuing.`,
        allowGeneric: false,
      });
      return null;
    }

    return resolvedTopicDetails;
  };

  const submitNewsletter = async () => {
    if (!canSubmit || submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    createClickStartedAtRef.current = performance.now();
    const resolvedTopicDetails = buildResolvedTopicDetails();
    const missingTopics = selectedTopics.filter(
      (topic) => !(resolvedTopicDetails[topic] ?? "").trim()
    );
    if (missingTopics.length > 0) {
      setError(
        "Please go back to Step 2 and choose your topic details before creating your newsletter."
      );
      submitInFlightRef.current = false;
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setValidationModal(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setIsSubmitting(false);
      submitInFlightRef.current = false;
      router.push("/auth");
      return;
    }

    const selectedTimezone = getTimezoneOptionByValue(timezone);
    const payload: NewsletterCreatePayload = {
      email,
      topics: selectedTopics.map((topic) => ({
        topic,
        specific_details: resolvedTopicDetails[topic] || undefined,
        allocated_seconds: topicSeconds[topic] ?? 20,
      })),
      frequency,
      delivery_time: deliveryTime,
      timezone: selectedTimezone?.iana || "America/New_York",
      schedule_weekday: requiresWeekday ? scheduleWeekday : undefined,
      monthly_day_of_month: requiresMonthlyDay ? monthlyDayOfMonth : undefined,
      read_time_minutes: readTimeMin,
    };

    try {
      const created = await api.post<Newsletter>("/api/newsletters", payload);
      void trackEvent("setup_step_3_completed", { topic_count: selectedTopics.length });
      void trackEvent("onboarding_completed", { topic_count: selectedTopics.length });
      void trackEvent("newsletter_created", {
        source: "setup",
        topic_count: selectedTopics.length,
      });
      void trackEvent("setup_newsletter_created", {
        tier,
        frequency,
        read_time_minutes: readTimeMin,
        topic_count: selectedTopics.length,
      });
      if (currentUserId) {
        clearPersistedDraft(currentUserId);
      }
      if (createClickStartedAtRef.current !== null) {
        reportActionTiming(
          "create_newsletter_clicked_to_loading",
          createClickStartedAtRef.current,
          true
        );
      }
      router.push(`/setup/creating?newsletterId=${created.id}`);
      void api.patch("/api/me", { onboarding_complete: true }).catch(() => {
        /* best effort */
      });
    } catch (err: unknown) {
      const apiErr = err as {
        message?: string;
        details?: unknown;
        code?: string;
      } | null;
      const baseMsg = apiErr?.message || "Failed to create newsletter.";
      const hasInternalDebugSignal =
        /critical|canonical_entity|provider id|topic_key|before insert/i.test(baseMsg);
      const msg = hasInternalDebugSignal
        ? "We could not save one of your sports selections. Please go back to Step 2 and reselect that sports item."
        : baseMsg;
      if (
        typeof msg === "string" &&
        (msg.toLowerCase().includes("limit") ||
          msg.toLowerCase().includes("tier") ||
          msg.toLowerCase().includes("upgrade"))
      ) {
        setUpgradeMsg(msg);
        setShowUpgrade(true);
      } else {
        void trackEvent("validation_error_seen", {
          flow: "setup_submit",
          reason: "api_error",
          code: apiErr?.code || "unknown",
        });
        setError(msg);
      }
      if (createClickStartedAtRef.current !== null) {
        reportActionTiming(
          "create_newsletter_clicked_to_loading",
          createClickStartedAtRef.current,
          false
        );
      }
    } finally {
      setIsSubmitting(false);
      submitInFlightRef.current = false;
    }
  };

  const toggleTopic = (label: string) => {
    hasTopicInteractionRef.current = true;
    if (selectedTopics.includes(label)) {
      setSelectedTopics((prev) => prev.filter((t) => t !== label));
      setTopicDetails((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
      setGenericFallbackTopics((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
      return;
    }

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
  };

  const openStep2 = () => {
    const startedAt = performance.now();
    if (selectedTopics.length === 0) {
      void trackEvent("validation_error_seen", {
        flow: "setup_step_1",
        reason: "no_topics_selected",
      });
      setError("Select at least one topic to continue.");
      return;
    }
    if (!currentUserId) {
      setError("Unable to load your session. Please try again.");
      return;
    }
    setNavigationIntent("step2");
    void trackEvent("setup_step_1_completed", { topic_count: selectedTopics.length });
    savePersistedDraft(
      currentUserId,
      buildCurrentDraft({
        ownerUserId: currentUserId,
        selectedTopics,
        topicDetails,
        readTimeMin,
        frequency,
        deliveryTime,
        scheduleWeekday,
        monthlyDayOfMonth,
        timezone,
        genericFallbackTopics,
        weatherMissingPromptCount,
      })
    );
    setError(null);
    reportActionTiming("setup_step_next", startedAt, true);
    router.push("/setup/step-2");
  };

  const persistDraftNow = () => {
    if (!currentUserId) return;
    savePersistedDraft(
      currentUserId,
      buildCurrentDraft({
        ownerUserId: currentUserId,
        selectedTopics,
        topicDetails,
        readTimeMin,
        frequency,
        deliveryTime,
        scheduleWeekday,
        monthlyDayOfMonth,
        timezone,
        genericFallbackTopics,
        weatherMissingPromptCount,
      })
    );
  };

  const openStep3 = () => {
    const startedAt = performance.now();
    const resolved = validateDetailsBeforeProceed();
    if (!resolved) {
      setNavigationIntent(null);
      reportActionTiming("setup_step_next", startedAt, false);
      return;
    }
    setNavigationIntent("step3");
    void trackEvent("setup_step_2_completed", { topic_count: selectedTopics.length });
    persistDraftNow();
    setError(null);
    reportActionTiming("setup_step_next", startedAt, true);
    router.push("/setup/step-3");
  };

  useEffect(() => {
    if (step === 1) {
      void router.prefetch("/setup/step-2");
    } else if (step === 2) {
      void router.prefetch("/setup/step-3");
      void router.prefetch("/setup/step-1");
    } else {
      void router.prefetch("/setup/creating");
      void router.prefetch("/setup/step-2");
    }
  }, [router, step]);

  useEffect(() => {
    if (!navigationIntent) return;
    const timer = window.setTimeout(() => {
      setNavigationIntent(null);
    }, 4000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [navigationIntent]);

  const renderTopicSelectionSection = (
    <>
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
          Choose Your Topics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select at least 1 topic.{" "}
          {limits.maxTopics !== Infinity && `Max ${limits.maxTopics} on your plan.`}
        </p>
        <div className="grid grid-cols-2 items-stretch sm:grid-cols-3 gap-4">
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = selectedTopics.includes(topic.label);
            const isMotivational = topic.label === "Motivational Quotes/Stories";
            const TopicIcon =
              (Icons as Record<
                string,
                ComponentType<{ size?: number; className?: string }>
              >)[topic.icon] || Icons.ChevronRight;
            return (
              <button
                key={topic.label}
                type="button"
                onClick={() => toggleTopic(topic.label)}
                className={`flex h-full min-h-[94px] w-full flex-col self-stretch p-3.5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
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
                      isSelected
                        ? "text-primary"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {topic.label}
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
                  {topic.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderTopicDetailsSection =
    selectedTopics.length > 0 ? (
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            On the Next Step You Will Choose the Time of Your Newsletter on Step 3
          </p>
          {selectedTopics.map((topic) => (
            <div
              key={topic}
              className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{topic}</h3>
              <div>
                <TopicDetailEditor
                  topic={topic}
                  value={topicDetails[topic] ?? ""}
                  tier={tier}
                  onChange={(nextValue) =>
                    setTopicDetails((prev) => ({
                      ...prev,
                      [topic]: nextValue,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    ) : null;

  const renderDeliverySection = (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
      <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
        Your Delivery Settings
      </h2>

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
              {WEEKDAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setScheduleWeekday(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    scheduleWeekday === day.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 dark:bg-slate-900 dark:text-gray-200 dark:border-slate-700"
                  }`}
                >
                  {day.label}
                </button>
              ))}
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
  );

  const stepLabel =
    step === 1
      ? "Step 1 of the 3 Step Sign Up Process"
      : step === 2
      ? "Step 2 out of only 3 steps"
      : "Step 3 out of only 3 steps";

  return (
    <div className="min-h-screen bg-white pb-12 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center px-4 sm:px-6 lg:px-10 py-4">
          <button
            type="button"
            onClick={() => {
              setNavigationIntent("back");
              if (step === 1) {
                if (typeof window !== "undefined") {
                  window.sessionStorage.setItem(AUTH_SETUP_BACK_BYPASS_KEY, "1");
                }
                router.push("/auth?mode=signin&fromSetupBack=1");
              } else if (step === 2) {
                persistDraftNow();
                router.push("/setup/step-1");
              } else {
                persistDraftNow();
                router.push("/setup/step-2");
              }
            }}
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-900"
            aria-label="Back"
            disabled={Boolean(navigationIntent)}
          >
            <Icons.ChevronLeft size={18} />
          </button>
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

        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
          {stepLabel}
        </div>

        {step === 1 && renderTopicSelectionSection}
        {step === 2 && renderTopicDetailsSection}
        {step === 3 && renderDeliverySection}

        {error && (
          <div className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
            {error}
          </div>
        )}

        {step === 1 && (
          <button
            type="button"
            onClick={openStep2}
            disabled={navigationIntent !== null}
            className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {navigationIntent === "step2"
              ? "Opening Step 2..."
              : "Go to Step 2 - Type Your Topic Details"}
          </button>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={openStep3}
              disabled={navigationIntent !== null}
              className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {navigationIntent === "step3"
                ? "Opening Step 3..."
                : "Go to Step 3 - Customize Your Delivery Preferences"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNavigationIntent("back");
                persistDraftNow();
                router.push("/setup/step-1");
              }}
              disabled={navigationIntent !== null}
              className="w-full rounded-xl border border-primary bg-transparent px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
            >
              Go back to Step 1 - Choose Your Topics
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={submitNewsletter}
              disabled={!canSubmit || navigationIntent !== null}
              className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Creating your newsletter..." : "Create Your For You Newsletter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNavigationIntent("back");
                persistDraftNow();
                router.push("/setup/step-2");
              }}
              disabled={isSubmitting || navigationIntent !== null}
              className="w-full rounded-xl border border-primary bg-transparent px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
            >
              Go back to Step 2 - Type Your Topic Details
            </button>
          </div>
        )}

        {step === 3 && hasExistingNewsletter && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already created a newsletter?{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-primary hover:underline"
            >
              Go to dashboard here
            </Link>
          </p>
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        message={upgradeMsg}
      />
      {validationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
            <p className="whitespace-pre-line text-sm font-semibold text-white">
              {validationModal.message}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setValidationModal(null)}
                className="w-full rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 dark:bg-slate-900"
              >
                Go back to newsletter setup
              </button>
              {validationModal.allowGeneric && (
                <button
                  type="button"
                  onClick={() => {
                    setGenericFallbackTopics((prev) => ({
                      ...prev,
                      [validationModal.topic]: true,
                    }));
                    setValidationModal(null);
                  }}
                  className="w-full rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 dark:bg-slate-900"
                >
                  Ignore message - Use the preset details option
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
