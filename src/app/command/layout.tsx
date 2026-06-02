import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command | Men Who Feel",
  description: "Your personal dashboard on Men Who Feel. Track your check-ins, challenges, and progress in one place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
