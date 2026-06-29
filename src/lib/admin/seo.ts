export interface SeoCheckInput {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  focusKeyword?: string | null;
}

export interface SeoWarning {
  id: string;
  severity: "warning" | "info";
  message: string;
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/**
 * Read-only guidance only — this never rewrites anything, it just flags
 * things worth the admin's attention before publishing.
 */
export function getSeoWarnings(input: SeoCheckInput): SeoWarning[] {
  const warnings: SeoWarning[] = [];
  const effectiveTitle = (input.seoTitle?.trim() || input.title || "").trim();
  const effectiveDescription = (input.metaDescription?.trim() || input.excerpt || "").trim();

  if (!input.metaDescription?.trim()) {
    warnings.push({
      id: "missing-meta-description",
      severity: "info",
      message: "No meta description set — search results will fall back to the excerpt.",
    });
  } else if (input.metaDescription.length > DESCRIPTION_MAX) {
    warnings.push({
      id: "description-too-long",
      severity: "warning",
      message: `Meta description is ${input.metaDescription.length} characters — Google typically cuts it off around ${DESCRIPTION_MAX}.`,
    });
  }

  if (!input.featuredImage) {
    warnings.push({
      id: "missing-featured-image",
      severity: "warning",
      message: "No featured image — the article card and social shares will show a blank thumbnail.",
    });
  }

  if (effectiveTitle.length > TITLE_MAX) {
    warnings.push({
      id: "title-too-long",
      severity: "warning",
      message: `Title is ${effectiveTitle.length} characters — over ~${TITLE_MAX} gets truncated in search results.`,
    });
  }

  if (!input.focusKeyword?.trim()) {
    warnings.push({
      id: "missing-focus-keyword",
      severity: "info",
      message: "No focus keyword set — pick one to check it against the title and description.",
    });
  } else {
    const keyword = input.focusKeyword.trim().toLowerCase();
    if (!effectiveTitle.toLowerCase().includes(keyword)) {
      warnings.push({
        id: "keyword-missing-title",
        severity: "warning",
        message: `Focus keyword "${input.focusKeyword}" doesn't appear in the title.`,
      });
    }
    if (!effectiveDescription.toLowerCase().includes(keyword)) {
      warnings.push({
        id: "keyword-missing-description",
        severity: "warning",
        message: `Focus keyword "${input.focusKeyword}" doesn't appear in the meta description.`,
      });
    }
  }

  if (input.slug.length < 3 || /^\d+$/.test(input.slug)) {
    warnings.push({
      id: "slug-not-optimized",
      severity: "warning",
      message: "Slug is very short or just numbers — use a few descriptive words instead.",
    });
  } else if (input.slug.split("-").filter(Boolean).length > 8) {
    warnings.push({
      id: "slug-too-long",
      severity: "info",
      message: "Slug has a lot of words — shorter, focused slugs tend to perform better.",
    });
  }

  return warnings;
}
