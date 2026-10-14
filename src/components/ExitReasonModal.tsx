"use client";

import { useEffect, useRef, useState } from "react";
import {
  EXIT_REASONS,
  MAX_EXIT_DETAIL,
  type ExitKind,
  type ExitSelection,
} from "@/lib/exitReasons";

type Props = {
  open: boolean;
  kind: ExitKind;
  title: string;
  /** Plain sentence above the options (what is about to happen). */
  description?: string;
  /** Label of the main action, e.g. "Cancel subscription". */
  confirmLabel: string;
  busyLabel?: string;
  /** "Keep" style label for the dismiss button. */
  dismissLabel?: string;
  busy?: boolean;
  /** Red for destructive actions (cancel/delete), neutral for pausing. */
  danger?: boolean;
  onConfirm: (selection: ExitSelection) => void;
  onClose: () => void;
};

function ExitReasonModalInner({
  kind,
  title,
  description,
  confirmLabel,
  busyLabel,
  dismissLabel = "Never mind",
  busy = false,
  danger = true,
  onConfirm,
  onClose,
}: Omit<Props, "open">) {
  const reasons = EXIT_REASONS[kind];
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const detailRef = useRef<HTMLTextAreaElement | null>(null);
  const selected = reasons.find((reason) => reason.id === reasonId) || null;

  // Move the cursor into the text box as soon as it appears.
  useEffect(() => {
    if (selected?.followUp) detailRef.current?.focus();
  }, [selected?.id, selected?.followUp]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const confirm = () => {
    if (busy) return;
    onConfirm({
      reasonId: selected?.id ?? null,
      label: selected?.label ?? null,
      detail: selected?.followUp ? detail.trim() : "",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-reason-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h3
          id="exit-reason-title"
          className="text-lg font-black text-gray-900 dark:text-gray-100"
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        ) : null}

        <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Why? <span className="font-normal text-gray-500">(optional, but it helps us improve)</span>
        </p>
        <div className="mt-2 space-y-2" role="radiogroup" aria-label="Reason">
          {reasons.map((reason) => {
            const active = reason.id === reasonId;
            return (
              <button
                key={reason.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => {
                  setReasonId(active ? null : reason.id);
                  setDetail("");
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all disabled:opacity-60 ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-slate-700 dark:text-gray-300 dark:hover:border-slate-600"
                }`}
              >
                {reason.label}
              </button>
            );
          })}
        </div>

        {selected?.followUp ? (
          <div className="mt-4 space-y-2">
            <label
              htmlFor="exit-reason-detail"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {selected.followUp}
            </label>
            <textarea
              id="exit-reason-detail"
              ref={detailRef}
              value={detail}
              maxLength={MAX_EXIT_DETAIL}
              rows={3}
              disabled={busy}
              onChange={(event) => setDetail(event.target.value)}
              placeholder={selected.placeholder || ""}
              className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100"
            />
            <p className="text-right text-xs text-gray-400">
              {detail.length}/{MAX_EXIT_DETAIL}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            {dismissLabel}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90"
            }`}
          >
            {busy ? busyLabel || "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExitReasonModal(props: Props) {
  // Mounted only while open, so every opening starts with a fresh, empty form.
  if (!props.open) return null;
  const { open, ...rest } = props;
  void open;
  return <ExitReasonModalInner {...rest} />;
}
