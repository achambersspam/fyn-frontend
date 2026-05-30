"use client";

export default function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-16 rounded-2xl border border-gray-200 bg-white animate-pulse dark:border-slate-800 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}
