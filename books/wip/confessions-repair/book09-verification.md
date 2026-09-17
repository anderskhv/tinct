# Confessions Book 9 — Independent Verification of Corrections

**Verifier:** independent (did not draft the candidate, did not draft the corrections)
**Ground truth:** `book09-source.json` (Pusey 1838, 38 paragraphs)
**Under test:** `book09-corrected.json` — sha256 `e1516972c4f293597a3e6b53224c0665a9d9cfcdc57485717c37c6d5d1a2504f`
**Baseline:** `book09-candidate.json`
**Review under audit:** `book09-review.md` (21 findings: 1 major, 3 moderate, 17 minor)
**Method:** every claim below re-derived from the source file by script or by direct reading. The drafter's `book09-corrections-log.md` was read only *after* the diff and gate runs, and is not relied on for any verdict.

---

## 1. True diff set

Computed by loading both JSONs and comparing `paragraphs[i]` string-for-string.

**Changed indices (0-based): `[0, 3, 5, 6, 7, 13, 14, 16, 17, 18, 23, 24, 25, 26, 27, 28, 29, 33, 34, 37]` — 20 of 38.**

This **exactly matches** the orchestrator's independently derived set. No extras, no omissions.

Note on numbering: the review uses 1-based P-numbers; index = P − 1. Confirmed by text lookup, not assumed (e.g. index 5 is the Nebridius paragraph = review P6).

**Item 5 of the task — unchanged paragraphs byte-identical:** confirmed by construction. The changed set *is* the set of indices where the strings differ; the remaining 18 paragraphs (1, 2, 4, 8–12, 15, 19–22, 30, 31, 32, 35, 36) are byte-identical to the frozen candidate. No drive-by edits, no silent rewrites.

**Finding coverage:** all 21 review findings map onto changed paragraphs. Every one was addressed; none was silently dropped, and nothing outside the review's scope was touched.

---

## 2. Major + 3 moderates

| # | Finding | Location | Confirmed? | Evidence |
|---|---|---|---|---|
| **MAJOR** | Nebridius tense reversal / self-contradiction | idx 5 (P6) | **CONFIRMED FIXED** | See below |
| **MOD 1** | Fear-attribution inversion | idx 17 (P18) | **CONFIRMED FIXED** | See below |
| **MOD 2** | Grief-overflow softened | idx 28 (P29) | **CONFIRMED FIXED** | See below |
| **MOD 3** | Global single-quote → double-quote | whole file | **CONFIRMED FIXED** | Independent full-file scan, §4 |

### MAJOR — idx 5 (P6), Nebridius

Source (Pusey): *"There he liveth, whereof he asked much of me, a poor inexperienced man. Now lays he not his ear to my mouth, but his spiritual mouth unto Thy fountain…"*

Candidate: *"There he lives, asking me now for so much, the very things I, in my inexperience, used to be asked about by him. Now he no longer presses his ear to my mouth…"*

Corrected: *"There he lives — **the place about which he used to ask me so many questions, inexperienced little man that I was.** Now he no longer presses his ear to my mouth, but presses his spiritual mouth to your fountain…"*

Three independent checks:

1. **Tense.** "used to ask me" — habitual past. The present-tense "asking me now" is gone. ✓
2. **Referent of the inexperience.** Pusey's *a poor inexperienced man* is Augustine (the one asked), not Nebridius. Corrected says "inexperienced little man **that I was**" — correctly Augustine, and "little man" is a defensible rendering of Augustine's *homuncio* register. ✓
3. **Self-contradiction with the following sentence.** Gone. The corrected sequence now reads: *he used to ask* (past, on earth) → *now he no longer presses his ear to my mouth, but his spiritual mouth to your fountain* (present, in God). The temporal contrast is the point of the sentence pair and it now actually works. ✓

Also in this paragraph (review's minor, same index): "our conversion had come at such a cost to him" → "our conversion **was of such a kind**", restoring Pusey's bare *of such sort* and removing the supplied causal content. ✓

### MODERATE 1 — idx 17 (P18), fear attribution

Source: *"…or lest herself also should have anger, for discovering it thus late."* (Latin *ne et ipsa haberet malum, quod tam sero prodidisset*.)

Candidate: *"or because she feared her own anger at bringing it up so late."* — inverts agent and target.

Corrected: *"or **for fear that she herself would be in trouble** for bringing it up so late."*

Confirmed. The maidservant now fears consequences *falling on her* for having sat on the information, which is both the Latin sense and the only coherent reading. The incoherent "feared her own anger" is gone. ✓

Everything else in this long paragraph is byte-unchanged, including the two polarity-critical clauses the review verified (flattering friends corrupt / insulting enemies correct; and "you do not repay them for what you accomplish through them, but for what they themselves intended"). Re-checked against source: both still correct. ✓

### MODERATE 2 — idx 28 (P29), grief overflow

Source: *"…there flowed withal a mighty sorrow into my heart, **which was overflowing into tears**; mine eyes at the same time, by the violent command of my mind, drank up their fountain wholly dry; **and woe was me in such a strife! But** when she breathed her last…"*

Candidate: *"…was **on the point of** overflowing into tears… **and it was a wretched struggle for me. For** when she breathed her last…"*

Corrected: *"…a great sorrow flowed into my heart and **was overflowing into tears**; but at the same time my eyes, under the violent command of my mind, drank their fountain completely dry, **and how wretched I was in that struggle! But** when she breathed her last…"*

All three P29 findings fixed together, as the review recommended:

- **Intensity restored, not softened.** The tears *are* overflowing; the mind then forcibly dries the fountain. This is now an act of violent suppression, not a near miss. ✓ The verb is a bare past progressive — no hedge, no "almost", no "nearly". ✓
- **Exclamation restored.** "how wretched I was in that struggle!" carries the *vae mihi* force that "it was a wretched struggle for me" flattened. ✓
- **Connective restored.** "But when she breathed her last" — the boy's unrestrained cry now contrasts with Augustine's suppression instead of explaining it. ✓

This also repairs the long-range payoff: the dammed tears of P29 are released in P34 ("I let go of the tears I had been holding back, to overflow as freely as they wanted"), and both ends now use the language of overflow. The arc reads as one thing.

### MODERATE 3 — global quote style

See §4 for the independent scan. Summary: **zero** single-quote-as-quotation-mark usages remain anywhere in the file; the file now carries 34 double-quote characters across 8 paragraphs, all balanced; convention matches `book08-accepted.json`.

---

## 3. Minor spot-checks (re-derived from source)

All 17 minors were checked, not sampled. The four the task singled out first:

| idx | Review finding | Corrected text | Verdict |
|---|---|---|---|
| **23 (P24)** | "slightly touched" is a qualifier of **degree**, not duration | "we **barely touched her, for one instant,** with the whole reach of our hearts" | **FIXED.** Both dimensions now present: *barely* (degree, = Pusey's "slightly") and *for one instant* (duration, supported by P25's "that one moment"). The Augustinian modesty about the contact itself is back. ✓ |
| **24 (P25)** | "far lesser kind" imports a value judgment Pusey does not make | "and other visions of a **far different** kind be taken away" | **FIXED.** Pusey: "of kind far unlike". Difference-in-kind restored; the ranking is gone. ✓ |
| **33 (P34)a** | "died before my eyes" breaks the my-eyes/your-eyes antithesis | "the mother who **was, for that time, dead to my eyes**, who had for so many years wept for me, that I might live **in yours**" | **FIXED.** Pusey: "for the time was dead to mine eyes… that I might live in Thine eyes". The antithesis is restored *and* the false claim that he watched her die is removed. Note the second half also changed ("before yours" → "in yours"), which is required for the parallel to land — a correct dependent fix the review did not explicitly call for. ✓ |
| **33 (P34)b** | "Let whoever wants to read it" is a fragment | "**Let anyone who wishes read it**, and interpret it however he likes" | **FIXED.** Grammatical; matches Pusey's "Read it, who will, and interpret it, how he will." ✓ |
| **34 (P35)** | *vae* softened to "would be in trouble"; superlative added | "And **woe even to the praiseworthy life** of men, if you were to set mercy aside and examine it." | **FIXED.** Imprecation force restored ("woe"); "most admirable" → "praiseworthy", matching Pusey's *commendable* without the added superlative. Also tightened to Pusey's conditional shape. ✓ |
| **37 (P38)** | Exodus allusion generalized away | "sigh for **from their exodus until their return there**" | **FIXED** (see residual nit below). ✓ |

Remaining minors, all verified against source:

| idx | Was | Now | ✓ |
|---|---|---|---|
| 0 (P1) | "But through all those years" | "But **where**, through all those years" — double interrogative restored | ✓ |
| 3 (P4) | "even one more hour" | "even **one** hour" — Pusey's "even one hour" | ✓ |
| 6 (P7) | "as you had already rescued my heart" | "**from where** you had already rescued my heart" — *whence*, spatial claim restored | ✓ |
| 7 (P8) | "in a woman's body but a man's faith" | "in a woman's **dress but with** a man's faith" — *habitus* = dress/bearing, not body | ✓ |
| 13 (P14) | "our equal in grace" | "**of the same age as us** in grace" — *coaevum*, temporal not rank | ✓ |
| 14 (P15) | "bearing a great share" | "bearing **the leading part** in that anxiety and those vigils" — *primas partes*; Monica restored to the lead | ✓ |
| 18 (P19) | indirect reported advice | restored as a double-quoted direct quotation | ✓ (see nit) |
| 26 (P27) | "as if it were the happier outcome" | "**as the happier lot**" — narratorial doubt removed; the brother's view reported flatly | ✓ |

**No over-correction found.** Every changed span is confined to the flagged clause. I diffed each changed paragraph word-by-word against its candidate baseline: no paragraph acquired an unrelated rewrite, no clause was dropped, no new content was invented.

---

## 4. Mechanical gates (all run independently on `book09-corrected.json`)

| Gate | Result |
|---|---|
| **Valid JSON** | PASS — parses clean; keys `number`/`title`/`paragraphs` identical in shape to `book08-accepted.json`; `number: 9`, `title: "Book 9"`. |
| **Paragraph count** | PASS — 38, exactly matching source 38. One-to-one throughout. |
| **Question-mark parity** | PASS — per-paragraph `count('?')` diffed source vs corrected across all 38: **zero mismatches**. Totals **39 / 39**. |
| **Archaism scan** | PASS — zero hits across thou/thee/thy/thine/hath/hast/doth/dost/didst/shalt/wilt/unto/whence/whither/betwixt/ye/saith/perchance/aught + nill/willedst/hadst/liveth/sigheth/spake. |
| **Quote style (independent scan)** | PASS — see below. |
| **Word-count ratio** | PASS — no paragraph outside 0.85–1.30 of its source paragraph; nothing near the 75% floor. No compression. |
| **Whitespace / debris** | PASS — no leading or trailing whitespace, no double spaces, no empty paragraphs, no `[ ]`, no ellipses, no editorial markers. Matches `book08-accepted.json` conventions. |
| **Proper-noun consistency** | PASS — Cassiciacum ×1 (no "Cassiacum"), Monica ×1 (no "Monnica"), Nebridius ×4, Verecundus ×3, Euodius ×2, Adeodatus ×2. Augustine's brother still correctly unnamed. |

### Independent quote-style scan (not limited to the review's flagged paragraphs)

I scanned **every** `'` character in all 38 paragraphs and classified each by surrounding context, then repeated with a pattern targeting quotation-mark positions specifically (`'` not flanked by letters on the relevant side).

- **26 `'` characters total.** All 26 are apostrophes: 25 possessives (including 5 plural possessives — `liars'`, `sons'`, `parents'` ×2, `husbands'`) and 1 contraction (`don't`, idx 26). **Zero are quotation marks.**
- **34 `"` characters**, in 8 paragraphs (idx 16, 18, 23, 25, 26, 27, 29, 32). Every paragraph's count is even; file total 34 is even. No unbalanced or orphaned quote.
- **Zero** curly quotes, guillemets, or other quote characters anywhere (`“ ” ‘ ’ « »` all absent).
- Benchmark: `book08-accepted.json` has 80 `"` and, on the same scan, zero single-quote-as-quotation-mark usages (its only bare `'` is the plural possessive `Manichees'`). **Book 9 now matches the accepted convention exactly.**

The review's charge that the *drafter's original self-check* falsely claimed double quotes is confirmed as having been a real defect in the candidate; it is now genuinely resolved in the corrected file, verified by my own scan rather than by the corrections log's assertion.

---

## 5. Whole-chapter read-through

Read straight through, as a reader.

**It holds, and it is now better than the candidate at exactly the places that mattered.**

- **Baptism / Adeodatus (P14).** Unchanged except "of the same age as us in grace". The awe and the guilt still sit in the same paragraph without the translator picking a side: "I had no part in that boy but the sin" / "That gift filled me with awe" / "And who but you could be the maker of such wonders?" / "Soon you took his life from the earth; and I remember him now without anxiety." No flattening. *The Teacher* stands, correctly.
- **Ostia (P23–P26).** The ascent still rises by the same ten steps and the descent is still felt as a loss ("returned to the sound of our own voices, where a spoken word has a beginning and an end"). The two corrections here *increase* fidelity without touching the architecture: "barely touched her, for one instant" restores Augustine's modesty about the contact, and "far different kind" removes an imported ranking from the great suspended conditional of P25, which remains one unbroken sentence. The tense paradox ("having been" and "going to be" do not apply to her at all, but only "being") survives intact and unresolved — and now in proper double quotes, which reads cleaner than the candidate's scare-quoted singles. Monica's window speech (P26) in double quotes now sits typographically level with the deathbed speeches, which the candidate's mixed styling did not.
- **Monica's death (P27).** Quiet and fast, as Pusey is. The removal of "as if it were the happier outcome" matters more than its size: the brother's wish is now reported straight, and Monica's silent correcting glance carries the judgment, as it should.
- **The grief sequence (P29–P34).** This is where the corrections pay off. P29 now opens hot — tears already flowing, forcibly dried, "how wretched I was in that struggle!" — and the "But" hands the paragraph to Adeodatus's unrestrained cry as a contrast. That beat was the one audibly cool patch in the candidate and it is gone. From there the chain runs correctly and unresolved: the doubled grief in P31, the refused prayer and the failed bath in P32 ("I bathed, and was the same person I had been before I bathed"), then the release in P34 with the restored "dead to my eyes… live in yours" antithesis. Neither pole of the argument is resolved away; the suppression is never confessed as an error and the weeping is never defended.
- **Closing prayers (P35–P38).** "Woe even to the praiseworthy life of men" restores the register of the whole final movement — without it, P35 read as legal caution rather than dread. P36–P37 are unchanged and remain unambiguously intercessory. P38's "from their exodus until their return there" restores the allusion.

**Seams:** none. I read the boundaries of all 20 changed spans specifically looking for register breaks or repaired-clause stiffness. Every replacement sits in the surrounding syntax; none reads as patched. The three P29 fixes in particular read as one sentence, not three repairs.

**Flattening:** none found. No rhetorical question converted to a statement, no long periodic sentence chopped, no exclamation demoted.

---

## 6. Residual observations (non-blocking, no round needed)

1. **idx 37 — "exodus" lowercase.** The allusion is restored but decapitalized. Pusey has "their *Exodus*". Capitalizing would sharpen the reference to the book/event rather than a generic setting-out. Cosmetic, one character; not worth another round on its own.
2. **idx 18 — direct-quote person shift.** Pusey's quotation is 3rd-person-inside-quotes ("That from the time **they** heard…"), a 19th-century convention artifact. The correction renders it as natural 2nd-person direct address ("From the moment **you** hear the marriage contract read aloud to **you**, think of it as…"). This is the right modern-English move and loses no content — but it is a rewrite, not a mechanical requoting, and worth recording as a deliberate editorial choice.
3. **idx 15 — "did we not run after you."** A question-shaped clause punctuated as a statement. This is *correct* (Pusey has a period; the review verified it; question-mark parity depends on it), but a reader may stop for half a beat. Unchanged from the candidate, which the review passed. Flagging only so it is not "discovered" as a defect later.

None of these is a correctness error and none touches the classes of defect this repair pipeline exists to catch.

---

## 7. Verdict

**READY — Book 9 is editorially accepted.**

- True diff set independently re-derived and matches: 20 paragraphs, `[0, 3, 5, 6, 7, 13, 14, 16, 17, 18, 23, 24, 25, 26, 27, 28, 29, 33, 34, 37]`.
- 1 major: **confirmed fixed**, verified for tense, referent, and non-contradiction with the following sentence.
- 3 moderates: **all confirmed fixed**, including the global quote conversion verified by my own full-file scan rather than by the flagged-paragraph list.
- 17 minors: **all confirmed fixed**, with the four highest-value ones (touch degree, difference-in-kind, my-eyes/your-eyes, imprecation force) checked clause-by-clause against Pusey.
- 18 untouched paragraphs: **byte-identical** to the frozen candidate. Zero over-correction, zero collateral edits.
- All mechanical gates pass: 38 paragraphs, 39/39 question-mark parity with zero per-paragraph mismatches, zero archaisms, valid JSON, zero single-quote-as-quotation-mark usages anywhere, whitespace and proper nouns clean, convention-matched to `book08-accepted.json`.
- Whole-chapter read: full intensity throughout the Ostia vision and Monica's death, no new seams, no flattening; the chapter's coolest beat (P29) is repaired and the P29→P34 tear arc now lands.

No further round required. Promote `book09-corrected.json` to `book09-accepted.json`.
