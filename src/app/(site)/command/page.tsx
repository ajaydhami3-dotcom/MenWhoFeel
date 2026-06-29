"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { RadioTower, AlertTriangle, Zap, Info, ChevronDown } from "lucide-react";

// --- HARDCODED FAQ DATA ---
// You don't need a database for FAQs. Just edit these right here in the code.
const FAQ_DATA = [
  {
    question: "What exactly is The Forge?",
    answer: "It is a tactical rebuild system for men facing mental exhaustion. It uses daily challenges, peer comms, and brutal accountability to pull you out of the fog."
  },
  {
    question: "Are the Live Comms truly anonymous?",
    answer: "Yes. Messages burn after 24 hours. We do not track personal identifying information, but trolls will be IP-banned."
  },
  {
    question: "How do the Daily Challenges work?",
    answer: "Challenges are locked on a 24-hour timer. You cannot rush them. You complete today's objective, report in, and the next tier unlocks tomorrow."
  }
];

export default function CommandCenterPage() {
  const { data: broadcasts, isLoading } = trpc.announcements.getActive.useQuery();
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Keeps first FAQ open by default

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* ========================================== */}
        {/* SECTION 1: ACTIVE DIRECTIVES (NOTIFICATIONS) */}
        {/* ========================================== */}
        <section>
          <div className="mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <RadioTower className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Global Broadcasts</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Active Directives</h1>
          </div>

          {isLoading ? (
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">Decrypting signals...</div>
          ) : broadcasts?.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 italic">
              No active directives. Hold the line.
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts?.map((alert) => {
                // Tactical coloring based on the type of announcement
                const isAlert = alert.type === 'alert';
                const isFeature = alert.type === 'new_feature';
                
                const borderColor = isAlert ? 'border-red-500/50' : isFeature ? 'border-emerald-500/50' : 'border-blue-500/50';
                const bgColor = isAlert ? 'bg-red-500/10' : isFeature ? 'bg-emerald-500/10' : 'bg-blue-500/10';
                const textColor = isAlert ? 'text-red-400' : isFeature ? 'text-emerald-400' : 'text-blue-400';
                const Icon = isAlert ? AlertTriangle : isFeature ? Zap : Info;

                return (
                  <Card key={alert.id} className={`bg-zinc-900/60 backdrop-blur-md border ${borderColor} overflow-hidden`}>
                    <CardContent className="p-6 flex gap-4 items-start">
                      <div className={`p-3 rounded-lg ${bgColor} shrink-0`}>
                        <Icon className={`w-6 h-6 ${textColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-lg font-black uppercase tracking-tight text-white">{alert.title}</h2>
                          <span className="text-[10px] font-bold text-zinc-500 tracking-widest">
                            {new Date(alert.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                          {alert.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================== */}
        {/* SECTION 2: FAQ TERMINAL                    */}
        {/* ========================================== */}
        <section>
          <div className="mb-8 border-b border-white/5 pb-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className={`border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-zinc-900 border-zinc-700' : 'bg-black/40 hover:bg-zinc-900/50'}`}
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className={`font-bold text-sm uppercase tracking-widest ${isOpen ? 'text-white' : 'text-zinc-400'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800/50 mt-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}