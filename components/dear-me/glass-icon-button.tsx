"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visually round (fully circular) vs. rounded-square with generous radius. */
  shape?: "round" | "square";
  children: ReactNode;
}

/**
 * Round/rounded glass icon button used across the record flow
 * (camera shell, recording shell, etc.). 44x44 hit area with a
 * backdrop-blurred white glass surface and subtle olive ring.
 *
 * Always pair with an explicit aria-label — the icon alone is not
 * an accessible name.
 */
export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  function GlassIconButton({ shape = "round", className, children, type, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "flex size-11 items-center justify-center",
          shape === "round" ? "rounded-full" : "rounded-[var(--radius-xl)]",
          "bg-white/53 backdrop-blur-md",
          "ring-[0.5px] ring-inset ring-[color:var(--color-glass-border)]",
          "shadow-[0_2px_6px_rgba(92,107,58,0.039)]",
          "transition-opacity active:opacity-70",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
