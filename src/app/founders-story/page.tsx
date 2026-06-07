import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, ArrowRight } from "lucide-react";

const BASE_URL = "https://www.menwhofeel.online";

// ─── SEO METADATA ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: { absolute: "Why I Built This — The Founder's Story | Men Who Feel" },
  description:
    "Men Who Feel was built because I needed it and it didn't exist. The honest story behind the community — by the person who built it.",
  keywords: [
    "men who feel founder story",
    "why men don't talk about mental health",
    "men's mental health anonymous community",
    "men keeping everything inside",
    "men's emotional support online",
  ],
  alternates: { canonical: `${BASE_URL}/founders-story` },
  openGraph: {
    title: "Why I Built This — The Founder's Story | Men Who Feel",
    description:
      "Men Who Feel was built because I needed it and it didn't exist. The honest story behind the community.",
    url: `${BASE_URL}/founders-story`,
    siteName: "Men Who Feel",
    type: "article",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "Men Who Feel — The Founder's Story" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why I Built This — The Founder's Story | Men Who Feel",
    description:
      "Men Who Feel was built because I needed it and it didn't exist. The honest story behind the community.",
    site: "@men_whofeel",
    creator: "@men_whofeel",
  },
};

// ─── JSON-LD ARTICLE SCHEMA ───────────────────────────────────────────────────
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why I Built This — The Founder's Story",
  description:
    "Men Who Feel was built because I needed it and it didn't exist. The honest story of why a man who kept everything inside finally built something different.",
  author: {
    "@type": "Person",
    name: "Men Who Feel Founder",
    url: `${BASE_URL}/founders-story`,
  },
  publisher: {
    "@type": "Organization",
    name: "Men Who Feel",
    url: BASE_URL,
    logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/founders-story` },
  url: `${BASE_URL}/founders-story`,
  inLanguage: "en-US",
  about: { "@type": "Thing", name: "Men's Mental Health" },
  keywords:
    "men's mental health, anonymous support, men who feel, founder story, men's emotional wellbeing",
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
//
//  ✏️  HOW TO ADD YOUR REAL STORY:
//
//  1. Find the paragraph blocks inside <article> below.
//  2. Replace the text between each <p>…</p> with your actual story paragraphs.
//  3. You can add or remove <p> blocks freely — the layout adapts automatically.
//  4. Keep the <blockquote> — swap the quote inside it to a line from your story.
//  5. The <h2> mid-section heading ("What this is…") is optional — change or remove it.
//
// ─────────────────────────────────────────────────────────────────────────────

export default function FoundersStoryPage() {
  return (
    <>
      <Script
        id="founders-story-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-[#060810] text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-14"
          >
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>

          {/* Label */}
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 block mb-5">
            From the founder
          </span>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
            Why I built this.
          </h1>

          {/* Standfirst */}
          <p className="text-zinc-300 text-lg leading-relaxed mb-12 border-l-2 border-blue-500/50 pl-5">
            Men Who Feel exists because I needed it and it didn&apos;t exist.
            This is the honest version of why.
          </p>

          {/* ── STORY BODY ───────────────────────────────────────────────────
               Replace the paragraph text below with your actual story.
               Each <p> is one paragraph. Add or remove as needed.
          ──────────────────────────────────────────────────────────────────── */}
          <article className="space-y-6 text-zinc-300 text-base leading-[1.85]">

            {/* ✏️ PARAGRAPH 1 — Replace with your opening paragraph */}
            <p>
              For a long time, I was someone who kept everything inside. Not because
              I didn&apos;t feel things — I felt them constantly — but because there
              was nowhere to put them. No space that felt safe. No community that
              understood. Just the quiet assumption that carrying it alone was the
              right thing to do.
            </p>

            {/* ✏️ PARAGRAPH 2 — Replace with your story */}
            <p>
              I built Men Who Feel after hitting a point where the weight got too heavy.
              I wasn&apos;t looking for a therapist. I wasn&apos;t in crisis. I just
              needed somewhere to say what was actually going on — without explaining
              myself first, without the performance, without it being a big deal.
            </p>

            {/* ✏️ PULL QUOTE — Swap the text for a real line from your story */}
            <blockquote className="border-l-4 border-blue-500 pl-6 my-10">
              <p className="text-xl font-semibold text-white leading-snug not-italic">
                &ldquo;I just needed somewhere to say what was actually going on —
                without explaining myself first.&rdquo;
              </p>
            </blockquote>

            {/* ✏️ PARAGRAPH 3 — Replace with your story */}
            <p>
              Every space I found was either too clinical, too public, or built for
              someone else entirely. So I stopped looking and started building.
              Not as a product. Not as a business. As something I genuinely needed.
            </p>

            {/* ✏️ PARAGRAPH 4 — Replace with your story */}
            <p>
              The anonymity isn&apos;t an afterthought — it&apos;s the whole point.
              Because I know from experience that men don&apos;t open up when they&apos;re
              being watched. When there&apos;s no name attached, no profile to maintain,
              no audience — something shifts. You can actually say the thing. And
              that&apos;s when it starts to help.
            </p>

            {/* Section divider */}
            <div className="border-t border-zinc-800 my-10" />

            {/* ✏️ MID-SECTION HEADING — Change or remove */}
            <h2 className="text-2xl font-black text-white tracking-tight mt-10 mb-4">
              What this is — and what it isn&apos;t.
            </h2>

            {/* ✏️ PARAGRAPH 5 — Replace with your story */}
            <p>
              Men Who Feel is not a therapy platform. It&apos;s not a diagnosis tool.
              It&apos;s not backed by a wellness brand trying to sell you something.
              It&apos;s a space — built by a man who needed one — for men who are
              carrying things and need somewhere honest to put them.
            </p>

            {/* ✏️ PARAGRAPH 6 — Replace with your story */}
            <p>
              Every feature is something I would have wanted when I was at my lowest.
              The anonymous check-in. The community where messages disappear. The
              crisis helplines for when it gets too heavy. The stories from other men
              who came through things that looked similar to mine.
            </p>

            {/* ✏️ CLOSING LINE — Replace with your own closing */}
            <p>
              If you&apos;re here, you already know why. And I built this for you.
            </p>

            {/* Signature */}
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                — The Founder, Men Who Feel
              </p>
            </div>

          </article>

          {/* CTAs */}
          <div className="mt-14 flex flex-col sm:flex-row gap-3">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              Start your check-in <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
            >
              Read more stories
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
