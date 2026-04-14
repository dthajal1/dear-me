"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleHeart, Plus } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { InsightsHistoryRow } from "@/components/dear-me/insights-history-row";
import { deleteThread, listThreads } from "@/lib/db/insightThreads";
import type { InsightThread } from "@/lib/db/schema";

export default function InsightsHistoryPage() {
  const [threads, setThreads] = useState<InsightThread[] | null>(null);

  const reload = useCallback(async () => {
    try {
      const list = await listThreads();
      setThreads(list);
    } catch (err) {
      console.error("[insights] listThreads failed", err);
      setThreads([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteThread(id);
        await reload();
      } catch (err) {
        console.error("[insights] deleteThread failed", err);
      }
    },
    [reload],
  );

  return (
    <div className="flex min-h-full flex-col">
      <BackHeader
        title="History"
        backHref="/insights"
        rightSlot={
          <Link
            href="/insights"
            aria-label="New conversation"
            className="flex size-[42px] items-center justify-center rounded-full border border-[#8A9A5B28] bg-white/63 backdrop-blur-[12px] transition-opacity active:opacity-70"
          >
            <Plus className="size-[18px] text-[#5C6B3ABB]" />
          </Link>
        }
      />

      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-2 pb-6">
        {threads === null ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
            Loading…
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-[104px] items-center justify-center rounded-full bg-[#8A9A5B15]">
              <MessageCircleHeart className="size-11 text-[#5C6B3A55]" />
            </div>
            <div className="flex w-[280px] flex-col items-center gap-2">
              <p className="text-[19px] font-semibold text-[#2C331EDD]">
                No conversations yet
              </p>
              <p className="text-sm leading-relaxed text-[#6B7A48FF]">
                Ask your journal a question and it&apos;ll show up here.
              </p>
            </div>
            <Link
              href="/insights"
              className="mt-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
            >
              Start a conversation
            </Link>
          </div>
        ) : (
          threads.map((thread) => (
            <InsightsHistoryRow
              key={thread.id}
              thread={thread}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
