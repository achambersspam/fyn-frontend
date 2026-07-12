import Link from "next/link";

const FOOTER_COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Discover", href: "/discover" },
      { label: "Subscription", href: "/subscription" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Feedback Board", href: "/settings/feedback" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
  {
    title: "Social",
    links: [{ label: "Instagram", href: "https://www.instagram.com/foryounewsletter/", external: true }],
  },
];

export default function PublicSiteFooter() {
  return (
    <footer className="border-t border-primary-dark/20 bg-gradient-to-br from-primary to-primary-dark">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img src="/pigeon-filled.svg" alt="" aria-hidden className="h-7 w-7" />
          <span className="text-sm font-black tracking-wide text-white">For You Newsletter</span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-white">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-white/80 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm font-medium text-white/80 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs font-medium text-white/70">
          For You Newsletter. Personalized news without the noise.
        </p>
      </div>
    </footer>
  );
}
