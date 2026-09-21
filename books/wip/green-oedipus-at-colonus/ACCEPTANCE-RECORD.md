# Acceptance Record — Oedipus at Colonus, modern-en

- **Title:** Oedipus at Colonus (Sophocles)
- **Book ID (staged):** `green-oedipus-at-colonus`
- **Edition:** `modern-en` candidate
- **Source (fidelity anchor):** `source.json` — staged copy of the
  public-domain English verse translation used as this book's `original-en`
  edition (`app/public/data/editions/oedipus-at-colonus-original-en.json`).
- **Candidate origin:** staged from live app edition files for this
  translation-protocol pass.
- **Structure:** 11 chapters, 566 paragraphs, 1:1 with source (chapter
  numbers, titles, and paragraph counts verified programmatically to match
  exactly).

## Review coverage table

| Round | Scope | Result |
|---|---|---|
| Structural check | Chapter/paragraph count, order, JSON validity vs. source | Clean |
| Round-1 accessibility review (blind) | Full, non-sampled, all 566 paragraphs, candidate-only, no source access | Needs targeted fixes — concentrated in choral-ode mythological epithets (Ch. 2, 6, 7-tailpiece/8, 9, 11) |
| Round-1 fidelity review (packeted, with whole-play cross-boundary re-read) | Full, non-sampled, all 566 paragraphs in ~5–10 paragraph packets with neighbor context, plus a full whole-play re-read for cross-boundary issues | ACCEPT WITH FIXES REQUIRED — 2 minor non-blocking defects |
| Fidelity fix pass | Ch. 6 p2 ("children"→"boys"); Ch. 9 p48 (reverted silent "Eteocles"→"Etocles" OCR-correction, restored source's literal "Etocles") | Applied |
| Accessibility glossing fix pass | 7 paragraphs glossed: (2,23) dangling pronoun resolved; (6,0) "the Bacchic god"→+"Dionysus"; (6,1) "the Mother and the Daughter"→+"Demeter and Persephone", "the Cyprian queen"→+"Aphrodite"; (6,2) "the Olive Planter"→+"Zeus", "the Grey-eyed Goddess"→+"Athena"; (6,3) "son of Kronos"→+"the Titan", "the Nereids"→+"the sea-nymphs"; (8,11) "the dread Queen and Maid"→+"Demeter and Persephone", "the priestly Eumolpidae"→+"the hereditary clan of Eleusinian priests"; (11,19) "the pact of Theseus and Peirithous"→+"their bond of friendship" | Applied |
| **This task — fidelity spot-check of all 9 fixed paragraphs** | Re-derived each of (2,23), (6,0), (6,1), (6,2), (6,3), (8,11), (9,48), (11,19) directly from `source.json`; confirmed every gloss names a mythological/historical reference already present in the source's meaning, without inventing content or resolving any ambiguity the source leaves open. Confirmed the withheld-death-mystery passage (Ch. 11, messenger's speech, ~p15/p19 region) is untouched by any of the 9 edits and remains genuinely withheld in the candidate ("no one knows except Theseus... he was simply taken... or else some gentle, painless opening of the earth"). | Clean — no defects found |
| **This task — final whole-book non-sampled pass (Protocol steps C/D)** | (a) All 11 chapters read candidate-vs-source for cross-boundary fidelity: Oedipus's emotional arc (bitter/defensive in Ch. 1–3 → caustic/cursing toward Creon and Polyneices in Ch. 7/9 → gentler, valedictory register in the Ch. 11 Exodos) preserved distinctly, not flattened; Theseus (refuses formal oaths, acts decisively, e.g. Ch. 5 "An oath would be no more reliable than my word," Ch. 7 rescue orders) and Creon (rationalizes after the fact, closes with veiled threat "once at home, I too shall play my part," Ch. 8) stay sharply distinct; the death mystery stays genuinely withheld. Structural counts re-verified. (b) Fresh candidate-only accessibility read of the full 566-paragraph text as a first-time general-adult reader (source and prior review files not consulted for this half): dialogue-heavy episodes read clearly and idiomatically throughout; the glossed choral-ode passages now resolve their epithets in-line; no new comprehension blockers found. | Clean — no new defects found |

## Defect counts by round

- Structural check: 0
- Round-1 accessibility: several non-blocking friction points (mythological epithets, all subsequently glossed) — 0 grammar/logic breaks, 0 blocking
- Round-1 fidelity: 2 non-blocking defects (both fixed)
- This task's fidelity spot-check: 0
- This task's final whole-book pass: 0 new defects (fidelity or accessibility)

## Deliberately preserved non-blocking items (not defects, not re-flagged)

- Ch. 2 manuscript-lacuna markers (`[Text lost in manuscript.]`) — a genuine textual gap in the source, faithfully carried forward; recommended a contextual note via onboarding/footnote rather than a text change.
- Ch. 9's Seven-Against-Thebes catalogue — dense concentration of proper names, inherent to the source content, grammatically clear.
- Ch. 3 (paragraphs 32–34) and Ch. 5 (paragraphs 25–26) speaker-label anomaly — inherited unchanged from the locked source; not a candidate defect.
- Ch. 11 kommos lament — deliberate stichomythic (short, clipped-exchange) convention of the Greek original, faithfully rendered; not a translation flaw.
- Isolated hard words flagged in general residual notes ("kites," "arraign," "mainsheet") — not present in this text; not applicable to this candidate.
- Two OCR-typo place-name normalizations and one minor nuance shift, and one softened image — previously reviewed and accepted as non-blocking under the fidelity round; not re-flagged.

## Final verification

- **sha256 (candidate.json):** `5da99c2a47365f578fd45d5d930b8aff3dfd57f50f987b11e950a320887862ff`
- **Date:** 2026-09-21

No further edits were made to `candidate.json` during this task. This record covers exactly the file at the hash above.
