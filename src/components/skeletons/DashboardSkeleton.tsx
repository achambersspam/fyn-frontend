export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton h-5 w-40 rounded-md" />
          <div className="skeleton h-8 w-24 rounded-xl" />
        </div>
        <div className="skeleton h-11 w-full rounded-xl" />
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="skeleton h-5 w-48 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
        <div className="skeleton h-11 w-40 rounded-xl" />
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-28 rounded-md" />
            <div className="skeleton h-4 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
