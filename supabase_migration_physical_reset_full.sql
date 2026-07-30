-- ============================================================
-- MenWhoFeel – Physical Reset, full 21 days (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces ALL of physical-reset's structural placeholder text (see
-- supabase_migration_journeys.sql) in one pass, per request — unlike
-- Career Reset and Relationship Reset, which shipped week by week.
--
-- Arc: week 1 (1–7) is baseline awareness — energy, hydration, sleep
-- timing, movement, one real meal, screens before bed. Week 2 (8–14)
-- builds actual habits — reframing exercise away from punishment,
-- consistency over intensity, morning light, caffeine timing, recovery,
-- regular fueling. Week 3 (15–21) goes deeper — body image (reframed
-- around function, not appearance), noticing patterns around cravings/
-- compulsive habits, picking one non-negotiable, strength vs. only
-- appearance, sleep consistency, purpose, and a closing day.
--
-- Day 16 covers Addiction Recovery territory — kept deliberately general
-- and non-clinical (noticing triggers, not tapering or substance-
-- specific guidance). Flagging this one for review before publish, same
-- posture as other sensitive topics in this project.
--
-- Days 7/14/21 ("The Weekly Reset" / "The Two-Week Mark" / "Define What
-- Comes Next") intentionally match the same titles used in Career Reset
-- and Relationship Reset — a shared checkpoint rhythm across all three
-- Reset journeys, not a naming collision.
--
-- description = grounding paragraph (always shown). instructions =
-- concrete action (shown once the day is active) — same split as every
-- other journey, including The Forge.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists.
-- ============================================================

UPDATE journey_days SET
  title = 'The Energy Audit',
  description = 'Most men have never actually tracked what genuinely restores versus drains their energy — running on autopilot until something forces the issue.',
  instructions = 'Notice today which moments left you more energized and which left you more drained. Nothing to change yet — just start noticing.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 1;

UPDATE journey_days SET
  title = 'Water First',
  description = 'Low-grade dehydration is often mistaken for fatigue, brain fog, or even low mood — and it''s one of the cheapest, fastest things to actually test.',
  instructions = 'Drink a full glass of water before your first coffee or anything else today. Notice if the "tired" feeling shifts at all.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 2;

UPDATE journey_days SET
  title = 'The Real Bedtime',
  description = 'The time you get into bed and the time you actually fall asleep are often two very different numbers — and most men have never honestly compared them.',
  instructions = 'Tonight, note what time you actually get into bed versus roughly what time you think you fall asleep. Just observe it, nothing to fix yet.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 3;

UPDATE journey_days SET
  title = 'Move Before You Decide To',
  description = 'Waiting to "feel like" exercising is a trap — motivation reliably follows movement, not the other way around, but almost everyone expects it backwards.',
  instructions = 'Do 10 minutes of any movement today before you feel ready for it — a walk, stretching, anything. Don''t wait to feel motivated first.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 4;

UPDATE journey_days SET
  title = 'One Real Meal',
  description = 'Skipping meals under stress or busyness often backfires later as fatigue and irritability that gets mistaken for something else entirely.',
  instructions = 'Eat one real, unhurried meal today — sitting down, not multitasking. Notice how it affects the rest of your day.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 5;

UPDATE journey_days SET
  title = 'The Screen Cutoff',
  description = 'Screens before bed keep the mind and body in an alert state right when they''re supposed to be winding down — this is well established, not a minor detail.',
  instructions = 'Put your phone away 30 minutes before bed tonight. Notice what you do with that time instead.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 6;

UPDATE journey_days SET
  title = 'The Weekly Reset',
  description = 'One week of actually paying attention to energy, sleep, and movement is different from a week of just pushing through on autopilot.',
  instructions = 'Write one sentence on what your energy actually looked like this week, and one intention for week two.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 7;

UPDATE journey_days SET
  title = 'Strength Isn''t Punishment',
  description = 'A lot of men only move their bodies as penance for eating badly or feeling out of control — which makes exercise something to dread instead of something that actually helps.',
  instructions = 'Do one form of movement today purely because it feels good or useful — not as punishment for anything.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 8;

UPDATE journey_days SET
  title = 'The Consistency Trade',
  description = 'An intense workout once a month does less than a short one done consistently — most physical change comes from repetition, not intensity.',
  instructions = 'Do the smallest version of your movement goal today — even five minutes counts, if it keeps the pattern going.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 9;

UPDATE journey_days SET
  title = 'Morning Light',
  description = 'Morning light exposure is one of the simplest, most well-supported ways to reset a disrupted sleep-wake cycle — and it costs nothing.',
  instructions = 'Get outside, or at least near a window, within the first hour of waking today.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 10;

UPDATE journey_days SET
  title = 'The Caffeine Ceiling',
  description = 'Caffeine late in the day can disrupt sleep even when you don''t consciously notice it keeping you up — the effects often outlast the feeling of being wired.',
  instructions = 'Have your last caffeine today before early-to-mid afternoon. Notice if tonight''s sleep feels any different.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 11;

UPDATE journey_days SET
  title = 'Recovery Isn''t Optional',
  description = 'Rest days aren''t a break from progress — they''re part of how progress actually happens. Skipping them consistently backfires as fatigue, injury, or burnout.',
  instructions = 'Take a real rest day today if you''ve been pushing hard, or plan one for later this week if today''s already a rest day.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 12;

UPDATE journey_days SET
  title = 'Eat Before You''re Starving',
  description = 'Waiting until you''re starving to eat usually leads to eating fast, eating more, and feeling worse afterward — regular fueling isn''t about restriction, it''s about not running on empty.',
  instructions = 'Eat something today before you''re actually starving — a planned snack or meal, ahead of the crash.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 13;

UPDATE journey_days SET
  title = 'The Two-Week Mark',
  description = 'Two weeks of actual habits is a different thing from two weeks of good intentions. Both matter, but only one shows up in how you actually feel.',
  instructions = 'Write down one physical thing that''s felt different these two weeks, and one intention for the final week.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 14;

UPDATE journey_days SET
  title = 'The Mirror Isn''t the Whole Story',
  description = 'Body image struggles are common in men too, even though they''re talked about less — and the mirror captures a single moment, not what your body can actually do or how it feels to be in it.',
  instructions = 'Write down one thing your body let you do this week — carry something, walk somewhere, show up for someone — that has nothing to do with how it looks.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 15;

UPDATE journey_days SET
  title = 'Name the Pattern, Not Just the Urge',
  description = 'For cravings or urges toward a drink, a substance, or any habit that feels hard to control, noticing when it shows up — bored, stressed, alone, a specific time of day — matters more than fighting the urge itself in the moment.',
  instructions = 'If a craving or urge shows up today, just note what triggered it — the time, the feeling, the situation — without judging yourself for having it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 16;

UPDATE journey_days SET
  title = 'The Non-Negotiable',
  description = 'Trying to overhaul everything at once usually collapses within a week. Picking one single non-negotiable habit and protecting it above everything else tends to actually stick.',
  instructions = 'Pick one thing from these two weeks — water, movement, sleep, whatever mattered most — and treat it as non-negotiable for the rest of this journey.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 17;

UPDATE journey_days SET
  title = 'Stronger, Not Just Smaller',
  description = 'A lot of physical goals get framed only around appearance or weight — but strength, stamina, and capability are just as real a measure of progress, and tend to hold up better over time.',
  instructions = 'Notice one thing you can do physically today that you couldn''t, or wouldn''t have, three weeks ago — even something small.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 18;

UPDATE journey_days SET
  title = 'The Full Night, Not Just the Hours',
  description = 'Sleep quality isn''t only about hours logged — consistency, the same rough bedtime and wake time, matters almost as much as total duration.',
  instructions = 'Go to bed and wake up within the same half-hour window you have been this week — even if it isn''t your ideal number of hours yet.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 19;

UPDATE journey_days SET
  title = 'What This Was Actually For',
  description = 'Three weeks in, it''s worth naming why this mattered beyond the habit-tracking itself — more energy for what, more strength for what, better sleep for what.',
  instructions = 'Write two or three sentences on what having more physical energy would actually let you do, or be more present for.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 20;

UPDATE journey_days SET
  title = 'Define What Comes Next',
  description = 'This closes not because the work is finished, but because the daily structure is. What continues from here is a choice you make on purpose, not a countdown that runs out.',
  instructions = 'Pick one habit from these 21 days you''ll actually keep doing without the app tracking it. Write it down as a commitment to yourself.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset') AND "dayNumber" = 21;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 21 rows, none starting with "Placeholder —".
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'physical-reset')
ORDER BY "dayNumber";
