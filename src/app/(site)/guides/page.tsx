// SERVER component — resources are fetched at request time and included
// directly in the HTML that Google crawls. No "Loading resources..." ever.
import { db } from "@/db";
import { resources } from "@/db/schema";
import GuidesClient, { type ResourceItem } from "./GuidesClient";

// ISR: re-generate at most every 5 minutes so newly added resources
// appear without a full deploy.
export const revalidate = 300;

// Seed resources shown when the DB is unreachable or empty.
const SEED_RESOURCES: ResourceItem[] = [
  // Mental & Emotional Health
  { id: "s1", name: "How to process difficult emotions — a practical guide", url: "https://www.headspace.com/mindfulness/emotional-wellness", type: "link", category: "Mental & Emotional Health" },
  { id: "s2", name: "Man Therapy — humour-forward mental health resource for men", url: "https://mantherapy.org", type: "link", category: "Mental & Emotional Health" },
  { id: "s3", name: "Lost Connections by Johann Hari — why we get depressed and how to reconnect", url: "https://www.goodreads.com/book/show/34921573", type: "book", category: "Mental & Emotional Health" },
  { id: "s13", name: "Emotional intelligence in men — what it actually means and why it matters", url: "https://www.psychologytoday.com/us/basics/emotional-intelligence", type: "link", category: "Mental & Emotional Health" },
  // Work & Financial Stability
  { id: "s4", name: "Budgeting for people who hate budgeting — simple framework", url: "https://www.moneysavingexpert.com/banking/budget-planning", type: "link", category: "Work & Financial Stability" },
  { id: "s5", name: "The Total Money Makeover by Dave Ramsey — debt-free plan", url: "https://www.goodreads.com/book/show/78427", type: "book", category: "Work & Financial Stability" },
  { id: "s6", name: "Free Introduction to Personal Finance — Khan Academy", url: "https://www.khanacademy.org/college-careers-more/personal-finance", type: "video", category: "Work & Financial Stability" },
  { id: "s14", name: "Workplace stress and burnout — when work stops feeling worth it", url: "https://www.mind.org.uk/information-support/tips-for-everyday-living/work/work-and-mental-health", type: "link", category: "Work & Financial Stability" },
  // Relationships & Stress
  { id: "s7", name: "4-7-8 breathing explained — simple panic reset", url: "https://www.healthline.com/health/4-7-8-breathing", type: "link", category: "Relationships & Stress" },
  { id: "s8", name: "How to stop a fight before it starts — communication basics", url: "https://www.gottman.com/blog/manage-conflict-in-relationships", type: "link", category: "Relationships & Stress" },
  { id: "s9", name: "Why Men Don't Ask for Help — Andrew Fuller (TEDx)", url: "https://www.youtube.com/results?search_query=why+men+dont+ask+for+help+tedx", type: "video", category: "Relationships & Stress" },
  { id: "s15", name: "Anger management that actually works — beyond counting to 10", url: "https://www.apa.org/topics/anger/control", type: "link", category: "Relationships & Stress" },
  // Physical Wellbeing
  { id: "s10", name: "Sleep hygiene — what actually works and what doesn't", url: "https://www.sleepfoundation.org/sleep-hygiene", type: "link", category: "Physical Wellbeing" },
  { id: "s11", name: "5-minute morning movement — no gym required", url: "https://www.youtube.com/results?search_query=5+minute+morning+stretch+men", type: "video", category: "Physical Wellbeing" },
  { id: "s12", name: "Why exercise is the closest thing to a mental health cure", url: "https://www.apa.org/topics/exercise-fitness/stress", type: "link", category: "Physical Wellbeing" },
  { id: "s16", name: "Testosterone, diet, and lifestyle — what the evidence actually says", url: "https://www.healthline.com/nutrition/8-ways-to-boost-testosterone", type: "link", category: "Physical Wellbeing" },
];

async function fetchResources(): Promise<ResourceItem[]> {
  try {
    const rows = await db.select().from(resources);
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      url: r.url,
      type: r.type,
      category: r.category,
    }));
  } catch (err) {
    // DB unavailable — fall back to seeds.
    console.error("[guides/page] DB fetch failed, using seed resources:", err);
    return [];
  }
}

export default async function GuidesPage() {
  const dbResources = await fetchResources();
  const initialResources = dbResources.length > 0 ? dbResources : SEED_RESOURCES;

  // All resource names and categories are embedded in the server-rendered
  // HTML. Google indexes every item without needing to execute JavaScript.
  return <GuidesClient initialResources={initialResources} />;
}
