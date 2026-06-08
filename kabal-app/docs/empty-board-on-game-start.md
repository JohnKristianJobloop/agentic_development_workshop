# Bug: Game board starts empty — no deal, no stock/waste, no interactivity

**Status:** Fixed
**Date:** 2026-06-08
**Area:** Game setup (initial deal) and board rendering/interaction

## Symptom

When a game is **created** (or **resumed** into a freshly created session) and the
view switches to the `GameBoard`, the board is effectively empty and unplayable:

- The **foundations** render (four dashed empty slots), but the **stock**,
  **waste**, and **tableau** are not visible.
- The **tableau** and **stock** are not pre-filled from the deck as the rules of
  Klondike Solitaire require (7 piles of 1–7 cards, remainder in the stock).
- There is **no interactivity** — tapping cards, piles, foundations, or the stock
  does nothing.

In short, a new game does not actually start: there are no cards to play and no
way to play them.

## Root cause

Three independent gaps, all on the path from "create a session" to "render a
playable board":

### 1. The deck was never dealt

`behaviours/game-session/useCreateGameSession.ts` built a session with a
hard-coded **empty** board and an **empty** deck:

```ts
board: { tableau: [[], [], [], [], [], [], []], foundations: [[], [], [], []], stock: [], waste: [] },
deck: { cards: [], seed: 'default' },
```

No code anywhere performed the initial Klondike deal. `useDeck` could *build* a
shuffled 52-card deck, but nothing dealt those cards into the tableau and stock,
so every new game's board was structurally empty.

### 2. The stock and waste were never rendered

`components/board/GameBoard.tsx` only rendered the foundations row and the
tableau row:

```tsx
<View style={styles.topRow}>
  {board.foundations.map(...)}   // foundations only
</View>
<View style={styles.tableau}>
  {board.tableau.map(...)}        // tableau only
</View>
```

There was no markup for `board.stock` or `board.waste` at all. (The tableau row
*was* present but rendered nothing because, per gap #1, every pile was empty.)

### 3. Nothing was wired to the interaction handlers

`behaviours/game-board/useGameBoard.ts` already exposed a complete set of move
handlers — `moveCard`, `moveToFoundation`, `drawFromStock`, `moveFromWaste`,
`moveFromWasteToFoundation` — but `GameBoard` never called the hook. The
components (`Card`, `CardBack`, `Pile`, `Foundation`) had no `onPress`
affordances, so no gesture could reach those handlers.

## Fix

### Deal: a pure `dealGame` function, wired into session creation

New `behaviours/game-setup/dealGame.ts` implements the Klondike deal as a pure
function `dealGame(deck: Card[]): GameBoardState`:

- Tableau pile `i` (0-indexed) receives `i + 1` cards (1 → 7), 28 in total.
- The topmost card of each pile is turned **face-up**; the rest stay **face-down**.
  Face-up cards are derived from the deck's `"${value}-${suit}"` id format.
- The remaining 24 cards form the **face-down stock**.
- The **waste** starts empty; the **four foundations** start empty.

`useCreateGameSession` now builds a seeded, shuffled deck and deals it:

```ts
const seed = DEFAULT_SEED()
const cards = buildDeck(seed)

const session: GameSession = {
  ...
  board: dealGame(cards),
  deck: { cards, seed },
  ...
}
```

`buildDeck` was exported from `behaviours/deck/useDeck.ts` for reuse. Resume does
**not** deal — it loads an already-dealt board from the database.

### Render: stock + waste row added

`components/board/GameBoard.tsx` now renders the full Klondike layout: a
stock/waste row on the left (stock shows a card back when populated, a dashed
empty slot when exhausted; waste shows its top face-up card) and the four
foundations on the right, with the seven tableau piles below.

### Interactivity: tap-to-move wired through the existing handlers

`GameBoard` now calls `useGameBoard()` and drives all five handlers with a
**tap-to-select-then-tap-target** model:

- Tap the **stock** → `drawFromStock()`.
- Tap a **face-up card** (tableau or waste top) → selects it (yellow highlight);
  tapping it again clears the selection.
- With a card selected, tap a **tableau pile** → `moveCard` (tableau source) or
  `moveFromWaste` (waste source); tap a **foundation** → `moveToFoundation` or
  `moveFromWasteToFoundation`.

Selecting a buried face-up card carries its `cardId`, so the hook's `moveCard`
splits the stack at that card (tableau-stack moves work).

Supporting component changes:

- `Card` / `CardBack` — optional `onPress` + `testID`; `Card` gains a `selected`
  highlight.
- `Pile` — per-card select press and a background press target, with a
  `minHeight` so empty piles remain tappable as drop targets.
- `Foundation` — optional `onPress` drop target.

## Tests

### `behaviours/game-setup/__specs__/dealGame.spec.ts` (the requested behaviour)

Describes a correct game start. Given a full 52-card deck, dealing asserts:

- 7 tableau piles; pile `i` holds `i + 1` cards; 28 dealt in total.
- The top card of every pile is face-up; every buried card is face-down.
- The 24 remaining cards form the stock, all face-down; the waste is empty.
- Four empty foundations.
- Every deck card appears exactly once across the board (no loss / duplication),
  and face-up cards expose the suit and value encoded in the deck id.
- The deal is deterministic for a given deck.

### `behaviours/game-session/__specs__/createGameSession.spec.ts`

Added an integration assertion: a created session comes back with a 7-pile /
28-card tableau, a 24-card stock, and an empty waste.

### `components/board/__specs__/GameBoard.spec.tsx`

Renders `GameBoard` with a mocked `useGameBoard` and asserts the wiring:

- Stock, waste, all seven tableau piles, and all four foundations render.
- Tapping the stock draws.
- Select-a-tableau-card → tap foundation / tap another pile calls
  `moveToFoundation` / `moveCard` with the right args.
- Select-a-waste-card → tap pile / tap foundation calls `moveFromWaste` /
  `moveFromWasteToFoundation`.
- Double-tapping the same card clears the selection (no move fires).

All 79 tests pass across 15 suites.

## Design note / follow-up

The interaction model is **tap-to-select then tap-target**, not drag-and-drop —
far simpler to make reliable and testable in React Native, and it maps cleanly
onto the existing hook handlers. True drag-and-drop (e.g. via
`react-native-gesture-handler` / Reanimated) would be a larger, separate change;
the underlying handler wiring would stay the same.

`dealGame` stores the full shuffled deck on `session.deck` (seed + cards) as the
canonical record, while the live stock/tableau live on `session.board`. The deal
algorithm produces *a* valid deal (face-up cards last); it does not attempt to
mirror the exact physical row-by-row dealing order, which is immaterial to the
resulting board state.

## Key files

- `behaviours/game-setup/dealGame.ts` — the initial Klondike deal (new)
- `behaviours/game-setup/__specs__/dealGame.spec.ts` — deal behaviour tests (new)
- `behaviours/game-session/useCreateGameSession.ts` — now builds a deck and deals it
- `behaviours/deck/useDeck.ts` — `buildDeck` exported for reuse
- `components/board/GameBoard.tsx` — stock/waste rendering + handler wiring
- `components/board/Pile.tsx`, `Foundation.tsx`, `components/cards/Card.tsx`, `CardBack.tsx` — press affordances
- `components/board/__specs__/GameBoard.spec.tsx` — rendering + interaction tests (new)
- `behaviours/game-board/useGameBoard.ts` — pre-existing move handlers (now reached)
