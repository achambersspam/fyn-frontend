import Link from "next/link";

export default function PublicSiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <a href="https://www.instagram.com/foryounewsletter/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          For You Newsletter. Personalized news without the noise.
        </p>
      </div>
    </footer>
  );
}

