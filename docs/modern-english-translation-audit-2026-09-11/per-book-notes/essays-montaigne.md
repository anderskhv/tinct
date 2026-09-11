# essays-montaigne — Essays, Michel de Montaigne

**Scope:** public. Audited 2026-09-11. **12 passages inspected.**

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `2d7353e85164e3a1` | 107 | 4,897 | 477,531 | "Cotton/Hazlitt (1877)", translator `Charles Cotton, ed. William Hazlitt`, year `1877` |
| modern-en | `b9a1d95cff1ad62b` | 107 | 4,897 | 467,978 | "Modern English" |
| modern-da | `2648f8229519686a` | 107 | 4,897 | 463,080 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.6961**, identical
long paragraphs **1.1%**, **3 truncation flags** (ch 99 ¶34, ch 99 ¶180, ch 102 ¶10), 0 empty
paragraphs, 0 paragraph-count mismatches, `en_editions_aligned: true`.

Provenance of the core English text: **Charles Cotton's 1685 translation as revised and edited by
William Carew Hazlitt, 1877** — the standard Project Gutenberg Montaigne. Complete: all three Books,
107 essays, with Hazlitt's bracketed footnote translations of the Latin/Greek verse and his
editorial notes carried inline as their own paragraphs. Public domain. Registry attribution is
correct.

## THE CENTRAL QUESTION: is the May 2026 failure actually repaired?

`books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23) recorded essays-montaigne as **107/107 chapters
MECHANICAL** — zero real modernization. **That state no longer exists.**

I recomputed length-weighted per-chapter similarity across all 107 essays myself:

- **No essay is above 0.800.** Range: 0.488 (II.45, "Of the battle of Dreux") to 0.800 (II.19, "Of
  liberty of conscience"). Mean 0.696.
- Nothing anywhere near the ≥0.95 mechanical band. The distribution is tight and uniform — the four
  giant essays that carry most of the word count are 0.732 (Apology for Raimond Sebond, 75,244 w),
  0.734 (Upon some verses of Virgil, 25,025 w), 0.761 (Of vanity, 25,557 w) and 0.763 (Of
  experience, 24,820 w).
- Only 1.1% of long source paragraphs are byte-identical.

The repair covers the full length. I read from Book I (essays 1, 19, 30), Book II (essays 12
[Apology, at ¶2, ¶330 and ¶651 — beginning, middle and end of a 660-paragraph essay], 19), and
Book III (essays 5 [Virgil, two places], 8 [Art of conference], 13 [Of experience, at its closing
paragraphs]). All are genuine rewrites.

### Is it actually THIS book (the "filled from an unrelated source" failure mode)?

**No sign of it.** Checks performed:

1. Automated proper-noun retention per essay: **median 0.891**, minimum 0.731. Montaigne is one of
   the densest proper-noun texts imaginable (Scanderbeg, Pelopidas, Epaminondas, Phyton, Pontia
   Posthumia, Tching-thang…) and the modern file carries them paragraph-for-paragraph.
2. The classical quotation apparatus is preserved *in place* — see finding 2 below. A file filled
   from some other text could not reproduce Hazlitt's own footnote paragraphs with their exact
   Horace/Cicero/Propertius/Lucretius citations, in the same paragraph slots.
3. Hazlitt's *editorial* notes about Montaigne's biography (e.g. the Leclerc note on the Master of
   the Sacred Palace censuring the Emperor Julian chapter in 1581) survive as their own paragraphs.

## Samples inspected (12)

### 1. Opening — I.1 "That men by various ways arrive at the same end", ¶0–5

SRC ¶3: *"…a sight at which the emperor was so pleased, that, ravished with the generosity of the
action, he wept for joy…"*
MOD ¶3: *"Whereupon they, magnanimous, hoisted their husbands and children — and the duke himself —
onto their shoulders and carried them out. The emperor, ravished by the generosity of it, wept for
joy…"*

**Finding — strong prose, one restraint slip.**
SRC ¶1: *"Edward, Prince of Wales (the same who so long governed our Guienne…)"*
MOD ¶1: *"Edward, Prince of Wales — **the Black Prince**, who long governed our Guienne…"*
"The Black Prince" is not in Cotton/Hazlitt and not in Montaigne. It is a correct and helpful
identification, but the standard is explicit that added historical facts are out of bounds. This is
the only invention I found in twelve passages, and it is a two-word epithet.

Otherwise the essay is complete: the Conrad III / Guelph story, the Stoic aside on pity, the
Pelopidas/Epaminondas contrast, the Dionysius/Phyton torture, the Pompey/Zeno vs. Sylla comparison —
all present with their logical relations intact (*"resisting one without yielding, and being shaken
and subdued by the other"*).

### 2. I.19 "That to study philosophy is to learn to die", ¶8–15 — the Latin-quotation test

SRC ¶9: *"“Quae, quasi saxum Tantalo, semper impendet.”*
MOD ¶9: *"Quae, quasi saxum Tantalo, semper impendet."*
SRC ¶10: *"[“Ever, like Tantalus stone, hangs over us.” --Cicero, De Finib., i. 18.]"*
MOD ¶10: *"[\"Ever, like Tantalus' stone, it hangs over us.\" — Cicero, De Finib., i. 18.]"*

**Finding — strong; this is the correct handling and it is applied consistently.** The Latin is
preserved **verbatim** in its own paragraph; Hazlitt's bracketed English rendering is preserved in
its own paragraph *with the full citation* (author, work, book, section). The same pattern holds at
Horace *Od.* iii.1.18, at Propertius ii.8.3, at Cicero *De Finib.* i.8, and at the closing Horace
*Od.* i.31.17 of the whole book. Montaigne's quotations are not paraphrased away, not translated
into the running text, and not stripped of attribution. This was the single biggest risk for this
book and the edition handles it correctly.

### 3–4. II.12 "Apology for Raimond Sebond" — beginning (¶2–3), middle (¶330–331), end (¶650–653)

This 75,244-word essay is 16% of the book. All three probes are genuine rewrites, and its
similarity (0.732) sits at the book's centre — no evidence of a "front-loaded" repair.

MID, ¶331: *"…when they say “I doubt,” they are presently taken by the throat, to make them confess
that at least they know and are assured that they do doubt… This fancy will be more certainly
understood by interrogation: “What do I know?” as I bear it with the emblem of a balance."*
MOD ¶331: *"…when they say \"I doubt,\" they are at once seized by the throat to make them confess
that at least they know and are sure they do doubt… The fancy will be more surely caught by
interrogation: \"What do I know?\" — which I bear as my motto, with the emblem of a balance."*

**Finding — strong.** The Pyrrhonist argument, the liar paradox, the rhubarb analogy and *Que
sais-je?* all survive with the logic intact. "as I bear it with the emblem of a balance" is
expanded to "which I bear as my motto, with the emblem of a balance" — a two-word clarification of
a genuinely opaque English clause, accurate to the fact (it was his device).

Hazlitt's own editorial footnote paragraph survives: SRC ¶330 *"* Montaigne here refers to the
controversies between the Catholics and Protestants about transubstantiation."* → MOD ¶330
*"* Montaigne is referring to the controversies between Catholics and Protestants over
transubstantiation."*

**LATE, ¶650–653 — the one real literary-form change in the book.** Hazlitt renders the Lucretius
passages as rhymed English verse; the modern edition replaces the verse with accurate prose.

SRC ¶653: *"“But lastly, as in building, if the line / Be not exact and straight, the rule decline,
/ Or level false, how vain is the design! / Uneven, an ill-shap'd and tottering wall / Must rise;
this part must sink, that part must fall, / Because the rules were false that fashion'd all; / Thus
reason's rules are false if all commence / And rise from failing and from erring sense.”*
MOD ¶653: *"And so as in building, if the first measure is crooked, if the square is false in the
right angles, and if the level limps in any part, everything must come out faulty, lopsided,
leaning, sloping, sagging, and out of line — roofs that look like they want to fall, and do fall,
all betrayed by faulty first judgments. Just so your reasoning about things must necessarily be
crooked and false, if it has arisen from false senses."*

The modern prose is *closer to the Latin* than Hazlitt's rhyme is, and the Latin itself (¶652) is
preserved verbatim — including silent repair of two OCR corruptions in the source Latin
("videantux'velle"→"videantur velle", "reram"→"rerum"). But Hazlitt's verse *was* verse, and the
reader now gets prose. Net: a defensible trade, recorded as a voice cost rather than a fidelity
one.

### 5. I.30 "Of cannibals", ¶3–4

SRC ¶3: *"It is very likely that this extreme irruption and inundation of water made wonderful
changes and alterations in the habitations of the earth…"*
MOD ¶3: *"It is very likely that this enormous burst and inundation of water worked wonderful
changes in the layout of the earth…"*

**Finding — strong.** The Virgil quotation (¶4, *"Haec loca, vi quondam et vasta convulsa ruina…"*)
is preserved verbatim.

### 6. II.19 "Of liberty of conscience", ¶1–3 — the book's **highest**-similarity essay (0.800)

SRC ¶1: *"…by which the learned suffered an exceeding great loss…"*
MOD ¶1: *"…by which the learned suffered an **excessive great loss**…"*

**Finding — the book's weakest sample, and it contains an outright grammar regression.** "An
exceeding great loss" is correct (if archaic) English; "an excessive great loss" is not English at
all. This is a mechanical `exceeding`→`excessive` substitution applied without reading the phrase.
Elsewhere in the essay the edit is light but sound ("who made for us"→"who favoured us", "evidently
manifest"→"plainly seen"), and Hazlitt's long Leclerc footnote (¶3) is carried over essentially
verbatim, which is correct — it is already modern editorial English.

Even this, the least-transformed essay in the book, is still at 0.80, i.e. genuinely edited. There
is no mechanical band here at all.

### 7–8. III.5 "Upon some verses of Virgil", ¶33–35 and ¶179–181 — **two of the three Phase 1 truncation flags**

SRC ¶34: *"[“When the mind is languishing, the body is good for nothing.” **(Or:)** “It rises to no
effort; it languishes with the body.” --Pseudo Gallus, i. 125.]"* (26 w)
MOD ¶34: *"[\"It rises to no effort; it languishes with the body.\" — Pseudo-Gallus, i. 125.]"* (14 w)

SRC ¶180: *"[“No enmities are bitter, save that of love.” **(Or:)** “No hate is implacable except
the hatred of love” --Propertius, ii. 8, 3.]"* (22 w)
MOD ¶180: *"[\"No hatreds are bitter except those of love.\" — Propertius, ii. 8, 3.]"* (13 w)

**Finding — flags CONFIRMED as real text loss, but the loss is editorial variant glosses, not
Montaigne.** In both cases Hazlitt's footnote offers *two alternative English renderings of the same
Latin line* separated by "(Or:)". The modern edition keeps one and drops the other. Nothing
Montaigne wrote is missing; the Latin itself (¶33, ¶179) is preserved verbatim in both cases, and
the citation is preserved. Arguably an improvement for a reading edition. Recorded as a deliberate,
harmless, and consistent editorial policy — not as an omission.

Surrounding prose (¶181, the Octavius/Pontia Posthumia jealousy passage) is a full, faithful
rewrite.

### 9. III.8 "Of the art of conference", ¶9–11 — **the third truncation flag**

SRC ¶10: *"[“Neither can a man dispute, but he must contradict.” **(Or:)** “Nor can people dispute
without reprehension.” --Cicero, De Finib., i. 8.]"* (21 w)
MOD ¶10: *"[\"Nor can people dispute without reprehension.\" — Cicero, De Finib., i. 8.]"* (12 w)

**Finding — same pattern, same verdict.** All three Phase 1 truncation flags in this book are the
identical "(Or:)" double-gloss case. There is no truncation of Montaigne's own prose anywhere in
the flag list.

¶11 is a first-rate sample of the modern edition at its best, and of Montaigne's self-interrupting
voice surviving: *"I welcome and embrace truth wherever I find it, and surrender to it cheerfully,
opening my conquered arms as soon as I see it coming. And, provided it isn't done too imperiously,
I take pleasure in being corrected, and accommodate myself to my accusers — very often more out of
civility than out of any sense that I need amending — gladly nourishing the freedom to admonish me
by how easily I submit to it, even at my own expense."* The parenthetical self-qualification, the
dash-interruption and the confession of vanity-in-humility are all retained; the sentence is not
straightened into a linear modern topic sentence.

### 10. III.13 "Of experience", ¶236–239 — the closing passage of the whole book

SRC ¶237: *"“By so much thou art a god, as thou confessest thee a man.” 'Tis an absolute and, as it
were, a divine perfection, for a man to know how loyally to enjoy his being… **'Tis to much purpose
to go upon stilts**, for, when upon stilts, we must yet walk with our legs; and when seated upon the
most elevated throne in the world, we are but seated upon our breech."*
MOD ¶237: *"\"By so much are you a god, as you confess yourself a man.\" It is an absolute, and as
it were divine, perfection for a man to know how to enjoy his being lawfully… **It is to no purpose
to go on stilts**, for, when on stilts, we still have to walk with our legs; and when seated on the
most elevated throne in the world, we are still only seated on our backside."*

**Finding — strong; and one interpretive resolution worth logging.** The book's most famous close
is complete, the image (stilts, throne, backside) is kept as an image, and the Horace *Od.* i.31.17
envoi with its bracketed translation and citation closes the file exactly as in the source. The
change "to much purpose" → "to no purpose" resolves what is almost certainly a corrupt or ironic
clause in the transmitted English in favour of the sense Montaigne's French carries. Defensible, but
it is the modern editor deciding a textual crux silently.

### 11–12. Additional probes

III.5 ¶181 and II.12 ¶651 (the tree-sap / trumpet / senses argument, 293 → 296 words) are counted
above as part of samples 7 and 4 respectively; both are complete, clause-for-clause rewrites with
the argumentative connectives ("Moreover, since…", "Now since…", "Where the compass, the square,
and the rule are crooked…") preserved intact.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| mean similarity 0.6961 "verified repair band" | **Confirmed as a real repair** by 12 read passages across all three Books, including three probes into the 75k-word Apology. No essay exceeds 0.800. |
| 3 truncation flags (99 ¶34, 99 ¶180, 102 ¶10) | **Confirmed as real word-count loss, disconfirmed as content loss.** All three are Hazlitt "(Or:)" double-glosses of the same Latin line, reduced to a single rendering. Latin and citation preserved in all three. |
| 1.1% identical long paragraphs | **Confirmed** — the only near-identical material I found was Hazlitt's modern editorial footnotes, which correctly need no change. |
| 0 paragraph-count mismatches / 0 empty paragraphs | **Confirmed** in every sample. |
| `books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23): "107/107 MECHANICAL" | **Disconfirmed as a current description.** Historical record only. |
| Possible fill-from-unrelated-source | **Disconfirmed** — 0.891 median proper-noun retention; Latin quotations, citations and Hazlitt's own editorial notes all preserved in their exact paragraph slots. |
| Classical quotations / Latin handling (brief's specific concern) | **Disconfirmed as a problem** — see sample 2. Handled correctly and consistently. |
| Digressive first-person voice flattened into linear modern essay (brief's specific concern) | **Disconfirmed** — see sample 9. Self-interruption, parenthesis and qualification survive. |

## Phase 3 — human-edition research

**Rights of the current core text.** Cotton (1685) / Hazlitt (1877) is public domain; it is the
Project Gutenberg standard text. No issue.

**Is Cotton/Hazlitt itself accessible enough to stand alone?** No. There are eight complete English
Montaignes — Florio (1603), Cotton (1685), Ives (1925), Trechmann (1927), Zeitlin (1934), Frame
(1943/1957), Cohen (1958), Screech (1991). Of the historical ones, commentary is consistent that
Hazlitt's 1877 Cotton *"often reads like a slog… dense run-on sentences and inverted forms that seem
stuffy and overly formal, feeling very Victorian"*
(<https://ianchadwick.com/blog/translating-montaigne/>). That matches what I read in the source
column above. A modern edition is justified for this book.

**Candidates examined:**

1. **George B. Ives, Harvard University Press, 1925** — complete (3–4 vols), scholarly, once
   described as the first thoroughly satisfactory English rendering. **Rights: public domain in the
   US** (published before 1929; Wikisource states *"This work is in the public domain in the United
   States because it was published before January 1, 1931"*), and Ives d. 1930, so PD in the EU as
   well. **Accessed and read**: Wikisource
   <https://en.wikisource.org/wiki/Ives_The_Essays_of_Montaigne/Volume_1/Chapter_1>. Sample: *"The
   most usual way to soften the hearts of those we have offended, when, having vengeance in their
   hand, they hold us at their mercy, is to move them by submission to commiseration and pity…
   beginning with those three, he **shewed** mercy to all the other inhabitants of the city."*
   **Verdict: rights-clear but not an improvement.** It is as Victorian-flavoured as Hazlitt
   ("shewed", the long periodic frames) and no clearer than our existing modern-en. Additional
   blocker: the Wikisource transcription is **incomplete** — only Volume 1 is finished
   (<https://en.wikisource.org/wiki/Ives_The_Essays_of_Montaigne>); Volumes 2–4 exist as page images
   at HathiTrust (<https://catalog.hathitrust.org/Record/001360917>) and would need OCR,
   proofreading and paragraph alignment.

2. **HyperEssays contemporary translation (Sebastian Biot, 2020–)** —
   <https://hyperessays.net/>. A genuinely modern English Montaigne, purpose-built as a reading
   edition, gradually replacing the Cotton/Hazlitt base. **Rights: explicit and explicitly
   blocking** — *"HyperEssays's translation is openly licensed via CC BY-NC-SA (Attribution,
   NonCommercial, ShareAlike) 4.0"*. The **NonCommercial** clause rules it out for Tinct, which is a
   paid product; ShareAlike would additionally infect our derived Danish edition. Also
   **incomplete**: the project began 2020 and the site itself says it "likely won't be completed for
   many years" — the 107 essays listed are the Cotton/Hazlitt base being progressively replaced,
   not 107 finished modern translations. Record as **noncommercial restriction**, and as the single
   best candidate to revisit *if* Biot would license commercially.

3. **Donald Frame (1943/1957, Stanford)** and **M. A. Screech (1991, Penguin)** — the two standard
   modern scholarly Montaignes; Screech in particular is described as "a meticulous translation of
   the Essays in plain, contemporary English". Both in copyright, both in commercial print,
   **permission required**. Not accessed.

4. **Florio (1603)** — PD, magnificent, and far harder than Cotton/Hazlitt. Not a candidate for
   accessibility.

**Conclusion:** no complete, readable, rights-clear human English Montaigne is available. The best
rights-clear candidate (Ives) is neither more readable than our modern-en nor fully transcribed;
the best readable open candidate (HyperEssays) is NonCommercial and unfinished. "None found in this
search" — I am not claiming none exists.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **5** — 12 passages across all three Books, including three probes into the 75k-word Apology; nothing dropped, Latin and citations intact, all 3 truncation flags accounted for as editor's-variant glosses |
| first-read clarity | 25% | **4** — consistently clearer than Hazlitt; the light band (II.19 at 0.800) still leaves some Victorian rhythm |
| literary voice | 20% | **4** — digression, self-interruption, first-person qualification and the essayistic swerve all survive; Hazlitt's verse renderings are converted to prose |
| restraint / no invention | 10% | **4** — one added epithet ("the Black Prince"); one silent resolution of a textual crux ("to much"→"to no purpose") |
| naturalness | 5% | **4** — fluent throughout, but "an excessive great loss" (II.19 ¶1) is a real grammatical regression produced by a word-level substitution |

**Weighted score: 4.4 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT.** Confidence: **medium-high**. Estimated correction scope: **local**.

The May 2026 catastrophe is genuinely and comprehensively repaired across all three Books,
including deep inside the 75,000-word Apology — this is the thing the batch needed to establish,
and it is established. There is no recurring defect and no substantive omission.

What keeps this off an unqualified KEEP is small and specific:
1. Remove the invented epithet "the Black Prince" (I.1 ¶1) — the standard forbids added historical
   facts, however helpful.
2. Fix "an excessive great loss" → "an exceedingly great loss" (II.19 ¶1), and sweep for other
   `exceeding`→`excessive` substitutions.
3. Decide as policy whether Hazlitt's "(Or:)" double-glosses should be halved (currently they are;
   3 instances flagged mechanically, likely a few more below the flag threshold). Either answer is
   defensible — it just should be a decision.
4. Optional: restore verse form in the Lucretius/Horace renderings inside the Apology, or accept
   prose as house style.

No retranslation. No rights-clear human alternative exists to switch to.

## Limitations of this review

- 12 passages out of 4,897 paragraphs. This supports "strong in samples spread across all three
  Books"; it is **not** a verification of the whole book.
- The Apology (660 paragraphs) got three probes. That is enough to disconfirm "front-loaded repair"
  but not enough to certify a 75,000-word essay.
- I confirmed all 3 mechanically flagged truncations but did not audit the "(Or:)" pattern
  exhaustively — there are likely more instances below the 60%-ratio flag threshold.
- I did not check modern-da.
- I did not read Frame or Screech; their assessment here is second-hand and used only to establish
  that they are rights-blocked.
- The Ives assessment rests on one essay read at Wikisource, not the whole translation.
