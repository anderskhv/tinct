# Repair status — chapter-boundary checkpoint

Branch: `content/modern-en-repair-r1`.

1. magna-carta — READY; PASS, similarity 0.505; pushed in 70defe6ef63567ece8787f1f7ea1df36a74ba515.
2. communist-manifesto — READY; PASS, similarity 0.491; pushed in e36225328c6695401067373aecd3af71735338d2.
3. symposium — READY; PASS, similarity 0.500; pushed in c5945d4c63285b35f1e69ef871e90c5309a7b822.
4. kant-groundwork — NOT READY; copies and before/after-staging FAIL recorded locally. No paragraphs changed. Resume at chapter 3 paragraph 1; chapter 3 is 15,926 source words and cannot be completed within this turn’s remaining token budget. Chapters 1–2 are REAL and need no changes. Chapter 4 follows chapter 3.
5. notes-from-underground — NOT STARTED; wait until Kant passes, preserving requested order.

Kant checkpoint is local and uncommitted. Completed packages are pushed. Staging only, no publication or deployment, zero Anthropic API spend. Use explicit r1 refs for future commits; other tasks share this checkout and have switched its active branch.
