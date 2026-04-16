"use client";

import { useEffect, useRef, useState } from "react";
import { Search, AudioLines } from "lucide-react";
import { MemoCard } from "@/components/dear-me/memo-card";
import { EmptyState } from "@/components/dear-me/empty-state";
import { useMemoList } from "@/lib/hooks/useMemoList";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";

const PAGE_SIZE = 20;

export default function MemoPage() {
  // Query and visible window live in one state object so changing the query
  // resets the window inline, no effect-setState round-trip needed.
  const [view, setView] = useState({ query: "", count: PAGE_SIZE });
  const { query, count: displayCount } = view;
  const memos = useMemoList({ status: "final" });
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setView((v) => ({ ...v, count: v.count + PAGE_SIZE }));
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [memos]);

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
      <div className="flex min-h-full flex-col">
        <EmptyState
          icon={<AudioLines className="size-8" />}
          title="No memos yet"
          subtitle="Record a video memo from Home — your future self will find it here."
          cta={{ label: "Go to Home", href: "/" }}
        />
      </div>
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

  const visibleMemos = filteredMemos.slice(0, displayCount);
  const hasMore = displayCount < filteredMemos.length;

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-foreground">Memo</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Messages from your past self
        </p>
      </header>

      <label className="flex min-w-0 items-center gap-2 rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-4 py-2.5 shadow-[var(--shadow-glass)] backdrop-blur focus-within:border-[color:var(--color-primary)]">
        <Search className="size-4 text-[color:var(--color-muted-foreground)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setView({ query: e.target.value, count: PAGE_SIZE })}
          placeholder="Search memos…"
          aria-label="Search memos"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-3">
        {filteredMemos.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-[color:var(--color-muted-foreground)]">
            No memos match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <>
            {visibleMemos.map((memo) => (
              <MemoCard
                key={memo.id}
                memoId={memo.id}
                videoFilename={memo.filename}
                href={`/memo/${memo.id}`}
                title={memo.title}
                preview={
                  memo.notes.trim().length > 0
                    ? memo.notes.slice(0, 80)
                    : "Tap to play"
                }
                duration={formatDuration(memo.durationMs)}
                timestamp={formatRelativeTime(memo.createdAt)}
                thumbnailFilename={memo.thumbnailFilename}
              />
            ))}
            {hasMore ? (
              <div
                ref={sentinelRef}
                aria-hidden
                className="h-8"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
