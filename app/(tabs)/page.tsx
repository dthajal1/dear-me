"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { MoodChip } from "@/components/dear-me/mood-chip";
import { EmptyState } from "@/components/dear-me/empty-state";
import { ResurfacedMemoCard } from "@/components/dear-me/resurfaced-memo-card";
import {
  createCheckIn,
  deleteCheckIn,
  getTodayCheckIns,
} from "@/lib/db/checkIns";
import { listMemos } from "@/lib/db/memos";
import {
  pickResurfacedMemo,
  type ResurfacedPick,
} from "@/lib/home/pickResurfacedMemo";

const UNDO_WINDOW_MS = 5000;
const MOOD_DWELL_MS = 60 * 60 * 1000;

function dwellRemainingMs(createdAt: number): number {
  return createdAt + MOOD_DWELL_MS - Date.now();
}

type Greeting = { text: string; emoji: string };

const FALLBACK_GREETING: Greeting = { text: "Hello", emoji: "👋" };

function computeGreeting(now: Date = new Date()): Greeting {
  const h = now.getHours();
  if (h < 5) return { text: "Still up", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "👋" };
  if (h < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

const subscribeNoop = () => () => {};
const getServerGreeting = () => FALLBACK_GREETING;

let cachedGreetingHour = -1;
let cachedGreeting: Greeting = FALLBACK_GREETING;
function getClientGreeting(): Greeting {
  const h = new Date().getHours();
  if (h !== cachedGreetingHour) {
    cachedGreetingHour = h;
    cachedGreeting = computeGreeting();
  }
  return cachedGreeting;
}

// Toggle this to preview the empty state in dev.
const HAS_DATA = true;

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🤩", label: "Excited" },
];

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const greeting = useSyncExternalStore(
    subscribeNoop,
    getClientGreeting,
    getServerGreeting,
  );
  const [pendingUndo, setPendingUndo] = useState<{
    id: string;
    mood: string;
  } | null>(null);
  const [resurfaced, setResurfaced] = useState<ResurfacedPick | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDwellTimer = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const scheduleDwellExpiry = useCallback(
    (createdAt: number) => {
      clearDwellTimer();
      const remaining = dwellRemainingMs(createdAt);
      if (remaining <= 0) {
        setSelectedMood(null);
        return;
      }
      dwellTimerRef.current = setTimeout(() => {
        setSelectedMood(null);
        dwellTimerRef.current = null;
      }, remaining);
    },
    [clearDwellTimer],
  );

  useEffect(() => {
    let cancelled = false;
    void getTodayCheckIns().then((entries) => {
      if (cancelled) return;
      const latest = entries[0];
      if (!latest) return;
      if (dwellRemainingMs(latest.createdAt) <= 0) return;
      setSelectedMood(latest.mood);
      scheduleDwellExpiry(latest.createdAt);
    });
    return () => {
      cancelled = true;
    };
  }, [scheduleDwellExpiry]);

  useEffect(() => {
    let cancelled = false;
    void listMemos({ status: "final" }).then((memos) => {
      if (cancelled) return;
      setResurfaced(pickResurfacedMemo(memos, new Date()));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  function clearUndoTimer() {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  async function handleMoodTap(mood: string) {
    setSelectedMood(mood);
    clearUndoTimer();
    try {
      const entry = await createCheckIn({ mood, source: "chip" });
      setPendingUndo({ id: entry.id, mood });
      undoTimerRef.current = setTimeout(() => {
        setPendingUndo(null);
        undoTimerRef.current = null;
      }, UNDO_WINDOW_MS);
      scheduleDwellExpiry(entry.createdAt);
    } catch (err) {
      console.error("[dear-me] check-in failed", err);
    }
  }

  async function handleUndo() {
    if (!pendingUndo) return;
    const { id } = pendingUndo;
    clearUndoTimer();
    setPendingUndo(null);
    try {
      await deleteCheckIn(id);
      const entries = await getTodayCheckIns();
      const latest = entries[0];
      if (latest && dwellRemainingMs(latest.createdAt) > 0) {
        setSelectedMood(latest.mood);
        scheduleDwellExpiry(latest.createdAt);
      } else {
        setSelectedMood(null);
        clearDwellTimer();
      }
    } catch (err) {
      console.error("[dear-me] undo check-in failed", err);
    }
  }

  if (!HAS_DATA) {
    return (
      <EmptyState
        icon={<Video className="size-8" />}
        title="Dear Me"
        subtitle="Record video memos to your future self"
        cta={{ label: "Record a Memo", href: "/record/camera" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 px-5 pt-6 pb-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
          {greeting.text} {greeting.emoji}
        </p>
        <h1 className="text-[32px] font-bold leading-tight text-foreground">
          Dear Me
        </h1>
      </header>

      {/* Hero — record a memo. Solid primary surface so it owns the page. */}
      <Link
        href="/record/camera"
        className="group flex items-center gap-4 rounded-3xl bg-[color:var(--color-primary)] p-6 text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-glass)] transition-transform active:scale-[0.98]"
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Video className="size-7" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Record a Memo</h2>
          <p className="text-[13px] opacity-80">A message to your future self</p>
        </div>
      </Link>

      {/* Quick check-in — secondary affordance */}
      <section
        aria-labelledby="quick-checkin-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="quick-checkin-heading"
          className="text-[13px] font-semibold text-foreground/70"
        >
          How are you feeling?
        </h2>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <MoodChip
              key={m.label}
              emoji={m.emoji}
              label={m.label}
              selected={selectedMood === m.label}
              onClick={() => void handleMoodTap(m.label)}
            />
          ))}
        </div>
        {pendingUndo ? (
          <div
            className="animate-in fade-in flex items-center justify-center gap-2 text-[11px] text-[color:var(--color-muted-foreground)]"
            role="status"
            aria-live="polite"
          >
            <span>Checked in as {pendingUndo.mood}</span>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => void handleUndo()}
              className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
            >
              Undo
            </button>
          </div>
        ) : selectedMood ? (
          <Link
            href="/record/camera"
            className="px-1 text-center text-[12px] italic leading-relaxed text-[color:var(--color-muted-foreground)] hover:text-foreground"
          >
            Feeling {selectedMood.toLowerCase()}? Tell future-you why →
          </Link>
        ) : (
          <p className="px-1 text-center text-[12px] italic leading-relaxed text-[color:var(--color-muted-foreground)]/70">
            Not sure what to say? Try: “What are you grateful for right now?”
          </p>
        )}
      </section>

      {/* A memory — resurfaces a past memo when one is old enough to surface. */}
      {resurfaced ? (
        <section aria-label="A memory from your past self">
          <ResurfacedMemoCard
            memo={resurfaced.memo}
            label={resurfaced.label}
          />
        </section>
      ) : null}
    </div>
  );
}
