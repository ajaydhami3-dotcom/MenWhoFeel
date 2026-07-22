-- ============================================================
-- MenWhoFeel – Pillars Migration
-- (new `pillars` table + pillarId columns on categories/resources)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Phase 0 of the four-pillar migration (see MIGRATION_PLAN.md). This is
-- the additive foundation only: it creates `pillars`, seeds the 4 rows,
-- and backfills pillarId on `categories` and `resources`. Nothing reads
-- these new columns yet — no page, query, or component changes are part
-- of this file. Safe to run more than once: every statement is
-- IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / ON CONFLICT DO NOTHING, and
-- every UPDATE only touches rows that haven't been backfilled yet.
-- ============================================================

-- ─── 1. pillars ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pillars (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT,
  color       VARCHAR(50),
  icon        VARCHAR(50),
  "sortOrder" INTEGER       DEFAULT 0,
  "createdAt" TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pillars_slug_idx ON pillars(slug);

-- Seed the 4 pillars. Name/description/color/icon match Toolkit's existing
-- CATEGORY_CONFIG in GuidesClient.tsx exactly, since that object is
-- already the de facto reference implementation of this taxonomy in the
-- live product — this just gives it a database row instead of only
-- existing as a hardcoded client-side object.
INSERT INTO pillars (name, slug, description, color, icon, "sortOrder") VALUES
  ('Mental & Emotional Health', 'mental-emotional-health',
   'Understand your mind, manage your emotions, build real resilience.',
   'blue', 'brain', 0),
  ('Work & Financial Stability', 'work-financial-stability',
   'Take control of your money, your career, and your sense of security.',
   'emerald', 'briefcase', 1),
  ('Relationships & Stress', 'relationships-stress',
   'Navigate pressure, conflict, and connection without burning out.',
   'rose', 'heart-pulse', 2),
  ('Physical Wellbeing', 'physical-wellbeing',
   'Sleep, movement, energy — the physical foundation everything else runs on.',
   'amber', 'dumbbell', 3)
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. categories.pillarId ──────────────────────────────────────────────────

ALTER TABLE categories ADD COLUMN IF NOT EXISTS "pillarId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'categories_pillarid_fkey'
  ) THEN
    ALTER TABLE categories
      ADD CONSTRAINT categories_pillarid_fkey
      FOREIGN KEY ("pillarId") REFERENCES pillars(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS categories_pillar_idx ON categories("pillarId");

-- Backfill: 5 of the 6 existing categories map cleanly to one pillar.
-- 'self-improvement' is deliberately left NULL here — it's a cross-cutting
-- theme, not a single pillar (see MIGRATION_PLAN.md Section 9). Forcing it
-- into one pillar would misclassify every article tagged there; the
-- recommended path is the existing tags/articleTags system instead.
-- Adjust the slugs below first if your live category slugs differ from
-- the content-platform migration's originals.
UPDATE categories SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'mental-emotional-health')
WHERE slug IN ('mental-health', 'emotions') AND "pillarId" IS NULL;

UPDATE categories SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'relationships-stress')
WHERE slug = 'relationships' AND "pillarId" IS NULL;

UPDATE categories SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'physical-wellbeing')
WHERE slug = 'physical-wellbeing' AND "pillarId" IS NULL;

UPDATE categories SET "pillarId" = (SELECT id FROM pillars WHERE slug = 'work-financial-stability')
WHERE slug = 'finances-career' AND "pillarId" IS NULL;

-- ─── 3. resources.pillarId ────────────────────────────────────────────────────

ALTER TABLE resources ADD COLUMN IF NOT EXISTS "pillarId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resources_pillarid_fkey'
  ) THEN
    ALTER TABLE resources
      ADD CONSTRAINT resources_pillarid_fkey
      FOREIGN KEY ("pillarId") REFERENCES pillars(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS resources_pillar_idx ON resources("pillarId");

-- Backfill: resources.category already holds the exact pillar names as
-- text (see GuidesClient.tsx's CATEGORY_CONFIG keys), so this is a
-- straight string match — not a judgment call like the categories
-- backfill above.
UPDATE resources r SET "pillarId" = p.id
FROM pillars p
WHERE r.category = p.name AND r."pillarId" IS NULL;

-- ─── 4. Row Level Security ───────────────────────────────────────────────────
-- Public read access, same as categories/topics/tags — this is published
-- taxonomy, not user data.

ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_pillars" ON pillars;
CREATE POLICY "public_read_pillars" ON pillars FOR SELECT USING (TRUE);

-- Writes (managing pillars) will be done server-side via the service role
-- key once a PillarDialog admin UI exists, same as categories today — no
-- public insert/update policy needed here.

-- ─── 5. Verification ─────────────────────────────────────────────────────────

-- Expect exactly 4 rows, in pillar order.
SELECT id, name, slug, "sortOrder" FROM pillars ORDER BY "sortOrder";

-- Expect every row except 'self-improvement' to show a non-null pillar_name.
SELECT c.slug AS category_slug, p.name AS pillar_name
FROM categories c
LEFT JOIN pillars p ON p.id = c."pillarId"
ORDER BY c.slug;

-- Expect unmatched = 0. If it isn't, some row in resources.category
-- doesn't exactly match one of the 4 pillar names above (typo/casing) —
-- worth checking before anything downstream relies on pillarId.
SELECT
  count(*) FILTER (WHERE "pillarId" IS NOT NULL) AS matched,
  count(*) FILTER (WHERE "pillarId" IS NULL)     AS unmatched
FROM resources;
