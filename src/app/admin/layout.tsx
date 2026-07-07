import type { Metadata } from "next";

import "../globals.css";

import { Providers } from "@/components/Providers";
import { fraunces, manrope, plexMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Admin · Men Who Feel",
    template: "%s · Admin · Men Who Feel",
  },
  // Belt-and-suspenders alongside the /admin/ disallow rule in robots.ts —
  // the CMS should never show up in search results.
  robots: { index: false, follow: false },
};

// Admin intentionally stays out of scope for the visual redesign (brief:
// "keep admin minimal, only improve consistency") — it keeps its own
// permanently-dark theme with no light/dark toggle. It picks up the same
// three font variables as the public site purely so headings and body
// copy read as the same product when an admin flips between the two.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
