"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { slugify } from "@/lib/slug";
import { updatePillarAction, type PillarInput } from "./actions";

type Pillar = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number | null;
};

// Edit-only, unlike CategoryDialog — no "New pillar" trigger variant.
// Pillars are a fixed set of 4; see actions.ts for why.
export function PillarDialog({ pillar }: { pillar: Pillar }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: pillar.name,
    slug: pillar.slug,
    description: pillar.description ?? "",
    color: pillar.color ?? "",
    icon: pillar.icon ?? "",
    sortOrder: pillar.sortOrder ?? 0,
  });

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});
    const input: PillarInput = {
      id: pillar.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      color: form.color || null,
      icon: form.icon || null,
      sortOrder: form.sortOrder,
    };
    const result = await updatePillarAction(input);
    setIsSaving(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success("Pillar updated.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit pillar</DialogTitle>
          <DialogDescription>
            Renaming or re-describing this pillar updates every page that surfaces it — the Toolkit page,
            category/topic hubs, and Intel articles all read these fields live.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            />
            {fieldErrors.slug && <FieldError>{fieldErrors.slug}</FieldError>}
            <p className="text-xs text-muted-foreground mt-1">
              Changing this breaks the icon/color lookup in GuidesClient.tsx and category-style.ts until
              those are updated to match — safe to leave as-is unless you know you need to change it.
            </p>
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Input
                placeholder="e.g. blue"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Icon</FieldLabel>
              <Input
                placeholder="lucide icon name"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Sort order</FieldLabel>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
