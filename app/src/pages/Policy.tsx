import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Globe } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Scale className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Terms & Policy</h1>
          <p className="text-muted-foreground mt-2">Terms of use for the MenWhoFeel platform</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms of Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using MenWhoFeel, you agree to these terms. If you do not agree, please do not use the platform.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>You must be at least 18 years old to use this platform.</li>
              <li>You are responsible for any content you post.</li>
              <li>We reserve the right to remove content that violates our community rules.</li>
              <li>We may suspend or terminate accounts for violations.</li>
              <li>The platform is provided "as is" without warranties of any kind.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Content Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>All submitted content (stories, comments, chat) is subject to moderation.</li>
              <li>We aim to review pending content within 24 hours.</li>
              <li>Content that violates community rules will be rejected.</li>
              <li>By submitting content, you grant us permission to display it on the platform.</li>
              <li>You retain ownership of your content and can request its removal.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Changes to Terms</h3>
            <p className="text-sm text-muted-foreground">
              We may update these terms from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
