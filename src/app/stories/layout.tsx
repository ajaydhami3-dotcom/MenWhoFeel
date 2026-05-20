import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories | Men Who Feel",
  description: "Real stories from real men — how they came through hard times.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
