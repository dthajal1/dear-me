"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
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
