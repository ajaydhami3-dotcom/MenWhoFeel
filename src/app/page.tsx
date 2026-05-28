"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen, MessageSquare, ArrowRight,
  Shield, Lock, Quote
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const HERO_SNIPPETS = [
  { quote: "I'm exhausted pretending I'm okay.", handle: "anonymous", age: 31 },
  { quote: "Everyone depends on me and I'm tired.", handle: "anonymous", age: 28 },
  { quote: "I don't know how to talk about what's going on.", handle: "anonymous", age: 35 },
  { quote: "I can't remember the last time I felt calm.", handle: "anonymous", age: 42 },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
              Anonymous support for men
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-foreground">
              The one place you don&apos;t have to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                explain yourself.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-5 leading-relaxed max-w-lg">
              Share what&apos;s real. Find your footing. You&apos;re not alone.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
              <Lock className="h-3 w-3" />
              Anonymous. No account. Nothing tied to you.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/assessment">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-7 py-5 shadow-lg shadow-blue-500/20 transition-all">
                  Check In
                </Button>
              </Link>
              <Link href="/stories">
                <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-7 py-5">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Stories
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HERO_SNIPPETS.map((s, i) => (
              <Card key={i} className="bg-card/70 backdrop-blur-sm border-border/40 card-glow">
                <CardContent className="p-5">
                  <Quote className="h-4 w-4 text-blue-500/40 mb-2" />
                  <p className="text-sm text-foreground leading-relaxed mb-3 font-medium">&ldquo;{s.quote}&rdquo;</p>
                  <p className="text-xs text-muted-foreground">{s.handle}, {s.age}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const COMMUNITY_SNIPPETS = [
  { quote: "Some days holding yourself together takes everything. I finally said it out loud and it helped.", handle: "m_uk", age: 34, time: "2 hours ago" },
  { quote: "Lost my job three months ago. Still haven't told my dad. Not sure why I'm ashamed.", handle: "anon", age: 29, time: "5 hours ago" },
  { quote: "Therapy felt too clinical. This felt like talking to someone who actually gets it.", handle: "anon", age: 38, time: "yesterday" },
  { quote: "Small improvements matter. I just started sleeping 7 hours and it changed something.", handle: "dk_anon", age: 25, time: "1 day ago" },
  { quote: "You don't have to carry everything silently. I learned that here.", handle: "anon", age: 44, time: "2 days ago" },
  { quote: "I don't know what I'm doing but at least I know I'm not the only one who doesn't.", handle: "anon", age: 31, time: "3 days ago" },
];

function StoriesSection() {
  const { data: stories, isLoading } = trpc.stories.getApprovedStories.useQuery();
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Men talking honestly</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real situations. No polish.</p>
          </div>
          <Link href="/stories">
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All stories <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="h-full bg-card/80 border-border/40 min-h-[160px] animate-pulse">
                <CardHeader><div className="h-4 w-3/4 bg-secondary rounded" /></CardHeader>
                <CardContent><div className="h-12 bg-secondary rounded" /></CardContent>
              </Card>
            ))
          ) : stories?.length === 0 ? (
            <div className="md:col-span-3 p-10 border border-dashed border-border/40 rounded-xl text-center bg-card/50">
              <p className="text-muted-foreground text-sm">Nothing matched that yet. Be the first to share something.</p>
            </div>
          ) : (
            stories?.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] card-glow flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{story.excerpt}</p>
                    <p className="text-xs text-muted-foreground">By {story.authorName}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function CommunitySnippetsSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-foreground">What men talk about here</h2>
          <p className="text-muted-foreground mt-1 text-sm">Anonymous. Unfiltered. Ongoing.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMUNITY_SNIPPETS.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/60 border border-border/30 hover:border-blue-500/20 transition-colors">
              <p className="text-sm text-foreground leading-relaxed mb-3">&ldquo;{s.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.handle}, {s.age}</span>
                <span className="text-xs text-muted-foreground/50">{s.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/community">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <MessageSquare className="h-4 w-4 mr-2" />
              Join the conversation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ToolkitSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Support & Growth</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed text-sm">
              Videos, books, and guides across mental health, finances, stress, and physical basics. More resources are being added. No sign-up, no paywall.
            </p>
            <Link href="/guides">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
                Support & Growth
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Mental Health", desc: "Processing, coping, understanding" },
              { label: "Finances", desc: "Debt, stability, building up" },
              { label: "Stress", desc: "Daily pressure management" },
              { label: "Physical basics", desc: "Sleep, movement, recovery" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-card/60 border border-border/30">
                <p className="text-sm font-semibold text-foreground mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticlesSection() {
  const { data: intelLogs, isLoading } = trpc.intel.getLibrary.useQuery();

  // Don't render the section at all if loading or empty — avoids the dead section
  if (isLoading || !intelLogs || intelLogs.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Useful Reads</h2>
            <p className="text-muted-foreground mt-1 text-sm">Shared by the community.</p>
          </div>
          <Link href="/intel">
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All reads <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {intelLogs?.slice(0, 3).map((intel: any) => (
            <Link key={intel.id} href={`/intel/${intel.id}`}>
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] card-glow flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">{intel.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{intel.excerpt}</p>
                  <p className="text-xs text-blue-400 font-medium">Read article</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckInSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Daily Reflection</h2>
          <p className="text-muted-foreground mb-1 text-sm leading-relaxed">
            A short check-in — no diagnosis, no score. Just honest questions to help you understand where you&apos;re at.
          </p>
          <p className="text-muted-foreground mb-5 text-xs">Takes 2 minutes. No diagnosis.</p>
          <div className="space-y-2 mb-6">
            {[
              "Have you been keeping things to yourself lately?",
              "Do small things feel heavier than usual?",
              "Do you feel connected to yourself lately?",
              "When did you last feel genuinely okay?",
            ].map((q) => (
              <div key={q} className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <p className="text-sm text-muted-foreground">{q}</p>
              </div>
            ))}
          </div>
          <Link href="/assessment">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
              Begin Reflection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5">
          <Shield className="h-3 w-3" />
          Anonymous. Free. Always.
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          You don&apos;t have to carry everything silently.
        </h2>
        <p className="text-muted-foreground mb-7 leading-relaxed text-sm">
          Whatever&apos;s going on — bring it here. No account, no judgement, no record.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/assessment">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-8 shadow-lg shadow-blue-500/20">
              Check In
            </Button>
          </Link>
          <Link href="/stories/new">
            <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8">
              Share Anonymously
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <StoriesSection />
      <CommunitySnippetsSection />
      <ToolkitSection />
      <ArticlesSection />
      <CheckInSection />
      <FooterCTA />
    </div>
  );
}
