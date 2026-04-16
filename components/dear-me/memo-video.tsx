"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

import { readBlob } from "@/lib/db/opfs";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { cn } from "@/lib/utils";

type MemoVideoProps = {
  filename: string;
  /** When set, renders as a Link with a play-button overlay. Otherwise renders inline native controls. */
  playbackHref?: string;
  /** Auto-play on mount. Ignored when playbackHref is set. */
  autoPlay?: boolean;
  className?: string;
};

export function MemoVideo({
  filename,
  playbackHref,
  autoPlay,
  className,
}: MemoVideoProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const blobUrl = useBlobUrl(blob);

  useEffect(() => {
    let cancelled = false;
    void readBlob(filename)
      .then((b) => {
        if (!cancelled) setBlob(b);
      })
      .catch((err) => {
        console.error("[dear-me] MemoVideo failed to read blob", err);
      });
    return () => {
      cancelled = true;
    };
  }, [filename]);

  const frame = (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-2xl bg-black",
        className,
      )}
    >
      {blobUrl ? (
        playbackHref ? (
          <video
            src={blobUrl}
            preload="metadata"
            playsInline
            muted
            className="size-full object-cover"
          />
        ) : (
          <video
            src={blobUrl}
            controls
            playsInline
            autoPlay={autoPlay}
            className="size-full object-cover"
          />
        )
      ) : (
        <div className="size-full" />
      )}
      {playbackHref ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/30 backdrop-blur-md">
            <Play
              className="size-6 translate-x-[2px] text-white"
              fill="currentColor"
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  if (playbackHref) {
    return (
      <Link href={playbackHref} className="block">
        {frame}
      </Link>
    );
  }
  return frame;
}
