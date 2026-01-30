"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  variant?: "icon" | "pill";
}

export default function ThemeToggle({ variant = "pill" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const icon =
    theme === "light" ? (
      <Sun size={18} />
    ) : theme === "dark" ? (
      <Moon size={18} />
    ) : (
      <SunMoon size={18} />
    );

  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch theme (current: ${label})`}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:border-slate-800 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-900"
      >
        {icon}
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

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
