"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Flame, ScrollText, Target,
  Heart, Wrench, LayoutDashboard, Lock,
  Menu, X, ChevronLeft, ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const mainLinks = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/assessment", label: "Check In", icon: Flame },
    { href: "/community", label: "Community", icon: Heart },
    { href: "/stories", label: "Stories", icon: BookOpen },
    { href: "/challenges", label: "Challenges", icon: Target },
    { href: "/guides", label: "The Toolkit", icon: Wrench },
  ];

  // Journey links only shown if user has done a check-in (localStorage check)
  // For now, hidden entirely to avoid confusion with the "no account" promise
  // const journeyLinks = [...];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* --- MOBILE HAMBURGER TRIGGER --- */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 p-2 bg-[#060810] border border-slate-800 rounded-md text-slate-300 hover:text-white shadow-lg"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* --- MOBILE OVERLAY --- */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- THE SIDEBAR --- */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-[70] lg:z-30 h-[100vh] lg:h-[calc(100vh-4rem)] bg-[#060810]/95 lg:bg-[#060810]/60 backdrop-blur-md border-r border-border/40 flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/20 shrink-0">
          <span className="font-bold text-white uppercase tracking-widest text-sm">Explore</span>
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-4">
          
          {/* Main Navigation */}
          <div className="px-3 mb-6">
            {(!isCollapsed || isMobileOpen) && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2 transition-opacity duration-300">
                Explore
              </h3>
            )}
            <nav className="space-y-1">
              {mainLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Privacy Promise */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="mx-4 mt-2 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15 transition-opacity duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Anonymous</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No account needed. Nothing you share here is tied to your identity. This space belongs to you.
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex p-4 border-t border-border/20 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-2 rounded-md bg-secondary/20 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/40"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

      </aside>
    </>
  );
}
