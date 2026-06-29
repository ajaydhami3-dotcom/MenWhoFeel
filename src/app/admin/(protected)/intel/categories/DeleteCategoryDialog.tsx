"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { deleteCategoryAction } from "./actions";

export function DeleteCategoryDialog({
  categoryId,
  name,
  otherCategories,
}: {
  categoryId: number;
  name: string;
  otherCategories: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [needsReassign, setNeedsReassign] = useState<number | null>(null); // article count once known
  const [reassignTo, setReassignTo] = useState<string>("");

  async function attemptDelete(reassignToId?: number) {
    setIsDeleting(true);
    const result = await deleteCategoryAction(categoryId, reassignToId ?? null);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Category deleted.");
      setOpen(false);
      return;
    }

    if (result.articleCount) {
      setNeedsReassign(result.articleCount);
      return;
    }

    toast.error(result.error ?? "Couldn't delete that category.");
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setNeedsReassign(null);
          setReassignTo("");
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="size-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {needsReassign
              ? `${needsReassign} article${needsReassign === 1 ? "" : "s"} use this category. Pick where they should go instead.`
              : "This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {needsReassign !== null && (
          <Select value={reassignTo} onValueChange={setReassignTo}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Reassign articles to…" />
            </SelectTrigger>
            <SelectContent>
              {otherCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {needsReassign !== null ? (
            <Button
              disabled={!reassignTo || isDeleting}
              onClick={() => attemptDelete(Number(reassignTo))}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Working…" : "Reassign & delete"}
            </Button>
          ) : (
            <Button
              disabled={isDeleting}
              onClick={() => attemptDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
