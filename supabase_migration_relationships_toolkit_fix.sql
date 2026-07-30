-- ============================================================
-- MenWhoFeel – Relationships & Stress Toolkit fix (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- The 3 resources currently tagged to this pillar are generic
-- stress-management videos ("Tools for Managing Stress & Anxiety" etc.)
-- that don't actually address dating/marriage/fatherhood/communication —
-- they were probably pulled from a shared stress-content pool rather than
-- curated per pillar. This swaps them for 3 real, reputable, on-topic
-- resources instead.
--
-- Run the SELECT first to see exactly what's there today before the swap.
-- ============================================================

-- Check current state first
SELECT id, name, url, type, category FROM resources WHERE category = 'Relationships & Stress';

-- Remove the generic stress-themed ones tagged to this pillar
DELETE FROM resources WHERE category = 'Relationships & Stress' AND name ILIKE '%stress%';

-- Add 3 on-topic replacements (Gottman Institute is a well-established,
-- research-based source; the fatherhood piece cites Fatherhood.gov via a
-- university extension article)
INSERT INTO resources (category, name, type, url, "pillarId")
SELECT 'Relationships & Stress', 'Gottman Institute: 10 Communication Exercises for Couples', 'link',
       'https://www.gottman.com/blog/10-communication-exercises-for-couples-to-have-better-relationships/',
       id FROM pillars WHERE slug = 'relationships-stress'
UNION ALL
SELECT 'Relationships & Stress', 'Gottman Institute: The Top 7 Ways to Improve Your Marriage', 'link',
       'https://www.gottman.com/blog/the-top-7-ways-to-improve-your-marriage/',
       id FROM pillars WHERE slug = 'relationships-stress'
UNION ALL
SELECT 'Relationships & Stress', 'Ten Tips to Help Dads Be Their Best', 'link',
       'https://www.usu.edu/today/story/ask-an-expert--ten-tips-to-help-dads-be-their-best',
       id FROM pillars WHERE slug = 'relationships-stress';

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect exactly 3 rows, none with "stress" in the name.
SELECT id, name, url, type FROM resources WHERE category = 'Relationships & Stress';
