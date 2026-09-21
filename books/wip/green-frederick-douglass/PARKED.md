# PARKED — Narrative of the Life of Frederick Douglass (`frederick-douglass`), modern-en

**Status: PARKED, not accepted.** Parked 2026-09-21 by Claude Opus
(`claude-opus-5`) on the final re-verification pass, under the second-batch
programme's three-round rule ("park — don't lower the bar — after 3
correction rounds with remaining blockers").

`ACCEPTANCE-RECORD.md` in this directory is **superseded and must not be
treated as a verdict.** It was written by the Sonnet drafting/repair session
(`claude-sonnet-5`) after round 1 and records "ACCEPTED"; two further
correction rounds have happened since, and blockers remain.

## Why parked

The same defect — the Matthew 23 quotation at chapter 12 (Appendix),
paragraph index 2 — has now been corrected three times and is still not
clean.

| Round | Commit | What was wrong |
|---|---|---|
| 1 | `eded0d89` (as staged) → fix in-session | Quotation left entirely unmodernized KJV while all surrounding prose was modernized |
| 2 | `234d8190` | The "modernization" was verbatim NIV wording |
| 3 | `a68e08ba` | Residual NIV/ESV-derived phrasing in ~5 spots despite different words elsewhere |
| 4 (this pass) | — | **Two NIV echoes survive, one of them a phrase explicitly flagged in round 3 and left untouched** |

### Remaining blocker A — NIV wording still present (ch12 p2)

Current candidate text: *"You cross every sea and every country **to win a
single convert**, and once you have him…"*

NIV, Matt 23:15: *"You travel over land and sea **to win a single convert**,
and when you have succeeded…"*

This is a five-word verbatim match on a **distinctive** NIV choice — NIV
renders προσήλυτος as "convert" where ESV/NASB keep "proselyte", and uses
"win" where ESV uses "make". The source (KJV, as Douglass printed it) reads
"to make one proselyte". This exact phrase was named in the round-3 defect
list; four of the five flagged residuals were rewritten, this one was
carried over unchanged from `234d8190` to `a68e08ba`.

### Remaining blocker B — second NIV echo (ch12 p2, opening clause)

Current: *"They **tie up loads** too heavy to carry and pile them onto other
men's backs, and never so much as **lift a finger** themselves **to move
them**."*

NIV 23:4: *"They **tie up** heavy, cumbersome **loads** and put them on other
people's shoulders, but they themselves are not willing to **lift a finger
to move them**."*

KJV reads "bind heavy burdens… move them with one of their fingers", so
"lift a finger…move" is partly KJV-derived and weaker on its own; but
combined with "tie up … loads" (NIV's phrasing, not KJV's "bind … burdens")
this is a second independent NIV contact point in the same paragraph.

Both violate carried-forward batch-1 lesson #1: never import wording from a
different translation of the same source work.

**Fidelity itself is sound.** Clause-by-clause against source.json's KJV, the
round-3 rendering preserves every accusation and image with nothing added,
dropped or softened: heavy burdens / not a finger lifted; done to be seen;
best seats and Rabbi; shutting the kingdom; widows' houses + long prayers as
pretence; land-and-sea proselyte → twofold child of hell; tithing
mint/anise/cumin vs. judgment, mercy, faith + "not to leave the other
undone"; gnat/camel; clean cup outside, extortion and excess within;
whited sepulchres, dead men's bones, all uncleanness; outwardly righteous,
inwardly hypocrisy and iniquity. The `. . . . . .` ellipsis and the em-dash
segmentation are preserved. The earlier softening flag is genuinely fixed:
"shall receive the greater damnation" now reads "your sentence will be all
the heavier", which keeps the severity. The *only* problem is provenance of
wording.

## Further defects found on this pass (not previously flagged)

These were **not** corrected, because the three-round rule had already been
crossed; applying partial fixes would only muddy the record for whoever
picks the book up.

**C. Systematic loss of the source's emphasis markup — 15 spans across 6
paragraphs.** Not a one-off (ch12 p0) as previously thought. The candidate
*does* preserve underscore emphasis in 31 other places, so this is
inconsistency, not policy. Several are load-bearing:

| Ch | Para | Dropped |
|---|---|---|
| 3 | 0 | `_tar_` |
| 10 | 3 | `_forte_`, `_a breeder_` |
| 10 | 10 | `_get hold of me_` ×2, `_root_` ×4, `_always on my right side,_` |
| 10 | 18 | `_religious_` |
| 12 | 0 | `_slaveholding religion_`, `_Poor Heathen! All For The Glory Of God And The Good Of Souls!_` |
| 12 | 3 | `_sheep_`, `_man_` |

Judgment on ch12 p0: the emphasis **is** material and should be restored.
`_Poor Heathen! All For The Glory Of God And The Good Of Souls!_` is a mock
placard — the italics plus the handbill Title Case *are* the sarcasm, and
the candidate additionally dissolved the source's exclamatory break
("Heathen! All For…") into a dash ("Heathen—all for…"), flattening it to
ordinary narration. Same for ch12 p3, where the `_sheep_`-stealer /
`_man_`-stealer italic contrast *is* the antithesis, and for ch10 p10 where
the whole episode turns on the emphasized `_root_`.

**D. ch12 p5 — a second quotation left in unmodernized KJV.** *"Shall I not
visit for these things? saith the Lord. Shall not my soul be avenged on such
a nation as this?"* is reproduced verbatim and archaic. This is exactly the
defect class that was ruled *blocking* for ch12 p2 in round 1, yet it is
neither fixed nor listed among the deliberately-preserved items (only p1's
rhymed verse and p7's "A PARODY" song are). It is plain prose with no
meter/rhyme constraint, so the p1/p7 reasoning does not cover it. Either
modernize it or document it — the current state is an inconsistency, not a
decision. (Minor, same paragraph: source's "I soberly affirm" became "I
solemnly affirm"; *soberly* = without exaggeration, *solemnly* = gravely.)

**E. ch1 p9 — invented wording standing in for the source's own censorship.**
Source prints the slur redacted, twice — narration: `calling her at the same
time a d——d b—-h`, and direct speech: `“Now, you d——d b—-h, I’ll learn you
how to disobey my orders!”` The candidate supplies *"cursing her with a vile name"*
and *"Now, you cursed wretch, I'll teach you…"*.

Resolution for the next round: **restore the dashes verbatim in both
places.** Douglass censored this himself; the redaction is his authorial
act and part of the text's rhetoric. Supplying replacement wording inside a
direct quotation invents speech that is not in the source — a strictly worse
fidelity position than an artifact a modern reader reads without difficulty
(the dashes are self-explanatory). The separate `learn` → `teach` change is
**fine and should be kept**: period Southern dialect "learn" for "teach" is
well-documented, genuinely opaque to a contemporary reader (it reads as a
typo), and modernizing it is ordinary accessibility work consistent with how
the rest of the quoted dialogue in this book is handled. The two issues are
not the same: one modernizes a real word, the other fabricates one.

**F. Typography inconsistency — worth fixing, in scope.** Source is
uniformly curly (167 curly apostrophes, 0 straight, 0 straight double
quotes). Candidate mixes: 131 curly + 96 straight apostrophes, and 16
straight double quotes (5 paragraphs, all in ch10: p2, p7, p10, p22, p24).

Judgment: this is **not** out of scope. It is not a fidelity question, but
mixed quote glyphs inside a single rendered book are reader-visible, and
normalizing them is mechanical and carries zero fidelity risk (no word
changes). It is not a blocker on its own; it is a cleanup the next round
should run before re-review, not a reason to park.

## What the next round must do

1. Rewrite ch12 p2's Matt 23 rendering once more — at minimum "to win a
   single convert" and the "tie up … loads … lift a finger to move them"
   clause — then check the whole paragraph against NIV, ESV, NASB and NLT
   phrase by phrase, not just at the spots previously flagged. The recurring
   failure mode has been fixing the named spots and re-checking only those.
2. Restore the 15 emphasis spans in C.
3. Decide and document ch12 p5 (D).
4. Restore the redacted slur in ch1 p9, keep `teach` (E).
5. Normalize apostrophes/quotes to curly (F).
6. Re-review the Appendix in full, fresh, plus a whole-book emphasis and
   quotation-provenance sweep — the two new defect classes (C, D) were
   book-wide and were missed by two prior full passes.

No file outside `books/wip/green-frederick-douglass/` was touched on this
pass. No app, registry, deploy or audio work. No edit was made to
`candidate.json`; it remains at commit `a68e08ba`.

sha256(candidate.json) as parked =
`58162d440cd5d5a304c8912603a32824286224a8a16a9666973deeb661c0fa36`
(this pins the parked state; it is **not** an acceptance hash)
