Model: opus

# French pass — batch 2 (ch 7, 10, 12, 15, 16, 18, 19, 20, 21, 24, 26, 27, 28, 31) independent review

Method: derived the change list myself with a Python diff of `chN-baseline.json`
vs `chN-french.json` for the 14 chapters, then checked every changed paragraph
against `chN-source.json` (Maude), `books/prompts/modern-en-repair/french-pass.md`
and `CONVENTIONS.md`. The logs were read only afterwards, to confirm they match.

**Derived change list (41 paragraphs):** ch7 [1,31] · ch10 [3] · ch12 [14,15] ·
ch15 [3,15,16] · ch16 [42] · ch18 [3,4,9,10,15,18,20] · ch19 [7,8,9,10,11] ·
ch20 [44] · ch21 [22,31,52,53,54,55] · ch24 [11] · ch26 [44,45,49] · ch27 [30] ·
ch28 [7,8,75] · ch31 [49,50,57,58,59].

**Scope (rule d):** no paragraph outside the inventory changed, in any chapter.
Paragraph counts, `number` and `title` are byte-identical to baseline in all 14
files. Three inventory *dialogue* indices were correctly left untouched because
the baseline already complied and only their slot needed work — ch18 p14
(`zakúska` already englished, gloss slot fixed), ch21 p30 (`Catiche` already
plain, gloss slot fixed), ch28 p74 (already englished, gloss slot fixed). That is
rule 5 restraint, not an omission. No paragraph carries the cue twice.

**Gate:** `edition_checks.py --candidate chN-french.json` → `"blocks": 0`,
`french_kept_paragraphs: 0`, no `footnote-slot-bare` and no `footnote-orphan-marker`
for all 14. The only non-global residue is a pre-existing `punct-parity` flag on
ch28 p74, a paragraph this pass did not touch. **The `bracket-tag` check passes
for ch31 only because it is blind — see finding 1.**

## Ruling on the five rule-3 restorations — ALL UPHELD

Each is a case where the wording itself is the point, and in every one the English
follows immediately.

- **ch12 p14 `Cousinage—dangereux voisinage`** — a rhyming proverb; the rhyme is
  the entire joke and cannot survive translation. English immediately after, set
  off by a dash. Correct.
- **ch15 p15 `humanum est errare`** — Latin, not French, and the same sentence
  says the doctor "pronounc[ed] the Latin words with a French accent". Translating
  it away leaves narration describing words the reader cannot see. Restoring it
  makes the paragraph coherent again; English immediately after. Correct, and the
  stray mid-paragraph `*` the baseline had left behind is gone.
- **ch21 p52 `un bâtard`** — the strongest case in the batch. Maude: "she added,
  as if supposing that this translation of the word would effectively prove...".
  The baseline read "[Speaking in French] a bastard!" followed by "this French
  translation" — literally self-contradictory. The restoration repairs a real
  defect. English immediately after. Correct.
- **ch26 p44 / p49 and ch27 p30 `Malbrook s'en va-t-en guerre`** — sung verse,
  named in rule 3, and a running motif across three paragraphs in two chapters.
  Handling all three occurrences the same way is right; English immediately after
  in each. Correct.
- **ch28 p7 `Tout comprendre, c'est tout pardonner`** — a quoted maxim, the exact
  example rule 3 names. English immediately after. Correct.

## Findings

| Chapter | Paragraph | Severity | Before | After | Issue |
|---|---|---|---|---|---|
| 31 | 1, 2, 12, 13, 34, 44 | **MAJOR** | `[speaking in French] "Ah..." said Kutuzov…` (and 5 more) | *unchanged* | Six bracket tags survive in ch31, spelled lower-case `[speaking in …]`. The inventory never listed them and `edition_checks.py:113` matches `r'\[(Speaking in\|På \|Note\|Translator\|Editor)'` — case-sensitive — so the gate reports no `bracket-tag` flag while the chapter still carries them. ch31 therefore ships half-converted: p49/p57 now read "(in German)"/"(in French)" while p1, p2, p12, p13, p34 and p44 still read `[speaking in French]`, two conventions visible on one screen. Not the drafter's fault (rule: change only inventory paragraphs) but not shippable. Project-wide the same blind spot hides 14 lower-case tags: ch30 p15, ch31 (8, two of them fixed here), ch32 p6/8/12/14, ch43 p16 — batches 3–6 inherit it. Fix the regex with `re.I`, regenerate the inventories, re-run ch31. |
| 10 | 3 | MINOR | `[Speaking in French] "I'm so very grateful to you, my dear"…` | `"I'm so very grateful to you, my dear"…` | Tag removed and **no cue added anywhere**. The drafter is relying on the natural cue, but it sits ~300 words downstream ("switching between Russian and very poor but thoroughly confident French") and describes his small talk, not the greeting the tag marked. Maude's own marker for the greeting is `mon cher`/`ma chère`, which the baseline had already flattened to "my dear". Net effect: nothing at all now tells the reader the greeting was French. A cue after the first speech would be truer. |
| 18 | 3 | MINOR | `[Speaking in French] "Well then, old boy, my most honorable Alphonse Karlovich," said Shinshin, laughing…mixing the most common Russian expressions with the choicest French phrases` | `…said Shinshin (in French), laughing…mixing the most common Russian expressions with the choicest French phrases` | The cue claims the whole utterance was French and the very next clause says he mixed Russian with French — the sentence now argues with itself. A natural cue is already present in the same sentence, so rule (b) says not to add one. Same paragraph: only `mon très honorable` and `Vous comptez…` are French in Maude. |
| 21 | 54 | MINOR | `…having been dutiful, [Speaking in French] and all that follows from that! That's certain."` | `…having been dutiful, and all that follows from that! That's certain." (in French)` | Only `et tout ce qui s'ensuit!` is French in Maude. The convention's fallback (no speech verb → after the closing quotation mark) pushes the cue ~80 words past the phrase it marks, so the reader cannot tell which part was French and is told the whole speech was. The drafter's note shows the call was deliberate and convention-compliant; the convention is what costs here. |
| 20 | 44 | MINOR | `[Speaking in French] "That's how we used to dance in our day, my dear," said the count.` | `"That's how we used to dance in our day, my dear," said the count (in French).` | In Maude only `ma chère` is French; the line itself is Maude's English. The cue over-claims. Same shape at ch24 p11, where only the closing `Je vous en conjure...` is French but the cue sits on the opening speech verb. Both inherited from where the baseline put its tag, both acceptable under once-per-paragraph, both slightly untrue. |
| 12, 15, 21, 26 | p15, p16, p53, p45 | MINOR | — | slot = `* Cousinage—dangereux voisinage.` etc. | **Convention gap, not a defect.** Where a rule-3 restoration also has a footnote slot, the foreign wording now appears twice — inline and in the slot — which is exactly the duplication rule 4 was written to prevent ("nothing is duplicated"). The drafter obeyed both rules literally; there is no compliant alternative. Rules 3 and 4 need one line settling which wins. Batch 1 never hit this because its rule-3 case (ch3 p2) had no slot. |
| 18 | 14, 15 | MINOR | p14 `…expecting the call to appetizers…`; p15 `* Hors d'oeuvres.` | p14 unchanged; p15 `(Hors d'oeuvres.)` | Gloss handling is correct per rule 4 (and `edition_checks.py` explicitly accepts a `(`-prefixed slot, so dropping the `*` is fine). But the dialogue already renders `zakúska` as "appetizers", so the gloss slot now explains a word that no longer appears in the text — a footnote pointing at nothing. Same shape, harmlessly, at ch21 p31 `(Catherine.)` where `Catiche` does survive inline, and at ch28 p75 `(Kutuzov.)` where "Mikhail Ilarionovich" does. Only ch18 p15 is genuinely orphaned. |
| 18, 19, 31 | p4, p8, p58 | COSMETIC | — | `* Vous comptez vous faire des rentes sur l'état;` / `* Connaissez-vous le Proverbe:` / `…le mot pour rire.` | Slots carry the source's sentence punctuation across: a trailing `;` and `:` kept, a trailing comma normalised to a full stop, and lower-case openings capitalised (`humanum`→`Humanum`, `un bâtard!`→`Un bâtard!`). Trivial and self-consistent, same normalisation batch 1 noted. No English narration leaked into any slot in the batch. |
| 26 | 44 | COSMETIC | — | `…: "Malbrook s'en va-t-en guerre. Dieu sait quand reviendra." — Marlborough is off to war. God knows when he'll return.` | The English gloss falls *outside* the closing quotation mark, so it reads as narration rather than as the song. At ch26 p49 and ch27 p30 the same verse is glossed inside the quote / between dashes. Pick one form for the three occurrences of the motif. |
| 31 | 49 | COSMETIC | `[speaking in German] "God, how childish!" he muttered angrily…` | `"God, how childish!" he muttered (in German) angrily…` | Cue splits "muttered … angrily". Convention says after the speech verb, so it is compliant; `he muttered angrily (in German)` would read better. |

## Correctly-handled judgment calls (no finding)

- **ch7 p1** — tag replaced by Maude's own wording "as usual in French" rather than
  the parenthetical cue. Exactly rule (b); matches the source clause verbatim.
- **ch15 p3** — `"[Speaking in French] We might as well go back," said the son.` →
  `said the son in French`, which is word-for-word Maude. Correct.
- **ch19 p7** — three tags collapsed to **zero** cues, because the paragraph ends
  "He kept switching between French and Russian". Natural cue present, so none
  added. Correct, and consistent with batch 1 ch2 p7.
- **ch19 p8–p11** — the inventory mislabels these four footnote slots as
  `french-kept` *dialogue* indices; they are the chained slots for the four markers
  in p7. The drafter read through the mislabel, restored the French to all four and
  preserved the `(2)`/`(3)`/`(4)` numbering. Correct handling of a bad inventory row.
  Same at ch31 p58.
- **ch21 p22** — tag removed, no cue, because "addressing Lorrain in poorly
  pronounced French" is already in the sentence. Correct.
- **ch18 p20** — no speech verb, so `"No, madame." (in French) He smiled…`. The
  convention's fallback, correctly applied.
- **ch31 p57** — two mid-paragraph tags consolidated into one cue after "burst out";
  the closing "he added in Russian" is left to mark the switch back. Correct.
- **Fidelity:** across all 41 changes, every dialogue paragraph is the baseline text
  with the tag stripped and a cue or a rule-3 restoration inserted. No clause
  dropped, none added, no intensifier introduced. Every restored slot holds the
  source's foreign wording only.

## Out of scope for this pass (logged, not charged against it)

Pre-existing baseline readings inside touched paragraphs; rule 5 correctly kept the
drafter's hands off them. They belong to the fidelity gate.

- **ch31 p57** — the baseline drops Maude's "he said, as if strengthening his views
  by this French sentence", which is the clause that explains why the French is
  there. Restoring it would make the (in French) cue almost unnecessary.
- **ch31 p49** — Maude's footnote is "Good God, what simplicity!"; the baseline
  inline reads "God, how childish!". Different sense (naivety vs childishness).
- **ch28 p74** — "Mikhail Ilarionovich" where Maude has "Michael Ilariónovich".
  Name-form drift; the slot gloss `(Kutuzov.)` is correct and de-accented per the
  diacritics rule.
- **ch10 p3, ch20 p44, ch16 p42** — `mon cher` / `ma chère` / `ma bonne` flattened
  to "my dear". `CONVENTIONS.md` § Character names says forms of address are kept.
  Same conflict batch 1 flagged at ch6 p20; still needs one book-wide ruling.

## Diff vs log vs inventory

Diff-vs-log-vs-inventory: my diff finds 41 changed paragraphs; the 14 logs record exactly those 41 with byte-identical before/after text and nothing else; the changed set is a subset of the inventory's dialogue+slot indices with no extras in any chapter, the only gap being three inventory dialogue indices (ch18 p14, ch21 p30, ch28 p74) that correctly needed no change because only their slots were defective — but the inventory itself is incomplete, missing six lower-case `[speaking in …]` tags in ch31.

French batch verdict: ANOTHER ROUND
