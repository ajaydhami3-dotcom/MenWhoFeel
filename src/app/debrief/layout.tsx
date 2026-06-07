import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Debrief with BRAVO | Men Who Feel" },
  description:
    "Talk through your day with BRAVO, your anonymous AI debrief companion. No judgment. No account. Just a space to process what's on your mind.",
  // Personal AI conversation — no SEO value, prevent indexing
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: `${BASE_URL}/debrief` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
