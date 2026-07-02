"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { saveSettingsAction, type SettingsInput } from "../actions";
import {
  DEFAULT_RESEARCH_PROMPT,
  DEFAULT_WRITING_PROMPT,
  DEFAULT_SEO_PROMPT,
  DEFAULT_SOCIAL_PROMPT,
} from "@/lib/automation/prompts";

type Settings = {
  aiProvider: string;
  imageProvider: string;
  imageStyle: string;
  defaultAuthor: string;
  defaultCategoryId: number | null;
  redditEnabled: boolean;
  redditSubreddits: string[];
  xEnabled: boolean;
  instagramEnabled: boolean;
  defaultHashtags: string[];
  researchPrompt: string | null;
  writingPrompt: string | null;
  seoPrompt: string | null;
  socialPrompt: string | null;
} | null;

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v || values.includes(v)) { setInput(""); return; }
    onChange([...values, v]);
    setInput("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function SettingsForm({
  settings,
  categories,
}: {
  settings: Settings;
  categories: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<SettingsInput>({
    aiProvider: (settings?.aiProvider as "gemini" | "groq") ?? "gemini",
    imageProvider: (settings?.imageProvider as "fal" | "none") ?? "fal",
    imageStyle: settings?.imageStyle ?? "photorealistic, editorial, men's wellness",
    defaultAuthor: settings?.defaultAuthor ?? "MenWhoFeel Core",
    defaultCategoryId: settings?.defaultCategoryId ?? null,
    redditEnabled: settings?.redditEnabled ?? false,
    redditSubreddits: settings?.redditSubreddits ?? [],
    xEnabled: settings?.xEnabled ?? false,
    instagramEnabled: settings?.instagramEnabled ?? false,
    defaultHashtags: settings?.defaultHashtags ?? [],
    researchPrompt: settings?.researchPrompt ?? null,
    writingPrompt: settings?.writingPrompt ?? null,
    seoPrompt: settings?.seoPrompt ?? null,
    socialPrompt: settings?.socialPrompt ?? null,
  });
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSettingsAction(form);
      if (result.success) {
        toast.success("Settings saved.");
      } else {
        toast.error(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai">
        <TabsList>
          <TabsTrigger value="ai">AI Provider</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="prompts">Prompt templates</TabsTrigger>
        </TabsList>

        {/* ── AI Provider ─────────────────────────────────────────────────── */}
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI provider</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Field>
                <FieldLabel>Provider</FieldLabel>
                <Select value={form.aiProvider} onValueChange={(v) => set("aiProvider", v as "gemini" | "groq")}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini (Google) — recommended</SelectItem>
                    <SelectItem value="groq">Groq (Llama 3.1 70B)</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Gemini is the primary provider. Groq is the automatic fallback when Gemini is unavailable.
                  Set this to "Groq" to force Groq for all calls.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Default author name</FieldLabel>
                <Input
                  value={form.defaultAuthor}
                  onChange={(e) => set("defaultAuthor", e.target.value)}
                  className="max-w-xs"
                />
                <FieldDescription>Used as the article author in generated drafts.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Default category</FieldLabel>
                <Select
                  value={form.defaultCategoryId ? String(form.defaultCategoryId) : "none"}
                  onValueChange={(v) => set("defaultCategoryId", v === "none" ? null : Number(v))}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="No default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No default category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Generated articles will be assigned this category. You can change it before publishing.
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Image ────────────────────────────────────────────────────────── */}
        <TabsContent value="image" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Image generation</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Field>
                <FieldLabel>Provider</FieldLabel>
                <Select value={form.imageProvider} onValueChange={(v) => set("imageProvider", v as "fal" | "none")}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fal">Fal.ai (FLUX Schnell)</SelectItem>
                    <SelectItem value="none">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Fal.ai generates 1200×630 editorial images. Requires FAL_API_KEY env var.
                  Set to "Disabled" to skip image generation (articles will have no featured image).
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Image style</FieldLabel>
                <Input
                  value={form.imageStyle}
                  onChange={(e) => set("imageStyle", e.target.value)}
                />
                <FieldDescription>
                  Prepended to every image prompt. Defines the visual tone for all generated images.
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Social ───────────────────────────────────────────────────────── */}
        <TabsContent value="social" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Reddit</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.redditEnabled}
                      onCheckedChange={(v) => set("redditEnabled", v)}
                    />
                    <FieldLabel className="mb-0">Enable Reddit publishing</FieldLabel>
                  </div>
                  <FieldDescription>
                    When enabled, you can approve and publish generated Reddit posts from the Content Queue.
                    Requires REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Default subreddits</FieldLabel>
                  <TagInput
                    values={form.redditSubreddits}
                    onChange={(v) => set("redditSubreddits", v)}
                    placeholder="e.g. malementalhealth"
                  />
                  <FieldDescription>Added to AI suggestions. Post goes to the first in the list.</FieldDescription>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">X (Twitter)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.xEnabled}
                      onCheckedChange={(v) => set("xEnabled", v)}
                    />
                    <FieldLabel className="mb-0">Enable X publishing</FieldLabel>
                  </div>
                  <FieldDescription>
                    Requires X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET, X_USERNAME.
                  </FieldDescription>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Instagram &amp; YouTube</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.instagramEnabled}
                      onCheckedChange={(v) => set("instagramEnabled", v)}
                    />
                    <FieldLabel className="mb-0">Generate Instagram content</FieldLabel>
                  </div>
                  <FieldDescription>
                    Captions and hashtags are generated as drafts only — Instagram is never published automatically.
                  </FieldDescription>
                </Field>
                <p className="text-sm text-muted-foreground">
                  YouTube metadata (title, description, tags, thumbnail prompt) is always generated — this toggle only
                  affects whether the generation step runs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Default hashtags</CardTitle></CardHeader>
              <CardContent>
                <Field>
                  <TagInput
                    values={form.defaultHashtags}
                    onChange={(v) => set("defaultHashtags", v)}
                    placeholder="e.g. #MensMentalHealth"
                  />
                  <FieldDescription>Merged into every X and Instagram post.</FieldDescription>
                </Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Prompt templates ─────────────────────────────────────────────── */}
        <TabsContent value="prompts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompt templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Leave blank to use the built-in defaults. Use {"{{topic}}"}, {"{{research}}"}, {"{{title}}"} etc. as placeholders.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {(
                [
                  { key: "researchPrompt", label: "Research prompt", def: DEFAULT_RESEARCH_PROMPT },
                  { key: "writingPrompt",  label: "Writing prompt",  def: DEFAULT_WRITING_PROMPT },
                  { key: "seoPrompt",      label: "SEO prompt",      def: DEFAULT_SEO_PROMPT },
                  { key: "socialPrompt",   label: "Social prompt",   def: DEFAULT_SOCIAL_PROMPT },
                ] as const
              ).map(({ key, label, def }) => (
                <Field key={key}>
                  <div className="flex items-baseline justify-between mb-1">
                    <FieldLabel>{label}</FieldLabel>
                    {form[key] && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => set(key, null)}
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                  <Textarea
                    rows={8}
                    value={form[key] ?? ""}
                    onChange={(e) => set(key, e.target.value || null)}
                    placeholder={`Default:\n\n${def.slice(0, 200)}…`}
                    className="font-mono text-xs"
                  />
                </Field>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : <><Save className="size-4" /> Save settings</>}
        </Button>
      </div>
    </div>
  );
}
