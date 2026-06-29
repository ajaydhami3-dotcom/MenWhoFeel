const WORDS_PER_MINUTE = 200;

/** Rounds to the nearest minute, minimum 1, from a word count. */
export function estimateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
