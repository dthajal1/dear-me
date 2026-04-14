"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { MessageCircleHeart, Plus, X } from "lucide-react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { InsightsHistoryRow } from "@/components/dear-me/insights-history-row";
import { deleteThread, listThreads } from "@/lib/db/insightThreads";
import type { InsightThread } from "@/lib/db/schema";

interface InsightsHistorySheetProps {
  /**
   * The trigger element. Must be a single React element (e.g. a button); the
   * sheet merges open/close handlers into it via base-ui's render prop.
   */
  children: ReactElement;
}

/**
 * Right-side slide-in sheet listing insight conversation threads.
 *
 * Unlike the stock shadcn Sheet, this one portals its overlay + popup into
 * the `#mobile-frame-root` element (the `relative` inner column rendered by
 * MobileFrame). That scopes the sheet to the 430px brand column on desktop,
 * instead of covering the full browser viewport. On mobile the inner column
 * already fills the viewport, so behavior is identical.
 */
export function InsightsHistorySheet({ children }: InsightsHistorySheetProps) {
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<InsightThread[] | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Only resolve the container on the client — document is undefined on server.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(document.getElementById("mobile-frame-root"));
  }, []);

  const reload = useCallback(async () => {
    try {
      const list = await listThreads();
      setThreads(list);
    } catch (err) {
      console.error("[insights] listThreads failed", err);
      setThreads([]);
    }
  }, []);

  // Fetch when opened.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [open, reload]);

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
    <SheetPrimitive.Root open={open} onOpenChange={setOpen}>
      <SheetPrimitive.Trigger data-slot="sheet-trigger" render={children} />
      <SheetPrimitive.Portal container={container}>
        <SheetPrimitive.Backdrop
          className={cn(
            "absolute inset-0 z-40 bg-black/20 transition-opacity duration-200",
            "supports-backdrop-filter:backdrop-blur-[2px]",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        />
        <SheetPrimitive.Popup
          className={cn(
            "absolute inset-y-0 right-0 z-50 flex h-full w-full flex-col",
            "bg-background text-foreground shadow-[var(--shadow-mobile-frame)]",
            "border-l border-[color:var(--color-glass-border)]",
            "transition-transform duration-250 ease-out",
            "data-starting-style:translate-x-full data-ending-style:translate-x-full",
          )}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between gap-3 px-5 pt-6 pb-4"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
          >
            <div className="flex items-center gap-2">
              <SheetPrimitive.Close
                aria-label="Close history"
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  "border border-[color:var(--color-glass-border)]",
                  "bg-[color:var(--color-glass-surface)] backdrop-blur-[12px]",
                  "transition-opacity active:opacity-70",
                )}
              >
                <X className="size-[18px] text-[color:var(--color-primary)]" />
              </SheetPrimitive.Close>
              <SheetPrimitive.Title className="text-[length:var(--text-subtitle)] font-semibold text-foreground">
                History
              </SheetPrimitive.Title>
            </div>
            <SheetPrimitive.Close
              aria-label="New conversation"
              onClick={() => setOpen(false)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full",
                "border border-[color:var(--color-glass-border)]",
                "bg-[color:var(--color-glass-surface)] backdrop-blur-[12px]",
                "transition-opacity active:opacity-70",
              )}
            >
              <Plus className="size-[18px] text-[color:var(--color-primary)]" />
            </SheetPrimitive.Close>
          </div>

          {/* Scrollable body */}
          <div
            className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-6"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
          >
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
                  onClick={() => setOpen(false)}
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
        </SheetPrimitive.Popup>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
