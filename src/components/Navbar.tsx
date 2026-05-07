import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Flame, Menu, X, Heart, Phone, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home", icon: Flame },
    { to: "/about", label: "About", icon: Heart },
    { to: "/disclaimer", label: "Disclaimer", icon: AlertTriangle },
    { to: "/crisis-helpline", label: "Crisis Helpline", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="MenWhoFeel" className="h-10 w-auto" />
          <span className="hidden sm:inline text-lg font-bold text-gradient">
            MenWhoFeel
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/assessment">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold">
              Know Where You Are
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link to="/assessment" onClick={() => setMobileOpen(false)}>
            <Button className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold">
              Know Where You Are
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
