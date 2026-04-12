import Link from "next/link";
import { FileText, Heart, Play, Sparkles } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default async function PlaybackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Playing" backHref={`/memo/${id}`} />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        {/* Waveform + controls */}
        <GlassCard padding="lg" className="flex flex-col gap-5">
          {/* Static waveform bars */}
          <div className="flex h-24 items-end justify-center gap-[3px]">
            {[
              8, 14, 22, 18, 30, 38, 28, 42, 34, 26, 36, 44, 32, 24, 38, 28,
              22, 34, 42, 36, 28, 20, 16, 24, 18, 12, 20, 14, 10, 8,
            ].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-[var(--color-primary)]/70"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>

          {/* Scrubber */}
          <div className="flex flex-col gap-2">
            <div className="h-1 w-full rounded-full bg-[var(--color-muted)]">
              <div className="h-full w-1/3 rounded-full bg-[var(--color-primary)]" />
            </div>
            <div className="flex justify-between text-xs text-[color:var(--color-muted-foreground)]">
              <span>0:14</span>
              <span>0:42</span>
            </div>
          </div>

          {/* Play / pause */}
          <button
            type="button"
            aria-label="Play"
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]"
          >
            <Play className="size-6 translate-x-[2px]" fill="currentColor" />
          </button>
        </GlassCard>

        {/* Transcript preview */}
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#5C6B3AFF]" />
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
                Transcript
              </p>
            </div>
            <Link
              href={`/transcript/${id}`}
              className="flex items-center gap-1 text-xs font-semibold text-[color:var(--color-primary)]"
            >
              View full
            </Link>
          </div>
          <p className="text-sm leading-[1.55] text-[#4D5A35FF]">
            &ldquo;I remember feeling like everything was piling up... but it
            worked out. I just had to take it one day at a time.&rdquo;
          </p>
        </GlassCard>

        {/* Encouragement card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-encouragement-border)] bg-[var(--color-encouragement-bg)] px-[18px] py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-[18px] text-[#6B7A48CC]" />
            <p className="text-[13px] font-semibold text-[color:var(--color-muted-foreground)]">
              A gentle reminder
            </p>
          </div>
          <p className="text-sm italic leading-[1.5] text-[#5C6B3ADD]">
            You found your calm that day. The heaviness you feel now — you&apos;ve
            carried it before, and you always find your way back.
          </p>
        </div>

        {/* "I needed this" CTA */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-[10px] rounded-2xl bg-[var(--color-primary)] px-8 py-[14px] text-[15px] font-semibold text-white shadow-[var(--shadow-floating)] backdrop-blur"
        >
          <Heart className="size-[18px]" fill="currentColor" />
          I needed this
        </button>
      </div>
    </div>
  );
}
