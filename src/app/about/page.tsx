import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Shield, Flame, Target, BookOpen } from "lucide-react";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "About | Men Who Feel — Men's Mental Health Community" },
  description:
    "MenWhoFeel is a free anonymous space where men can talk honestly — no account, no record, no judgment. Built because too many men carry things alone.",
  keywords: [
    "about men who feel",
    "men's mental health community",
    "anonymous support for men",
    "men's safe space online",
    "why men don't talk about feelings",
  ],
  openGraph: {
    title: "About Men Who Feel — Built Because Too Many Men Carry Things Alone",
    description:
      "MenWhoFeel is an anonymous space where men can talk honestly — no account, no record, no judgment. Built for men, by men who've been there.",
    url: `${BASE_URL}/about`,
    siteName: "Men Who Feel",
    type: "website",
    images: [{ url: `${BASE_URL}/logo.png`, alt: "About Men Who Feel" }],
  },
  twitter: {
    card: "summary",
    title: "About Men Who Feel — Anonymous Mental Health Support",
    description:
      "MenWhoFeel is an anonymous space for men to talk honestly — no account, no judgment.",
    site: "@men_whofeel",
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Men Who Feel — Anonymous men's mental health community"
            className="h-20 mx-auto mb-4"
            width={80}
            height={80}
            loading="lazy"
          />
          <h1 className="text-3xl font-bold text-gradient">About MenWhoFeel</h1>
          <p className="text-muted-foreground mt-2">Built because too many men are carrying things alone.</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-8">
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              MenWhoFeel started with a simple observation: most spaces online weren&apos;t built for men to actually open up. There were plenty of places to perform — to look strong, look busy, look fine. Not many where you could say the real thing without somebody turning it into a lesson or a debate.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              So this was built. A space where you don&apos;t have to explain yourself, justify your feelings, or have it together before you say something. Just men, talking honestly, to other men who get it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No accounts. No records. No judgment. Just the conversation that should have been happening a long time ago.
            </p>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Flame className="h-6 w-6 text-primary mb-3" />
              <h2 className="font-semibold mb-1">Anonymous & Safe</h2>
              <p className="text-sm text-muted-foreground">No name, no account, nothing tied to you. Say what you actually mean.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Users className="h-6 w-6 text-primary mb-3" />
              <h2 className="font-semibold mb-1">Community First</h2>
              <p className="text-sm text-muted-foreground">Real men in real situations. Not a forum. Not a helpline. A conversation.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Target className="h-6 w-6 text-primary mb-3" />
              <h2 className="font-semibold mb-1">Something to do, not just feel</h2>
              <p className="text-sm text-muted-foreground">Check-ins, challenges, and guides to help things actually move — not just feel acknowledged.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/40">
            <CardContent className="p-5">
              <Shield className="h-6 w-6 text-primary mb-3" />
              <h2 className="font-semibold mb-1">Community Guidelines</h2>
              <p className="text-sm text-muted-foreground">Content is held to community standards. No hate, no spam, no weaponising vulnerability.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">What we actually believe</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Heart className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">Opening up isn&apos;t weakness</strong> — it&apos;s the hardest thing most men never do. The ones who do it are the ones who actually change.</span>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">There&apos;s no finish line</strong> — you don&apos;t fix your mental health like you fix a car. But you can make it better. Every day you try is the whole point.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-muted-foreground"><strong className="text-foreground">Men need each other</strong> — not in a motivational-poster way. In a real, nobody-else-understands-this way. That&apos;s what this is for.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
