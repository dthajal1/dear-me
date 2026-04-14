import Link from "next/link";
import { Video } from "lucide-react";
import { GlassCard } from "@/components/dear-me/glass-card";
import { MoodChip } from "@/components/dear-me/mood-chip";
import { PrivacyNote } from "@/components/dear-me/privacy-note";
import { EmptyState } from "@/components/dear-me/empty-state";

// Toggle this to preview the empty state in dev.
const HAS_DATA = true;

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🤩", label: "Excited" },
];

export default function HomePage() {
  if (!HAS_DATA) {
    return (
      <EmptyState
        icon={<Video className="size-8" />}
        title="Dear Me"
        subtitle="Record video memos to your future self"
        cta={{ label: "Record a Memo", href: "/record/camera" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
          Good evening 👋
        </p>
        <h1 className="text-[28px] font-bold text-foreground">Dear Me</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          How are you feeling today?
        </p>
      </header>

      {/* Quick Mood */}
      <section className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold text-foreground/70">
          Quick check-in
        </p>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <MoodChip key={m.label} emoji={m.emoji} label={m.label} />
          ))}
        </div>
      </section>

      {/* Start Recording Card — big hero CTA */}
      <Link href="/record/camera" className="block">
        <GlassCard className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full text-[color:var(--color-primary)]">
            <Video className="size-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Record a Memo
            </p>
            <p className="mt-1 text-[13px] text-[color:var(--color-muted-foreground)]">
              A message to your future self
            </p>
          </div>
        </GlassCard>
      </Link>

      {/* Daily Prompt — quiet inspirational line, not a tappable surface */}
      <p className="px-1 text-center text-[13px] italic leading-relaxed text-[color:var(--color-muted-foreground)]/70">
        Not sure what to say? Try: “What are you grateful for right now?”
      </p>

      {/* Privacy note */}
      <div className="flex justify-center">
        <PrivacyNote />
      </div>
    </div>
  );
}
