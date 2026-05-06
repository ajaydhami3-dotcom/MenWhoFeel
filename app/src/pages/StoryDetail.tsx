import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Send, User, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import { Link } from "react-router";

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const storyId = parseInt(id || "0");
  const { data: story } = trpc.stories.byId.useQuery({ id: storyId });
  const { data: comments, refetch } = trpc.stories.comments.useQuery({ storyId });
  const addComment = trpc.stories.addComment.useMutation({ onSuccess: () => refetch() });
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    addComment.mutate({ storyId, authorName: authorName || "Anonymous", content });
    setContent("");
    setAuthorName("");
  };

  if (!story) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 bg-secondary rounded animate-pulse mx-auto mb-4" />
          <div className="h-4 w-32 bg-secondary rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <Link to="/stories">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Stories
          </Button>
        </Link>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{story.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {story.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {story.content.split("\n").map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            Comments ({comments?.length || 0})
          </h2>

          <Card className="bg-card/80 border-border/40 mb-6">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-secondary/50 border-border/40"
              />
              <Textarea
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-secondary/50 border-border/40 min-h-[80px]"
              />
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || addComment.isPending}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {addComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Comments are moderated before appearing publicly.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {comments?.map((comment) => (
              <Card key={comment.id} className="bg-card/60 border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </CardContent>
              </Card>
            )) || (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to share your thoughts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
