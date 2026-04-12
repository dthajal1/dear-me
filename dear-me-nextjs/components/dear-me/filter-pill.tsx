"use client";

import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Small rounded pill toggle chip used for filter controls (e.g.,
 * "This Week" / "This Month" in the Memo tab's Time Filters row).
 *
 * Design spec (from design.pen nodes 0GpNm / VQJpf):
 *   - cornerRadius: 16px (--radius-lg)
 *   - padding: 8px vertical, 16px horizontal (py-2 px-4)
 *   - fontSize: 13px
 *   - active:   fill #5C6B3AAA, no border, text #FFFFFF, font-weight 600
 *   - inactive: fill #8A9A5B15, border #8A9A5B25 1px, text #2C331EDD, font-weight normal
 */
export function FilterPill({ label, active, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-[var(--radius-lg)] border px-4 py-2",
        "text-[13px] transition-colors",
        active
          ? "border-transparent bg-[#5C6B3AAA] font-semibold text-white shadow-[var(--shadow-floating)]"
          : "border-[#8A9A5B25] bg-[#8A9A5B15] font-normal text-[#2C331EDD]",
        className,
      )}
    >
      {label}
    </button>
  );
}
