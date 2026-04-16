"use client";

import { useRef } from "react";
import { FileText, Leaf } from "lucide-react";

import { GlassCard } from "@/components/dear-me/glass-card";
import { MemoVideo } from "@/components/dear-me/memo-video";
import { MoodTagsEditor } from "@/components/dear-me/mood-tags-editor";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDuration, formatRelativeTime } from "@/lib/format/time";
import type { Memo, MoodSourceMap } from "@/lib/db/schema";

const SECTION_LABEL =
  "flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-muted-foreground)]";
const SERIF_CLASS = "font-[family-name:var(--font-display)] italic";

type MemoStackMode = "draft" | "final";

type MoodChange = {
  moods: string[];
  tags: string[];
  moodSources: MoodSourceMap;
};

type MemoStackProps = {
  memo: Memo;
  mode: MemoStackMode;
  onTitleSave?: (next: string) => void;
  onNoteSave?: (next: string) => void;
  onMoodsChange?: (next: MoodChange) => void;
  /** final only: link target for the play overlay */
  playbackHref?: string;
  /** Auto-play the video on mount. Ignored when playbackHref is set. */
  autoPlayVideo?: boolean;
};

export function MemoStack({
  memo,
  mode,
  onTitleSave,
  onNoteSave,
  onMoodsChange,
  playbackHref,
  autoPlayVideo,
}: MemoStackProps) {
  return (
    <div className="flex flex-col gap-5">
      <TitleHero memo={memo} onTitleSave={onTitleSave} />

      <MemoVideo
        filename={memo.filename}
        playbackHref={playbackHref}
        autoPlay={autoPlayVideo}
      />

      <MoodsSection memo={memo} mode={mode} onMoodsChange={onMoodsChange} />

      <NoteSection memo={memo} mode={mode} onNoteSave={onNoteSave} />

      <TranscriptSection memo={memo} />
    </div>
  );
}

function TitleHero({
  memo,
  onTitleSave,
}: {
  memo: Memo;
  onTitleSave?: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayTitle =
    memo.title?.trim() || memo.suggestedTitle?.trim() || "";
  const placeholder =
    memo.analysisStatus === "ready" || displayTitle
      ? "Untitled"
      : "writing a title for you…";

  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <input
        ref={inputRef}
        key={`${memo.id}:${displayTitle}`}
        defaultValue={displayTitle}
        aria-label="Memo title"
        placeholder={placeholder}
        onBlur={(e) => {
          const next = e.target.value.trim();
          if (!next || next === displayTitle) {
            e.target.value = displayTitle;
            return;
          }
          onTitleSave?.(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          }
        }}
        className={`${SERIF_CLASS} w-full bg-transparent text-center text-[length:var(--text-title)] font-bold leading-tight text-foreground outline-none placeholder:italic placeholder:text-[color:var(--color-muted-foreground)]/60 focus:rounded-md focus:bg-[color:var(--color-mood-chip-bg)] focus:px-2`}
      />
      <p className="text-xs text-[color:var(--color-muted-foreground)]">
        {formatRelativeTime(memo.createdAt)} · {formatDuration(memo.durationMs)}
      </p>
    </div>
  );
}

function MoodsSection({
  memo,
  mode,
  onMoodsChange,
}: {
  memo: Memo;
  mode: MemoStackMode;
  onMoodsChange?: (next: MoodChange) => void;
}) {
  if (memo.analysisStatus === "ready") {
    return (
      <MoodTagsEditor
        moods={memo.moods ?? []}
        tags={memo.tags}
        moodSources={memo.moodSources}
        onChange={(next) => onMoodsChange?.(next)}
      />
    );
  }
  if (memo.analysisStatus === "failed") {
    return (
      <p className="px-2 text-xs text-[#B44]">
        Couldn&apos;t analyze this memo.
        {memo.analysisError ? ` ${memo.analysisError}` : ""}
      </p>
    );
  }
  if (mode === "final") return null;
  return (
    <p className="px-2 text-xs italic text-[color:var(--color-muted-foreground)]">
      {memo.transcriptStatus === "ready"
        ? "Reading the room…"
        : "Listening for moods…"}
    </p>
  );
}

function NoteSection({
  memo,
  mode,
  onNoteSave,
}: {
  memo: Memo;
  mode: MemoStackMode;
  onNoteSave?: (next: string) => void;
}) {
  const placeholder =
    mode === "draft" ? "What did you want to tell your future self?" : "Add a note…";

  return (
    <GlassCard className="flex flex-col gap-2">
      <p className={SECTION_LABEL}>
        <Leaf className="size-3.5" />
        Your note
      </p>
      <Textarea
        key={memo.id}
        defaultValue={memo.notes}
        onBlur={(e) => {
          const next = e.target.value;
          if (next === memo.notes) return;
          onNoteSave?.(next);
        }}
        placeholder={placeholder}
        className={`${SERIF_CLASS} min-h-[140px] resize-none rounded-none border-0 bg-transparent px-0 py-1 text-base leading-relaxed text-foreground shadow-none placeholder:italic placeholder:text-[color:var(--color-muted-foreground)]/60 focus-visible:ring-0`}
      />
    </GlassCard>
  );
}

function TranscriptSection({ memo }: { memo: Memo }) {
  const ready = memo.transcriptStatus === "ready" && memo.transcript;
  const failed = memo.transcriptStatus === "failed";

  return (
    <Drawer>
      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className={SECTION_LABEL}>
            <FileText className="size-3.5" />
            Transcript
          </p>
          {ready ? (
            <DrawerTrigger className="text-xs font-semibold text-[color:var(--color-primary)] transition-opacity active:opacity-60">
              View full
            </DrawerTrigger>
          ) : null}
        </div>
        {ready ? (
          <p
            className={`${SERIF_CLASS} line-clamp-4 text-base leading-relaxed text-foreground/85`}
          >
            &ldquo;{memo.transcript}&rdquo;
          </p>
        ) : failed ? (
          <p className="text-sm text-[#B44]">
            Couldn&apos;t transcribe this memo.
            {memo.transcriptError ? ` ${memo.transcriptError}` : ""}
          </p>
        ) : (
          <p className="text-sm italic text-[color:var(--color-muted-foreground)]">
            Transcribing…
          </p>
        )}
      </GlassCard>

      <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[var(--width-mobile-frame)] bg-[var(--color-glass-surface)] backdrop-blur-xl">
        <DrawerHeader className="px-6 pt-2">
          <DrawerTitle className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <FileText className="size-4 text-[color:var(--color-primary)]" />
            Transcript
          </DrawerTitle>
          <p className="text-[length:var(--text-caption)] font-medium uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
            {formatDuration(memo.durationMs)} recording
          </p>
        </DrawerHeader>
        <ScrollArea className="max-h-[60vh] px-6 pb-8">
          <p
            className={`${SERIF_CLASS} whitespace-pre-wrap text-[length:var(--text-body)] leading-relaxed text-foreground/85`}
          >
            {memo.transcript}
          </p>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
