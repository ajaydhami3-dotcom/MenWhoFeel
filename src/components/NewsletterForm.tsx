"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";

// There's no dedicated subscriber/newsletter table yet, so this reuses the
// existing contact-message pipeline (contact-router.ts -> contactMessages)
// rather than inventing new backend for a v2 visual redesign. It's a real,
// working submission — it just lands as a tagged contact message today
// instead of a managed mailing list. Worth a proper `newsletter_subscribers`
// table + route down the line if this becomes a real channel.
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = trpc.contact.submitMessage.useMutation({
    onError: (err) => setError(err.message || "Something went wrong. Try again."),
  });

  if (submit.isSuccess) {
    return (
      <div className="flex items-center gap-2.5 text-sm font-medium text-pine">
        <Check className="h-4 w-4 shrink-0" />
        You&apos;re on the list. We&apos;ll be in touch.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return;
        submit.mutate({
          name: "Newsletter signup",
          email: email.trim(),
          message: "Newsletter signup from homepage.",
        });
      }}
      className="w-full max-w-md"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 flex-1 rounded-full bg-background px-4"
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={submit.isPending}
          className="h-11 shrink-0 rounded-full px-5"
        >
          {submit.isPending ? "Sending…" : "Sign up"}
          {!submit.isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-2.5 text-xs text-muted-foreground">
        Occasional emails when there&apos;s something worth sharing. No spam, no lists sold.
      </p>
    </form>
  );
}
