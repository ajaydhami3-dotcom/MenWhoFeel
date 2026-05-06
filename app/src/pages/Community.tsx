import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Shield, User } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function CommunityPage() {
  const [messages, setMessages] = useState<Array<{ id: number; authorName: string; content: string; createdAt: Date }>>([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: initialMessages } = trpc.chat.recent.useQuery({ limit: 50 });
  const createMessage = trpc.chat.create.useMutation({
    onSuccess: (newMsg) => {
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      }
      setContent("");
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      utils.chat.recent.invalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [utils]);

  const handleSend = () => {
    if (!content.trim()) return;
    createMessage.mutate({
      authorName: authorName || "Anonymous",
      content,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient flex items-center justify-center gap-3">
            <MessageSquare className="h-8 w-8" />
            Community
          </h1>
          <p className="text-muted-foreground mt-2">
            A live, moderated space for men to support each other.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow">
          <CardHeader className="border-b border-border/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Live Chat
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-green-400" />
                Moderated
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>No messages yet. Start the conversation.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{msg.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-border/20 p-4 space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-secondary/50 border-border/40"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="bg-secondary/50 border-border/40 flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!content.trim() || createMessage.isPending}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Be respectful. Messages are moderated. No identifying information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
