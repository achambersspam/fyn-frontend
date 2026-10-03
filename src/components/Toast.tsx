"use client";

import { Check } from "@/components/Icons";
import { ToastStateProvider, useToast, type ToastVariant } from "@/lib/useToast";
import type { ReactNode } from "react";

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "bg-emerald-500 text-white font-bold rounded-xl",
  // Hollow red capsule (matches ERROR_BOX_CLASS). A solid base keeps the text readable over page content;
  // the tint is layered on top as a background-image.
  error:
    "rounded-2xl border border-red-500/90 bg-white dark:bg-slate-900 bg-[linear-gradient(rgba(239,68,68,0.1),rgba(239,68,68,0.1))] text-red-700 dark:text-white font-semibold",
  info: "bg-sky-500 text-white font-bold rounded-xl",
};

function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pt-4">
      {toasts.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => dismiss(item.id)}
          className={`pointer-events-auto mt-0 flex max-w-[min(92vw,28rem)] items-center gap-2 px-5 py-3 shadow-lg motion-safe:animate-fade-up ${VARIANT_CLASS[item.variant]}`}
          role={item.variant === "error" ? "alert" : "status"}
        >
          {item.variant === "success" ? <Check size={18} /> : null}
          <span>{item.message}</span>
        </button>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastStateProvider>
      {children}
      <ToastViewport />
    </ToastStateProvider>
  );
}

export { useToast } from "@/lib/useToast";
