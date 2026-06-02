import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debrief with BRAVO | Men Who Feel",
  description: "Talk through your day with BRAVO, your anonymous AI debrief companion. No judgment. No account. Just a space to process what's on your mind.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
