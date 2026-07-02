import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import ObservabilityBootstrap from "@/components/ObservabilityBootstrap";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://foryounewsletter.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "For You Newsletter",
    template: "%s | For You Newsletter",
  },
  description: "Choose the topics and details you care about. Get one clean, focused daily digest in your inbox and your dashboard.",
  icons: {
    icon: "/pigeon-filled.svg",
    apple: "/pigeon-filled.svg",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "For You Newsletter",
    title: "For You Newsletter",
    description: "Choose the topics and details you care about. Get one clean, focused daily digest in your inbox and your dashboard.",
    images: [
      {
        url: "/newsletter-header-logo.png",
        width: 1200,
        height: 630,
        alt: "For You Newsletter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "For You Newsletter",
    description: "Choose the topics and details you care about. Get one clean, focused daily digest in your inbox and your dashboard.",
    images: ["/newsletter-header-logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <ObservabilityBootstrap />
          <div className="min-h-screen">
            <div className="fixed top-4 right-6 z-50 max-w-[90vw]">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
