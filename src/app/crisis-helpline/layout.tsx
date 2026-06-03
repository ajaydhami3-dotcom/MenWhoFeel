import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Crisis Helplines Worldwide — Help Is Available | Men Who Feel",
  description:
    "Crisis helpline numbers for 25+ countries. If you're struggling, help is available right now. You are not alone. Free, confidential support.",
  keywords: [
    "men's crisis helpline",
    "mental health crisis support",
    "crisis helpline numbers",
    "suicide prevention helpline",
    "mental health emergency help",
    "crisis support for men",
  ],
  openGraph: {
    title: "Crisis Helplines Worldwide — Help Is Available Right Now",
    description:
      "Crisis helpline numbers for 25+ countries. If you're struggling, help is available. You are not alone.",
    url: `${BASE_URL}/crisis-helpline`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Crisis Helplines" }],
  },
  twitter: {
    card: "summary",
    title: "Crisis Helplines Worldwide | Men Who Feel",
    description:
      "Crisis helpline numbers for 25+ countries. Help is available right now. You are not alone.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/crisis-helpline` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
