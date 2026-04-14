export const MOODS = [
  "anxious",
  "overwhelmed",
  "stressed",
  "sad",
  "lonely",
  "tired",
  "calm",
  "content",
  "grateful",
  "hopeful",
  "excited",
  "energized",
] as const;

export type Mood = (typeof MOODS)[number];

const MOOD_SET: ReadonlySet<string> = new Set(MOODS);

export function isMood(value: string): value is Mood {
  return MOOD_SET.has(value);
}
