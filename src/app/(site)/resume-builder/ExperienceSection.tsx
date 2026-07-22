"use client";

import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResumeExperienceEntry } from "@/db/schema";

type Props = {
  entries: ResumeExperienceEntry[];
  onChange: (entries: ResumeExperienceEntry[]) => void;
  onImproveBullet: (text: string) => Promise<string>;
};

function newEntry(): ResumeExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export default function ExperienceSection({ entries, onChange, onImproveBullet }: Props) {
  const [improvingKey, setImprovingKey] = useState<string | null>(null);

  function updateEntry(id: string, patch: Partial<ResumeExperienceEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  function updateBullet(entryId: string, index: number, text: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const bullets = [...entry.bullets];
    bullets[index] = text;
    updateEntry(entryId, { bullets });
  }

  function addBullet(entryId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry || entry.bullets.length >= 6) return;
    updateEntry(entryId, { bullets: [...entry.bullets, ""] });
  }

  function removeBullet(entryId: string, index: number) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, { bullets: entry.bullets.filter((_, i) => i !== index) });
  }

  async function handleImprove(entryId: string, index: number) {
    const entry = entries.find((e) => e.id === entryId);
    const text = entry?.bullets[index]?.trim();
    if (!text) return;
    const key = `${entryId}-${index}`;
    setImprovingKey(key);
    try {
      const improved = await onImproveBullet(text);
      updateBullet(entryId, index, improved);
    } finally {
      setImprovingKey(null);
    }
  }

  return (
    <div className="space-y-5">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} title="Remove this job">
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Job title" value={entry.title} onChange={(e) => updateEntry(entry.id, { title: e.target.value })} />
            <Input placeholder="Company" value={entry.company} onChange={(e) => updateEntry(entry.id, { company: e.target.value })} />
          </div>
          <Input placeholder="Location (optional)" value={entry.location ?? ""} onChange={(e) => updateEntry(entry.id, { location: e.target.value })} />

          <div className="grid grid-cols-3 gap-3 items-center">
            <Input type="month" placeholder="Start" value={entry.startDate} onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })} />
            <Input
              type="month"
              placeholder="End"
              value={entry.endDate ?? ""}
              disabled={entry.current}
              onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={entry.current} onCheckedChange={(v) => updateEntry(entry.id, { current: !!v, endDate: v ? "" : entry.endDate })} />
              I currently work here
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">What did you do?</p>
            {entry.bullets.map((bullet, i) => {
              const key = `${entry.id}-${i}`;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => updateBullet(entry.id, i, e.target.value)}
                    placeholder="e.g. Managed a team of 5 and cut order errors by 20%"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Improve wording with AI"
                    disabled={!bullet.trim() || improvingKey === key}
                    onClick={() => handleImprove(entry.id, i)}
                  >
                    {improvingKey === key ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  </Button>
                  {entry.bullets.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeBullet(entry.id, i)}>
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              );
            })}
            {entry.bullets.length < 6 && (
              <button
                type="button"
                onClick={() => addBullet(entry.id)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <Plus className="size-3" /> Add a line
              </button>
            )}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={() => onChange([...entries, newEntry()])} className="w-full">
        <Plus className="size-4 mr-1.5" /> Add a job
      </Button>
    </div>
  );
}
