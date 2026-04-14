"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Type } from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { formatClockTime, formatDuration } from "@/lib/format/time";
import { readBlob } from "@/lib/db/opfs";
import { setAnalysisStatus, setTranscriptStatus } from "@/lib/db/memos";
import { transcribeBlob } from "@/lib/transcription/transcribe";
import { analyzeTranscript } from "@/lib/analysis/analyze";

function AddNotesContent() {
  const router = useRouter();
  const { state, update, id } = useRecordSession();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // True once the user has actively edited the title input. While this is
  // false we mirror the analyzer's suggested title into the input so the
  // user sees a live default. As soon as they type (or backspace), we lock
  // the input to their value.
  const titleDirtyRef = useRef(false);
  const transcribeStartedRef = useRef(false);

  useEffect(() => {
    if (state.status !== "ready") return;
    if (transcribeStartedRef.current) return;
    if (state.memo.transcriptStatus === "ready") return;
    if (state.memo.transcriptStatus === "pending") return;
    transcribeStartedRef.current = true;
    const memo = state.memo;
    (async () => {
      let transcript: string | null = null;
      try {
        await setTranscriptStatus(memo.id, "pending");
        const blob = await readBlob(memo.filename);
        const result = await transcribeBlob(blob, memo.filename);
        if (result.ok) {
          transcript = result.text;
          await setTranscriptStatus(memo.id, "ready", { transcript: result.text });
        } else {
          await setTranscriptStatus(memo.id, "failed", {
            transcriptError: result.error,
          });
          console.error("[dear-me] transcription failed", result.error);
        }
      } catch (err) {
        console.error("[dear-me] transcription threw", err);
        try {
          await setTranscriptStatus(memo.id, "failed", {
            transcriptError: (err as Error).message,
          });
        } catch {}
      }

      if (transcript === null) return;

      try {
        await setAnalysisStatus(memo.id, "pending");
        const analysis = await analyzeTranscript(transcript);
        if (analysis.ok) {
          await setAnalysisStatus(memo.id, "ready", {
            moods: analysis.moods,
            tags: analysis.tags,
            suggestedTitle: analysis.suggestedTitle,
          });
        } else {
          await setAnalysisStatus(memo.id, "failed", {
            analysisError: analysis.error,
          });
          console.error("[dear-me] analysis failed", analysis.error);
        }
      } catch (err) {
        console.error("[dear-me] analysis threw", err);
        try {
          await setAnalysisStatus(memo.id, "failed", {
            analysisError: (err as Error).message,
          });
        } catch {}
      }
    })();
  }, [state]);

  // Mirror the analyzer's suggested title into the input whenever a newer
  // one arrives, so long as the user hasn't started typing their own.
  useEffect(() => {
    if (state.status !== "ready") return;
    if (titleDirtyRef.current) return;
    const suggested = state.memo.suggestedTitle ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle((prev) => (prev === suggested ? prev : suggested));
  }, [state]);

  useEffect(() => {
    if (state.status === "not-found") {
      router.replace("/");
    } else if (state.status === "ready" && state.memo.status === "final") {
      router.replace(`/memo/${state.memo.id}`);
    }
  }, [state, router]);

  if (state.status === "loading" || state.status === "not-found") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (state.memo.status === "final") {
    return null;
  }

  const memo = state.memo;

  async function handleContinue() {
    if (submitting) return;
    setSubmitting(true);
    const finalTitle =
      title.trim() ||
      memo.suggestedTitle?.trim() ||
      `Memo · ${formatClockTime(memo.createdAt)}`;
    try {
      await update({ title: finalTitle, notes });
      router.push(`/record/review?id=${id}`);
    } catch (err) {
      console.error("[dear-me] updateDraft failed", err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader backHref={`/record/review?id=${id}`} title="" />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-0">
        <div className="flex flex-col gap-1 px-1">
          <h1 className="text-[length:var(--text-title)] font-bold leading-tight text-foreground">
            Add Notes
          </h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Anything you&apos;d tell your future self?
          </p>
        </div>

        <div
          className="relative flex h-[88px] items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-mood-chip-border)] bg-[color:var(--color-mood-chip-bg)] px-4"
          aria-label="Memo summary"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-black/80 text-[length:var(--text-caption)] font-semibold text-white">
            {formatDuration(memo.durationMs)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[length:var(--text-small)] font-semibold text-foreground">
              {`Memo · ${formatClockTime(memo.createdAt)}`}
            </span>
            <span className="text-[length:var(--text-caption)] text-[color:var(--color-muted-foreground)]">
              Captured just now
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 pt-1">
          <label
            htmlFor="notes-input"
            className="font-[family-name:var(--font-display)] text-[length:var(--text-body)] italic text-[color:var(--color-muted-foreground)]"
          >
            What did you want to tell your future self?
          </label>
          <Textarea
            id="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start writing…"
            className="
              min-h-[140px] resize-none
              rounded-none border-0 border-b border-[color:var(--color-mood-chip-border)]
              bg-transparent
              px-0 py-3
              text-base leading-loose text-foreground
              placeholder:italic placeholder:text-[color:var(--color-muted-foreground)]/60
              shadow-none
              focus-visible:border-[color:var(--color-primary)]/50 focus-visible:ring-0
            "
          />
        </div>

        <div className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-mood-chip-border)] bg-[color:var(--color-mood-chip-bg)] px-3.5">
          <Type className="size-4 shrink-0 text-[color:var(--color-muted-foreground)]" aria-hidden />
          <Input
            id="title-input"
            value={title}
            onChange={(e) => {
              titleDirtyRef.current = true;
              setTitle(e.target.value);
            }}
            placeholder={
              memo.analysisStatus === "ready"
                ? "Add a title (optional)"
                : "Writing a title for you…"
            }
            className="border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Continue"}
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="text-center text-[length:var(--text-small)] text-[color:var(--color-muted-foreground)] transition-opacity active:opacity-60"
        >
          Maybe later
        </button>
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
