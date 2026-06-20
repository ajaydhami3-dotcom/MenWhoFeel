import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart, MessageSquare, CheckCircle2, XCircle, AlertTriangle,
  Phone, Users, Lock, ArrowRight,
} from "lucide-react";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "For Family and Friends | Men Who Feel" },
  description:
    "Worried about a man in your life? Practical, non-clinical guidance for partners, parents, and friends on how to start the conversation, what helps, and when to take warning signs seriously.",
  keywords: [
    "how to help a man who is struggling",
    "supporting a man with mental health issues",
    "how to talk to a man about his feelings",
    "partner depression support",
    "warning signs in men",
    "men's mental health for family",
  ],
  openGraph: {
    title: "For Family and Friends — Men Who Feel",
    description:
      "Practical, non-clinical guidance for partners, parents, and friends supporting a man who's struggling.",
    url: `${BASE_URL}/family-and-friends`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "For Family and Friends — Men Who Feel" }],
  },
  twitter: {
    card: "summary",
    title: "For Family and Friends — Men Who Feel",
    description: "Guidance for partners, parents, and friends supporting a man who's struggling.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/family-and-friends` },
};

const HELPS = [
  "Ask open questions and then actually wait for the answer — \u201cHow are you really doing?\u201d, not \u201cYou're fine, right?\u201d",
  "Let silences sit. He may need a minute to find the words.",
  "Check in consistently, even with something small — a text, not just a big sit-down talk.",
  "Take it seriously without panicking. Calm and steady helps him keep talking.",
  "Let him lead on what he wants to do next, even if that's just being heard for now.",
];

const DOESNT_HELP = [
  "Ultimatums or \u201cjust snap out of it\u201d framing.",
  "Comparing him to someone who \u201chad it worse and was fine.\u201d",
  "Taking over and deciding what he should do without asking.",
  "Bringing it up only once and assuming silence means it's resolved.",
  "Making it about how his struggle affects you, in the moment he's opening up.",
];

const WATCH_FOR = [
  "Pulling away from people and things he used to care about.",
  "Talking about being a burden, or like things would be easier for everyone without him.",
  "Big changes in sleep, drinking, or mood that don't have an obvious explanation.",
  "Giving away belongings, tying up loose ends, or talking like he's saying goodbye.",
  "A sudden, unexplained sense of calm after a period of real distress.",
];

export default function FamilyAndFriendsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4">
            <Heart className="h-3 w-3" />
            For partners, parents, siblings, and friends
          </div>
          <h1 className="text-3xl font-bold text-gradient">For Family and Friends</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            You don&apos;t have to fix him. You just have to stay close enough that he doesn&apos;t have to go through it alone.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-8">
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              If you&apos;re here, you&apos;ve probably noticed something is off with a man in your life — a partner, a son, a brother, a friend — and you&apos;re not sure what to do with that. That uncertainty is normal. Most men aren&apos;t taught how to talk about what they&apos;re carrying, which means the people around them often aren&apos;t sure how to ask either.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This page isn&apos;t a diagnosis tool and it&apos;s not a substitute for professional care. It&apos;s a starting point — some honest, practical guidance on how to approach this with care.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              How to bring it up
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Pick a low-pressure moment — a drive, a walk, side-by-side rather than face-to-face. Lead with something specific you&apos;ve noticed instead of a general &quot;are you okay&quot;, which is easy to wave off. Something like: &quot;You&apos;ve seemed pretty worn down the last few weeks. I just wanted to check in.&quot;
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Expect &quot;I&apos;m fine&quot; the first time. That&apos;s not a closed door — it&apos;s often just the automatic answer. Staying warm and bringing it up again later, calmly, tends to matter more than getting it right in one conversation.
            </p>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                What tends to help
              </h2>
              <ul className="space-y-2.5">
                {HELPS.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-rose-400">
                <XCircle className="h-4 w-4" />
                What tends to make it harder
              </h2>
              <ul className="space-y-2.5">
                {DOESNT_HELP.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-amber-500/5 border-amber-500/20 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Patterns worth taking seriously
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Most ups and downs don&apos;t need urgent action. But a few patterns are worth paying closer attention to, especially together:
            </p>
            <ul className="space-y-2.5 mb-5">
              {WATCH_FOR.map((item) => (
                <li key={item} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-foreground leading-relaxed font-medium mb-4">
              If he talks about wanting to die, about suicide, or you believe he&apos;s in immediate danger, don&apos;t wait to see if it passes. Reach out to a crisis line or local emergency services right away.
            </p>
            <Link href="/crisis-helpline">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold">
                <Phone className="h-4 w-4 mr-2" />
                Find a crisis helpline
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              You don&apos;t have to carry this alone either
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Supporting someone through a hard stretch is genuinely heavy, especially if it goes on for a while. It&apos;s easy to put all your attention on him and quietly run yourself down in the process.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Keep your own people, your own outlets, your own check-ins going. You being okay isn&apos;t selfish — it&apos;s part of what lets you actually be there for him.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6 text-center">
            <Lock className="h-5 w-5 text-blue-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-2">If he&apos;s not ready to talk to you yet</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md mx-auto">
              Sometimes it&apos;s easier for men to open up anonymously first, before they&apos;re ready to say it out loud to someone close. You&apos;re welcome to point him toward this space — no account, nothing tied to his name.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/community">
                <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                  See the Community <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-border/40">
                  Contact us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
