# MenWhoFeel – Content Platform Upgrade
## Deployment Guide

---

## What's in this package

| File | Action | Risk |
|------|--------|------|
| `supabase_migration_v2.sql` | Run once in Supabase SQL Editor | None — additive only |
| `src/db/schema.ts` | Replace your existing file | Low |
| `src/components/Breadcrumb.tsx` | New file | None |
| `src/components/TagList.tsx` | New file | None |
| `src/components/RelatedArticles.tsx` | New file | None |
| `src/app/category/[categorySlug]/page.tsx` | New file | None |
| `src/app/topic/[topicSlug]/page.tsx` | New file | None |
| `src/app/tag/[tagSlug]/page.tsx` | New file | None |
| `src/app/intel/[slug]/page.tsx` | Replace existing | Low |
| `src/app/intel/IntelClient.tsx` | Replace existing | Low |
| `src/app/intel/page.tsx` | Replace existing | Low |
| `src/app/page.tsx` | Replace existing (full rewrite) | Medium |
| `src/app/sitemap.ts` | Replace existing | None |

**Existing routes unchanged:** /stories, /community, /guides, /challenges,
/assessment, /crisis-helpline, and all other pages.

**Article URLs unchanged:** /intel/[slug] stays as-is. Zero redirect needed.

---

## Step 1 — Run the Supabase migration

1. Open Supabase Dashboard → SQL Editor
2. Paste the entire contents of `supabase_migration_v2.sql`
3. Click **Run**
4. Check the verification output at the bottom — you should see:
   - `categories` → 6 rows
   - `topics` → 38 rows
   - `articles with categoryId` → should equal your total article count

**This migration is safe to re-run.** All statements use `IF NOT EXISTS` and
`ON CONFLICT DO NOTHING`.

---

## Step 2 — Replace schema.ts

Replace `src/db/schema.ts` with the file in this package.

What changed:
- Added `categories`, `topics`, `tags`, `articleTags` table definitions
- Added 6 new columns to `articles`: `categoryId`, `topicId`, `featured`,
  `featuredImage`, `authorName`, `viewCount`
- Added Drizzle relations for all new tables

No existing table definitions were removed or modified.

---

## Step 3 — Add new components

Copy these 3 files into your `src/components/` directory:
- `Breadcrumb.tsx`
- `TagList.tsx`
- `RelatedArticles.tsx`

---

## Step 4 — Add new pages

Copy the new page files into your `src/app/` directory, preserving the
folder names exactly (brackets are required by Next.js):

```
src/app/
  category/
    [categorySlug]/
      page.tsx          ← NEW
  topic/
    [topicSlug]/
      page.tsx          ← NEW
  tag/
    [tagSlug]/
      page.tsx          ← NEW
```

---

## Step 5 — Replace updated pages

Replace these existing files with the versions in this package:

```
src/app/
  intel/
    [slug]/
      page.tsx          ← UPDATED (breadcrumbs, tags, related articles)
    IntelClient.tsx     ← UPDATED (6 new categories, category page links)
    page.tsx            ← UPDATED (DB-driven categories, no inferCategory)
  page.tsx              ← REPLACED (pure server component, category explorer)
  sitemap.ts            ← UPDATED (dynamic article/category/topic routes)
```

---

## Step 6 — Deploy

Run your normal build/deploy process. No environment variable changes needed.

```bash
npm run build
```

---

## Step 7 — Populate topic content via Supabase (optional, do any time)

Your topic pages will render immediately, showing only the articles assigned
to each topic. To add the overview/why-it-matters/key-areas content:

1. Open Supabase Dashboard → Table Editor → `topics`
2. Click a topic row to edit it
3. Fill in `overview`, `whyItMatters`, and/or `keyAreas` (JSONB format below)

**keyAreas JSON format:**
```json
[
  { "title": "What is Depression?", "summary": "A brief explanation in 1-2 sentences." },
  { "title": "Signs and Symptoms", "summary": "What to look for in yourself or others." },
  { "title": "Treatment Options", "summary": "What actually helps and what to try first." }
]
```

---

## Step 8 — Add your 40 new articles via Supabase

When inserting articles through the Supabase dashboard, fill these fields:

| Column | Required | Notes |
|--------|----------|-------|
| `slug` | Yes | URL-friendly, e.g. `signs-of-depression-in-men` |
| `title` | Yes | Article title |
| `excerpt` | Yes | 1-2 sentence summary (used in cards and SEO) |
| `content` | Yes | Full article text |
| `status` | Yes | Set to `published` |
| `categoryId` | Recommended | FK to `categories.id` (see IDs below) |
| `topicId` | Recommended | FK to `topics.id` |
| `authorName` | Optional | Defaults to `MenWhoFeel Core` |
| `featured` | Optional | Set `true` for popular articles shown on topic pages |

**Category IDs** (after migration runs):
Query `SELECT id, name FROM categories ORDER BY "sortOrder"` to get the exact IDs.

---

## Step 9 — Add tags (optional)

1. Insert rows into `tags` table: `{ name: "depression", slug: "depression" }`
2. Insert rows into `article_tags`: `{ articleId: X, tagId: Y }`

Tags will then appear on article pages and `/tag/[slug]` pages automatically.

---

## New URLs added

| URL | Description |
|-----|-------------|
| `/category/mental-health` | Category page |
| `/category/relationships` | Category page |
| `/category/physical-wellbeing` | Category page |
| `/category/finances-career` | Category page |
| `/category/emotions` | Category page |
| `/category/self-improvement` | Category page |
| `/topic/depression` | Topic pillar page |
| `/topic/anxiety` | Topic pillar page |
| ... (38 topics total) | |
| `/tag/[slug]` | Tag archive pages |

---

## Troubleshooting

**Build error: "categoryId is not a column on articles"**
→ You haven't replaced `src/db/schema.ts` yet. Replace it and rebuild.

**Category pages show 0 articles**
→ The migration's auto-assign may not have matched article titles. Go to
Supabase Table Editor → `articles` and manually set `categoryId` and `topicId`
for affected rows.

**Homepage shows no categories**
→ Run the migration first (Step 1). Categories are seeded by the SQL.

**Topic pages are empty**
→ Articles don't have `topicId` set yet. Either the auto-assign didn't match
(set manually in Supabase) or you haven't added the 40 new articles yet.

**"TrendingUp is not exported from lucide-react"**
→ Your lucide-react version is very old. Replace `TrendingUp` with `ArrowUp`
in `IntelClient.tsx` and in `page.tsx`.
