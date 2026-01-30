"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, MailCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/apiContracts";

export default function EmailSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<Profile>("/user/profile")
      .then((data) => setEmail(data?.email ?? ""))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setError(null);

    api
      .put("/user/email", { email })
      .then(() => router.push("/settings"))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to update email.";
        setError(message);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-slate-900"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">Email</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs font-black text-gray-500 tracking-widest dark:text-gray-400">PRIMARY EMAIL</p>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
          />
          {isLoading && (
            <p className="text-xs text-gray-500 font-semibold dark:text-gray-400">Loading email...</p>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <MailCheck size={18} />
            {isSaving ? "Saving..." : "Save Email"}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
