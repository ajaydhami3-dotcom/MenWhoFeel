"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CommentForm({ slug }: { slug: string }) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addComment = trpc.intel.addComment.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setContent("");
      setAuthorName("");
    },
  });

  if (submitted) {
    return (
      <div className="rounded-2xl border border-pine/25 bg-pine/[0.06] p-6 text-center">
        <Check className="mx-auto mb-2 h-5 w-5 text-pine" />
        <p className="font-medium text-pine">Comment posted.</p>
        <p className="mt-1 text-sm text-muted-foreground">Your voice is part of this now.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Add another comment
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Add your take
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Name or handle (optional)
          </label>
          <Input
            placeholder="Anonymous"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Your comment
          </label>
          <Textarea
            rows={4}
            placeholder="What this brought up for you…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
          <p className="mt-1 text-right text-xs text-muted-foreground/70">{content.length}/1000</p>
        </div>

        <Button
          onClick={() => {
            if (content.trim().length < 2) return;
            addComment.mutate({ slug, authorName: authorName || undefined, content: content.trim() });
          }}
          disabled={addComment.isPending || content.trim().length < 2}
          className="rounded-full"
        >
          <Send className="h-4 w-4" />
          {addComment.isPending ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </div>
  );
}
