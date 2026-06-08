# Bug: `board.foundations` is `undefined` when resuming a game session

**Status:** Fixed
**Date:** 2026-06-08
**Area:** Game session persistence (Firebase Realtime Database)

## Symptom

When a user logs back into the app and clicks **Resume game**, the app crashes
with:

```
TypeError: Cannot read properties of undefined (reading 'map')
```

The crash originates at `components/board/GameBoard.tsx:14`:

```ts
{board.foundations.map((foundation, i) => ( ... ))}
```

`board.foundations` is `undefined` at runtime, even though the `GameBoardState`
type declares it as `foundations: Foundation[]` (a non-optional array). The same
class of crash can occur in `behaviours/game-board/useGameBoard.ts` at
`moveToFoundation` (line 60) and `moveFromWasteToFoundation` (line 94), which
also call `foundations.map(...)`.

## Root cause

The type guarantee is a **lie at the deserialization boundary**.

Game sessions are persisted to **Firebase Realtime Database (RTDB)**. RTDB does
**not** store empty arrays, empty objects, or `null` — any key whose value
serializes to one of those is silently dropped on write and is therefore absent
on read. Additionally, a populated array comes back with `null` holes where the
empty entries used to be.

`infrastructure/firebase/database.ts` read the data back with an unchecked cast:

```ts
return snapshot.exists() ? (snapshot.val() as GameSession) : null
```

The `as GameSession` cast asserts the shape but validates nothing, so TypeScript
believes `foundations` is always present while at runtime it has been dropped.

### Step-by-step path to `undefined`

1. A new game is created in `behaviours/game-session/useCreateGameSession.ts:17`
   with `foundations: [[], [], [], []]` — four empty piles.
2. `writeGameSession` persists the session. Because every foundation pile is
   empty, RTDB drops each `[]`, leaving the `foundations` array itself empty,
   which it then also drops. **The `foundations` key never reaches the database.**
3. The player plays normally but, as is typical in the early game, has not yet
   moved any card onto a foundation, so `foundations` stays all-empty on every
   subsequent write.
4. On logout/login, `useResumeGameSession` → `readGameSession` reads the session
   back. The board returns with populated `tableau`/`stock`, but
   **`board.foundations` is `undefined`**.
5. `GameBoard.tsx:14` runs `board.foundations.map(...)` → `TypeError`.

> Note: for a brand-new game where the *entire* board is empty, RTDB drops the
> whole `board` key. The reported scenario is an in-progress game where only the
> still-empty `foundations` was dropped.

### Why existing tests missed it

`behaviours/game-session/__specs__/resumeGameSession.spec.ts` mocked
`readGameSession` to return a hand-built object that already included
`foundations: []`. It never exercised the Firebase serialization round-trip, so
the field was always present in tests but absent in production.

## Fix

Normalize / re-hydrate the board on read in `infrastructure/firebase/database.ts`,
replacing the bare cast with validation + defaults:

- `toPile(value)` — returns an array, defaulting to `[]` and stripping `null`
  holes from sparse arrays (`stock`, `waste`).
- `toFixedPiles(value, count)` — rebuilds fixed-size pile collections
  (`tableau` = 7, `foundations` = 4), filling missing/`null` entries with `[]`.
- `normalizeBoard` / `normalizeSession` — applied in both `readGameSession` and
  `subscribeToGameSession` (which shared the identical unsafe cast).

This guarantees the runtime board shape matches the `GameBoardState` type the
rest of the app trusts, so `foundations.map(...)` can never hit `undefined`.

## Regression tests

`infrastructure/firebase/__specs__/readGameSession.spec.ts` drives the real
`readGameSession` through a `stripEmpty()` helper that faithfully models RTDB's
dropping of empty values:

- An in-progress game (cards dealt, foundations empty) reads back with
  `foundations === [[], [], [], []]`, mapping no longer throws, and populated
  piles survive while empty ones default.
- A brand-new game (whole board stripped) re-hydrates to its empty starting
  shape.

## Residual risk / follow-up

This fix repairs the **read** path, which resolves the crash. Empty arrays are
still dropped on **write** — invisible now because reads repair them. If a future
pile type has a count that is not fixed/known ahead of time, the same class of
bug could resurface. A schema-validation layer (e.g. Zod) at the persistence
boundary would be a more durable long-term guard than hand-written normalization.

## Key files

- `infrastructure/firebase/database.ts` — normalization (the fix)
- `infrastructure/firebase/__specs__/readGameSession.spec.ts` — regression tests
- `components/board/GameBoard.tsx:14` — original crash site
- `behaviours/game-board/useGameBoard.ts:60,94` — additional `foundations.map` call sites
- `behaviours/game-session/useCreateGameSession.ts:17` — where empty foundations originate
- `behaviours/game-session/useResumeGameSession.ts` — resume entry point
