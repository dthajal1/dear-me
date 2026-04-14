import Link from "next/link";
import { Play } from "lucide-react";
import { BackPill } from "@/components/dear-me/back-pill";
import { GlassCard } from "@/components/dear-me/glass-card";
import { PrivacyNote } from "@/components/dear-me/privacy-note";

/**
 * Record Trigger screen — "Memo Trigger v2" (BJyMw)
 *
 * Shows an emotional prompt with a past memo card, nudging the user to
 * record by first listening to their past self.
 *
 * Route: /record/trigger
 * Layout: record/layout.tsx provides ScreenBackground
 */
export default function RecordTriggerPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-6 pb-10">
      {/* Back pill — top-left */}
      <div className="flex justify-start">
        <BackPill href="/home" />
      </div>

      {/* Hero content — vertically centered */}
      <div className="flex flex-1 flex-col items-center justify-center gap-9 text-center">
        {/* Emotional copy */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-bold leading-snug text-foreground">
            Hey, it sounds like things are heavy right now.
          </h1>
          <p className="text-[15px] font-medium leading-[1.4] text-[#4D5A35]">
            You&apos;ve been here before.
          </p>
        </div>

        {/* Past-memo glass card */}
        <GlassCard className="w-full max-w-sm text-left" padding="sm">
          {/* Thumbnail placeholder */}
          <div className="relative mb-3.5 h-[180px] w-full overflow-hidden rounded-2xl bg-[#D0DCC0]/60">
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-b from-transparent to-black/27 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/80">
                <Play className="size-5 fill-foreground text-foreground" />
              </div>
            </div>
          </div>

          {/* Meta row */}
          <p className="mb-3 text-[13px] font-medium text-[#6B7A48]">
            You, 2 weeks ago
          </p>

          {/* Listen CTA */}
          <Link
            href="/record/recording"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#5C6B3ABB] px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-opacity hover:opacity-90 active:opacity-75"
          >
            <Play className="size-4 fill-white" aria-hidden />
            Listen to yourself then
          </Link>
        </GlassCard>

        {/* Skip link */}
        <Link
          href="/home"
          className="text-[14px] font-medium text-[#5C6B3A]/53 transition-opacity hover:opacity-80"
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
