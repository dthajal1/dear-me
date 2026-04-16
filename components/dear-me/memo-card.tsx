"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassSurfaceClasses } from "@/components/dear-me/glass-card";
import { readBlob, writeBlob } from "@/lib/db/opfs";
import { useBlobUrl } from "@/lib/hooks/useBlobUrl";
import { extractVideoThumbnail } from "@/lib/recording/thumbnail";
import { setThumbnailFilename } from "@/lib/db/memos";

interface MemoCardProps {
  memoId?: string;
  videoFilename?: string;
  title: string;
  preview: string;
  duration: string;  // e.g. "2:34"
  timestamp: string; // e.g. "2h ago" or "Yesterday"
  mood?: string;     // emoji or text label
  href: string;
  thumbnailFilename?: string;
  className?: string;
}

/**
 * A memo list row matching the Memo tab cards in design.pen.
 *
 * Design spec (from design.pen Memo Card 1, node 0CSqr):
 *   - Card: padding 12px all sides, gap 12px, cornerRadius 16px
 *   - Fill: #FFFFFFA0 (glass surface), border #8A9A5B28, backdrop-blur
 *   - Left: 90×110px thumbnail. When a thumbnailFilename is present we load
 *     the JPEG out of OPFS and render it as a cover-fit image; otherwise
 *     we fall back to a waveform placeholder. Either way, the play button
 *     pill is overlaid on top.
 *   - Play button: 28×28px circle, fill #5C6B3ABB, play icon 14px white
 *   - Right column: vertical, gap 8px
 *     - Top row: title (14px/600/#2C331EDD) + duration badge with timer icon
 *       (12px/500/#5C6B3AAA, cornerRadius 8, fill #8A9A5B12, padding [4,10])
 *     - Preview text: 12px/normal/#4D5A35, lineHeight 1.5
 *     - Mood chip: 10px/500/#5C6B3AAA, cornerRadius 20, fill #8A9A5B15
 *     - Timestamp shown as secondary caption below preview
 *
 * The whole card is a <Link> so the entire row is tappable.
 */
export function MemoCard({
  memoId,
  videoFilename,
  title,
  preview,
  duration,
  timestamp,
  mood,
  href,
  thumbnailFilename,
  className,
}: MemoCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        glassSurfaceClasses,
        "flex items-stretch gap-3 p-3",
        "transition-colors hover:bg-[color-mix(in_srgb,var(--color-glass-surface)_90%,var(--color-primary)_10%)]",
        className,
      )}
    >
      {/* Thumbnail with play button overlay */}
      <div className="relative h-[110px] w-[90px] shrink-0 overflow-hidden rounded-xl">
        <MemoCardThumbnail
          memoId={memoId}
          videoFilename={videoFilename}
          filename={thumbnailFilename}
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-7 items-center justify-center rounded-full bg-[color:var(--color-primary)]">
            <Play
              className="size-3.5 translate-x-[1px] text-white"
              fill="currentColor"
            />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Top row: title + duration badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[color:var(--color-muted)] px-2.5 py-1">
            <Timer className="size-3.5 text-[color:var(--color-muted-foreground)]" />
            <span className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
              {duration}
            </span>
          </div>
        </div>

        {/* Preview text */}
        <p className="line-clamp-2 text-xs leading-relaxed text-foreground/80">
          {preview}
        </p>

        {/* Bottom row: mood chip + timestamp */}
        <div className="mt-auto flex items-center justify-between">
          {mood ? (
            <div className="flex items-center rounded-full border border-[color:var(--color-glass-border)] bg-[color:var(--color-muted)] px-2.5 py-1">
              <span className="text-[10px] font-medium text-[color:var(--color-muted-foreground)]">
                {mood}
              </span>
            </div>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-[color:var(--color-muted-foreground)]">
            {timestamp}
          </span>
        </div>
      </div>
    </Link>
  );
}

function WaveformPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[2px] bg-[color:var(--color-mood-chip-bg)] px-2 pb-3">
      {[18, 32, 48, 36, 54, 40, 26, 44, 30, 20].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-[color:var(--color-primary)]/35"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

function MemoCardThumbnail({
  memoId,
  videoFilename,
  filename,
}: {
  memoId?: string;
  videoFilename?: string;
  filename?: string;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const url = useBlobUrl(blob);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlob(null);

    async function load() {
      setFailed(false);
      // Try the persisted thumbnail first. If the file is missing on disk
      // (e.g. cleanupOrphanedDrafts deleted it), fall through to backfill
      // instead of giving up — the IDB row still points at a stale name.
      if (filename) {
        try {
          const b = await readBlob(filename);
          if (!cancelled) setBlob(b);
          return;
        } catch (err) {
          console.warn(
            "[dear-me] thumbnail file missing, will re-extract",
            err,
          );
        }
      }
      if (!memoId || !videoFilename) {
        if (!cancelled) setFailed(true);
        return;
      }
      try {
        const video = await readBlob(videoFilename);
        const thumb = await extractVideoThumbnail(video);
        const newName = `thumb-${memoId}.jpg`;
        await writeBlob(newName, thumb);
        await setThumbnailFilename(memoId, newName);
        if (!cancelled) setBlob(thumb);
      } catch (err) {
        console.error("[dear-me] failed to backfill memo thumbnail", err);
        if (!cancelled) setFailed(true);
      }
    }
    void load();

    return () => {
      cancelled = true;
    };
  }, [filename, memoId, videoFilename]);

  if (failed || !url) {
    // Loading or fallback: keep the waveform placeholder visible so the
    // card never flashes an empty box while the OPFS read resolves.
    return <WaveformPlaceholder />;
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
