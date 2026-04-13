import { getDb } from "./client";
import { deleteFile, listFilenames } from "./opfs";
import { STORE_MEMOS, type Memo, type MemoStatus } from "./schema";

const ORPHAN_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export async function createDraft(memo: Memo): Promise<void> {
  if (memo.status !== "draft") {
    throw new Error("createDraft requires status='draft'");
  }
  const db = await getDb();
  await db.put(STORE_MEMOS, memo);
}

export async function finalizeDraft(
  id: string,
  patch: { title: string; notes: string; tags: string[] },
): Promise<Memo> {
  const db = await getDb();
  const existing = await db.get(STORE_MEMOS, id);
  if (!existing) throw new Error(`Memo not found: ${id}`);
  if (existing.status !== "draft") {
    throw new Error(`Memo ${id} is already finalized`);
  }
  const finalized: Memo = {
    ...existing,
    title: patch.title,
    notes: patch.notes,
    tags: patch.tags,
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
