// Content safety utility — lightweight keyword & pattern-based detection.
// Content is flagged for moderator review; auto-delete only at very high confidence.

export type SafetyFlag = {
  type: "spam" | "phone" | "email" | "hate" | "doxxing" | "harassment";
  confidence: "low" | "medium" | "high";
};

const SPAM_PATTERNS: RegExp[] = [
  /(.)\1{6,}/gi,               // Excessive repeated characters
  /\b(buy\s+now|click\s+here|free\s+money|make\s+money\s+fast)\b/gi,
  /\b(bitcoin|nft|crypto\s+giveaway)\b/gi,
  /https?:\/\/[^\s]+/gi,       // URLs
  /www\.[a-z0-9-]+\.[a-z]{2,}/gi,
];

const PHONE_PATTERNS: RegExp[] = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}\b/g,
  /\b0\d{9,10}\b/g, // UK / international formats
];

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

const HATE_SPEECH_KEYWORDS: string[] = [
  "kys", "kill yourself", "kill urself",
  "you should die", "go kill",
  // slurs are not listed here but checked against a list in production
];

const HARASSMENT_PATTERNS: RegExp[] = [
  /\bi\s+will\s+(find|hurt|kill|destroy)\s+you\b/gi,
  /\byou\s+(are|r)\s+(worthless|pathetic|garbage|trash|nothing)\b/gi,
];

const DOXXING_PATTERNS: RegExp[] = [
  /\b\d{1,5}\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard|way|place|pl)\b/gi,
  /\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/g, // UK postcodes
  /\b\d{5}(?:-\d{4})?\b/g,               // US zip codes (ambiguous — medium confidence)
];

export function checkContentSafety(content: string): SafetyFlag[] {
  const flags: SafetyFlag[] = [];
  const lower = content.toLowerCase();

  for (const pattern of SPAM_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      flags.push({ type: "spam", confidence: "medium" });
      break;
    }
  }

  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      flags.push({ type: "phone", confidence: "high" });
      break;
    }
  }

  EMAIL_PATTERN.lastIndex = 0;
  if (EMAIL_PATTERN.test(content)) {
    flags.push({ type: "email", confidence: "high" });
  }

  for (const keyword of HATE_SPEECH_KEYWORDS) {
    if (lower.includes(keyword)) {
      flags.push({ type: "hate", confidence: "high" });
      break;
    }
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(lower)) {
      flags.push({ type: "harassment", confidence: "medium" });
      break;
    }
  }

  for (const pattern of DOXXING_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      flags.push({ type: "doxxing", confidence: "medium" });
      break;
    }
  }

  return flags;
}

/** Auto-delete only when confidence is very high (e.g. confirmed hate speech). */
export function shouldAutoDelete(flags: SafetyFlag[]): boolean {
  return flags.some((f) => f.confidence === "high" && f.type === "hate");
}

export function isFlagged(flags: SafetyFlag[]): boolean {
  return flags.length > 0;
}
