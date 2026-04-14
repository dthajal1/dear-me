export const SCHEMA_VERSION = 1;
export const DB_NAME = "dear-me";
export const STORE_MEMOS = "memos";

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
