"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dear-me/confirm-dialog";
import { glassSurfaceClasses } from "@/components/dear-me/glass-card";
import type { InsightThread } from "@/lib/db/schema";

interface InsightsHistoryRowProps {
  thread: InsightThread;
  onDelete: (id: string) => void;
  className?: string;
}

/**
 * Resolves the portal container for the row's "more" menu.
 *
 * Inside the history sheet (a base-ui Dialog), the menu must portal into the
 * sheet popup itself — otherwise it becomes a sibling of the popup and
 * base-ui's focus trap marks it inert/invisible. On the standalone history
 * page there's no dialog, so we fall back to mobile-frame-root.
 *
 * Called lazily at click time so we read live DOM after mount.
 */
function resolveMenuContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return (
    document.getElementById("insights-history-sheet-popup") ??
    document.getElementById("mobile-frame-root")
  );
}

export function InsightsHistoryRow({
  thread,
  onDelete,
  className,
}: InsightsHistoryRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  function handleMenuOpenChange(open: boolean) {
    if (open) {
      // Resolve the portal target lazily so we always pick up the current
      // sheet popup (or fall back to the page's mobile frame).
      setContainer(resolveMenuContainer());
    }
    setMenuOpen(open);
  }

  return (
    <>
    <Link
      href={`/insights/${thread.id}`}
      className={cn(
        glassSurfaceClasses,
        "group flex items-center gap-2 py-3 pr-2 pl-4",
        "transition-opacity active:opacity-80",
        className,
      )}
    >
      <p className="flex-1 truncate text-sm font-semibold text-foreground">
        {thread.title}
      </p>

      <Menu.Root open={menuOpen} onOpenChange={handleMenuOpenChange}>
        <Menu.Trigger
          aria-label={`More options for ${thread.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            "text-[color:var(--color-muted-foreground)]",
            "transition-opacity active:opacity-60",
            "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-popup-open:opacity-100",
          )}
        >
          <MoreHorizontal className="size-[18px]" />
        </Menu.Trigger>
        <Menu.Portal container={container}>
          <Menu.Positioner side="bottom" align="end" sideOffset={6}>
            <Menu.Popup
              className={cn(
                glassSurfaceClasses,
                "z-50 min-w-[160px] overflow-hidden p-1",
                "shadow-[var(--shadow-mobile-frame)]",
                "data-starting-style:opacity-0 data-ending-style:opacity-0",
                "transition-opacity duration-150",
              )}
            >
              <Menu.Item
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmOpen(true);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2",
                  "text-sm font-medium text-[#B45544]",
                  "outline-none data-highlighted:bg-[color:var(--color-muted)]",
                )}
              >
                <Trash2 className="size-4" />
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Link>
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Delete this conversation?"
      description={`"${thread.title}" will be removed. This can't be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => onDelete(thread.id)}
    />
    </>
  );
}
