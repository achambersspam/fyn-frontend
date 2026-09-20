export default function FeedbackListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="skeleton h-5 w-40 rounded-md" />
            <div className="skeleton h-4 w-24 rounded-md" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-5/6 rounded-md" />
          </div>
          <div className="mt-2 skeleton h-3 w-28 rounded-md" />
          <div className="mt-4 flex items-center gap-2">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
