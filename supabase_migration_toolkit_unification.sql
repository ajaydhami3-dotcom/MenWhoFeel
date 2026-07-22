-- ============================================================
-- MenWhoFeel – Toolkit Unification Migration (Phase 3)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Repurposes self_help_guides for original, first-party Toolkit content
-- (worksheets, checklists, planners, templates, journals, printable PDFs),
-- distinct from resources' curated external links. Adds topic-level
-- tagging to resources (data only — the topic-first/pillar-fallback
-- resolution that uses it is Phase 5, not this migration). Adds an
-- optional difficulty rating to articles, reusing the enum
-- self_help_guides already had rather than creating a second one.
--
-- IMPORTANT: self_help_guides does not appear in ANY of the previous six
-- migration files, even though it exists in schema.ts and (per the
-- content-platform migration's own header note) very plausibly in your
-- live database too — same drizzle-kit-push-without-a-tracked-migration
-- gap that categories/topics/tags had before. So this migration creates
-- the table defensively with its FULL column set (old + new), not just
-- ALTER-adds the new columns, so it's safe to run whether or not the
-- table already exists in the environment you're running this against.
--
-- Safe to re-run: every statement is IF NOT EXISTS / ADD COLUMN IF NOT
-- EXISTS / guarded, and every UPDATE only touches unbackfilled rows.
-- ============================================================

-- ─── 1. guide_format enum ────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'guide_format') THEN
    CREATE TYPE guide_format AS ENUM ('worksheet', 'checklist', 'planner', 'template', 'journal', 'pdf');
  END IF;
END$$;

-- ─── 2. self_help_guides — defensive full-shape create ───────────────────────
-- Matches schema.ts's selfHelpGuides exactly, including the columns this
-- migration adds. If the table already exists, every clause below is a
-- no-op except the genuinely new ADD COLUMNs in section 2b.

CREATE TABLE IF NOT EXISTS self_help_guides (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(255)    NOT NULL,
  content           TEXT            NOT NULL,
  category          guide_category  NOT NULL,
  difficulty        difficulty      NOT NULL DEFAULT 'beginner',
  "estimatedMinutes" INTEGER,
  featured          BOOLEAN         DEFAULT FALSE,
  "createdAt"       TIMESTAMP       NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guide_category_idx ON self_help_guides(category);

-- ─── 2b. self_help_guides — the columns this phase actually adds ─────────────

ALTER TABLE self_help_guides ADD COLUMN IF NOT EXISTS "pillarId" INTEGER;
ALTER TABLE self_help_guides ADD COLUMN IF NOT EXISTS "topicId" INTEGER;
ALTER TABLE self_help_guides ADD COLUMN IF NOT EXISTS format guide_format;
ALTER TABLE self_help_guides ADD COLUMN IF NOT EXISTS "fileUrl" VARCHAR(1000);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'self_help_guides_pillarid_fkey'
  ) THEN
    ALTER TABLE self_help_guides
      ADD CONSTRAINT self_help_guides_pillarid_fkey
      FOREIGN KEY ("pillarId") REFERENCES pillars(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'self_help_guides_topicid_fkey'
  ) THEN
    ALTER TABLE self_help_guides
      ADD CONSTRAINT self_help_guides_topicid_fkey
      FOREIGN KEY ("topicId") REFERENCES topics(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS self_help_guides_pillar_idx ON self_help_guides("pillarId");
CREATE INDEX IF NOT EXISTS self_help_guides_topic_idx ON self_help_guides("topicId");

-- Row Level Security — public read, same as categories/topics/tags/pillars.
-- This table is about to hold real public-facing content for the first
-- time, so (unlike the rest of this migration) this is not a no-op even
-- if the table already existed: it may never have had a read policy.
ALTER TABLE self_help_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_self_help_guides" ON self_help_guides;
CREATE POLICY "public_read_self_help_guides" ON self_help_guides FOR SELECT USING (TRUE);

-- ─── 3. resources.topicId ─────────────────────────────────────────────────────

ALTER TABLE resources ADD COLUMN IF NOT EXISTS "topicId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resources_topicid_fkey'
  ) THEN
    ALTER TABLE resources
      ADD CONSTRAINT resources_topicid_fkey
      FOREIGN KEY ("topicId") REFERENCES topics(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS resources_topic_idx ON resources("topicId");

-- ─── 4. articles.difficulty ───────────────────────────────────────────────────
-- Reuses the `difficulty` enum type self_help_guides already defined
-- (beginner/intermediate/advanced) rather than creating a second one.
-- Nullable — not every article needs a rating.

ALTER TABLE articles ADD COLUMN IF NOT EXISTS difficulty difficulty;

-- ─── 5. Verification ─────────────────────────────────────────────────────────

-- Confirm the new columns exist with the expected types.
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'self_help_guides' AND column_name IN ('pillarId', 'topicId', 'format', 'fileUrl')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'resources' AND column_name = 'topicId';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'articles' AND column_name = 'difficulty';

-- Confirm the public-read policy is in place.
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'self_help_guides';

-- How many self_help_guides rows exist, and how many already have the new
-- columns populated (expect 0 populated on a fresh run — that's fine,
-- this table has no admin authoring UI yet; population comes next).
SELECT count(*) AS total_guides, count("pillarId") AS with_pillar FROM self_help_guides;
