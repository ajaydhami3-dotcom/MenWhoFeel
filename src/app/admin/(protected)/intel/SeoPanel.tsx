"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { FeaturedImageField } from "./FeaturedImageField";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function CounterLabel({ label, length, max }: { label: string; length: number; max: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <FieldLabel>{label}</FieldLabel>
      <span className={cn("text-xs tabular-nums", length > max ? "text-destructive" : "text-muted-foreground")}>
        {length}/{max}
      </span>
    </div>
  );
}

export interface SeoFields {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string | null;
  focusKeyword: string;
}

export function SeoPanel({
  fields,
  onChange,
}: {
  fields: SeoFields;
  onChange: <K extends keyof SeoFields>(key: K, value: SeoFields[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <Field>
        <CounterLabel label="SEO title" length={fields.seoTitle.length} max={TITLE_MAX} />
        <Input
          value={fields.seoTitle}
          onChange={(e) => onChange("seoTitle", e.target.value)}
          placeholder="Falls back to the article title if left blank"
        />
      </Field>

      <Field>
        <CounterLabel label="Meta description" length={fields.metaDescription.length} max={DESCRIPTION_MAX} />
        <Textarea
          value={fields.metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="Falls back to the excerpt if left blank"
          rows={3}
        />
      </Field>

      <Field>
        <FieldLabel>Canonical URL</FieldLabel>
        <Input
          value={fields.canonicalUrl}
          onChange={(e) => onChange("canonicalUrl", e.target.value)}
          placeholder="https://www.menwhofeel.online/intel/..."
        />
        <FieldDescription>Only needed if this content is published elsewhere too.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Open Graph image</FieldLabel>
        <FieldDescription className="mb-2">
          Shown in social link previews. Defaults to the featured image if left empty.
        </FieldDescription>
        <FeaturedImageField value={fields.ogImage} onChange={(url) => onChange("ogImage", url)} />
      </Field>

      <Field>
        <FieldLabel>Focus keyword</FieldLabel>
        <Input
          value={fields.focusKeyword}
          onChange={(e) => onChange("focusKeyword", e.target.value)}
          placeholder="e.g. men's mental health"
        />
        <FieldDescription>The SEO assistant checks this against your title and description.</FieldDescription>
      </Field>
    </div>
  );
}
