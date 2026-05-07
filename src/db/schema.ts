import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  integer,
  boolean,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// PostgreSQL Enums (Must be declared first)
// ==========================================
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const challengeCategoryEnum = pgEnum("challenge_category", ["daily", "weekly", "monthly"]);
export const challengeTypeEnum = pgEnum("challenge_type", ["exercise", "habit", "meditation", "discipline", "spot_check"]);
export const assessmentCategoryEnum = pgEnum("assessment_category", ["thriving", "stable", "mild_distress", "moderate_distress", "severe_distress"]);
export const guideCategoryEnum = pgEnum("guide_category", ["overcoming_crisis", "daily_improvement", "skill_building", "emotional_regulation", "relationships", "productivity", "physical_health"]);
export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);

// ==========================================
// Users (auth system)
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==========================================
// Stories (blog posts with moderation)
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
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

// ==========================================
// Story Comments (with moderation)
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

export type StoryComment = typeof storyComments.$inferSelect;
export type InsertStoryComment = typeof storyComments.$inferInsert;

// ==========================================
// Challenges (daily/weekly/monthly)
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
    dayOfWeek: integer("dayOfWeek"), // 0-6 for weekly, null for others
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    activeIdx: index("active_idx").on(table.active),
  })
);

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ==========================================
// User Challenge Progress
// ==========================================
export const userChallenges = pgTable(
  "user_challenges",
  {
    id: serial("id").primaryKey(),
    challengeId: bigint("challengeId", { mode: "number" }).notNull(),
    userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(), // anonymous or userId
    completed: boolean("completed").default(false).notNull(),
    notes: text("notes"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userChallengeIdx: index("user_challenge_idx").on(table.userIdentifier, table.challengeId),
  })
);

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// ==========================================
// Chat Messages (community live chat)
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

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ==========================================
// Mental Health Assessments
// ==========================================
export const assessments = pgTable(
  "assessments",
  {
    id: serial("id").primaryKey(),
    userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(),
    answers: text("answers").notNull(), // JSON string of answers
    score: integer("score").notNull(),
    category: assessmentCategoryEnum("category").notNull(),
    recommendations: text("recommendations").notNull(), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdentifierIdx: index("user_identifier_idx").on(table.userIdentifier),
  })
);

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

// ==========================================
// Self Help Guides (study materials)
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
  },
  (table) => ({
    categoryIdx: index("guide_category_idx").on(table.category),
  })
);

export type SelfHelpGuide = typeof selfHelpGuides.$inferSelect;
export type InsertSelfHelpGuide = typeof selfHelpGuides.$inferInsert;

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

export type Helpline = typeof helplines.$inferSelect;
export type InsertHelpline = typeof helplines.$inferInsert;

// ==========================================
// Relations
// ==========================================
export const storiesRelations = relations(stories, ({ many }) => ({
  comments: many(storyComments),
}));

export const storyCommentsRelations = relations(storyComments, ({ one }) => ({
  story: one(stories, { fields: [storyComments.storyId], references: [stories.id] }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userProgress: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  challenge: one(challenges, { fields: [userChallenges.challengeId], references: [challenges.id] }),
}));

// ==========================================
// User Progress (The Forge)
// ==========================================
export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(), // Tied to your Auth user
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  nextLevelXp: integer("next_level_xp").default(100).notNull(),
  rank: text("rank").default("Initiate").notNull(),
  currentDailyId: integer("current_daily_id").default(1).notNull(),
  completedWeeklies: integer("completed_weeklies").array().default([]).notNull(),
  lastCompletedAt: timestamp("last_daily_completed_at", { withTimezone: true }),
});