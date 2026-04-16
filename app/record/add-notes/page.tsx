"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/dear-me/back-header";
import { MemoStack } from "@/components/dear-me/memo-stack";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { readBlob } from "@/lib/db/opfs";
import {
  deleteMemo,
  setAnalysisStatus,
  setTranscriptStatus,
} from "@/lib/db/memos";
import { transcribeBlob } from "@/lib/transcription/transcribe";
import { analyzeTranscript } from "@/lib/analysis/analyze";

function AddNotesContent() {
  const router = useRouter();
  const { state, update, refresh, finalize } = useRecordSession();
  const [submitting, setSubmitting] = useState(false);
  const transcribeStartedRef = useRef(false);
  const savingRef = useRef(false);

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
      await refresh();

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
      await refresh();
    })();
  }, [state, refresh]);

  useEffect(() => {
    if (savingRef.current) return;
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
    savingRef.current = true;
    try {
      if (!memo.title.trim()) {
        const fallback = memo.suggestedTitle?.trim() || "Untitled";
        await update({ title: fallback });
      }
      const finalized = await finalize();
      router.replace("/");
      toast.success("Memo saved", {
        description: finalized.title,
        duration: 3500,
      });
    } catch (err) {
      console.error("[dear-me] finalize failed", err);
      savingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader backHref="/" title="" />

      <div className="flex flex-1 flex-col gap-6 px-5 pb-8 pt-0">
        <MemoStack
          memo={memo}
          mode="draft"
          onTitleSave={(next) => {
            void update({ title: next }).catch((err) => {
              console.error("[dear-me] update title failed", err);
            });
          }}
          onNoteSave={(next) => {
            void update({ notes: next }).catch((err) => {
              console.error("[dear-me] update note failed", err);
            });
          }}
          onMoodsChange={(next) => {
            void update({
              moods: next.moods,
              tags: next.tags,
              moodSources: next.moodSources,
            }).catch((err) => {
              console.error("[dear-me] update moods failed", err);
            });
          }}
        />

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
            className="text-[length:var(--text-small)] text-[color:var(--color-muted-foreground)] transition-opacity active:opacity-60"
          >
            Start over
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
