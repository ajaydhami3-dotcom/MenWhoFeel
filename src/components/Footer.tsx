import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Play,
  MessageSquare,
  Mail,
  Heart,
  Shield,
  FileText,
  AlertTriangle,
  Phone,
  Coffee,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { topics, articles } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h4>
  );
}

// Ranked by published-article count so "popular" means something real,
// rather than an arbitrary/manually-curated list that drifts out of date.
async function getPopularTopics() {
  try {
    return await db
      .select({
        name: topics.name,
        slug: topics.slug,
        count: sql<number>`cast(count(${articles.id}) as int)`,
      })
      .from(topics)
      .leftJoin(articles, eq(articles.topicId, topics.id))
      .groupBy(topics.id)
      .orderBy(desc(sql`count(${articles.id})`))
      .limit(5);
  } catch {
    return [];
  }
}

export default async function Footer() {
  const popularTopics = await getPopularTopics();

  return (
    <footer className="mt-auto w-full border-t border-border bg-background print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Men Who Feel" width={28} height={28} className="h-7 w-auto" />
              <span className="text-base font-semibold tracking-tight text-foreground">
                MenWho<span className="font-display italic text-primary">Feel</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              A space where men don&apos;t have to explain themselves. Anonymous,
              free, no account. Feel it, say it, move through it.
            </p>

            <p className="border-l-2 border-primary/30 pl-3.5 font-display text-[15px] italic leading-snug text-muted-foreground">
              &ldquo;I built this because I needed it, and it didn&apos;t exist.&rdquo;
              <span className="mt-1 block font-mono text-[10px] not-italic uppercase tracking-[0.14em] text-muted-foreground/60">
                — Founder, MenWhoFeel
              </span>
            </p>

            <div className="rounded-xl border border-signal/25 bg-signal/[0.06] p-3.5">
              <p className="mb-1 text-xs font-semibold text-signal">In crisis right now?</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Free helplines are available 24/7 in most countries.
              </p>
            </div>

            <Link
              href="/crisis-helpline"
              className="inline-flex items-center gap-2 text-xs font-medium text-signal hover:opacity-80"
            >
              <Phone className="h-3 w-3" />
              Find a helpline near you →
            </Link>
          </div>

          {/* Navigate */}
          <div>
            <ColumnHeading>Navigate</ColumnHeading>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Heart className="h-3.5 w-3.5" /> About
                </Link>
              </li>
              <li>
                <Link href="/stories" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <FileText className="h-3.5 w-3.5" /> Stories
                </Link>
              </li>
              <li>
                <Link href="/community" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <MessageSquare className="h-3.5 w-3.5" /> Community
                </Link>
              </li>
              <li>
                <Link href="/family-and-friends" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Users className="h-3.5 w-3.5" /> For Family &amp; Friends
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular topics — real data, ranked by article count */}
          {popularTopics.length > 0 && (
            <div>
              <ColumnHeading>Popular Topics</ColumnHeading>
              <ul className="space-y-2.5">
                {popularTopics.map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`/topic/${topic.slug}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {topic.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal */}
          <div>
            <ColumnHeading>Legal</ColumnHeading>
            <ul className="space-y-2.5">
              <li>
                <Link href="/policy" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <FileText className="h-3.5 w-3.5" /> Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Shield className="h-3.5 w-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/rules" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Shield className="h-3.5 w-3.5" /> Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <ColumnHeading>Connect</ColumnHeading>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://instagram.com/men_whofeel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Camera className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@MenWhoFeelClub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Play className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/men_whofeel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                X
              </a>
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p>@men_whofeel</p>
              <p>
                <a href="mailto:support@menwhofeel.online" className="hover:text-foreground">
                  support@menwhofeel.online
                </a>
              </p>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2.5 text-xs leading-relaxed text-muted-foreground">
                This space is free and always will be. If it&apos;s helped you,
                you&apos;re welcome to keep it going.
              </p>
              <a
                href="https://ko-fi.com/menwhofeel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Coffee className="h-3.5 w-3.5" />
                Support us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>© MenWhoFeel. Not a substitute for professional mental health care.</p>
        </div>
      </div>
    </footer>
  );
}
