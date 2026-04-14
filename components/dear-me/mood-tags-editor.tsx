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
          className="flex min-h-11 items-center gap-1 rounded-full border px-2.5 py-1.5 transition-opacity active:opacity-60"
          style={{
            background: "rgba(92,107,58,0.082)",
            borderColor: "rgba(92,107,58,0.133)",
          }}
        >
          <Sparkles className="size-2 text-[#5C6B3A77]" aria-hidden />
          <span
            className="text-[12px] font-medium text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            {m}
          </span>
          <X className="size-2.5 text-[#6B7A48AA]" aria-hidden />
        </button>
      ))}

      {tags.map((t) => (
        <button
          key={`tag-${t}`}
          type="button"
          onClick={() => removeTag(t)}
          aria-label={`Remove tag ${t}`}
          className="flex min-h-11 items-center gap-1 rounded-full border px-2.5 py-1.5 transition-opacity active:opacity-60"
          style={{
            background: "transparent",
            borderColor: "rgba(92,107,58,0.188)",
          }}
        >
          <span
            className="text-[12px] font-medium text-[#2C331EDD]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            #{t}
          </span>
          <X className="size-2.5 text-[#6B7A48AA]" aria-hidden />
        </button>
      ))}

      <Drawer>
        <DrawerTrigger
          disabled={moodsAtCap}
          className="flex min-h-11 items-center gap-1 rounded-full border border-dashed px-2.5 py-1.5 transition-opacity active:opacity-60 disabled:opacity-40"
          style={{
            background: "transparent",
            borderColor: "rgba(92,107,58,0.3)",
          }}
          aria-label="Add mood"
        >
          <Plus className="size-2.5 text-[#5C6B3AAA]" aria-hidden />
          <span
            className="text-[12px] font-medium text-[#5C6B3AAA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            mood
          </span>
        </DrawerTrigger>
        <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[430px] bg-[var(--color-glass-surface)] backdrop-blur-xl">
          <DrawerHeader className="px-6 pt-2">
            <DrawerTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#2C331EDD]">
              <Sparkles className="size-4 text-[#5C6B3ABB]" />
              Pick moods
            </DrawerTitle>
            <p className="text-[11px] font-medium text-[color:var(--color-muted-foreground)]">
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
                  className="flex min-h-11 items-center gap-1 rounded-full border px-3 py-2 transition-opacity active:opacity-60 disabled:opacity-30"
                  style={
                    selected
                      ? {
                          background: "rgba(92,107,58,0.2)",
                          borderColor: "rgba(92,107,58,0.4)",
                        }
                      : {
                          background: "transparent",
                          borderColor: "rgba(92,107,58,0.188)",
                        }
                  }
                >
                  {selected && (
                    <Sparkles className="size-2.5 text-[#5C6B3A]" aria-hidden />
                  )}
                  <span
                    className="text-[13px] font-medium text-[#2C331EDD]"
                    style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
                  >
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
          className="flex min-h-11 items-center gap-1 rounded-full border border-dashed px-2.5 py-1.5 transition-opacity active:opacity-60 disabled:opacity-40"
          style={{
            background: "transparent",
            borderColor: "rgba(92,107,58,0.3)",
          }}
          aria-label="Add tag"
        >
          <Plus className="size-2.5 text-[#5C6B3AAA]" aria-hidden />
          <span
            className="text-[12px] font-medium text-[#5C6B3AAA]"
            style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
          >
            tag
          </span>
        </DrawerTrigger>
        <DrawerContent className="left-1/2! right-auto! -translate-x-1/2 w-full max-w-[430px] bg-[var(--color-glass-surface)] backdrop-blur-xl">
          <DrawerHeader className="px-6 pt-2">
            <DrawerTitle className="text-[15px] font-semibold text-[#2C331EDD]">
              Add a tag
            </DrawerTitle>
            <p className="text-[11px] font-medium text-[color:var(--color-muted-foreground)]">
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
              className="flex-1 rounded-full border px-4 py-2.5 text-[14px] text-[#2C331EDD] outline-none"
              style={{
                background: "rgba(255,255,255,0.5)",
                borderColor: "rgba(92,107,58,0.2)",
                fontFamily: "var(--font-geist-sans, Geist, sans-serif)",
              }}
            />
            <button
              type="submit"
              disabled={!tagInput.trim()}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-semibold text-[color:var(--color-primary-foreground)] transition-opacity active:opacity-80 disabled:opacity-40"
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
