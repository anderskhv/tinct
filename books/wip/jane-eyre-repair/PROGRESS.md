# Jane Eyre — Modern English Repair — Progress Log

**Owner:** Claude (translation content agent), session branch `claude/friendly-albattani-qgyqfi`
**Scope:** Content only. No live edition files, app code, registry, audio, or defaults touched. All candidates staged under `books/wip/jane-eyre-repair/`.
**Started:** 2026-09-17

## Source & treatment

- Source: `original-en` = Charlotte Brontë, 1847, public domain (Project Gutenberg #1260, `books/raw/jane-eyre/SOURCE.md`).
- Unlike Confessions, Jane Eyre's `modern-en` is NOT a passthrough — it is genuine modernization across most of the book (see diagnostic audit below). Treatment here is **targeted spot-repair of a specific damaged zone**, not a full re-render.

## Diagnostic audit finding (2026-09-17)

Full-book diagnostic (structural integrity + close paragraph comparison across ~10 sampled chapters + word-retention-ratio scan of all 38 chapters):

- **Structural integrity: perfect.** 38/38 chapters, paragraph counts match exactly in every chapter (4,047 paragraph pairs). Do not disturb this alignment.
- **Chapters 1–26, 28–34: sound.** Genuine, accurate modernization; do not touch.
- **Chapter 34 false alarm resolved:** its high near-identical rate is because it's dialogue-heavy, not half-finished — word ratio 1.031 (longer than original), zero flagged paragraphs, best fidelity in the book. Produced by a different (better/later) generation run — visible from its unique curly-quote typography vs. straight quotes everywhere else. **Leave untouched**, note the quote-style inconsistency as a cosmetic item for a future pass, not a fidelity defect.
- **Damaged zone, "summarize-and-patch" failure mode (content dropped + invented text patched over the seam, sometimes including outright meaning inversion and one plot corruption):**
  - Chapter 27, paragraphs ~146–162 only (163 total; rest of chapter is sound) — Jane's flight from Thornfield, ~290 words of the emotional/physical collapse passage dropped from one paragraph, an invented image substituted, a meaning inversion (locked gate → open gate).
  - Chapter 35 (98 paragraphs) — paragraph 83: source's "verge of surrender" internal struggle inverted into its opposite (refusal), which self-contradicts the very next paragraph (84, sound) where Jane does capitulate — makes the psychological crisis unreadable as written.
  - Chapter 36 (80 paragraphs) — paragraph 48: outright plot corruption. Fire geography reversed (who set which fire where, and whether Rochester was in the room), invented rescue narrative, ~150 words of aftermath (Rochester's search for Jane, Mrs. Fairfax pensioned, Adèle sent to school, Rochester's hermit years) dropped — breaks the next paragraph's dialogue cue.
  - Chapter 37 (262 paragraphs) — worst chapter: 1,212 net words lost across 26 flagged paragraphs, including the emotional core of the reunion (mutual "I lived in his presence" passage), Rochester's account of his despair, and setup/payoff pairs broken (scorched eyebrows → "pocket-comb" line becomes a non-sequitur).
  - Chapter 38 / Conclusion (24 paragraphs) — 4 flagged paragraphs: Adèle's epilogue gutted, the famous "bone of his bone" marriage passage has its ending replaced with invented text (plus a grammar break), and paragraph 13 is cut mid-thought, dropping the reciprocity passage that resolves the whole novel.
- **Minor independent defect, not part of the damage zone:** `Adèle` → `Adele` (dropped accent) in 10 paragraphs across chapters 11, 12, 38. Trivial, fixable directly without full review cycle.

**Total repair scope: ~464 of 4,047 paragraphs (~11.5%), covering the four chapters 35–38 in full plus chapter 27's tail (paragraphs 146–162 only).** Chapters 1–26, 28–34 are NOT being touched.

**Acceptance check note from the audit** (important — difflib similarity does NOT discriminate the defect): use per-paragraph word-retention ratio (flag <0.85 for source paragraphs ≥25 words) plus a read-through for fabricated imagery, not a bare similarity score — sound chapter-1 paragraphs score as low as 0.05–0.10 on difflib, identical to damaged ones, because genuine modernization changes surface text heavily too.

## Repair units and status

| Unit | Draft | Independent review | Corrected | Verified | Accepted |
|---|---|---|---|---|---|
| Ch27 tail (paras 146–162, 0-based ~145-161) | queued | — | — | — | — |
| Ch35 (full chapter, preserving sound paragraphs) | done — 1/98 paragraphs changed (para 83, meaning-inversion fixed: temptation/ambivalence restored in place of confident refusal, resolves self-contradiction with next paragraph), independently diffed and confirmed | queued | — | — | — |
| Ch36 (full chapter, preserving sound paragraphs) | done — 1/80 paragraphs changed (para 48, fire geography + invented rescue + omitted aftermath fixed), independently diffed and confirmed | queued | — | — | — |
| Ch37 (full chapter, preserving sound paragraphs) | queued | — | — | — | — |
| Ch38 / Conclusion (full chapter, preserving sound paragraphs) | done — 4/24 paragraphs changed (paras 1, 10, 12, 13: kitchen staging, Adèle epilogue, "bone of his bone" ending, reciprocity passage all restored), independently diffed and confirmed | queued | — | — | — |
| Adèle accent fix (10 paragraphs, ch11/12/38) | not started (trivial, direct fix, no review cycle needed) | — | — | — | — |

## Models used

- Diagnostic audit: Claude Opus (Agent tool)
- Drafting/correction: Claude Sonnet
- Independent review/verification: Claude Opus

## Next action

Dispatch drafting for the 5 repair units. Given each unit only needs the FLAGGED paragraphs re-rendered (sound paragraphs preserved verbatim from the current modern-en), instruct drafters to only touch the specific paragraphs the audit identified, output the full chapter with sound paragraphs unchanged.
