import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Shield, Flame, Target, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="MenWhoFeel" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">About MenWhoFeel</h1>
          <p className="text-muted-foreground mt-2">Breaking the stigma around men's mental health</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-8">
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              MenWhoFeel was created because we believe that strength includes vulnerability. In a world that often tells men to "man up" and suppress their emotions, we've built a space where feeling is not just allowed—it's encouraged.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: provide men with the tools, community, and support they need to understand their mental state, develop healthy habits, and connect with others who understand their journey.
            </p>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Flame className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Anonymous & Safe</h3>
              <p className="text-sm text-muted-foreground">No judgment. No identification required. Share freely.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Users className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Community First</h3>
              <p className="text-sm text-muted-foreground">Real connections with men who understand what you're going through.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Target className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Actionable Growth</h3>
              <p className="text-sm text-muted-foreground">Challenges, guides, and assessments to track real progress.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Shield className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Moderated Content</h3>
              <p className="text-sm text-muted-foreground">All content is reviewed to maintain a safe, supportive environment.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Heart className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">Vulnerability is strength</strong> — Opening up takes courage, and courage is the mark of a true man.</span>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">Growth is continuous</strong> — There's no finish line for mental health. Every day is a new opportunity.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">No man is an island</strong> — We need each other. Connection is healing.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}