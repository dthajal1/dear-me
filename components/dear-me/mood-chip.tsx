"use client";

import { cn } from "@/lib/utils";

interface MoodChipProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Vertical emoji + label chip. Used in the Home screen's Quick Mood row
 * and wherever else we let the user tag a mood.
 *
 * Design spec (from design.pen):
 *   - cornerRadius: 14px
 *   - padding: 10px all sides
 *   - gap: 6px between emoji and label
 *   - emoji: 22px (text-[22px])
 *   - label: 10px / weight 500
 *   - fill: var(--color-mood-chip-bg) = rgba(138,154,91,0.071)
 *   - border: var(--color-mood-chip-border) = rgba(138,154,91,0.125)
 */
export function MoodChip({ emoji, label, selected, onClick, className }: MoodChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5",
        "rounded-[14px] border p-2.5",
        "transition-colors",
        selected
          ? "border-[color:var(--color-primary)] bg-[var(--color-mood-chip-bg)] shadow-[var(--shadow-glass)]"
          : "border-[color:var(--color-mood-chip-border)] bg-[var(--color-mood-chip-bg)]",
        className,
      )}
    >
      <span className="text-[22px] leading-none">{emoji}</span>
      <span className="text-[10px] font-medium text-[color:var(--color-muted-foreground)]">
        {label}
      </span>
    </button>
  );
}
