-- ============================================================
-- MenWhoFeel – Stories Integration Migration (Phase 4)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Adds pillarId/topicId to stories, so Stories can be a real fifth leg on
-- topic/category pages instead of the only content type with no pillar
-- taxonomy at all. Data-only: existing stories start out untagged — there
-- was no existing signal (color, naming convention, anything already
-- pillar-shaped) to backfill from, unlike categories or resources. New
-- stories can be tagged at submission (see the accompanying stories-router
-- change) or by editorial review.
--
-- IMPORTANT: like self_help_guides before it, `stories` does not appear
-- in ANY of the previous migration files despite existing in schema.ts
-- and clearly being a live, working feature (stories-router.ts's
-- getApprovedStories/submitStory). Same untracked drizzle-kit-push gap.
-- This migration creates it defensively with its FULL column set (old +
-- new), not just ALTER-adds the new columns, so it's safe to run whether
-- or not the table already exists in the environment you're running this
-- against. storyComments is left alone — it already worked and isn't part
-- of this phase's scope.
--
-- Safe to re-run: every statement is IF NOT EXISTS / ADD COLUMN IF NOT
-- EXISTS / guarded.
-- ============================================================

-- ─── 1. stories — defensive full-shape create ────────────────────────────────
-- Matches schema.ts's stories exactly, including the columns this
-- migration adds. If the table already exists, every clause below is a
-- no-op except the genuinely new ADD COLUMNs in section 1b.
--
-- Note: `status` reuses the same `status` enum type self_help_guides'
-- migration didn't need to create (pending/approved/rejected) — if this
-- is the very first migration you're running against a fresh database,
-- run supabase_migration.sql first, since that's where `status` is
-- defined.

CREATE TABLE IF NOT EXISTS stories (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  content       TEXT          NOT NULL,
  "authorName"  VARCHAR(255)  NOT NULL DEFAULT 'Anonymous',
  excerpt       VARCHAR(500),
  status        status        NOT NULL DEFAULT 'pending',
  featured      BOOLEAN       DEFAULT FALSE,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS status_idx ON stories(status);
CREATE INDEX IF NOT EXISTS created_at_idx ON stories("createdAt");

-- ─── 1b. stories — the columns this phase actually adds ──────────────────────

ALTER TABLE stories ADD COLUMN IF NOT EXISTS "pillarId" INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS "topicId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stories_pillarid_fkey'
  ) THEN
    ALTER TABLE stories
      ADD CONSTRAINT stories_pillarid_fkey
      FOREIGN KEY ("pillarId") REFERENCES pillars(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stories_topicid_fkey'
  ) THEN
    ALTER TABLE stories
      ADD CONSTRAINT stories_topicid_fkey
      FOREIGN KEY ("topicId") REFERENCES topics(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS stories_pillar_idx ON stories("pillarId");
CREATE INDEX IF NOT EXISTS stories_topic_idx ON stories("topicId");

-- Row Level Security — public read of approved stories only, matching
-- getApprovedStories' status filter (not a blanket public-read like
-- pillars/categories, since pending/rejected stories aren't meant to be
-- publicly visible before moderation).
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_approved_stories" ON stories;
CREATE POLICY "public_read_approved_stories" ON stories FOR SELECT USING (status = 'approved');

-- ─── 2. Verification ──────────────────────────────────────────────────────────

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stories' AND column_name IN ('pillarId', 'topicId')
ORDER BY column_name;

SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'stories';

-- How many stories exist by status, and how many already have a pillar
-- (expect 0 on a fresh run — no backfill source existed for this table).
SELECT status, count(*) AS total, count("pillarId") AS with_pillar
FROM stories
GROUP BY status;
