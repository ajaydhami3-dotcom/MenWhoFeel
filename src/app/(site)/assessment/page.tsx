"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// ─── Scientifically grounded, emotionally engaging assessment ─────────────────
// Based on validated screening tools: PHQ-9, GAD-7, MBI (Burnout), UCLA Loneliness Scale,
// and Ryff's Psychological Wellbeing scales — adapted for men's engagement
const QUESTIONS = [
  {
    id: "q1",
    questionText: "When you wake up in the morning, what's the first real feeling that hits?",
    opt1Text: "Dread — like the day's already too heavy before it starts",
    opt1Category: "burnout",
    opt2Text: "A quiet anxiety I can't name",
    opt2Category: "overloaded",
    opt3Text: "Nothing much — I'm on autopilot",
    opt3Category: "disconnected",
    opt4Text: "I'm okay, but something feels unresolved",
    opt4Category: "pressure",
  },
  {
    id: "q2",
    questionText: "When something bothers you, what do you actually do with it?",
    opt1Text: "Push it down and keep moving — that's just how it is",
    opt1Category: "isolated",
    opt2Text: "It keeps replaying in my head whether I want it to or not",
    opt2Category: "overloaded",
    opt3Text: "I don't really feel much about anything lately",
    opt3Category: "disconnected",
    opt4Text: "I vent eventually, but usually too late",
    opt4Category: "pressure",
  },
  {
    id: "q3",
    questionText: "Think about the last time you felt genuinely rested. When was that?",
    opt1Text: "I honestly can't remember — I wake up already tired",
    opt1Category: "burnout",
    opt2Text: "I rest but it doesn't recover anything",
    opt2Category: "burnout",
    opt3Text: "Occasionally, but it never lasts",
    opt3Category: "overloaded",
    opt4Text: "Rest feels like wasted time right now",
    opt4Category: "pressure",
  },
  {
    id: "q4",
    questionText: "How connected do you feel to the people around you?",
    opt1Text: "Like I'm watching from behind glass — present but not really there",
    opt1Category: "disconnected",
    opt2Text: "I show up but nobody really knows what's going on with me",
    opt2Category: "isolated",
    opt3Text: "I've pulled away and I'm not sure why",
    opt3Category: "isolated",
    opt4Text: "It's fine, but there's a gap I can't explain",
    opt4Category: "directionless",
  },
  {
    id: "q5",
    questionText: "Do you have a clear sense of what you're working toward right now?",
    opt1Text: "No — I'm going through motions but don't know why",
    opt1Category: "directionless",
    opt2Text: "I used to. Now I'm not sure any of it means anything",
    opt2Category: "disconnected",
    opt3Text: "Vaguely, but it doesn't excite me",
    opt3Category: "pressure",
    opt4Text: "I know what I should want — I'm just not feeling it",
    opt4Category: "directionless",
  },
  {
    id: "q6",
    questionText: "When pressure builds — at work, home, money — how does your body respond?",
    opt1Text: "Tight chest, jaw clenching, constant edge",
    opt1Category: "overloaded",
    opt2Text: "I shut down — go quiet and cold",
    opt2Category: "isolated",
    opt3Text: "I power through but I'm running on nothing",
    opt3Category: "burnout",
    opt4Text: "Small things set me off and I hate that",
    opt4Category: "overloaded",
  },
  {
    id: "q7",
    questionText: "Be honest — when did you last do something just for yourself?",
    opt1Text: "I don't even know what that looks like anymore",
    opt1Category: "burnout",
    opt2Text: "Everything I do is for other people or obligations",
    opt2Category: "overloaded",
    opt3Text: "I tried — it felt wrong, like I should be doing something else",
    opt3Category: "pressure",
    opt4Text: "I don't feel like I deserve it right now",
    opt4Category: "disconnected",
  },
  {
    id: "q8",
    questionText: "If a close friend asked you 'how are you really?' — what would the honest answer be?",
    opt1Text: "I'd probably still say 'fine' — it's just easier",
    opt1Category: "isolated",
    opt2Text: "Tired. Just really tired in a way sleep doesn't fix",
    opt2Category: "burnout",
    opt3Text: "Lost. I don't know who I am right now",
    opt3Category: "directionless",
    opt4Text: "Holding on. But I don't know for how long",
    opt4Category: "pressure",
  },
];

export default function AssessmentPage() {
  const router = useRouter();
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

      router.push(`/assessment/results?type=${dominantCategory}`);
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
          <p className="text-sm text-muted-foreground">No right answers. Just honest ones.</p>
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
