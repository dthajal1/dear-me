/**
 * BackPill — a small pill-shaped back navigation button.
 *
 * Extracted from design.pen node P7l1X (Component/Back Pill):
 *   fill:         #8A9A5B12  (--color-muted)
 *   border:       1px inside #8A9A5B20 (--color-glass-border)
 *   cornerRadius: 10px       (--radius-sm)
 *   padding:      8px 12px
 *   gap:          6px
 *   icon:         arrow-left, 18×18, #2C331EDD (foreground)
 *   label font:   14px / 500 / #2C331EDD
 *
 * Renders as <Link> when `href` is set, otherwise as <button>.
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BackPillProps {
  /** If provided, renders as a <Link> to this href. Otherwise a plain <button>. */
  href?: string;
  /** Optional label shown to the right of the chevron. Default: none (icon only). */
  label?: string;
  /** Click handler (only used when `href` is not provided). */
  onClick?: () => void;
  className?: string;
}

const pillClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-muted)] px-3 py-2 text-sm font-medium text-foreground border border-[var(--color-glass-border)] transition-opacity hover:opacity-80 active:opacity-60";

export function BackPill({ href, label, onClick, className }: BackPillProps) {
  const content = (
    <>
      <ChevronLeft size={18} strokeWidth={2} aria-hidden />
      {label && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(pillClasses, className)}
        aria-label={label ? undefined : "Back"}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(pillClasses, className)}
      aria-label={label ? undefined : "Back"}
    >
      {content}
    </button>
  );
}
