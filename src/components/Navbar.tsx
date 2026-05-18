"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Phone } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/about", label: "About", icon: Heart },
    { href: "/crisis-helpline", label: "Crisis Helpline", icon: Phone },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#060810]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo — always top-left */}
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Men Who Feel" className="h-8 w-auto" />
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
        </div>
      )}
    </nav>
  );
}
