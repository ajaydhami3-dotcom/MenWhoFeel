import { Link, useLocation } from "react-router";
import { 
  BookOpen, User, Flame, ScrollText, Target, 
  Heart, Handshake, LayoutDashboard 
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  // The core navigation of your app
  const mainLinks = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/assessment", label: "Check-in Reflection", icon: Flame },
    { to: "/challenges", label: "Challenges", icon: Target },
    { to: "/stories", label: "Read Stories", icon: BookOpen },
    { to: "/community", label: "Community Space", icon: Heart },
    { to: "/guides", label: "A Helping Hand", icon: Handshake },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-slate-950/30 backdrop-blur-sm overflow-y-auto">
      
      {/* Main App Navigation */}
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Target className="h-3 w-3" />
          The Space
        </h3>
        <nav className="space-y-1">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/20 mx-4" />

      {/* Account Section */}
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <User className="h-3 w-3" />
          My Journey
        </h3>
        <div className="space-y-1">
          <Link
            to="/assessment/history"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <ScrollText className="h-4 w-4" />
            Reflection History
          </Link>
          <Link
            to="/challenges/progress"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Target className="h-4 w-4" />
            My Progress
          </Link>
        </div>
        
        {/* Safety / Privacy Reminder */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This space is anonymous. Your reflections and history belong entirely to you.
          </p>
        </div>
      </div>
      
    </aside>
  );
}