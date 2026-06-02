import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Cookie Policy</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: June 2, 2026</p>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          This Cookie Policy explains how For You Newsletter uses cookies and similar
          browser storage technologies when you use the Service at foryounewsletter.com.
          For a broader description of how we handle your personal information, see our{" "}
          <Link href="/privacy" className="text-sky-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <Section title="1. What Are Cookies">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Cookies are small text files that a website stores in your browser. Similar
            technologies include <em>localStorage</em> and <em>sessionStorage</em>, which
            store data directly in your browser without transmitting it to a server on
            every request. We use both cookies and localStorage as described below.
          </p>
        </Section>

        <Section title="2. What We Use and Why">
          <div className="mt-3 space-y-5">
            <StorageItem
              name="Authentication session (Supabase)"
              type="Cookie / localStorage"
              purpose="Strictly necessary"
              description="Keeps you signed in between page visits. Set when you sign in and cleared when you sign out. Without this, you would need to log in on every page load. These cannot be disabled while using the Service."
            />
            <StorageItem
              name="Theme preference"
              type="localStorage"
              purpose="Functional"
              description="Remembers whether you have chosen light or dark mode so your preference is restored on your next visit. This data stays in your browser and is never sent to our servers."
            />
            <StorageItem
              name="Analytics (PostHog)"
              type="Cookie / localStorage"
              purpose="Analytics"
              description="If PostHog analytics are active, PostHog sets cookies and localStorage entries to track anonymized usage events such as page views and feature interactions. Sensitive data — including passwords, authentication tokens, and newsletter content — is never included. This data helps us understand how the Service is used so we can improve it."
            />
          </div>
        </Section>

        <Section title="3. What We Do Not Use">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We do not use advertising cookies, cross-site tracking cookies, or sell
            cookie-derived data to ad networks or data brokers. We do not use third-party
            social media tracking pixels.
          </p>
        </Section>

        <Section title="4. Managing Cookies and Opting Out">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>Browser controls:</strong> You can view, block, or delete cookies at
            any time through your browser settings. Note that blocking authentication
            cookies will prevent you from signing in to the Service.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>localStorage:</strong> To clear localStorage data, use your browser's
            developer tools (Application → Local Storage) or the "Clear site data" option
            in your browser settings.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>PostHog analytics opt-out:</strong> PostHog respects the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-700">
              Do Not Track
            </code>{" "}
            browser setting. You can also opt out of PostHog tracking directly via{" "}
            <a
              href="https://posthog.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline"
            >
              PostHog's privacy page
            </a>
            . If PostHog is not configured for the Service, no PostHog cookies will be set.
          </p>
        </Section>

        <Section title="5. Changes to This Policy">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We may update this Cookie Policy from time to time. Changes will be reflected
            in the "Last updated" date above.
          </p>
        </Section>

        <Section title="6. Contact">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Questions about this Cookie Policy? Contact us at:{" "}
            <a
              href="mailto:foryou.newsletter@gmail.com"
              className="text-sky-600 hover:underline"
            >
              foryou.newsletter@gmail.com
            </a>
          </p>
        </Section>

        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-sky-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      {children}
    </div>
  );
}

function StorageItem({
  name,
  type,
  purpose,
  description,
}: {
  name: string;
  type: string;
  purpose: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {type}
        </span>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 dark:bg-sky-900 dark:text-sky-300">
          {purpose}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
