import { authRouter } from "./auth-router";
import { storiesRouter } from "./stories-router";
import { challengesRouter } from "./challenges-router";
import { chatRouter } from "./chat-router";
import { assessmentRouter } from "./assessment-router";
import { guidesRouter } from "./guides-router";
import { helplinesRouter } from "./helplines-router";
import { intelRouter } from "./intel-router";
import { announcementsRouter } from "./announcements-router"; // <-- 1. IMPORT
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  stories: storiesRouter,
  challenges: challengesRouter,
  chat: chatRouter,
  assessment: assessmentRouter,
  guides: guidesRouter,
  helplines: helplinesRouter,
  intel: intelRouter,
  announcements: announcementsRouter, // <-- 2. WIRE IT IN
});

export type AppRouter = typeof appRouter;