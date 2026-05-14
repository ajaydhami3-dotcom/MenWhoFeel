"use client";

import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are BRAVO — the AI field debrief companion for Men Who Feel, an anonymous mental health and community platform for men. Your tone is: direct, no-BS, warm but stoic, like a trusted battle buddy who has been through it. Military/tactical language is your idiom but never glorify violence. You speak in short punchy sentences. You don't lecture. You ask one focused follow-up question at a time. You help men process emotions, challenges, and hard days without judgment. You acknowledge their struggle, validate without coddling, and point toward action when appropriate. Never give clinical diagnoses. If someone is in crisis, always mention the crisis helpline: text HOME to 741741 (Crisis Text Line). Keep responses under 120 words. Use occasional tactical metaphors but keep them grounded and real.`;

const ARCHETYPES = [
  { id: "thriving", label: "THRIVING", color: "#10b981", desc: "Solid baseline. Maintaining position." },
  { id: "stable", label: "STABLE", color: "#3b82f6", desc: "Holding the line. Some pressure." },
  { id: "mild_distress", label: "MILD STRAIN", color: "#f59e0b", desc: "Taking hits. Still standing." },
  { id: "moderate_distress", label: "HEAVY LOAD", color: "#f97316", desc: "Under fire. Need backup." },
  { id: "severe_distress", label: "CRITICAL", color: "#ef4444", desc: "All hands. Get support now." },
];

const OPENING_PROMPTS = [
  "What's the biggest weight you're carrying today?",
  "Where are you taking the most damage right now — work, relationships, or something inside?",
  "What happened this week that's still sitting with you?",
  "On a scale of 1–10, how close to breaking point are you? What's pushing you there?",
  "What's one thing you haven't been able to say out loud to anyone?",
];

// Define types for messages
type Message = { role: "user" | "assistant"; content: string };
type Archetype = typeof ARCHETYPES[0];

export default function DebriefPage() {
  const [phase, setPhase] = useState<"select" | "debrief">("select");
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callsign, setCallsign] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startDebrief = (arc: Archetype) => {
    setArchetype(arc);
    const opener = OPENING_PROMPTS[Math.floor(Math.random() * OPENING_PROMPTS.length)];
    const intro = `Status acknowledged: **${arc.label}**. I'm BRAVO — your field debrief AI. This is a judgment-free zone. Everything stays in this channel.\n\n${opener}`;
    setMessages([{ role: "assistant", content: intro }]);
    setPhase("debrief");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contextPrefix = `[User status: ${archetype?.label}. Callsign: ${callsign || "Anonymous"}]\n\n`;
      const apiMessages = newMessages.map((m, i) => ({
        role: m.role,
        content: i === 0 ? m.content : (m.role === "user" && i === 1 ? contextPrefix + m.content : m.content),
      }));

      // CALLING OUR SECURE NEXT.JS ROUTE INSTEAD OF ANTHROPIC DIRECTLY
      const res = await fetch("/api/bravo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Signal lost. Server rejected transmission." }]);
      } else {
        const reply = data.content?.map((b: any) => b.text || "").join("") || "Signal lost. Try again.";
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Comms interrupted. Check your connection and retry." }]);
    }

    setLoading(false);
  };

  const reset = () => {
    setPhase("select");
    setArchetype(null);
    setMessages([]);
    setInput("");
    setCallsign("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      fontFamily: "'Courier New', monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      paddingTop: "80px", // Clears your global Navbar
    }}>
      {/* Scanline overlay */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        .scan { animation: scan 3s linear infinite; }
        @keyframes scan {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
        .blink { animation: blink 1.2s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
        @keyframes pulseRing {
          0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)}
          50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}
        }
        textarea:focus, input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        .arc-card:hover { transform: translateY(-2px); }
        .arc-card { transition: all 0.2s ease; }
        strong, b { color: #7dd3fc; font-weight: 700; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e293b",
        borderTop: "1px solid #1e293b",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(6,8,16,0.95)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 80,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 8px #10b981",
          }} className="pulse-ring" />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: "0.2em",
            color: "#7dd3fc",
          }}>MEN WHO FEEL</span>
          <span style={{ color: "#334155", fontSize: 12 }} className="hidden sm:inline">// FIELD DEBRIEF AI</span>
        </div>
        {phase === "debrief" && (
          <button onClick={reset} style={{
            fontSize: 11,
            color: "#64748b",
            letterSpacing: "0.15em",
            background: "none",
            border: "1px solid #1e293b",
            borderRadius: 4,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "'Courier New', monospace",
          }}>
            ← NEW DEBRIEF
          </button>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px" }}>
        
        {phase === "select" && (
          <div className="fade-in" style={{ padding: "32px 0 24px" }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#3b82f6",
                marginBottom: 10,
              }}>// INITIATING FIELD DEBRIEF PROTOCOL</div>
              <h1 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "clamp(22px, 5vw, 38px)",
                fontWeight: 900,
                lineHeight: 1.1,
                margin: 0,
                background: "linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                ESTABLISH<br />BASELINE
              </h1>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 10, lineHeight: 1.6, fontFamily: "'Share Tech Mono', monospace" }}>
                Talk to BRAVO — your AI field companion. Anonymous. No judgment.<br />
                First: tell it where you're at.
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, letterSpacing: "0.2em", color: "#475569", display: "block", marginBottom: 6 }}>
                CALLSIGN (OPTIONAL)
              </label>
              <input
                placeholder="Anonymous"
                value={callsign}
                onChange={e => setCallsign(e.target.value)}
                style={{
                  background: "#0d1421",
                  border: "1px solid #1e293b",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#e2e8f0",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13,
                  width: "100%",
                  maxWidth: 240,
                  boxSizing: "border-box",
                  letterSpacing: "0.1em",
                }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#475569", marginBottom: 12 }}>
                SELECT CURRENT STATUS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ARCHETYPES.map(arc => (
                  <button
                    key={arc.id}
                    className="arc-card"
                    onClick={() => startDebrief(arc)}
                    style={{
                      background: "#0d1421",
                      border: `1px solid ${arc.color}33`,
                      borderLeft: `3px solid ${arc.color}`,
                      borderRadius: 6,
                      padding: "14px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: arc.color,
                      boxShadow: `0 0 8px ${arc.color}`,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: arc.color,
                        letterSpacing: "0.15em",
                        marginBottom: 3,
                      }}>{arc.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'Share Tech Mono', monospace" }}>{arc.desc}</div>
                    </div>
                    <span style={{ color: "#334155", fontSize: 16 }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <p style={{
              fontSize: 11,
              color: "#1e293b",
              marginTop: 20,
              fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: "0.05em",
              borderTop: "1px solid #1e293b",
              paddingTop: 16,
            }}>
              In crisis? Text HOME to 741741 — Crisis Text Line. Free. Confidential. 24/7.
            </p>
          </div>
        )}

        {phase === "debrief" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 16 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              padding: "8px 12px",
              background: "#0d1421",
              borderRadius: 6,
              border: `1px solid ${archetype?.color}22`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: archetype?.color,
                boxShadow: `0 0 6px ${archetype?.color}`,
              }} />
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: archetype?.color, letterSpacing: "0.15em" }}>
                {archetype?.label}
              </span>
              {callsign && (
                <>
                  <span style={{ color: "#1e293b" }}>|</span>
                  <span style={{ fontSize: 11, color: "#475569", letterSpacing: "0.1em" }}>{callsign.toUpperCase()}</span>
                </>
              )}
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#1e293b", letterSpacing: "0.1em" }}>BRAVO ONLINE</span>
            </div>

            <div style={{
              flex: 1,
              overflowY: "auto",
              paddingBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              {messages.map((msg, i) => (
                <div key={i} className="fade-in" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "#334155",
                    marginBottom: 4,
                    fontFamily: "'Share Tech Mono', monospace",
                  }}>
                    {msg.role === "user" ? (callsign || "ANON").toUpperCase() : "BRAVO"}
                  </div>
                  <div style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.role === "user" ? "#1e3a5f" : "#0d1421",
                    border: msg.role === "user" ? "1px solid #2563eb44" : "1px solid #1e293b",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: msg.role === "user" ? "#bfdbfe" : "#cbd5e1",
                    fontFamily: "'Share Tech Mono', monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                </div>
              ))}
              {loading && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#334155", marginBottom: 4, fontFamily: "'Share Tech Mono', monospace" }}>BRAVO</div>
                  <div style={{
                    padding: "12px 18px",
                    background: "#0d1421",
                    border: "1px solid #1e293b",
                    borderRadius: "12px 12px 12px 2px",
                    fontSize: 13,
                    color: "#475569",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}>
                    <span className="blink">▋</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{
              borderTop: "1px solid #1e293b",
              paddingTop: 14,
              paddingBottom: 24,
              background: "#060810",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  rows={2}
                  placeholder="Transmit message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    background: "#0d1421",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 13,
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    padding: "10px 18px",
                    background: input.trim() && !loading ? "#1d4ed8" : "#0d1421",
                    border: `1px solid ${input.trim() && !loading ? "#2563eb" : "#1e293b"}`,
                    borderRadius: 8,
                    color: input.trim() && !loading ? "#bfdbfe" : "#334155",
                    cursor: input.trim() && !loading ? "pointer" : "default",
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    transition: "all 0.2s",
                    height: 60,
                    minWidth: 70,
                  }}
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}