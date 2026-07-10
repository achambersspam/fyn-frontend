"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { validators } from "@/lib/useFieldValidation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) {
        setIsReady(Boolean(session?.access_token));
      }
    };

    void loadSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const passwordError = validators.password(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Password updated. Redirecting you to your dashboard...");
      setTimeout(() => router.replace("/dashboard"), 900);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Unable to update your password. Please request a new reset link.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Logo variant="envelope" className="mx-auto mb-4 h-20 w-20" />
        <h1 className="text-center text-2xl font-black text-slate-900 dark:text-slate-100">
          Reset your password
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
          Enter a new password for your For You Newsletter account.
        </p>

        {!isReady && (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Open the reset link from your email on this device. If it expired, request a new
            one from the sign-in page.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              New password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Confirm password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              minLength={6}
              required
            />
          </label>

          {error && (
            <div className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="w-full btn-primary text-lg disabled:opacity-60"
          >
            {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered it?{" "}
          <Link href="/auth?mode=signin" className="font-bold text-sky-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
