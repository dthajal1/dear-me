"use client";

import { useRouter } from "next/navigation";
import { MessageCircleHeart, CloudSun, Sun, TrendingUp, Heart, History } from "lucide-react";
import { ChatInput } from "@/components/dear-me/chat-input";
import { GlassIconButton } from "@/components/dear-me/glass-icon-button";
import { InsightsHistorySheet } from "@/components/dear-me/insights-history-sheet";
import { InsightsPromptCard } from "@/components/dear-me/insights-prompt-card";
import { createThreadWithFirstMessage } from "@/lib/db/insightThreads";

const PROMPT_ICON_CLASS = "size-5 text-[color:var(--color-primary)]";
const PROMPT_CARDS = [
  { icon: <CloudSun className={PROMPT_ICON_CLASS} />, text: "How have I been feeling lately?" },
  { icon: <Sun className={PROMPT_ICON_CLASS} />, text: "When do I feel most at peace?" },
  { icon: <TrendingUp className={PROMPT_ICON_CLASS} />, text: "Am I handling stress better?" },
  { icon: <Heart className={PROMPT_ICON_CLASS} />, text: "What makes me happiest?" },
];

export default function InsightsPage() {
  const router = useRouter();

  async function startThread(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    try {
      const thread = await createThreadWithFirstMessage(trimmed);
      router.push(`/insights/${thread.id}`);
    } catch (err) {
      console.error("[insights] failed to create thread", err);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-4">
        {/* Header */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-[length:var(--text-display)] font-bold text-foreground">Insights</h1>
            <p className="text-sm text-[color:var(--color-accent)]">Ask about your emotional journey</p>
          </div>
          <InsightsHistorySheet>
            <GlassIconButton aria-label="Open conversation history">
              <History className="size-[18px] text-[color:var(--color-primary)]" />
            </GlassIconButton>
          </InsightsHistorySheet>
        </header>

        {/* Centered illustration + prompts grid */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-[104px] items-center justify-center rounded-full bg-[color:var(--color-muted)]">
              <MessageCircleHeart className="size-11 text-[color:var(--color-tab-icon-inactive)]" />
            </div>
            <div className="flex w-[280px] flex-col items-center gap-2 text-center">
              <h2 className="text-[length:var(--text-subtitle)] font-semibold text-foreground">
                What&apos;s on your mind?
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-accent)]">
                I&apos;ll look through your entries and reflections to help you see patterns and find perspective.
              </p>
            </div>
          </div>

          {/* Prompt suggestion cards — 2×2 grid */}
          <div className="flex w-full flex-col gap-2.5">
            <div className="flex gap-2.5">
              {PROMPT_CARDS.slice(0, 2).map((card) => (
                <InsightsPromptCard
                  key={card.text}
                  icon={card.icon}
                  text={card.text}
                  onClick={() => startThread(card.text)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              {PROMPT_CARDS.slice(2, 4).map((card) => (
                <InsightsPromptCard
                  key={card.text}
                  icon={card.icon}
                  text={card.text}
                  onClick={() => startThread(card.text)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 px-5 pb-3 pt-2">
        <ChatInput
          placeholder="Ask about your feelings..."
          onSubmit={(value) => startThread(value)}
        />
      </div>
    </div>
  );
}
