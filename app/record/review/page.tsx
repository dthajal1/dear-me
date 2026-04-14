"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle,
  FileText,
  Heart,
  Lock,
  PencilLine,
} from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { MoodTagsEditor } from "@/components/dear-me/mood-tags-editor";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { readBlob } from "@/lib/db/opfs";
import { deleteMemo } from "@/lib/db/memos";
import { formatDuration } from "@/lib/format/time";

const POLL_INTERVAL_MS = 1500;

function ReviewContent() {
  const router = useRouter();
  const { state, refresh, update, finalize, id } = useRecordSession();
  const [blob, setBlob] = useState<Blob | null>(null);
  const blobUrl = useBlobUrl(blob);
  const [submitting, setSubmitting] = useState(false);
  const [savedOverlay, setSavedOverlay] = useState(false);

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

  useEffect(() => {
    if (state.status !== "ready") return;
    const tStatus = state.memo.transcriptStatus;
    const aStatus = state.memo.analysisStatus;
    const transcriptPending = tStatus === undefined || tStatus === "pending";
    const analysisPending = aStatus === undefined || aStatus === "pending";
    if (!transcriptPending && !analysisPending) return;
    const timer = setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [state, refresh]);

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

  async function handleStartOver() {
    await deleteMemo(memo.id);
    router.replace("/record/camera");
  }

  async function handleSave() {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Defensive: if the user arrived here without typing a title (or
      // skipped add-notes entirely), backfill from the analyzer suggestion.
      if (!memo.title.trim() && memo.suggestedTitle?.trim()) {
        await update({ title: memo.suggestedTitle.trim() });
      }
      await finalize();
      // Show a brief confirmation before handing the user back to Home.
      // 800ms matches the spec — long enough to register, short enough
      // not to feel like a blocking screen.
      setSavedOverlay(true);
      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (err) {
      console.error("[dear-me] finalize failed", err);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {savedOverlay ? (
        <div
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-background)]/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]">
              <Check className="size-7" strokeWidth={2.5} aria-hidden />
            </div>
            <p className="text-[length:var(--text-body)] font-semibold text-foreground">
              Memo saved
            </p>
          </div>
        </div>
      ) : null}
      <BackHeader backHref={`/record/add-notes?id=${id}`} title="" />

      <div className="flex flex-1 flex-col gap-4 px-5 pb-8 pt-0">
        <div className="flex flex-col gap-1 px-1">
          <h1 className="text-[length:var(--text-title)] font-bold leading-tight text-foreground">
            Review &amp; Save
          </h1>
          <p className="text-[length:var(--text-small)] text-[color:var(--color-muted-foreground)]">
            Here&apos;s what we captured
          </p>
        </div>

        <div
          className="relative h-56 w-full overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-glass-border)] bg-black"
          aria-label="Memo video thumbnail"
        >
          {blobUrl ? (
            <video
              src={blobUrl}
              controls
              playsInline
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-white/70">
              Loading playback…
            </div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1">
            <span className="size-2 rounded-full bg-[#E53E3E]" aria-hidden />
            <span className="text-[10px] font-bold text-white">REC</span>
          </div>

          <div className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1">
            <span className="text-[length:var(--text-caption)] font-semibold text-white">
              {formatDuration(memo.durationMs)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-encouragement-border)] bg-[color:var(--color-encouragement-bg)] px-3 py-2">
          <CheckCircle className="size-4 shrink-0 text-[color:var(--color-primary)]" aria-hidden />
          <p className="text-xs font-medium text-foreground/80">
            We heard you — here&apos;s what stood out
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Heart className="size-3.5 text-[color:var(--color-primary)]" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Moods &amp; tags
            </h2>
          </div>

          {memo.analysisStatus === "ready" ? (
            <MoodTagsEditor
              moods={memo.moods ?? []}
              tags={memo.tags}
              moodSources={memo.moodSources}
              onChange={(next) => {
                void update({
                  moods: next.moods,
                  tags: next.tags,
                  moodSources: next.moodSources,
                });
              }}
            />
          ) : memo.analysisStatus === "failed" ? (
            <p className="text-xs text-[#B44]">
              Couldn&apos;t analyze this memo.
              {memo.analysisError ? ` ${memo.analysisError}` : ""}
            </p>
          ) : (
            <p className="text-xs italic text-[color:var(--color-muted-foreground)]">
              {memo.transcriptStatus === "ready"
                ? "Analyzing…"
                : "Waiting for transcript…"}
            </p>
          )}
        </div>

        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-[color:var(--color-primary)]" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Transcript
            </h2>
          </div>
          {memo.transcriptStatus === "ready" && memo.transcript ? (
            <p className="text-[length:var(--text-small)] italic leading-relaxed text-foreground/80">
              &ldquo;{memo.transcript}&rdquo;
            </p>
          ) : memo.transcriptStatus === "failed" ? (
            <p className="text-[length:var(--text-small)] leading-relaxed text-[#B44]">
              Couldn&apos;t transcribe this memo. {memo.transcriptError ?? ""}
            </p>
          ) : (
            <p className="text-[length:var(--text-small)] italic leading-relaxed text-[color:var(--color-muted-foreground)]">
              Transcribing…
            </p>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <div className="flex items-center gap-1.5">
            <PencilLine className="size-3.5 text-[color:var(--color-primary)]" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Your note
            </h2>
          </div>
          {memo.notes ? (
            <p className="text-[length:var(--text-small)] leading-relaxed text-foreground/80">
              {memo.notes}
            </p>
          ) : (
            <p className="text-[length:var(--text-small)] italic leading-relaxed text-[color:var(--color-muted-foreground)]">
              No note yet — tap Edit to add one.
            </p>
          )}
          <Link
            href={`/record/add-notes?id=${id}`}
            className="text-[length:var(--text-small)] font-semibold text-[color:var(--color-primary)]"
          >
            Edit note
          </Link>
        </GlassCard>

        <div className="mt-2 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] transition-opacity active:opacity-80 disabled:opacity-60"
          >
            <CheckCircle className="size-4" aria-hidden />
            {submitting ? "Saving…" : "Save Memo"}
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="text-[length:var(--text-small)] font-medium text-[color:var(--color-muted-foreground)] transition-opacity active:opacity-60"
          >
            Start over
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <Lock className="size-3 text-[color:var(--color-privacy-note-fg)]" aria-hidden />
          <span className="text-[length:var(--text-caption)] text-[color:var(--color-privacy-note-fg)]">
            Only you can see these — always
          </span>
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
