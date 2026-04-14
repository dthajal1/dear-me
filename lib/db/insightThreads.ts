import { getDb } from "./client";
import {
  STORE_INSIGHT_THREADS,
  type InsightMessage,
  type InsightThread,
} from "./schema";

const TITLE_MAX = 60;

function deriveTitle(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, " ");
  if (trimmed.length <= TITLE_MAX) return trimmed;
  return trimmed.slice(0, TITLE_MAX - 1) + "…";
}

export async function createThreadWithFirstMessage(
  question: string,
): Promise<InsightThread> {
  const now = Date.now();
  const userMessage: InsightMessage = {
    id: crypto.randomUUID(),
    role: "user",
    text: question,
    createdAt: now,
  };
  const thread: InsightThread = {
    id: crypto.randomUUID(),
    title: deriveTitle(question),
    messages: [userMessage],
    createdAt: now,
    updatedAt: now,
  };
  const db = await getDb();
  await db.put(STORE_INSIGHT_THREADS, thread);
  return thread;
}

export async function appendMessage(
  threadId: string,
  message: InsightMessage,
): Promise<InsightThread> {
  const db = await getDb();
  const existing = await db.get(STORE_INSIGHT_THREADS, threadId);
  if (!existing) throw new Error(`Insight thread not found: ${threadId}`);
  const updated: InsightThread = {
    ...existing,
    messages: [...existing.messages, message],
    updatedAt: Date.now(),
  };
  await db.put(STORE_INSIGHT_THREADS, updated);
  return updated;
}

export async function replaceMessage(
  threadId: string,
  messageId: string,
  patch: Partial<Omit<InsightMessage, "id" | "createdAt">>,
): Promise<InsightThread> {
  const db = await getDb();
  const existing = await db.get(STORE_INSIGHT_THREADS, threadId);
  if (!existing) throw new Error(`Insight thread not found: ${threadId}`);
  const idx = existing.messages.findIndex((m) => m.id === messageId);
  if (idx === -1) {
    throw new Error(`Message ${messageId} not found in thread ${threadId}`);
  }
  const merged: InsightMessage = { ...existing.messages[idx], ...patch };
  const nextMessages = [...existing.messages];
  nextMessages[idx] = merged;
  const updated: InsightThread = {
    ...existing,
    messages: nextMessages,
    updatedAt: Date.now(),
  };
  await db.put(STORE_INSIGHT_THREADS, updated);
  return updated;
}

export async function getThread(
  id: string,
): Promise<InsightThread | undefined> {
  const db = await getDb();
  return db.get(STORE_INSIGHT_THREADS, id);
}

export async function listThreads(): Promise<InsightThread[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_INSIGHT_THREADS, "by-updatedAt");
  return all.reverse();
}

export async function deleteThread(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_INSIGHT_THREADS, id);
}
