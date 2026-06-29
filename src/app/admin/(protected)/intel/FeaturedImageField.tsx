"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFeaturedImageAction, removeFeaturedImageAction } from "./actions";

export function FeaturedImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    try {
      const previous = value;
      const result = await uploadFeaturedImageAction(file);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onChange(result.url);
      toast.success("Image uploaded.");
      if (previous) {
        removeFeaturedImageAction(previous).catch(() => {});
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    const previous = value;
    onChange(null);
    if (previous) {
      removeFeaturedImageAction(previous).catch(() => {});
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border">
          {/* External, Supabase-hosted URL — a plain <img> avoids configuring next/image remote patterns for this. */}
          <img src={value} alt="Featured" className="aspect-video w-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-background/90 to-transparent p-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button type="button" size="sm" variant="destructive" disabled={isUploading} onClick={handleRemove}>
              <X className="size-3.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-sm">{isUploading ? "Uploading…" : "Upload featured image"}</span>
        </button>
      )}
    </div>
  );
}
