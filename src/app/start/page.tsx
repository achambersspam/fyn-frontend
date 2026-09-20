import Link from "next/link";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";

export default function StartPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicSiteNav settingsHref="/auth?mode=signin" />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          3 step sign up to unlock personalized news just for you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Pick what you care about, tell us the specifics, and choose when it lands. No
          generic digest — one newsletter built around you.
        </p>
        <ol className="mt-10 space-y-4">
          {[
            ["1", "Pick your topics", "Sports, stocks, weather, tech — only the sections you want."],
            ["2", "Tell us the specifics", "Teams, tickers, cities, and the details that make it yours."],
            ["3", "Choose when it lands", "Daily, weekly, or your own cadence — in the app and your inbox."],
          ].map(([step, title, body]) => (
            <li
              key={step}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary">
                {step}
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href="/auth" className="btn-premium">
            Create Account
          </Link>
          <Link
            href="/auth?mode=signin"
            className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300"
          >
            Already have an account? Log in
          </Link>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
