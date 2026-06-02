import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: June 2, 2026</p>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          For You Newsletter ("we," "us," or "our") operates the For You Newsletter service
          accessible at foryounewsletter.com (the "Service"). This Privacy Policy explains
          what information we collect, how we use it, and your rights regarding that
          information.
        </p>

        <Section title="1. Information We Collect">
          <Subsection title="Account information">
            When you create an account, we collect your email address and any display name
            you provide. This is used to authenticate you and deliver your newsletter.
          </Subsection>
          <Subsection title="Newsletter preferences">
            We store the topics, subtopics, and customization settings you choose so we can
            generate a newsletter personalized to you.
          </Subsection>
          <Subsection title="Payment information">
            Payments are processed entirely by Stripe, Inc. We never see or store your card
            number, bank details, or full payment credentials. We receive a Stripe customer
            ID and subscription status from Stripe solely to manage your plan.
          </Subsection>
          <Subsection title="Usage and analytics data">
            We collect anonymized events about how you interact with the Service (e.g., pages
            visited, features used) through PostHog and our own internal analytics pipeline.
            Sensitive fields such as passwords, authentication tokens, and raw newsletter
            content are never included in analytics events.
          </Subsection>
          <Subsection title="Technical data">
            Standard server and infrastructure logs may record your IP address, browser type,
            and request timestamps. These are used for security, debugging, and abuse
            prevention, and are not linked to your account for marketing purposes.
          </Subsection>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="mt-2 list-disc pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300 space-y-1">
            <li>To generate and deliver your personalized newsletter by email and in-app.</li>
            <li>To process subscription payments and manage your plan.</li>
            <li>To authenticate you and keep your account secure.</li>
            <li>To improve the Service based on aggregated, anonymized usage patterns.</li>
            <li>
              To send transactional emails (e.g., account confirmations, billing receipts).
              We do not send promotional or marketing emails beyond the newsletter you
              explicitly signed up for. Every newsletter email includes an unsubscribe link.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Share Your Information">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We share data with the following service providers only to the extent necessary
            to operate the Service. We do not sell your personal information to third
            parties.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300 space-y-2">
            <li>
              <strong>Supabase</strong> — authentication and database hosting. Your account
              data and newsletter preferences are stored in Supabase.
            </li>
            <li>
              <strong>Stripe</strong> — payment processing and subscription management.
              Stripe's own{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              governs data handled during payment processing.
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery of your newsletter.
              Your email address is transmitted to Resend solely to send your newsletter and
              account emails.
            </li>
            <li>
              <strong>Groq</strong> — AI inference for newsletter generation. Your selected
              topic preferences are sent to Groq to produce content summaries. No persistent
              user profile is created with Groq on your behalf.
            </li>
            <li>
              <strong>Upstash (Redis)</strong> — rate limiting and short-lived request
              caching. No personally identifiable information is stored long-term in this
              layer.
            </li>
            <li>
              <strong>PostHog</strong> — product analytics, if enabled. Data is anonymized
              and sanitized before transmission. See PostHog's{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              for details.
            </li>
          </ul>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We may also disclose information if required by law, court order, or to protect
            the rights, property, or safety of For You Newsletter, our users, or the public.
          </p>
        </Section>

        <Section title="4. Data Security">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We implement reasonable technical and organizational measures to protect your
            personal information against unauthorized access, loss, or misuse. All data
            transmitted between your browser and our Service is encrypted via HTTPS. Your
            account is protected by authentication managed through Supabase.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            No method of transmission or storage is 100% secure. While we work to protect
            your data, we cannot guarantee absolute security. If you believe your account
            has been compromised, please contact us immediately.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We retain your account data and newsletter preferences for as long as your
            account is active. If you delete your account, we will delete or anonymize your
            personal data within a reasonable period, except where we are required to retain
            records for legal or financial compliance purposes (e.g., Stripe transaction
            records required for tax and accounting purposes).
          </p>
        </Section>

        <Section title="6. Cookies and Tracking Technologies">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We use cookies and similar browser storage technologies to keep you signed in
            and remember your preferences. For full details, see our{" "}
            <Link href="/cookies" className="text-sky-600 hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="7. Third-Party Links">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Your newsletter may contain links to third-party news articles and websites. We
            do not control those sites and are not responsible for their privacy practices
            or content. We encourage you to review the privacy policies of any third-party
            sites you visit.
          </p>
        </Section>

        <Section title="8. Your Privacy Rights">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Depending on where you live, you may have the following rights regarding your
            personal information:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300 space-y-1">
            <li>
              <strong>Access:</strong> Request a copy of the personal information we hold
              about you.
            </li>
            <li>
              <strong>Correction:</strong> Update inaccurate information. You can correct
              most information directly from your account dashboard.
            </li>
            <li>
              <strong>Deletion:</strong> Request that we delete your personal information,
              subject to legal retention obligations.
            </li>
            <li>
              <strong>Unsubscribe:</strong> Opt out of newsletter delivery at any time using
              the unsubscribe link in any newsletter email, or from your account settings.
            </li>
          </ul>
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            California Residents (CCPA/CPRA)
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            If you are a California resident, you have the right to know what personal
            information we collect and how it is used, the right to delete your personal
            information, the right to correct inaccurate information, and the right to
            non-discrimination for exercising these rights. As stated above, we do not sell
            or share your personal information for cross-context behavioral advertising. To
            exercise any of these rights, contact us at the address below.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            To exercise any privacy right, contact us at{" "}
            <a
              href="mailto:foryou.newsletter@gmail.com"
              className="text-sky-600 hover:underline"
            >
              foryou.newsletter@gmail.com
            </a>
            . We will respond within 45 days.
          </p>
        </Section>

        <Section title="9. Children">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The Service is not directed to children under the age of 13, and we do not
            knowingly collect personal information from children under 13. If you believe
            a child under 13 has provided us with personal information, please contact us
            and we will promptly delete it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We may update this Privacy Policy from time to time. When we do, we will revise
            the "Last updated" date at the top of this page. For material changes, we will
            make reasonable efforts to notify you (e.g., via email or a notice on the
            Service). Continued use of the Service after changes are posted constitutes
            your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Questions or concerns about this Privacy Policy? Contact us at:{" "}
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</p>
    </div>
  );
}
