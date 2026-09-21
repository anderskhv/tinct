# PARKED-RESOLVED — The Merry Wives of Windsor (`merry-wives-of-windsor`, modern-en)

> # ⛔ HARD PARKED 2026-09-21 (round 4, Claude Opus, `claude-opus-5`)
>
> **This book is NOT accepted. The "RESOLVED" banner immediately below is
> round 3's own claim and is superseded — it is retained for history only.
> No acceptance hash is pinned by round 4 and no
> `accepted-paragraph-hashes.tsv` was written. `candidate.json` was not
> modified by round 4.**
>
> Round 4 was an independent adversarial verification pass that re-derived
> everything from `source.json` without trusting round 3's self-report.
> **Round 3's own work checks out**: the candidate's sha256 is exactly
> `eb863e8964c6c0a0e272ade2d425e327f38718923232ac39eee0a8b1cd50b5ad` as
> claimed, `source.json` is unmodified
> (`4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280`),
> structure is 23/23 chapters and 1,155/1,155 paragraphs with identical
> numbers and titles, and **all 22 of round 3's claimed fixes were
> re-derived at their actual source coordinates and are all correct** —
> including 23.45, where source genuinely reads `‘Seese’ and ’putter’!`.
> Compression and register sweeps, rebuilt from scratch, are clean.
>
> **But the dialect/idiolect-preservation defect class is still not
> exhausted, and round 4 found a whole uncovered character voice — the
> fourth consecutive round to find one.** 14 paragraphs across 6 items and
> 4 characters, detailed in "Round 4 findings" below, including one
> structurally broken joke of exactly the same shape as the `Seese`/`putter`
> failure that took three rounds to fix. This is not the "one more slipped
> through" base rate; it is a fourth consecutive scoping failure of the
> same class. **Rounds used: 3 of 3 nominal correction rounds. Round 4 did
> not perform a correction round and did not fix these.** Any further work
> needs an owning-editor decision, not another sweep.

---

## Round 4 findings (2026-09-21, Claude Opus `claude-opus-5`) — unresolved

Method: an independent tag-agnostic speaker map rebuilt from `source.json`
(carrying the current speaker across untagged continuation paragraphs,
reset by stage-direction-only paragraphs — 48 untagged-but-attributed
paragraphs recovered); a lost-token diff over **all 1,155 paragraphs and
every speaker**, not a named subset (825 distinct lost tokens, reviewed by
hand); an automated **internal-inconsistency detector** (for every
distinctive source token, compare the coordinates where the candidate keeps
it against the coordinates where it drops it); an automated broken-echo
detector for setup/payoff word pairs in adjacent paragraphs; fresh
compression and register sweeps; and a word-for-word read of Act 2 Scene 3
(chapter 7), which no prior round had read exhaustively.

### A — The Host's `bully` / `bully-rook`: a whole-character signature tic, erased at 9 of 14 locations

`bully` is the Host's single most repeated verbal tic and the structural
equivalent of Caius's `by gar` (19 occurrences, all restored in round 1) and
Evans's Welsh markers. Source has it in 14 paragraphs. The candidate
**keeps it in 5 and flattens it to "swashbuckler" in 9**:

| Loc | Source | Candidate |
|---|---|---|
| 3.3 | `What says my **bully-rook**?` | `What says my **swashbuckler**?` |
| 5.70 | `How now, **bully-rook**!` | `How now, **swashbuckler**!` |
| 5.73 | `tell him, **bully-rook**.` | `tell him, **swashbuckler**.` |
| 5.77 | `What sayest thou, my **bully-rook**?` | `What do you say, my **swashbuckler**?` |
| 5.81 | `My hand, **bully**;` | `My hand, **swashbuckler**;` |
| 7.13 | `Bless thee, **bully** doctor!` | `Bless you, **swashbuckler** doctor!` |
| 7.29 | `is valour, **bully**.` | `is valour, **swashbuckler**.` |
| 7.31 | `clapper-claw thee tightly, **bully**.` | `…tightly, **swashbuckler**.` |
| 7.37 | `And, moreover, **bully**,--` | `And, moreover, **swashbuckler** —` |

Kept, unchanged, in the same character's mouth and sometimes the same
paragraph: `bully Hercules` (3.5), `bully Hector` (3.7), `bully-stale`
(7.18 — in the *same paragraph* where `ha, bully!` became
`Ha, swashbuckler!`), `Bully knight! Bully Sir John!` (17.6), `let her
descend, **bully**, let her descend` (17.8).

Three separate problems: (1) it is a signature-idiolect erasure of the class
this book has now parked over three times; (2) it is **internally
inconsistent** — the identical word kept at 5 coordinates and replaced at 9,
the same shape as round 1's `knog…costard` (8.5) vs. `knock…coxcomb` (8.44)
split; (3) "swashbuckler" is not even a correct gloss — the Host's `bully`
is an affectionate term of address ("my fine fellow"), and `bully-rook` is
his own coinage.

Round 3 stated it "checked the Host … as a first-class voice" and reported
only a coinage gap (`guest-cavaleire`, `An-heires`, `varletto`, `Mounseur`).
It restored `An-heires` **inside 5.81**, the very paragraph where it left
`My hand, bully` → `My hand, swashbuckler` untouched.

### B — 7.31/7.32: a structurally broken joke (blocking)

| | Text |
|---|---|
| **source 7.31** (Host) | `He will **clapper-claw** thee tightly, bully.` |
| **source 7.32** (Caius) | `**Clapper-de-claw**! vat is dat?` |
| **candidate 7.31** | `He will **scratch and claw** you tightly, swashbuckler.` ❌ |
| **candidate 7.32** | `**Clapper-de-claw**! Vat is dat?` ✅ |

The whole joke is Caius not understanding the Host's word and mangling it
back at him. The candidate erases the setup word and keeps the payoff, so
Caius asks what a word means that nobody in the scene said. This is the
**same structural failure as the `Seese`/`putter` exchange at 23.44–45** —
the defect that took rounds 1, 2 and 3 to resolve — reproduced in a
different scene and never detected, because every round's sweep was
token-presence-based and `clapper-claw` / `clapper-de-claw` are not the same
token.

### C — Quickly's `phlegmatic` (4.38): a malapropism erased outright

Source: `I beseech you, be not so **phlegmatic**.`
Candidate: `I beg you, don't be so **worked up**.`

Quickly means *choleric*; `phlegmatic` is the opposite humour. This is one
of her best-documented malapropisms, in the same set as `detest`,
`allicholy`, `canaries`, `alligant`, `speciously` and `erection` — all of
which rounds 2 and 3 restored. Round 3 reported "a full pass of every
Quickly-attributed paragraph (74 turns) for malapropisms beyond the four
round 2 already named, and found one more." It found `erection` and missed
this one, in the same scene as `detest`/`allicholy` (4.64) and `good-jer`
(4.51), both of which it did fix.

### D — Quickly's `horn-mad` (4.23): cuckoldry pun lost, and internally inconsistent

Source: `he would have been **horn-mad**.` → candidate: `he would have gone
**raving mad**.` The horn is the play's central cuckoldry motif (Ford,
Actaeon, Herne's antlers). The candidate **keeps `horn-mad` at 12.49**, so
the same word is preserved in one place and dissolved in the other.

### E — Nym's `humour` (3.16): his catchphrase, flattened at 1 of 15 locations

Source: `The good **humour** is to steal at a minute's rest.`
Candidate: `The good **way** is to steal at a moment's rest.`

`humour` is Nym's running verbal tic; the candidate preserves it at 14 other
coordinates and drops it here. Round 3 checked Nym explicitly as a
first-class voice and concluded his idiolect was intact.

### F — Evans's `cozen-germans` (17.39): the pun round 2 named, still unfixed and undocumented

Source: `three **cozen-germans** that has **cozened** all the hosts…`
Candidate: `three **cousin-germans** who have **cozened** all the hosts…`

Round 2 listed this inside blocking defect 4. Round 3 fixed the other two
items in that same sentence (`Readins`, `Colebrook`) and left this one — and
it does not appear in round 3's documented list of 18 deliberately-modernized
coinages either, so it is neither fixed nor decided.

### Why this is a hard park rather than a narrow fix

Round 3's coinage policy is written correctly: *restore if the word is a
character's own mangled or invented coinage, or a deliberate period-specific
term repeated as part of that character's identity.* `bully`/`bully-rook`
(14 occurrences, the Host's identity term) and `humour` (15 occurrences,
Nym's catchphrase) are the two clearest passes of that test in the entire
play, and the policy was not applied to either. The failure is not the list
of words; it is that four consecutive rounds have each named the defect
class accurately and then scoped the sweep to the characters the *previous*
round happened to name. Round 1 scoped to speaker tags; round 2 scoped to
Evans/Caius/Quickly; round 3 scoped to round 2's six names and checked the
Host and Nym only for coinages, not for tics. A fifth sweep built the same
way would very likely produce a fifth "clean" claim.

The trend has **not** plateaued. Counting defects newly found per round:
101 → ~14 → 22 → 14. Round 4's 14 include a whole-character signature tic
and a structurally broken joke, not residual singletons.

### What round 4 verified clean (re-derived, not trusted)

- **Hashes.** `candidate.json` = `eb863e89…d50b5ad`, exactly round 3's
  claimed value; `source.json` = `4ee59167…3a2c6b280`, unmodified.
- **Structure.** 23/23 chapters, per-chapter counts 147, 4, 48, 69, 87, 88,
  49, 58, 36, 109, 51, 50, 50, 99, 5, 29, 54, 9, 8, 5, 11, 2, 87 =
  1,155/1,155. Chapter `number` and `title` identical string-for-string.
  `sections` absent in both. No empty or whitespace-only paragraph. JSON
  valid. No apparatus chapters.
- **All 22 of round 3's fixes**, re-derived independently at their real
  source coordinates: all 22 correct. Source 23.45 does read
  `‘Seese’ and ’putter’!` — round 3 was right and round 1's record was
  wrong. The 8 untagged Evans/Caius continuations (1.27, 4.23, 8.6, 8.7,
  8.8, 8.44, plus 1.16 and 8.40), the Quickly malapropisms including the
  12.16 `erection` crux, Evans's 14.71 `jealousies`, the 17.38
  `Readins`/`Colebrook` toponyms, the 6.41 `punk` register restoration, and
  all 5 restored coinages (`guest-cavaleire`, `An-heires`, `varletto`,
  `Mounseur`, `good-jer`) are all present and correct in the candidate.
- **Round 3's 18 "legitimately modernized" coinages**, spot-checked against
  source: the reasoning holds. `shent`, `wee`, `eyas-musket`, `drumble`,
  `draff`, `ging`, `lewdsters`, `geminy`, `whitsters`, `pumpion`, `uncape`,
  `fico`, `labras`, `illades`, `kibes`, `ken`/`wight`, `nuthook's`,
  `gourd and fullam` are speaker-neutral archaic vocabulary whose strangeness
  is not itself the comic point. That policy is sound — it was simply not
  applied to A and E above.
- **Compression sweep**, rebuilt from scratch, all 1,155 paragraphs of 8+
  source words, 0.75×–1.8× band: 4 outliers, all benign on inspection
  (23.42, 4.59, 5.9 minor tightenings; 23.31 is a stage direction where the
  candidate expands `Mrs ANNE PAGE` to `MISTRESS ANNE PAGE`). No truncation
  or invention.
- **Register sweep**, rebuilt from scratch, whole book, per-coordinate:
  `whore`, `punk`, `quean`, `slut`, `lust`, `piss`, `turd`, `cuckold`,
  `cuckoldly`, `knave`, `rascal`, `rogue`, `lecher`, `devil`/`tevil`,
  `damn`, `bitch`, `pander`, `ronyon`, `Ethiopian`, `Bohemian-Tartar` all
  survive at full strength at their source coordinates. **No softening
  found anywhere.** Round 3's 6.41 `punk` restoration holds.
- **Broken-echo detector** across all adjacent/near-adjacent paragraph
  pairs: 3 setup-side losses, of which only 1.59/1.61 (`matter`) is a real
  but very minor echo softening; the 7.31/7.32 break above was found by
  hand, not by the detector, because the two forms are different tokens.

---

> **RESOLVED 2026-09-21 (round 3, Claude Sonnet 5, `claude-sonnet-5`).**
> *(Superseded by the round 4 hard park above — retained for history.)*
> Everything below this line is round 2's original parking report, kept
> verbatim for history. Round 3 fixed all 6 blocking/policy items it lists
> (23.45's `'Seese'/'putter'` joke, the 8 untagged Evans/Caius dialect
> paragraphs — including 4.23 and 8.40, which round 2's own summary table
> had already counted but whose full text is in the body below — the
> Quickly malapropism sweep, the `Readins`/`Colebrook` toponym, and the
> `punk`/`wench` register softening), decided the ~23 lower-severity
> coinages as a set, found 2 further defects round 2 had not caught
> (12.16 `erection`, 14.71 `jealousies`), and checked the Host/Pistol/Nym as
> first-class voices as suggested at the end of this file. Full round 3
> detail, including why each of the ~23 coinages was or wasn't restored, is
> in `ACCEPTANCE-RECORD.md`'s "Round 3" section. Final accepted hash
> (`candidate.json`, sha256):
> `eb863e8964c6c0a0e272ade2d425e327f38718923232ac39eee0a8b1cd50b5ad`.
> This file is renamed from `PARKED.md` per the dispatch instruction; no
> content below was altered.

---

# PARKED — The Merry Wives of Windsor (`merry-wives-of-windsor`, modern-en)

**Date:** 2026-09-21
**Round:** 2 (independent adversarial verification)
**Verifier model:** Claude Opus (`claude-opus-5`) — did not perform round 1's
drafting/repair.
**Round 1 model:** Claude Sonnet 5 (`claude-sonnet-5`).

**File under review:** `candidate.json`, sha256
`cbe6b5d2fabd0fcd74c2d11afea6232c2dbe3d07244eba20a0771421dbdfd0f3`
(matches round 1's claimed hash — the file is the one round 1 certified).
**Source:** `source.json`, sha256
`4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280` (unmodified).

**Verdict: PARKED. No acceptance hash. No `accepted-paragraph-hashes.tsv`
written.** Round 1's central claim — "a third rescan found **0 remaining
mismatches** across all 136 Evans/Caius speaking turns" — is false. An
independent, tag-agnostic sweep built from `source.json` found **8 paragraphs
with live dialect-marker mismatches still in the file**, including the play's
single most-quoted comic payoff, plus a further, previously unreported
book-wide erasure of a **third** character's (Mistress Quickly's) signature
malapropisms. This is the "partial fix misses a sibling occurrence" pattern
the batch tracker warns about, and it needs real editorial judgment rather
than a mechanical patch, so per the dispatch instruction it is **not** fixed
here.

---

## What verified clean

- **Structure (re-derived, not trusted).** 23 chapters both files, all real
  Act/Scene reading units (Act 1 Sc.1–4, Act 2 Sc.1–3, Act 3 Sc.1–5, Act 4
  Sc.1–6, Act 5 Sc.1–5). Chapter `number` and `title` strings identical
  string-for-string. Per-chapter paragraph counts identical: 147, 4, 48, 69,
  87, 88, 49, 58, 36, 109, 51, 50, 50, 99, 5, 29, 54, 9, 8, 5, 11, 2, 87 =
  **1,155 / 1,155**. `sections` absent in both. No empty or whitespace-only
  paragraph on either side. No apparatus/collation/crosswalk chapters. JSON
  valid.
- **Hash.** The candidate's sha256 matches round 1's claimed value exactly, so
  the defects below are in the file round 1 pinned — not a later edit.
- **Compression/content-loss sweep (independent, all 1,155 paragraphs).**
  Word-count ratio computed fresh for every paragraph of 8+ source words.
  Exactly one paragraph outside a 0.72×–1.8× band (23.41, ratio 0.70) and it
  is correct on inspection ("leave you your jealousies" → "leave your
  jealousies"). No truncation or invention outliers.
- **Register sweep (independent, whole book, 34 charged/crude/insulting
  terms).** `whoreson`, `cuckold`/`cuckoldly`, `knave`, `rascal`, `rogue`,
  `bawd`, `lecher`/`lechery`, `piss`, `turd`, `devil`, `damn`, etc. all
  survive at their source coordinates at full strength. Falstaff's
  "piss my tallow" and the whole Herne's Oak / rut-time passage (23.1) are
  intact and unsoftened. **One** genuine softening found (6.41, below).
- **Evans/Caius *speaker-tagged* turns.** Round 1's repair of the 87 `_Evans._`
  and 49 `_Caius._` tagged paragraphs is, with the exceptions listed below,
  genuinely correct and well done: `Got`, `pless`, `petter`, `prain`, `goot`,
  `fery`, `preeches`, `'oman`, `chollors`, `trempling`, `melancholies`, `ork`,
  `costard`, `knog` (at 8.5), `vlouting-stocks`, `Vat`, `dat`, `vill`,
  `make-a`, `let-a`, and all 19 `by gar` occurrences check out at their exact
  coordinates. Caius's `turd` for "third" (10.104) **is** correctly restored.
  The Ch1 `goot worts` → `Good worts! good cabbage` pun (1.56–57) **does** now
  land. The Ch13 Latin lesson, the buck-basket scene (10.55–10.74), Ford's
  jealousy speeches, and the Herne's Oak scene read clean word-for-word.
- The `Horne`/`Herne` Folio inconsistency **is** correctly preserved as source
  prints it at 23.0 (`Enter FALSTAFF disguised as Horne`), with `Herne` left
  in dialogue — verified directly, not taken on report.

---

## Blocking defect 1 — the Ch23 "Seese"/"putter" joke is still broken, and round 1 misquoted the source while "fixing" it

This is the headline claim of round 1's report, and it is wrong in the source
direction.

| | Text |
|---|---|
| **source 23.44** (Evans) | `Seese is not good to give putter; your pelly is all putter.` |
| **source 23.45** (Falstaff) | `‘Seese’ and ’putter’! have I lived to stand at the taunt of one that makes fritters of English?` |
| **candidate 23.44** | `EVANS. Seese is not good to give putter; your pelly is all putter.` ✅ |
| **candidate 23.45** | `FALSTAFF. 'Cheese' and 'butter'! Have I lived to stand at the taunt of one who makes fritters of English?` ❌ |

Source has Falstaff **quoting Evans's own Welsh forms back at him** —
`'Seese' and 'putter'!` — which is *why* the next clause is "one that makes
fritters of English." The candidate has Falstaff quote the *corrected*
English, so he is shown indignantly repeating words nobody mangled and then
complaining about mangling. The joke is inverted.

`fidelity-review-1.md` (lines 97–101) and `ACCEPTANCE-RECORD.md` (line 79)
both state that **source** reads `'Cheese' and 'butter'!` and that the defect
was on Evans's side only. Source says otherwise. Round 1 repaired 23.44 to
match a misquotation of 23.45 and then certified the pair as landing
correctly — it half-fixed the joke and recorded the wrong half as ground
truth. Any repair round must re-derive 23.45 from source, not from round 1's
notes.

## Blocking defect 2 — round 1's sweep was keyed on speaker tags, so every untagged Evans/Caius paragraph was never checked

Round 1 built its "location-keyed occurrence map" from the `_Evans._` /
`_Caius._` speaker tags (87 + 49 = the "136 speaking turns" it reports).
Several of Evans's and Caius's lines in this source are **continuation or
stage-direction-led paragraphs with no speaker tag**. None of them were in
the sweep, and all of them still carry erased dialect:

| Loc | Source | Candidate | Lost |
|---|---|---|---|
| 1.27 | `[_Knocks_] What, hoa! **Got pless** your house here!` | `[Knocks] What ho! **God bless** your house here!` | `Got`, `pless`, `hoa` |
| 8.6 | `There will we make our **peds** of roses` (Evans's song) | `there will we make our **beds** of roses` | `peds`; also source's Welsh-ungrammatical `birds **sings** madrigals` → `birds sing` |
| 8.7 | `I have a great **dispositions** to cry` | `I have a great **disposition** to cry` | Evans's mangled plural |
| 8.8 | `Whenas I sat in **Pabylon**— And a thousand **vagram** posies` | `Whenas I sat in **Babylon** — and a thousand **vagrant** posies` | `Pabylon`, `vagram` |
| 8.44 | `[_Aloud_] I will **knog** your urinals about your knave's **cogscomb**` | `[Aloud] I will **knock** your urinals about your knave's **coxcomb**` | `knog`, `cogscomb` |

8.44 is additionally **internally inconsistent with 8.5**, which round 1 *did*
fix and which correctly keeps `knog ... costard` nine paragraphs earlier —
the same character, the same threat, the same scene, one line restored and its
twin normalized.

Two further tagged-line misses in the same class:

| Loc | Source | Candidate |
|---|---|---|
| 1.16 | Evans: `take your **vizaments** in that` (malapropism for "advisements") | `Take that into your **considerations**` |
| 4.23 | Caius: `**Fe, fe, fe, fe!** ma foi, il fait fort chaud` | `**Fie, fie, fie, fie!** Ma foi, il fait fort chaud` |
| 8.40 | Caius: `**Verefore** vill you not meet-a me?` | `**Vere-fore** vill you not meet-a me?` |

4.23 is notable: round 1 edited this exact paragraph (to restore the French)
and normalized Caius's `Fe` in the same breath. 1.16 was likewise edited by
round 1 (it restored `Got` twice) while leaving `vizaments` erased in the same
sentence.

**Total: 8 paragraphs with live dialect-marker mismatches** in a file
certified at "0 remaining mismatches."

## Blocking defect 3 — a third character's malapropisms are erased book-wide, never swept

Round 1 found and fixed exactly one Mistress Quickly malapropism (`fartuous`,
6.33) and never asked whether she had others. She has a systematic set, and
they are all still erased:

| Loc | Source | Candidate |
|---|---|---|
| 4.64 | `but, I **detest**, an honest maid` (for "protest") | `but, I **protest**, an honest maid` |
| 4.64 | `given too much to **allicholy** and musing` (for "melancholy") | `too much given to **melancholy** and brooding` |
| 6.27 | `brought her into such a **canaries** as 'tis wonderful ... to such a **canary**` (for "quandary") | `into such a **flutter** ... to such a **flutter**` |
| 6.27 | `in such **alligant** terms` (for "elegant"/"eloquent") | `in such **elegant** terms` |
| 11.50 | `but **speciously** for Master Fenton` (for "specially") | `but **specially** for Master Fenton` |
| 17.50 | `Yes, I warrant; **speciously** one of them` | `Yes, I warrant; **specially** one of them` |

Quickly's malapropism habit is one of the three running verbal jokes of this
play, alongside Evans's Welsh and Caius's French. Round 1 identified the
defect class precisely and then applied it to two of the three characters.
That is the same shape of miss as batch 1's Merchant of Venice failure: the
class was named correctly and the sweep was scoped too narrowly.

## Blocking defect 4 — a silent place-name correction to the modern standard form

17.38 (Evans): source prints `the hosts of **Readins**, of Maidenhead, of
**Colebrook**`. Candidate has `the hosts of **Reading**, of Maidenhead, of
**Colnbrook**`. `Readins` is Evans's Welsh rendering; `Colebrook` is source's
own printed spelling. `Colnbrook` is not a modernization of source's form at
all — it is the historically standard toponym, substituted in. This is
directly against the tracker's standing lesson ("Never silently 'correct' a
name/spelling/quotation to a historically standard form — reproduce the
source's own printed form"). Same paragraph also has `cozen-germans` →
`cousin-germans`, losing source's pun on `cozened` two words later (which the
candidate *does* keep, twice).

Round 1 edited this exact paragraph (it restored `vlouting-stocks` here as one
of its "2 further misses") without noticing the three name forms in the same
sentence.

## Blocking defect 5 — one register softening

6.41 (Pistol): source `This **punk** is one of Cupid's carriers` → candidate
`This **wench** is one of Cupid's carriers`. "Punk" is prostitute; "wench" is
not. This is exactly the Merchant of Venice `strumpet`→`wanton` class the
batch already parked a book over, and round 1's own register check ("no
softening of racial/sexual/violent content anywhere") missed it.

## Lower-severity items in the same class (not individually blocking, listed for the repair round)

Source's own distinctive coinages flattened to ordinary words, each a single
occurrence: `varletto`→`varlet` (17.32, the Host's mock-Italian);
`Mounseur`→`Monsieur` (7.26, the Host mangling it at Caius deliberately);
`guest-cavaleire`→`guest-cavalier` (5.78); `An-heires`→`my heirs` (5.80);
`good-jer`→`the mischief` (4.51); `shent`→`catch it` (4.16);
`wee`→`tiny` (4.8); `eyas-musket`→`little hawk-chick` (10.14);
`drumble`→`dawdle` (10.63); `draff`→`swill` (14.45); `ging`→`gang` (14.52);
`lewdsters`→`lechers` (21.9); `geminy`→`pair` (6.3); `fico`→`fig` (3.16);
`labras`→`lips` (1.75); `illades`/`œillades`→`glances` (3.31);
`nuthook's`→`constable's` (1.77); `kibes`, `ken`/`wight` (3.18, 3.22);
`whitsters` (10.8); `pumpion` (10.23); `uncape`→`uncouple the hounds` (10.70);
`gourd and fullam`→`loaded dice` (3.39). Most of these are defensible
glossing decisions in isolation; the concern is that no one has ever decided
them *as a set*, and several (`varletto`, `Mounseur`, `good-jer`) are the same
"character's own mangled coinage" category as the blocking items.

Confirmed non-blocking, agreeing with round 1: `Actæon`→`Actaeon` and
`quæ`→`quae` ligature normalization (consistent, both occurrences, referent
unchanged); `Keisar`→`Kaiser` in the Host's nonce list; `hæc` (13.24);
"These knights will hack" as an interpretive gloss.

---

## Why this is parked rather than fixed here

The dispatch allows a narrow, mechanical fix. This is not one:

1. **23.45 requires deciding what the joke is.** Restoring Falstaff's quoted
   `'Seese' and 'putter'!` is the faithful reading, but round 1's record
   asserts the opposite source text, so a repair round has to overrule a
   written acceptance record, not just patch a string. That needs the owning
   editor.
2. **Quickly's malapropisms need a policy, not six edits.** `detest`,
   `allicholy`, `canaries`, `alligant`, `speciously` each need a judgment on
   whether to keep the source's blunder bare (as Evans's `vizaments` and
   `Hibocrates` were kept) or keep-and-gloss, and the answer has to be applied
   uniformly to her ~74 speaking turns — a whole-character pass, the same
   scale of work as round 1's Evans pass.
3. **It is the third consecutive under-scoped sweep of one class in this
   book.** Round 1 ran three rescans and declared zero mismatches; a first
   independent pass found eight, plus an untouched character, plus a
   misquoted source. That track record is the tracker's stated reason to park
   rather than to keep patching: fixing these 20-odd items would produce yet
   another "clean" claim from within the same round, with no evidence the
   class is exhausted.

**Rounds used: 2 of 3.** A third round is still available if the programme
wants it, but it should be scoped as a fresh whole-book pass built from
`source.json` with **tag-agnostic** sweeps (the tag-keyed method demonstrably
misses continuation paragraphs), covering Quickly, the Host, Pistol and Nym as
first-class voices alongside Evans and Caius — not as a patch of the list
above.

## Method (so a later round can re-derive, not re-trust)

1. Structure re-derived directly from both JSONs (counts, titles, numbers,
   empties, apparatus patterns).
2. **Lost-token map:** for every one of the 1,155 paragraph pairs, every
   source token absent (case-insensitively, substring-tolerant) from the
   candidate paragraph at the *same* coordinate — 934 distinct lost tokens
   with full location lists, reviewed by hand. This is what surfaced the
   untagged Evans lines, Quickly's malapropisms and `Colebrook`; it is
   tag-agnostic and character-agnostic by construction.
3. **Tag-agnostic dialect-marker sweep:** a marker set drawn from source
   (`Got|pless|petter|prain|preeches|goot|fery|tevil|tam|peard|pody|pad|knog|
   possitable|fidelicet|vlouting|'oman|Seese|putter|pelly|peds|Pabylon|vagram|
   chollors|trempling|melancholies|cogscomb|costard|ork|vizaments|Hibocrates|
   pribbles|prabbles|by gar|Vat|dat|vill|Vere|Verefore|turd|Fe|mette|dépêche`)
   matched against *every* paragraph in the book regardless of speaker tag →
   the 8 mismatches above.
4. Independent compression sweep, all 1,155 paragraphs, 0.72×–1.8× band.
5. Independent register sweep, 34 charged terms, per-coordinate count
   comparison → 6.41.
6. Word-for-word reads: 1.1–1.30, 1.56–57, 4.1–4.70, 8.1–8.50, 10.55–10.74,
   13.40–13.50, 17.30–17.52, 23.0–23.50.

Working files for this round are the two JSONs themselves plus the lost-token
map; nothing in this directory was modified except this file and the note
appended to `ACCEPTANCE-RECORD.md`.
