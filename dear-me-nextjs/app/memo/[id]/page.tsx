import Link from "next/link";
import { FileText, Leaf, Play, Sparkles, Trash2, Timer } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";

// Mock data — real implementation will fetch by id.
const MOCK = {
  date: "March 23, 2026",
  time: "9:15 AM",
  duration: "0:42",
  tags: ["calm", "grounded", "hopeful"],
  transcript:
    "\"Today felt calm... like things were finally under control. I should remember this feeling when things get harder. Maybe I'll listen to this next time everything feels overwhelming.\"",
  note: "Work has been a lot lately. Need to remember this feeling so I can appreciate when things get better.",
  aiReflection:
    "You found your calm that day. Remember — you always find your way back.",
};

export default async function MemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />

      <BackHeader title="Memo" backHref="/memo" />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-8">
        {/* Metadata */}
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-foreground leading-tight">
            {MOCK.date}
          </h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {MOCK.time}
          </p>
        </header>

        {/* Video / Playback thumbnail */}
        <Link href={`/memo/${id}/playback`} className="block">
          <div
            className="relative flex items-center justify-center rounded-[22px] overflow-hidden border border-[color:var(--color-glass-border)] shadow-[var(--shadow-glass)]"
            style={{ height: 200 }}
          >
            {/* Gradient placeholder (no real thumbnail yet) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D8E0C4] via-[#C8D6AE] to-[#A8BC80]" />

            {/* Play button */}
            <div className="relative z-10 flex size-[60px] items-center justify-center rounded-full bg-[#5C6B3ABB] shadow-[0_4px_16px_#00000020]">
              <Play className="size-6 translate-x-[2px] text-white" fill="white" />
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-[10px] bg-black/[0.33] px-[10px] py-1 backdrop-blur-sm">
              <Timer className="size-3 text-white/87" />
              <span className="text-[11px] font-semibold text-white/87">
                {MOCK.duration}
              </span>
            </div>
          </div>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {MOCK.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#8A9A5B20] bg-[#8A9A5B15] px-[14px] py-[6px] text-xs font-medium text-[color:var(--color-muted-foreground)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Transcript card */}
        <GlassCard padding="md" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#5C6B3AFF]" />
            <span className="text-sm font-semibold text-foreground">
              Transcript
            </span>
            <Link
              href={`/transcript/${id}`}
              className="ml-auto text-xs font-semibold text-[color:var(--color-primary)]"
            >
              View full
            </Link>
          </div>
          <p className="text-sm leading-[1.55] text-[#4D5A35FF]">
            {MOCK.transcript}
          </p>
        </GlassCard>

        {/* Your Note card */}
        <GlassCard padding="md" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="size-4 text-[#5C6B3AFF]" />
            <span className="text-sm font-semibold text-foreground">
              Your note
            </span>
          </div>
          <p className="text-sm leading-[1.55] text-[#4D5A35FF]">
            {MOCK.note}
          </p>
        </GlassCard>

        {/* AI Reflection card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#8A9A5B22] bg-[#8A9A5B15] px-[18px] py-4">
          <Sparkles className="size-[18px] text-[#6B7A48CC]" />
          <p className="text-sm italic leading-[1.5] text-[#5C6B3ABB]">
            {MOCK.aiReflection}
          </p>
        </div>

        {/* Delete action */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#CC6B6B18] bg-[#CC6B6B08] px-4 py-[10px] text-[13px] font-medium text-[#CC6B6B99]"
        >
          <Trash2 className="size-[14px]" />
          Delete
        </button>
      </div>
    </div>
  );
}
