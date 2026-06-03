import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Daily Challenges for Men | Men Who Feel",
  description:
    "Daily, weekly, and monthly challenges to build discipline, emotional resilience, and forward momentum. One step at a time. No account needed.",
  keywords: [
    "men's self-improvement challenges",
    "daily mental health challenges",
    "men's discipline building",
    "emotional resilience exercises",
    "mental health habits for men",
  ],
  openGraph: {
    title: "Daily Challenges for Men — Build Discipline One Step at a Time",
    description:
      "Daily, weekly, and monthly challenges designed for men. Build real discipline and emotional resilience without the noise. Free, no sign-up.",
    url: `${BASE_URL}/challenges`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Challenges" }],
  },
  twitter: {
    card: "summary",
    title: "Daily Challenges for Men | Men Who Feel",
    description:
      "Build discipline and emotional resilience with daily challenges designed for men. Free, no account needed.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/challenges` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
