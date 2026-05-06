import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, Target, MessageSquare, ArrowRight, 
  Heart, Shield, Users, Sparkles, Brain, Briefcase, 
  HeartPulse, ShieldCheck, Anchor, Compass, Activity
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" />
        {/* Softened background gradient to match the cool theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-background/90 to-background" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="MenWhoFeel" className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">It's Okay to Feel.</span>
            <br />
            <span className="text-foreground">You're Not Alone.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A judgment-free space for men to build resilience, share their stories, and find solid ground. Take the first step toward clarity today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-blue-500/25 transition-all">
                <Compass className="h-5 w-5 mr-2" />
                Know Where You Are
              </Button>
            </Link>
            <Link to="/stories">
              <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8 py-6 text-lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Read Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssessmentPreview() {
  // Expanded to 10 deep, meaningful questions
  const questions = [
    "Do you feel a sense of purpose when you wake up?",
    "How often do you mask your true feelings around others?",
    "Are you carrying frustration or anger that feels heavy?",
    "When was the last time you felt truly rested?",
    "Do you have a physical or mental space where you can let your guard down?",
    "How often do you feel like you are just 'going through the motions'?",
    "Are you finding it difficult to focus on tasks that used to engage you?",
    "Do you feel genuinely supported by the other men in your life?",
    "Are financial or career pressures currently affecting your sleep?",
    "How quickly are you able to recover and re-center after a major setback?",
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Know Where You Are</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Our comprehensive 10-point reflection helps map your current mental landscape. Get a personalized roadmap to clear the fog and find your footing.
            </p>
            <div className="bg-secondary/20 p-6 rounded-xl border border-border/40 mb-8">
              <ul className="space-y-3">
                {questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/assessment">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20 w-full sm:w-auto">
                Start Your Reflection <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl blur-3xl" />
            <Card className="relative bg-card/80 backdrop-blur-sm border-border/40 card-glow overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-blue-400/20 blur-2xl pointer-events-none" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Compass className="h-4 w-4 text-blue-400" />
                  Sample Reflection
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center gap-4 mt-2">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <Anchor className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-blue-400">Steady & Grounded</p>
                    <p className="text-xs text-muted-foreground mt-1">Holding things together well.</p>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-border/40">
                  <p className="text-sm font-medium">Gentle Steps Forward:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Deep Work", "Strength Training", "Mindful Breathing", "Brotherhood"].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoriesPreview() {
  const { data: stories } = trpc.stories.featured.useQuery();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/30 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Stories</h2>
            <p className="text-muted-foreground mt-1">Real stories from real men. Share yours anonymously.</p>
          </div>
          <Link to="/stories">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {stories?.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`} target="_blank">
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] card-glow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{story.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-4">By {story.authorName}</p>
                </CardContent>
              </Card>
            </Link>
          )) || [1, 2, 3].map((i) => (
            <Card key={i} className="h-full bg-card/80 border-border/40">
              <CardHeader>
                <div className="h-5 w-3/4 bg-secondary rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-secondary rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChallengesPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Challenges</h2>
            <p className="text-muted-foreground mt-1">Daily and weekly exercises to build discipline and mental strength.</p>
          </div>
          <Link to="/challenges">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All Challenges <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            // Updated gradients to match the cool theme, keeping Discipline Red as requested
            { icon: Activity, title: "Daily", desc: "Small wins every day", color: "from-blue-500 to-cyan-500" },
            { icon: Target, title: "Weekly", desc: "Build lasting habits", color: "from-teal-500 to-emerald-500" },
            { icon: Anchor, title: "Monthly", desc: "Spot check your growth", color: "from-indigo-500 to-blue-500" },
            { icon: Shield, title: "Discipline", desc: "Master self-control", color: "from-red-500 to-rose-600" },
          ].map((item) => (
            <Card key={item.title} className="bg-card/80 backdrop-blur-sm border-border/40 card-glow">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} mb-4 shadow-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/30 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img src="/community.jpg" alt="Community" className="rounded-2xl shadow-2xl border border-border/20" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-4">Community</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              A live chat space where men support men. Share your thoughts, get support, or just listen. Moderated for safety.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Anonymous and judgment-free</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Moderated 24/7 for safety</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Real-time conversations</span>
              </div>
            </div>
            <Link to="/community">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
                Join the Conversation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HelpingHandPreview() {
  const categories = [
    { name: "Mental Fortitude", desc: "Tools to understand your mind and build resilience.", icon: Brain },
    { name: "Financial Survival", desc: "Take control of your money and build skills.", icon: Briefcase },
    { name: "Stress & Relationships", desc: "Navigate conflict and manage pressure.", icon: HeartPulse },
    { name: "Physical Fundamentals", desc: "Your mind relies on your body. Get the basics right.", icon: ShieldCheck },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">A Helping Hand</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            A curated, completely free library of tools to help you build skills, manage stress, and get your life on solid ground.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((cat) => (
            <Link key={cat.name} to="/guides">
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] card-glow">
                <CardContent className="p-6">
                  <cat.icon className="h-8 w-8 text-blue-400 mb-4" />
                  <h3 className="font-semibold mb-2">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/guides">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              Explore The Hub <ArrowRight className="h-4 w-4 ml-2" />
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
      <AssessmentPreview />
      <StoriesPreview />
      <ChallengesPreview />
      <CommunityPreview />
      <HelpingHandPreview />
    </div>
  );
}