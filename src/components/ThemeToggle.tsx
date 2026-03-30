"use client";

import { Moon, Sun } from "@/components/Icons";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-[96px] h-[36px] rounded-full border shadow-sm transition-colors ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-blue-200"
      }`}
      aria-label={`Switch theme (current: ${label})`}
    >
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-colors">
          <Moon size={14} />
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-colors">
          <Sun size={14} />
        </span>
      </div>
      <span
        className={`absolute top-1 left-1 h-[28px] w-[28px] rounded-full shadow-md transition-transform duration-300 ease-out ${
          isDark
            ? "translate-x-0 bg-slate-700"
            : "translate-x-[56px] bg-blue-500"
        }`}
      >
        <span className="flex h-full w-full items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </span>
    </button>
  );
}