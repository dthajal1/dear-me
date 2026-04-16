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
import { STORE_MEMOS, type Memo } from "@/lib/db/schema";

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

  async function clearSeeded() {
    setStatus("seeding");
    try {
      const db = await getDb();
      const all = await db.getAll(STORE_MEMOS);
      const seeded = all.filter((m) => m.filename.startsWith("seed-fake-"));
      for (const m of seeded) {
        await db.delete(STORE_MEMOS, m.id);
      }
      setStatus("done");
      setMessage(`Cleared ${seeded.length} seeded memo(s)`);
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
