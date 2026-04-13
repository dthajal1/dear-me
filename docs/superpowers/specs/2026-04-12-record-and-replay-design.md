# dear-me Slice 1: Record & Replay — Design Spec

**Date:** 2026-04-12
**Status:** Approved, ready for implementation plan
**Branch context:** Implementation will start from `nextjs-scaffold` HEAD (`cbb3f07`).
**Slice:** First of 4 planned vertical slices to make `dear-me-nextjs` functional. This slice covers recording video memos, persisting them locally, listing them, and playing them back.

---

## Motivation

`dear-me-nextjs` is a complete static UI scaffold (Slice 0). Every screen renders exactly as designed in `design.pen` — but nothing actually does anything. Recording is a fake button. The Memo tab shows hardcoded mock data. Playback shows a static waveform.

This slice makes the **core "it works" loop** real: a user can open the app, record a video memo with their camera + microphone, save it locally, see it appear in their memo list, and play it back. Nothing else changes. Search stays cosmetic. Insights stays static. Transcripts stay static. Streak tab stays a coming-soon placeholder.

The win is small but enormous: from this slice forward, dear-me is no longer a mockup. It's a real (if minimal) journaling app you can install on your phone and use.

---

## Goals

1. Real video+audio recording on `/record/camera` and `/record/recording` using `MediaRecorder`, with feature-detected mime type, front-camera default, and a 1-minute cap.
2. Lazy permission prompt on camera-screen mount, with a clear deny-state error card and retry.
3. OPFS for blob storage, IndexedDB (via `idb`) for an 11-field metadata table, with a draft → final state pattern.
4. The 6-screen recording flow (`camera → recording → processing → review → add-notes → saved`) all become real and stateful, passing data via URL ids and an in-memory handoff between recording and processing.
5. `/memo` tab queries IndexedDB and renders real memos, with the existing empty state shown when there are 0 final memos.
6. `/memo/[id]` and `/memo/[id]/playback` query the real memo and play its blob from OPFS.
7. Cross-tab consistency via a `BroadcastChannel` ping on memo finalize.
8. Cleanup pass on app startup deletes orphaned drafts older than 24 hours.
9. `bun run build && bun run lint` clean.

## Non-goals (explicit)

- Search functionality (`/memo` search bar stays cosmetic)
- Time filter functionality (`/memo` filter pills stay cosmetic)
- Streak tab (stays "coming soon")
- Insights tab (stays as static chat thread from Task 25)
- `/record/trigger` ("listen to past self" emotional nudge stays static — not part of any flow)
- Real transcripts (`/transcript/[id]` stays as static lorem ipsum) — Slice 3
- Mood tag chips on memo detail (chips render only if `tags[]` is non-empty, which it never is in Slice 1 because there's no UI to enter tags)
- Title editing on memo detail (no inline edit)
- Sharing / exporting / deleting (buttons stay visual-only) — Slice 2
- Thumbnail extraction (gradient placeholder on memo cards stays)
- PWA manifest + service worker
- Sync, auth, accounts (deferred indefinitely)
- Pause / resume during recording
- Cross-browser file portability (a webm from Chrome doesn't need to play on Safari — same device, same browser)
- Tests (no behavior is stable enough to test yet)

---

## Architecture

The slice introduces two thin TypeScript modules — a **data layer** and a **recording layer** — and a couple of React hooks that glue them to screens. Nothing in this slice is server-side.

### Module structure

```
dear-me-nextjs/lib/
├── db/
│   ├── schema.ts        ← Memo type, status enum, schema version constant
│   ├── client.ts        ← idb openDB() singleton, store creation, version migrations
│   ├── memos.ts         ← CRUD: createDraft, finalizeDraft, getMemo, listMemos, deleteMemo, cleanupOrphanedDrafts
│   └── opfs.ts          ← writeBlob, readBlob, deleteFile, isOpfsSupported
├── recording/
│   ├── mime.ts          ← pickSupportedMimeType()
│   ├── permissions.ts   ← requestCameraAccess() with normalized error result
│   └── recorder.ts      ← createRecorder(stream, mimeType) — MediaRecorder wrapper
├── format/
│   └── time.ts          ← formatDuration(ms), formatRelativeTime(timestamp), formatClockTime(timestamp)
└── hooks/
    ├── useRecordSession.ts   ← reads ?id from URL, exposes draft + updateDraft + finalize
    ├── useMemoList.ts        ← memos for /memo tab, subscribes to BroadcastChannel
    └── useBlobUrl.ts         ← create + revoke object URL lifecycle helper
```

**Boundary discipline:**

- `lib/db/memos.ts` is the only file that imports `lib/db/client.ts`. Every other module talks to memos through these CRUD functions. If we ever swap IndexedDB for SQLite-WASM or anything else, only this file changes.
- `lib/db/opfs.ts` is the same boundary for blob storage. Reads return `Blob` objects; callers handle `URL.createObjectURL` via `useBlobUrl`.
- The `lib/recording/` modules are pure functions (no React, no global state) so they're trivially testable later.
- `lib/hooks/` is the React surface. Screens import from `lib/hooks/` and never directly from `lib/db/` or `lib/recording/`.

### Schema

The single object store is `memos`, with one schema version. Indexes: `createdAt` (for the descending list query), `status` (for the cleanup query).

```ts
// lib/db/schema.ts
export const SCHEMA_VERSION = 1;

export type MemoStatus = "draft" | "final";

export type Memo = {
  // identity + storage
  id: string;              // crypto.randomUUID()
  filename: string;        // OPFS filename, e.g. "memo-{id}.webm"
  mimeType: string;        // recorded codec, e.g. "video/webm;codecs=vp9,opus"
  // intrinsic media facts
  durationMs: number;
  sizeBytes: number;
  // user metadata (persists from add-notes)
  title: string;           // default: "Memo · {time}"
  notes: string;           // default: ""
  tags: string[];          // default: [] (no UI to populate in Slice 1)
  // lifecycle
  status: MemoStatus;
  createdAt: number;       // Date.now() at draft creation
  updatedAt: number;       // Date.now() at finalize, or any later mutation
};
```

### Recording format

Slice 1 uses **per-memo mime type with feature detection**. `pickSupportedMimeType()` tries this order and returns the first hit from `MediaRecorder.isTypeSupported()`:

1. `video/webm;codecs=vp9,opus`
2. `video/webm;codecs=vp8,opus`
3. `video/mp4;codecs=avc1,mp4a`
4. `video/mp4`
5. (browser default — no mimeType passed)

Each memo's `mimeType` field stores what was actually used. On playback, `<video src={blobUrl}>` plays whatever the file contains; since the same browser recorded and plays it back, this always works.

### State flow through the recording screens

```
/record/camera
  ↓ getUserMedia → MediaStream in window.__recordSession.stream
  ↓ user taps record
/record/recording
  ↓ recorder.start(stream, mimeType)
  ↓ user taps stop OR 60s cap hits → recorder.stop() resolves with { blob, durationMs, mimeType }
  ↓ window.__recordSession.recording = { blob, durationMs, mimeType }
  ↓ stream.getTracks().forEach(stop)
  ↓ router.push('/record/processing')
/record/processing
  ↓ reads window.__recordSession.recording — if missing, redirect to /record/camera
  ↓ id = crypto.randomUUID()
  ↓ opfs.writeBlob(`memo-${id}.${ext}`, blob)
  ↓ memos.createDraft({ id, filename, mimeType, durationMs, sizeBytes, ... })
  ↓ delete window.__recordSession.recording
  ↓ router.replace(`/record/review?id=${id}`)
/record/review
  ↓ useRecordSession() reads ?id, getMemo(id), useBlobUrl(blob)
  ↓ <video controls src={blobUrl} />
  ↓ user taps "Save Memo" → router.push(`/record/add-notes?id=${id}`)
  ↓ user taps "Start over" → memos.deleteMemo(id) + opfs.deleteFile → /record/camera
/record/add-notes
  ↓ useRecordSession() loads draft
  ↓ user fills title/notes (tags stay []), taps Continue
  ↓ memos.finalizeDraft(id, { title, notes, tags: [] }) — sets status to "final", bumps updatedAt
  ↓ broadcastChannel.postMessage({ type: "memo-finalized", id })
  ↓ router.push('/record/saved')
/record/saved
  ↓ pure success state, no data dependency
  ↓ "Done" → /home
```

**The handoff between `/record/recording` and `/record/processing` is in-memory only** (`window.__recordSession.recording`). This is intentional: the recording screen records, processing writes to disk, review reads from disk. Each screen has one job. The "lost on refresh" window is the ~100ms between recording stop and OPFS write — small, and the recovery (back to camera) is clean.

### Consumer-side integration

**`/memo` (Memo tab)**

- Becomes a client component using `useMemoList()`.
- Hardcoded `MOCK_MEMOS` array deletes entirely.
- `useMemoList()` calls `memos.listMemos({ status: "final" })`, returns `Memo[]` sorted by `createdAt` descending. Initial state `null` (loading) → renders skeleton rows briefly.
- For each memo: `<MemoCard>` with `title`, `preview` (first ~80 chars of `notes`, fallback `"Tap to play"`), `duration` (`formatDuration(durationMs)`), `timestamp` (`formatRelativeTime(createdAt)`), `mood: undefined` (no chips render), `href: /memo/${id}`.
- Empty state: when the list is `[]`, render the existing `EmptyState` from the scaffold ("No memos yet — record a video memo from Home").
- Header, search bar, filter pills all stay visually present but cosmetic. The `useState` for active filter still toggles styles.
- Subscribes to `BroadcastChannel('dear-me-memos')` and refetches on `memo-finalized` events so the list updates when a memo is saved from another route in the same tab or another tab.

**`/memo/[id]` (Memo detail)**

- Becomes a client component (because of blob URL lifecycle). Reads `id` from `params: Promise<{ id: string }>` (Next 16 async pattern).
- `getMemo(id)`. Not found OR `status === "draft"` → "Memo not found" state with a back link.
- Header metadata uses real values: `memo.title`, `formatRelativeTime(memo.createdAt)`, `formatDuration(memo.durationMs)`.
- The video thumbnail block becomes a real `<video preload="metadata" src={blobUrl}>` element so the browser auto-renders the first frame as the poster. Tap → `/playback`.
- Mood tags row: `memo.tags.map(t => <Chip>{t}</Chip>)`. Empty in Slice 1, so the row collapses.
- Notes card: shows `memo.notes` if non-empty, otherwise hides the card entirely.
- Transcript card and AI Reflection card stay as static placeholders from the scaffold.
- Delete button: visual only.

**`/memo/[id]/playback`**

- Becomes a client component. Same `getMemo(id)` + not-found pattern.
- The waveform-bars-and-fake-scrubber card becomes `<video controls src={blobUrl} className="w-full rounded-2xl" />`. Native `controls` give play/pause/scrub for free.
- Transcript and encouragement cards stay static.
- `useBlobUrl` handles cleanup.

**`/transcript/[id]`** stays static. Slice 3 makes it real.

---

## Per-screen changes (recording flow)

### `/record/camera`

- Becomes a client component.
- On mount: `requestCameraAccess({ video: { facingMode }, audio: true })` from `lib/recording/permissions.ts`.
- Local state: `facingMode: "user" | "environment"` (default `"user"`). Flip button toggles + re-requests stream.
- Live preview: `<video autoPlay muted playsInline ref={videoRef}>` with `videoRef.current.srcObject = stream`. Replaces the dark-gradient placeholder.
- Three states render in the same screen:
  - **Loading** (waiting for `getUserMedia`): existing dark bg + control overlays, controls disabled.
  - **Granted**: live preview fills viewport, controls enabled. Bottom-center record button → stores stream on `window.__recordSession.stream` → `router.push('/record/recording')`.
  - **Denied / no-device / insecure-context**: error card overlay. Headline "Camera access needed" (or specific reason), enable instructions, "Try again" button that re-runs `requestCameraAccess`.
- Cleanup: on unmount, if user navigated *away* (back to home, not to `/recording`), call `stream.getTracks().forEach(t => t.stop())` to release the camera.

### `/record/recording`

- Becomes a client component.
- On mount: read `window.__recordSession.stream`. If missing, redirect to `/record/camera`.
- Live preview: pipe the same stream into a `<video>` element matching the recording screen's dark-overlay design.
- `createRecorder(stream, mimeType)` → `recorder.start()` immediately.
- Elapsed time: `setInterval` every 100ms updating the "0:42" timer overlay.
- Hard cap: at 60_000ms, automatically `recorder.stop()`.
- Stop button (`<RecordButton state="recording" />`) → `recorder.stop()`.
- `recorder.stop()` resolves with `{ blob, durationMs, mimeType }`. Screen stores on `window.__recordSession.recording`, stops the live MediaStream tracks, `router.push('/record/processing')`.
- Pause button: visual no-op for Slice 1.
- Flip button: hidden on this screen (no flipping mid-recording).

### `/record/processing`

- Becomes a client component.
- On mount: read `window.__recordSession.recording`. If missing, redirect to `/record/camera`.
- `id = crypto.randomUUID()`; `ext` derived from `mimeType` (`.webm` or `.mp4`).
- `opfs.writeBlob(filename, blob)`.
- `memos.createDraft({ id, filename, mimeType, durationMs, sizeBytes, createdAt: Date.now(), updatedAt: Date.now(), title: "", notes: "", tags: [], status: "draft" })`.
- The pulsing-orb visual stays — it's now a real loading state during the write.
- On success: clear `window.__recordSession.recording`, `router.replace('/record/review?id=${id}')`.
- Scaffold's "Continue" link removed — navigation is automatic on success.
- On error (OPFS or IDB): show error card on the same screen, "Couldn't save your memo", with "Try again" (retries) and "Discard" (clears state, → `/home`). Quota-exceeded errors get a specific message: "Your device is out of space. Free up some room and try again."

### `/record/review`

- Becomes a client component using `useRecordSession()`.
- Reads `?id`, loads draft. If not found OR `status === "final"`, redirect to `/home`.
- Big play+waveform card → `<video controls src={blobUrl} />`. `blobUrl` from `useBlobUrl(opfs.readBlob(memo.filename))`.
- Transcript/encouragement cards stay static.
- "Save Memo" → `/record/add-notes?id=${id}`.
- "Start over" → `memos.deleteMemo(id)` + `opfs.deleteFile(memo.filename)` → `/record/camera`.

### `/record/add-notes`

- Becomes a client component using `useRecordSession()`.
- Reads `?id`, loads draft.
- Thumbnail block + processing indicator removed (no real image; processing already done).
- Notes Textarea + title field become controlled inputs bound to local state.
- **No mood chips** (the actual design has none on this screen).
- **Tags input deferred** (no UI in design; `tags: []` for every memo in Slice 1).
- "Continue" → `memos.finalizeDraft(id, { title: titleInput.trim() || `Memo · ${formatClockTime(memo.createdAt)}`, notes: notesInput, tags: [] })` → broadcast `memo-finalized` → `router.push('/record/saved')`.
- "Maybe later" → same finalize call with empty title/notes → `/record/saved`.

### `/record/saved`

- No data dependency. Stays as-is from Task 34.
- "Done" → `/home`.

---

## Edge cases & failure modes

1. **OPFS unsupported.** `isOpfsSupported()` runs once at module load. If false, `/record/camera` blocks with a "Your browser doesn't support local storage for video. Please update or use Chrome/Safari/Firefox." card. Memo tab still works (always empty).
2. **`getUserMedia` not available** (insecure context, ancient browser). Same as denied permission. Error card with specific reason from the normalized result type.
3. **Mid-recording errors** (camera disconnected, OS revoked permission, MediaRecorder `error` event). Recording screen catches, navigates to `/record/camera` with an inline error toast. MediaStream stopped. No partial data persisted.
4. **OPFS write fails** (disk full, quota exceeded). `/record/processing` catches and shows the "Couldn't save your memo" card with retry/discard. Quota errors get the specific copy.
5. **IDB write succeeds, OPFS write succeeded, but blob got corrupted.** Out of scope — assume IDB and OPFS are atomic per-call.
6. **IDB write fails after OPFS write.** OPFS file is orphaned. Cleanup pass on next startup deletes any OPFS file with no matching IDB row. User sees the same error card.
7. **User refreshes / backgrounds tab mid-flow.** `window.__recordSession` clears. Next screen redirects to `/record/camera`. Worst case: lost in-progress recording. Loss window: ~100ms between stop and OPFS write. Acceptable.
8. **Orphaned drafts** (user records, gets to review or add-notes, quits without finalizing). On every app startup, `cleanupOrphanedDrafts()` deletes any memo with `status: "draft" && createdAt < (Date.now() - 24h)`. Both IDB row and OPFS file. 24h window.
9. **Blob URL leaks.** Every `URL.createObjectURL()` matched by `URL.revokeObjectURL()` via `useBlobUrl` hook. No screen calls `createObjectURL` directly.
10. **Multiple tabs.** IDB transactions handle locking. OPFS file writes are atomic per UUID. No corruption. Cross-tab live updates via `BroadcastChannel('dear-me-memos')` — `useMemoList` listens for `memo-finalized` events.

---

## Done criteria

- A user can: open the app on a real mobile device → tap Record on home → grant camera+mic → record a 5-second video → see real playback on review → add a title/note → save → see the memo on the Memo tab → tap it → see the detail screen with real metadata → tap to play → real video plays.
- Above works on both Chrome (Android) and Safari (iOS 17+).
- Refreshing mid-flow loses the in-progress recording but doesn't crash; user sent back to camera.
- After 0 recordings, Memo tab shows the existing empty state.
- After ≥1 final memo, Memo tab shows real cards (no mock fallback).
- Recording past 60 seconds auto-stops and proceeds to processing.
- Permission denied shows the error card with retry.
- Cross-tab updates work: recording in one tab is visible in another tab's Memo list within ~100ms (via BroadcastChannel).
- `bun run build && bun run lint` clean.
- All static screens (insights, transcript, trigger, progress, /memo filters, mood tags) remain visually identical to Slice 0.
- Existing routes from Slice 0 still render; nothing broken in passing.

## What's NOT done criteria

- Cross-browser file portability
- Search actually filtering
- Streak data
- Insights chat functionality
- Pixel-perfect timing precision on the duration counter
- Pause/resume during recording
- Tests
