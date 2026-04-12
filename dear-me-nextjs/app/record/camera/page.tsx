import Link from "next/link";
import { X, RefreshCw, ZapOff } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";

/**
 * Record Camera screen — "Camera Ready v3" (Rjvwy)
 *
 * Full-bleed dark viewport simulating a live camera feed with glass-morphic
 * overlay controls. Layout mirrors the design exactly:
 *
 *   • Absolute-positioned white status bar (top)
 *   • Top controls row (y≈56): Close pill (left) | Flip pill (right)
 *   • Bottom bar (y≈724): Timer pill | Record button | Flash pill
 *
 * Tapping the Record button navigates to /record/recording.
 *
 * Route: /record/camera
 * Layout: record/layout.tsx provides ScreenBackground (covered by the black fill here)
 */
export default function RecordCameraPage() {
  return (
    /* Full-bleed black viewport — covers the ScreenBackground from layout */
    <div className="relative min-h-dvh overflow-hidden bg-black">
      {/* ── Simulated camera feed ─────────────────────────────────────────── */}
      {/* In production this would be a <video> element. For now: dark gradient. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, #1a2010 0%, #000000 70%)",
        }}
        aria-hidden
      />

      {/* ── Status bar overlay ────────────────────────────────────────────── */}
      <div className="absolute left-0 right-0 top-0 flex h-[54px] items-end justify-between px-6 pb-0 pt-[22px]">
        <span className="text-base font-semibold text-white/87">9:41</span>
        <div className="flex items-center gap-1.5">
          {/* Signal, Wifi, Battery — decorative */}
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
        </div>
      </div>

      {/* ── Top controls (Close + Flip) ───────────────────────────────────── */}
      {/*
        Design: absolute, y=56, full-width row, justify-between, px-5
        Close: 36×36 circle, fill #FFFFFF88, stroke #8A9A5B18, backdrop-blur-md
        Flip:  same shape, refresh-cw icon
      */}
      <div className="absolute left-0 right-0 top-14 flex items-center justify-between px-5">
        {/* Close — returns to trigger */}
        <Link
          href="/record/trigger"
          aria-label="Close camera"
          className="flex size-9 items-center justify-center rounded-full bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18] transition-opacity active:opacity-70"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
        >
          <X size={16} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
        </Link>

        {/* Flip camera */}
        <button
          type="button"
          aria-label="Flip camera"
          className="flex size-9 items-center justify-center rounded-full bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18] transition-opacity active:opacity-70"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
        >
          <RefreshCw size={15} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
        </button>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      {/*
        Design: absolute, y=724, h≈128, full-width, layout vertical, gap 20, px-6 pb-10 pt-4
        Inner Controls row: Timer | Record button | Flash, gap 48, justify-center
      */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 px-6 pb-10 pt-4">
        {/* Controls row */}
        <div className="flex w-full items-center justify-center gap-12">
          {/* Timer pill */}
          <div
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20]"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
            aria-label="Recording timer"
          >
            <span className="font-['Geist',sans-serif] text-[13px] font-semibold text-[#2C331EBB]">
              2m
            </span>
          </div>

          {/* Record button — navigates to /record/recording */}
          <RecordButton href="/record/recording" state="idle" size="lg" />

          {/* Flash toggle */}
          <button
            type="button"
            aria-label="Toggle flash"
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20] transition-opacity active:opacity-70"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
          >
            <ZapOff size={18} strokeWidth={2} className="text-[#2C331EBB]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
