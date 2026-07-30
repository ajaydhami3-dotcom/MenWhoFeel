// ==========================================
// Assessment content, keyed by pillar (Phase 12 — Check-In pillar integration)
// ==========================================
// Pulls the Check-In's questions/results out of the two client components
// they used to be hardcoded in (assessment/page.tsx,
// assessment/results/page.tsx) so both can be pillar-aware without
// duplicating the quiz engine four times ("shared engine, pillar
// branching" — not four separate tools).
//
// `mental-emotional-health` below is today's content, moved here
// unmodified — this is a relocation, not a rewrite, so behavior for
// existing users/links doesn't change. The other 3 pillar slugs
// (work-financial-stability, relationships-stress, physical-wellbeing)
// aren't populated yet; getAssessmentQuestions/getAssessmentResults fall
// back to DEFAULT_ASSESSMENT_PILLAR for any slug not yet in these maps,
// so linking a Check-In teaser from those pillars today just shows the
// current generic experience — not a regression, and it upgrades to real
// pillar-specific content the moment a key is added below, with no page
// changes required.

export type AssessmentQuestion = {
  id: string;
  questionText: string;
  opt1Text: string;
  opt1Category: string;
  opt2Text: string;
  opt2Category: string;
  opt3Text: string;
  opt3Category: string;
  opt4Text: string;
  opt4Category: string;
};

export type AssessmentResultContent = {
  title: string;
  tagline: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  microcopy: string;
  actionPlan: {
    title: string;
    steps: { label: string; detail: string }[];
  };
  nextSteps: { label: string; action: string; href: string; icon: string }[];
};

export const DEFAULT_ASSESSMENT_PILLAR = "mental-emotional-health";

// Maps very old category names (predating even the 6-category "burnout/
// overloaded/..." set) forward. Not pillar-specific — this is about
// result-category naming history, not which pillar someone's in — so it
// stays a single shared map rather than one per pillar.
export const ASSESSMENT_LEGACY_MAP: Record<string, string> = {
  tactician: "pressure",
  operator: "burnout",
  vanguard: "isolated",
  civilian: "overloaded",
};

const MENTAL_EMOTIONAL_HEALTH_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    questionText: "When you wake up in the morning, what's the first real feeling that hits?",
    opt1Text: "Dread — like the day's already too heavy before it starts",
    opt1Category: "burnout",
    opt2Text: "A quiet anxiety I can't name",
    opt2Category: "overloaded",
    opt3Text: "Nothing much — I'm on autopilot",
    opt3Category: "disconnected",
    opt4Text: "I'm okay, but something feels unresolved",
    opt4Category: "pressure",
  },
  {
    id: "q2",
    questionText: "When something bothers you, what do you actually do with it?",
    opt1Text: "Push it down and keep moving — that's just how it is",
    opt1Category: "isolated",
    opt2Text: "It keeps replaying in my head whether I want it to or not",
    opt2Category: "overloaded",
    opt3Text: "I don't really feel much about anything lately",
    opt3Category: "disconnected",
    opt4Text: "I vent eventually, but usually too late",
    opt4Category: "pressure",
  },
  {
    id: "q3",
    questionText: "Think about the last time you felt genuinely rested. When was that?",
    opt1Text: "I honestly can't remember — I wake up already tired",
    opt1Category: "burnout",
    opt2Text: "I rest but it doesn't recover anything",
    opt2Category: "burnout",
    opt3Text: "Occasionally, but it never lasts",
    opt3Category: "overloaded",
    opt4Text: "Rest feels like wasted time right now",
    opt4Category: "pressure",
  },
  {
    id: "q4",
    questionText: "How connected do you feel to the people around you?",
    opt1Text: "Like I'm watching from behind glass — present but not really there",
    opt1Category: "disconnected",
    opt2Text: "I show up but nobody really knows what's going on with me",
    opt2Category: "isolated",
    opt3Text: "I've pulled away and I'm not sure why",
    opt3Category: "isolated",
    opt4Text: "It's fine, but there's a gap I can't explain",
    opt4Category: "directionless",
  },
  {
    id: "q5",
    questionText: "Do you have a clear sense of what you're working toward right now?",
    opt1Text: "No — I'm going through motions but don't know why",
    opt1Category: "directionless",
    opt2Text: "I used to. Now I'm not sure any of it means anything",
    opt2Category: "disconnected",
    opt3Text: "Vaguely, but it doesn't excite me",
    opt3Category: "pressure",
    opt4Text: "I know what I should want — I'm just not feeling it",
    opt4Category: "directionless",
  },
  {
    id: "q6",
    questionText: "When pressure builds — at work, home, money — how does your body respond?",
    opt1Text: "Tight chest, jaw clenching, constant edge",
    opt1Category: "overloaded",
    opt2Text: "I shut down — go quiet and cold",
    opt2Category: "isolated",
    opt3Text: "I power through but I'm running on nothing",
    opt3Category: "burnout",
    opt4Text: "Small things set me off and I hate that",
    opt4Category: "overloaded",
  },
  {
    id: "q7",
    questionText: "Be honest — when did you last do something just for yourself?",
    opt1Text: "I don't even know what that looks like anymore",
    opt1Category: "burnout",
    opt2Text: "Everything I do is for other people or obligations",
    opt2Category: "overloaded",
    opt3Text: "I tried — it felt wrong, like I should be doing something else",
    opt3Category: "pressure",
    opt4Text: "I don't feel like I deserve it right now",
    opt4Category: "disconnected",
  },
  {
    id: "q8",
    questionText: "If a close friend asked you 'how are you really?' — what would the honest answer be?",
    opt1Text: "I'd probably still say 'fine' — it's just easier",
    opt1Category: "isolated",
    opt2Text: "Tired. Just really tired in a way sleep doesn't fix",
    opt2Category: "burnout",
    opt3Text: "Lost. I don't know who I am right now",
    opt3Category: "directionless",
    opt4Text: "Holding on. But I don't know for how long",
    opt4Category: "pressure",
  },
];

const MENTAL_EMOTIONAL_HEALTH_RESULTS: Record<string, AssessmentResultContent> = {
  overloaded: {
    title: "Mentally Overloaded",
    tagline: "You're carrying more than you should have to.",
    desc: "Things are piling up faster than you can process them. You're still functioning, but something has to give. That's not weakness — that's information your body is giving you.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Some days holding yourself together takes everything.",
    actionPlan: {
      title: "Immediate Action Plan: Clear the Load",
      steps: [
        { label: "Do a brain dump tonight", detail: "Write every open task, worry, or obligation on paper. Getting it out of your head and onto a page reduces cognitive load within 10 minutes." },
        { label: "Identify one thing to say no to this week", detail: "Overload is often a boundary problem. Find one commitment that drains more than it gives and push back — even partially." },
        { label: "15-minute daily decompression window", detail: "Research shows even short recovery periods (walk, stillness, no screens) reset your nervous system. Block it like a meeting." },
        { label: "Triage vs. tackle", detail: "Separate what needs doing THIS week from everything else. Most of what feels urgent isn't. The list is shorter than it looks." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men in the same place", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Find tools for managing mental load", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  disconnected: {
    title: "Emotionally Disconnected",
    tagline: "You're present, but not quite here.",
    desc: "You may be going through the motions without feeling much. That flatness is its own kind of heaviness — and it's worth paying attention to before it becomes harder to reach.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Feeling numb isn't the same as being okay.",
    actionPlan: {
      title: "Immediate Action Plan: Reconnect",
      steps: [
        { label: "Do something physical today", detail: "Emotional disconnection often has a physical root. Exercise — even a 20-minute walk — reactivates the nervous system and can break numbness within days." },
        { label: "Name three things you used to enjoy", detail: "Anhedonia (inability to feel pleasure) is treatable. Identifying what you've drifted from is step one to finding your way back." },
        { label: "Have one honest conversation this week", detail: "Not a therapy session — just say something real to someone. 'I've been feeling off lately' is enough to start." },
        { label: "Limit passive screen time before bed", detail: "Doom-scrolling and passive consumption deepen emotional flatness. Replace 30 minutes of it with reading or a real conversation." },
      ],
    },
    nextSteps: [
      { label: "Stories from men who felt the same way", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Community check-in — just listen if you like", action: "Join Community", href: "/community", icon: "MessageSquare" },
      { label: "Mental health guides and resources", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  pressure: {
    title: "Running on Pressure",
    tagline: "You're keeping it together — but at a cost.",
    desc: "You're functional. You show up. But internally, you're running hot. The pressure isn't going away on its own, and ignoring it has a shelf life.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    microcopy: "Small improvements matter. You don't have to overhaul everything.",
    actionPlan: {
      title: "Immediate Action Plan: Release the Valve",
      steps: [
        { label: "Identify your top pressure source", detail: "Is it money, performance, relationships, or identity? Pressure that has no named source can't be addressed. Name it — even vaguely." },
        { label: "Build one pressure-release habit", detail: "Running, boxing, journaling, cold showers — men who have a physical outlet for pressure show significantly lower anxiety markers." },
        { label: "Audit what you're absorbing for others", detail: "Men under pressure often carry other people's stress too. Are you the one everyone leans on? That compounds. Know the difference between support and absorption." },
        { label: "Set a recovery checkpoint", detail: "Pressure-running without checkpoints leads to burnout. Block one hour this week that's entirely yours. No productivity. Just recovery." },
      ],
    },
    nextSteps: [
      { label: "Read from men who've been here", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Practical resources to reduce pressure", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Talk anonymously with other men", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  burnout: {
    title: "Burned Out",
    tagline: "You've been running on empty for a while.",
    desc: "Rest isn't restoring you. That's a signal. Burnout isn't laziness — it's what happens when output has exceeded input for too long. Something needs to change at the root.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "You can't pour from an empty cup. That's not a cliché — it's just true.",
    actionPlan: {
      title: "Immediate Action Plan: Recover First",
      steps: [
        { label: "Stop trying to push through — recovery is the work", detail: "Burnout treated with more effort gets worse. Your first job is to reduce the output, not increase it. Identify what can be paused or delegated this week." },
        { label: "Sleep is non-negotiable", detail: "Burnout severely disrupts sleep architecture. Prioritising 7–9 hours is the single highest-leverage recovery action — before supplements, therapy, or anything else." },
        { label: "Find one thing that genuinely restores you", detail: "Not TV, not booze — something that leaves you feeling more full than before. A hobby, being in nature, physical movement, building something. What was it, before all this?" },
        { label: "Talk to someone — not to solve it, just to say it out loud", detail: "Social withdrawal is a burnout symptom and a burnout amplifier. One honest conversation per week has measurable effects on recovery timelines." },
      ],
    },
    nextSteps: [
      { label: "Stories from men who burned out and found their way", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Recovery resources", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Community — you don't have to talk, just read", action: "Join Community", href: "/community", icon: "MessageSquare" },
    ],
  },
  directionless: {
    title: "Directionless",
    tagline: "You're not sure where you're going right now.",
    desc: "That uncertainty is unsettling — and real. When purpose is absent, everything feels heavier. You're not broken. You're between things. That's a specific problem with a real path out.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    microcopy: "Not knowing where you're going isn't the same as being stuck.",
    actionPlan: {
      title: "Immediate Action Plan: Find True North",
      steps: [
        { label: "Write down what used to matter to you", detail: "Direction is often lost, not absent. Before finding new purpose, recover what you may have buried. Write three things that genuinely mattered to you 3–5 years ago." },
        { label: "Separate 'should want' from 'actually want'", detail: "A lot of directionlessness is running on borrowed values. What do you actually want — not what others expect? Even a rough answer reorients everything." },
        { label: "Take one small action in a new direction", detail: "Not a life plan — just one step. Sign up for one thing, reach out to one person, spend one afternoon doing something different. Motion changes perspective." },
        { label: "Stop waiting for clarity before moving", detail: "Clarity comes from action, not the other way around. You don't need to know the destination to take the next step." },
      ],
    },
    nextSteps: [
      { label: "Stories from men finding their footing", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Guides that help with direction and purpose", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Talk to other men in the same place", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  isolated: {
    title: "Isolated but Functional",
    tagline: "You're doing fine on the outside. Less so on the inside.",
    desc: "You haven't broken down. You're still showing up. But something is going unsaid, and the silence is building. Connection doesn't have to mean vulnerability — it just means honesty.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    microcopy: "You don't have to carry everything silently.",
    actionPlan: {
      title: "Immediate Action Plan: Bridge the Gap",
      steps: [
        { label: "Identify one person you trust — even barely", detail: "You don't need a best friend or a therapist. You need one person to whom you can say something real. One is enough to start." },
        { label: "Lower the bar on what 'connection' means", detail: "Isolation often persists because men set the bar at 'deep talk or nothing.' A regular coffee, a gym partner, a shared hobby — all of these rebuild the neural pathways of belonging." },
        { label: "Read or listen to other men's honest accounts", detail: "The antidote to isolation isn't always talking — sometimes it's hearing. Reading real stories from men who felt what you feel is scientifically proven to reduce the sense of being alone." },
        { label: "Acknowledge the cost of silence", detail: "Chronic isolation increases cortisol, disrupts sleep, and raises depression risk by over 40%. This isn't about being social — it's about your baseline health." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've been isolated", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Community — anonymous and low-pressure", action: "Join Community", href: "/community", icon: "MessageSquare" },
      { label: "Resources for connection and mental health", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  // Legacy fallback (predates the current 6-category set)
  functional: {
    title: "Isolated but Functional",
    tagline: "You're doing fine on the outside. Less so on the inside.",
    desc: "You're holding it together. But something is going unsaid, and the silence is building.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    microcopy: "You don't have to carry everything silently.",
    actionPlan: {
      title: "Immediate Action Plan: Bridge the Gap",
      steps: [
        { label: "Find one person to say something real to", detail: "One honest moment with one person is enough to start shifting the pattern." },
        { label: "Lower the bar for connection", detail: "It doesn't have to be a deep conversation — a shared activity, a brief check-in, something real." },
        { label: "Read other men's accounts", detail: "Hearing that others feel what you feel is one of the fastest ways to feel less alone." },
        { label: "Name what's going unsaid", detail: "Even writing it privately helps. The silence itself is part of the weight." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've been there", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Community — anonymous, low-pressure", action: "Join Community", href: "/community", icon: "MessageSquare" },
      { label: "Resources and support", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
};

const WORK_FINANCIAL_STABILITY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "wf1",
    questionText: "When a bill or bank notification comes in, what's your gut reaction?",
    opt1Text: "I let it sit for a while before I can even open it",
    opt1Category: "avoidance",
    opt2Text: "Dread — like it might be the one that breaks things",
    opt2Category: "instability",
    opt3Text: "I immediately think about how it compares to what everyone else seems to be managing",
    opt3Category: "status_anxiety",
    opt4Text: "Tired — it's one more thing that's on me to handle",
    opt4Category: "provider_strain",
  },
  {
    id: "wf2",
    questionText: "How do you actually feel about your current job or income?",
    opt1Text: "Uncertain — like it could disappear and I wouldn't see it coming",
    opt1Category: "instability",
    opt2Text: "Numb to it. I show up, but I couldn't tell you what I'm working toward",
    opt2Category: "drift",
    opt3Text: "Trapped by what I already owe — I can't afford to make a change",
    opt3Category: "debt_trap",
    opt4Text: "Fine for me, but I worry constantly about the people counting on it",
    opt4Category: "provider_strain",
  },
  {
    id: "wf3",
    questionText: "When you think about your debt (credit cards, loans, whatever it is), what comes up?",
    opt1Text: "Shame, honestly — like it says something about me as a person",
    opt1Category: "debt_trap",
    opt2Text: "I genuinely don't know the exact number, and that's on purpose",
    opt2Category: "avoidance",
    opt3Text: "Frustration that everyone around me seems to have this figured out",
    opt3Category: "status_anxiety",
    opt4Text: "Fear that one bad month and it all falls apart",
    opt4Category: "instability",
  },
  {
    id: "wf4",
    questionText: "Do you check your bank balance regularly?",
    opt1Text: "No — I'd rather not know some weeks",
    opt1Category: "avoidance",
    opt2Text: "Constantly, and it makes the anxiety worse, not better",
    opt2Category: "instability",
    opt3Text: "Yes, and I measure it against what I think I 'should' have by now",
    opt3Category: "status_anxiety",
    opt4Text: "Sometimes, but it doesn't really register anymore either way",
    opt4Category: "drift",
  },
  {
    id: "wf5",
    questionText: "If you lost your income tomorrow, how would it hit you?",
    opt1Text: "Terrified — I already feel one step from that",
    opt1Category: "instability",
    opt2Text: "Almost relieved, which scares me more than the fear does",
    opt2Category: "drift",
    opt3Text: "Mostly worried about everyone who depends on me, not myself",
    opt3Category: "provider_strain",
    opt4Text: "Panicked about what happens to what I already owe",
    opt4Category: "debt_trap",
  },
  {
    id: "wf6",
    questionText: "How do you handle financial decisions — big or small?",
    opt1Text: "I avoid making them as long as I possibly can",
    opt1Category: "avoidance",
    opt2Text: "I compare every option to what other people seem to be doing",
    opt2Category: "status_anxiety",
    opt3Text: "Alone — I don't want to worry the people I'd normally talk to",
    opt3Category: "provider_strain",
    opt4Text: "Carefully, because one wrong move feels like it could bury me further",
    opt4Category: "debt_trap",
  },
  {
    id: "wf7",
    questionText: "What does 'success' feel like to you right now, financially or career-wise?",
    opt1Text: "Like something other people have figured out and I haven't",
    opt1Category: "status_anxiety",
    opt2Text: "Honestly, I don't know anymore — it used to mean something and now it doesn't",
    opt2Category: "drift",
    opt3Text: "Just not being scared every month. That's the whole bar right now",
    opt3Category: "instability",
    opt4Text: "Getting out from under what I already owe",
    opt4Category: "debt_trap",
  },
  {
    id: "wf8",
    questionText: "Be honest — when did you last talk to someone about money stress?",
    opt1Text: "Never really — it feels like my problem to solve, not theirs",
    opt1Category: "provider_strain",
    opt2Text: "I don't, because I don't want to face the actual numbers out loud",
    opt2Category: "avoidance",
    opt3Text: "I have, and it usually turns into comparing myself to them",
    opt3Category: "status_anxiety",
    opt4Text: "I'm not sure it would even help at this point",
    opt4Category: "drift",
  },
];

const WORK_FINANCIAL_STABILITY_RESULTS: Record<string, AssessmentResultContent> = {
  instability: {
    title: "Financially Unstable, Not Failing",
    tagline: "The ground feels like it could shift any month.",
    desc: "You're not bad with money — you're operating without a safety net, and your nervous system knows it. That constant low-grade alert isn't overreacting. It's an accurate read on an unstable situation.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    microcopy: "Instability is a circumstance, not a character flaw.",
    actionPlan: {
      title: "Immediate Action Plan: Build a Floor",
      steps: [
        { label: "Find your actual number, not the feared one", detail: "Fear inflates the unknown. Sit down and calculate exactly what you have and what you owe — the real number is almost always less frightening than the one in your head." },
        { label: "Build a one-week buffer before a one-year plan", detail: "You don't need six months of savings to feel less at-risk. Even a small amount set aside changes how your body responds to a bill." },
        { label: "Separate 'not enough right now' from 'never enough'", detail: "Instability is often temporary and situational. Naming it as a phase, not a permanent state, changes how it sits in your body." },
        { label: "Identify one fixed cost you could actually reduce this month", detail: "Not a lifestyle overhaul — one real, specific line item. Small, concrete wins rebuild your sense of control faster than big plans do." },
      ],
    },
    nextSteps: [
      { label: "Vetted ways to bring in extra income now", action: "Small Wins", href: "/small-wins", icon: "DollarSign" },
      { label: "Job and career resources built for this", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Read what other men have gone through", action: "Read Stories", href: "/stories", icon: "BookOpen" },
    ],
  },
  avoidance: {
    title: "Avoiding the Numbers",
    tagline: "Not looking doesn't make it stop — it just makes it louder later.",
    desc: "Avoidance feels like relief in the moment, but it's compounding, not resolving, whatever's actually going on with your money. The fear of the number is almost always worse than the number itself.",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    microcopy: "You can't fix what you won't look at — but looking is the hard part, not the fixing.",
    actionPlan: {
      title: "Immediate Action Plan: Look Once",
      steps: [
        { label: "Set a 10-minute window to check everything — just once", detail: "Not to fix it. Just to see it. Most financial avoidance dissolves the moment the actual number is on the screen instead of in your imagination." },
        { label: "Write the three numbers that matter", detail: "What you have, what you owe, what's coming in this month. Three numbers, nothing more. That's the whole first step." },
        { label: "Tell one person you're avoiding it", detail: "Saying it out loud to someone — even just 'I've been avoiding my bank account' — breaks the isolation that avoidance thrives on." },
        { label: "Automate one thing so willpower isn't required", detail: "One autopay, one automatic transfer to savings. Avoidance loses its grip once at least one part runs without you having to face it." },
      ],
    },
    nextSteps: [
      { label: "Career Hub — resources without judgment", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Talk to other men who've been here", action: "Join Community", href: "/community", icon: "Users" },
      { label: "Guides for getting a handle on money stress", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  status_anxiety: {
    title: "Measuring Yourself Against Everyone Else",
    tagline: "You're comparing your real situation to everyone else's highlight reel.",
    desc: "Status anxiety around money is almost never about the actual numbers — it's about what you imagine they say about your worth. Most of what you're comparing yourself to is incomplete, curated, or simply not true.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    microcopy: "You don't know what anyone else actually has. You only know what they show you.",
    actionPlan: {
      title: "Immediate Action Plan: Change What You're Measuring",
      steps: [
        { label: "Name what you're actually comparing", detail: "Income? Savings? A house? Get specific — vague comparison ('they're doing better') is what keeps this feeling so heavy. Specific comparison is usually much less damning." },
        { label: "Mute or unfollow one account that consistently triggers this", detail: "You don't need to quit social media. You need fewer curated highlight reels showing up next to your real, ordinary life." },
        { label: "Define your own number, not theirs", detail: "What would actually feel like enough for you? Write it down. Most men have never actually defined this — they're chasing a moving target set by comparison instead." },
        { label: "Remember what you don't see", detail: "The debt behind the new car. The strain behind the vacation photos. Status anxiety runs on incomplete information by design." },
      ],
    },
    nextSteps: [
      { label: "Career resources to actually move forward", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Read honest accounts from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk anonymously — no performance required", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  provider_strain: {
    title: "Carrying It Alone",
    tagline: "You've made this everyone else's stability and nobody else's problem.",
    desc: "You've decided the financial pressure is yours to hold, silently, so no one else has to feel it. That's not strength being tested — it's isolation being built, one unshared worry at a time.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Carrying it alone doesn't protect the people you love. It just means they can't help.",
    actionPlan: {
      title: "Immediate Action Plan: Share the Weight",
      steps: [
        { label: "Say one true sentence to the person closest to you", detail: "Not the whole picture — one honest sentence: 'Money's been stressing me out more than I've said.' That alone changes the isolation." },
        { label: "Separate what's actually yours to solve from what you've assumed is", detail: "Providing doesn't require carrying the emotional weight alone too. Those are two different jobs, and you may have taken on both without realizing it." },
        { label: "Ask what they actually need — don't assume", detail: "Men under provider strain often protect people from information those people would rather have. Most partners would rather know than be shielded." },
        { label: "Find one resource built for exactly this", detail: "Not necessarily a therapist — a career resource, a peer who's been through it, a guide. You don't have to build the way out from nothing." },
      ],
    },
    nextSteps: [
      { label: "Career Hub — built for exactly this pressure", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Other men carrying the same weight", action: "Join Community", href: "/community", icon: "Users" },
      { label: "Practical guides for financial pressure", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  drift: {
    title: "Going Through the Motions",
    tagline: "You're working. You're just not sure toward what anymore.",
    desc: "Somewhere along the way, the job became just a job — something you do, not something that means anything. That flatness about work and money isn't laziness. It's usually a sign the 'why' got lost somewhere along the way.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Losing direction isn't the same as losing capability.",
    actionPlan: {
      title: "Immediate Action Plan: Reconnect to a Why",
      steps: [
        { label: "Write down why you took this path in the first place", detail: "Even if it no longer applies. Seeing the original reason — and noticing it's gone — is the first honest step toward finding a new one." },
        { label: "Identify one thing about work that still feels real", detail: "A skill, a colleague, a part of the day that doesn't feel hollow. Direction often gets rebuilt from one true thing, not a total overhaul." },
        { label: "Take one concrete step toward a change, even a small one", detail: "Update a resume. Message one contact. Look at one job posting. Motion — not certainty — is what breaks drift." },
        { label: "Separate 'unfulfilling' from 'unbearable'", detail: "Knowing which one you're actually dealing with changes whether the next step is a mindset shift or an exit plan." },
      ],
    },
    nextSteps: [
      { label: "Resources for figuring out the next move", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Read how other men found direction again", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Guides on purpose and career direction", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  debt_trap: {
    title: "Trapped by What You Owe",
    tagline: "It's not just the number. It's the shame that's built up around it.",
    desc: "Debt has a way of feeling like a verdict on who you are, not just a financial fact. That shame keeps a lot of men from doing the practical things that would actually start moving the number — because the numbers feel too tied up in self-worth to even look at squarely.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "Debt is a math problem wearing a shame costume.",
    actionPlan: {
      title: "Immediate Action Plan: Separate the Shame from the Number",
      steps: [
        { label: "Write down what you owe, without a story attached", detail: "Just the number. Not 'I'm irresponsible,' not 'I've failed' — just the figure. Debt responds to a plan; shame just keeps you from making one." },
        { label: "Pick the smallest real step, not the whole solution", detail: "One call to a lender, one balance moved, one autopay set. Debt trap thinking makes it feel like all-or-nothing. It's never actually all-or-nothing." },
        { label: "Check if you qualify for support you haven't looked into", detail: "Consolidation, hardship programs, employer assistance — most men in debt trap mode have never actually checked, because looking feels like admitting it out loud." },
        { label: "Talk to one person without minimizing or exaggerating it", detail: "Debt shame thrives in silence and in extremes. The real number, said plainly to one person, usually shrinks the shame around it." },
      ],
    },
    nextSteps: [
      { label: "Vetted ways to bring in extra income", action: "Small Wins", href: "/small-wins", icon: "DollarSign" },
      { label: "Career Hub for stability and next steps", action: "Career Hub", href: "/career-hub", icon: "Briefcase" },
      { label: "Other men who've dealt with this", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
};

const RELATIONSHIPS_STRESS_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "rs1",
    questionText: "When you think about dating or being in a relationship right now, what's the honest reaction?",
    opt1Text: "Exhausted just thinking about it — like another thing to manage",
    opt1Category: "dating_fatigue",
    opt2Text: "I've mostly stopped trying and don't talk about it much",
    opt2Category: "isolation",
    opt3Text: "Uncertain who I even am in that context right now",
    opt3Category: "identity_loss",
    opt4Text: "Fine, but I avoid anything that could get complicated",
    opt4Category: "conflict_avoidant",
  },
  {
    id: "rs2",
    questionText: "How do you handle a disagreement with someone close to you?",
    opt1Text: "Let it go and hope it resolves itself",
    opt1Category: "conflict_avoidant",
    opt2Text: "Go along with it outwardly, stay annoyed about it privately",
    opt2Category: "resentment_buildup",
    opt3Text: "Pull back rather than push through it",
    opt3Category: "isolation",
    opt4Text: "Don't have the energy left to engage with it properly",
    opt4Category: "overextended_parent",
  },
  {
    id: "rs3",
    questionText: "How connected do you feel to people outside your immediate obligations?",
    opt1Text: "Not very — most of my relationships are more logistics than connection",
    opt1Category: "isolation",
    opt2Text: "There's no time left for anything outside what's required of me",
    opt2Category: "overextended_parent",
    opt3Text: "Connected on the surface, but there's distance I haven't named",
    opt3Category: "resentment_buildup",
    opt4Text: "I've kind of given up trying to build new ones",
    opt4Category: "dating_fatigue",
  },
  {
    id: "rs4",
    questionText: "If something's bothering you about a relationship, what actually happens to that feeling?",
    opt1Text: "It sits there and builds instead of getting said",
    opt1Category: "resentment_buildup",
    opt2Text: "I decide it's not worth bringing up",
    opt2Category: "conflict_avoidant",
    opt3Text: "I deal with it alone rather than involving the other person",
    opt3Category: "isolation",
    opt4Text: "I question whether I'm the problem more than the situation",
    opt4Category: "identity_loss",
  },
  {
    id: "rs5",
    questionText: "How present do you feel with your kids or the people who depend on you?",
    opt1Text: "Physically there, mentally somewhere else most of the time",
    opt1Category: "overextended_parent",
    opt2Text: "Not sure I know what 'present' is even supposed to look like right now",
    opt2Category: "identity_loss",
    opt3Text: "Present, but going through motions more than connecting",
    opt3Category: "resentment_buildup",
    opt4Text: "I've pulled back more than I'd like to admit",
    opt4Category: "isolation",
  },
  {
    id: "rs6",
    questionText: "What happened to a relationship or friendship that used to matter more?",
    opt1Text: "It faded out and neither of us reached back out",
    opt1Category: "isolation",
    opt2Text: "I got tired of putting in effort that didn't get returned",
    opt2Category: "dating_fatigue",
    opt3Text: "Something went unresolved and we never really recovered",
    opt3Category: "resentment_buildup",
    opt4Text: "A big change (breakup, divorce, move) reshaped everything around it",
    opt4Category: "identity_loss",
  },
  {
    id: "rs7",
    questionText: "How do you feel about your capacity to be there for people right now?",
    opt1Text: "Stretched past what I can actually give",
    opt1Category: "overextended_parent",
    opt2Text: "Uncertain — I don't feel like the same person I was in that role before",
    opt2Category: "identity_loss",
    opt3Text: "Fine as long as nothing hard comes up",
    opt3Category: "conflict_avoidant",
    opt4Text: "Depleted, honestly, by how much relationships take right now",
    opt4Category: "dating_fatigue",
  },
  {
    id: "rs8",
    questionText: "Be honest — is there anything left unsaid with someone close to you?",
    opt1Text: "Yes, and it's been sitting there a while",
    opt1Category: "resentment_buildup",
    opt2Text: "Probably, but bringing it up doesn't feel worth the friction",
    opt2Category: "conflict_avoidant",
    opt3Text: "I've stopped expecting to say it to anyone",
    opt3Category: "isolation",
    opt4Text: "I'm not even sure what the unsaid thing actually is anymore",
    opt4Category: "identity_loss",
  },
];

const RELATIONSHIPS_STRESS_RESULTS: Record<string, AssessmentResultContent> = {
  dating_fatigue: {
    title: "Relationship Burnout",
    tagline: "Connection has started to feel like one more thing to manage.",
    desc: "Whether it's dating apps, friendships, or family, putting in effort that doesn't come back has worn you down. That exhaustion is a real, studied response to relational effort with no return — not a sign you don't want connection anymore.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    microcopy: "Wanting a break from effort isn't the same as wanting to be alone.",
    actionPlan: {
      title: "Immediate Action Plan: Recover the Capacity",
      steps: [
        { label: "Take a real break, not a guilty pause", detail: "If it's dating specifically, an actual 2–4 week stop lets the exhaustion settle before you try again — not a browse-anyway break." },
        { label: "Separate effort from outcome", detail: "Burnout often comes from measuring your worth by how things land, not by whether you showed up honestly. Those are different questions." },
        { label: "Lower the volume, not the standard", detail: "Fewer, more genuine interactions beat more depleting ones — quantity is what's driving the burnout, not your standards." },
        { label: "Notice what still gives you energy", detail: "One relationship or connection that doesn't drain you is worth protecting deliberately right now, even if it's not romantic." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've felt this", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Guides for rebuilding connection", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  isolation: {
    title: "Drifting From Connection",
    tagline: "Your relationships have quietly become more logistics than connection.",
    desc: "Somewhere along the way, checking in stopped happening, and nobody pushed back on the silence. That drift is common and reversible — but it doesn't reverse on its own.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Drift is usually nobody's fault and everybody's responsibility.",
    actionPlan: {
      title: "Immediate Action Plan: Close the Gap",
      steps: [
        { label: "Reach out to one person you've drifted from", detail: "A short, low-stakes message. Reconnection usually starts smaller than people expect it to." },
        { label: "Say what actually happened, if you know", detail: "\"We just lost touch\" is honest and enough. You don't need a bigger explanation to reopen the door." },
        { label: "Pick one relationship to invest in on purpose this month", detail: "Not all of them at once — one, deliberately, is more sustainable than a blanket effort to reconnect with everyone." },
        { label: "Notice the pattern, not just this one relationship", detail: "If this keeps happening across multiple relationships, the drift might be a habit worth naming to yourself directly." },
      ],
    },
    nextSteps: [
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
      { label: "Read stories about rebuilding connection", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Guides for connection and relationships", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  identity_loss: {
    title: "Between Who You Were and What Comes Next",
    tagline: "A relationship, breakup, or divorce reshaped more than your schedule.",
    desc: "Whatever the specific cause, you're in a real, disorienting transition, not a personal failure. Identity built around a role — partner, father, provider — doesn't just move on the moment the role does.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    microcopy: "Feeling unmoored right now is a response to what happened, not a verdict on who you are.",
    actionPlan: {
      title: "Immediate Action Plan: Find Solid Ground",
      steps: [
        { label: "Name what actually changed", detail: "Be specific about which part of your identity feels unmoored, rather than a vague sense that \"everything\" did." },
        { label: "Give the disorientation a timeline, not a deadline", detail: "This kind of identity shift takes real time. Rushing it doesn't speed it up — it usually just delays it." },
        { label: "Reconnect with one part of yourself that predates this", detail: "A skill, an interest, a friendship that isn't tied to the role you lost — proof that you existed before it too." },
        { label: "Take this seriously if it's gotten heavier than sadness", detail: "If it's moved toward hopelessness, that's the moment to reach out to a person or a professional, not push through it alone." },
      ],
    },
    nextSteps: [
      { label: "Read stories from men who've been here", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men going through the same thing", action: "Join Community", href: "/community", icon: "Users" },
      { label: "Guides for navigating major life transitions", action: "Support & Growth", href: "/guides", icon: "Wrench" },
    ],
  },
  conflict_avoidant: {
    title: "Keeping the Peace, Not Having It",
    tagline: "You've been avoiding friction, not resolving it.",
    desc: "Letting things go without addressing them feels easier in the moment, but it doesn't actually create peace — it just delays and quietly compounds whatever's unresolved underneath.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    microcopy: "Avoiding a conflict doesn't make it disappear. It just moves it later and makes it bigger.",
    actionPlan: {
      title: "Immediate Action Plan: Say the Smaller Thing First",
      steps: [
        { label: "Say one small honest thing you'd normally let slide", detail: "Low stakes first — this is a muscle, and it's easier to practice on something minor than to start with the biggest issue you have." },
        { label: "Notice what you're actually afraid will happen", detail: "Most conflict-avoidance runs on an assumption about the fallout of speaking up — one that's rarely actually tested." },
        { label: "Separate 'not now' from 'never'", detail: "Some things genuinely can wait. Others just keep getting relabeled 'not now' indefinitely — worth being honest with yourself about which is which." },
        { label: "Practice a soft opening", detail: "How a hard conversation starts changes how it ends. Leading with how you feel lands differently than leading with blame." },
      ],
    },
    nextSteps: [
      { label: "Guides on communication and conflict", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read how other men have navigated this", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk anonymously with other men", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  resentment_buildup: {
    title: "Carrying What You Haven't Said",
    tagline: "Something's been sitting there, unaddressed, for a while.",
    desc: "Unspoken resentment doesn't stay quiet. It leaks out sideways — in tone, in distance, in small digs — usually in ways that are harder to deal with than the original issue would have been.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "Silence doesn't make resentment smaller. It just changes how it comes out.",
    actionPlan: {
      title: "Immediate Action Plan: Name It Before It Leaks Out",
      steps: [
        { label: "Name it to yourself first, specifically", detail: "Not a vague feeling — the actual thing. Specificity is what makes it addressable instead of just heavy." },
        { label: "Decide on purpose whether to raise it", detail: "Not everything needs to be said out loud, but deciding consciously is different from just letting it sit by default." },
        { label: "Watch for it leaking out sideways", detail: "A short tone, subtle distance, sarcasm — signs it's coming out anyway, just not directly, which usually lands worse." },
        { label: "Address the smallest version of it first", detail: "A full reckoning is intimidating. Naming one specific part of it is much more doable than tackling all of it at once." },
      ],
    },
    nextSteps: [
      { label: "Guides on repair and communication", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
      { label: "Read stories about working through this", action: "Read Stories", href: "/stories", icon: "BookOpen" },
    ],
  },
  overextended_parent: {
    title: "Stretched Past What You Have Left to Give",
    tagline: "You're showing up. There's just less of you left to show up with.",
    desc: "Caring for people who depend on you while running on empty isn't sustainable just because you're managing it — the goal isn't pushing harder, it's finding where the load can actually come down.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Running on empty and still showing up is not the same as having enough to give.",
    actionPlan: {
      title: "Immediate Action Plan: Find Where the Load Comes Down",
      steps: [
        { label: "Find one small pocket of real presence, not more time", detail: "Ten focused minutes beats an exhausted hour — presence, not duration, is what actually registers." },
        { label: "Say out loud that you're stretched", detail: "To a partner, co-parent, or friend. This is a load problem, not a love problem, and it's easier to fix once it's actually named." },
        { label: "Identify one thing you can hand off or drop", detail: "The goal isn't doing it all better. It's doing less of it — even one thing off the list changes the math." },
        { label: "Protect one recovery point in your week", detail: "Even a small one. You can't keep giving from a completely empty tank, no matter how much it's needed of you." },
      ],
    },
    nextSteps: [
      { label: "Guides for managing overload", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other stretched-thin men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
};

const PHYSICAL_WELLBEING_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "pw1",
    questionText: "How would you describe your sleep lately?",
    opt1Text: "Technically happening, but I never feel rested",
    opt1Category: "sleep_deprived",
    opt2Text: "I sleep fine but I'm still exhausted all day",
    opt2Category: "depleted",
    opt3Text: "Inconsistent — no real bedtime, no real routine",
    opt3Category: "neglecting_basics",
    opt4Text: "Fine, but I'm still low energy because I barely move",
    opt4Category: "sedentary",
  },
  {
    id: "pw2",
    questionText: "When's the last time you exercised or moved your body on purpose?",
    opt1Text: "Longer ago than I'd like to admit",
    opt1Category: "sedentary",
    opt2Text: "Recently, but it's driven by anxiety about how I look, not enjoyment",
    opt2Category: "body_dissatisfaction",
    opt3Text: "I want to, but I don't have the energy for it",
    opt3Category: "depleted",
    opt4Text: "I do, but I can't seem to take a rest day without guilt",
    opt4Category: "compulsive_pattern",
  },
  {
    id: "pw3",
    questionText: "How do you feel about your body most days?",
    opt1Text: "Critical — never quite satisfied no matter what changes",
    opt1Category: "body_dissatisfaction",
    opt2Text: "I don't think about it much either way — it's just there",
    opt2Category: "neglecting_basics",
    opt3Text: "Disconnected from it — like it's just something I have to drag through the day",
    opt3Category: "depleted",
    opt4Text: "Fine, but I know I've let it go and don't love that",
    opt4Category: "sedentary",
  },
  {
    id: "pw4",
    questionText: "What's your actual relationship with food most days?",
    opt1Text: "Erratic — skip meals, then eat whatever's fastest",
    opt1Category: "neglecting_basics",
    opt2Text: "Full of rules I've made for myself about what I 'should' eat",
    opt2Category: "body_dissatisfaction",
    opt3Text: "I use food, alcohol, or something else to manage how I'm feeling",
    opt3Category: "compulsive_pattern",
    opt4Text: "Fine, but I don't think it's actually fueling me well",
    opt4Category: "depleted",
  },
  {
    id: "pw5",
    questionText: "If you had a substance, habit, or behavior you couldn't fully control, would you know it?",
    opt1Text: "Yes — and I've been avoiding looking at it directly",
    opt1Category: "compulsive_pattern",
    opt2Text: "Probably, but I haven't really checked",
    opt2Category: "neglecting_basics",
    opt3Text: "It would probably be more about control over my body than a substance",
    opt3Category: "body_dissatisfaction",
    opt4Text: "No — that's not really where my struggle is",
    opt4Category: "sedentary",
  },
  {
    id: "pw6",
    questionText: "How consistent are your daily habits — sleep, movement, meals?",
    opt1Text: "Barely any consistency at all",
    opt1Category: "neglecting_basics",
    opt2Text: "Movement and food are fine, sleep is the one thing that's a mess",
    opt2Category: "sleep_deprived",
    opt3Text: "Sleep and food are fine, movement is the one that's fallen off",
    opt3Category: "sedentary",
    opt4Text: "I keep trying to be consistent and it doesn't seem to change how tired I feel",
    opt4Category: "sleep_deprived",
  },
  {
    id: "pw7",
    questionText: "When you're stressed, what do you actually reach for?",
    opt1Text: "Something I already suspect I'm relying on too much",
    opt1Category: "compulsive_pattern",
    opt2Text: "Nothing physical — I just sit with it or scroll",
    opt2Category: "sedentary",
    opt3Text: "Over-exercising or being harder on myself about my body",
    opt3Category: "body_dissatisfaction",
    opt4Text: "Whatever's easiest, usually not something that actually helps",
    opt4Category: "neglecting_basics",
  },
  {
    id: "pw8",
    questionText: "Be honest — if a doctor asked how you're really doing physically, what would you say?",
    opt1Text: "Tired, in a way that doesn't seem to have an obvious cause",
    opt1Category: "depleted",
    opt2Text: "Running on bad sleep for longer than I'd want to admit",
    opt2Category: "sleep_deprived",
    opt3Text: "There's something I'd be uncomfortable being fully honest about",
    opt3Category: "compulsive_pattern",
    opt4Text: "Fine physically, but I'd probably downplay how much my body image bothers me",
    opt4Category: "body_dissatisfaction",
  },
];

const PHYSICAL_WELLBEING_RESULTS: Record<string, AssessmentResultContent> = {
  sleep_deprived: {
    title: "Running on Bad Sleep",
    tagline: "Sleep is the piece that's actually falling apart, even if everything else looks fine.",
    desc: "Poor sleep doesn't always look dramatic — it can just be a slow accumulation of nights that don't quite restore you, until it's quietly affecting everything else without an obvious cause.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    microcopy: "Bad sleep rarely announces itself. It just quietly costs you everywhere else.",
    actionPlan: {
      title: "Immediate Action Plan: Fix Timing First",
      steps: [
        { label: "Fix timing before technique", detail: "The same wake-up time every day, weekends included, does more for sleep quality than almost anything else you could add on top." },
        { label: "Cut the screen buffer", detail: "Screens right up until lights out keep your brain in an alert state exactly when it should be winding down — even 20–30 screen-free minutes changes this." },
        { label: "Watch the late caffeine and alcohol", detail: "Both disrupt sleep architecture even when they don't feel like they're keeping you awake in the moment." },
        { label: "Give it two real weeks before judging it", detail: "Sleep habits take time to show their effect. One good night doesn't undo months of poor sleep, and one bad night doesn't undo a genuinely improved routine." },
      ],
    },
    nextSteps: [
      { label: "Guides on sleep and recovery", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  sedentary: {
    title: "The Missing Input, Not Just a Missing Habit",
    tagline: "Movement dropped off, and the energy to start again dropped with it.",
    desc: "It feels backwards, but a body that's been still for a while doesn't reward you with more energy for staying still — it adapts to needing less, which shows up as feeling low and unmotivated to move at all.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    microcopy: "Motivation usually follows movement. Waiting for it to come first is why this keeps not starting.",
    actionPlan: {
      title: "Immediate Action Plan: Start Smaller Than Feels Worthwhile",
      steps: [
        { label: "Start smaller than feels worthwhile", detail: "Ten minutes counts. Expecting motivation to arrive before you start is exactly why this keeps stalling." },
        { label: "Attach it to something already automatic", detail: "Walk during a call, stretch during a show you already watch — removing the decision removes most of the friction." },
        { label: "Track consistency, not intensity", detail: "A short walk every day beats one hard workout a week for actually rebuilding the habit." },
        { label: "Give it three weeks before expecting to feel like exercising", detail: "The energy return usually comes after the habit is established, not before it." },
      ],
    },
    nextSteps: [
      { label: "Guides for building a movement habit", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  depleted: {
    title: "Exhausted Without a Clear Reason",
    tagline: "Nothing's obviously wrong, and you're still running on empty.",
    desc: "Persistent fatigue without an obvious cause usually has a real, addressable source — it's rarely just one thing, and it's easy to overlook the boring answers in favor of assuming something's seriously wrong.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    microcopy: "Exhaustion with no obvious cause still has a cause. It's just usually several small ones, not one big one.",
    actionPlan: {
      title: "Immediate Action Plan: Rule Out the Basics",
      steps: [
        { label: "Rule out the basics first, in order", detail: "Sleep consistency, hydration, regular meals, movement — in that order, before assuming something more serious is going on." },
        { label: "Track it for a week, honestly", detail: "Note sleep, food, movement, and energy each day. Patterns usually surface within a week that aren't visible day to day." },
        { label: "Loop in a doctor if the basics don't move it", detail: "Persistent fatigue can point to something medical that habits alone won't fix — worth ruling out rather than assuming it away." },
        { label: "Consider whether it's mood, not just body", detail: "Low energy is one of the quieter, easy-to-miss signs of depression — worth taking seriously rather than treating as only physical." },
      ],
    },
    nextSteps: [
      { label: "Guides on energy and recovery", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  body_dissatisfaction: {
    title: "At War With How You Look",
    tagline: "No version of your body has felt like enough, no matter what's changed.",
    desc: "Body image struggles in men are real and underrecognized — often centered on muscularity rather than thinness, and just as capable of taking over how you feel about yourself day to day.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    microcopy: "This is a recognized, treatable pattern — not a personal failing to push harder against.",
    actionPlan: {
      title: "Immediate Action Plan: Notice the Loop",
      steps: [
        { label: "Notice the loop, don't just push through it", detail: "Constant comparison, exercising from anxiety instead of enjoyment, never feeling \"enough\" are signs worth naming, not signs to try harder against." },
        { label: "Separate function from appearance for a week", detail: "Notice what your body lets you do, not just how it looks, as a deliberate counterweight to the usual focus." },
        { label: "Audit what's feeding the comparison", detail: "Certain accounts, certain gyms, certain conversations — notice specifically what triggers the spiral, rather than treating it as constant." },
        { label: "Talk to someone if it's running your daily decisions", detail: "If body image is shaping your eating, exercise, or mood most days, that's worth a real conversation, not something to manage alone indefinitely." },
      ],
    },
    nextSteps: [
      { label: "Guides on body image and self-worth", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  compulsive_pattern: {
    title: "Something You're Not Looking At Directly",
    tagline: "There's a habit or substance you suspect has more control than you'd like to admit.",
    desc: "Avoiding a clear look at this is common and understandable — but the avoidance itself is usually what keeps it going, more than the thing itself.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    microcopy: "Naming it plainly is the hard part. Everything after that gets more possible, not less.",
    actionPlan: {
      title: "Immediate Action Plan: Say It Plainly",
      steps: [
        { label: "Name it plainly, privately, first", detail: "Not the whole story — just an honest, private acknowledgment of what it actually is." },
        { label: "Notice what it's underneath", detail: "Stress, loneliness, something unprocessed — the substance or habit is rarely the whole story on its own." },
        { label: "Tell one person the truth", detail: "The secrecy is often as exhausting as the thing itself. This is usually the hardest and most important step." },
        { label: "Get one honest evaluation, without deciding the whole future yet", detail: "A single conversation with a doctor doesn't commit you to anything beyond that one conversation." },
      ],
    },
    nextSteps: [
      { label: "Guides on this and where to start", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
  neglecting_basics: {
    title: "Running Without a Foundation",
    tagline: "Sleep, food, and movement have all slipped at once, not just one of them.",
    desc: "When the basics go all at once, everything else gets harder to manage too. This isn't about willpower — it's usually a sign something's absorbing more of your capacity than usual.",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    microcopy: "When everything slips at once, that's a capacity problem, not a discipline problem.",
    actionPlan: {
      title: "Immediate Action Plan: Pick One, Not All Three",
      steps: [
        { label: "Pick one, not all three", detail: "Trying to fix sleep, food, and movement simultaneously usually collapses within a week. One solid habit is worth more than three shaky ones." },
        { label: "Lower the bar on what counts", detail: "A real meal, not a perfect one. Some movement, not a full workout. An earlier bedtime, not a perfect routine." },
        { label: "Notice what's actually eating your capacity", detail: "The basics don't usually slip randomly — something else is often taking the time and energy they'd normally get." },
        { label: "Rebuild in the order they usually stabilize", detail: "Sleep first, then food, then movement tends to work better than tackling them in the reverse order." },
      ],
    },
    nextSteps: [
      { label: "Guides for rebuilding the basics", action: "Support & Growth", href: "/guides", icon: "Wrench" },
      { label: "Read stories from other men", action: "Read Stories", href: "/stories", icon: "BookOpen" },
      { label: "Talk to other men anonymously", action: "Join Community", href: "/community", icon: "Users" },
    ],
  },
};

// Add "work-financial-stability" | "relationships-stress" | "physical-wellbeing"
// keys here as each pillar's Check-In content gets written. Until then,
// getAssessmentQuestions/getAssessmentResults fall back to
// DEFAULT_ASSESSMENT_PILLAR for anything not listed here.
export const ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  [DEFAULT_ASSESSMENT_PILLAR]: MENTAL_EMOTIONAL_HEALTH_QUESTIONS,
  "work-financial-stability": WORK_FINANCIAL_STABILITY_QUESTIONS,
  "relationships-stress": RELATIONSHIPS_STRESS_QUESTIONS,
  "physical-wellbeing": PHYSICAL_WELLBEING_QUESTIONS,
};

export const ASSESSMENT_RESULTS: Record<string, Record<string, AssessmentResultContent>> = {
  [DEFAULT_ASSESSMENT_PILLAR]: MENTAL_EMOTIONAL_HEALTH_RESULTS,
  "work-financial-stability": WORK_FINANCIAL_STABILITY_RESULTS,
  "relationships-stress": RELATIONSHIPS_STRESS_RESULTS,
  "physical-wellbeing": PHYSICAL_WELLBEING_RESULTS,
};

export function getAssessmentQuestions(pillarSlug?: string | null): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS[pillarSlug ?? ""] ?? ASSESSMENT_QUESTIONS[DEFAULT_ASSESSMENT_PILLAR];
}

export function getAssessmentResults(pillarSlug?: string | null): Record<string, AssessmentResultContent> {
  return ASSESSMENT_RESULTS[pillarSlug ?? ""] ?? ASSESSMENT_RESULTS[DEFAULT_ASSESSMENT_PILLAR];
}

// Resolves the pillar slug that should actually be used going forward
// (e.g. for the "take it again" / redirect links) — unrecognized or
// missing slugs collapse to the default so URLs never point at a pillar
// with no content of its own yet.
export function resolveAssessmentPillar(pillarSlug?: string | null): string {
  return pillarSlug && ASSESSMENT_QUESTIONS[pillarSlug] ? pillarSlug : DEFAULT_ASSESSMENT_PILLAR;
}
