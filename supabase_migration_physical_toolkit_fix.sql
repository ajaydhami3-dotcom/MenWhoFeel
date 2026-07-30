-- ============================================================
-- MenWhoFeel – Physical Wellbeing Toolkit fix (Phase 12)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Same issue as Relationships & Stress: the 3 resources tagged to this
-- pillar are generic stress-management videos ("Getting to Know Your
-- Brain: Dealing with Stress" etc.) that don't address sleep, fitness,
-- or nutrition specifically. Swapping for 3 real, reputable, on-topic
-- resources instead.
--
-- Run the SELECT first to see exactly what's there today before the swap.
-- ============================================================

-- Check current state first
SELECT id, name, url, type, category FROM resources WHERE category = 'Physical Wellbeing';

-- Remove the generic stress-themed ones tagged to this pillar
DELETE FROM resources WHERE category = 'Physical Wellbeing' AND name ILIKE '%stress%';

-- Add 3 on-topic replacements (Sleep Foundation and Harvard Health are
-- well-established, evidence-based sources; National Geographic's piece
-- cites the Food & Mood Centre at Deakin University)
INSERT INTO resources (category, name, type, url, "pillarId")
SELECT 'Physical Wellbeing', 'Sleep Foundation: Sleep Hygiene — Simple Practices for Better Rest', 'link',
       'https://www.sleepfoundation.org/sleep-hygiene',
       id FROM pillars WHERE slug = 'physical-wellbeing'
UNION ALL
SELECT 'Physical Wellbeing', 'Harvard Health: Regular Physical Activity Can Boost Mood', 'link',
       'https://www.health.harvard.edu/mind-and-mood/regular-physical-activity-can-boost-mood',
       id FROM pillars WHERE slug = 'physical-wellbeing'
UNION ALL
SELECT 'Physical Wellbeing', 'National Geographic: The Connection Between Diet and Mental Health', 'link',
       'https://www.nationalgeographic.com/health/article/diet-mental-health-foods',
       id FROM pillars WHERE slug = 'physical-wellbeing';

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect exactly 3 rows, none with "stress" in the name.
SELECT id, name, url, type FROM resources WHERE category = 'Physical Wellbeing';
