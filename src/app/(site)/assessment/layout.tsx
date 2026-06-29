import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  // Use absolute to prevent root template from appending " | Men Who Feel" again
  title: { absolute: "Free Mental Health Check-In for Men | Men Who Feel" },
  description:
    "Take a free, anonymous mental health check-in. Understand how you're really doing across stress, anxiety, burnout, and emotional wellbeing — no account needed.",
  keywords: [
    "free mental health check-in",
    "men's mental health quiz",
    "anonymous mental health assessment",
    "burnout test for men",
    "stress anxiety check-in",
    "men's emotional wellbeing check",
  ],
  openGraph: {
    title: "Free Mental Health Check-In for Men — Anonymous & No Account",
    description:
      "A short, anonymous mental health check-in for men. Understand where you're at across stress, anxiety, burnout, and emotional wellbeing. Free, no account.",
    url: `${BASE_URL}/assessment`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel — Mental Health Check-In" }],
  },
  twitter: {
    card: "summary",
    title: "Free Mental Health Check-In for Men | Men Who Feel",
    description:
      "Anonymous mental health check-in for men. Understand how you're really doing. Free, no account needed.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/assessment` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
