import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Check-In Results | Men Who Feel",
  description: "Review your anonymous mental health check-in results. Understand your current state and find the right resources and next steps.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
