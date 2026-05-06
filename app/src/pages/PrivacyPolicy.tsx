import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">How we protect your information</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/40 card-glow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Anonymous by Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              MenWhoFeel is designed to be anonymous. You do not need to provide your real name, email, or any identifying information to use most features of this platform. Stories, comments, and chat messages can be posted under any name you choose, including "Anonymous."
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              What We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Account Information (Optional):</strong> If you choose to create an account, we store your display name and a unique identifier.</li>
              <li><strong className="text-foreground">Content:</strong> Stories, comments, chat messages, and challenge progress you submit.</li>
              <li><strong className="text-foreground">Assessment Data:</strong> Your responses to self-assessments are stored to provide personalized guidance.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Basic analytics to improve the platform (page views, feature usage).</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>To provide and improve our services</li>
              <li>To moderate content and maintain community safety</li>
              <li>To generate personalized recommendations</li>
              <li>To analyze platform usage for improvements</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/40">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Your Rights</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>You can request deletion of your data at any time by contacting us.</li>
              <li>You may use the platform without creating an account.</li>
              <li>You control what information you choose to share.</li>
              <li>We do not sell or share your data with third parties for marketing purposes.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
