import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Heart } from "lucide-react";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  // absolute prevents the root layout's "%s | Men Who Feel" template from
  // doubling up on top of this title.
  title: { absolute: "Disclaimer | Men Who Feel" },
  description: "Men Who Feel is a peer support community, not a substitute for professional mental health care. Read our full disclaimer before using the platform.",
  alternates: { canonical: `${BASE_URL}/disclaimer` },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <AlertTriangle className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Disclaimer</h1>
          <p className="text-muted-foreground mt-2">Important information about the services we provide</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Not a Substitute for Professional Care
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              MenWhoFeel is a peer support community and self-help resource platform. We are not a mental health treatment provider, and the content on this website is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Always seek the advice of your physician, licensed mental health professional, or other qualified health provider with any questions you may have regarding a medical or psychological condition.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Crisis Situations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              If you are in crisis or having thoughts of harming yourself or others, please contact emergency services immediately or call a crisis helpline. Do not rely solely on this website or community chat for crisis intervention.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Additional Disclaimers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
              <li>The stories shared on this platform are personal experiences and do not constitute professional advice.</li>
              <li>Community chat is moderated but we cannot guarantee real-time moderation at all times.</li>
              <li>Self-assessment tools provide general guidance only and are not diagnostic instruments.</li>
              <li>We are not responsible for the content shared by community members.</li>
              <li>Your use of this platform is at your own risk and discretion.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}