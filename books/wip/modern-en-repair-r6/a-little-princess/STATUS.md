# Repair r6 status

- a-little-princess: rendering complete; whole-book gate PASS (0.632 similarity, 0/19 LIGHT/MECHANICAL, 1.6% identical long, zero flagged truncated quotations).
- 19 chapters / 1,701 paragraphs retained; 603 paragraph changes. All newly rendered paragraphs meet the word floor. Two inherited REAL-chapter word-floor exceptions documented in HANDOFF.md.
- Passing package prepared for delivery on `content/modern-en-repair-r6`; not published.
- niels-lyhne: not started. Resume at its chapter-1 boundary by running `python3 books/classify-modern-en.py niels-lyhne --per-chapter`, then copy its live original-en and modern-en into its own sibling staging folder.
- Token-limit resume checkpoint: a-little-princess book boundary; next book niels-lyhne. Do not redo this passing rendering.
- Branch delivery must use a tree based on pinned origin/main plus only this owned package; the available local checkout has unrelated historical content commits which must not be included.
