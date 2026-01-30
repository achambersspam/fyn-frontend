"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, Lock } from "lucide-react";
import { api } from "@/lib/api";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setError(null);

    api
      .put("/user/password", { password })
      .then(() => router.push("/settings"))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to update password.";
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
          <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">Change Password</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs font-black text-gray-500 tracking-widest dark:text-gray-400">NEW PASSWORD</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a new password"
            className="input-field"
          />
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || password.length === 0}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Lock size={18} />
            {isSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
