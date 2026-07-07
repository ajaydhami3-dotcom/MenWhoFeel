"use client";

import { useEffect, useState } from "react";
import { Share2, MessageSquare, BookOpen, Check } from "lucide-react";

/**
 * Article content is stored as plain text with no heading markup (see the
 * automation prompt: "No markdown. No headings. Just paragraphs."), so a
 * literal jump-to-section table of contents can't be built honestly from
 * real structure. This does the same orientation job a TOC would — "where
 * am I, what's next" — using what the page actually has: an overall
 * reading-progress bar, and quick jumps to the real sections that do
 * exist (Discussion, Related reads), plus a one-tap share.
 */
export default function ArticleReadingTools({ title }: { title: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelled or unsupported mid-call — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked by permissions — nothing more to do silently.
    }
  };

  return (
    <>
      {/* Reading progress, pinned just under the sticky navbar (h-16). */}
      <div className="fixed inset-x-0 top-16 z-40 h-[3px] bg-transparent" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Desktop-only floating tools. Gated to 2xl so it only ever shows
          where there's genuine spare width beside the reading column — it
          just doesn't render below that, rather than risking overlap. */}
      <div className="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 2xl:flex">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this article"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {copied ? <Check className="h-4 w-4 text-pine" /> : <Share2 className="h-4 w-4" />}
        </button>
        <a
          href="#discussion"
          aria-label="Jump to discussion"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <MessageSquare className="h-4 w-4" />
        </a>
        <a
          href="#related-reads"
          aria-label="Jump to related reads"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <BookOpen className="h-4 w-4" />
        </a>
        <div className="my-1 h-px w-6 bg-border" aria-hidden="true" />
        <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </div>
      </div>
    </>
  );
}
