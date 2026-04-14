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
  const [query, setQuery] = useState("");
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
        cta={{ label: "Go to Home", href: "/" }}
      />
    );
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filteredMemos = trimmedQuery
    ? memos.filter((memo) => {
        const haystack = [memo.title, memo.notes, memo.transcript ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedQuery);
      })
    : memos;

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Messages from your past self
        </p>
      </header>

      <label className="flex items-center gap-2 rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-4 py-2.5 shadow-[var(--shadow-glass)] backdrop-blur focus-within:border-[color:var(--color-primary)]">
        <Search className="size-4 text-[color:var(--color-muted-foreground)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memos…"
          aria-label="Search memos"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none"
        />
      </label>

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
        {filteredMemos.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-[color:var(--color-muted-foreground)]">
            No memos match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          filteredMemos.map((memo) => (
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
          ))
        )}
      </div>
    </div>
  );
}
