"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setJobResourceStatusAction, deleteJobResourceAction } from "./actions";

export function JobResourceRowActions({ id, status }: { id: number; status: string }) {
  const [isPending, setIsPending] = useState(false);

  async function setStatus(next: "approved" | "rejected") {
    setIsPending(true);
    const result = await setJobResourceStatusAction(id, next);
    setIsPending(false);
    if (!result.success) toast.error(result.error);
    else toast.success(next === "approved" ? "Approved — now live on /career-hub." : "Rejected.");
  }

  async function handleDelete() {
    const result = await deleteJobResourceAction(id);
    if (!result.success) toast.error(result.error);
    else toast.success("Deleted.");
  }

  return (
    <div className="flex items-center gap-1">
      {status !== "approved" && (
        <Button variant="ghost" size="icon" onClick={() => setStatus("approved")} disabled={isPending} title="Approve">
          <Check className="size-4 text-emerald-600" />
        </Button>
      )}
      {status !== "rejected" && (
        <Button variant="ghost" size="icon" onClick={() => setStatus("rejected")} disabled={isPending} title="Reject">
          <X className="size-4 text-muted-foreground" />
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
