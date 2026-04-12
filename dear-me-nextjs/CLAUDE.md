@AGENTS.md

# CLAUDE.md (dear-me-nextjs)

This file provides guidance to Claude Code when working inside `dear-me-nextjs/`. The `@AGENTS.md` import above pulls in the Next.js team's Next 16 warnings — read them before writing any Next.js code in this tree.

## Project Overview

`dear-me-nextjs` is the Next.js 16 (App Router) rebuild of the dear-me voice journaling app. The design source of truth is `../design.pen` (read via the `pencil` MCP server — never with Read/Grep). This project is a mobile-first PWA-in-progress: for now it's static UI, with real features landing incrementally.

The sibling `../app/`, `../components/`, and `../src/` directories belong to the original Expo project and must not be modified from inside this project. (The root `CLAUDE.md` was removed when this project took over the repo.)

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
- **Styling:** Tailwind v4 + shadcn/ui, heavily themed. Tokens live as CSS variables in `app/globals.css`. shadcn primitives are copied into `components/ui/` and customized there. Hand-built components live in `components/dear-me/`.
- **Icons:** `lucide-react` only.
- **Mobile frame:** full-bleed on mobile, centered ~430px column on desktop via `MobileFrame` in the root layout. No fake phone chrome.
- **No TDD for UI scaffolding.** Verify by visual check in dev + build + lint. Tests are deferred until real behavior lands.

## Design.pen

Always use the `pencil` MCP server tools (`get_editor_state`, `batch_get`, etc.) to read `design.pen`. The file is encrypted — Read/Grep will not work. Before using any pencil tool, ensure the Pencil desktop app is running with `../design.pen` open.
