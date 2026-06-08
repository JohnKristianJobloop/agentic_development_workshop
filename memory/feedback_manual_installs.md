---
name: feedback-manual-installs
description: User runs npm install themselves — never run it on their behalf
metadata:
  type: feedback
---

Do not run `npm install`, `yarn`, or any package manager install commands.

**Why:** The user wants to validate package choices before they are installed.

**How to apply:** When dependencies are needed, create or update `package.json` with the right entries and stop there. Tell the user to run install themselves.
