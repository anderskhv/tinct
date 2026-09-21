# Fidelity Review — The Taming of the Shrew, modern-en

Fidelity anchor: `source.json` (staged copy of
`taming-of-the-shrew-original-en.json`), locked, unmodified.

**Coverage:** All 12 chapters, all 1021 paragraphs, read individually
against source with neighboring-paragraph context, chapter by chapter, in
full (not sampled). Followed by a dedicated whole-book cross-boundary
re-read and a second dedicated sweep specifically for silently-corrected
non-standard wording (malapropisms, dialect, archaic proper-noun forms),
per this batch's standing instructions after the Douglass/Gilgamesh/
Midsummer parked-book failures.

## Structural note (not a candidate defect, flagged for the record)

`source.json` does not contain the Induction (Christopher Sly's framing
scenes) except for a short "Presenters above speak" fragment at the tail
of Act 1 Scene 1 (5 lines: paras 74-78). The bulk of Sly's malapropism-
heavy material (the Lord finding him drunk, the servants' deception, most
of his "Marry, if you say true" lines) is simply absent from this
original-en source — not truncated by this task, not something this
lane can add (out of scope: candidate must render what source has, never
import from another edition). The 5 Sly-adjacent lines present in source
were checked and are rendered faithfully, including the deliberately odd
"madam lady" address, which was NOT normalized to "my lady." This gap is
worth a separate structural-repair task against `original-en` at some
point, but does not block modern-en acceptance of the text that exists.

## Round 1 defects found and fixed (5 total, all applied via
`content_edit_helpers.safe_replace`, verified against `candidate.before-round1.json`
via `diff_report`/independently re-checked against source afterward)

1. **Ch2 (Act 1 Sc.2) ¶2 — silently-corrected malapropism (BLOCKING).**
   Source: Grumio says "Is there any man has **rebused** your worship?" —
   a drunk/comic-servant malapropism for "abused." Candidate had
   silently corrected this to "insulted," erasing the malapropism
   entirely (the exact defect class that parked Douglass/Gilgamesh/
   Midsummer). **Fix:** restored "rebused" in place, keeping the rest of
   the line modernized around it.

2. **Ch3 (Act 2 Sc.1) ¶121 — silently-standardized proper noun.**
   Source prints "Dian" (Shakespeare's own metrical short form for
   Diana), twice in this paragraph. Candidate had silently expanded both
   to "Diana." **Fix:** restored "Dian" both times, matching source's own
   printed form.

3. **Ch3 (Act 2 Sc.1) ¶134 — silently-standardized proper noun.**
   Source prints "Grissel" (the period spelling of Griselda, the
   "Patient Griselda" legend). Candidate had silently modernized this to
   "Griselda." **Fix:** restored "Grissel."

4. **Ch12 (Act 5 Sc.2) ¶101 — meaning drift in Katherina's final speech.**
   Source: "graceless traitor to her loving lord" — "graceless" (lacking
   grace/decency, shameless) was rendered as "ungrateful traitor,"
   which shifts the accusation from moral shamelessness to a failure of
   thanks — not licensed by source. "Graceless" is already plain modern
   English and needed no rewording. **Fix:** restored "graceless
   traitor."

5. **Ch12 (Act 5 Sc.2) ¶44 — meaning drift.**
   Source: "the **veriest** shrew of all" (superlative of degree — "the
   utmost/biggest shrew"). Candidate rendered this as "the most
   **genuine** shrew of all," which reads as a claim about authenticity
   rather than degree — not what source says. **Fix:** "the biggest
   shrew of all."

All five fixes were independently re-verified against `source.json`
after applying (see quoted source/candidate pairs above and the
re-verification script output in this session). `diff_report` confirmed
only paragraphs {2}, {121, 134}, {44, 101} changed in chapters 2, 3, and
12 respectively — no paragraph outside the intended scope was touched.
Structure validated (12 chapters, 1021 paragraphs each side, no
empty/whitespace paragraphs) after the edit round.

## Dedicated sweep for the "silently-corrected non-standard wording"
defect class (mandatory per batch instructions)

Ran a full-book grep of every GRUMIO-spoken line in source against its
candidate counterpart (the character carrying malapropisms in this play
besides Sly) — no other malapropism-erasure found beyond ¶2 above; every
other Grumio line's distinctive wording (cony-catching, "two-and-thirty,
a pip out" rendered as an idiom not a malapropism, "faced"/"braved"
tailor pun, etc.) is preserved or legitimately modernized as an archaism,
not a deliberate "wrong word."

Ran a full-book proper-noun sweep (~50 names/places checked: Vincentio,
Tranio, Lucentio, Baptista, Petruchio, Katherina, Bianca, Hortensio,
Gremio, Grumio, Biondello, Curtis, Nathaniel, Troilus, Ferdinand, Minola,
Agenor, Anna, Carthage, Jove, Minerva, Lucrece, Æacides, Ajax, Bergamo,
Pisa, Padua, Mantua, Verona, Rheims, Florence, Sugarsop, and the servant
names, plus Dian/Grissel/Xanthippe/Sibyl/Florentius/Alcides/Hercules/
Leda/Paris) for any name present in source but silently dropped/altered
in candidate — found and fixed the two instances above (Dian, Grissel);
no others.

## Wordplay/pun check (specifically requested)

Checked every scene with structural wordplay for erasure vs. legitimate
modernization:
- Kate/cates pun (ch3 ¶74) — preserved ("for all dainties are Kates").
- moveable/joint-stool, wasp-sting double entendres (ch3 ¶75-95) —
  preserved line-for-line.
- bass/base pun on the lute lesson (ch4 ¶20-22) — preserved via the
  bass/base homophone, matching source's own device.
- "face"/"brave" tailoring pun (ch8 ¶59-61) — the candidate maps the two
  source puns onto "trim"/"face" instead of "face"/"brave." This swaps
  which word carries which sense but keeps both double meanings (sewing
  term vs. confrontation) intact and the comic logic of the exchange
  unbroken. Judged non-blocking: a creative-but-faithful pun rendering,
  not an erasure, and re-deriving Grumio's argument from source confirms
  no claim/actor/negation changed. Left as-is.
- Petruchio's sun/moon insistence scene (ch10) — full exchange preserved,
  no softening of Petruchio's coercive game or Katherina's capitulation.

## Content-sensitivity check (Petruchio's methods, Kate's final speech)

Read both flagged passages (ch6 ¶87 "kill a wife with kindness" falconry
speech; ch12 ¶101 Katherina's submission speech) against source in full.
Neither is softened, moralized around, or edited for modern comfort;
both render every clause and image source has, including the parts
modern readers may find uncomfortable (treating Kate as property/goods
in ch5 ¶83; the full submission speech's argument, not a summary of it).

## Cross-boundary re-read (step C)

Re-read the whole book once more start to finish after the round-1
fixes, checking recurring terms/images across scene boundaries: the
falcon/taming imagery (ch6→ch12), the "curst"/shrew epithet applied to
Katherina throughout (rendered variably as shrewish/cursed/shrew across
chapters — legitimate synonym variation for a recurring archaic
adjective, not an inconsistency), the Kate/cates pun set up in ch3 and
not reused elsewhere (correctly not over-extended), and the Sly framing
fragment's consistency with itself. No new defects found.

## Verdict

**ACCEPT WITH FIXES REQUIRED** at round 1 — all 5 fixes applied and
independently re-verified (see above). No blocking defects remain after
the fix round and the whole-book sweep. See `ACCEPTANCE-RECORD.md` for
the final hash and coverage table.
