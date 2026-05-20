import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crisis Helplines Worldwide | Men Who Feel",
  description: "Crisis helpline numbers for 25+ countries. Help is available. You are not alone.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
