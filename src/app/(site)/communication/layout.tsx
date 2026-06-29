import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Communication Wall | Men Who Feel" },
  description:
    "Send an anonymous message and let the community respond. A safe, judgment-free support wall for men.",
  keywords: [
    "anonymous support wall",
    "men mental health communication",
    "anonymous message support",
    "men online support",
  ],
  openGraph: {
    title: "Anonymous Communication Wall | Men Who Feel",
    description:
      "A safe space to reach out anonymously. Say what you need to say — the community is here.",
    url: `${BASE_URL}/communication`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel Communication Wall" }],
  },
  alternates: { canonical: `${BASE_URL}/communication` },
};

export default function CommunicationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
