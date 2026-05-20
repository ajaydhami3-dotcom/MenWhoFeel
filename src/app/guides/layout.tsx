import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Toolkit | Men Who Feel",
  description: "Free videos, books, and guides on mental health, money, stress, and physical basics.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
