"use client";

import { Check } from "@/components/Icons";
import { ToastStateProvider, useToast, type ToastVariant } from "@/lib/useToast";
import type { ReactNode } from "react";

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-red-600",
  info: "bg-sky-500",
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
          className={`pointer-events-auto mt-0 flex max-w-[min(92vw,28rem)] items-center gap-2 rounded-xl px-5 py-3 text-white font-bold shadow-lg motion-safe:animate-fade-up ${VARIANT_CLASS[item.variant]}`}
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
