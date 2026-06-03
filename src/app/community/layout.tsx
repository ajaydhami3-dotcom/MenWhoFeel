import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Anonymous Men's Mental Health Community | Men Who Feel" },
  description:
    "Join the anonymous men's mental health community. Real-time conversations, no account, no judgment. Messages are temporary — say what you actually mean.",
  keywords: [
    "anonymous men's support community",
    "men's mental health forum",
    "men's online support group",
    "anonymous support chat for men",
    "men talking honestly online",
    "men's community mental health",
  ],
  openGraph: {
    title: "Anonymous Men's Mental Health Community",
    description:
      "Real-time, anonymous conversations for men. No account, no record, no judgment. Say what you actually mean.",
    url: `${BASE_URL}/community`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Community" }],
  },
  twitter: {
    card: "summary",
    title: "Anonymous Men's Mental Health Community | Men Who Feel",
    description:
      "Real-time, anonymous conversations for men. No account, no record, no judgment.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/community` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
