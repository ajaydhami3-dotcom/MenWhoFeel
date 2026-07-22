"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createSmallWinAction, updateSmallWinAction, type SmallWinInput } from "./actions";

const CATEGORY_LABELS: Record<SmallWinInput["category"], string> = {
  ai_training: "AI training",
  freelance: "Freelance",
  microtasks: "Microtasks",
  crowdsourcing: "Crowdsourcing",
  user_testing: "User testing",
  remote_work: "Remote work",
};

type SmallWin = {
  id: number;
  title: string;
  description: string;
  url: string;
  category: SmallWinInput["category"];
  payDetails: string | null;
  requirements: string | null;
  trustNotes: string | null;
  featured: boolean | null;
};

export function SmallWinDialog({ win }: { win?: SmallWin }) {
  const isEdit = !!win;
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<SmallWinInput>({
    title: win?.title ?? "",
    description: win?.description ?? "",
    url: win?.url ?? "",
    category: win?.category ?? "freelance",
    payDetails: win?.payDetails ?? "",
    requirements: win?.requirements ?? "",
    trustNotes: win?.trustNotes ?? "",
    featured: win?.featured ?? false,
  });

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});
    const result = isEdit ? await updateSmallWinAction(win.id, form) : await createSmallWinAction(form);
    setIsSaving(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Updated." : "Added — pending review before it's public.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
            <span className="sr-only">Edit</span>
          </Button>
        ) : (
          <Button>
            <Plus className="size-4 mr-1.5" /> Add opportunity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit opportunity" : "Add an opportunity"}</DialogTitle>
          <DialogDescription>
            New entries start pending — they won&apos;t show on /small-wins until you approve them from the list.
            Quality and trust over quantity: if you wouldn&apos;t send a friend here, don&apos;t approve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            {fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>URL</FieldLabel>
            <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://" />
            {fieldErrors.url && <FieldError>{fieldErrors.url}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as SmallWinInput["category"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Pay details</FieldLabel>
              <Input
                value={form.payDetails ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, payDetails: e.target.value }))}
                placeholder="e.g. $15–25/hr"
              />
            </Field>
            <Field>
              <FieldLabel>Requirements</FieldLabel>
              <Input
                value={form.requirements ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                placeholder="e.g. Laptop + internet"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Why this is trustworthy (shown publicly)</FieldLabel>
            <Textarea
              rows={2}
              value={form.trustNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, trustNotes: e.target.value }))}
              placeholder="e.g. Established platform, verified payout history, no upfront fees."
            />
          </Field>

          <Field className="flex items-center justify-between">
            <FieldLabel className="mb-0">Featured</FieldLabel>
            <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
