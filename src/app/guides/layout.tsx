import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Free Mental Health Resources for Men | Men Who Feel" },
  description:
    "Free curated resources for men — mental health, financial stability, relationships, stress, and physical wellbeing. No sign-up, no paywall. Just useful things.",
  keywords: [
    "free mental health resources for men",
    "men's mental health guides",
    "men's wellbeing resources",
    "financial help for men",
    "stress management for men",
    "men's health resources free",
  ],
  openGraph: {
    title: "Free Mental Health & Wellbeing Resources for Men",
    description:
      "Curated resources across mental health, money, stress, and physical wellbeing. No sign-up. No paywall. Videos, books, guides — all free.",
    url: `${BASE_URL}/guides`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel — Free Resources" }],
  },
  twitter: {
    card: "summary",
    title: "Free Mental Health Resources for Men | Men Who Feel",
    description:
      "Free resources across mental health, money, stress, and physical wellbeing. No sign-up. No paywall.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/guides` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
