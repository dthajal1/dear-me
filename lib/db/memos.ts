import { getDb } from "./client";
import { deleteFile, listFilenames } from "./opfs";
import {
  STORE_MEMOS,
  type AnalysisStatus,
  type Memo,
  type MemoStatus,
  type MoodSource,
  type MoodSourceMap,
  type TranscriptStatus,
} from "./schema";

const ORPHAN_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export async function createDraft(memo: Memo): Promise<void> {
  if (memo.status !== "draft") {
    throw new Error("createDraft requires status='draft'");
  }
  const db = await getDb();
  await db.put(STORE_MEMOS, memo);
}

export async function updateDraft(
  id: string,
  patch: Partial<
    Pick<
      Memo,
      | "title"
      | "notes"
      | "tags"
      | "transcript"
      | "transcriptStatus"
      | "transcriptError"
      | "moods"
      | "moodSources"
      | "analysisStatus"
      | "analysisError"
      | "thumbnailFilename"
    >
  >,
): Promise<Memo> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (!existing) throw new Error(`Memo not found: ${id}`);
  if (existing.status !== "draft") {
    throw new Error(`Memo ${id} is already finalized`);
  }
  const updated: Memo = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await db.put(STORE_MEMOS, updated);
  return updated;
}

export async function setTranscriptStatus(
  id: string,
  status: TranscriptStatus,
  extra?: { transcript?: string; transcriptError?: string },
): Promise<Memo> {
  return updateDraft(id, {
    transcriptStatus: status,
    ...(extra?.transcript !== undefined ? { transcript: extra.transcript } : {}),
    ...(extra?.transcriptError !== undefined
      ? { transcriptError: extra.transcriptError }
      : {}),
  });
}

export async function setAnalysisStatus(
  id: string,
  status: AnalysisStatus,
  extra?: {
    moods?: string[];
    tags?: string[];
    analysisError?: string;
  },
): Promise<Memo> {
  // Moods set via the analyzer are always source "ai". We build a parallel
  // moodSources map here so the write path is the single source of truth.
  const moodSources =
    extra?.moods !== undefined
      ? buildMoodSources(extra.moods, "ai")
      : undefined;
  return updateDraft(id, {
    analysisStatus: status,
    ...(extra?.moods !== undefined ? { moods: extra.moods } : {}),
    ...(moodSources !== undefined ? { moodSources } : {}),
    ...(extra?.tags !== undefined ? { tags: extra.tags } : {}),
    ...(extra?.analysisError !== undefined
      ? { analysisError: extra.analysisError }
      : {}),
  });
}

export async function updateMoodsAndTags(
  id: string,
  patch: {
    moods?: string[];
    tags?: string[];
    moodSources?: MoodSourceMap;
  },
): Promise<Memo> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (!existing) throw new Error(`Memo not found: ${id}`);
  const updated: Memo = {
    ...existing,
    ...(patch.moods !== undefined ? { moods: patch.moods } : {}),
    ...(patch.moodSources !== undefined
      ? { moodSources: patch.moodSources }
      : {}),
    ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
    updatedAt: Date.now(),
  };
  await db.put(STORE_MEMOS, updated);
  return updated;
}

/**
 * Persist the thumbnail filename extracted from the video. Separate tiny
 * helper so the frame-extraction worker doesn't need to know about the
 * full draft-update machinery.
 */
export async function setThumbnailFilename(
  id: string,
  filename: string,
): Promise<Memo> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (!existing) throw new Error(`Memo not found: ${id}`);
  const updated: Memo = {
    ...existing,
    thumbnailFilename: filename,
    updatedAt: Date.now(),
  };
  await db.put(STORE_MEMOS, updated);
  return updated;
}

/**
 * Returns the source for a given mood label on a memo. Legacy memos without
 * a moodSources map default to "ai" (historically, the only write path was
 * the analyzer).
 */
export function getMoodSource(memo: Memo, mood: string): MoodSource {
  return memo.moodSources?.[mood] ?? "ai";
}

/** Build a fresh sources map where every provided mood gets the same source. */
export function buildMoodSources(
  moods: string[],
  source: MoodSource,
): MoodSourceMap {
  const out: MoodSourceMap = {};
  for (const m of moods) out[m] = source;
  return out;
}

export async function finalizeDraft(id: string): Promise<Memo> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (!existing) throw new Error(`Memo not found: ${id}`);
  if (existing.status !== "draft") {
    throw new Error(`Memo ${id} is already finalized`);
  }
  const finalized: Memo = {
    ...existing,
    status: "final",
    updatedAt: Date.now(),
  };
  await db.put(STORE_MEMOS, finalized);
  return finalized;
}

export async function getMemo(id: string): Promise<Memo | undefined> {
  const db = await getDb();
  return db.get(STORE_MEMOS, id);
}

export async function listMemos(
  filter?: { status?: MemoStatus },
): Promise<Memo[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_MEMOS, "by-createdAt");
  const sorted = all.reverse();
  if (filter?.status) {
    return sorted.filter((m) => m.status === filter.status);
  }
  return sorted;
}

export async function deleteMemo(id: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (existing) {
    await deleteFile(existing.filename);
  }
  await db.delete(STORE_MEMOS, id);
}

export async function cleanupOrphanedDrafts(): Promise<{
  draftsDeleted: number;
  orphanFilesDeleted: number;
}> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_MEMOS, "by-status", "draft");
  const cutoff = Date.now() - ORPHAN_DRAFT_TTL_MS;

  let draftsDeleted = 0;
  for (const memo of all) {
    if (memo.createdAt < cutoff) {
      await deleteFile(memo.filename);
      await db.delete(STORE_MEMOS, memo.id);
      draftsDeleted++;
    }
  }

  const filesOnDisk = await listFilenames();
  const liveMemos = await db.getAll(STORE_MEMOS);
  const liveFilenames = new Set(liveMemos.map((m) => m.filename));
  let orphanFilesDeleted = 0;
  for (const name of filesOnDisk) {
    if (!liveFilenames.has(name)) {
      await deleteFile(name);
      orphanFilesDeleted++;
    }
  }

  return { draftsDeleted, orphanFilesDeleted };
}
