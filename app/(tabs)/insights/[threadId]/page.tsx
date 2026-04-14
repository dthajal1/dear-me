"use client";

import { use, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { ChatInput } from "@/components/dear-me/chat-input";
import { InsightsThreadView } from "@/components/dear-me/insights-thread-view";
import { useInsightAsk } from "@/lib/hooks/useInsightAsk";

export default function InsightsThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const { thread, status, ask, fireAskForExisting } = useInsightAsk(threadId);

  // First-ask trigger — fires exactly once when we land on a fresh thread that
  // has a user message with no assistant reply after it.
  const askedRef = useRef(false);
  useEffect(() => {
    if (askedRef.current) return;
    if (!thread) return;
    if (status !== "idle") return;

    const lastUser = [...thread.messages]
      .reverse()
      .find((m) => m.role === "user");
    const lastAssistant = [...thread.messages]
      .reverse()
      .find((m) => m.role === "assistant");

    if (
      lastUser &&
      (!lastAssistant || lastAssistant.createdAt < lastUser.createdAt)
    ) {
      askedRef.current = true;
      void fireAskForExisting(lastUser.text);
    }
  }, [thread, status, fireAskForExisting]);

  // Auto-scroll to the bottom as new messages arrive.
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread?.messages.length, status]);

  // Loading state.
  if (thread === undefined) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }

  // Not found.
  if (thread === null) {
    return (
      <div className="flex min-h-full flex-col">
        <BackHeader title="Insights" backHref="/insights" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-base font-semibold text-foreground">
            Conversation not found
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            It may have been deleted.
          </p>
          <Link
            href="/insights"
            className="mt-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
          >
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const isBusy = status === "loading";

  return (
    <div className="flex min-h-full flex-col">
      <BackHeader
        title={thread.title}
        backHref="/insights"
        rightSlot={
          <Link
            href="/insights/history"
            aria-label="Conversation history"
            className="flex size-[42px] items-center justify-center rounded-full border border-[#8A9A5B28] bg-white/63 backdrop-blur-[12px] transition-opacity active:opacity-70"
          >
            <Clock className="size-[18px] text-[#5C6B3ABB]" />
          </Link>
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-5 pt-2 pb-4">
        <InsightsThreadView messages={thread.messages} />
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 px-5 pb-3 pt-2">
        <ChatInput
          placeholder={isBusy ? "Thinking…" : "Ask a follow-up…"}
          onSubmit={(value) => {
            if (isBusy) return;
            void ask(value);
          }}
        />
      </div>
    </div>
  );
}
