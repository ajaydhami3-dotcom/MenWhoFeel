-- ============================================================
-- MenWhoFeel – Community Pillar Migration (Phase 6)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Adds a real pillarId column to community_posts, replacing the
-- query-time stopgap mapping (PILLAR_COMMUNITY_CATEGORIES in
-- pillar-content.ts) that Phases 1–5 used to approximate it from the old
-- flat `category` enum. `category` itself is untouched and still
-- required at post creation — this is additive, not a replacement.
--
-- Unlike self_help_guides and stories, community_posts IS already in
-- supabase_migration.sql (section 2), so this is a plain ALTER, not a
-- defensive full-table recreate.
--
-- Safe to re-run: ADD COLUMN IF NOT EXISTS, guarded FK, and the backfill
-- UPDATE only touches rows that haven't been backfilled yet.
-- ============================================================

-- ─── 1. community_posts.pillarId ──────────────────────────────────────────────

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS "pillarId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'community_posts_pillarid_fkey'
  ) THEN
    ALTER TABLE community_posts
      ADD CONSTRAINT community_posts_pillarid_fkey
      FOREIGN KEY ("pillarId") REFERENCES pillars(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS community_posts_pillar_idx ON community_posts("pillarId");

-- ─── 2. Backfill ───────────────────────────────────────────────────────────────
-- Same mapping as PILLAR_COMMUNITY_CATEGORIES / COMMUNITY_CATEGORY_TO_PILLAR_SLUG
-- in pillar-content.ts and community-router.ts — kept in sync by hand since
-- there are only 11 values and they change rarely. If you edit one, edit
-- all three. self_improvement and the four tone-only categories (venting,
-- advice_needed, success_stories, need_support_now) are deliberately left
-- unmapped — none of them is a single pillar, same reasoning as
-- categories.pillarId leaving self-improvement null in Phase 0.

UPDATE community_posts SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'mental-emotional-health')
WHERE category IN ('mental_health', 'anxiety', 'depression') AND "pillarId" IS NULL;

UPDATE community_posts SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'relationships-stress')
WHERE category IN ('relationships', 'loneliness') AND "pillarId" IS NULL;

UPDATE community_posts SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'work-financial-stability')
WHERE category = 'career' AND "pillarId" IS NULL;

-- No UPDATE for physical-wellbeing: no community category maps to it,
-- same gap flagged in MIGRATION_PLAN.md Section 2.3. Physical Wellbeing
-- pages will keep showing an empty Community section until either a new
-- category value is added for it or posts start using pillarId directly
-- without going through `category` at all.

-- ─── 3. Verification ─────────────────────────────────────────────────────────

SELECT category, "pillarId", count(*) AS total
FROM community_posts
GROUP BY category, "pillarId"
ORDER BY category;

-- Expect physical-wellbeing (and self_improvement/venting/advice_needed/
-- success_stories/need_support_now) to show 0 here — they're the
-- deliberately-unmapped ones.
SELECT p.name, count(cp.id) AS post_count
FROM pillars p
LEFT JOIN community_posts cp ON cp."pillarId" = p.id
GROUP BY p.name
ORDER BY p.name;
