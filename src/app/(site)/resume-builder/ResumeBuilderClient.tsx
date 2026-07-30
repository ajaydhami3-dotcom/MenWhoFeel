"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Printer, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ResumeExperienceEntry, ResumeEducationEntry } from "@/db/schema";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import ResumePreview from "./ResumePreview";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  summary: string;
  template: "modern" | "classic" | "minimal";
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
};

const TEMPLATES: { value: FormState["template"]; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
];

// Outer shell: owns auth + the initial load only. Deliberately doesn't
// hold the form's own editable state — see ResumeForm below for why.
export default function ResumeBuilderClient() {
  const { isReady: authReady, error: authError } = useAuth();
  const query = trpc.resume.get.useQuery(undefined, { enabled: authReady });

  if (authError) {
    return (
      <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <p className="font-medium">Couldn&apos;t start a session.</p>
        <p className="text-destructive/80 mt-1">{authError}</p>
      </div>
    );
  }

  if (!authReady || query.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up your resume…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center px-6">
        <AlertCircle className="w-6 h-6 text-destructive" />
        <p className="text-foreground font-medium">Couldn&apos;t load your resume.</p>
        {(query.error?.message || query.error?.data?.code) && (
          <p className="text-xs text-muted-foreground max-w-sm">
            {query.error?.data?.code ? `${query.error.data.code} — ` : ""}
            {query.error?.message}
          </p>
        )}
        <Button onClick={() => query.refetch()} variant="outline" size="sm" className="rounded-full">
          Try again
        </Button>
      </div>
    );
  }

  const initial: FormState = {
    fullName: query.data?.fullName ?? "",
    email: query.data?.email ?? "",
    phone: query.data?.phone ?? "",
    city: query.data?.city ?? "",
    state: query.data?.state ?? "",
    summary: query.data?.summary ?? "",
    template: (query.data?.template as FormState["template"]) ?? "modern",
    experience: query.data?.experience ?? [],
    education: query.data?.education ?? [],
    skills: query.data?.skills ?? [],
  };

  // key={query.data?.updatedAt ...} isn't needed here the way it was for
  // GuidesClient's category switch — this component only ever mounts
  // once query.isLoading finishes, so ResumeForm's useState(initial)
  // below runs exactly once with the right data. No effect syncing state
  // from a query into local state, so nothing to trigger
  // react-hooks/set-state-in-effect on.
  return <ResumeForm initial={initial} />;
}

// Inner component: mounted exactly once, after data has loaded. Owns all
// the editable form state from that point on — the query above is never
// consulted again, so a background refetch can never silently overwrite
// something the person is actively typing.
function ResumeForm({ initial }: { initial: FormState }) {
  const [form, setForm] = useState<FormState>(initial);
  const [skillInput, setSkillInput] = useState("");
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);

  const saveMutation = trpc.resume.save.useMutation();
  const improveMutation = trpc.resume.improveText.useMutation();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    saveMutation.mutate(form, {
      onSuccess: () => toast.success("Saved."),
      onError: (err) => toast.error(err.message || "Couldn't save — try again."),
    });
  }

  async function handleImproveSummary() {
    if (!form.summary.trim()) return;
    setIsImprovingSummary(true);
    try {
      const result = await improveMutation.mutateAsync({ text: form.summary, fieldType: "summary" });
      set("summary", result.improved);
    } catch {
      toast.error("Couldn't improve that right now — try again.");
    } finally {
      setIsImprovingSummary(false);
    }
  }

  async function improveBullet(text: string): Promise<string> {
    try {
      const result = await improveMutation.mutateAsync({ text, fieldType: "bullet" });
      return result.improved;
    } catch {
      toast.error("Couldn't improve that right now — try again.");
      return text;
    }
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || form.skills.includes(value)) return;
    set("skills", [...form.skills, value]);
    setSkillInput("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Editing side — hidden entirely when printing */}
      <div className="print:hidden space-y-8">
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            <Input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <Input placeholder="State" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            No street address on purpose — that&apos;s standard resume practice now, not something we&apos;re making
            you skip.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Summary</p>
            <Button
              variant="outline"
              size="sm"
              disabled={!form.summary.trim() || isImprovingSummary}
              onClick={handleImproveSummary}
            >
              {isImprovingSummary ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Sparkles className="size-3.5 mr-1.5" />}
              Improve with AI
            </Button>
          </div>
          <Textarea
            rows={3}
            placeholder="Two or three sentences on who you are professionally and what you're looking for."
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </section>

        <section>
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Experience</p>
          <ExperienceSection entries={form.experience} onChange={(v) => set("experience", v)} onImproveBullet={improveBullet} />
        </section>

        <section>
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Education</p>
          <EducationSection entries={form.education} onChange={(v) => set("education", v)} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Skills</p>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button variant="outline" onClick={addSkill}>Add</Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("skills", form.skills.filter((x) => x !== s))}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-secondary/70"
                  title="Remove"
                >
                  {s} ×
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Template</p>
          <div className="flex gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("template", t.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.template === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3 sticky bottom-4">
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-full">
            {saveMutation.isPending ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="rounded-full">
            <Printer className="size-4 mr-1.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Preview side — this is what prints */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="print:hidden mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Preview — this is what prints
        </p>
        <div className="overflow-hidden rounded-xl border border-border shadow-sm print:border-0 print:shadow-none print:rounded-none">
          <ResumePreview data={form} />
        </div>
      </div>
    </div>
  );
}
