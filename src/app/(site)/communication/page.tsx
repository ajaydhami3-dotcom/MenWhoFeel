"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Send, MessageCircle, ChevronDown, ChevronUp,
  Flag, X, Heart, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function getAnonDisplay(id: string): string {
  return `Anonymous #${id}`;
}

function useAnonId(): string {
  const [anonId, setAnonId] = useState("0000");
  useEffect(() => {
    let id = localStorage.getItem("mwf_anon_id");
    if (!id) {
      id = String(Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem("mwf_anon_id", id);
    }
    setAnonId(id);
  }, []);
  return anonId;
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

const REPORT_REASONS = ["Spam or scam", "Harassment or hate speech", "Inappropriate content", "Sharing personal information", "Other"];

function ReportModal({ id, type, onClose }: { id: number; type: "message" | "reply"; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const reportMsg = trpc.communication.reportMessage.useMutation({
    onSuccess: () => { toast.success("Reported."); onClose(); },
  });
  const reportReply = trpc.communication.reportReply.useMutation({
    onSuccess: () => { toast.success("Reported."); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black uppercase tracking-widest text-foreground text-sm">Report</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${reason === r ? "bg-destructive/20 border-destructive/40 text-destructive" : "bg-secondary border-border text-muted-foreground hover:border-foreground/30"}`}
            >{r}</button>
          ))}
        </div>
        <button
          onClick={() => type === "message" ? reportMsg.mutate({ id, reason }) : reportReply.mutate({ id, reason })}
          disabled={!reason}
          className="w-full py-2.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}

// ─── Message Card ─────────────────────────────────────────────────────────────

function MessageCard({ message, anonId }: { message: any; anonId: string }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: number; type: "message" | "reply" } | null>(null);

  const { data: replies, refetch } = trpc.communication.listReplies.useQuery(
    { messageId: message.id },
    { enabled: showReplies }
  );

  const createReply = trpc.communication.createReply.useMutation({
    onSuccess: () => {
      setReplyText("");
      setShowReplyBox(false);
      refetch();
      toast.success("Reply sent");
    },
    onError: () => toast.error("Failed to send reply."),
  });

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 transition-all hover:border-foreground/30">
      {/* Message content */}
      <p className="text-foreground text-sm leading-relaxed mb-4">{message.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{getAnonDisplay(message.anonymousId)}</span>
          <span>·</span>
          <span>{formatRelativeTime(message.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowReplies(!showReplies); }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-pine transition-colors font-bold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {message.replyCount > 0 ? `${message.replyCount} ${message.replyCount === 1 ? "reply" : "replies"}` : "Reply"}
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-bold px-2 py-1 rounded hover:bg-primary/10"
          >
            <Heart className="w-3 h-3" />
            Support
          </button>

          <button
            onClick={() => setReportTarget({ id: message.id, type: "message" })}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Report"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reply box */}
      {showReplyBox && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Offer some words of support..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && replyText.trim()) {
                e.preventDefault();
                createReply.mutate({ messageId: message.id, content: replyText, anonymousId: anonId });
              }
            }}
            className="flex-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pine placeholder:text-muted-foreground"
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              createReply.mutate({ messageId: message.id, content: replyText, anonymousId: anonId });
            }}
            disabled={!replyText.trim() || createReply.isPending}
            className="px-3 py-2 bg-pine hover:bg-pine/90 text-pine-foreground rounded-lg transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Replies */}
      {showReplies && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {!replies || replies.length === 0 ? (
            <p className="text-muted-foreground text-xs text-center">No replies yet. Be the first to respond.</p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-bold text-foreground">{getAnonDisplay(reply.anonymousId)}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{reply.content}</p>
                </div>
                <button
                  onClick={() => setReportTarget({ id: reply.id, type: "reply" })}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-2"
                  title="Report"
                >
                  <Flag className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {reportTarget && (
        <ReportModal id={reportTarget.id} type={reportTarget.type} onClose={() => setReportTarget(null)} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunicationPage() {
  const router = useRouter();
  const anonId = useAnonId();
  const [messageText, setMessageText] = useState("");

  // Mirrors communication-router.ts's createMessage schema
  // (z.string().min(5)) — same gap as community's title field.
  const MIN_MESSAGE = 5;
  const messageTooShort = messageText.trim().length > 0 && messageText.trim().length < MIN_MESSAGE;

  const { data: messages, refetch, isLoading } = trpc.communication.listMessages.useQuery({ limit: 50, offset: 0 });

  const createMessage = trpc.communication.createMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetch();
      toast.success("Message sent anonymously");
    },
    onError: (err) => toast.error(err.message || "Failed to send. Please try again."),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <button
          onClick={() => router.push("/community")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-pine mb-2">
            <Heart className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Support Wall</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Communication</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg">
            Sometimes you just need someone to hear you. Send a message — the community can respond.
            No names. No accounts. No judgment.
          </p>
        </div>

        {/* Send message */}
        <div className="bg-card/60 border border-pine/20 rounded-2xl p-5 mb-8">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3">
            Send an anonymous message · Posting as {getAnonDisplay(anonId)}
          </p>
          <textarea
            placeholder="What would you like to say? This is a safe space — write as much or as little as you want."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            maxLength={2000}
            rows={4}
            className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pine placeholder:text-muted-foreground resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] min-h-[1em]">
              {messageTooShort ? (
                <span className="text-amber-400">{MIN_MESSAGE - messageText.trim().length} more character{MIN_MESSAGE - messageText.trim().length === 1 ? "" : "s"} needed</span>
              ) : (
                <span className="text-muted-foreground">{messageText.length}/2000</span>
              )}
            </p>
            <button
              onClick={() => {
                if (messageText.trim().length < MIN_MESSAGE) return;
                createMessage.mutate({ content: messageText, anonymousId: anonId });
              }}
              disabled={messageText.trim().length < MIN_MESSAGE || createMessage.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-pine hover:bg-pine/90 text-pine-foreground text-sm font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {createMessage.isPending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Messages feed */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            Recent Messages
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-card/60 border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No messages yet. Be the first to reach out.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageCard key={msg.id} message={msg} anonId={anonId} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
