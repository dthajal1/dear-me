export const SCHEMA_VERSION = 2;
export const DB_NAME = "dear-me";
export const STORE_MEMOS = "memos";
export const STORE_INSIGHT_THREADS = "insight_threads";

export type MemoStatus = "draft" | "final";

export type TranscriptStatus = "pending" | "ready" | "failed";
export type AnalysisStatus = "pending" | "ready" | "failed";

export type Memo = {
  id: string;
  filename: string;
  mimeType: string;
  durationMs: number;
  sizeBytes: number;
  title: string;
  notes: string;
  tags: string[];
  status: MemoStatus;
  transcript?: string;
  transcriptStatus?: TranscriptStatus;
  transcriptError?: string;
  moods?: string[];
  analysisStatus?: AnalysisStatus;
  analysisError?: string;
  createdAt: number;
  updatedAt: number;
};

export type InsightRole = "user" | "assistant";

export type InsightAssistantStatus = "streaming" | "ok" | "error";

export type InsightMessage = {
  id: string;
  role: InsightRole;
  text: string;
  citedMemoIds?: string[];
  status?: InsightAssistantStatus;
  errorNote?: string;
  createdAt: number;
};

export type InsightThread = {
  id: string;
  title: string;
  messages: InsightMessage[];
  createdAt: number;
  updatedAt: number;
};
