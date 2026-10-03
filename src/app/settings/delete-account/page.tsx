"use client";

import Link from "next/link";
import { ERROR_BOX_CLASS } from "@/lib/errorBox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Tooltip, { TooltipWithAria } from "@/components/Tooltip";
import { ChevronLeft } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { resetAnalyticsIdentity, trackEvent } from "@/lib/analytics";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setError(null);
    try {
      await api.delete("/api/me");
      void trackEvent("account_deleted", { source: "settings" });
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      resetAnalyticsIdentity();
      if (typeof window !== "undefined") {
        window.sessionStorage.clear();
      }
      router.push("/");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.message || "We couldn't delete your account. Please try again or contact support."
      );
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <TooltipWithAria label="Back to Settings">
            <Link
              href="/settings"
              aria-label="Back to Settings"
              className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ChevronLeft size={24} />
            </Link>
          </TooltipWithAria>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Delete Account
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {error && (
          <div className={ERROR_BOX_CLASS}>
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/40 dark:bg-red-950/10">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
            Delete account permanently (also cancels billing)
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-red-600/90 dark:text-red-400/90">
            Permanently delete your account, all newsletters, and your data. Any Stripe
            subscription is cancelled immediately. This cannot be undone.
          </p>
          <Tooltip label="Permanently delete your account and all data">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteConfirm(true);
              }}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Delete my account
            </button>
          </Tooltip>
        </div>

        <Tooltip label="Go back to Settings without deleting anything" className="w-full">
          <Link href="/settings" className="btn-outline block w-full text-center">
            Keep my account
          </Link>
        </Tooltip>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              This permanently deletes your account, newsletters, and all associated data,
              and immediately cancels any Stripe subscription. This action cannot be undone.
            </p>
            <label className="mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Type <span className="font-black">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-1.5 input-field"
              autoFocus
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText !== "DELETE"}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingAccount ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
