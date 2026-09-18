Model: opus

# French pass — batch 1 (ch 1–6) independent review

Method: derived the change list myself with a Python diff of `chN-baseline.json`
vs `chN-french.json` for N = 1–6, then checked every changed paragraph against
`chN-source.json` (Maude) and `books/prompts/modern-en-repair/french-pass.md`.
The logs were read only afterwards, to confirm they match.

**Scope integrity (rule d):** for all six chapters the set of changed paragraph
indices is exactly equal to the inventory's dialogue + slot indices — no
paragraph outside the inventory changed, and no inventory item was skipped.
Paragraph counts, `number` and `title` are byte-identical to baseline in all six
files. No `[Speaking in …]` tag survives anywhere; no paragraph carries the cue
more than once.

**Change counts (derived):** ch1 5, ch2 6, ch3 3, ch4 8, ch5 7, ch6 3 — 32 total.

**Gate:** `python3 books/edition_checks.py war-and-peace --candidate chN-french.json`
for N = 1–6 → `"blocks": 0` in every chapter, `french_kept_paragraphs: 0`, and no
`bracket-tag` or `footnote-slot-bare` flag for ch 1–6. Residual flags are the
global `title-sequence` defects plus pre-existing `long-sentence` flags on
paragraphs this pass did not touch.

## Correctly-handled judgment calls (no finding)

- **ch2 p7** and **ch4 p2** — tag removed, cue deliberately *not* added, because
  the paragraph already carries Maude's own natural cue ("still in French";
  "speaking French and stressing the last syllable"). This is exactly rule (b).
- **ch2 p5** — three tags collapsed to one cue after the first speech verb.
  Once per paragraph, correct.
- **ch1 p0**, **ch4 p32** — no speech verb, so the cue sits directly after the
  closing quotation mark. Correct.
- **ch2 p1 / ch5 p3 slots** — both hold the source's French only, prefixed `* `,
  with no English narration leaked in and no duplication of the inline English.
- Fidelity: every changed dialogue paragraph is the baseline text with the tag
  stripped and the cue inserted. No clause dropped, none added, no intensifier
  introduced anywhere in the 32 changes. The only re-worded paragraph is ch3 p2,
  reviewed below.

## Ruling on the ch3 p2 judgment — UPHELD

Maude: `said Anna Pávlovna, with a pleasant feeling that there was something
à la Louis XV in the sound of that sentence: "Contez nous çela, Vicomte."`

The narration is *about the sound of the French sentence*, so the wording itself
is the point — precisely the case rule 3 reserves for keeping the original
inline. The drafter kept `"Contez nous çela, Vicomte"` and put the English
immediately after it (`— tell us the story, Vicomte`), which is the form rule 3
prescribes. The French is copied exactly, including Maude's `çela`. The cue sits
once, after the speech verb, and the second bracket tag is gone. There is no
footnote slot for this passage, so nothing is duplicated. **Correct call; keep
it.** The English gloss is the baseline's own prior wording, so nothing was
added or lost in the rewrite.

## Findings

| Chapter | Paragraph | Severity | Before | After | Issue |
|---|---|---|---|---|---|
| 5 | 2 | MINOR | `[Speaking in French] "'God has given it to me…'" he said, then repeated the words in Italian: [Speaking in Italian] "'Dio mi l'ha dato…'"` | `"'God has given it to me…'" he said (in French), then repeated the words in Italian: "'Dio mi l'ha dato…'"` | Paired maxim handled asymmetrically: the French is translated out and moved to the slot while the Italian stays inline untranslated, so the reader can no longer see the two-tongue parallel the sentence exists to show. Defensible — keeping the French inline would duplicate the slot, which rule 4 forbids, and rule 3's "quoted maxim" carve-out has no slot-free way to apply here — but it is the opposite call from ch3 p2 and worth a one-line note in the convention. Not a blocker. Correctly no `(in Italian)` cue, since "repeated the words in Italian" is already a natural cue. |
| 6 | 20 | MINOR | `[Speaking in French] "Well, my friend," said the vicomte, …` | `"Well, my friend," said the vicomte (in French), …` | `mon cher` is rendered "my friend". `CONVENTIONS.md` § Character names says forms of address including `mon cher` are kept. This is pre-existing baseline wording the pass correctly left alone under rule 5, so it is a convention conflict to resolve, not a defect of this pass. Flagging so the owner decides once for the whole book rather than per chapter. |
| 1 | 3 | COSMETIC | `[Speaking in French] "If you have nothing better to do, Count (or Prince)… — Annette Scherer."` | `"…— Annette Scherer." (in French)` | The passage is a written invitation, and the immediately preceding p2 already says "All her invitations without exception, written in French". The cue is therefore redundant in context, and "(in French)" reads as a marker of speech on a text that was written. Strictly compliant — the natural cue is in p2, not in p3 — so no change required. |
| 2 | 1 | COSMETIC | `* The most fascinating woman in Petersburg.` | `* La femme la plus séduisante de Pétersbourg.` | Slot correctly carries the source's French. The inline source phrase is lower-case `la femme…` with no terminal stop; the slot capitalises `La` and adds a full stop. Trivial sentence-form normalisation, consistent with how the other slot reads. |
| 4 | 11 | COSMETIC | `[Speaking in French] "You must excuse me, dear Vicomte," said Prince Vasili to the Frenchman, holding him…` | `…said Prince Vasili to the Frenchman (in French), holding him…` | Cue placed after the indirect object rather than after the speech verb, so it can read for an instant as modifying "the Frenchman". Convention says "after the speech verb"; `said Prince Vasili (in French) to the Frenchman` would be tighter. Cosmetic only. |
| 4 | 32 | COSMETIC | `[Speaking in French] "Well, goodbye then! Goodbye! You hear her?"` | `"Well, goodbye then! Goodbye! You hear her?" (in French)` | Maude has `"Well, au revoir! Good-by! You hear her?"` — French and English mixed in one line. The single once-per-paragraph cue marks the whole line as French. Forced by the convention's own once-per-paragraph rule, and the baseline had already flattened `au revoir` to "goodbye", so nothing is lost relative to the input. |

## Out of scope for this pass (logged, not charged against it)

These are pre-existing baseline readings inside touched paragraphs. Rule 5
correctly kept the drafter's hands off them; they belong to the fidelity gate.

- ch5 p34 — Maude "with a tolerant smile" reads "with a condescending smile" in
  the baseline. Fidelity drift, already present before this pass.
- ch5 p8 — Maude leaves the blazon `Bâton de gueules, engrêlé de gueules
  d'azur—maison Condé` untranslated and gives no footnote; the baseline
  translates it. With no slot available the pass had no compliant alternative.

## Diff vs log

Diff-vs-log: the six logs record exactly the 32 paragraphs my diff found — same
chapters, same indices, same before/after text, nothing logged that did not
change and nothing changed that was not logged.

French batch verdict: ACCEPT
