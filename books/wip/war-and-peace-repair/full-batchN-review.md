# Batch N — Independent Fidelity Review

**Reviewer:** independent pass (not the drafting agent)
**Scope:** 20 chapters — 308, 309, 311–324, 326–329
**Files:** `full-batchN-source.json` (Maude) · `full-batchN-current-modern-en.json` (pre-fix) · `full-batchN-corrected.json` (post-fix)
**Method:** programmatic diff; word-count/numeral omission scan; full paragraph-by-paragraph read of all 20 chapters (~358 paragraph pairs) against source.

---

## 1. Confirmed diff (corrected vs current)

Verified by script (chapter-keyed, paragraph-indexed comparison).

- Chapter set identical in all three files: 308, 309, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 326, 327, 328, 329 (20 chapters).
- Paragraph counts: **source == current == corrected** for all 20 chapters. No merges, splits, drops or insertions.
- Chapter titles unchanged.
- **Exactly 4 paragraphs differ** between current and corrected:

| Chapter | Para idx | Change |
|---|---|---|
| 308 | 35 | `Nikolai` → `Nicholas` |
| 316 | 10 | restored `(he saw something sublime in himself)` |
| 318 | 20 | `Pyotr Ilyich` → `Peter Ilyich` |
| 319 | 0 | `Pyotr Ilyich` → `Peter Ilyich` |

Nothing else changed. The drafter's claim of a 4-chapter, 4-paragraph diff is **confirmed exactly**.

---

## 2. Verification of each fix against source

**308.35 — CORRECT.** Source: *"Pétya was as musical as Natásha and more so than **Nicholas**…"* Maude uses "Nicholas". Fix matches source and house convention. Valid.

**316.10 — CORRECT and substantive.** Source: *"Du sublime **(he saw something sublime in himself)** au ridicule il n'y a qu'un pas," said he.* The narrator's parenthetical is Tolstoy's, not an editorial gloss, and carries the chapter's whole argument about Napoleon's self-regard. Its omission was a genuine content loss; restoration is correct and placed correctly.

**318.20 — CORRECT (with a caveat).** Source reads "about **Peter Ilýnich**". The fix restores the anglicized given name "Peter", which is right. Note the patronymic was normalized `Ilýnich` → `Ilyich`. Maude's `Ilýnich` is Dunyásha's colloquial servant-form; flattening it to the standard `Ilyich` is a defensible house-style call but does lose a register marker. Not a fidelity break.

**319.0 — CORRECT.** Same source form ("Peter Ilýnich"), same fix, same caveat. Internally consistent with 318.20.

All four fixes verify against source. No fix introduced a new error.

---

## 3. Independent findings — all 20 chapters

Mechanical scan first: only 3 paragraphs fall below 75% of source word count (317.4 0.73, 324.9 0.74, 324.19 0.69) — all inspected, all explained by Maude's verbosity, not by content loss. Chapter-level word ratios run 0.91–0.99, consistent with legitimate modernization. Only numerals "missing" are the footnote markers in 316.7/316.9, handled correctly.

### Chapters read and judged sound

**309, 313, 314, 315, 320, 322, 326 (except note below), 329** — read paragraph by paragraph against source. Complete and faithful. No omissions, inventions, reversals, or distortions. Particular checks that passed: the full Berthier dispatch (314.2) is rendered in full with no clause dropped; all four numbered "senseless" and four numbered "impossible" arguments survive in 317; Kutúzov's speech at Dóbroe (323) keeps the register shift from formal to peasant-plain and the "who asked them here" outburst; Pierre's globe vision (313.4–313.7) is intact; the closing theological passage of 329.7–329.8 is complete.

**308, 316, 318, 319** — post-fix, now sound at the fixed points; rest of each chapter read and confirmed faithful.

### Additional genuine defects found (not in the drafter's notes)

None of these are corrected in `full-batchN-corrected.json`.

**D1 — ch319 para 19 — MEDIUM. Meaning-carrying detail lost.**
Source: *"You have improved in looks and **grown more manly**," continued the countess, taking her daughter's hand.*
Output: *"You've gotten prettier and **more grown-up**," continued the countess…*
The countess is in delirium and is addressing Natásha as if she were Pétya. "More manly" is the signal that she is speaking to her dead son, not her daughter — it is the entire point of the line, and it sets up "Natásha, he is no more, no more!" three paragraphs later. "More grown-up" erases the tell and makes the line merely affectionate. Recommend restoring "grown more manly."

**D2 — ch327 para 3 — LOW/MEDIUM. Image substituted, and confusingly so.**
Source: *"Their **ships** had been burned, there was no salvation save in collective flight…"* (the burn-one's-boats idiom).
Output: *"Their **bridges** had been burned…"*
Not only an unwarranted substitution but an actively misleading one: this chapter is about the Berëzina bridges, which did break — the reader will take a metaphor as literal reporting. Recommend restoring "ships."

**D3 — ch324 para 9 — LOW/MEDIUM. Direction of the appeal reversed.**
Source: *"Lend a hand… will you? **You may want us** one of these days."* (the haulers press the Sixth Company: help now, you'll need us later).
Output: *"Give us a hand… **We might need you** one of these days."*
The persuasive logic is inverted; as rendered, the line no longer argues for anything.

**D4 — ch327 para 15 — LOW. Characterization softened.**
Source: *"while awaiting the Emperor's arrival led a **dissipated** life."*
Output: *"…led a **leisurely** life."*
Tolstoy is describing dissolution, not rest; the word feeds the Emperor's "old comedian" judgment in ch328. "Leisurely" is a euphemism, not a modernization.

**D5 — ch312 paras 0–1 — LOW. Footnote artifact: visible duplicate line.**
Source 312.0 is the French *"À vos places!"* with 312.1 as its footnote gloss *"To your places."* The output translates the French inline **and** keeps the gloss paragraph, producing two consecutive identical lines:
> "To your places!" a voice suddenly cried.
> "To your places!"
Every other footnote paragraph in this batch (313.23, 316.8, 316.9, 316.11, 321.12, 322.1, 326.15, 326.21) is wrapped in parentheses, which at least marks it as apparatus. 312.1 is not, so it reads as a stray repeated line of narrative. Minimum fix: parenthesize it for consistency.
(Note: the underlying pattern — inline-translating the French, then keeping a now-redundant gloss paragraph to preserve alignment — is edition-wide and presumably an accepted prior decision. Flagging only the inconsistent instance.)

**D6 — ch311 para 12 — LOW. Punctuation corruption + small omission.**
Output: `'Where is the old man who has been suffering innocently?' A paper has come from the Tsar!'`
Source: `'Where is the old man who has been suffering innocently **and in vain**? A paper has come from the Tsar!'`
Two problems: the single quoted exclamation has been split into a closed quote plus an orphan quote mark (unbalanced quoting inside Karatáev's reported speech), and "and in vain" is dropped. The quoting glitch is the more visible reader-facing defect.

**D7 — ch317 para 5 — LOW. Rhetorical claim softened.**
Source: *"Why was the Russian army… **defeated at Krásnoe and the Berëzina by** the disorganized crowds of the French when it was numerically superior?"*
Output: *"…**unable to defeat** the disorganized crowds of the French at Krasnoe and the Berezina…"*
Tolstoy's provocation is that the Russians were *defeated*; two paragraphs later he says the French rightly count this period as a series of victories. "Unable to defeat" removes the sting and weakens the argument's setup.

### Minor observations (no action recommended)

- **317.22** — "fifteen degrees of frost" → "fifteen below zero". Maude's phrase is roughly −18 °C; "fifteen below zero" reads as °F to a US reader (≈ −26 °C). A unit-free rendering ("hard frost") or "fifteen degrees of frost" would be safer, but this is not a fidelity break.
- **326.12** — "a shawl tied woman fashion round his head" → "babushka-style". Introduces a Russian loanword not in the source, for a Frenchman. Mild invention; harmless.
- **321.16** — the concrete "would not advance from the Linen Factories because he was comfortable there" is compressed to "he only cared about his own comfort", dropping the place name. Mild example-compression.
- **328.8** — "from Turkey to **the Treasury in** Petersburg" → "from Turkey to Petersburg". Detail dropped.
- **327.8** — "Grand Duke **Tsarévich** Constantine Pávlovich" → title "Tsarevich" dropped.
- **321.6** — "the rapidity of which was unparalleled **for such a time of the year**" compressed to "this unprecedented march".
- **313.9** — source "knouted" → "flogged" (noted by drafter; agreed, acceptable).
- **326.27** — source "wormwood grows on its own root" → "even weeds grow from their own roots" (noted by drafter; agreed, a proverb substitution, acceptable but a slight image loss).
- **308.30** — "sitting on a wagon captured from the French **beside which horses were tethered**" — trailing clause dropped; harmless.
- **318.18** — "I love **thee**!... thee!" → "I love you!... You!" (acceptable modernization); reporting verb changed from "said" to "whispered" (small invention).

### Note on the drafter's notes file

`full-batchN-notes.md` is internally inconsistent in its summary: the body marks 4 chapters defective and 16 sound, while the Summary line reads "15 sound… 5 defective, corrected: 308, 316, 318, 319". The actual, verified state is **4 chapters changed, 16 unchanged**. The notes' chapter-by-chapter body is accurate; only the summary tally is wrong.

---

## 4. Verdict

**The four claimed fixes are real, correctly applied, and verified against source. The diff is exactly as claimed — no unclaimed edits, no alignment damage, no paragraph-count drift.** `full-batchN-corrected.json` is strictly better than `full-batchN-current-modern-en.json`.

**However, the "17/20 sound" claim does not survive an independent read.** Seven additional genuine defects remain uncorrected, one of them (D1, ch319) a meaning-carrying loss that breaks the countess's delirium scene, and two more (D2 ch327, D3 ch324) that substitute or invert the source's sense. D6 (ch311) is a visible punctuation corruption.

**Recommendation: do not accept as final.** Accept the four existing fixes, then apply a second corrective pass for D1–D7 (all are single-paragraph, surgical edits; none touch paragraph alignment) before promoting to `full-batchN-accepted.json`.
