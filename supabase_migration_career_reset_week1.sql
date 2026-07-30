-- ============================================================
-- MenWhoFeel – Career Reset, Week 1 real content (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces the structural placeholder text seeded for career-reset's
-- days 1–7 in supabase_migration_journeys.sql ("Day N" / "Placeholder —
-- real content for Career Reset Day N goes here.") with real content.
-- Days 8–21 are untouched here on purpose — same "ship a week ahead of
-- where real users are" approach as the rest of Phase 12, not "write
-- all 21 before shipping any."
--
-- description = the grounding paragraph shown every time the day is
-- viewed. instructions = the concrete action, shown only once the day
-- is actually active (see DayDetailPanel in JourneyDailyView.tsx) — same
-- two-field split The Forge's days already use.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists, and
-- only touches that row's title/description/instructions.
-- ============================================================

UPDATE journey_days SET
  title = 'The Real Numbers',
  description = 'Fear grows in the dark. The number you''ve been avoiding is almost always smaller than the one your imagination built — but it can''t shrink until you actually look at it.',
  instructions = 'Open your bank account and one bill or statement you''ve been avoiding. Just look — don''t judge it, don''t plan yet. Write down two numbers: what you have, what you owe. That''s the whole task today.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 1;

UPDATE journey_days SET
  title = 'The Daily Anchor',
  description = 'Losing a job, or just losing your sense of financial control, doesn''t only cost money — it costs structure. Without some shape to the day, everything feels heavier than it needs to.',
  instructions = 'Pick one thing you''ll do at the same time every day this week — a morning walk, a set wake-up time, 20 minutes on job boards at 9am. One anchor point. Do it today.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 2;

UPDATE journey_days SET
  title = 'Say It Out Loud',
  description = 'Financial and career stress survives on silence. The version of this that lives in your head, unsaid, is almost always heavier than the version that exists once you''ve told someone.',
  instructions = 'Tell one person one true sentence about what''s actually going on — not the whole story, just one honest line. "Work''s been stressing me out more than I''ve let on" is enough.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 3;

UPDATE journey_days SET
  title = 'The Smallest Next Step',
  description = 'When everything feels like it needs fixing at once, nothing gets fixed. Career Reset isn''t a plan for the whole year — it''s one next action, repeated.',
  instructions = 'Pick the smallest possible next step toward your situation — update one line of a resume, message one contact, look at one job posting, make one call. Do only that one thing today.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 4;

UPDATE journey_days SET
  title = 'Move Something',
  description = 'Financial stress lives in the body as much as the mind — tight chest, clenched jaw, restless nights. Movement is one of the few things that reliably turns the volume down.',
  instructions = 'Get 20 minutes of movement today — a walk, a workout, anything that isn''t sitting. Not for productivity. Just to give the stress somewhere to go.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 5;

UPDATE journey_days SET
  title = 'What Still Holds',
  description = 'It''s easy to let a job or a bank balance become the whole measure of your worth. But you were a whole person before this situation, and you''ll be one after it — worth isn''t only what you earn.',
  instructions = 'Write down two things about yourself that have nothing to do with your job or income — a skill, a relationship, something you''re good at. Read them back before you close this out today.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 6;

UPDATE journey_days SET
  title = 'The Weekly Reset',
  description = 'One week in. However this went — three days done or seven — you''re further along than the version of you that hadn''t started yet.',
  instructions = 'Look back at this week. Write one sentence on what felt hardest, and one sentence on what you want week two to look like. No grading yourself — just noting where you are.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 7;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 7 rows, none starting with "Placeholder —".
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" <= 7
ORDER BY "dayNumber";
