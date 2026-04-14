"use client";

import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassSurfaceClasses } from "@/components/dear-me/glass-card";
import { formatRelativeTime } from "@/lib/format/time";
import type { InsightThread } from "@/lib/db/schema";

interface InsightsHistoryRowProps {
  thread: InsightThread;
  onDelete: (id: string) => void;
  className?: string;
}

function lastAssistantSnippet(thread: InsightThread): string {
  const lastAssistant = [...thread.messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.text.trim().length > 0);
  if (!lastAssistant) return "No reply yet.";
  const clean = lastAssistant.text.trim().replace(/\s+/g, " ");
  return clean.length > 90 ? clean.slice(0, 89) + "…" : clean;
}

export function InsightsHistoryRow({
  thread,
  onDelete,
  className,
}: InsightsHistoryRowProps) {
  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(`Delete "${thread.title}"? This can't be undone.`);
    if (ok) onDelete(thread.id);
  }

  return (
    <div
      className={cn(
        "group relative flex w-full items-stretch gap-2",
        className,
      )}
    >
      <Link
        href={`/insights/${thread.id}`}
        className={cn(
          glassSurfaceClasses,
          "flex flex-1 items-center gap-3 p-3.5",
          "transition-opacity active:opacity-80",
        )}
      >
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="flex-1 truncate text-sm font-semibold text-foreground">
              {thread.title}
            </p>
            <span className="shrink-0 text-[length:var(--text-caption)] text-[color:var(--color-muted-foreground)]">
              {formatRelativeTime(thread.updatedAt)}
            </span>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-foreground/75">
            {lastAssistantSnippet(thread)}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-[color:var(--color-muted-foreground)]" />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Delete ${thread.title}`}
        className={cn(
          glassSurfaceClasses,
          "flex size-11 shrink-0 items-center justify-center",
          "transition-opacity active:opacity-60",
        )}
      >
        <Trash2 className="size-[18px] text-[#B45544]/70" />
      </button>
    </div>
  );
}
