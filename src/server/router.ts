import { authRouter } from "./auth-router";
import { storiesRouter } from "./stories-router";
import { challengesRouter } from "./challenges-router";
import { forgeRouter } from "./forge-router";
import { journeysRouter } from "./journeys-router";
import { resumeRouter } from "./resume-router";
import { chatRouter } from "./chat-router";
import { assessmentRouter } from "./assessment-router";
import { guidesRouter } from "./guides-router";
import { helplinesRouter } from "./helplines-router";
import { intelRouter } from "./intel-router";
import { announcementsRouter } from "./announcements-router";
import { communityRouter } from "./community-router";
import { communicationRouter } from "./communication-router";
import { moderationRouter } from "./moderation-router";
import { contactRouter } from "./contact-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  stories: storiesRouter,
  challenges: challengesRouter,
  forge: forgeRouter,
  journeys: journeysRouter,
  resume: resumeRouter,
  chat: chatRouter,
  assessment: assessmentRouter,
  guides: guidesRouter,
  helplines: helplinesRouter,
  intel: intelRouter,
  announcements: announcementsRouter,
  community: communityRouter,
  communication: communicationRouter,
  moderation: moderationRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
