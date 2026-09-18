Model: opus

# Chapter 321 (Book Fifteen, 1812–13 — Chapter 4) — independent verification

Verifier did not draft, review or correct this chapter. Paragraph indices below are **0-based** (JSON array index); the fidelity review's numbers are 1-based, so index = n−1.

Files compared:
- source: `ch321-source.json`
- pre-correction candidate: `ch321-candidate.json`
- corrected: `ch321-corrected.json`
- log: `ch321-corrections-log.md`
- context: `ch321-fidelity.md`, `ch321-candidate-notes.md`, `CONVENTIONS.md`, `prompts/modern-en-repair/french-pass.md`

## 1. Diff vs log

Independently computed diff (candidate vs corrected), 0-based:

`[0, 2, 3, 4, 5, 6, 7, 10, 11, 14, 16, 17]` — 12 paragraphs changed.

Log entries: indices 0, 2, 3, 4, 5, 6, 7, 10, 11, 14, 16, 17 — 12 entries.

**Exact match.** Every logged change is present; every changed paragraph is logged. Each log entry's *Before* was checked against the candidate paragraph and its *After* against the corrected paragraph (entries quoted with elisions were checked segment by segment): all twelve reconcile. No blocking mismatch.

Note that the footnote-slot paragraph, index 12, is **not** in the diff — it is unchanged from the candidate and from the baseline. See §5.

## 2. Per-change verdicts (re-derived from the source, not from the log)

### ¶0 — PASS
Source: "the **farther movement of** the fleeing French, and of the Russians who pursued them, **continued as far as Krásnoe without a battle**." The candidate had split this into two sentences and manufactured a filler predicate ("kept moving") that asserts nothing. Corrected restores the single sentence with "the farther movement of…". Correct, and the paragraph is shorter and no harder to read.

### ¶2 — PASS
Source: "it is only necessary to grasp **clearly** the meaning of the fact". "clearly" restored. Small but real: the sentence is about the reader's failure to take the arithmetic in, not about mere comprehension.

### ¶3 — PASS
Source: "**with no such threat of destruction as hung over the French**". The candidate's "without facing the total annihilation that threatened the French" both sharpened "destruction" and asserted the threat as fact rather than as the thing the Russians were free of. Restored verbatim in sense.

### ¶4 — PASS
Source: "while **easing the movement of our army**." Restored. Two things are repaired at once: the narrator's first-person plural, and the object — it is the army's *movement* Kutuzov eases, which is the same quantity the chapter argues about throughout (marches, distance), not a vague "burden".

### ¶5 — PASS (four fixes, all source-anchored)
- "another reason for **slackening the pace and delaying** presented itself" — source exact; the candidate's "for slowing down" had dropped the second, distinct action.
- "the closer **our troops trod on their heels**" — source exact; "our" restored.
- The invented clause "**rather than tracing its every turn**" is removed. The source stops at "could cut across the zigzag path of the French" and supplies no contrast. Confirmed absent from the source paragraph; correctly deleted.
- "All the **artful** maneuvers suggested by **our** generals meant **fresh movements of the army and** a lengthening of its marches" — source exact. The candidate had merged two consequences into one.

No new drift; the paragraph's final sentence is untouched.

### ¶6 — PASS
- Source: "with **the whole of** his Russian being". The candidate's "every fiber of" is an English idiom the source does not use. Restored.
- Source: "all the **hardship of this march, the rapidity of which was unparalleled for such a time of the year**." The candidate had compressed this into "this unprecedented march", which loses both what was unparalleled (the speed) and the qualifier that makes the claim true (for that season). Restored in full. This is the substantive repair in the paragraph and it is complete.

### ¶7 — PASS
- Source: "ill-shod, **insufficiently clad**, and half starved". Restored.
- Source: "who **at the best if the flight continued** would have to go a greater distance than they had already traversed, before they reached the frontier." The candidate had dropped "if the flight continued", making an unconditional claim out of a conditional one. Restored with commas around the condition, which is the right reading of Maude's comma-light original and does not change the sense.

### ¶10 — PASS
Source: "fired from a hill **over** the French crowds that were running past". "at" had turned incidental fire above a fleeing mob into deliberate aim. Restored.

### ¶11 — PASS. French convention correctly applied.
Source: "Milorádovich, who said he did not want to know anything about the **commissariat affairs of his detachment**, and could never be found when he was wanted—that ***chevalier sans peur et sans reproche*** \* as he styled himself—…", with the footnote slot at index 12 reading "\* Knight without fear and without reproach."

I re-derived the handling from `french-pass.md` rules 3–5 rather than from the log:

- **Rule 3 applies.** This is a quoted epithet — a maxim Miloradovich applies to himself — so the wording itself is the point, not merely the content. The corrected paragraph therefore keeps the French inline, "chevalier sans peur et sans reproche", **immediately followed by** the English, "the knight without fear and without reproach." That is exactly the rule-3 shape. The candidate had deleted the French entirely, which removed the self-styling from an edition that is meant to preserve it.
- **The (in French) cue is correctly dropped.** Rule 2's cue exists to tell the reader that an English line was spoken in French. Here the French is printed, so the cue would be redundant; rule 5 makes the cue conditional ("cue if needed"). Dropping it is right.
- **Rule 5 governs the slot**, and the review's proposal to put the French *into* the slot is correctly overruled: under rule 3 the French is already inline, and rule 5 exists precisely to stop it being printed twice. The slot keeps Maude's English footnote. (One formatting deviation remains — see §5.)
- Double quotation marks are used, resolving the review's COSMETIC on single quotes, per CONVENTIONS §Typography.

Also in this paragraph: "of his detachment" restored (source exact) — it is what makes the neglect Miloradovich's own rather than a general complaint about the commissariat. "commissary" for Maude's "commissariat" is retained from the candidate, unchanged and unlogged; it is a defensible modernisation and not a finding.

### ¶14 — PASS
Source: "trotted with much effort to the column **presented** to them … and the column that had been **presented to them** threw down its arms and surrendered as it had long been **anxious** to do." The candidate's scare quotes around "presented" (twice) announced an irony the source delivers by flat assertion, and "desperate" sharpened "anxious". Both corrected; "to them" is restored on the second instance as well, matching the source.

### ¶16 — PASS. The MAJOR is fully answered.
Source: "…that **he thought of nothing but satisfying his passions and would not advance from the Linen Factories because he was comfortable there**, that at Krásnoe he checked the advance because on learning that Napoleon was there he had **quite lost his head**, and that it was probable that he had an **understanding** with Napoleon…"

The candidate had compressed the whole Linen Factories charge into "that he only cared about his own comfort" — deleting a named place and an entire accusation from the generals' list. The corrected paragraph restores the clause verbatim in sense, with the place name intact. I checked the list item by item against the source: four charges in the source, four in the corrected text, in the source's order. Also restored: "**melancholy** law of necessity" (the candidate's "tragic" is a different register), "quite lost his head" (confusion, not the candidate's cowardice, "lost his nerve"), and "an understanding with Napoleon" (the candidate had added "secret"). All correct; no new drift.

### ¶17 — PASS
Source: "posterity and history have **acclaimed** Napoleon as **grand**" and "something **indefinite**". Restored: "proclaimed" → "acclaimed", the scare quotes around "grand" removed, and the padding "vague and" removed. Consistent with the same irony-marking repair at ¶14.

## 3. Read as a new reader

All twelve corrected paragraphs read clearly. ¶5 and ¶7 are the long ones, and both are *easier* after correction than before: ¶5 because removing the invented contrast leaves one clean claim per clause, ¶7 because the restored condition ("if the flight continued") tells the reader why the distance is hypothetical, which the candidate's flat version left unexplained.

¶11 is the one paragraph where a reader meets untranslated French. It is immediately glossed in the same breath — "chevalier sans peur et sans reproche, 'the knight without fear and without reproach'" — so no reader is stranded, and the slot repeats the English below. Clear.

## 4. Structure and punctuation

- Paragraph count: source 18, candidate 18, corrected 18. Match. The footnote slot at index 12 is preserved, as rule 4 requires.
- Order preserved; no paragraph moved, merged or split.
- No empty or whitespace-only paragraphs.
- `number` (321) and `title` ("Book Fifteen (1812 - 13) — Chapter 4") identical across all three files. JSON parses clean.
- Per-paragraph `?` and `!` parity against source: **no discrepancies in any of the 18 paragraphs.**
- No bracket tags (`[Speaking in French]` and kin) anywhere in the chapter; no orphan `*` markers.

## 5. Findings

- **The MAJOR finding (¶17, Linen Factories) is resolved** and re-derived as correct and complete against the source.
- **All four other MODERATE findings resolved**: ¶6 invented clause, ¶7 unparalleled rapidity, ¶8 dropped condition, ¶12 French convention.
- **All MINOR findings applied**; the two declined items (¶2 "simply", ¶14 "his") are COSMETIC, genuinely absent from the diff, and correctly declined.
- **New MINOR, non-blocking — footnote-slot marker at index 12.** The slot reads `(Knight without fear and without reproach.)`. Its *content* is right under rule 5 (Maude's English footnote, kept so the French is not duplicated), but its *form* is not: rules 4–5 reserve the parenthesis for slots whose footnote is a **gloss**, and prescribe the `* ` prefix for every other slot — `* Knight without fear and without reproach.` This footnote is a translation, not a gloss. Three reasons this is not blocking: the paragraph is unchanged from the baseline and lies outside the correction diff; `edition_checks.py` treats a slot opening with `(` as filled, so it raises no `footnote-slot-bare` flag; and no meaning is affected. But it is inconsistent with the same rule-3-plus-slot case already accepted at ch351 ¶21 (`* Without faith or law.`), so I recommend the mechanical French-pass sweep normalise it to `* Knight without fear and without reproach.`
- **No new drift introduced.** Every changed paragraph was re-read in full against its source paragraph; no correction reached past the finding it answers.

Verification: ACCEPT
sha256: 87a3cf93cde409d94c9b360002f8bbff20d4a94aa60130e1be1bc25528b84419
