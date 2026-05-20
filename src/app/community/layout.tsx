import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Men Who Feel",
  description: "Anonymous, real-time conversations for men. Say what's on your mind. Messages disappear after 24 hours.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
