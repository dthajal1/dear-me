"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { GlassCard } from "@/components/dear-me/glass-card";
import { MoodChip } from "@/components/dear-me/mood-chip";
import { PrivacyNote } from "@/components/dear-me/privacy-note";
import { EmptyState } from "@/components/dear-me/empty-state";
import { createCheckIn, getTodayCheckIns } from "@/lib/db/checkIns";

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
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getTodayCheckIns().then((entries) => {
      if (cancelled) return;
      if (entries.length > 0) {
        setSelectedMood(entries[0].mood);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMoodTap(mood: string) {
    setSelectedMood(mood);
    setJustCheckedIn(true);
    try {
      await createCheckIn({ mood, source: "chip" });
    } catch (err) {
      console.error("[dear-me] check-in failed", err);
    }
  }

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
      <section aria-labelledby="quick-checkin-heading" className="flex flex-col gap-3">
        <h2 id="quick-checkin-heading" className="text-[13px] font-semibold text-foreground/70">
          Quick check-in
        </h2>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <MoodChip
              key={m.label}
              emoji={m.emoji}
              label={m.label}
              selected={selectedMood === m.label}
              onClick={() => void handleMoodTap(m.label)}
            />
          ))}
        </div>
        {justCheckedIn ? (
          <p
            className="animate-in fade-in text-center text-[11px] text-[color:var(--color-muted-foreground)]"
            role="status"
            aria-live="polite"
          >
            Checked in just now
          </p>
        ) : null}
      </section>

      {/* Start Recording Card — big hero CTA */}
      <Link href="/record/camera" className="block">
        <GlassCard className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full text-[color:var(--color-primary)]">
            <Video className="size-8" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Record a Memo
            </h2>
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
