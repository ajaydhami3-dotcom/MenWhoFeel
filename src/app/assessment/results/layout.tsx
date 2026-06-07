import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Your Check-In Results | Men Who Feel" },
  description:
    "Review your anonymous mental health check-in results. Understand your current state and find the right resources and next steps.",
  // Personal results page — no SEO value, prevent indexing
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: `${BASE_URL}/assessment/results` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
