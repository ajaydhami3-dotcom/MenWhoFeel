-- ============================================================
-- MenWhoFeel – Automation Categorize Stage Migration (Phase 8)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Adds a "categorize" stage to the automation pipeline: instead of every
-- generated article always getting automationSettings.defaultCategoryId
-- regardless of what it's actually about, the pipeline now asks the AI to
-- match the generated content against your real categories/topics and
-- assigns both categoryId and topicId accordingly. defaultCategoryId
-- isn't removed — it becomes the fallback for when this stage can't
-- confidently match anything, exactly as it already was for every
-- article before this migration.
--
-- Existing jobs/settings rows are untouched; this is purely additive.
--
-- Safe to re-run: ADD VALUE IF NOT EXISTS on the enum, ADD COLUMN IF NOT
-- EXISTS on both tables.
-- ============================================================

-- ─── 1. New enum value ────────────────────────────────────────────────────────
-- Postgres requires this outside a transaction block in older versions;
-- IF NOT EXISTS (available since PG 12) makes it safe to re-run either way.

ALTER TYPE automation_stage ADD VALUE IF NOT EXISTS 'categorize';

-- ─── 2. automation_jobs.categorization ────────────────────────────────────────

ALTER TABLE automation_jobs ADD COLUMN IF NOT EXISTS categorization JSONB;

-- ─── 3. automation_settings.categorize_prompt ─────────────────────────────────

ALTER TABLE automation_settings ADD COLUMN IF NOT EXISTS categorize_prompt TEXT;

-- ─── 4. Verification ──────────────────────────────────────────────────────────

SELECT unnest(enum_range(NULL::automation_stage)) AS stage;

SELECT column_name, data_type
FROM information_schema.columns
WHERE (table_name = 'automation_jobs' AND column_name = 'categorization')
   OR (table_name = 'automation_settings' AND column_name = 'categorize_prompt');
