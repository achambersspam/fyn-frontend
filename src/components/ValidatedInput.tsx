"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "@/components/Icons";

type Status = "idle" | "error" | "valid";

type ValidatedInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  status: Status;
  errorMessage?: string | null;
  /** Optional element rendered inside the field on the right (e.g. a show-password toggle). */
  trailing?: ReactNode;
};

/**
 * Input with humane validation affordances: a green check when the field is
 * valid after effort, a red ring + message when it's wrong. Silent while idle
 * so an untouched form never looks like it's judging the user.
 */
const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, status, errorMessage, trailing, className, ...inputProps }, ref) => {
    const ringClass =
      status === "error"
        ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500/60"
        : status === "valid"
          ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200 dark:border-emerald-500/60"
          : "";

    const showCheck = status === "valid";
    const rightPad = trailing ? "pr-12" : showCheck ? "pr-10" : "";

    return (
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5 dark:text-gray-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`input-field ${ringClass} ${rightPad} ${className || ""}`.trim()}
            aria-invalid={status === "error"}
            {...inputProps}
          />
          {showCheck && !trailing && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <Check size={18} />
            </span>
          )}
          {trailing}
        </div>
        <div className="min-h-[18px] mt-1">
          {status === "error" && errorMessage && (
            <p className="text-xs font-semibold text-red-500" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

export default ValidatedInput;
