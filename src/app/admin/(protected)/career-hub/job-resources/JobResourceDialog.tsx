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
import { createJobResourceAction, updateJobResourceAction, type JobResourceInput } from "./actions";

const CATEGORY_LABELS: Record<JobResourceInput["category"], string> = {
  job_board: "Job board",
  networking: "Networking",
  salary_research: "Salary research",
  company_research: "Company research",
  recruiter: "Recruiter / staffing",
  government_program: "Government program",
};

type JobResource = {
  id: number;
  title: string;
  description: string;
  url: string;
  category: JobResourceInput["category"];
  trustNotes: string | null;
  featured: boolean | null;
};

export function JobResourceDialog({ resource }: { resource?: JobResource }) {
  const isEdit = !!resource;
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<JobResourceInput>({
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    url: resource?.url ?? "",
    category: resource?.category ?? "job_board",
    trustNotes: resource?.trustNotes ?? "",
    featured: resource?.featured ?? false,
  });

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});
    const result = isEdit
      ? await updateJobResourceAction(resource.id, form)
      : await createJobResourceAction(form);
    setIsSaving(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Job resource updated." : "Job resource added — pending review before it's public.");
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
            <Plus className="size-4 mr-1.5" /> Add job resource
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit job resource" : "Add a job resource"}</DialogTitle>
          <DialogDescription>
            New entries start pending — they won&apos;t show on /career-hub until you approve them from the list.
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
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>URL</FieldLabel>
            <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://" />
            {fieldErrors.url && <FieldError>{fieldErrors.url}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as JobResourceInput["category"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Why this is trustworthy (shown publicly)</FieldLabel>
            <Textarea
              rows={2}
              value={form.trustNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, trustNotes: e.target.value }))}
              placeholder="e.g. Official state workforce program, no cost to job seekers."
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
