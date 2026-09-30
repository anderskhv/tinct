# Notes from Underground — repair handoff

READY in staging. Whole-book absolute-path gate PASS. All 14 chapters originally classified LIGHT have been rendered in modern English. Chapters 1–7 were REAL and remain exactly as published; they contain no identical source paragraphs over 40 words requiring repair. No publication or deployment was performed. No Anthropic API calls or spend.

## Gate evidence

| Check | Before | After | Required |
| --- | --- | --- | --- |
| Weighted similarity | 0.852 | 0.511 | ≤0.75 |
| LIGHT + MECHANICAL | 14/21 (66.7%) | 0/21 (0.0%) | ≤5% |
| Identical long paragraphs | 13/334 (3.9%) | 1/334 (0.3%) | ≤5% |
| Wrapped scaffolding | 0 | 0 | 0 |
| Truncated quotations | 0 | 0 | 0 |
| Result | FAIL | PASS | PASS |

Full chapter readings and metrics: `gate-before.txt`, `gate-after.txt`.

Command used: `python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r1/notes-from-underground/notes-from-underground --gate --per-chapter`.

## Changed chapters and paragraphs

Chapter and paragraph numbers are one-based JSON positions; chapter 12 begins Part 2. Listed paragraphs differ from the published modern edition. Every chapter retains the original edition's paragraph count. Short replies and quoted verse sometimes remain verbatim within a rendered chapter.

| Chapter | Paragraph count | Changed paragraph positions |
| --- | --- | --- |
| 1 | 11 | Unchanged (REAL) |
| 2 | 4 | Unchanged (REAL) |
| 3 | 7 | Unchanged (REAL) |
| 4 | 2 | Unchanged (REAL) |
| 5 | 1 | Unchanged (REAL) |
| 6 | 2 | Unchanged (REAL) |
| 7 | 2 | Unchanged (REAL) |
| 8 | 6 | 1–6 |
| 9 | 3 | 1–3 |
| 10 | 5 | 1–5 |
| 11 | 14 | 1–14 |
| 12 | 30 | 1–30 |
| 13 | 6 | 1–6 |
| 14 | 40 | 1–40 |
| 15 | 99 | 1–99 |
| 16 | 26 | 1–26 |
| 17 | 120 | 1–43, 45–120 |
| 18 | 13 | 1–13 |
| 19 | 46 | 1–46 |
| 20 | 35 | 1–35 |
| 21 | 23 | 1–23 |

## Fidelity checks

- Original file is a byte-identical copy of the live source at repository revision `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`. Edition and chapter metadata were retained.
- Chapters 1–7 are unchanged from the published modern edition. No paragraph was merged, split, dropped, or added.
- Every paragraph in repaired chapters 8–21 is at least 75% of its source's whitespace-delimited word count; observed minimum 0.750. All exclamation-mark counts match the source paragraph by paragraph in those chapters.
- The Nekrassov epigraph and Juliet Soskice credit (12:1) are preserved verbatim and account for the one identical long paragraph. The quoted verse in 19:5, 19:17, and 20:1 remains complete. Fictional dialogue and the narrator's imagined conversations are rendered in full, including interrupted thoughts, rather than abridged.
- Terms and allusions retain their identities: underground, the sublime and the beautiful, free will, organ-stop, chemical retort, consumption, roubles/kopecks, point d’honneur, droit de seigneur, preference, Gogol/Pirogov, Pushkin/Silvio, Lermontov/Masquerade, George Sand, Lovelace, Alexander of Macedon, Shakespeare, Austerlitz, and the deliberately relocated Lake Como.

## Spot-read notes — first three paragraphs of three chapters

- Chapter 8, paragraphs 1–3: retained the three opening laughs/exclamations and interrupted scientific claim; the mathematical account of desire still leads to the organ-stop objection; the reply retains natural laws, the nose gesture, thirty-year prediction, tables, and chemical retort. Syntax is contemporary without collapsing either side's argument.
- Chapter 12, paragraphs 1–3: epigraph and attribution intact; age twenty-four, the pockmarked colleague, the smelly uniform, self-loathing, ugly/intelligent face, gaze experiments, sheep, coward/slave distinction, white feather, donkeys and mules remain. The narrator's contradictory vanity and abasement are audible rather than explained away.
- Chapter 21, paragraphs 1–3: preserved the quarter-hour interval, screen and floor positions, revenge and personal envy, qualification of what Liza understood, love as tyranny, subjugation, and her coming to love rather than to hear fine sentiments. The narrator's self-indictment and generalisation about women remain his own claims.

Additional checks preserved the invitation's chronology (16:15), the full coffin/burial speech (18:1), Apollon's wages and coercive staring, and the return of the five-rouble note. The final bracketed editorial paragraph remains part of the book, not generated scaffolding.

## Known issues and protected source exceptions

- The explicit instruction to leave REAL chapters unchanged preserves three pre-existing differences: 1:10 has two modern words against three source words (below 75%); 4:1 has two exclamation marks against one; 7:1 has five against six. These are not introduced by this repair. No claim is made that those protected paragraphs satisfy the new rendering constraints.
- The supplied source has occasional damaged punctuation (including the imagined monologue around 16:17 and the continuation into the verse at 19:16–17). No missing prose has been invented; supplied paragraph boundaries and verse are retained.
- The source's historical vocabulary, prejudices, coercive conduct, and unreliable assertions remain part of the narrator's voice. No modern factual claims or editorial corrections were substituted.
- `books/characters/notes-from-underground/` does not exist in this checkout. No existing character supplement needs reconciliation; none was created.

## SHA-256

- `notes-from-underground-original-en.json`: `c600f3f5ac6508240ab0bf733bff2b8944ef082c08d14b7834df52977698c237`
- `notes-from-underground-modern-en.json`: `f1b0a5dc65b4d9c67b43d3f26306ba17577dddad6c58292d445d65b5ced8eff1`

## Resume point

None. All requested r1 books are gate-passing staged repairs. The protected-source exceptions above remain documented for review; live editions are untouched.
