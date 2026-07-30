-- ============================================================
-- MenWhoFeel – Pillar color update (Phase 12 redesign)
--
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
--
-- Realigns pillar.color to the new redesign palette:
--   Mental & Emotional Health:  blue    -> green   (renders teal)
--   Work & Financial Stability: emerald -> amber   (renders the site's primary gold)
--   Relationships & Stress:     rose    -> rose     (unchanged)
--   Physical Wellbeing:         amber   -> sky      (new key, renders genuine blue)
--
-- "blue" itself is untouched (still slate everywhere else it's used) —
-- this only repoints which key each pillar references, it doesn't
-- redefine what any key renders as. See category-style.ts for the actual
-- color values (CATEGORY_TINTS / PILLAR_BG_TINTS).
-- ============================================================

UPDATE pillars SET color = 'green' WHERE slug = 'mental-emotional-health';
UPDATE pillars SET color = 'amber' WHERE slug = 'work-financial-stability';
UPDATE pillars SET color = 'sky'   WHERE slug = 'physical-wellbeing';
-- relationships-stress stays 'rose' — no change needed.

-- ─── Verification ──────────────────────────────────────────────────────────
SELECT name, slug, color, icon FROM pillars ORDER BY "sortOrder";
