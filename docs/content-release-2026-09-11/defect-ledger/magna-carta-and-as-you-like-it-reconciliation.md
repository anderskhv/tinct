# Defect-ledger reconciliation — `magna-carta` and `as-you-like-it`

**Date:** 2026-09-11
**Author:** content-QA reconciliation pass
**Trigger:** independent review of `docs/modern-english-translation-audit-2026-09-11/` raised two
corrections that had to be checked against the actual edition files rather than against the prior
audit's prose:

1. *"The local Magna Carta contains later-clause material; do not repeat 'clauses 51–63 entirely
   missing' without reconciling the actual text."*
2. *"Copyright boilerplate inside Shakespeare is reading-text contamination; it does not by itself
   establish copyright in Shakespeare's underlying text."*

**Method:** every paragraph of `magna-carta-original-en.json` and `magna-carta-modern-en.json` read
in full (74 paragraphs each); `as-you-like-it-original-en.json` / `-modern-en.json` / `-modern-da.json`
structurally enumerated (17 chapters / 901 paragraphs each) with targeted paragraph reads. Ground
truth pulled live from the British Library–credited Davis translation (Salisbury Cathedral's
BL-courtesy reproduction, the University of Minnesota Law Library's Portico copy, MoAD Australia),
Wikisource's *Magna Carta (trans. Davis)*, Wikisource's Henderson 1892, Project Gutenberg #1523 and
#1786, and Standard Ebooks.

**Scope discipline:** nothing under `app/` was modified. This document is evidence only.

Throughout, two questions are kept apart:

- **Q-RIGHTS** — may Tinct lawfully distribute this text commercially?
- **Q-COMPLETENESS** — is the text we ship actually the whole, correct work?

They have different answers per book, and the prior audit's single `BLOCKED` verdict collapsed them.

---

# 1. `magna-carta`

Files examined (all read, not sampled):

| file | chapters | paragraphs |
|---|---|---|
| `app/public/data/editions/magna-carta-original-en.json` | 1 (`"Magna Carta"`) | 74 |
| `app/public/data/editions/magna-carta-modern-en.json` | 1 (`"Magna Carta"`) | 74 |
| `app/public/data/editions/magna-carta-modern-da.json` | 1 (`"Magna Carta"`) | 74 |

Registry: `app/src/data/bookRegistry.ts:2685–2717` — `label: 'English Translation'`, `year: 1215`,
no translator field on any edition, `hasAudio: true` on `original-en` and `modern-en`.

## 1.1 CORRECTED: clauses 51–63 are **present in full**. Only their *numbers* are missing.

This is the correction the independent review asked for, and it is upheld.

The prior audit's numbered defect list did say "clause **numbers** (51)–(63) are gone" (per-book-notes
line 55), but its headline, its ratings note ("a charter missing 13 clause numbers"), its Phase 1
section ("missing clause numbers 51–63") and its Recommendation ("have lost the clause numbering for
51–63") were read downstream as *content* loss. **They are not content loss.** Every clause of the
1215 charter is present, in the standard 1–63 numbering, as follows.

### Paragraph → clause map, `magna-carta-original-en.json`, chapter 1

| para(s) | clause | inline number printed? | status |
|---|---|---|---|
| 0 | Preamble (John's style + witness list) | n/a | present |
| 1 | 1 (first half — English Church free) | `(1)` | present |
| 2 | 1 (second half — "TO ALL FREE MEN OF OUR KINGDOM…") | none | present; split from ¶1 |
| 3–49 | 2 … 48 | `(2)` … `(48)` | present, one clause per paragraph |
| 50 | **49 and 50 in one paragraph** | `(49)` and `(50)` | present; **merged**, and 50 is **corrupted** (§1.2) |
| 51 | 51 | — | present, unnumbered |
| 52 | 52 | — | present, unnumbered |
| 53 | 53 | — | present, unnumbered; punctuation stripped (§1.3) |
| 54 | 54 | — | present, unnumbered |
| 55 | 55 | — | present, unnumbered |
| 56 | 56 | — | present, unnumbered |
| 57 | 57 | — | present, unnumbered |
| 58 | 58 | — | present, unnumbered |
| 59 | 59 | — | present, unnumbered |
| 60 | 60 | — | present, unnumbered |
| 61–68 | **61** (the security clause), split across 8 paragraphs | — | present in full, unnumbered |
| 69–70 | **62**, split across 2 paragraphs | — | present, unnumbered; date phrase altered (§1.3) |
| 71–73 | **63**, split across 3 paragraphs | — | present, unnumbered |

`modern-en` is paragraph-for-paragraph identical in structure: inline numbers run `(1)`…`(48)` at
¶1–¶49, `(49)`+`(50)` together at ¶50, and ¶51–¶73 carry no numbers. Verified mechanically — the
regex sweep for `(\d+)` over `modern-en` returns exactly ¶1–¶50 and nothing after.

### Spot-verification of the high-stakes later clauses

- **Clause 39** — `original-en` ¶40, numbered `(39)`:
  > "No free man shall be seized or imprisoned, or stripped of his rights or possessions, or outlawed
  > or exiled, or deprived of his standing in any other way, nor will we proceed with force against
  > him, or send others to do so, except by the lawful judgement of his equals or by the law of the
  > land."

  Word-for-word the BL/Davis text. `modern-en` ¶40 differs only in adverb order ("proceed against him
  with force") and `judgement`→`judgment`. **Intact.**

- **Clause 61, the security clause / council of 25** — `original-en` ¶61 opens:
  > "SINCE WE HAVE GRANTED ALL THESE THINGS for God, for the better ordering of our kingdom, and to
  > allay the discord that has arisen between us and our barons… we give and grant to the barons the
  > following security:"

  ¶62: "The barons shall elect twenty-five of their number…". ¶63 carries the full forty-day
  distraint procedure ("…they shall come to us — or in our absence from the kingdom to the chief
  justice… may distrain upon and assail us in every way possible, with the support of the whole
  community of the land, by seizing our castles, lands, possessions, or anything else saving only our
  own person and those of the queen and our children…"). ¶64 the oath, ¶65 replacement of a dead
  baron, ¶66 majority verdict, ¶67 the twenty-five's own oath, ¶68 the anti-procurement undertaking.
  Against the BL text this is **the complete clause 61, nothing dropped** — just broken into eight
  display paragraphs with the `(61)` marker lost.

- **Clause 63, the final clause** — `original-en` ¶71–73:
  > ¶71 "IT IS ACCORDINGLY OUR WISH AND COMMAND that the English Church shall be free…for ever."
  > ¶72 "Both we and the barons have sworn that all this shall be observed in good faith and without
  > deceit. Witness the above mentioned people and many others."
  > ¶73 "Given by our hand in the meadow that is called Runnymede, between Windsor and Staines, on
  > the fifteenth day of June in the seventeenth year of our reign."

  Matches the BL clause 63 verbatim (BL prints it as one clause; Tinct splits it in three).
  **Complete. The document does end where it should.**

### Corrected finding

> **Clause content 1–63 is complete.** What is missing is the *editorial numbering* of clauses 51–63
> and of the second halves of clauses 1, 61, 62 and 63, plus the separation of clause 49 from clause
> 50. For a legal instrument cited by clause number this is still a real defect — a reader told to
> "look at clause 61" cannot find it — but it is a **navigation/labelling defect, not a missing-text
> defect**, and it must not be reported as "clauses 51–63 are missing."

Note also (and this softens the defect further): the British Library's own presentation states that
"although the clauses have been numbered in the translation, the original version does not include
numbers and the text reads continuously." Clause numbers are an editorial convention over an
unnumbered 1215 charter. Their absence degrades citability; it does not make the document incomplete.

## 1.2 CONFIRMED and now *mechanically explained*: clause 50 is corrupted

The prior audit's clause-50 finding is **confirmed** and can now be stated with certainty rather than
as an inference.

`original-en` ¶50, second sentence:
> "(50) We will remove completely from their offices the kinsmen of Gerard de Ath, Peter, Guy, and
> Andrew de Chanceaux, Guy de Cigogne, and in future they shall hold no offices in England. The
> people in question are Engelard de Cigogn, Geoffrey de Martigny and his brothers, Philip Marc and
> his brothers, with Geoffrey his nephew, and all their followers."

British Library / Davis (verified against three independent BL-credited reproductions):
> "(50) We will remove completely from their offices the kinsmen of Gerard de Athée, and in future
> they shall hold no offices in England. The people in question are Engelard de Cigogné, Peter, Guy,
> and Andrew de Chanceaux, Guy de Cigogné, Geoffrey de Martigny and his brothers, Philip Marc and his
> brothers, with Geoffrey his nephew, and all their followers."

**Root cause, proved bit-for-bit.** Take the BL string, split it on the character `é`, swap segments
1 and 2, and drop the three `é` delimiters. The result is *byte-identical* to Tinct's ¶50:

```python
S   = BL_clause_50.split("é")          # 4 segments, from "Athée" / "Cigogné" / "Cigogné"
recon = S[0] + S[2] + S[1] + S[3]      # segments 1 and 2 transposed, delimiters discarded
recon == tinct_para_50_after_"(50) "   # -> True
```

This is not an editorial error and not a transcription error. It is a **botched character-encoding
repair**: some intermediate tool tokenised the paragraph on its non-ASCII characters and reassembled
the tokens in the wrong order. Three consequences follow:

1. It proves beyond argument that Tinct's copy descends from a rendering of the Davis text **that
   still had the accents in it** — i.e. the British Library web/Portico presentation, not a
   pre-stripped ASCII source.
2. The semantic damage is real and substantive: as shipped, Tinct tells the reader that the Chanceaux
   brothers and Guy de Cigogné are *kinsmen of Gerard de Athée who are being removed*, when in the
   actual charter they are named individuals in the enumerated list. Tinct misstates who a
   foundational legal document expels from office.
3. `modern-en` ¶50 "repaired" the accents (`de Athée`, `de Cigogné`) but **preserved the
   transposition** — so the modern edition polished the spelling of a sentence whose sense is wrong.
   Confirmed verbatim in `magna-carta-modern-en.json` ¶50.

**Verdict: prior audit CONFIRMED, with the mechanism now established.**

## 1.3 REFINED: the other encoding casualties

The same non-ASCII-stripping damage shows up in exactly the paragraphs the prior audit half-caught.
A sweep of `original-en` for non-ASCII characters shows curly quotes (`‘ ’`) surviving in ¶1, 3–5,
7, 8, 10, 13, 15–17, 19, 27, 33, 35, 38, 44 — and **absent from ¶53, which should have five of
them**.

| location | BL/Davis reads | Tinct `original-en` reads | prior audit |
|---|---|---|---|
| ¶3 (clause 2) | "shall pay **£100** for the entire earl's barony" | "shall pay **100** for the entire earl's barony" | confirmed (`modern-en` ¶3 restores "100 pounds") |
| ¶53 (clause 53) | "lands in another **person's 'fee'**… held of us for **knight's service**… abbeys founded in another **person's 'fee'**, in which the lord of the **'fee'** claims to own a right" | "lands in another **persons fee**… held of us for **knights service**… abbeys founded in another **persons fee**, in which the lord of the **fee** claims to own a right" | **new — not in prior audit** |
| ¶53 (clause 53) | "when these were first **afforested** by our father Henry" | "when these were first **aforested** by our father Henry" | **new — not in prior audit** |
| ¶69 (clause 62) | "between **Easter in the sixteenth year of our reign (i.e. 1215)** and the restoration of peace" | "between **Easter 1215 AD** and the restoration of peace" | partially — see below |

On the last row the prior audit's *fingerprint reasoning was wrong even though its conclusion was
right*. It claimed Wikisource keeps "Easter in the sixteenth year of our reign" with a footnote while
"Tinct inlines 'Easter 1215 AD'… placing Tinct in the BL web lineage." In fact **the BL web lineage
also keeps "Easter in the sixteenth year of our reign," with the gloss as a parenthetical
"(i.e. 1215)"**. Tinct's "Easter 1215 AD" matches *neither* — it is a further downstream rewrite.
The lineage conclusion survives on much stronger evidence (§1.4); the Easter fingerprint should be
dropped.

## 1.4 CONFIRMED and strengthened: provenance is the British Library / G. R. C. Davis translation

Tinct's `original-en` is the Davis translation as published and syndicated by the British Library.
Four independent lines of evidence, all checked live:

1. **The clause-50 `é`-transposition proof (§1.2).** It only reconstructs from a source that contained
   `Athée` / `Cigogné` / `Cigogné` — the BL rendering.
2. **Preamble orthography.** Tinct ¶0 reads "Alan **de** Galloway constable of Scotland, Warin **Fitz**
   Gerald"; the University of Minnesota Law Library's copy — explicitly labelled "From Portico — The
   British Library's Online Information Server", credited to *G. R. C. Davis, Magna Carta, Revised
   Edition, British Library, 1989* — reads identically. Wikisource's transcription of the same
   translation reads "Alan **of** Galloway" / "Warin **fitz** Gerald". Tinct is in the BL-web branch.
3. **Verbatim clause matches.** Tinct ¶51 (clause 51), ¶61 (opening of 61), ¶69–70 (62), ¶71–73 (63)
   are word-for-word the BL text as reproduced by Salisbury Cathedral under the credit line
   "Translation of Magna Carta Courtesy of the British Library."
4. **Published copyright record.** G. R. C. Davis, *Magna Carta* (British Museum, 1963; rev. edn
   British Library, 1989, ISBN 0712300147). BL-credited reproductions carry "Copyright 1995, The
   British Library Board" (UMN Law Library) and "Copyright © The British Library" (magnacharta.com).

## 1.5 CORRECTED: the "© The British Library Board" boilerplate is **NOT in Tinct's reading text**

The task asked me to re-verify this, and here the record needs cleaning up in Tinct's favour.

**Grep result:** a case-insensitive search of all three `magna-carta-*.json` files for `copyright`,
`©`, `(c) <year>`, `british library`, `all rights reserved`, `crown copyright` and `Davis` returns
**zero hits.** No copyright notice, no BL credit, no translator name appears anywhere in the reading
text of any Magna Carta edition.

To be fair to the prior audit: **it never claimed the notice was in the JSON.** Re-reading
per-book-notes/magna-carta.md lines 36–38 and 191–193, it correctly said that *BL-credited
republications elsewhere* carry that notice. The claim has been repeated downstream as if the
boilerplate were inside our file. **It is not.** That distinction matters, because it means Magna
Carta and As You Like It have *opposite* shapes of problem:

- **As You Like It** ships a licence notice *to readers* (a hygiene problem) while the underlying
  rights are almost certainly fine.
- **Magna Carta** ships *no* notice at all while the underlying rights are genuinely unresolved —
  i.e. we have stripped, not reproduced, the attribution. That is worse, not better: the product
  carries a 20th-century in-copyright translation with the credit line removed and the registry
  labelling it only `"English Translation", year: 1215`, which actively implies a medieval, PD text.

## 1.6 Q-RIGHTS vs Q-COMPLETENESS for `magna-carta`

**Q-RIGHTS — genuinely unresolved, and this is the binding constraint.**
- The core English text is a 1963/1989 translation by a named, recently-deceased translator,
  published commercially by the British Library and asserted as "© The British Library Board" in
  BL-credited reproductions.
- Two third-party licence assertions exist and neither is a licence *from the BL*: Wikisource applies
  a contributor-added `{{Cc-by-4.0}}` template to its Davis transcription, and the UMN Law Library
  page says the text is "available under a Creative Commons License" without naming the licence or
  linking a BL statement. Two secondary sites echoing "it's CC" is not a grant.
- Tinct is a paid subscription product, redistributing this text as page content **and** as generated
  audio (`hasAudio: true` on `original-en` and `modern-en`), with no attribution.
- `modern-en` is not an independent work: word count moves 4,525 → 4,593 (+1.5%) and whole clauses
  (14, 17, 39, 40, 41, 46, 47) are word-for-word identical. It is a gloss layer on Davis, i.e. a
  derivative work, and inherits the same rights position.
- **There is no clean, reusable original/human edition of this book in the repository today.** Unlike
  As You Like It, cleaning our file does not solve this — every word of it is the copyrighted
  translation.

**Q-COMPLETENESS — better than the prior audit implied, but not clean.**
- All 63 clauses present in full (§1.1). No truncation, no empty paragraphs, alignment intact across
  all three editions at 74 paragraphs.
- Defects: clause numbers 51–63 unprinted; clauses 49 and 50 merged into ¶50; clause 50 semantically
  corrupted in *both* English editions; `£` lost in clause 2 `original-en`; clause 53 punctuation
  and one letter lost. These are patchable in place — the paragraph structure does not need to move.

## 1.7 Recommendation — `magna-carta`

### **TEMPORARILY WITHHOLD BOOK**

Not because of completeness — the completeness picture is materially better than the prior audit
conveyed — but because **there is no version of this book we can ship while the rights question is
open.** Every edition we hold (`original-en`, `modern-en`, and `modern-da`, which is a translation of
the same text) is the Davis/BL translation or a derivative of it. There is no "keep the original
available while we fix the modern" option here, because the original *is* the encumbered artefact.

Explicitly answering the task's framing: **no, a complete reusable original/human edition cannot
safely remain available.** Withholding only `modern-en` would leave the same copyrighted text on the
site under a different label.

Two things should change in how this is escalated to Anders, relative to the prior audit:

1. **Drop the "clauses 51–63 missing" line.** It overstates the damage, and if it reached a rights
   conversation it would misdescribe the artefact. Say: *complete charter, clause numbering lost after
   50, one clause semantically corrupted.*
2. **Foreground the attribution-stripping**, which the prior audit buried. We are distributing a
   named translator's work commercially with the credit line removed and the registry implying a 1215
   date. That is the part that carries reputational as well as legal exposure.

**Path back to availability (substantial, ~1 sprint of content work):**
- Re-base `original-en` on **Ernest F. Henderson, *Select Historical Documents of the Middle Ages*
  (London: George Bell & Sons, 1892)** — verified this pass: complete, all 63 clauses numbered,
  published 1892, translator d. 1928, public domain in both the US and the EU/Denmark. Clause 39
  reads "No freeman shall be taken, or imprisoned, or disseized, or outlawed, or exiled, or in any
  way harmed…"; clause 51 and clause 63 both present and numbered. It is more archaic than Davis and
  a worse standalone reading text — which is precisely why it is the right *base* for a glossed
  modern edition rather than a straight swap.
- Re-apply the existing `modern-en` gloss method (which the prior audit rated well, and which I see
  no reason to disturb: *scutage (payment in lieu of military service)*, *novel disseisin (recent
  dispossession of land)*, *escheat (lands reverted to the Crown)* etc. are accurate and well-placed).
- Restore all 63 clause numbers, separate 49 from 50, and fix clause 50's name list.
- Regenerate `modern-da` and **regenerate audio** — the current audio was cut from files containing
  the clause-50 error.
- Add an ingestion guard that rejects an edition whose inline clause numbering is non-contiguous.

**Alternative if Anders prefers speed over re-basing:** obtain written British Library permission for
the Davis translation and attribute it properly (registry `translator: 'G. R. C. Davis'`,
`year: 1963`, plus an on-page credit). That resolves Q-RIGHTS without the re-paragraphing work, but
clause 50, the clause numbering and the `£` still need patching, and it is a spend/external decision
that is Anders's to make, not the CEO's.

---

# 2. `as-you-like-it`

Files examined:

| file | chapters | paragraphs |
|---|---|---|
| `app/public/data/editions/as-you-like-it-original-en.json` | 17 | 901 |
| `app/public/data/editions/as-you-like-it-modern-en.json` | 17 | 901 |
| `app/public/data/editions/as-you-like-it-modern-da.json` | 17 | 901 |

Registry: `app/src/data/bookRegistry.ts:516–531` — `original-en` labelled `'Shakespeare (1623)'`,
`year: 1623`; `modern-en` has `hasAudio: true`.

## 2.1 CONFIRMED, verbatim: the CD-ROM boilerplate, and exactly where it sits

Four blocks of four paragraphs each — **16 paragraphs**, as the prior audit stated. Confirmed by
enumeration, with exact indices:

| block | `original-en` location | `modern-en` | `modern-da` |
|---|---|---|---|
| 1 | ch2 ¶51–54 | ch2 ¶51–54 | ch2 ¶51–54 (left in English) |
| 2 | ch12 ¶27–30 | ch12 ¶27–30 | ch12 ¶27–30 (left in English) |
| 3 | ch14 ¶61–64 | ch14 ¶61–64 | ch14 ¶61–64 (**translated into Danish**) |
| 4 | ch17 ¶71–74 | ch17 ¶71–74 | ch17 ¶71–74 (**translated into Danish**) |

The four paragraphs, quoted exactly as they appear in `as-you-like-it-original-en.json`:

> **¶n+0:** `<<THIS ELECTRONIC VERSION OF THE COMPLETE WORKS OF WILLIAM SHAKESPEARE IS COPYRIGHT 1990-1993 BY WORLD LIBRARY, INC., AND IS PROVIDED BY PROJECT GUTENBERG ETEXT OF CARNEGIE MELLON UNIVERSITY`
> **¶n+1:** `WITH PERMISSION.  ELECTRONIC AND MACHINE READABLE COPIES MAY BE DISTRIBUTED SO LONG AS SUCH COPIES (1) ARE FOR YOUR OR OTHERS PERSONAL USE ONLY, AND (2) ARE NOT DISTRIBUTED OR USED`
> **¶n+2:** `COMMERCIALLY.  PROHIBITED COMMERCIAL DISTRIBUTION INCLUDES BY ANY`
> **¶n+3:** `SERVICE THAT CHARGES FOR DOWNLOAD TIME OR FOR MEMBERSHIP.>>`

**New detail the prior audit missed:** `modern-da` ch14 ¶61 and ch17 ¶71 render the notice **in
Danish** —

> `<<DENNE ELEKTRONISKE VERSION AF SHAKESPEARES SAMLEDE VÆRKER ER COPYRIGHT 1990-1993 AF WORLD LIBRARY, INC., OG STILLES TIL RÅDIGHED AF PROJECT GUTENBERG ETEXT AF CARNEGIE MELLON UNIVERSITY`

— while ch2 ¶51 and ch12 ¶27 were left in English. The translation pipeline treated a licence notice
as literary content and translated two of four instances of it. It is worth noting for what it says
about the pipeline's lack of any non-content filter.

**Correction to the prior audit's phrasing:** it said "the **final four paragraphs of the whole book**
are the copyright notice, followed by `End of this Etext…`". The last five paragraphs are actually:

| index | content |
|---|---|
| ch17 ¶70 | `THE END` |
| ch17 ¶71–74 | the four boilerplate paragraphs |
| ch17 ¶75 | `End of this Etext of The Complete Works of William Shakespeare, As You Like It` |

So the boilerplate is at ¶71–74 of 76 and the *final* paragraph is the etext sign-off, not the
notice. The substance — a reader who finishes the play finishes on a CD-ROM licence — is confirmed.

**Adjacent structural debris, confirmed at exact indices:** `ACT II. SCENE I. The Forest of Arden`
(ch2 ¶55), `ACT III. SCENE I. The palace` (ch8 ¶43), `ACT IV. SCENE I. The forest` (ch12 ¶31),
`ACT V. SCENE I. The forest` (ch14 ¶65), `THE END` (ch17 ¶70), `End of this Etext…` (ch17 ¶75) — all
rendered as body paragraphs rather than consumed as headings.

## 2.2 CONFIRMED: Act 1 Scene 1 is genuinely missing

Checked directly, not inferred:

| probe | `original-en` | `modern-en` |
|---|---|---|
| `"As I remember, Adam"` (Orlando's first line) | 0 | 0 |
| `"bequeathed me by will"` | 0 | 0 |
| `"DENNIS"` (a speaker only in I.i) | 0 | 0 |
| `"Orchard"` (the I.i location) | 0 | 0 |
| `"CHARLES"` | 4 — all in ch1, the wrestling scene | 4 |
| `"Enter ORLANDO and ADAM"` | 2 — ch4 ¶1 and ch7 ¶1 (II.iii and II.vi) | 2 |

Chapter 1 opens directly on Act 1 **Scene 2**:

> ch1 ¶0: `A lawn before the DUKE'S palace`
> ch1 ¶1: `Enter ROSALIND and CELIA`
> ch1 ¶2: `CELIA. I pray thee, Rosalind, sweet my coz, be merry.`

**Ground truth.** Downloaded Project Gutenberg #1523 (the clean modernized-series text) this pass:
22 scene headers, zero occurrences of `WORLD LIBRARY`, and Act 1 Scene 1 present as
`ACT I / SCENE I. An Orchard near Oliver's house / Enter Orlando and Adam. / ORLANDO. As I remember,
Adam, it was upon this fashion bequeathed me by will…`, ending at Oliver's soliloquy
(`…this wrestler shall clear all. Nothing remains but that I kindle the boy thither, which now I'll
go about.`). The scene runs **1,487 words** (the prior audit's "~1,150" understates it).

Word-count corroboration: PG #1523 body = 23,145 words. Tinct `original-en` = 21,470 words, of which
**317** are boilerplate/etext debris → 21,153 words of actual play. The ~1.5k shortfall is exactly the
missing scene.

**Reader impact, confirmed:** the play now opens on Celia telling Rosalind to be merry. Orlando
arrives in the wrestling scene (ch1 ¶64) with no established grievance against Oliver, no Adam, no
inheritance backstory, and no explanation of who Charles is. The `as-you-like-it-threads.json` cast
lists only Rosalind, Orlando, Jaques, Celia, Touchstone — so Adam and Oliver aren't introduced there
either. The AI chat has no I.i text to ground an answer about Orlando's motive.

## 2.3 REFINED: the chapter titles are wrong in a *specific, mechanical* way

The prior audit said the seventeen titles "cycle nonsensically." That is imprecise, and the precise
version is more useful for whoever fixes it: **the scene number is correct; the act number is
hardcoded to 1.**

| chapter | title in file | actual scene | title scene # correct? |
|---|---|---|---|
| 1 | `Act 1, Scene 2` | I.ii | yes |
| 2 | `Act 1, Scene 3` | I.iii (+ II.i merged at ¶55–66) | yes |
| 3 | `Act 1, Scene 2` | II.ii | yes |
| 4 | `Act 1, Scene 3` | II.iii | yes |
| 5 | `Act 1, Scene 4` | II.iv | yes |
| 6 | `Act 1, Scene 5` | II.v | yes |
| 7 | `Act 1, Scene 6` | II.vi | yes |
| 8 | `Act 1, Scene 7` | II.vii (+ III.i merged at ¶43–47) | yes |
| 9 | `Act 1, Scene 2` | III.ii | yes |
| 10 | `Act 1, Scene 3` | III.iii | yes |
| 11 | `Act 1, Scene 4` | III.iv | yes |
| 12 | `Act 1, Scene 5` | III.v (+ IV.i merged at ¶31–114) | yes |
| 13 | `Act 1, Scene 2` | IV.ii | yes |
| 14 | `Act 1, Scene 3` | IV.iii (+ V.i merged at ¶65–97) | yes |
| 15 | `Act 1, Scene 2` | V.ii | yes |
| 16 | `Act 1, Scene 3` | V.iii | yes |
| 17 | `Act 1, Scene 4` | V.iv + Epilogue | yes |

`modern-da` mirrors this with `Akt 1, Scene N` — note it also half-translated the label ("Akt" but
"Scene").

**Arithmetic, corrected.** The prior audit's headline said "five real scenes have been merged away";
its body said four merges plus one missing. The body is right: 22 canonical scenes − 4 merged
(II.i, III.i, IV.i, V.i, each absorbed into the tail of the preceding chapter) − 1 missing (I.i) = 17
chapters. **Four merged, one absent.**

This all points at a single ingestion bug: the chapteriser split on `SCENE` headers only, so it never
saw `ACT n.` boundaries (hence the act number frozen at 1, and each act's `SCENE I` swallowed as body
text because the `ACT n. SCENE I.` line is one combined line in PG #1786), and it treated everything
before the *second* scene header — including the leading boilerplate block — as front matter, which
is how Act 1 Scene 1 vanished.

## 2.4 CORRECTED — the reframe. This is **not** a rights blocker.

The independent review's correction is upheld in full, and the prior audit's `BLOCKED` verdict on
this book should be withdrawn.

**Why the boilerplate does not encumber Shakespeare's text:**

1. *As You Like It* was first printed in the 1623 First Folio. Shakespeare died in 1616. The play is
   public domain everywhere, by centuries, on any theory.
2. The notice in our file is a **1990–1993 World Library, Inc. claim over a CD-ROM digitisation** —
   at most a thin "sweat of the brow" claim over *that particular transcription*, which is not a
   recognised basis for copyright in the US after *Feist v. Rural* (1991), and which the EU/Denmark
   likewise does not protect for a faithful transcription of a PD work (no sweat-of-the-brow right;
   no originality for a mechanical rendering).
3. **Project Gutenberg itself reclassified the series.** PG's Shakespeare page states the 1765–1802
   series "had been listed as copyrighted (© 1990-1993) based on 'sweat of the brow' effort to
   transcribe printed works. Based on contemporary copyright law interpretations, the metadata for
   these was updated in October 2023 to indicate that they are in the public domain in the U.S." The
   catalogue page for **#1786** — the exact source of our file — now reads **"Public domain in the
   USA."** (verified live this pass).
4. Even if one took the 1990s claim seriously, it would attach to the *specific transcription*, and
   the remedy is trivially available: re-ingest the same play from a different PD transcription. It
   would never reach Shakespeare's words.

**What the boilerplate actually is:** a **data-hygiene defect**. It is 16 paragraphs of non-text
inside the reading experience. The product problem is real and independent of the law — a paid
subscription service is currently showing its readers a paragraph that says the content "ARE NOT
DISTRIBUTED OR USED COMMERCIALLY… PROHIBITED COMMERCIAL DISTRIBUTION INCLUDES BY ANY SERVICE THAT
CHARGES FOR DOWNLOAD TIME OR FOR MEMBERSHIP," and a Danish reader gets it translated into Danish for
extra conviction. That is embarrassing and it must go. It is not a licence we are violating; it is a
sentence we are printing.

**Honest corrected assessment, in the review's own terms:** this is **not** a "BLOCKED, rights
unresolved" situation. It is "the current transcription is contaminated and incomplete and must be
re-ingested from a clean public-domain source; Shakespeare's own text is unquestionably fine to have
available once that is done."

## 2.5 Q-RIGHTS vs Q-COMPLETENESS for `as-you-like-it`

**Q-RIGHTS — effectively resolved. Low risk. Not a blocker.**
Shakespeare 1623 is PD. The 1990s CD-ROM transcription claim is weak-to-void in the US (post-*Feist*;
PG's own Oct-2023 reclassification) and unrecognised in the EU/Denmark for a faithful transcription.
Clean PD replacements are freely available and verified (below). Nothing here justifies withholding
the book on rights grounds.

**Q-COMPLETENESS — genuinely failing, and this *is* the blocker.**
- ~1,490 words / one full scene of a 22-scene play missing (7% of the text, and the scene that sets
  up the entire plot).
- 16 paragraphs + 6 debris lines of non-text inside the reading flow, in all three editions.
- 17 chapter labels wrong; 4 scenes not independently navigable.
- Everything downstream keyed to those labels — chapter nav, per-chapter progress, the Cast/threads
  loader, audio alignment (`modern-en` has `hasAudio: true`), any AI chat citing a scene — is wrong.

## 2.6 Recommendation — `as-you-like-it`

### **REPLACE EDITION** (re-ingest all three from a clean PD source), with the book **temporarily withheld only until `original-en` lands**

Rationale: the defect is entirely upstream data, entirely fixable, and carries no rights obstacle.
"Replace edition" is the right label rather than "patch content", because `original-en` cannot be
patched in place — inserting Act 1 Scene 1 and removing 22 non-text paragraphs shifts every
downstream paragraph index, which `modern-en`, `modern-da`, `as-you-like-it-threads.json` and any
stored reading position are aligned to.

**Answering the task's specific question — can `original-en` safely remain available before
`modern-en` is fixed?**

- **On rights: yes, unambiguously.** There is no rights reason to pull any edition of this play.
- **On the state of the file today: no.** The current `original-en` has the *same* two defects as
  `modern-en` — the missing scene and the boilerplate are inherited by all three editions from one
  broken ingestion. Leaving `original-en` up while fixing `modern-en` leaves a reader with a play
  that has no first scene and four licence notices in it.
- **After re-ingestion: yes, and this is the recommended sequencing.** Once `original-en` is rebuilt
  from PG #1523 (or #100, or Standard Ebooks), it is a complete, clean, reusable, unencumbered human
  edition and **should go live immediately, without waiting for `modern-en`/`modern-da`**. Ship
  `original-en` first; regenerate the modern editions against it and release them when ready. That is
  the opposite of the prior audit's implied "block the whole book," and it is the right call because
  the completeness problem, not a rights problem, is what is holding the book back — and completeness
  is fixed the moment the source is fixed.

**Verified replacement sources (all checked this pass):**
- **PG #1523** — downloaded and confirmed: 22 scene headers, `ACT I / SCENE I. An Orchard near
  Oliver's house / Enter Orlando and Adam. / ORLANDO. As I remember, Adam…`, 0 occurrences of
  `WORLD LIBRARY`, Epilogue present, 23,145 body words, same curly-quote / `[_Exeunt._]` conventions
  as the other four B5 plays. PG explicitly recommends the 1500 series over #1786. **Preferred.**
- **Standard Ebooks** — `standardebooks.org/ebooks/william-shakespeare/as-you-like-it`, based on the
  Clark & Wright 1887 Victoria/Globe edition, PD, with clean semantic markup. Good alternative.
- **PG #100** (Complete Works) — same lineage as #1523.

**Work order:**
1. Re-ingest `original-en` from PG #1523 — restores I.i, removes all 22 non-text paragraphs, gives
   22 correctly-labelled scenes with locations. **Ship this edition as soon as it passes visual QA;
   do not gate it on the modern editions.**
2. Regenerate `modern-en` and `modern-da` against the corrected source (they cannot be patched —
   indices shift throughout).
3. While regenerating, fix the two translation-level defects confirmed this pass:
   - Songs are being run through a mechanical `thou`→`you` substitution that breaks rhyme and
     agreement. `modern-en` ch8 ¶41 reads `Freeze, freeze, you bitter sky, That do not bite so near
     As benefits forgot` — the source's `sky`/`nigh` rhyme is gone and `sky … do not` is
     ungrammatical. ch8 ¶40 turns `Although thy breath be rude` into `Although your breath be rough`
     for no gain. Leave lyrics alone or handle them as verse.
   - Verse scenes get only a lexical touch-up while prose scenes get a real modernization. Level this.
4. Rebuild the `modern-en` audio (chapter/paragraph alignment changes).
5. Update `as-you-like-it-threads.json` — its cast is five names and contains neither Adam nor Oliver,
   both of whom are central once I.i exists.
6. Per CLAUDE.md invariant 6: any stored reading position in this book will be out of range after the
   renumbering and must reset **and** delete the storage key.
7. Add the ingestion guard the prior audit proposed: reject any edition file containing
   `WORLD LIBRARY`, `PROJECT GUTENBERG`, `Etext`, `THE END`, or a chapter title that repeats within a
   book. `grep -l "WORLD LIBRARY" app/public/data/editions/` returns only the three as-you-like-it
   files, so this is an isolated sourcing accident — but the guard is cheap.

---

# 3. Summary table

| | `magna-carta` | `as-you-like-it` |
|---|---|---|
| **Q-RIGHTS** | **UNRESOLVED — blocking.** 1963/89 Davis translation, © The British Library Board, no licence, no attribution, distributed commercially incl. audio. | **RESOLVED — not blocking.** Shakespeare 1623 is PD; the 1990s CD-ROM claim is thin/void (post-*Feist*; PG reclassified #1786 "Public domain in the USA", Oct 2023). |
| **Q-COMPLETENESS** | **Better than reported.** All 63 clauses present in full. Clause numbers absent after 50; 49+50 merged; clause 50 semantically corrupted; `£` and some punctuation lost. | **Failing.** Act 1 Scene 1 (~1,490 words) absent; 16 boilerplate + 6 debris paragraphs in the reading text; 17 wrong chapter labels; 4 scenes merged. |
| **Can a complete, reusable original/human edition stay available?** | **No.** The original *is* the encumbered artefact. | **Not as it stands today** (same data defects as `modern-en`) — **but yes immediately after re-ingestion**, and it should ship ahead of the modern editions. |
| **Recommendation** | **Temporarily withhold book** | **Replace edition** |
| **Prior audit verdict** | BLOCKED | BLOCKED |
| **Change** | Verdict stands; *reasons* corrected — completeness claim materially overstated, rights claim understated (attribution stripped, not merely absent). | **Verdict withdrawn.** Reframed from a rights blocker to a data-hygiene + completeness defect with a known, free, verified fix. |

---

# 4. What the prior audit got right, wrong, and what is new

## `magna-carta`

**Confirmed**
- Provenance is the BL/Davis translation — and now proved to a far higher standard than the audit had.
- Clause 50 is corrupted, with names migrated out of the enumerated list; `modern-en` polished the
  spelling without fixing the sense.
- Clauses 49 and 50 are merged into `original-en`/`modern-en` ¶50.
- The `£` is missing from clause 2 in `original-en` and restored as "100 pounds" in `modern-en`.
- Clause 39 and clause 40 are textually intact in both editions — the highest-stakes check passes.
- Registry metadata is misleading: `label: 'English Translation'`, `year: 1215`, no translator.

**Wrong / materially overstated**
- **"Clauses 51–63 missing" as a completeness claim.** All thirteen are present in full at ¶51–¶73.
  Only the numbering is absent. The audit's own defect list said "clause numbers"; every summary
  restatement dropped that word, and the review was right to flag it.
- **The "Easter 1215 AD" fingerprint.** The BL web text also reads "Easter in the sixteenth year of
  our reign (i.e. 1215)". Tinct's phrasing matches neither branch; it is a further downstream edit
  and proves nothing about lineage. Discard this argument (the conclusion survives on stronger
  evidence).
- **The headline count** "13 clause numbers" understates the labelling defect slightly — the second
  halves of clauses 1, 61, 62 and 63 are also unnumbered paragraphs.

**New this pass**
- Bit-for-bit proof that clause 50's corruption is an `é`-delimited **segment transposition**
  (`S0+S2+S1+S3` reconstructs Tinct's paragraph exactly from the BL string) — an encoding-repair bug,
  not an editorial one, and independent proof of the BL lineage.
- **No copyright/BL/translator string exists anywhere in the three `magna-carta-*.json` files.** The
  problem is *stripped* attribution, not reproduced boilerplate — the opposite shape from
  As You Like It, and worse.
- Clause 53 (¶53) lost all five of its curly quotes/apostrophes and reads `aforested` for
  `afforested` — same encoding damage, not previously reported.

## `as-you-like-it`

**Confirmed**
- 16 boilerplate paragraphs in 4 blocks, at ch2 ¶51–54, ch12 ¶27–30, ch14 ¶61–64, ch17 ¶71–74, in all
  three editions. Text quoted verbatim in §2.1.
- Act 1 Scene 1 genuinely absent from all editions; verified against PG #1523 and by six independent
  string probes.
- Structural debris (`ACT II. SCENE I. …` etc.) rendered as body paragraphs at the stated indices.
- Song damage in `modern-en` ch8 ¶40–41 (`thou`→`you` breaking rhyme and agreement).
- `grep "WORLD LIBRARY"` hits only these three files — isolated, not corpus-wide.

**Wrong / needs correcting**
- **`BLOCKED` on rights.** Withdrawn. Shakespeare 1623 is PD; the 1990s World Library claim is a thin
  sweat-of-the-brow claim over a transcription, weak-to-void post-*Feist* and unrecognised in the
  EU/Denmark, and PG has itself reclassified #1786 as "Public domain in the USA." The boilerplate is
  a data-hygiene defect, not evidence of encumbrance.
- **"The final four paragraphs of the whole book are the copyright notice."** They are ¶71–74 of 76;
  ¶75 (`End of this Etext…`) is last and ¶70 is `THE END`.
- **"Five real scenes have been merged away"** (headline). Four merged + one missing, as the audit's
  own body arithmetic correctly had it.
- **"Titles cycle nonsensically."** Imprecise. Scene numbers are all correct; the **act number is
  frozen at 1** in every one of the 17 titles. Useful for diagnosing the chapteriser.
- **"~1,150 words" for Act 1 Scene 1.** It is **1,487** words in PG #1523.

**New this pass**
- `modern-da` **translated the copyright notice into Danish** at ch14 ¶61 and ch17 ¶71 while leaving
  ch2 ¶51 and ch12 ¶27 in English — the pipeline has no non-content filter at all.
- `modern-da` chapter titles read `Akt 1, Scene N` — half-translated label.
- `as-you-like-it-threads.json` lists only five characters (Rosalind, Orlando, Jaques, Celia,
  Touchstone) — neither Adam nor Oliver, both required once I.i is restored.
- Standard Ebooks (Clark & Wright 1887 Victoria/Globe) verified as a second clean PD replacement
  alongside PG #1523 / #100.
- Word arithmetic: PG #1523 body 23,145 w; Tinct `original-en` 21,470 w of which 317 are
  boilerplate/debris → 21,153 w of play. Shortfall ≈ the 1,487-word missing scene.

---

# 5. Sources used for ground truth

- British Library / G. R. C. Davis translation, as reproduced with the credit *"Translation of Magna
  Carta Courtesy of the British Library"* — https://www.salisburycathedral.org.uk/translation-of-magna-carta-courtesy-of-the-british-library/
- University of Minnesota Law Library, *Magna Carta (1215)* — "Copyright 1995, The British Library
  Board. From Portico — The British Library's Online Information Server", citing G. R. C. Davis,
  *Magna Carta, Revised Edition*, British Library, 1989 — https://librarycollections.law.umn.edu/magnacarta/mc_english.php
- Museum of Australian Democracy, Magna Carta clause 50 — https://magnacarta.moadoph.gov.au/clause/50/
- magnacharta.com, complete translation, "Copyright © The British Library" — https://www.magnacharta.com/bomc/complete-translation-of-the-magna-carta/
- Wikisource, *Magna Carta (trans. Davis)*, 1963, contributor-applied CC-BY-4.0 template — https://en.wikisource.org/wiki/Magna_Carta_(trans._Davis)
- Wikisource, Ernest F. Henderson, *Select Historical Documents of the Middle Ages* (1892), Magna
  Carta — all 63 clauses numbered — https://en.wikisource.org/wiki/Select_Historical_Documents_of_the_Middle_Ages/Book_I/Magna_Carta
- Yale Avalon Project, Magna Carta — https://avalon.law.yale.edu/medieval/magna.asp
- Project Gutenberg #1523, *As You Like It* (modernized series) — downloaded and inspected — https://www.gutenberg.org/ebooks/1523
- Project Gutenberg #1786, *As You Like It* (World Library series), catalogue status "Public domain
  in the USA." — https://www.gutenberg.org/ebooks/1786
- Project Gutenberg, *Shakespeare* help page, on the 1765–1802 series and its October 2023
  reclassification — https://www.gutenberg.org/help/shakespeare.html
- Standard Ebooks, *As You Like It* (Clark & Wright 1887 Victoria/Globe) — https://standardebooks.org/ebooks/william-shakespeare/as-you-like-it

# 6. Limitations

- I did not collate either book against its ultimate source artefact (the 1215 Latin engrossments;
  the 1623 First Folio). Completeness is asserted against published English presentations.
- `magna-carta-modern-da.json` was checked for structure, paragraph count and copyright strings only;
  its Danish prose was not read. `as-you-like-it-modern-da.json` likewise (beyond the boilerplate and
  title findings above).
- The rights analysis is desk research, not legal advice. The `as-you-like-it` conclusion rests on
  *Feist*, the absence of an EU sweat-of-the-brow right, and PG's own reclassification; the
  `magna-carta` conclusion rests on the BL's published copyright assertions and the absence of any
  traceable BL licence grant. A lawyer should confirm before either is treated as settled — but note
  that the two conclusions point in opposite directions and should not be given a single verdict.
- Audio was not listened to. `app/public/audio/` contains no `magna-carta` or `as-you-like-it`
  directories in this checkout, though both books have `hasAudio: true` editions in the registry —
  audio is presumably R2-hosted and was not reachable from here. If it exists, it carries the same
  defects as the text it was cut from.
- Onboarding JSON (`app/public/data/onboarding/magna-carta.json`, `as-you-like-it.json` and their
  `.da` variants) was confirmed to exist but not audited for references to the wrong chapter labels
  or to clause numbering.
