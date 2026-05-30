import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Placeholder: final Privacy Policy text will be added before public launch.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-sky-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

