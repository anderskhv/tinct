# Independent Fidelity Review — Heart of Darkness, Danish Chapter 3 Repair

**Reviewer:** Independent review agent (separate from the translation's authoring session)
**Date:** 2026-09-26
**Files compared:**
- English baseline: `app/public/data/editions/heart-of-darkness-modern-en.json` (chapter 3)
- Candidate: `books/wip/heart-of-darkness-modern-da-repair/editions/heart-of-darkness-modern-da.json` (chapter 3)
- Live Danish (already-served, for chapters 1–2 consistency check): `app/public/data/editions/heart-of-darkness-modern-da.json`

## 1. Structural checks

- **Paragraph counts:** EN chapter 3 = 87 paragraphs. Candidate DA chapter 3 = 87 paragraphs. **1:1 match confirmed.**
- **JSON validity:** Candidate file parses cleanly with `json.load()`. No structural errors.
- **Chapters 1–2 unchanged:** Programmatically diffed the candidate's chapter 1 and chapter 2 objects against the live served file — **byte-for-byte identical** (`==` True on the parsed Python dicts). The `sections` top-level key is also identical. The candidate touches only chapter 3.
- **Length sanity check:** EN chapter 3 total paragraph-character count = 64,366; DA candidate = 67,509 (ratio 1.05), which is normal expansion for Danish relative to English. Per-paragraph length-ratio scan found no outliers suggestive of truncation or dropped content — the lowest ratios (0.73–0.92) all correspond to naturally short lines/dialogue, and manual inspection of each confirmed full translation, not omission.

## 2. Sampling and content fidelity

Read and compared over 30 of the 87 paragraphs, spread across the full chapter (paragraphs 0, 1, 2, 3, 5, 7, 10, 13, 16, 18, 21, 22, 24, 27, 28, 29, 30, 31, 34, 37, 41, 42, 43, 44, 45, 47, 50, 52, 55, 58, 60, 62, 66, 70, 74, 78, 81, 82, 83, 84, 85, 86 — i.e. every section of the chapter including the opening (Marlow/Russian harlequin scene), the mid-chapter action (attack on the steamer, Kurtz's escape into the bush, the tribal woman on the shore), Kurtz's death, and the full Brussels/Intended closing scene).

**Findings: the translation is complete and faithful.** Every plot beat present in the English is present in the Danish:
- The harlequin/Russian's backstory and Kurtz's domination of him and the tribe.
- The stake-heads detail ("de hoveder, der tørrede på pælene") — imagery fully preserved, not flattened.
- Kurtz's raid justification, the "rebels" euphemism exchange, the disciple's breakdown.
- The tribal woman with the "hjelmformede hoved og de gyldenbrune kinder" (helmeted head, tawny cheeks) — a vivid, non-flattened rendering of a famously striking image.
- The steamer attack, Marlow's confrontation with Kurtz in the bush ("Gå væk — skjul dig" / "Go away — hide yourself"), the sorcerer/witch-man figure with antelope horns, the full "I had, even like the [natives], to invoke him" passage (see §4 below), Kurtz's line about "immense plans" / "threshold of great things."
- The departure, the crowd on the riverbank, the woman with helmeted head reappearing.
- Kurtz's monologues, the ivory claim speech ("This lot of ivory is really mine..."/"Dette parti elfenben her er nu virkelig mit...").
- Named characters all present and correctly identified: Marlow (implicit narrator), Kurtz (65 case-sensitive occurrences), the manager (11 occurrences, case-insensitive), the Russian/harlequin (6 occurrences of "russ-"), the Intended (unnamed in original, rendered consistently as "hun/hende").

No dialogue lines, named characters, or concrete physical details were found dropped, summarized, or flattened in the sampled paragraphs.

## 3. The ending — verified complete and at full weight

Checked every "horror" occurrence and the full closing scene (paragraphs 41–50 for Kurtz's death, 52–86 for the Intended scene):

- **Para 41–42:** The buildup ("a veil had been rent... sombre pride, ruthless power, craven terror") and the cry itself:
  - EN: `'The horror! The horror!'`
  - DA: `'Rædslen! Rædslen!'`
  This exact phrase recurs four times in the chapter (paras 42, 47 ×2, 81) and is rendered identically and consistently every time — no drift in the key refrain.
- **Para 43–44:** The manager's boy announcing the death:
  - EN: `Suddenly the manager's boy put his insolent black head in the doorway... 'Mistah Kurtz—he dead.'`
  - DA: `Pludselig stak manageren drengs uforskammede sorte hoved ind i døråbningen... 'Hr. Kurtz — han død.'`
  The clipped pidgin grammar of "he dead" is preserved as "han død" (dropping the verb, matching the English's broken-grammar effect) rather than being smoothed into correct Danish ("han er død") — a good, deliberate choice that preserves Conrad's characterization detail.
- **Para 45:** Marlow's "beastly, beastly dark" reaction and the pilgrims burying "something in a muddy hole" — fully present.
- **Para 47, 50:** The extended meditation on Kurtz's cry as moral victory, and the vision of Kurtz on the stretcher in Brussels — fully translated, dense imagery intact ("en skygge umættelig af pragtfulde skær, af rædselsfulde virkeligheder").
- **Paras 52–86, the Intended scene:**
  - Her entrance in mourning ("Hun kom hen imod mig, helt i sort... Hun var i sørgedragt") — full year-plus of grief conveyed.
  - Her insistence on his last word: para 82, `'Hans sidste ord — at leve med,' insisterede hun. 'Forstår De da ikke, at jeg elskede ham — jeg elskede ham — jeg elskede ham!'` — matches EN's escalating repetition.
  - Marlow's hesitation (para 83: `Jeg tog mig sammen og talte langsomt`) and the lie itself (para 84): `'Det sidste ord, han udtalte, var — Deres navn.'` — exact match to EN's `'The last word he pronounced was—your name.'`
  - Her reaction (para 85): the "exulting and terrible cry," "I knew it—I was sure!," and Marlow's closing interior monologue about the heavens not falling and "It would have been too dark—too dark altogether" — all present: `'Jeg vidste det — jeg var sikker!'`... and `Det ville have været for mørkt — for aldeles mørkt....`
  - The frame-narrator's closing image (para 86): Buddha pose, the Director's line about the ebb, and the final line about "det umådeligt mørke" / "the heart of an immense darkness" — present and correctly positioned as the novella's closing image.

**The ending lands with its full weight. No compression, no softening, no omission found.**

## 4. Racial-slur consistency check (task item 5) — **FLAG: inconsistency found**

The candidate's chapter 3 contains exactly one instance of Conrad's use of the period slur for the local population, at **paragraph 28**:

> EN: `I had, even like the niggers, to invoke him—himself—his own exalted and incredible degradation.`
> DA (candidate): `Jeg var, ligesom de sorte, nødt til at påkalde ham — ham selv...`

The candidate renders this as "de sorte" (a neutral, modern "the Black people/the Blacks"), not a Danish slur-equivalent. Two other chapter-3 instances of "black" applied to people (para 21 "three black fellows" → "tre sorte fyre"; para 22 "a picket of a few of our blacks" → "en vagtpost af nogle få af vores sorte") are similarly rendered with the neutral "sorte."

**However, I checked the live, already-served chapters 1–2 of the Danish edition to verify the repair's own claim that this is consistent with existing practice, and it is not.** The live file uses the direct slur calque **"nigger"/"niggere"** (not "sorte") in every instance where the English original uses the slur:

- Chapter 1, para 19: (indirect reference to "de indfødte" nearby, not the slur itself, but see below)
- Chapter 1, para 43: `Strenge af støvede niggere med vrange fødder ankom og afsluttede...` (EN: "Strings of dusty niggers with splay feet arrived and departed")
- Chapter 1, para 49: contains "niggere"
- Chapter 1, para 55: `En nigger blev tævet i nærhe[den]...` (EN: uses the same slur for a man being beaten)
- Chapter 1, para 59: contains "nigger" (×2)
- Chapter 1, para 70: contains "niggere"
- Chapter 2, para 28: contains "niggere"

I confirmed these are genuine occurrences of the Danish word "nigger"/"niggere" (not a false-positive substring match) by regex-extracting each hit with surrounding context; all seven are direct, unsoftened uses of the slur, matching the English 1:1.

**This means the candidate's own premise — that chapters 1–2 "already use 'sorte' throughout" — is factually incorrect.** The live, already-accepted Danish edition does the opposite: it keeps Conrad's slur as a direct Danish calque ("nigger"/"niggere"), while the new chapter 3 candidate softens the same word to the neutral "sorte." This is an internal inconsistency in register and translation policy within a single edition of the same book: a reader moving from chapter 2 into chapter 3 will see the exact same English word translated two different ways.

This is not a request to judge which choice is more appropriate (that is an editorial/product decision, not a fidelity question) — it is a factual flag: **the claim of consistency is false, and the two halves of the served edition currently disagree with each other on how to render this vocabulary.** This should be resolved — either by softening chapters 1–2 to match chapter 3, or by matching chapter 3's "de sorte" to chapters 1–2's "nigger/niggere" — before this repair is merged, so the served edition doesn't ship with a visible mid-book inconsistency in exactly the area (racial-language handling) most likely to draw scrutiny.

## 5. Danish prose quality

Independently judged (not just compared word-for-word) across all sampled paragraphs:

- **Fluent and idiomatic**, not a stiff English calque. Word order, clause subordination, and idiom choices read as native literary Danish (e.g. "tabt i forbløffelse," "til sidst lå de og skurede mod hinandens sider," "et syn af formløs gråhed fyldt med fysisk smerte").
- **Register is correctly literary/atmospheric**, matching Conrad's dense, elevated style — long periodic sentences are preserved rather than broken up into short machine-translation-style clauses; em-dash constructions and suspension points (`....`) are preserved faithfully.
- **Formal address ("De"/"Deres")** is used consistently and correctly for the Intended-scene dialogue, appropriate to the period register.
- **No signs of machine-translation artifacts**: no literal mistranslations, no dropped idioms, no anglicisms, no repeated boilerplate phrasing. Vocabulary choices are varied and period-appropriate ("veltalenhed," "sygekost," "overherredømme").
- Minor, non-blocking stylistic note: para 43 renders "manager's boy" as "manageren drengs" — this reads as a possible typo/word-order slip (expected "managerens dreng" or "manager-drengen"); worth a quick copyedit pass but does not affect fidelity or meaning, and is the only such slip found in the full sample.

## 6. Verdict

**ACCEPT**, with one required follow-up action before/alongside merge:

- Structural integrity: 87/87 paragraphs, valid JSON, chapters 1–2 untouched — all confirmed.
- Content fidelity: complete, faithful translation across the full chapter, including full weight at the ending (Kurtz's death cry, the boy's announcement, and the complete Intended scene with the "your name" lie and her reaction).
- Prose quality: fluent, idiomatic, correctly literary-register Danish; not a calque or machine-translation.
- **One flag, not a blocker on its own merits, but must be resolved:** the candidate's claim that its "de sorte" rendering of the period slur is consistent with chapters 1–2 is **false** — the live chapters 1–2 use the direct slur calque "nigger/niggere," not "sorte." This is a real cross-chapter inconsistency in the served edition and should be reconciled (pick one policy and apply it edition-wide) as part of accepting this repair, so the fix doesn't itself introduce a new, visible inconsistency into the book.
