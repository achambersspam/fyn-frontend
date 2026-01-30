import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-300">
          The page you are looking for does not exist. Try heading back home.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-white font-black hover:bg-primary-dark transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
