-- ============================================================
-- MenWhoFeel – Career Reset, Week 2 real content (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces the structural placeholder text for career-reset's days 8–14
-- (see supabase_migration_journeys.sql). Days 1–7 covered in
-- supabase_migration_career_reset_week1.sql. Days 15–21 still
-- placeholder, same incremental approach.
--
-- Week 2 shifts from stabilizing (week 1) to actually moving: handling
-- setbacks, asking directly instead of vaguely, and protecting momentum
-- once the initial push fades and it's just an ordinary Tuesday.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists.
-- ============================================================

UPDATE journey_days SET
  title = 'Rejection Isn''t Data About You',
  description = 'A "no" from a job, or silence after a call you thought went well, feels like a verdict. Most of the time it isn''t — it''s fit, timing, budget, or a dozen things that have nothing to do with your worth.',
  instructions = 'Think of one recent no or silence. Write down two likely reasons for it that have nothing to do with you personally. Then send one more application or follow-up today anyway.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 8;

UPDATE journey_days SET
  title = 'Ask for the Thing You Actually Need',
  description = '"Let me know if you hear of anything" gets forgotten by the time the conversation ends. A specific ask is the difference between someone wanting to help and someone actually being able to.',
  instructions = 'Message one person a specific ask — not a vague one. "Do you know anyone hiring in X" or "Could you look at my resume this week" — something they can actually act on.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 9;

UPDATE journey_days SET
  title = 'Off Someone Else''s Timeline',
  description = 'Comparing where you are to a friend''s promotion or a peer''s stability runs on information you don''t actually have — what it cost them, what you''re not seeing, how long it really took.',
  instructions = 'Write down one comparison you''ve made this week. Next to it, write down what you don''t actually know about that person''s full situation.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 10;

UPDATE journey_days SET
  title = 'The Task You''ve Been Circling',
  description = 'There''s usually one thing — an application, a hard conversation, a decision — that keeps getting pushed to tomorrow because it feels too big. Avoidance is exactly what keeps it feeling that size.',
  instructions = 'Name the specific thing you''ve been circling. Do it today — even a partial version. Half of it done is further than zero.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 11;

UPDATE journey_days SET
  title = 'Protect the Momentum',
  description = 'Starting is easy for a day or two — there''s adrenaline in it. The real test is an ordinary Tuesday, two weeks in, when the urgency has faded and nothing''s pushing you except the plan you made with yourself.',
  instructions = 'Repeat one action from your first week — the daily anchor, the movement, whatever it was — today, specifically because it''s no longer new and exciting. That''s the point.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 12;

UPDATE journey_days SET
  title = 'What You''re Actually Providing',
  description = 'Providing gets treated as only income — but showing up regulated, present, and honest instead of silently spiraling is its own kind of providing, and often the one people notice more.',
  instructions = 'Do one specific thing today for someone who depends on you that has nothing to do with money — real time, an honest conversation, a small gesture you follow through on.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 13;

UPDATE journey_days SET
  title = 'The Two-Week Mark',
  description = 'Consistency, not perfection, is the actual metric here. Two weeks of showing up — even imperfectly — is further than two weeks of waiting to feel ready.',
  instructions = 'Write down one thing that''s different, even slightly, from two weeks ago. Then write one intention for week three.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" = 14;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 7 rows, none starting with "Placeholder —".
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'career-reset') AND "dayNumber" BETWEEN 8 AND 14
ORDER BY "dayNumber";
