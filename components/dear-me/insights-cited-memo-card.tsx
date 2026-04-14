"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassSurfaceClasses } from "@/components/dear-me/glass-card";
import { getMemo } from "@/lib/db/memos";
import { formatClockTime, formatRelativeTime } from "@/lib/format/time";
import type { Memo } from "@/lib/db/schema";

interface InsightsCitedMemoCardProps {
  memoId: string;
  className?: string;
}

const SNIPPET_MAX = 110;

function snippet(text: string | undefined): string {
  if (!text) return "No transcript available.";
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= SNIPPET_MAX) return `"${clean}"`;
  return `"${clean.slice(0, SNIPPET_MAX - 1)}…"`;
}

export function InsightsCitedMemoCard({
  memoId,
  className,
}: InsightsCitedMemoCardProps) {
  const [memo, setMemo] = useState<Memo | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const m = await getMemo(memoId);
        if (!cancelled) setMemo(m ?? null);
      } catch (err) {
        console.error("[dear-me] cited memo lookup failed", err);
        if (!cancelled) setMemo(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memoId]);

  const surfaceClasses = cn(
    glassSurfaceClasses,
    "flex w-full items-center gap-3 p-3",
  );

  if (memo === undefined) {
    return (
      <div className={cn(surfaceClasses, className)}>
        <div className="size-[72px] shrink-0 animate-pulse rounded-xl bg-[color:var(--color-glass-border)]" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--color-glass-border)]" />
          <div className="h-3 w-full animate-pulse rounded bg-[color:var(--color-muted)]" />
        </div>
      </div>
    );
  }

  if (memo === null) {
    return (
      <div className={cn(surfaceClasses, "shadow-none", className)}>
        <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-muted)]">
          <Leaf className="size-5 text-[color:var(--color-tab-icon-inactive)]" />
        </div>
        <p className="text-xs italic text-[color:var(--color-muted-foreground)]">
          This memo is no longer available.
        </p>
      </div>
    );
  }

  const firstMood = memo.moods?.[0];

  return (
    <Link
      href={`/memo/${memo.id}`}
      className={cn(surfaceClasses, "transition-opacity active:opacity-80", className)}
    >
      <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-glass-border)]">
        <Leaf className="size-5 text-[color:var(--color-primary)]/55" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            {formatClockTime(memo.createdAt)}
          </span>
          <span className="text-xs text-[color:var(--color-muted-foreground)]">·</span>
          <span className="text-[length:var(--text-caption)] text-[color:var(--color-accent)]">
            {formatRelativeTime(memo.createdAt)}
          </span>
          {firstMood && (
            <>
              <span className="text-xs text-[color:var(--color-muted-foreground)]">·</span>
              <span className="text-[length:var(--text-caption)] capitalize text-[color:var(--color-primary)]">
                {firstMood}
              </span>
            </>
          )}
        </div>
        <p className="line-clamp-2 text-xs leading-snug text-foreground/80">
          {snippet(memo.transcript)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[color:var(--color-muted-foreground)]" />
    </Link>
  );
}
