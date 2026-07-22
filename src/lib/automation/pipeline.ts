"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  automationJobs,
  automationSettings,
  articles,
  articleTags,
  tags,
  socialDrafts,
  categories,
  topics,
} from "@/db/schema";
import { callAiJson } from "./ai";
import { makeLogger } from "./logger";
import { generateArticleImage } from "./image";
import {
  DEFAULT_RESEARCH_PROMPT,
  DEFAULT_WRITING_PROMPT,
  DEFAULT_SEO_PROMPT,
  DEFAULT_CATEGORIZE_PROMPT,
  DEFAULT_SOCIAL_PROMPT,
  interpolate,
} from "./prompts";
import { slugify } from "@/lib/slug";
import { estimateReadingTime } from "@/lib/admin/reading-time";

// ─── Type shapes returned by each AI stage ───────────────────────────────────

interface ResearchOutput {
  angle: string;
  keyPoints: string[];
  targetAudience: string;
  emotionalHook: string;
  commonMisconceptions: string[];
  practicalTakeaways: string[];
  relatedTopics: string[];
  searchIntent: string;
}

interface WritingOutput {
  title: string;
  excerpt: string;
  content: string;
  readingTimeMinutes: number;
  suggestedTags: string[];
  internalLinkSuggestions: string[];
}

interface SeoOutput {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  slug: string;
  ogTitle: string;
  ogDescription: string;
  imageAltText: string;
  canonicalUrl: string;
}

interface CategorizeOutput {
  matchedTopicSlug: string | null;
  reasoning: string;
}

interface SocialOutput {
  reddit: {
    title: string;
    body: string;
    suggestedSubreddits: string[];
  };
  x: {
    post: string;
    thread: string[];
    hashtags: string[];
  };
  instagram: {
    caption: string;
    hashtags: string[];
    carouselSlides: string[];
    reelCaption: string;
  };
  youtube: {
    title: string;
    description: string;
    tags: string[];
    thumbnailPrompt: string;
    chapterSuggestions: string[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getSettings() {
  const [row] = await db.select().from(automationSettings).where(eq(automationSettings.id, 1));
  return row;
}

async function setStage(
  jobId: number,
  stage: typeof automationJobs.$inferInsert.stage
) {
  await db
    .update(automationJobs)
    .set({ stage, status: "running" })
    .where(eq(automationJobs.id, jobId));
}

async function setFailed(jobId: number, error: string) {
  await db
    .update(automationJobs)
    .set({ status: "failed", error, finishedAt: new Date() })
    .where(eq(automationJobs.id, jobId));
}

/** Ensures the slug is unique — appends a counter suffix if needed. */
async function uniqueSlug(base: string): Promise<string> {
  const safe = slugify(base).slice(0, 190) || "article";
  const [existing] = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.slug, safe))
    .limit(1);
  if (!existing) return safe;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${safe}-${i}`;
    const [dup] = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, candidate))
      .limit(1);
    if (!dup) return candidate;
  }
  return `${safe}-${Date.now()}`;
}

/** Looks up or creates tags by name, returns their IDs. */
async function upsertTagsByName(tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const raw of tagNames) {
    const name = raw.trim().slice(0, 50);
    if (!name) continue;
    const slug = slugify(name).slice(0, 50) || `tag-${Date.now()}`;
    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);
    if (existing) {
      ids.push(existing.id);
    } else {
      const [inserted] = await db
        .insert(tags)
        .values({ name, slug })
        .returning({ id: tags.id });
      ids.push(inserted.id);
    }
  }
  return ids;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runAutomationPipeline(jobId: number): Promise<void> {
  const logger = makeLogger(jobId, "pipeline");
  await logger.info(`Pipeline started for job ${jobId}`);

  // ── Load job + settings ────────────────────────────────────────────────────
  const [job] = await db
    .select()
    .from(automationJobs)
    .where(eq(automationJobs.id, jobId));
  if (!job) {
    console.error(`[automation/pipeline] Job ${jobId} not found`);
    return;
  }

  const settings = await getSettings();

  // ── STAGE 1: Research ──────────────────────────────────────────────────────
  let research: ResearchOutput | null = null;
  try {
    await setStage(jobId, "research");
    const stageLogger = makeLogger(jobId, "research");
    await stageLogger.info(`Researching topic: "${job.topic}"`);

    const template = settings?.researchPrompt ?? DEFAULT_RESEARCH_PROMPT;
    const prompt = interpolate(template, { topic: job.topic });

    const { data, durationMs } = await callAiJson<ResearchOutput>({
      system: "You are a research specialist for a men's emotional wellbeing platform.",
      prompt,
    });
    research = data;

    await db
      .update(automationJobs)
      .set({ research: research as unknown as Record<string, unknown> })
      .where(eq(automationJobs.id, jobId));

    await stageLogger.timed(`Research complete via Gemini`, durationMs, {
      angle: research.angle,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "research").error(`Research failed: ${msg}`);
    await setFailed(jobId, `Research stage failed: ${msg}`);
    return;
  }

  // ── STAGE 2: Writing ───────────────────────────────────────────────────────
  let writing: WritingOutput | null = null;
  try {
    await setStage(jobId, "writing");
    const stageLogger = makeLogger(jobId, "writing");
    await stageLogger.info("Generating article content");

    const template = settings?.writingPrompt ?? DEFAULT_WRITING_PROMPT;
    const prompt = interpolate(template, {
      research: JSON.stringify(research, null, 2),
    });

    const { data, durationMs } = await callAiJson<WritingOutput>({
      system: "You are the lead writer for a men's emotional wellbeing platform.",
      prompt,
      maxTokens: 8192,
    });
    writing = data;

    await db
      .update(automationJobs)
      .set({ writing: writing as unknown as Record<string, unknown> })
      .where(eq(automationJobs.id, jobId));

    await stageLogger.timed(`Writing complete via Gemini`, durationMs, {
      title: writing.title,
      wordCount: writing.content.split(/\s+/).length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "writing").error(`Writing failed: ${msg}`);
    await setFailed(jobId, `Writing stage failed: ${msg}`);
    return;
  }

  // ── STAGE 3: SEO ───────────────────────────────────────────────────────────
  let seo: SeoOutput | null = null;
  try {
    await setStage(jobId, "seo");
    const stageLogger = makeLogger(jobId, "seo");
    await stageLogger.info("Generating SEO metadata");

    const template = settings?.seoPrompt ?? DEFAULT_SEO_PROMPT;
    const contentPreview = writing.content.slice(0, 500);
    const prompt = interpolate(template, {
      title: writing.title,
      excerpt: writing.excerpt,
      contentPreview,
      slug: slugify(writing.title),
    });

    const { data, durationMs } = await callAiJson<SeoOutput>({
      system: "You are an SEO specialist for a men's wellbeing content platform.",
      prompt,
    });
    seo = data;

    // Ensure the slug is URL-safe and unique
    seo.slug = await uniqueSlug(seo.slug || writing.title);
    seo.canonicalUrl = `https://www.menwhofeel.online/intel/${seo.slug}`;

    await db
      .update(automationJobs)
      .set({ seoData: seo as unknown as Record<string, unknown> })
      .where(eq(automationJobs.id, jobId));

    await stageLogger.timed(`SEO complete via Gemini`, durationMs, {
      slug: seo.slug,
      focusKeyword: seo.focusKeyword,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "seo").error(`SEO failed: ${msg}`);
    await setFailed(jobId, `SEO stage failed: ${msg}`);
    return;
  }

  // ── STAGE 3b: Categorize ───────────────────────────────────────────────────
  // Resolves categoryId + topicId from the actual generated content instead
  // of always using automationSettings.defaultCategoryId. Non-fatal, same
  // posture as image/social below: if this stage fails or can't find a
  // confident match, the pipeline falls back to exactly the behavior every
  // article had before this stage existed — defaultCategoryId, no topic.
  let resolvedCategoryId: number | null = settings?.defaultCategoryId ?? null;
  let resolvedTopicId: number | null = null;
  try {
    await setStage(jobId, "categorize");
    const stageLogger = makeLogger(jobId, "categorize");
    await stageLogger.info("Matching article to a category/topic");

    const topicRows = await db
      .select({
        topicId: topics.id,
        topicSlug: topics.slug,
        topicName: topics.name,
        topicDescription: topics.description,
        categoryId: topics.categoryId,
        categoryName: categories.name,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id));

    if (topicRows.length === 0) {
      await stageLogger.warn("No topics found in the database — using default category");
    } else {
      const topicOptions = topicRows
        .map(
          (t) =>
            `${t.categoryName ?? "Uncategorized"} > ${t.topicName} — ${t.topicDescription ?? "no description"} [slug: ${t.topicSlug}]`
        )
        .join("\n");

      const template = settings?.categorizePrompt ?? DEFAULT_CATEGORIZE_PROMPT;
      const prompt = interpolate(template, {
        title: writing.title,
        excerpt: writing.excerpt,
        angle: research.angle,
        topicOptions,
      });

      const { data: categorization, durationMs } = await callAiJson<CategorizeOutput>({
        system: "You are a content taxonomist for a men's emotional wellbeing platform.",
        prompt,
      });

      const matched = categorization.matchedTopicSlug
        ? topicRows.find((t) => t.topicSlug === categorization.matchedTopicSlug)
        : undefined;

      if (matched) {
        resolvedCategoryId = matched.categoryId;
        resolvedTopicId = matched.topicId;
      } else {
        await stageLogger.warn(
          `No confident topic match ("${categorization.reasoning}") — using default category`
        );
      }

      await db
        .update(automationJobs)
        .set({
          categorization: {
            ...categorization,
            resolvedCategoryId,
            resolvedTopicId,
          } as unknown as Record<string, unknown>,
        })
        .where(eq(automationJobs.id, jobId));

      await stageLogger.timed(`Categorize complete via Gemini`, durationMs, {
        matchedTopicSlug: categorization.matchedTopicSlug,
        reasoning: categorization.reasoning,
      });
    }
  } catch (err) {
    // Non-fatal — resolvedCategoryId already defaults to
    // settings.defaultCategoryId, same as every article got before this
    // stage existed.
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "categorize").warn(`Categorize failed (non-fatal): ${msg}`);
  }

  // ── STAGE 4: Image ─────────────────────────────────────────────────────────
  let featuredImageUrl: string | null = null;
  try {
    await setStage(jobId, "image");
    const stageLogger = makeLogger(jobId, "image");

    const imageProvider = settings?.imageProvider ?? "fal";
    if (imageProvider === "none") {
      await stageLogger.info("Image generation disabled in settings — skipping");
    } else {
      await stageLogger.info("Generating featured image");
      const imageStyle = settings?.imageStyle ?? "photorealistic, editorial, men's wellness";
      const imagePrompt = `${imageStyle}. Article topic: ${job.topic}. ${seo.imageAltText ?? ""}`.trim();

      const start = Date.now();
      featuredImageUrl = await generateArticleImage(imagePrompt);
      const durationMs = Date.now() - start;

      await db
        .update(automationJobs)
        .set({
          imageData: {
            url: featuredImageUrl,
            prompt: imagePrompt,
            altText: seo.imageAltText,
          } as unknown as Record<string, unknown>,
        })
        .where(eq(automationJobs.id, jobId));

      await stageLogger.timed("Image generated", durationMs, {
        url: featuredImageUrl,
      });
    }
  } catch (err) {
    // Image failure is non-fatal — article can still be saved without one
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "image").warn(
      `Image generation failed (non-fatal): ${msg}`
    );
  }

  // ── Save draft to Intel CMS ─────────────────────────────────────────────────
  let articleId: number | null = null;
  try {
    const stageLogger = makeLogger(jobId, "save-draft");
    await stageLogger.info("Saving draft to Intel CMS");

    const wordCount = writing.content.split(/\s+/).filter(Boolean).length;
    const readingTime =
      typeof writing.readingTimeMinutes === "number" && writing.readingTimeMinutes > 0
        ? writing.readingTimeMinutes
        : estimateReadingTime(wordCount);

    // Category + topic resolved by the categorize stage above (falls back
    // to settings.defaultCategoryId / null if that stage found no
    // confident match or failed) — this is the one line that changed from
    // every article always getting the same fixed default.
    const categoryId = resolvedCategoryId;
    const topicId = resolvedTopicId;

    const [inserted] = await db
      .insert(articles)
      .values({
        slug: seo.slug,
        title: writing.title,
        excerpt: writing.excerpt,
        content: writing.content,
        status: "draft",
        categoryId,
        topicId,
        featuredImage: featuredImageUrl,
        authorName: settings?.defaultAuthor ?? "MenWhoFeel Core",
        readingTime,
        seoTitle: seo.seoTitle,
        metaDescription: seo.metaDescription,
        canonicalUrl: seo.canonicalUrl,
        ogImage: featuredImageUrl,
        focusKeyword: seo.focusKeyword,
      })
      .returning({ id: articles.id });

    articleId = inserted.id;

    // Attach tags
    if (writing.suggestedTags?.length) {
      const tagIds = await upsertTagsByName(writing.suggestedTags);
      if (tagIds.length > 0) {
        await db
          .insert(articleTags)
          .values(tagIds.map((tagId) => ({ articleId: articleId!, tagId })));
      }
    }

    await db
      .update(automationJobs)
      .set({ articleId })
      .where(eq(automationJobs.id, jobId));

    await stageLogger.info(`Draft saved: article #${articleId} (slug: ${seo.slug})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "save-draft").error(`Failed to save draft: ${msg}`);
    await setFailed(jobId, `Save draft failed: ${msg}`);
    return;
  }

  // ── STAGE 5: Social content ─────────────────────────────────────────────────
  try {
    await setStage(jobId, "social");
    const stageLogger = makeLogger(jobId, "social");
    await stageLogger.info("Generating social content");

    const template = settings?.socialPrompt ?? DEFAULT_SOCIAL_PROMPT;
    const url = `https://www.menwhofeel.online/intel/${seo.slug}`;
    const prompt = interpolate(template, {
      title: writing.title,
      excerpt: writing.excerpt,
      focusKeyword: seo.focusKeyword,
      url,
    });

    const { data: social, durationMs } = await callAiJson<SocialOutput>({
      system: "You are the social media manager for a men's emotional wellbeing platform.",
      prompt,
    });

    // Merge admin's default subreddits into Reddit suggestions
    const defaultSubs = settings?.redditSubreddits ?? [];
    const allSubs = [
      ...new Set([...(social.reddit.suggestedSubreddits ?? []), ...defaultSubs]),
    ];
    social.reddit.suggestedSubreddits = allSubs;

    // Merge default hashtags into X and Instagram
    const defaultTags = settings?.defaultHashtags ?? [];
    social.x.hashtags = [...new Set([...(social.x.hashtags ?? []), ...defaultTags])];
    social.instagram.hashtags = [
      ...new Set([...(social.instagram.hashtags ?? []), ...defaultTags]),
    ];

    // Store social drafts — one row per platform, all set to "pending"
    // (admin must explicitly approve before anything is published)
    const platforms = ["reddit", "x", "instagram", "youtube"] as const;
    for (const platform of platforms) {
      await db.insert(socialDrafts).values({
        jobId,
        articleId: articleId!,
        platform,
        status: "pending",
        content: (social[platform] ?? {}) as unknown as Record<string, unknown>,
      });
    }

    await stageLogger.timed(`Social content generated via Gemini`, durationMs);
  } catch (err) {
    // Social failure is non-fatal
    const msg = err instanceof Error ? err.message : String(err);
    await makeLogger(jobId, "social").warn(
      `Social generation failed (non-fatal): ${msg}`
    );
  }

  // ── Complete ────────────────────────────────────────────────────────────────
  await db
    .update(automationJobs)
    .set({ status: "awaiting_review", stage: "complete", finishedAt: new Date() })
    .where(eq(automationJobs.id, jobId));

  await logger.info(
    `Pipeline complete. Article #${articleId} is a draft awaiting admin review.`
  );
}