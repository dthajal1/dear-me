/**
 * BackHeader — a screen-top navigation bar with a BackPill on the left,
 * a centered title, and an optional right-side action slot.
 *
 * Extracted from design.pen node O2HUq (Component/Back Header):
 *   layout:       row, alignItems center, gap 12px, width fill_container
 *   title font:   20px / 700 / #2C331EDD (foreground)
 *   icon:         arrow-left, 20×20 (rendered via BackPill)
 *
 * The design shows a simple left-aligned row (icon + title). This
 * implementation uses a three-column grid so the title is truly centered
 * regardless of whether `rightSlot` is provided. A spacer mirrors the
 * BackPill width on the right when no `rightSlot` is given.
 */

import { type ReactNode } from "react";
import { BackPill } from "@/components/dear-me/back-pill";
import { cn } from "@/lib/utils";

export interface BackHeaderProps {
  title: string;
  /** Optional content rendered on the right side of the header (e.g., a "Share" button). */
  rightSlot?: ReactNode;
  /** Optional href for the back pill. Defaults to browser back (no href → button). */
  backHref?: string;
  className?: string;
}

export function BackHeader({
  title,
  rightSlot,
  backHref,
  className,
}: BackHeaderProps) {
  return (
    <header
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-6",
        className
      )}
    >
      {/* Left: back pill */}
      <BackPill href={backHref} />

      {/* Center: title — always truly centered in the 1fr column */}
      <h1 className="text-center text-[20px] font-bold text-foreground leading-none truncate">
        {title}
      </h1>

      {/* Right: optional action slot, or spacer to balance the back pill */}
      {rightSlot ? (
        <div>{rightSlot}</div>
      ) : (
        /* invisible spacer — same approximate width as the BackPill icon-only variant */
        <div className="w-[42px]" aria-hidden />
      )}
    </header>
  );
}
