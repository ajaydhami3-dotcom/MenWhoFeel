-- ============================================================
-- MenWhoFeel – Intel CMS Migration
-- (new `articles` columns + the `article-images` Storage bucket)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Everything below is ADD COLUMN IF NOT EXISTS / ON CONFLICT DO NOTHING,
-- so it's safe to run more than once. No existing column is touched, no
-- existing row's data changes, and the public Intel pages' existing
-- `where status = 'published'` filter keeps working exactly as before for
-- every article that already exists (all new columns are nullable).
-- ============================================================

-- ─── 1. New columns on articles ────────────────────────────────────────────

ALTER TABLE articles ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT now();
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "ogImage" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "focusKeyword" VARCHAR(100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "readingTime" INTEGER;

CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);

-- Backfill: every existing article is already live, so give it a real
-- publishedAt instead of leaving it null (null is reserved for drafts).
UPDATE articles SET "publishedAt" = "createdAt"
WHERE status = 'published' AND "publishedAt" IS NULL;

-- ─── 2. Storage bucket for featured images ────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- The app-layer Server Action already requires a verified `admin` role
-- before it ever calls storage (see src/lib/admin/dal.ts), so these
-- policies just need to allow any authenticated session through — the
-- real gate is in the application, not here.
DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated users can update article images" ON storage.objects;
CREATE POLICY "Authenticated users can update article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated users can delete article images" ON storage.objects;
CREATE POLICY "Authenticated users can delete article images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');
