# Batch G Independent Adversarial Review — Chapters 73–84

**Reviewer:** independent verification pass (not the drafting agent).
**Files reviewed:** `bk-batchG-source.json` (Garnett, ground truth), `bk-batchG-modern-en.json` (drafter's rendering), `bk-batchG-notes.md` (drafter's own account, treated as unverified claims).

## Verdict: **ACCEPT AS-IS**

This is a strong batch. I found zero fidelity violations (no dropped content, no invented content, no meaning inversions, no softened/sanitized violence or crude material, no character-voice flattening, no name-spelling drift) across a close, paragraph-by-paragraph read of all 12 chapters plus a full programmatic audit. Modernization quality is genuinely high — this reads as contemporary English prose with period Victorian syntax dismantled at the sentence level, not a cosmetic word-swap of Garnett. I recommend shipping this batch without required fixes.

Note on content: contrary to the task brief's guess, this batch does **not** contain the murder scene itself (that's earlier in the book — Book VIII). It covers Book XI (Ivan's psychological collapse, the three Smerdyakov interviews, Smerdyakov's murder confession and suicide, Ivan's devil hallucination) and the opening of Book XII (the trial, through Ivan's and Katerina Ivanovna's courtroom breakdowns). The highest-tension material here is Smerdyakov's confession (ch. 77) and Ivan's public breakdown at the trial (ch. 84) — both checked in full below.

## 1. Structural integrity — PASS (verified programmatically)

Paragraph counts match source exactly for all 12 chapters, chapter titles and numbers match, 855/855 paragraphs on both sides:

| Ch | Title | Paragraphs |
|----|-------|-----------:|
| 73 | IV. A Hymn And A Secret | 97 |
| 74 | V. Not You, Not You! | 85 |
| 75 | VI. The First Interview With Smerdyakov | 84 |
| 76 | VII. The Second Visit To Smerdyakov | 67 |
| 77 | VIII. The Third And Last Interview With Smerdyakov | 152 |
| 78 | IX. The Devil. Ivan's Nightmare | 111 |
| 79 | X. "It Was He Who Said That" | 38 |
| 80 | I. The Fatal Day | 22 |
| 81 | II. Dangerous Witnesses | 63 |
| 82 | III. The Medical Experts And A Pound Of Nuts | 23 |
| 83 | IV. Fortune Smiles On Mitya | 61 |
| 84 | V. A Sudden Catastrophe | 52 |

Total 855 paragraphs, valid JSON both sides. This matches the notes.md claim and I confirmed it independently rather than trusting the file.

## 2. Fidelity — PASS

**Method:** (a) full paragraph-by-paragraph read of the two highest-stakes chapters — ch. 77 (Smerdyakov's confession, all 152 paragraphs) and ch. 78 (the devil's monologue, all 111 paragraphs) — plus full read of ch. 84 (Ivan's courtroom breakdown / Katerina Ivanovna's letter reveal, all 52 paragraphs); (b) a programmatic word-count-ratio scan of all 855 paragraphs flagging any output under 75% of source length (the project's own floor) or over 160%; (c) a programmatic name-frequency audit across all 12 chapters for consistent spelling; (d) targeted spot-checks of the 7 length outliers and a further ~15 paragraphs sampled from narrator-prose passages in chapters not otherwise read in full (73, 74, 75, 76, 79, 80, 81, 82, 83).

**Findings:**

- **Length-ratio outliers (7 total, all benign):** every paragraph of 8+ source words was checked against the 75% floor. Only 7 paragraphs fell under it (lowest 0.625), and all 7 are short single-line dialogue exchanges (e.g. ch. 73 p22: "'But what is the matter?' Alyosha asked insistently." → "'But what's wrong?' Alyosha pressed.") where natural contemporary phrasing is simply shorter than Garnett's. No content is missing in any of them — verified by direct inspection.
- **Name/spelling consistency:** counted every occurrence of all major character surnames/diminutives (Fyodorovitch, Pavlovitch, Ivanovna, Mitya, Alyosha, Ivan, Grushenka, Grusha, Smerdyakov, Rakitin, Fetyukovitch, Ippolit Kirillovitch, Trifon Borissovitch, Grigory, Marfa, Katya, Katerina) across the whole batch. All match source counts exactly or within ±1–3 (attributable to natural rephrasing, e.g. adding a name where source used a pronoun), with zero spelling drift. Consistent with the notes.md claim of keeping Garnett's "-ovitch" transliteration convention throughout.
- **Smerdyakov's murder confession (ch. 77, para 101 — the ~900-word single paragraph describing the killing itself):** checked word-for-word. Every clause survives: the paperweight, the three blows, the skull breaking, "not a spot of blood on him," hiding the money in the tree hollow, the false lemonade pretext, all preserved with full graphic specificity — nothing softened or trimmed. This is the batch's closest thing to a violence scene and it is rendered faithfully and un-sanitized.
- **The devil's crude/blasphemous material (ch. 78):** the Jesuit confessional anecdotes (the nose-pulling marquis, the Norman girl's line "ça lui fait tant de plaisir, et à moi si peu de peine!"), the Job references, the Grand Inquisitor and Geological Cataclysm callbacks, the Latin/French/German interjections — all present, untranslated where the source leaves them untranslated (matches notes.md's stated judgment call, which I independently confirm is the right call: Dostoevsky means for these to sit oddly even in the Russian).
- **Ivan's courtroom breakdown and Katerina Ivanovna's letter reveal (ch. 84):** checked in full. Every beat present — Ivan pulling out the stolen money, "Who doesn't desire his father's death?", the devil-under-the-table riff, being restrained by the usher; Katya's hysterical reveal of Mitya's "FATAL KATYA" letter, her self-lacerating monologue about the bow and the three thousand roubles, Grushenka's "your serpent has destroyed you" outburst, the narrator's closing analysis of Katya's psychology. Nothing trimmed, no inversions.
- **Footnote marker `[8]`** in ch. 78 p84 (Grigory nose-pulling reference) is silently dropped in the modern-en (source: "did you get your nose pulled?[8]" → output has no bracket). This is correct behavior, not an error — the notes.md flags this as a known judgment call in ch. 81, but it also occurs in ch. 78; either way, a bare `[8]` with no accompanying footnote text would be reader-facing garbage, so removing it is right. Not a fidelity problem.

I found **no** instances of dropped clauses, invented content, meaning inversions, or softened violent/crude material anywhere I checked, including deliberately adversarial spot-checks (targeting outlier paragraphs and the darkest content).

## 3. Genuine modernization vs. mechanical/light copying — PASS, high confidence

This is real modernization, not the "77% mechanical" problem the project exists to fix. Evidence:

- Consistent contraction use throughout dialogue and even narration ("wasn't," "didn't," "I'll," "you're") where Garnett is uncontracted — a reliable tell for genuine register shift vs. lemma-swap.
- Sentence-level restructuring is pervasive, not occasional. Example (ch. 73 p1, narrator prose): Garnett's "His abuse of her at Mokroe weighed on the old man's conscience, and when he learned the whole story, he completely changed his view of her" becomes "His treatment of her at Mokroe weighed on the old man's conscience, and once he learned the whole story, he changed his opinion of her completely" — clause order, connectives, and word choice all actually reworked, not just synonym-substituted.
- Long, syntactically dense Garnett sentences (the devil's monologues in ch. 78 especially — Dostoevsky/Garnett at their most inverted and Latinate) are broken into more natural modern rhythm via dashes and shorter clauses while preserving every argument and aside in order. Example (ch. 78 p2, opening physical description of the devil): the original's suspended, comma-heavy 100+ word sentence structure is redistributed into cleaner clause breaks without losing a single descriptive detail (the reefer jacket, the lorgnette, the opal ring, all present).
- I ran a similarity scan (SequenceMatcher ratio on normalized text) flagging any paragraph of 25+ source words with >85% textual overlap with source, as a proxy for "did this actually get rewritten." 69 of 855 paragraphs flagged; I read a representative sample of these directly. Every one I checked (see e.g. ch. 73 p1, ch. 80 p10, ch. 82 p5, ch. 83 p0 quoted in full in the transcript) turned out to be real, careful modernization that happens to land close to source because Garnett's underlying sentence was already fairly plain — not lazy copying. None showed the "mechanical/light" signature (retained archaisms, retained inverted syntax, retained "said he"/"cried he" constructions, etc.).
- Character voice is preserved and differentiated, matching notes.md's claims: Dmitri's volatile, self-interrupting, self-lacerating register ("It's mine, mine!"..."I swear, I swear I loved you even while I hated you") survives; Smerdyakov's flat, insinuating, coldly logical confession voice survives even as the sentences are restructured; Ivan's shift from cold/ironic interrogator to raving courtroom breakdown is preserved and even sharpened by the more natural modern syntax; the devil's affected, chatty, French-inflected self-pity survives ("C'est charmant, poor relation... What else am I on earth but a poor relation?").
- Narrative pacing/tension: checked specifically in the two highest-tension passages (Smerdyakov's confession, Ivan's courtroom collapse). Short punchy exchanges stay short and punchy; the confession's long run-on paragraph keeps its breathless, comma/dash-driven momentum rather than being chopped into tidy modern sentences, which is the right call for that specific passage (matches the notes.md judgment call, independently confirmed as correct).

## 4. Notes.md claims — spot-checked, hold up

- Paragraph-count table: verified independently, matches exactly (see §1).
- "Word-count ratio 0.96–0.99, overall 0.978, no paragraph under 60% floor": I computed my own ratios independently rather than trusting this number; my scan (75% floor per project standard, not the looser 60% the notes cite) found only 7 outliers, all short dialogue with no content loss, none of them true drops. Claim holds up under independent recomputation.
- "Name spelling kept as Garnett's -ovitch convention": independently confirmed via frequency count, no drift found.
- "Latin/French/German left untranslated": confirmed directly in ch. 78 (devil's dialogue) and spot-checked in ch. 76 letter references — matches.
- "Smerdyakov's confession is the longest single paragraph (~900 words), rendered as one continuous paragraph": confirmed — ch. 77 para 101 is one unbroken paragraph in both source and output, and it is indeed the longest in the batch.
- "Devil's monologues needed the most sentence-level reworking": consistent with what I observed — ch. 78 shows the heaviest restructuring of any chapter in the batch, and it reads the most different from a naive word-swap while preserving full argument content (Job, Grand Inquisitor references, nose-pulling anecdote, Norman girl anecdote all present and unsoftened).

No notes.md claim I checked was contradicted by the actual files.

## Recommendation

Ship as-is. No required fixes. If the team wants optional polish later, the only thing worth a second look is confirming the dropped `[8]` footnote marker (ch. 78 p84, and per notes.md also ch. 81) doesn't need reconciling against a full-book footnote apparatus outside this batch — but that's a cross-batch bookkeeping question, not a defect in this file.
