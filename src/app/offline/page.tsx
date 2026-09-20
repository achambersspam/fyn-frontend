import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">You&apos;re offline</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          We can&apos;t reach For You Newsletter right now. Reconnect to generate or save
          changes. Pages you already opened may still work.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Try home
        </Link>
      </div>
    </div>
  );
}
