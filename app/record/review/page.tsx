"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
      router.replace("/home");
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
      await finalize();
      router.push("/record/saved");
    } catch (err) {
      console.error("[dear-me] finalize failed", err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader backHref={`/record/add-notes?id=${id}`} title="" />

      <div className="flex flex-1 flex-col gap-4 px-5 pb-8 pt-0">
        <div className="flex flex-col gap-1 px-1">
          <h1
            className="text-[26px] font-bold leading-tight text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Review &amp; Save
          </h1>
          <p
            className="text-[13px] text-[#6B7A48AA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Here&apos;s what we captured
          </p>
        </div>

        <div
          className="relative h-56 w-full overflow-hidden rounded-[20px] border bg-black"
          style={{ borderColor: "rgba(138,154,91,0.125)" }}
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

          <div
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[6px] px-2 py-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span className="size-2 rounded-full bg-[#E53E3E]" aria-hidden />
            <span
              className="text-[10px] font-bold text-white"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              REC
            </span>
          </div>

          <div
            className="absolute right-3 top-3 rounded-[6px] px-2 py-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span
              className="text-[11px] font-semibold text-white"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              {formatDuration(memo.durationMs)}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-[10px] border px-3 py-2"
          style={{
            background: "rgba(92,107,58,0.082)",
            borderColor: "rgba(92,107,58,0.125)",
          }}
        >
          <CheckCircle className="size-4 shrink-0 text-[#5C6B3ABB]" aria-hidden />
          <p
            className="text-[12px] font-medium text-[#4D5A35FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            We heard you — here&apos;s what stood out
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Heart className="size-3.5 text-[#5C6B3ABB]" aria-hidden />
            <span
              className="text-[14px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Moods &amp; tags
            </span>
          </div>

          {memo.analysisStatus === "ready" ? (
            <MoodTagsEditor
              moods={memo.moods ?? []}
              tags={memo.tags}
              onChange={(next) => {
                void update({ moods: next.moods, tags: next.tags });
              }}
            />
          ) : memo.analysisStatus === "failed" ? (
            <p
              className="text-[12px] text-[#B44]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Couldn&apos;t analyze this memo.
              {memo.analysisError ? ` ${memo.analysisError}` : ""}
            </p>
          ) : (
            <p
              className="text-[12px] italic text-[#6B7A48AA]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              {memo.transcriptStatus === "ready"
                ? "Analyzing…"
                : "Waiting for transcript…"}
            </p>
          )}
        </div>

        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-[#5C6B3ABB]" aria-hidden />
            <span
              className="text-[14px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Transcript
            </span>
          </div>
          {memo.transcriptStatus === "ready" && memo.transcript ? (
            <p
              className="text-[13px] italic leading-relaxed text-[#4D5A35FF]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              &ldquo;{memo.transcript}&rdquo;
            </p>
          ) : memo.transcriptStatus === "failed" ? (
            <p
              className="text-[13px] leading-relaxed text-[#B44]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Couldn&apos;t transcribe this memo. {memo.transcriptError ?? ""}
            </p>
          ) : (
            <p
              className="text-[13px] italic leading-relaxed text-[#6B7A48AA]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Transcribing…
            </p>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <div className="flex items-center gap-1.5">
            <PencilLine className="size-3.5 text-[#5C6B3ABB]" aria-hidden />
            <span
              className="text-[14px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Your note
            </span>
          </div>
          <p
            className="text-[13px] leading-relaxed text-[#4D5A35FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            {memo.notes ||
              "Work has been a lot lately. Need to remember this feeling so I can appreciate when things get better."}
          </p>
          <Link
            href={`/record/add-notes?id=${id}`}
            className="text-[13px] font-semibold text-[#5C6B3AFF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
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
            className="text-[13px] font-medium text-[#6B7A48AA] transition-opacity active:opacity-60"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Start over
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <Lock className="size-3 text-[#8A9A5B55]" aria-hidden />
          <span
            className="text-[11px] text-[#8A9A5B55]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
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
