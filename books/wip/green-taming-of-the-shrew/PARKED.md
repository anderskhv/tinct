# PARKED — The Taming of the Shrew (`taming-of-the-shrew`), modern-en

**Status:** PARKED after 3 correction rounds, per the programme's
three-round rule (`books/wip/SECOND-BATCH-TRACKER.md`). Not accepted.
Do not publish `candidate.json`.

**Parked by:** Claude Opus (model id `claude-opus-5`), final-gate
verification pass, 2026-09-21.

**Candidate state at park time:**
`candidate.json` sha256
`9568aa181151cac5d245b75b49c357f43d71d8ba76f2bd7a8448b7906692453d`

A premature `ACCEPTANCE-RECORD.md` had been written in this directory at
16:14, before the round-2 fixes landed at 16:18 and before this
verification pass ran. It asserted the candidate was final and accepted.
It has been **deleted** to prevent a not-accepted text being picked up as
release-ready. Its coverage table is reproduced below.

---

## Structure (verified, clean)

Scripted comparison against `source.json`:

| Chapter | Title | Source ¶ | Candidate ¶ |
|---|---|---|---|
| 1 | Act 1, Sc 1 — Padua. A public place | 80 | 80 |
| 2 | Act 1, Sc 2 — Before Hortensio's house | 96 | 96 |
| 3 | Act 2, Sc 1 — A room in Baptista's house | 170 | 170 |
| 4 | Act 3, Sc 1 — A room in Baptista's house | 45 | 45 |
| 5 | Act 3, Sc 2 — Before Baptista's house | 95 | 95 |
| 6 | Act 4, Sc 1 — Hall in Petruchio's country house | 89 | 89 |
| 7 | Act 4, Sc 2 — Before Baptista's house | 58 | 58 |
| 8 | Act 4, Sc 3 — A room in Petruchio's house | 96 | 96 |
| 9 | Act 4, Sc 4 — Before Baptista's house | 44 | 44 |
| 10 | Act 4, Sc 5 — A public road | 32 | 32 |
| 11 | Act 5, Sc 1 — Before Lucentio's house | 103 | 103 |
| 12 | Act 5, Sc 2 — A room in Lucentio's house | 113 | 113 |
| **Total** | | **1021** | **1021** |

Speaker-tag parity, stage-direction parity and italic-markup parity were
also swept mechanically across all 1021 paragraphs. Two italic
differences found, both benign and **not** defects: ch3 p33 and ch8 p65,
where the candidate adds italics to `_Backare!_` and `_Imprimis_`,
matching the source's own italicisation of the same Latin/mock-Latin tags
elsewhere.

## Full defect history

### Round 1 — 5 defects, fixed
1. A malapropism flattened to its "correct" word.
2. "Dian" modernised away from the source's printed period spelling.
3. "Grissel" likewise.
4. "graceless traitor" (ch12 submission speech) semantically altered.
5. "the veriest shrew" (ch12 p44) flattened out of the superlative degree.

An independent verification pass confirmed all five held. It also
confirmed that the missing Induction / Christopher Sly framing is a
genuine property of the locked `source.json` — verified again in this
pass: source chapter 1 is "Act 1, Scene 1" and its first paragraph is
"Flourish. Enter Lucentio and Tranio." **Not a candidate defect.**

### Round 2 — 4 further defects, fixed
All four re-derived from source in this pass and confirmed correct.
(Round-2 notes used 0-based paragraph indices; 1-based locations given in
brackets.)

1. **ch12 p101 [p102]** — Katherina's submission speech: "froward and
   unable worms" had been softened to "contrary and incapable creatures".
   Now reads "Come, come, you froward and unable worms!" — correct.
2. **ch9 p37 [p38]** — Biondello: "I have more to say, but" had been
   inverted to "I've nothing more to say, except". Now reads "I have more
   to say, but bid Bianca farewell for ever and a day." — correct.
3. **ch1 p24 [p25]** — Gremio: the invented referent "her sister's
   tongue" is gone; now "make her pay the price of her tongue" — correct.
4. **ch11 p33 [p34]** — Biondello's comic doubled "old" restored: "What,
   my old worshipful old master?" — correct.

### Round 3 (this pass) — 2 defects remaining, NOT fixed

Per the three-round rule these are documented, not corrected.

**D1 (blocking) — ch2 p28, Grumio: a source quantity silently changed.**

- Source: "She may perhaps call him **half a score** knaves or so"
- Candidate: "She may call him **half a dozen** knaves or so"

Half a score is ten; half a dozen is six. Nothing forced the change —
"half a score" is not a pun, not a crux, and "ten" is plain modern
English. This is a silent alteration of the source's own content, the
same class as the round-2 dropped "old", and it sits in exactly the
Grumio/Biondello comic register that had already been the site of missed
defects twice. A defence exists (both are vague-quantity idioms and the
line is hyperbole, not a count) but the programme's bar is fidelity to
the locked source, and that bar was applied to smaller losses than this
one in rounds 1 and 2.

**D2 (blocking) — "Katherine the curst": a recurring epithet altered and
rendered three different ways.**

The epithet is a fixed title in this play. The candidate renders it
inconsistently, and in two places substitutes a different word:

| Location | Source | Candidate |
|---|---|---|
| ch2 p30 | "**Katherine the curst!** A title for a maid of all titles the worst." | "**Katherine the shrew!** Of all titles for a girl, the worst." |
| ch3 p74 | "sometimes **Kate the curst**" | "sometimes **Kate the shrew**" |
| ch2 p48 | "woo **curst Katherine**" | "woo **cursed Katherine**" |
| ch12 p110 | "thou hast tam'd a **curst shrew**" | "you've tamed a **cursed shrew**" |

At ch2 p30 Grumio is explicitly naming *the title*, and the substituted
word is the play's own title-word, so a reader will take "Katherine the
shrew" to be the source's phrase. Two paragraphs' distance later the same
epithet appears as "cursed", which makes the inconsistency visible
in-text. This is the naming/normalisation class the batch has been
burned by before (Medea's silent name correction; the Bacchae
case-sensitivity gap) and is a carried-forward failure lesson in the
tracker: reproduce the source's own printed form.

## Non-blocking items found in this pass (recorded, not defects)

Kept deliberately, each with a reader-centered reason:

- **No Induction / Christopher Sly frame.** Confirmed a genuine property
  of the locked source, not an omission by the candidate. A modern
  edition cannot invent two scenes that the fidelity anchor does not
  contain.
- **"Jacks fair within, the Jills fair without"** (ch6 p16) rendered
  "cups clean inside, the girls neat outside". The pun turns on two dead
  senses at once; carrying both in one clause is not available in modern
  English, and glossing one half each way keeps the sentence readable.
- **"you hit the white"** (ch12 p107) rendered "you hit the bullseye".
  The Bianca/*bianco* pun is untranslatable; the archery sense is the one
  the joke needs to land.
- **"faced"/"braved"** (ch8 p59–61) mapped to "trimmed"/"faced". The
  doubled tailoring/bravado pun is preserved structurally, which is the
  point of the exchange.
- **ch1 p13** — "it is not half way to **her** heart … **her** care"
  rendered as "marriage isn't halfway to **my** heart … **my** concern".
  Kate's third-person self-reference reads as a printing error to a
  modern reader; the first-person reading is the standard editorial one.
  Noted as interpretive, below the blocking line.
- Bawdy and violence are **not** softened anywhere checked: "my tongue in
  your tail" (ch3 p96), "thy horn is a foot" (ch6 p10), "Swinge me them
  soundly forth" (ch12 p82), and the whole wasp/sting exchange survive
  intact.

## Verification actually performed in this pass

- All 4 round-2 fixes re-derived from `source.json` at their exact
  locations — all correct.
- Dedicated word-for-word pass over **every** line of Biondello (38),
  Grumio (62), Tranio (90) and Curtis (20) against source — 210
  paragraphs. D1 found here.
- Katherina's full submission speech (ch12 p101) re-verified clause by
  clause, plus the surrounding ch12 p82–p113 block. No softening, no
  moralising, no dropped clause; the hardest lines ("thy lord, thy king,
  thy governor", "place your hands below your husband's foot") are
  intact.
- Spot-checks across acts not previously examined: ch1 p8–13, ch3 p33,
  ch3 p84–103, ch4 p8–19, ch5 p70–75, ch8 p24–39, ch10 p0–13, ch11
  p76–83.
- Whole-book mechanical sweeps: numeral/quantity parity (D1 surfaced
  here), epithet sweep on curst/cursed/shrew (D2 surfaced here), speaker
  tags, stage directions, italic markup.

## Recommendation

Both remaining defects are small, local and mechanically fixable — this
book is much closer to clean than Gilgamesh or Midsummer were at park
time, and both defects are single-paragraph-class rather than a
systematic pattern. It is a strong candidate to be the **first pick when
parked books are revisited**, not a rewrite. Per the programme, pull the
next eligible book (backup: Oresteia) in its place now.
