import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Articles on Men's Mental Health | Men Who Feel",
  description:
    "Real articles on men's mental health, stress, money, relationships, and getting through hard things. No fluff, no life-coach filler. Reads worth your time.",
  keywords: [
    "men's mental health articles",
    "mental health advice for men",
    "men dealing with stress",
    "men's emotional health reads",
    "why men don't ask for help",
    "men and depression articles",
    "men's mental health blog",
  ],
  openGraph: {
    title: "Men's Mental Health Articles — Reads Worth Your Time",
    description:
      "No fluff. No life-coach filler. Articles on mental health, stress, money, and getting through hard things — written for men who want real answers.",
    url: `${BASE_URL}/intel`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Articles" }],
  },
  twitter: {
    card: "summary",
    title: "Men's Mental Health Articles | Men Who Feel",
    description:
      "No fluff. Articles on mental health, stress, money, and getting through hard things — written for men.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/intel` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
