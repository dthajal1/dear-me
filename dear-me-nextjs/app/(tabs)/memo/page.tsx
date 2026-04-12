"use client";

import { useState } from "react";
import { Search, Bookmark, House } from "lucide-react";
import { MemoCard } from "@/components/dear-me/memo-card";
import { FilterPill } from "@/components/dear-me/filter-pill";
import { EmptyState } from "@/components/dear-me/empty-state";

const HAS_DATA = true;

const TIME_FILTERS = ["This Week", "This Month", "3 Months", "All Time"] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

interface Memo {
  id: string;
  title: string;
  preview: string;
  duration: string;
  timestamp: string;
  mood?: string;
}

const MOCK_MEMOS: Memo[] = [
  {
    id: "1",
    title: "2:30 PM",
    preview: "Work has been a lot lately. Everything piling up at once.",
    duration: "1:42",
    timestamp: "Mon",
    mood: "overwhelmed",
  },
  {
    id: "2",
    title: "8:15 AM",
    preview: "Today felt peaceful. Morning light helps.",
    duration: "0:58",
    timestamp: "Tue",
    mood: "calm",
  },
  {
    id: "3",
    title: "6:45 PM",
    preview: "That was tough, but I handled it.",
    duration: "1:15",
    timestamp: "Wed",
    mood: "resilient",
  },
  {
    id: "4",
    title: "11:20 PM",
    preview: "I don't really know what I'm doing anymore.",
    duration: "2:08",
    timestamp: "Thu",
    mood: "lost",
  },
  {
    id: "5",
    title: "7:00 AM",
    preview: "Something shifted this morning. I feel like I'm finding my footing again.",
    duration: "1:30",
    timestamp: "Fri",
    mood: "hopeful",
  },
];

export default function MemoPage() {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>("This Week");

  if (!HAS_DATA) {
    return (
      <EmptyState
        icon={<Bookmark className="size-8" />}
        title="No memos yet"
        subtitle={`Record a video memo from Home —\nyour future self will find it here`}
        cta={{
          label: "Go to Home",
          href: "/",
          icon: <House className="size-4" />,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-foreground">Memo</h1>
        <p className="text-sm text-[color:var(--color-accent)]">
          Messages from your past self
        </p>
      </header>

      {/* Search bar — static render-only, matches design Search Bar node QwLWk */}
      <div
        className="
          flex items-center gap-2.5 rounded-xl border px-4 py-3.5
          border-[color:var(--color-glass-border)]
          bg-[var(--color-glass-surface)]
          shadow-[var(--shadow-glass)]
          backdrop-blur
        "
      >
        <Search className="size-[18px] text-[color:var(--color-accent)]" />
        <span className="text-sm text-[color:var(--color-accent)] opacity-50">
          Search memos...
        </span>
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        {TIME_FILTERS.map((f) => (
          <FilterPill
            key={f}
            label={f}
            active={f === activeTimeFilter}
            onClick={() => setActiveTimeFilter(f)}
          />
        ))}
      </div>

      {/* Memo list */}
      <div className="flex flex-col gap-3">
        {MOCK_MEMOS.map((memo, i) => (
          <MemoCard
            key={memo.id}
            href={`/memo/${i + 1}`}
            title={memo.title}
            preview={memo.preview}
            duration={memo.duration}
            timestamp={memo.timestamp}
            mood={memo.mood}
          />
        ))}
      </div>
    </div>
  );
}
