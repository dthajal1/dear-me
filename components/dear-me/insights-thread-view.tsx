"use client";

import { cn } from "@/lib/utils";
import type { InsightMessage } from "@/lib/db/schema";
import { InsightsCitedMemoCard } from "./insights-cited-memo-card";

interface InsightsThreadViewProps {
  messages: InsightMessage[];
  className?: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
      <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)] [animation-delay:0ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)] [animation-delay:200ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)] [animation-delay:400ms]" />
    </div>
  );
}

export function InsightsThreadView({
  messages,
  className,
}: InsightsThreadViewProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex justify-end">
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 text-sm font-medium",
                  "bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)]",
                  "rounded-[var(--radius-lg)] rounded-br-[4px]",
                  "backdrop-blur-[12px]",
                  "whitespace-pre-wrap",
                )}
              >
                {msg.text}
              </div>
            </div>
          );
        }

        // assistant
        const isStreaming = msg.status === "streaming";
        const isError = msg.status === "error";
        const hasText = msg.text.trim().length > 0;

        return (
          <div key={msg.id} className="flex w-full flex-col gap-3.5">
            {isStreaming && !hasText ? (
              <TypingDots />
            ) : (
              hasText && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {msg.text}
                </p>
              )
            )}

            {isError && msg.errorNote && (
              <p className="text-xs italic leading-relaxed text-[#B45544]/55">
                {msg.errorNote}
              </p>
            )}

            {msg.citedMemoIds?.map((id) => (
              <InsightsCitedMemoCard key={id} memoId={id} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
