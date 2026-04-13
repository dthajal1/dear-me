"use client";

import { useState } from "react";
import { Search, AudioLines } from "lucide-react";
import { MemoCard } from "@/components/dear-me/memo-card";
import { FilterPill } from "@/components/dear-me/filter-pill";
import { EmptyState } from "@/components/dear-me/empty-state";
import { useMemoList } from "@/lib/hooks/useMemoList";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";

const TIME_FILTERS = ["This Week", "This Month", "3 Months", "All Time"] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

export default function MemoPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("This Week");
  const memos = useMemoList({ status: "final" });

  if (memos === null) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Messages from your past self
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-2xl bg-[var(--color-glass-surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <EmptyState
        icon={<AudioLines className="size-8" />}
        title="No memos yet"
        subtitle="Record a video memo from Home — your future self will find it here."
        cta={{ label: "Go to Home", href: "/home" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Messages from your past self
        </p>
      </header>

      <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-4 py-2.5 shadow-[var(--shadow-glass)] backdrop-blur">
        <Search className="size-4 text-[color:var(--color-muted-foreground)]" />
        <span className="text-sm text-[color:var(--color-muted-foreground)]">
          Search memos…
        </span>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {TIME_FILTERS.map((f) => (
          <FilterPill
            key={f}
            label={f}
            active={f === activeFilter}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {memos.map((memo) => (
          <MemoCard
            key={memo.id}
            href={`/memo/${memo.id}`}
            title={memo.title}
            preview={
              memo.notes.trim().length > 0
                ? memo.notes.slice(0, 80)
                : "Tap to play"
            }
            duration={formatDuration(memo.durationMs)}
            timestamp={formatRelativeTime(memo.createdAt)}
          />
        ))}
      </div>
    </div>
  );
}
