export default function AchievementsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="mx-auto skeleton h-16 w-16 rounded-2xl" />
        <div className="mx-auto skeleton h-10 w-16 rounded-md" />
        <div className="mx-auto skeleton h-4 w-24 rounded-md" />
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="skeleton h-5 w-28 rounded-md" />
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="skeleton h-3 w-6 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="mx-auto skeleton h-8 w-12 rounded-md" />
          <div className="mx-auto skeleton h-4 w-24 rounded-md" />
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="mx-auto skeleton h-8 w-12 rounded-md" />
          <div className="mx-auto skeleton h-4 w-24 rounded-md" />
        </div>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="skeleton h-5 w-36 rounded-md" />
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
