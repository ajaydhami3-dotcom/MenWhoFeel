-- ============================================================
-- MenWhoFeel – Relationships & Stress Toolkit fix (Phase 12) — v2
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- v2: same fix as the Physical Wellbeing toolkit file — the original
-- DELETE+INSERT version would hit the same "category is of type
-- resource_category" error, since it's an enum in production despite
-- schema.ts declaring it varchar. This version UPDATEs the 3 existing
-- rows in place instead, so category is only ever read (WHERE clause),
-- never written.
--
-- Run the SELECT first to see exactly what's there today before the swap.
-- ============================================================

-- Check current state first
SELECT id, name, url, type, category FROM resources WHERE category = 'Relationships & Stress';

-- Update the 3 generic stress-themed rows in place, in id order, leaving
-- category and pillarId untouched (both already correct)
WITH targets AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM resources
  WHERE category = 'Relationships & Stress' AND name ILIKE '%stress%'
)
UPDATE resources SET
  name = CASE (SELECT rn FROM targets WHERE targets.id = resources.id)
    WHEN 1 THEN 'Gottman Institute: 10 Communication Exercises for Couples'
    WHEN 2 THEN 'Gottman Institute: The Top 7 Ways to Improve Your Marriage'
    WHEN 3 THEN 'Ten Tips to Help Dads Be Their Best'
    ELSE name
  END,
  url = CASE (SELECT rn FROM targets WHERE targets.id = resources.id)
    WHEN 1 THEN 'https://www.gottman.com/blog/10-communication-exercises-for-couples-to-have-better-relationships/'
    WHEN 2 THEN 'https://www.gottman.com/blog/the-top-7-ways-to-improve-your-marriage/'
    WHEN 3 THEN 'https://www.usu.edu/today/story/ask-an-expert--ten-tips-to-help-dads-be-their-best'
    ELSE url
  END,
  type = 'link'
WHERE id IN (SELECT id FROM targets);

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect exactly 3 rows, none with "stress" in the name.
SELECT id, name, url, type FROM resources WHERE category = 'Relationships & Stress';
