"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { getAssessmentQuestions, resolveAssessmentPillar } from "@/lib/assessment-content";

// ─── Scientifically grounded, emotionally engaging assessment ─────────────────
// Based on validated screening tools: PHQ-9, GAD-7, MBI (Burnout), UCLA Loneliness Scale,
// and Ryff's Psychological Wellbeing scales — adapted for men's engagement
//
// Questions/results now live in src/lib/assessment-content.ts, keyed by
// pillar, so this stays one shared quiz engine instead of four separate
// tools (Phase 12 — Check-In pillar integration). No `?pillar=` param
// still resolves to the same content as before this change.

// Visual-only, keyed by pillar slug — same pattern as GuidesClient's
// pillar map. Falls back to no label at all if the slug isn't recognized.
const PILLAR_LABELS: Record<string, string> = {
  "mental-emotional-health": "Mental & Emotional Health",
  "work-financial-stability": "Work & Financial Stability",
  "relationships-stress": "Relationships & Stress",
  "physical-wellbeing": "Physical Wellbeing",
};

function AssessmentQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pillarParam = searchParams.get("pillar");
  const resolvedPillar = resolveAssessmentPillar(pillarParam);
  const pillarLabel = PILLAR_LABELS[resolvedPillar];
  const QUESTIONS = getAssessmentQuestions(pillarParam);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAnswer = (category: string) => {
    const newAnswers = [...answers, category];
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCalculating(true);

      const counts = newAnswers.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantCategory = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );

      router.push(`/assessment/results?type=${dominantCategory}&pillar=${resolvedPillar}`);
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Reading your responses...</p>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentIndex];
  const progress = Math.round((currentIndex / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8 flex flex-col items-center pt-20 pb-24">
      <div className="w-full max-w-2xl">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </p>
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">Check In</h1>
          <p className="text-sm text-muted-foreground">
            {pillarLabel ? `For ${pillarLabel}. No right answers. Just honest ones.` : "No right answers. Just honest ones."}
          </p>
        </div>

        <Card className="bg-card/80 border-border/40 backdrop-blur-md overflow-hidden card-glow">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-semibold leading-relaxed mb-7 text-foreground">
              {currentQ.questionText}
            </h2>

            <div className="space-y-3">
              <OptionButton text={currentQ.opt1Text} onClick={() => handleAnswer(currentQ.opt1Category)} />
              <OptionButton text={currentQ.opt2Text} onClick={() => handleAnswer(currentQ.opt2Category)} />
              <OptionButton text={currentQ.opt3Text} onClick={() => handleAnswer(currentQ.opt3Category)} />
              <OptionButton text={currentQ.opt4Text} onClick={() => handleAnswer(currentQ.opt4Category)} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function OptionButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-secondary/20 hover:bg-blue-500/10 border border-border/40 hover:border-blue-500/50 text-muted-foreground hover:text-foreground rounded-xl transition-all flex items-center justify-between group"
    >
      <span className="font-medium pr-4 leading-relaxed text-sm">{text}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 shrink-0 transition-colors" />
    </button>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <AssessmentQuizContent />
    </Suspense>
  );
}
