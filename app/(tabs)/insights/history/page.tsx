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
            className="flex size-11 items-center justify-center rounded-full border border-[color:var(--color-glass-border)] bg-[color:var(--color-glass-surface)] backdrop-blur-[12px] transition-opacity active:opacity-70"
          >
            <Plus className="size-[18px] text-[color:var(--color-primary)]" />
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
            <div className="flex size-[104px] items-center justify-center rounded-full bg-[color:var(--color-muted)]">
              <MessageCircleHeart className="size-11 text-[color:var(--color-tab-icon-inactive)]" />
            </div>
            <div className="flex w-[280px] flex-col items-center gap-2">
              <h2 className="text-[length:var(--text-subtitle)] font-semibold text-foreground">
                No conversations yet
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-accent)]">
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
