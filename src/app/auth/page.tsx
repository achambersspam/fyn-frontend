"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Eye, EyeOff } from "@/components/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/apiContracts";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { identifyUser, trackEvent } from "@/lib/analytics";

const AUTH_SIGNIN_DRAFT_KEY = "auth_signin_draft_v1";
const AUTH_POST_TARGET_KEY = "auth_post_target_v1";
const AUTH_SETUP_BACK_BYPASS_KEY = "auth_setup_back_bypass_v1";
const SETUP_DRAFT_STORAGE_KEY = "fyn.setupDraft.v2";
const clearLegacySetupDraftStorage = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SETUP_DRAFT_STORAGE_KEY);
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [draftInitialized, setDraftInitialized] = useState(false);
  const mountedRef = useRef(true);
  const redirectingRef = useRef(false);
  const setupBackBypassRef = useRef(false);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const modeParam = new URLSearchParams(window.location.search).get("mode");
      const fromSetupBackParam =
        new URLSearchParams(window.location.search).get("fromSetupBack") === "1";
      if (modeParam === "signin") {
        setMode("signin");
      }
      const fromSetupBackStorage =
        window.sessionStorage.getItem(AUTH_SETUP_BACK_BYPASS_KEY) === "1";
      if (fromSetupBackParam || fromSetupBackStorage) {
        setupBackBypassRef.current = true;
        window.sessionStorage.removeItem(AUTH_SETUP_BACK_BYPASS_KEY);
      }

      const storedDraft = window.sessionStorage.getItem(AUTH_SIGNIN_DRAFT_KEY);
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft) as {
            email?: string;
            password?: string;
          };
          setFormData({
            email: typeof parsed.email === "string" ? parsed.email : "",
            password: typeof parsed.password === "string" ? parsed.password : "",
          });
        } catch {
          window.sessionStorage.removeItem(AUTH_SIGNIN_DRAFT_KEY);
        }
      }
      setDraftInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!draftInitialized) return;
    window.sessionStorage.setItem(
      AUTH_SIGNIN_DRAFT_KEY,
      JSON.stringify({
        email: formData.email,
        password: formData.password,
      })
    );
  }, [formData, draftInitialized]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void router.prefetch("/setup");
    void router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    const redirectForSession = async (incomingSession?: Session | null) => {
      if (redirectingRef.current) return;
      if (setupBackBypassRef.current) {
        return;
      }
      const session =
        incomingSession ??
        (
          await supabase.auth.getSession()
        ).data.session;
      if (!session?.access_token) return;
      clearLegacySetupDraftStorage();
      redirectingRef.current = true;
      const postAuthTarget =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(AUTH_POST_TARGET_KEY)
          : null;
      if (typeof window !== "undefined") {
        if (postAuthTarget) {
          window.sessionStorage.removeItem(AUTH_POST_TARGET_KEY);
        }
      }
      if (postAuthTarget === "/setup" || postAuthTarget === "/dashboard") {
        router.replace(postAuthTarget);
        return;
      }
      // Route immediately for better perceived speed, then correct to setup if needed.
      router.replace("/dashboard");
      try {
        const profile = await api.get<Profile>("/api/me");
        identifyUser(session.user.id, {
          tier: profile.tier,
          onboarding_complete: profile.onboarding_complete,
        });
        if (!profile.onboarding_complete) {
          router.replace("/setup");
        }
      } catch {
        identifyUser(session.user.id, {});
        router.replace("/dashboard");
      }
    };

    void redirectForSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED"].includes(event)) return;
      if (!session) return;
      void redirectForSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setupBackBypassRef.current = false;
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_SETUP_BACK_BYPASS_KEY);
    }
    if (mountedRef.current) {
      setIsSubmitting(true);
      setError(null);
    }

    if (formData.password.length < 6) {
      if (mountedRef.current) {
        setError("Password must be at least 6 characters.");
        setIsSubmitting(false);
      }
      return;
    }

    try {
      if (mode === "signup") {
        void trackEvent("signup_started", { auth_method: "email_password" });
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
            if (mountedRef.current) {
              setError(
                "An account with this email already exists. Please sign in instead."
              );
              setMode("signin");
              setIsSubmitting(false);
            }
            return;
          }
          throw signUpError;
        }

        if (data.user && !data.session) {
          if (mountedRef.current) {
            setMode("signin");
            setError("Account created! Please check your email to confirm, then sign in.");
            setIsSubmitting(false);
          }
          return;
        }

        if (data.session) {
          void trackEvent("signup_completed", { auth_method: "email_password" });
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(AUTH_POST_TARGET_KEY, "/setup");
          }
          try {
            void api.patch<Profile>("/api/me", {
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
        void trackEvent("login_completed", { auth_method: "email_password" });
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(AUTH_SIGNIN_DRAFT_KEY);
        }
        // Route immediately for snappier UX, then correct to setup if needed.
        router.push("/dashboard");

        try {
          const profile = await api.get<Profile>("/api/me");
          if (!profile.onboarding_complete) {
            if (typeof window !== "undefined") {
              window.sessionStorage.setItem(AUTH_POST_TARGET_KEY, "/setup");
            }
            router.replace("/setup");
            return;
          }
        } catch {
          /* if profile fetch fails, go to dashboard */
        }
        return;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Something went wrong. Please try again.";
      if (mountedRef.current) {
        setError(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleOAuth = async (provider: "google") => {
    if (oauthProvider) return;
    setupBackBypassRef.current = false;
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_SETUP_BACK_BYPASS_KEY);
    }
    if (mountedRef.current) {
      setError(null);
      setOauthProvider(provider);
    }
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (oauthError && mountedRef.current) {
        setError(oauthError.message);
      }
    } finally {
      if (mountedRef.current) {
        setOauthProvider(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 relative">
        <div className="space-y-3">
          <div className="text-center">
            <Logo
              variant="envelope"
              className="w-[94px] h-[94px] sm:w-[104px] sm:h-[104px] mx-auto mb-2"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 dark:text-gray-100">
              Welcome!
            </h1>
            <p className="text-gray-600 text-sm dark:text-gray-300">
              Let&apos;s Make Your Personalized Newsletter!
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 dark:bg-slate-900">
            <button
              onClick={() => { setMode("signin"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                mode === "signin"
                  ? "bg-white text-gray-900 shadow-sm ring-2 ring-sky-200 dark:bg-slate-950 dark:text-gray-100 dark:ring-sky-700/70"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm ring-2 ring-sky-200 dark:bg-slate-950 dark:text-gray-100 dark:ring-sky-700/70"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 dark:text-gray-300">
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
              <label className="block text-sm font-bold text-gray-700 mb-1.5 dark:text-gray-300">
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
              <div className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-lg mt-2 disabled:opacity-60"
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
              disabled={isSubmitting || oauthProvider !== null}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:border-slate-800 dark:hover:border-slate-700"
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
                {oauthProvider === "google"
                  ? "CONNECTING TO GOOGLE..."
                  : "SIGN IN WITH GOOGLE"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
