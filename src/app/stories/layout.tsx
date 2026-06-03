import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Real Men's Stories — Anonymous & Unfiltered | Men Who Feel",
  description:
    "Real stories from real men about how they came through hard times — depression, burnout, grief, financial stress, and more. Anonymous. Shared so no man feels alone.",
  keywords: [
    "men's mental health stories",
    "men sharing their experiences",
    "men talking about depression",
    "men's anonymous stories",
    "men overcoming hard times",
    "men's emotional stories",
  ],
  openGraph: {
    title: "Real Men's Stories — Anonymous & Unfiltered",
    description:
      "Real stories from real men. How they came through hard times — shared anonymously so the next man knows he's not alone.",
    url: `${BASE_URL}/stories`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Stories" }],
  },
  twitter: {
    card: "summary",
    title: "Real Men's Stories — Anonymous & Unfiltered | Men Who Feel",
    description:
      "Real stories from real men. How they came through hard times — shared anonymously.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/stories` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
