import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Anonymous Community Forum | Men Who Feel" },
  description:
    "Join the anonymous men's mental health community forum. Discuss, vent, seek advice, and find support — no accounts, no usernames, no judgment.",
  keywords: [
    "anonymous men's community forum",
    "men mental health discussion",
    "anonymous support forum",
    "men's online support group",
    "anonymous mental health community",
  ],
  openGraph: {
    title: "Anonymous Community Forum | Men Who Feel",
    description:
      "Anonymous forum for men's mental health. No accounts, no profiles. Just real conversations.",
    url: `${BASE_URL}/community`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Community" }],
  },
  twitter: {
    card: "summary",
    title: "Anonymous Community Forum | Men Who Feel",
    description: "Anonymous forum for men's mental health. No accounts, no profiles.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/community` },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
