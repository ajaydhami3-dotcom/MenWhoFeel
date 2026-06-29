import Link from "next/link";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
          Nothing here.
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          The page you were looking for doesn&apos;t exist, or it moved. Doesn&apos;t
          mean you took a wrong turn — just means this particular link did.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back home
          </Link>
          <Link
            href="/intel"
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
