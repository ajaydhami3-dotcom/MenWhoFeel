-- ============================================================
-- MenWhoFeel – Relationship Reset, Weeks 2–3 real content (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Replaces the structural placeholder text for relationship-reset's
-- days 8–21 (see supabase_migration_journeys.sql). Days 1–7 covered in
-- supabase_migration_relationship_reset_week1.sql. Combined into one
-- file since this batch was requested as one unit — completes all 21
-- days of Relationship Reset.
--
-- Week 2 (8–14) moves from awareness into actual conflict skill: owning
-- your part, seeing their side, noticing your own reactivity, real
-- boundaries, small repairs over grand gestures, checking assumptions.
-- Week 3 (15–21) goes deeper: resentment, non-demand affection, the
-- deeper ask behind recurring complaints, the story you've built about
-- someone, showing up before being asked, and a closing day — day 21
-- mirrors how The Forge's day 28 works: defining what continues, not
-- just finishing a checklist.
--
-- description = grounding paragraph (always shown). instructions =
-- concrete action (shown once the day is active) — same split as every
-- other journey.
--
-- Safe to re-run: each statement targets a specific (journeyId, dayNumber)
-- row that supabase_migration_journeys.sql already guarantees exists.
-- ============================================================

UPDATE journey_days SET
  title = 'Own It Before You Explain It',
  description = 'An apology immediately followed by "but you..." isn''t really an apology — it''s a defense wearing an apology-shaped wrapper. Real repair starts with owning your part before anything else gets added.',
  instructions = 'Apologize for one specific thing today without adding a "but," a justification, or an explanation right after it. Just the apology, nothing after it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 8;

UPDATE journey_days SET
  title = 'Their Side of It',
  description = 'This isn''t about deciding who was right. It''s about actually seeing a recent disagreement from where the other person was standing, not just replaying your own version of it.',
  instructions = 'Pick one recent disagreement. Write two sentences describing it entirely from the other person''s point of view, as fairly as you can manage.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 9;

UPDATE journey_days SET
  title = 'Notice the Flood',
  description = 'Racing heart, tunnel vision, the urge to either explode or shut down — almost nothing said in that state helps, no matter how right it feels in the moment.',
  instructions = 'Next time you feel that rising-heat sensation in a conversation today, say it out loud — "I need a few minutes" — and actually take them before continuing.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 10;

UPDATE journey_days SET
  title = 'The Boundary You''ve Been Avoiding',
  description = 'Keeping the peace and actually having peace aren''t the same thing. Going along with something you don''t want, over and over, doesn''t prevent conflict — it delays and compounds it.',
  instructions = 'Say one honest "no," or state one real need today, that you''d normally swallow to avoid friction.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 11;

UPDATE journey_days SET
  title = 'Small Repairs, Not Grand Gestures',
  description = 'A consistent small repair — a quick check-in, a genuine "I noticed that landed wrong" — does more for a relationship over time than an occasional big gesture that papers over a pattern of smaller neglect.',
  instructions = 'Make one small repair today — a short, genuine check-in about something that felt off recently. Nothing elaborate.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 12;

UPDATE journey_days SET
  title = 'Ask, Don''t Assume',
  description = 'A lot of friction comes from acting on an assumption about what someone wants or feels instead of just asking. Assumptions feel efficient. They''re wrong more often than expected.',
  instructions = 'Instead of guessing what someone wants or feels today, ask them directly. Notice if the answer surprises you.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 13;

UPDATE journey_days SET
  title = 'The Two-Week Mark',
  description = 'Two weeks of practicing this on purpose is a real, different thing from two weeks of just reacting the way you always have.',
  instructions = 'Write one sentence on what''s felt different these two weeks, and one intention for the final week.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 14;

UPDATE journey_days SET
  title = 'The Resentment You''re Carrying',
  description = 'This isn''t about dumping it on someone. Vague, unnamed resentment leaks out sideways — in tone, in distance, in small digs — in ways that are harder to address than the real thing would be.',
  instructions = 'Name one resentment you''ve been carrying, specifically, in writing. Don''t act on it yet — just get it into words you can actually see.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 15;

UPDATE journey_days SET
  title = 'Touch Without an Agenda',
  description = 'Physical affection often only shows up as a lead-up to something else. Affection with nothing expected to follow it — a hug, a hand on the shoulder — is its own form of connection, separate from wherever else it might lead.',
  instructions = 'Give someone a moment of physical affection today — a hug, a hand on the shoulder — with nothing expected to follow it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 16;

UPDATE journey_days SET
  title = 'What They''re Actually Asking For',
  description = 'A recurring complaint usually points at a deeper, unstated need underneath it — attention, reassurance, respect — rather than the surface issue itself.',
  instructions = 'Think of a complaint you hear often. Write down what you think the actual underlying need behind it might be — not the surface version of it.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 17;

UPDATE journey_days SET
  title = 'The Story You Tell About Them',
  description = 'Stories like "they always" or "they never" build up over time, and can ossify into something that''s no longer quite true — coloring everything through an old, fixed lens.',
  instructions = 'Write down one "always" or "never" story you tell about someone. Ask yourself honestly if it''s still accurate, or just familiar.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 18;

UPDATE journey_days SET
  title = 'Show Up Before You''re Asked',
  description = 'Responding when asked and noticing what''s needed before being told are two different things. The second one is what actually registers as care.',
  instructions = 'Do one thing today that someone would normally have to ask you for — before they ask.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 19;

UPDATE journey_days SET
  title = 'What You''re Building Toward',
  description = 'Zoom out from the daily repair work for a moment — to the actual kind of partner, father, or person you want to be known as over years, not just this week.',
  instructions = 'Write two or three sentences on the kind of partner or parent you actually want to be five years from now.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 20;

UPDATE journey_days SET
  title = 'Define What Comes Next',
  description = 'This closes not because the work is finished, but because the daily structure is. What continues from here is a choice you make on purpose, not a countdown that runs out.',
  instructions = 'Pick one habit from these 21 days you''ll actually keep doing without the app tracking it. Write it down as a commitment to yourself.'
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" = 21;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 14 rows (days 8-21), none starting with "Placeholder —". Combined
-- with week 1, all 21 days of relationship-reset should now be real.
SELECT "dayNumber", title, left(description, 60) AS description_preview
FROM journey_days
WHERE "journeyId" = (SELECT id FROM journeys WHERE slug = 'relationship-reset') AND "dayNumber" BETWEEN 8 AND 21
ORDER BY "dayNumber";
