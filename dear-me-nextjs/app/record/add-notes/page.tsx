"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Type } from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRecordSession } from "@/lib/hooks/useRecordSession";
import { formatClockTime, formatDuration } from "@/lib/format/time";

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

  const memo = state.memo;

  async function handleSave() {
    if (submitting) return;
    setSubmitting(true);
    const finalTitle = title.trim() || `Memo · ${formatClockTime(memo.createdAt)}`;
    try {
      await finalize({ title: finalTitle, notes, tags: [] });
      router.push("/record/saved");
    } catch (err) {
      console.error("[dear-me] finalize failed", err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader backHref={`/record/review?id=${id}`} title="" />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-0">
        <div className="flex flex-col gap-1 px-1">
          <h1
            className="text-[26px] font-bold leading-tight text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Add Notes
          </h1>
          <p
            className="text-[14px] text-[#5C6B3AAA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Anything you&apos;d tell your future self?
          </p>
        </div>

        <div
          className="relative flex h-[88px] items-center gap-3 rounded-[16px] border px-4"
          style={{
            background: "rgba(138,154,91,0.071)",
            borderColor: "rgba(138,154,91,0.125)",
          }}
          aria-label="Memo summary"
        >
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-[12px] bg-black/80 text-[11px] font-semibold text-white"
          >
            {formatDuration(memo.durationMs)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[13px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              {`Memo · ${formatClockTime(memo.createdAt)}`}
            </span>
            <span
              className="text-[11px] text-[#6B7A48AA]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Captured just now
            </span>
          </div>
        </div>

        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <label
            htmlFor="notes-input"
            className="text-[14px] font-semibold text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            A note for future you
          </label>
          <Textarea
            id="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember? (optional)"
            className="
              min-h-[120px] resize-none
              border-[color:var(--color-glass-border)]
              bg-[var(--color-glass-surface)]
              shadow-[var(--shadow-glass)]
              backdrop-blur
              text-[14px] leading-relaxed
            "
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          />
        </GlassCard>

        <div
          className="flex h-11 items-center gap-2 rounded-[12px] border px-3.5"
          style={{
            background: "rgba(138,154,91,0.071)",
            borderColor: "rgba(138,154,91,0.125)",
          }}
        >
          <Type className="size-4 shrink-0 text-[#5C6B3AAA]" aria-hidden />
          <Input
            id="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title (optional)"
            className="border-0 bg-transparent p-0 text-[14px] text-[#2C331EDD] shadow-none focus-visible:ring-0"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] transition-opacity active:opacity-80 disabled:opacity-60"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          {submitting ? "Saving…" : "Continue"}
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="text-center text-[13px] text-[#6B7A48AA] transition-opacity active:opacity-60"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
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
