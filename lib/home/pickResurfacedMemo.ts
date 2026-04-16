import type { Memo } from "@/lib/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const FRESH_CUTOFF_DAYS = 30;

export type ResurfacedPick = {
  memo: Memo;
  label: string;
};

type Tier = {
  label: string;
  target: (now: Date) => Date;
};

function shiftDate(
  now: Date,
  opts: { years?: number; months?: number; days?: number },
): Date {
  const d = new Date(now);
  if (opts.years) d.setFullYear(d.getFullYear() - opts.years);
  if (opts.months) d.setMonth(d.getMonth() - opts.months);
  if (opts.days) d.setDate(d.getDate() - opts.days);
  return d;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const TIERS: Tier[] = [
  {
    label: "From a year ago today",
    target: (n) => shiftDate(n, { years: 1 }),
  },
  {
    label: "From six months ago today",
    target: (n) => shiftDate(n, { months: 6 }),
  },
  {
    label: "From three months ago today",
    target: (n) => shiftDate(n, { months: 3 }),
  },
  {
    label: "From a month ago today",
    target: (n) => shiftDate(n, { months: 1 }),
  },
  {
    label: "From a week ago today",
    target: (n) => shiftDate(n, { days: 7 }),
  },
];

/**
 * Pick a memo to resurface on the home screen. v0 — see
 * docs/roadmap/home-resurfacing.md for the known limitations and
 * the better version this should grow into.
 *
 * Pure function. No side effects, no async, no IO. The home page is
 * responsible for loading memos and passing them in.
 */
export function pickResurfacedMemo(
  memos: Memo[],
  now: Date = new Date(),
): ResurfacedPick | null {
  const eligible = memos.filter(
    (m) => m.status === "final" && m.thumbnailFilename,
  );
  if (eligible.length === 0) return null;

  for (const tier of TIERS) {
    const target = tier.target(now);
    const match = eligible.find((m) =>
      sameLocalDay(new Date(m.createdAt), target),
    );
    if (match) return { memo: match, label: tier.label };
  }

  const cutoff = now.getTime() - FRESH_CUTOFF_DAYS * DAY_MS;
  const old = eligible.filter((m) => m.createdAt < cutoff);
  if (old.length === 0) return null;

  const seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const idx = hashSeed(seed) % old.length;
  return { memo: old[idx], label: "From your archive" };
}
