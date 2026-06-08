---
name: feedback-discriminated-unions
description: User prefers discriminated union types over boolean flag fields for pattern matching in TypeScript
metadata:
  type: feedback
---

Use discriminated unions (tagged with a `kind` or `type` field) instead of boolean flags when a value can be in distinct states.

**Why:** Enables exhaustive pattern matching on the type tag itself, rather than checking a boolean and casting. Gives the type system more information and avoids accessing fields that don't exist in a given state (e.g. `suit` on a face-down card).

**How to apply:** Whenever a type can be in two or more structurally different states (different available fields), split it into named types and union them. Applies to both state flags (e.g. `FaceDownCard | FaceUpCard`) and entity states (e.g. `AnonymousUser | AuthenticatedUser`). Authenticated/valid states always carry non-nullable fields; unauthenticated/invalid states carry none of them.
