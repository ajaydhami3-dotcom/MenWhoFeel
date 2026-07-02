"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, CheckCircle2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publishSocialAction } from "./actions";
import { cn } from "@/lib/utils";

type Platform = "reddit" | "x" | "instagram" | "youtube";
type DraftStatus = "pending" | "approved" | "published" | "failed" | "skipped";

interface SocialDraftCardProps {
  draftId: number;
  platform: Platform;
  status: DraftStatus;
  content: Record<string, unknown>;
  error: string | null;
  publishedUrl?: string | null;
  canPublish: boolean; // false for instagram/youtube per spec
}

const PLATFORM_LABELS: Record<Platform, string> = {
  reddit: "Reddit",
  x: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
};

export function SocialDraftCard({
  draftId,
  platform,
  status: initialStatus,
  content,
  error: initialError,
  canPublish,
}: SocialDraftCardProps) {
  const [status, setStatus] = useState<DraftStatus>(initialStatus);
  const [error, setError] = useState<string | null>(initialError);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishSocialAction(draftId);
      if (result.success) {
        setStatus("published");
        setPublishedUrl(result.url ?? null);
        toast.success(`Published to ${PLATFORM_LABELS[platform]}!`);
      } else {
        setStatus("failed");
        setError(result.error ?? "Unknown error");
        toast.error(`Failed to publish: ${result.error}`);
      }
    });
  }

  const isPublished = status === "published";
  const isFailed = status === "failed";

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{PLATFORM_LABELS[platform]}</span>
        <Badge
          variant="outline"
          className={cn(
            isPublished && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
            isFailed && "border-destructive/30 bg-destructive/10 text-destructive",
            status === "pending" && "border-amber-500/30 bg-amber-500/10 text-amber-400"
          )}
        >
          {status}
        </Badge>
      </div>

      {/* Platform-specific content preview */}
      <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 rounded p-3">
        {platform === "reddit" && (
          <>
            <p><span className="text-foreground font-medium">Title:</span> {content.title as string}</p>
            <p className="line-clamp-3">{content.body as string}</p>
            <p className="text-xs">Subreddits: {(content.suggestedSubreddits as string[])?.join(", ")}</p>
          </>
        )}
        {platform === "x" && (
          <>
            <p>{content.post as string}</p>
            <p className="text-xs">{(content.hashtags as string[])?.join(" ")}</p>
          </>
        )}
        {platform === "instagram" && (
          <>
            <p className="line-clamp-3">{content.caption as string}</p>
            <p className="text-xs">{(content.hashtags as string[])?.slice(0, 8).join(" ")}</p>
          </>
        )}
        {platform === "youtube" && (
          <>
            <p><span className="text-foreground font-medium">Title:</span> {content.title as string}</p>
            <p className="line-clamp-2 text-xs">{content.description as string}</p>
            <p className="text-xs">Tags: {(content.tags as string[])?.join(", ")}</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {publishedUrl && (
        <a
          href={publishedUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-emerald-400 hover:underline"
        >
          View post <ExternalLink className="size-3" />
        </a>
      )}

      {!isPublished && (
        <div className="flex gap-2">
          {canPublish ? (
            <Button
              size="sm"
              disabled={isPending || isPublished}
              onClick={handlePublish}
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
              Publish
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              {platform === "instagram"
                ? "Instagram publishing is manual — copy the caption above."
                : "YouTube — use this metadata when recording your video."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
