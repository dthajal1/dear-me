import Link from "next/link";
import {
  CheckCircle,
  FileText,
  Heart,
  Lock,
  PencilLine,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { GlassCard } from "@/components/dear-me/glass-card";

/**
 * Record Review screen — "Review & Save v2" (XkO1O)
 *
 * Shown after processing is complete so the user can review their captured
 * memo before saving. Design elements (matching the XkO1O frame exactly):
 *
 *   • BackHeader: "← Back" pill + title area
 *   • Title: "Review & Save" / subtitle "Here's what we captured"
 *   • Video Thumbnail placeholder (160px tall) with REC badge + duration
 *   • AI Ready banner: check icon + "We heard you — here's what stood out"
 *   • Mood Tags section: AI-suggested tags (overwhelmed, anxious, sad, stressed) + Add
 *   • Transcript section (glass card): italic excerpt + "View full transcript"
 *   • Note Preview section (glass card): static note + "Edit note"
 *   • Primary CTA: "Save Memo"
 *   • Secondary: "Start over" → /record/trigger
 *   • Privacy note at bottom
 *
 * Route: /record/review
 * Layout: record/layout.tsx provides ScreenBackground
 * Next: /record/add-notes (future — for now Save Memo links there)
 */

const STATIC_TAGS = [
  { label: "overwhelmed", aiSuggested: true },
  { label: "anxious", aiSuggested: true },
  { label: "sad", aiSuggested: true },
  { label: "stressed", aiSuggested: false },
];

export default function RecordReviewPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <BackHeader backHref="/record/processing" title="" />

      <div className="flex flex-1 flex-col gap-4 px-5 pb-8 pt-0">
        {/* ── Screen title ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 px-1">
          <h1
            className="text-[26px] font-bold leading-tight text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Review &amp; Save
          </h1>
          <p
            className="text-[13px] text-[#6B7A48AA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Here&apos;s what we captured
          </p>
        </div>

        {/* ── Video Thumbnail ──────────────────────────────────────────── */}
        {/*
          Design: cornerRadius 20, fill image (placeholder here), height 160,
          absolute-positioned REC badge (top-left) and Duration badge (top-right).
        */}
        <div
          className="relative h-40 w-full overflow-hidden rounded-[20px] border"
          style={{
            borderColor: "rgba(138,154,91,0.125)",
            background:
              "linear-gradient(135deg, #d8e0c4 0%, #c8d4b0 40%, #b8c89a 100%)",
          }}
          aria-label="Memo video thumbnail"
        >
          {/* Checkerboard placeholder pattern (no real video yet) */}
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
            <span
              className="size-2 rounded-full bg-[#E53E3E]"
              aria-hidden
            />
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

        {/* ── AI Ready banner ──────────────────────────────────────────── */}
        {/*
          Design: cornerRadius 10, fill #5C6B3A15, border #5C6B3A20,
          padding [8,12], row, gap 8, icon circle-check + text.
        */}
        <div
          className="flex items-center gap-2 rounded-[10px] border px-3 py-2"
          style={{
            background: "rgba(92,107,58,0.082)",
            borderColor: "rgba(92,107,58,0.125)",
          }}
        >
          <CheckCircle
            className="size-4 shrink-0 text-[#5C6B3ABB]"
            aria-hidden
          />
          <p
            className="text-[12px] font-medium text-[#4D5A35FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            We heard you — here&apos;s what stood out
          </p>
        </div>

        {/* ── Mood Tags section ────────────────────────────────────────── */}
        {/*
          Design: vertical layout, gap 8.
          Header row: Heart icon + "Moods" label + "Tap × to remove" hint.
          Tags row 1: overwhelmed, anxious, sad (AI suggested — with sparkle icon).
          Tags row 2: stressed (no sparkle, outline style) + Add button.
        */}
        <div className="flex flex-col gap-2">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart
                className="size-3.5 text-[#5C6B3ABB]"
                aria-hidden
              />
              <span
                className="text-[14px] font-semibold text-[#2C331EDD]"
                style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
              >
                Moods
              </span>
            </div>
            <span
              className="text-[11px] text-[#6B7A48AA]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Tap × to remove
            </span>
          </div>

          {/* Tags rows */}
          <div className="flex flex-wrap gap-2">
            {STATIC_TAGS.map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-1 rounded-full border px-2.5 py-1.5"
                style={
                  tag.aiSuggested
                    ? {
                        background: "rgba(92,107,58,0.082)",
                        borderColor: "rgba(92,107,58,0.133)",
                      }
                    : {
                        background: "transparent",
                        borderColor: "rgba(92,107,58,0.188)",
                      }
                }
              >
                {tag.aiSuggested && (
                  <Sparkles
                    className="size-2 text-[#5C6B3A77]"
                    aria-hidden
                  />
                )}
                <span
                  className="text-[12px] font-medium text-[#2C331EDD]"
                  style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
                >
                  {tag.label}
                </span>
                <X
                  className="size-2.5 text-[#6B7A48AA]"
                  aria-hidden
                />
              </div>
            ))}

            {/* Add button */}
            <div
              className="flex items-center gap-1 rounded-full border px-2.5 py-1.5"
              style={{
                background: "transparent",
                borderColor: "rgba(92,107,58,0.188)",
              }}
            >
              <Plus className="size-2.5 text-[#5C6B3AAA]" aria-hidden />
              <span
                className="text-[12px] font-medium text-[#5C6B3AAA]"
                style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
              >
                Add
              </span>
            </div>
          </div>
        </div>

        {/* ── Transcript section ───────────────────────────────────────── */}
        {/*
          Design: glass card, cornerRadius 16, gap 12, padding 16.
          Header: doc icon + "Transcript" label.
          Body: italic excerpt in #4D5A35FF.
          Footer: "View full transcript" link in #5C6B3AFF.
        */}
        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          {/* Card header */}
          <div className="flex items-center gap-1.5">
            <FileText
              className="size-3.5 text-[#5C6B3ABB]"
              aria-hidden
            />
            <span
              className="text-[14px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Transcript
            </span>
          </div>

          {/* Excerpt */}
          <p
            className="text-[13px] italic leading-relaxed text-[#4D5A35FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            &ldquo;Work has been really overwhelming lately. I feel like I
            can&apos;t keep up with everything...&rdquo;
          </p>

          {/* View link */}
          <span
            className="text-[13px] font-semibold text-[#5C6B3AFF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            View full transcript
          </span>
        </GlassCard>

        {/* ── Note Preview section ─────────────────────────────────────── */}
        {/*
          Design: glass card identical structure, pencil icon + "Your note".
          Body: note text (not italic).
          Footer: "Edit note" link.
        */}
        <GlassCard className="flex flex-col gap-3 !rounded-2xl">
          {/* Card header */}
          <div className="flex items-center gap-1.5">
            <PencilLine
              className="size-3.5 text-[#5C6B3ABB]"
              aria-hidden
            />
            <span
              className="text-[14px] font-semibold text-[#2C331EDD]"
              style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
            >
              Your note
            </span>
          </div>

          {/* Note content */}
          <p
            className="text-[13px] leading-relaxed text-[#4D5A35FF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Work has been a lot lately. Need to remember this feeling so I can
            appreciate when things get better.
          </p>

          {/* Edit link */}
          <Link
            href="/record/add-notes"
            className="text-[13px] font-semibold text-[#5C6B3AFF]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Edit note
          </Link>
        </GlassCard>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="mt-2 flex flex-col items-center gap-3">
          {/* Primary: Save Memo */}
          <Link
            href="/record/add-notes"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)] transition-opacity active:opacity-80"
          >
            <CheckCircle className="size-4" aria-hidden />
            Save Memo
          </Link>

          {/* Secondary: Start over */}
          <Link
            href="/record/trigger"
            className="text-[13px] font-medium text-[#6B7A48AA] transition-opacity active:opacity-60"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Start over
          </Link>
        </div>

        {/* ── Privacy note ─────────────────────────────────────────────── */}
        {/*
          Design: row, justifyContent center, gap 6, lock icon + text.
          fill #8A9A5B55 on both icon and text.
        */}
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="size-3 text-[#8A9A5B55]" aria-hidden />
          <span
            className="text-[11px] text-[#8A9A5B55]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            Only you can see these — always
          </span>
        </div>
      </div>
    </div>
  );
}
