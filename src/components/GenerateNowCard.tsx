"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type ApiError } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { TOPIC_OPTIONS } from "@/lib/topics/topicConfig";
import type { Newsletter, Profile } from "@/lib/apiContracts";
import { errorMessage } from "@/lib/errorMessage";
import { useToast } from "@/lib/useToast";

type InstantStatus = {
  tier: "basic" | "minimum" | "premium";
  plan: "free" | "plus" | "premium";
  allowed: number;
  used: number;
  remaining: number;
  month: string;
};

type GenerateNowResponse = {
  success: boolean;
  status: "generated" | "duplicate";
  issue_id: string;
  newsletter_id?: string;
  remaining: number;
};

const MAX_CUSTOM_TOPICS = 3;

// Instant one-off generation, outside the delivery schedule. The button is
// visible to every user; free-tier clicks hit an upgrade wall. The backend
// enforces the tier + monthly quota regardless of anything the client shows.
export default function GenerateNowCard({
  newsletters,
  profile,
}: {
  newsletters: Newsletter[];
  profile: Profile | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<InstantStatus | null>(null);
  const [step, setStep] = useState<
    "closed" | "wall" | "choose" | "preset" | "custom"
  >("closed");
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>("");
  const [customTopics, setCustomTopics] = useState<
    Array<{ topic: string; details: string }>
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One nonce per modal session: double-clicks and retries dedupe
  // server-side, while a fresh modal open is a genuinely new request.
  const [clientKey, setClientKey] = useState("");

  const isPaid = profile?.tier === "minimum" || profile?.tier === "premium";

  useEffect(() => {
    if (!isPaid) return;
    api
      .get<InstantStatus>("/api/generate-now")
      .then(setStatus)
      .catch((err) => {
        setStatus(null);
        toast.error(errorMessage(err, "Unable to load instant generation quota."));
      });
  }, [isPaid, toast]);

  const openModal = () => {
    void trackEvent("generate_now_clicked", { tier: profile?.tier || "unknown" });
    setError(null);
    setClientKey(crypto.randomUUID());
    if (!isPaid) {
      setStep("wall");
      return;
    }
    setStep("choose");
  };

  const closeModal = () => {
    setStep("closed");
    setError(null);
    setCustomTopics([]);
  };

  const toggleTopic = (topic: string) => {
    setCustomTopics((prev) => {
      const existing = prev.find((t) => t.topic === topic);
      if (existing) return prev.filter((t) => t.topic !== topic);
      if (prev.length >= MAX_CUSTOM_TOPICS) return prev;
      return [...prev, { topic, details: "" }];
    });
  };

  const setTopicDetails = (topic: string, details: string) => {
    setCustomTopics((prev) =>
      prev.map((t) => (t.topic === topic ? { ...t, details } : t))
    );
  };

  const submit = async (payload: {
    source: "preset" | "custom";
    newsletterId?: string;
    topics?: Array<{ topic: string; details: string }>;
  }) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    const previous = status;
    setStep("closed");
    toast.info("Generating your issue…");
    setStatus((prev) =>
      prev
        ? {
            ...prev,
            remaining: Math.max(0, prev.remaining - 1),
            used: prev.used + 1,
          }
        : prev
    );
    try {
      const result = await api.post<GenerateNowResponse>(
        "/api/generate-now",
        { ...payload, clientKey },
        { timeoutMs: 90000 }
      );
      void trackEvent("generate_now_succeeded", {
        source: payload.source,
        remaining: result.remaining,
      });
      setStatus((prev) => (prev ? { ...prev, remaining: result.remaining, used: prev.allowed - result.remaining } : prev));
      toast.success("Your issue is ready.");
      const targetNewsletter = result.newsletter_id || payload.newsletterId || newsletters[0]?.id;
      if (targetNewsletter) {
        router.push(`/newsletter/${targetNewsletter}/read`);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus(previous);
      if (apiErr?.code === "UPGRADE_REQUIRED") {
        setStep("wall");
      } else {
        toast.error(errorMessage(err, "Generation failed. Please try again."));
      }
      void trackEvent("generate_now_failed", {
        source: payload.source,
        code: apiErr?.code || "unknown",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (newsletters.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Generate Newsletter Now
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isPaid && status
                ? `A fresh issue on demand — ${status.remaining} of ${status.allowed} left this month.`
                : "A fresh issue on demand, outside your schedule."}
            </p>
          </div>
          <button
            onClick={openModal}
            disabled={isGenerating}
            className="btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-60"
          >
            {isGenerating ? "Generating…" : "Generate Now"}
          </button>
        </div>
      </div>

      {step !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {step === "wall" && (
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Instant generation is a paid feature
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upgrade to Plus for 4 instant issues a month, or Premium for 8 —
                  generated the moment you want them, outside your schedule.
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={closeModal} className="btn-ghost-premium px-4 py-2 text-sm">
                    Not now
                  </button>
                  <Link href="/subscription" className="btn-primary px-4 py-2 text-sm">
                    Upgrade
                  </Link>
                </div>
              </div>
            )}

            {step === "choose" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Generate an issue now
                </h3>
                {status && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {status.remaining} of {status.allowed} instant generations left this month
                  </p>
                )}
                <button
                  onClick={() => {
                    setSelectedNewsletterId(newsletters[0]?.id || "");
                    setStep("preset");
                  }}
                  className="w-full rounded-2xl border border-gray-200 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5 dark:border-slate-700"
                >
                  <p className="font-bold text-gray-900 dark:text-gray-100">Use a preset newsletter</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your saved topics and details, generated fresh right now.
                  </p>
                </button>
                <button
                  onClick={() => setStep("custom")}
                  className="w-full rounded-2xl border border-gray-200 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5 dark:border-slate-700"
                >
                  <p className="font-bold text-gray-900 dark:text-gray-100">Customize this one</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pick up to {MAX_CUSTOM_TOPICS} topics for a one-off issue. Your saved setup stays untouched.
                  </p>
                </button>
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              </div>
            )}

            {step === "preset" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Which newsletter?
                </h3>
                <div className="space-y-2">
                  {newsletters.map((nl) => (
                    <label
                      key={nl.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700"
                    >
                      <input
                        type="radio"
                        name="preset-newsletter"
                        checked={selectedNewsletterId === nl.id}
                        onChange={() => setSelectedNewsletterId(nl.id)}
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {nl.title || "Newsletter"}
                      </span>
                    </label>
                  ))}
                </div>
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                <div className="flex justify-end gap-3">
                  <button onClick={() => setStep("choose")} className="btn-ghost-premium px-4 py-2 text-sm" disabled={isGenerating}>
                    Back
                  </button>
                  <button
                    onClick={() => submit({ source: "preset", newsletterId: selectedNewsletterId })}
                    disabled={isGenerating || !selectedNewsletterId}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {isGenerating ? "Generating…" : "Generate"}
                  </button>
                </div>
              </div>
            )}

            {step === "custom" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Pick up to {MAX_CUSTOM_TOPICS} topics
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {TOPIC_OPTIONS.map((option) => {
                    const selected = customTopics.find((t) => t.topic === option.label);
                    const disabled = !selected && customTopics.length >= MAX_CUSTOM_TOPICS;
                    return (
                      <div key={option.label} className="rounded-xl border border-gray-200 p-3 dark:border-slate-700">
                        <label className={`flex items-center gap-3 ${disabled ? "opacity-40" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(selected)}
                            disabled={disabled}
                            onChange={() => toggleTopic(option.label)}
                          />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {option.label}
                          </span>
                        </label>
                        {selected && (
                          <input
                            type="text"
                            value={selected.details}
                            onChange={(e) => setTopicDetails(option.label, e.target.value)}
                            placeholder="Optional details (teams, tickers, cities…)"
                            maxLength={300}
                            className="mt-2 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 dark:border-slate-700 dark:text-gray-100"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                <div className="flex justify-end gap-3">
                  <button onClick={() => setStep("choose")} className="btn-ghost-premium px-4 py-2 text-sm" disabled={isGenerating}>
                    Back
                  </button>
                  <button
                    onClick={() => submit({ source: "custom", topics: customTopics })}
                    disabled={isGenerating || customTopics.length === 0}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {isGenerating ? "Generating…" : `Generate (${customTopics.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
