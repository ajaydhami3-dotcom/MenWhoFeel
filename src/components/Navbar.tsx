"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Coffee } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/stories", label: "Stories" },
  { href: "/community", label: "Community" },
  { href: "/communication", label: "Communication" },
  { href: "/challenges", label: "Challenges" },
  { href: "/guides", label: "Support & Growth" },
];

// Kept as its own constant, styled apart from NAV_LINKS everywhere it's
// used: this is a safety-relevant link and should stay findable at a
// glance regardless of theme or active state, not blend into the rest of
// the nav rhythm.
const CRISIS_LINK = { href: "/crisis-helpline", label: "Crisis Helpline" };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — "Feel" is always set in italic display serif; the one
            recurring typographic device that carries the brand, here and
            in the footer, instead of a decorative mark. */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Men Who Feel"
            width={30}
            height={30}
            className="h-7 w-auto"
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            MenWho<span className="font-display italic text-primary">Feel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={CRISIS_LINK.href}
            className="ml-1 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-signal hover:bg-signal/10"
          >
            <Phone className="h-3.5 w-3.5" />
            {CRISIS_LINK.label}
          </Link>
        </nav>

        {/* Right side: support link + primary CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="https://ko-fi.com/menwhofeel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Coffee className="h-3.5 w-3.5" />
            Support us
          </a>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/assessment">Check In</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            className="rounded-full p-2 text-foreground hover:bg-accent/60"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="space-y-1 border-t border-border/70 bg-background px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={CRISIS_LINK.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-signal hover:bg-signal/10"
          >
            <Phone className="h-4 w-4" />
            {CRISIS_LINK.label}
          </Link>
          <Button asChild className="mt-2 w-full rounded-full">
            <Link href="/assessment" onClick={() => setMobileOpen(false)}>
              Check In
            </Link>
          </Button>
          <a
            href="https://ko-fi.com/menwhofeel"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Coffee className="h-4 w-4" />
            Support this space
          </a>
        </div>
      )}
    </header>
  );
}
