"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen, Target, MessageSquare, ArrowRight,
  Shield, Users, Activity, Anchor, Compass, Rocket, Wrench, Lock
} from "lucide-react";
import { trpc } from "@/lib/trpc";

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060810]/85 via-[#060810]/90 to-[#060810]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Men Who Feel" className="h-24 w-auto" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              The one place you don't have
            </span>
            <br />
            <span className="text-foreground">to explain yourself.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-medium">
            A space built for men to drop the weight, share what's real, and find their footing alongside men going through the same thing.
          </p>

          {/* Anonymity promise — prominent, above the CTAs */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
            <Lock className="h-3.5 w-3.5" />
            Anonymous. No account. Nothing stored.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-blue-500/25 transition-all">
                <Compass className="h-5 w-5 mr-2" />
                See where you stand
              </Button>
            </Link>
            <Link href="/stories">
              <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8 py-6 text-lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Read stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoriesPreview() {
  const { data: stories, isLoading } = trpc.stories.featured.useQuery();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gradient">Stories</h2>
            <p className="text-muted-foreground mt-1">Real men. Real situations. No polish.</p>
          </div>
          <Link href="/stories">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All stories <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="h-full bg-card/80 border-border/40 min-h-[200px] animate-pulse">
                <CardHeader><div className="h-5 w-3/4 bg-secondary rounded" /></CardHeader>
                <CardContent><div className="h-16 bg-secondary rounded" /></CardContent>
              </Card>
            ))
          ) : stories?.length === 0 ? (
            <div className="md:col-span-3 p-12 border border-dashed border-border/40 rounded-xl text-center bg-card/50">
              <p className="text-muted-foreground">Nothing here yet. Be the first to share something.</p>
            </div>
          ) : (
            stories?.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] card-glow flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2 text-foreground">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{story.excerpt}</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest text-blue-400">By {story.authorName}</p>
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

function IntelPreview() {
  const { data: intelLogs, isLoading } = trpc.intel.getAll.useQuery();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10 relative z-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gradient">Articles</h2>
            <p className="text-muted-foreground mt-1">Useful reads. Shared by the community.</p>
          </div>
          <Link href="/intel">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto">
              All articles <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="h-full bg-card/80 border-border/40 min-h-[200px] animate-pulse">
                <CardHeader><div className="h-5 w-3/4 bg-secondary/50 rounded" /></CardHeader>
                <CardContent><div className="h-16 bg-secondary/50 rounded" /></CardContent>
              </Card>
            ))
          ) : intelLogs?.length === 0 ? (
            <div className="md:col-span-3 p-12 border border-dashed border-border/40 rounded-xl text-center bg-card/50">
              <p className="text-muted-foreground">Nothing published yet.</p>
            </div>
          ) : (
            intelLogs?.slice(0, 3).map((intel: any) => (
              <Link key={intel.id} href={`/intel/${intel.id}`}>
                <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] card-glow flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2 text-foreground">{intel.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{intel.excerpt}</p>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Read article</p>
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

function ChallengesPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gradient">Challenges</h2>
            <p className="text-muted-foreground mt-1">Small, daily actions that add up to something real.</p>
          </div>
          <Link href="/challenges">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All challenges <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Activity, title: "Daily", desc: "One small win, every day", color: "from-blue-500 to-cyan-500" },
            { icon: Target, title: "Weekly", desc: "Build habits that stick", color: "from-teal-500 to-emerald-500" },
            { icon: Anchor, title: "Monthly", desc: "Step back and measure it", color: "from-indigo-500 to-blue-500" },
            { icon: Shield, title: "Discipline", desc: "The hardest one — yourself", color: "from-red-500 to-rose-600" },
          ].map((item) => (
            <Link key={item.title} href="/challenges" className="block h-full group">
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 group-hover:border-blue-500/40 transition-all duration-300 group-hover:-translate-y-1 card-glow">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} mb-4 shadow-lg`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img src="/community.jpg" alt="Community" className="rounded-2xl shadow-2xl border border-border/20" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gradient mb-4">Community</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              A live chat where men talk to men. Say what's on your mind, pick up what someone else left down. No advice columns, no algorithms — just people.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-sm">Anonymous and judgment-free</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-sm">Moderated around the clock</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-sm">Messages disappear after 24 hours</span>
              </div>
            </div>
            <Link href="/community">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
                Join the conversation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourcesPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient">When you need more than a chat</h2>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
            Free resources and real tools — no sign-up, no paywall.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/guides" className="group">
            <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 card-glow">
              <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-blue-400 transition-colors">The Toolkit</h3>
                <p className="text-muted-foreground">
                  Videos, books, and guides across mental health, finances, stress, and physical basics. Curated and completely free.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/initiatives" className="group">
            <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 card-glow">
              <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="p-4 bg-teal-500/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-teal-400 transition-colors">What's coming</h3>
                <p className="text-muted-foreground">
                  Counselling, job support, and more. See what we're building next.
                </p>
              </CardContent>
            </Card>
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
      <StoriesPreview />
      <IntelPreview />
      <ChallengesPreview />
      <CommunityPreview />
      <ResourcesPreview />
    </div>
  );
}