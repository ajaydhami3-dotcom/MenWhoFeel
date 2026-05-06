import { relations } from "drizzle-orm";
import { stories, storyComments, challenges, userChallenges } from "./schema";

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
