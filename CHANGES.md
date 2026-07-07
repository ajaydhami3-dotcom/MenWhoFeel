# MenWhoFeel — Redesign

## v2.2 — Function-first trim (this update)

The instruction this time was explicit: stop optimizing for how it looks,
optimize for what a first-time visitor feels and does in their first 60
seconds, and cut anything that doesn't reduce uncertainty, build trust, or
point to a meaningful next step. That's a different exercise than
"reshuffle sections" — it meant actually re-justifying every section
against those three tests and cutting the ones that didn't clear the bar,
rather than keeping everything "just in case."

**Cut entirely from the homepage** (each of these still has its own full
page and is still linked from the navbar — nothing was deleted, just
un-featured on first visit):
- **Toolkit preview and Challenges preview.** These show platform breadth,
  which is a nice-to-have, not a first-60-second need — and each one is
  another competing call-to-action pulling attention away from the one
  thing that actually matters on a first visit. Eight different "click
  here" options across a homepage isn't more helpful than one or two; it's
  decision paralysis for someone who's already got enough on their mind.
- **The separate Check-In explainer section** (the one that showed sample
  questions). It was duplicating the hero's own Check In button — same
  destination, explained twice, extra scrolling with no new information.
  The de-risking info it carried ("no score, no diagnosis, no account")
  now lives as one line directly under the hero's button instead.
- **The Newsletter section.** Asking a first-time, possibly-distressed
  visitor for their email before they've read a single thing or clicked
  anything doesn't reduce uncertainty, build trust, or serve them — it's a
  retention ask for someone who's already engaged, not a first-visit
  need. `NewsletterForm.tsx` is still in the repo and fully working if you
  want it back somewhere further down the funnel later.
- **The standalone Founder-note section and the full 4-post Community
  grid.** Both were doing real trust-building work, just as two separate
  sections with two separate headings and CTAs. They're now one section —
  "Built by someone who needed it. Used by men who need it now." — with a
  single "read more from the community" link instead of two competing
  ones.
- **The 4-article "magazine" Intel grid**, trimmed to two plain text
  entries. Reading is genuinely the lowest-vulnerability next step
  available (no disclosure, no account, no interaction with anyone) — that
  earns a spot. A full mixed-layout magazine section with its own photo
  treatment was aesthetic polish the visitor doesn't need in the first
  minute; it's still the full experience on `/intel` itself.

**What's left — five sections, each with one job:**
1. Hero — reduce uncertainty about what this even is, one dominant CTA
   (Check In, now with "2 minutes · no score · no diagnosis" directly
   under it to de-risk the click) and one lightweight secondary option
   (a text link to Stories, not a second competing button).
2. "What are you dealing with today" — reduce uncertainty that this fits
   *their* specific problem, by name, immediately.
3. Trust — who built this and proof real men are actually here, combined.
4. Reading — the no-commitment option for someone not ready for Check-In
   or Community yet.
5. Closing — the same one CTA, restated once, not a new pitch.

Also trimmed the data fetchers to match — `getHomepageChallenges` and
`getHomepageGuides` are gone (they queried data that's no longer rendered),
and the article/community queries now fetch exactly 2 rows instead of 4,
since over-fetching data you don't display was itself a small instance of
the same "doesn't serve a goal" problem.

Validated the same way as every prior pass: clean `tsc --noEmit`, clean
`eslint` (down to a single `<img>` warning now — the hero placeholder is
the only image left on the page, which is itself a sign of how much
surface area came out), and a full `next build` succeeded end to end.

---

## v2.1 — Refinement pass

This pass kept every color, font, and design token exactly as they were —
per your brief, nothing was rebuilt from scratch. What changed is the
homepage's structure, flow, and a few specific pieces called out as feeling
too "template-like": the hero, the section order, how boxy things looked,
and the footer.

**Hero — completely rebuilt.** The floating quote cards are gone; it's now
a full-bleed photo-style hero with a fixed warm-dark scrim (so the
headline stays legible over a photo regardless of the site's light/dark
toggle — this is deliberate, most photo-led editorial heroes work this
way), a headline broken across three lines, and more whitespace.

**About the photography — read this before you ship it.** There's no
actual photo wired in yet, and I want to be straight about why: I don't
have access to your own photography, and I'm not willing to hotlink
whatever a generic image search turns up into a real website's source
code. The results skew toward AI-generated "stock" images and wallpaper
sites of unclear license — the opposite of "authentic" and a real legal
risk for you if it's ever actually copyrighted work. Instead, `HERO_IMAGE_URL`
in `page.tsx` is a single clearly-marked constant — drop in one URL and the
whole hero switches from the (still good-looking) gradient fallback to a
real photo. Two honest ways to fill it in:
- Your own photography (even phone photos of real places — walking paths,
  a coffee shop, a mountain trail) will read as more authentic than any
  stock photo, and costs nothing.
- Free, properly-licensed stock in the meantime: browse
  `unsplash.com/s/photos/man-walking-alone-rain` or
  `unsplash.com/s/photos/man-mountain-solitude`, pick whatever actually
  feels right for the brand (that's a real creative call worth making
  yourself), and paste the image URL in. Same pattern is used for the
  featured Intel article images (falls back to the same gradient treatment
  when a `featuredImage` isn't set on an article).

**Section order, rebuilt around the flow you asked for:** Hero → "What are
you dealing with today?" (repositioned category tiles, now the literal
question rather than a generic "Explore by topic" label) → Community
(moved way up, and rebuilt to feel alive — real reply counts via a live
join against `communityComments`, not just post titles) → Intel (now an
actual mixed magazine layout: one large photo-backed feature, one
image-left half-width entry, two text-only compact entries — not three
identical cards) → Toolkit → Challenges → a private Check-In moment →
Founder's note → Newsletter → closing CTA.

**Dropped from the homepage:** the Stories teaser section and the standalone
3-column trust strip. Stories still has its own full page and nav link —
it just duplicated Community's "real men, real words" job and your flow
diagram didn't include it, so keeping it would've fought the "tighter,
more flowing" goal. The trust strip's copy ("Free forever," "No account,"
etc.) didn't disappear — it's now a quiet inline line under the hero CTAs,
per your brief's "integrate trust naturally, not as its own exhibit."

**Less "component library" feel:** most section cards lost their hard
borders — cards are now a soft background-color shift only (`bg-card/70`,
`bg-secondary/25`), sections alternate tone instead of being separated by
divider lines, and the category tiles are boxless pills in a flowing wrap
instead of a bordered grid.

**Footer is now a real destination:** added a live "Popular Topics" column
(ranked by actual published-article count, not a hardcoded list) and a
short founder line. This required converting `Footer.tsx` from a static
component into an async one that queries the DB directly — same
try/catch-and-fall-back-gracefully pattern as everything else here, so a
DB hiccup just hides that one column rather than breaking the footer.

**Newsletter copy reframed** per "make it feel like joining a movement" —
same working form underneath (still posts through the existing contact
mutation, as before), just different surrounding copy that says what
someone actually gets.

Validated the same way as the first pass: clean `tsc --noEmit`, clean
`eslint` (only the same deliberate `<img>` warnings, now three instances
instead of one), and a full `next build` succeeded end to end with a dummy
DB and fonts temporarily stubbed to work around this sandbox's network
policy — same single caveat as before: confirm the real Google Fonts
fetch succeeds in an environment with normal internet access.

---

## v1 — Initial pass

Scope note first: the brief asked for a full redesign of everything (homepage,
Intel, article page, Community, Toolkit, Challenges, mobile, admin, dark +
light mode, a whole design system). That's genuinely a multi-week project for
a real team — doing a shallow pass across 20+ templates in one go would have
produced worse work than doing a smaller slice properly. So Phase 1 is:

- The full design system (colors, type, tokens, dark/light mode)
- Navbar + Footer (every page inherits these)
- Homepage — completely rebuilt
- Intel article page — completely rebuilt (the actual reading experience)

Community, Toolkit, Challenges, Assessment, Crisis Helpline, About, and the
rest still render with the **old** dark-blue theme for now — see "What's
still on the old design" below. They're not broken, just not restyled yet.

## How to apply this

1. In your local repo: `rm next.config.ts` (see "Config cleanup" below).
2. Extract this zip into your repo root — every path here mirrors `src/`,
   so files land exactly where they should and overwrite the old versions.
3. No new dependencies. Everything used here (`next-themes`, `date-fns`,
   `lucide-react`) was already in your `package.json`. `next-themes` was
   installed but never actually wired up — it is now.
4. `npm run build` once. I validated this whole change set compiles clean
   (`tsc --noEmit`, `eslint`, and a full `next build` with a dummy DB) from
   this sandbox — the **one** thing I could not verify here is the actual
   Google Fonts fetch at build time, since this sandbox's network policy
   blocks `fonts.googleapis.com`. That's a completely standard `next/font/
   google` setup (Fraunces + Manrope + IBM Plex Mono), so it should just
   work, but confirm the build succeeds in an environment with normal
   internet access before you ship it.

## Design direction

Old: forced dark mode, blue-to-teal gradients, glowing blob backgrounds,
fonts stubbed out to `""`, a persistent collapsible sidebar on every page.
That combination reads as "internal SaaS dashboard," not "editorial mental
health platform" — which lines up with your instinct that it felt
developer-built.

New direction — warm stone/paper backgrounds with a deep warm-charcoal ink,
one bronze-amber accent ("ember") for CTAs and links, a muted forest green
("pine") for growth/community moments, and a rust tone ("signal") reserved
*only* for crisis-related UI so it's never confused with a normal button.
Real light mode as the default, real dark mode as a first-class alternative
(not an inverted afterthought) — both driven by `next-themes`, toggleable
from the navbar.

Type: **Fraunces** (warm serif) for headlines and pull quotes, **Manrope**
for body/UI, **IBM Plex Mono** for small metadata (dates, tags, reading
time, category labels) — gives the whole site a quiet "field notes"
texture that fits "Intel" as a section name. The one recurring brand device
is the wordmark itself: "Feel" is always set in italic serif, everywhere
the logotype appears.

Signature visual element: a quiet, layered horizon-line motif
(`HorizonMotif.tsx`) behind the hero — steady ground / an even keel, not a
literal mountain icon. Used once, prominently, not scattered everywhere.

## Structural change worth knowing about: the sidebar is gone

The old layout had a persistent collapsible dashboard sidebar (`Sidebar.tsx`)
on *every* page, plus a top navbar with mostly overlapping links — that
double-navigation pattern is a strong contributor to "feels like a developer
built this." None of your reference sites (Calm, Apple, Linear, Notion,
Medium) use a persistent app-shell sidebar on public pages.

I removed it from the layout and folded every link it had into the navbar
and footer, so **no route or page became unreachable** — `Sidebar.tsx`
itself is still in the repo, just not rendered anymore. Delete it whenever
you're comfortable, or repurpose it later if useful.

One tradeoff from this: the sidebar's persistent "anonymous, no account"
reassurance is no longer on *every* page. It's still prominent on the
homepage hero and in the footer, but not nagging on every screen — an
intentional call in the direction of "less UI, more content."

## Other decisions worth flagging

- **Newsletter section (new, on the homepage):** there's no dedicated
  subscriber/mailing-list table yet, so `NewsletterForm.tsx` submits
  through the existing `contact.submitMessage` mutation (tagged as a
  newsletter signup). It's a real, working submission — it just lands as a
  contact message today rather than a managed list. Worth a proper
  `newsletter_subscribers` table + route if this becomes a real channel.
- **"Toolkit preview" (new, on the homepage):** pulls real featured guides
  from `selfHelpGuides`, with a fallback to the most recent guides if none
  are marked featured yet.
- **"Latest community discussions" (homepage):** now pulls real, live posts
  from `communityPosts` (non-deleted, non-flagged), falling back to static
  seed copy only if the table is empty or unreachable — previously this
  section was static copy only.
- **Article page table of contents → "reading tools":** the brief asked for
  a sticky/floating TOC, but article content is generated as plain text
  with *no* heading structure ("No markdown. No headings. Just paragraphs"
  — straight from `automation/prompts.ts`), so a real jump-to-section TOC
  can't be built honestly. `ArticleReadingTools.tsx` does the same
  orientation job instead: a reading-progress bar, one-tap share, and jump
  links to the sections that do exist (Discussion, Related reads).
- **Pull quotes / callout boxes:** since content has no markup to flag a
  "this is a pull quote" moment, one is lifted automatically from a
  mid-article sentence (duplicated as a visual scan point, nothing is
  removed or changed). The callout box is a standard supportive-resources
  prompt (links to Crisis Helpline + Community) inserted once, after the
  body — genuinely useful for a mental health platform, not just a design
  requirement to check off.
- **Dynamic images use `<img>`, not `next/image`:** `featuredImage` URLs
  come from Supabase Storage today, but `storage.ts` explicitly handles
  "old external URLs from before this CMS existed" too — meaning the host
  isn't guaranteed. `next/image` would throw at runtime for any host not
  explicitly whitelisted, so plain `<img>` (with `loading="lazy"` /
  `"eager"` set appropriately) is the safer choice until legacy image URLs
  are normalized.
- **SEO fields now actually used:** `seoTitle`, `metaDescription`,
  `canonicalUrl`, and `ogImage` were already collected in the admin article
  editor but never read by the public article page — every article got
  the same generic OG/Twitter output regardless. They're now used with the
  exact previous values as fallback, so this is a strict improvement with
  no behavior change for articles that don't set them.
- **Config cleanup:** `next.config.ts` and `next.config.mjs` both existed
  side by side — `next.config.mjs`'s own comments say `next.config.ts` was
  "now-removed," so this just finishes that. Nothing in the `.ts` file
  wasn't already in the `.mjs` file (both had `reactCompiler: true`; the
  `.mjs` also has your security headers and image config, which is the one
  you want to keep).
- **Homepage "Topics" section removed:** the old homepage had both a
  category grid and a near-identical topics grid back to back. I merged
  these into one "Explore by topic" section — the `/topic/[topicSlug]`
  pages themselves are untouched and still fully linked from category
  pages and article breadcrumbs.

## What's still on the old design

Community, Toolkit/Guides, Challenges, Stories, Assessment, Crisis Helpline,
About, Contact, and the legal pages still use the old dark theme and old
hardcoded colors — they'll render correctly, just visually inconsistent
with the new homepage/article page until their turn comes. Two things *do*
already reach them for free: `.text-gradient` and `.card-glow` (used across
about/contact/assessment/guides/disclaimer/etc.) were redefined in
`globals.css` to the new warm palette instead of the old blue glow, so
those specific accents already look right even on untouched pages.

Natural next slice, whenever you want to keep going: Community (the forum
feed + individual post pages), Toolkit/Guides (turning it into the "learning
hub" the brief describes), and Challenges (the gamification — streaks,
badges, progress visualization) are the three biggest remaining pieces.
