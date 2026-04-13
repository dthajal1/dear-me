# Record & Replay (Slice 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dear-me-nextjs recording flow real end-to-end: record video on the camera screen, save it to OPFS+IndexedDB, list it on the Memo tab, play it back from disk.

**Architecture:** Two thin TypeScript layers — `lib/db/` (idb + OPFS, draft → final pattern) and `lib/recording/` (MediaRecorder wrapper, permissions, mime detection) — plus three React hooks (`useRecordSession`, `useMemoList`, `useBlobUrl`) that screens consume. The 6 record-flow screens get rewired to be real and stateful, passing data via URL ids and an in-memory handoff between recording and processing. The Memo tab and detail screens query the real data layer instead of mock arrays.

**Tech Stack:** Next.js 16 (App Router), Tailwind v4, shadcn/ui, `idb` (~3KB IndexedDB wrapper), MediaRecorder API, OPFS API, BroadcastChannel API. No new framework dependencies.

**Spec:** `docs/superpowers/specs/2026-04-12-record-and-replay-design.md`

---

## Notes for the implementer

1. **No tests in this slice.** Same rationale as Slice 0 — vitest infrastructure is its own work, and the high-value tests (pure functions like `pickSupportedMimeType`) are a few units that don't justify the setup cost. Verification loop per task: `bun run build && bun run lint`. The final task includes a manual smoke test on a real device.

2. **All work happens inside `dear-me-nextjs/`.** The Expo project at the repo root is off-limits.

3. **Working directory for commands:** all `bun` commands run from `dear-me-nextjs/`. All `git` commands run from the repo root `/Users/dirajthajali/work/projects/dear-me`.

4. **AGENTS.md warning is real.** `dear-me-nextjs/AGENTS.md` says Next.js 16 has breaking changes from training-data Next.js. The most relevant Next 16 quirks for this slice:
   - Dynamic route params are `params: Promise<{ id: string }>` and must be awaited (already used in Slice 0 for `/memo/[id]` etc.).
   - Client components need `"use client"` at the top of the file.
   - `useSearchParams()`, `useParams()`, `useRouter()`, `usePathname()` all come from `next/navigation` (not `next/router`).
   - The `<Suspense>` requirement around `useSearchParams()` in pages — wrap pages that read search params in a Suspense boundary, or mark them `dynamic = "force-dynamic"`. The simplest path: each record-flow screen that reads `?id=...` does so via `useSearchParams()` inside a child client component that's wrapped in Suspense by its parent.

5. **The in-memory handoff at `window.__recordSession`** is intentional but global state. To keep TypeScript happy, declare the type once in a global ambient declaration file (Task 13), and import/use it from a single helper module so every screen consumes the same typed accessor.

6. **Commit style:** one commit per task, `feat(record):` / `feat(db):` / `feat(memo):` / `chore(record):` etc. so the slice is filterable in git log.

7. **Branch:** continue on `nextjs-scaffold`. (We can rename it to `slice-1-record-replay` after if you want; no harm in keeping it as the working branch since Slice 0 already landed there.)

---

## File structure (everything that gets created or substantively rewritten)

```
dear-me-nextjs/
├── package.json                    ← MODIFY (add idb dep)
├── types/global.d.ts               ← CREATE (window.__recordSession type)
├── lib/
│   ├── db/
│   │   ├── schema.ts               ← CREATE
│   │   ├── client.ts               ← CREATE
│   │   ├── memos.ts                ← CREATE
│   │   └── opfs.ts                 ← CREATE
│   ├── recording/
│   │   ├── mime.ts                 ← CREATE
│   │   ├── permissions.ts          ← CREATE
│   │   ├── recorder.ts             ← CREATE
│   │   └── session.ts              ← CREATE (window.__recordSession typed accessor)
│   ├── format/
│   │   └── time.ts                 ← CREATE
│   ├── hooks/
│   │   ├── useBlobUrl.ts           ← CREATE
│   │   ├── useRecordSession.ts     ← CREATE
│   │   └── useMemoList.ts          ← CREATE
│   └── bootstrap/
│       └── app-bootstrap.tsx       ← CREATE (cleanup-on-startup client component)
├── app/
│   ├── layout.tsx                  ← MODIFY (mount AppBootstrap)
│   ├── (tabs)/memo/page.tsx        ← REWRITE (use useMemoList, drop mocks)
│   ├── memo/[id]/page.tsx          ← REWRITE (real data + video preview)
│   ├── memo/[id]/playback/page.tsx ← REWRITE (real video element)
│   └── record/
│       ├── camera/page.tsx         ← REWRITE (real getUserMedia)
│       ├── recording/page.tsx      ← REWRITE (real MediaRecorder)
│       ├── processing/page.tsx     ← REWRITE (real OPFS + IDB write)
│       ├── review/page.tsx         ← REWRITE (real video playback)
│       └── add-notes/page.tsx      ← REWRITE (real finalize)
```

The `record/saved` screen is unchanged (no data dependency).
The `(tabs)/home`, `(tabs)/insights`, `(tabs)/progress`, `record/trigger`, `transcript/[id]`, `streak/[day]` screens are unchanged in this slice.

---

## Phase A — Foundations (lib/)

### Task 1: Install `idb` dependency

**Files:**
- Modify: `dear-me-nextjs/package.json`

- [ ] **Step 1: Install**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun add idb
```

Expected: `idb` (~3KB) added to `dependencies` in `package.json`. No peer dependency warnings.

- [ ] **Step 2: Verify build still passes**

```bash
bun run build
```

Expected: clean build, no errors, no warnings about the new dep.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/package.json dear-me-nextjs/bun.lock
git commit -m "chore(record): add idb dependency for IndexedDB wrapper"
```

---

### Task 2: Create the Memo schema

**Files:**
- Create: `dear-me-nextjs/lib/db/schema.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/db/schema.ts

export const SCHEMA_VERSION = 1;
export const DB_NAME = "dear-me";
export const STORE_MEMOS = "memos";

export type MemoStatus = "draft" | "final";

export type Memo = {
  // identity + storage
  id: string;
  filename: string;
  mimeType: string;
  // intrinsic media facts
  durationMs: number;
  sizeBytes: number;
  // user metadata
  title: string;
  notes: string;
  tags: string[];
  // lifecycle
  status: MemoStatus;
  createdAt: number;
  updatedAt: number;
};
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean build. The new file isn't imported anywhere yet, so this only verifies the file parses.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/db/schema.ts
git commit -m "feat(db): add Memo schema and constants"
```

---

### Task 3: Create the IDB client singleton

**Files:**
- Create: `dear-me-nextjs/lib/db/client.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/db/client.ts

import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import { DB_NAME, SCHEMA_VERSION, STORE_MEMOS, type Memo } from "./schema";

interface DearMeDB extends DBSchema {
  [STORE_MEMOS]: {
    key: string;
    value: Memo;
    indexes: {
      "by-createdAt": number;
      "by-status": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<DearMeDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<DearMeDB>> {
  if (typeof window === "undefined") {
    throw new Error("getDb() called on the server — this is a client-only module");
  }
  if (!dbPromise) {
    dbPromise = openDB<DearMeDB>(DB_NAME, SCHEMA_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_MEMOS, { keyPath: "id" });
          store.createIndex("by-createdAt", "createdAt");
          store.createIndex("by-status", "status");
        }
      },
    });
  }
  return dbPromise;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/db/client.ts
git commit -m "feat(db): add IndexedDB client singleton"
```

---

### Task 4: Create OPFS helpers

**Files:**
- Create: `dear-me-nextjs/lib/db/opfs.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/db/opfs.ts

const ROOT_PROMISE_KEY = "__opfsRoot";

function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (typeof window === "undefined") {
    throw new Error("OPFS called on the server — this is a client-only module");
  }
  // Cache the root handle on globalThis so we only resolve it once per session.
  const cached = (globalThis as Record<string, unknown>)[ROOT_PROMISE_KEY];
  if (cached) return cached as Promise<FileSystemDirectoryHandle>;
  const promise = navigator.storage.getDirectory();
  (globalThis as Record<string, unknown>)[ROOT_PROMISE_KEY] = promise;
  return promise;
}

export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage !== "undefined" &&
    typeof navigator.storage.getDirectory === "function"
  );
}

export async function writeBlob(filename: string, blob: Blob): Promise<void> {
  const root = await getRoot();
  const handle = await root.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function readBlob(filename: string): Promise<Blob> {
  const root = await getRoot();
  const handle = await root.getFileHandle(filename);
  const file = await handle.getFile();
  return file;
}

export async function deleteFile(filename: string): Promise<void> {
  const root = await getRoot();
  try {
    await root.removeEntry(filename);
  } catch (err) {
    // Ignore "not found" — caller doesn't care if the file was already gone.
    if ((err as DOMException).name !== "NotFoundError") throw err;
  }
}

export async function listFilenames(): Promise<string[]> {
  const root = await getRoot();
  const names: string[] = [];
  // FileSystemDirectoryHandle is async-iterable in the OPFS API.
  for await (const [name] of (root as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
    names.push(name);
  }
  return names;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean. If TypeScript complains about the `for await` iteration, add `// @ts-expect-error OPFS async-iterable types are partial in TS 5.x` above the loop.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/db/opfs.ts
git commit -m "feat(db): add OPFS helpers (write/read/delete/list)"
```

---

### Task 5: Create the memos CRUD module

**Files:**
- Create: `dear-me-nextjs/lib/db/memos.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/db/memos.ts

import { getDb } from "./client";
import { deleteFile, listFilenames } from "./opfs";
import { STORE_MEMOS, type Memo, type MemoStatus } from "./schema";

const ORPHAN_DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
  // getAllFromIndex returns ascending; reverse for newest-first.
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

/**
 * Deletes any memo with status=draft older than 24 hours, plus any OPFS
 * file with no matching memo row. Run at app startup.
 */
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

  // Now: any OPFS file with no matching memo row → orphan, delete it.
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
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/db/memos.ts
git commit -m "feat(db): add memos CRUD with draft lifecycle and cleanup"
```

---

### Task 6: Create time formatting helpers

**Files:**
- Create: `dear-me-nextjs/lib/format/time.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/format/time.ts

/**
 * Formats a millisecond duration as M:SS (e.g., 102000 → "1:42").
 * For durations >= 1 hour: H:MM:SS.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Formats a timestamp as a relative human label:
 *   < 1 min: "Just now"
 *   < 1 hour: "Nm ago"
 *   < 24 hours: "Nh ago"
 *   < 7 days: "Yesterday" / "Nd ago"
 *   else: "MMM D" (e.g., "Apr 12") or "MMM D YYYY" if not current year
 */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m}m ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h}h ago`;
  }
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) {
    const d = Math.floor(diff / day);
    return `${d}d ago`;
  }
  const date = new Date(timestamp);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day_ = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date(now).getFullYear();
  return year === currentYear ? `${month} ${day_}` : `${month} ${day_} ${year}`;
}

/**
 * Formats a timestamp as a clock time, e.g. "8:15 AM".
 */
export function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/format/time.ts
git commit -m "feat(format): add time formatting helpers"
```

---

### Task 7: Create mime detection helper

**Files:**
- Create: `dear-me-nextjs/lib/recording/mime.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/recording/mime.ts

const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/mp4;codecs=avc1,mp4a",
  "video/mp4",
] as const;

/**
 * Returns the first mime type from PREFERRED_MIME_TYPES that
 * MediaRecorder supports in this browser. If none are supported, returns
 * undefined and the caller should pass undefined to MediaRecorder
 * (which uses the browser default).
 */
export function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

/**
 * Maps a recorded mime type to a file extension for the OPFS filename.
 */
export function extensionForMimeType(mimeType: string | undefined): string {
  if (!mimeType) return "webm"; // arbitrary fallback
  if (mimeType.startsWith("video/mp4")) return "mp4";
  if (mimeType.startsWith("video/webm")) return "webm";
  return "webm";
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/recording/mime.ts
git commit -m "feat(record): add mime type detection and extension mapping"
```

---

### Task 8: Create permissions helper

**Files:**
- Create: `dear-me-nextjs/lib/recording/permissions.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/recording/permissions.ts

export type CameraAccessResult =
  | { ok: true; stream: MediaStream }
  | {
      ok: false;
      reason: "denied" | "no-device" | "insecure-context" | "unsupported" | "unknown";
      message: string;
    };

export async function requestCameraAccess(
  constraints: MediaStreamConstraints,
): Promise<CameraAccessResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Your browser doesn't support camera access. Please use Chrome, Safari, or Firefox.",
    };
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return {
      ok: false,
      reason: "insecure-context",
      message: "Camera access requires a secure connection (HTTPS).",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { ok: true, stream };
  } catch (err) {
    const error = err as DOMException;
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          ok: false,
          reason: "denied",
          message:
            "Camera access was denied. Tap the lock icon in the address bar → Camera → Allow.",
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          ok: false,
          reason: "no-device",
          message: "No camera was found on this device.",
        };
      default:
        return {
          ok: false,
          reason: "unknown",
          message: error.message || "Couldn't access the camera.",
        };
    }
  }
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/recording/permissions.ts
git commit -m "feat(record): add permissions helper with normalized errors"
```

---

### Task 9: Create the MediaRecorder wrapper

**Files:**
- Create: `dear-me-nextjs/lib/recording/recorder.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/recording/recorder.ts

export type RecordingResult = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
};

export type Recorder = {
  start(): void;
  stop(): Promise<RecordingResult>;
  isRecording(): boolean;
};

export function createRecorder(stream: MediaStream, mimeType: string | undefined): Recorder {
  const chunks: Blob[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
  } catch (err) {
    throw new Error(`MediaRecorder construction failed: ${(err as Error).message}`);
  }

  let startedAt = 0;
  let stopResolve: ((r: RecordingResult) => void) | null = null;
  let stopReject: ((e: Error) => void) | null = null;

  recorder.addEventListener("dataavailable", (e: BlobEvent) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  recorder.addEventListener("stop", () => {
    if (!stopResolve) return;
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const durationMs = Date.now() - startedAt;
    stopResolve({ blob, durationMs, mimeType: recorder.mimeType });
    stopResolve = null;
    stopReject = null;
  });

  recorder.addEventListener("error", () => {
    if (stopReject) {
      stopReject(new Error("MediaRecorder error event fired"));
      stopResolve = null;
      stopReject = null;
    }
  });

  return {
    start() {
      startedAt = Date.now();
      recorder.start();
    },
    stop() {
      return new Promise<RecordingResult>((resolve, reject) => {
        if (recorder.state === "inactive") {
          reject(new Error("Recorder is not active"));
          return;
        }
        stopResolve = resolve;
        stopReject = reject;
        recorder.stop();
      });
    },
    isRecording() {
      return recorder.state === "recording";
    },
  };
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/recording/recorder.ts
git commit -m "feat(record): add MediaRecorder wrapper with promise-based stop"
```

---

### Task 10: Add the `window.__recordSession` typed accessor

**Files:**
- Create: `dear-me-nextjs/types/global.d.ts`
- Create: `dear-me-nextjs/lib/recording/session.ts`
- Modify: `dear-me-nextjs/tsconfig.json` (only if `types/` isn't already in `include`)

- [ ] **Step 1: Create the ambient declaration**

```ts
// dear-me-nextjs/types/global.d.ts

import type { RecordingResult } from "@/lib/recording/recorder";

declare global {
  interface Window {
    __recordSession?: {
      stream?: MediaStream;
      recording?: RecordingResult;
    };
  }
}

export {};
```

- [ ] **Step 2: Verify tsconfig picks up the `types/` directory**

Read `dear-me-nextjs/tsconfig.json`. Confirm `include` covers `**/*.ts` (which includes `types/global.d.ts`). The default Next 16 scaffold uses `"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"]` — that already covers it. No edit needed.

- [ ] **Step 3: Create the typed accessor module**

```ts
// dear-me-nextjs/lib/recording/session.ts

import type { RecordingResult } from "./recorder";

function ensure(): NonNullable<Window["__recordSession"]> {
  if (typeof window === "undefined") {
    throw new Error("recordSession accessed on the server");
  }
  if (!window.__recordSession) window.__recordSession = {};
  return window.__recordSession;
}

export function setStream(stream: MediaStream): void {
  ensure().stream = stream;
}

export function getStream(): MediaStream | undefined {
  return ensure().stream;
}

export function clearStream(): void {
  const s = ensure();
  s.stream = undefined;
}

export function setRecording(recording: RecordingResult): void {
  ensure().recording = recording;
}

export function getRecording(): RecordingResult | undefined {
  return ensure().recording;
}

export function clearRecording(): void {
  const s = ensure();
  s.recording = undefined;
}

export function clearAll(): void {
  const s = ensure();
  s.stream = undefined;
  s.recording = undefined;
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean. If TypeScript complains about `Window["__recordSession"]` not being recognized, double-check `types/global.d.ts` is being picked up — try restarting the build with `rm -rf .next && bun run build`.

- [ ] **Step 5: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/types dear-me-nextjs/lib/recording/session.ts
git commit -m "feat(record): add typed window.__recordSession accessor"
```

---

### Task 11: Create the `useBlobUrl` hook

**Files:**
- Create: `dear-me-nextjs/lib/hooks/useBlobUrl.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/hooks/useBlobUrl.ts

"use client";

import { useEffect, useState } from "react";

/**
 * Creates an object URL for the given Blob and revokes it on unmount or
 * when the blob changes. Pass undefined/null to clear.
 */
export function useBlobUrl(blob: Blob | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [blob]);

  return url;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/hooks/useBlobUrl.ts
git commit -m "feat(hooks): add useBlobUrl hook with revoke-on-unmount"
```

---

### Task 12: Create the `useRecordSession` hook

**Files:**
- Create: `dear-me-nextjs/lib/hooks/useRecordSession.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/hooks/useRecordSession.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMemo, finalizeDraft } from "@/lib/db/memos";
import type { Memo } from "@/lib/db/schema";

type State =
  | { status: "loading" }
  | { status: "ready"; memo: Memo }
  | { status: "not-found" };

/**
 * Reads ?id from the URL, loads the corresponding memo from IDB.
 * Exposes the memo, a finalize action, and a refresh helper.
 *
 * Caller must handle the loading and not-found states.
 */
export function useRecordSession() {
  const params = useSearchParams();
  const id = params.get("id");
  const [state, setState] = useState<State>({ status: "loading" });

  const refresh = useCallback(async () => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }
    const memo = await getMemo(id);
    if (!memo) {
      setState({ status: "not-found" });
    } else {
      setState({ status: "ready", memo });
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const finalize = useCallback(
    async (patch: { title: string; notes: string; tags: string[] }) => {
      if (!id) throw new Error("No memo id in URL");
      const updated = await finalizeDraft(id, patch);
      setState({ status: "ready", memo: updated });
      // Tell other tabs/screens.
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("dear-me-memos");
        bc.postMessage({ type: "memo-finalized", id });
        bc.close();
      }
      return updated;
    },
    [id],
  );

  return { state, refresh, finalize, id } as const;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/hooks/useRecordSession.ts
git commit -m "feat(hooks): add useRecordSession with finalize broadcast"
```

---

### Task 13: Create the `useMemoList` hook

**Files:**
- Create: `dear-me-nextjs/lib/hooks/useMemoList.ts`

- [ ] **Step 1: Write the file**

```ts
// dear-me-nextjs/lib/hooks/useMemoList.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { listMemos } from "@/lib/db/memos";
import type { Memo, MemoStatus } from "@/lib/db/schema";

/**
 * Subscribes to the memos store and re-fetches when finalize broadcasts
 * happen on BroadcastChannel('dear-me-memos').
 *
 * Returns null while the initial load is in flight.
 */
export function useMemoList(filter?: { status?: MemoStatus }): Memo[] | null {
  const [memos, setMemos] = useState<Memo[] | null>(null);

  const fetch = useCallback(async () => {
    const list = await listMemos(filter);
    setMemos(list);
  }, [filter?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel("dear-me-memos");
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "memo-finalized" || e.data?.type === "memo-deleted") {
        void fetch();
      }
    };
    bc.addEventListener("message", handler);
    return () => {
      bc.removeEventListener("message", handler);
      bc.close();
    };
  }, [fetch]);

  return memos;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/hooks/useMemoList.ts
git commit -m "feat(hooks): add useMemoList with cross-tab broadcast subscription"
```

---

### Task 14: Add the AppBootstrap startup hook

**Files:**
- Create: `dear-me-nextjs/lib/bootstrap/app-bootstrap.tsx`
- Modify: `dear-me-nextjs/app/layout.tsx`

- [ ] **Step 1: Create the bootstrap component**

```tsx
// dear-me-nextjs/lib/bootstrap/app-bootstrap.tsx

"use client";

import { useEffect } from "react";
import { cleanupOrphanedDrafts } from "@/lib/db/memos";
import { isOpfsSupported } from "@/lib/db/opfs";

/**
 * Runs once on app mount: cleans up orphaned drafts (>24h old) and any
 * OPFS files with no matching memo row. Renders nothing.
 */
export function AppBootstrap() {
  useEffect(() => {
    if (!isOpfsSupported()) return;
    void cleanupOrphanedDrafts().catch((err) => {
      console.error("[dear-me] cleanupOrphanedDrafts failed", err);
    });
  }, []);
  return null;
}
```

- [ ] **Step 2: Mount it in `app/layout.tsx`**

Read `dear-me-nextjs/app/layout.tsx`. Add the import and the `<AppBootstrap />` element inside the existing `<body>` (above `<MobileFrame>` is fine — it renders nothing, position doesn't matter visually).

```tsx
// add at the top:
import { AppBootstrap } from "@/lib/bootstrap/app-bootstrap";

// inside the body, before <MobileFrame>:
<AppBootstrap />
<MobileFrame>{children}</MobileFrame>
```

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: both clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/lib/bootstrap dear-me-nextjs/app/layout.tsx
git commit -m "feat(bootstrap): mount AppBootstrap to clean orphaned drafts on startup"
```

---

## Phase B — Recording flow screens

### Task 15: Rewire `/record/camera` to use real getUserMedia

**Files:**
- Modify: `dear-me-nextjs/app/record/camera/page.tsx`

This screen currently renders a full-bleed dark "camera feed" placeholder with overlay controls (built in Task 29 of Slice 0). We replace the placeholder with a real `<video>` element bound to `getUserMedia`, and wire the record button to navigate to `/record/recording` after stashing the stream.

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/record/camera/page.tsx
```

Note the existing structure: the BackHeader/back pill at top-left, the dark gradient background, the bottom controls row (timer, record button, flip, etc.). You will keep all of this layout but replace the dark gradient placeholder with a `<video>` tag and wire the controls to real state.

- [ ] **Step 2: Convert to a client component and wire up state**

Add `"use client"` at the top. Replace the file with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, RefreshCw, ZapOff } from "lucide-react"; // adjust if existing file uses different imports
import { RecordButton } from "@/components/dear-me/record-button";
import { requestCameraAccess, type CameraAccessResult } from "@/lib/recording/permissions";
import { setStream } from "@/lib/recording/session";

type FacingMode = "user" | "environment";

export default function RecordCameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [result, setResult] = useState<CameraAccessResult | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigatedToRecord = useRef(false);

  // Request camera on mount and whenever facingMode changes.
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    requestCameraAccess({
      video: { facingMode },
      audio: true,
    }).then((r) => {
      if (cancelled) {
        if (r.ok) r.stream.getTracks().forEach((t) => t.stop());
        return;
      }
      setResult(r);
      if (r.ok) {
        streamRef.current = r.stream;
        if (videoRef.current) videoRef.current.srcObject = r.stream;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [facingMode]);

  // Stop the stream on unmount UNLESS we're navigating to /record/recording
  // (which reuses the same stream).
  useEffect(() => {
    return () => {
      if (navigatedToRecord.current) return;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleRecord() {
    if (!streamRef.current) return;
    setStream(streamRef.current);
    navigatedToRecord.current = true;
    router.push("/record/recording");
  }

  function handleFlip() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white">
      {/* Live preview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 size-full object-cover"
      />

      {/* Top controls */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => router.push("/record/trigger")}
          aria-label="Close"
          className="flex size-10 items-center justify-center rounded-full bg-white/55 backdrop-blur-md"
        >
          <X className="size-5 text-[#2C331EBB]" />
        </button>
        <button
          type="button"
          onClick={handleFlip}
          aria-label="Flip camera"
          className="flex size-10 items-center justify-center rounded-full bg-white/55 backdrop-blur-md"
        >
          <RefreshCw className="size-5 text-[#2C331EBB]" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 mt-auto flex items-end justify-around px-8 pb-10">
        <div className="flex size-10 items-center justify-center rounded-full bg-white/55 px-3 text-xs font-semibold text-[#2C331EBB] backdrop-blur-md">
          1m
        </div>
        <RecordButton
          state="idle"
          onPress={handleRecord}
          size="lg"
        />
        <button
          type="button"
          aria-label="Toggle flash (visual only)"
          className="flex size-10 items-center justify-center rounded-full bg-white/55 backdrop-blur-md"
        >
          <ZapOff className="size-5 text-[#2C331EBB]" />
        </button>
      </div>

      {/* Permission denied / error overlay */}
      {result && !result.ok && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--color-glass-surface)] p-6 text-center text-foreground backdrop-blur">
            <h2 className="text-base font-semibold">Camera access needed</h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              {result.message}
            </p>
            <button
              type="button"
              onClick={() => setFacingMode((m) => m)} // re-trigger the effect
              className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Adapt freely** to the existing file's structure. The layout above is a sketch — keep whatever overlay design Task 29 produced (positions, colors, exact pill styling), but replace the placeholder background with the `<video>` element and wire the buttons to real state.

**Note about retry:** the `setFacingMode((m) => m)` trick is a no-op state update that re-runs the effect. If your linter dislikes it, use a separate `retryKey` state and add it to the effect's deps.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: both clean. Build will warn about `useSearchParams` dynamic rendering for some pages — that's fine.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/record/camera
git commit -m "feat(record): wire /record/camera to real getUserMedia"
```

---

### Task 16: Rewire `/record/recording` to use real MediaRecorder

**Files:**
- Modify: `dear-me-nextjs/app/record/recording/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/record/recording/page.tsx
```

Note the existing structure: REC badge top-right, close button top-left, bottom controls (pause / stop / flip).

- [ ] **Step 2: Replace with a real recording implementation**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Pause } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";
import { createRecorder, type Recorder } from "@/lib/recording/recorder";
import { pickSupportedMimeType } from "@/lib/recording/mime";
import { getStream, setRecording, clearStream } from "@/lib/recording/session";
import { formatDuration } from "@/lib/format/time";

const MAX_DURATION_MS = 60_000;

export default function RecordingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const stoppedRef = useRef(false);

  // Bootstrap: read stream from session, attach to video, start recorder.
  useEffect(() => {
    const stream = getStream();
    if (!stream) {
      router.replace("/record/camera");
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;

    const mimeType = pickSupportedMimeType();
    const recorder = createRecorder(stream, mimeType);
    recorderRef.current = recorder;
    recorder.start();

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      if (elapsed >= MAX_DURATION_MS) {
        clearInterval(interval);
        void handleStop();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      // If component unmounts before stop (back nav, error, etc.), tear down.
      if (!stoppedRef.current) {
        try {
          if (recorder.isRecording()) void recorder.stop().catch(() => {});
        } catch {}
        streamRef.current?.getTracks().forEach((t) => t.stop());
        clearStream();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStop() {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const recorder = recorderRef.current;
    if (!recorder) {
      router.replace("/record/camera");
      return;
    }
    try {
      const result = await recorder.stop();
      setRecording(result);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearStream();
      router.push("/record/processing");
    } catch (err) {
      console.error("[dear-me] recorder stop failed", err);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearStream();
      router.replace("/record/camera");
    }
  }

  function handleClose() {
    stoppedRef.current = true;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearStream();
    router.push("/record/trigger");
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 size-full object-cover"
      />

      {/* Top: close + REC badge */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full bg-white/55 backdrop-blur-md"
        >
          <X className="size-5 text-[#2C331EBB]" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 backdrop-blur-md">
          <span className="size-2 rounded-full bg-[#E53E3E] shadow-[0_0_8px_rgba(229,62,62,0.5)]" />
          <span className="text-[13px] font-semibold text-[#2C331EBB]">
            {formatDuration(elapsedMs)}
          </span>
        </div>
      </div>

      {/* Bottom: pause (visual) + stop button */}
      <div className="relative z-10 mt-auto flex items-end justify-center gap-12 pb-12">
        <button
          type="button"
          aria-label="Pause (visual only)"
          className="flex size-11 items-center justify-center rounded-full bg-white/55 backdrop-blur-md"
        >
          <Pause className="size-5 text-[#2C331EBB]" />
        </button>
        <RecordButton state="recording" onPress={handleStop} size="lg" />
        <div className="size-11" /> {/* spacer for symmetry */}
      </div>
    </div>
  );
}
```

Adapt to the existing file's exact overlay layout/spacing. The key wiring points are: read stream from session on mount, start recorder immediately, increment a timer, auto-stop at 60s, on stop store recording in session and navigate to processing.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/record/recording
git commit -m "feat(record): wire /record/recording to real MediaRecorder with 60s cap"
```

---

### Task 17: Rewire `/record/processing` to do the OPFS+IDB write

**Files:**
- Modify: `dear-me-nextjs/app/record/processing/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/record/processing/page.tsx
```

Note the existing structure: pulsing concentric orbs, "Sitting with your words..." headline, "Continue" link.

- [ ] **Step 2: Rewrite to do the real write**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { createDraft } from "@/lib/db/memos";
import { writeBlob, isOpfsSupported } from "@/lib/db/opfs";
import { extensionForMimeType } from "@/lib/recording/mime";
import { getRecording, clearRecording } from "@/lib/recording/session";

type State =
  | { kind: "writing" }
  | { kind: "error"; message: string };

export default function ProcessingPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "writing" });

  useEffect(() => {
    const recording = getRecording();
    if (!recording) {
      router.replace("/record/camera");
      return;
    }
    if (!isOpfsSupported()) {
      setState({
        kind: "error",
        message: "Your browser doesn't support local video storage.",
      });
      return;
    }

    const id = crypto.randomUUID();
    const ext = extensionForMimeType(recording.mimeType);
    const filename = `memo-${id}.${ext}`;
    const now = Date.now();

    (async () => {
      try {
        await writeBlob(filename, recording.blob);
        await createDraft({
          id,
          filename,
          mimeType: recording.mimeType,
          durationMs: recording.durationMs,
          sizeBytes: recording.blob.size,
          title: "",
          notes: "",
          tags: [],
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        clearRecording();
        router.replace(`/record/review?id=${id}`);
      } catch (err) {
        const e = err as DOMException;
        const isQuota =
          e.name === "QuotaExceededError" ||
          /quota/i.test(e.message ?? "");
        setState({
          kind: "error",
          message: isQuota
            ? "Your device is out of space. Free up some room and try again."
            : "Couldn't save your memo. Please try again.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRetry() {
    setState({ kind: "writing" });
    // Re-run the effect by reloading the page; simplest correct retry.
    router.refresh();
  }

  function handleDiscard() {
    clearRecording();
    router.replace("/home");
  }

  if (state.kind === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Couldn&apos;t save your memo
        </h1>
        <p className="max-w-[280px] text-sm text-[color:var(--color-muted-foreground)]">
          {state.message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      {/* Animated concentric orbs — keep the existing visual */}
      <div className="relative size-40">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[var(--color-primary)]/20" />
        <div className="absolute inset-5 animate-pulse rounded-full bg-[var(--color-primary)]/40 [animation-delay:200ms]" />
        <div className="absolute inset-10 flex items-center justify-center rounded-full bg-[var(--color-primary)]/70 [animation-delay:400ms]">
          <Leaf className="size-8 text-white" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          Sitting with your words…
        </h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          listening carefully
        </p>
      </div>
    </div>
  );
}
```

Match the existing orb layout/copy as closely as possible — the above uses the values from Task 31's report. The key change is removing the static "Continue" link and adding the real OPFS+IDB write effect.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/record/processing
git commit -m "feat(record): wire /record/processing to write OPFS + IDB draft"
```

---

### Task 18: Rewire `/record/review` to play back the draft

**Files:**
- Modify: `dear-me-nextjs/app/record/review/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/record/review/page.tsx
```

Note the existing structure: BackHeader, large card with thumbnail + REC/duration badges, mood tags row, transcript card, note preview card, "Save Memo" + "Start over" CTAs, privacy note.

- [ ] **Step 2: Refactor — wrap in Suspense and use the hook**

The page reads `?id=...` via `useSearchParams`, which Next 16 requires inside a `<Suspense>` boundary. Split the file so the page export wraps a child component in Suspense.

```tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { readBlob } from "@/lib/db/opfs";
import { deleteMemo } from "@/lib/db/memos";
import { formatDuration } from "@/lib/format/time";

function ReviewContent() {
  const router = useRouter();
  const { state, id } = useRecordSession();
  const [blob, setBlob] = useState<Blob | null>(null);
  const blobUrl = useBlobUrl(blob);

  // Load the blob from OPFS once we have the memo.
  useEffect(() => {
    if (state.status !== "ready") return;
    let cancelled = false;
    void readBlob(state.memo.filename).then((b) => {
      if (!cancelled) setBlob(b);
    });
    return () => {
      cancelled = true;
    };
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (state.status === "not-found") {
    router.replace("/home");
    return null;
  }
  if (state.memo.status === "final") {
    router.replace(`/memo/${state.memo.id}`);
    return null;
  }

  async function handleStartOver() {
    if (state.status !== "ready") return;
    await deleteMemo(state.memo.id);
    router.replace("/record/camera");
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Review & Save" backHref="/record/processing" />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        <GlassCard padding="lg" className="flex flex-col gap-4">
          {blobUrl ? (
            <video
              src={blobUrl}
              controls
              playsInline
              className="w-full rounded-2xl bg-black"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-black/40 text-xs text-white/70">
              Loading playback…
            </div>
          )}
          <p className="text-center text-xs text-[color:var(--color-muted-foreground)]">
            {formatDuration(state.memo.durationMs)}
          </p>
        </GlassCard>

        {/* Static placeholder cards (transcript, encouragement, note preview)
            — kept from Slice 0. Real implementations land in later slices. */}

        <div className="mt-2 flex flex-col gap-3">
          <Link
            href={`/record/add-notes?id=${id}`}
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]"
          >
            Save Memo
          </Link>
          <button
            type="button"
            onClick={handleStartOver}
            className="rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-6 py-3 text-center text-sm font-semibold text-foreground backdrop-blur"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecordReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewContent />
    </Suspense>
  );
}
```

**Preserve the static cards** from the existing file (transcript card, encouragement card, mood tags, privacy note) by lifting them from the existing JSX into the same place in this new structure. Don't drop them — they should still render exactly as Slice 0 designed.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/record/review
git commit -m "feat(record): wire /record/review to play back the draft from OPFS"
```

---

### Task 19: Rewire `/record/add-notes` to finalize the draft

**Files:**
- Modify: `dear-me-nextjs/app/record/add-notes/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/record/add-notes/page.tsx
```

Note the existing structure: BackPill, "Add Notes" headline, video thumbnail (remove), Notes Card with Textarea, optional title field, "Continue" + "Maybe later" CTAs.

- [ ] **Step 2: Rewrite with controlled inputs and finalize action**

```tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Type } from "lucide-react";
import { BackPill } from "@/components/dear-me/back-pill";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { formatClockTime } from "@/lib/format/time";

function AddNotesContent() {
  const router = useRouter();
  const { state, finalize, id } = useRecordSession();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (state.status === "not-found") {
    router.replace("/home");
    return null;
  }
  if (state.memo.status === "final") {
    router.replace(`/memo/${state.memo.id}`);
    return null;
  }

  async function handleSave() {
    if (submitting || state.status !== "ready") return;
    setSubmitting(true);
    const finalTitle =
      title.trim() ||
      `Memo · ${formatClockTime(state.memo.createdAt)}`;
    try {
      await finalize({ title: finalTitle, notes, tags: [] });
      router.push("/record/saved");
    } catch (err) {
      console.error("[dear-me] finalize failed", err);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <div className="relative flex justify-start px-5 pt-6">
        <BackPill href={`/record/review?id=${id}`} />
      </div>

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-4 pb-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold text-foreground">Add Notes</h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Anything you&apos;d tell your future self?
          </p>
        </header>

        <GlassCard className="flex flex-col gap-3">
          <label
            htmlFor="memo-title"
            className="flex items-center gap-2 text-[13px] font-semibold text-foreground/70"
          >
            <Type className="size-3.5" />
            Title (optional)
          </label>
          <Input
            id="memo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Memo · ${formatClockTime(state.memo.createdAt)}`}
            className="border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)]"
          />
        </GlassCard>

        <GlassCard className="flex flex-1 flex-col gap-3">
          <label
            htmlFor="memo-notes"
            className="text-[13px] font-semibold text-foreground/70"
          >
            A note for future you
          </label>
          <Textarea
            id="memo-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember? (optional)"
            className="min-h-[160px] resize-none border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)]"
          />
        </GlassCard>

        <div className="mt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="text-center text-xs font-medium text-[color:var(--color-muted-foreground)]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddNotesPage() {
  return (
    <Suspense fallback={null}>
      <AddNotesContent />
    </Suspense>
  );
}
```

Adapt to match the exact visual structure of the existing file from Task 33 — keep the headline copy, icon choices, padding, etc. The two key changes: remove the video thumbnail block (no real image) and the processing-indicator row (processing already done), and wire the inputs + finalize action.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/record/add-notes
git commit -m "feat(record): wire /record/add-notes to finalize the draft"
```

---

## Phase C — Consumer screens

### Task 20: Rewire `/memo` (Memo tab) to use real data

**Files:**
- Modify: `dear-me-nextjs/app/(tabs)/memo/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/(tabs)/memo/page.tsx
```

Note the existing structure: header (Memo / "Messages from your past self"), search bar (visual), filter pills row, list of 5 hardcoded MemoCards, empty state branch via `HAS_DATA` toggle.

- [ ] **Step 2: Replace MOCK_MEMOS with useMemoList**

```tsx
"use client";

import { useState } from "react";
import { Search, AudioLines, House } from "lucide-react";
import { MemoCard } from "@/components/dear-me/memo-card";
import { FilterPill } from "@/components/dear-me/filter-pill";
import { EmptyState } from "@/components/dear-me/empty-state";
import { useMemoList } from "@/lib/hooks/useMemoList";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";

const FILTERS = ["This Week", "This Month", "3 Months", "All Time"] as const;

export default function MemoPage() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>("This Week");
  const memos = useMemoList({ status: "final" });

  // Loading
  if (memos === null) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Messages from your past self
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-2xl bg-[var(--color-glass-surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty
  if (memos.length === 0) {
    return (
      <EmptyState
        icon={<AudioLines className="size-8" />}
        title="No memos yet"
        subtitle="Record a video memo from Home — your future self will find it here."
        cta={{ label: "Go to Home", href: "/home" }}
      />
    );
  }

  // Populated
  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Messages from your past self
        </p>
      </header>

      {/* Search bar (cosmetic for Slice 1) */}
      <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-4 py-2.5 shadow-[var(--shadow-glass)] backdrop-blur">
        <Search className="size-4 text-[color:var(--color-muted-foreground)]" />
        <span className="text-sm text-[color:var(--color-muted-foreground)]">
          Search memos…
        </span>
      </div>

      {/* Time filters (cosmetic for Slice 1) */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => (
          <FilterPill
            key={f}
            label={f}
            active={f === activeFilter}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      {/* Real memo list */}
      <div className="flex flex-col gap-3">
        {memos.map((memo) => (
          <MemoCard
            key={memo.id}
            href={`/memo/${memo.id}`}
            title={memo.title}
            preview={
              memo.notes.trim().length > 0
                ? memo.notes.slice(0, 80)
                : "Tap to play"
            }
            duration={formatDuration(memo.durationMs)}
            timestamp={formatRelativeTime(memo.createdAt)}
          />
        ))}
      </div>
    </div>
  );
}
```

The hardcoded `MOCK_MEMOS` array is gone. The `HAS_DATA` toggle is gone. Real data only.

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/\(tabs\)/memo
git commit -m "feat(memo): wire /memo tab to useMemoList, drop mock data"
```

---

### Task 21: Rewire `/memo/[id]` (memo detail) to query real data

**Files:**
- Modify: `dear-me-nextjs/app/memo/[id]/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/memo/[id]/page.tsx
```

Note the existing structure: BackHeader → /memo, date/time header, video thumbnail with play button overlay, mood tags row, transcript card, your note card, AI reflection card, delete button.

- [ ] **Step 2: Convert to client component using real data**

```tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Leaf, Sparkles, Trash2, Play } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import { getMemo } from "@/lib/db/memos";
import { readBlob } from "@/lib/db/opfs";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";
import type { Memo } from "@/lib/db/schema";

export default function MemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [memo, setMemo] = useState<Memo | null | undefined>(undefined);
  const [blob, setBlob] = useState<Blob | null>(null);
  const blobUrl = useBlobUrl(blob);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const m = await getMemo(id);
      if (cancelled) return;
      if (!m || m.status !== "final") {
        setMemo(null);
        return;
      }
      setMemo(m);
      try {
        const b = await readBlob(m.filename);
        if (!cancelled) setBlob(b);
      } catch (err) {
        console.error("[dear-me] failed to read blob", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (memo === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (memo === null) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <ScreenBackground />
        <BackHeader title="Memo" backHref="/memo" />
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-base font-semibold text-foreground">
            Memo not found
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            It may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => router.push("/memo")}
            className="mt-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
          >
            Back to memos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Memo" backHref="/memo" />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-foreground">
            {memo.title}
          </h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {formatRelativeTime(memo.createdAt)} ·{" "}
            {formatDuration(memo.durationMs)}
          </p>
        </header>

        {/* Video preview → tap to play */}
        <Link href={`/memo/${memo.id}/playback`} className="block">
          <div className="relative overflow-hidden rounded-2xl bg-black">
            {blobUrl ? (
              <video
                src={blobUrl}
                preload="metadata"
                playsInline
                muted
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square w-full" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/30 backdrop-blur-md">
                <Play
                  className="size-6 translate-x-[2px] text-white"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Tags (only if non-empty — Slice 1 always empty) */}
        {memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memo.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-tag-chip-bg)] px-3 py-1 text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Notes (only if non-empty) */}
        {memo.notes.trim().length > 0 && (
          <GlassCard className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-muted-foreground)]">
              <Leaf className="size-3.5" />
              Your note
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {memo.notes}
            </p>
          </GlassCard>
        )}

        {/* Transcript card — STATIC for Slice 1 */}
        <GlassCard className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
              <FileText className="size-3.5" />
              Transcript
            </p>
            <Link
              href={`/transcript/${memo.id}`}
              className="text-xs font-semibold text-[color:var(--color-primary)]"
            >
              View full
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            Transcripts will appear here when transcript support lands.
          </p>
        </GlassCard>

        {/* AI Reflection — STATIC for Slice 1 */}
        <GlassCard className="border-[color:var(--color-encouragement-border)] bg-[var(--color-encouragement-bg)]">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-accent)]">
            <Sparkles className="size-3.5" />
            A gentle reminder
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-[color:var(--color-accent)]">
            Reflections will appear here in a future update.
          </p>
        </GlassCard>

        <button
          type="button"
          aria-label="Delete (coming in next slice)"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-4 py-3 text-sm font-semibold text-foreground/60 backdrop-blur"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
```

**Note:** I'm using `use(params)` (the new React hook) to unwrap the params Promise inside a client component. This is the Next 16 + React 19 pattern. If `use()` isn't available where TypeScript expects it, fall back to:

```tsx
import { useEffect, useState } from "react";
// ...
const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
useEffect(() => {
  void params.then(setResolvedParams);
}, [params]);
if (!resolvedParams) return <Loading />;
const { id } = resolvedParams;
```

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/memo/\[id\]/page.tsx
git commit -m "feat(memo): wire /memo/[id] to real data with video preview"
```

---

### Task 22: Rewire `/memo/[id]/playback` to use real video controls

**Files:**
- Modify: `dear-me-nextjs/app/memo/[id]/playback/page.tsx`

- [ ] **Step 1: Read the existing file**

```
Read: dear-me-nextjs/app/memo/[id]/playback/page.tsx
```

Note the existing structure: BackHeader, GlassCard with static waveform bars + scrubber + play button, transcript card, encouragement card, "I needed this" CTA.

- [ ] **Step 2: Replace the player block with a real `<video controls>`**

```tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Heart } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import { getMemo } from "@/lib/db/memos";
import { readBlob } from "@/lib/db/opfs";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";
import type { Memo } from "@/lib/db/schema";

export default function PlaybackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [memo, setMemo] = useState<Memo | null | undefined>(undefined);
  const [blob, setBlob] = useState<Blob | null>(null);
  const blobUrl = useBlobUrl(blob);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const m = await getMemo(id);
      if (cancelled) return;
      if (!m || m.status !== "final") {
        setMemo(null);
        return;
      }
      setMemo(m);
      try {
        const b = await readBlob(m.filename);
        if (!cancelled) setBlob(b);
      } catch (err) {
        console.error("[dear-me] failed to read blob", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (memo === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (memo === null) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <ScreenBackground />
        <BackHeader title="Playing" backHref="/memo" />
        <div className="relative flex flex-1 items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
          Memo not found
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Playing" backHref={`/memo/${memo.id}`} />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        {/* Real player */}
        <GlassCard padding="lg" className="flex flex-col gap-3">
          {blobUrl ? (
            <video
              src={blobUrl}
              controls
              playsInline
              className="w-full rounded-2xl bg-black"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-black/40 text-xs text-white/70">
              Loading…
            </div>
          )}
          <div className="flex justify-between text-xs text-[color:var(--color-muted-foreground)]">
            <span>{formatRelativeTime(memo.createdAt)}</span>
            <span>{formatDuration(memo.durationMs)}</span>
          </div>
        </GlassCard>

        {/* Static transcript and encouragement cards — kept from Slice 0 */}
        <GlassCard className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
              <FileText className="size-3.5" />
              Transcript
            </p>
            <Link
              href={`/transcript/${memo.id}`}
              className="text-xs font-semibold text-[color:var(--color-primary)]"
            >
              View full
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            Transcripts will appear here when transcript support lands.
          </p>
        </GlassCard>

        <GlassCard className="border-[color:var(--color-encouragement-border)] bg-[var(--color-encouragement-bg)]">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-accent)]">
            <Sparkles className="size-3.5" />
            A gentle reminder
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-[color:var(--color-accent)]">
            Reflections will appear here in a future update.
          </p>
        </GlassCard>

        <button
          type="button"
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]"
        >
          <Heart className="size-4" />
          I needed this
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build + lint**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build && bun run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs/app/memo/\[id\]/playback
git commit -m "feat(memo): wire /memo/[id]/playback to real video controls"
```

---

## Phase D — Validation

### Task 23: Final smoke test on a real device

**Files:** none modified.

This task can't be fully automated by a subagent — it requires a real device with a camera. The implementer (or the human operator) runs through the full happy path.

- [ ] **Step 1: Production build + lint final check**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run build
bun run lint
```

Both must pass clean. Capture the route table.

- [ ] **Step 2: Start dev server in the background**

```bash
cd /Users/dirajthajali/work/projects/dear-me/dear-me-nextjs
bun run dev > /tmp/dear-me-dev.log 2>&1 &
sleep 4
cat /tmp/dear-me-dev.log
```

Expected: dev server up at `http://localhost:3000`.

- [ ] **Step 3: Manual happy-path smoke test (operator runs this)**

Open `http://localhost:3000` on a real device (phone with camera) or a desktop browser with a webcam, walk through:

1. `/` redirects to `/home` ✓
2. From Home, tap the Start Recording Card → routes to `/record/trigger` (the static "listen to past self" screen — that's still the entry from Home, but it has its own CTA into the recording flow).
3. *Alternative entry for testing:* go directly to `/record/camera` to start recording.
4. Browser prompts for camera+mic → grant.
5. Live preview appears in `/record/camera`.
6. Tap the record button → routes to `/record/recording` with the live feed continuing.
7. Watch the timer count up (formatDuration in M:SS).
8. Tap the stop button (or wait 60 seconds for auto-stop).
9. Routes to `/record/processing` → orbs animate briefly → routes to `/record/review`.
10. `/record/review` plays the just-recorded video (native `<video controls>`).
11. Tap "Save Memo" → routes to `/record/add-notes`.
12. (Optionally) type a title and a note. Tap Continue.
13. Routes to `/record/saved`. Tap Done → `/home`.
14. Tap the Memo tab → see the new memo at the top of the list (with the title you set, "Just now" timestamp, real duration).
15. Tap the memo → `/memo/[id]` shows real metadata + a video preview thumbnail.
16. Tap the play overlay → `/memo/[id]/playback` shows full `<video controls>`. Tap play → real video plays.
17. Use back navigation to return to /memo. Memo still there.
18. Refresh the page mid-recording flow (e.g., on `/record/recording`) — verify the page redirects back to `/record/camera` (lost the in-memory stream) without crashing.
19. Permission deny test: in browser settings, deny camera → reload `/record/camera` → verify the error card appears with retry.

Document any failures — they become follow-up tasks. **Do not attempt to fix them in this task.** Task 23 is a verification gate, not an implementation step.

- [ ] **Step 4: Stop the dev server**

```bash
pkill -f "next dev" || true
```

- [ ] **Step 5: Confirm Expo project untouched**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git log --oneline 876e295..HEAD -- app/ components/ src/
```

Expected: empty output. No commits in this slice touch the Expo tree.

- [ ] **Step 6: Marker commit**

```bash
git commit --allow-empty -m "chore(record): Slice 1 (record & replay) complete — happy path verified"
```

## Self-review

**Spec coverage:**
- Spec §Goals 1 (real recording, feature-detected mime, 1-min cap) → Tasks 7, 9, 15, 16
- Spec §Goals 2 (lazy permission, deny error card with retry) → Tasks 8, 15
- Spec §Goals 3 (OPFS blobs + IDB metadata + draft pattern) → Tasks 2-5, 17, 19
- Spec §Goals 4 (6-screen flow real and stateful) → Tasks 15-19
- Spec §Goals 5 (Memo tab queries IDB + empty state) → Task 20
- Spec §Goals 6 (memo detail + playback real) → Tasks 21, 22
- Spec §Goals 7 (BroadcastChannel cross-tab) → Tasks 12, 13
- Spec §Goals 8 (cleanupOrphanedDrafts on startup) → Tasks 5, 14
- Spec §Goals 9 (build + lint clean) → every task's verify step + Task 23

**Non-goals coverage:**
- Search/filters cosmetic only → Task 20 keeps them visual
- Streak / Insights / Trigger / Transcript untouched → no tasks modify those files
- Mood chips, title editing, sharing/delete, thumbnail extraction, PWA → no tasks
- Sync/auth → no tasks (the BroadcastChannel is intra-browser, not cross-device)
- Tests → no tasks (deferred)

**Type/naming consistency:**
- `Memo`, `MemoStatus`, `STORE_MEMOS`, `DB_NAME`, `SCHEMA_VERSION` — defined once in Task 2 schema.ts, imported throughout ✓
- `pickSupportedMimeType()`, `extensionForMimeType()` — Task 7 ✓
- `requestCameraAccess()`, `CameraAccessResult` — Task 8 ✓
- `createRecorder()`, `Recorder`, `RecordingResult` — Task 9 ✓
- `setStream/getStream/clearStream/setRecording/getRecording/clearRecording/clearAll` — Task 10 ✓ (used in 15, 16, 17)
- `useBlobUrl` — Task 11 ✓ (used in 18, 21, 22)
- `useRecordSession` — Task 12 ✓ (used in 18, 19)
- `useMemoList` — Task 13 ✓ (used in 20)
- `cleanupOrphanedDrafts` — Task 5 ✓ (used in 14)
- `formatDuration`, `formatRelativeTime`, `formatClockTime` — Task 6 ✓ (used in 16, 19, 20, 21, 22)
- BroadcastChannel name `dear-me-memos` — consistent in Tasks 12, 13
- `?id=...` URL param convention — consistent in Tasks 12, 17, 18, 19

**Placeholder scan:** No "TBD", "TODO", "implement later" in task bodies. Every code step has the actual code. The Slice 0 reference to "static placeholder cards from Slice 0" in Task 18 is a deliberate instruction to preserve Slice 0 JSX, not a placeholder.

All cross-task references resolve cleanly.
