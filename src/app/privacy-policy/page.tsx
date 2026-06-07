import type { Metadata } from "next";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: "Privacy Policy | Men Who Feel",
  description: "Learn how Men Who Feel handles your data. We collect minimal information, never sell personal data, and are committed to your privacy and anonymity.",
  alternates: { canonical: `${BASE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2025</p>

      <p className="mb-6 text-muted-foreground leading-relaxed">
        MenWhoFeel is designed with anonymity at its core. This policy explains what
        information we collect, how we use it, and your rights regarding your data.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <p className="mb-3 text-muted-foreground leading-relaxed">
        MenWhoFeel does not require you to create an account to use the core features
        of the platform. We do not require your name, email, or any identifying information
        for general use. Information that may be collected includes:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
        <li>Anonymised usage data (pages visited, session duration) to improve the platform</li>
        <li>Content you voluntarily post (stories, community messages), subject to our Community Policy</li>
        <li>Contact details if you reach out to us via the contact form or email</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <p className="mb-3 text-muted-foreground leading-relaxed">
        Information collected is used solely to:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
        <li>Operate and improve the MenWhoFeel platform</li>
        <li>Respond to your enquiries</li>
        <li>Maintain the safety and integrity of the community</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. We Do Not Sell Your Data</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        We do not sell, rent, or trade personal information to third parties for marketing
        or any other commercial purpose. Your data is not an asset we monetise.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Third-Party Services</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        To operate the platform, we use trusted third-party services including hosting
        providers and analytics tools. These providers process data on our behalf and
        are contractually required to protect it in accordance with applicable data
        protection laws. We encourage you to review the privacy policies of any
        third-party services you interact with.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Community Content</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Content posted in community spaces (messages, stories) may be visible to other
        users. Some community messages are designed to disappear after 24 hours. Please
        do not post information in public areas that you wish to keep private.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Cookies</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        We may use essential cookies to maintain the functionality of the platform.
        We do not use cookies for advertising or cross-site tracking purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Your Rights</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        Depending on where you are located, you may have rights under applicable data
        protection laws (including the GDPR for users in the UK and EU) to access,
        correct, or request deletion of information we hold about you. To exercise
        these rights or raise a privacy concern, please contact us at{" "}
        <a href="mailto:support@menwhofeel.online" className="text-primary underline">
          support@menwhofeel.online
        </a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Data Security</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        We take reasonable technical and organisational measures to protect information
        from unauthorised access or disclosure. No system is perfectly secure, and we
        encourage you to avoid sharing sensitive personal information on any online platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Children&apos;s Privacy</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        MenWhoFeel is not intended for use by anyone under the age of 16. We do not
        knowingly collect personal information from children. If you believe a child
        has provided us with personal information, please contact us so we can delete it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to This Policy</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        We may update this Privacy Policy from time to time. We will post the updated
        version here with a revised date. Continued use of the platform after changes
        constitutes acceptance of the updated policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact</h2>
      <p className="mb-4 text-muted-foreground leading-relaxed">
        For any privacy-related questions or requests, please contact us at:{" "}
        <a href="mailto:support@menwhofeel.online" className="text-primary underline">
          support@menwhofeel.online
        </a>
      </p>

      <p className="mt-10 text-sm text-muted-foreground border-t border-border/30 pt-6">
        By using this website, you agree to the collection and processing of
        information as described in this policy.
      </p>
    </main>
  );
}
