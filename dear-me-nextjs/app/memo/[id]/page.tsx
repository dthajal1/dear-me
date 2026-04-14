"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Leaf, Sparkles, Trash2, Play } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { MoodTagsEditor } from "@/components/dear-me/mood-tags-editor";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMemo, updateMoodsAndTags } from "@/lib/db/memos";
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
          <p className="text-base font-semibold text-foreground">Memo not found</p>
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
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-foreground">{memo.title}</h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {formatRelativeTime(memo.createdAt)} · {formatDuration(memo.durationMs)}
          </p>
        </header>

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
                <Play className="size-6 translate-x-[2px] text-white" fill="currentColor" />
              </div>
            </div>
          </div>
        </Link>

        <MoodTagsEditor
          moods={memo.moods ?? []}
          tags={memo.tags}
          onChange={(next) => {
            setMemo({ ...memo, moods: next.moods, tags: next.tags });
            void updateMoodsAndTags(memo.id, next).catch((err) => {
              console.error("[dear-me] updateMoodsAndTags failed", err);
            });
          }}
        />

        {memo.notes.trim().length > 0 && (
          <GlassCard className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-muted-foreground)]">
              <Leaf className="size-3.5" />
              Your note
            </p>
            <p className="text-sm leading-relaxed text-foreground">{memo.notes}</p>
          </GlassCard>
        )}

        <Drawer>
          <GlassCard className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
                <FileText className="size-3.5" />
                Transcript
              </p>
              {memo.transcriptStatus === "ready" && memo.transcript && (
                <DrawerTrigger className="text-xs font-semibold text-[color:var(--color-primary)] transition-opacity active:opacity-60">
                  View full
                </DrawerTrigger>
              )}
            </div>
            {memo.transcriptStatus === "ready" && memo.transcript ? (
              <p className="line-clamp-4 text-sm leading-relaxed text-foreground">
                {memo.transcript}
              </p>
            ) : memo.transcriptStatus === "failed" ? (
              <p className="text-sm leading-relaxed text-[#B44]">
                Couldn&apos;t transcribe this memo.
                {memo.transcriptError ? ` ${memo.transcriptError}` : ""}
              </p>
            ) : (
              <p className="text-sm italic leading-relaxed text-[color:var(--color-muted-foreground)]">
                {memo.transcriptStatus === "pending"
                  ? "Transcribing…"
                  : "No transcript available."}
              </p>
            )}
          </GlassCard>

          <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[430px] bg-[var(--color-glass-surface)] backdrop-blur-xl">
            <DrawerHeader className="px-6 pt-2">
              <DrawerTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#2C331EDD]">
                <FileText className="size-4 text-[#5C6B3ABB]" />
                Transcript
              </DrawerTitle>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
                {formatDuration(memo.durationMs)} recording
              </p>
            </DrawerHeader>
            <ScrollArea className="max-h-[60vh] px-6 pb-8">
              <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#4D5A35FF]">
                {memo.transcript}
              </p>
            </ScrollArea>
          </DrawerContent>
        </Drawer>

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
