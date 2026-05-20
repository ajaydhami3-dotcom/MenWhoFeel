import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges | Men Who Feel",
  description: "Daily, weekly, and monthly challenges to build discipline and move forward.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
