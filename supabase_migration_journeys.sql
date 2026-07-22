-- ============================================================
-- MenWhoFeel – Journeys Migration (Phase 7)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Generalizes The Forge's mechanics into pillar-specific journeys. This
-- migration does NOT touch challenges, forge_progress,
-- challenge_responses, user_challenges, or anonymous_stats in any way —
-- The Forge keeps running on exactly what it runs on today. Everything
-- below is new, parallel infrastructure for three journeys Forge doesn't
-- cover: Career Reset, Relationship Reset, Physical Reset.
--
-- Day content is structural placeholders only, by design (see
-- journey_days seed data below) — "Day N: [title]" — not real
-- therapeutic content. That's deliberately a separate, later effort.
--
-- Safe to re-run: every statement is IF NOT EXISTS / ON CONFLICT DO
-- NOTHING, and every seed INSERT is keyed to skip rows that already exist.
-- ============================================================

-- ─── 1. journeys ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journeys (
  id            SERIAL PRIMARY KEY,
  "pillarId"    INTEGER REFERENCES pillars(id),
  slug          VARCHAR(100)  NOT NULL UNIQUE,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT,
  "totalDays"   INTEGER       NOT NULL,
  "externalHref" VARCHAR(255),
  "sortOrder"   INTEGER       DEFAULT 0,
  "createdAt"   TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journeys_slug_idx ON journeys(slug);
CREATE INDEX IF NOT EXISTS journeys_pillar_idx ON journeys("pillarId");

-- ─── 2. journey_days ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journey_days (
  id            SERIAL PRIMARY KEY,
  "journeyId"   INTEGER       NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  "dayNumber"   INTEGER       NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  instructions  TEXT,
  "createdAt"   TIMESTAMP     DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS journey_days_journey_day_idx ON journey_days("journeyId", "dayNumber");

-- ─── 3. journey_progress ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journey_progress (
  id                SERIAL PRIMARY KEY,
  "userId"          INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "journeyId"       INTEGER       NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  "completedDays"   INTEGER[]     NOT NULL DEFAULT '{}',
  "skippedDays"     INTEGER[]     NOT NULL DEFAULT '{}',
  "currentStreak"   INTEGER       NOT NULL DEFAULT 0,
  "longestStreak"   INTEGER       NOT NULL DEFAULT 0,
  "lastActiveDate"  DATE,
  "isPaused"        BOOLEAN       NOT NULL DEFAULT FALSE,
  "journeyCompleted" BOOLEAN      NOT NULL DEFAULT FALSE,
  "completionDate"  DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS journey_progress_user_journey_idx ON journey_progress("userId", "journeyId");

-- ─── 4. journey_responses ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journey_responses (
  id            SERIAL PRIMARY KEY,
  "userId"      INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "journeyId"   INTEGER       NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  "dayNumber"   INTEGER       NOT NULL,
  "dayTitle"    VARCHAR(255),
  "responseText" TEXT,
  "moodRating"  INTEGER,
  "completedAt" TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS journey_responses_user_journey_day_idx
  ON journey_responses("userId", "journeyId", "dayNumber");

-- ─── 5. Row Level Security ────────────────────────────────────────────────────
-- journeys/journey_days are published content (public read, same as
-- pillars/categories). journey_progress/journey_responses are personal —
-- no public policy, matching forge_progress/challenge_responses, which
-- also have none; this app reads/writes those via the direct DATABASE_URL
-- connection (see MIGRATION_PLAN.md Phase 4's note on this), not
-- PostgREST, so access control lives in the tRPC layer's authedQuery
-- middleware, not RLS.

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_journeys" ON journeys;
CREATE POLICY "public_read_journeys" ON journeys FOR SELECT USING (TRUE);

ALTER TABLE journey_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_journey_days" ON journey_days;
CREATE POLICY "public_read_journey_days" ON journey_days FOR SELECT USING (TRUE);

-- ─── 6. Seed: the registry ────────────────────────────────────────────────────
-- Four rows: three real journeys, plus one pointer row for The Forge so
-- pillar-driven UI has one consistent place to look up "this pillar's
-- journey." The Forge row has no journey_days/journey_progress of its
-- own — externalHref means the UI links to /challenges instead.

INSERT INTO journeys (slug, title, description, "totalDays", "externalHref", "pillarId", "sortOrder")
SELECT 'the-forge', 'The Forge', 'A daily reset — habits, honesty, and momentum, one day at a time.', 28, '/challenges',
       (SELECT id FROM pillars WHERE slug = 'mental-emotional-health'), 0
WHERE NOT EXISTS (SELECT 1 FROM journeys WHERE slug = 'the-forge');

INSERT INTO journeys (slug, title, description, "totalDays", "pillarId", "sortOrder")
SELECT 'career-reset', 'Career Reset', 'A practical starting point for rebuilding stability after job loss or career stress.', 21,
       (SELECT id FROM pillars WHERE slug = 'work-financial-stability'), 1
WHERE NOT EXISTS (SELECT 1 FROM journeys WHERE slug = 'career-reset');

INSERT INTO journeys (slug, title, description, "totalDays", "pillarId", "sortOrder")
SELECT 'relationship-reset', 'Relationship Reset', 'A practical starting point for repairing and strengthening the relationships that matter.', 21,
       (SELECT id FROM pillars WHERE slug = 'relationships-stress'), 2
WHERE NOT EXISTS (SELECT 1 FROM journeys WHERE slug = 'relationship-reset');

INSERT INTO journeys (slug, title, description, "totalDays", "pillarId", "sortOrder")
SELECT 'physical-reset', 'Physical Reset', 'A practical starting point for rebuilding energy, sleep, and movement.', 21,
       (SELECT id FROM pillars WHERE slug = 'physical-wellbeing'), 3
WHERE NOT EXISTS (SELECT 1 FROM journeys WHERE slug = 'physical-reset');

-- ─── 7. Seed: structural placeholder days ─────────────────────────────────────
-- Deliberately not real content — "Day N" / a placeholder prompt — so the
-- engine (unlock pacing, completion, streaks) is provable end-to-end
-- without inventing therapeutic guidance this pass wasn't scoped to write.
-- generate_series + ON CONFLICT means this is safe to re-run and self-
-- corrects if totalDays ever changes.

INSERT INTO journey_days ("journeyId", "dayNumber", title, description)
SELECT j.id, d, 'Day ' || d, 'Placeholder — real content for ' || j.title || ' Day ' || d || ' goes here.'
FROM journeys j, generate_series(1, j."totalDays") AS d
WHERE j."externalHref" IS NULL
ON CONFLICT ("journeyId", "dayNumber") DO NOTHING;

-- ─── 8. Verification ──────────────────────────────────────────────────────────

SELECT id, slug, title, "totalDays", "externalHref", "pillarId" FROM journeys ORDER BY "sortOrder";

-- Expect 21 rows per new journey, 0 for the-forge (externalHref set).
SELECT j.slug, count(jd.id) AS day_count
FROM journeys j
LEFT JOIN journey_days jd ON jd."journeyId" = j.id
GROUP BY j.slug, j."sortOrder"
ORDER BY j."sortOrder";
