# PARKED — Romeo and Juliet (`romeo-and-juliet`, modern-en)

**Status:** PARKED at round 2 of 3. **No acceptance hash issued.**
**Date:** 2026-09-21
**This round:** independent adversarial fidelity verification, **Claude Opus
(`claude-opus-5`)**. Round 1 (find-and-fix, self-certified clean) was
**Claude Sonnet 5**.

No `accepted-paragraph-hashes.tsv` and no `RELEASE-PACKET.md` were written.
Only files inside this directory were touched. No app/registry/audio/deploy
change, no paid API calls.

---

## Summary

Round 1 self-certified the book clean after fixing 12 defects, explicitly
claiming it had run a *dedicated, curated, non-sampled* register check, a
location-keyed proper-noun map, a rare-word cross-reference, and a
complete NURSE-tagged voice check.

This round independently re-derived everything from `source.json` and
`candidate.json`. Round 1's structural work and all 12 of its fixes are
**confirmed correct**. But its central claim — that the register-softening
class was exhausted — is **false**. A fresh, independently-built sweep found
**at least 19 further live instances of the same class on its first pass**,
including two that round 1's own review text explicitly and incorrectly
certifies as clean.

This is the exact recurring pattern that hard-parked **Merchant of Venice**
and parked **Merry Wives of Windsor**, **Richard III** and **Midsummer** in
this batch: erasure of the source's own printed forms — crude/bawdy
vocabulary swapped for milder near-synonyms, named things replaced by
generic descriptors, character coinages/malapropisms flattened. Exhausting
it requires a book-wide convention decision and real editorial judgment
across dozens of locations, not a narrow mechanical patch. Per the task's
own rule, the verifier does **not** fix it. Round 3 is the last round before
hard park.

---

## What this round verified as CORRECT

**Structure** (re-derived, not trusted): 25 chapters both files, all real
Act/Scene reading units (Prologue, Act 1 Sc.1–5, Act 2 Sc.1–6, Act 3 Sc.1–5,
Act 4 Sc.1–5, Act 5 Sc.1–3). No apparatus/editorial/collation/crosswalk
chapters. Per-chapter paragraph counts match exactly; **1,062 paragraphs**
both sides. `sections` arrays identical. JSON valid both sides. No
empty/whitespace-only paragraph.

**Hashes** (computed this round, match round 1's claims):
- `source.json` → `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276`
- `candidate.json` → `68520dd1cfc6a4910f127d239e741c44c6af4ac1f43406857b375977e2f6ad6f`

**The truncated-quote flag: confirmed a genuine false positive.** Located at
chapter 16, paragraph index **4 (0-based)** — the index round 1 cited, and
the 0-based reading is the correct one (index 4 is Capulet's speech; index 3
is Lady Capulet, index 5 is Paris's "Monday, my lord"). Source: "…And bid
her, mark you me, on Wednesday next, But, soft, what day is this?" Candidate:
"…and tell her — listen carefully — that next Wednesday… wait, what day is
this?" The source itself has Capulet interrupt himself mid-sentence; the
candidate's ellipsis renders that same self-interruption. No clause dropped.
Confirmed false positive. *(Minor, separate: "my son Paris' love" → "Paris's
love" drops Capulet's prospective "my son" — see the minor list below.)*

**All 12 round-1 fixes: independently re-derived from `source.json` by
distinctive phrase search (not by trusting cited paragraph numbers), all 12
confirmed present, correct and at the claimed locations:**

| Loc (ch, 0-based ¶) | Verified in candidate |
|---|---|
| 2,68 | "Aurora's bed" restored |
| 7,9 | "young Abraham Cupid" restored — source's own printed form, not the "Adam Cupid" emendation |
| 8,23 | "Jove laughs" restored |
| 9,1 | "Titan's fiery wheels" restored |
| 14,1 | "toward Phoebus's resting place" restored, "fiery-footed" kept |
| 17,4 | "Cynthia's brow" restored |
| 4,2 | "on my maidenhead" restored |
| 10,13 | "a very good whore" restored |
| 10,55 | "the bawdy hand of the clock is right on the prick of noon" restored |
| 10,64 | "A bawd, a bawd, a bawd!" restored |
| 21,7 | "quite the mouse-hunter" restored |
| 22,18 | "a flower, deflowered by him" restored |

**Other sweeps run this round that came back clean or near-clean:**
- **Stage-direction integrity:** every `[...]` bracketed direction in source
  matched against candidate, per paragraph. Exactly **one** mismatch
  book-wide (ch5 ¶11, below).
- **Compression sweep**, all 1,062 paragraphs, moderate band included
  (ratio < 0.80 with source ≥ 12 words): only 11 paragraphs. Read all 11;
  two carry real image loss (below), the other nine are legitimate
  modern-English tightening.
- **Mercutio's death curse:** "A plague o' both your houses" preserved at
  all three occurrences (13,38 / 13,43 / 13,45), including the final bare
  "Your houses!" — clean.
- **Friar Lawrence's scenes and the potion plan** (ch9, ch12, ch15, ch18
  ¶30–35, ch24, ch25 ¶95): read word-for-word, faithful. The 42 hours, the
  vial, the letter to Romeo, Friar John's delay, the whole confession
  speech — all intact.
- **Balcony scene** (ch8) and **tomb scene** (ch25): read word-for-word; no
  blocking defect found beyond the class below.
- **Character-name map, location-keyed:** all speaker tags and character
  names correct at every location; the ch3 ¶22 guest list is complete and in
  order.
- **NURSE voice:** all **88** NURSE-tagged paragraphs read, not sampled.
  Her digressive, self-interrupting, repetitive structure is broadly
  preserved (the ch4 ¶12 earthquake/weaning monologue keeps its full
  rambling shape and both "Won't you, Julie?" callbacks). But see the
  oath-flattening and coinage findings below — the *structure* survives,
  parts of the *vocabulary* do not.

---

## BLOCKING — live instances of the register-softening / printed-form
## erasure class (round 1 claimed this class was exhausted)

All located by an independently-built sweep: a ~150-stem charged-vocabulary
list derived fresh from `source.json`, applied per paragraph, flagging any
stem present in a source paragraph and absent from its candidate
counterpart, then read by hand.

### B1 — ch7 ¶13: Mercutio's medlar / open-arse / poperin-pear joke gutted
> SRC: "Now will he sit under a **medlar** tree, And wish his mistress were
> that kind of fruit As maids call **medlars** when they laugh alone. O Romeo,
> that she were, O that she were An **open-arse** and thou a **poperin pear**!"
>
> CAN: "Now he'll sit under a **fruit tree** and wish his girlfriend were that
> kind of fruit that girls laugh about in private. Oh Romeo, if only she
> were, and you **a nice ripe pear**!"

The fruit is unnamed, "open-arse" (the medlar's actual period name, and the
whole point of the joke) is erased outright, and "poperin pear" (pun on
"pop-her-in") becomes "a nice ripe pear". This is the *same defect* as the
ch10 ¶55 "bawdy hand / prick of noon" softening round 1 found and fixed —
and it is arguably the single crudest line in the play. Round 1's register
word list did not contain "arse", "medlar" or "poperin".

### B2 — ch2 ¶13: "civil" → "rough" (meaning inversion + imported emendation)
> SRC: "when I have fought with the men I will be **civil** with the maids, I
> will cut off their heads."
> CAN: "after I've fought with the men, I'll be **rough** with the women."

Source prints "civil" (the ironic word is the joke's hinge). The candidate
silently adopts the editorial emendation "cruel", rendered as "rough" —
inverting the printed meaning. Direct violation of the batch's
carried-forward lesson "never silently correct to a historically standard
form; reproduce the source's own printed form" (cf. Merchant of Venice).

### B3 — ch2 ¶17: "a pretty piece of flesh" → "quite the man"
Sampson's bawdy self-description flattened to a neutral idiom.

### B4 — ch2 ¶20: "My **naked** weapon is out" → "My weapon is out"
The bawdy modifier is simply deleted.

### B5 — ch5 ¶24 (Queen Mab): four separate erasures in one speech
- "foul **sluttish** hairs" → "dirty hair" (crude word deleted)
- "This is the **hag**" → "This is the **spirit**" (Mab de-fanged at the
  speech's turn into menace)
- "a **tithe-pig's** tail" → "a pig's tail" (tithe dropped; the parson's
  dream of a benefice depends on it)
- "on the fore-finger of an **alderman**" → "on a **mayor's** finger"
  (office silently changed)

### B6 — ch17 ¶52: three insults erased in one speech
"Mistress **minion** you" → "you spoiled little girl"; "you green-sickness
**carrion**" → "you pale-faced wretch"; "you **baggage**" → "you worthless
girl". Round 1's register list explicitly names "carrion" and reports no
finding — it is live here.

### B7 — ch17 ¶55: two more in Capulet's next speech
"Hang thee young **baggage**" → "Hang you" (the noun deleted entirely);
"Out on her, **hilding**" → "you worthless girl".

### B8 — ch19 ¶11: "A peevish self-will'd **harlotry** it is" → "a stubborn, willful little brat"
Round 1's list explicitly names "harlot" and reports only ch10 ¶16 (where
"harlots" is correctly kept). This occurrence was missed.

### B9 — ch21 ¶18: "a merry **whoreson**" → "A funny fellow"
Identical in kind to the ch10 ¶13 "whore" → "ladies' man" softening round 1
*did* fix. "whoreson" was not in round 1's list.

### B10 — ch15 ¶11: "**carrion** flies" → "Flies"
Second live "carrion" erasure; also drops "More validity, more honourable
state" into a single "more honor, more status".

### B11 — ch11 ¶21: "the **wanton** blood up in your cheeks" → "the color rushing to your cheeks"
Round 1 explicitly certifies that every source use of "wanton" is
non-sexual and correctly rendered. This one **is** sexual (the Nurse teasing
Juliet on her wedding morning) and it is deleted. The same paragraph
replaces "climb a **bird's nest**" with the flat "reach your window".

### B12 — ch22 ¶54 / ¶55: "pestilent **knave**" → "annoying fool"; "**Hang him, Jack**" → "Forget him"
Both crude and both softened; "Hang him" and the name-jibe "Jack" are gone.

### B13 — ch10 ¶74: "twenty such **Jacks**" → "twenty more like him"
Same "Jack" jibe erased a second time, in the Nurse's own indignation
speech.

### B14 — ch4 ¶12: "**wormwood**" erased twice — and round 1 certifies the opposite
> SRC: "I had then laid **wormwood** to my **dug**" … "When it did taste the
> **wormwood** on the **nipple** Of my **dug**"
> CAN: "I had put **a bitter herb** on my breast" … "When the baby tasted
> **the bitterness**"

A specific named plant is replaced by a generic descriptor — the exact class
round 1 fixed for Aurora/Jove/Titan. `fidelity-review-1.md` §5 states that
"the long **'wormwood on my dug'** story is kept at full length"; the phrase
it quotes as preserved is not in the candidate at all. Also dropped from the
same paragraph: "by th'rood", "by my holidame", "pretty fool"/"pretty
wretch" flattened to the identical "the sweet little thing" twice, erasing
the source's own variation.

### B15 — Nurse/character coinages and malapropisms flattened
`fidelity-review-1.md` states flatly: "no malapropism erasure (none of this
play's roles carry a malapropism dialect)". That is wrong — the Nurse does,
and instances are live:
- ch10 ¶72: "so full of his **ropery**" → "so full of his vulgar jokes"
  (her coinage for "roguery" — and round 1's §5 cites this exact line as
  evidence her voice is preserved)
- ch10 ¶89: "as pale as any clout in the **versal** world" → "as pale as a
  sheet" (her malapropism for "universal")
- ch10 ¶89 also *adds* a title not in source: "one Paris" → "a **Count**
  Paris"

### B16 — systematic oath flattening (book-wide, ~25+ locations)
"**Marry**" (by the Virgin Mary) is deleted at roughly a dozen locations
(4,17; 6,26; 6,43; 6,52; 10,16; 11,17; 13,22; 13,40; 17,44; 17,75; 19,6;
19,18; 22,1; 22,47). "**i'faith** / in faith" deleted at roughly a dozen
more (4,8; 4,23; 10,61; 10,77; 17,68; 17,69; 21,5; 21,18; 22,28; 22,41;
22,51). "**Jesu**" deleted at 9,13 / 10,13 / 11,9. These are period-marked
oath vocabulary and, for the Nurse and Mercutio, part of the voice. This
needs a **book-wide convention decision** (keep, gloss, or drop
consistently) — it is not a paragraph-level patch, which is part of why
this is parked rather than verifier-fixed.

### B17 — ch10 ¶11: "the very butcher of a **silk button**" → "the absolute butcher of precision"
A concrete image replaced with an abstraction.

### B18 — ch10 ¶16: "Without his **roe**" → "Looking gutted"
Erases the roe/Ro[meo] pun, the reason the line opens the exchange.

### B19 — ch13 ¶70: "This is the truth, or let **Benvolio** die" → "or let me die"
Benvolio's self-naming — the formal oath-shape of his deposition to the
Prince — is flattened to a pronoun.

---

## BLOCKING — dropped stage direction (single instance, but real content loss)

### S1 — ch5 ¶11: `[_Putting on a mask._]` deleted
> SRC: "Give me a case to put my visage in: **[_Putting on a mask._]** A visor
> for a visor."
> CAN: "Give me a mask to cover my face. A mask over a face that's already a
> mask."

The stage direction is gone entirely. This is the **only** bracketed
direction in the book that does not survive (verified by an exhaustive
per-paragraph bracket-count diff across all 1,062 paragraphs, so round 3 can
treat this as a closed, one-instance finding). Narrow enough to be
mechanical, but left unfixed here so round 3 owns a single coherent edit
pass rather than inheriting a part-edited file.

*(Related, non-blocking: source's Gutenberg italic `_` markers are dropped
throughout — 17 in source, 1 in candidate — while the bracketed direction
text itself is preserved. That is consistent formatting normalization, not
content loss, and is fine.)*

---

## Non-blocking but worth round 3's attention

- **ch14 ¶1** — "every tongue that speaks **But Romeo's name** speaks heavenly
  eloquence" → "every voice that speaks anything other than Romeo's name **is
  as nothing compared to his heavenly eloquence**". The candidate reverses
  the more natural reading ("every tongue that speaks *only* Romeo's name
  speaks heavenly eloquence") **and** adds a comparison ("is as nothing
  compared to") not in source. Interpretive change plus invented content.
- **ch4 ¶2** — the round-1 fix restored "maidenhead" correctly, but the
  candidate reads "on my maidenhead, **back when I was twelve years old**, I
  told her to come", attaching "at twelve year old" to the *telling* rather
  than to the maidenhead sworn by. As rendered, the Nurse tells Juliet to
  come when the Nurse herself was twelve — a nonsense the source does not
  produce.
- **ch2 ¶67** — drops the whole "worshipp'd sun peer'd forth the golden
  window of the east" image (→ "dawn"), plus "Being one too many by my weary
  self" and "Pursu'd my humour, not pursuing his". Real image loss, ratio
  0.75.
- **ch2 ¶72** — drops Montague's guarded parenthesis "I will not say how
  true" and "dedicate his beauty to the sun". Ratio 0.73.
- **ch17 ¶1** — drops "That pierc'd the fearful hollow of thine ear" and
  "Nightly she sings".
- **ch17 ¶63** — "a wretched puling fool, A whining mammet" collapsed into
  one insult ("this wretched, whining doll"); "puling" and "fool" gone.
- **ch16 ¶4** — "my son Paris' love" → "Paris's love": Capulet already
  calling Paris "my son" is characterful and is dropped.
- **ch16 ¶6** — "this noble **earl**" → "this noble gentleman": Paris's rank
  demoted, inconsistently with the "Count" convention used elsewhere.
- **ch3 ¶22** — "The **lady** widow of Utruvio" → "the widow of Utruvio".
- **ch14 ¶19** — the Nurse's triplet "no trust, No faith, no honesty in men"
  collapsed to "You can't trust men. None of them."
- **"rapier" → "sword"** at 6,17 / 13,33 / 20,9. Weapon-category
  normalization; consistent, so probably fine, but flagged for the
  convention decision.

## Judged acceptable this round (documented so round 3 doesn't re-flag)

- **"County" → "Count"** at all 16 locations (3,22; 4,32; 17,44; 17,69;
  18,29; 18,31; 19,16; 19,18; 19,24; 21,18; 22,1; 25,29; 25,67; 25,82;
  25,95; 25,98). Applied **consistently**; "County" is an archaic *title*,
  not a name, and reads as a geographic county to a modern reader.
  Legitimate modernization, unlike Richard III's Rougemount→Rougemont
  (a place *name*).
- **`_` italic markers dropped** — formatting normalization, direction text
  preserved (see S1 note).
- **ch7 ¶11 "his mistress' circle"** and **ch10 ¶68 "old hare hoar"** —
  round 1's non-blocking judgments stand; both puns are genuinely
  untranslatable without invention.
- **ch5 ¶24 length** and **ch18 ¶33 density** — inherent to the source's own
  single-breath construction under a locked paragraph count.
- **"Zounds" → "God's blood" (13,17) / "God!" (13,43)** — rendered, not
  deleted; acceptable, though "God!" is the weaker of the two.

---

## Why this is PARKED and not verifier-fixed

The task allows the verifier to fix findings that are "narrow/mechanical".
S1 alone would qualify. B1–B19 do not:

1. **It is a recurring class, not a defect list.** Nineteen instances
   surfaced on a *first* independent pass after round 1 claimed the class
   was exhausted. The Merchant of Venice precedent in this batch is exact:
   round 3 fixed 24, self-certified clean, and round 4 still found 5 more of
   the same class on its first pass. There is no reason to believe this
   book's list is complete either.
2. **Two of round 1's own verification claims are demonstrably false**
   (the "wormwood on my dug" preservation claim at B14; the "no malapropism
   dialect in this play" claim at B15). That is a coverage-integrity
   problem, not a patch list — the sweep that produced those claims has to
   be rerun from scratch, not topped up.
3. **B16 needs a book-wide convention decision** (how to treat "marry" /
   "i'faith" / "Jesu"), which is exactly the kind of judgment the task says
   to escalate rather than have the verifier impose unilaterally — the same
   reasoning that parked Richard III's `Exeunt` inconsistency.
4. Fixing B1–B19 here would leave the book self-certified by the same
   session that found the defects, destroying the independence that caught
   them.

## Instructions for round 3 (last round before hard park)

1. Fix **S1** and **B1–B19**, plus the non-blocking list where it is
   unambiguous.
2. Make and record an explicit **book-wide oath convention** for B16 and
   apply it by location, not by count.
3. Re-run the register sweep **tag-agnostic and from a freshly built word
   list** — do not start from this document's list, or the sweep will
   inherit its blind spots the way round 1's inherited its own. (Merry Wives
   round 1's tag-keyed sweep missing 8 untagged paragraphs is the precedent.)
4. Re-verify every changed paragraph directly against `source.json` with
   neighbouring context, and re-pin the hash **after** the last edit.
5. If a fresh independent pass after round 3 still finds live instances of
   this class, **hard park** with no acceptance hash, per the Merchant of
   Venice precedent.
