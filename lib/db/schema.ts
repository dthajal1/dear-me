export const SCHEMA_VERSION = 4;
export const DB_NAME = "dear-me";
export const STORE_MEMOS = "memos";
export const STORE_INSIGHT_THREADS = "insight_threads";
export const STORE_CHECK_INS = "check_ins";

export type MemoStatus = "draft" | "final";

export type TranscriptStatus = "pending" | "ready" | "failed";
export type AnalysisStatus = "pending" | "ready" | "failed";

/**
 * Source of a mood label on a memo.
 *  - "ai"   → assigned by the analyzer from the transcript
 *  - "user" → added by the user (mood drawer, or auto-applied from a recent
 *             home chip check-in when the memo was finalized)
 */
export type MoodSource = "ai" | "user";
export type MoodSourceMap = Record<string, MoodSource>;

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
  /**
   * Parallel map from mood label to its provenance. Optional — legacy memos
   * predate this field and callers should fall back to "ai" for any mood
   * that has no entry here (historically, all moods came from the analyzer).
   */
  moodSources?: MoodSourceMap;
  analysisStatus?: AnalysisStatus;
  analysisError?: string;
  /**
   * OPFS filename for a JPEG thumbnail extracted from the video. Populated
   * by a background worker after finalize — optional until then.
   */
  thumbnailFilename?: string;
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

export type CheckInSource = "chip" | "memo";

export type CheckIn = {
  id: string;
  mood: string;
  createdAt: number;
  source: CheckInSource;
};
