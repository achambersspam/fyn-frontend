"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { api, type ApiError } from "@/lib/api";
import {
  EVENT_TYPE_INFO,
  EVENT_TYPE_ORDER,
  type AdminEvent,
  type AdminEventsResponse,
  type AdminOverview,
} from "@/lib/adminTypes";

const BRAND = "#1CB0F6";
const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";

const pct = (value: number | null | undefined, digits = 0) =>
  value === null || value === undefined ? "n/a" : `${(value * 100).toFixed(digits)}%`;
const num = (value: number) => value.toLocaleString();
const money = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

// ------------------------------------------------------------------ building blocks

function Card({ title, subtitle, children, right }: { title: string; subtitle?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" }) {
  const color = tone === "bad" ? RED : tone === "good" ? GREEN : tone === "warn" ? AMBER : undefined;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-gray-900 dark:text-gray-100" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p> : null}
    </div>
  );
}

function Empty({ children = "Nothing yet." }: { children?: ReactNode }) {
  return <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:bg-slate-950 dark:text-gray-400">{children}</p>;
}

/** Horizontal bar list: the bar graph used for users-per-topic, reasons, sources... */
function BarList({
  rows,
  color = BRAND,
  unit = "",
  max,
}: {
  rows: Array<{ label: string; value: number; hint?: string }>;
  color?: string;
  unit?: string;
  max?: number;
}) {
  if (rows.length === 0) return <Empty />;
  const top = max ?? Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-gray-800 dark:text-gray-200">{row.label}</span>
            <span className="shrink-0 tabular-nums text-gray-600 dark:text-gray-300">
              {num(row.value)}
              {unit}
              {row.hint ? <span className="ml-2 text-xs text-gray-400">{row.hint}</span> : null}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (row.value / top) * 100)}%`, backgroundColor: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Vertical bars over time (signups per day, issues per day). */
function DayBars({
  days,
  series,
}: {
  days: string[];
  series: Array<{ name: string; color: string; values: number[] }>;
}) {
  const totals = days.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] || 0), 0));
  const top = Math.max(...totals, 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {days.map((day, i) => (
          <div key={day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${shortDay(day)}: ${totals[i]}`}>
            {series.map((s) => (
              <div key={s.name} style={{ height: `${((s.values[i] || 0) / top) * 100}%`, backgroundColor: s.color }} className="w-full first:rounded-t" />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>{shortDay(days[0])}</span>
        <span>{shortDay(days[days.length - 1])}</span>
      </div>
      {series.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
          {series.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------ drill-down drawer

function EventsDrawer({ type, days, onClose }: { type: string; days: number; onClose: () => void }) {
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const info = EVENT_TYPE_INFO[type];

  useEffect(() => {
    let cancelled = false;
    api
      .get<AdminEventsResponse>(`/api/admin/events?type=${encodeURIComponent(type)}&days=${days}&limit=300`)
      .then((res) => !cancelled && setEvents(res.events))
      .catch(() => !cancelled && setError("Could not load these events."));
    return () => {
      cancelled = true;
    };
  }, [type, days]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900" role="dialog" aria-modal="true">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{info?.label || type}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {info?.help} Showing the last {days === 1 ? "24 hours" : `${days} days`}.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800">
            Close
          </button>
        </div>
        {error ? <Empty>{error}</Empty> : null}
        {!error && events === null ? (
          <div className="flex justify-center py-10">
            <Spinner size={20} />
          </div>
        ) : null}
        {events && events.length === 0 ? <Empty>No events in this window.</Empty> : null}
        {events && events.length > 0 ? (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="rounded-xl border border-gray-200 p-3 text-sm dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-gray-900 dark:text-gray-100">{event.user_email || "Unknown user"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{when(event.at)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {event.topic ? <span className="rounded-full bg-sky-100 px-2 py-0.5 font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">{event.topic}</span> : null}
                  {event.source ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-slate-800 dark:text-gray-300">{event.source}</span> : null}
                </div>
                {event.message ? <p className="mt-2 text-gray-700 dark:text-gray-300">{event.message}</p> : null}
                {Object.keys(event.detail || {}).length > 0 ? (
                  <div className="mt-2">
                    <button onClick={() => setOpen(open === event.id ? null : event.id)} className="text-xs font-bold text-primary hover:underline">
                      {open === event.id ? "Hide details" : "Show details"}
                    </button>
                    {open === event.id ? (
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-50 p-2 text-xs text-gray-700 dark:bg-slate-950 dark:text-gray-300">
                        {JSON.stringify(event.detail, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </aside>
    </div>
  );
}

// ------------------------------------------------------------------ page

type Window = 1 | 7 | 30;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [win, setWin] = useState<Window>(7);
  const [drill, setDrill] = useState<string | null>(null);
  const [security, setSecurity] = useState<{ pinned: boolean; user_id: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.get<AdminOverview>("/api/admin/overview"));
    } catch (err) {
      const status = (err as ApiError)?.status;
      if (status === 401) return router.replace("/auth");
      // Non-founders get a 404 from the API: send them to the normal app.
      if (status === 404) return router.replace("/dashboard");
      setError("Could not load the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    api
      .get<{ is_founder: boolean; pinned?: boolean; user_id?: string }>("/api/admin/me")
      .then((me) => me.is_founder && me.user_id && setSecurity({ pinned: Boolean(me.pinned), user_id: me.user_id }))
      .catch(() => undefined);
  }, [load]);

  const counts = useMemo(() => (data ? (win === 1 ? data.health.last24h : win === 7 ? data.health.last7d : data.health.last30d) : {}), [data, win]);
  const totalProblems = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pigeon-filled.svg" alt="" className="h-9 w-9" />
            <div>
              <h1 className="text-lg font-black leading-tight text-gray-900 dark:text-gray-100">Founder dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data ? `Updated ${when(data.generatedAt)}` : "For You Newsletter"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10">
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error ? <Empty>{error}</Empty> : null}
        {security && !security.pinned ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-bold">Lock this dashboard to your account</p>
            <p className="mt-1">
              Right now anyone who signs up with your founder email could open it. In Vercel (backend project) add{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">FOUNDER_USER_IDS={security.user_id}</code> and redeploy.
            </p>
          </div>
        ) : null}
        {data ? (
          <>
            {/* ---- headline numbers */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Users" value={num(data.users.total)} sub={`+${num(data.users.new7d)} this week - +${num(data.users.new24h)} today`} />
              <Kpi
                label="Paying users"
                value={num(data.paying.total)}
                sub={data.paying.byTier.map((t) => `${t.label} ${t.count}`).join(" - ") || "none yet"}
                tone={data.paying.total > 0 ? "good" : undefined}
              />
              <Kpi label="Est. monthly revenue" value={money(data.paying.estMonthlyRevenueUsd)} sub="Paying plans only (excludes trials)" />
              <Kpi
                label="Cancellations"
                value={num(data.cancellations.canceled30d)}
                sub={`${num(data.cancellations.pendingAtPeriodEnd)} scheduled - ${num(data.cancellations.canceledTotal)} all-time`}
                tone={data.cancellations.pendingAtPeriodEnd > 0 ? "warn" : undefined}
              />
              <Kpi label="Activation" value={pct(data.users.activationRate)} sub={`${num(data.users.withNewsletter)} of ${num(data.users.total)} created a newsletter`} />
              <Kpi label="Open rate (30d)" value={pct(data.engagement.openRate)} sub={`${num(data.engagement.clicks30d)} clicks - ${num(data.engagement.inAppReads30d)} in-app reads`} />
              <Kpi
                label="Failed newsletters (30d)"
                value={pct(data.issues.failureRate, 1)}
                sub={`${num(data.issues.failed)} of ${num(data.issues.last30d)} issues`}
                tone={data.issues.failed > 0 ? "bad" : "good"}
              />
              <Kpi label="Active users" value={num(data.engagement.active7d)} sub={`${num(data.engagement.active1d)} today - ${num(data.engagement.active30d)} in 30 days`} />
            </div>

            {/* ---- errors and fallbacks (clickable) */}
            <Card
              title="Errors, failures and RSS fallbacks"
              subtitle="Click any row to see exactly when it happened and to which user."
              right={
                <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
                  {([1, 7, 30] as Window[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => setWin(w)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${win === w ? "bg-white text-gray-900 shadow dark:bg-slate-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {w === 1 ? "24h" : `${w}d`}
                    </button>
                  ))}
                </div>
              }
            >
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{num(totalProblems)}</span> problems in this window
              </p>
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {EVENT_TYPE_ORDER.map((type) => {
                  const count = counts[type] || 0;
                  const info = EVENT_TYPE_INFO[type];
                  const severe = type === "issue_failed" || type === "topic_error" || type === "story_layer_error";
                  return (
                    <li key={type}>
                      <button
                        onClick={() => count > 0 && setDrill(type)}
                        disabled={count === 0}
                        className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-slate-800/60"
                      >
                        <span>
                          <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">{info.label}</span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{info.help}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span
                            className="min-w-[2.5rem] rounded-full px-3 py-1 text-center text-sm font-black tabular-nums text-white"
                            style={{ backgroundColor: count === 0 ? "#9ca3af" : severe ? RED : AMBER }}
                          >
                            {num(count)}
                          </span>
                          {count > 0 ? <span className="text-gray-400">&rsaquo;</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {data.issues.topFailureReasons.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Top newsletter failure reasons (30d)</p>
                  <BarList color={RED} rows={data.issues.topFailureReasons.map((r) => ({ label: r.reason, value: r.count }))} />
                </div>
              ) : null}
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* ---- users per topic */}
              <Card title="Users per topic" subtitle="Distinct users who have the topic in a newsletter">
                <BarList rows={data.topics.usersPerTopic.map((t) => ({ label: t.topic, value: t.users, hint: `${t.newsletters} newsletters` }))} />
              </Card>

              {/* ---- paying users by tier */}
              <Card title="Users by plan" subtitle="Paying users are on Plus or Premium with an active or trialing subscription">
                <BarList
                  rows={[
                    { label: "Free", value: data.paying.tierCounts.basic || 0 },
                    ...data.paying.byTier.map((t) => ({ label: t.label, value: t.count })),
                  ]}
                />
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {num(data.paying.trialing)} trialing - {num(data.paying.pastDue)} past due - conversion {pct(data.paying.conversionRate, 1)}
                </p>
              </Card>

              {/* ---- how did you hear */}
              <Card
                title="How did you hear about us?"
                subtitle={`${num(data.referrals.answered)} of ${num(data.users.total)} users answered (${pct(data.referrals.answeredRate)})`}
              >
                <BarList color={GREEN} rows={data.referrals.bySource.map((r) => ({ label: r.source, value: r.count }))} />
                {data.referrals.otherAnswers.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">&quot;Other&quot; answers, in their words</p>
                    <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                      {data.referrals.otherAnswers.map((a, i) => (
                        <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-950">
                          <span className="text-gray-800 dark:text-gray-200">{a.text}</span>
                          <span className="ml-2 text-xs text-gray-400">{a.email}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>

              {/* ---- cancellations */}
              <Card title="Why people cancel" subtitle="From the popup shown when someone cancels">
                <BarList color={RED} rows={data.cancellations.reasons.map((r) => ({ label: r.reason, value: r.count }))} />
                {data.cancellations.recent.length > 0 ? (
                  <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto text-sm">
                    {data.cancellations.recent.map((r, i) => (
                      <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-950">
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{r.reason}</span>
                          <span className="shrink-0 text-xs text-gray-400">{when(r.at)}</span>
                        </div>
                        {r.detail ? <p className="mt-0.5 text-gray-600 dark:text-gray-300">&ldquo;{r.detail}&rdquo;</p> : null}
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            </div>

            {/* ---- time series */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Signups, last 30 days">
                <DayBars days={data.users.signupsByDay.map((d) => d.date)} series={[{ name: "Signups", color: BRAND, values: data.users.signupsByDay.map((d) => d.count) }]} />
              </Card>
              <Card title="Newsletters generated, last 14 days">
                <DayBars
                  days={data.issues.perDay.map((d) => d.date)}
                  series={[
                    { name: "Sent", color: GREEN, values: data.issues.perDay.map((d) => d.sent) },
                    { name: "Generated", color: BRAND, values: data.issues.perDay.map((d) => d.generated) },
                    { name: "Failed", color: RED, values: data.issues.perDay.map((d) => d.failed) },
                  ]}
                />
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card title="Most followed teams">
                <BarList rows={data.topics.topEntities.map((t) => ({ label: t.name, value: t.users }))} />
              </Card>
              <Card title="Most followed tickers">
                <BarList rows={data.topics.topTickers.map((t) => ({ label: t.symbol, value: t.users }))} />
              </Card>
              <Card title="Why people turn a newsletter off" subtitle="Pause or delete popup">
                <BarList color={AMBER} rows={data.cancellations.newsletterOffReasons.map((r) => ({ label: r.reason, value: r.count }))} />
                {data.cancellations.newsletterOffRecent.some((r) => r.detail) ? (
                  <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto text-sm">
                    {data.cancellations.newsletterOffRecent
                      .filter((r) => r.detail)
                      .map((r, i) => (
                        <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700 dark:bg-slate-950 dark:text-gray-300">
                          &ldquo;{r.detail}&rdquo; <span className="text-xs text-gray-400">- {r.reason}</span>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </Card>
            </div>

            <Card title="Health of the product">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Kpi label="First-newsletter success" value={pct(data.issues.firstIssueSuccessRate)} sub="New users whose first issue built" tone={data.issues.firstIssueSuccessRate !== null && data.issues.firstIssueSuccessRate < 0.9 ? "warn" : "good"} />
                <Kpi label="Avg newsletters / user" value={data.users.avgNewslettersPerUser.toFixed(1)} sub="Among users who created one" />
                <Kpi label="Paused newsletters" value={num(data.other.pausedNewsletters)} sub={`${num(data.other.planDisabledNewsletters)} disabled by plan`} />
                <Kpi label="Feedback to review" value={num(data.other.feedbackPending)} sub={`${num(data.other.feedbackTotal)} posts total`} tone={data.other.feedbackPending > 0 ? "warn" : undefined} />
                <Kpi label="Unsubscribed users" value={num(data.users.unsubscribed)} sub="Opted out of email" />
                <Kpi label="Marketing opt-ins" value={num(data.other.marketingOptIn)} />
              </div>
              {data.other.frequency.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Delivery frequency</p>
                  <BarList rows={data.other.frequency.map((f) => ({ label: f.frequency, value: f.count }))} />
                </div>
              ) : null}
            </Card>
          </>
        ) : null}
      </main>

      {drill ? <EventsDrawer type={drill} days={win} onClose={() => setDrill(null)} /> : null}
    </div>
  );
}
