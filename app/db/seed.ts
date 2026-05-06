import { getDb } from "../api/queries/connection";
import { challenges, selfHelpGuides, helplines } from "./schema";

async function seed() {
  const db = getDb();

  // Seed challenges
  const challengeData = [
    { title: "Morning Hydration", description: "Drink a full glass of water within 10 minutes of waking up.", category: "daily" as const, type: "habit" as const, instructions: "Keep a glass of water by your bed. Drink it before anything else." },
    { title: "5-Minute Journal", description: "Write 3 things you're grateful for and 1 intention for the day.", category: "daily" as const, type: "exercise" as const, instructions: "Use any notebook or notes app. Be specific with your gratitudes." },
    { title: "10-Minute Walk", description: "Take a mindful walk without your phone.", category: "daily" as const, type: "exercise" as const, instructions: "Walk outside if possible. Notice 3 things you see, hear, and feel." },
    { title: "Digital Sunset", description: "No screens for 1 hour before bed.", category: "daily" as const, type: "discipline" as const, instructions: "Set a phone alarm. Read, stretch, or journal instead." },
    { title: "Breathing Practice", description: "5 minutes of box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.", category: "daily" as const, type: "meditation" as const, instructions: "Set a timer. Sit comfortably. Focus only on your breath." },
    { title: "Cold Shower Challenge", description: "End your shower with 30 seconds of cold water.", category: "weekly" as const, type: "discipline" as const, instructions: "Start with 10 seconds and build up. Focus on your breathing." },
    { title: "Social Connection", description: "Have a meaningful conversation with someone you care about.", category: "weekly" as const, type: "habit" as const, instructions: "No texting. Call or meet in person. Ask how they're really doing." },
    { title: "Deep Work Session", description: "90 minutes of uninterrupted focus on your most important task.", category: "weekly" as const, type: "discipline" as const, instructions: "Turn off all notifications. Use a timer. Take a 15-min break after." },
    { title: "Nature Immersion", description: "Spend at least 2 hours in nature this week.", category: "weekly" as const, type: "exercise" as const, instructions: "Forest, park, beach, or garden. Leave your phone in airplane mode." },
    { title: "Monthly Check-In", description: "Review your progress, reassess your goals, and plan next month.", category: "monthly" as const, type: "spot_check" as const, instructions: "Use our assessment tool. Review completed challenges. Celebrate wins." },
    { title: "Sleep Audit", description: "Track your sleep for 7 days and optimize your routine.", category: "monthly" as const, type: "spot_check" as const, instructions: "Note bedtime, wake time, and quality. Look for patterns." },
    { title: "Relationship Review", description: "Evaluate your key relationships and reach out to someone you've lost touch with.", category: "monthly" as const, type: "spot_check" as const, instructions: "List 5 important people. Who needs your attention? Schedule time." },
  ];

  for (const c of challengeData) {
    await db.insert(challenges).values(c).onDuplicateKeyUpdate({ set: c });
  }

  // Seed self-help guides
  const guideData = [
    { title: "Understanding Male Depression", content: "Depression in men often shows up differently than in women. Instead of sadness, men may experience irritability, anger, fatigue, or physical symptoms. Recognizing these signs is the first step toward healing.\n\nCommon signs in men:\n- Increased anger or irritability\n- Loss of interest in work or hobbies\n- Difficulty sleeping or oversleeping\n- Physical aches and pains\n- Reckless behavior\n- Substance use\n\nWhat helps:\n- Talking to someone you trust\n- Regular exercise\n- Consistent sleep schedule\n- Professional therapy\n- Limiting alcohol", category: "overcoming_crisis" as const, difficulty: "beginner" as const, estimatedMinutes: 15, featured: true },
    { title: "The Power of Routine", content: "A consistent daily routine reduces decision fatigue and provides stability. Start small: wake at the same time, have a morning ritual, and end your day with reflection.\n\nBuilding your routine:\n1. Anchor habits to existing behaviors\n2. Start with 2-3 non-negotiables\n3. Prepare the night before\n4. Be flexible, not rigid\n5. Review and adjust weekly", category: "daily_improvement" as const, difficulty: "beginner" as const, estimatedMinutes: 10, featured: true },
    { title: "Assertive Communication for Men", content: "Many men struggle to express needs without aggression or passivity. Assertiveness is the middle path: clear, respectful, and direct.\n\nThe DESC model:\nD - Describe the situation\nE - Express your feelings\nS - Specify what you want\nC - Consequences (positive)\n\nPractice phrases:\n- 'I feel frustrated when...'\n- 'I need some time to think about this.'\n- 'I appreciate your perspective, and I see it differently.'", category: "skill_building" as const, difficulty: "intermediate" as const, estimatedMinutes: 20, featured: true },
    { title: "Managing Anger Constructively", content: "Anger is a valid emotion. The problem is how we express it. Learning to channel anger productively transforms it from a liability to a tool.\n\nThe STOP technique:\nS - Stop and pause\nT - Take a breath\nO - Observe your thoughts\nP - Proceed mindfully\n\nPhysical outlets:\n- High-intensity exercise\n- Cold water immersion\n- Punching bag or vigorous activity\n- Writing it out completely", category: "emotional_regulation" as const, difficulty: "intermediate" as const, estimatedMinutes: 15, featured: false },
    { title: "Building Deeper Friendships", content: "Male friendships often lack emotional depth. Changing this requires intentional vulnerability and consistent presence.\n\nLevels of friendship:\n1. Activity partners\n2. Supportive friends\n3. Intimate friends (emotional sharing)\n4. Integrated friends (all levels)\n\nDeepening bonds:\n- Share struggles, not just successes\n- Ask deeper questions\n- Be consistently present\n- Initiate contact regularly", category: "relationships" as const, difficulty: "intermediate" as const, estimatedMinutes: 12, featured: false },
    { title: "The Focus Protocol", content: "In a world of constant distraction, deep focus is a superpower. Build your ability to concentrate with structured practice.\n\nEnvironment setup:\n- Clear your workspace\n- Remove all notifications\n- Use noise-canceling headphones\n- Set a visible timer\n\nThe Pomodoro variation:\n- 25 min focused work\n- 5 min movement break\n- After 4 cycles, take a 20-min break", category: "productivity" as const, difficulty: "beginner" as const, estimatedMinutes: 8, featured: false },
    { title: "Sleep as Recovery", content: "Sleep is when your brain processes emotions, consolidates memories, and restores your body. Poor sleep undermines everything else.\n\nSleep hygiene checklist:\n- Consistent bedtime and wake time\n- Cool, dark room (65-68F)\n- No caffeine after 2 PM\n- No screens 1 hour before bed\n- Wind-down routine: stretch, read, breathe\n\nIf you can't sleep:\n- Don't force it. Get up and do something calm.\n- Return to bed when sleepy.\n- Avoid clock-watching.", category: "physical_health" as const, difficulty: "beginner" as const, estimatedMinutes: 10, featured: true },
  ];

  for (const g of guideData) {
    await db.insert(selfHelpGuides).values(g).onDuplicateKeyUpdate({ set: g });
  }

  // Seed helplines
  const helplineData = [
    { country: "United States", countryCode: "US", organization: "988 Suicide & Crisis Lifeline", phoneNumber: "988", description: "Free, confidential support for people in distress", availableHours: "24/7", website: "https://988lifeline.org" },
    { country: "United Kingdom", countryCode: "GB", organization: "Samaritans", phoneNumber: "116 123", description: "Confidential listening service", availableHours: "24/7", website: "https://www.samaritans.org" },
    { country: "Canada", countryCode: "CA", organization: "Crisis Services Canada", phoneNumber: "1-833-456-4566", description: "Suicide prevention and support", availableHours: "24/7", website: "https://www.crisisservicescanada.ca" },
    { country: "Australia", countryCode: "AU", organization: "Lifeline Australia", phoneNumber: "13 11 14", description: "Crisis support and suicide prevention", availableHours: "24/7", website: "https://www.lifeline.org.au" },
  ];

  for (const h of helplineData) {
    await db.insert(helplines).values(h).onDuplicateKeyUpdate({ set: h });
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
