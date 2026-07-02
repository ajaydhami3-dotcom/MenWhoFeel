-- ============================================================
-- MenWhoFeel Automation v1 — Database Migration
-- Run in Supabase SQL Editor
-- All tables are net-new; nothing existing is modified.
-- ============================================================

-- Status values for a pipeline job
CREATE TYPE automation_job_status AS ENUM (
  'pending',
  'running',
  'awaiting_review',
  'approved',
  'published',
  'failed',
  'cancelled'
);

-- Which pipeline stage is currently active
CREATE TYPE automation_stage AS ENUM (
  'research',
  'writing',
  'seo',
  'image',
  'social',
  'complete'
);

-- Social platforms
CREATE TYPE social_platform AS ENUM (
  'reddit',
  'x',
  'instagram',
  'youtube'
);

-- Social draft status
CREATE TYPE social_draft_status AS ENUM (
  'pending',
  'approved',
  'published',
  'failed',
  'skipped'
);

-- ── automation_jobs ──────────────────────────────────────────────────────────
-- One row per automation run. Created when the admin triggers generation.
-- articleId is set once the draft is saved to the Intel CMS.
CREATE TABLE automation_jobs (
  id          SERIAL PRIMARY KEY,
  topic       TEXT NOT NULL,
  status      automation_job_status NOT NULL DEFAULT 'pending',
  stage       automation_stage,
  -- Set once the Intel draft is saved
  article_id  INTEGER REFERENCES articles(id) ON DELETE SET NULL,
  -- Raw AI output stored as JSONB for auditability / retry
  research    JSONB,
  writing     JSONB,
  seo_data    JSONB,
  image_data  JSONB,
  error       TEXT,
  -- Timing
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX automation_jobs_status_idx ON automation_jobs(status);
CREATE INDEX automation_jobs_created_at_idx ON automation_jobs(created_at DESC);

-- ── automation_logs ──────────────────────────────────────────────────────────
-- Full per-step log — every AI call, every storage write, every error.
CREATE TABLE automation_logs (
  id           SERIAL PRIMARY KEY,
  job_id       INTEGER NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,
  stage        TEXT NOT NULL,
  level        TEXT NOT NULL DEFAULT 'info',   -- info | warn | error
  message      TEXT NOT NULL,
  -- Full API response or error detail, stored for debugging
  payload      JSONB,
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX automation_logs_job_id_idx ON automation_logs(job_id);
CREATE INDEX automation_logs_created_at_idx ON automation_logs(created_at DESC);

-- ── automation_settings ──────────────────────────────────────────────────────
-- One row, always. INSERT once below; use UPDATE from the Settings UI.
CREATE TABLE automation_settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1,  -- singleton
  -- AI
  ai_provider           TEXT NOT NULL DEFAULT 'gemini', -- 'gemini' | 'groq'
  -- Image generation
  image_provider        TEXT NOT NULL DEFAULT 'fal',    -- 'fal' | 'none'
  image_style           TEXT NOT NULL DEFAULT 'photorealistic, editorial, men''s wellness',
  -- Intel article defaults
  default_author        TEXT NOT NULL DEFAULT 'MenWhoFeel Core',
  default_category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  -- Social
  reddit_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  reddit_subreddits     TEXT[] NOT NULL DEFAULT '{}',   -- e.g. '{"malementalhealth","MenGetTalkingMH"}'
  x_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
  instagram_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  default_hashtags      TEXT[] NOT NULL DEFAULT '{}',
  -- Prompts (allow admin to tweak AI instructions)
  research_prompt       TEXT,
  writing_prompt        TEXT,
  seo_prompt            TEXT,
  social_prompt         TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the singleton row
INSERT INTO automation_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ── social_drafts ────────────────────────────────────────────────────────────
-- Generated social content waiting for admin approval
CREATE TABLE social_drafts (
  id           SERIAL PRIMARY KEY,
  job_id       INTEGER NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,
  article_id   INTEGER REFERENCES articles(id) ON DELETE SET NULL,
  platform     social_platform NOT NULL,
  status       social_draft_status NOT NULL DEFAULT 'pending',
  -- Platform-specific content stored as JSONB for flexibility
  content      JSONB NOT NULL,   -- e.g. { title, body, subreddit } for Reddit
  response     JSONB,            -- API response after publishing
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX social_drafts_job_id_idx ON social_drafts(job_id);
CREATE INDEX social_drafts_status_idx ON social_drafts(status);

-- ── RLS (Row Level Security) ─────────────────────────────────────────────────
-- These tables are only ever accessed from admin Server Actions / API Routes
-- that run with the service role, so we keep RLS off. The admin auth check
-- (verifyAdminSession in src/lib/admin/dal.ts) is the real gate.
ALTER TABLE automation_jobs     DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs     DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_drafts       DISABLE ROW LEVEL SECURITY;
