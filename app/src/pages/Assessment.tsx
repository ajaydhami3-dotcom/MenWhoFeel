import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Compass, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: { label: string; value: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "Do you feel a sense of purpose when you wake up?",
    options: [
      { label: "Clear purpose, ready for the day", value: 20 },
      { label: "Some days are good, some are foggy", value: 15 },
      { label: "Mostly just trying to get through it", value: 10 },
      { label: "No purpose, dreading the day", value: 5 },
    ],
  },
  {
    id: 2,
    text: "How often do you mask your true feelings around others?",
    options: [
      { label: "Rarely, I have safe spaces to be real", value: 20 },
      { label: "Occasionally, but I open up to close friends", value: 15 },
      { label: "Often, it's easier to pretend I'm fine", value: 10 },
      { label: "Constantly, nobody knows what's really going on", value: 5 },
    ],
  },
  {
    id: 3,
    text: "Are you carrying frustration or anger that feels heavy?",
    options: [
      { label: "No, I process and release it well", value: 20 },
      { label: "A little bit, but manageable", value: 15 },
      { label: "Yes, it sits under the surface often", value: 10 },
      { label: "Yes, it feels overwhelming and heavy", value: 5 },
    ],
  },
  {
    id: 4,
    text: "When was the last time you felt truly rested?",
    options: [
      { label: "Recently, I sleep and recover well", value: 20 },
      { label: "A few days ago, my rest is inconsistent", value: 15 },
      { label: "It's been weeks since I felt rested", value: 10 },
      { label: "I can't remember the last time", value: 5 },
    ],
  },
  {
    id: 5,
    text: "Do you have a physical or mental space where you can let your guard down?",
    options: [
      { label: "Yes, absolutely", value: 20 },
      { label: "Most of the time, yes", value: 15 },
      { label: "Rarely, only when completely alone", value: 10 },
      { label: "Nowhere feels truly safe or relaxing", value: 5 },
    ],
  },
  {
    id: 6,
    text: "How often do you feel like you are just 'going through the motions'?",
    options: [
      { label: "Rarely, I feel engaged in my life", value: 20 },
      { label: "Sometimes, routine gets boring", value: 15 },
      { label: "Most days feel like a blur", value: 10 },
      { label: "Every day is autopilot, I feel detached", value: 5 },
    ],
  },
  {
    id: 7,
    text: "Are you finding it difficult to focus on tasks that used to engage you?",
    options: [
      { label: "My focus is sharp and consistent", value: 20 },
      { label: "Sometimes my mind wanders", value: 15 },
      { label: "Often hard to concentrate", value: 10 },
      { label: "Complete brain fog, can't finish anything", value: 5 },
    ],
  },
  {
    id: 8,
    text: "Do you feel genuinely supported by the other men in your life?",
    options: [
      { label: "Strongly supported by a solid group", value: 20 },
      { label: "I have a couple of reliable guys", value: 15 },
      { label: "I know people, but we don't talk deep", value: 10 },
      { label: "Completely isolated, I handle things alone", value: 5 },
    ],
  },
  {
    id: 9,
    text: "Are financial or career pressures currently affecting your sleep?",
    options: [
      { label: "Not at all, things are stable", value: 20 },
      { label: "Occasionally keeps me up", value: 15 },
      { label: "Frequently waking up stressed about it", value: 10 },
      { label: "Constant anxiety, unable to sleep", value: 5 },
    ],
  },
  {
    id: 10,
    text: "How quickly are you able to recover and re-center after a major setback?",
    options: [
      { label: "Quickly, I adapt and move forward", value: 20 },
      { label: "Takes a day or two, but I bounce back", value: 15 },
      { label: "I dwell on it for a long time", value: 10 },
      { label: "Setbacks completely derail me", value: 5 },
    ],
  },
];

export default function Assessment() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      // Calculate results dynamically based on total questions
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
      const maxScore = questions.length * 20;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      let category: string;
      let recommendations: string[];
      
      if (percentage >= 80) {
        category = "thriving";
        recommendations = [
          "Maintain your routines and habits",
          "Share your positive strategies with the community",
          "Try mentoring others who are struggling",
          "Focus on growth and skill-building challenges",
        ];
      } else if (percentage >= 60) {
        category = "stable";
        recommendations = [
          "Practice daily mindfulness or meditation",
          "Journal your thoughts 10 minutes a day",
          "Join community discussions for accountability",
          "Take on weekly challenges to maintain momentum",
        ];
      } else if (percentage >= 40) {
        category = "mild_distress";
        recommendations = [
          "Prioritize sleep hygiene (consistent bedtime, no screens)",
          "Take 20-minute daily walks",
          "Start a gratitude journal",
          "Reach out to someone in the community",
        ];
      } else if (percentage >= 20) {
        category = "moderate_distress";
        recommendations = [
          "Consider speaking with a mental health professional",
          "Practice grounding techniques when overwhelmed",
          "Reduce alcohol and caffeine intake",
          "Use the crisis helpline if thoughts become dark",
          "Join the community chat for daily support",
        ];
      } else {
        category = "severe_distress";
        recommendations = [
          "Please reach out to a crisis helpline immediately",
          "Contact a mental health professional today",
          "Tell someone you trust how you're feeling",
          "Avoid being alone for long periods",
          "Use our community resources and support",
        ];
      }

      const resultData = {
        score: percentage,
        category,
        answers: JSON.stringify(answers),
        recommendations: JSON.stringify(recommendations),
      };

      navigate("/assessment/results", { state: resultData });
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const canProceed = answers[question.id] !== undefined;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Compass className="h-10 w-10 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Know Where You Are
          </h1>
          <p className="text-muted-foreground mt-2">
            Question {current + 1} of {questions.length}
          </p>
        </div>

        {/* Progress Bar with Blue theme */}
        <div className="mb-8 h-2 w-full bg-secondary overflow-hidden rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  answers[question.id] === option.value
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-border/40 hover:border-blue-500/30 hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                      answers[question.id] === option.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={current === 0}
            className="border-border/40 hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {current === questions.length - 1 ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> See Results
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}