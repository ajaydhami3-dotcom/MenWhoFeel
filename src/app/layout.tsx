import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Men Who Feel — The one place you don't have to explain yourself",
  description:
    "A space for men to drop the weight, share what's real, and find their footing alongside men going through the same thing. Anonymous. No account. Free.",
  openGraph: {
    title: "Men Who Feel — The one place you don't have to explain yourself",
    description:
      "A space for men to drop the weight, share what's real, and find their footing. Anonymous. No account. Free.",
    siteName: "Men Who Feel",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${manrope.className} relative min-h-screen bg-[#060810]`}
      >
        <div className="fixed inset-0 z-[-1] bg-[#060810]">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-900/8 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <Providers>
          <div className="min-h-screen flex flex-col bg-transparent">
            <Navbar />

            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 min-w-0">{children}</main>
            </div>

            <Footer />
          </div>
        </Providers>
      </body>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-G9NTK29N17"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-G9NTK29N17');
        `}
      </Script>
    </html>
  );
}