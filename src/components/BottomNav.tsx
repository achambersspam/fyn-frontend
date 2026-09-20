"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Compass, BookOpen, Settings } from "@/components/Icons";
import NavCoachMarks from "@/components/NavCoachMarks";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/apiContracts";
import {
  NAV_COACH_ACTIVE_KEY,
  readLocalCoachSeen,
  type NavCoachSeen,
} from "@/lib/navCoachMarks";

export default function BottomNav() {
  const pathname = usePathname();
  const [profileSeen, setProfileSeen] = useState<NavCoachSeen | null>(null);
  const [coachActive, setCoachActive] = useState(false);
  const [seen, setSeen] = useState<NavCoachSeen>({});

  useEffect(() => {
    setSeen(readLocalCoachSeen());
    setCoachActive(
      typeof window !== "undefined" &&
        window.sessionStorage.getItem(NAV_COACH_ACTIVE_KEY) === "1"
    );
    void api
      .get<Profile>("/api/me")
      .then((profile) => {
        setProfileSeen(profile.nav_coach_marks_seen || {});
      })
      .catch(() => {
        setProfileSeen({});
      });
  }, []);

  const navItems = [
    { icon: Home, label: "HOME" as const, path: "/dashboard" },
    { icon: Compass, label: "DISCOVER" as const, path: "/discover" },
    { icon: BookOpen, label: "NEWSLETTER" as const, path: "/newsletter" },
    { icon: Settings, label: "SETTINGS" as const, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 dark:bg-slate-950 dark:border-slate-800">
      <div className="relative max-w-[820px] w-full mx-auto">
        <NavCoachMarks profileSeen={profileSeen} />
        <div className="flex justify-around items-center py-2 px-4 sm:px-6 lg:px-10">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = pathname === path || pathname.startsWith(`${path}/`);
            const describedBy =
              coachActive && !seen[label] ? `coach-${label}` : undefined;
            return (
              <Link
                key={path}
                href={path}
                aria-describedby={describedBy}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-transform duration-100 active:scale-[0.97] ${
                  isActive
                    ? "text-primary"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`text-xs font-bold ${isActive ? "font-black" : ""}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
