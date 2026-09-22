"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type ApiError } from "@/lib/api";
import type { Newsletter } from "@/lib/apiContracts";
import { errorMessage } from "@/lib/errorMessage";

export default function ChooseActiveNewslettersModal({
  open,
  newsletters,
  cap,
  onClose,
  onSaved,
}: {
  open: boolean;
  newsletters: Newsletter[];
  cap: number;
  onClose: () => void;
  onSaved: (next: Newsletter[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initiallySelected = newsletters
      .filter((nl) => !nl.paused && !nl.disabled)
      .slice(0, cap)
      .map((nl) => nl.id);
    setSelected(
      initiallySelected.length > 0
        ? initiallySelected
        : newsletters.slice(0, cap).map((nl) => nl.id)
    );
    setError(null);
  }, [open, newsletters, cap]);

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (cap === 1) return [id];
      if (current.length >= cap) return current;
      return [...current, id];
    });
  };

  const save = async () => {
    if (selected.length === 0 || selected.length > cap) {
      setError(`Choose ${cap} newsletter${cap === 1 ? "" : "s"} to keep enabled.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await api.post<Newsletter[]>("/api/newsletters/select-active", {
        ids: selected,
      });
      onSaved(Array.isArray(next) ? next : newsletters);
      onClose();
    } catch (err) {
      setError(errorMessage(err as ApiError, "Could not update which newsletters stay active."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 space-y-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
          Choose which newsletter{cap === 1 ? "" : "s"} stay enabled
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your plan includes {cap} active newsletter{cap === 1 ? "" : "s"}. The others
          stay in your account as Disabled — nothing is deleted. You can switch later
          by disabling or deleting an active one, or by resubscribing.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {newsletters.map((nl) => {
            const checked = selected.includes(nl.id);
            return (
              <button
                key={nl.id}
                type="button"
                onClick={() => toggle(nl.id)}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {nl.title || "Newsletter"}
                </p>
                <p className="text-xs text-gray-500">
                  {nl.topics.length} topic{nl.topics.length !== 1 ? "s" : ""} ·{" "}
                  {nl.frequency}
                </p>
              </button>
            );
          })}
        </div>
        {error && (
          <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-outline py-3">
            Not now
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || selected.length === 0 || selected.length > cap}
            className="flex-1 btn-primary py-3"
          >
            {saving ? "Saving…" : "Keep selected"}
          </button>
        </div>
        <p className="text-xs text-center text-gray-400">
          Need more than {cap}?{" "}
          <Link href="/subscription" className="underline hover:text-primary">
            View plans
          </Link>
        </p>
      </div>
    </div>
  );
}
