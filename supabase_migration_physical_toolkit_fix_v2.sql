-- ============================================================
-- MenWhoFeel – Physical Wellbeing Toolkit fix (Phase 12) — v2
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- v2: the original DELETE+INSERT version failed because "category" is
-- actually a Postgres enum (resource_category) in production, even
-- though schema.ts declares it as varchar — worth a look separately.
-- This version sidesteps the issue entirely: it UPDATEs the 3 existing
-- rows in place (name/url/type only) instead of inserting fresh rows,
-- so "category" is only ever read in a WHERE clause (where the implicit
-- cast already works fine), never written to.
--
-- Run the SELECT first to see exactly what's there today before the swap.
-- ============================================================

-- Check current state first
SELECT id, name, url, type, category FROM resources WHERE category = 'Physical Wellbeing';

-- Update the 3 generic stress-themed rows in place, in id order, leaving
-- category and pillarId untouched (both already correct)
WITH targets AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM resources
  WHERE category = 'Physical Wellbeing' AND name ILIKE '%stress%'
)
UPDATE resources SET
  name = CASE (SELECT rn FROM targets WHERE targets.id = resources.id)
    WHEN 1 THEN 'Sleep Foundation: Sleep Hygiene — Simple Practices for Better Rest'
    WHEN 2 THEN 'Harvard Health: Regular Physical Activity Can Boost Mood'
    WHEN 3 THEN 'National Geographic: The Connection Between Diet and Mental Health'
    ELSE name
  END,
  url = CASE (SELECT rn FROM targets WHERE targets.id = resources.id)
    WHEN 1 THEN 'https://www.sleepfoundation.org/sleep-hygiene'
    WHEN 2 THEN 'https://www.health.harvard.edu/mind-and-mood/regular-physical-activity-can-boost-mood'
    WHEN 3 THEN 'https://www.nationalgeographic.com/health/article/diet-mental-health-foods'
    ELSE url
  END,
  type = 'link'
WHERE id IN (SELECT id FROM targets);

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect exactly 3 rows, none with "stress" in the name.
SELECT id, name, url, type FROM resources WHERE category = 'Physical Wellbeing';
