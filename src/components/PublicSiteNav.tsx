import Link from "next/link";

type PublicSiteNavProps = {
  settingsHref: string;
};

export default function PublicSiteNav({ settingsHref }: PublicSiteNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-pigeon-envelope-v.2-.svg" alt="For You Newsletter" className="h-8 w-8" />
          <span className="text-sm font-black tracking-wide text-slate-900 dark:text-slate-100">
            For You Newsletter
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href={settingsHref}>Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth?mode=signin" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Log In
          </Link>
          <Link
            href="/auth"
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

