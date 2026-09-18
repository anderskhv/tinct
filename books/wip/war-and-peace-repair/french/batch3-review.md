Model: opus

# French pass — batch 3 review (ch 32, 37, 38, 39, 40, 41, 43, 48, 51, 53, 64, 66, 69, 72, 74)

Method: per chapter, a Python diff of `chN-baseline.json` against `chN-french.json`
(paragraph counts identical in all 15 chapters), every changed index read against
`chN-source.json` (Maude) and against `french-pass.md` / `CONVENTIONS.md`; the
change list was derived from the diff first and only then compared with the logs
and the inventory. `edition_checks.py --candidate` was run on all 15 files.

Accepted-file hashes (sha256, first 12): ch32:6121908d8981 ch37:d3043a369ce0
ch38:d234797e084a ch39:6120ff0501b5 ch40:6d040ea59543 ch41:07b62162b1a0
ch43:27893158518b ch48:2ccbd81db25b ch51:8ee34846d312 ch53:a1cf97cfc14a
ch64:43a0de3d4dbb ch66:8977665c568f ch69:6965fe396726 ch72:adb315ab7825
ch74:9d1c59dce635

## Findings

| Chapter | Paragraph | Severity | Before | After | Issue / ruling |
|---|---|---|---|---|---|
| 32 | 14 | MAJOR | `Rostov waved his cap in the air just like the German and laughed: [speaking in German] "And long live the whole world!"` | *(unchanged)* | Residual old-convention bracket tag left in a chapter this pass converted. Maude has `“Und vivat die ganze Welt!”` with **no** footnote — a textbook `tag-no-slot` item that the inventory missed. Two paragraphs earlier, p12 now carries the new `(in German)` cue, so the chapter ships with both conventions visible within four lines. `edition_checks.py` still emits `FLAG bracket-tag ch32 p14`, so the pass's own exit gate ("no `bracket-tag` flags for your chapters") is **not** met and the log does not mention it. Fix: drop the tag, cue after the speech verb — `…and cried, laughing (in German), "And long live the whole world!"`. Inventory gap, but the gate should have caught it. |
| 72 | 24 | MAJOR | `…That's how it is with me. À demain, mon cher."` | `…That's how it is with me. Until tomorrow, my dear fellow." (in French)` | **Ruling: `mon cher` should have stayed.** `CONVENTIONS.md` § Character names is explicit — "Forms of address (Prince, Count, Princess, 'Your Excellency', 'mon cher') are kept; briefly cue their meaning only where a new reader would otherwise be lost." The French pass is a narrower instrument and does not repeal it. `À demain` is a plain farewell and translating it is right under rule 1; `mon cher` is a protected form of address and translating it is not. Compliant form: `…That's how it is with me. Until tomorrow, mon cher." (in French)` with the slot unchanged (`* À demain, mon cher.`). This differs from batch 1 ch6 p20, where `mon cher`→"my friend" was pre-existing baseline wording that rule 5 correctly protected; here the pass actively performed the loss, so it is chargeable. |
| 40 | 36, 41 | MODERATE | `"The marshals."` / `"Bridgehead."` | `(The marshals.)` / `(Bridgehead.)` | Treated as gloss-type footnotes. They are not: Maude's `* The marshalls.` and `* Bridgehead.` are translations of the French phrases `messieurs les maréchaux` and `tête-de-pont` printed in p35/p40. Rule 4 → `* messieurs les maréchaux` and `* tête-de-pont`. Because p35 and p40 were (correctly) left English-only, the French now vanishes from the edition entirely — precisely what rule 4's "a reader who wants the French has it" exists to prevent. The identical pattern was handled **correctly** two chapters earlier at ch38 p37 (`beaux yeux` inline in Maude, `* Fine eyes.` footnote → `* beaux yeux`), so this is an internal inconsistency inside the same batch. |
| 38 | 34 | MODERATE | `[Bilibin's joke: "We must let him off the 'u'!" — a pun on the French spelling of Buonaparte vs. Bonaparte.]` | `(Bilibin's joke: "We must let him off the 'u'!" — a pun on the French spelling of Buonaparte vs. Bonaparte.)` | Bracket→parenthesis only. Maude's footnote here is a translation (`* “We must let him off the u!”`), not a gloss, so rule 4 wants `* il faut lui faire grâce de l'u!`. The retained editorial clause "a pun on the French spelling of Buonaparte vs. Bonaparte" is nowhere in Maude — added matter (pre-existing in the baseline, but the pass chose to keep it rather than replace the slot). It also contradicts how the pass treated the batch's other rule-3 retentions (ch64 p40, ch74 p16), which correctly got `* French` slots. Pick one rule and apply it; rule 4's letter says the French. |
| 74 | 8 | MODERATE | `…Just you try.... Allez-vous promener,' she used to say.` | `…Just you try.... Allez-vous promener — you clear out of this,' she used to say.` | **Ruling: retention not justified.** Rule 3's carve-out is "a pun, a quoted maxim or proverb, verse, the 666 arithmetic" — the wording itself being the point. `Allez-vous promener` is a colloquial brush-off; nothing depends on its French form, and the surrounding line is already in English. Rule 1 applies: translate inline ("Go take a walk" / "Clear out of this"), add `(in French)` — which this paragraph now lacks entirely — and let the slot carry `* Allez-vous promener.` As shipped, the French sits both inline and in the slot, the duplication rule 4 is written to avoid. |
| 64 | 39, 40 | ACCEPT (nit) | `"Ma foi, sire, nous ferons ce qui sera dans notre possibilité, sire," he answered cheerfully, though his poor French drew ironic smiles…` | `"Ma foi, sire, …, sire" ("Indeed, Sire, we shall do everything it is possible to do, Sire,") he answered cheerfully…` | **Ruling: retention correct.** The sentence exists to report that Kutuzov's French was bad; translate it away and the "ironic smiles" lose their object. Rule 3 covers it, the English follows immediately, and the slot rightly holds the French (`* Ma foi, sire…`). The resulting inline/slot duplication is unavoidable under rule 4 and is the right trade. Nit: the gloss's comma belongs outside — `…, sire" ("Indeed, Sire, we shall do everything it is possible to do, Sire"), he answered cheerfully`. |
| 74 | 15, 16 | ACCEPT | `…Moliere's words came to him: "Mais que diable allait-il faire dans cette galère?" — and he began to laugh` | `…: "Mais que diable allait-il faire dans cette galère?" ("But what the devil was he doing in that galley?") — and he began to laugh` | **Ruling: retention correct.** A named quotation from Molière is a quoted maxim under rule 3; the line is attributed to its author in the sentence itself, so the French must survive. English immediately after, slot `* Mais que diable allait-il faire dans cette galère?`. Correct on all four counts. |
| 38 | 33 | ACCEPT | `…now that he's laying down the law for Austria at Schönbrunn, we really must drop the 'u.'` | `…at Schönbrunn, il faut lui faire grâce de l'u! — we really must drop the 'u.'` | **Ruling: retention correct.** The whole exchange is a pun on the `u` in Buonaparte; the French is the joke. Rule 3 squarely applies and the English follows immediately. Only the slot (p34, above) is wrong. |
| 66 | 40, 41 | ACCEPT | `"Zum Henker diese Russen!" muttered a German.` | `"Hang these Russians!" muttered a German (in German).` | **Ruling: translation correct, retention would have been wrong.** Plain abuse, not a pun, maxim, proverb or verse — rule 3's list does not reach it, so rule 1's default governs. Cue after the speech verb, once; slot `* Zum Henker diese Russen!`. Nothing of Maude's footnote dropped or added. Contrast ch72, where the phrase translated away was a protected form of address, not ordinary speech. |
| 48 / 53 / 69 | 24 / 2 / 20 | ACCEPT | `"Daughter of Matthew" was the literal meaning of the name.` / `Anna Pavlovna.` / `* Nicholas.` | `("Daughter of Matthew" was the literal meaning of the name.)` / `(Anna Pavlovna.)` / `(Nicholas.)` | **Ruling: gloss treatment correct for all three name footnotes.** Matvévna, Annette and Kólya are Russian/diminutive forms; Maude's footnotes explain a name, they do not translate quoted French. Rule 4's second sentence applies — parentheses, no `* ` prefix, no cue added to the dialogue paragraph (ch48 p23 and ch53 p1 correctly untouched; ch53 p1 already says "in French", matching Maude's "(of course, in French)"). MINOR: ch48 p24 keeps the baseline's added framing; Maude has only "Daughter of Matthew.", so `(Daughter of Matthew.)` would be exact. Carried over, not introduced. |
| 69 | 19 | ACCEPT | `"Here he is... our own boy... Kolya, * sweetheart..."` | `"Here he is... our own boy... Kolya, sweetheart..."` | **Ruling: removal correct.** The `*` was Maude's footnote marker leaked into reading text — it is not in Maude's own dialogue line as a character. Leaving it would point the reader at a paragraph that is now a parenthesised gloss rather than a numbered footnote. Same inventory item as p20, so not a scope breach. |
| 41 | 2 | MINOR | `…the same fate as the army at Ulm." These words awakened…` | `…the same fate as the army at Ulm." (in French) These words awakened…` | Rule 2's fallback ("directly after the closing quotation mark") is met to the letter, but the cue lands mid-paragraph as an orphan between two sentences of narration. `He remembered words from Bonaparte's address … (in French): "That Russian army…"` would read better. No content issue; slot p3 is correct. |
| 72 / 53 | 24 / 9 | MINOR | — | `…not to let him get away!' That's how it is with me. Until tomorrow, my dear fellow." (in French)` / `'Not bad at all!' he thought (in French), looking her over.` | Cue scope over-claims. In both, Maude footnotes only the closing French phrase (`À demain, mon cher`; `la petite est gentille`); the rest of the paragraph is English in the source. The once-per-paragraph cue therefore marks Denisov's whole bear-hunter anecdote, and all of Anatole's thought, as spoken in French. Forced by the once-per-paragraph rule, as in batch 1 ch4 p32 — but ch72 is the worst instance in the batch so far and argues for the `tag-no-slot` "cue at the switch point" treatment being allowed for mid-paragraph switches that happen to carry a slot. |
| all | slots | COSMETIC | — | `* beaux yeux`, `* la petite est gentille`, `* Allez-vous promener`, `* Qu'est-ce qu'il chante?` | Slots normalise Maude's curly apostrophes to straight (`j'avoue`, `l'ennemi`), close the space in Maude's `Qu’ est-ce`, and drop terminal stops on bare phrases while keeping them on full sentences. Consistent with batch 1's accepted practice and with the file's typography. |

## Out of scope for this pass (logged, not charged against it)

Pre-existing baseline readings inside touched paragraphs; rule 5 correctly kept
the drafter's hands off them. They belong to the fidelity gate.

- ch38 p33 — the first utterance reads "Bonaparte?" where Maude has "Buonaparte?".
  The joke needs the `u` on the first pass; as it stands Bilibin corrects himself
  from Bonaparte to Buonaparte and back. Pre-existing.
- ch74 p8 — unbalanced leading double quote: `"'I'm not that stupid....`.
- ch40 p40 — Maude's `qu'il n'y voit que du feu…` mot is flattened to English with
  no cue; the paragraph is outside the change set and the new slot p42 at least
  restores the French to the edition.

## Diff vs log vs inventory

Diff-vs-log-vs-inventory: 49 paragraphs changed across the 15 chapters; in every
chapter the changed indices are exactly the inventory's dialogue+slot indices with
**no extras** — nothing outside the inventory was touched, and paragraph counts are
unchanged. Six inventory dialogue paragraphs needed no edit and were correctly left
alone and not logged (ch38 p36, ch39 p1, ch40 p35, ch40 p40, ch48 p23, ch53 p1 —
each already English inline with a natural or unnecessary cue). The 15 logs record
exactly those 49 paragraphs, and every logged before/after string is byte-identical
to the baseline/french files. `edition_checks.py` reports 0 BLOCK and no
`footnote-slot-bare` for all 15 chapters; one `bracket-tag` flag remains, ch32 p14
(finding 1), so the pass's stated exit gate is not met for ch32.

French batch verdict: ANOTHER ROUND
