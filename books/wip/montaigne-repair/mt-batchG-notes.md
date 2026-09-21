# Montaigne Batch G — Content Fidelity Repair Notes

Chapters 67–77 (11 chapters, 1174 paragraphs) checked paragraph-by-paragraph
against `mt-batchG-source.json` (locked English ground truth). Method: full
programmatic screening of every paragraph (word-count ratio outliers,
word-level sequence diff for pure insertions/deletions ≥6 words, negation-word
count mismatches, numeral/number-word mismatches, proper-noun presence
checks with spelling-normalization, and antonym-pair swap detection), followed
by close manual reading of every flagged paragraph plus full manual read-through
of the three shortest chapters (71, 76, 77) as a control sample. Paragraph
counts were verified programmatically to match source exactly for all 11
chapters both before and after correction.

## Overall verdict

The modern-English rendering in this batch is, on the whole, a careful and
faithful paraphrase of the source. The overwhelming majority of flags raised
by the automated screens were false positives caused by legitimate
modernization choices (e.g. "Tis" → "It is", "AEneid" → "Aeneid", verse
quotations recast as prose, word-order changes in paraphrase). Four genuine
content-fidelity defects were found and fixed. No meaning inversions, no
compressed/summarized passages, and no dropped classical anecdotes were
found in this batch.

## Per-chapter verdict

- **Ch. 67 "Of books"** — Clean. No defects found.
- **Ch. 68 "Of cruelty"** — 1 defect found and fixed (dropped alternate translation of a Latin tag).
- **Ch. 69 "Apology for Raimond Sebond"** (660 paragraphs, by far the longest) — 1 defect found and fixed (factual distortion in classical anecdote: wood → wool). No other defects found despite exhaustive screening of this chapter (it received the largest share of flags due to its length, but nearly all were faithful paraphrase/verse-to-prose recastings).
- **Ch. 70 "Of judging of the death of another"** — Clean.
- **Ch. 71 "That our mind hinders itself"** — Clean (fully manually read, all 3 paragraphs).
- **Ch. 72 "That our desires are augmented by difficulty"** — Clean.
- **Ch. 73 "Of glory"** — Clean.
- **Ch. 74 "Of presumption"** — 1 defect found and fixed (Biblical name substituted: Matthias → should read Matthew per source ground truth).
- **Ch. 75 "Of giving the lie"** — Clean.
- **Ch. 76 "Of liberty of conscience"** — 1 defect found and fixed (historical quotation attribution word changed: "Galilean" → should read "Nazarene" per source, twice in the same paragraph).
- **Ch. 77 "That we taste nothing pure"** — Clean (fully manually read, all 27 paragraphs).

## Defects found and fixed

### 1. Factual distortion in classical anecdote (Thales's mule)
- **Chapter:** 69 ("Apology for Raimond Sebond")
- **Paragraph index (0-based):** 103
- **Source text (exact):** "...till his master, discovering the knavery, ordered that he should be laden with wood? wherein, finding himself mistaken, he ceased to practise that device."
- **Defective text (exact):** "...until his master, discovering the trick, ordered him to be loaded with wool, on which, finding himself mistaken, he gave up the device."
- **Fix (exact):** Changed "loaded with wool" to "loaded with wood".
- **Why it matters:** This is Montaigne's anecdote about Thales's mule, which learned to lie down in river water to dissolve its salt load and lighten its burden. The master's countermeasure — reloading the mule with a non-dissolving material so the trick no longer works — is the punchline of the story. The source specifies "wood"; "wool" is a different (also non-dissolving, but factually wrong relative to the ground-truth text) material substitution that changes a concrete historical/anecdotal detail.

### 2. Biblical name substituted (Acts 1:26 citation)
- **Chapter:** 74 ("Of presumption")
- **Paragraph index (0-based):** 120
- **Source text (exact):** ["The lot fell upon Matthew."--Acts i. 26.]
- **Defective text (exact):** ["The lot fell upon Matthias." — Acts i. 26.]
- **Fix (exact):** Changed "Matthias" back to "Matthew" to match the source ground truth.
- **Why it matters:** The source's Cotton-translation citation names "Matthew"; the modern-en rendering silently substituted "Matthias" (the name most readers will recognize as the historically standard rendering of the apostle chosen by lot in Acts 1:26). Whatever the merits of that correction against the Bible itself, it is a divergence from the locked source text we are checking against, so it was reverted for fidelity. Flagging this explicitly in case editorial policy prefers the historically standard name over strict source fidelity — that would be a deliberate call to make, not a silent one.

### 3. Historical quotation attribution changed (Julian the Apostate's dying words)
- **Chapter:** 76 ("Of liberty of conscience")
- **Paragraph index (0-based):** 7
- **Source text (exact):** "These words that some make him say when he felt himself wounded: "Thou hast overcome, Nazarene"; or as others, "Content thyself, Nazarene"; would hardly have been omitted..."
- **Defective text (exact):** "The words some put in his mouth when he felt himself wounded — "Thou hast overcome, Galilean," or as others have it, "Be content, Galilean" — would hardly have been omitted..."
- **Fix (exact):** Changed both instances of "Galilean" back to "Nazarene" to match source.
- **Why it matters:** This is the famous (probably apocryphal) dying declaration attributed to the Emperor Julian the Apostate. The commonly known popular form of this quotation is "Vicisti, Galilaee" ("You have won, Galilean"), and the modern-en rendering apparently substituted the more familiar "Galilean" for the source's "Nazarene." Since the source text (our locked ground truth) explicitly and consistently uses "Nazarene," the substitution is a fidelity break and was reverted. As with defect #2, flagging in case editorial policy prefers the more commonly recognized historical phrasing.

### 4. Dropped alternate translation of a Latin epigraph
- **Chapter:** 68 ("Of cruelty")
- **Paragraph index (0-based):** 6
- **Source text (exact):** ["Virtue is much strengthened by combats." or: "Virtue attacked adds to its own force." --Seneca, Ep., 13.]
- **Defective text (exact):** ["Virtue when assailed adds much to its own strength." — Seneca, Ep., 13.]
- **Fix (exact):** Restored both alternate translations: ["Virtue is much strengthened by combats," or: "Virtue attacked adds to its own force." — Seneca, Ep., 13.]
- **Why it matters:** The source presents two alternate English renderings of the Latin tag (a translator's note style construction, "X, or: Y"), and the modern-en version silently collapsed them into a single merged/paraphrased translation, dropping one of the two alternatives. Minor relative to the other defects (translator's bracketed note, not Montaigne's own prose), but a dropped clause per the letter of the task brief.

## Areas given extra scrutiny that turned out clean

- All classical citations and Latin tags spot-checked across the batch (Horace, Seneca, Lucretius, Ovid, Terence, Martial, Livy, Tacitus, Catullus, St. Augustine, etc.) — translations/paraphrases preserve meaning and correct attribution.
- Long digressive passages in the Apology (ch. 69) on animal reason, Pyrrhonism, the senses, and the variety of human customs — checked extensively via diff flags; all differences found were faithful paraphrase or prose-recast verse, not compressions or inversions.
- Proper names and toponyms throughout (Cicero, Plutarch, Caesar, Sertorius, Numa, Zoroaster, Lycurgus, Draco/Solon, Protagoras/Ariston, Arcesilaus/Carneades, etc.) — spelling was modernized consistently but referents and attributions were preserved correctly, with the two exceptions noted above (Matthew/Matthias, Nazarene/Galilean).
- Numeral and quantity mentions (hundreds, thousands, dozens, specific ages/dates) — screened for mismatches across the whole batch; only the paragraphs discussed above turned out to reflect a real discrepancy, and on inspection the numeral mismatches found were consistent with faithful "one"/pronoun-density variation from paraphrase, not altered facts.

## Verification

Paragraph counts per chapter in `mt-batchG-corrected.json` match
`mt-batchG-source.json` exactly (67:32, 68:69, 69:660, 70:41, 71:3, 72:49,
73:101, 74:163, 75:19, 76:10, 77:27 — total 1174), confirmed programmatically.
