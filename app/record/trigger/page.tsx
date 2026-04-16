import Link from "next/link";
import { Play } from "lucide-react";
import { BackPill } from "@/components/dear-me/back-pill";
import { GlassCard } from "@/components/dear-me/glass-card";
import { PrivacyNote } from "@/components/dear-me/privacy-note";

/**
 * Record Trigger screen — "Memo Trigger v2" (BJyMw)
 *
 * PARKED 2026-04-14: not linked from any flow. Bring back as a post-analysis
 * interstitial once we can (1) detect a heavy mood from the just-finished
 * memo's analyzer output, (2) query a real past memo with overlapping moods,
 * and (3) wire the CTA to actually play that memo instead of re-recording.
 *
 * Route: /record/trigger
 * Layout: record/layout.tsx provides ScreenBackground
 */
export default function RecordTriggerPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-6 pb-10">
      {/* Back pill — top-left */}
      <div className="flex justify-start">
        <BackPill href="/" />
      </div>

      {/* Hero content — vertically centered */}
      <div className="flex flex-1 flex-col items-center justify-center gap-9 text-center">
        {/* Emotional copy */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-bold leading-snug text-foreground">
            Hey, it sounds like things are heavy right now.
          </h1>
          <p className="text-[length:var(--text-body)] font-medium leading-snug text-foreground/80">
            You&apos;ve been here before.
          </p>
        </div>

        {/* Past-memo glass card */}
        <GlassCard className="w-full max-w-sm text-left" padding="sm">
          {/* Thumbnail placeholder */}
          <div className="relative mb-3.5 h-[180px] w-full overflow-hidden rounded-2xl bg-[color:var(--color-primary)]/15">
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-b from-transparent to-black/27 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/80">
                <Play className="size-5 fill-foreground text-foreground" />
              </div>
            </div>
          </div>

          {/* Meta row */}
          <p className="mb-3 text-[length:var(--text-small)] font-medium text-[color:var(--color-muted-foreground)]">
            You, 2 weeks ago
          </p>

          {/* Listen CTA */}
          <Link
            href="/record/recording"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-medium text-[color:var(--color-primary-foreground)] backdrop-blur-md transition-opacity hover:opacity-90 active:opacity-75"
          >
            <Play className="size-4 fill-white" aria-hidden />
            Listen to yourself then
          </Link>
        </GlassCard>

        {/* Skip link */}
        <Link
          href="/"
          className="text-sm font-medium text-[color:var(--color-muted-foreground)] transition-opacity hover:opacity-80"
        >
          Not now
        </Link>
      </div>

      {/* Privacy note — pinned to bottom */}
      <div className="flex justify-center">
        <PrivacyNote />
      </div>
    </div>
  );
}
