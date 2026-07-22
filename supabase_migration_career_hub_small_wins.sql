-- ============================================================
-- MenWhoFeel – Career Hub & Small Wins Migration (Phases 9–10)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Two new tables, both scoped to Work & Financial Stability by product
-- definition rather than a pillarId column (see schema.ts's comment on
-- this section for why). Both start empty — no seed data, since
-- MIGRATION_PLAN.md 4.9 is explicit that Small Wins launches manually
-- curated with quality and trust prioritized over catalog size, and the
-- same review-before-publish posture applies to Job Resources. Populating
-- either is an editorial decision, not something this migration should
-- make up example entries for.
--
-- Safe to re-run: CREATE TYPE is guarded, CREATE TABLE IF NOT EXISTS.
-- ============================================================

-- ─── 1. job_resources ──────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_resource_category') THEN
    CREATE TYPE job_resource_category AS ENUM (
      'job_board', 'networking', 'salary_research', 'company_research', 'recruiter', 'government_program'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS job_resources (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  url           VARCHAR(1000) NOT NULL,
  category      job_resource_category NOT NULL,
  "trustNotes"  TEXT,
  status        status        NOT NULL DEFAULT 'pending',
  featured      BOOLEAN       DEFAULT FALSE,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_resources_status_idx ON job_resources(status);
CREATE INDEX IF NOT EXISTS job_resources_category_idx ON job_resources(category);

ALTER TABLE job_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_approved_job_resources" ON job_resources;
CREATE POLICY "public_read_approved_job_resources" ON job_resources FOR SELECT USING (status = 'approved');

-- ─── 2. small_wins ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'small_win_category') THEN
    CREATE TYPE small_win_category AS ENUM (
      'ai_training', 'freelance', 'microtasks', 'crowdsourcing', 'user_testing', 'remote_work'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS small_wins (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255)  NOT NULL,
  description    TEXT          NOT NULL,
  url            VARCHAR(1000) NOT NULL,
  category       small_win_category NOT NULL,
  "payDetails"   VARCHAR(255),
  requirements   TEXT,
  "trustNotes"   TEXT,
  status         status        NOT NULL DEFAULT 'pending',
  featured       BOOLEAN       DEFAULT FALSE,
  "createdAt"    TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS small_wins_status_idx ON small_wins(status);
CREATE INDEX IF NOT EXISTS small_wins_category_idx ON small_wins(category);

ALTER TABLE small_wins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_approved_small_wins" ON small_wins;
CREATE POLICY "public_read_approved_small_wins" ON small_wins FOR SELECT USING (status = 'approved');

-- ─── 3. Verification ──────────────────────────────────────────────────────────

SELECT 'job_resources' AS table_name, count(*) FROM job_resources
UNION ALL
SELECT 'small_wins', count(*) FROM small_wins;
