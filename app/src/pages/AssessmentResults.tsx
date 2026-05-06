import { useLocation, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Flame, Target, BookOpen, Heart, Phone, ArrowRight, RefreshCw, 
  AlertTriangle, Sun, Anchor, BatteryMedium, CloudRain, CloudLightning 
} from "lucide-react";
import { useEffect } from "react";

export default function AssessmentResults() {
  const location = useLocation();
  const data = location.state as {
    score: number;
    category: string;
    answers: string;
    recommendations: string;
  } | null;

  useEffect(() => {
    if (!data) {
      window.location.href = "/assessment";
    }
  }, [data]);

  if (!data) return null;

  const { category, recommendations: recString } = data;
  const recommendations = JSON.parse(recString || "[]") as string[];

  // Reframing "scores" into supportive, non-judgmental capacity states
  const categoryInfo: Record<string, { label: string; color: string; bg: string; desc: string; icon: any }> = {
    thriving: { 
      label: "High Capacity", 
      color: "text-emerald-400", 
      bg: "bg-emerald-400/10",
      desc: "You've got a strong foundation right now. Keep nurturing what works.",
      icon: Sun
    },
    stable: { 
      label: "Steady & Grounded", 
      color: "text-blue-400", 
      bg: "bg-blue-400/10",
      desc: "You're holding things together well. Remember to make space just for yourself.",
      icon: Anchor
    },
    mild_distress: { 
      label: "Stretched Thin", 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/10",
      desc: "You're carrying a bit of a load. It's a very good time to slow down and recharge.",
      icon: BatteryMedium
    },
    moderate_distress: { 
      label: "Heavy Load", 
      color: "text-orange-400", 
      bg: "bg-orange-400/10",
      desc: "Things are feeling heavy right now. It's entirely okay to step back and ask for support.",
      icon: CloudRain
    },
    severe_distress: { 
      label: "Overwhelmed", 
      color: "text-red-400", 
      bg: "bg-red-400/10",
      desc: "You are navigating a really tough space. Please be gentle with yourself and lean on support.",
      icon: CloudLightning
    },
  };

  const info = categoryInfo[category] || categoryInfo.mild_distress;
  const isSevere = category === "severe_distress" || category === "moderate_distress";

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Flame className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Your Reflection</h1>
          <p className="text-muted-foreground mt-2">Here is a snapshot of where you are, and how we can move forward.</p>
        </div>

        {isSevere && (
          <Card className="mb-6 border-red-500/30 bg-red-950/20">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-400">You don't have to carry this alone</p>
                <p className="text-sm text-red-300/80 mt-1">
                  Your reflection shows you're going through a truly difficult time. Please consider reaching out to a crisis helpline or someone you trust.
                </p>
                <Link to="/crisis-helpline">
                  <Button size="sm" variant="outline" className="mt-3 border-red-400/30 text-red-400 hover:bg-red-950/30">
                    <Phone className="h-3 w-3 mr-2" /> Connect with Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* REFACTORED SNAPSHOT CARD */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6 relative overflow-hidden">
          {/* Subtle background glow based on their state */}
          <div className={`absolute inset-0 opacity-20 ${info.bg} blur-3xl pointer-events-none`} />
          
          <CardContent className="text-center pt-8 pb-8 relative z-10">
            <div className={`mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center ${info.bg}`}>
              <info.icon className={`h-8 w-8 ${info.color}`} />
            </div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Current Capacity
            </h2>
            <p className={`text-3xl font-semibold mb-3 ${info.color}`}>
              {info.label}
            </p>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              {info.desc}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Personalized Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Based on your reflection, here are a few gentle steps to help you right now:
            </p>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-secondary/50">
                  <Flame className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/challenges">
            <Card className="bg-card/80 border-border/40 hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Gentle Challenges</h3>
                  <p className="text-xs text-muted-foreground">Small steps to build momentum</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/guides">
            <Card className="bg-card/80 border-border/40 hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Explore Guides</h3>
                  <p className="text-xs text-muted-foreground">Tools for your mind</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/community">
            <Card className="bg-card/80 border-border/40 hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Community Space</h3>
                  <p className="text-xs text-muted-foreground">You aren't in this alone</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/stories">
            <Card className="bg-card/80 border-border/40 hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Read Stories</h3>
                  <p className="text-xs text-muted-foreground">Experiences from other men</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <Link to="/assessment">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              <RefreshCw className="h-4 w-4 mr-2" /> Check in again later
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}