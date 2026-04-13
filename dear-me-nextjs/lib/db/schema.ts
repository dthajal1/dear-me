export const SCHEMA_VERSION = 1;
export const DB_NAME = "dear-me";
export const STORE_MEMOS = "memos";

export type MemoStatus = "draft" | "final";

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
  createdAt: number;
  updatedAt: number;
};
