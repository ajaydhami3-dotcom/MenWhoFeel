"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Loader2, Clock, RotateCcw } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";

import { ContentEditor } from "./ContentEditor";
import { FeaturedImageField } from "./FeaturedImageField";
import { SeoPanel } from "./SeoPanel";
import { SeoAssistant } from "./SeoAssistant";
import { DeleteArticleDialog } from "./DeleteArticleDialog";
import { slugify } from "@/lib/slug";
import { estimateReadingTime } from "@/lib/admin/reading-time";
import { saveArticleAction, autosaveArticleAction, type ArticleStatus } from "./actions";

export interface ArticleFormInitial {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  topicId: number | null;
  featuredImage: string | null;
  authorName: string | null;
  readingTime: number | null;
  status: string | null;
  publishedAt: Date | string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  focusKeyword: string | null;
}

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  content: string;
  wordCount: number;
  categoryId: number | null;
  topicId: number | null;
  tagNames: string[];
  featuredImage: string | null;
  authorName: string;
  readingTime: number | null;
  readingTimeTouched: boolean;
  status: ArticleStatus;
  publishedAt: string; // datetime-local value
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string | null;
  focusKeyword: string;
}

function toDatetimeLocal(value: Date | string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildInitialState(
  article: ArticleFormInitial | null,
  initialTagNames: string[],
  defaultAuthorName: string
): FormState {
  if (!article) {
    return {
      title: "",
      slug: "",
      slugTouched: false,
      excerpt: "",
      content: "",
      wordCount: 0,
      categoryId: null,
      topicId: null,
      tagNames: [],
      featuredImage: null,
      authorName: defaultAuthorName,
      readingTime: null,
      readingTimeTouched: false,
      status: "draft",
      publishedAt: "",
      seoTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogImage: null,
      focusKeyword: "",
    };
  }
  return {
    title: article.title,
    slug: article.slug,
    slugTouched: true,
    excerpt: article.excerpt,
    content: article.content,
    wordCount: article.content.trim().split(/\s+/).filter(Boolean).length,
    categoryId: article.categoryId,
    topicId: article.topicId,
    tagNames: initialTagNames,
    featuredImage: article.featuredImage,
    authorName: article.authorName ?? defaultAuthorName,
    readingTime: article.readingTime,
    readingTimeTouched: article.readingTime != null,
    status: (article.status as ArticleStatus) ?? "draft",
    publishedAt: toDatetimeLocal(article.publishedAt),
    seoTitle: article.seoTitle ?? "",
    metaDescription: article.metaDescription ?? "",
    canonicalUrl: article.canonicalUrl ?? "",
    ogImage: article.ogImage,
    focusKeyword: article.focusKeyword ?? "",
  };
}

export function ArticleForm({
  article,
  categories,
  topics,
  allTagNames,
  initialTagNames,
  defaultAuthorName,
}: {
  article: ArticleFormInitial | null;
  categories: { id: number; name: string }[];
  topics: { id: number; name: string; categoryId: number | null }[];
  allTagNames: string[];
  initialTagNames: string[];
  defaultAuthorName: string;
}) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<number | null>(article?.id ?? null);
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(article, initialTagNames, defaultAuthorName)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    setIsDirty(true);
  }, []);

  // ── Slug auto-generation ────────────────────────────────────────────────
  function handleTitleChange(title: string) {
    setState((s) => ({
      ...s,
      title,
      slug: s.slugTouched ? s.slug : slugify(title),
    }));
    setIsDirty(true);
  }

  // ── Cascading topic list ────────────────────────────────────────────────
  const availableTopics = useMemo(
    () => topics.filter((t) => !state.categoryId || t.categoryId === state.categoryId),
    [topics, state.categoryId]
  );

  function handleCategoryChange(value: string) {
    const categoryId = value === "none" ? null : Number(value);
    setState((s) => ({
      ...s,
      categoryId,
      topicId: s.topicId && topics.find((t) => t.id === s.topicId)?.categoryId === categoryId ? s.topicId : null,
    }));
    setIsDirty(true);
  }

  // ── Tags ─────────────────────────────────────────────────────────────────
  function addTag(raw: string) {
    const name = raw.trim();
    if (!name || state.tagNames.some((t) => t.toLowerCase() === name.toLowerCase())) {
      setTagInput("");
      return;
    }
    update("tagNames", [...state.tagNames, name]);
    setTagInput("");
  }
  function removeTag(name: string) {
    update("tagNames", state.tagNames.filter((t) => t !== name));
  }

  // ── Reading time ─────────────────────────────────────────────────────────
  const estimatedReadingTime = estimateReadingTime(state.wordCount);
  function handleContentChange(text: string, wordCount: number) {
    setState((s) => ({
      ...s,
      content: text,
      wordCount,
      readingTime: s.readingTimeTouched ? s.readingTime : estimateReadingTime(wordCount),
    }));
    setIsDirty(true);
  }

  // ── Unsaved-work protection ──────────────────────────────────────────────
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Autosave (drafts only — see actions.ts) ─────────────────────────────
  const stateRef = useRef(state);
  stateRef.current = state;
  const articleIdRef = useRef(articleId);
  articleIdRef.current = articleId;

  useEffect(() => {
    if (state.status !== "draft") return; // never autosaves over published/scheduled content
    const interval = setInterval(async () => {
      const s = stateRef.current;
      if (!isDirty) return;
      if (!s.title.trim() && !s.content.trim()) return; // nothing worth saving yet

      const result = await autosaveArticleAction({
        id: articleIdRef.current ?? undefined,
        title: s.title,
        slug: s.slug,
        excerpt: s.excerpt,
        content: s.content,
        categoryId: s.categoryId,
        topicId: s.topicId,
        featuredImage: s.featuredImage,
        authorName: s.authorName,
        readingTime: s.readingTime,
        seoTitle: s.seoTitle,
        metaDescription: s.metaDescription,
        canonicalUrl: s.canonicalUrl,
        ogImage: s.ogImage,
        focusKeyword: s.focusKeyword,
      });

      if (result.success) {
        setLastSavedAt(new Date());
        setIsDirty(false);
        if (!articleIdRef.current) {
          setArticleId(result.id);
          router.replace(`/admin/intel/${result.id}`, { scroll: false });
        }
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [state.status, isDirty, router]);

  // ── Save / Publish / Update ─────────────────────────────────────────────
  async function submit(forcedStatus?: ArticleStatus) {
    setIsSaving(true);
    setFieldErrors({});
    const statusToSave = forcedStatus ?? state.status;

    const result = await saveArticleAction({
      id: articleId ?? undefined,
      title: state.title,
      slug: state.slug,
      excerpt: state.excerpt,
      content: state.content,
      categoryId: state.categoryId,
      topicId: state.topicId,
      tagNames: state.tagNames,
      featuredImage: state.featuredImage,
      authorName: state.authorName,
      readingTime: state.readingTime,
      status: statusToSave,
      publishedAt: state.publishedAt ? new Date(state.publishedAt).toISOString() : null,
      seoTitle: state.seoTitle,
      metaDescription: state.metaDescription,
      canonicalUrl: state.canonicalUrl,
      ogImage: state.ogImage,
      focusKeyword: state.focusKeyword,
    });

    setIsSaving(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }

    setIsDirty(false);
    setLastSavedAt(new Date());
    if (forcedStatus) setState((s) => ({ ...s, status: forcedStatus }));

    const verb = statusToSave === "published" ? "Published" : statusToSave === "scheduled" ? "Scheduled" : "Saved";
    toast.success(`${verb} "${result.slug}".`);

    if (!articleId) {
      setArticleId(result.id);
      router.replace(`/admin/intel/${result.id}`);
    } else if (result.slug !== state.slug) {
      setState((s) => ({ ...s, slug: result.slug }));
    }
  }

  // ── Keyboard shortcut: Cmd/Ctrl+S ────────────────────────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submit();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, articleId]);

  const primaryLabel = (() => {
    if (state.status === "draft") return "Save draft";
    if (state.status === "scheduled") return articleId ? "Update schedule" : "Schedule";
    return articleId ? "Update" : "Publish";
  })();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{article ? "Edit article" : "New article"}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : lastSavedAt ? (
              <>
                <Clock className="size-3.5" /> Saved {lastSavedAt.toLocaleTimeString()}
              </>
            ) : isDirty ? (
              "Unsaved changes"
            ) : (
              "No changes yet"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {articleId && (
            <DeleteArticleDialog
              articleId={articleId}
              title={state.title || "Untitled"}
              onDeleted={() => router.push("/admin/intel")}
            />
          )}
          {state.status !== "draft" && (
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => submit("draft")}>
              Save as draft
            </Button>
          )}
          <Button type="button" disabled={isSaving} onClick={() => submit()}>
            {primaryLabel}
            <Kbd className="ml-1.5">⌘S</Kbd>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={state.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="A clear, specific title"
                  className="text-lg font-medium"
                />
                {fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Slug</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">/intel/</span>
                  <Input
                    value={state.slug}
                    onChange={(e) => {
                      setState((s) => ({ ...s, slug: slugify(e.target.value), slugTouched: true }));
                      setIsDirty(true);
                    }}
                  />
                </div>
                {fieldErrors.slug && <FieldError>{fieldErrors.slug}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Excerpt</FieldLabel>
                <Textarea
                  value={state.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  placeholder="A short summary shown on article cards"
                  rows={3}
                />
                {fieldErrors.excerpt && <FieldError>{fieldErrors.excerpt}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Content</FieldLabel>
                <ContentEditor value={state.content} onChange={handleContentChange} />
                {fieldErrors.content && <FieldError>{fieldErrors.content}</FieldError>}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <SeoPanel
                fields={{
                  seoTitle: state.seoTitle,
                  metaDescription: state.metaDescription,
                  canonicalUrl: state.canonicalUrl,
                  ogImage: state.ogImage,
                  focusKeyword: state.focusKeyword,
                }}
                onChange={(key, value) => {
                  setState((s) => ({ ...s, [key]: value }));
                  setIsDirty(true);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <SeoAssistant
                input={{
                  title: state.title,
                  slug: state.slug,
                  excerpt: state.excerpt,
                  seoTitle: state.seoTitle,
                  metaDescription: state.metaDescription,
                  featuredImage: state.featuredImage,
                  focusKeyword: state.focusKeyword,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Side column ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={state.status} onValueChange={(v) => update("status", v as ArticleStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {(state.status === "published" || state.status === "scheduled") && (
                <Field>
                  <FieldLabel>{state.status === "scheduled" ? "Publish date" : "Published on"}</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={state.publishedAt}
                    onChange={(e) => update("publishedAt", e.target.value)}
                  />
                  {fieldErrors.publishedAt && <FieldError>{fieldErrors.publishedAt}</FieldError>}
                  {state.status === "scheduled" && (
                    <FieldDescription>Goes live on its own once this time passes.</FieldDescription>
                  )}
                </Field>
              )}

              <Field>
                <FieldLabel>Author</FieldLabel>
                <Input value={state.authorName} onChange={(e) => update("authorName", e.target.value)} />
                {fieldErrors.authorName && <FieldError>{fieldErrors.authorName}</FieldError>}
              </Field>

              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel>Reading time (minutes)</FieldLabel>
                  {state.readingTimeTouched && state.readingTime !== estimatedReadingTime && (
                    <button
                      type="button"
                      onClick={() => setState((s) => ({ ...s, readingTime: estimatedReadingTime, readingTimeTouched: false }))}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="size-3" /> Auto ({estimatedReadingTime})
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  min={1}
                  value={state.readingTime ?? estimatedReadingTime}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      readingTime: e.target.value ? Number(e.target.value) : null,
                      readingTimeTouched: true,
                    }))
                  }
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={state.categoryId ? String(state.categoryId) : "none"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Topic</FieldLabel>
                <Select
                  value={state.topicId ? String(state.topicId) : "none"}
                  onValueChange={(v) => update("topicId", v === "none" ? null : Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No topic</SelectItem>
                    {availableTopics.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.categoryId && availableTopics.length === 0 && (
                  <FieldDescription>No topics under this category yet.</FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Tags</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {state.tagNames.map((name) => (
                    <Badge key={name} variant="secondary" className="gap-1 pr-1">
                      {name}
                      <button type="button" onClick={() => removeTag(name)} className="hover:text-destructive">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  list="existing-tag-names"
                />
                <datalist id="existing-tag-names">
                  {allTagNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured image</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageField value={state.featuredImage} onChange={(url) => update("featuredImage", url)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
