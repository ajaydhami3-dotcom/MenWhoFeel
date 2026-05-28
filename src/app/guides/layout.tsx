import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Growth | Men Who Feel",
  description: "Free resources for mental health, financial stability, relationships, and physical wellbeing. No sign-up required.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
