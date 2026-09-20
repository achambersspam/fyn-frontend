export default function NewsletterListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="block rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-40 rounded-md" />
              <div className="skeleton h-4 w-56 rounded-md" />
            </div>
            <div className="skeleton h-5 w-5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
