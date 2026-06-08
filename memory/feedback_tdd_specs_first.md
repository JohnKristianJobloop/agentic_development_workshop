---
name: feedback-tdd-specs-first
description: Always write Jest spec files before writing the implementation they describe
metadata:
  type: feedback
---

Write the spec file before the implementation file — not after.

**Why:** The user follows TDD. Specs define the expected behaviour first; the implementation is written to satisfy them.

**How to apply:** For every new behaviour hook, service, or utility, create the `__specs__/*.spec.ts` file first with Given/When/Then describe blocks and `it` assertions, then create the implementation file. Never write the implementation first.
