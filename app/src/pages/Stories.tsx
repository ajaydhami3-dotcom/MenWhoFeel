import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, ExternalLink } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useState } from "react";

export default function StoriesPage() {
  const { data: stories, refetch } = trpc.stories.list.useQuery();
  const createStory = trpc.stories.create.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createStory.mutate({ title, content, authorName: authorName || "Anonymous", excerpt: content.slice(0, 200) });
    setTitle("");
    setContent("");
    setAuthorName("");
    setOpen(false);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Stories
            </h1>
            <p className="text-muted-foreground mt-1">Real stories from real men. Share yours anonymously.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <Plus className="h-4 w-4 mr-2" /> Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/40 max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Your Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Name (optional)</label>
                  <Input
                    placeholder="Anonymous"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-secondary/50 border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="Give your story a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-secondary/50 border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Story</label>
                  <Textarea
                    placeholder="Write your story here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-secondary/50 border-border/40 min-h-[150px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your story will be reviewed before being published. Please be respectful and avoid identifying information.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || createStory.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  {createStory.isPending ? "Submitting..." : "Submit Story"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {stories?.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`} target="_blank">
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] card-glow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">{story.excerpt}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">By {story.authorName}</span>
                    <span className="text-xs text-primary flex items-center gap-1">
                      Read more <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) || [1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-full bg-card/80 border-border/40">
              <CardHeader><div className="h-5 w-3/4 bg-secondary rounded animate-pulse" /></CardHeader>
              <CardContent><div className="h-20 bg-secondary rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
