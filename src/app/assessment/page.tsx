"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router Engine
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const TEST_USER_ID = "guest_warrior_1";

export default function AssessmentPage() {
  const router = useRouter(); // Initialize the router
  
  const { data: questions, isLoading } = trpc.assessment.getQuestions.useQuery();
  const submitResult = trpc.assessment.submitResult.useMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  // New state to show a loading screen while routing to the results
  const [isCalculating, setIsCalculating] = useState(false); 

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Loading Tactical Scenarios...
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <div className="text-muted-foreground p-10 text-center pt-24">No active scenarios found in the database.</div>;
  }

  const handleAnswer = (category: string) => {
    const newAnswers = [...answers, category];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1); // Next Question
    } else {
      // Quiz Complete! 
      setIsCalculating(true); // Trigger transition screen
      
      const counts = newAnswers.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      // Save it to Supabase via tRPC
      submitResult.mutate({ userIdentifier: TEST_USER_ID, resultCategory: dominantCategory });
      
      // TELEPORT TO THE PROTOCOL PAGE WITH THE SCORE IN THE URL
router.push(`/assessment/results?type=${dominantCategory}`);
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen pt-24 bg-transparent flex items-center justify-center">
        <div className="text-amber-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Generating Tactical Protocol...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8 flex flex-col items-center pt-24 pb-24">
      <div className="w-full max-w-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Diagnostic Phase
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Scenario {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <Card className="bg-card/80 border-border/40 backdrop-blur-md overflow-hidden card-glow">
          {currentQ.imageUrl && (
            <div className="w-full h-48 md:h-64 bg-secondary">
              <img src={currentQ.imageUrl} alt="Scenario" className="w-full h-full object-cover opacity-80" />
            </div>
          )}
          
          <CardContent className="p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-8 text-foreground">
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

function OptionButton({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 bg-secondary/20 hover:bg-blue-500/10 border border-border/40 hover:border-blue-500/50 text-muted-foreground hover:text-foreground rounded-xl transition-all flex items-center justify-between group"
    >
      <span className="font-medium pr-4 leading-relaxed">{text}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 shrink-0 transition-colors" />
    </button>
  );
}