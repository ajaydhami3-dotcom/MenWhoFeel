<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MenWhoFeel — Project Context

Men's emotional wellness platform at menwhofeel.online. Built and maintained solo by Ajay, who works directly with Claude for all code. Keep this file updated as the project evolves — it's what lets a new chat or a different model pick up without a re-explanation.

## Stack
- Next.js App Router + tRPC + Drizzle ORM + Supabase (Postgres, Auth, Storage), deployed on Vercel
- Military/tactical dark aesthetic
- Gemini (`gemini-2.5-flash`) is the sole AI content-automation provider

## Architecture patterns
- Public routes live under the `(site)` route group
- Heavy pages (stories, intel articles) are server components with a client "island" for interactivity (e.g. `StoriesClient.tsx`) — not client-side tRPC fetching
- Auth: Supabase Auth, cookie-based sessions via `@supabase/ssr`, a proxy at `src/proxy.ts`, and a Data Access Layer doing JWT verification + role checks
- `src/db/index.ts` holds one global Postgres pool (`globalForDb.postgres`), reused across warm serverless invocations. Runtime `max` is 5, build-phase `max` is 10 — see gotchas below before changing either

## Hard-won gotchas — read before touching these areas
- **The DB pool's `max` caps concurrency *within one request*, not just across requests.** Article/story pages fire multiple queries per load (up to a dozen counting nested pillar-content lookups), several via `Promise.all`. `max:1` (set Aug 1 2026 to fix a connection-exhaustion problem) silently serialized all of that "parallel" work and was the real cause of a multi-day slow/hanging-pages incident. Don't drop this below ~5 without checking how many concurrent queries the hot pages issue.
- **`generateMetadata` and the page body don't share fetches automatically.** Next.js dedupes its own `fetch()` per request, but not plain async functions like Drizzle queries. Any loader called from both must be wrapped in React's `cache()` (see `getArticleData` in `intel/[slug]/page.tsx`, `getStoryData` in `stories/[id]/page.tsx`) or it silently runs twice.
- **`Footer.tsx` renders on every route** (it's in the root layout) and queries the DB for popular topics on every page load. An `unstable_cache` wrap was tried and reverted on suspicion it caused a regression — it hadn't; pool size was the actual cause. Re-adding caching there is a reasonable future optimization, not a correctness fix.
- Gemini calls need `thinkingBudget: 0` or tokens get consumed before content generation starts.
- Vercel Hobby plan doesn't support `vercel.json` cron — the auto-publish route uses cron-job.org instead.
- The tRPC client has previously shipped without sending Authorization headers, leaving `ctx.user` silently empty (no error) — if auth-gated data looks wrong rather than throwing, check this first.

## Recent history (most recent first)
- **Aug 2026** — Fixed a multi-day incident: intel articles and stories loading slowly or not at all. Root cause was the DB pool `max:1` (see gotchas). Also fixed a `generateMetadata`/page-body double-fetch on both detail pages, and restored `pillarResources`/`pillarStories`/`pillarJourney` on the intel page after an interim hotfix had hardcoded them to `[]` to fight the symptom.
- **Aug 2026** — Added a Provider Directory (vetted therapists/doctors/recovery resources); disabled the experimental React Compiler as a precaution (known category of silent hydration bugs, not confirmed as the cause of anything specific here).
- **Jul 30, 2026** — "Phase 12": pillar-aware Check-In engine, Journey/Toolkit content across all 4 pillars, homepage/pillar-hub visual redesign. The Aug loading incident traces back to this deploy.
- **Jul 2026** — Built the admin CMS + AI content automation pipeline (5 stages: research → writing → SEO → image → social).
- **In progress** — Rebuilding The Forge (28-day daily challenge system): real per-user progress tracking replacing a hardcoded test user. Outstanding manual steps: run `supabase_migration_forge.sql` in the Supabase SQL Editor, and enable Anonymous Sign-Ins in Supabase Dashboard → Authentication.

## Working with Ajay
- Terse, direct answers. File path leading, root cause first, fix second, no long preamble.
- Paste raw error output as-is; expects a targeted fix, not a diagnostic Q&A.
- No standing push access to this repo — commit locally and either push with a provided token or hand back a patch.
