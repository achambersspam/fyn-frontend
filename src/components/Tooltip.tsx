"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

const HOVER_DELAY_MS = 500;

type TooltipProps = {
  label: string;
  children: ReactNode;
  /** Where the bubble appears relative to the wrapped element. */
  side?: "top" | "bottom";
  /** Extra classes for the wrapper (it renders inline-flex by default). */
  className?: string;
};

/**
 * Wraps any interactive element. Hovering for 500ms+ shows a small text
 * bubble describing what the element does. Keyboard focus shows it after the
 * same delay; touch interactions never trigger it, so taps behave normally.
 */
export default function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleShow = useCallback(() => {
    if (suppressRef.current) return;
    clearTimer();
    timerRef.current = setTimeout(() => setVisible(true), HOVER_DELAY_MS);
  }, [clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  if (!label.trim()) {
    return <>{children}</>;
  }

  return (
    <span
      className={`relative inline-flex ${className || ""}`}
      onMouseEnter={scheduleShow}
      onMouseLeave={() => {
        suppressRef.current = false;
        hide();
      }}
      onFocus={scheduleShow}
      onBlur={hide}
      // A touch fires pointerdown before mouseenter; suppress so taps never
      // pop the bubble or delay the underlying action.
      onPointerDown={(event) => {
        if (event.pointerType === "touch") {
          suppressRef.current = true;
        }
        hide();
      }}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-700 ${
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {label}
          <span
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              side === "top"
                ? "top-full border-t-slate-900 dark:border-t-slate-700"
                : "bottom-full border-b-slate-900 dark:border-b-slate-700"
            }`}
          />
        </span>
      )}
    </span>
  );
}

/**
 * Convenience variant that clones the tooltip label into aria-label when the
 * wrapped element doesn't already have one, keeping screen readers in sync
 * with what sighted users learn from the bubble.
 */
export function TooltipWithAria({ label, children, ...rest }: TooltipProps) {
  const child =
    isValidElement(children) &&
    !(children.props as { "aria-label"?: string })["aria-label"]
      ? cloneElement(children as ReactElement<{ "aria-label"?: string }>, {
          "aria-label": label,
        })
      : children;
  return (
    <Tooltip label={label} {...rest}>
      {child}
    </Tooltip>
  );
}
