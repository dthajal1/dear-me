import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

/**
 * The canonical class chain for every frosted surface in the app.
 * Hand-rolled glass surfaces (memo-card, history-row, cited-memo-card,
 * etc.) import this constant so the brand chrome stays consistent
 * even when the wrapping element isn't a <div>.
 */
export const glassSurfaceClasses =
  "rounded-2xl border border-[color:var(--color-glass-border)] bg-[color:var(--color-glass-surface)] shadow-[var(--shadow-glass)] backdrop-blur";

type GlassCardOwnProps<E extends ElementType> = {
  /** Underlying element. Defaults to "div". Use "section", Link, "button", etc. */
  as?: E;
  /** Controls inner padding. Defaults to "md". */
  padding?: "sm" | "md" | "lg";
};

type GlassCardProps<E extends ElementType> = GlassCardOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof GlassCardOwnProps<E>>;

/**
 * The frosted semi-transparent surface used across the dear-me UI.
 * Polymorphic via the `as` prop so it can be rendered as a div, link,
 * button, or section without duplicating the surface chrome.
 */
export function GlassCard<E extends ElementType = "div">({
  as,
  padding = "md",
  className,
  children,
  ...rest
}: GlassCardProps<E>) {
  const Component = (as ?? "div") as ElementType;
  const paddingClass =
    padding === "sm" ? "p-4" : padding === "lg" ? "p-6" : "p-5";

  return (
    <Component
      {...rest}
      className={cn(glassSurfaceClasses, paddingClass, className)}
    >
      {children}
    </Component>
  );
}
