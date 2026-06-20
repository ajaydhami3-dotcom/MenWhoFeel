-- ============================================================
-- MenWhoFeel – Contact Form Fix
-- Run this once in Supabase Dashboard → SQL Editor
--
-- WHY YOU NEED THIS:
-- The "Contact Us" form on the site was never actually wired up to
-- anything. Clicking "Send Message" only updated the page in the
-- visitor's browser — it never saved the message anywhere and never
-- emailed you. There was no database table to hold it, which is why
-- you weren't seeing these messages in Supabase or in your inbox.
--
-- This migration adds the missing "contact_messages" table. The
-- contact form code has been updated to actually write into it.
--
-- This is safe to re-run — it uses IF NOT EXISTS everywhere.
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  email       VARCHAR(320)  NOT NULL,
  message     TEXT          NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'new', -- new | read | replied
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages(status);

-- Row Level Security: allow the public website to INSERT (submit the form),
-- but not to read other people's messages. Reading happens from the
-- Supabase Table Editor (or your own service-role connection), not the
-- public site.
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);

-- No public SELECT policy is created on purpose — only you (via the
-- Supabase dashboard or your server's direct DB connection) can read
-- submitted messages. The public site can submit but not browse them.

-- ─── Verification ──────────────────────────────────────────────────────────
-- After running this, go to Table Editor → contact_messages to view
-- submissions, or run:
--   SELECT * FROM contact_messages ORDER BY "createdAt" DESC;

SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name = 'contact_messages';
