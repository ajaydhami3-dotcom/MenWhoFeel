import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Contact | Men Who Feel" },
  description:
    "Get in touch with the Men Who Feel team. Find us on Instagram, YouTube, and X, or send us a message directly.",
  keywords: [
    "contact men who feel",
    "men who feel support",
    "men's mental health community contact",
  ],
  openGraph: {
    title: "Contact Men Who Feel",
    description:
      "Get in touch with the Men Who Feel team. Find us on Instagram, YouTube, X, or email us directly.",
    url: `${BASE_URL}/contact`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel" }],
  },
  twitter: {
    card: "summary",
    title: "Contact | Men Who Feel",
    description:
      "Get in touch with the Men Who Feel team on Instagram, YouTube, X, or by email.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/contact` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
