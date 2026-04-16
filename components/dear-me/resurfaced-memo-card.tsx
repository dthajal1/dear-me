"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import type { Memo } from "@/lib/db/schema";
import { readBlob } from "@/lib/db/opfs";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";

interface ResurfacedMemoCardProps {
  memo: Memo;
  label: string;
}

export function ResurfacedMemoCard({ memo, label }: ResurfacedMemoCardProps) {
  return (
    <Link
      href={`/memo/${memo.id}/playback`}
      className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-glass-border)] bg-[color:var(--color-glass-surface)] p-3 backdrop-blur transition-transform active:scale-[0.99]"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
        <Thumbnail filename={memo.thumbnailFilename} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-6 items-center justify-center rounded-full bg-[color:var(--color-primary)]">
            <Play
              className="size-3 translate-x-[1px] text-white"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {memo.title}
        </p>
      </div>
    </Link>
  );
}

function Thumbnail({ filename }: { filename?: string }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const url = useBlobUrl(blob);

  useEffect(() => {
    if (!filename) return;
    let cancelled = false;
    void readBlob(filename)
      .then((b) => {
        if (!cancelled) setBlob(b);
      })
      .catch((err) => {
        console.warn("[dear-me] resurfaced thumbnail missing", err);
      });
    return () => {
      cancelled = true;
    };
  }, [filename]);

  if (!url) {
    return <div className="size-full bg-[color:var(--color-mood-chip-bg)]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden
      className="size-full object-cover"
      draggable={false}
    />
  );
}
