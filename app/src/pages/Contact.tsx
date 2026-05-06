import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, Instagram, Youtube, Twitter, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gradient">Contact Us</h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you. Reach out anytime.</p>
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
              {submitted ? (
                <div className="text-center py-8">
                  <Send className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <p className="font-medium">Message sent!</p>
                  <p className="text-sm text-muted-foreground">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input placeholder="Your name" className="bg-secondary/50 border-border/40" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input type="email" placeholder="your@email.com" className="bg-secondary/50 border-border/40" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea placeholder="How can we help?" className="bg-secondary/50 border-border/40 min-h-[120px]" required />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <Send className="h-4 w-4 mr-2" /> Send Message
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
                <a href="mailto:menwhofeelclub@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  menwhofeelclub@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/40">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Social Media</h3>
                <div className="space-y-2">
                  <a href="https://instagram.com/menwhofeel.club" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-4 w-4" /> @menwhofeel.club
                  </a>
                  <a href="https://youtube.com/@menwhofeel.club" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="h-4 w-4" /> @menwhofeel.club
                  </a>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/50">
                    <Twitter className="h-4 w-4" /> X - Coming Soon
                  </span>
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
