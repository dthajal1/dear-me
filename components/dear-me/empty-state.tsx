import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon element — typically a lucide-react icon. Recommended size: 32px (size-8). */
  icon: ReactNode;
  title: string;
  subtitle: string;
  /**
   * Optional call-to-action. If provided, renders a muted pill button linking
   * to href. Matches the design's ghost-pill CTA style (fill #8A9A5B15, border
   * #8A9A5B25, cornerRadius 12, padding 12/24).
   */
  cta?: {
    label: string;
    href: string;
    /** Optional icon rendered before the label (lucide-react icon at size-4). */
    icon?: ReactNode;
  };
  className?: string;
}

/**
 * Shared empty-state layout: circular icon container, title, subtitle, optional CTA.
 * Used by Memo Empty State and Insights Empty State (and any future empty screens).
 *
 * Design values (from design.pen):
 * - Circle: 80×80px, rounded-full, bg #8A9A5B10 (--color-muted), border #8A9A5B18
 * - Icon: 32px, color #5C6B3A55 (--color-tab-icon-inactive)
 * - Title: 22px / 700 / #2C331EDD (--color-foreground)
 * - Subtitle: 14px / 400 / lineHeight 1.5 / #6B7A48FF (--color-accent)
 * - CTA pill: cornerRadius 12, fill #8A9A5B15, stroke #8A9A5B25, padding 12/24
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center",
        className,
      )}
    >
      {/* Circular icon container — 80×80px, muted glass fill */}
      <div
        className={cn(
          "flex size-20 items-center justify-center rounded-full",
          "border border-[color:var(--color-glass-border)]",
          "bg-[color:var(--color-muted)]",
          "text-[color:var(--color-tab-icon-inactive)]",
        )}
      >
        {icon}
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-bold leading-snug text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-[color:var(--color-accent)]">
          {subtitle}
        </p>
      </div>

      {/* Optional CTA pill — rendered as a styled Link (base-ui Button has no asChild) */}
      {cta ? (
        <Link
          href={cta.href}
          className={cn(
            "mt-1 inline-flex items-center justify-center gap-2",
            "rounded-[var(--radius-md)] px-6 py-3",
            "border border-[color:var(--color-glass-border)]",
            "bg-[color:var(--color-muted)]",
            "text-sm font-medium text-[color:var(--color-tab-icon-inactive)]",
            "transition-colors hover:bg-[color:var(--color-mood-chip-bg)]",
          )}
        >
          {cta.icon}
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
