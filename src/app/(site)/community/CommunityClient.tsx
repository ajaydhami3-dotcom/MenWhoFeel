"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/router";
import {
  Plus, Search, TrendingUp, Clock, ChevronUp, MessageSquare,
  Eye, Flag, X, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = {
  key: string;
  label: string;
  emoji: string;
};

// Inferred directly from the `community.listPosts` tRPC procedure's actual
// return type, so the shape the server passes in as `initialPosts` is
// guaranteed to structurally match what trpc.community.listPosts.useQuery
// expects for `initialData` — no manually-maintained type that can drift
// out of sync with the router.
type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CommunityPost = RouterOutputs["community"]["listPosts"][number];

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { key: "all", label: "All", emoji: "🌐" },
  { key: "need_support_now", label: "Need Support Now", emoji: "🆘" },
  { key: "mental_health", label: "Mental Health", emoji: "🧠" },
  { key: "anxiety", label: "Anxiety", emoji: "😰" },
  { key: "depression", label: "Depression", emoji: "💙" },
  { key: "relationships", label: "Relationships", emoji: "❤️" },
  { key: "career", label: "Career", emoji: "💼" },
  { key: "loneliness", label: "Loneliness", emoji: "🌙" },
  { key: "self_improvement", label: "Self Improvement", emoji: "🌱" },
  { key: "venting", label: "Venting", emoji: "💬" },
  { key: "advice_needed", label: "Advice Needed", emoji: "🙋" },
  { key: "success_stories", label: "Success Stories", emoji: "⭐" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);

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

// Deterministic anonymous display from stored session ID
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const isUrgent = category === "need_support_now";
  const cat = CATEGORIES.find((c) => c.key === category);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
        isUrgent
          ? "bg-red-500/20 text-red-400 border border-red-500/40"
          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
      }`}
    >
      {cat?.emoji} {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

function PostCard({
  post,
  onUpvote,
  onReport,
}: {
  post: any;
  onUpvote: (id: number) => void;
  onReport: (id: number) => void;
}) {
  const router = useRouter();
  const isUrgent = post.category === "need_support_now";

  return (
    <article
      className={`rounded-xl border transition-all cursor-pointer group ${
        isUrgent
          ? "bg-red-950/20 border-red-500/30 hover:border-red-400/50"
          : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-600"
      }`}
      onClick={() => router.push(`/community/${post.id}`)}
    >
      {isUrgent && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Needs support now
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <CategoryBadge category={post.category} />
            <h3 className="mt-2 text-base font-bold text-white leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-3">
          {post.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="font-medium">{getAnonDisplay(post.anonymousId)}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onUpvote(post.id)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span className="font-bold">{post.upvoteCount}</span>
            </button>

            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.commentCount ?? 0}</span>
            </span>

            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewCount}</span>
            </span>

            <button
              onClick={() => onReport(post.id)}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors px-1.5 py-1 rounded hover:bg-red-500/10"
              title="Report"
            >
              <Flag className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreatePostModal({
  onClose,
  anonId,
  onCreated,
}: {
  onClose: () => void;
  anonId: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("mental_health");

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post shared anonymously");
      onCreated();
      onClose();
    },
    onError: () => toast.error("Failed to post. Please try again."),
  });

  const categoryOptions = CATEGORIES.filter((c) => c.key !== "all");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="font-black uppercase tracking-widest text-white text-sm">
              Share Anonymously
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Posting as {getAnonDisplay(anonId)}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`text-[11px] font-bold py-2 px-2 rounded-lg border transition-all text-left ${
                    category === cat.key
                      ? cat.key === "need_support_now"
                        ? "bg-red-500/20 border-red-400 text-red-300"
                        : "bg-blue-500/20 border-blue-400 text-blue-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
            />
            <p className="text-[10px] text-zinc-600 mt-1 text-right">{title.length}/300</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              Your post
            </label>
            <textarea
              placeholder="Share what you're going through..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              rows={5}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 resize-none"
            />
            <p className="text-[10px] text-zinc-600 mt-1 text-right">{content.length}/5000</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-bold hover:border-zinc-500 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              createPost.mutate({
                title,
                content,
                category: category as any,
                anonymousId: anonId,
              })
            }
            disabled={
              !title.trim() || !content.trim() || createPost.isPending
            }
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40"
          >
            {createPost.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  const reportPost = trpc.community.reportPost.useMutation({
    onSuccess: () => {
      toast.success("Reported — our team will review this.");
      onClose();
    },
    onError: () => toast.error("Failed to submit report."),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black uppercase tracking-widest text-white text-sm">Report Post</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-zinc-400 text-xs mb-4">Select a reason for reporting:</p>
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${
                reason === r
                  ? "bg-red-500/20 border-red-400 text-red-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => reportPost.mutate({ id: postId, reason })}
          disabled={!reason || reportPost.isPending}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40"
        >
          {reportPost.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityClient({ initialPosts }: { initialPosts: CommunityPost[] }) {
  const router = useRouter();
  const anonId = useAnonId();

  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<"recent" | "trending">("recent");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // The default filter combination (all categories, recent, no search) is
  // exactly what the server already fetched in community/page.tsx and
  // rendered into the initial HTML. Seeding `initialData` with it means the
  // first paint shows real posts immediately instead of the loading
  // skeleton — and it's picked up by Google without any JS execution. As
  // soon as the visitor changes a filter, this no longer applies and
  // react-query fetches normally.
  const isDefaultQuery =
    activeCategory === "all" && sort === "recent" && debouncedSearch === "";

  const { data: posts, refetch, isLoading } = trpc.community.listPosts.useQuery(
    {
      category: activeCategory,
      sort,
      search: debouncedSearch,
      limit: 30,
      offset: 0,
    },
    {
      initialData: isDefaultQuery ? initialPosts : undefined,
    }
  );

  const upvotePost = trpc.community.upvotePost.useMutation({
    onSuccess: () => refetch(),
  });

  const handleUpvote = useCallback(
    (id: number) => upvotePost.mutate({ id }),
    [upvotePost]
  );

  const urgentPosts = posts?.filter((p) => p.category === "need_support_now") ?? [];
  const regularPosts = posts?.filter((p) => p.category !== "need_support_now") ?? [];

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Community</h1>
            <p className="text-zinc-500 text-sm mt-2 max-w-lg">
              Anonymous, judgment-free space. No usernames. No profiles. Just people being honest.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/communication")}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              Communication Wall
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            />
          </div>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setSort("recent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                sort === "recent"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <Clock className="w-3 h-3" />
              Recent
            </button>
            <button
              onClick={() => setSort("trending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                sort === "trending"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Trending
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${
                activeCategory === cat.key
                  ? cat.key === "need_support_now"
                    ? "bg-red-500/20 border-red-400 text-red-300"
                    : "bg-blue-500/20 border-blue-400 text-blue-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Urgent posts first */}
            {urgentPosts.length > 0 && (
              <div className="mb-4 space-y-3">
                {urgentPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpvote={handleUpvote}
                    onReport={setReportingPostId}
                  />
                ))}
              </div>
            )}

            {/* Regular posts */}
            {regularPosts.length > 0 ? (
              <div className="space-y-3">
                {regularPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpvote={handleUpvote}
                    onReport={setReportingPostId}
                  />
                ))}
              </div>
            ) : (
              !urgentPosts.length && (
                <div className="py-16 text-center">
                  <p className="text-zinc-600 font-medium">No posts yet in this category.</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-bold"
                  >
                    Be the first to post →
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          anonId={anonId}
          onCreated={() => refetch()}
        />
      )}
      {reportingPostId !== null && (
        <ReportModal
          postId={reportingPostId}
          onClose={() => setReportingPostId(null)}
        />
      )}
    </div>
  );
}
