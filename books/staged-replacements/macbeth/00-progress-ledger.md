# Macbeth modern-English — progress ledger

Branch `claude/macbeth-modern-en-20260911`. Content agent for the Macbeth
thread; the coordinator reads this file. Kept current at every push.

## Done

- 2026-09-11 — Read the Meditations package's eight-step process
  (`books/staged-replacements/meditations/WORKFLOW.md`, `GLOSSARY.md`,
  `PROVENANCE.md`, `00-progress-ledger.md`, and the accepted `book5/`
  package, all on branch `claude/meditations-modern-en-20260911-v2`) and
  adapted it for a play into `WORKFLOW.md`: chapter = scene, paragraph = the
  served JSON's own unit (speech or stage direction), stage directions and
  speaker labels copied verbatim rather than modernised.
- 2026-09-11 — Source verified (`PROVENANCE.md`). The served
  `macbeth-original-en.json` (sha256 `2650bcc6…`) has 28 chapters (one per
  scene, matching the 5-act `sections` grouping) and 806 paragraphs total,
  16,520 words — matching the task brief exactly. Paragraph format
  inspected directly: every paragraph is either a bracketed stage direction
  or one `SPEAKER. ` speech; the whole file contains no `\n` characters, so
  no verse lineation survives to preserve — candidates render speeches as
  flowing modern prose. Content of chapters 1–2 (34 paragraphs) compared
  word-for-word against Project Gutenberg #1533 and #100 (fetched
  directly, both the same underlying modernised-spelling edition): an exact
  match except (a) the served scene 1 title, "A Desert Place," where PG
  prints "An open Place," and (b) one missing unattributed line, "Who comes
  here?", dropped from the served scene 2 between two stage directions. All
  28 scene headings (not just 1–2) checked against PG for the "The same." →
  actual-location resolution pattern; consistent throughout except the one
  scene 1 title. Public domain confirmed (Shakespeare d. 1616; the
  PG #1533/#100 edition itself 19th-century). Registry carries no
  translator credit for Macbeth (correctly — original English, not a
  translation), so no attribution fix is needed, unlike Meditations.
- 2026-09-11 — `GLOSSARY.md` written: thee/thou modernisation, "Thane" and
  proper names/personifications (Fortune, Valor, Bellona, Golgotha,
  Graymalkin, Paddock) kept unchanged, "kerns and gallowglasses" rendered
  descriptively, "hurlyburly" → "uproar", "Anon" → "Coming", two
  false-friend glosses ("happiness" → "good fortune"; "bosom interest" →
  "deepest trust"), American spelling confirmed against the existing served
  `modern-en`'s own practice (Valor/honor, straight quotes).
- 2026-09-11 — **Act 1 Scene 1 (ch01) drafted and frozen** (steps 1–3):
  `ch01/candidate-v1.json` (sha256 `21304f136f17739972fdb7a1f898927a0b06dfc597e0c731a7c3255bf0d394a5`),
  12 paragraphs 1:1 with the served scene, word ratio 1.023 (min paragraph
  ratio 0.857, a short exchange where no content is lost — see
  `ch01/continuity.md`). Source extracted verbatim into
  `ch01/source-ch01.json` (sha256
  `279593818be5378c85a917a3b0566a50c7f5808a77f98cde4165726002d1e513`).
  `continuity.md`, `provenance.json`, `manifest.json`, `README.md`,
  `review-instructions.md` and four review packets (4×3) written. Mechanical
  checks run and pass (paragraph count, speaker-label/stage-direction
  identity, packet coverage, word ratio). **Stopped for independent
  review** (step 4). Findings expected under `ch01/review/`.
- 2026-09-11 — **Act 1 Scene 2 (ch02) drafted and frozen** (steps 1–3):
  `ch02/candidate-v1.json` (sha256 `17ba47fc5c12df039d9c57e46a893de92b20f58f82a8abc3272055086380a0c8`),
  22 paragraphs 1:1 with the served scene, word ratio 1.060 (min paragraph
  ratio 0.983). Source extracted verbatim into `ch02/source-ch02.json`
  (sha256 `8bd8b0bce8f69e5a929e0b213ebcf0d850c2098de7f1473953d93f9588b615a5`).
  `continuity.md`, `provenance.json`, `manifest.json`, `README.md`,
  `review-instructions.md` and eight review packets (7×3 + 1) written.
  Mechanical checks run and pass. **Stopped for independent review**
  (step 4). Findings expected under `ch02/review/`.

## Decided, and why

| # | Decision | Why |
|---|---|---|
| D1 | Draft against the served `macbeth-original-en.json` exactly as served, not a corrected original. | Task scope is two specific chapters, not a play-wide re-basing like Meditations' translator-attribution fix. The two anomalies found (scene 1 title, one missing line) are noted in `PROVENANCE.md` for the record but not corrected here, so paragraph alignment with the served file (and, downstream, with audio/positions keyed on it) is untouched. |
| D2 | Speaker labels and stage directions are copied character-for-character, never modernised. | Confirmed from the served file's own format (the existing `modern-en` does the same) and stated explicitly in the task brief. Only spoken lines change. |
| D3 | Speeches are rendered as flowing modern prose, not reconstructed verse lines. | The served JSON holds no `\n` anywhere — verse line breaks are already collapsed to spaces in the source itself, so there is no line structure to preserve, per the task's own instruction ("keep line structure where the JSON keeps it, otherwise flowing sentences"). |
| D4 | Already-plain, famous lines (e.g. "Fair is foul, and foul is fair") are kept close to verbatim rather than paraphrased. | Explicit instruction not to flatten famous lines into cliché; these lines are already contemporary-sounding and modernising them further would only blur them. |
| D5 | "Kerns and gallowglasses" rendered descriptively ("light-armed foot soldiers and heavy-armed fighters") rather than left as unglossed period military terms. | A specific historical pairing a general modern reader will not otherwise recognize; the accessibility standard requires essential unfamiliar terms explained briefly at the point of need. |
| D6 | "Happiness" (= good fortune) and "bosom interest" (= deepest trust) glossed to the sense meant, not left as false-friend literal translations. | Both risk a materially wrong modern reading (emotional joy; a stake or curiosity) if rendered literally; the glossary rows record this as a meaning-preserving substitution, not an addition. |
| D7 | No consultation of No Fear Shakespeare or any other modern paraphrase during drafting. | Explicit task instruction. Every rendering in `ch01`/`ch02` was composed independently from the original verse and ordinary period-word knowledge (kerns/gallowglasses, Bellona, Golgotha, etc.), never copied or paraphrased from another modernisation. |

## Next

1. **Waiting on the coordinator: independent review of chapters 1–2**
   (`ch01/review-instructions.md` + `ch01/review-packets/`, 4 packets;
   `ch02/review-instructions.md` + `ch02/review-packets/`, 8 packets). On
   findings: `chNN/candidate-v2.json`, every change listed against the
   finding it answers, changed passages re-verified, flow read,
   `chNN/ACCEPTANCE.md`.
2. Once ch01 and ch02 are accepted, continue scene by scene (ch03 onward)
   in chapter-number order through ch28, each with its own independent
   review round, per `WORKFLOW.md`.

## Needs Anders (listed, not waited on)

- **A1. Two textual anomalies in the served `original-en`**, found while
  verifying the source (`PROVENANCE.md` §3): (a) the Act 1 Scene 1 heading
  is "A Desert Place" where the identified textual source (PG #1533/#100)
  prints "An open Place" — a real historical variant, but not what this
  edition's own source text has; (b) Act 1 Scene 2 is missing the
  unattributed line "Who comes here?" between two stage directions,
  present in PG #1533/#100 and not found anywhere else in the served file.
  Neither is corrected in this task (out of the two-chapter scope); both
  are drafted around as the served file stands. If Anders wants the served
  `original-en` itself corrected (restoring the line, and/or reconciling
  the scene 1 title), that is separate work, likely play-wide, and would
  change the paragraph count/alignment for Act 1 Scene 2 (23 paragraphs
  instead of 22) if the missing line is restored as its own paragraph —
  the same class of downstream consideration Meditations flagged for its
  own re-basing decision.
- **A2. Existing `macbeth-modern-en.json`** (sha256 `0c852730…`) is a
  complete, already-readable modernisation that this package's chapters 1–2
  are staged to replace. No assessment of its overall quality was made
  beyond the two scenes drafted here; Anders may want a broader before/after
  comparison before any wider replacement is considered.

## Open, not blocking

- `ch01/continuity.md` B01-P007's word-ratio note explains the 0.857 low
  point (a five-word source line rendered in four words, no content lost).
- The Soldier's speech (B02-P004) uses a parenthetical dash-clause for
  "well fit to be a rebel, since every kind of villainy nature can breed
  swarms upon him," matching the source's own bracketed aside rather than
  folding it into a plain relative clause — a candidate for reviewer
  comment on readability vs. fidelity to the source's own syntax.
