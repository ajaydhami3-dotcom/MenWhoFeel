"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, BookOpen,
  ArrowRight, Wrench, MessageSquare,
  CheckSquare, Bot
} from "lucide-react";
import { Suspense } from "react";

const RESULTS: Record<string, any> = {
  overloaded: {
    title: "Mentally Overloaded",
    tagline: "You're carrying more than you should have to.",
    desc: "Things are piling up faster than you can process them. You're still functioning, but something has to give. That's not weakness — that's information your body is giving you.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Some days holding yourself together takes everything.",
    actionPlan: {
      title: "Immediate Action Plan: Clear the Load",
      steps: [
        { label: "Do a brain dump tonight", detail: "Write every open task, worry, or obligation on paper. Getting it out of your head and onto a page reduces cognitive load within 10 minutes." },
        { label: "Identify one thing to say no to this week", detail: "Overload is often a boundary problem. Find one commitment that drains more than it gives and push back — even partially." },
        { label: "15-minute daily decompression window", detail: "Research shows even short recovery periods (walk, stillness, no screens) reset your nervous system. Block it like a meeting." },
        { label: "Triage vs. tackle", detail: "Separate what needs doing THIS week from everything else. Most of what feels urgent isn't. The list is shorter than it looks." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men in the same place", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Find tools for managing mental load", action: "Support & Growth", href: "/guides", icon: Wrench },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: Users },
    ],
  },
  disconnected: {
    title: "Emotionally Disconnected",
    tagline: "You're present, but not quite here.",
    desc: "You may be going through the motions without feeling much. That flatness is its own kind of heaviness — and it's worth paying attention to before it becomes harder to reach.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Feeling numb isn't the same as being okay.",
    actionPlan: {
      title: "Immediate Action Plan: Reconnect",
      steps: [
        { label: "Do something physical today", detail: "Emotional disconnection often has a physical root. Exercise — even a 20-minute walk — reactivates the nervous system and can break numbness within days." },
        { label: "Name three things you used to enjoy", detail: "Anhedonia (inability to feel pleasure) is treatable. Identifying what you've drifted from is step one to finding your way back." },
        { label: "Have one honest conversation this week", detail: "Not a therapy session — just say something real to someone. 'I've been feeling off lately' is enough to start." },
        { label: "Limit passive screen time before bed", detail: "Doom-scrolling and passive consumption deepen emotional flatness. Replace 30 minutes of it with reading or a real conversation." },
      ],
    },
    nextSteps: [
      { label: "Stories from men who felt the same way", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community check-in — just listen if you like", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Mental health guides and resources", action: "Support & Growth", href: "/guides", icon: Wrench },
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
    actionPlan: {
      title: "Immediate Action Plan: Release the Valve",
      steps: [
        { label: "Identify your top pressure source", detail: "Is it money, performance, relationships, or identity? Pressure that has no named source can't be addressed. Name it — even vaguely." },
        { label: "Build one pressure-release habit", detail: "Running, boxing, journaling, cold showers — men who have a physical outlet for pressure show significantly lower anxiety markers." },
        { label: "Audit what you're absorbing for others", detail: "Men under pressure often carry other people's stress too. Are you the one everyone leans on? That compounds. Know the difference between support and absorption." },
        { label: "Set a recovery checkpoint", detail: "Pressure-running without checkpoints leads to burnout. Block one hour this week that's entirely yours. No productivity. Just recovery." },
      ],
    },
    nextSteps: [
      { label: "Read from men who've been here", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Practical resources to reduce pressure", action: "Support & Growth", href: "/guides", icon: Wrench },
      { label: "Talk anonymously with other men", action: "Join Community", href: "/community", icon: Users },
    ],
  },
  burnout: {
    title: "Burned Out",
    tagline: "You've been running on empty for a while.",
    desc: "Rest isn't restoring you. That's a signal. Burnout isn't laziness — it's what happens when output has exceeded input for too long. Something needs to change at the root.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "You can't pour from an empty cup. That's not a cliché — it's just true.",
    actionPlan: {
      title: "Immediate Action Plan: Recover First",
      steps: [
        { label: "Stop trying to push through — recovery is the work", detail: "Burnout treated with more effort gets worse. Your first job is to reduce the output, not increase it. Identify what can be paused or delegated this week." },
        { label: "Sleep is non-negotiable", detail: "Burnout severely disrupts sleep architecture. Prioritising 7–9 hours is the single highest-leverage recovery action — before supplements, therapy, or anything else." },
        { label: "Find one thing that genuinely restores you", detail: "Not TV, not booze — something that leaves you feeling more full than before. A hobby, being in nature, physical movement, building something. What was it, before all this?" },
        { label: "Talk to someone — not to solve it, just to say it out loud", detail: "Social withdrawal is a burnout symptom and a burnout amplifier. One honest conversation per week has measurable effects on recovery timelines." },
      ],
    },
    nextSteps: [
      { label: "Stories from men who burned out and found their way", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Recovery resources", action: "Support & Growth", href: "/guides", icon: Wrench },
      { label: "Community — you don't have to talk, just read", action: "Join Community", href: "/community", icon: MessageSquare },
    ],
  },
  directionless: {
    title: "Directionless",
    tagline: "You're not sure where you're going right now.",
    desc: "That uncertainty is unsettling — and real. When purpose is absent, everything feels heavier. You're not broken. You're between things. That's a specific problem with a real path out.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    microcopy: "Not knowing where you're going isn't the same as being stuck.",
    actionPlan: {
      title: "Immediate Action Plan: Find True North",
      steps: [
        { label: "Write down what used to matter to you", detail: "Direction is often lost, not absent. Before finding new purpose, recover what you may have buried. Write three things that genuinely mattered to you 3–5 years ago." },
        { label: "Separate 'should want' from 'actually want'", detail: "A lot of directionlessness is running on borrowed values. What do you actually want — not what others expect? Even a rough answer reorients everything." },
        { label: "Take one small action in a new direction", detail: "Not a life plan — just one step. Sign up for one thing, reach out to one person, spend one afternoon doing something different. Motion changes perspective." },
        { label: "Stop waiting for clarity before moving", detail: "Clarity comes from action, not the other way around. You don't need to know the destination to take the next step." },
      ],
    },
    nextSteps: [
      { label: "Stories from men finding their footing", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Guides that help with direction and purpose", action: "Support & Growth", href: "/guides", icon: Wrench },
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
    actionPlan: {
      title: "Immediate Action Plan: Bridge the Gap",
      steps: [
        { label: "Identify one person you trust — even barely", detail: "You don't need a best friend or a therapist. You need one person to whom you can say something real. One is enough to start." },
        { label: "Lower the bar on what 'connection' means", detail: "Isolation often persists because men set the bar at 'deep talk or nothing.' A regular coffee, a gym partner, a shared hobby — all of these rebuild the neural pathways of belonging." },
        { label: "Read or listen to other men's honest accounts", detail: "The antidote to isolation isn't always talking — sometimes it's hearing. Reading real stories from men who felt what you feel is scientifically proven to reduce the sense of being alone." },
        { label: "Acknowledge the cost of silence", detail: "Chronic isolation increases cortisol, disrupts sleep, and raises depression risk by over 40%. This isn't about being social — it's about your baseline health." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've been isolated", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community — anonymous and low-pressure", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Resources for connection and mental health", action: "Support & Growth", href: "/guides", icon: Wrench },
    ],
  },
  // Legacy fallback
  functional: {
    title: "Isolated but Functional",
    tagline: "You're doing fine on the outside. Less so on the inside.",
    desc: "You're holding it together. But something is going unsaid, and the silence is building.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    microcopy: "You don't have to carry everything silently.",
    actionPlan: {
      title: "Immediate Action Plan: Bridge the Gap",
      steps: [
        { label: "Find one person to say something real to", detail: "One honest moment with one person is enough to start shifting the pattern." },
        { label: "Lower the bar for connection", detail: "It doesn't have to be a deep conversation — a shared activity, a brief check-in, something real." },
        { label: "Read other men's accounts", detail: "Hearing that others feel what you feel is one of the fastest ways to feel less alone." },
        { label: "Name what's going unsaid", detail: "Even writing it privately helps. The silence itself is part of the weight." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've been there", action: "Read Stories", href: "/stories", icon: BookOpen },
      { label: "Community — anonymous, low-pressure", action: "Join Community", href: "/community", icon: MessageSquare },
      { label: "Resources and support", action: "Support & Growth", href: "/guides", icon: Wrench },
    ],
  },
};

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
