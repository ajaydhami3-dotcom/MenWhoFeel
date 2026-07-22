import type { ElementType } from "react";
import { Brain, HeartPulse, Dumbbell, Briefcase, Flame, TrendingUp, Video, FileText, BookOpen, Link2 } from "lucide-react";

// Toolkit resource-type icon, keyed by the `type` enum on `resources`
// (video/pdf/book/link). Shared by category and topic pages.
export const RESOURCE_ICONS: Record<string, ElementType> = {
  video: Video, pdf: FileText, book: BookOpen, link: Link2,
};

// Category tints — keyed by the literal `color` string already stored on
// each category row (unchanged, so existing rows need no data migration),
// mapped to muted, warm-harmonized pairs that hold contrast in both light
// and dark mode.
//
// Originally lived only in the homepage (page.tsx). Pulled out here so the
// category hub pages can reuse the exact same mapping instead of drifting
// out of sync with a second hand-copied version — a given category should
// always read as the same color everywhere it appears.
export const CAT_ICONS: Record<string, ElementType> = {
  blue: Brain, rose: HeartPulse, green: Dumbbell,
  emerald: Briefcase, amber: Flame, purple: TrendingUp,
};

export const CATEGORY_TINTS: Record<string, { text: string }> = {
  blue:    { text: "text-slate-600 dark:text-slate-300" },
  rose:    { text: "text-rose-700 dark:text-rose-300" },
  green:   { text: "text-teal-700 dark:text-teal-300" },
  emerald: { text: "text-emerald-700 dark:text-emerald-300" },
  amber:   { text: "text-primary" },
  purple:  { text: "text-purple-700 dark:text-purple-300" },
};

export const DEFAULT_TINT = CATEGORY_TINTS.blue!;
