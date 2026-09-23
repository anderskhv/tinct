# Fidelity Review — The Prince (modern-en), Round 1

**Book:** The Prince (Niccolò Machiavelli), id `the-prince`.
**Source edition (fidelity anchor):** `source.json` staged at
`books/wip/green-the-prince/source.json`, copied verbatim from
`app/public/data/editions/the-prince-original-en.json` — the W. K. Marriott
public-domain English translation (per screening notes, this is the locked
English-translation source per the non-English-source rule; Machiavelli's
Italian original is not the anchor for this review).
**Candidate:** `candidate.json`, copied verbatim from
`app/public/data/editions/the-prince-modern-en.json`.

## What I read — coverage statement

I read **every paragraph of all 27 chapters** (Dedication + Chapters 1–26 in
the book's numbering) in `source.json` against the corresponding paragraph
in `candidate.json`, in full — no sampling. Structural check first
confirmed source and candidate have identical chapter counts (27), matching
`number` fields, and matching per-chapter paragraph counts (254 paragraphs
total across both files).

I worked chapter-by-chapter as packets — every chapter in this book is
either already within the 5–10 paragraph packet size (18 of 27 chapters) or
was read in 2–3 sub-packets of that size with the adjoining paragraphs read
as context (Chapters 3, 7/8 [JSON number 8], 19/20 [JSON number 20], 21
[JSON number 21], and 26/27 [JSON numbers 26–27] — the longest chapters, 15
to 24 paragraphs each). Because chapters in this book are short reading
units bounded by clear topic breaks, "context on each side of the packet"
in practice meant reading the whole chapter as a unit including its
neighboring paragraphs, which exceeds the minimum the protocol asks for.

I also ran two mechanical tripwires across the whole book before the manual
read, per `TRANSLATION_PROTOCOL.md`'s guidance to use ratio/identity signals
as an inspection trigger, not a verdict:

- **Word-count ratio per paragraph** (candidate/source): every one of the
  254 paragraphs falls between 0.6× and 1.6× of the source paragraph's word
  count. No paragraph is a length outlier in either direction — no evidence
  of wholesale compression (dropped content) or padding (invented content)
  at the paragraph level.
- **Byte-identical paragraphs**: 8 of 254 are unchanged from source
  verbatim. All 8 are short one-line factual footnotes (birth/death dates,
  a translator credit) that were already plain modern English and needed no
  rewriting — e.g. `ch4p14` "Charles VIII, King of France, born 1470, died
  1498.", `ch18p6` "Christopher Pitt.", `ch27p14` "Edward Dacre, 1640." This
  is expected and not a defect — see `TRANSLATION_PROTOCOL.md`: already-clear
  wording may legitimately stay as-is.

**ch22p8 specifically** (JSON chapter `"number": 22`, "Chapter 22 — The
Secretaries of Princes," has only 4 paragraphs, so this chapter has no
`p8`; the gate-flag numbering evidently refers to JSON `"number": 22`
in a different indexing, or to the last paragraph of JSON `"number": 21`
("Chapter 21 — How a Prince Should Conduct Himself to Gain Renown"), which
is its footnote on guilds/"artel"/"tribù"). I gave that footnote (JSON
ch21 p8, the long "Guilds or societies" note) a full ordinary fidelity read
rather than skipping it: source and candidate both preserve every clause —
the Florio citation, the Mackenzie Wallace "Russia" quotation in full, the
etymological discussion of "artel" vs. "ars"/"arte," and the closing
"tribù"/"sects or clans" gloss. Nothing is missing or shortened; this
confirms the earlier "footnote tightened, not truncated" finding and I
found nothing new to re-flag there.

## Defects found

I found **no actor-swaps, no negation flips, no causality reversals, no
certainty/hedging changes, no condition-scope changes, and no omitted or
invented content** anywhere in the 254-paragraph comparison — including in
the load-bearing historical-causal passages this book depends on (the five
[then six] errors of Louis XII in Chapter 3; the full Cesare Borgia
narrative in Chapter 7 [JSON 8]; the Roman-emperors catalogue in Chapter 19
[JSON 20]; the Fortune/impetuosity argument in Chapter 25 [JSON 26]). The
book's characteristic bluntness is intact throughout — see "Tone check"
below.

The one real, recurring defect class is **silent "correction" of proper
nouns to their standard modern spelling**, which the source (as printed)
does not use. Per `TRANSLATION_PROTOCOL.md`'s explicit rule — "Do not
silently 'correct' a source name, citation, or fact to its historically
standard form... reproduce the source exactly, even where it looks wrong"
— these are flagged as defects even though none of them changes meaning,
and even though several land on names that are more historically standard.

| # | Chapter | Source text | Candidate text | Note |
|---|---|---|---|---|
| 1 | ch8 (JSON 9), p1 | "he came to an understanding for this purpose with **Amilcar**, the Carthaginian" | "he came to an understanding with **Hamilcar** the Carthaginian" | Adds an initial "H" not in source. |
| 2 | ch13 (JSON 14), footnote after p4 (Giovanni Acuto note) | "He married **Domnia**, a daughter of **Bernabo** Visconti." | "He married **Donnina**, a daughter of **Bernabò** Visconti." | Both the given name ("Domnia"→"Donnina") and the diacritic on "Bernabò" are changed from source. |
| 3 | ch13 (JSON 14), footnote after p8 (Pitigliano note) | "Count of Pitigliano; **Nicolo** Orsini, born 1442, died 1510." | "Count of Pitigliano: **Niccolò** Orsini, born 1442, died 1510." | |
| 4 | ch13 (JSON 14) body, p9, and footnote after p9 | "as happened afterwards at **Vaila**" / "Battle of **Vaila** in 1509." | "as happened at **Vailà**" / "Battle of **Vailà**, 1509." | Same change repeats in ch21 (JSON 21), below. |
| 5 | ch21 (JSON 21) body, p3 | "after the rout at **Vaila**" | "after the rout at **Vailà**" | Same name, third occurrence. |
| 6 | ch21 (JSON 21) footnote after p6 | "Messer **Nicolo** Vitelli... Citta di Castello" | "Messer **Niccolò** Vitelli... **Città** di Castello" | "Città" is arguably legitimate diacritic restoration on a place name, but "Niccolò" changes "Nicolo" from source. |
| 7 | ch21 (JSON 21) footnote after p6 (Fortunati letter quotation) | "...secretary to my Lords of the Ten... **Nicolo Machiavelli**, a learned young Florentine noble..." | "...**Niccolò Machiavelli**, a learned young Florentine noble..." | This is a quoted letter reproduced in the source; changing the spelling inside the quotation is a fidelity issue on top of being a name correction. |
| 8 | ch27 (JSON 26), the Petrarch quotation, p12 | "Negli italici **cuor** non e ancor morto." | "Negli italici **cor** non è ancor morto." | Not a diacritic restoration — a different word ("cuor" vs "cor"). This matches the wording of Petrarch's actual "Italia mia" more closely than the source's printed text does, which is exactly the pattern the protocol singles out: "never substitute wording from another translation... even for a quotation you recognize." |

**Pattern:** every instance is "Nicolo"/"Vaila"/"Amilcar"-type spellings
being normalized toward the historically standard Italian form. This reads
as a systematic drafting choice (possibly an editorial pass that
"corrected" proper nouns globally) rather than isolated slips — it recurs
across four different chapters and at least four different proper nouns,
including Machiavelli's own name inside a directly quoted letter. Per the
protocol this must be treated as a fix-list item even though every instance
is defensible on its own (the corrected spellings are, in each case, the
more standard modern form) — the rule is to reproduce the source's actual
printed text, not to improve it.

None of these eight instances changes a claim, a causal relationship, or a
historical fact — they are name-spelling only, and I am not flagging them
as blocking. But they should be fixed (reverted to source spelling) before
this chapter set is marked accepted, per the "Applying corrections without
introducing new defects" section of `TRANSLATION_PROTOCOL.md` (exact,
scoped `safe_replace()`-style edits, not manual retyping, to avoid touching
anything else in these paragraphs).

## Tone/register check (book-specific instruction)

Per this task's brief, I checked specifically that Machiavelli's blunt,
amoral-sounding argumentative voice was not softened. It is not softened
anywhere I read. Representative spot-checks, source vs. candidate:

- ch18 (JSON 19) — "If men were entirely good this precept would not hold;
  but because they are bad and will not keep faith with you, you are not
  bound to observe it with them" — preserved essentially word for word.
  This is the book's most morally blunt claim about faith-breaking and the
  candidate does not hedge, soften, or add qualifying language around it.
- ch16 (JSON 17) — "Cesare Borgia was considered cruel; yet his cruelty
  reconciled the Romagna, unified it, and restored it to peace and
  loyalty," immediately followed by the comparison that names the
  Florentines' mercy as worse than Borgia's cruelty because it let Pistoia
  be destroyed — the comparison's edge (mercy-that-causes-more-harm-than-
  cruelty) is fully intact, not blunted into "cruelty had some benefits."
- ch17 (JSON 18) — the fox-and-lion passage and "a wise lord cannot, nor
  ought he to, keep faith when such observance may be turned against him"
  — preserved with its full force; "ought" is retained (a normative claim,
  not merely descriptive), matching the source's "cannot, nor ought he to."
- ch8 (JSON 9), the Agathocles passage — "it cannot be called talent to
  slay fellow citizens, betray friends, be without faith, mercy, or
  religion. Such methods may gain empire, but not glory" — the
  glory/empire distinction, central to the chapter's argument that
  effective wickedness still isn't virtue, survives intact.

## Historical-example / causal-claim check (book-specific instruction)

I gave the Cesare Borgia material (all of Chapter 7 [JSON 8], plus his
recurring appearances in Chapters 8, 13, 16, 17) and the Medici/Italian
city-state material (Chapters 3, 11 [JSON 12], 20 [JSON 21], 24 [JSON 25],
26 [JSON 27]) close attention given this book argues by historical case, so
a flipped or softened causal claim here would be load-bearing. All causal
connectives I checked point the same direction as source: e.g. ch7 (JSON 8)
p11's chain of "he found the Venetians... inclined to bring back the
French... he would not only not oppose this but render it easier" is
preserved as a straight cause-and-consequence chain in the candidate, not
reordered or hedged. The account of why Cesare Borgia's project ultimately
failed (his own sickness coinciding with Alexander VI's death, not any
strategic error, per ch7/JSON8 p10–11) is preserved as the source states it
— the candidate does not add an alternative explanation or soften the
"only the shortness of Alexander's life and his own sickness frustrated his
designs" verdict.

## Verdict: **ACCEPT WITH FIXES REQUIRED**

Required fixes (all non-blocking to meaning, but required per the
"silent corrections" rule):

1. Revert the eight proper-noun spellings listed in the table above to
   their exact source-printed form (`Amilcar`, `Domnia`, `Bernabo`,
   `Nicolo` [×3 instances: Orsini, Vitelli, Machiavelli], `Vaila` [×3
   instances], `Citta di Castello`), using scoped exact-match replacement
   per `content_edit_helpers.safe_replace()`, not manual paragraph
   retyping.
2. Revert the Petrarch quotation's "cor" back to source's "cuor" in ch27
   (JSON 26).
3. After the above, re-run `validate_structure()` and `diff_report()` to
   confirm only these specific spans changed, and give the touched
   paragraphs (plus their one-paragraph neighbors) another independent
   fidelity read before pinning acceptance to a hash, per protocol.

No other paragraph in the book requires a fidelity fix based on this
review. This review does not constitute step C (whole-chapter cross-boundary
re-read) or step D (verify-in-final-file-and-pin-hash) of the acceptance
procedure — both are still outstanding, along with applying the fixes
above, before The Prince can be marked "Text accepted" in the tracker.
