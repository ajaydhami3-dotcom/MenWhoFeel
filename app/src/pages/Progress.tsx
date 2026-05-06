import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Calendar, TrendingUp, Award } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function ProgressPage() {
  const userIdentifier = localStorage.getItem("mwf_user_id") || "anonymous_" + Math.random().toString(36).slice(2);
  const { data: progress } = trpc.challenges.progress.useQuery({ userIdentifier });
  const { data: todayProgress } = trpc.challenges.todayProgress.useQuery({ userIdentifier });
  const { data: weeklyProgress } = trpc.challenges.weeklyProgress.useQuery({ userIdentifier });

  const completedTotal = progress?.length || 0;
  const completedToday = todayProgress?.length || 0;
  const completedWeekly = weeklyProgress?.length || 0;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Target className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">My Progress</h1>
          <p className="text-muted-foreground mt-2">Track your challenge completions and growth</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5 text-center">
              <Flame className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedToday}</p>
              <p className="text-xs text-muted-foreground">Completed Today</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedWeekly}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5 text-center">
              <Award className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedTotal}</p>
              <p className="text-xs text-muted-foreground">Total Completed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Challenge History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-3">
                {progress.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <div>
                      <p className="text-sm font-medium">{item.challenge?.title || "Challenge"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground max-w-[200px] truncate">{item.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No challenges completed yet.</p>
                <p className="text-sm text-muted-foreground">Head to the Challenges page to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
