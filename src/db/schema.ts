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
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
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
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    activeIdx: index("active_idx").on(table.active),
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
  },
  (table) => ({
    categoryIdx: index("guide_category_idx").on(table.category),
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
  },
  (table) => ({
    categoryIdx: index("resource_category_idx").on(table.category),
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
  },
  (table) => ({
    categoryIdx: index("community_posts_category_idx").on(table.category),
    createdAtIdx: index("community_posts_created_at_idx").on(table.createdAt),
    upvoteIdx: index("community_posts_upvote_idx").on(table.upvoteCount),
    flaggedIdx: index("community_posts_flagged_idx").on(table.flagged),
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
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
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
export const articles = pgTable("articles", {
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
});

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

// Categories → Topics
export const categoriesRelations = relations(categories, ({ many }) => ({
  topics: many(topics),
  articles: many(articles),
}));

// Topics → Articles, Topics → Categories
export const topicsRelations = relations(topics, ({ one, many }) => ({
  category: one(categories, { fields: [topics.categoryId], references: [categories.id] }),
  articles: many(articles),
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
export const storiesRelations = relations(stories, ({ many }) => ({
  comments: many(storyComments),
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

// Community
export const communityPostsRelations = relations(communityPosts, ({ many }) => ({
  comments: many(communityComments),
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
