# HARD PARKED — Romeo and Juliet (`romeo-and-juliet`, modern-en)

**Status:** HARD PARKED after round 4. **No acceptance hash issued.**
**Date:** 2026-09-21
**This round:** independent adversarial verification, **Claude Opus
(`claude-opus-5`)**. Rounds 1 and 3 (find-and-fix) were **Claude Sonnet 5**;
rounds 2 and 4 (independent verification) were **Claude Opus
(`claude-opus-5`)**.

The book's 3 nominal correction rounds are used. Round 4 rebuilt every sweep
from `source.json` without reference to any prior round's word or character
list, and found **~34 further live locations of the same
register-softening / printed-form-erasure class** — including instances
*inside paragraphs round 3 had just edited*, a directly incomplete
application of round 3's own book-wide oath convention, a previously
uncovered minor character's verbal tic, and two more occurrences of the
exact word ("wanton") round 1 falsely certified exhausted and round 3 fixed
only once. The trend has not plateaued. Per the Merchant of Venice and Merry
Wives of Windsor precedents in this batch, this is a hard park, not a fourth
correction round.

No `accepted-paragraph-hashes.tsv` and no `RELEASE-PACKET.md` were written.
Only files inside this directory were touched. No app/registry/audio/deploy
change, no paid API calls. `candidate.json` was **not modified** this round.

---

## What round 4 verified as CORRECT

**Hashes (computed independently this round — both match round 3's claims):**
- `source.json` → `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276` (unchanged; source was never edited)
- `candidate.json` → `49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9`

**Structure (re-derived fresh):** 25 chapters both files; 1,062 paragraphs
both files; per-chapter counts identical
(`3,112,36,35,31,63,16,68,23,98,24,13,76,28,51,10,79,38,26,11,24,57,22,12,106`);
`sections` arrays identical (Prologue + Acts 1–5, all real Act/Scene reading
units, no apparatus/collation chapters); JSON valid both sides; no
empty/whitespace-only paragraph. **Clean.**

**Round 3's fixes: spot-checked ~30 of the claimed 64 by locating each in
`source.json` by distinctive phrase, not by trusting cited indices. All
checked fixes are genuinely present and correct**, including: the medlar /
open-arse / poperin-pear joke (7,13); "civil" restored (2,13); "a pretty
piece of flesh" (2,17); "My naked weapon" (2,20); alderman / tithe-pig's /
foul sluttish hair / the hag (5,24); minion, green-sickness carrion, baggage
(17,52); young baggage + "Out on her, hilding" (17,55); harlotry (19,11);
whoreson (21,18); carrion flies (15,11); wanton blood + bird's nest (11,21);
pestilent knave + "Hang him, Jack" (22,54/55); twenty such Jacks (10,74);
wormwood ×2 + by the rood + by my holidame + wretch/fool variation (4,12);
ropery (10,72); versal world + "one Paris" de-titled (10,89); silk button
(10,11); "Without his roe" (10,16); "or let Benvolio die" (13,70); the
`[Putting on a mask.]` stage direction (5,11); "hot a Jack" (13,4); "you
knaves" (6,11); second "Scurvy knave" (10,76); "damned guilty deeds"
(14,22); the ch2 ¶67 / ¶72 image restorations; and the non-blocking fixes at
14,1 / 4,2 / 17,1 / 17,63 / 16,4 / 16,6 / 3,22. **Round 3 did the work it
said it did.** The problem is coverage, not execution.

**Oath convention (Marry / i'faith / Jesu / Mass): verified complete for the
words it names.** Every source occurrence of those four has a matching
restoration at the same location (16 Marry, 12 faith-class, 3 Jesu, 1 Mass).
The convention was applied correctly — it was just scoped to four words when
the play has at least eight in the same class (below).

**Other sweeps run this round that came back clean:**
- Stage directions: every bracketed direction in source present in
  candidate, all 1,062 paragraphs. Zero mismatches now.
- Compression sweep, all 1,062 paragraphs, ratio < 0.82 with source ≥ 12
  words: 32 paragraphs, all read. No new blocking content loss beyond the
  register class below (10,20 "bow in the hams" → "bow at the waist" is the
  only one, and it is listed below as a register item).
- Speaker-tag map: all speaker attributions correct at every location.
- "A plague o' both your houses" preserved at all three occurrences.
- Friar Lawrence's potion plan, the 42 hours, the vial, Friar John's delay:
  intact.

---

## BLOCKING — the class is still live (round 4's independent findings)

Method: rebuilt from scratch. (a) Per-paragraph lost-token diff over all
1,062 paragraph pairs with possessive/inflection normalization, yielding
1,230 source word-forms that appear nowhere in the candidate; scanned all of
them by hand. (b) Independent location-keyed capitalized-token /
proper-noun / allusion map. (c) Per-speaker scan of every character with
more than a handful of lines, looking for repeated unusual vocabulary. (d)
Word-for-word read of the scenes belonging to characters no prior round
covered (Peter, the Apothecary, Balthasar, the Prince).

### C-group 1 — named things and allusions replaced by generic descriptors
*(the exact class round 1 fixed for Aurora / Jove / Titan / Phoebus /
Cynthia and then certified exhausted)*

| Loc | Source | Candidate |
|---|---|---|
| 6,16 | "a rich jewel in an **Ethiop's** ear" | "a jewel sparkling against **dark skin**" |
| 5,3 | "a **Tartar's** painted bow **of lath**" | "a painted bow" |
| 14,10 | "the death-darting eye of **cockatrice**" | "the deadly gaze of **a serpent**" |
| 8,52 | "to lure this **tassel-gentle** back" | "to call this **beautiful hawk** back" |
| 2,18 | "thou hadst been **poor John**" | "you'd be **a dried-out nobody**" |
| 5,24 | "no bigger than an **agate-stone**" | "no bigger than **a gemstone**" |
| 23,14 | "there is forty **ducats**" | "take forty **gold coins**" |
| 22,1 | "Some **aqua vitae**, ho!" | "Somebody bring **brandy**!" |
| 5,14 | "**dun's the mouse, the constable's own word**" + "save your reverence love" | "don't be such a mouse" + "that swamp of love" |
| 14,1 | "**Hood** my **unmann'd** blood, **bating** in my cheeks" (sustained falconry image) | "Cover the wild blood rushing to my cheeks" |
| 14,1 | "Come, **civil** night, Thou sober-suited **matron**, all in black" | "Come, sober night, dressed all in black" |
| 1,1 | "From forth the fatal **loins** of these two foes … **take their life**" | "From these two enemy households … **are born**" (also loses "civil blood / civil hands") |

### C-group 2 — crude / bawdy vocabulary swapped for milder near-synonyms
*(round 2's B1–B14 class)*

| Loc | Source | Candidate |
|---|---|---|
| 2,18 | "Draw thy **tool**" (the pun "My naked weapon is out" at 2,20 answers) | "Draw your **sword**" |
| 5,11 | "**Prick** love for **pricking**" | "Fight back against love's **sting**" |
| 10,40 | "to hide his **bauble** in a hole" | "to hide his **toy** in a hole" |
| 10,13 | "The **pox** of such antic lisping" | "**A plague on** these affected…" (also invents "Tybalt's", not in source) |
| 4,2 | "What **ladybird**!" (Nurse's pet name, with its second sense) | "Come here, **little bird**!" |
| 4,19 | "suck'd wisdom from **thy teat**" | "sucked wisdom from **your mother's breast**" — **also a meaning error**: source has the Nurse's own teat ("Were not I thine only nurse"), the candidate reassigns it to Lady Capulet, destroying the joke |
| 4,12 | "wormwood to my **dug**" … "the **nipple** Of my **dug**" | "on my **breast**" … "the **breast**" (wormwood was restored; dug/nipple were not) |
| 10,47 | "a **shirt and a smock**" | "**a man and a woman**" |
| 10,20 | "bow in the **hams**" | "bow **at the waist**" |

### C-group 3 — character coinages / insult vocabulary flattened
*(round 2's B15 class — and several of these are in paragraphs round 3 edited)*

| Loc | Source | Candidate | Note |
|---|---|---|---|
| 10,74 | "none of his **flirt-gills** … none of his **skains-mates**" | "one of his **loose women** … one of his **gang**" | **Round 3 edited this exact paragraph twice** (Jacks, Scurvy knave) and left the Nurse's two signature scold-coinages flattened |
| 6,26 | "You are a **saucy** boy" / "You are a **princox**" | "**insolent** boy" / "You're a **brat**" | Round 3 edited this paragraph (Marry) |
| 21,5 | "Go, you **cot-quean**, go" | "Go on, you **fussy man**, go" | Round 3 edited this paragraph (faith) |
| 17,52 | "**Mistress** minion you" / "You **tallow-face**!" | "Listen here, you minion" / "You **pasty-face**!" | Round 3 edited this paragraph (minion/carrion/baggage) and left two more in it |
| 10,16 | "Helen and Hero **hildings** and harlots" / "Dido a **dowdy**" / "a kitchen **wench**" / "your French **slop**" | "**hussies** and harlots" / "a **frump**" / "kitchen **maid**" / "French-style **trousers**" | Round 3 edited this paragraph (roe, marry). "hilding" is the same word round 3 restored at 17,55 — restored there, erased here |
| 15,42 | "like a misshaped and sullen **wench**" | "like a sulky, stubborn **brat**" | |
| 23,11 | "a **caitiff** wretch" | "a **miserable** wretch" | |
| 22,1 | "**fie**, you **slug-abed**!" / "**well-a-day** that ever I was born" | "You **lazy thing**!" / "**curse the day** I was ever born" | Round 3 edited this paragraph (Marry) |
| 22,43/45/46 | Peter's "**dagger**" ×3 | "**knife**" ×3 | "dagger" is ordinary modern English; nothing required this |

### C-group 4 — round 3's oath convention applied to four words out of at least eight

Round 3 decided, on the record, to restore period oath/interjection
vocabulary verbatim "at every location, rather than modernizing them away",
reasoning that these carry character-voice weight. It then applied that
decision to `Marry`, `i'faith`/`faith`, `Jesu` and `Mass` only. The play's
other interjections in exactly the same class are still modernized away,
which leaves the book internally inconsistent by round 3's own stated rule:

| Word | Source locations | Candidate | Speakers |
|---|---|---|---|
| **Sirrah** | 3,5; 6,11; 6,47; 19,3; 21,15; 25,98 (6×) | "You there" / "Boy" / deleted | Capulet ×5, Prince |
| **Tush** | 19,24; 23,7 | "Nonsense!" | Capulet, Romeo |
| **Tut** | 2,95; 3,9; 3,33; 5,14 | "Nonsense!" / "Come on" | Romeo, Benvolio ×2, Mercutio |
| **Fie** | 11,7; 15,42 (×2); 17,53; 22,1 | "Oh" / "Shame on you" / "Stop it" / deleted | Nurse ×2, Friar, Lady Capulet |
| **Prates** | 22,48; 22,50 | "Nonsense!" | **Peter** |
| **Hist** | 8,52 | "Psst!" | Juliet |
| **Benedicite** | 9,5 | "Bless you!" | Friar Lawrence |
| **"O God's lady dear"** | 11,17 | "Oh, for heaven's sake!" | Nurse — and this is in the paragraph where round 3 *did* restore "Marry, come up, I trow" two clauses later |
| **"by my fay"** | 6,47 | deleted entirely | Capulet |

Three distinct source interjections (`Tush`, `Tut`, `Prates`) across four
characters are all rendered as the single modern filler **"Nonsense!"** —
the precise flattening round 3's own reasoning said to avoid.

### C-group 5 — the uncovered-character check (the Merry Wives lesson)

Per-speaker scan of every character with more than a handful of lines. The
Nurse and Mercutio were covered by rounds 1–3. **Peter was not covered by
any round**, and he has a signature tic: he answers each musician with
**"Prates."** / **"Prates too!"** (22,48 / 22,50) — a distinctive,
repeated, character-defining word, rendered as generic "Nonsense!" both
times. This is structurally identical to the Host's "bully" miss that
hard-parked Merry Wives of Windsor.

Balthasar, the Apothecary, the Prince, Lady Montague, Montague, Abram,
Sampson and Gregory were also read in full this round; apart from the items
already listed (2,18; 23,11; 23,14; 25,98) their lines are faithful.

### C-group 6 — "wanton": the plateau test, failed

Round 1 explicitly certified that **every** source use of "wanton" is
non-sexual and correctly rendered. Round 2 disproved that with 11,21. Round
3 fixed 11,21 and only 11,21. Round 4 finds **two more still live**:

- **8,62** — "no farther than a **wanton's** bird" → "a **spoiled child's** pet bird"
- **12,5** — "idles in the **wanton** summer air" → "floating in the summer air"

One word, four rounds, still not exhausted. That is the clearest possible
evidence that the defect trend in this book has not plateaued.

---

## Why HARD PARK and not a fourth correction round

1. **Volume.** ~34 further live locations on a first independent pass, after
   three rounds that each self-certified. This is not a residue; it is the
   same class at the same density round 2 found.
2. **Recurrence inside just-edited text.** Six of the findings sit in
   paragraphs round 3 opened and edited this same day (10,74; 6,26; 21,5;
   17,52; 10,16; 22,1). A fourth pass would be fixing the same paragraphs a
   fourth time.
3. **Convention incompleteness, not omission.** Round 3 made an explicit
   book-wide oath rule and then applied it to half the vocabulary it
   covers. Fixing that requires re-deciding the convention, not patching
   locations.
4. **An uncovered character voice** (Peter) — the specific failure mode that
   hard-parked Merry Wives of Windsor.
5. **The plateau test fails on "wanton"** — the one word with a four-round
   paper trail is still not clean.
6. Per the batch rule and the Merchant of Venice precedent, a fresh
   independent pass after round 3 finding live instances of this class means
   hard park with no acceptance hash.

## If this book is ever revived

It should not be resumed as a patch round. It needs a **re-rendering of the
modern-en edition under an explicit, written, up-front lexical policy**
covering: period oaths and interjections as a whole class (not a word list),
named things and allusions, crude/bawdy vocabulary, and character coinages —
decided before rendering, not discovered by successive adversarial sweeps.
`source.json` is untouched and correct; the structure work (25 chapters,
1,062 paragraphs, clean Act/Scene units) is sound and can be reused as-is.

---

# HISTORY — rounds 1-3 (preserved verbatim)

> **Superseded.** This file was named `PARKED-RESOLVED.md` by round 3, which
> believed the book resolved. Round 4 disproved that (above). Everything
> below is round 3's document exactly as it handed off, kept as history.
> Its 'READY FOR INDEPENDENT VERIFICATION' claim is NOT the book's status.

# RESOLVED — Romeo and Juliet (`romeo-and-juliet`, modern-en)

> **Round 3 resolution, 2026-09-21, Claude Sonnet 5.** This file was
> `PARKED.md` after round 2 (independent Opus verification) found 19 further
> live register-softening/erasure instances plus a dropped stage direction,
> on top of round 1's 12 fixes. Round 3 fixed all of it, ran an independent
> fresh sweep on top (found 12 more instances round 2 hadn't listed — 3 of
> its own already-documented B-items round 1's task brief omitted, plus 9
> genuinely new: 6 additional "Marry"/"faith" oath occurrences, "Mass", the
> Nurse's "no faith" triplet, "hot a Jack", "you knaves", "damned guilty
> deeds"), fixed the 7 clearly-unambiguous non-blocking items round 2 flagged
> but didn't fix, and re-verified every one of the resulting 64 changed
> paragraphs against `source.json` directly, fresh, after applying the fix.
>
> **Final candidate.json sha256:**
> `49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9`
>
> **Final source.json sha256 (unchanged, confirms source was never touched):**
> `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276`
>
> Structure re-validated after the last edit: 25 chapters both files, 1,062
> paragraphs both files, per-chapter counts identical, `sections` arrays
> identical, JSON valid both files, no empty/whitespace paragraph.
> `assert_only_changed`-equivalent diff against the round-2-handoff
> `candidate.json` confirms **exactly 64 paragraphs changed and no others**.
>
> Report to the calling process: **READY FOR INDEPENDENT VERIFICATION —
> sha256 49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9**
>
> The rest of this file is round 2's `PARKED.md` in full, preserved as
> history. Everything below "Round 3 fix log" is unchanged from what round 2
> handed off.

---

## Round 3 fix log (this round)

All fixes applied via exact-substring `safe_replace` (old substring verified
present exactly once in the target paragraph before replacement), then the
whole file re-validated for structure and re-diffed against the round-2
handoff copy to confirm nothing else moved. Every fix below was independently
re-located in `source.json` by distinctive-phrase search (not by trusting
round 2's cited paragraph numbers) before being applied, and independently
re-verified against `source.json` again after being applied.

### B1–B19 (round 2's numbered findings) — all fixed
| Item | Loc | Fix |
|---|---|---|
| B1 | 7,13 | "medlar tree" / "call medlars" / "open-arse and ... poperin pear" restored |
| B2 | 2,13 | "civil" restored (was "rough", the imported "cruel" emendation) |
| B3 | 2,17 | "a pretty piece of flesh" restored |
| B4 | 2,20 | "naked" restored to "My naked weapon is out" |
| B5 | 5,24 | "alderman", "tithe-pig's", "foul, sluttish hair", "the hag" all restored |
| B6 | 17,52 | "minion", "green-sickness carrion", "baggage" restored |
| B7 | 17,55 | "young baggage" restored; "Out on her, hilding!" restored |
| B8 | 19,11 | "a peevish, self-willed harlotry" restored |
| B9 | 21,18 | "a merry whoreson" restored |
| B10 | 15,11 | "Carrion flies" restored |
| B11 | 11,21 | "wanton blood" restored; "bird's nest" restored |
| B12 | 22,54/55 | "pestilent knave" restored; "Hang him, Jack" restored |
| B13 | 10,74 | "twenty such Jacks" restored |
| B14 | 4,12 | "wormwood" restored (×2); "by the rood" and "by my holidame" restored; "wretch"/"fool" variation restored (was flattened to identical "sweet little thing" twice) |
| B15 | 10,72 / 10,89 | "ropery" restored; "versal world" restored; the invented "Count" title removed from "one Paris" (source has no title there — distinct from the legitimate book-wide County→Count convention) |
| B16 | book-wide | oath convention decided and applied — see below |
| B17 | 10,11 | "the very butcher of a silk button" restored |
| B18 | 10,16 | "Without his roe" restored |
| B19 | 13,70 | "or let Benvolio die" restored |
| S1 | 5,11 | `[Putting on a mask.]` stage direction restored |

### ch2 ¶67 / ¶72 (flagged by round 2's compression sweep, not fixed)
- **2,67**: restored "the worshipped sun peered out from the golden window
  of the east" image and the "being one too many even for my own weary
  company... pursued my own mood, not his" parallel structure.
- **2,72**: restored "I won't say how truly" parenthesis and the second half
  of the worm/bud image ("spread its sweet leaves to the air, or dedicate
  its beauty to the sun" — candidate had collapsed both clauses into one).

### Book-wide oath convention (B16) — decision and full application

**Decision:** restore "Marry", "i'faith"/"I'faith"/"in faith", "Jesu", and
plain "Faith"/"on my faith" verbatim (or in an immediately-recognizable
modern spelling of the same interjection) at every location, rather than
modernizing them away. Reasoning:

1. This batch has an established precedent for restoring exactly this class
   of period oath/interjection verbatim (the Tilly-vally restoration in
   Twelfth Night, the oath-restoration convention in Coriolanus) rather than
   modernizing it into a generic filler ("Well,", "Indeed,", "Honestly,").
2. These interjections are not incidental filler in this play — they carry
   real character-voice weight. "Marry" and "i'faith"/"Faith" are heavily
   concentrated in the Nurse's and Mercutio's speech (of ~28 combined
   occurrences, roughly 20 are spoken by one of the two), and both are
   voice-defined characters whose vocabulary this batch has already committed
   to preserving in full (crude vocabulary, malapropisms). Flattening their
   oaths to generic modern fillers erodes exactly the voice the crude-word
   and malapropism fixes were restoring.
3. They are short, low-ambiguity, and legible in context to a modern
   reader without a gloss — unlike genuinely untranslatable puns (the
   "circle"/"hare hoar" class), which this round leaves alone per existing
   precedent.
4. Applying "keep everywhere" rather than a mixed policy avoids the
   inconsistency problem the task instructions explicitly warn against.

**Full application (24 locations, every source occurrence, fixed
book-wide, none left inconsistent):**
- **"Marry" / "marry"** (16 locations): 2,23; 4,12 (×1, "That shall she,
  marry"); 4,17; 6,26; 6,43; 6,52; 10,16; 11,17; 13,22; 13,40; 17,44; 17,75;
  19,6; 19,18; 22,1; 22,47.
- **"i'faith" / "I'faith" / "in faith" / "Faith," / "on my faith" / "Good
  faith"** (11 locations): 4,8; 4,23; 10,61; 10,77; 11,14; 17,68 (literal
  "faith"/troth wordplay, restored as the repeated word it is in source, not
  as the exclamation); 17,69; 21,5; 21,18; 22,28; 22,41; 22,51; 25,29.
  (Counted 12 above because 17,68 is the literal-noun instance, not the
  interjection — both are restored for the same reason: source's own word
  choice carries the play's thematic wordplay and should not be paraphrased
  away.)
- **"Jesu"** (3 locations): 9,13; 10,13; 11,9.
- **"Mass"** (1 location, 21,18) — same period-oath class as "Zounds",
  which round 2 already judged acceptable when rendered rather than deleted;
  applying the same standard, restored rather than left as "Ha!".

Round 2's location list under-counted this class (it estimated "roughly a
dozen" for each of Marry and i'faith/faith and found only the capitalized
"Marry"/apostrophe-exact "i'faith" spellings). This round's search was
case-insensitive and word-boundary-based across every spelling variant, and
found 6 additional genuine oath occurrences round 2's own B16 list did not
name: 2,23 ("No, marry"), 4,8 ("Faith, I can tell..."), 4,12 ("shall she,
marry"), 10,16 ("marry, she had a better love"), 17,68/17,69 ("my faith in
heaven"/"Faith, here it is"), 19,18 ("Ay, marry"), 21,5 ("faith, you'll be
sick"), 21,18 ("Mass"/"Good faith"), 22,28/22,41/22,51 (three more
"Faith,"/"on my faith" instances), and the Nurse's "no faith" in her "no
trust, No faith, no honesty" triplet at 14,19 (also restored, since it was
flattened to "You can't trust men. None of them." — losing the triplet
structure entirely, not just the word "faith").

### Fresh independent register/erasure sweep (task step 3)

Built fresh from `source.json` (not reusing round 1's or round 2's word
lists): a curated ~110-stem list of archaic/bawdy/insult/oath vocabulary
(whore, harlot, bawd, wanton, minion, carrion, baggage, hilding, jack, knave,
hag, alderman, wormwood, dug, medlar, poperin, arse, ropery, versal, rood,
holidame, jesu, marry, faith, flesh, naked, maidenhead, pox, plague, zounds,
sluttish, cuckold, prick, bawdy, deflower, wretch, puling, mammet, tallow,
green-sickness, peevish, whoreson, rapier, county, earl, widow, roe, silk
button, cur, rogue, scurvy, pestilent, caitiff, canker, villain, shame,
vestal, chamber, and more — full list in the working script), applied
per-paragraph to flag any stem present in source and absent from the
matching candidate paragraph, then read every flag by hand.

This independently re-surfaced B1, B12, B13, B17, B18, B19 (validating round
2's B-list — round 2's own task brief to round 3 had accidentally not
enumerated these five as their own numbered instructions, but they were
still findings in round 2's document and this sweep caught them
independently either way) and additionally found, beyond round 2's B-list:

- **13,4** — "hot a Jack in thy mood" → "hot-tempered": the "Jack" jibe
  erased a third time (after 22,55 and 10,74). Restored.
- **6,11** — "More light, you knaves" → "More light, you there!": the crude
  address erased. Restored.
- **10,76** — "Scurvy knave." → "That scoundrel!": restored (second "Scurvy
  knave" occurrence in the same exchange as B13's 10,74).
- **14,22** — "damned guilty deeds" → "guilty deeds": restored.
- Plus the full oath list above, since "marry"/"faith"/"jesu" were on the
  fresh list too.

Everything else the sweep flagged (`county`→`Count`, `rapier`→`sword`,
"cur"/"cat"/"rat"/"nest" in Mercutio's already-documented untranslatable
puns, "chamber"→"room", etc.) was re-checked against round 2's
"judged acceptable" list and confirmed to still be legitimate modernization,
not a new erasure.

### Non-blocking items fixed (unambiguous ones only, per task instructions)

- **14,1** — "every tongue that speaks But Romeo's name speaks heavenly
  eloquence" — restored the correct reading ("speaks *nothing but*
  Romeo's name") and removed the invented "is as nothing compared to"
  comparison not present in source.
- **4,2** — removed the nonsensical "back when I was" that attached "at
  twelve year old" to the Nurse's own age rather than leaving it as
  ambiguous in the source's own construction.
- **17,1** — restored "that pierced the fearful hollow of your ear" and
  "Nightly she sings".
- **17,63** — restored "puling fool" and "whining mammet" as two distinct
  images (candidate had collapsed both into one "wretched, whining doll").
- **16,4** — restored "my son Paris's love" (Capulet's own framing).
- **16,6** — restored "earl" (Paris's specific rank in this one line,
  distinct from the "County"→"Count" title convention used elsewhere).
- **3,22** — restored "lady" in "the lady widow of Utruvio".

Left alone, as documented already-acceptable by round 2 and not re-litigated
this round: "County"→"Count" (16 locations), "rapier"→"sword" (3 locations),
`_` italic-marker normalization, the "circle"/"hare hoar" untranslatable
puns, Queen Mab length/Friar Lawrence potion-speech density, and
"Zounds"→"God's blood"/"God!".

### Verification performed this round

- `python3 -m json.tool` — valid, both files.
- Structure: 25 chapters both sides, 1,062 paragraphs both sides, per-chapter
  counts identical, `sections` identical, no empty paragraph either side.
- `source.json` sha256 unchanged from round 1/round 2's recorded value
  (`d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276`),
  confirming source was never edited.
- Diff against the round-2 handoff `candidate.json`
  (`68520dd1cfc6a4910f127d239e741c44c6af4ac1f43406857b375977e2f6ad6f`):
  **exactly 64 paragraphs changed, none outside the intended fix set.**
- Every one of the 64 changed paragraphs re-read side by side against
  `source.json` fresh, after the fix was applied (not from the edit script's
  own success report) — full transcript in this round's working notes.
- No paid Anthropic API calls. Only files in
  `books/wip/green-romeo-and-juliet/` touched.

**Final candidate.json sha256 (after the last edit):**
`49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9`

---

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
