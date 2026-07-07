import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";

// Display serif — used sparingly for headlines, pull quotes, and the
// italic "Feel" mark in the wordmark. Fraunces carries real warmth without
// tipping into the generic high-contrast "AI landing page" serif look.
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Body / UI sans — every paragraph, button, and nav label. Manrope reads
// as clean and premium (Linear/Notion territory) but its slightly rounded
// terminals keep it from feeling cold or corporate.
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Utility mono — small metadata only: eyebrows, dates, reading time, tags.
// Not a variable font on Google Fonts, so weights must be listed explicitly.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
