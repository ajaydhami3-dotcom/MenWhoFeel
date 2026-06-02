import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mental Health Check-In | Men Who Feel",
  description: "Take a free, anonymous mental health check-in. Understand how you're really doing across stress, anxiety, burnout, and emotional wellbeing — no account needed.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
