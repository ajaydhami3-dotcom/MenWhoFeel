-- ============================================================
-- MenWhoFeel – Career Reset, Week 3 real content (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces the structural placeholder text for career-reset's final
-- 7 days (15–21). Days 1–7 and 8–14 covered in the two earlier
-- career_reset migration files. This completes all 21 days of Career
-- Reset — and with it, all four journeys (The Forge, Career Reset,
-- Relationship Reset, Physical Reset) now have real day-by-day content,
-- none of it left as structural placeholder.
--
-- Week 3 arc: reframing the waiting itself as not wasted, knowing your
-- worth before negotiating it, normalizing a bad week as part of a
-- nonlinear process rather than proof it's failing, clarifying what you
-- actually won't compromise on, closing the loop with good news (not
-- just the hard news from earlier weeks), future orientation, and the
-- same closing day used across all three Reset journeys.
--
-- description = grounding paragraph (always shown). instructions =
-- concrete action (shown once the day is active) — same split as every
-- other journey.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists.
-- ============================================================

UPDATE journey_days SET
  title = 'The Waiting Isn''t Wasted',
  description = 'An extended search or recovery period can feel like wasted time when nothing external seems to be moving — but skills, resilience, and clarity are often being built anyway, even when the outside situation looks the same.',
  instructions = 'Write down one thing you''ve gotten better at or clearer on since this started, even if the external situation hasn''t changed yet.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 15;

UPDATE journey_days SET
  title = 'Know Your Worth Before You Negotiate It',
  description = 'Financial pressure can push you toward taking the first offer or underselling yourself out of fear — a clearer sense of your actual value serves you better than desperation does in that moment.',
  instructions = 'Write down what you''d say your realistic worth is for the role or work you''re pursuing — separate from what desperation might make you settle for.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 16;

UPDATE journey_days SET
  title = 'The Setback That Isn''t the End',
  description = 'A bad week in the middle of a recovery process — a rejection, a slow month — gets read as proof it''s not working. Usually it''s just a normal, nonlinear part of a process that was never going to be a straight line.',
  instructions = 'Name one recent setback. Write one sentence distinguishing "this is hard right now" from "this isn''t working" — they''re not the same claim.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 17;

UPDATE journey_days SET
  title = 'What You Won''t Compromise On',
  description = 'Financial pressure can blur the line between what actually matters to you and what you think you''re supposed to want — worth clarifying before a big decision gets made under pressure instead of on purpose.',
  instructions = 'Write down two things you actually won''t compromise on in your next move, and two things you''re more flexible on than you''ve been acting like.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 18;

UPDATE journey_days SET
  title = 'Tell Someone You''re Doing Better',
  description = 'The people who heard about the hard parts deserve to hear the progress too — sharing a win closes the loop and rebuilds the relationship, not just the isolation.',
  instructions = 'Tell the person you confided in earlier about one piece of real progress, however small.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 19;

UPDATE journey_days SET
  title = 'What You''re Building Toward',
  description = 'Zoom out from the day-to-day job search or financial repair tasks for a moment — to the kind of stability you''re actually building toward, not just the crisis you''re trying to escape.',
  instructions = 'Write two or three sentences on what stability would actually let you do, or be present for, once you have it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 20;

UPDATE journey_days SET
  title = 'Define What Comes Next',
  description = 'This closes not because the work is finished, but because the daily structure is. What continues from here is a choice you make on purpose, not a countdown that runs out.',
  instructions = 'Pick one habit from these 21 days you''ll actually keep doing without the app tracking it. Write it down as a commitment to yourself.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 21;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 7 rows (days 15-21), none starting with "Placeholder —". Combined
-- with weeks 1–2, all 21 days of career-reset should now be real.
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" BETWEEN 15 AND 21
ORDER BY "dayNumber";

-- ─── Full cross-journey sanity check ───────────────────────────────────────
-- All four journeys should now show 0 remaining placeholders.
SELECT j.title AS journey, COUNT(*) AS placeholder_days_remaining
FROM journey_days jd
JOIN journeys j ON j.id = jd."journeyId"
WHERE jd.description LIKE 'Placeholder —%'
GROUP BY j.title;
