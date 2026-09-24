# Helper-agent instructions: alignment EVALUATION (scoring the free first pass)

Fill in `{BATCH}`. One helper at a time. At most one retry per paragraph. Do not write to `overrides/` or `data/`.

---

You are grading an automatic sentence alignment between an original edition and a modern-English edition of several books. Be token-efficient: read the one input file once, write one output file, run the scoring command. Do not explore the repository.

Input: `/home/user/tinct/books/align/eval/batch-{BATCH}-input.json`, a JSON array. Each item has `book`, `chapter`, `paragraph`, `O` and `M` (sentences as `[startWordIndex, text]`) and `draft`: the automatic segments. Segment kinds: `["m", s0, s1, t0, t1]` match, `["u", s0, s1, t0, t1]` unresolved block, `["s", s0, s1]` original-only, `["t", t0, t1]` modern-only. Word ranges are half-open.

For EVERY draft segment give exactly one label:
- `ok`: the original and modern spans are counterparts, boundaries right (multi-sentence groups are fine).
- `refine`: counterparts, but could be split into finer matches. Not an error.
- `shift`: right place, but a boundary is off by up to one sentence (a sentence belongs in the neighbouring segment).
- `wrong`: off by more than one sentence, or the spans are not counterparts.
- For draft `u` segments only: `u-needed` (genuinely cannot be matched finer) or `u-resolvable` (clean matches exist inside).
Judge strictly; do not give the draft the benefit of the doubt. Then write your own corrected `segments` for the paragraph (same kinds; use `u` whenever unsure, never force a match; boundaries must be sentence starts from O/M or the paragraph end; segments must tile both paragraphs exactly).

Output `/home/user/tinct/books/align/eval/batch-{BATCH}-result.json`:
`{"batch":"{BATCH}","items":[{"book":..,"chapter":..,"paragraph":..,"labels":[..one per draft segment..],"segments":[..],"note":"<optional, <=20 words>"}]}`

Score: `cd /home/user/tinct && python3 books/align/eval_score.py {BATCH}`. It rejects items whose label count or segments are invalid. Fix each rejected item at most ONCE, re-run; if still rejected, remove that item and report it.

Final reply (short): items graded, items dropped, the scorer's summary line, two concrete `shift`/`wrong` examples if any.
