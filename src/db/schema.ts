import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  date,
  bigint,
  integer,
  boolean,
  index,
  uniqueIndex,
  uuid,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// PostgreSQL Enums
// ==========================================
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const challengeCategoryEnum = pgEnum("challenge_category", ["daily", "weekly", "monthly"]);
export const challengeTypeEnum = pgEnum("challenge_type", ["exercise", "habit", "meditation", "discipline", "spot_check"]);
export const assessmentCategoryEnum = pgEnum("assessment_category", ["thriving", "stable", "mild_distress", "moderate_distress", "severe_distress"]);
export const guideCategoryEnum = pgEnum("guide_category", ["overcoming_crisis", "daily_improvement", "skill_building", "emotional_regulation", "relationships", "productivity", "physical_health"]);
// NEW: what kind of original Toolkit content this is (Phase 3 — repurposing
// selfHelpGuides for first-party content, distinct from resources' curated
// external links). Separate from guideCategoryEnum above, which stays as an
// unused legacy field — see the pillarId/topicId columns below for the
// taxonomy that's actually used going forward.
export const guideFormatEnum = pgEnum("guide_format", ["worksheet", "checklist", "planner", "template", "journal", "pdf"]);
export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);
export const resourceTypeEnum = pgEnum("resource_type", ["video", "pdf", "book", "link"]);

export const postCategoryEnum = pgEnum("post_category", [
  "mental_health",
  "anxiety",
  "depression",
  "relationships",
  "career",
  "loneliness",
  "self_improvement",
  "venting",
  "advice_needed",
  "success_stories",
  "need_support_now",
]);

export const reportTargetEnum = pgEnum("report_target", [
  "post",
  "comment",
  "communication_message",
  "communication_reply",
]);

// ==========================================
// Users
// ==========================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ==========================================
// Stories
// ==========================================
export const stories = pgTable(
  "stories",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    authorName: varchar("authorName", { length: 255 }).notNull().default("Anonymous"),
    excerpt: varchar("excerpt", { length: 500 }),
    status: statusEnum("status").default("pending").notNull(),
    featured: boolean("featured").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    // NEW (Phase 4): unlike categories/resources, there's no existing
    // signal to backfill these from — no color, no naming convention,
    // nothing already pillar-shaped. Existing stories start out
    // untagged; new ones can be tagged at submission (see
    // stories-router.ts's submitStory) or by editorial review later.
    // Both nullable for exactly that reason.
    pillarId: integer("pillarId").references(() => pillars.id),
    topicId: integer("topicId").references(() => topics.id),
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
    pillarIdx: index("stories_pillar_idx").on(table.pillarId),
    topicIdx: index("stories_topic_idx").on(table.topicId),
  })
);

// ==========================================
// Story Comments
// ==========================================
export const storyComments = pgTable(
  "story_comments",
  {
    id: serial("id").primaryKey(),
    storyId: bigint("storyId", { mode: "number" }).notNull(),
    authorName: varchar("authorName", { length: 255 }).notNull().default("Anonymous"),
    content: text("content").notNull(),
    status: statusEnum("status").default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    storyIdIdx: index("story_id_idx").on(table.storyId),
  })
);

// ==========================================
// Challenges
// ==========================================
export const challenges = pgTable(
  "challenges",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: challengeCategoryEnum("category").notNull(),
    type: challengeTypeEnum("type").notNull(),
    instructions: text("instructions"),
    dayOfWeek: integer("dayOfWeek"),
    // 1–28 for The Forge's daily program; null for weekly/monthly rows.
    // Replaces the old implicit "array index = day number" behavior in
    // ChallengesClient.tsx, which broke the moment getChallenges() returned
    // rows in a different order than they were seeded.
    dayNumber: integer("dayNumber"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    activeIdx: index("active_idx").on(table.active),
    dayNumberIdx: index("day_number_idx").on(table.dayNumber),
  })
);

// ==========================================
// User Challenge Progress
// ==========================================
export const userChallenges = pgTable(
  "user_challenges",
  {
    id: serial("id").primaryKey(),
    challengeId: bigint("challengeId", { mode: "number" }).notNull(),
    userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(),
    completed: boolean("completed").default(false).notNull(),
    notes: text("notes"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userChallengeIdx: index("user_challenge_idx").on(table.userIdentifier, table.challengeId),
  })
);

// ==========================================
// Chat Messages
// ==========================================
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    authorName: varchar("authorName", { length: 255 }).notNull().default("Anonymous"),
    content: text("content").notNull(),
    status: statusEnum("status").default("approved").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("chat_created_at_idx").on(table.createdAt),
    statusIdx: index("chat_status_idx").on(table.status),
  })
);

// ==========================================
// Mental Health Assessments
// ==========================================
export const assessments = pgTable(
  "assessments",
  {
    id: serial("id").primaryKey(),
    userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(),
    answers: text("answers").notNull(),
    score: integer("score").notNull(),
    category: assessmentCategoryEnum("category").notNull(),
    recommendations: text("recommendations").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdentifierIdx: index("user_identifier_idx").on(table.userIdentifier),
  })
);

// ==========================================
// Self Help Guides
// ==========================================
export const selfHelpGuides = pgTable(
  "self_help_guides",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: guideCategoryEnum("category").notNull(),
    difficulty: difficultyEnum("difficulty").default("beginner").notNull(),
    estimatedMinutes: integer("estimatedMinutes"),
    featured: boolean("featured").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    // NEW (Phase 3): the taxonomy this table actually uses going forward.
    // `category` above (guideCategoryEnum) is left in place but unused —
    // nothing read it before this table was repurposed, so there's no
    // live behavior to preserve, and dropping it isn't worth a destructive
    // migration for a column that costs nothing sitting idle.
    pillarId: integer("pillarId").references(() => pillars.id),
    topicId: integer("topicId").references(() => topics.id),
    // What kind of original content this is (worksheet/checklist/planner/
    // template/journal/pdf). Nullable: existing rows, if any, predate this
    // column and haven't been categorized this way yet.
    format: guideFormatEnum("format"),
    // Set only for genuine downloadable attachments (e.g. a printable PDF
    // hosted on Supabase Storage, same as articles.featuredImage). Guides
    // meant to be read/printed as a styled page instead use `content`
    // above and leave this null — those need a public rendering page that
    // doesn't exist yet (tracked as a follow-up, see MIGRATION_PLAN.md).
    fileUrl: varchar("fileUrl", { length: 1000 }),
  },
  (table) => ({
    categoryIdx: index("guide_category_idx").on(table.category),
    pillarIdx: index("self_help_guides_pillar_idx").on(table.pillarId),
    topicIdx: index("self_help_guides_topic_idx").on(table.topicId),
  })
);

// ==========================================
// Crisis Helplines
// ==========================================
export const helplines = pgTable(
  "helplines",
  {
    id: serial("id").primaryKey(),
    country: varchar("country", { length: 255 }).notNull(),
    countryCode: varchar("countryCode", { length: 10 }).notNull(),
    organization: varchar("organization", { length: 255 }).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 50 }).notNull(),
    description: text("description"),
    availableHours: varchar("availableHours", { length: 255 }),
    website: varchar("website", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    countryIdx: index("country_idx").on(table.country),
  })
);

// ==========================================
// Resource Hub
// ==========================================
export const resources = pgTable(
  "resources",
  {
    id: serial("id").primaryKey(),
    category: varchar("category", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: resourceTypeEnum("type").notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // NEW: formal FK companion to the freeform `category` text above.
    // `category` already holds the exact 4 pillar names today ("Mental &
    // Emotional Health", etc. — see GuidesClient.tsx's CATEGORY_CONFIG),
    // so the backfill in supabase_migration_pillars.sql is a straight
    // string match, not a judgment call. `category` itself is untouched;
    // nothing reads pillarId yet — this just gives future code a real FK
    // instead of a string to key off of. `pillars` is declared further
    // down this file (taxonomy section) — Drizzle resolves the reference
    // lazily via this callback, so declaration order doesn't matter.
    pillarId: integer("pillarId").references(() => pillars.id),
    // NEW (Phase 3): topic-level tagging, additive alongside pillarId.
    // Nullable — most existing resources are pillar-scoped only for now;
    // the topic-first/pillar-fallback resolution that actually uses this
    // is Phase 5, not this one. This column just makes the data capable
    // of it.
    topicId: integer("topicId").references(() => topics.id),
  },
  (table) => ({
    categoryIdx: index("resource_category_idx").on(table.category),
    pillarIdx: index("resources_pillar_idx").on(table.pillarId),
    topicIdx: index("resources_topic_idx").on(table.topicId),
  })
);

// ==========================================
// User Progress
// ==========================================
export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  nextLevelXp: integer("next_level_xp").default(100).notNull(),
  rank: text("rank").default("Initiate").notNull(),
  currentDailyId: integer("current_daily_id").default(1).notNull(),
  completedWeeklies: integer("completed_weeklies").array().default([]).notNull(),
  lastCompletedAt: timestamp("last_daily_completed_at", { withTimezone: true }),
});

// ==========================================
// The Forge — 28-day challenge progress
// ==========================================
// Real per-person progress for /challenges, backed by Supabase Anonymous
// Auth (see src/hooks/useAuth.ts + src/server/forge-router.ts). This
// replaces the old userChallenges + hardcoded TEST_USER_ID hack, which
// meant every visitor shared one identity and no one's streak ever really
// persisted.
//
// `userId` points at this app's own `users.id` (serial int), not the raw
// Supabase auth uuid — every request already resolves `ctx.user` via
// `users.unionId` in server/context.ts, so this follows the same
// identity convention the rest of the app uses instead of introducing a
// second, parallel shape just for Forge data.
export const forgeProgress = pgTable("forge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  completedDays: integer("completedDays").array().default([]).notNull(),
  skippedDays: integer("skippedDays").array().default([]).notNull(),
  currentStreak: integer("currentStreak").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  lastActiveDate: date("lastActiveDate"),
  // "Pause the Forge" — while true, forge-router suspends the streak/pacing
  // math instead of quietly punishing someone for stepping away.
  isPaused: boolean("isPaused").default(false).notNull(),
  forgeCompleted: boolean("forgeCompleted").default(false).notNull(),
  completionDate: date("completionDate"),
  // Post-Day-28 continuation. There's no real "Deep Forge" content yet —
  // these two columns just keep the same streak mechanic going via
  // forge-router's checkInMaintenance() until that program is designed for
  // real, rather than leaving graduates with nothing.
  maintenanceMode: boolean("maintenanceMode").default(false).notNull(),
  deepForgeProgress: integer("deepForgeProgress").default(0).notNull(),
  deepForgeCompleted: boolean("deepForgeCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// One row per day someone actually writes/reflects on — the "what did you
// write" detail behind forge_progress's completedDays array. A sentinel
// dayNumber of 0 is also used for Monthly-tab log entries, which aren't
// tied to one specific Forge day and (unlike real days) can recur — the
// migration's unique index only enforces one-row-per-day for real days
// 1–28, so monthly logs can accumulate a history.
export const challengeResponses = pgTable(
  "challenge_responses",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayNumber: integer("dayNumber").notNull(),
    challengeTitle: varchar("challengeTitle", { length: 255 }).notNull(),
    responseText: text("responseText"),
    moodRating: integer("moodRating"),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("challenge_responses_user_id_idx").on(table.userId),
    userDayIdx: index("challenge_responses_user_day_idx").on(table.userId, table.dayNumber),
  })
);

// Single global row (id is always 1) powering the small social-proof stat
// on the Forge header (e.g. "1,204 men have finished the Forge"). Only
// ever incremented server-side via Drizzle — see queries/forge.ts.
export const anonymousStats = pgTable("anonymous_stats", {
  id: integer("id").primaryKey().default(1),
  totalForgeCompletions: integer("totalForgeCompletions").default(0).notNull(),
  totalActiveUsers: integer("totalActiveUsers").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ==========================================
// Journeys (Phase 7)
// ==========================================
// Generalizes The Forge's mechanics (day-unlock pacing, streaks, pause/
// resume — see forge-logic.ts, which none of this touches) into pillar-
// specific journeys, per MIGRATION_PLAN.md 4.6. Deliberately NOT a
// migration of Forge's data: challenges/forgeProgress/challengeResponses
// above are untouched and keep running exactly as they do today. This is
// new, parallel infrastructure for the three journeys Forge doesn't
// cover (Career Reset, Relationship Reset, Physical Reset).
//
// `journeys` is a registry — one row per journey, including one for The
// Forge itself (externalHref set, no journeyDays/journeyProgress rows —
// see that column's comment) so a pillar-driven UI (ChallengesTeaser) has
// one consistent place to look up "what's this pillar's journey" rather
// than a hardcoded special case for Forge.
export const journeys = pgTable(
  "journeys",
  {
    id: serial("id").primaryKey(),
    pillarId: integer("pillarId").references(() => pillars.id),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    totalDays: integer("totalDays").notNull(),
    // Set only for The Forge's registry row. A non-null value here means
    // "this journey's real experience lives elsewhere" — the UI should
    // link straight to this href instead of /challenges/[slug], and
    // there are no journeyDays/journeyProgress rows for this journeyId
    // (Forge's day content and progress live in challenges/forgeProgress
    // instead, untouched by this migration).
    externalHref: varchar("externalHref", { length: 255 }),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    slugIdx: index("journeys_slug_idx").on(table.slug),
    pillarIdx: index("journeys_pillar_idx").on(table.pillarId),
  })
);

// A journey's day-by-day content — the equivalent of `challenges`'
// category='daily' rows, but scoped to one journey via journeyId instead
// of sharing a table with generic weekly/monthly challenges. Seeded with
// structural placeholders only (see supabase_migration_journeys.sql) —
// real content is deliberately out of scope for this pass.
export const journeyDays = pgTable(
  "journey_days",
  {
    id: serial("id").primaryKey(),
    journeyId: integer("journeyId").notNull().references(() => journeys.id, { onDelete: "cascade" }),
    dayNumber: integer("dayNumber").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    instructions: text("instructions"),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    journeyDayIdx: uniqueIndex("journey_days_journey_day_idx").on(table.journeyId, table.dayNumber),
  })
);

// Mirrors forge_progress exactly (same fields, same meaning — see that
// table's comments), minus the Deep Forge/maintenance fields, which have
// no equivalent here yet: none of these three journeys has a "what
// happens after you finish" continuation designed. Journey-scoped instead
// of user-scoped: forgeProgress is one row per user (you can only ever be
// on Forge), this is one row per (user, journey) — a user can be
// partway through Career Reset and Physical Reset at the same time.
export const journeyProgress = pgTable(
  "journey_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    journeyId: integer("journeyId").notNull().references(() => journeys.id, { onDelete: "cascade" }),
    completedDays: integer("completedDays").array().default([]).notNull(),
    skippedDays: integer("skippedDays").array().default([]).notNull(),
    currentStreak: integer("currentStreak").default(0).notNull(),
    longestStreak: integer("longestStreak").default(0).notNull(),
    lastActiveDate: date("lastActiveDate"),
    isPaused: boolean("isPaused").default(false).notNull(),
    journeyCompleted: boolean("journeyCompleted").default(false).notNull(),
    completionDate: date("completionDate"),
  },
  (table) => ({
    userJourneyIdx: uniqueIndex("journey_progress_user_journey_idx").on(table.userId, table.journeyId),
  })
);

// Mirrors challenge_responses (one saved reflection per real day per
// user), journey-scoped the same way journeyProgress is above.
export const journeyResponses = pgTable(
  "journey_responses",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    journeyId: integer("journeyId").notNull().references(() => journeys.id, { onDelete: "cascade" }),
    dayNumber: integer("dayNumber").notNull(),
    dayTitle: varchar("dayTitle", { length: 255 }),
    responseText: text("responseText"),
    moodRating: integer("moodRating"),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => ({
    userJourneyDayIdx: uniqueIndex("journey_responses_user_journey_day_idx").on(
      table.userId,
      table.journeyId,
      table.dayNumber
    ),
  })
);

// ==========================================
// Career Hub & Small Wins (Phases 9–10)
// ==========================================
// Both belong ONLY inside Work & Financial Stability, per the original
// product brief ("Career Hub belongs ONLY inside Work & Financial
// Stability" / same for Small Wins) — that's a fixed architectural fact,
// not something that varies per row, so neither table gets a pillarId
// column the way resources/stories/etc. do. Discoverability is handled
// at the routing level instead (a dedicated /career-hub and /small-wins
// page, plus a link from that one pillar's category page), not through
// the generic pillar-scoped query machinery built for content that
// actually varies by pillar.

export const jobResourceCategoryEnum = pgEnum("job_resource_category", [
  "job_board",
  "networking",
  "salary_research",
  "company_research",
  "recruiter",
  "government_program",
]);

// Curated job-search resources — job boards, salary research, government
// workforce programs. Reuses `status` (pending/approved/rejected, same
// as stories) as the review gate: nothing here is public until someone
// approves it, matching the "quality and trust over quantity" posture
// MIGRATION_PLAN.md 4.9 calls for.
export const jobResources = pgTable(
  "job_resources",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    category: jobResourceCategoryEnum("category").notNull(),
    // Why this is here / why it's trustworthy — shown publicly, not just
    // an internal note, since the whole point is visible vetting.
    trustNotes: text("trustNotes"),
    status: statusEnum("status").default("pending").notNull(),
    featured: boolean("featured").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("job_resources_status_idx").on(table.status),
    categoryIdx: index("job_resources_category_idx").on(table.category),
  })
);

export const smallWinCategoryEnum = pgEnum("small_win_category", [
  "ai_training",
  "freelance",
  "microtasks",
  "crowdsourcing",
  "user_testing",
  "remote_work",
]);

// Manually curated income opportunities — see MIGRATION_PLAN.md 4.9 for
// the reasoning: no API integrations, editorial review before anything
// goes public (same status enum/gate as jobResources above), because this
// is exactly the kind of feature predatory "quick income" schemes target
// the same audience for.
export const smallWins = pgTable(
  "small_wins",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    category: smallWinCategoryEnum("category").notNull(),
    // Free text on purpose, not a number — real pay varies too much
    // ("$15-25/hr", "$3-8 per task", "varies by project") to force into
    // a single numeric column, and false precision here would undercut
    // the trust this feature depends on.
    payDetails: varchar("payDetails", { length: 255 }),
    requirements: text("requirements"),
    trustNotes: text("trustNotes"),
    status: statusEnum("status").default("pending").notNull(),
    featured: boolean("featured").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("small_wins_status_idx").on(table.status),
    categoryIdx: index("small_wins_category_idx").on(table.category),
  })
);

// ==========================================
// Resume Builder
// ==========================================
// Career Hub's Resume Builder — the first table in this whole migration
// holding real PII (full name, phone, employer names) rather than
// pseudonymous content. Per the product decision: saved server-side, tied
// to the same anonymous session used by Forge/Journeys, so a resume
// persists and can be resumed later — not client-side-only, which was
// the lower-risk recommendation but not the direction chosen. Given that,
// this table gets stricter treatment than everything else in this
// migration: no public RLS read policy at all (see the migration file),
// and every query must go through the resumeRouter's authedQuery
// middleware filtering by ctx.user.id — never a public/pillar-scoped
// query the way everything else in Career Hub is.
//
// One resume per user for v1 (userId is unique, same one-row-per-user
// shape as forgeProgress) — multiple saved resumes is a reasonable future
// addition, not needed for a first version.
//
// Deliberately no street address field — city/state only. Common,
// current resume-writing guidance already advises against a full home
// address on a public-facing document; this isn't an unusual restriction,
// it's the normal practice.

export type ResumeExperienceEntry = {
  id: string; // client-generated, stable key for add/reorder/remove in the form
  company: string;
  title: string;
  location?: string;
  startDate: string; // "YYYY-MM"
  endDate?: string; // omitted/empty when current is true
  current: boolean;
  bullets: string[];
};

export type ResumeEducationEntry = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
};

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("fullName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  summary: text("summary"),
  template: varchar("template", { length: 50 }).default("modern").notNull(),
  experience: jsonb("experience").$type<ResumeExperienceEntry[]>().default([]).notNull(),
  education: jsonb("education").$type<ResumeEducationEntry[]>().default([]).notNull(),
  skills: jsonb("skills").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ==========================================
// Community Posts
// ==========================================
export const communityPosts = pgTable(
  "community_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 300 }).notNull(),
    content: text("content").notNull(),
    category: postCategoryEnum("category").notNull(),
    anonymousId: varchar("anonymousId", { length: 50 }).notNull(),
    viewCount: integer("viewCount").default(0).notNull(),
    upvoteCount: integer("upvoteCount").default(0).notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    flagReasons: text("flagReasons"),
    deleted: boolean("deleted").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    // NEW (Phase 6): replaces the query-time stopgap mapping
    // (PILLAR_COMMUNITY_CATEGORIES in pillar-content.ts) with a real
    // column. Nullable — the four tone-only categories (venting,
    // advice_needed, success_stories, need_support_now) and
    // self_improvement have no single pillar, same reasoning as
    // categories.pillarId being left null for self-improvement in Phase
    // 0. `category` itself is untouched and still required at post
    // creation — this is additive, not a replacement for it. A full
    // postType/pillarId split (asking two separate questions at
    // creation) is real future scope, not part of this column.
    pillarId: integer("pillarId").references(() => pillars.id),
  },
  (table) => ({
    categoryIdx: index("community_posts_category_idx").on(table.category),
    createdAtIdx: index("community_posts_created_at_idx").on(table.createdAt),
    upvoteIdx: index("community_posts_upvote_idx").on(table.upvoteCount),
    flaggedIdx: index("community_posts_flagged_idx").on(table.flagged),
    pillarIdx: index("community_posts_pillar_idx").on(table.pillarId),
  })
);

// ==========================================
// Community Comments
// ==========================================
export const communityComments = pgTable(
  "community_comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("postId").notNull(),
    parentCommentId: integer("parentCommentId"),
    content: text("content").notNull(),
    anonymousId: varchar("anonymousId", { length: 50 }).notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    flagReasons: text("flagReasons"),
    deleted: boolean("deleted").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index("community_comments_post_id_idx").on(table.postId),
    parentIdx: index("community_comments_parent_idx").on(table.parentCommentId),
  })
);

// ==========================================
// Communication Messages
// ==========================================
export const communicationMessages = pgTable(
  "communication_messages",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    anonymousId: varchar("anonymousId", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    flagReasons: text("flagReasons"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("communication_messages_created_at_idx").on(table.createdAt),
    statusIdx: index("communication_messages_status_idx").on(table.status),
  })
);

// ==========================================
// Communication Replies
// ==========================================
export const communicationReplies = pgTable(
  "communication_replies",
  {
    id: serial("id").primaryKey(),
    messageId: integer("messageId").notNull(),
    content: text("content").notNull(),
    anonymousId: varchar("anonymousId", { length: 50 }).notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    flagReasons: text("flagReasons"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    messageIdIdx: index("communication_replies_message_id_idx").on(table.messageId),
  })
);

// ==========================================
// Community Reports
// ==========================================
export const communityReports = pgTable(
  "community_reports",
  {
    id: serial("id").primaryKey(),
    targetType: reportTargetEnum("targetType").notNull(),
    targetId: integer("targetId").notNull(),
    reason: varchar("reason", { length: 500 }).notNull(),
    resolved: boolean("resolved").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    targetIdx: index("community_reports_target_idx").on(table.targetType, table.targetId),
    resolvedIdx: index("community_reports_resolved_idx").on(table.resolved),
  })
);

// ==========================================
// Assessment tables
// ==========================================
export const assessmentQuestions = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  imageUrl: text("image_url"),
  opt1Text: text("opt1_text").notNull(),
  opt1Category: varchar("opt1_category", { length: 50 }).notNull(),
  opt2Text: text("opt2_text").notNull(),
  opt2Category: varchar("opt2_category", { length: 50 }).notNull(),
  opt3Text: text("opt3_text").notNull(),
  opt3Category: varchar("opt3_category", { length: 50 }).notNull(),
  opt4Text: text("opt4_text").notNull(),
  opt4Category: varchar("opt4_category", { length: 50 }).notNull(),
  active: boolean("active").default(true),
});

export const assessmentResults = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(),
  resultCategory: varchar("result_category", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const assessmentActionPlans = pgTable("assessment_action_plans", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  step1: text("step_1").notNull(),
  step2: text("step_2").notNull(),
  step3: text("step_3").notNull(),
});

// ==========================================
// NEW: Pillars
// ==========================================
// The four life-pillar taxonomy from the product principles (Intel /
// Toolkit / Challenge / Community / Career Hub / Small Wins all roll up
// to one of these). Deliberately mirrors `categories` in shape — the same
// admin CRUD pattern already proven by CategoryDialog.tsx will work here
// once a PillarDialog is built (not part of this phase; see
// MIGRATION_PLAN.md Phase 0, which is schema-only).
// Seeded with exactly 4 rows by supabase_migration_pillars.sql, which also
// backfills categories.pillarId and resources.pillarId below.
export const pillars = pgTable(
  "pillars",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    description: text("description"),
    color: varchar("color", { length: 50 }),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    slugIdx: index("pillars_slug_idx").on(table.slug),
  })
);

// ==========================================
// NEW: Categories
// ==========================================
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    description: text("description"),
    color: varchar("color", { length: 50 }),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow(),
    // NEW: which of the 4 pillars this category rolls up to. Nullable —
    // "self-improvement" is deliberately left unmapped on backfill (it's a
    // cross-cutting theme, not a single pillar; see MIGRATION_PLAN.md
    // Section 9 for the reasoning and the recommended alternative — tag
    // it via the existing tags/articleTags system instead).
    pillarId: integer("pillarId").references(() => pillars.id),
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
    pillarIdx: index("categories_pillar_idx").on(table.pillarId),
  })
);

// ==========================================
// NEW: Topics (pillar pages)
// ==========================================
export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("categoryId").references(() => categories.id),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    description: text("description"),
    overview: text("overview"),
    whyItMatters: text("whyItMatters"),
    keyAreas: jsonb("keyAreas").$type<Array<{ title: string; summary: string }>>(),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    slugIdx: index("topics_slug_idx").on(table.slug),
    categoryIdx: index("topics_category_idx").on(table.categoryId),
  })
);

// ==========================================
// NEW: Tags
// ==========================================
export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 50 }).unique().notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    slugIdx: index("tags_slug_idx").on(table.slug),
  })
);

// ==========================================
// NEW: Article Tags (junction)
// ==========================================
export const articleTags = pgTable(
  "article_tags",
  {
    articleId: integer("articleId")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: integer("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
    articleIdx: index("article_tags_article_idx").on(table.articleId),
    tagIdx: index("article_tags_tag_idx").on(table.tagId),
  })
);

// ==========================================
// Articles (UPDATED — 6 new columns added)
// ==========================================
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    status: varchar("status", { length: 50 }).default("published"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    // NEW: content platform fields
    categoryId: integer("categoryId").references(() => categories.id),
    topicId: integer("topicId").references(() => topics.id),
    featured: boolean("featured").default(false),
    featuredImage: text("featuredImage"),
    authorName: varchar("authorName", { length: 255 }).default("MenWhoFeel Core"),
    viewCount: integer("viewCount").default(0),
    // NEW: Intel CMS fields (admin/intel)
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    // When the article actually went/goes live. Null for drafts. Lets
    // "scheduled" articles go live on their own once this passes, and gives
    // an accurate publish date independent of createdAt for edited posts.
    publishedAt: timestamp("publishedAt", { withTimezone: true }),
    seoTitle: text("seoTitle"),
    metaDescription: text("metaDescription"),
    canonicalUrl: text("canonicalUrl"),
    ogImage: text("ogImage"),
    focusKeyword: varchar("focusKeyword", { length: 100 }),
    // Minutes. Auto-estimated from word count in the editor, but stored
    // (not computed on every public page view) and editable.
    readingTime: integer("readingTime"),
    // NEW (Phase 3): reuses the same difficultyEnum selfHelpGuides already
    // had (beginner/intermediate/advanced) rather than inventing a second
    // one. Nullable — not every article needs a difficulty rating; the
    // admin form treats it as optional.
    difficulty: difficultyEnum("difficulty"),
  },
  (table) => ({
    statusIdx: index("articles_status_idx").on(table.status),
  })
);

// ==========================================
// Announcements
// ==========================================
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("update"),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

// ==========================================
// Article Comments
// ==========================================
export const articleComments = pgTable("article_comments", {
  id: serial("id").primaryKey(),
  articleSlug: varchar("articleSlug", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 255 }).default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

// ==========================================
// Contact Messages (from the /contact page form)
// ==========================================
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).default("new").notNull(), // new | read | replied
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt),
    statusIdx: index("contact_messages_status_idx").on(table.status),
  })
);

// ==========================================
// Relations
// ==========================================

// Categories → Topics, Categories → Pillar
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  topics: many(topics),
  articles: many(articles),
  pillar: one(pillars, { fields: [categories.pillarId], references: [pillars.id] }),
}));

// Pillars → Categories, Pillars → Resources
export const pillarsRelations = relations(pillars, ({ many }) => ({
  categories: many(categories),
  resources: many(resources),
  selfHelpGuides: many(selfHelpGuides),
  stories: many(stories),
  communityPosts: many(communityPosts),
  journeys: many(journeys),
}));

// Journeys → Pillar, Journeys → Days, Journeys → Progress
export const journeysRelations = relations(journeys, ({ one, many }) => ({
  pillar: one(pillars, { fields: [journeys.pillarId], references: [pillars.id] }),
  days: many(journeyDays),
  progress: many(journeyProgress),
  responses: many(journeyResponses),
}));

export const journeyDaysRelations = relations(journeyDays, ({ one }) => ({
  journey: one(journeys, { fields: [journeyDays.journeyId], references: [journeys.id] }),
}));

export const journeyProgressRelations = relations(journeyProgress, ({ one }) => ({
  journey: one(journeys, { fields: [journeyProgress.journeyId], references: [journeys.id] }),
  user: one(users, { fields: [journeyProgress.userId], references: [users.id] }),
}));

export const journeyResponsesRelations = relations(journeyResponses, ({ one }) => ({
  journey: one(journeys, { fields: [journeyResponses.journeyId], references: [journeys.id] }),
  user: one(users, { fields: [journeyResponses.userId], references: [users.id] }),
}));

// Resources → Pillar, Resources → Topic
export const resourcesRelations = relations(resources, ({ one }) => ({
  pillar: one(pillars, { fields: [resources.pillarId], references: [pillars.id] }),
  topic: one(topics, { fields: [resources.topicId], references: [topics.id] }),
}));

// Self Help Guides → Pillar, Self Help Guides → Topic
export const selfHelpGuidesRelations = relations(selfHelpGuides, ({ one }) => ({
  pillar: one(pillars, { fields: [selfHelpGuides.pillarId], references: [pillars.id] }),
  topic: one(topics, { fields: [selfHelpGuides.topicId], references: [topics.id] }),
}));

// Topics → Articles, Topics → Categories, Topics → Resources, Topics → Self Help Guides, Topics → Stories
export const topicsRelations = relations(topics, ({ one, many }) => ({
  category: one(categories, { fields: [topics.categoryId], references: [categories.id] }),
  articles: many(articles),
  resources: many(resources),
  selfHelpGuides: many(selfHelpGuides),
  stories: many(stories),
}));

// Tags ↔ Articles (via articleTags)
export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, { fields: [articleTags.articleId], references: [articles.id] }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}));

// Articles → Categories, Topics, Tags, Comments
export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  topic: one(topics, { fields: [articles.topicId], references: [topics.id] }),
  tags: many(articleTags),
  comments: many(articleComments),
}));

export const articleCommentsRelations = relations(articleComments, ({ one }) => ({
  article: one(articles, { fields: [articleComments.articleSlug], references: [articles.slug] }),
}));

// Stories
export const storiesRelations = relations(stories, ({ one, many }) => ({
  comments: many(storyComments),
  pillar: one(pillars, { fields: [stories.pillarId], references: [pillars.id] }),
  topic: one(topics, { fields: [stories.topicId], references: [topics.id] }),
}));

export const storyCommentsRelations = relations(storyComments, ({ one }) => ({
  story: one(stories, { fields: [storyComments.storyId], references: [stories.id] }),
}));

// Challenges
export const challengesRelations = relations(challenges, ({ many }) => ({
  userProgress: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  challenge: one(challenges, { fields: [userChallenges.challengeId], references: [challenges.id] }),
}));

// The Forge
export const forgeProgressRelations = relations(forgeProgress, ({ one }) => ({
  user: one(users, { fields: [forgeProgress.userId], references: [users.id] }),
}));

export const challengeResponsesRelations = relations(challengeResponses, ({ one }) => ({
  user: one(users, { fields: [challengeResponses.userId], references: [users.id] }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
}));

// Community
export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  comments: many(communityComments),
  pillar: one(pillars, { fields: [communityPosts.pillarId], references: [pillars.id] }),
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
  post: one(communityPosts, { fields: [communityComments.postId], references: [communityPosts.id] }),
  replies: many(communityComments, { relationName: "comment_replies" }),
  parent: one(communityComments, {
    fields: [communityComments.parentCommentId],
    references: [communityComments.id],
    relationName: "comment_replies",
  }),
}));

export const communicationMessagesRelations = relations(communicationMessages, ({ many }) => ({
  replies: many(communicationReplies),
}));

export const communicationRepliesRelations = relations(communicationReplies, ({ one }) => ({
  message: one(communicationMessages, {
    fields: [communicationReplies.messageId],
    references: [communicationMessages.id],
  }),
}));

// ==========================================
// Automation v1
// ==========================================

export const automationJobStatusEnum = pgEnum("automation_job_status", [
  "pending",
  "running",
  "awaiting_review",
  "approved",
  "published",
  "failed",
  "cancelled",
]);

export const automationStageEnum = pgEnum("automation_stage", [
  "research",
  "writing",
  "seo",
  // NEW (Phase 8): resolves category + topic from the generated content
  // instead of always using automationSettings.defaultCategoryId. Sits
  // between seo and image in the pipeline — see pipeline.ts.
  "categorize",
  "image",
  "social",
  "complete",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "reddit",
  "x",
  "instagram",
  "youtube",
]);

export const socialDraftStatusEnum = pgEnum("social_draft_status", [
  "pending",
  "approved",
  "published",
  "failed",
  "skipped",
]);

export const automationJobs = pgTable(
  "automation_jobs",
  {
    id: serial("id").primaryKey(),
    topic: text("topic").notNull(),
    status: automationJobStatusEnum("status").default("pending").notNull(),
    stage: automationStageEnum("stage"),
    articleId: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
    research: jsonb("research"),
    writing: jsonb("writing"),
    seoData: jsonb("seo_data"),
    // NEW (Phase 8): stores what the categorize stage decided and why,
    // same observability pattern as research/writing/seoData above.
    categorization: jsonb("categorization"),
    imageData: jsonb("image_data"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("automation_jobs_status_idx").on(table.status),
    createdAtIdx: index("automation_jobs_created_at_idx").on(table.createdAt),
  })
);

export const automationLogs = pgTable(
  "automation_logs",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => automationJobs.id, { onDelete: "cascade" }),
    stage: varchar("stage", { length: 50 }).notNull(),
    level: varchar("level", { length: 10 }).default("info").notNull(),
    message: text("message").notNull(),
    payload: jsonb("payload"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("automation_logs_job_id_idx").on(table.jobId),
    createdAtIdx: index("automation_logs_created_at_idx").on(table.createdAt),
  })
);

export const automationSettings = pgTable("automation_settings", {
  id: integer("id").primaryKey().default(1),
  aiProvider: varchar("ai_provider", { length: 50 }).default("gemini").notNull(),
  imageProvider: varchar("image_provider", { length: 50 }).default("fal").notNull(),
  imageStyle: text("image_style")
    .default("photorealistic, editorial, men's wellness")
    .notNull(),
  defaultAuthor: varchar("default_author", { length: 255 })
    .default("MenWhoFeel Core")
    .notNull(),
  defaultCategoryId: integer("default_category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  redditEnabled: boolean("reddit_enabled").default(false).notNull(),
  redditSubreddits: text("reddit_subreddits").array().default([]).notNull(),
  xEnabled: boolean("x_enabled").default(false).notNull(),
  instagramEnabled: boolean("instagram_enabled").default(false).notNull(),
  defaultHashtags: text("default_hashtags").array().default([]).notNull(),
  researchPrompt: text("research_prompt"),
  writingPrompt: text("writing_prompt"),
  seoPrompt: text("seo_prompt"),
  // NEW (Phase 8): admin-editable, same pattern as the four prompts
  // above. defaultCategoryId above stops being the primary mechanism and
  // becomes the fallback for when this stage can't confidently match a
  // topic — see pipeline.ts.
  categorizePrompt: text("categorize_prompt"),
  socialPrompt: text("social_prompt"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const socialDrafts = pgTable(
  "social_drafts",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => automationJobs.id, { onDelete: "cascade" }),
    articleId: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
    platform: socialPlatformEnum("platform").notNull(),
    status: socialDraftStatusEnum("status").default("pending").notNull(),
    content: jsonb("content").notNull(),
    response: jsonb("response"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index("social_drafts_job_id_idx").on(table.jobId),
    statusIdx: index("social_drafts_status_idx").on(table.status),
  })
);

// ── Relations ────────────────────────────────────────────────────────────────

export const automationJobsRelations = relations(automationJobs, ({ one, many }) => ({
  article: one(articles, { fields: [automationJobs.articleId], references: [articles.id] }),
  logs: many(automationLogs),
  socialDrafts: many(socialDrafts),
}));

export const automationLogsRelations = relations(automationLogs, ({ one }) => ({
  job: one(automationJobs, { fields: [automationLogs.jobId], references: [automationJobs.id] }),
}));

export const socialDraftsRelations = relations(socialDrafts, ({ one }) => ({
  job: one(automationJobs, { fields: [socialDrafts.jobId], references: [automationJobs.id] }),
  article: one(articles, { fields: [socialDrafts.articleId], references: [articles.id] }),
}));

