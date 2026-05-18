"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, BookOpen,
  ArrowRight, Wrench, MessageSquare
} from "lucide-react";
import { Suspense } from "react";

const RESULTS: Record<string, any> = {
  overloaded: {
    title: "Mentally Overloaded",
    tagline: "You're carrying more than you should have to.",
    desc: "Things are piling up faster than you can process them. You're still functioning, but something has to give. That's not weakness — it's information.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Some days holding yourself together takes everything.",
    nextSteps: [
      { label: "Read stories from men in the same place", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Find tools for managing mental load", action: "Explore Toolkit", href: "/guides", icon: Wrench },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: Users },
    ],
  },
  disconnected: {
    title: "Emotionally Disconnected",
    tagline: "You're present, but not quite here.",
    desc: "You may be going through the motions without feeling much. That flatness is its own kind of heaviness. It's worth paying attention to.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Feeling numb isn't the same as being okay.",
    nextSteps: [
      { label: "Stories from men who felt the same way", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community check-in — just listen if you like", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Mental health guides and resources", action: "Explore Toolkit", href: "/guides", icon: Wrench },
    ],
  },
  pressure: {
    title: "Running on Pressure",
    tagline: "You're keeping it together — but at a cost.",
    desc: "You're functional. You show up. But internally, you're running hot. The pressure isn't going away on its own, and ignoring it has a shelf life.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    microcopy: "Small improvements matter. You don't have to overhaul everything.",
    nextSteps: [
      { label: "Read from men who've been here", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Practical resources to reduce pressure", action: "Explore Toolkit", href: "/guides", icon: Wrench },
      { label: "Talk anonymously with other men", action: "Join Community", href: "/community", icon: Users },
    ],
  },
  burnout: {
    title: "Burned Out",
    tagline: "You've been running on empty for a while.",
    desc: "Rest isn't restoring you. That's a signal. Burnout isn't laziness — it's the result of giving everything without ever refilling. Something needs to change.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "You can't pour from an empty cup. That's not a cliché — it's just true.",
    nextSteps: [
      { label: "Stories from men who burned out and found their way", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Recovery resources in the toolkit", action: "Explore Toolkit", href: "/guides", icon: Wrench },
      { label: "Community — you don't have to talk, just read", action: "Join Community", href: "/community", icon: MessageSquare },
    ],
  },
  directionless: {
    title: "Directionless",
    tagline: "You're not sure where you're going right now.",
    desc: "That uncertainty is unsettling. When you don't know what you're working toward, everything feels heavier. You're not lost — you're just between things.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    microcopy: "Not knowing where you're going isn't the same as being stuck.",
    nextSteps: [
      { label: "Stories from men finding their footing", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Guides that help with direction and purpose", action: "Explore Toolkit", href: "/guides", icon: Wrench },
      { label: "Talk to other men in the same place", action: "Join Community", href: "/community", icon: Users },
    ],
  },
  isolated: {
    title: "Isolated but Functional",
    tagline: "You're doing fine on the outside. Less so on the inside.",
    desc: "You haven't broken down. You're still showing up. But something is going unsaid, and the silence is building. Connection doesn't have to mean vulnerability — it just means honesty.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    microcopy: "You don't have to carry everything silently.",
    nextSteps: [
      { label: "Read stories from men who've been isolated", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community — anonymous and low-pressure", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Resources for connection and mental health", action: "Explore Toolkit", href: "/guides", icon: Wrench },
    ],
  },
  // Legacy categories from old DB
  functional: {
    title: "Isolated but Functional",
    tagline: "You're doing fine on the outside. Less so on the inside.",
    desc: "You're holding it together. But something is going unsaid, and the silence is building.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    microcopy: "You don't have to carry everything silently.",
    nextSteps: [
      { label: "Read stories from men who've been there", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community — anonymous, low-pressure", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Resources and toolkit", action: "Explore Toolkit", href: "/guides", icon: Wrench },
    ],
  },
};

// Catch-all for legacy DB categories
const legacyMap: Record<string, string> = {
  tactician: "pressure",
  operator: "burnout",
  vanguard: "isolated",
  civilian: "overloaded",
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type") || "overloaded";
  const type = RESULTS[rawType] ? rawType : (legacyMap[rawType] || "overloaded");
  const result = RESULTS[type];

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-24">

      {/* Result header */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your reflection result</p>
          <h1 className={`text-3xl md:text-4xl font-bold ${result.color} mb-1`}>
            {result.title}
          </h1>
          <p className="text-base text-muted-foreground font-medium">{result.tagline}</p>
        </div>

        <Card className={`bg-card/80 backdrop-blur-sm border ${result.border} card-glow`}>
          <CardContent className="p-6 md:p-7">
            <p className="text-foreground leading-relaxed mb-4">{result.desc}</p>
            <p className={`text-sm font-medium ${result.color} italic`}>"{result.microcopy}"</p>
          </CardContent>
        </Card>
      </section>

      {/* Next steps */}
      <section className="space-y-4 pt-4 border-t border-border/30">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">Where to go from here</h2>
          <p className="text-sm text-muted-foreground mt-1">A few places that might help right now.</p>
        </div>
        <div className="space-y-3">
          {result.nextSteps.map((step: any, i: number) => {
            const Icon = step.icon;
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
        <Link href="/assessment">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">
            Take the reflection again
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <Suspense fallback={<div className="text-center pt-20 animate-pulse text-muted-foreground text-sm">Working out your results...</div>}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
