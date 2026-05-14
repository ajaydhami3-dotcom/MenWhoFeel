"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, Target, Users, BookOpen, 
  ArrowRight, Shield, Flame, Zap 
} from "lucide-react";
import { Suspense } from "react";

// --- THE DYNAMIC CURE DATABASE ---
const ARCHETYPES: Record<string, any> = {
  tactician: { 
    title: "The Tactician", 
    desc: "You rely on discipline, systems, and cold logic. When crisis hits, you stabilize the environment and execute the plan without emotion.", 
    icon: Target, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    protocol: [
      { step: "1. Optimize the Machine", desc: "Your physical routine is your anchor. Start a daily physical challenge to lock in your baseline.", action: "Start Daily Challenge", link: "/challenges", icon: Activity, stepBorder: "border-blue-500/30" },
      { step: "2. Analyze Field Reports", desc: "Read how other Tacticians navigated burnout and system failure.", action: "Read Field Reports", link: "/stories", icon: BookOpen, stepBorder: "border-blue-500/30" },
      { step: "3. Share the Framework", desc: "Jump into Comms. Other men need your logical approach to stabilize their own situations.", action: "Open Live Comms", link: "/community", icon: Users, stepBorder: "border-blue-500/30" }
    ]
  },
  operator: { 
    title: "The Operator", 
    desc: "You are heavily action-biased. You move fast, adapt instantly, and grind through obstacles through sheer force of will.", 
    icon: Flame, 
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    protocol: [
      { step: "1. Channel the Output", desc: "You need a target. Lock in a weekly challenge to direct your energy efficiently.", action: "View Challenges", link: "/challenges", icon: Target, stepBorder: "border-orange-500/30" },
      { step: "2. Ground Truth", desc: "Operators burn out because they don't pause. Read stories of men who pushed too hard.", action: "Read Field Reports", link: "/stories", icon: BookOpen, stepBorder: "border-orange-500/30" },
      { step: "3. Squad Sync", desc: "Link up with the community. Fast movers need a solid team to check their blind spots.", action: "Open Live Comms", link: "/community", icon: Users, stepBorder: "border-orange-500/30" }
    ]
  },
  vanguard: { 
    title: "The Vanguard", 
    desc: "Your strength is your network. You pull others up with you, seek counsel from mentors, and lead from the front lines.", 
    icon: Shield, 
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    protocol: [
      { step: "1. Lead by Example", desc: "Take on a daily discipline challenge. The pack follows the leader's baseline.", action: "Start Daily Challenge", link: "/challenges", icon: Activity, stepBorder: "border-emerald-500/30" },
      { step: "2. Gather Intel", desc: "Read the stories of other men leading their families and squads through hardship.", action: "Read Field Reports", link: "/stories", icon: BookOpen, stepBorder: "border-emerald-500/30" },
      { step: "3. Hold the Line", desc: "Get into the Live Comms. There are men there right now who need your guidance.", action: "Open Live Comms", link: "/community", icon: Users, stepBorder: "border-emerald-500/30" }
    ]
  },
  civilian: { 
    title: "The Civilian", 
    desc: "You are surviving, but reactive. You are letting circumstances dictate your actions. It is time to enter the forge and take control.", 
    icon: Activity, 
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    protocol: [
      { step: "1. Stop the Bleeding", desc: "Before we fix the mind, we fix the machine. Lock in a basic daily physical habit.", action: "Start Daily Challenge", link: "/challenges", icon: Target, stepBorder: "border-zinc-500/30" },
      { step: "2. Gain Perspective", desc: "You are trapped in your own head. Read the survival logs of men who have been exactly where you are.", action: "Read Field Reports", link: "/stories", icon: BookOpen, stepBorder: "border-zinc-500/30" },
      { step: "3. Break the Isolation", desc: "Isolation multiplies anxiety. Jump into live comms. You don't have to speak—just listen.", action: "Open Live Comms", link: "/community", icon: Users, stepBorder: "border-zinc-500/30" }
    ]
  }
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "civilian"; // Fallback if URL is empty
  
  // Get the matching archetype data
  const result = ARCHETYPES[type] || ARCHETYPES["civilian"];
  const ResultIcon = result.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* --- SECTION 1: THE DIAGNOSIS --- */}
      <section className="text-center space-y-6">
        <div className={`inline-flex items-center justify-center p-4 ${result.bg} rounded-full mb-2`}>
          <ResultIcon className={`w-10 h-10 ${result.color}`} />
        </div>
        <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${result.color}`}>
          {result.title}
        </h1>
        
        <Card className={`bg-card/80 backdrop-blur-sm border ${result.border} max-w-2xl mx-auto relative overflow-hidden card-glow`}>
          <div className={`absolute top-0 left-0 w-1 h-full bg-current ${result.color}`} />
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wider">Baseline Established</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {result.desc}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* --- SECTION 2: THE CURE (TACTICAL PROTOCOL) --- */}
      <section className="space-y-6 pt-8 border-t border-border/40">
        <div className="flex items-center gap-3 mb-8">
          <Zap className={`w-6 h-6 ${result.color}`} />
          <h2 className="text-3xl font-bold text-foreground">Your Tactical Protocol</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {result.protocol.map((item: any, index: number) => {
            const Icon = item.icon;
            // Make the 3rd item span both columns
            const spanClass = index === 2 ? "md:col-span-2" : "";
            
            return (
              <Card key={index} className={`bg-card/80 border ${item.stepBorder} hover:bg-secondary/20 transition-colors group ${spanClass}`}>
                <CardContent className={`p-6 ${index === 2 ? 'sm:p-8 flex flex-col sm:flex-row items-center gap-6' : ''}`}>
                  <div className={`flex items-center gap-4 mb-4 ${index === 2 ? 'mb-0' : ''}`}>
                    <div className={`p-3 ${result.bg} rounded-lg shrink-0`}>
                      <Icon className={`w-6 h-6 ${result.color}`} />
                    </div>
                    {index !== 2 && <h3 className="text-xl font-bold text-foreground">{item.step}</h3>}
                  </div>
                  
                  <div className={index === 2 ? "flex-1 text-center sm:text-left" : ""}>
                    {index === 2 && <h3 className="text-xl font-bold text-foreground mb-2">{item.step}</h3>}
                    <p className={`text-muted-foreground text-sm ${index === 2 ? 'max-w-lg mb-0' : 'mb-6'}`}>
                      {item.desc}
                    </p>
                  </div>

                  <Link href={item.link} className={index === 2 ? "w-full sm:w-auto" : ""}>
                    <Button className={`w-full ${index === 2 ? 'sm:w-auto px-8' : ''} bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border/50`}>
                      {item.action} {index !== 2 && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function AssessmentResultsPage() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <Suspense fallback={<div className="text-center pt-20 animate-pulse text-muted-foreground">Decoding Protocol...</div>}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}