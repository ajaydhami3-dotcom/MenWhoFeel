import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Men Who Feel",
  description: "Get in touch with the Men Who Feel team. Find us on Instagram, YouTube, and X, or send us a message directly.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
