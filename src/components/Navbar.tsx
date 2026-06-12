"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Phone, Users, BookOpen, Target, Wrench, Coffee, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/stories", label: "Stories", icon: BookOpen },
    { href: "/community", label: "Community", icon: Users },
    { href: "/communication", label: "Communication", icon: MessageCircle },
    { href: "/challenges", label: "Challenges", icon: Target },
    { href: "/guides", label: "Support & Growth", icon: Wrench },
    { href: "/about", label: "About", icon: Heart },
    { href: "/crisis-helpline", label: "Crisis Helpline", icon: Phone },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#060810]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Men Who Feel — Anonymous men's mental health community"
            className="h-8 w-auto"
            width={32}
            height={32}
            loading="eager"
          />
          <span className="hidden sm:inline text-base font-bold text-gradient">
            MenWhoFeel
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : link.href === "/crisis-helpline"
                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  : link.href === "/communication"
                  ? "text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://ko-fi.com/menwhofeel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/80 hover:bg-secondary/50 transition-all duration-200"
            aria-label="Support Men Who Feel on Ko-fi"
          >
            <Coffee className="h-3.5 w-3.5 text-amber-400/80" />
            <span>Support us</span>
          </a>
          <Link href="/assessment">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
              Check In
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-[#060810]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : link.href === "/crisis-helpline"
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : link.href === "/communication"
                  ? "text-teal-400 hover:bg-teal-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link href="/assessment" onClick={() => setMobileOpen(false)}>
            <Button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold">
              Check In
            </Button>
          </Link>
          <a
            href="https://ko-fi.com/menwhofeel"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border/30 hover:border-border/60 hover:bg-secondary/30 transition-all duration-200"
          >
            <Coffee className="h-4 w-4 text-amber-400/80" />
            Support this space
          </a>
        </div>
      )}
    </nav>
  );
}
