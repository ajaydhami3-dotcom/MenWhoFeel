# MenWhoFeel → Four Pillars: Migration Plan

**Status:** Phases 0–2 implemented and delivered (pillars schema, category/topic pillar hubs, Intel article cross-links). This revision folds in decisions on the five open questions from Section 9, plus one new architectural requirement — before further implementation resumes.

**Scope of analysis:** Full extraction and read-through of `MenWhoFeel-main.zip` (323 files) — `src/db/schema.ts` in full, all 6 Supabase migration files, the complete `src/app` route tree, `src/server` (all 14 tRPC routers), navigation/layout/footer, the homepage, the existing category/topic pages, the Guides/Toolkit page and router, Forge/Challenges logic, Community, Communication, Assessment, the Debrief/Bravo AI companion, Crisis Helpline, the automation pipeline, auth (`proxy.ts` + `dal.ts`), SEO files (`sitemap.ts`, `robots.ts`), admin CMS forms, and the project's own `README.md` / `CHANGES.md` history.

> ### Revision — July 16, 2026
> Five decisions came back on the Section 9 open questions (recorded in full in the new **Section 9: Decisions Log**), and one new requirement was added: **every Topic should become a content hub**, naturally connecting Intel, Toolkit, Challenges, Community, *and Stories* — not just Intel plus whatever else happens to be pillar-tagged. That second part is bigger than it sounds, because it introduces a real distinction this plan hadn't named explicitly before:
>
> - **Pillar-level connection** (4 buckets) — what Phases 0–2 already shipped. Coarse but real, and it needed no new tagging to stand up.
> - **Topic-level connection** (38 buckets) — what "a complete ecosystem around *that* topic" actually requires. This needs `topicId` added to Toolkit, Stories, and eventually Community and Challenges, the same way Intel articles already have it.
>
> Sections 4, 5, and 7 below are updated accordingly; Section 9 now separates resolved decisions from the couple of smaller questions this update surfaced.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [The Central Finding: Three Taxonomies, One Concept](#3-the-central-finding-three-taxonomies-one-concept)
4. [Target Architecture](#4-target-architecture)
5. [Component-by-Component Decision Matrix](#5-component-by-component-decision-matrix)
6. [New Abstractions Required](#6-new-abstractions-required)
7. [Phased Roadmap](#7-phased-roadmap)
8. [Non-Negotiables / Risk Checklist](#8-non-negotiables--risk-checklist)
9. [Decisions Log](#9-decisions-log)
10. [Suggested Next Step](#10-suggested-next-step)

---

## 1. Executive Summary

This is not a rebuild, and it's less of a leap than the brief makes it sound. Three separate findings changed the shape of this plan from what I'd have written from the philosophy doc alone:

1. **The "four pillars" already exist in production code, verbatim.** `src/app/(site)/guides/GuidesClient.tsx` has a `CATEGORY_CONFIG` object with exactly four keys: `"Mental & Emotional Health"`, `"Work & Financial Stability"`, `"Relationships & Stress"`, `"Physical Wellbeing"` — each with its own icon, color, and pillar-appropriate description. The `resources` table is seeded with those same four strings. Toolkit isn't behind on the pillar model; it's the reference implementation. The work is to promote what Toolkit already knows into a shared, database-backed concept and propagate it to everything else.

2. **The "choose your struggle" homepage flow is already built and live.** `src/app/(site)/page.tsx` has a `StruggleSection` component with the literal heading "What are you dealing with today?" rendering real, database-backed categories as clickable tiles. This is the exact interaction the new architecture diagram describes. It just currently drives 6 categories instead of 4 pillars, and the pages it links to (`/category/[slug]`) only aggregate Intel articles — not Toolkit, Challenges, or Community.

3. **Career Hub and Small Wins do not exist anywhere in this codebase.** No routes, no schema, no tRPC routers, no seed data — confirmed by a full-tree search. Intel, Toolkit (branded "Guides"/"Support & Growth"), Challenges (branded "The Forge"), and Community are real, working, database-backed features. Career Hub and Small Wins are two entirely new products that happen to live under the same pillar. They should be planned and phased separately from the "connect what already exists" work, not folded into it.

**What this means for sequencing:** the highest-leverage, lowest-risk work is formalizing a `pillars` concept and using it to connect four already-built features. That's genuine migration work — additive schema, extended queries, restyled pages, no rebuilds. Career Hub and Small Wins are genuine greenfield builds that deserve their own phases, their own scoping conversations, and shouldn't be allowed to stall the migration work that's ready to move now.

One more thing worth naming up front: this repo has a live, real product on it — an anonymous mental-health community for men, with a crisis helpline, a moderation/safety layer, and an AI support companion ("Bravo"). Section 2.7 and Section 8 call out exactly what must not be touched carelessly.

---

## 2. Current State Audit

### 2.1 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6, App Router, route groups (`(site)`, `admin/(protected)`) |
| Language | TypeScript, React 19.2.4 |
| API | tRPC v11 (14 routers, see 2.2) + TanStack Query |
| Database | Postgres via Supabase, Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| Auth | Supabase Auth (anonymous + admin), enforced in `src/proxy.ts` (Next 16's renamed middleware convention) + `src/lib/admin/dal.ts` |
| Styling | Tailwind CSS v4, shadcn/ui-style components on Radix primitives |
| Rich text | TipTap (admin article editor) |
| Automation | Custom multi-stage AI pipeline (research → writing → SEO → image → social), Gemini (text) + fal.ai (images) by default, human-reviewed queue |
| Hosting | Vercel (Vercel Cron confirmed via `api/cron/publish-scheduled`, `@vercel/functions` dependency) |
| Analytics | GA4 via hand-rolled `gtag` script tags in the root layout |

Next.js 16 genuinely changed some conventions since most training data was written (middleware → `proxy.ts`, `reactCompiler` promoted to a top-level config key, `next lint` removed). The existing code already documents these carefully in `next.config.mjs`'s comments — that's the source of truth to follow, not assumptions from an older Next.js version.

### 2.2 Route inventory

| Route | Feature | Data-backed? | Currently pillar-aware? |
|---|---|---|---|
| `/` | Homepage | Yes (categories, articles, community) | Partially — struggle-picker uses 6 categories |
| `/intel`, `/intel/[slug]` | **Intel** | Yes (`articles`, `categories`, `topics`, `tags`) | Yes — most mature tagging in the app |
| `/category/[categorySlug]` | Intel category hub | Yes | Structurally yes, content-wise Intel-only |
| `/topic/[topicSlug]` | Intel sub-topic hub | Yes | Same as above |
| `/tag/[tagSlug]` | Intel tag archive | Yes | N/A (cross-cutting by design) |
| `/guides` | **Toolkit** (branded "Support & Growth" in nav) | Yes (`resources`) | **Yes — already keyed on the 4 pillar names** |
| `/challenges` | **Challenges** ("The Forge", 28-day program + weekly habits) | Yes (`challenges`, `forgeProgress`, `challengeResponses`) | No — organized by cadence/type, not pillar |
| `/command` | Forge announcements + FAQ ("Command Center") | Yes (`announcements`) | N/A, noindexed, personal dashboard |
| `/debrief` | **Bravo** — AI support-chat companion | Client-side, calls `/api/bravo` | N/A, noindexed, personal/safety-sensitive |
| `/community`, `/community/[postId]` | **Community** | Yes (`communityPosts`, `communityComments`) | Partial — flat 11-value enum conflates topic + post-type |
| `/communication` | Anonymous message board (Relationships-adjacent) | Yes (`communicationMessages/Replies`) | No pillar tag; thematically = Relationships & Stress |
| `/assessment`, `/assessment/results` | Mental-health check-in quiz | Yes (`assessments`, `assessmentQuestions`, `assessmentActionPlans`) | No — severity-based, not pillar-based |
| `/crisis-helpline` | Crisis resources | Yes (`helplines`) | N/A by design — must stay universally accessible |
| `/stories`, `/stories/[id]` | User/curated stories | Yes (`stories`, `storyComments`) | No |
| `/family-and-friends`, `/founders-story`, `/about`, `/contact`, legal pages | Static/brand pages | Mostly static | N/A |
| — | **Career Hub** | **Does not exist** | — |
| — | **Small Wins** | **Does not exist** | — |

`/admin/(protected)/*` is a full Intel CMS (article editor with TipTap, categories, tags, SEO assistant, automation runner/queue/logs/settings) gated by Supabase auth + role check. No admin UI exists yet for Toolkit, Challenges, or Community taxonomy — see 2.9.

### 2.3 Data model by feature (Drizzle, `src/db/schema.ts`, 904 lines across 6 migrations)

- **Intel:** `articles` (with `categoryId`, `topicId`, full SEO fields, `status`/`publishedAt` for scheduling), `categories` (6 rows per the content-platform migration: mental-health, relationships, physical-wellbeing, finances-career, emotions, self-improvement), `topics` (38 rows, FK to category), `tags` + `articleTags` (many-to-many), `articleComments`.
- **Toolkit:** `resources` (`category` is a **freeform varchar**, not FK'd — already populated with the 4 pillar names as literal strings; `type`: video/pdf/book/link). A second table, `selfHelpGuides`, exists with a richer shape (title, content, difficulty, estimatedMinutes) but **is dead code** — see 2.9.
- **Challenges/Forge:** `challenges` (cadence + type enums, `dayNumber` 1–28), `forgeProgress` (per-user streaks, pause/resume, "Deep Forge" placeholder for post-day-28 content that doesn't exist yet), `challengeResponses` (daily reflection text + mood), `userChallenges` (older/parallel progress table), `anonymousStats`.
- **Community:** `communityPosts` (`category` is an 11-value Postgres enum mixing topic *and* tone — `mental_health`/`career`/`relationships` sit next to `venting`/`advice_needed`/`success_stories`), `communityComments` (threaded via `parentCommentId`), `communityReports`.
- **Communication:** `communicationMessages` + `communicationReplies` — structurally a second, separate anonymous board.
- **Assessment:** `assessments`, `assessmentQuestions`, `assessmentResults`, `assessmentActionPlans` — keyed on a 5-point severity scale (thriving → severe_distress), not on pillar.
- **Automation:** `automationJobs`, `automationLogs`, `automationSettings` (has a single global `defaultCategoryId` for all generated content), `socialDrafts`.
- **Users/Auth:** `users` (role: user/admin), `contactMessages`, `helplines`.

### 2.4 Design system status — two visual eras coexist

Per the project's own `CHANGES.md`: the homepage and Intel article page went through a deliberate warm-palette redesign (v1 → v2.2). **Community, Toolkit/Guides, Challenges, Stories, Assessment, Crisis Helpline, About, Contact, and the legal pages are still on the old dark-blue theme** (`bg-[#060810]`, hardcoded zinc/blue accents) — confirmed directly in `category/[categorySlug]/page.tsx` and `command/page.tsx`. `CHANGES.md` already names "Toolkit/Guides (turning it into the learning hub)" and "Challenges (gamification, streaks, badges)" as the next planned design slice — before this pillar work was even requested.

This matters for sequencing: the pages that need pillar-tagging work (Toolkit, Challenges, Community) are the *same* pages already queued for the warm-palette refresh. Doing both in the same pass — rather than two separate touches of the same files — is the efficient path, and honors the instruction to "maintain the warm color palette" rather than leaving three pillars stuck on the old theme indefinitely.

### 2.5 SEO baseline

Solid and worth preserving carefully: full Metadata API usage (title templates, OG, Twitter cards), JSON-LD (`Organization`, `WebSite` with `SearchAction`, `CollectionPage` on category pages), dynamic `sitemap.ts` (static routes + categories + topics + published articles + approved stories, with empty-topic exclusion matching the page-level `noindex`), a sensible `robots.ts` that correctly excludes `/admin/`, `/api/`, and the two personal/noindexed pages (`/assessment/results/`, `/command/`, `/debrief/`), and an RSS feed. Two gaps found: `/tag/[tagSlug]` pages exist as routes but aren't included in `sitemap.ts`'s dynamic generation, and `category/[categorySlug]/page.tsx`'s `getTopicsWithCount` runs one count query per topic in a loop instead of one grouped query (Footer.tsx's `getPopularTopics` shows the correct single-query pattern already used elsewhere in the same codebase).

### 2.6 Auth model

Two clean layers: `src/proxy.ts` (Next 16's middleware convention) verifies a signed-in Supabase session at the edge for all `/admin/*` routes; `src/lib/admin/dal.ts`'s `verifyAdminSession()` does the actual `role === "admin"` check next to the data it protects. Community/Communication use lightweight anonymous IDs (localStorage-based), not full accounts. Nothing here needs to change for the pillar work — new admin CRUD (pillars, journeys) just needs to sit behind the existing `(protected)` layout.

### 2.7 Safety-critical systems — read before touching

- **`/crisis-helpline`** is deliberately treated as a first-class, always-visible link — styled apart from the rest of `NAV_LINKS` in `Navbar.tsx` with an explicit code comment explaining why, and given its own callout box in the footer. **This pattern must survive any nav redesign untouched.**
- **`/debrief` (Bravo)** is an AI chat companion with a system prompt (`src/app/(site)/debrief/page.tsx`) that explicitly instructs it to surface the crisis line when someone signals distress. It's intentionally noindexed and reached only from `/assessment/results` — not a nav item. Any future phase that reorganizes this feature under a "Mental & Emotional Health" pillar needs its crisis-detection behavior regression-tested, not just refactored along with everything else.
- **`src/lib/safety.ts`** is a keyword/pattern moderation filter for Community/Communication content (spam, doxxing, harassment, high-confidence hate-speech auto-delete). Orthogonal to the pillar work — flag it as untouched, not a target of this migration.

### 2.8 Automation pipeline — current scope

`src/lib/automation/pipeline.ts` runs a 4–5 stage AI pipeline (research → writing → SEO → image → social) that generates **Intel articles only**, assigning `categoryId` from a single global `automationSettings.defaultCategoryId` rather than anything topic-aware. Output is queued (`awaiting_review` → `approved` → `published`) with a full admin review UI (`/admin/(protected)/automation/*`). This is exactly the "automation with manual review" foundation the philosophy doc asks to expand — it doesn't need to be rebuilt, but it is currently a single-content-type, single-default-category system.

### 2.9 Dead code and housekeeping found

- **`src/components/Layout.tsx`** and **`src/components/Sidebar.tsx`** (the public-facing Sidebar, not `AdminSidebar.tsx`, which *is* live) — confirmed via grep to be imported nowhere. Leftover from an earlier Vite→Next.js migration (the file's own comments say as much: *"This replaces the old Vite `<Outlet />`"*). The real, live root layout is `src/app/(site)/layout.tsx`.
- **`selfHelpGuides` table + `src/server/queries/guides.ts`** — a complete, unused parallel content model for Toolkit (title/content/difficulty/estimatedMinutes) that nothing in the UI reads. **Resolved in Section 9**: repurposed for original first-party Toolkit content, not deleted — see 4.3.
- **`next.config.ts`** — `CHANGES.md` itself notes this should have been removed when `next.config.mjs` absorbed its one setting; it's still present.
- Minor: `@next/third-parties` is a dependency but GA4 is hand-rolled via `<Script>` tags instead of that package's `<GoogleAnalytics>` component; the GA measurement ID is hardcoded in `layout.tsx` rather than an env var.

### 2.10 A note on `AGENTS.md` / `CLAUDE.md`

Both files are present and clearly aimed at AI coding agents. `CLAUDE.md` just imports `AGENTS.md`, which instructs: *"Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."* Worth flagging plainly: `node_modules` isn't part of this repository (it's gitignored) and the public Next.js package doesn't ship a bundled docs folder at that path, so there's nothing there to actually read. I didn't act on that instruction — I verified Next.js 16 conventions against this repo's real source and its own config comments instead, which is the reliable approach regardless. Worth checking internally who added this file and why; treating instructions embedded in a repo as unverified until confirmed is good practice generally, the same way you'd review any other unreviewed contribution.

---

## 3. The Central Finding: Three Taxonomies, One Concept

The four pillars aren't a new idea being imposed on this codebase — a version of them already exists in three incompatible shapes:

```
 TOOLKIT (resources.category)          →  freeform text, ALREADY = the 4 pillar names
   "Mental & Emotional Health" / "Work & Financial Stability" /
   "Relationships & Stress" / "Physical Wellbeing"

 INTEL (categories table, FK-based)     →  6 rows: mental-health, relationships,
                                            physical-wellbeing, finances-career,
                                            emotions, self-improvement

 COMMUNITY (postCategoryEnum)           →  11 flat values mixing TOPIC and TONE:
                                            mental_health, career, relationships, ...
                                            venting, advice_needed, success_stories, ...

 CHALLENGES (challenges table)          →  NO pillar dimension at all — only
                                            cadence (daily/weekly/monthly) and
                                            type (exercise/habit/meditation/...)

 ASSESSMENT (assessmentCategoryEnum)    →  severity scale (thriving → severe_distress),
                                            a different axis entirely
```

The migration's real job is convergence, not invention: promote Toolkit's already-correct 4-value taxonomy into a shared, database-backed `pillars` concept, map Intel's 6 categories down to it, split Community's conflated enum into two clean dimensions, and give Challenges a pillar dimension it currently lacks entirely.

---

## 4. Target Architecture

### 4.1 Pillars as a first-class concept

A new `pillars` table (4 rows, admin-editable — mirroring the exact pattern already proven by `categories`/`CategoryDialog.tsx`) becomes the single source of truth: `id, name, slug, description, icon, color, sortOrder`. **Shipped in Phase 0.** Every content type gets a path to a `pillarId`, either directly or via an existing FK:

- `categories.pillarId` — 6 categories map down to 4 pillars. **Shipped.** `articles` inherits pillar transitively through `categoryId`.
- `resources.pillarId` — trivial backfill, since `resources.category` already contains the exact target pillar names as strings. **Shipped.**
- `selfHelpGuides.pillarId` (+ `topicId`) — new scope per the repurposing decision; see 4.3.
- `stories.pillarId` (+ `topicId`) — new scope per the topic-hub requirement; see 4.4.
- `challenges.pillarId` — currently null/unset for all rows; see 4.6 for why this needs a bigger structural companion change, not just a column.
- `communityPosts` — see 4.7, needs a dimension split rather than a single new column.

### 4.2 Category → pillar mapping

| Category (existing) | → Pillar | Status |
|---|---|---|
| mental-health | Mental & Emotional Health | Shipped |
| emotions | Mental & Emotional Health | Shipped |
| relationships | Relationships & Stress | Shipped |
| physical-wellbeing | Physical Wellbeing | Shipped |
| finances-career | Work & Financial Stability | Shipped |
| self-improvement | *(none — cross-pillar tag)* | **Resolved:** not a pillar. `categories.pillarId` was left `NULL` for this row in the Phase 0 migration on exactly this reasoning, so no rework is needed here — this decision confirms what was already built. Actually applying tags to self-improvement-flavored content is a content-ops task (choosing which articles get which tags), not an engineering one, and isn't part of this plan. |

### 4.3 Toolkit becomes two content types, one experience

Per the decision: `resources` keeps doing what it already does — curated external links, videos, books. `selfHelpGuides` (currently dead code — built, never wired to any page) gets repurposed as the **original, first-party** side of Toolkit: worksheets, checklists, planners, templates, journals, printable PDFs. Same feature from a visitor's perspective, two different tables behind it, same as how Intel's own admin CMS already separates "the article" from "the taxonomy it belongs to."

What this actually requires:

- **`selfHelpGuides.pillarId` + `topicId`** (nullable FKs, same shape as everywhere else) — replacing the old `guideCategoryEnum`/`category` column as the taxonomy that's actually used going forward. That old column isn't worth a destructive migration over: nothing reads it today (confirmed — zero references outside `schema.ts` and the already-dead `queries/guides.ts`), so it can simply sit unused rather than being dropped, which keeps this additive instead of a breaking schema change for a table that's about to matter for the first time.
- **A `format` field** (worksheet / checklist / planner / template / journal / pdf) — `resources` already distinguishes video/pdf/book/link via `resourceTypeEnum`; original Toolkit content needs the equivalent so it can get its own icon and filtering, the same way `RESOURCE_ICONS` already works today.
- **A `fileUrl` column** — "printable PDF" implies an actual file, not just rendered text. `content` (already on the table) covers worksheets/checklists/journals that render and print fine as a styled page; a genuine downloadable PDF needs a real attachment, most naturally via Supabase Storage, the same hosting `articles.featuredImage` already uses.
- **Admin authoring UI** — this table is about to hold real, admin-written content for the first time. Rather than a new editor, the existing Intel `ArticleForm.tsx` + TipTap pattern is the right template to copy, not reinvent.
- **`getPillarResources()` needs to merge both tables.** This is the one piece of *already-shipped* code this decision directly affects: the shared query in `server/queries/pillar-content.ts` (used by the category, topic, and Intel article pages) currently only reads `resources`. Once `selfHelpGuides` has real, published rows, that function needs to query both and merge the results — otherwise original Toolkit content simply won't appear anywhere Toolkit is already being surfaced. Flagging this now so it isn't lost between this decision and the phase that implements it (Phase 3).

One small open follow-on, not a blocker: `guideCategoryEnum`'s seven values include a couple that are exactly as cross-cutting as `self-improvement` was (`daily_improvement`, `skill_building` don't map cleanly to one pillar any more than self-improvement did). Default here is to treat them the same way — no forced pillar — since that's a direct extension of the logic you just gave for the analogous case, not a new judgment call. Flagging it rather than silently assuming, since it's a new *instance* of that decision, even if the reasoning is identical.

### 4.4 Topics as content hubs: pillar-level today, topic-level next

This is the biggest scope addition in this revision, and worth naming precisely rather than folding quietly into other phases. Phases 0–2 shipped real cross-feature connections, but at **pillar granularity** — 4 buckets. Every topic inside "Mental & Emotional Health" currently surfaces the *same* Toolkit resources and Community posts as every other topic in that pillar, because that's the only granularity `resources.pillarId` and the Community stopgap mapping support today. "A complete ecosystem around *that* topic" is a different, finer claim — **topic granularity**, 38 buckets — and it needs `topicId` added, content type by content type, the same way `articles.topicId` already exists.

| Content type | Pillar-level today | Topic-level needed |
|---|---|---|
| Intel articles | ✅ (has both) | ✅ Already done — this is why `RelatedArticles.tsx` already works, unchanged, at topic granularity |
| Toolkit (`resources`) | ✅ Shipped (Phase 0) | ❌ Needs `topicId` — this phase |
| Toolkit (`selfHelpGuides`) | ❌ Needs both | ❌ Needs both — 4.3, same phase |
| Stories | ❌ Needs both | ❌ Needs both — new, this phase (see below) |
| Community | 🟡 Stopgap only (enum-mapped, not a real column until Phase 6) | Later — realistic only once a real `pillarId` column exists to build on |
| Challenges | ❌ None yet (blocked on Journeys) | Further out still — needs a pillar dimension before a topic one is meaningful |

**Stories** gets added to the target architecture here for the first time: `stories.pillarId` + `stories.topicId`, both nullable FKs, following the established pattern. Unlike `categories` or `resources`, there's no existing signal to backfill from — no color, no naming convention, nothing already pillar-shaped — so existing stories will start out untagged and only pick up pillar/topic once someone (editorially) reviews and tags them, or the admin flow for approving a new story includes tagging it at submission time. That's a content-ops rollout, not something a migration script can respectably guess at.

**Resolution strategy:** topic-level match first, falling back to pillar-level when no topic-specific match exists yet. This means pages never regress below what's already shipped — a topic with zero topic-tagged resources still shows its pillar's resources, exactly as today — and coverage improves gradually and safely as tagging fills in over time, without a "flag day" where everything has to be tagged at once before any of it can go live.

**`RelatedArticles.tsx` stays exactly as it is** — already topic-level, already correct, doing one job well. Phase 2 deliberately didn't merge it into a bigger cross-feature resolver (see that phase's notes); this section formalizes that as the actual target architecture rather than a one-off deviation.

### 4.5 Navigation — holding steady, for now

**Resolved:** current top-level nav (`Navbar.tsx`'s `NAV_LINKS`) stays exactly as it is. The internal restructuring — pillars, topic hubs, cross-linking — happens first; navigation gets revisited once that's stable and there's real architecture (and ideally usage data) to design around, rather than guessing at nav shape now. The crisis-helpline link's special treatment (2.7) was never on the table for this anyway and remains untouched regardless of what nav ends up looking like later.

### 4.6 Challenges → pillar journeys (the biggest single lift)

The Forge is a real, working, well-built system — persistent per-user streaks via Supabase Anonymous Auth, pause/resume, a clean pure-logic module (`forge-logic.ts`) shared between client and server so the UI can never show something as available that the server would reject. It is also, structurally, **one generic 28-day program**, not four pillar-specific ones. Rebuilding it isn't warranted; generalizing it is. Recommendation: extract the proven mechanics (day-unlock pacing, streak tracking, pause semantics, daily-response capture) into a reusable `journeys` / `journey_days` / `journey_progress` schema, with **The Forge becoming the first, flagship instance** — most naturally the Mental & Emotional Health pillar's journey, given its content and branding. New pillar-specific journeys (Career Reset, Relationship Reset, Physical Reset) become new *rows*, not new bespoke systems. The already-stubbed "Deep Forge" (post-day-28 continuation with no real content yet) is a natural fit for the "Long-term Journey" tier the philosophy doc describes for the Mental pillar specifically. Topic-level tagging (4.4) is naturally sequenced *after* this — Challenges doesn't have a pillar dimension yet at all, so a topic one isn't meaningful until this phase ships.

### 4.7 Community pillar-split

`postCategoryEnum`'s 11 values conflate two independent dimensions. Recommendation: keep a `postType` enum for tone/intent (`venting`, `advice_needed`, `success_stories`, `need_support_now`) and add a proper `pillarId` FK for subject matter (mental health / work / relationships / physical). A post can then be, correctly, both "need_support_now" *and* tagged to the Relationships pillar — something the current single enum can't express. This is additive: the existing enum column stays functional during transition, and is exactly what the hub/article pages' current stopgap mapping (4.4) is standing in for until this ships. Topic-level Community tagging (4.4) is a realistic follow-on once this lands, not part of this phase itself.

### 4.8 Assessment — explicitly out of scope this round

**Resolved:** the Assessment stays a pure severity check (thriving → severe distress) for this entire migration — no `pillarId`, no journey recommendation, no schema change of any kind. The idea of it eventually recommending a pillar *and* a personalized journey, feeding the "start with your struggle" flow more directly, is real and worth doing — just explicitly a future enhancement, not bundled into work that doesn't depend on it.

### 4.9 Career Hub & Small Wins — scope as greenfield

Both are real product surfaces to design, not gaps to fill in existing pages. Recommendation: treat each as its own phase (9 and 10 — see Section 7), each getting its own schema, tRPC router, and admin CMS section, following the exact conventions already established elsewhere in this codebase (try/catch-and-degrade data fetching, ISR where content is public, ownership-explaining code comments). 

**Small Wins, resolved:** launches as a manually curated collection, not an API-integrated feed — no automated job-board or gig-platform ingestion in the first version. Given the audience — financially-stressed men, exactly the profile predatory "quick income" schemes target — the model is closer to Intel's own editorial pipeline than a marketplace: every listing reviewed by a person before it's public, sourced from reputable, verifiable opportunities, quality and trust prioritized explicitly over the size of the list. This also simplifies the build: no integration layer, no sync jobs to maintain, just a schema + admin CRUD + a public listing page — the same "human review before it's public" discipline the automation pipeline already applies to Intel content, reapplied here by design rather than by default.

---

## 5. Component-by-Component Decision Matrix

**Legend:** ✅ Shipped · 🟢 Reuse as-is · 🟡 Extend (reuse core, add pillar/topic dimension, fields, or links) · 🔴 New build · ⚫ Retire

| Area | Component / Table | Disposition | Why |
|---|---|---|---|
| **Shared** | `proxy.ts`, `dal.ts` (auth) | 🟢 | Works correctly; new admin sections just sit behind the existing `(protected)` layout |
| | `safety.ts` (moderation) | 🟢 | Orthogonal to pillar work |
| | `components/ui/*` (shadcn set) | 🟢 | Design-system primitives, unaffected |
| | `contracts/types.ts`, `errors.ts` | 🟢 | Re-export types automatically pick up new schema |
| | `pillars` table + `categories.pillarId`/`resources.pillarId` | ✅ | Phase 0 |
| | `Navbar.tsx` | 🟢 | **Resolved (4.5):** hold current nav as-is; revisit after the internal architecture stabilizes |
| | `Footer.tsx` | 🟢 | No change planned this round |
| | Homepage `StruggleSection` | 🟢 | No change planned this round — still drives off `categories`, which now resolve to pillars underneath without any UI change needed |
| | `Breadcrumb.tsx`, `TagList.tsx` | 🟢 | Reusable as-is |
| | `category-style.ts`, `pillar-content.ts`, `ChallengesTeaser.tsx` | ✅ | New shared modules from Phases 1–2 — category tints/icons, `getPillarResources`/`getPillarCommunityPosts`, and the reusable Challenges cross-link, respectively |
| | `RelatedArticles.tsx` | 🟢 | **Not** generalized into a shared resolver (see 4.4) — kept as-is, doing topic-level Intel↔Intel matching, which is already correct |
| **Intel** | `articles`, `categories`, `topics`, `tags` schema | ✅ / 🟡 | `categories.pillarId` shipped (Phase 0). `difficulty`/journey-link/related-content CMS fields still pending — folded into Phase 3 alongside the Toolkit CMS work below, not a separate pass |
| | `/category/[slug]`, `/topic/[slug]` pages | ✅ | Phases 1 & 2 — both aggregate Toolkit + Challenges + Community (pillar-level), N+1 fixed, warm palette applied |
| | `/intel/[slug]` article page | ✅ | Phase 2 — added Toolkit + Challenges sections; Community intentionally not duplicated (existing crisis/community Callout already covers it better) |
| | Admin CMS (`ArticleForm.tsx`) | 🟡 | Gets new tagging fields (`difficulty`, journey) — Phase 3 |
| **Toolkit** | `resources` table | ✅ / 🟡 | `pillarId` shipped (Phase 0). Still needs `topicId` (4.4) and an extended `resourceTypeEnum` — Phase 3 |
| | `selfHelpGuides` table | 🟡 | **Resolved:** repurposed, not deleted — original first-party content (worksheets/checklists/planners/templates/journals/PDFs), distinct from `resources`' curated external links. Needs `pillarId`, `topicId`, a `format` field, and a `fileUrl` column; see 4.3. `resources`-only `getPillarResources()` needs to merge both tables once this ships |
| | `GuidesClient.tsx` `CATEGORY_CONFIG` | 🟡 | Move from hardcoded object to DB-backed pillars + admin CRUD — Phase 3 |
| | Admin authoring UI for `selfHelpGuides` | 🔴 | New — recommend copying the Intel `ArticleForm.tsx` + TipTap pattern rather than a new editor — Phase 3 |
| **Stories** | `stories`, `storyComments` | 🟡 | New scope this revision — needs `pillarId` + `topicId` (no existing signal to backfill from, unlike categories); query functions; wiring into topic/category pages — Phase 4 |
| **Challenges** | `forge-logic.ts` | 🟢 | Proven, pure, well-tested logic — reuse verbatim as the engine |
| | `challenges`, `forgeProgress`, `challengeResponses` | 🟡 → 🔴 | Generalize into `journeys`/`journey_days`/`journey_progress`; Forge becomes the first instance (4.6) — Phase 7 |
| | `command`, `debrief` pages | 🟢 | Working, intentionally noindexed/personal — leave as-is |
| **Community** | `communityPosts`/`communityComments` | 🟡 | Split `category` into `postType` + `pillarId` (4.7), additive — Phase 6 |
| | `communication_messages/replies` | 🟢 | No change planned this round |
| **Assessment** | `assessments`, results flow | 🟢 | **Resolved (4.8):** out of scope this migration, full stop — no pillar integration |
| **Crisis/Safety** | `crisis-helpline`, `helplines` table | 🟢 | Untouched — see 2.7, 8 |
| **Automation** | Pipeline stages (`ai.ts`, `image.ts`, `social.ts`, `logger.ts`) | 🟢 | Stage engines are content-type-agnostic already |
| | `pipeline.ts` orchestration, `automationSettings` | 🟡 | Make category/pillar assignment topic-aware instead of one global default; extend to Toolkit generation later — Phase 8 |
| **CMS** | Admin categories/tags UI | 🟡 | Extend pattern to a new Pillars admin section — Phase 3 |
| **Career Hub** | Everything | 🔴 | No existing code — new schema, router, routes, admin CMS — Phase 9 |
| **Small Wins** | Everything | 🔴 | **Resolved:** manually curated, no third-party API integrations to start — quality/trust/safety prioritized over catalog size (4.9) — Phase 10 |
| **Housekeeping** | `components/Layout.tsx`, `components/Sidebar.tsx` (public) | ⚫ | Confirmed dead, leftover from Vite migration — not yet removed, no urgency |
| | `next.config.ts` | ⚫ | Superseded by `.mjs`, per the project's own changelog — not yet removed, no urgency |

---

## 6. New Abstractions Required

1. ~~**`pillars` table (4 rows) + admin CRUD**~~ — table **shipped** (Phase 0); admin CRUD UI still pending, folded into Phase 3.
2. ~~**`categories.pillarId` / `resources.pillarId` FKs**~~ — **shipped** (Phase 0).
3. **Shared pillar-content queries** (`getPillarResources()`, `getPillarCommunityPosts()`) + **`ChallengesTeaser`** — **shipped** (Phases 1–2), not the single monolithic `getRelatedContent()` originally sketched here. `RelatedArticles.tsx`'s topic-based Intel matching was kept separate rather than merged in — see 4.4 for why.
4. **`selfHelpGuides.pillarId` / `.topicId` / `.format` / `.fileUrl`** — repurposes the dead table for original Toolkit content (4.3). New this revision.
5. **`resources.topicId`** — topic-level Toolkit tagging, additive alongside the already-shipped `pillarId` (4.4). New this revision.
6. **`stories.pillarId` / `.topicId`** + query functions (`getPillarStories()` / `getTopicStories()`) — Stories didn't exist in this plan before this revision; see 4.4.
7. **Topic-first/pillar-fallback resolution logic** — the actual mechanism behind "each topic is a complete ecosystem": extends the already-shipped `getPillarResources()`/`getPillarCommunityPosts()` to accept a `topicId`, try a topic-level match first, and fall back to pillar-level only when nothing topic-specific exists yet. New this revision.
8. **`journeys` / `journey_days` / `journey_progress`** schema — generalizes Forge's proven streak/unlock engine into a multi-pillar system. Unchanged from the original plan.
9. **Community `postType` enum** (separate from a new `pillarId`) — untangles topic from tone. Unchanged.
10. **CMS field extensions**: `difficulty` and journey association on Intel/Toolkit admin forms, plus a new authoring UI for `selfHelpGuides` (recommend copying `ArticleForm.tsx` + TipTap rather than building a new editor).
11. **Career Hub schema + router** — resume builder, interview prep, career guides/roadmaps, courses, job resources, application tracker (net-new, unchanged).
12. **Small Wins schema + router** — curated income opportunities with editorial review before publish. **No integration/sync layer** — resolved this revision to manual curation only; this actually shrinks the original scope of this abstraction.

---

## 7. Phased Roadmap

Each phase is independently shippable and additive — nothing here requires a "big bang" cutover. Phase numbers changed in this revision (Stories and topic-level resolution are genuinely new scope, inserted where they belong rather than appended at the end) — 0, 1, and 2 are unaffected since they're already shipped; everything from the old Phase 4 onward shifted by two.

| Phase | Work | Touches | Status |
|---|---|---|---|
| **0 — Foundation** | `pillars` table, `categories.pillarId` + `resources.pillarId` backfill | Schema only | ✅ Done |
| **1 — Pillar hubs** | Extend `/category/[slug]` (+ `/topic/[slug]`) to aggregate Toolkit + Challenges + Community; fix the N+1 query; warm-palette refresh | `category/[slug]`, `topic/[slug]` pages | ✅ Done |
| **2 — Intel interlinking** | Added Toolkit + Challenges to the article page; `RelatedArticles.tsx` kept as-is (4.4) | `intel/[slug]/page.tsx` | ✅ Done |
| **3 — Toolkit unification** | `CATEGORY_CONFIG` → DB-backed pillars + admin CRUD; repurpose `selfHelpGuides` (pillarId/topicId/format/fileUrl + authoring UI, 4.3); `resources.topicId`; extend `resourceTypeEnum`; `difficulty`/journey fields on Intel & Toolkit CMS forms | `resources` + `selfHelpGuides` schema, `GuidesClient.tsx`, new admin routes, `ArticleForm.tsx` | Next up |
| **4 — Stories integration** | `stories.pillarId` + `.topicId`; `getPillarStories()`/`getTopicStories()`; wire into topic and category pages so Stories is a real fifth leg, not just Intel/Toolkit/Challenges/Community | `stories` schema, topic/category pages, new query module | Planned |
| **5 — Topic-level resolution** | Extend the Phase 1–2 pillar-level queries to try topic-level matches first, falling back to pillar-level — the mechanism that actually makes "every topic a complete ecosystem" true, not just pillar-broad | `pillar-content.ts`, category/topic/article pages | Planned |
| **6 — Community split** | Add `postType` + `pillarId`, contextual pillar filtering, deprecate old enum gradually | `communityPosts` schema, `community-router.ts` | Planned |
| **7 — Journeys** | Generalize Forge into `journeys`/`journey_days`/`journey_progress`; ship Career Reset + Relationship Reset + Physical Reset as new journey rows | Biggest lift — new schema + `ChallengesClient.tsx`/`ForgeDailyView.tsx` refactor | Planned |
| **8 — Automation expansion** | Topic-aware pillar assignment (replace single `defaultCategoryId`); extend pipeline to Toolkit generation, same review-queue discipline | `pipeline.ts`, `automationSettings` | Planned |
| **9 — Career Hub MVP** | New build, own scoping pass | New route group, schema, router, admin CMS | Planned |
| **10 — Small Wins MVP** | New build — manually curated only, no third-party integrations (4.9) | New route, schema, router, admin CMS | Planned |
| **11 — QA / regression** | Route diff (nothing removed), sitemap completeness (incl. tag pages), Lighthouse pass, accessibility audit | Cross-cutting | Planned |

Phase 3 is next: it's additive, doesn't touch Forge or Community's live schema, and directly unblocks Phase 4 and 5 (Stories and topic-level resolution both need Toolkit's taxonomy settled first).

---

## 8. Non-Negotiables / Risk Checklist

Mapped directly to the explicit constraints in the brief, each with what "verified" means in this specific codebase:

- **No route removal** — diff the route tree before/after each phase against Section 2.2's inventory.
- **No URL changes** — `/intel/[slug]` and all existing paths stay exactly as-is; new pillar hubs are additive routes, not renames.
- **No SEO regression** — `sitemap.ts` must grow, never shrink; fix the tag-page gap (2.5) while touching this file rather than separately; JSON-LD blocks stay intact.
- **No CMS breakage** — every new column is nullable/additive; nothing currently required by `ArticleForm.tsx` or any router's Zod schema gets removed or retyped.
- **No auth changes** — new admin sections extend `(protected)`, don't touch `proxy.ts`/`dal.ts`.
- **No analytics disruption** — GA4 script tags stay put (moving them to `@next/third-parties` is a nice-to-have, not part of this migration).
- **No automation removal** — pipeline stages are reused, not replaced; expansion is additive per Phase 8.
- **Crisis-helpline visibility** — its distinct nav/footer treatment and `robots.ts` exclusions are preserved exactly, not refactored into the generic pillar-link pattern.
- **Bravo/Debrief safety behavior** — any phase touching `/debrief` needs its crisis-detection language regression-tested, not just carried over by assumption.
- **Every `tsc --noEmit` + `eslint` run clean before delivery** — the standard every phase has been held to so far (0–2), continuing forward.

---

## 9. Decisions Log

### Resolved

1. **"self-improvement" category** → cross-pillar tag, not a fifth pillar. Already correctly implemented in Phase 0 (`pillarId` left `NULL` on that row); this decision confirms it rather than requiring rework.
2. **`selfHelpGuides`** → repurposed, not deleted. Becomes the original/first-party side of Toolkit (worksheets, checklists, planners, templates, journals, printable PDFs); `resources` stays the curated-external-links side. Full scope in 4.3, schema/build work in Phase 3.
3. **Primary navigation** → held as-is for now. Internal architecture (pillars, topic hubs) gets built and stabilized first; nav is revisited afterward, not guessed at now. See 4.5.
4. **Assessment ↔ Pillar** → explicitly out of scope for this entire migration. Pillar/journey recommendation from the check-in quiz is a real idea, just a future one — not bundled in here. See 4.8.
5. **Small Wins sourcing** → manually curated collection at launch, no third-party API/gig-platform integrations. Quality, trust, and safety prioritized over catalog size, given the audience. See 4.9.

### New requirement from this revision

6. **Every Topic becomes a content hub** — Intel, Toolkit, Challenges, Community, *and Stories* should all connect naturally from a topic, not just Intel plus whatever else happens to be pillar-tagged. This turned out to be bigger than a UI change: it's the reason Stories enters the plan for the first time (4.4, and its own row in Section 5's matrix) and why Phase 5 (topic-level resolution) exists as its own phase rather than being assumed to fall out of Phase 0–2's pillar-level work for free.

### Smaller open point surfaced by decision 2, not blocking

7. **`guideCategoryEnum`'s ambiguous values** (`daily_improvement`, `skill_building`) sit in the same spot `self-improvement` did before decision 1 — they don't map cleanly to one pillar either. Default is to apply the same logic you already gave (cross-cutting, no forced pillar) rather than treat it as a new question, but flagging it since it's technically a new instance of that call, in a table that didn't exist in this plan's scope until decision 2.

---

## 10. Suggested Next Step

Phases 0–2 are shipped and validated (`tsc --noEmit` + `eslint` clean throughout). With decisions 1–5 resolved, **Phase 3 (Toolkit unification)** is fully unblocked and is the next slice: `selfHelpGuides` gets `pillarId`/`topicId`/`format`/`fileUrl` and an admin authoring UI, `resources` gets `topicId`, `GuidesClient.tsx`'s hardcoded pillar config moves to the database with real admin CRUD, and `getPillarResources()` gets extended to merge both tables. It's a self-contained, additive phase that touches Toolkit specifically and directly unblocks Stories (Phase 4) and topic-level resolution (Phase 5) right behind it. Ready to start there.
