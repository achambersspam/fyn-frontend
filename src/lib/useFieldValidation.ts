"use client";

import { useCallback, useMemo, useState } from "react";

export type Validator = (value: string, allValues: Record<string, string>) => string | null;

export type FieldConfig = Record<string, Validator>;

type FieldState = {
  value: string;
  error: string | null;
  touched: boolean; // has the field been blurred at least once
  live: boolean; // once errored, validate on every keystroke until fixed
};

/**
 * Form-field validation implementing a humane feedback cadence:
 *  - Silent while typing the first time (no nagging mid-word).
 *  - Validate on blur — feedback lands after the thought is finished.
 *  - Once a field is wrong, switch THAT field to live: re-check every keystroke
 *    and clear the error the instant it becomes valid (no re-submit to be forgiven).
 *  - A valid, touched field reports `isValid` so the UI can show a green check —
 *    confirming effort, not only flagging mistakes.
 *  - validateAll() on submit marks everything touched and surfaces every error.
 */
export function useFieldValidation(config: FieldConfig, initial?: Record<string, string>) {
  const fieldNames = useMemo(() => Object.keys(config), [config]);

  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const state: Record<string, FieldState> = {};
    for (const name of fieldNames) {
      state[name] = {
        value: initial?.[name] ?? "",
        error: null,
        touched: false,
        live: false,
      };
    }
    return state;
  });

  const valuesSnapshot = useCallback(
    (overrides?: Record<string, string>): Record<string, string> => {
      const values: Record<string, string> = {};
      for (const name of fieldNames) {
        values[name] = overrides?.[name] ?? fields[name]?.value ?? "";
      }
      return values;
    },
    [fieldNames, fields]
  );

  const handleChange = useCallback(
    (name: string, value: string) => {
      setFields((prev) => {
        const current = prev[name];
        const next: FieldState = { ...current, value };
        // Only re-validate mid-typing once the field has already errored (live mode).
        if (current.live) {
          const allValues = { ...valuesSnapshot(), [name]: value };
          const error = config[name](value, allValues);
          next.error = error;
          if (!error) next.live = false; // forgiven the instant it's correct
        }
        return { ...prev, [name]: next };
      });
    },
    [config, valuesSnapshot]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setFields((prev) => {
        const current = prev[name];
        const allValues = valuesSnapshot();
        const error = config[name](current.value, allValues);
        return {
          ...prev,
          [name]: {
            ...current,
            touched: true,
            error,
            live: error ? true : current.live,
          },
        };
      });
    },
    [config, valuesSnapshot]
  );

  const validateAll = useCallback((): boolean => {
    let ok = true;
    setFields((prev) => {
      const next: Record<string, FieldState> = {};
      const allValues: Record<string, string> = {};
      for (const name of fieldNames) allValues[name] = prev[name].value;
      for (const name of fieldNames) {
        const error = config[name](prev[name].value, allValues);
        if (error) ok = false;
        next[name] = {
          ...prev[name],
          touched: true,
          error,
          live: error ? true : prev[name].live,
        };
      }
      return next;
    });
    return ok;
  }, [config, fieldNames]);

  const reset = useCallback(() => {
    setFields((prev) => {
      const next: Record<string, FieldState> = {};
      for (const name of fieldNames) {
        next[name] = { value: "", error: null, touched: false, live: false };
      }
      return next;
    });
  }, [fieldNames]);

  const fieldProps = useCallback(
    (name: string) => ({
      value: fields[name]?.value ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
    }),
    [fields, handleChange, handleBlur]
  );

  const status = useCallback(
    (name: string): "idle" | "error" | "valid" => {
      const f = fields[name];
      if (!f || !f.touched) return "idle";
      if (f.error) return "error";
      return f.value.trim() ? "valid" : "idle";
    },
    [fields]
  );

  return {
    values: valuesSnapshot(),
    fields,
    fieldProps,
    status,
    error: (name: string) => fields[name]?.error ?? null,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  };
}

// Common validators reused across onboarding forms.
export const validators = {
  email: (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Email is required.";
    // Pragmatic email shape check — one @, a dot in the domain, no spaces.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return null;
  },
  password: (value: string): string | null => {
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    return null;
  },
  required: (label: string): Validator => (value: string) =>
    value.trim() ? null : `${label} is required.`,
};
