# Landscape game board (and the "missing" seventh tableau pile)

**Status:** Fixed
**Date:** 2026-06-08
**Area:** Game screen orientation and `GameBoard` layout

## Symptom

Two issues were reported against the `GameBoard` view:

1. **Only six tableau piles render** — Klondike has **seven**, but the seventh
   was never visible on screen.
2. **The board is laid out vertically (portrait)** — it did not take advantage
   of a wider screen, leaving the playing field cramped.

## Root cause

Both symptoms share a single cause: **the app was locked to portrait**.

`app.json` declared `"orientation": "portrait"`, so the game screen rendered at
a narrow portrait width (~360–400px on a typical phone). The tableau is a
non-wrapping, non-scrolling flex row of seven fixed-width piles:

```
7 × 60px piles + 6 × 8px gaps ≈ 468px
```

That exceeds the portrait width, so the seventh pile was pushed past the right
edge and **clipped off-screen**. The pile was always being rendered — it just
had nowhere to be drawn. (This is why the unit tests, which render without a
real width constraint, always saw all seven piles and stayed green.)

So the seventh pile was never "missing" — it was off-canvas. Widening the board
to landscape both fixes the layout request (issue 2) and reveals the seventh
pile (issue 1).

## Fix

Scope decision: lock **only the game screen** to landscape; every other screen
(login, home, config, profile) stays portrait.

### 1. Allow landscape natively — `app.json`

```diff
- "orientation": "portrait",
+ "orientation": "default",
```

Required so the native app actually permits landscape. Without it, a runtime
lock to landscape is a no-op on iOS (the OS only allows orientations declared in
`Info.plist`, which Expo derives from this field).

### 2. Keep non-game screens portrait — `app/_layout.tsx`

Because `app.json` now allows all orientations, the root layout pins the app to
portrait by default:

```ts
useEffect(() => {
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
}, [])
```

### 3. Lock the game screen to landscape — `app/(protected)/game.tsx`

The game screen overrides the default while mounted and restores portrait on
exit:

```ts
useEffect(() => {
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
  return () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }
}, [])
```

### 4. Spread the tableau across the wide screen — `components/board/GameBoard.tsx`

With the extra horizontal space, the seven piles are distributed evenly instead
of bunching at the left edge:

```diff
  tableau: {
    flexDirection: 'row',
-   gap: 8,
+   justifyContent: 'space-between',
  },
```

### Dependency

Added `expo-screen-orientation@~56.0.5` (SDK 56-compatible) for the runtime
orientation locks.

> Note: the `--legacy-peer-deps` install (needed because of a pre-existing
> `react` / `react-dom` peer conflict in the repo) initially pruned
> `@react-native/jest-preset`, a `jest-expo` peer dependency. It was reinstalled
> to restore the test suite.

## Verification

- `npx jest --watchAll=false` — **79/79 tests pass**, including the
  `GameBoard` spec that asserts all seven tableau piles render.
- No new type errors in the changed source files.

A **native rebuild** (`npx expo run:android` / `run:ios`) is required for the
`app.json` orientation change and the new native module to take effect — a JS
reload alone will not pick them up.
