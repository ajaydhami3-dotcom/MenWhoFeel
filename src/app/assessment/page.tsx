"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const TEST_USER_ID = "guest_warrior_1";

// Fallback reflective questions if DB is empty
const FALLBACK_QUESTIONS = [
  {
    id: "q1",
    questionText: "Have you been keeping things to yourself lately?",
    opt1Text: "Constantly — I don't know how to bring it up", opt1Category: "isolated",
    opt2Text: "A bit, mostly to avoid burdening others", opt2Category: "pressure",
    opt3Text: "Not really, I speak up when I need to", opt3Category: "functional",
    opt4Text: "I don't have anything I need to say", opt4Category: "disconnected",
    imageUrl: null,
  },
  {
    id: "q2",
    questionText: "Do small things feel heavier than usual?",
    opt1Text: "Yes — tiny things set me off", opt1Category: "overloaded",
    opt2Text: "Sometimes, but I push through", opt2Category: "pressure",
    opt3Text: "Not particularly", opt3Category: "functional",
    opt4Text: "I feel numb to most things lately", opt4Category: "disconnected",
    imageUrl: null,
  },
  {
    id: "q3",
    questionText: "Have you felt mentally drained even after resting?",
    opt1Text: "Yes, sleep doesn't fix anything anymore", opt1Category: "burnout",
    opt2Text: "Most days I wake up already tired", opt2Category: "overloaded",
    opt3Text: "Some days, but I recover okay", opt3Category: "pressure",
    opt4Text: "Rest doesn't feel like rest lately", opt4Category: "burnout",
    imageUrl: null,
  },
  {
    id: "q4",
    questionText: "Do you feel connected to yourself lately?",
    opt1Text: "No — I feel like I'm going through the motions", opt1Category: "disconnected",
    opt2Text: "I'm not sure who I am right now", opt2Category: "directionless",
    opt3Text: "Sort of, but something feels off", opt3Category: "isolated",
    opt4Text: "More or less, yes", opt4Category: "functional",
    imageUrl: null,
  },
  {
    id: "q5",
    questionText: "How do you handle pressure when it builds up?",
    opt1Text: "I bury it and hope it passes", opt1Category: "overloaded",
    opt2Text: "I get quiet and withdraw", opt2Category: "isolated",
    opt3Text: "I stay functional but feel it inside", opt3Category: "pressure",
    opt4Text: "I move through it but it costs me", opt4Category: "burnout",
    imageUrl: null,
  },
];

export default function AssessmentPage() {
  const router = useRouter();

  const { data: questions, isLoading } = trpc.assessment.getQuestions.useQuery();
  const submitResult = trpc.assessment.submitResult.useMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const activeQuestions = (questions && questions.length > 0) ? questions : FALLBACK_QUESTIONS;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-base">
          Getting things ready...
        </div>
      </div>
    );
  }

  const handleAnswer = (category: string) => {
    const newAnswers = [...answers, category];
    setAnswers(newAnswers);

    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCalculating(true);

      const counts = newAnswers.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

      if (questions && questions.length > 0) {
        submitResult.mutate({ userIdentifier: TEST_USER_ID, resultCategory: dominantCategory });
      }

      router.push(`/assessment/results?type=${dominantCategory}`);
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-base">
          Working out your results...
        </div>
      </div>
    );
  }

  const currentQ = activeQuestions[currentIndex];
  const progress = Math.round(((currentIndex) / activeQuestions.length) * 100);

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8 flex flex-col items-center pt-20 pb-24">
      <div className="w-full max-w-2xl">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Question {currentIndex + 1} of {activeQuestions.length}
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
          <h1 className="text-xl font-bold text-foreground mb-1">Daily Reflection</h1>
          <p className="text-sm text-muted-foreground">Answer honestly — there are no wrong answers.</p>
        </div>

        <Card className="bg-card/80 border-border/40 backdrop-blur-md overflow-hidden card-glow">
          {currentQ.imageUrl && (
            <div className="w-full h-40 md:h-52 bg-secondary">
              <img src={currentQ.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
            </div>
          )}

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
