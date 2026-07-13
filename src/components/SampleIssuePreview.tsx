// A static, clearly-labeled sample issue in a browser frame so visitors see
// the actual product shape — section structure mirrors the real renderer
// (topic header, focused summaries, market note, multi-location weather).
export default function SampleIssuePreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        aria-hidden
        className="animate-glow-pulse absolute inset-0 mx-auto h-64 w-64 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-primary/10 dark:border-slate-800 dark:bg-slate-900">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 flex-1 truncate rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            foryounewsletter.com/dashboard
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Issue header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Your daily issue
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">
                Good morning, Alex
              </h3>
            </div>
            <img src="/pigeon-filled.svg" alt="" aria-hidden className="h-10 w-10" />
          </div>

          {/* Stocks */}
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              📊 Your Stocks — AAPL · NVDA
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                AAPL $232.14 ▲ 1.2%
              </span>
              <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                NVDA $131.80 ▼ 0.6%
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Apple closed higher after strong services revenue guidance;
              Nvidia slipped ahead of Thursday&apos;s earnings call.
              <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                Prices as of last close — markets closed for the weekend.
              </span>
            </p>
          </div>

          {/* Sports */}
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              🏀 Your Teams — Atlanta Hawks
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Hawks 118, Celtics 112 — Trae Young posted 34 points and 11
              assists Friday night; Atlanta has won four of its last five.
            </p>
          </div>

          {/* Weather */}
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              🌤 Your Weather — Atlanta · New York
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Atlanta</p>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">82° · Sunny</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">New York</p>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">74° · Cloudy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Honest sample label */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
          Sample issue — yours is built from your topics, teams, and cities.
        </div>
      </div>
    </div>
  );
}
