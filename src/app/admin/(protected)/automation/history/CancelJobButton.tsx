"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelJobAction } from "../actions";

export function CancelJobButton({ jobId }: { jobId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelJobAction(jobId);
      if (result.success) {
        toast.success("Job cancelled.");
      } else {
        toast.error(result.error ?? "Could not cancel job.");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
      Cancel
    </Button>
  );
}
