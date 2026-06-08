import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Men Who Feel | Men's Mental Health Community",
    template: "%s | Men Who Feel",
  },
  description:
    "Anonymous free community for men's mental health. Drop the weight, share what's real, find footing alongside men going through the same thing. No account needed.",
  keywords: [
    "men's mental health community",
    "anonymous men support group online",
    "men mental health online free",
    "men feeling alone mental health",
    "anonymous mental health support for men",
    "men's support community",
    "mental health for men",
    "men emotional support online",
    "men's online support group",
    "anonymous support for men",
    "men mental health forum",
    "men struggling with emotions",
    "men's wellbeing community",
    "men mental health counselling",
  ],
  authors: [{ name: "Men Who Feel", url: BASE_URL }],
  creator: "Men Who Feel",
  publisher: "Men Who Feel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Men Who Feel | Men's Mental Health Community",
    description:
      "Anonymous free community for men's mental health. Drop the weight, share what's real, find footing alongside men going through the same thing. No account needed.",
    siteName: "Men Who Feel",
    type: "website",
    url: BASE_URL,
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "Men Who Feel — Anonymous men's mental health support community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Men Who Feel | Men's Mental Health Community",
    description:
      "Anonymous free community for men's mental health. Drop the weight, share what's real, find footing alongside men going through the same thing. No account needed.",
    site: "@men_whofeel",
    creator: "@men_whofeel",
    images: [`${BASE_URL}/logo.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // Add your Google Search Console verification token here once you have it
    // google: "your-verification-token",
  },
  category: "mental health",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Men Who Feel",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "Anonymous mental health support community for men. A free space to share what's real, find footing, and connect with men going through the same thing. No account needed.",
  sameAs: [
    "https://instagram.com/men_whofeel",
    "https://youtube.com/@MenWhoFeelClub",
    "https://x.com/men_whofeel",
    "https://ko-fi.com/menwhofeel",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@menwhofeel.online",
    contactType: "customer support",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Men Who Feel",
  url: BASE_URL,
  description:
    "Anonymous mental health support community for men. No account, no judgment.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/intel?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
