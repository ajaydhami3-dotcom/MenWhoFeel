-- ============================================================
-- MenWhoFeel – Provider Directory Migration
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- One new table, spanning Mental & Emotional Health and Physical
-- Wellbeing (hence "pillarId", unlike job_resources/small_wins which
-- don't have one — see schema.ts's comment on providers for why).
-- Starts empty on purpose, same reasoning as Career Hub/Small Wins: no
-- seed data, no invented example entries — populating this is an
-- editorial decision with a real vetting bar, arguably higher than
-- either of those two, since a bad listing here means recommending an
-- actual person or practice.
--
-- Safe to re-run: CREATE TYPE is guarded, CREATE TABLE IF NOT EXISTS.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
    CREATE TYPE provider_type AS ENUM (
      'therapist_counselor', 'psychiatrist', 'primary_care', 'recovery_program', 'sliding_scale_clinic'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS providers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  type          provider_type NOT NULL,
  description   TEXT          NOT NULL,
  location      VARCHAR(255)  NOT NULL,
  url           VARCHAR(1000) NOT NULL,
  "trustNotes"  TEXT,
  "pillarId"    INTEGER REFERENCES pillars(id),
  status        status        NOT NULL DEFAULT 'pending',
  featured      BOOLEAN       DEFAULT FALSE,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS providers_status_idx ON providers(status);
CREATE INDEX IF NOT EXISTS providers_type_idx ON providers(type);
CREATE INDEX IF NOT EXISTS providers_pillar_idx ON providers("pillarId");

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_approved_providers" ON providers;
CREATE POLICY "public_read_approved_providers" ON providers FOR SELECT USING (status = 'approved');

-- ─── Verification ──────────────────────────────────────────────────────────
SELECT 'providers' AS table_name, count(*) FROM providers;
