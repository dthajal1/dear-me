import Link from "next/link";
import { Leaf } from "lucide-react";

/**
 * Record Processing screen — "Processing State v2" (flHHz)
 *
 * Shown immediately after a memo is recorded while the app "analyses" it.
 * Design elements:
 *   • Three concentric pulsing orbs in olive-green radial gradients
 *   • Leaf icon centred in the innermost orb
 *   • Headline: "Sitting with your words…"
 *   • Subhead: "listening carefully"
 *   • Thin olive progress bar (indeterminate / animate-pulse for scaffold)
 *   • Manual "Continue" link → /record/review (no fake timer)
 *
 * Route: /record/processing
 * Layout: record/layout.tsx provides ScreenBackground
 */
export default function RecordProcessingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      {/* ── Concentric orb — three ellipses + leaf icon ─────────────────── */}
      {/*
        Design layers (outermost → innermost, all centered):
          orbOuter  160×160  radial #8A9A5B → transparent, opacity 0.3, blur 40
          orbMiddle 120×120  radial #A8B878 → #8A9A5B22,  opacity 0.5, blur 24
          orbInner   80×80   radial #C8D8A8 → #8A9A5B,    opacity 0.7, blur 16
          leafIcon   32×32   Lucide Leaf, fill #EFF2E6DD
      */}
      <div className="relative size-40 flex-none">
        {/* Outer orb */}
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, #8A9A5B 0%, transparent 100%)",
            opacity: 0.3,
            filter: "blur(10px)",
          }}
          aria-hidden
        />
        {/* Middle orb */}
        <div
          className="absolute inset-[10px] animate-pulse rounded-full [animation-delay:200ms]"
          style={{
            background:
              "radial-gradient(circle at 45% 40%, #A8B878 0%, #8A9A5B22 100%)",
            opacity: 0.5,
            filter: "blur(6px)",
          }}
          aria-hidden
        />
        {/* Inner orb */}
        <div
          className="absolute inset-[30px] animate-pulse rounded-full [animation-delay:400ms]"
          style={{
            background:
              "radial-gradient(circle at 45% 40%, #C8D8A8 10%, #8A9A5B 100%)",
            opacity: 0.7,
            filter: "blur(2px)",
          }}
          aria-hidden
        />
        {/* Leaf icon — centred */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf
            size={28}
            strokeWidth={1.5}
            className="text-[#EFF2E6DD]"
            aria-hidden
          />
        </div>
      </div>

      {/* ── Text group ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <h1
          className="text-2xl font-bold text-[#2C331EDD]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          Sitting with your words...
        </h1>
        <p
          className="text-[15px] text-[#5C6B3A99]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          listening carefully
        </p>
      </div>

      {/* ── Progress bar (indeterminate scaffold) ────────────────────────── */}
      {/*
        Design: 120×3 px pill, fill #8A9A5B22; inner fill 48×3 gradient
        #5C6B3A → #8A9A5B (linear, 90°). For scaffold we animate-pulse the fill.
      */}
      <div
        className="relative h-[3px] w-[120px] overflow-hidden rounded-full"
        style={{ background: "rgba(138,154,91,0.133)" }}
        role="progressbar"
        aria-label="Processing your memo"
        aria-busy="true"
      >
        <div
          className="h-full w-12 animate-pulse rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #5C6B3A 0%, #8A9A5B 100%)",
          }}
        />
      </div>

      {/* ── Manual advance — scaffold only ───────────────────────────────── */}
      <Link
        href="/record/review"
        className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-floating)] transition-opacity active:opacity-80"
      >
        Continue
      </Link>
    </div>
  );
}
