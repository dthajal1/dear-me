# dear-me Next.js Scaffold — Design Spec

**Date:** 2026-04-12
**Status:** Approved, ready for implementation plan
**Scope:** Stand up a new Next.js App Router project at `dear-me-nextjs/` inside the existing repo and build every screen from `design.pen` as static UI. No real data, no real audio, no real camera. The existing Expo project stays fully untouched.

---

## Motivation

The current `dear-me` project is an Expo (SDK 54) universal app targeting iOS/Android/web. The owner is far more productive in Next.js than in React Native and has decided that shipping a polished mobile-web PWA is a better fit than continuing to fight native tooling outside their expertise.

Rather than *migrate* the Expo codebase (which is mostly UI scaffolding and would require translating RN idioms to web), we **rebuild from `design.pen`** as the source of truth. This yields cleaner web-native code, faster progress, and no RN baggage. The Expo project remains in place as a reference for interaction details and flow.

---

## Goals

1. A new Next.js 15 App Router project at `dear-me-nextjs/` (subfolder of the current repo).
2. Design tokens extracted from `design.pen` and baked into `globals.css` **before** shadcn init, so every primitive inherits the dear-me look on first add.
3. Every screen from `design.pen` built as static UI, pixel-close to the design.
4. Mobile-first layout: full-bleed on real mobile, centered ~430px frame on desktop (no fake phone chrome).
5. `bun run build && bun run lint` both clean.
6. Expo project untouched; root `CLAUDE.md` untouched.

## Non-goals (deferred, do not creep)

- Real data (no DB, API routes, fetching, persistence)
- Real audio (no `MediaRecorder`, no playback element, no waveform generation — static placeholder SVGs from design.pen)
- Real camera (static mock only)
- Auth, onboarding, settings screens
- **PWA installability** — no `manifest.json`, no service worker, no Serwist. Deferred until real features land.
- Desktop layouts beyond the centered mobile frame
- Animations beyond shadcn defaults + basic CSS transitions
- Dark-mode toggle UI (wire CSS-variable split if design.pen has both themes, but no toggle)
- Tests (static UI — no behavior worth testing yet)
- Migration of any logic from `dear-me/app/`

---

## Repository layout

`dear-me-nextjs/` lives as a subfolder of the current repo, sibling to `app/`, `components/`, `design.pen`, and `CLAUDE.md`. Same git repo, two projects coexisting.

```
dear-me/
├── app/                    ← Expo (untouched)
├── components/             ← Expo (untouched)
├── design.pen              ← source of truth for both projects
├── CLAUDE.md               ← stays; documents the Expo project
└── dear-me-nextjs/         ← NEW
    ├── src/
    │   ├── app/
    │   ├── components/
    │   │   ├── ui/         ← shadcn copies (themed)
    │   │   └── dear-me/    ← hand-built custom components
    │   └── lib/
    ├── public/
    ├── CLAUDE.md           ← NEW, scoped to the Next.js project
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json
```

**Rationale for same repo:** `design.pen` is shared, the Expo tree is a useful reference while building, and splitting repos is cheap to do later once the Next.js version supersedes Expo.

---

## Architecture

### Mobile frame strategy

- **On real mobile (the 95% case):** full-bleed, edge-to-edge, tab bar fixed to the viewport bottom, safe-area insets respected via `env(safe-area-inset-bottom)`.
- **On desktop:** the same mobile layout centered in a ~430px-wide column with a soft backdrop. No fake phone chrome (no notch, no status-bar mockup). Clean centered column reads as intentional; fake chrome reads as a demo.
- Implementation: one `MobileFrame` wrapper in the root `layout.tsx`. Full-width by default; a single `@media (min-width: 768px)` rule adds `max-width: 430px`, `margin: auto`, and the backdrop.
- `<meta name="viewport" content="... viewport-fit=cover">` so safe-area insets resolve correctly when installed to home screen later.

### Routing (App Router)

`design.pen` currently has 22 frames plus 9 reusable components (confirmed via `get_editor_state`). The frame → route mapping below is the starting point; exact names may shift slightly during token/component extraction if additional frames surface.

```
src/app/
├── layout.tsx                      ← root shell (fonts, MobileFrame)
├── page.tsx                        ← redirects to /home
│
├── (tabs)/                         ← route group: screens with bottom tab bar
│   ├── layout.tsx                  ← renders <TabBar/> + children
│   ├── home/page.tsx               ← Home (populated + empty state)
│   ├── memo/page.tsx               ← Memo Tab (populated + empty state)
│   ├── insights/page.tsx           ← Insights (populated + empty state)
│   └── progress/page.tsx           ← Progress / streaks
│
├── record/                         ← flow group: full-screen, no tab bar
│   ├── layout.tsx                  ← BackHeader, no TabBar
│   ├── trigger/page.tsx            ← Memo Trigger v2
│   ├── camera/page.tsx
│   ├── recording/page.tsx
│   ├── processing/page.tsx         ← Processing State v2
│   ├── review/page.tsx
│   ├── add-notes/page.tsx
│   └── saved/page.tsx              ← Memo Saved
│
├── memo/
│   ├── [id]/page.tsx               ← Memo detail
│   └── [id]/playback/page.tsx      ← Memo Playback v2
│
├── transcript/[id]/page.tsx        ← Transcript view
└── streak/[day]/page.tsx           ← Streak Day detail
```

**Rules:**
- Empty states are not separate routes. They render conditionally inside their parent page based on a local `hasData` flag (hardcoded for this pass — e.g., switch a constant to preview either state).
- `(tabs)` group shows the bottom tab bar via its layout.
- `record/` group hides the tab bar and shows a `BackHeader` instead.
- Every page is a client component rendering static JSX. No data fetching, no route handlers, no server actions. Navigation uses `<Link>`.

### Styling system

**Tailwind + shadcn/ui, heavily themed.**

- shadcn is a starting point, not a component library. `bunx shadcn add button` copies the source into `src/components/ui/` — from that moment it's our code.
- **Tokens are extracted from `design.pen` and written to `src/app/globals.css` as CSS variables *before* `shadcn init`**, so every primitive inherits the dear-me look automatically. `shadcn init` is run with "use existing CSS variables" to avoid overwriting them.
- Tokens to extract:
  - Colors: background, foreground, card, primary, accent, muted, border, ring, destructive, plus any custom tokens (mood chip colors, glass surface, privacy-note background).
  - Typography: font families, weights, sizes, line heights per text role.
  - Radii: button, card, pill, sheet (likely multiple scales).
  - Shadows: glass card, floating button, elevated sheet.
  - Spacing: match `design.pen` only if it uses a clear scale; otherwise stay on Tailwind defaults.
- Fonts load via `next/font`. If `design.pen` uses a non-Google family, `next/font/local` with the file; otherwise `next/font/google`.
- Target split: ~70% themed shadcn primitives, ~30% fully hand-built components where the design is the identity.

### Component inventory

**Themed shadcn primitives** (copy via `shadcn add`, then restyle):

| Component | Used for |
|---|---|
| `Button` | Base action button (maps to `design.pen` Primary Button) |
| `Sheet` / `Drawer` | Replaces Expo `presentation: "formSheet"` |
| `Dialog` | Confirmations, destructive actions |
| `ScrollArea` | Memo lists, insights |
| `Input` / `Textarea` | Add-notes screen |
| `Switch` | Settings toggles (future-ready) |
| `Skeleton` | Loading states |
| `Sonner` | Toast notifications |

**Hand-built custom components** (`src/components/dear-me/`):

| Component | Notes |
|---|---|
| `MobileFrame` | Centered-on-desktop / full-bleed-on-mobile wrapper (used in root layout) |
| `TabBar` | Glass pill with animated indicator — explicit "stay custom" per root CLAUDE.md |
| `BackHeader` / `BackPill` | Matches `design.pen` components |
| `ScreenBackground` | Gradient/texture surface |
| `GlassCard` | Frosted card used across memo/insights |
| `MemoCard` | Memo list row with waveform + metadata |
| `MoodChip` | Mood indicator pill |
| `FilterPill` | Filter toggle |
| `ChatInput` | Footer input (from `design.pen` component) |
| `PrivacyNote` | Privacy disclosure card |
| `EmptyState` | Shared empty-state layout |
| `RecordButton` | Hero record trigger — hand-built |

**Icons:** `lucide-react` for everything. Where the Expo app uses SF Symbols, pick the closest Lucide equivalent during build.

**Not built:** `StatusBar` — no fake chrome per the frame strategy.

---

## Scaffold sequence

Deterministic, ordered. Run the whole sequence before writing any screen code.

1. `mkdir dear-me-nextjs && cd dear-me-nextjs`
2. `bun create next-app@latest . --yes` *(exact command specified by owner)*
   - Confirmed by checking the upstream template: this generates App Router + TypeScript + Tailwind + ESLint + `src/` + `@/*` alias, and does **not** scaffold a `CLAUDE.md` or `AGENTS.md`.
3. Verify: `bun run dev` boots, default page renders at `localhost:3000`.
4. Add `dear-me-nextjs/CLAUDE.md` — commands, conventions, pointer to `design.pen`. (Root `CLAUDE.md` is not touched.)
5. Extract design tokens from `design.pen` via pencil MCP (`get_editor_state`, `batch_get` on components + representative frames). Write them to `src/app/globals.css` as CSS variables in shadcn's convention.
6. `bunx shadcn@latest init` — select "use existing CSS variables" so step 5's tokens are preserved.
7. Install fonts via `next/font` (family chosen during token extraction), wire into `app/layout.tsx`.
8. Root `app/layout.tsx` — font variables, `<MobileFrame>` wrapper, safe-area utilities, `viewport-fit=cover` meta.
9. `bunx shadcn@latest add button sheet dialog drawer scroll-area separator switch input textarea avatar skeleton sonner`
10. Verify: `bun run build && bun run lint` both clean.

After step 10 we have a booting, themed, empty Next.js app ready for screens.

---

## Build order

1. Scaffold + tokens + shadcn init + layout shell (scaffold sequence above)
2. Hand-built primitives: `MobileFrame`, `ScreenBackground`, `BackHeader`, `GlassCard`, `EmptyState`
3. `TabBar` + `(tabs)/layout.tsx` — unlocks all four tab screens
4. Tab screens, in order: Home → Memo → Insights → Progress (each with both populated and empty state)
5. Record flow: trigger → camera → recording → processing → review → add-notes → saved
6. Detail screens: `memo/[id]`, `memo/[id]/playback`, `transcript/[id]`, `streak/[day]`
7. Final pass: `bun run build && bun run lint` clean; every route manually visited in `bun run dev`

---

## Done criteria

- `bun run dev` in `dear-me-nextjs/` boots with no warnings.
- Every route from the routing section renders, pixel-close to `design.pen`.
- Navigation works: tab bar switches tabs, record flow progresses, back buttons return.
- Both populated and empty states exist for each tab (toggled via a local constant).
- `bun run build` succeeds; `bun run lint` passes clean.
- Expo project in `dear-me/app/` untouched; root `CLAUDE.md` untouched.

---

## Deferred items (tracked, not forgotten)

Recorded here so they don't get lost:

- **PWA installability** — `public/manifest.json`, icons (192/512/maskable/apple-touch), Serwist service worker, iOS standalone meta tags. Add when real features land and installability becomes valuable.
- **Real audio recording** — `MediaRecorder` API, playback, waveform generation.
- **Real camera** — `getUserMedia` video.
- **Data layer** — persistence strategy (IndexedDB? server?), API routes, auth.
- **Desktop layouts** — `md:` breakpoints beyond the centered mobile frame.
- **Dark mode toggle** — wire CSS-variable split now if both themes exist in `design.pen`; add toggle UI later.
