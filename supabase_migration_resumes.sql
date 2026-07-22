-- ============================================================
-- MenWhoFeel – Resume Builder Migration
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- The first table in this entire migration holding real PII (full name,
-- phone, employer names) rather than pseudonymous content. Treated
-- differently on purpose:
--
--   - RLS is enabled but NO public read policy is created. Every other
--     migration in this project adds a "public_read_*" policy; this one
--     deliberately doesn't. If anything ever queries this table through
--     Supabase's anon/PostgREST path (this app's own code doesn't — it
--     uses a direct DATABASE_URL connection, see MIGRATION_PLAN.md's note
--     on this under Phase 4), RLS-with-no-policies means it gets zero
--     rows back rather than relying only on application-layer checks.
--   - Access control in the app itself lives entirely in resume-router.ts's
--     authedQuery middleware, which only ever reads/writes the row
--     matching the caller's own session — the same pattern
--     journey-progress already uses, just enforced somewhere that
--     actually matters more here.
--
-- One resume per user (userId is UNIQUE) — the same one-row-per-user
-- shape as forge_progress. This table is brand new, not something that
-- might already exist via an untracked drizzle-kit push the way
-- self_help_guides and stories were, so no defensive full-recreate
-- treatment is needed here.
--
-- Safe to re-run: CREATE TABLE IF NOT EXISTS, guarded FK.
-- ============================================================

CREATE TABLE IF NOT EXISTS resumes (
  id            SERIAL PRIMARY KEY,
  "userId"      INTEGER       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "fullName"    VARCHAR(255),
  email         VARCHAR(320),
  phone         VARCHAR(50),
  city          VARCHAR(100),
  state         VARCHAR(100),
  summary       TEXT,
  template      VARCHAR(50)   NOT NULL DEFAULT 'modern',
  experience    JSONB         NOT NULL DEFAULT '[]'::jsonb,
  education     JSONB         NOT NULL DEFAULT '[]'::jsonb,
  skills        JSONB         NOT NULL DEFAULT '[]'::jsonb,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resumes_user_idx ON resumes("userId");

-- RLS enabled, intentionally no policies — see header comment above.
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- ─── Verification ─────────────────────────────────────────────────────────────

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resumes' ORDER BY ordinal_position;

-- Expect this to list rowsecurity = true and show zero policies for
-- resumes (confirming the "no public policy" setup is actually in place).
SELECT relrowsecurity FROM pg_class WHERE relname = 'resumes';
SELECT policyname FROM pg_policies WHERE tablename = 'resumes';
