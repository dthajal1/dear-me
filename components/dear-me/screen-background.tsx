/**
 * Paints the dear-me app surface: the base color plus the two radial
 * gradient overlays from the Home frame in design.pen. Absolutely
 * positioned and pointer-events-none so it sits behind all content.
 *
 * Usage:
 *   <div className="relative min-h-dvh">
 *     <ScreenBackground />
 *     {page content goes here}
 *   </div>
 */
export function ScreenBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-background"
      style={{ backgroundImage: "var(--gradient-brand)" }}
    />
  );
}
