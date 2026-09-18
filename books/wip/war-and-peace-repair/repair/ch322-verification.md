Model: opus

# Chapter 322 (Book Fifteen, 1812–13 — Chapter 5) — independent verification

Verifier did not draft, review or correct this chapter. Paragraph indices below are **0-based** (JSON array index); the fidelity review's numbers are 1-based, so index = n−1.

Files compared:
- source: `ch322-source.json`
- pre-correction candidate: `ch322-candidate.json`
- corrected: `ch322-corrected.json`
- log: `ch322-corrections-log.md`
- context: `ch322-fidelity.md`, `ch322-candidate-notes.md`, `CONVENTIONS.md`

## 1. Diff vs log

Independently computed diff (candidate vs corrected), 0-based:

`[0, 2, 3, 5, 7, 9, 10, 13, 14, 15, 16]` — 11 paragraphs changed.

Log entries: indices 0, 2, 3, 5, 7, 9, 10, 13, 14, 15, 16 — 11 entries.

**Index lists match exactly.** No logged change is missing from the file; no changed paragraph is unlogged.

**One log-accuracy defect (non-blocking).** At index 9 the log's quoted *After* reads "…prove that **only** he understood the meaning of events", while the file reads "…the meaning of **the** events". The file is the correct text — the source has "the meaning of the events" — so the change that landed is right and the log's transcription is one word short. The substantive logged change (restoring "only") is present. Every other *Before*/*After* pair in the log reconciles exactly with the candidate and corrected paragraphs. Recorded as a log defect, not a text defect; it needs no re-round, only a one-word fix to the log if the log is kept as a record.

## 2. Per-change verdicts (re-derived from the source, not from the log)

### ¶0 — PASS
Source: "a history recently written **by order of the Highest Authorities**" and "**frightened** of the name of Napoleon". Both restored. "official command" had flattened a capitalised euphemism whose whole function is a sneer at where the order came from; "terrified" had sharpened "frightened". Correct.

The source paragraph ends with the footnote marker `*`; the corrected paragraph carries no marker and index 1 is the slot. See §4.

### ¶2 — PASS
Source: "great men (grands hommes) **whom** the Russian mind does not acknowledge" and "punish such men for discerning **the higher laws**." The candidate's "as the Russian mind does not acknowledge them" garbled the relative clause into something close to a comparison; "a higher law" turned a definite plural into an indefinite singular, which weakens the chapter's claim that there are knowable higher laws. Both restored correctly.

### ¶3 — PASS. This is the most substantive repair in the chapter and it is done right.
Source holds the historians' verdict *inside* one sentence: "But Kutúzov—the man who … never once swerving … presented an example exceptional in history of self-sacrifice and a present consciousness of the future importance of what was happening—Kutúzov **seems to them something indefinite and pitiful**…". The candidate had reordered this so the verdict came first and the evidence after, and had supplied two connectives ("though", "Yet") to hold the new order together. Corrected restores the source's order and the interrupted-appositive shape ("But Kutuzov—the man who … —Kutuzov seems to them…"), and both invented connectives are gone. Verified against the source clause by clause: the appositive's five elements survive in the source's sequence.

Also restored in the same paragraph: "**adulation**" (not the softer "admiration"), "he is **grand**" with the candidate's scare quotes removed, "something **indefinite and pitiful**", "a little **ashamed**". All source-exact. The candidate's "wavered" for "swerving" and "living awareness" for "present consciousness" are retained unchanged; neither was a finding and neither shifts the claim.

### ¶5 — PASS (gloss removal plus three restorations)
- **Gloss removed.** "Count Rostopchin, **the governor of Moscow**" → "Count Rostopchin". I re-derived this independently: the source supplies no office here, an office is not a category gloss, and — decisively — it is the load-bearing fact of the anecdote. Telling the reader that Rostopchin governed Moscow does the paragraph's work for him and dissolves Tolstoy's flat juxtaposition. Correctly removed.
- "**How was it you promised** not to abandon Moscow without a battle?" restored. A reproach about a promise already given is not the candidate's accusation about making it.
- The source's deliberate repetition is restored in full: "What did it matter to him—**who then alone** amid a senseless crowd understood **the whole** tremendous significance of what was happening—**what did it matter to him** whether Rostopchin attributed **the calamities** of Moscow to him or to himself?" Every element the review flagged ("then", "whole", the repeated frame, "calamities" not "destruction") is present and in the source's order.
- "the writer Madame de Stael" is left in place, consistent with the review's explicit PERMITTED ruling. Confirmed unchanged.

### ¶7 — PASS (gloss removal plus four restorations)
- **Gloss removed.** The candidate's "—a clear route left open for retreat—" after "golden bridge" is deleted. This is an interpretation of a metaphor, not a gloss of a term, and the source leaves Kutuzov's sayings unexplained by design. Correct, and it restores consistency with ch327 ¶6, where the same phrase recurs bare and is listed among the "phrases" the generals mocked. I checked ch327's corrected text: "golden bridge" is unglossed there. The two chapters now match.
- "expressed his **real thoughts** with the bitter **conviction**" — source exact; "true convictions / certainty" had swapped both nouns.
- "the loss of Moscow **is not** the loss of Russia" — the present-tense maxim restored, matching the neighbouring maxim ("There can be no peace, for such is the people's will") which the candidate had left in the present. The tense inconsistency is gone.
- "all **our** maneuvers **are** useless, everything is being accomplished **of itself** better than **we** could desire" — source exact. "of itself" (by its own agency) is the claim; the candidate's "without them" had relocated it to the generals.

### ¶9 — PASS
Source: "Nor do words alone prove that **only** he understood the meaning of the events." The dropped "only" is the chapter's central claim — exclusivity, carried elsewhere by five instances of "he alone" — and this is the sentence that asserts it of understanding itself. Restored. Also restored: "to **brace** all his strength" (source's verb, not "concentrate") and "the sufferings of **our** people and **our** army" (narrator's first person, which the candidate had flattened to "his"). The corrected text reads "the suffering of our people and our army" — singular "suffering", inherited unchanged from the candidate and not a finding.

### ¶10 — PASS (two MODERATEs)
- **Both instances of the added "supposed" removed.** Source: "**This procrastinator Kutúzov** … **this enemy of decisive action**, gave battle at Borodinó…". Tolstoy quotes the charge deadpan and lets the rest of the sentence demolish it; "supposed" announced the verdict before the evidence. Correctly removed at both points.
- Source: "He alone during the whole retreat insisted that battles, **which were useless then, should not be fought**". The candidate had reassigned the narrator's aside to Kutuzov as the content of his insistence ("insisted that further battles were useless") and dropped what he actually insisted on. Restored exactly; the following two clauses ("a new war should not be begun", "the Russian frontier should not be crossed") are intact and in order.

### ¶13 — PASS
Source: "that extraordinary power of **penetrating the meaning of the events then occuring**". The candidate's "power of insight" named nothing, in a paragraph whose only job is to say what the power was a power *of*. Restored. The corrected text spells "occurring" correctly where the Maude source file has the typo "occuring"; that is a silent typo fix, not drift.

### ¶14 — PASS
Source: "placed him on that highest **human** pedestal". "human" restored — it is what keeps the praise this side of the divine, in a sentence that then contrasts slaying with pity.

### ¶15 — PASS
Source: "could not be **cast in** the false mold … that history has **invented**." Both intensifiers ("forced into", "fabricated") reverted to the source's verbs. Correct.

### ¶16 — PASS
Source: "for a lackey has his own conception of **greatness**." The padded "what greatness means" turned a conception *of greatness* into a conception of a word's meaning and broke the epigram's lackey/great/greatness symmetry. Restored. "lackey" — the candidate's genuine improvement on the baseline's "servant" — is kept.

## 3. Read as a new reader

All eleven corrected paragraphs read clearly. ¶3 is the one to watch, since the correction restores a long interrupted appositive; read cold, it holds, because the repeated subject ("But Kutuzov—the man who … —Kutuzov seems to them…") re-anchors the reader at the far end of the interruption exactly as the source does. ¶5's restored repetition of "what did it matter to him" reads as the rhetorical device it is, not as an error. ¶10 is clearer than the candidate: without "supposed" the reader meets the charge and its refutation in the order Tolstoy built them.

## 4. Structure and punctuation

- Paragraph count: source 17, candidate 17, corrected 17. Match.
- Order preserved; no paragraph moved, merged or split.
- No empty or whitespace-only paragraphs.
- `number` (322) and `title` ("Book Fifteen (1812 - 13) — Chapter 5") identical across all three files. JSON parses clean.
- Per-paragraph `?` and `!` parity against source: **no discrepancies in any of the 17 paragraphs.**
- **Footnote slot, index 1.** Source: `* History of the year 1812 … by Bogdánovich.` Corrected: `(History of the Year 1812 … by the historian Bogdanovich.)` Unchanged from candidate and baseline. This slot is a **gloss** — a bibliographic citation, not a translation — so CONVENTIONS §Foreign language rule 4 permits the parenthesised form. Correct as it stands. The "the historian" addition was explicitly ruled PERMITTED by the review. `edition_checks.py` raises no `footnote-slot-bare` flag, and since ¶0 carries no stray `*`, no orphan-marker flag either. No bracket tags anywhere in the chapter.

## 5. Findings

- **No MAJOR findings** — the fidelity review recorded none.
- **All seven MODERATE findings resolved**: ¶4 reordering, ¶6 Rostopchin gloss, ¶8 "golden bridge" gloss, ¶10 "only", ¶11 "supposed", ¶11 "battles… should not be fought", ¶14 "penetrating the meaning" (review's 1-based numbering). Each re-derived from the source and confirmed correct and complete.
- **All MINOR findings applied** except the two explicitly ruled PERMITTED (Bogdanovich, Madame de Stael), which the log correctly records as declined-by-ruling rather than overlooked.
- **The ¶7 COSMETIC declines are accurate** — both items are genuinely absent from the diff.
- **New COSMETIC, non-blocking:** ¶7 sets the comma outside the closing quotation mark — `offered a "golden bridge", that the battles…`. US convention would place it inside. The source has a semicolon there, which sits outside legitimately, so this is an artefact of the sentence being rebuilt. One character; fold it into the next typographic sweep.
- **Log defect, non-blocking:** index 9's *After* quote omits "the" before "events" (see §1). The file is correct; the log is not.
- **No new drift introduced.** Every changed paragraph was re-read in full against its source paragraph; no correction reached past the finding it answers.

Verification: ACCEPT
sha256: 3aa038c958dab3df1b1667ff7214ab15e15a819bd6b7d100b2a7167a9a127d94
