-- ============================================================
-- MenWhoFeel – The Forge Reconstruction Migration
-- (forge_progress, challenge_responses, anonymous_stats +
--  a new "dayNumber" column on challenges)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Everything below is CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT
-- EXISTS / ON CONFLICT DO NOTHING, so it's safe to run more than once.
-- No existing table is dropped and no existing row's data changes.
--
-- Why a users.id foreign key instead of `references auth.users` +
-- `auth.uid()` directly: this app already has its own `users` table,
-- linked to Supabase Auth one-time via `users."unionId" = auth uid`
-- (see src/server/auth-router.ts / context.ts, which resolve ctx.user
-- this way on every tRPC request). All three new tables below follow
-- that same existing convention instead of introducing a second, parallel
-- identity shape. The RLS policies still check auth.uid() (via the
-- current_app_user_id() helper below), so this stays PostgREST/mobile-
-- client friendly — same as the plan of "the same Supabase client works
-- in React Native / Flutter / Swift" later.
--
-- Note on enforcement: like every other table in this app, the real
-- access-control gate is server-side — src/server/forge-router.ts's
-- `authedQuery` procedures, which scope every read/write to ctx.user.id
-- (Drizzle connects directly to Postgres via DATABASE_URL, not through
-- PostgREST, so RLS is never the thing standing between a request and
-- the database today). The RLS policies below exist so that a *future*
-- direct Supabase-client caller (e.g. the mobile app once it exists)
-- gets the same per-user isolation without re-deriving it — belt and
-- suspenders, not the primary lock. See supabase_migration_automation_v1.sql
-- and supabase_migration.sql for the same reasoning applied elsewhere in
-- this codebase.
-- ============================================================

-- ─── 1. challenges.dayNumber ────────────────────────────────────────────────
-- Explicit 1–28 ordering for The Forge's daily program. Replaces the old
-- "array index from whatever order the DB returns = day number" behavior
-- in ChallengesClient.tsx, which had no real guarantee behind it.

ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "dayNumber" INTEGER;

CREATE INDEX IF NOT EXISTS day_number_idx ON challenges("dayNumber");

-- A plain UNIQUE constraint is fine here even though weekly/monthly rows
-- leave dayNumber NULL — Postgres never considers NULLs equal to each
-- other under UNIQUE, so any number of NULL rows coexist fine; only two
-- *daily* rows claiming the same day number would conflict.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'challenges_day_number_unique'
  ) THEN
    ALTER TABLE challenges ADD CONSTRAINT challenges_day_number_unique UNIQUE ("dayNumber");
  END IF;
END$$;

-- Backfill: give existing category='daily' rows sequential day numbers in
-- their current createdAt order, i.e. exactly the order ChallengesClient.tsx
-- was already displaying them in — so this backfill doesn't reshuffle
-- anyone's existing Day 1..N.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM challenges
  WHERE category = 'daily' AND "dayNumber" IS NULL
)
UPDATE challenges
SET "dayNumber" = ordered.rn
FROM ordered
WHERE challenges.id = ordered.id;

-- ─── 2. forge_progress ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forge_progress (
  id                   SERIAL PRIMARY KEY,
  "userId"             INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "completedDays"      INTEGER[] NOT NULL DEFAULT '{}',
  "skippedDays"        INTEGER[] NOT NULL DEFAULT '{}',
  "currentStreak"      INTEGER NOT NULL DEFAULT 0,
  "longestStreak"      INTEGER NOT NULL DEFAULT 0,
  "lastActiveDate"     DATE,
  "isPaused"           BOOLEAN NOT NULL DEFAULT FALSE,
  "forgeCompleted"     BOOLEAN NOT NULL DEFAULT FALSE,
  "completionDate"     DATE,
  "maintenanceMode"    BOOLEAN NOT NULL DEFAULT FALSE,
  "deepForgeProgress"  INTEGER NOT NULL DEFAULT 0,
  "deepForgeCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forge_progress_user_id_idx ON forge_progress("userId");

-- Reuses the same trigger function supabase_migration.sql already created
-- for community_posts (CREATE OR REPLACE makes re-declaring it here safe).
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_forge_progress_updated_at ON forge_progress;
CREATE TRIGGER set_forge_progress_updated_at
  BEFORE UPDATE ON forge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 3. challenge_responses ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenge_responses (
  id               SERIAL PRIMARY KEY,
  "userId"         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "dayNumber"      INTEGER NOT NULL,
  "challengeTitle" VARCHAR(255) NOT NULL,
  "responseText"   TEXT,
  "moodRating"     INTEGER,
  "completedAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT mood_rating_range CHECK ("moodRating" IS NULL OR "moodRating" BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS challenge_responses_user_id_idx ON challenge_responses("userId");
CREATE INDEX IF NOT EXISTS challenge_responses_user_day_idx ON challenge_responses("userId", "dayNumber");

-- One response per user per real Forge day (1–28), but dayNumber = 0 is a
-- sentinel reserved for Monthly-tab log entries, which are allowed to
-- recur — so the uniqueness only applies to dayNumber > 0.
DROP INDEX IF EXISTS challenge_responses_user_day_unique;
CREATE UNIQUE INDEX challenge_responses_user_day_unique
  ON challenge_responses("userId", "dayNumber")
  WHERE "dayNumber" > 0;

-- ─── 4. anonymous_stats ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS anonymous_stats (
  id                      INTEGER PRIMARY KEY DEFAULT 1,
  "totalForgeCompletions" INTEGER NOT NULL DEFAULT 0,
  "totalActiveUsers"      INTEGER NOT NULL DEFAULT 0,
  "updatedAt"             TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT anonymous_stats_singleton CHECK (id = 1)
);

INSERT INTO anonymous_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── 5. Row Level Security ────────────────────────────────────────────────────
-- forge_progress and challenge_responses hold private reflections (mood
-- ratings, written responses) — meaningfully more sensitive than this
-- app's public community tables — so unlike those tables' permissive
-- `USING (true)` policies, these actually check identity.
--
-- auth.uid() returns the Supabase Auth uuid; this app's users.id is an
-- internal serial int linked via users."unionId" = auth uid (text). This
-- helper does that lookup once so policies below stay simple. SECURITY
-- DEFINER so it can read `users` regardless of the calling role's own
-- grants on that table.
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE "unionId" = auth.uid()::text;
$$;

ALTER TABLE forge_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_stats      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_forge_progress" ON forge_progress;
CREATE POLICY "users_manage_own_forge_progress" ON forge_progress
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

DROP POLICY IF EXISTS "users_manage_own_challenge_responses" ON challenge_responses;
CREATE POLICY "users_manage_own_challenge_responses" ON challenge_responses
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

-- Global counters: readable by anyone (it's just a headline number), never
-- writable from a client — all mutations happen server-side via Drizzle.
DROP POLICY IF EXISTS "public_read_anonymous_stats" ON anonymous_stats;
CREATE POLICY "public_read_anonymous_stats" ON anonymous_stats
  FOR SELECT USING (TRUE);

-- ─── 6. Verification ─────────────────────────────────────────────────────────
-- SELECT "dayNumber", title FROM challenges WHERE category = 'daily' ORDER BY "dayNumber";
-- SELECT * FROM anonymous_stats;
