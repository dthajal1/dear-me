import { getDb } from "./client";
import { STORE_CHECK_INS, type CheckIn, type CheckInSource } from "./schema";

export type CreateCheckInInput = {
  mood: string;
  source: CheckInSource;
};

export async function createCheckIn(
  input: CreateCheckInInput,
): Promise<CheckIn> {
  const checkIn: CheckIn = {
    id: crypto.randomUUID(),
    mood: input.mood,
    source: input.source,
    createdAt: Date.now(),
  };
  const db = await getDb();
  await db.put(STORE_CHECK_INS, checkIn);
  return checkIn;
}

export async function listCheckIns(filter?: {
  since?: number;
  limit?: number;
}): Promise<CheckIn[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_CHECK_INS, "by-createdAt");
  let sorted = all.reverse();
  if (filter?.since !== undefined) {
    const since = filter.since;
    sorted = sorted.filter((c) => c.createdAt >= since);
  }
  if (filter?.limit !== undefined) {
    sorted = sorted.slice(0, filter.limit);
  }
  return sorted;
}

export async function getLatestCheckIn(): Promise<CheckIn | undefined> {
  const [latest] = await listCheckIns({ limit: 1 });
  return latest;
}

function startOfToday(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getTodayCheckIns(): Promise<CheckIn[]> {
  return listCheckIns({ since: startOfToday() });
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_CHECK_INS, id);
}

export async function findRecentChipCheckIn(
  withinMs: number,
): Promise<CheckIn | undefined> {
  const cutoff = Date.now() - withinMs;
  const recent = await listCheckIns({ since: cutoff });
  return recent.find((c) => c.source === "chip");
}
