import type { Metadata } from "next";
import type { ReactNode } from "react";

// Private back-office page: keep it out of search results.
export const metadata: Metadata = {
  title: "Founder dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
