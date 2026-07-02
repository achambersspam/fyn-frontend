import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: June 2, 2026</p>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          These Terms of Use ("Terms") govern your access to and use of the For You
          Newsletter service ("Service") at foryounewsletter.com, operated by For You
          Newsletter ("we," "us," or "our"). By creating an account or using the Service,
          you agree to these Terms. If you do not agree, do not use the Service.
        </p>

        <Section title="1. The Service">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            For You Newsletter is an AI-powered newsletter service that generates personalized
            daily digests based on topics and preferences you select. Content is produced
            using large language models and draws from publicly available news and
            information. Newsletters are delivered by email and through the in-app reader.
          </p>
        </Section>

        <Section title="2. Accounts">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You must provide a valid email address to create an account. You are responsible
            for maintaining the confidentiality of your credentials and for all activity that
            occurs under your account. You must be at least 13 years old to use the Service.
            Accounts are for individual use only and may not be shared or transferred.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You agree to provide accurate information and to keep it up to date. You may
            delete your account at any time by contacting us. Upon account deletion, your
            personal data will be removed in accordance with our{" "}
            <Link href="/privacy" className="text-sky-600 hover:underline">
              Privacy Policy
            </Link>
            . Any outstanding subscription charges for the current billing period remain
            due upon account deletion.
          </p>
        </Section>

        <Section title="3. Subscription Plans and Billing">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We offer the following plans:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300 space-y-1">
            <li><strong>Free</strong> — limited access at no charge.</li>
            <li><strong>Plus</strong> — $4.99 billed every 4 weeks.</li>
            <li><strong>Premium</strong> — $9.99 billed every 4 weeks.</li>
          </ul>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Paid plans are billed automatically on a recurring 4-week cycle. By subscribing,
            you authorize us to charge your payment method on each renewal date until you
            cancel. Payments are processed by Stripe, Inc.; by subscribing you also agree
            to{" "}
            <a
              href="https://stripe.com/legal/ssa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline"
            >
              Stripe's terms of service
            </a>
            .
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You may cancel or change your plan at any time through the Customer Portal
            accessible from your account settings. Cancellation takes effect at the end of
            the current billing period; you will retain access to paid features until that
            date. We do not offer prorated refunds for unused time in a billing period.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            If a payment fails, we will attempt to collect payment using reasonable retry
            logic. If payment cannot be collected, your account may be downgraded to the
            Free plan until a valid payment method is provided.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            All prices are in US dollars. We reserve the right to change pricing with
            reasonable advance notice to active subscribers.
          </p>
        </Section>

        <Section title="4. AI-Generated Content">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Newsletter content is generated by artificial intelligence using publicly
            available sources. While we work to ensure quality and relevance, AI-generated
            content may contain errors, omissions, or inaccuracies. The Service is intended
            for general informational purposes only and does not constitute financial,
            investment, medical, legal, or any other professional advice. You should
            independently verify any information before acting on it. We are not liable for
            any decisions you make based on content delivered through the Service.
          </p>
        </Section>

        <Section title="5. Third-Party Content and Links">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Your newsletter may reference or link to third-party news articles, websites,
            and other content that we do not own or control. We make no representations
            about the accuracy, completeness, or reliability of any third-party content.
            Links to third-party sites do not constitute an endorsement. Your interactions
            with third-party sites are governed by those sites' own terms and privacy
            policies.
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You agree not to:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300 space-y-1">
            <li>Use the Service for any unlawful purpose or in violation of any applicable
              law or regulation.</li>
            <li>Scrape, copy, or systematically reproduce newsletter content for
              redistribution or commercial use.</li>
            <li>Reverse-engineer, decompile, or attempt to extract our source code or
              underlying AI models.</li>
            <li>Interfere with or disrupt the servers, networks, or infrastructure of the
              Service.</li>
            <li>Create multiple accounts to circumvent plan limits or other restrictions.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any
              person or entity.</li>
          </ul>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We reserve the right to suspend or permanently terminate any account that
            violates these Terms, at our sole discretion and without prior notice.
          </p>
        </Section>

        <Section title="7. Termination">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You may terminate your account at any time. We may suspend or terminate your
            access to the Service at any time, with or without notice, if we reasonably
            believe you have violated these Terms or if we discontinue the Service.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Upon termination: (a) your right to access the Service ceases immediately; (b)
            any subscription fees already charged for the current billing period are
            non-refundable; and (c) your personal data will be handled in accordance with
            our Privacy Policy.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Sections 4, 8, 9, 10, 11, 12, and 13 of these Terms survive termination.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The For You Newsletter name, logo, and original design elements are our
            property. Your personalized newsletter content is generated for your personal,
            non-commercial use. You may share individual newsletter excerpts for
            non-commercial purposes with attribution. Systematic redistribution, resale, or
            commercial use of newsletter content without our written permission is not
            permitted.
          </p>
        </Section>

        <Section title="9. Indemnification">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            You agree to defend, indemnify, and hold harmless For You Newsletter and its
            operators from and against any claims, damages, losses, liabilities, costs, and
            expenses (including reasonable attorneys' fees) arising out of or related to:
            (a) your use of the Service in violation of these Terms; (b) your violation of
            any applicable law or regulation; or (c) your infringement of any third-party
            right.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO
            NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS
            WILL BE CORRECTED, OR THAT ANY PARTICULAR CONTENT WILL BE ACCURATE, COMPLETE,
            OR TIMELY.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, FOR YOU NEWSLETTER SHALL
            NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL — ARISING OUT
            OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE
            BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF THESE TERMS
            OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID
            US IN THE THREE MONTHS PRECEDING THE CLAIM, OR (B) $10.00.
          </p>
        </Section>

        <Section title="12. Dispute Resolution">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Before filing any formal legal action, you agree to first contact us at{" "}
            <a
              href="mailto:hello@foryounewsletter.com"
              className="text-sky-600 hover:underline"
            >
              hello@foryounewsletter.com
            </a>{" "}
            and give us 30 days to attempt to resolve the dispute informally.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            If the dispute is not resolved informally, it shall be governed by the laws of
            the State of Georgia, United States, without regard to its conflict-of-law
            provisions, and you consent to exclusive jurisdiction in the state or federal
            courts located in Georgia.
          </p>
        </Section>

        <Section title="13. General Provisions">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>Entire Agreement.</strong> These Terms, together with our Privacy Policy
            and Cookie Policy, constitute the entire agreement between you and For You
            Newsletter regarding the Service and supersede all prior agreements.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>Severability.</strong> If any provision of these Terms is found to be
            unenforceable, that provision will be modified to the minimum extent necessary
            to make it enforceable, and the remaining provisions will continue in full force
            and effect.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>No Waiver.</strong> Our failure to enforce any right or provision of
            these Terms will not constitute a waiver of that right or provision.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <strong>Assignment.</strong> You may not assign or transfer your rights under
            these Terms without our prior written consent. We may assign our rights and
            obligations under these Terms, in whole or in part, to a successor in connection
            with a merger, acquisition, or sale of assets, without your consent.
          </p>
        </Section>

        <Section title="14. Changes to These Terms">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We may update these Terms from time to time. When we make material changes, we
            will update the "Last updated" date and make reasonable efforts to notify you.
            Continued use of the Service after changes are posted constitutes your
            acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="15. Contact">
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Questions about these Terms? Contact us at:{" "}
            <a
              href="mailto:hello@foryounewsletter.com"
              className="text-sky-600 hover:underline"
            >
              hello@foryounewsletter.com
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
