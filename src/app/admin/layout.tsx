import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";

import { Providers } from "@/components/Providers";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Admin · Men Who Feel",
    template: "%s · Admin · Men Who Feel",
  },
  // Belt-and-suspenders alongside the /admin/ disallow rule in robots.ts —
  // the CMS should never show up in search results.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.className} min-h-screen bg-[#060810] text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
