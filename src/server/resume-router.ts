import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getResumeByUserId, upsertResume } from "./queries/resumes";
import { callAiJson } from "@/lib/automation/ai";

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().max(255),
  title: z.string().max(255),
  location: z.string().max(255).optional(),
  startDate: z.string().max(20),
  endDate: z.string().max(20).optional(),
  current: z.boolean(),
  bullets: z.array(z.string().max(500)).max(10),
});

const educationEntrySchema = z.object({
  id: z.string(),
  school: z.string().max(255),
  degree: z.string().max(255),
  field: z.string().max(255).optional(),
  startDate: z.string().max(20).optional(),
  endDate: z.string().max(20).optional(),
});

const resumeInputSchema = z.object({
  fullName: z.string().max(255).default(""),
  email: z.string().max(320).default(""),
  phone: z.string().max(50).default(""),
  city: z.string().max(100).default(""),
  state: z.string().max(100).default(""),
  summary: z.string().max(2000).default(""),
  template: z.enum(["modern", "classic", "minimal"]).default("modern"),
  experience: z.array(experienceEntrySchema).max(20).default([]),
  education: z.array(educationEntrySchema).max(10).default([]),
  skills: z.array(z.string().max(100)).max(50).default([]),
});

interface ImproveOutput {
  improved: string;
}

export const resumeRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    return getResumeByUserId(ctx.user.id);
  }),

  save: authedQuery.input(resumeInputSchema).mutation(async ({ ctx, input }) => {
    return upsertResume(ctx.user.id, input);
  }),

  // Interactive, not batch like the automation pipeline's AI calls —
  // called on-demand from the form as the user is typing, so this stays
  // deliberately small and fast: one short piece of text in, one back,
  // no research/writing/multi-stage pipeline involved.
  improveText: authedQuery
    .input(
      z.object({
        text: z.string().min(1).max(1000),
        // What kind of text this is, so the prompt can tailor its advice
        // — a resume bullet needs different guidance than a summary.
        fieldType: z.enum(["summary", "bullet"]),
      })
    )
    .mutation(async ({ input }) => {
      const guidance =
        input.fieldType === "bullet"
          ? "This is one bullet point under a job in a resume. Rewrite it to lead with a strong action verb, be concrete and specific, and quantify the result if the original implies a number without stating one. Keep it to one line."
          : "This is a resume's professional summary (2-3 sentences). Rewrite it to be concise, specific, and free of generic filler like 'hard-working team player.'";

      try {
        const { data } = await callAiJson<ImproveOutput>({
          system:
            "You are a career coach helping a job seeker improve their resume wording. You never invent facts, numbers, employers, or achievements that aren't in what they gave you — you only sharpen the phrasing of what's already there.",
          prompt: `${guidance}\n\nOriginal: "${input.text}"\n\nRespond with JSON matching this exact shape: { "improved": "the rewritten text" }`,
          maxTokens: 200,
        });
        return { improved: data.improved || input.text };
      } catch (err) {
        console.error("[resume-router] improveText failed:", err);
        // Fail soft — the user's original text is still there in the
        // form either way, this just means the "Improve" button didn't
        // do anything this time rather than the whole save breaking.
        return { improved: input.text };
      }
    }),
});
