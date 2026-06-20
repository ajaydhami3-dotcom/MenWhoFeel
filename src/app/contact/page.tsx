"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Swapped the missing brand icons for safe, standard Lucide alternatives
import { Mail, MessageSquare, Send, Camera, Play, Hash, MessageCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitMutation = trpc.contact.submitMessage.useMutation({
    onSuccess: () => {
      setName("");
      setEmail("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ name, email, message });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gradient">Contact Us</h1>
          <p className="text-muted-foreground mt-2">We&apos;d love to hear from you. Reach out anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitMutation.isSuccess ? (
                <div className="text-center py-8">
                  <Send className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <p className="font-medium">Message sent!</p>
                  <p className="text-sm text-muted-foreground">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input
                      placeholder="Your name"
                      className="bg-secondary/50 border-border/40"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className="bg-secondary/50 border-border/40"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea
                      placeholder="How can we help?"
                      className="bg-secondary/50 border-border/40 min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  {submitMutation.isError && (
                    <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{submitMutation.error.message || "Something went wrong. Please try again."}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-60"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card/80 border-border/40">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </h3>
                <a href="mailto:support@menwhofeel.online" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@menwhofeel.online
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/40">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Social Media</h3>
                <div className="space-y-2">
                  <a href="https://instagram.com/men_whofeel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Camera className="h-4 w-4" /> @men_whofeel
                  </a>
                  <a href="https://youtube.com/@MenWhoFeelClub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Play className="h-4 w-4" /> @MenWhoFeelClub
                  </a>
                  <a href="https://x.com/men_whofeel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Hash className="h-4 w-4" /> @men_whofeel on X
                  </a>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/50">
                    <MessageCircle className="h-4 w-4" /> Discord - Coming Soon
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/40">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours. For crisis support, please visit our Crisis Helpline page.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
