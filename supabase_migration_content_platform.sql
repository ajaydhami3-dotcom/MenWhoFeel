-- ============================================================
-- MenWhoFeel – Content Platform Migration
-- (categories, topics, tags, article_tags + new `articles` columns)
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Why this file exists: schema.ts already defines `categories`, `topics`,
-- `tags`, `articleTags`, and 6 new columns on `articles`, and the live site
-- clearly has working /category and /topic pages with real data — but none
-- of these were ever captured in a committed migration file (unlike
-- community_posts, contact_messages, etc.), which strongly suggests they
-- were applied directly via `drizzle-kit push` rather than a tracked
-- migration. That's a real gap: anyone setting up a fresh environment from
-- this repo (or restoring a backup) would be missing these tables, and if
-- `tags` / `article_tags` specifically ever lag behind in a given
-- environment, every /tag/[tagSlug] page query fails with
-- "relation does not exist" — a very plausible cause of the 500s on tag
-- pages. Everything below is IF NOT EXISTS / ADD COLUMN IF NOT EXISTS, so
-- it's safe to run even if some or all of this already exists.
-- ============================================================

-- ─── 1. categories ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT,
  color       VARCHAR(50),
  icon        VARCHAR(50),
  "sortOrder" INTEGER       DEFAULT 0,
  "createdAt" TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);

-- ─── 2. topics (pillar pages) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topics (
  id             SERIAL PRIMARY KEY,
  "categoryId"   INTEGER REFERENCES categories(id),
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(100) NOT NULL UNIQUE,
  description    TEXT,
  overview       TEXT,
  "whyItMatters" TEXT,
  "keyAreas"     JSONB,
  "sortOrder"    INTEGER      DEFAULT 0,
  "createdAt"    TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS topics_slug_idx ON topics(slug);
CREATE INDEX IF NOT EXISTS topics_category_idx ON topics("categoryId");

-- ─── 3. tags ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tags (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  slug        VARCHAR(50) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);

-- ─── 4. article_tags (junction) ──────────────────────────────────────────────
-- Created after `articles` below so the foreign key resolves either way,
-- but guarded so it's a no-op if `articles` already exists with rows.

CREATE TABLE IF NOT EXISTS article_tags (
  "articleId" INTEGER NOT NULL,
  "tagId"     INTEGER NOT NULL,
  PRIMARY KEY ("articleId", "tagId")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_tags_articleid_fkey'
  ) THEN
    ALTER TABLE article_tags
      ADD CONSTRAINT article_tags_articleid_fkey
      FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_tags_tagid_fkey'
  ) THEN
    ALTER TABLE article_tags
      ADD CONSTRAINT article_tags_tagid_fkey
      FOREIGN KEY ("tagId") REFERENCES tags(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS article_tags_article_idx ON article_tags("articleId");
CREATE INDEX IF NOT EXISTS article_tags_tag_idx ON article_tags("tagId");

-- ─── 5. articles — add the 6 newer content-platform columns ─────────────────
-- (the base `articles` table already exists in production; this only adds
-- columns that are missing, it never touches existing data)

ALTER TABLE articles ADD COLUMN IF NOT EXISTS "categoryId" INTEGER REFERENCES categories(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "topicId" INTEGER REFERENCES topics(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "featuredImage" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "authorName" VARCHAR(255) DEFAULT 'MenWhoFeel Core';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0;

-- ─── 6. Row Level Security ───────────────────────────────────────────────────
-- Public read access — these are published content tables, not user data.

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_topics" ON topics;
CREATE POLICY "public_read_topics" ON topics FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_tags" ON tags;
CREATE POLICY "public_read_tags" ON tags FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_article_tags" ON article_tags;
CREATE POLICY "public_read_article_tags" ON article_tags FOR SELECT USING (TRUE);

-- Writes (creating categories/topics/tags, tagging articles) are done
-- server-side via the service role key, so no public insert/update policies
-- are needed here.

-- ─── 7. Verification ─────────────────────────────────────────────────────────

SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'topics', 'tags', 'article_tags')
ORDER BY table_name;

SELECT column_name FROM information_schema.columns
WHERE table_name = 'articles'
  AND column_name IN ('categoryId', 'topicId', 'featured', 'featuredImage', 'authorName', 'viewCount')
ORDER BY column_name;
