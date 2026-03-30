"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Eye, EyeOff } from "@/components/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/apiContracts";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const supabase = getSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          if (
            signUpError.message
              .toLowerCase()
              .includes("already") ||
            signUpError.message
              .toLowerCase()
              .includes("exists")
          ) {
            setError(
              "An account with this email already exists. Please sign in instead."
            );
            setMode("signin");
            setIsSubmitting(false);
            return;
          }
          throw signUpError;
        }

        if (data.user && !data.session) {
          setMode("signin");
          setError("Account created! Please check your email to confirm, then sign in.");
          setIsSubmitting(false);
          return;
        }

        if (data.session) {
          try {
            await api.patch<Profile>("/api/me", {
              onboarding_complete: false,
              tier: "basic",
            });
          } catch {
            /* profile may already exist */
          }
          router.push("/setup");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        try {
          const profile = await api.get<Profile>("/api/me");
          if (!profile.onboarding_complete) {
            router.push("/setup");
            return;
          }
        } catch {
          /* if profile fetch fails, go to dashboard */
        }
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-12 relative">
        <div className="space-y-8">
          <div className="text-center">
            <Logo
              variant="envelope"
              className="w-[185px] h-[185px] mx-auto mb-6"
            />
            <h1 className="text-3xl font-black text-gray-900 mb-2 dark:text-gray-100">
              Welcome!
            </h1>
            <p className="text-gray-600 text-sm dark:text-gray-300">
              Let&apos;s Make Your Personalized Newsletter!
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 dark:bg-slate-900">
            <button
              onClick={() => { setMode("signin"); setError(null); }}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === "signin"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="input-field pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-lg mt-6 disabled:opacity-60"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "signin"
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold dark:bg-slate-950 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all dark:border-slate-800 dark:hover:border-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                SIGN IN WITH GOOGLE
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all dark:border-slate-800 dark:hover:border-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                SIGN IN WITH APPLE
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
