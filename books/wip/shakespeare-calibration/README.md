# Shakespeare calibration: King Lear, Twelfth Night, The Merchant of Venice

**Status:** these are **proposals** for calibrating the Modern English standard. They are not replacements.

- No full re-render of these plays was begun, as instructed.
- Nothing is accepted for publication, and nothing is published.
- This is content only: no app code, registry, live edition, character card, Danish or audio was touched.

## What this establishes

`STANDARD.md` is the proposed standard for future Shakespeare modernizations. It was built from:

- the Othello acceptance pass (`books/wip/othello-modern-en-acceptance/`);
- nine calibration passages, drafted and then independently reviewed.

The target:

> a first-time listener understands what each speaker means and wants, while imagery, dramatic voice, qualifications and deliberate ambiguity survive.

## The samples

For each play there are three substantial passages, one for each category:

1. difficult imagery or rhetoric;
2. fast dialogue, comedy or wordplay;
3. emotional conflict or persuasion.

| Play | Passage | Paragraphs | Rewritten | Kept as is | Stage directions |
|---|---|---|---|---|---|
| King Lear | LR-A 3.2 the storm (11.0–11.12); LR-B 1.4 the Fool's entrance (4.62–4.99); LR-C 1.1 the love test (1.20–1.41) | 73 | 43 | 24 | 6 |
| Twelfth Night | TN-A 1.5 the willow cabin (5.113–5.129); TN-B 3.1 Viola and Feste (11.0–11.23); TN-C 2.4 Orsino and Viola on love (9.34–9.48) | 56 | 29 | 25 | 2 |
| The Merchant of Venice | MV-A 3.2 the lead casket (14.13–14.17); MV-B 1.2 Portia and Nerissa on the suitors (2.7–2.21); MV-C 3.1 Shylock, Salarino, Solanio and Tubal (13.14–13.38) | 45 | 24 | 18 | 3 |

**`SAMPLES-LR.md`, `SAMPLES-TN.md` and `SAMPLES-MV.md`** show, for every paragraph:

- the **original** in Gutenberg lineation;
- the **current** live Modern English;
- the **proposed** Modern English;
- the **reasons** for each change, citing public-domain annotation;
- any reviewer fix that was applied.

Each passage ends with the structure notes and the defects found in the current text.

`data/*-calibration.proposed.json` has the same content as data, including the meaning-unit map for each paragraph. Each unit gives its original line range and exact original words, paired with the modern text.

## Independent review

Every review was done by an agent that did not draft the text. Drafters and reviewers worked only from the public-domain original and public-domain annotation (Schmidt, Onions, Furness). No copyrighted modernization was consulted.

### Source fidelity (`review/calib-fidelity-*.json`)

| Passage | Verdict | Better than current | Must-fix | Should-fix | Notes |
|---|---|---|---|---|---|
| LR-A | accept-with-fixes | yes | 0 | 1 | 6 |
| LR-B | accept | yes | 0 | 0 | 5 |
| LR-C | accept-with-fixes | yes | 0 | 1 | 6 |
| TN-A | accept-with-fixes | yes | 0 | 1 | 7 |
| TN-B | accept-with-fixes | yes | 0 | 2 | 4 |
| TN-C | accept-with-fixes | yes | 0 | 1 | 1 |
| MV-A | accept-with-fixes | yes | 0 | 2 | 3 |
| MV-B | accept-with-fixes | yes | 0 | 3 | 1 |
| MV-C | accept-with-fixes | yes | 0 | 1 | 4 |
| **Total** | | **9 of 9** | **0** | **12** | **37** |

The reviewers checked every claimed defect in the current text: **107 defect entries were confirmed and 19 disputed.** The disputes are recorded in the review files. For example:

- Lear's "most honor you" is not unnatural.
- In Twelfth Night 5.119, "I see what you are" was exact.
- In The Merchant of Venice 2.11, "sadness" means dejection, not seriousness.

Where a reviewer showed that the current wording was better, it is restored.

The Merchant of Venice reviewer (CF-MV) confirmed that MV-C neither softens nor sharpens the antisemitism of the Christian characters or Shylock's reply. It restored the source punctuation of Shylock's wish over his daughter, and the "sufferance / patient endurance" echo.

### Blind comprehension (`review/blind-calib-*.md`)

Blind readers had no access to the original. Each passage appeared twice, as versions X and Y in random order, and the readers were not told which version was new. The key is in `review/BLIND-KEY.json`.

**The proposed version was preferred in all 9 of 9 passages.** In LR-B and MV-B the preference was narrow.

The costs the readers named, which now shape the standard:

- jokes explained before they land;
- the Fool's rhymes and songs flattened into prose;
- appended glosses that sound like footnotes;
- a few current lines that were livelier.

### Reviewer fixes applied

- **All 12 should-fix findings.** Ten are text fixes. The other two corrected the line ranges of 52 Merchant of Venice prose units.
- **16 notes**, where the reviewer gave exact wording and the fix is plainly right.

That makes **26 text fixes** in all: King Lear 3, Twelfth Night 11, The Merchant of Venice 12.

Each fix is marked in the sample documents and in the data (`reviewer_fixes`). The fixes use the reviewer's own wording and were **not separately re-checked**. For publication, the whole-play process in `STANDARD.md` applies.

**Line-number convention.** The King Lear and Twelfth Night unit maps number each prose run as a single line. Every unit also carries its exact original words, so the pairing is unambiguous.

## What the calibration showed

1. **The live texts share the defects Othello had:**
   - false friends left in place (*knave*, *presently*, *owe*, *gall*, *simple*, *still*);
   - wrong glosses (*hurricanoes*, *court holy-water*, *darker*, *valour's excrement*);
   - hard images left untranslated;
   - flattened puns;
   - inconsistent punctuation.
2. **The standard fixes them,** and blind listeners prefer the result. The residual risk is **over-explaining**, which rules 3, 5 and 6 of the standard now address.
3. **Parser defects occur in all three plays** and cannot be fixed by wording (standard, rule 12):
   - King Lear 4.80–4.82, a Fool speech split into three paragraphs;
   - King Lear 1.22–1.23 and 1.26–1.28, Cordelia's asides split;
   - King Lear 4.62, an unbracketed "Enter Fool.";
   - King Lear 4.94 and 4.98, song lines with no speaker prefix;
   - Twelfth Night 9.36, a continuation with no prefix;
   - The Merchant of Venice 14.14–14.16, Portia's aside split into three.

   A structural proposal like Othello's Parts A and B would be needed for each play.

## Decisions for Anders

1. Adopt `STANDARD.md` as the house standard for Shakespeare modern-en.
2. Whether to commission full replacements of these three plays under it. None has been begun.
3. The house-wide double-quote style, and normalizing apostrophes and dashes in the live plays (see `STANDARD.md`, rule 11).
4. Whether to commission structural proposals for the parser defects listed above.
