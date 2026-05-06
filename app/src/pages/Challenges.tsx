import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, CheckCircle2, Circle, Flame, Target, 
  Anchor, Shield, Clock, ChevronRight, Trophy, AlertCircle, Dumbbell, BrainCircuit 
} from "lucide-react";

const DEFAULT_PROGRESS = {
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  rank: "Initiate",
  currentDailyId: 1, 
  completedWeeklies: [] as number[],
  lastCompletedAt: null as Date | null, 
};

export default function Challenges() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // --- LOCAL STORAGE MAGIC ---
  // This checks your browser for saved data before loading the default level 1 stats
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem("forge_user_progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Turn the saved string back into a real Date object
      if (parsed.lastCompletedAt) parsed.lastCompletedAt = new Date(parsed.lastCompletedAt);
      return parsed;
    }
    return DEFAULT_PROGRESS;
  });

  // Automatically save to Local Storage every time userProgress changes!
  useEffect(() => {
    localStorage.setItem("forge_user_progress", JSON.stringify(userProgress));
  }, [userProgress]);


  // --- 24-HOUR TIMER LOGIC ---
  useEffect(() => {
    if (!userProgress.lastCompletedAt) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const unlockTime = new Date(userProgress.lastCompletedAt!.getTime() + 24 * 60 * 60 * 1000);
      const diff = unlockTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(null);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userProgress.lastCompletedAt]);


  // --- GAMIFICATION ENGINE ---
  const handleCompleteDaily = (xpReward: number) => {
    setUserProgress((prev: typeof DEFAULT_PROGRESS) => {
      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newNextLevelXp = prev.nextLevelXp;
      let newRank = prev.rank;

      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        newXp = newXp - prev.nextLevelXp;
        newNextLevelXp = Math.floor(prev.nextLevelXp * 1.5);
        
        if (newLevel >= 5) newRank = "Iron Mind";
        if (newLevel >= 10) newRank = "Steel Mind";
        if (newLevel >= 20) newRank = "Titan";
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextLevelXp,
        rank: newRank,
        currentDailyId: prev.currentDailyId + 1, 
        lastCompletedAt: new Date(), 
      };
    });
  };

  const handleCompleteWeekly = (weekId: number) => {
    setUserProgress((prev: typeof DEFAULT_PROGRESS) => ({
      ...prev,
      completedWeeklies: [...prev.completedWeeklies, weekId],
      xp: prev.xp + 500, 
    }));
  };

  // --- PHASE 1: INITIATION (DAYS 1-5) ---
  const initiationChallenges = [
    { id: 1, title: "The Foundation", desc: "Drink 3 liters of water and get a full 8 hours of sleep.", xp: 50 },
    { id: 2, title: "The Purge", desc: "Maintain Day 1. ADD: Unfollow 5 accounts on social media that make you angry or insecure.", xp: 50 },
    { id: 3, title: "The Silence", desc: "Maintain Days 1-2. ADD: Sit in complete silence for 10 minutes. No phone, no music.", xp: 75 },
    { id: 4, title: "The Shock", desc: "Maintain Days 1-3. ADD: Finish your shower with 60 seconds of cold water.", xp: 100 },
    { id: 5, title: "The Reach", desc: "Maintain Days 1-4. ADD: Text a friend or brother you haven't spoken to in over a month.", xp: 100 },
  ];

  // --- PHASE 2: THE INFINITE FORGE (DAY 6+) ---
  const infiniteBlueprints = [
    { type: "physical", icon: Dumbbell, title: "The Iron Primer (Full Body)", desc: "Do not think, just execute. Complete 4 rounds of: 15 Pushups, 20 Air Squats, 10 Lunges (each leg), 30-Second Plank. Rest 60 seconds between rounds.", xp: 150 },
    { type: "mental", icon: BrainCircuit, title: "Box Breathing Protocol", desc: "Find a quiet place. Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. Repeat this cycle for exactly 5 minutes.", xp: 150 },
    { type: "physical", icon: Dumbbell, title: "The Engine (Cardio)", desc: "Go outside. Walk briskly for 5 minutes to warm up. Then run hard for 1 minute, walk for 2 minutes. Repeat the Run/Walk cycle 5 times.", xp: 150 },
    { type: "mental", icon: BrainCircuit, title: "The Brain Dump", desc: "Take a pen and paper. Write down every single thing stressing you out, every task you owe someone, and every anxiety. Do not stop writing until your brain is empty.", xp: 150 }
  ];

  const currentBlueprintIndex = (userProgress.currentDailyId - 6) % infiniteBlueprints.length;
  const currentBlueprint = infiniteBlueprints[currentBlueprintIndex];

  const weeklyChallenges = [
    { id: 1, week: 1, title: "Establish the Baseline", desc: "Complete 5 daily challenges this week. Build the muscle of showing up.", reward: "Iron Badge" },
    { id: 2, week: 2, title: "Digital Fasting", desc: "Delete your most used social media or distraction app for 7 straight days.", reward: "Focus Badge" },
    { id: 3, week: 3, title: "The Physical Audit", desc: "Exercise for 45 minutes, 4 times this week. Lift heavy or run far.", reward: "Strength Badge" },
  ];

  const isTimeLocked = timeRemaining !== null;
  const isInitiationPhase = userProgress.currentDailyId <= 5;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Header & Gamification Stats */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card/50 p-6 rounded-2xl border border-border/40 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-2">
              The Forge
            </h1>
            <p className="text-muted-foreground">Discipline equals freedom. Complete challenges to forge your mind.</p>
          </div>
          
          <div className="w-full md:w-72 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Rank</p>
                <p className="text-lg font-bold text-blue-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> {userProgress.rank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Level {userProgress.level}</p>
                <p className="text-xs text-muted-foreground">{userProgress.xp} / {userProgress.nextLevelXp} XP</p>
              </div>
            </div>
            <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="h-2 bg-slate-800">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500 ease-out" style={{ width: `${(userProgress.xp / userProgress.nextLevelXp) * 100}%` }} />
            </Progress>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-secondary/20 rounded-lg inline-flex border border-border/40 overflow-x-auto max-w-full scrollbar-hide">
          <button onClick={() => setActiveTab("daily")} className={`px-6 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-all ${activeTab === "daily" ? "bg-blue-500/20 text-blue-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Daily Blueprints</button>
          <button onClick={() => setActiveTab("weekly")} className={`px-6 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-all ${activeTab === "weekly" ? "bg-teal-500/20 text-teal-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Weekly Gauntlets</button>
          <button onClick={() => setActiveTab("monthly")} className={`px-6 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-all ${activeTab === "monthly" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Monthly Spot-Check</button>
        </div>

        {/* --- DAILY CHALLENGES VIEW --- */}
        {activeTab === "daily" && (
          <div className="space-y-6">
            
            {isTimeLocked && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-500 font-medium">Rest & Recover</h4>
                  <p className="text-sm text-amber-500/80">True discipline requires patience. Your next blueprint unlocks in {timeRemaining}.</p>
                </div>
              </div>
            )}

            {/* PHASE 2: THE INFINITE FORGE */}
            {!isInitiationPhase && currentBlueprint && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Flame className="h-5 w-5 text-blue-400" /> The Infinite Forge
                  </h2>
                  <p className="text-sm text-muted-foreground">You have graduated initiation. Execute today's specific blueprint.</p>
                </div>

                <Card className={`transition-all duration-300 border-blue-500/50 bg-blue-950/10 shadow-lg shadow-blue-900/10 ${isTimeLocked ? "opacity-60" : ""}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="shrink-0 p-4 bg-blue-500/20 rounded-full mt-1 md:mt-0">
                      <currentBlueprint.icon className="h-8 w-8 text-blue-400" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className={`font-bold text-xl ${isTimeLocked ? "text-muted-foreground" : "text-foreground"}`}>
                          Day {userProgress.currentDailyId}: {currentBlueprint.title}
                        </h3>
                        {!isTimeLocked && <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Ready</span>}
                      </div>
                      <p className={`text-base leading-relaxed ${isTimeLocked ? "text-muted-foreground blur-[3px] select-none" : "text-muted-foreground"}`}>
                        {currentBlueprint.desc}
                      </p>
                    </div>

                    {!isTimeLocked && (
                      <Button onClick={() => handleCompleteDaily(currentBlueprint.xp)} className="w-full md:w-auto mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white shrink-0 px-8 py-6 text-lg">
                        Execute (+{currentBlueprint.xp} XP)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PHASE 1: INITIATION */}
            <div className={`space-y-4 ${!isInitiationPhase ? "opacity-50 mt-12" : ""}`}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">Phase 1: Initiation</h2>
              </div>

              {initiationChallenges.map((task) => {
                const status = task.id < userProgress.currentDailyId ? "completed" : task.id === userProgress.currentDailyId ? "active" : "locked";
                const isNextUp = status === "active" && isTimeLocked;

                return (
                  <Card key={task.id} className={`transition-all duration-300 ${status === "locked" || isNextUp ? "opacity-60 bg-card/30" : status === "active" ? "border-blue-500/50 bg-blue-950/10 shadow-lg" : "border-emerald-500/30 bg-emerald-950/10"}`}>
                    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="shrink-0 mt-1 md:mt-0">
                        {status === "completed" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : status === "locked" || isNextUp ? <Lock className="h-6 w-6 text-muted-foreground" /> : <Circle className="h-6 w-6 text-blue-400" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className={`font-bold text-md mb-1 ${status === "locked" || isNextUp ? "text-muted-foreground" : "text-foreground"}`}>Day {task.id}: {task.title}</h3>
                        <p className={`text-sm ${status === "locked" || isNextUp ? "text-muted-foreground blur-[2px] select-none" : "text-muted-foreground"}`}>{task.desc}</p>
                      </div>

                      {status === "active" && !isTimeLocked && isInitiationPhase && (
                        <Button onClick={() => handleCompleteDaily(task.xp)} className="w-full md:w-auto mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                          Complete (+{task.xp} XP)
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEKLY CHALLENGES */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {weeklyChallenges.map((week) => {
                const isCompleted = userProgress.completedWeeklies.includes(week.id);
                const isUnlocked = week.id === 1 || userProgress.completedWeeklies.includes(week.id - 1);
                const isLocked = !isCompleted && !isUnlocked;

                return (
                  <Card key={week.id} className={`flex flex-col h-full transition-all duration-300 ${isLocked ? "opacity-70 bg-card/40 border-dashed border-border/40" : isCompleted ? "border-emerald-500/30 bg-emerald-950/10" : "border-teal-500/50 bg-teal-950/10 card-glow"}`}>
                    <CardHeader className="pb-3 border-b border-border/20">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">Week {week.week}</CardTitle>
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className={`font-bold mb-2 ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{week.title}</h3>
                        <p className={`text-sm mb-6 ${isLocked ? "text-muted-foreground blur-[3px] select-none" : "text-muted-foreground"}`}>{week.desc}</p>
                      </div>
                      
                      {!isLocked && !isCompleted && (
                        <Button onClick={() => handleCompleteWeekly(week.id)} className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-auto">
                          Complete (+500 XP)
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* MONTHLY SPOT CHECK */}
        {activeTab === "monthly" && (
           <div className="space-y-6">
           <Card className="border-emerald-500/30 bg-card/60 backdrop-blur-sm overflow-hidden mt-6">
             <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-500" />
             <CardContent className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
               <div className="p-6 rounded-full bg-emerald-500/10 shrink-0">
                 <Trophy className="h-12 w-12 text-emerald-400" />
               </div>
               <div>
                 <h3 className="text-2xl font-bold mb-2">The Monthly Review</h3>
                 <p className="text-muted-foreground mb-6">Log your major wins and the hard truths you need to face next month.</p>
                 <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600">Log Achievements <ChevronRight className="h-4 w-4 ml-2" /></Button>
               </div>
             </CardContent>
           </Card>
         </div>
        )}
      </div>
    </div>
  );
}