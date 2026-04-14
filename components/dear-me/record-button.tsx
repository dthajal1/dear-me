"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  /** Visual state. "idle" shows a red circle (mic trigger), "recording" shows a red rounded square (stop). */
  state?: "idle" | "recording";
  /** Click handler. Ignored if `href` is provided. */
  onPress?: () => void;
  /** If provided, wraps the button in a <Link>. */
  href?: string;
  size?: "md" | "lg";
  className?: string;
}

/**
 * The hero record trigger — a large circular button used on the record
 * trigger and recording screens.
 *
 * Design.pen values (V8tgj / TR22i):
 *  - Outer ring: 80px circle, fill #FFFFFF99, stroke #FFFFFF66 3px inside,
 *    box-shadow 0 4px 12px rgba(92,107,58,0.083), backdrop-blur 20px
 *  - Idle inner: 60px red circle (#E53E3E) with red glow shadow
 *  - Recording inner: 30×30 rounded-[7px] red square (#E53E3E) with red glow shadow
 */
export function RecordButton({
  state = "idle",
  onPress,
  href,
  size = "lg",
  className,
}: RecordButtonProps) {
  // Outer ring dims: design is 80px ("lg"), scaled to 64px for "md"
  const outerSize = size === "lg" ? "size-20" : "size-16";
  // Inner element dims
  const innerCircleSize = size === "lg" ? "size-[60px]" : "size-[48px]";
  const innerSquareSize = size === "lg" ? "size-[30px]" : "size-[24px]";

  const outerClasses = cn(
    // Layout
    "flex items-center justify-center rounded-full",
    // Glass fill + stroke — from design.pen #FFFFFF99 fill + #FFFFFF66 3px stroke
    "bg-[#FFFFFF99]",
    "ring-[3px] ring-[#FFFFFF66] ring-inset",
    // Backdrop blur (design: background_blur radius 20)
    "backdrop-blur-xl",
    // Shadow (design: blur 12, color #5C6B3A15, offset 0 4)
    "shadow-[0_4px_12px_rgba(92,107,58,0.083)]",
    // Press feedback
    "transition-transform active:scale-95",
    outerSize,
    className,
  );

  // Inner element: red circle (idle) or red rounded square (recording)
  const innerContent =
    state === "recording" ? (
      // Stop square: 30×30, cornerRadius 7 (design: stopSquare)
      <span
        className={cn(innerSquareSize, "rounded-[7px]")}
        style={{
          backgroundColor: "#E53E3E",
          boxShadow: "0 2px 8px rgba(229,62,62,0.133)",
        }}
        aria-hidden
      />
    ) : (
      // Idle circle: 60×60 red ellipse (design: recordInner)
      <span
        className={cn(innerCircleSize, "rounded-full")}
        style={{
          backgroundColor: "#E53E3E",
          boxShadow: "0 2px 8px rgba(229,62,62,0.133)",
        }}
        aria-hidden
      />
    );

  if (href) {
    return (
      <Link
        href={href}
        className={outerClasses}
        aria-label={state === "recording" ? "Stop recording" : "Start recording"}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className={outerClasses}
      aria-label={state === "recording" ? "Stop recording" : "Start recording"}
    >
      {innerContent}
    </button>
  );
}
