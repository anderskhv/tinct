# Fear and Trembling modern-English — progress ledger

Branch `claude/fear-and-trembling-modern-en-20260911`. Content agent for the
Fear and Trembling thread; the coordinator reads this file, Anders does not
read the session. Kept current at every push.

## Done

- 2026-09-11 — Read the Meditations package's process template
  (`WORKFLOW.md`, `GLOSSARY.md`, `PROVENANCE.md`, `00-progress-ledger.md`,
  and `book5/` in full) from branch `claude/meditations-modern-en-20260911-v2`,
  as the template for this package's own `WORKFLOW.md`.
- 2026-09-11 — **Step 1 (verify) done, and it surfaced a real problem.** The
  served `original-en` (registered and labeled to readers as plain "Original
  (English)," no qualifier) is **not** a historical public-domain
  translation. Git history shows it was added ten days after the Danish
  original, in commit `b76fa5649` (2026-05-04), whose own message says it is
  a "Formal/period English translation of Frygt og Bæven, generated from the
  1843 Danish source in a Lowrie/Hannay-adjacent register" — i.e., an
  AI-authored (Claude Opus) paraphrase deliberately styled to read like the
  copyrighted Lowrie (1941) and Hannay (1985) translations, because "No PD
  historical translation exists for this work." A web search comparing the
  served Preface against documented excerpts of Lowrie, Hannay, and the
  Cambridge/Walsh edition found no verbatim match to any of the three, but
  found one passage suspiciously close to a documented Hannay rendering
  (the "score-keeper" sentence) — full evidence in `PROVENANCE.md` §1.
  **Rights verdict: UNCERTAIN.** Per instructions, drafting proceeds from the
  public-domain Danish original (`fear-and-trembling-original-da.json`)
  instead, not from the served `original-en`.
- 2026-09-11 — Confirmed Danish/English served-file alignment: both have
  exactly 8 chapters and 232 paragraphs, chapter-by-chapter and
  paragraph-by-paragraph identical counts, and the same OCR-page-break
  artifact lands at the same mid-sentence spot in Chapter 1 of both files —
  confirming real alignment, not a coincidence of matching totals
  (`PROVENANCE.md` §3). **No split-view consequence** from sourcing the
  modern edition from Danish instead of the served English.
- 2026-09-11 — `WORKFLOW.md` written: eight steps (adapted for a chapter-
  numbered rather than book-numbered layout), scope, and voice rules, plus
  the book-specific note that Step 1 already surfaced an UNCERTAIN rights
  finding that changes the source for the whole book.
- 2026-09-11 — `GLOSSARY.md` written: core technical vocabulary (the knight
  of faith, infinite resignation, the movement/leap of faith, the absurd,
  the teleological suspension of the ethical, the single individual, the
  universal, and others) fixed in advance of the chapters that introduce
  them, since only Chapter 1 has been read so far; plus the terms actually
  met in Chapter 1 (faith, the System, and the title phrase "fear and
  trembling" itself, which appears in the Preface) and general voice/form
  rules (foreign-language insertions kept untranslated, "the System"
  capitalized, "Cartesius" → "Descartes").
- 2026-09-11 — **Chapter 1 (Forord / Preface) drafted and frozen** (steps
  2–3): `ch01/candidate-v1.json` (sha256 `f19ac0c1…`), 5 paragraphs 1:1 with
  the Danish Preface, word ratio 1.068 (all five per-paragraph ratios at or
  above 1.0 — no compression). Readable copy, `continuity.md`,
  `provenance.json`, `manifest.json`, `review-instructions.md`, and two
  review packets (3 + 2 paragraphs) written and mechanically checked.
  **Stopped for independent review** (step 4, coordinator's reviewer
  session). Findings expected under `ch01/review/`.

## Decided (and why)

- Drafted from the Danish, not the served `original-en` or `modern-en`:
  neither is a reliable rights-clear source (see above). This means the
  candidate is a fresh translation from 1843 Danish, not a modernization of
  an existing English text — consistent with how the book was originally
  added (commit `ae1b7cb58`, "no PD English translation bridge") before
  someone later added an AI-paraphrase `original-en` anyway.
- "Cartesius" → "Descartes": the name a modern reader recognizes for the
  same historical person; not a technical term, so no glossary tension with
  "keep foreign insertions as-is" (that rule covers Kierkegaard's German and
  Latin *phrases*, not this one proper name he happens to Latinize).
  Documented in `ch01/continuity.md` and `GLOSSARY.md` for a reviewer to
  challenge if they disagree.
- Two deliberate departures from wording surfaced during the provenance
  search ("Extra-Skriver" not rendered as the phrasing associated with
  another translation for that term; "Posekigger" likewise), to keep this
  candidate demonstrably independent of any published or AI-paraphrased
  translation, even at the cost of picking a slightly less obvious English
  phrase in two places. Documented in `ch01/continuity.md`.

## Next

Waiting on the coordinator: independent review of Chapter 1
(`ch01/review-packets/`, `ch01/review-instructions.md`). This task does not
review its own draft and does not proceed to Chapter 2 (Exordium) without
that review or further instruction — the task as given stops after
Chapter 1's freeze.

## Needs Anders

1. **The served `original-en` rights problem is bigger than this task.**
   Every Tinct reader today sees a 2026 AI paraphrase labeled plainly
   "Original (English)," with no translator credit or rights caveat, written
   in a register its own commit message calls "Lowrie/Hannay-adjacent." This
   is a live production concern independent of whether this staged
   replacement is ever adopted — full evidence in `PROVENANCE.md` §1. This
   task's scope is content-only staging and does not touch the served file
   or the registry; flagging it for Anders's decision.
2. **Cartesius → Descartes.** A stylistic call, not a rights call — noted so
   Anders (or the independent reviewer) can override it if the Latinized
   form is preferred for period flavor.
3. **Whether to continue past Chapter 1.** This task stops at the frozen
   Chapter 1 candidate per its instructions; Chapters 2–8 (227 more
   paragraphs, including the three long Problema chapters) are not started
   and would need the same treatment, plus the core-vocabulary glossary rows
   confirmed at their first real use.
