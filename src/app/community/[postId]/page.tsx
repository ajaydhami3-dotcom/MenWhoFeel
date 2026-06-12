"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, ChevronUp, MessageSquare, Eye, Flag, Send,
  AlertTriangle, X, Reply,
} from "lucide-react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  mental_health: "Mental Health",
  anxiety: "Anxiety",
  depression: "Depression",
  relationships: "Relationships",
  career: "Career",
  loneliness: "Loneliness",
  self_improvement: "Self Improvement",
  venting: "Venting",
  advice_needed: "Advice Needed",
  success_stories: "Success Stories",
  need_support_now: "Need Support Now",
};

const REPORT_REASONS = [
  "Spam or scam",
  "Harassment or hate speech",
  "Inappropriate content",
  "Sharing personal information",
  "Other",
];

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
function ReportCommentModal({
  commentId,
  onClose,
}: {
  commentId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const reportComment = trpc.community.reportComment.useMutation({
    onSuccess: () => { toast.success("Reported — our team will review this."); onClose(); },
    onError: () => toast.error("Failed to submit report."),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black uppercase tracking-widest text-white text-sm">Report Comment</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${reason === r ? "bg-red-500/20 border-red-400 text-red-300" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
            >{r}</button>
          ))}
        </div>
        <button
          onClick={() => reportComment.mutate({ id: commentId, reason })}
          disabled={!reason || reportComment.isPending}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40"
        >
          {reportComment.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}

// ─── Comment Tree ─────────────────────────────────────────────────────────────
function CommentNode({
  comment,
  allComments,
  depth,
  anonId,
  onReplyCreated,
  onReport,
}: {
  comment: any;
  allComments: any[];
  depth: number;
  anonId: string;
  onReplyCreated: () => void;
  onReport: (id: number) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replies = allComments.filter((c) => c.parentCommentId === comment.id);

  const createComment = trpc.community.createComment.useMutation({
    onSuccess: () => {
      setReplyText("");
      setShowReply(false);
      onReplyCreated();
      toast.success("Reply posted");
    },
    onError: () => toast.error("Failed to post reply."),
  });

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-zinc-800 pl-4" : ""}`}>
      <div className="py-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-bold text-zinc-300">{getAnonDisplay(comment.anonymousId)}</span>
          <span className="text-[10px] text-zinc-600">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          {depth < 3 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-blue-400 transition-colors font-bold"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
          <button
            onClick={() => onReport(comment.id)}
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-red-400 transition-colors"
            title="Report"
          >
            <Flag className="w-3 h-3" />
          </button>
        </div>

        {showReply && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && replyText.trim()) {
                  e.preventDefault();
                  createComment.mutate({
                    postId: comment.postId,
                    parentCommentId: comment.id,
                    content: replyText,
                    anonymousId: anonId,
                  });
                }
              }}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            />
            <button
              onClick={() => {
                if (!replyText.trim()) return;
                createComment.mutate({
                  postId: comment.postId,
                  parentCommentId: comment.id,
                  content: replyText,
                  anonymousId: anonId,
                });
              }}
              disabled={!replyText.trim() || createComment.isPending}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {replies.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          allComments={allComments}
          depth={depth + 1}
          anonId={anonId}
          onReplyCreated={onReplyCreated}
          onReport={onReport}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const router = useRouter();
  const anonId = useAnonId();
  const postIdNum = parseInt(postId);

  const [newComment, setNewComment] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);

  const { data: post, isLoading: postLoading } = trpc.community.getPost.useQuery({ id: postIdNum });
  const { data: comments, refetch: refetchComments } = trpc.community.listComments.useQuery({ postId: postIdNum });
  const upvotePost = trpc.community.upvotePost.useMutation();

  const createComment = trpc.community.createComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast.success("Comment posted anonymously");
    },
    onError: () => toast.error("Failed to post comment."),
  });

  const isUrgent = post?.category === "need_support_now";
  const topLevelComments = (comments ?? []).filter((c) => !c.parentCommentId);

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Post not found or has been removed.</p>
        <button
          onClick={() => router.push("/community")}
          className="text-blue-400 hover:text-blue-300 font-bold text-sm"
        >
          ← Back to Community
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => router.push("/community")}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </button>

        {/* Post */}
        <article className={`rounded-2xl border p-6 mb-6 ${
          isUrgent ? "bg-red-950/20 border-red-500/30" : "bg-zinc-900/60 border-zinc-800"
        }`}>
          {isUrgent && (
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                Needs support now
              </span>
            </div>
          )}

          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ${
            isUrgent ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}>
            {CATEGORY_LABELS[post.category] ?? post.category}
          </span>

          <h1 className="text-2xl font-black text-white leading-tight mb-4">{post.title}</h1>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-5">{post.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium">{getAnonDisplay(post.anonymousId)}</span>
              <span>·</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => upvotePost.mutate({ id: post.id })}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="font-bold">{post.upvoteCount}</span>
              </button>

              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentCount ?? 0}</span>
              </span>

              <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount}</span>
              </span>
            </div>
          </div>
        </article>

        {/* Comment box */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">
            Replying as {getAnonDisplay(anonId)}
          </p>
          <textarea
            placeholder="Share your thoughts, support, or advice..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                if (!newComment.trim()) return;
                createComment.mutate({
                  postId: post.id,
                  content: newComment,
                  anonymousId: anonId,
                });
              }}
              disabled={!newComment.trim() || createComment.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {createComment.isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/60">
          <div className="px-5 py-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
              {comments?.length ?? 0} {(comments?.length ?? 0) === 1 ? "Comment" : "Comments"}
            </h2>
          </div>

          {topLevelComments.length === 0 ? (
            <div className="px-5 py-8 text-center text-zinc-600 text-sm">
              No comments yet. Be the first to respond.
            </div>
          ) : (
            <div className="px-5">
              {topLevelComments.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  allComments={comments ?? []}
                  depth={0}
                  anonId={anonId}
                  onReplyCreated={refetchComments}
                  onReport={setReportingCommentId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {reportingCommentId !== null && (
        <ReportCommentModal
          commentId={reportingCommentId}
          onClose={() => setReportingCommentId(null)}
        />
      )}
    </div>
  );
}
