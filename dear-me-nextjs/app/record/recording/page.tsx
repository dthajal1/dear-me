import Link from "next/link";
import { X, Pause, RefreshCw } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";

/**
 * Record Recording screen — "Recording Memo v3" (edkgu)
 *
 * Full-bleed dark viewport simulating an active camera feed while a memo
 * is being recorded. Layout mirrors the design frame exactly:
 *
 *   • Absolute-positioned status bar (top)
 *   • Top controls row (y≈56): Close pill (left) | REC Badge with timer (right)
 *   • Bottom bar (y≈724): Pause pill | Stop button | Flip pill
 *
 * Tapping the Stop button navigates to /record/processing.
 *
 * Route: /record/recording
 * Layout: record/layout.tsx provides ScreenBackground (covered by the black fill here)
 */
export default function RecordRecordingPage() {
  return (
    /* Full-bleed black viewport — covers the ScreenBackground from layout */
    <div className="relative min-h-dvh overflow-hidden bg-black">
      {/* ── Simulated camera feed ─────────────────────────────────────────── */}
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
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
          <span className="h-4 w-4 rounded-sm bg-white/80" aria-hidden />
        </div>
      </div>

      {/* ── Top controls (Close + REC Badge) ─────────────────────────────── */}
      {/*
        Design: absolute, y=56, full-width row, justify-between, px-5
        Close:     36×36 circle, fill #FFFFFF88, backdrop-blur, stroke #8A9A5B18
        REC Badge: glass pill, red dot + timer "0:42", gap 7, px-3 py-[7px]
      */}
      <div className="absolute left-0 right-0 top-14 flex items-center justify-between px-5">
        {/* Close — returns to camera */}
        <Link
          href="/record/camera"
          aria-label="Stop recording and go back"
          className="flex size-9 items-center justify-center rounded-full bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18] transition-opacity active:opacity-70"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
        >
          <X size={16} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
        </Link>

        {/* REC Badge — red dot + elapsed timer */}
        <div
          className="flex items-center gap-[7px] rounded-[20px] bg-white/53 px-3 py-[7px] backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18]"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
          aria-label="Recording — elapsed time 0:42"
        >
          {/* Red recording dot with glow */}
          <span
            className="block size-2 rounded-full bg-[#E53E3E]"
            style={{ boxShadow: "0 0 6px rgba(229,62,62,0.333)" }}
            aria-hidden
          />
          {/* Elapsed timer */}
          <span
            className="font-['Geist',sans-serif] text-[13px] font-semibold text-[#2C331EBB]"
          >
            0:42
          </span>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      {/*
        Design: absolute, y=724, full-width, layout vertical, gap 20, px-6 pb-10 pt-4
        Controls row: Pause (44×44) | Stop (80×80) | Flip (44×44), gap 48, justify-center
      */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 px-6 pb-10 pt-4">
        <div className="flex w-full items-center justify-center gap-12">
          {/* Pause button — 44×44 glass pill */}
          <button
            type="button"
            aria-label="Pause recording"
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20] transition-opacity active:opacity-70"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
          >
            <Pause size={18} strokeWidth={2} className="text-[#2C331EBB]" aria-hidden />
          </button>

          {/* Stop button — navigates to /record/processing */}
          <RecordButton href="/record/processing" state="recording" size="lg" />

          {/* Flip camera — 44×44 glass pill */}
          <button
            type="button"
            aria-label="Flip camera"
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20] transition-opacity active:opacity-70"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
          >
            <RefreshCw size={15} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
