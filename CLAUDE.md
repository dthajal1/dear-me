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
- `bun run typecheck` — run TypeScript type checking
- Package manager is **bun** (use `bun add` for dependencies)

## Architecture

- **Routing:** File-based routing via Expo Router. Routes live in `app/`, layouts in `_layout.tsx`.
- **Typed routes** are enabled — route params and paths are type-checked.
- **Path alias:** `@/*` maps to the project root.
- **Strict TypeScript** is enabled.

## Verification

After implementing any major feature, run both checks before considering the work complete:
1. `bun run typecheck`
2. `bun run lint`

## Native UI Preference

Always prefer native platform UI over custom implementations:
- **Navigation headers:** Use native Stack headers (`headerShown: true`, `headerTransparent`, `headerBackButtonDisplayMode: "minimal"`) — never custom back buttons.
- **Screen titles:** Use `Stack.Screen` options or `Stack.Screen.Title` for page titles — not inline `<Text>` elements.
- **Search bars:** Use `headerSearchBarOptions` on Stack.Screen — not custom TextInput search bars.
- **Modals/sheets:** Use `presentation: "formSheet"` with `sheetGrabberVisible` — not custom modal overlays.
- **Segmented controls:** Use `@react-native-segmented-control/segmented-control` for mode selection — not custom pill toggles.
- **ScrollViews:** Always set `contentInsetAdjustmentBehavior="automatic"` — never manual `paddingTop: insets.top`.
- **Icons:** Use SF Symbols via `expo-image` (`source="sf:name"`) on iOS. Keep `lucide-react-native` as cross-platform fallback.
- **Tab bar:** Custom design (glass pill with animated indicator) — this is intentional and should stay custom.

Use the `expo:building-native-ui` skill when working on UI tasks.

## Framework Reference

When working on Expo-related tasks, fetch up-to-date docs:

- https://docs.expo.dev/llms.txt (summary — use this by default)
- https://docs.expo.dev/llms-full.txt (full — only when summary lacks detail)
