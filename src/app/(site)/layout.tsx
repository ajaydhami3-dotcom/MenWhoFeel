import type { Metadata } from "next";

import Script from "next/script";
import "../globals.css";

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fraunces, manrope, plexMono } from "@/lib/fonts";

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
    types: { "application/rss+xml": `${BASE_URL}/rss.xml` },
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
    <html
      lang="en"
      // Dark is the site's only theme now, set statically (same pattern
      // as admin/layout.tsx) so it's present in the first byte of
      // server-rendered HTML — no client-side resolution, so nothing can
      // mismatch or flash.
      className={`dark ${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
    >
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
      <body className="relative min-h-screen antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
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
