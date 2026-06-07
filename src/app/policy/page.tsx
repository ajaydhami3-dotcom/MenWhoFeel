import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Community Policy | Men Who Feel",
  description: "Read the Men Who Feel community policy. Our guidelines ensure a safe, respectful space for men to share experiences and support one another without judgment.",
  alternates: { canonical: `${BASE_URL}/policy` },
};

export default function PolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Community Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2025</p>

      <p className="mb-6 text-muted-foreground leading-relaxed">
        MenWhoFeel exists to provide a supportive space where men can share
        experiences, ask questions, and discuss challenges without judgment.
        These guidelines apply to all content posted on the platform — stories,
        community messages, comments, and any other contributions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Respectful Conduct</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        All members are expected to treat others with dignity. Disagreement is
        normal; disrespect is not. Criticism of ideas is welcome — attacks on
        individuals are not.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Zero Tolerance for Harassment</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Harassment, hate speech, discrimination, or personal attacks of any kind —
        including on the basis of race, religion, gender, sexual orientation, disability,
        or mental health status — are strictly prohibited and will result in immediate removal.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. No Spam or Misleading Content</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Do not post spam, unsolicited promotions, scams, or content intended to deceive
        others. This includes impersonating other individuals or organisations.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Privacy of Others</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Do not share private information about other people without their explicit consent.
        This includes real names, contact details, images, or any identifying information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Constructive Engagement</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        This is a space for support, not conflict. If something upsets you, disengage
        or report it. Do not escalate disagreements or encourage hostility.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Safe Conversations</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Content that promotes or glorifies self-harm, suicide, or dangerous behaviours
        is prohibited. If you or someone you know is in crisis, please visit our{" "}
        <Link href="/crisis-helpline" className="text-primary underline">
          Crisis Helpline page
        </Link>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Moderation &amp; Enforcement</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        The MenWhoFeel team reserves the right to remove content and restrict access
        to anyone who violates these guidelines. Repeated or serious violations may
        result in permanent suspension from the platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Reporting</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        If you see content that violates this policy, please contact us at{" "}
        <a href="mailto:support@menwhofeel.online" className="text-primary underline">
          support@menwhofeel.online
        </a>
        . We review all reports and aim to respond within 48 hours.
      </p>

      <p className="mt-10 text-sm text-muted-foreground border-t border-border/30 pt-6">
        These policies may be updated over time. Continued use of the platform
        constitutes acceptance of the current version.
      </p>
    </main>
  );
}
