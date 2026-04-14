import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Controls inner padding. Defaults to "md". */
  padding?: "sm" | "md" | "lg";
}

/**
 * The frosted semi-transparent surface used across the dear-me UI. Paints
 * the glass-surface token with a soft olive border, glass shadow, and
 * backdrop-blur so the ScreenBackground gradient bleeds through.
 */
export function GlassCard({
  padding = "md",
  className,
  children,
  ...rest
}: GlassCardProps) {
  const paddingClass =
    padding === "sm" ? "p-4" : padding === "lg" ? "p-6" : "p-5";

  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border backdrop-blur",
        "border-[color:var(--color-glass-border)]",
        "bg-[var(--color-glass-surface)]",
        "shadow-[var(--shadow-glass)]",
        paddingClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
