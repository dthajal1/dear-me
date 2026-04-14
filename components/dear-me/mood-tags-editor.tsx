"use client";

import { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { MOODS } from "@/lib/analysis/moods";

const MAX_MOODS = 3;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 24;

type Props = {
  moods: string[];
  tags: string[];
  onChange: (next: { moods: string[]; tags: string[] }) => void;
};

export function MoodTagsEditor({ moods, tags, onChange }: Props) {
  const [tagInput, setTagInput] = useState("");
  const [tagOpen, setTagOpen] = useState(false);

  const moodsAtCap = moods.length >= MAX_MOODS;
  const tagsAtCap = tags.length >= MAX_TAGS;

  function removeMood(m: string) {
    onChange({ moods: moods.filter((x) => x !== m), tags });
  }
  function removeTag(t: string) {
    onChange({ moods, tags: tags.filter((x) => x !== t) });
  }
  function toggleMood(m: string) {
    if (moods.includes(m)) {
      removeMood(m);
      return;
    }
    if (moodsAtCap) return;
    onChange({ moods: [...moods, m], tags });
  }
  function addTag() {
    const next = tagInput.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (!next) return;
    if (tags.includes(next)) {
      setTagInput("");
      return;
    }
    if (tagsAtCap) return;
    onChange({ moods, tags: [...tags, next] });
    setTagInput("");
    setTagOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((m) => (
        <button
          key={`mood-${m}`}
          type="button"
          onClick={() => removeMood(m)}
          aria-label={`Remove mood ${m}`}
          className="flex min-h-11 items-center gap-1 rounded-full border border-[color:var(--color-encouragement-border)] bg-[color:var(--color-encouragement-bg)] px-2.5 py-1.5 transition-opacity active:opacity-60"
        >
          <Sparkles className="size-2 text-[color:var(--color-primary)]/55" aria-hidden />
          <span className="text-xs font-medium text-foreground">{m}</span>
          <X className="size-2.5 text-[color:var(--color-muted-foreground)]" aria-hidden />
        </button>
      ))}

      {tags.map((t) => (
        <button
          key={`tag-${t}`}
          type="button"
          onClick={() => removeTag(t)}
          aria-label={`Remove tag ${t}`}
          className="flex min-h-11 items-center gap-1 rounded-full border border-[color:var(--color-tag-chip-border)] bg-transparent px-2.5 py-1.5 transition-opacity active:opacity-60"
        >
          <span className="text-xs font-medium text-foreground">#{t}</span>
          <X className="size-2.5 text-[color:var(--color-muted-foreground)]" aria-hidden />
        </button>
      ))}

      <Drawer>
        <DrawerTrigger
          disabled={moodsAtCap}
          className="flex min-h-11 items-center gap-1 rounded-full border border-dashed border-[color:var(--color-primary)]/40 bg-transparent px-2.5 py-1.5 transition-opacity active:opacity-60 disabled:opacity-40"
          aria-label="Add mood"
        >
          <Plus className="size-2.5 text-[color:var(--color-muted-foreground)]" aria-hidden />
          <span className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
            mood
          </span>
        </DrawerTrigger>
        <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[var(--width-mobile-frame)] bg-[var(--color-glass-surface)] backdrop-blur-xl">
          <DrawerHeader className="px-6 pt-2">
            <DrawerTitle className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
              <Sparkles className="size-4 text-[color:var(--color-primary)]" />
              Pick moods
            </DrawerTitle>
            <p className="text-[length:var(--text-caption)] font-medium text-[color:var(--color-muted-foreground)]">
              Up to {MAX_MOODS} — tap to toggle
            </p>
          </DrawerHeader>
          <div className="flex flex-wrap gap-2 px-6 pb-8">
            {MOODS.map((m) => {
              const selected = moods.includes(m);
              const disabled = !selected && moodsAtCap;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleMood(m)}
                  className={
                    "flex min-h-11 items-center gap-1 rounded-full border px-3 py-2 transition-opacity active:opacity-60 disabled:opacity-30 " +
                    (selected
                      ? "border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/20"
                      : "border-[color:var(--color-tag-chip-border)] bg-transparent")
                  }
                >
                  {selected && (
                    <Sparkles className="size-2.5 text-[color:var(--color-primary)]" aria-hidden />
                  )}
                  <span className="text-[length:var(--text-small)] font-medium text-foreground">
                    {m}
                  </span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={tagOpen} onOpenChange={setTagOpen}>
        <DrawerTrigger
          disabled={tagsAtCap}
          className="flex min-h-11 items-center gap-1 rounded-full border border-dashed border-[color:var(--color-primary)]/40 bg-transparent px-2.5 py-1.5 transition-opacity active:opacity-60 disabled:opacity-40"
          aria-label="Add tag"
        >
          <Plus className="size-2.5 text-[color:var(--color-muted-foreground)]" aria-hidden />
          <span className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
            tag
          </span>
        </DrawerTrigger>
        <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[var(--width-mobile-frame)] bg-[var(--color-glass-surface)] backdrop-blur-xl">
          <DrawerHeader className="px-6 pt-2">
            <DrawerTitle className="text-[15px] font-semibold text-foreground">
              Add a tag
            </DrawerTitle>
            <p className="text-[length:var(--text-caption)] font-medium text-[color:var(--color-muted-foreground)]">
              Up to {MAX_TAGS} — short topic words like work, family, sleep
            </p>
          </DrawerHeader>
          <form
            className="flex gap-2 px-6 pb-8"
            onSubmit={(e) => {
              e.preventDefault();
              addTag();
            }}
          >
            <input
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              maxLength={MAX_TAG_LENGTH}
              placeholder="e.g. work"
              className="flex-1 rounded-full border border-[color:var(--color-tag-chip-border)] bg-white/50 px-4 py-2.5 text-sm text-foreground outline-none"
            />
            <button
              type="submit"
              disabled={!tagInput.trim()}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-[length:var(--text-small)] font-semibold text-[color:var(--color-primary-foreground)] transition-opacity active:opacity-80 disabled:opacity-40"
            >
              Add
            </button>
            <DrawerClose className="sr-only">Close</DrawerClose>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
