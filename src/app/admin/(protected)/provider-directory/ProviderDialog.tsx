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
import { createProviderAction, updateProviderAction, type ProviderInput } from "./actions";

const TYPE_LABELS: Record<ProviderInput["type"], string> = {
  therapist_counselor: "Therapist / Counselor",
  psychiatrist: "Psychiatrist",
  primary_care: "Primary Care",
  recovery_program: "Recovery Program",
  sliding_scale_clinic: "Sliding-Scale Clinic",
};

type PillarOption = { id: number; name: string; slug: string };

type Provider = {
  id: number;
  name: string;
  type: ProviderInput["type"];
  description: string;
  location: string;
  url: string;
  trustNotes: string | null;
  pillarId: number | null;
  featured: boolean | null;
};

export function ProviderDialog({ provider, pillarOptions }: { provider?: Provider; pillarOptions: PillarOption[] }) {
  const isEdit = !!provider;
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ProviderInput>({
    name: provider?.name ?? "",
    type: provider?.type ?? "therapist_counselor",
    description: provider?.description ?? "",
    location: provider?.location ?? "",
    url: provider?.url ?? "",
    trustNotes: provider?.trustNotes ?? "",
    pillarId: provider?.pillarId ?? null,
    featured: provider?.featured ?? false,
  });

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});
    const result = isEdit
      ? await updateProviderAction(provider.id, form)
      : await createProviderAction(form);
    setIsSaving(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Provider updated." : "Provider added — pending review before it's public.");
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
            <Plus className="size-4 mr-1.5" /> Add provider
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit provider" : "Add a provider"}</DialogTitle>
          <DialogDescription>
            New entries start pending — they won&apos;t show on /provider-directory until you approve them from the
            list. This is the highest-trust listing feature on the site — this recommends an actual person or
            practice, not just a link, so vet accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Practice or practitioner name" />
            {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
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
            <FieldLabel>Location</FieldLabel>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Telehealth — nationwide, or Chicago, IL"
            />
            {fieldErrors.location && <FieldError>{fieldErrors.location}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>URL</FieldLabel>
            <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://" />
            {fieldErrors.url && <FieldError>{fieldErrors.url}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ProviderInput["type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Pillar</FieldLabel>
            <Select
              value={form.pillarId?.toString() ?? ""}
              onValueChange={(v) => setForm((f) => ({ ...f, pillarId: v ? Number(v) : null }))}
            >
              <SelectTrigger><SelectValue placeholder="Select a pillar" /></SelectTrigger>
              <SelectContent>
                {pillarOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
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
              placeholder="e.g. Licensed clinical psychologist, sliding scale available, verified credentials."
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
