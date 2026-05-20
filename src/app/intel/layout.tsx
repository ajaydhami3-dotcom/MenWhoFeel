import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Useful Reads | Men Who Feel",
  description: "Articles on mental health, stress, and getting through hard things. No fluff.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
