import Link from "next/link";
import { ArrowRight, Sparkles, Type } from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";
import { Textarea } from "@/components/ui/textarea";

/**
 * Add Notes screen — "Add Notes v2" (f7aIR)
 *
 * Appears after the Review & Save screen so the user can attach a written
 * note to their memo before finalising it. Design elements (matching the
 * f7aIR frame exactly):
 *
 *   • BackPill only (no centred title — the screen title is inline below)
 *   • Title: "Add Notes" (26 / 700) + subtitle "Anything you'd tell your
 *     future self?" (14 / regular / muted)
 *   • Video Thumbnail placeholder (180 px) with REC badge + duration overlay
 *   • Processing Indicator row: sparkles + "Listening to your thoughts…" + dot
 *   • Notes Card (glass): "A note for future you" label + textarea (120 px min-h)
 *   • Title Field (optional): type icon + "Add a title (optional)"
 *   • Primary CTA: "Continue" → /record/saved
 *   • "Maybe later" skip link → /record/saved
 *
 * Route: /record/add-notes
 * Layout: record/layout.tsx (ScreenBackground)
 * Prev:   /record/review  •  Next: /record/saved
 */

export default function AddNotesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Header — BackPill only, no centred title ──────────────────── */}
      <BackHeader backHref="/record/review" title="" />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-0">
        {/* ── Screen title ─────────────────────────────────────────────── */}
        {/*
          Design: vertical stack, gap 4.
          Title: 26px / 700 / #2C331EDD.
          Subtitle: 14px / normal / #5C6B3AAA.
        */}
        <div className="flex flex-col gap-1 px-1">
          <h1
            className="text-[26px] font-bold leading-tight text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Add Notes
          </h1>
          <p
            className="text-[14px] text-[#5C6B3AAA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Anything you&apos;d tell your future self?
          </p>
        </div>

        {/* ── Video Thumbnail ──────────────────────────────────────────── */}
        {/*
          Design: cornerRadius 20, fill image (placeholder), height 180,
          absolute-positioned REC badge (top-left 12,12) and Duration
          badge (top-right ~305,12). Border #8A9A5B20.
        */}
        <div
          className="relative h-[180px] w-full overflow-hidden rounded-[20px] border"
          style={{
            borderColor: "rgba(138,154,91,0.125)",
            background:
              "linear-gradient(135deg, #d8e0c4 0%, #c8d4b0 40%, #b8c89a 100%)",
          }}
          aria-label="Memo video thumbnail"
        >
          {/* Placeholder texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#6B7A48 0% 25%, transparent 0% 50%)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden
          />

          {/* REC badge — top-left */}
          <div
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[6px] px-2 py-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span className="size-2 rounded-full bg-[#FF3B30]" aria-hidden />
            <span
              className="text-[10px] font-bold text-white"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              REC
            </span>
          </div>

          {/* Duration badge — top-right */}
          <div
            className="absolute right-3 top-3 rounded-[6px] px-2 py-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span
              className="text-[11px] font-semibold text-white"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              0:42
            </span>
          </div>
        </div>

        {/* ── Processing Indicator ─────────────────────────────────────── */}
        {/*
          Design: row, alignItems center, gap 8.
          sparkles icon (#5C6B3AAA, 14×14) + text (#6B7A48FF, 12px) + dot (#7A8B55, 8×8)
        */}
        <div className="flex items-center gap-2">
          <Sparkles
            className="size-3.5 shrink-0 text-[#5C6B3AAA]"
            aria-hidden
          />
          <p
            className="text-[12px] text-[#6B7A48FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Listening to your thoughts&hellip;
          </p>
          <span
            className="size-2 shrink-0 rounded-full bg-[#7A8B55]"
            aria-hidden
          />
        </div>

        {/* ── Notes Card ───────────────────────────────────────────────── */}
        {/*
          Design: glass card, cornerRadius 16, padding 20, gap 12.
          Label: "A note for future you" (14px / 600 / #2C331EDD)
          Textarea placeholder: "Anything you want to remember? (optional)"
          (14px / normal / #2C331E44), height 120, lineHeight 1.5.
        */}
        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          <label
            htmlFor="notes-input"
            className="text-[14px] font-semibold text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            A note for future you
          </label>
          <Textarea
            id="notes-input"
            placeholder="Anything you want to remember? (optional)"
            className="
              min-h-[120px] resize-none
              border-[color:var(--color-glass-border)]
              bg-[var(--color-glass-surface)]
              shadow-[var(--shadow-glass)]
              backdrop-blur
              text-[14px] leading-relaxed
            "
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          />
        </GlassCard>

        {/* ── Title Field (optional) ───────────────────────────────────── */}
        {/*
          Design: row, alignItems center, gap 8, cornerRadius 12,
          fill #8A9A5B12, border #8A9A5B20, height 44, padding [0,14].
          type icon (#5C6B3AAA, 16×16) + placeholder text (#2C331E55, 14px).
        */}
        <div
          className="flex h-11 items-center gap-2 rounded-[12px] border px-3.5"
          style={{
            background: "rgba(138,154,91,0.071)",
            borderColor: "rgba(138,154,91,0.125)",
          }}
        >
          <Type
            className="size-4 shrink-0 text-[#5C6B3AAA]"
            aria-hidden
          />
          <span
            className="text-[14px] text-[#2C331E55]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Add a title (optional)
          </span>
        </div>

        {/* ── Primary CTA: Continue ────────────────────────────────────── */}
        {/*
          Design: Primary Button component (e3E7Y ref), content "Continue",
          icon arrow-right. Full width, rounded-full.
        */}
        <Link
          href="/record/saved"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] transition-opacity active:opacity-80"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          Continue
          <ArrowRight className="size-4" aria-hidden />
        </Link>

        {/* ── Skip / Maybe later ───────────────────────────────────────── */}
        {/*
          Design: text only, center-aligned, 13px / normal / #6B7A48AA.
        */}
        <Link
          href="/record/saved"
          className="text-center text-[13px] text-[#6B7A48AA] transition-opacity active:opacity-60"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          Maybe later
        </Link>
      </div>
    </div>
  );
}
