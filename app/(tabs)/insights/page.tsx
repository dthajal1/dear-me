"use client";

import { useRouter } from "next/navigation";
import { MessageCircleHeart, CloudSun, Sun, TrendingUp, Heart } from "lucide-react";
import { ChatInput } from "@/components/dear-me/chat-input";
import { InsightsPromptCard } from "@/components/dear-me/insights-prompt-card";
import { createThreadWithFirstMessage } from "@/lib/db/insightThreads";

const PROMPT_CARDS = [
  { icon: <CloudSun className="size-5 text-[#5C6B3ABB]" />, text: "How have I been feeling lately?" },
  { icon: <Sun className="size-5 text-[#5C6B3ABB]" />, text: "When do I feel most at peace?" },
  { icon: <TrendingUp className="size-5 text-[#5C6B3ABB]" />, text: "Am I handling stress better?" },
  { icon: <Heart className="size-5 text-[#5C6B3ABB]" />, text: "What makes me happiest?" },
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
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-[#2C331EDD]">Insights</h1>
          <p className="text-sm text-[#6B7A48FF]">Ask about your emotional journey</p>
        </header>

        {/* Centered illustration + prompts grid */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-[104px] items-center justify-center rounded-full bg-[#8A9A5B15]">
              <MessageCircleHeart className="size-11 text-[#5C6B3A55]" />
            </div>
            <div className="flex w-[280px] flex-col items-center gap-2 text-center">
              <p className="text-[19px] font-semibold text-[#2C331EDD]">
                What&apos;s on your mind?
              </p>
              <p className="text-sm leading-relaxed text-[#6B7A48FF]">
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
