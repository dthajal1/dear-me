"use client";

/**
 * DEV-ONLY scratch page. Seeds a fake "final" memo into IndexedDB with
 * createdAt set to one year ago today so the home-screen resurfacing
 * card has something to surface. Delete this file once the feature is
 * verified.
 */

import { useState } from "react";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import {
  STORE_INSIGHT_THREADS,
  STORE_MEMOS,
  type InsightThread,
  type Memo,
} from "@/lib/db/schema";

type Status = "idle" | "seeding" | "done" | "error";

export default function SeedResurfacedPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function seed(offset: { years?: number; months?: number; days?: number }) {
    setStatus("seeding");
    try {
      const created = new Date();
      if (offset.years) created.setFullYear(created.getFullYear() - offset.years);
      if (offset.months) created.setMonth(created.getMonth() - offset.months);
      if (offset.days) created.setDate(created.getDate() - offset.days);

      const memo: Memo = {
        id: crypto.randomUUID(),
        filename: `seed-fake-${Date.now()}.webm`,
        mimeType: "video/webm",
        durationMs: 42_000,
        sizeBytes: 0,
        title: "A test memo from past you",
        notes: "Seeded for resurfacing smoke test.",
        tags: [],
        status: "final",
        thumbnailFilename: `seed-fake-thumb-${Date.now()}.jpg`,
        createdAt: created.getTime(),
        updatedAt: created.getTime(),
      };

      const db = await getDb();
      await db.put(STORE_MEMOS, memo);

      setStatus("done");
      setMessage(`Seeded memo ${memo.id} dated ${created.toLocaleString()}`);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function seedRich() {
    setStatus("seeding");
    try {
      const created = new Date();
      created.setMonth(created.getMonth() - 3);

      // Generate thumbnail via canvas
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, "#8A9A5B");
      grad.addColorStop(0.5, "#5C6B3A");
      grad.addColorStop(1, "#2C331E");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(155, 120);
      ctx.lineTo(155, 280);
      ctx.lineTo(280, 200);
      ctx.closePath();
      ctx.fill();
      const blob: Blob = await new Promise((r) =>
        canvas.toBlob((b) => r(b!), "image/jpeg", 0.9),
      );

      // Write thumbnail to OPFS
      const thumbName = "seed-fake-rich-thumb.jpg";
      const root = await navigator.storage.getDirectory();
      const fh = await root.getFileHandle(thumbName, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();

      const memo: Memo = {
        id: "seed-rich-memo",
        filename: "seed-fake-rich-video.webm",
        mimeType: "video/webm",
        durationMs: 47_000,
        sizeBytes: 1_024_000,
        title: "First day at the new job",
        notes:
          "I was so nervous walking in this morning, but everyone was incredibly welcoming. Sarah from the design team even brought me coffee. I want to remember this feeling.",
        tags: ["work", "gratitude"],
        status: "final",
        transcript:
          "Today was my first day at the new job and I have to say, I was really nervous going in. I barely slept last night. But the moment I walked through the door, everyone was so kind. My manager introduced me to the whole team, and Sarah from design brought me a coffee without even asking. I just want to remember how grateful I feel right now, because I know in a few weeks this will all feel normal and I might forget how special today was.",
        transcriptStatus: "ready",
        moods: ["grateful", "hopeful", "anxious"],
        moodSources: { grateful: "ai", hopeful: "ai", anxious: "user" },
        analysisStatus: "ready",
        thumbnailFilename: thumbName,
        suggestedTitle: "First day at the new job",
        createdAt: created.getTime(),
        updatedAt: created.getTime(),
      };

      const db = await getDb();
      await db.put(STORE_MEMOS, memo);

      setStatus("done");
      setMessage(`Seeded rich memo ${memo.id}`);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  function generateThumbnail(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    variant: "warm" | "cool",
  ) {
    // Warm ambient background
    const bg = ctx.createRadialGradient(
      w * 0.5,
      h * 0.4,
      w * 0.1,
      w * 0.5,
      h * 0.5,
      w * 0.7,
    );
    if (variant === "warm") {
      bg.addColorStop(0, "#6B5B3A");
      bg.addColorStop(0.4, "#4A3F2E");
      bg.addColorStop(1, "#2A2118");
    } else {
      bg.addColorStop(0, "#3A5B5B");
      bg.addColorStop(0.4, "#2E3F4A");
      bg.addColorStop(1, "#18212A");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Soft bokeh circles
    const circles =
      variant === "warm"
        ? [
            { x: 0.2, y: 0.3, r: 40, a: 0.06 },
            { x: 0.75, y: 0.25, r: 55, a: 0.05 },
            { x: 0.6, y: 0.7, r: 35, a: 0.07 },
            { x: 0.15, y: 0.75, r: 45, a: 0.04 },
            { x: 0.85, y: 0.6, r: 30, a: 0.06 },
          ]
        : [
            { x: 0.3, y: 0.2, r: 45, a: 0.05 },
            { x: 0.7, y: 0.35, r: 50, a: 0.06 },
            { x: 0.5, y: 0.8, r: 38, a: 0.05 },
            { x: 0.1, y: 0.6, r: 42, a: 0.04 },
            { x: 0.9, y: 0.75, r: 33, a: 0.07 },
          ];
    for (const c of circles) {
      const g = ctx.createRadialGradient(
        w * c.x,
        h * c.y,
        0,
        w * c.x,
        h * c.y,
        c.r,
      );
      g.addColorStop(0, `rgba(255,255,255,${c.a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Central warm glow (simulating a face/subject)
    const center = ctx.createRadialGradient(
      w * 0.5,
      h * 0.38,
      0,
      w * 0.5,
      h * 0.42,
      w * 0.28,
    );
    center.addColorStop(0, "rgba(255,220,180,0.12)");
    center.addColorStop(0.5, "rgba(255,200,150,0.06)");
    center.addColorStop(1, "rgba(255,180,120,0)");
    ctx.fillStyle = center;
    ctx.fillRect(0, 0, w, h);
  }

  async function seedFullStory() {
    setStatus("seeding");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;

      const thumbName1 = "seed-fake-story-thumb-1.jpg";
      const thumbName2 = "seed-fake-story-thumb-2.jpg";
      const root = await navigator.storage.getDirectory();

      // Generate two different-toned thumbnails
      for (const [name, variant] of [
        [thumbName1, "warm"],
        [thumbName2, "cool"],
      ] as const) {
        generateThumbnail(ctx, 400, 400, variant);
        const blob: Blob = await new Promise((r) =>
          canvas.toBlob((b) => r(b!), "image/jpeg", 0.92),
        );
        const fh = await root.getFileHandle(name, { create: true });
        const w = await fh.createWritable();
        await w.write(blob);
        await w.close();
      }

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const elevenMonthsAgo = new Date();
      elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

      const db = await getDb();

      // Memo 1: resurfaced on home (from 1 year ago)
      const memo1: Memo = {
        id: "seed-story-1",
        filename: "seed-fake-story-1.webm",
        mimeType: "video/webm",
        durationMs: 31_000,
        sizeBytes: 640_000,
        title: "I went outside today",
        notes: "ate a real meal. went for a walk. thats it thats the win",
        tags: ["self-care"],
        status: "final",
        transcript:
          "Okay so... I almost didn't do this today. I've been in bed most of the day honestly. But I made myself go outside, just like around the block, nothing crazy. And I don't know, the air felt nice? Like I forgot what that felt like. And then I came back and actually cooked something instead of just... eating cereal again. So yeah. That's it. That's my big accomplishment for today. Future me, if you're watching this, I hope you're doing better. But if you're not, just like... go outside. It helps. I think.",
        transcriptStatus: "ready",
        moods: ["tired", "calm"],
        moodSources: { tired: "ai", calm: "ai" },
        analysisStatus: "ready",
        thumbnailFilename: thumbName1,
        suggestedTitle: "I went outside today",
        createdAt: oneYearAgo.getTime(),
        updatedAt: oneYearAgo.getTime(),
      };

      // Memo 2: the detail page (from 11 months ago)
      const memo2: Memo = {
        id: "seed-story-2",
        filename: "seed-fake-story-2.webm",
        mimeType: "video/webm",
        durationMs: 44_000,
        sizeBytes: 980_000,
        title: "Rough week but I'm here",
        notes: "cant sleep again. but K called and that helped. tomorrow ill try again",
        tags: ["growth"],
        status: "final",
        transcript:
          "Hey, um... it's like 11 something and I can't sleep so I figured I'd just talk for a bit. This week was like... a lot. I keep telling people I'm fine and I'm not really fine, I don't know why I do that. But okay, one good thing. K called me today, like totally random, wasn't even about anything. We just talked for like an hour about nothing. And I don't know, after that I felt like... a little less heavy? I guess. I don't have some big takeaway here. I'm just tired and I want to remember that K called. Because stuff like that matters and I always forget. Okay. I'm gonna try to sleep. Night, future me. Hope you're sleeping better than I am.",
        transcriptStatus: "ready",
        moods: ["overwhelmed", "tired", "grateful"],
        moodSources: { overwhelmed: "ai", tired: "ai", grateful: "user" },
        analysisStatus: "ready",
        thumbnailFilename: thumbName2,
        suggestedTitle: "Rough week but I'm here",
        createdAt: elevenMonthsAgo.getTime(),
        updatedAt: elevenMonthsAgo.getTime(),
      };

      await db.put(STORE_MEMOS, memo1);
      await db.put(STORE_MEMOS, memo2);

      // Insights thread
      const now = Date.now();
      const thread: InsightThread = {
        id: "seed-story-thread",
        title: "What helped me through tough times?",
        messages: [
          {
            id: "msg-1",
            role: "user",
            text: "What helped me get through tough times?",
            createdAt: now - 60_000,
          },
          {
            id: "msg-2",
            role: "assistant",
            text: "Every time you record on a hard day, you say something like \"that's it\" or \"it's not much.\" But those are the entries you keep coming back to. The things you almost didn't bother recording turned out to be the ones that matter most.\n\nOne other thing: your earlier entries, you'd tell everyone you were fine even when you weren't. But at some point you started saying \"I'm not okay\" out loud, first here, then to people around you. The honesty came before things got better, not after.",
            citedMemoIds: ["seed-story-1", "seed-story-2"],
            status: "ok",
            createdAt: now - 30_000,
          },
        ],
        createdAt: now - 60_000,
        updatedAt: now - 30_000,
      };

      await db.put(STORE_INSIGHT_THREADS, thread);

      setStatus("done");
      setMessage("Seeded full story: 2 memos + 1 insight thread");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function clearSeeded() {
    setStatus("seeding");
    try {
      const db = await getDb();
      const allMemos = await db.getAll(STORE_MEMOS);
      const seeded = allMemos.filter((m) => m.filename.startsWith("seed-fake-"));
      for (const m of seeded) {
        await db.delete(STORE_MEMOS, m.id);
      }
      const allThreads = await db.getAll(STORE_INSIGHT_THREADS);
      const seededThreads = allThreads.filter((t) =>
        t.id.startsWith("seed-story-"),
      );
      for (const t of seededThreads) {
        await db.delete(STORE_INSIGHT_THREADS, t.id);
      }
      setStatus("done");
      setMessage(
        `Cleared ${seeded.length} memo(s) + ${seededThreads.length} thread(s)`,
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">Seed resurfaced memo (dev only)</h1>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        Inserts a fake final memo into IndexedDB with a backdated{" "}
        <code>createdAt</code>. The thumbnail file does not exist on disk, so
        the card will render with an empty thumbnail tile — that is fine for a
        smoke test of the resurfacing logic.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void seed({ years: 1 })}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed memo from <strong>1 year ago today</strong>
        </button>
        <button
          type="button"
          onClick={() => void seed({ months: 6 })}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed memo from <strong>6 months ago today</strong>
        </button>
        <button
          type="button"
          onClick={() => void seed({ months: 1 })}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed memo from <strong>1 month ago today</strong>
        </button>
        <button
          type="button"
          onClick={() => void seed({ days: 7 })}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed memo from <strong>1 week ago today</strong>
        </button>
        <button
          type="button"
          onClick={() => void seed({ days: 90 })}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed memo from <strong>90 days ago</strong> (tier-6 archive case)
        </button>
        <button
          type="button"
          onClick={() => void seedRich()}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed <strong>rich memo</strong> (thumbnail + transcript + moods)
        </button>
        <button
          type="button"
          onClick={() => void seedFullStory()}
          className="rounded-xl bg-[color:var(--color-primary)] p-3 text-left text-[color:var(--color-primary-foreground)]"
        >
          Seed <strong>full story</strong> (2 memos + 1 insight thread)
        </button>
        <button
          type="button"
          onClick={() => void clearSeeded()}
          className="rounded-xl border border-[color:var(--color-glass-border)] p-3 text-left"
        >
          Clear all seeded memos
        </button>
      </div>

      {status !== "idle" ? (
        <p
          className={
            status === "error"
              ? "text-sm text-red-600"
              : "text-sm text-[color:var(--color-muted-foreground)]"
          }
        >
          {status === "seeding" ? "Working…" : message}
        </p>
      ) : null}

      <Link
        href="/"
        className="mt-4 text-sm text-[color:var(--color-primary)] underline"
      >
        ← Back to home
      </Link>
    </div>
  );
}
