"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, BookOpen,
  ArrowRight, Wrench, MessageSquare,
  CheckSquare, Bot, DollarSign, Briefcase
} from "lucide-react";
import { Suspense } from "react";
import { getAssessmentResults, ASSESSMENT_LEGACY_MAP, resolveAssessmentPillar } from "@/lib/assessment-content";

// Content stores icons as string identifiers (it's a plain data module, not
// a component) — resolve them to the actual lucide components here.
const ICON_MAP: Record<string, typeof BookOpen> = { BookOpen, MessageSquare, Wrench, Users, Activity, DollarSign, Briefcase };

function ResultsContent() {
  const searchParams = useSearchParams();
  const pillarParam = searchParams.get("pillar");
  const resolvedPillar = resolveAssessmentPillar(pillarParam);
  const RESULTS = getAssessmentResults(pillarParam);
  const rawType = searchParams.get("type") || "overloaded";
  const type = RESULTS[rawType] ? rawType : (ASSESSMENT_LEGACY_MAP[rawType] || "overloaded");
  const result = RESULTS[type];

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-24">

      {/* Result header */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your check-in result</p>
            <h1 className={`text-3xl md:text-4xl font-bold ${result.color} mb-1`}>
              {result.title}
            </h1>
            <p className="text-base text-muted-foreground font-medium">{result.tagline}</p>
          </div>

          {/* Talk to Bravo button — top right */}
          <Link
            href="/debrief"
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl ${result.bg} border ${result.border} hover:opacity-80 transition-opacity group`}
          >
            <Bot className={`w-4 h-4 ${result.color}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${result.color} hidden sm:inline`}>
              Talk to Bravo
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest ${result.color} sm:hidden`}>
              Bravo
            </span>
          </Link>
        </div>

        <Card className={`bg-card/80 backdrop-blur-sm border ${result.border} card-glow`}>
          <CardContent className="p-6 md:p-7">
            <p className="text-foreground leading-relaxed mb-4">{result.desc}</p>
            <p className={`text-sm font-medium ${result.color} italic`}>"{result.microcopy}"</p>
          </CardContent>
        </Card>
      </section>

      {/* Action plan */}
      <section className={`rounded-2xl border ${result.border} ${result.bg} p-6 md:p-7`}>
        <div className="flex items-center gap-3 mb-6">
          <CheckSquare className={`w-5 h-5 ${result.color}`} />
          <h2 className="text-lg font-bold text-foreground">{result.actionPlan.title}</h2>
        </div>
        <div className="space-y-4">
          {result.actionPlan.steps.map((step: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className={`w-6 h-6 rounded-full ${result.bg} border ${result.border} flex items-center justify-center shrink-0 mt-0.5`}>
                <span className={`text-xs font-bold ${result.color}`}>{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{step.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="space-y-4 pt-4 border-t border-border/30">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">Where to go from here</h2>
          <p className="text-sm text-muted-foreground mt-1">A few places that might help right now.</p>
        </div>
        <div className="space-y-3">
          {result.nextSteps.map((step: any, i: number) => {
            const Icon = ICON_MAP[step.icon] ?? BookOpen;
            return (
              <div key={i} className={`flex items-center justify-between p-4 md:p-5 rounded-xl bg-card/60 border ${result.border} hover:bg-card/80 transition-colors group`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 ${result.bg} rounded-lg shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${result.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.label}</p>
                </div>
                <Link href={step.href} className="shrink-0 ml-4">
                  <Button size="sm" variant="outline" className={`border-border/50 text-foreground hover:bg-secondary/40 text-xs whitespace-nowrap`}>
                    {step.action} <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Redo */}
      <div className="pt-4 text-center">
        <Link href={`/assessment?pillar=${resolvedPillar}`}>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">
            Take the check-in again
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <Suspense fallback={<div className="text-center pt-20 animate-pulse text-muted-foreground text-sm">Reading your results...</div>}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
