"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlayCircle, FileText, Briefcase, Brain,
  HeartPulse, ShieldCheck, Stethoscope, Handshake, Lock, BookOpen, Search, LayoutGrid
} from "lucide-react";
import Link from "next/link";

// Fallback seed resources shown when the DB has no content yet
const SEED_RESOURCES: Record<string, Array<{ id: string; name: string; url: string; type: string; category: string }>> = {
  "Mental Fortitude": [
    { id: "s1", name: "How to process difficult emotions — a practical guide", url: "https://www.headspace.com/mindfulness/emotional-wellness", type: "link", category: "Mental Fortitude" },
    { id: "s2", name: "Man Therapy — humour-forward mental health resource for men", url: "https://mantherapy.org", type: "link", category: "Mental Fortitude" },
    { id: "s3", name: "Lost Connections by Johann Hari — why we get depressed and how to reconnect", url: "https://www.goodreads.com/book/show/34921573", type: "book", category: "Mental Fortitude" },
  ],
  "Financial Survival & Skills": [
    { id: "s4", name: "Budgeting for people who hate budgeting — simple framework", url: "https://www.moneysavingexpert.com/banking/budget-planning", type: "link", category: "Financial Survival & Skills" },
    { id: "s5", name: "The Total Money Makeover by Dave Ramsey — debt-free plan", url: "https://www.goodreads.com/book/show/78427", type: "book", category: "Financial Survival & Skills" },
    { id: "s6", name: "Free Introduction to Personal Finance — Khan Academy", url: "https://www.khanacademy.org/college-careers-more/personal-finance", type: "video", category: "Financial Survival & Skills" },
  ],
  "Stress & Relationships": [
    { id: "s7", name: "4-7-8 breathing explained — simple panic reset", url: "https://www.healthline.com/health/4-7-8-breathing", type: "link", category: "Stress & Relationships" },
    { id: "s8", name: "How to stop a fight before it starts — communication basics", url: "https://www.gottman.com/blog/manage-conflict-in-relationships", type: "link", category: "Stress & Relationships" },
    { id: "s9", name: "Why Men Don't Ask for Help — Andrew Fuller (TEDx)", url: "https://www.youtube.com/watch?v=example", type: "video", category: "Stress & Relationships" },
  ],
  "Physical Fundamentals": [
    { id: "s10", name: "Sleep hygiene — what actually works and what doesn't", url: "https://www.sleepfoundation.org/sleep-hygiene", type: "link", category: "Physical Fundamentals" },
    { id: "s11", name: "5-minute morning movement — no gym required", url: "https://www.youtube.com/results?search_query=5+minute+morning+stretch+men", type: "video", category: "Physical Fundamentals" },
    { id: "s12", name: "Why exercise is the closest thing to a mental health cure", url: "https://www.apa.org/topics/exercise-fitness/stress", type: "link", category: "Physical Fundamentals" },
  ],
};

const CATEGORY_CONFIG = {
  "Mental Fortitude": {
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    description: "Tools to understand your mind and build resilience.",
  },
  "Financial Survival & Skills": {
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    description: "Take control of your money and build skills that pay.",
  },
  "Stress & Relationships": {
    icon: HeartPulse,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    description: "Navigate conflict and manage pressure without burning out.",
  },
  "Physical Fundamentals": {
    icon: ShieldCheck,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    description: "Your mind relies on your body. Start with the basics.",
  },
};

const TYPE_ICONS = {
  video: PlayCircle,
  pdf: FileText,
  book: BookOpen,
  link: LayoutGrid,
};

function ResourceCard({ title, items }: { title: string; items: any[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "video" | "pdf" | "book">("all");
  const config =
    CATEGORY_CONFIG[title as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG["Mental Fortitude"];

  const visibleItems = activeTab === "all" ? items : items.filter((item) => item.type === activeTab);
  const videoCount = items.filter((i) => i.type === "video").length;
  const pdfCount = items.filter((i) => i.type === "pdf").length;
  const bookCount = items.filter((i) => i.type === "book").length;

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4 border-b border-border/20 bg-secondary/10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${config.bg} shrink-0`}>
            <config.icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <CardTitle className="text-xl mb-1">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> All
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "video" ? "bg-blue-500 text-white" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5" /> Videos ({videoCount})
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "pdf" ? "bg-rose-500 text-white" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> PDFs ({pdfCount})
          </button>
          <button
            onClick={() => setActiveTab("book")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "book" ? "bg-amber-500 text-white" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Books ({bookCount})
          </button>
        </div>

        <ul className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-2">
          {visibleItems.length === 0 ? (
            <li className="text-sm text-muted-foreground py-4 text-center">Nothing in this category yet.</li>
          ) : (
            visibleItems.map((item) => {
              const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || LayoutGrid;
              return (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target="_blank"
                    className="group flex items-start gap-3 hover:bg-secondary/40 p-2.5 -mx-2.5 rounded-lg transition-all border border-transparent hover:border-border/30"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors shrink-0" />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: resources, isLoading } = trpc.guides.getAllResources.useQuery();

  const cats = [
    "Mental Fortitude",
    "Financial Survival & Skills",
    "Stress & Relationships",
    "Physical Fundamentals",
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    // Use DB resources if available, otherwise seeds
    const source = resources && resources.length > 0 ? resources : Object.values(SEED_RESOURCES).flat();
    return cats
      .map((cat) => ({
        title: cat,
        items: source.filter(
          (r) =>
            r.category === cat &&
            (r.name.toLowerCase().includes(term) || r.category.toLowerCase().includes(term))
        ),
      }))
      .filter((c) => c.items.length > 0 || searchTerm === "");
  }, [resources, searchTerm]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-gradient">The Toolkit</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Free resources across mental health, money, stress, and physical basics. No sign-up. No paywall. Just useful things.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos, books, topics..."
              className="pl-10 h-12 bg-secondary/30 border-border/50 text-base rounded-xl focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Resources grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold">Available now</h2>
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
              Free
            </span>
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-card/40 border border-border/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.map((cat) => (
                <ResourceCard key={cat.title} title={cat.title} items={cat.items} />
              ))}
            </div>
          )}
        </div>

        {/* Coming soon */}
        <h2 className="text-2xl font-semibold mb-6">Coming soon</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ComingSoonCard
            icon={Stethoscope}
            title="Professional Counselling"
            description="Affordable, confidential one-on-one counselling directly through the platform."
          />
          <ComingSoonCard
            icon={Handshake}
            title="Career & Skills Board"
            description="Helping men learn marketable skills and find work that pays the bills."
          />
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ icon: Icon, title, description }: any) {
  return (
    <Card className="bg-card/20 backdrop-blur-sm border-border/20 relative overflow-hidden opacity-75">
      <div className="absolute top-4 right-4">
        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-border/50">
          <Lock className="h-3 w-3" /> Coming soon
        </span>
      </div>
      <CardContent className="p-8">
        <div className="p-4 rounded-full bg-secondary/30 inline-block mb-6">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
