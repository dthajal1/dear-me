# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dear-me** — a universal (iOS, Android, Web) app built with Expo SDK 54, React Native 0.81, and React 19. Uses the New Architecture and React Compiler.

## Commands

- `bun start` — start Expo dev server
- `bun run ios` — run on iOS simulator
- `bun run android` — run on Android emulator
- `bun run web` — run in browser
- `bun run lint` — run ESLint via `expo lint`
- Package manager is **bun** (use `bun add` for dependencies)

## Architecture

- **Routing:** File-based routing via Expo Router. Routes live in `app/`, layouts in `_layout.tsx`.
- **Typed routes** are enabled — route params and paths are type-checked.
- **Path alias:** `@/*` maps to the project root.
- **Strict TypeScript** is enabled.

## Framework Reference

When working on Expo-related tasks, fetch up-to-date docs:

- https://docs.expo.dev/llms.txt (summary — use this by default)
- https://docs.expo.dev/llms-full.txt (full — only when summary lacks detail)
