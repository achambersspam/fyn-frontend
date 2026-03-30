"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpen, Settings } from "@/components/Icons";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "HOME", path: "/dashboard" },
    { icon: Compass, label: "DISCOVER", path: "/discover" },
    { icon: BookOpen, label: "NEWSLETTER", path: "/newsletter" },
    { icon: Settings, label: "SETTINGS", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-[820px] w-full mx-auto flex justify-around items-center py-2 px-4 sm:px-6 lg:px-10">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path || pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
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
  );
}
