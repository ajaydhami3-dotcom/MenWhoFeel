import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlayCircle, FileText, ExternalLink, Briefcase, Brain, 
  HeartPulse, ShieldCheck, Stethoscope, Handshake, Lock 
} from "lucide-react";
import { Link } from "react-router"; 

export default function Guides() {
  // The active Resource Hub
  const libraries = [
    {
      title: "Mental Fortitude",
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      description: "Tools to understand your mind and build resilience.",
      items: [
        { name: "Understanding Male Depression", type: "video", url: "#", icon: PlayCircle },
        { name: "Meditations by Marcus Aurelius", type: "pdf", url: "#", icon: FileText },
        { name: "The 5-Minute Grounding Technique", type: "article", url: "#", icon: ExternalLink },
      ]
    },
    {
      title: "Financial Survival & Skills",
      icon: Briefcase,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      description: "Take control of your money and build marketable skills.",
      items: [
        { name: "Free Web Development Bootcamp", type: "link", url: "#", icon: ExternalLink },
        { name: "How to Negotiate Debt Effectively", type: "video", url: "#", icon: PlayCircle },
        { name: "Zero-Based Budgeting Template", type: "pdf", url: "#", icon: FileText },
      ]
    },
    {
      title: "Stress & Relationships",
      icon: HeartPulse,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      description: "Navigate conflict and manage overwhelming pressure.",
      items: [
        { name: "Communicating When You're Angry", type: "video", url: "#", icon: PlayCircle },
        { name: "Navigating Attachment Styles", type: "article", url: "#", icon: ExternalLink },
        { name: "De-escalation Worksheet", type: "pdf", url: "#", icon: FileText },
      ]
    },
    {
      title: "Physical Fundamentals",
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      description: "Your mind relies on your body. Get the basics right.",
      items: [
        { name: "Beginner Bodyweight Routine", type: "video", url: "#", icon: PlayCircle },
        { name: "Sleep Hygiene Checklist", type: "pdf", url: "#", icon: FileText },
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-gradient">A Helping Hand</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            We're building a complete ecosystem to help you get back on your feet. Start with our free knowledge base today, and look out for more professional support coming soon.
          </p>
        </div>

        {/* SECTION 1: The Resource Hub (Active) */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold">The Resource Hub</h2>
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
              Available Now
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {libraries.map((category) => (
              <Card key={category.title} className="bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/20 bg-secondary/10">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${category.bg} shrink-0`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 p-6">
                  <ul className="space-y-3">
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <Link to={item.url} target="_blank" className="group flex items-start gap-3 hover:bg-secondary/40 p-3 -mx-3 rounded-lg transition-all border border-transparent hover:border-border/30">
                          <item.icon className="h-5 w-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors shrink-0" />
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-semibold">
                              {item.type}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 2: Future Initiatives (Coming Soon) */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Future Initiatives</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Therapy Card */}
            <Card className="bg-card/20 backdrop-blur-sm border-border/20 relative overflow-hidden opacity-80 grayscale-[30%]">
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-border/50">
                  <Lock className="h-3 w-3" /> Coming Soon
                </span>
              </div>
              <CardContent className="p-8">
                <div className="p-4 rounded-full bg-secondary/30 inline-block mb-6">
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Professional Counseling</h3>
                <p className="text-muted-foreground">
                  We are working to partner with vetted, licensed therapists who understand men's issues to provide affordable, confidential 1-on-1 counseling directly through the platform.
                </p>
              </CardContent>
            </Card>

            {/* Jobs Card */}
            <Card className="bg-card/20 backdrop-blur-sm border-border/20 relative overflow-hidden opacity-80 grayscale-[30%]">
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-border/50">
                  <Lock className="h-3 w-3" /> Coming Soon
                </span>
              </div>
              <CardContent className="p-8">
                <div className="p-4 rounded-full bg-secondary/30 inline-block mb-6">
                  <Handshake className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Career Opportunity Board</h3>
                <p className="text-muted-foreground">
                  Financial stress is a massive burden on mental health. We are building a network to help men find remote work, learn marketable skills, and land jobs that pay the bills.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}