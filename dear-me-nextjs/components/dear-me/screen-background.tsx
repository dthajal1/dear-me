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
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundColor: "var(--color-background)",
        backgroundImage: [
          "radial-gradient(140% 100% at 25% 15%, color-mix(in srgb, #D8E0C4 50%, transparent) 0%, transparent 100%)",
          "radial-gradient(100% 80% at 80% 75%, color-mix(in srgb, #D0DCC0 40%, transparent) 0%, transparent 100%)",
        ].join(", "),
      }}
    />
  );
}
