"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ResumeEducationEntry } from "@/db/schema";

type Props = {
  entries: ResumeEducationEntry[];
  onChange: (entries: ResumeEducationEntry[]) => void;
};

function newEntry(): ResumeEducationEntry {
  return { id: crypto.randomUUID(), school: "", degree: "", field: "", startDate: "", endDate: "" };
}

export default function EducationSection({ entries, onChange }: Props) {
  function updateEntry(id: string, patch: Partial<ResumeEducationEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} title="Remove">
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
          <Input placeholder="School" value={entry.school} onChange={(e) => updateEntry(entry.id, { school: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Degree (e.g. Associate's)" value={entry.degree} onChange={(e) => updateEntry(entry.id, { degree: e.target.value })} />
            <Input placeholder="Field of study (optional)" value={entry.field ?? ""} onChange={(e) => updateEntry(entry.id, { field: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="month" placeholder="Start" value={entry.startDate ?? ""} onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })} />
            <Input type="month" placeholder="End" value={entry.endDate ?? ""} onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })} />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={() => onChange([...entries, newEntry()])} className="w-full">
        <Plus className="size-4 mr-1.5" /> Add education
      </Button>
    </div>
  );
}
