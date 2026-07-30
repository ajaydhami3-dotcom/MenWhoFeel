-- ============================================================
-- MenWhoFeel – Phase 12 Intel articles (15 cornerstone pieces)
--
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
--
-- Covers the previously-zero topics across all 4 pillars: Anxiety,
-- Stress (Mental Health); Financial Stress, Debt, Job Loss,
-- Entrepreneurship (Work & Financial Stability); Dating, Breakups,
-- Marriage, Divorce, Fatherhood (Relationships & Stress); Nutrition,
-- Body Image, Energy, Addiction Recovery (Physical Wellbeing).
--
-- Content is plain paragraphs separated by blank lines, no markdown --
-- matches how intel/[slug]/page.tsx actually splits and renders
-- `content` (see splitIntoParagraphs) -- the automation pipeline's own
-- prompt explicitly generates "no markdown, no headings", so this
-- follows the same format rather than introducing a different one.
--
-- excerpt and metaDescription are set to the same text here (excerpt
-- is what the public listing cards show; metaDescription is only used
-- for the <meta> tag, falling back to excerpt if unset anyway).
--
-- There's a second verification query after the inserts too, to confirm
-- every categoryId/topicId subquery actually resolved on the real rows
-- (not just the preflight check) and that no stray markdown got in.
-- ============================================================

-- ─── Pre-flight check ──────────────────────────────────────────────────────
-- Run this FIRST. Every row must show a non-null category_id and topic_id,
-- or the matching INSERT below will silently store NULL for that column.
SELECT 'mental-health' AS category_slug, 'Anxiety' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'mental-health') AS category_id,
       (SELECT id FROM topics WHERE name = 'Anxiety') AS topic_id
UNION ALL
SELECT 'mental-health' AS category_slug, 'Stress' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'mental-health') AS category_id,
       (SELECT id FROM topics WHERE name = 'Stress') AS topic_id
UNION ALL
SELECT 'finances-career' AS category_slug, 'Financial Stress' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'finances-career') AS category_id,
       (SELECT id FROM topics WHERE name = 'Financial Stress') AS topic_id
UNION ALL
SELECT 'finances-career' AS category_slug, 'Debt' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'finances-career') AS category_id,
       (SELECT id FROM topics WHERE name = 'Debt') AS topic_id
UNION ALL
SELECT 'finances-career' AS category_slug, 'Job Loss' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'finances-career') AS category_id,
       (SELECT id FROM topics WHERE name = 'Job Loss') AS topic_id
UNION ALL
SELECT 'finances-career' AS category_slug, 'Entrepreneurship' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'finances-career') AS category_id,
       (SELECT id FROM topics WHERE name = 'Entrepreneurship') AS topic_id
UNION ALL
SELECT 'relationships' AS category_slug, 'Dating' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'relationships') AS category_id,
       (SELECT id FROM topics WHERE name = 'Dating') AS topic_id
UNION ALL
SELECT 'relationships' AS category_slug, 'Breakups' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'relationships') AS category_id,
       (SELECT id FROM topics WHERE name = 'Breakups') AS topic_id
UNION ALL
SELECT 'relationships' AS category_slug, 'Marriage' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'relationships') AS category_id,
       (SELECT id FROM topics WHERE name = 'Marriage') AS topic_id
UNION ALL
SELECT 'relationships' AS category_slug, 'Divorce' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'relationships') AS category_id,
       (SELECT id FROM topics WHERE name = 'Divorce') AS topic_id
UNION ALL
SELECT 'relationships' AS category_slug, 'Fatherhood' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'relationships') AS category_id,
       (SELECT id FROM topics WHERE name = 'Fatherhood') AS topic_id
UNION ALL
SELECT 'physical-wellbeing' AS category_slug, 'Nutrition' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'physical-wellbeing') AS category_id,
       (SELECT id FROM topics WHERE name = 'Nutrition') AS topic_id
UNION ALL
SELECT 'physical-wellbeing' AS category_slug, 'Body Image' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'physical-wellbeing') AS category_id,
       (SELECT id FROM topics WHERE name = 'Body Image') AS topic_id
UNION ALL
SELECT 'physical-wellbeing' AS category_slug, 'Energy' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'physical-wellbeing') AS category_id,
       (SELECT id FROM topics WHERE name = 'Energy') AS topic_id
UNION ALL
SELECT 'physical-wellbeing' AS category_slug, 'Addiction Recovery' AS topic_name,
       (SELECT id FROM categories WHERE slug = 'physical-wellbeing') AS category_id,
       (SELECT id FROM topics WHERE name = 'Addiction Recovery') AS topic_id;

-- ─── Articles ───────────────────────────────────────────────────────────────

-- Why Does Anxiety in Men Often Look Like Anger, Not Worry?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'why-anxiety-in-men-looks-like-anger',
  'Why Does Anxiety in Men Often Look Like Anger, Not Worry?',
  'Anxiety in men rarely looks like worry. It looks like a short fuse, a racing heart, a body that won''t sit still. Here''s why — and what helps.',
  'You don''t feel "anxious." You feel wound up. Irritable. Like everyone around you is moving too slow, asking too much, or somehow always managing to say the wrong thing at the wrong moment. If someone suggested you might be dealing with anxiety, you''d probably tell them they''re wrong — you''re not the nervous type, you don''t lie awake worrying about things. You just have a short fuse lately. That''s not a coincidence. It''s often exactly what anxiety looks like in men.

The anger is doing a job. Anxiety is supposed to feel like worry — that''s the textbook version. But worry reads as weakness and anger reads as strength, so a lot of men''s nervous systems learn to reroute one into the other without asking permission. The tight chest becomes a short temper. The racing thoughts become snapping at your kid over nothing. Underneath, it''s the same alarm system — just wearing a disguise that''s easier to walk around in public.

It usually shows up in the body first. Before it shows up as mood, anxiety usually shows up as sensation: a tight jaw, a stomach that''s off more days than not, shoulders that won''t drop, trouble sitting still, waking up at 3am with your mind already running. A lot of men chase these symptoms one at a time — a doctor for the stomach, painkillers for the headaches — without connecting them to the same root cause.

"Just relax" doesn''t work on it. Telling yourself to calm down doesn''t turn off a nervous system that''s been running hot for months. Neither does staying constantly busy, which is its own version of the same problem — filling every hour so there''s no quiet moment left for it to surface. It works for a while. It''s not the same as it going away.

What actually helps. Start by naming it accurately, even just to yourself: this is anxiety, not just a short temper you need to manage better. Regular movement, consistent sleep, and cutting back on caffeine and alcohol all measurably lower baseline anxiety — not a cure, but a way to stop adding fuel. And if the irritability is costing you relationships, sleep, or your ability to function, that''s the same threshold that would justify seeing someone about any other problem that isn''t going away on its own. A therapist who works with men will recognize this pattern fast — you won''t be the first guy who came in about "anger" and left with a more accurate name for what was actually going on.',
  'published',
  (SELECT id FROM categories WHERE slug = 'mental-health'),
  (SELECT id FROM topics WHERE name = 'Anxiety'),
  'MenWhoFeel Core',
  NOW(),
  'Anxiety in men rarely looks like worry. It looks like a short fuse, a racing heart, a body that won''t sit still. Here''s why — and what helps.',
  'anxiety in men',
  2
)
ON CONFLICT (slug) DO NOTHING;

-- What Chronic Stress Actually Does to Your Body — Even If You Think You're Handling It
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'what-chronic-stress-does-to-your-body',
  'What Chronic Stress Actually Does to Your Body — Even If You Think You''re Handling It',
  '"Handling it" isn''t the same as being unaffected by it. Here''s what chronic stress actually does to your body — and how to tell it''s happening to you.',
  '"I''m fine, I just have a lot going on" is one of the most common things men say right before something gives out — their sleep, their patience, their back, their blood pressure. Stress that never switches off doesn''t always feel like panic. Often it just feels like normal — like this is what having a job, a family, and bills just feels like. The problem is your body doesn''t know the difference between stress you''ve gotten used to and stress that''s actively wearing you down.

Stress is supposed to turn off. A short burst — a deadline, a near-miss on the highway, a hard conversation — is your body doing exactly what it''s built to do. Heart rate up, focus sharp, then back to baseline once it''s over. Chronic stress is what happens when "back to baseline" never comes. The same hormones that are useful in short bursts stay elevated for weeks or months, and that''s when the cost starts showing up somewhere else.

Where it actually shows up. Rarely as "I feel stressed." More often as: sleep that''s technically happening but doesn''t feel like rest, a jaw or shoulders tense by default, getting sick more than you used to, weight changing without much else changing, a memory that feels foggier than it used to. Long-running stress is linked to real effects on sleep, digestion, blood pressure, and mood — not because you''re weak, but because a body kept in low-grade alert mode long enough eventually pays for it somewhere.

"Handling it" isn''t the same as it not affecting you. This is the part that trips men up specifically. You can be functioning — showing up, paying the bills, not falling apart — and still be running on a stress response that''s quietly costing you. Most men only find out they were handling it, not unaffected by it, once something physical forces the issue.

What actually moves the needle. You can''t out-discipline a nervous system that never gets a real break — but you can give it one on purpose. Sleep you actually protect, movement that isn''t punishment, time that isn''t filled with something to manage. If it''s been months since you''ve felt something close to "off duty," that''s not a personality trait. That''s a signal worth taking as seriously as a warning light on a dashboard.',
  'published',
  (SELECT id FROM categories WHERE slug = 'mental-health'),
  (SELECT id FROM topics WHERE name = 'Stress'),
  'MenWhoFeel Core',
  NOW(),
  '"Handling it" isn''t the same as being unaffected by it. Here''s what chronic stress actually does to your body — and how to tell it''s happening to you.',
  'chronic stress',
  2
)
ON CONFLICT (slug) DO NOTHING;

-- How Does Financial Stress Actually Affect Your Mental Health?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'how-financial-stress-affects-mental-health',
  'How Does Financial Stress Actually Affect Your Mental Health?',
  'Money stress doesn''t stay in your bank account. Here''s what it actually does to your mind and body — and why the dread is a real response, not overreacting.',
  'You check the account and your stomach drops before you even see the number. That reaction isn''t dramatic — it''s your nervous system treating a financial threat the same way it treats any other threat, because as far as your body''s concerned, that''s exactly what it is.

It''s not just in your head. Financial stress is consistently linked to both anxiety and depression, and not only for people who are actually broke — the link shows up across income levels. Part of why: losing money hits you psychologically about twice as hard as gaining the same amount feels good. That''s not a character flaw, it''s how loss registers in general. It''s also why a genuinely survivable bad month can feel like the floor is giving out.

Why it compounds instead of settling. Your brain is wired to resolve open threats, not sit with them. An unresolved money question — will this clear, can I cover that — keeps a low-grade alarm running in the background even when you''re doing something else entirely. And because money is one of the most stigmatized topics there is, a lot of men deal with this alone, which removes exactly the support that would otherwise take the edge off.

The cycle that makes it worse. Financial anxiety impairs sleep, focus, and decision-making — which leads to costlier decisions, which creates more anxiety. It''s a loop, not a single event, which is part of why "just stop stressing about it" has never once worked on anyone.

What actually helps. Vague dread is worse than a real number — sit down and find out exactly what you have and owe, since the actual figure is almost always less frightening than the one your imagination built. Talking to one person breaks the isolation piece specifically, since that''s the part that turns ordinary financial pressure into something heavier. Neither fixes the money. Both measurably lower how it sits in your body while you work on the money part.',
  'published',
  (SELECT id FROM categories WHERE slug = 'finances-career'),
  (SELECT id FROM topics WHERE name = 'Financial Stress'),
  'MenWhoFeel Core',
  NOW(),
  'Money stress doesn''t stay in your bank account. Here''s what it actually does to your mind and body — and why the dread is a real response, not overreacting.',
  'financial stress mental health',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Is It Normal to Feel Ashamed About Debt?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'is-it-normal-to-feel-ashamed-about-debt',
  'Is It Normal to Feel Ashamed About Debt?',
  'Debt feels like a verdict on who you are, not just a number. It''s not — and the shame is usually what keeps men from doing anything about the actual number.',
  'Debt has a way of feeling like a report card on your character instead of a math problem. That''s not an accident. Money is one of the most stigmatized topics there is, and carrying debt while everyone else seems to be managing fine turns a financial situation into a referendum on your worth.

The shame is doing something specific. High debt is consistently linked to anxiety, depression, and anger — but a lot of that isn''t the number itself, it''s how isolating debt tends to be. People hide it instead of talking about it, which removes the exact support that would otherwise make it lighter.

Shame keeps you from the thing that would actually help. This is the real cost of it. The emotional weight around debt often stops men from doing the boring, practical things — checking the real balance, calling a lender, looking into consolidation — because looking at it feels like confirming the shame story is true. The avoidance isn''t laziness. It''s the shame doing its job.

Separate the math from the story. Debt is a number. The story you''re telling yourself about what that number says about you — irresponsible, behind, a failure — is something you''re adding on top of it, and it''s the part that''s actually optional.

What actually helps. Write down what you owe with no narrative attached — just the figure. Take the smallest real step instead of trying to solve the whole thing at once; one call, one balance moved. And tell one person the plain number, not the story around it. Debt responds to a plan. Shame just keeps you from making one.',
  'published',
  (SELECT id FROM categories WHERE slug = 'finances-career'),
  (SELECT id FROM topics WHERE name = 'Debt'),
  'MenWhoFeel Core',
  NOW(),
  'Debt feels like a verdict on who you are, not just a number. It''s not — and the shame is usually what keeps men from doing anything about the actual number.',
  'shame about debt',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- What Actually Helps in the First Week After Losing a Job?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'what-helps-first-week-after-job-loss',
  'What Actually Helps in the First Week After Losing a Job?',
  'Losing a job isn''t just a financial hit — for a lot of men, it''s an identity hit too. Here''s what actually helps in the disorienting first week.',
  'For a lot of men, a job isn''t just where the money comes from — it''s a big part of the answer to "who am I." So when it goes, the shock isn''t only financial. It''s also, quietly, an identity hit, even if nobody says that word out loud.

Why it hits identity, not just income. Job loss reliably triggers grief, anxiety, and a real sense of lost identity on top of the financial disruption. Men raised with strong "provider" expectations tend to feel that identity disruption harder, and are more likely to hide it rather than name it — showing it instead as irritability, drinking more, or quietly pulling away from people.

The first few weeks matter most. The psychological impact is usually sharpest right after the loss — which is exactly when a lot of men go quiet instead of reaching out. That''s the opposite of what actually helps, and it''s worth noticing if it''s what you''re doing right now.

What actually helps this week specifically. Keep some kind of daily structure — losing the routine is part of what makes this disorienting, not just losing the income. Break the job search into small next-actions instead of one overwhelming goal. Stay physically active; it measurably reduces anxiety and low mood, not just generically but specifically during unemployment. And don''t isolate — this is exactly the moment withdrawal feels natural and is exactly the moment connection matters most.

This is a real, well-documented transition with a real toll, not a personal failing. Reaching out early — before you "have it figured out" — tends to shorten how long the hardest part lasts.',
  'published',
  (SELECT id FROM categories WHERE slug = 'finances-career'),
  (SELECT id FROM topics WHERE name = 'Job Loss'),
  'MenWhoFeel Core',
  NOW(),
  'Losing a job isn''t just a financial hit — for a lot of men, it''s an identity hit too. Here''s what actually helps in the disorienting first week.',
  'job loss first week',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Why Does Building Something of Your Own Feel So Lonely?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'why-entrepreneurship-feels-so-lonely',
  'Why Does Building Something of Your Own Feel So Lonely?',
  'Founders report loneliness more than almost any other professional group. Here''s why building something of your own is often more isolating than people expect.',
  'Everyone around you sees the version where you''re your own boss, building something real. Nobody sees the part where you can''t tell your team the numbers are bad, can''t tell your partner how scared you actually are, and don''t have a boss of your own to go to when you''re the one who''s supposed to have the answers.

The structure itself creates the isolation. This isn''t a personality flaw — it''s built into the role. High workload, real uncertainty, and often no co-founder or peer seeing exactly what you''re seeing is a well-documented recipe for loneliness in entrepreneurship specifically, separate from stress in general.

Why founders specifically stay quiet. A large share of founders say they aren''t open about their stressors with the people closest to them — largely because the role comes with an unspoken requirement to project confidence, to your team, your investors, sometimes your own family. That leaves less room to be honest about how it''s actually going, even with the people who''d want to know.

The cost of staying quiet. That isolation isn''t neutral. It''s linked to measurably worse mental and physical health outcomes than the general working population — not because building something is uniquely harder than other work, but because the loneliness compounds whatever hard part you''re already carrying.

What actually helps. One peer who''s building something too — even informally — cuts the isolation more than most founders expect. Separating "what I show my team" from "what I tell one trusted person" isn''t dishonesty, it''s just different audiences for different information. And it''s worth noticing on purpose when confidence-performing has quietly replaced actual connection, rather than waiting for it to become a bigger problem.',
  'published',
  (SELECT id FROM categories WHERE slug = 'finances-career'),
  (SELECT id FROM topics WHERE name = 'Entrepreneurship'),
  'MenWhoFeel Core',
  NOW(),
  'Founders report loneliness more than almost any other professional group. Here''s why building something of your own is often more isolating than people expect.',
  'entrepreneur loneliness',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Why Does Dating Feel So Exhausting Right Now?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'why-dating-feels-so-exhausting',
  'Why Does Dating Feel So Exhausting Right Now?',
  'Dating fatigue is a real, studied phenomenon — not a sign you''re bad at this or that love isn''t out there. Here''s what''s actually driving the exhaustion, and what helps.',
  'You open the app, scroll a few profiles, close it again without messaging anyone. Not because nobody''s interesting — you''re tired in a way that doesn''t match how little you''ve actually done today. That''s not you being picky or broken. It has a name: dating burnout, a real, studied response to how modern dating actually works.

It''s designed to wear you down. Dating apps run on the same mechanics as other habit-forming platforms — endless options, small variable rewards, one more match always a swipe away. Repeated low-quality romantic interactions are directly linked to emotional exhaustion, cynicism, and avoidance — the same three markers used to define burnout in any other context.

The cruel part. Burnout doesn''t just feel bad — it makes you worse at the thing you''re burned out on. Exhausted, you swipe on autopilot, message half-heartedly, show up depleted, which produces exactly the flat interactions that make you want to quit even more.

Why it''s not "just you." Studies following dating app users over months find emotional exhaustion reliably increases the longer the pattern continues, regardless of who''s using the app. If it''s stopped feeling fun and started feeling like a second job, that''s the expected outcome of the system, not a failure to date correctly.

What actually helps. A real break — an actual two-to-four week stop, not a guilty pause — lets the exhaustion settle. When you return, time-boxing it (a strict 15–20 minutes, one app instead of several) keeps volume from creeping back up. And separating your worth from how it''s going this week matters more than any setting — the exhaustion is about the system, not about whether you''re worth choosing.',
  'published',
  (SELECT id FROM categories WHERE slug = 'relationships'),
  (SELECT id FROM topics WHERE name = 'Dating'),
  'MenWhoFeel Core',
  NOW(),
  'Dating fatigue is a real, studied phenomenon — not a sign you''re bad at this or that love isn''t out there. Here''s what''s actually driving the exhaustion, and what helps.',
  'dating burnout',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- How Do You Get Through a Breakup Without Numbing Out?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'how-to-get-through-a-breakup',
  'How Do You Get Through a Breakup Without Numbing Out?',
  'Men often process breakups on a delayed timeline — seeming fine, then hit weeks later. Here''s why, and what actually helps instead of numbing out.',
  'For the first week or two, you might genuinely feel okay — maybe even relieved. Then, weeks later, it catches up with you. That''s not instability. Research on men and breakups describes this as delayed grief, common enough to have a name.

Why it shows up late. Men are more likely to distract and deny in the immediate aftermath, with processing often happening later, all at once, rather than gradually up front. The grief doesn''t skip you — it runs on a different clock, often triggered later by something as small as a song or a place.

Why isolation makes it worse. Men are more likely to pull inward after a breakup instead of reaching out, partly because a lot of men''s friendships run on shared activities rather than emotional conversation. That isolation is one of the clearest predictors of a harder recovery, not a neutral choice.

This is serious enough to take seriously. Relationship breakdown is a well-documented risk factor for real emotional crisis in men specifically, more than most people realize. If what you''re feeling is more than sadness — if thoughts have gone to a dark place — that''s not something to wait out alone. Reaching out early isn''t dramatic; it''s the right move.

What actually helps. Let the timeline be whatever it actually is, not a deadline you set yourself. Reach out before you feel ready to — readiness tends to follow connection, not the other way around. And if action-based coping is your style, that''s valid, as long as it''s alongside people, not instead of them.',
  'published',
  (SELECT id FROM categories WHERE slug = 'relationships'),
  (SELECT id FROM topics WHERE name = 'Breakups'),
  'MenWhoFeel Core',
  NOW(),
  'Men often process breakups on a delayed timeline — seeming fine, then hit weeks later. Here''s why, and what actually helps instead of numbing out.',
  'breakup recovery men',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Is It Normal for Marriage to Get Harder Before It Gets Easier?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'is-it-normal-for-marriage-to-get-harder',
  'Is It Normal for Marriage to Get Harder Before It Gets Easier?',
  'Most marriages hit a real rough patch, often years in, that has nothing to do with picking the wrong person. Here''s what research says actually predicts whether it lasts.',
  'The "honeymoon phase" isn''t built to last, and what comes after can genuinely rattle you — not because you picked the wrong person, but because sharing a life with someone requires skills nobody actually teaches you.

What actually predicts staying together. After decades studying thousands of couples, researchers found they could predict divorce with striking accuracy — not from how often couples fought, but from the ratio of positive to negative moments between them. Roughly five positive interactions for every negative one, and couples stayed together. Fall into mostly negative, and they usually didn''t. The fighting wasn''t the problem. The ratio was.

Small bids matter more than big gestures. Throughout an ordinary day, partners make small bids for connection — sharing something, sighing after a hard day, reaching for a hand. How you respond to these, far more than anniversary trips, is what builds or erodes the bond over time.

How an argument starts predicts how it ends. A harsh opening — blame, sarcasm — reliably leads to escalation. A softer one — "I feel stressed when this piles up, can we sort it out" instead of "you never help" — opens the door to resolving something instead of just winning it.

What actually helps. Say out loud what you appreciate, not just what needs fixing. And if it''s gotten hard, that''s not a verdict — most couples wait years longer than they should before getting help, and the ones who ask earlier tend to do better than the ones who wait.',
  'published',
  (SELECT id FROM categories WHERE slug = 'relationships'),
  (SELECT id FROM topics WHERE name = 'Marriage'),
  'MenWhoFeel Core',
  NOW(),
  'Most marriages hit a real rough patch, often years in, that has nothing to do with picking the wrong person. Here''s what research says actually predicts whether it lasts.',
  'marriage getting harder',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- What Do You Actually Need to Know Before Going Through a Divorce?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'what-to-know-before-going-through-divorce',
  'What Do You Actually Need to Know Before Going Through a Divorce?',
  'Divorce hits men''s mental health especially hard, often through identity loss as much as grief. Here''s what''s actually going on, and what genuinely helps.',
  'Divorce is one of the hardest transitions a person can go through, and research points to something specific about why it tends to hit men especially hard: it''s not only grief over the relationship, it''s often a loss of identity — the role of provider, partner, or protector a lot of men have quietly built their sense of self around.

Why it''s more than sadness. Men going through divorce report waking up feeling like strangers in their own lives — disconnected from the routines and roles that used to organize everything. Disconnection from kids, a shrinking social circle, and financial strain often hit at the same time, which is part of why divorce is consistently linked to some of the more serious mental health risks men face.

This is exactly the moment men tend to go quiet. Shame or self-blame is common, even when the divorce was mutual or outside your control. That shame, combined with a shrinking support network, pushes men toward withdrawing right when connection matters most.

Take this seriously, not just as sadness to push through. If what you''re feeling has moved past grief into something heavier, that''s not a sign to tough it out alone. This is one of the situations where reaching out early, to a person or a professional, matters more than almost anything else you could do.

What actually helps. Keep some routine intact, even a small one. Stay connected to people on purpose, since the pull here is toward isolation right when it matters most. And separate the practical parts of divorce (custody, finances) from the identity questions underneath them — trying to solve both alone at once is what makes it feel unmanageable.',
  'published',
  (SELECT id FROM categories WHERE slug = 'relationships'),
  (SELECT id FROM topics WHERE name = 'Divorce'),
  'MenWhoFeel Core',
  NOW(),
  'Divorce hits men''s mental health especially hard, often through identity loss as much as grief. Here''s what''s actually going on, and what genuinely helps.',
  'divorce and mental health',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- How Do You Show Up as a Father When You're Running on Empty?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'how-to-show-up-as-a-father-running-on-empty',
  'How Do You Show Up as a Father When You''re Running on Empty?',
  'Showing up for your kids doesn''t require having nothing left for yourself. Here''s what research says actually matters most — and it''s smaller than you think.',
  'There''s a version of fatherhood in your head where you''re endlessly patient, always present, never running low — and then there''s the actual version, where you''re exhausted and showing up anyway. The gap between those two can feel like failure. It isn''t.

Presence beats perfection. What predicts a strong father-child bond isn''t an elaborate parenting philosophy — it''s being physically and mentally there in ordinary moments: a trip to the store, throwing a ball in the yard, a bedtime story. Distracted presence — there in body, elsewhere in mind — is one of the most common gaps, and one of the easiest to close.

Emotional availability is the harder, newer part. Fathers today are expected to be emotionally available in a way a lot of men weren''t raised to model. That''s a real skill to build deliberately, not something that comes automatically just from wanting to be a good dad.

Why this matters beyond your kids. Engaged fatherhood isn''t only a gift to your children — it''s linked to your own greater resilience and sense of purpose too. Showing up for them is also one of the more reliable antidotes to isolation and drift in your own life.

What actually helps when you''re running on empty. Small, consistent moments beat occasional big ones. When you''re depleted, it''s tempting to think you have nothing to give — but showing up imperfectly, present for ten real minutes, is worth more than waiting until you feel like the father you think you''re supposed to be.',
  'published',
  (SELECT id FROM categories WHERE slug = 'relationships'),
  (SELECT id FROM topics WHERE name = 'Fatherhood'),
  'MenWhoFeel Core',
  NOW(),
  'Showing up for your kids doesn''t require having nothing left for yourself. Here''s what research says actually matters most — and it''s smaller than you think.',
  'fatherhood exhaustion',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Does What You Eat Actually Affect Your Mood, or Is That Overstated?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'does-what-you-eat-affect-your-mood',
  'Does What You Eat Actually Affect Your Mood, or Is That Overstated?',
  'The gut-brain connection isn''t wellness-industry hype — it''s an active, legitimate area of psychiatric research. Here''s what''s actually established, without the diet-culture noise.',
  '"Eat better and you''ll feel better" sounds like something printed on a smoothie cup. But the field studying exactly this — nutritional psychiatry — is a legitimate, growing area of psychiatric research, not wellness marketing.

What''s actually established. Diets heavy in ultra-processed food and light on whole foods are consistently linked to higher rates of depression and anxiety. One randomized trial found that people with moderate-to-severe depression who shifted toward a whole-food, Mediterranean-style diet for a few weeks saw meaningful symptom improvement — not a replacement for treatment, but a real effect sitting alongside it.

Why it''s not just willpower. An unhealthy diet is linked to brain inflammation, which connects to mood problems. Gut bacteria, shaped by diet, communicate directly with brain chemistry. And blood sugar swings from irregular eating create instability that shows up as irritability and crashes, easily mistaken for something else.

Where this goes wrong. None of this means counting calories or chasing a "perfect" diet — that kind of restriction tends to backfire, and rigid food rules are their own kind of stress. This is about pattern, not precision.

What actually helps. Regular meals matter more than any specific food — skipping meals sets up the swings that mimic anxiety. Swapping in more whole foods most of the time, not perfectly, is where the real effect lives. And if this starts feeling like it''s more about control than wellbeing — rules, restriction, guilt around food — that''s worth talking to someone about directly, since that''s a different problem than the one this article is about.',
  'published',
  (SELECT id FROM categories WHERE slug = 'physical-wellbeing'),
  (SELECT id FROM topics WHERE name = 'Nutrition'),
  'MenWhoFeel Core',
  NOW(),
  'The gut-brain connection isn''t wellness-industry hype — it''s an active, legitimate area of psychiatric research. Here''s what''s actually established, without the diet-culture noise.',
  'diet and mood',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Is Body Image a Real Issue for Men, or Just a Women's Topic?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'is-body-image-a-real-issue-for-men',
  'Is Body Image a Real Issue for Men, or Just a Women''s Topic?',
  'Body image struggles in men are real, underrecognized, and shaped differently than the version most people picture. Here''s what the research actually shows.',
  'Body image gets talked about as a women''s issue, which is part of why so many men who struggle with it don''t recognize what''s happening. The research is clear it''s real in men too — it just looks different.

A different shape of the same problem. Where struggles in women more often center on thinness, in men they more often center on muscularity — a preoccupation with being too small or not muscular enough, even when that isn''t objectively true. The more severe version has a name: muscle dysmorphia, sometimes called "bigorexia." It''s a real, recognized condition, not just being "into fitness."

Why it''s underrecognized. Researchers studying body image have historically struggled to find men willing to participate, partly because the framing felt "feminized" to them. The same reluctance shows up individually — a lot of men don''t clock their own relationship with their body as a struggle worth naming.

What tends to drive it. Social media and shifting expectations around masculinity are both linked to the rise in these struggles. And it runs in both directions — body dissatisfaction is linked to depression and low self-esteem, which in turn intensify the dissatisfaction. A loop, not a one-way problem.

What actually helps. Noticing the loop is the first step — constant comparison, never feeling "enough," working out from anxiety rather than enjoyment. If it''s affecting your daily life, your relationship with food or exercise, or how you feel most days, that''s worth talking to someone about directly — a recognized, treatable pattern, not a personal failing to push through alone.',
  'published',
  (SELECT id FROM categories WHERE slug = 'physical-wellbeing'),
  (SELECT id FROM topics WHERE name = 'Body Image'),
  'MenWhoFeel Core',
  NOW(),
  'Body image struggles in men are real, underrecognized, and shaped differently than the version most people picture. Here''s what the research actually shows.',
  'male body image',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Why Are You Exhausted All the Time, Even When Nothing's "Wrong"?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'why-are-you-exhausted-all-the-time',
  'Why Are You Exhausted All the Time, Even When Nothing''s "Wrong"?',
  'Persistent low energy without an obvious diagnosis usually isn''t "just tiredness." Here''s what typically drives it, and what actually restores it.',
  'You''re not sick, not officially depressed, not obviously overworked — you''re just tired, all the time, in a way that doesn''t add up to anything you can point to.

The usual suspects, in order. Sleep that''s technically happening but isn''t restorative is the most common, most overlooked cause. After that: dehydration, frequently mistaken for fatigue or brain fog; irregular eating, which creates crashes blamed on being "just tired"; and a body that''s been sedentary long enough that movement itself has become the missing input.

Why movement helps rather than costs energy. It seems backwards, but regular movement measurably improves energy levels over time, even though a single workout costs energy in the moment. A body that''s never asked to move adapts to needing less, which shows up as low baseline energy.

When it''s not just habits. If you''ve addressed sleep, hydration, food, and movement and the exhaustion hasn''t budged, that''s worth a real conversation with a doctor — persistent fatigue can point to something medical that habits alone won''t fix, and low energy is also one of the quieter signs of depression.

What actually helps. Fix the controllables first, in order: consistent sleep and wake times before total hours, water before caffeine, regular meals before supplements, some daily movement even when it''s the last thing you feel like. If none of that moves the needle after a few real weeks, that''s the signal to loop in a doctor.',
  'published',
  (SELECT id FROM categories WHERE slug = 'physical-wellbeing'),
  (SELECT id FROM topics WHERE name = 'Energy'),
  'MenWhoFeel Core',
  NOW(),
  'Persistent low energy without an obvious diagnosis usually isn''t "just tiredness." Here''s what typically drives it, and what actually restores it.',
  'constant fatigue causes',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- What Does the First Step Toward Addiction Recovery Actually Look Like?
INSERT INTO articles (slug, title, excerpt, content, status, "categoryId", "topicId", "authorName", "publishedAt", "metaDescription", "focusKeyword", "readingTime")
VALUES (
  'what-the-first-step-toward-recovery-looks-like',
  'What Does the First Step Toward Addiction Recovery Actually Look Like?',
  'The first step isn''t a dramatic rock-bottom moment — it''s usually smaller and quieter than that. Here''s what actually starts recovery, and why men wait longer to take it.',
  'There''s a version of "hitting bottom" in movies that makes recovery look like it starts with dramatic collapse. For most men, it starts quieter — a private admission that something isn''t working, made long before anyone else notices.

Why men wait longer. Men consistently seek help for substance use later than women do, largely because "toughing it out" is what a lot of men were taught strength looks like. That delay isn''t a personal failing — it''s a pattern, and naming it as a pattern rather than a character flaw is often what makes the first real step possible.

What''s usually underneath it. Substance use very often runs alongside something else — depression, anxiety, unprocessed stress — that never got its own attention. Treating the substance use without addressing what''s underneath it tends not to hold.

What the first step actually is. Rarely a full commitment to "never again." More often: telling one person the truth, or getting one honest evaluation from a doctor, without deciding the whole future in that same moment. Recovery is a long process, not a single decision — the first step just needs to be honest, not complete.

What actually helps. Saying it out loud to one person is usually the hardest and most important part. Peer support — other men who''ve been through it — is repeatedly linked to better outcomes than going it alone. And a conversation with a doctor is a legitimate first move that doesn''t commit you to anything beyond that conversation.',
  'published',
  (SELECT id FROM categories WHERE slug = 'physical-wellbeing'),
  (SELECT id FROM topics WHERE name = 'Addiction Recovery'),
  'MenWhoFeel Core',
  NOW(),
  'The first step isn''t a dramatic rock-bottom moment — it''s usually smaller and quieter than that. Here''s what actually starts recovery, and why men wait longer to take it.',
  'addiction recovery first step',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- ─── Verification ──────────────────────────────────────────────────────────
-- Expect 15 rows, all with non-null category and topic, none with
-- '**' anywhere in content (that would mean stray markdown got in).
SELECT a.slug, a.title, c.name AS category, t.name AS topic,
       (a.content LIKE '%**%') AS has_stray_markdown
FROM articles a
LEFT JOIN categories c ON c.id = a."categoryId"
LEFT JOIN topics t ON t.id = a."topicId"
WHERE a.slug IN ('why-anxiety-in-men-looks-like-anger', 'what-chronic-stress-does-to-your-body', 'how-financial-stress-affects-mental-health', 'is-it-normal-to-feel-ashamed-about-debt', 'what-helps-first-week-after-job-loss', 'why-entrepreneurship-feels-so-lonely', 'why-dating-feels-so-exhausting', 'how-to-get-through-a-breakup', 'is-it-normal-for-marriage-to-get-harder', 'what-to-know-before-going-through-divorce', 'how-to-show-up-as-a-father-running-on-empty', 'does-what-you-eat-affect-your-mood', 'is-body-image-a-real-issue-for-men', 'why-are-you-exhausted-all-the-time', 'what-the-first-step-toward-recovery-looks-like')
ORDER BY a.slug;