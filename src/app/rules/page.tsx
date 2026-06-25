import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  // absolute prevents the root layout's "%s | Men Who Feel" template from
  // doubling up on top of this title.
  title: { absolute: "Community Rules | Men Who Feel" },
  description: "The Men Who Feel community rules. Simple, clear standards to keep this a safe and supportive space for every man here.",
  alternates: { canonical: `${BASE_URL}/rules` },
};

export default function RulesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Community Rules</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Simple rules. Non-negotiable. Here to protect the space for everyone.
      </p>

      <ol className="space-y-8">
        <li>
          <h2 className="text-lg font-semibold mb-1">1. Be Respectful</h2>
          <p className="text-muted-foreground leading-relaxed">
            Treat every person here the way you&apos;d want to be treated. You
            don&apos;t have to agree with someone to be decent to them.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">2. No Harassment or Discrimination</h2>
          <p className="text-muted-foreground leading-relaxed">
            Harassment, bullying, hate speech, and discrimination of any kind will
            result in immediate removal. This includes targeted insults, slurs, and
            sustained negative behaviour toward any individual or group, regardless of
            race, religion, gender, sexual orientation, disability, or mental health status.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">3. No Threats, Violence, or Intimidation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Do not post threats or content that promotes, glorifies, or incites violence.
            This includes threats directed at specific individuals or groups, whether
            directly or implicitly.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">4. No Spam, Advertising, or Self-Promotion</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is not a place to sell things or promote services. Do not post
            unsolicited advertising, affiliate links, referral codes, or repeated
            promotional content of any kind.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">5. Keep Discussions Constructive</h2>
          <p className="text-muted-foreground leading-relaxed">
            You&apos;re here to connect, not to win arguments. If a conversation is going
            nowhere productive, step back. Don&apos;t provoke or escalate.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">6. Protect Privacy — Yours and Others&apos;</h2>
          <p className="text-muted-foreground leading-relaxed">
            Don&apos;t share other people&apos;s private information — real names, photos,
            locations, contact details — without their consent. Think carefully about
            what personal details you share about yourself too.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">7. No Content That Promotes Self-Harm</h2>
          <p className="text-muted-foreground leading-relaxed">
            Content that encourages, glorifies, or provides instructions for self-harm
            or suicide is strictly prohibited. If you or someone you know needs help,
            visit our{" "}
            <Link href="/crisis-helpline" className="text-primary underline">
              Crisis Helpline page
            </Link>.
          </p>
        </li>

        <li>
          <h2 className="text-lg font-semibold mb-1">8. Follow the Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            Do not post anything illegal, including content that infringes copyright,
            defames others, or facilitates illegal activity.
          </p>
        </li>
      </ol>

      <div className="mt-10 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Enforcement:</strong> Violations of these
          rules may result in content removal or loss of access to the platform. To
          report a violation, contact us at{" "}
          <a href="mailto:support@menwhofeel.online" className="text-primary underline">
            support@menwhofeel.online
          </a>.
        </p>
      </div>
    </main>
  );
}
