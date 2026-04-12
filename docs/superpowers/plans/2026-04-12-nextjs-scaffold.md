# dear-me Next.js Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a new Next.js 15 App Router project at `dear-me-nextjs/` (subfolder of the current repo) with every screen from `design.pen` built as static UI, pixel-close to the design.

**Architecture:** `design.pen` is the source of truth. Tokens are extracted and baked into `globals.css` before shadcn init so every primitive inherits the dear-me look. Mobile-first: full-bleed on real mobile, centered ~430px frame on desktop. Route groups `(tabs)` and `record` wrap screens that share chrome. No real data, no real audio, no real camera, no PWA service worker — pure static UI scaffolding. The existing Expo project is untouched.

**Tech Stack:** Next.js 15 (App Router, TypeScript), bun, Tailwind CSS, shadcn/ui (themed), lucide-react, next/font. No service worker / PWA tooling in this pass.

**Spec:** `docs/superpowers/specs/2026-04-12-nextjs-scaffold-design.md`

---

## Notes for the implementer

1. **TDD does not apply here.** This plan is pure static UI scaffolding — there's no behavior worth testing. The verification loop per task is: build JSX → visual check in `bun run dev` at the relevant route → `bun run lint` → commit. A final `bun run build` runs at the end of each phase.

2. **The Pencil desktop app must be running with `/Users/dirajthajali/work/projects/dear-me/design.pen` open** whenever you use `mcp__pencil__*` tools. If a call fails with "WebSocket not connected," stop and ask the user to open Pencil.

3. **Every screen task follows the same pattern:** (a) resolve the frame node ID via `mcp__pencil__get_editor_state` by name, (b) call `mcp__pencil__batch_get` on that ID to read the frame's structure, (c) translate to JSX using the themed shadcn primitives and hand-built components from Phase B, (d) verify the route renders in dev matching the frame, (e) commit.

4. **Working directory:** all commands in Phases B–F run from inside `dear-me-nextjs/`. Phase A starts from the repo root.

5. **Commit style:** one commit per task. Conventional commit prefixes (`feat:`, `chore:`, `style:`). Scope `nextjs` so these are easy to filter against the Expo commits in the same repo (e.g., `feat(nextjs): add TabBar component`).

6. **Do not modify anything outside `dear-me-nextjs/`.** The Expo project in `app/`, `components/`, `src/`, and the root `CLAUDE.md` are off-limits in this plan.

---

## File structure (what will exist after this plan runs)

```
dear-me-nextjs/
├── CLAUDE.md                               ← project-scoped instructions
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── biome.json                               ← (if scaffolded; otherwise absent)
├── .gitignore
├── public/
│   └── fonts/                               ← local font files if using next/font/local
├── src/
│   ├── app/
│   │   ├── layout.tsx                       ← root shell: fonts, <MobileFrame>, meta
│   │   ├── globals.css                      ← tokens as CSS variables
│   │   ├── page.tsx                         ← redirects to /home
│   │   ├── (tabs)/
│   │   │   ├── layout.tsx                   ← <TabBar/> + {children}
│   │   │   ├── home/page.tsx
│   │   │   ├── memo/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   └── progress/page.tsx
│   │   ├── record/
│   │   │   ├── layout.tsx                   ← <BackHeader/>, no tab bar
│   │   │   ├── trigger/page.tsx
│   │   │   ├── camera/page.tsx
│   │   │   ├── recording/page.tsx
│   │   │   ├── processing/page.tsx
│   │   │   ├── review/page.tsx
│   │   │   ├── add-notes/page.tsx
│   │   │   └── saved/page.tsx
│   │   ├── memo/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── playback/page.tsx
│   │   ├── transcript/[id]/page.tsx
│   │   └── streak/[day]/page.tsx
│   ├── components/
│   │   ├── ui/                              ← shadcn copies (themed)
│   │   │   ├── button.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── sonner.tsx
│   │   └── dear-me/                         ← hand-built custom
│   │       ├── mobile-frame.tsx
│   │       ├── screen-background.tsx
│   │       ├── back-header.tsx
│   │       ├── back-pill.tsx
│   │       ├── glass-card.tsx
│   │       ├── empty-state.tsx
│   │       ├── tab-bar.tsx
│   │       ├── memo-card.tsx
│   │       ├── mood-chip.tsx
│   │       ├── filter-pill.tsx
│   │       ├── chat-input.tsx
│   │       ├── privacy-note.tsx
│   │       └── record-button.tsx
│   └── lib/
│       └── utils.ts                          ← shadcn's `cn` helper
```

---

## Phase A — Scaffold & foundation

### Task 1: Create the Next.js project

**Files:**
- Create: `dear-me-nextjs/` (entire project via installer)

**Working directory:** repo root (`/Users/dirajthajali/work/projects/dear-me`)

- [ ] **Step 1: Create the target directory**

```bash
mkdir dear-me-nextjs
```

- [ ] **Step 2: Run the installer from inside the new directory**

```bash
cd dear-me-nextjs && bun create next-app@latest . --yes
```

Expected: installer runs non-interactively, generates App Router + TypeScript + Tailwind + ESLint + `src/` directory + `@/*` import alias. No `CLAUDE.md` or `AGENTS.md` is generated (confirmed against upstream template).

- [ ] **Step 3: Verify the dev server boots**

```bash
cd dear-me-nextjs && bun run dev
```

Expected: server starts on `localhost:3000` with the default Next.js welcome page rendering. Stop the server with Ctrl-C once confirmed.

- [ ] **Step 4: Commit the scaffold**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git add dear-me-nextjs
git commit -m "chore(nextjs): scaffold Next.js 15 project via create-next-app"
```

---

### Task 2: Add project-scoped CLAUDE.md

**Files:**
- Create: `dear-me-nextjs/CLAUDE.md`

- [ ] **Step 1: Write `dear-me-nextjs/CLAUDE.md`**

Content:

```markdown
# CLAUDE.md (dear-me-nextjs)

This file provides guidance to Claude Code when working inside `dear-me-nextjs/`.

## Project Overview

`dear-me-nextjs` is the Next.js 15 (App Router) rebuild of the dear-me voice journaling app. The design source of truth is `../design.pen` (read via the `pencil` MCP server — never with Read/Grep). This project is a mobile-first PWA-in-progress: for now it's static UI, with real features landing incrementally.

The sibling `../app/`, `../components/`, and `../src/` directories belong to the original Expo project and must not be modified from inside this project.

## Commands

Run from inside `dear-me-nextjs/`:

- `bun run dev` — start dev server on localhost:3000
- `bun run build` — production build
- `bun run lint` — ESLint via `next lint`
- Package manager is **bun** (use `bun add` for dependencies)

## Verification

After any change, both checks must pass:

1. `bun run build`
2. `bun run lint`

## Conventions

- **Routing:** App Router. Route groups `(tabs)` and `record/` wrap screens that share chrome.
- **Styling:** Tailwind + shadcn/ui, heavily themed. Tokens live as CSS variables in `src/app/globals.css`. shadcn primitives are copied into `src/components/ui/` and customized there. Hand-built components live in `src/components/dear-me/`.
- **Icons:** `lucide-react` only.
- **Mobile frame:** full-bleed on mobile, centered ~430px column on desktop via `MobileFrame` in the root layout. No fake phone chrome.
- **No TDD for UI scaffolding.** Verify by visual check in dev + build + lint. Tests are deferred until real behavior lands.

## Design.pen

Always use the `pencil` MCP server tools (`get_editor_state`, `batch_get`, etc.) to read `design.pen`. The file is encrypted — Read/Grep will not work. Before using any pencil tool, ensure the Pencil desktop app is running with `../design.pen` open.
```

- [ ] **Step 2: Commit**

```bash
git add dear-me-nextjs/CLAUDE.md
git commit -m "docs(nextjs): add project-scoped CLAUDE.md"
```

---

### Task 3: Extract design tokens from design.pen

**Files:**
- Create: `dear-me-nextjs/tmp-design-tokens.md` (scratch notes, deleted at the end of the task)

**Prerequisite:** Pencil desktop app running with `/Users/dirajthajali/work/projects/dear-me/design.pen` open.

- [ ] **Step 1: Confirm the active document**

Call `mcp__pencil__get_editor_state` with `include_schema: false`.

Expected: response shows `/Users/dirajthajali/work/projects/dear-me/design.pen` as the active editor and lists ~22 top-level frames plus 9 reusable components.

- [ ] **Step 2: Read the reusable components to extract primitive styles**

Call `mcp__pencil__batch_get` with these node IDs (from `get_editor_state` output):

```
["m084b", "e3E7Y", "P7l1X", "nkX5B", "QBz0Q", "O2HUq", "Nfd33", "BwTp8", "EeRbp"]
```

These are the component definitions for Primary Button (x2), Back Pill, Chat Input, Tab Bar (x2), Back Header, and Status Bar (x2). Their fills, strokes, radii, fonts, and shadows are the canonical primitive styles.

- [ ] **Step 3: Read representative frames to extract page-level tokens**

Call `mcp__pencil__batch_get` on the `Home` frame (ID from editor state, likely `YUuPo`), `Memo Playback v2` (`ks2nB`), and `Insights Tab` (`bYRjZ`). These cover the broadest surface-area usage of colors, typography scales, and shadow usage.

If any call returns too much data (>1MB), narrow the query with a sub-node match or reduce depth.

- [ ] **Step 4: Catalog the tokens in scratch notes**

Write findings to `dear-me-nextjs/tmp-design-tokens.md` using this exact structure:

```markdown
# design.pen tokens (extracted YYYY-MM-DD)

## Colors
- background: #XXXXXX
- foreground: #XXXXXX
- card: #XXXXXX
- card-foreground: #XXXXXX
- primary: #XXXXXX
- primary-foreground: #XXXXXX
- accent: #XXXXXX
- muted: #XXXXXX
- muted-foreground: #XXXXXX
- border: #XXXXXX
- ring: #XXXXXX
- destructive: #XXXXXX
- (custom) mood-chip-bg: #XXXXXX
- (custom) glass-surface: rgba(...)
- (custom) privacy-note-bg: #XXXXXX
- (background gradient stops, if any)

## Typography
- font-display: <family>, <weights used>
- font-body: <family>, <weights used>
- text-xs / sm / base / lg / xl / 2xl / ... → px size + line height per role used in frames

## Radii
- sm / md / lg / pill → px
- (button / card / sheet mapped explicitly)

## Shadows
- glass: <shadow value>
- elevated: <shadow value>
- floating: <shadow value>
```

Fill every value with what the frames actually use. If a field isn't used in `design.pen`, delete the line rather than guessing. This scratch file is the single source for Task 4 — do not skip it.

- [ ] **Step 5: Commit the scratch notes**

```bash
git add dear-me-nextjs/tmp-design-tokens.md
git commit -m "chore(nextjs): catalog design.pen tokens for theming"
```

The scratch file is deleted at the end of Task 4 once the values land in `globals.css`.

---

### Task 4: Bake tokens into globals.css

**Files:**
- Modify: `dear-me-nextjs/src/app/globals.css`
- Delete: `dear-me-nextjs/tmp-design-tokens.md`

- [ ] **Step 1: Replace the scaffolded `globals.css` body with themed CSS variables**

Open `dear-me-nextjs/src/app/globals.css`. Keep the Tailwind import directive at the top. Replace the default `:root` block with CSS variables using shadcn's naming convention (`--background`, `--foreground`, `--card`, `--primary`, `--primary-foreground`, `--accent`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--destructive-foreground`, `--radius`). Each value comes from `tmp-design-tokens.md`.

Add any dear-me-specific tokens as additional variables (`--mood-chip-bg`, `--glass-surface`, `--privacy-note-bg`, etc.) after the standard shadcn set.

Add `@theme inline` mapping (Tailwind v4 convention) so Tailwind utility classes like `bg-background`, `text-foreground`, `rounded-[var(--radius)]` resolve correctly. If the scaffold uses Tailwind v3 (check `package.json`), use the `tailwind.config.ts` `extend.colors` block instead.

Add a `body` rule that applies the background, foreground color, and antialiasing — and importantly the radial-gradient overlays from `design.pen`'s Home frame background (captured in `tmp-design-tokens.md`).

- [ ] **Step 2: Verify the dev server still boots without errors**

```bash
cd dear-me-nextjs && bun run dev
```

Expected: `localhost:3000` renders the default page with the new background color / gradient visible. No console warnings about missing CSS variables. Stop the server.

- [ ] **Step 3: Delete the scratch file**

```bash
rm dear-me-nextjs/tmp-design-tokens.md
```

- [ ] **Step 4: Commit**

```bash
git add dear-me-nextjs/src/app/globals.css dear-me-nextjs/tmp-design-tokens.md
git commit -m "feat(nextjs): bake design.pen tokens into globals.css"
```

---

### Task 5: Initialize shadcn/ui

**Files:**
- Create: `dear-me-nextjs/components.json`
- Create: `dear-me-nextjs/src/lib/utils.ts`

- [ ] **Step 1: Run shadcn init**

```bash
cd dear-me-nextjs && bunx shadcn@latest init
```

Answer prompts:
- Style: `New York`
- Base color: `Neutral` (ignored — our tokens override it)
- CSS variables: `Yes`
- When asked whether to overwrite `globals.css`: **No** (keep our tokens). If init offers "use existing CSS variables," pick it. If init insists on writing, accept, then in Step 3 restore our token values from the previous commit.

Expected: `components.json` created, `src/lib/utils.ts` created with the `cn` helper, `tailwind.config.ts` / `tailwind.config.js` updated if shadcn needs plugin entries.

- [ ] **Step 2: If init overwrote `globals.css`, restore our tokens**

```bash
git diff src/app/globals.css
```

If the diff shows our token values were replaced, run:

```bash
git checkout HEAD -- src/app/globals.css
```

Then manually re-add any new `@theme` or `@tailwind` directives shadcn expects (compare against a fresh shadcn-init'd project if unclear). The invariant: every value from `tmp-design-tokens.md` must be present in `globals.css` after this step.

- [ ] **Step 3: Verify build + lint pass**

```bash
bun run build && bun run lint
```

Expected: both succeed, no errors, no new warnings beyond the default scaffold.

- [ ] **Step 4: Commit**

```bash
git add dear-me-nextjs
git commit -m "chore(nextjs): initialize shadcn/ui preserving design tokens"
```

---

### Task 6: Configure fonts via next/font

**Files:**
- Modify: `dear-me-nextjs/src/app/layout.tsx`
- Possibly create: `dear-me-nextjs/public/fonts/*` (only if using `next/font/local`)

- [ ] **Step 1: Determine the font source**

From `tmp-design-tokens.md` (cataloged in Task 3), identify the display and body font families. Check whether they are Google Fonts (use `next/font/google`) or custom files (use `next/font/local`).

If custom files are needed and not yet in the repo, stop and ask the user where to get them. Do not use fallback fonts silently.

- [ ] **Step 2: Wire the fonts into `layout.tsx`**

Replace the scaffolded font import with the correct `next/font` import(s). Apply the font CSS variables (`--font-display`, `--font-body`) on the `<html>` or `<body>` element so Tailwind's `font-display` / `font-body` utilities pick them up.

Add the matching `fontFamily` entries in `tailwind.config.ts` (or the `@theme` block in `globals.css` for Tailwind v4) so `font-display` and `font-body` class names resolve to the CSS variables.

- [ ] **Step 3: Verify the dev server renders with the correct fonts**

```bash
bun run dev
```

Expected: the default page body text renders in the body font, no FOUT/FOIT flash, no console warnings about font loading. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): wire next/font with design.pen typography"
```

---

### Task 7: Add shadcn primitives

**Files:**
- Create: `dear-me-nextjs/src/components/ui/{button,sheet,dialog,drawer,scroll-area,separator,switch,input,textarea,avatar,skeleton,sonner}.tsx`

- [ ] **Step 1: Install primitives in one command**

```bash
cd dear-me-nextjs && bunx shadcn@latest add button sheet dialog drawer scroll-area separator switch input textarea avatar skeleton sonner
```

Expected: each component is copied into `src/components/ui/`. Required peer packages (e.g., `@radix-ui/*`, `sonner`, `vaul`) are installed automatically.

- [ ] **Step 2: Verify build + lint pass**

```bash
bun run build && bun run lint
```

Expected: both succeed. Any errors here are almost always missing peer deps — install them and re-run.

- [ ] **Step 3: Commit**

```bash
git add dear-me-nextjs
git commit -m "chore(nextjs): add themed shadcn primitives"
```

---

### Task 8: Build MobileFrame wrapper and root layout

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/mobile-frame.tsx`
- Modify: `dear-me-nextjs/src/app/layout.tsx`
- Modify: `dear-me-nextjs/src/app/page.tsx` (redirect to `/home`)

- [ ] **Step 1: Create `MobileFrame`**

Create `src/components/dear-me/mobile-frame.tsx`:

```tsx
import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

/**
 * Full-bleed on real mobile, centered ~430px column on desktop.
 * No fake phone chrome — just a clean centered container with
 * safe-area insets respected.
 */
export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-dvh w-full bg-[var(--backdrop,theme(colors.background))] md:flex md:items-center md:justify-center md:py-6">
      <div
        className="
          relative mx-auto flex min-h-dvh w-full flex-col
          bg-background text-foreground
          md:min-h-[min(900px,calc(100dvh-3rem))]
          md:max-w-[430px]
          md:overflow-hidden md:rounded-[32px]
          md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.25)]
        "
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` to use MobileFrame and set viewport**

Replace the scaffolded `RootLayout` return with:

```tsx
import type { Metadata, Viewport } from "next";
import { MobileFrame } from "@/components/dear-me/mobile-frame";
import "./globals.css";
// (keep your font imports from Task 6)

export const metadata: Metadata = {
  title: "dear-me",
  description: "A voice journal for you, from you.",
};

export const viewport: Viewport = {
  themeColor: "#EFF2E6", // replace with --background value from tokens
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <MobileFrame>{children}</MobileFrame>
      </body>
    </html>
  );
}
```

(Keep the font variable className applied to `<html>` or `<body>` from Task 6.)

- [ ] **Step 3: Redirect `/` to `/home`**

Replace `src/app/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function Index() {
  redirect("/home");
}
```

Note: `/home` doesn't exist yet — expect a 404 in dev until Task 13. Build will still succeed.

- [ ] **Step 4: Verify build + lint pass**

```bash
bun run build && bun run lint
```

Expected: both succeed. Build may warn about the dangling redirect target; that's fine and resolves in Phase C.

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add MobileFrame and root layout"
```

---

## Phase B — Hand-built primitives

Every task in Phase B follows the same shape: create one component file, render it on a temporary `/sandbox` route for visual verification, then commit. The sandbox is removed at the end of the phase.

### Task 9: Create the sandbox route for visual verification

**Files:**
- Create: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Create an empty sandbox page**

```tsx
export default function Sandbox() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sandbox</h1>
      {/* components get imported and rendered here during Phase B */}
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders**

```bash
bun run dev
```

Visit `localhost:3000/sandbox`. Expected: the "Sandbox" header renders inside the centered mobile frame.

- [ ] **Step 3: Commit**

```bash
git add dear-me-nextjs/src/app/sandbox
git commit -m "chore(nextjs): add sandbox route for component previews"
```

---

### Task 10: ScreenBackground

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/screen-background.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read `design.pen` for background treatment**

Call `mcp__pencil__batch_get` on the `Home` frame (resolve ID via `get_editor_state`). Focus on the frame's `fill` array: `design.pen` uses a base color plus radial gradient overlays. Capture the exact gradient stops and centers.

- [ ] **Step 2: Create `ScreenBackground`**

Create `src/components/dear-me/screen-background.tsx` as an absolutely-positioned, pointer-events-none layer that paints the base color and radial gradients matching what Task 10 Step 1 found. It should be placed as the first child inside a relatively-positioned screen wrapper.

Props: none (uses CSS variables from Task 4).

- [ ] **Step 3: Render it in sandbox**

Add to sandbox: wrap contents in `<div className="relative min-h-dvh"><ScreenBackground />...content...</div>`. Visit `/sandbox` in dev and confirm the background matches the Home frame.

- [ ] **Step 4: Verify build + lint pass**

```bash
bun run build && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add ScreenBackground primitive"
```

---

### Task 11: BackHeader + BackPill

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/back-pill.tsx`
- Create: `dear-me-nextjs/src/components/dear-me/back-header.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the reusable components**

Call `mcp__pencil__batch_get` on IDs `P7l1X` (Back Pill) and `O2HUq` (Back Header).

- [ ] **Step 2: Create `BackPill`**

Self-contained button: a rounded-pill with a chevron-left icon (from `lucide-react`) and optional label text. Accepts `href?: string` (uses `next/link` `<Link>` if provided, plain `<button>` otherwise) and `label?: string`. Default: no label, just icon.

- [ ] **Step 3: Create `BackHeader`**

A header row with `BackPill` on the left, a centered title (`title: string`), and an optional right slot (`rightSlot?: ReactNode`). Matches the Back Header component in `design.pen` for padding, height, and typography.

- [ ] **Step 4: Render both in sandbox**

Import and render `<BackPill />` and `<BackHeader title="Preview" />` in the sandbox. Visit `/sandbox`, compare against `design.pen`.

- [ ] **Step 5: Verify build + lint pass**

```bash
bun run build && bun run lint
```

- [ ] **Step 6: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add BackPill and BackHeader"
```

---

### Task 12: GlassCard

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/glass-card.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read frames that use glass treatment**

`batch_get` on `Home` and `Memo Playback v2`. The Start Recording Card, Daily Prompt, Privacy Note, and playback card in those frames use the glass surface treatment. Extract the background color (semi-transparent), backdrop-blur amount, border color/opacity, and shadow.

- [ ] **Step 2: Create `GlassCard`**

`<div>` wrapper with configurable padding and the extracted glass treatment. Props: `className?` (to extend), `children`. Uses the `--glass-surface` token from `globals.css` for the background.

- [ ] **Step 3: Render in sandbox with sample content**

Include at least two variants (small and large) to verify padding and blur look right.

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add GlassCard primitive"
```

---

### Task 13: EmptyState

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/empty-state.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read empty-state frames**

`batch_get` on `Home Empty State`, `Memo Empty State`, and `Insights Empty State`. They share a layout: a large circular icon container, a title, a subtitle, and optionally a CTA button.

- [ ] **Step 2: Create `EmptyState`**

Props:
- `icon: ReactNode` (a `lucide-react` icon of the right size)
- `title: string`
- `subtitle: string`
- `cta?: { label: string; href: string }`

Layout: vertically centered column matching the empty-state frames' spacing, padding, and typography.

- [ ] **Step 3: Render in sandbox**

Render one instance with all props set to confirm layout.

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add EmptyState primitive"
```

---

### Task 14: MoodChip

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/mood-chip.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the Quick Mood row**

`batch_get` on the `Home` frame (or zoom into the `Quick Mood` → `moodRow` subtree — node IDs like `KSDx6`, `5Dhc6`, `Sd7zi`, `8Avb8`, `fwdE3` from the earlier extraction). Each chip has an emoji and a label below it.

- [ ] **Step 2: Create `MoodChip`**

Props: `emoji: string`, `label: string`, `selected?: boolean`, `onClick?: () => void`. Vertical stack: emoji on top, label below. Selected state uses the `--mood-chip-bg` token for background.

- [ ] **Step 3: Render a row of 5 in sandbox**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add MoodChip"
```

---

### Task 15: FilterPill

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/filter-pill.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read filter pills from the Memo Tab frame**

`batch_get` on `Memo Tab` (ID `GR6vh`). The `Time Filters` row has pills like "This Week", "This Month", etc.

- [ ] **Step 2: Create `FilterPill`**

Props: `label: string`, `active?: boolean`, `onClick?: () => void`. Small rounded-full button, active state uses primary color.

- [ ] **Step 3: Render two rows (active + inactive variants) in sandbox**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add FilterPill"
```

---

### Task 16: ChatInput

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/chat-input.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the Chat Input reusable component**

`batch_get` on ID `nkX5B`.

- [ ] **Step 2: Create `ChatInput`**

A footer input row with a text field and a send/record icon button on the right. Props: `placeholder?: string`, `onSubmit?: (value: string) => void`. Purely visual for this pass — `onSubmit` is optional and does nothing if omitted.

Use the shadcn `Input` primitive inside. Wrap in a glass/elevated container matching `design.pen`.

- [ ] **Step 3: Render in sandbox**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add ChatInput"
```

---

### Task 17: PrivacyNote

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/privacy-note.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the Privacy Note frame region on Home**

`batch_get` with a sub-match for the `Privacy Note` node inside the `Home` frame.

- [ ] **Step 2: Create `PrivacyNote`**

A small card with a lock icon on the left and a short disclosure text. Props: `text?: string` (defaults to the copy from `design.pen`). Uses `--privacy-note-bg` token.

- [ ] **Step 3: Render in sandbox**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add PrivacyNote"
```

---

### Task 18: MemoCard

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/memo-card.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read a memo row from the Memo Tab**

`batch_get` on `Memo Tab` (ID `GR6vh`), focusing on a single list item.

- [ ] **Step 2: Create `MemoCard`**

Props:
- `title: string`
- `preview: string`
- `duration: string` (e.g., "2:34")
- `timestamp: string` (e.g., "2h ago")
- `mood?: string` (emoji)
- `href: string`

Layout: horizontal row with a play-button leading element, title + preview stacked, duration + timestamp trailing. Wrap entire card in `<Link href={href}>`. Use a static placeholder waveform SVG if `design.pen` shows one (no generation logic — a fixed-path SVG is fine).

- [ ] **Step 3: Render three MemoCards in sandbox with different props**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add MemoCard"
```

---

### Task 19: RecordButton

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/record-button.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the Memo Trigger v2 and recording frames**

`batch_get` on `Memo Trigger v2` (`BJyMw`) and any `recording` frame. The record button is the hero action — capture its exact size, gradient/fill, shadow, and inner icon.

- [ ] **Step 2: Create `RecordButton`**

Props: `state?: "idle" | "recording"` (controls inner icon: microphone vs square stop), `onPress?: () => void`, `size?: "md" | "lg"`. Uses a circular button with the extracted fill and shadow. `onPress` is optional — no real audio in this pass.

- [ ] **Step 3: Render both states in sandbox**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add RecordButton"
```

---

### Task 20: TabBar

**Files:**
- Create: `dear-me-nextjs/src/components/dear-me/tab-bar.tsx`
- Modify: `dear-me-nextjs/src/app/sandbox/page.tsx`

- [ ] **Step 1: Read the Tab Bar reusable component**

`batch_get` on IDs `QBz0Q` and `EeRbp` (both Tab Bar refs).

- [ ] **Step 2: Create `TabBar`**

Uses `next/navigation`'s `usePathname()` to derive the active tab. Renders four tabs:

```ts
const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/memo", label: "Memo", icon: Waveform },   // pick the closest Lucide icon
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: Flame },
] as const;
```

Layout: glass pill container fixed to the bottom of the mobile frame (not the viewport — stay inside `MobileFrame`'s inner div), with an animated indicator that slides to the active tab. For this pass the indicator can be a CSS `transform` driven by pathname — no Framer Motion.

**Note:** This component must be marked `"use client"` because it uses `usePathname`.

- [ ] **Step 3: Render in sandbox at the bottom**

Also visit `/sandbox` and click through to verify: since sandbox isn't one of the tab hrefs, the indicator should sit in its default position.

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add TabBar with animated indicator"
```

---

### Task 21: End of Phase B — remove the sandbox

**Files:**
- Delete: `dear-me-nextjs/src/app/sandbox/`

- [ ] **Step 1: Delete the sandbox route**

```bash
rm -rf dear-me-nextjs/src/app/sandbox
```

- [ ] **Step 2: Verify build + lint pass**

```bash
bun run build && bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add dear-me-nextjs
git commit -m "chore(nextjs): remove sandbox route, primitives done"
```

---

## Phase C — Tab screens

### Task 22: (tabs) layout

**Files:**
- Create: `dear-me-nextjs/src/app/(tabs)/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
import { ReactNode } from "react";
import { TabBar } from "@/components/dear-me/tab-bar";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
      <div className="relative px-4 pb-4">
        <TabBar />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add dear-me-nextjs/src/app/\(tabs\)
git commit -m "feat(nextjs): add (tabs) layout with TabBar"
```

---

### Task 23: Home screen (populated + empty state)

**Files:**
- Create: `dear-me-nextjs/src/app/(tabs)/home/page.tsx`

- [ ] **Step 1: Read the Home and Home Empty State frames**

Call `mcp__pencil__get_editor_state`, find the IDs for `Home` (`YUuPo`) and `Home Empty State` (`4Wr6B`). Then `batch_get` on both.

- [ ] **Step 2: Implement the page**

Create `src/app/(tabs)/home/page.tsx` with:

```tsx
const HAS_DATA = true; // flip to false to preview the empty state
```

Render two branches based on `HAS_DATA`:
- **Populated:** Header (greeting, title, subtitle), Quick Mood row (5 `MoodChip`s), Start Recording Card (`GlassCard` with `RecordButton` + label + sub), Daily Prompt card, `PrivacyNote`. All pulled directly from the `Home` frame structure.
- **Empty:** `<EmptyState icon={...} title={...} subtitle={...} cta={{label: "Record", href: "/record/trigger"}} />` matching the `Home Empty State` frame.

All content is static JSX. Use hand-built primitives from Phase B wherever they match. Client component not needed unless `RecordButton`'s `onPress` is wired (it's not in this pass — leave undefined).

- [ ] **Step 3: Visual verification**

```bash
bun run dev
```

Visit `localhost:3000/home`. Confirm the populated state matches the `Home` frame. Flip `HAS_DATA` to `false` in the file, save, confirm the empty state matches `Home Empty State`. Flip it back to `true`.

- [ ] **Step 4: Verify build + lint pass**

```bash
bun run build && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add Home screen (populated + empty)"
```

---

### Task 24: Memo tab screen

**Files:**
- Create: `dear-me-nextjs/src/app/(tabs)/memo/page.tsx`

- [ ] **Step 1: Read the Memo Tab and Memo Empty State frames**

`batch_get` on `Memo Tab` (`GR6vh`) and `Memo Empty State` (`GDqMs`).

- [ ] **Step 2: Implement the page**

Pattern mirrors Task 23:
- `const HAS_DATA = true;`
- Populated: Header, Search Bar (static — non-functional input styled to match), Filters row (`FilterPill`s), a list of ~5 `MemoCard`s with mock data. Each `MemoCard.href` points to `/memo/[id]` with a fake ID like `/memo/1`, `/memo/2`, etc.
- Empty: `EmptyState` matching the `Memo Empty State` frame.

- [ ] **Step 3: Visual verification at `/memo`, toggle `HAS_DATA`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add Memo tab screen (populated + empty)"
```

---

### Task 25: Insights tab screen

**Files:**
- Create: `dear-me-nextjs/src/app/(tabs)/insights/page.tsx`

- [ ] **Step 1: Read the Insights Tab and Insights Empty State frames**

`batch_get` on `Insights Tab` (`bYRjZ`) and `Insights Empty State` (`NhDmK`).

- [ ] **Step 2: Implement the page**

Pattern mirrors previous tab tasks. The populated state in `design.pen` likely contains charts or stats cards — for this pass, build them as static JSX using `GlassCard` containers with hardcoded numbers/labels. Any chart visuals become inline SVGs lifted from the frame (no charting library).

- [ ] **Step 3: Visual verification at `/insights`, toggle `HAS_DATA`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add Insights tab screen (populated + empty)"
```

---

### Task 26: Progress tab screen

**Files:**
- Create: `dear-me-nextjs/src/app/(tabs)/progress/page.tsx`

- [ ] **Step 1: Read the Progress frame**

`get_editor_state` to find the Progress/streaks frame (likely in the "12 others" set — match by name). `batch_get` on it.

- [ ] **Step 2: Implement the page**

Static streak visualization + stats cards matching the frame. Streak days can be a static grid of circles/squares. Each day that has an entry links to `/streak/[day]` with a fake param like `/streak/1`, `/streak/2`, etc.

- [ ] **Step 3: Visual verification at `/progress`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add Progress tab screen"
```

---

## Phase D — Record flow

### Task 27: record/ layout

**Files:**
- Create: `dear-me-nextjs/src/app/record/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
import { ReactNode } from "react";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function RecordLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
```

(No `BackHeader` here — each record screen renders its own header because some screens have different header treatments per `design.pen`.)

- [ ] **Step 2: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/ layout"
```

---

### Task 28: record/trigger screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/trigger/page.tsx`

- [ ] **Step 1: Read the Memo Trigger v2 frame**

`batch_get` on `Memo Trigger v2` (`BJyMw`).

- [ ] **Step 2: Implement**

Translate the frame to static JSX: `BackHeader`, main content (prompt / guidance copy from the frame), large `RecordButton` centered, CTA link to `/record/recording` when the record button is pressed (use `<Link>` wrapping the button for now, or just set `href` on a client-side link).

Since `RecordButton` is a button, wrap it in `<Link href="/record/recording">` or make a client component that calls `router.push`. Simpler: render an `<a>` wrapping a styled div that looks identical to `RecordButton`. Or add an optional `href` prop to `RecordButton` in a small follow-up edit — decide based on what's cleanest in the moment.

- [ ] **Step 3: Visual verification at `/record/trigger`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/trigger screen"
```

---

### Task 29: record/camera screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/camera/page.tsx`

- [ ] **Step 1: Read the camera frame from design.pen**

`get_editor_state` → find a frame for camera (may be named "Camera" or similar in the "12 others"). `batch_get` on it.

If no camera frame exists in `design.pen`, build a placeholder: full-bleed dark viewport with a centered camera icon, `BackHeader` overlay, and a "Next" CTA linking to `/record/recording`. This placeholder is a known gap — mark it with a `TODO: design.pen frame` comment so it's replaced later.

- [ ] **Step 2: Implement**

- [ ] **Step 3: Visual verification at `/record/camera`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/camera screen"
```

---

### Task 30: record/recording screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/recording/page.tsx`

- [ ] **Step 1: Read the recording frame**

`get_editor_state` → find the recording frame. `batch_get` on it.

- [ ] **Step 2: Implement**

Static UI for an active recording session: header, a running time display (hardcoded `0:12`), a waveform placeholder SVG (static path from the frame), a `RecordButton` in `state="recording"` (stops recording), possibly a "cancel" secondary button. Recording button links to `/record/processing`.

- [ ] **Step 3: Visual verification at `/record/recording`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/recording screen"
```

---

### Task 31: record/processing screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/processing/page.tsx`

- [ ] **Step 1: Read the Processing State v2 frame**

`batch_get` on `Processing State v2` (`flHHz`).

- [ ] **Step 2: Implement**

Full-screen loader matching the frame: animated icon or spinner, headline, subheadline. For this pass, a CSS animation is fine — no real work happens. Link a "Next" button (or auto-advance with a `<Link>`) to `/record/review`. Since this is a static scaffold, prefer a manual "Continue" button over a fake timer so the state is inspectable.

- [ ] **Step 3: Visual verification at `/record/processing`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/processing screen"
```

---

### Task 32: record/review screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/review/page.tsx`

- [ ] **Step 1: Read the review frame**

`get_editor_state` → find the review frame. `batch_get`.

- [ ] **Step 2: Implement**

Shows the recorded memo for review: title (editable in real life, static here), static transcript preview, waveform with playback controls (static button, no audio), "Looks good" CTA to `/record/add-notes`, "Re-record" CTA to `/record/trigger`.

- [ ] **Step 3: Visual verification at `/record/review`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/review screen"
```

---

### Task 33: record/add-notes screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/add-notes/page.tsx`

- [ ] **Step 1: Read the add-notes frame**

`get_editor_state` → find the add-notes frame. `batch_get`.

- [ ] **Step 2: Implement**

Header, optional mood selection row (`MoodChip`s), a `<Textarea>` (shadcn primitive) for notes, "Save" CTA to `/record/saved`. The textarea is non-functional — rendered for visual fidelity.

Must be a client component only if controlled input is needed for visual polish. Uncontrolled `<Textarea>` is fine.

- [ ] **Step 3: Visual verification at `/record/add-notes`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/add-notes screen"
```

---

### Task 34: record/saved screen

**Files:**
- Create: `dear-me-nextjs/src/app/record/saved/page.tsx`

- [ ] **Step 1: Read the Memo Saved frame**

`batch_get` on `Memo Saved` (`fv90M`).

- [ ] **Step 2: Implement**

Success state: celebratory icon/illustration, headline, subhead, primary CTA back to `/home`, secondary CTA to `/memo` (view memos).

- [ ] **Step 3: Visual verification at `/record/saved`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add record/saved screen"
```

---

## Phase E — Detail screens

### Task 35: memo/[id] detail screen

**Files:**
- Create: `dear-me-nextjs/src/app/memo/[id]/page.tsx`

- [ ] **Step 1: Read the memo detail frame**

`get_editor_state` → find a memo detail frame (may be named along the lines of "Memo Detail" or similar). `batch_get`.

If no dedicated detail frame exists and `Memo Playback v2` is the only memo-focused frame, use the playback frame's non-controls region as the detail layout and keep the full playback UI for Task 36.

- [ ] **Step 2: Implement**

`BackHeader` with the memo title (from route param or hardcoded), metadata (date, duration, mood), transcript preview, CTA to `/memo/[id]/playback`. Uses `params: { id: string }` from the route but doesn't do anything functional with it beyond displaying the static content.

- [ ] **Step 3: Visual verification at `/memo/1`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add memo/[id] detail screen"
```

---

### Task 36: memo/[id]/playback screen

**Files:**
- Create: `dear-me-nextjs/src/app/memo/[id]/playback/page.tsx`

- [ ] **Step 1: Read the Memo Playback v2 frame**

`batch_get` on `Memo Playback v2` (`ks2nB`).

- [ ] **Step 2: Implement**

Full-screen playback UI: header with back button, large waveform (static SVG from the frame), play/pause button (static — no audio), scrubber (static), transcript toggle linking to `/transcript/[id]`, share/delete actions.

- [ ] **Step 3: Visual verification at `/memo/1/playback`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add memo/[id]/playback screen"
```

---

### Task 37: transcript/[id] screen

**Files:**
- Create: `dear-me-nextjs/src/app/transcript/[id]/page.tsx`

- [ ] **Step 1: Read the transcript frame**

`get_editor_state` → find a transcript frame. `batch_get`.

- [ ] **Step 2: Implement**

`BackHeader`, full transcript text (lorem ipsum or the copy from the frame), optional per-paragraph timestamps. Purely textual screen.

- [ ] **Step 3: Visual verification at `/transcript/1`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add transcript/[id] screen"
```

---

### Task 38: streak/[day] screen

**Files:**
- Create: `dear-me-nextjs/src/app/streak/[day]/page.tsx`

- [ ] **Step 1: Read the streak day frame**

`get_editor_state` → find the streak day frame (the Expo app has `streak-day.tsx` so the frame likely exists). `batch_get`.

- [ ] **Step 2: Implement**

`BackHeader`, day stats, entries from that day as `MemoCard`s (mock data).

- [ ] **Step 3: Visual verification at `/streak/1`**

- [ ] **Step 4: Verify build + lint pass**

- [ ] **Step 5: Commit**

```bash
git add dear-me-nextjs
git commit -m "feat(nextjs): add streak/[day] screen"
```

---

## Phase F — Finalization

### Task 39: Full route walkthrough + final verification

**Files:** none modified.

- [ ] **Step 1: Production build**

```bash
cd dear-me-nextjs && bun run build
```

Expected: build succeeds, no errors, no warnings about missing routes or unresolved imports.

- [ ] **Step 2: Lint**

```bash
bun run lint
```

Expected: no errors, no warnings.

- [ ] **Step 3: Dev server smoke test — walk every route**

```bash
bun run dev
```

Visit each route and confirm it renders matching the corresponding `design.pen` frame, then confirm navigation works:

1. `/` → redirects to `/home`
2. `/home` (populated) — flip `HAS_DATA` to `false`, verify empty, flip back
3. `/memo` (populated + empty)
4. `/insights` (populated + empty)
5. `/progress`
6. Click a `MemoCard` → `/memo/1`
7. Click the playback affordance → `/memo/1/playback`
8. Click transcript → `/transcript/1`
9. Back button returns to `/memo/1`
10. Click tab bar through all four tabs — indicator animates to the active tab
11. `/record/trigger` → tap record → `/record/recording` → `/record/processing` → `/record/review` → `/record/add-notes` → `/record/saved` → back to `/home`
12. `/record/camera` renders (placeholder if no frame)
13. `/streak/1` renders

For any route that does not match `design.pen`, open an issue in notes (do not fix in this task — scope creep). The goal here is to confirm "scaffold done," not "pixel-perfect everywhere."

- [ ] **Step 4: Confirm Expo project untouched**

```bash
cd /Users/dirajthajali/work/projects/dear-me
git log --oneline app/ components/ src/ CLAUDE.md
```

Expected: no commits in this plan's history touch those paths. If they do, stop and ask the user how to handle it.

- [ ] **Step 5: Commit a marker**

```bash
git commit --allow-empty -m "chore(nextjs): scaffold complete — every route renders, build + lint clean"
```

---

## Deferred (do not implement in this plan)

The spec's non-goals list — `manifest.json`, service worker (Serwist), real audio (`MediaRecorder`), real camera (`getUserMedia`), data layer, auth, onboarding, settings, desktop layouts, dark-mode toggle UI, tests. Each of these is a separate plan when it lands.

---

## Self-review

**Spec coverage:**
- Spec §Goals 1 (new project at `dear-me-nextjs/`) → Task 1
- Spec §Goals 2 (tokens baked before shadcn init) → Tasks 3, 4, 5 in this order
- Spec §Goals 3 (every screen built) → Tasks 23–26 (tabs), 28–34 (record flow), 35–38 (detail)
- Spec §Goals 4 (mobile frame strategy) → Task 8
- Spec §Goals 5 (build + lint clean) → Tasks 7, 8, every per-phase verify step, Task 39
- Spec §Goals 6 (Expo untouched) → Task 39 Step 4
- Spec §Non-goals → Deferred section; no task implements any of them
- Spec §Architecture > Mobile frame → Task 8
- Spec §Architecture > Routing → Tasks 22 (tabs layout), 27 (record layout), 23–38 (every route)
- Spec §Architecture > Styling system → Tasks 3–7
- Spec §Architecture > Component inventory → Tasks 7 (shadcn), 8 (MobileFrame), 10–20 (hand-built)
- Spec §Scaffold sequence → Tasks 1–8

**Placeholder scan:** no "TBD", "TODO", "implement later", "handle edge cases" in task bodies. The camera task (29) contains a conditional "if frame doesn't exist, build placeholder with `TODO: design.pen frame` comment" — this is an intentional gap-marker for follow-up, not a plan-level placeholder.

**Type/naming consistency:**
- `MobileFrame` (Task 8) — referenced in Tasks 22, 27 ✓
- `ScreenBackground` (Task 10) — referenced in Tasks 22, 27 ✓
- `TabBar` (Task 20) — referenced in Task 22 ✓
- `BackHeader` / `BackPill` (Task 11) — referenced in Tasks 28, 35, 37, 38 ✓
- `GlassCard` (Task 12) — referenced in Tasks 23, 25 ✓
- `EmptyState` (Task 13) — referenced in Tasks 23, 24, 25 ✓
- `MoodChip` (Task 14) — referenced in Tasks 23, 33 ✓
- `FilterPill` (Task 15) — referenced in Task 24 ✓
- `MemoCard` (Task 18) — referenced in Tasks 24, 38 ✓
- `RecordButton` (Task 19) — referenced in Tasks 23, 28, 30 ✓
- `ChatInput` (Task 16), `PrivacyNote` (Task 17) — PrivacyNote referenced in Task 23; ChatInput built but only used in follow-up screens not in this pass. Acceptable — it's a future-ready primitive extracted from `design.pen`'s component set.
- `HAS_DATA` flag convention — used consistently in Tasks 23, 24, 25 ✓
- Mock ID convention `/memo/1`, `/streak/1` — used in Tasks 24, 26, 35, 36 ✓

All cross-task references resolve cleanly.
