"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  NAV_COACH_ACTIVE_KEY,
  NAV_COACH_ITEMS,
  consumeCoachActivation,
  isCoachComplete,
  readLocalCoachSeen,
  writeLocalCoachSeen,
  type NavCoachLabel,
  type NavCoachSeen,
} from "@/lib/navCoachMarks";
import type { Profile } from "@/lib/apiContracts";

const mergeSeen = (a: NavCoachSeen, b: NavCoachSeen): NavCoachSeen => ({ ...a, ...b });

export default function NavCoachMarks({ profileSeen }: { profileSeen?: NavCoachSeen | null }) {
  const [active, setActive] = useState(false);
  const [seen, setSeen] = useState<NavCoachSeen>({});

  useEffect(() => {
    const local = readLocalCoachSeen();
    const merged = mergeSeen(local, profileSeen || {});
    setSeen(merged);
    if (isCoachComplete(merged)) {
      setActive(false);
      return;
    }
    setActive(consumeCoachActivation());
  }, [profileSeen]);

  const persist = useCallback((next: NavCoachSeen) => {
    writeLocalCoachSeen(next);
    void api.patch<Profile>("/api/me", { nav_coach_marks_seen: next }).catch(() => {
      /* local mirror still holds */
    });
  }, []);

  const remaining = useMemo(
    () => NAV_COACH_ITEMS.filter((item) => !seen[item.label]),
    [seen]
  );

  const dismissOne = (label: NavCoachLabel) => {
    const next = { ...seen, [label]: true };
    setSeen(next);
    persist(next);
    if (isCoachComplete(next)) {
      setActive(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(NAV_COACH_ACTIVE_KEY);
      }
    }
  };

  const dismissAll = useCallback(() => {
    const next: NavCoachSeen = {};
    for (const item of NAV_COACH_ITEMS) next[item.label] = true;
    setSeen(next);
    persist(next);
    setActive(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(NAV_COACH_ACTIVE_KEY);
    }
  }, [persist]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, dismissAll]);

  if (!active || remaining.length === 0) return null;

  return (
    <div className="absolute -top-16 left-0 right-0 z-[60] px-4">
      <div className="mx-auto flex max-w-[820px] justify-around">
        {NAV_COACH_ITEMS.map((item) => {
          if (seen[item.label]) {
            return <div key={item.label} className="w-16" />;
          }
          return (
            <button
              key={item.label}
              type="button"
              id={`coach-${item.label}`}
              onClick={() => dismissOne(item.label)}
              className="pointer-events-auto max-w-[4.5rem] rounded-xl bg-slate-900 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-white shadow-lg motion-safe:animate-fade-up dark:bg-sky-600"
            >
              {item.copy}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={dismissAll}
          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow dark:bg-slate-800 dark:text-slate-100"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function coachDescribedBy(label: NavCoachLabel, active: boolean, seen: NavCoachSeen) {
  if (!active || seen[label]) return undefined;
  return `coach-${label}`;
}
