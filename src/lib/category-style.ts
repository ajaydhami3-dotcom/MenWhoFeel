import type { ElementType } from "react";
import { Brain, HeartPulse, Dumbbell, Briefcase, Flame, TrendingUp, Video, FileText, BookOpen, Link2, Waves } from "lucide-react";

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
  emerald: Briefcase, amber: Flame, purple: TrendingUp, sky: Waves,
};

export const CATEGORY_TINTS: Record<string, { text: string }> = {
  blue:    { text: "text-slate-600 dark:text-slate-300" },
  rose:    { text: "text-rose-700 dark:text-rose-300" },
  green:   { text: "text-teal-700 dark:text-teal-300" },
  emerald: { text: "text-emerald-700 dark:text-emerald-300" },
  amber:   { text: "text-primary" },
  purple:  { text: "text-purple-700 dark:text-purple-300" },
  // NEW: "blue" above is a legacy misnomer (it actually renders slate —
  // left untouched since other categories may already depend on that
  // exact look). Physical Wellbeing's Phase 12 redesign needed a color
  // that reads as genuinely blue, hence a distinctly-named key instead of
  // redefining what "blue" means everywhere it's already used.
  sky:     { text: "text-sky-600 dark:text-sky-300" },
};

export const DEFAULT_TINT = CATEGORY_TINTS.blue!;

// Pillar icons — keyed by the literal `icon` string stored on each pillar
// row (see supabase_migration_pillars.sql: brain / briefcase / heart-pulse
// / dumbbell), not by color like CAT_ICONS above. A pillar's icon is a
// deliberate 1:1 choice — Physical Wellbeing should read as a dumbbell,
// not amber's default Flame — so it gets its own small map instead of
// reusing CAT_ICONS by color. Pillar *color* (for text tinting) still
// reuses CATEGORY_TINTS below, since pillar colors were chosen to match
// the category taxonomy exactly.
export const PILLAR_ICONS: Record<string, ElementType> = {
  brain: Brain,
  briefcase: Briefcase,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
};

// Pillar background tint — a soft, low-opacity wash used behind pillar
// cards/hero banners (Phase 12 redesign). Separate from CATEGORY_TINTS'
// text-only colors since this needs a background + border pairing, and
// only the 4 pillars (not every category) get this richer treatment.
export const PILLAR_BG_TINTS: Record<string, { bg: string; border: string }> = {
  green:   { bg: "bg-teal-500/10", border: "border-teal-500/20" },
  amber:   { bg: "bg-primary/10", border: "border-primary/20" },
  rose:    { bg: "bg-rose-500/10", border: "border-rose-500/20" },
  sky:     { bg: "bg-sky-500/10", border: "border-sky-500/20" },
};