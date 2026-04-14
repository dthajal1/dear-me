import Link from "next/link";
import { Check } from "lucide-react";

/**
 * Record Saved screen — "Memo Saved" (fv90M)
 *
 * Success state shown after a memo is saved.
 * Design elements:
 *   • Three concentric orbs in olive-green radial gradients (same language as /record/processing)
 *   • Check icon centred in the innermost orb
 *   • Headline: "Safely kept."
 *   • Subhead: "We'll hold onto it for you."
 *   • Single primary CTA: "Done" → /home
 *
 * Route: /record/saved
 * Layout: record/layout.tsx provides ScreenBackground
 */
export default function RecordSavedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      {/* ── Concentric orb — three ellipses + check icon ─────────────────── */}
      {/*
        Design layers (outermost → innermost, all centered via layout:none):
          orbGlow   140×140  radial #8A9A5B → transparent, opacity 0.25, blur 40
          orbMiddle 100×100  radial #A8B878 → #8A9A5B22,  opacity 0.5,  blur 20
          orbInner   64×64   radial #C8D8A8 → #8A9A5B,    opacity 0.7,  blur 12
          checkIcon  28×28   Lucide Check,  fill #EFF2E6DD
      */}
      <div className="relative size-[140px] flex-none">
        {/* Outer glow orb */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, #8A9A5B 0%, transparent 100%)",
            opacity: 0.25,
            filter: "blur(10px)",
          }}
          aria-hidden
        />
        {/* Middle orb */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 20,
            background:
              "radial-gradient(circle at 45% 40%, #A8B878 0%, #8A9A5B22 100%)",
            opacity: 0.5,
            filter: "blur(5px)",
          }}
          aria-hidden
        />
        {/* Inner orb */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 38,
            background:
              "radial-gradient(circle at 45% 40%, #C8D8A8 10%, #8A9A5B 100%)",
            opacity: 0.7,
            filter: "blur(3px)",
          }}
          aria-hidden
        />
        {/* Check icon — centred */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Check
            size={28}
            strokeWidth={2}
            className="text-[#EFF2E6DD]"
            aria-hidden
          />
        </div>
      </div>

      {/* ── Text group ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[10px]">
        <h1
          className="text-[26px] font-bold leading-tight text-[#2C331EDD]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          Safely kept.
        </h1>
        <p
          className="max-w-[280px] text-[15px] leading-relaxed text-[#6B7A48]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          We&apos;ll hold onto it for you.
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {/*
        Design: single "Done" button, fill #5C6B3ABB, cornerRadius 16,
        white label, backdrop blur 12, shadow blur 12 color #5C6B3A30
      */}
      <div className="w-full max-w-[311px] px-8">
        <Link
          href="/home"
          className="block w-full rounded-2xl px-8 py-[14px] text-center text-[15px] font-semibold text-white backdrop-blur-sm transition-opacity active:opacity-80"
          style={{
            background: "#5C6B3ABB",
            boxShadow: "0 4px 12px #5C6B3A30",
          }}
        >
          Done
        </Link>
      </div>
    </div>
  );
}
