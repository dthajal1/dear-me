import { ScreenBackground } from "@/components/dear-me/screen-background";
import { BackPill } from "@/components/dear-me/back-pill";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { EmptyState } from "@/components/dear-me/empty-state";
import { MoodChip } from "@/components/dear-me/mood-chip";
import { FilterPill } from "@/components/dear-me/filter-pill";
import { ChatInput } from "@/components/dear-me/chat-input";
import { Bookmark, MessageCircleHeart } from "lucide-react";

export default function Sandbox() {
  return (
    <div className="relative flex min-h-dvh flex-col gap-6 p-6">
      <ScreenBackground />
      <h1 className="text-2xl font-semibold">Sandbox</h1>

      {/* ScreenBackground proof: translucent card shows gradient beneath */}
      <div className="rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-glass)] backdrop-blur">
        <p className="text-sm font-medium">ScreenBackground preview</p>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
          You should see a soft olive gradient behind this card, matching the Home frame in design.pen.
        </p>
      </div>

      {/* ── BackPill + BackHeader previews ── */}
      <div className="flex flex-col gap-6">

        {/* BackPill — icon only */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackPill — icon only</p>
          <BackPill />
        </div>

        {/* BackPill — label + link */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackPill — label + link</p>
          <BackPill label="Back" href="/home" />
        </div>

        {/* BackHeader — no right slot */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackHeader — centered title, no right slot</p>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-card)] shadow-[var(--shadow-glass)] backdrop-blur overflow-hidden">
            <BackHeader title="Preview" backHref="/home" />
          </div>
        </div>

        {/* BackHeader — with right slot */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackHeader — centered title + right slot</p>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-card)] shadow-[var(--shadow-glass)] backdrop-blur overflow-hidden">
            <BackHeader
              title="Preview"
              rightSlot={
                <button className="text-sm font-medium text-foreground">Share</button>
              }
            />
          </div>
        </div>

      </div>

      {/* ── GlassCard variants ── */}
      <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">GlassCard variants</p>
      <div className="flex flex-col gap-4">

        <GlassCard padding="sm">
          <p className="text-sm font-medium">Small GlassCard</p>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Compact padding — used for chips, mini-stats, etc.
          </p>
        </GlassCard>

        <GlassCard padding="lg">
          <h2 className="text-base font-semibold">Large GlassCard</h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            Spacious padding — used for hero cards like Start Recording, Daily Prompt, transcripts.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-[var(--color-mood-chip-bg)] px-3 py-1 text-xs">
              chip one
            </span>
            <span className="rounded-full bg-[var(--color-mood-chip-bg)] px-3 py-1 text-xs">
              chip two
            </span>
          </div>
        </GlassCard>

      </div>

      {/* ── EmptyState previews ── */}
      <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        EmptyState preview
      </p>

      {/* Memo Empty State — with CTA */}
      <div className="rounded-3xl border border-[color:var(--color-glass-border)] bg-[var(--color-card)] p-6">
        <EmptyState
          icon={<Bookmark className="size-8" />}
          title="No memos yet"
          subtitle={"Record a video memo from Home —\nyour future self will find it here"}
          cta={{
            label: "Go to Home",
            href: "/home",
            icon: <MessageCircleHeart className="size-4" />,
          }}
        />
      </div>

      {/* Insights Empty State — no CTA */}
      <div className="rounded-3xl border border-[color:var(--color-glass-border)] bg-[var(--color-card)] p-6">
        <EmptyState
          icon={<MessageCircleHeart className="size-10" />}
          title="What's on your mind?"
          subtitle="I'll look through your entries and reflections to help you see patterns and find perspective."
        />
      </div>

      {/* ── MoodChip preview ── */}
      <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        MoodChip preview
      </p>
      <div className="flex gap-2">
        <MoodChip emoji="😊" label="Happy" />
        <MoodChip emoji="😌" label="Calm" selected />
        <MoodChip emoji="😢" label="Sad" />
        <MoodChip emoji="😰" label="Anxious" />
        <MoodChip emoji="🤩" label="Excited" />
      </div>

      {/* ── FilterPill preview ── */}
      <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        FilterPill preview
      </p>
      <div className="flex flex-wrap gap-2">
        <FilterPill label="This Week" active />
        <FilterPill label="This Month" />
        <FilterPill label="3 Months" />
        <FilterPill label="All Time" />
      </div>

      {/* ── ChatInput preview ── */}
      <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        ChatInput preview
      </p>
      <ChatInput placeholder="Ask about your feelings..." />

    </div>
  );
}
