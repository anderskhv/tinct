# Confessions Book 5 — Correction Log

Source of corrections: `book05-review.md` (21 findings: 1 major, 4 moderate, 16 minor).
Base: `book05-candidate.json` (frozen). Output: `book05-corrected.json`.
All paragraph indices below are **0-based array index** (source's own convention), matching the review.

## Major (1) — addressed

**idx 7 — M1, claim inversion.**
Candidate: "of these other things a man could be ignorant and still have perfect knowledge of piety and wisdom" (backwards — says astronomy-ignorance is compatible with perfect piety-knowledge).
Fixed to: "of that a man could be ignorant even if he had perfect knowledge of these other things" — restoring Augustine's actual claim: a man can be ignorant *of piety* while having perfect knowledge *of the scientific/astronomical things*, i.e. scientific knowledge does not entail piety. This restores the premise the rest of the paragraph's argument depends on.
Secondary fix in the same paragraph (not separately counted, per review's Mo4 note): restored quotation marks around the reported Holy-Ghost doctrine ("that the Holy Spirit... was present within him personally, with full authority"), which the candidate had dropped.

## Moderate (4) — all addressed

**idx 23 — Mo1, inverted preposition.**
Candidate: "the Catholic faith, against which I had thought nothing could be said in answer to the Manichees' objections" (states the faith was unassailable — the opposite of Augustine's Manichee-era position).
Fixed to: "the Catholic faith, in whose defense I had thought nothing could be said against the Manichees' objections" — restoring "for which" (on whose behalf) rather than "against which."

**idx 14 — Mo2, garbled idiom.**
Candidate: "she was not left behind in her weeping and praying" (reads as a spatial claim that contradicts "I secretly left").
Fixed to: "she did not slacken in her weeping and praying" — restoring the idiomatic sense of "was not behind in" (not lacking/not falling short).

**idx 21 — Mo3, ambiguous referent.**
Candidate: "the 'wreckings' carried out by wild young men were not practiced there" — "there" has two live antecedents (Rome, just mentioned; Africa, mentioned in the prior sentence), and the nearer reading points to Africa, contradicting Book 3.
Fixed to: "...were not practiced in Rome, as I had been told" — disambiguated by naming the city explicitly, matching source's unambiguous "here" (= Rome, Augustine's narrating location).

**Whole-file — Mo4, quote-style consistency.**
Candidate used single quotes for quoted terms/phrases ('holy ones', 'the Elect', 'masses', 'wreckings', 'in a figure'), inconsistent with the double-quote convention in the accepted Book 3 and Book 4 files. Converted all five to double quotes. Also restored quotation marks around the two reported doctrines the review flagged as dropped:
  - idx 7: the Holy Ghost/Comforter claim attributed to Faustus.
  - idx 17: "that it is not we who sin, but some other nature... sinning within us."

## Minor (16) — 12 applied, 1 declined, 3 declined as redundant/covered

Applied:
- **m1** (idx 0): "in judgment" → "in vengeance" (restores the harder term; softening removed).
- **m2** (idx 2): "was said to offer as food" → "set before me to feed on" (removes unwarranted reported-speech hedge).
- **m3** (idx 4): "labor to blame on you" → "labor to attribute to you" (restores symmetry with source's attribute/impute pair; removes added accusatory valence).
- **m4** (idx 5): "succession of the seasons" → "succession of time" (removes unwarranted narrowing).
- **m5** (idx 5): "I was commanded, instead, simply, to believe" → "But I was commanded to believe" (removes two added emphasis words).
- **m6** (idx 11): "he, to his credit, shrank modestly" → "he, in that respect modestly, shrank" (removes added editorial endorsement; restores scope-limiting "so far").
- **m7** (idx 11): "the honesty of a candid mind" → "the modesty of a candid mind" (modesty is the specific virtue the paragraph just illustrated; "honesty" is a different concept and drifts the meaning).
- **m8** (idx 14): "and bringing me to the water of your grace" → "for the water of your grace" (removes an asserted-as-already-accomplished action Augustine hasn't narrated yet; restores purpose sense of "for").
- **m9** (idx 16): "so generous in almsgiving" → "so constant in almsgiving" (source measures frequency, which pairs with "twice a day" that follows; "generous" changes the measured quality).
- **m11** (idx 16): "pressed upon you as though they were your own signed promise" → "pressed upon you as your own signed promise" (removes the "as though" hedge that weakens Monica's claim from holding a bond to merely comparing to one).
- **m12** (idx 19): "your mercies give thanks out of my mouth" → "your mercies confess out of my mouth" ("confess" is the book's governing/title verb; restored per review).
- **m13** (idx 22): "eloquent preaching regularly served out" → "eloquent preaching generously served out" ("plentifully" pairs with the flour/oil/wine abundance figure; "regularly" substitutes frequency for quantity).
- **m15** (idx 6): "the paths of the Great Bear" → "the circles of the Great Bear" (restores Augustine's actual figure).
- **m16** (idx 13): "suffer far worse" → "suffer incomparably worse" (restores intensity; applied even though not in the review's explicit "worth taking" shortlist, since it is a low-risk one-word fix with no ambiguity).
- **m14** (idx 22): "I was led to him without knowing it was you leading me, so that through him I might come to know you and be led to you" → "Without knowing it, I was led to him by you, so that through him I might knowingly be led to you" (restores the single adverb-pair chiasm modifying one verb, rather than splitting "knowing" into a separate outcome).

Declined:
- **m10** (idx 16, question-boundary distribution). The review itself marks this low priority: the question-mark count is correct (3=3, gate passes), the first sentence-to-question conversion is described as "defensible," and re-splitting the sentences risks introducing a new error for a purely rhetorical-beat nuance that doesn't change meaning. Declining per the review's own guidance that this finding is "flagging for the record" rather than a required fix.

Note: the review's explicit "worth taking" shortlist was m1, m7, m12, m13 — all four applied. All other minors judged safe and low-risk were also applied (m2–m6, m8, m9, m11, m14–m16), since each is a small, surgical, unambiguous word/phrase-level fix with a clear source-supported correction and no risk of over-editing sound prose.

## Untouched paragraphs

idx 1, 3, 8, 9, 10, 12, 15, 18, 20, 24 — no findings against them in the review; left exactly as in the candidate.

## Mechanical re-check results (run against `book05-corrected.json`)

- Paragraph count: 25 / 25 (matches source). PASS.
- Question-mark parity: 18 source / 18 corrected, zero per-paragraph mismatches. PASS.
- Archaism sweep (Thou/Thee/Thy/Thine/doth/dost/didst/hast/hath/wert/shalt/wouldest/couldest/ye/verily/whither/hence/thence/betook/fain/perchance/ofttimes/unto/whereof/wherein/whereby/thereof/therein/amongst/nay/behold): zero matches. PASS.
- Single-quote-as-quotation-mark sweep: zero matches (all five converted to double quotes). PASS.
- Double-quote count: 14 double-quote characters (7 pairs) present, confirming Mo4's conversions and restorations landed. Valid JSON confirmed via `json.load`.
