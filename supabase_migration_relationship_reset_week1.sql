-- ============================================================
-- MenWhoFeel – Relationship Reset, Week 1 real content (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces the structural placeholder text for relationship-reset's
-- days 1–7 (see supabase_migration_journeys.sql). Days 8–21 still
-- placeholder — same incremental, ship-a-week approach as Career Reset.
--
-- This pillar covers a wide range of situations (dating, married,
-- co-parenting, post-divorce), so week 1 deliberately stays on
-- foundational relational habits that apply regardless of which one
-- someone's actually in, rather than assuming a specific situation the
-- way Career Reset could: naming your default pattern under stress,
-- listening, honesty, repair, presence, appreciation, weekly reset.
--
-- description = grounding paragraph (always shown). instructions =
-- concrete action (shown once the day is active) — same split used by
-- The Forge and Career Reset.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists.
-- ============================================================

UPDATE journey_days SET
  title = 'The Pattern You Bring',
  description = 'Everyone has a default move under relational stress — go quiet, get defensive, try to fix and control, or smooth it over and swallow it. It was learned early, and by now it runs automatically.',
  instructions = 'Name which one is yours — withdraw, defend, control, or appease. Just identify it today. Nothing to fix yet.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 1;

UPDATE journey_days SET
  title = 'Listen Like You''re Not Next',
  description = 'Most listening in conflict is actually just waiting for your turn to respond or defend. It feels like listening. It isn''t.',
  instructions = 'In your next real conversation today, repeat back what the other person said before you respond — even one sentence of it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 2;

UPDATE journey_days SET
  title = 'Say the Real Thing',
  description = 'The safer, softer, deflected version — "it''s fine" — feels easier in the moment. Over time it erodes trust faster than the uncomfortable truth would have.',
  instructions = 'Say one true thing today that you''d normally soften or avoid — to a partner, an ex, a kid, whoever it''s actually for.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 3;

UPDATE journey_days SET
  title = 'Ruptures Aren''t the Problem',
  description = 'Every relationship has friction — that''s not what damages it. What damages it is friction that never gets revisited. The relationships that last are the ones where someone goes back and repairs it.',
  instructions = 'Think of one recent friction point that never got closed. Reach out today and name it plainly — even just "that thing on Tuesday — I want to close the loop on that."'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 4;

UPDATE journey_days SET
  title = 'Undivided, for Ten Minutes',
  description = 'People register presence, not duration. Ten minutes of phone-down, fully-there attention lands differently than an hour of half-listening while doing something else.',
  instructions = 'Put the phone away and give someone ten straight minutes of full attention today — no multitasking, no checking out halfway through.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 5;

UPDATE journey_days SET
  title = 'What You Haven''t Said Out Loud',
  description = 'A relationship that only runs on logistics and problem-solving starts to starve. Naming what you appreciate — not just fixing what''s wrong — is its own kind of maintenance, and it''s usually the part that gets skipped.',
  instructions = 'Tell someone specifically what you appreciate about them today — not generic ("you''re great"), something specific and true.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 6;

UPDATE journey_days SET
  title = 'The Weekly Reset',
  description = 'One week in. However this went, you''ve now practiced naming a pattern instead of just living inside it — that''s the actual shift, more than any single day.',
  instructions = 'Write one sentence on what felt hardest this week, and one on what you want week two to look like.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 7;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 7 rows, none starting with "Placeholder —".
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" <= 7
ORDER BY "dayNumber";
