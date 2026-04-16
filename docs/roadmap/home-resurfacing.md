# Home Memo Resurfacing — v0

> **Status: v0.** This is the smallest thing that earns its place on the home screen. It is intentionally simple and will feel a little dumb in places. That is fine. The whole point of shipping v0 is to live with it for a few weeks and learn what actually matters before investing in the smarter version. **Do not gold-plate this.** A list of known-bad things and the better version we want to grow into lives at the bottom of this file.

**Goal:** When a returning user opens the home screen, surface one of their own past memos with a label that explains *why* it's there. Make the home feel like *their* journal instead of a launcher.

**Spec (informal):** none — captured inline in this plan because the design is small enough.

---

## Why this exists

The home screen is currently an input surface (record CTA, mood chips). It tells you nothing about *you*. The whole emotional contract of "Dear Me" is that future-you eventually shows up and watches the memo past-you recorded — and right now, the home screen never honors that contract. Resurfacing is where the contract gets paid out.

The label is doing as much work as the memo itself. "From a year ago today" feels like a journal. "Random old memo" feels like a shuffle button. Pick the label well or the feature dies.

---

## v0 scope (what we are building)

A small `ResurfacedMemo` card that appears below the Quick check-in section on `app/(tabs)/page.tsx`, when there is a memo old enough to surface. It shows:

- A label like "From a year ago today" / "From last month" — the *why* line.
- The memo's thumbnail (already stored as `thumbnailFilename`).
- The memo's title.
- Tap → navigates to `/memo/[id]/playback`.

That's the whole feature. No new schema, no new database calls beyond what already exists in `lib/db/memos.ts`, no preferences, no dismissibility, no "show me a different one."

---

## Selection algorithm (v0)

A tiered fallback. Walk this list in order, return the first tier that has at least one match:

1. **Exactly one year ago today** — same calendar day, one year earlier (local time). The magic case.
2. **Six months ago today** — same calendar day, six months earlier.
3. **Three months ago today** — same calendar day, three months earlier.
4. **One month ago today** — same calendar day, one month earlier.
5. **One week ago today** — same calendar day, one week earlier.
6. **Anything older than 30 days** — pick deterministically by the day-of-year so the choice is stable for the day but rotates over time.

If none of the above produces a memo, **render nothing**. The section is hidden.

**Filter rules across all tiers:**
- Only `status: "final"`. Drafts are unfinished thoughts and shouldn't be surfaced.
- Skip memos with no `thumbnailFilename` for v0 — the card depends on the thumbnail visually, and the fallback story (placeholder art, big title) is its own design problem we should not solve in v0.
- "Same calendar day" = same `month` + same `date` in local time. Year boundaries handled by `Date` arithmetic.

**Deterministic rotation for tier 6:** seed with the local date string (`YYYY-MM-DD`) so all visits in the same day pick the same memo. Hash the seed → modulo into the candidate array. No persisted state needed.

---

## File changes

```
dear-me-nextjs/
  lib/
    home/
      pickResurfacedMemo.ts        NEW   pure function: (memos, now) => { memo, label } | null
      pickResurfacedMemo.test.ts   DEFERRED — see "Testing" below
  components/
    dear-me/
      resurfaced-memo-card.tsx     NEW   visual card; takes { memo, label }; renders thumbnail + label + title; Link to /memo/[id]/playback
  app/
    (tabs)/
      page.tsx                     EDIT  read memos, call pickResurfacedMemo, render the card if non-null
```

That's it. Three touched files.

---

## Implementation steps

- [ ] **1. Write `lib/home/pickResurfacedMemo.ts`** as a pure function `pickResurfacedMemo(memos: Memo[], now: Date): { memo: Memo, label: string } | null`. No imports from `lib/db/`, no async. Takes the array, returns the pick. This is the only piece with non-trivial logic — keep it pure so it's easy to reason about and easy to add tests later.
- [ ] **2. Implement the tier walk** inside that function. Tiers 1–5 are exact-day-match-N-units-ago. Tier 6 is "older than 30 days, deterministic-by-date pick." Each tier's label string is the function's responsibility (it knows which tier matched).
- [ ] **3. Filter rules:** apply `status === "final"` and `thumbnailFilename != null` before the tier walk. One filter pass, not per tier.
- [ ] **4. Build `components/dear-me/resurfaced-memo-card.tsx`.** Horizontal layout: thumbnail on the left (small, ~64px square, rounded), label + title stacked on the right. Label is the small uppercase-ish caption ("FROM A YEAR AGO TODAY"), title is the regular weight. Wrap in a `Link` to `/memo/${memo.id}/playback`. Use the existing OPFS blob-url pattern from wherever the memo card already does it (search `useBlobUrl` or how `memo-card.tsx` loads thumbnails — reuse, don't reinvent).
- [ ] **5. Wire into `app/(tabs)/page.tsx`.** On mount, fetch all memos via the existing helper in `lib/db/memos.ts` (look up the actual function name — likely `listMemos` or similar). Pass to `pickResurfacedMemo(memos, new Date())`. Hold the result in state. Render `<ResurfacedMemoCard />` below the Quick check-in section if non-null. Add a small section heading above it — something like "A memory" or just no heading at all (decide visually).
- [ ] **6. Verify with `bun run build && bun run lint`.** Then `bun run dev` and visually check three states: (a) no memos at all → no card, (b) only recent memos → no card, (c) memo seeded with `createdAt` set to one year ago → card appears with the correct label. Use the dev tools to manually mutate IndexedDB if needed, or temporarily insert a memo with a backdated `createdAt`.
- [ ] **7. Commit:** `feat(home): resurface a past memo on the home screen (v0)`.

---

## Testing

**No automated tests in v0.** The `pickResurfacedMemo` function is pure and is the *one* place tests would pay off, but the project doesn't have a test runner set up yet. When vitest lands, the first thing to test is this function — it has clean inputs, clean outputs, no side effects, and the date math is exactly the kind of thing that drifts silently. Until then, verify by manually backdating a memo's `createdAt` in IndexedDB and reloading.

---

## What v0 gets wrong on purpose (and what v1 should fix)

Capturing this here so future-us doesn't re-invent the wheel — and so we resist the urge to "just fix one more thing" before shipping.

1. **No "I've already seen this today" awareness.** v0 always picks the same memo on a given day, but if you record a *new* memo today that happens to be the surfaced one (unlikely but possible), or you watch the surfaced memo and come back, the card doesn't acknowledge any of that. v1 should track which resurfaced memos have been shown and rotate.
2. **No mood-matched resurfacing.** If today's check-in is "anxious," it would be powerful to surface a past memo where you also felt anxious — "you've been here before, here's what you said." This needs the `moods` field on memos and a real ranker. v1 territory.
3. **Tier 6 is the lazy tier.** "Older than 30 days, deterministic-by-date" is a stopgap. The smarter version weights toward memos you haven't seen in a while, memos with rich transcripts, memos at emotional inflection points. Needs a "last surfaced at" field on memos.
4. **No transcript snippet.** A one-line pull from the transcript ("…and I remember being terrified of starting that project…") would do enormous emotional work, but it requires picking a *good* line, which is hard. v0 just shows the title. v1 should pull the strongest sentence — possibly via the analyzer.
5. **Filters out memos with no thumbnail.** This is a real loss — voice-only memos and memos where thumbnail extraction failed get silently excluded. v1 needs a graceful no-thumbnail card design (typography-led, no image).
6. **Nothing on day 1.** A new user with no old memos sees nothing. v1 might use this slot for an onboarding nudge ("your future self is listening — record your first memo so we have something to bring back to you").
7. **Anniversary rigidity.** "Exactly one year ago today" is brittle — if you didn't record on April 14 last year, tier 1 misses entirely. v1 should fuzzy-match within a few days ("from around this time last year").
8. **No analytics.** We have no way to know if people tap the card, ignore it, or find it intrusive. v1 should add a simple local counter (taps vs impressions) before we invest more.
9. **Single card, not a stack.** v1 could show 2–3 resurfaced memos as a small horizontal scroll. v0 keeps it to one to avoid making the home screen busy.
10. **The label vocabulary is fixed and English-only.** v1 should treat labels as i18n-able strings.

**The v0 success criterion is not "this is great." It is: "we shipped it, we lived with it for a few weeks, and we now know which of the items above actually matters."**
