"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
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

  if (memo === undefined) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-[14px] p-3",
          "bg-white/63 backdrop-blur-[20px]",
          "border border-[#8A9A5B20]",
          "shadow-[0_2px_8px_#00000012]",
          className,
        )}
      >
        <div className="size-[72px] shrink-0 animate-pulse rounded-xl bg-[#8A9A5B20]" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-[#8A9A5B20]" />
          <div className="h-3 w-full animate-pulse rounded bg-[#8A9A5B15]" />
        </div>
      </div>
    );
  }

  if (memo === null) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-[14px] p-3",
          "bg-white/63 backdrop-blur-[20px]",
          "border border-[#8A9A5B20]",
          className,
        )}
      >
        <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[#8A9A5B15]">
          <Leaf className="size-5 text-[#5C6B3A55]" />
        </div>
        <p className="text-[12px] italic text-[#6B7A48AA]">
          This memo is no longer available.
        </p>
      </div>
    );
  }

  const firstMood = memo.moods?.[0];

  return (
    <Link
      href={`/memo/${memo.id}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] p-3",
        "bg-white/63 backdrop-blur-[20px]",
        "border border-[#8A9A5B20]",
        "shadow-[0_2px_8px_#00000012]",
        "transition-opacity active:opacity-80",
        className,
      )}
    >
      <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[#8A9A5B20]">
        <Leaf className="size-5 text-[#5C6B3A88]" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-[#2C331EDD]">
            {formatClockTime(memo.createdAt)}
          </span>
          <span className="text-[12px] text-[#6B7A48AA]">·</span>
          <span className="text-[11px] text-[#6B7A48FF]">
            {formatRelativeTime(memo.createdAt)}
          </span>
          {firstMood && (
            <>
              <span className="text-[12px] text-[#6B7A48AA]">·</span>
              <span className="text-[11px] capitalize text-[#5C6B3AEE]">
                {firstMood}
              </span>
            </>
          )}
        </div>
        <p className="line-clamp-2 text-[12px] leading-[1.45] text-[#4D5A35FF]">
          {snippet(memo.transcript)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[#6B7A48AA]" />
    </Link>
  );
}
