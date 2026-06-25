"use client";

// Root error boundary. Next.js renders this for any uncaught error thrown
// while rendering a route (e.g. an unexpected DB/runtime error that slips
// past a page's own try/catch). Without this file, that previously fell
// through to Next's generic default error screen — a bad experience on any
// site, and a particularly bad one for a mental-health support site where
// someone may have landed on a broken link at a hard moment.
//
// This still renders inside the root layout, so Navbar/Sidebar/Footer (and
// the crisis helpline link in the footer) remain visible.

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">
          Something went wrong
        </p>
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
          This page hit a snag.
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          That&apos;s on us, not you. Nothing you were doing caused this — try again,
          or head back home. If it keeps happening, let us know.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
