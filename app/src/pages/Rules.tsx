import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Heart, MessageSquare, Users } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Community Rules</h1>
          <p className="text-muted-foreground mt-2">Guidelines for a safe and supportive community</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Core Principle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              This is a safe space for men to be vulnerable, share their struggles, and support each other. Treat everyone with respect and compassion. What is shared here stays here—do not share others' stories outside this community.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                1. Respect Anonymity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Do not ask for or share personal identifying information (real names, locations, workplaces, contact details). Respect that many members choose to remain anonymous.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                2. Be Supportive, Not Judgmental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Offer encouragement and understanding. Avoid unsolicited advice, criticism, or toxic positivity. Sometimes listening is more powerful than fixing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                3. No Harmful Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Do not post content that glorifies self-harm, violence, or substance abuse. Do not harass, bully, or attack other members. Content promoting illegal activities is prohibited.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                4. No Medical Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share experiences, not prescriptions. Never diagnose others or recommend specific medications. Always encourage professional help for serious concerns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                5. Confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                What's shared in the community stays in the community. Do not screenshot or share others' posts, stories, or messages outside this platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-card/80 border-border/40">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Enforcement</h3>
            <p className="text-sm text-muted-foreground">
              Violations of these rules may result in content removal, temporary suspension, or permanent ban from the platform. All content is moderated. If you see something that violates these rules, please report it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
