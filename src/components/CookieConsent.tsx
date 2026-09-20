"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasDoNotTrack, readCookieConsent, writeCookieConsent } from "@/lib/cookieConsent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasDoNotTrack()) {
      if (readCookieConsent()?.analytics !== false) {
        writeCookieConsent(false);
      }
      setVisible(false);
      return;
    }
    setVisible(!readCookieConsent());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-[60] px-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">
          We use PostHog for product analytics (including session recording) only if you
          accept. Error monitoring stays on. See our{" "}
          <Link href="/cookies" className="font-semibold text-primary hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="btn-outline py-2 px-4 text-sm"
            onClick={() => {
              writeCookieConsent(false);
              setVisible(false);
            }}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn-primary py-2 px-4 text-sm"
            onClick={() => {
              writeCookieConsent(true);
              setVisible(false);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
