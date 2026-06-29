import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Command | Men Who Feel" },
  description:
    "Your personal dashboard on Men Who Feel. Track your check-ins, challenges, and progress in one place.",
  // Personal user dashboard — no SEO value, prevent indexing
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: `${BASE_URL}/command` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
