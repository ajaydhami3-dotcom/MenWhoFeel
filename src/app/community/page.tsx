"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, ShieldAlert, User, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CommunityPage() {
  const [messages, setMessages] = useState<
    Array<{ id: number; authorName: string; content: string; createdAt: Date }>
  >([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: initialMessages } = trpc.chat.recent.useQuery({ limit: 50 });

  const createMessage = trpc.chat.create.useMutation({
    onSuccess: (newMsg) => {
      if (newMsg) {
        const msgToAdd = Array.isArray(newMsg) ? newMsg[0] : newMsg;
        setMessages((prev) => [...prev, msgToAdd]);
      }
      setContent("");
    },
  });

  useEffect(() => {
    if (initialMessages) {
      if (Array.isArray(initialMessages)) {
        setMessages([...initialMessages].reverse());
      } else if ((initialMessages as any).messages) {
        setMessages([...(initialMessages as any).messages].reverse());
      } else if ((initialMessages as any).data) {
        setMessages([...(initialMessages as any).data].reverse());
      }
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      utils.chat.recent.invalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [utils]);

  const handleSend = () => {
    if (!content.trim()) return;
    createMessage.mutate({
      authorName: authorName || "Anonymous",
      content,
    });
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Live</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Community</h1>
            <p className="text-zinc-500 font-medium mt-3 max-w-xl">
              Say what's on your mind. Listen to what's on someone else's. Messages disappear after 24 hours.
            </p>
          </div>
        </div>

        {/* Chat */}
        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-black/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-3 font-bold uppercase tracking-widest text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Global channel
              </CardTitle>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                Moderated
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium uppercase tracking-widest text-sm">
                    Nothing here yet. Be the first to say something.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={msg.id || index} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                    <User className="h-5 w-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-sm font-bold text-zinc-200">{msg.authorName}</span>
                      <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed break-words bg-black/20 p-3 rounded-xl rounded-tl-none border border-white/5 inline-block">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4 bg-black/40">
              <div className="flex gap-3 mb-3">
                <Input
                  placeholder="Name or handle (optional)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus:ring-blue-500/50 w-1/3 h-12 text-xs"
                />
                <Input
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="bg-zinc-900 border-zinc-800 text-white flex-1 focus:ring-blue-500/50 h-12"
                />
                <button
                  onClick={handleSend}
                  disabled={!content.trim() || createMessage.isPending}
                  className="px-6 py-0 h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">
                Anonymous by default · Messages disappear after 24 hours · No hate, no spam
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}