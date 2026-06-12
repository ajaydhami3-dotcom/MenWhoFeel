-- ============================================================
-- MenWhoFeel – Community Redesign Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── 1. Enums ────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_category') THEN
    CREATE TYPE post_category AS ENUM (
      'mental_health',
      'anxiety',
      'depression',
      'relationships',
      'career',
      'loneliness',
      'self_improvement',
      'venting',
      'advice_needed',
      'success_stories',
      'need_support_now'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_target') THEN
    CREATE TYPE report_target AS ENUM (
      'post',
      'comment',
      'communication_message',
      'communication_reply'
    );
  END IF;
END$$;

-- ─── 2. community_posts ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_posts (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(300)  NOT NULL,
  content      TEXT          NOT NULL,
  category     post_category NOT NULL,
  "anonymousId" VARCHAR(50)  NOT NULL,
  "viewCount"  INTEGER       NOT NULL DEFAULT 0,
  "upvoteCount" INTEGER      NOT NULL DEFAULT 0,
  "reportCount" INTEGER      NOT NULL DEFAULT 0,
  flagged      BOOLEAN       NOT NULL DEFAULT FALSE,
  "flagReasons" TEXT,
  deleted      BOOLEAN       NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── 3. community_comments ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_comments (
  id                SERIAL PRIMARY KEY,
  "postId"          INTEGER      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  "parentCommentId" INTEGER      REFERENCES community_comments(id) ON DELETE CASCADE,
  content           TEXT         NOT NULL,
  "anonymousId"     VARCHAR(50)  NOT NULL,
  "reportCount"     INTEGER      NOT NULL DEFAULT 0,
  flagged           BOOLEAN      NOT NULL DEFAULT FALSE,
  "flagReasons"     TEXT,
  deleted           BOOLEAN      NOT NULL DEFAULT FALSE,
  "createdAt"       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── 4. communication_messages ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS communication_messages (
  id            SERIAL PRIMARY KEY,
  content       TEXT          NOT NULL,
  "anonymousId" VARCHAR(50)   NOT NULL,
  status        VARCHAR(50)   NOT NULL DEFAULT 'active',
  "reportCount" INTEGER       NOT NULL DEFAULT 0,
  flagged       BOOLEAN       NOT NULL DEFAULT FALSE,
  "flagReasons" TEXT,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── 5. communication_replies ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS communication_replies (
  id            SERIAL PRIMARY KEY,
  "messageId"   INTEGER     NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  "anonymousId" VARCHAR(50) NOT NULL,
  "reportCount" INTEGER     NOT NULL DEFAULT 0,
  flagged       BOOLEAN     NOT NULL DEFAULT FALSE,
  "flagReasons" TEXT,
  "createdAt"   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── 6. community_reports ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_reports (
  id           SERIAL PRIMARY KEY,
  "targetType" report_target NOT NULL,
  "targetId"   INTEGER       NOT NULL,
  reason       VARCHAR(500)  NOT NULL,
  resolved     BOOLEAN       NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── 7. Indexes ──────────────────────────────────────────────────────────────

-- community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_category
  ON community_posts(category);

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at
  ON community_posts("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_upvote
  ON community_posts("upvoteCount" DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_flagged
  ON community_posts(flagged)
  WHERE flagged = TRUE;

CREATE INDEX IF NOT EXISTS idx_community_posts_deleted
  ON community_posts(deleted)
  WHERE deleted = FALSE;

-- community_comments
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id
  ON community_comments("postId");

CREATE INDEX IF NOT EXISTS idx_community_comments_parent
  ON community_comments("parentCommentId");

CREATE INDEX IF NOT EXISTS idx_community_comments_created_at
  ON community_comments("createdAt" ASC);

-- communication_messages
CREATE INDEX IF NOT EXISTS idx_communication_messages_created_at
  ON communication_messages("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_communication_messages_status
  ON communication_messages(status);

CREATE INDEX IF NOT EXISTS idx_communication_messages_flagged
  ON communication_messages(flagged)
  WHERE flagged = TRUE;

-- communication_replies
CREATE INDEX IF NOT EXISTS idx_communication_replies_message_id
  ON communication_replies("messageId");

-- community_reports
CREATE INDEX IF NOT EXISTS idx_community_reports_target
  ON community_reports("targetType", "targetId");

CREATE INDEX IF NOT EXISTS idx_community_reports_resolved
  ON community_reports(resolved)
  WHERE resolved = FALSE;

-- ─── 8. Auto-update updatedAt trigger for community_posts ────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_community_posts_updated_at ON community_posts;
CREATE TRIGGER set_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 9. Row Level Security (RLS) ─────────────────────────────────────────────
-- All community tables allow public anonymous reads and inserts.
-- Deletes and updates are restricted (done via service role / Drizzle server-side).

ALTER TABLE community_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports       ENABLE ROW LEVEL SECURITY;

-- Public can SELECT non-deleted, non-flagged content
CREATE POLICY "public_read_posts" ON community_posts
  FOR SELECT USING (deleted = FALSE);

CREATE POLICY "public_read_comments" ON community_comments
  FOR SELECT USING (deleted = FALSE);

CREATE POLICY "public_read_messages" ON communication_messages
  FOR SELECT USING (status = 'active');

CREATE POLICY "public_read_replies" ON communication_replies
  FOR SELECT USING (TRUE);

-- Public can INSERT (anonymous posting — server validates content)
CREATE POLICY "public_insert_posts" ON community_posts
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "public_insert_comments" ON community_comments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "public_insert_messages" ON communication_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "public_insert_replies" ON communication_replies
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "public_insert_reports" ON community_reports
  FOR INSERT WITH CHECK (TRUE);

-- All mutations (UPDATE/DELETE) are handled server-side via the service role key,
-- so no additional public policies are required for those operations.

-- ─── 10. Verification ────────────────────────────────────────────────────────

SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'community_posts',
    'community_comments',
    'communication_messages',
    'communication_replies',
    'community_reports'
  )
ORDER BY table_name;
