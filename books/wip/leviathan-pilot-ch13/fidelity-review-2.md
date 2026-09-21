# Fidelity Review 2 — Leviathan, edition chapter 13 (Hobbes ch. 12, "Of Religion")

**Reviewer:** Reviewer B (independent fidelity re-check, round 2)
**Date:** 2026-09-21
**Fidelity anchor:** `books/wip/leviathan-pilot-ch13/source.json` (locked source, 32 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch13/candidate-sonnet.json` (round-2 state, commit `dc361d4a`)
**Round-1 baseline for diffing:** `dc361d4a^:books/wip/leviathan-pilot-ch13/candidate-sonnet.json`

## Verdict

**ACCEPT AS-IS** — no blocking fidelity defect. All seven round-1 blocking fixes
(F1–F7) landed correctly; the three additional round-2 readability edits
(¶ idx 15, 18, 23) are fidelity-neutral or fidelity-positive. Four optional,
non-blocking notes are carried below; none of them justifies another round.

## Structure and containment check — PASS

| Check | Result |
|---|---|
| `number` / `title` / `section` | identical to source (13 / "Chapter 12. Of Religion" / "Part I — Of Man") |
| paragraph count | 32 = 32 |
| empty paragraphs | none |
| paragraphs changed since round 1 | exactly `{5, 7, 15, 18, 20, 23, 30, 31}` (0-indexed), machine-diffed |
| paragraphs outside that set | byte-identical to round 1 — **confirmed, zero drift** |

Method: parsed both JSON files and compared paragraph arrays element-by-element,
then word-level `difflib` opcodes on each changed paragraph, so every altered word
in the chapter is accounted for below. Nothing was sampled.

### Index-label correction (important for the round-2 hand-off)

The change request labelled several edits with the wrong paragraph index. Actual
0-indexed mapping of what changed:

| idx | Content | Request called it |
|---|---|---|
| 5 | "…is very true" (fear-origin endorsement) | guessed correctly at the end of the request |
| 7 | "the liturgy of witches" | ¶7 ✓ |
| 15 | Larvae / Lemures catalogue | ¶5 ✗ |
| 18 | divination survey | ¶18 ✓ |
| 20 | Rome tolerance + bread | ¶15 ✗ |
| 23 | religion-founded-on-trust split | ¶23 ✓ |
| 30 | "jugling between Princes" | ¶20 ✗ |
| 31 | "mortify … most lively faith" | ¶30 ✗ |

All eight were verified regardless of label. The round-1 review used 1-indexed
paragraph numbers (its ¶8 = idx 7, ¶19 = idx 18, ¶21 = idx 20, ¶31 = idx 30,
¶32 = idx 31, ¶6 = idx 5, ¶24 = idx 23), which is the source of the confusion.

---

## Per-edit verification

### idx 5 — "quite true" → "very true"  (round-1 F6) — PASS
- Source: "which spoken of the Gods, (that is to say, of the many Gods of the Gentiles) **is very true**"
- Candidate: "which, said of the gods (that is, of the many gods of the pagans), **is very true**"
- Verdict: exact restoration of Hobbes's own phrase. Round 1 had suggested
  "perfectly true"/"entirely true"; taking the source's literal words is the better
  choice and removes the "quite true" concession-reading. This is where the
  "is very true" fix landed — **not** idx 30.

### idx 7 — "standard practice of witches" → "liturgy of witches"  (F1) — PASS
- Source: "as Charming, and Conjuring (**the Leiturgy of Witches**;)"
- Candidate: "as in charms and conjuring (**the liturgy of witches**)"
- Verdict: correct restoration, **not** an overcorrection. "Leiturgy" is Hobbes's
  own word and the whole point of the aside — he is deliberately applying a churchy,
  sacramental term to witches' formulas, which is the anticlerical barb. "Standard
  practice" both dropped a named term and neutered the joke. The modern spelling
  "liturgy" is the right modernization of "Leiturgy"; no gloss needed, the word is
  in ordinary use.

### idx 15 — "Larvae, Lemures, the ghosts of the dead" → "Larvae, Lemures, **and** the ghosts of the dead" — PASS (with an interpretive note)
- Source: "in the night time, all places with **Larvae, Lemures, Ghosts of men deceased, and a whole kingdome of Fayries, and Bugbears**"
- Verdict: the source punctuates this as a serial list — `Larvae, Lemures, Ghosts of
  men deceased, and a whole kingdom of Fairies and Bugbears` — with the single "and"
  attaching the *fairy kingdom*, not glossing Larvae/Lemures. Read on the page, that
  is four coordinate items, of which the first three are parallel. The round-2 form
  is consistent with that reading and removes the English ambiguity where "the ghosts
  of the dead" could be misread as an appositive restating the two Latin terms.
- Note (non-blocking, N12 below): the "and" is a word not present at that position in
  the source, so the edit does *resolve* an ambiguity rather than preserve it. The
  competing (appositive) reading is defensible on etymology — Larvae and Lemures *are*
  Roman names for spirits of the dead — but Hobbes is cataloguing names here, not
  defining them, and every neighbouring item in the catalogue is a separate entry.
  The change is safe and I would not revert it. The resulting double "and"
  ("…and the ghosts of the dead, and a whole kingdom of fairies and bogeymen") is a
  style nit for the accessibility reviewer, not a fidelity issue.

### idx 18 — divination survey split into four sentences — PASS (full clause-by-clause pass done)

This is the high-risk edit; it was checked twice: once by reading source and candidate
clause against clause, and once by an ordered-term scan.

Source item order (13 "Sometimes in X" groups) vs candidate, in order:

| # | Source | In candidate | Order |
|---|---|---|---|
| 1 | priests at **Delphi, Delos, Ammon** and other famous Oracles; answers ambiguous *by design, to own the event both ways*; or absurd from the intoxicating vapour, frequent in sulphurous caverns | "Delphi, Delos, Ammon, and other famous oracles — answers made deliberately vague so as to fit whatever happened afterward, or made incoherent by the intoxicating fumes common in such sulphurous caves" ✓ (both the by-design clause and the vapour clause survive) | ✓ |
| 2 | leaves of the **Sibills**; prophecies (**like those perhaps of Nostradamus**; fragments now extant seem the invention of later times); books in reputation in time of the **Roman Republique** | "the writings of the Sibyls — whose prophecies, **like those perhaps of Nostradamus** (the surviving fragments look like the invention of a later age), were held in some repute during the time of the Roman Republic" ✓ — **F4 hedge correctly restored** (hedge is back on the comparison; "attributed to" removed) | ✓ |
| 3 | speeches of mad-men, possessed with a divine Spirit; **Enthusiasme**; accounted **Theomancy** or Prophecy | present, both terms named | ✓ |
| 4 | aspect of the Starres at Nativity; **Horoscopy**; part of judiciary **Astrology** | "horoscopy … a branch of judicial astrology" | ✓ |
| 5 | own hopes and feares; **Thumomancy** or Presage | present | ✓ |
| 6 | Prediction of Witches conferring with the dead; **Necromancy, Conjuring, Witchcraft**; but juggling and confederate knavery | present, all three terms + the debunking clause | ✓ |
| 7 | casual flight or feeding of birds; **Augury** | present | ✓ |
| 8 | entrails of a sacrificed beast; **Aruspicina** | present | ✓ |
| 9 | **Dreams** | present | ✓ |
| 10 | croaking of **Ravens**, chattering of **Birds** | present | ✓ |
| 11 | lineaments of the face; **Metoposcopy**; or by **Palmistry** in the lines of the hand; casual words, **Omina** | "features of a person's face, called Metoposcopy, or to palm-reading the lines of the hand; to chance remarks, called omens" ✓ | ✓ |
| 12 | Monsters/unusual accidents — **Ecclipses, Comets, rare Meteors, Earthquakes, Inundations, uncouth Births** — **Portenta and Ostenta**, because thought to portend great Calamity | full list present in order, both Latin terms kept, the portent rationale kept | ✓ |
| 13 | meer Lottery, as **Crosse and Pile**; counting holes in a **sive**; dipping of Verses in **Homer and Virgil**; innumerable other vaine conceipts | all present, plus the two accepted round-1 glosses (heads/tails; opening at random) | ✓ |
| — | closing: "So easie are men to be drawn to believe any thing, from such men as have gotten credit with them; and can with gentlenesse, and dexterity, take hold of their fear, and ignorance." | present, intact, still a separate closing sentence | ✓ |

**No item dropped, none reordered, none merged into another.** An ordered scan of
every named term (Delphi, Delos, Ammon, Sibyls, Nostradamus, Roman Republic,
Enthusiasm, Theomancy, horoscopy, astrology, Thumomancy, necromancy, conjuring,
witchcraft, augury, Aruspicina, dreams, ravens, Metoposcopy, palm, omens, Portenta,
Ostenta, Cross and Pile, sieve, Homer, Virgil) returns the identical sequence in
source and candidate.

**"Sometimes" grouping check** — the specific risk flagged in the request. The source
marks every one of the 13 groups with its own "Sometimes in". The candidate now
distributes them as:

- sentence 2: item 1, marked "sometimes in the ambiguous or nonsensical answers…"
- sentence 3: item 2, marked "Sometimes they looked to…"
- sentence 4: items 3–6, marked "Sometimes they looked to … ; to … ; to … ; **or** to …"
- sentence 5: items 7–13, marked "**And sometimes** they looked to … ; to … ; … ; **and sometimes** to pure lottery…"

Each item stays a distinct object of "looked to", so no two practices are fused into
one claim, and no practice loses its "this was one of the things they sometimes did"
framing — "sometimes" distributes over the coordinated objects, and the final item
(lottery) gets its own re-marked "and sometimes". The grouping into sentence 4
(speech/stars/hopes/witches — the *human*-source omens) and sentence 5 (birds/entrails/
dreams/faces/portents/lottery — the *sign in the world* omens) is a readability
grouping only; Hobbes makes no claim about either grouping, so nothing is asserted
that the source does not assert. Accepted.

### idx 20 — Rome tolerance and bread  (F2, F3) — PASS
- Source: "needed **nothing else but bread**, to keep them from discontent, murmuring, and commotion against the State"
  → candidate: "they needed **nothing else but bread** to keep them from discontent, grumbling, and revolt against the state" ✓ exact; hedge "little else besides" gone.
- Source: "made **no scruple of tollerating any Religion whatsoever** in the City of Rome it selfe; **unlesse** it had somthing in it, that could not consist with their Civill Government"
  → candidate: "saw no difficulty in **tolerating any religion whatsoever** within the city of Rome itself, **unless** it contained something incompatible with their civil government" ✓; the unlicensed "almost" is deleted and "whatsoever" restored, so the only qualification is Hobbes's own "unless" clause.
- Both absolutes are now unhedged exactly as the source has them.

### idx 23 — religion-founded-on-trust, split into two sentences — PASS
- Source: "**For seeing** all formed Religion, is founded at first, upon the faith which a multitude hath in some one person, whom they believe not only to be a wise man, and to labour to procure their happiness, but also to be a holy man, to whom God himselfe vouchsafeth to declare his will supernaturally; **It followeth necessarily**, when they that have the Goverment of Religion, shall come to have either the wisedome of those men, their sincerity, or their love suspected; or that they shall be unable to shew any probable token of divine Revelation; that the Religion which they desire to uphold, must be suspected likewise; and (without the feare of the Civill Sword) contradicted and rejected."
- Content inventory across the split: trust of a multitude in one person ✓; believed wise ✓; believed to labour for their happiness ✓; believed holy ✓; God reveals his will to him ✓; those who govern religion ✓; wisdom suspected ✓; sincerity suspected ✓; love/goodwill suspected ✓; or unable to show any probable token of divine revelation ✓; the religion must be suspected likewise ✓; without fear of the civil sword ✓; contradicted and rejected ✓. **Nothing lost.**
- **"for since" → "For" + split:** the logical connection survives and is not materially changed. Two links are at stake, and both hold:
  1. *To the previous paragraph* (idx 22, how religion dissolves back into its seeds): carried by the retained "For", which still marks this paragraph as the explanation of the preceding claim. That is the load-bearing link and it is untouched.
  2. *Within the paragraph* (premise → conclusion): the source's "seeing X …; It followeth necessarily that Y" becomes "X. It necessarily follows that Y." The premise is now stated as a flat assertion rather than a subordinate "since" clause, but "It necessarily follows" immediately re-establishes it as the premise, and Hobbes asserts the premise as true anyway — he is not hedging it. Nothing inferential is lost; the reader still gets "because all religion rests on trust in a person, therefore loss of trust destroys it."
- Verdict: fidelity-neutral, readability-positive. No fix required.

### idx 30 — "collusion with rulers" → "playing rulers against one another"  (F7) — PASS
- Source: "by their uncleannesse, avarice, and **jugling between Princes**"
- Candidate: "through their impurity, greed, and **playing rulers against one another**"
- Verdict: correct. "Jugling between Princes" is the priests operating as a third
  party working trickery *between* multiple princes, not the priests partnering with
  a ruler — which is exactly what "collusion with rulers" had wrongly implied (it
  reassigned the accusation and made the priests the rulers' allies). The new wording
  puts the priests back as the manipulating third party and makes the plurality of
  princes explicit. Round 1 had suggested "double-dealing between rulers"; "playing
  rulers against one another" is at least as accurate and reads better.

### idx 31 — "weaken even the strongest faith" → "mortify even the most lively faith"  (F5) — PASS
- Source: "enough **to mortifie the most lively Faith**"
- Candidate: "enough **to mortify even the most lively faith**"
- Verdict: exact restoration of both halves of Hobbes's deliberate mortify/lively
  pairing (deaden vs. alive), which "weaken/strongest" had flattened. The added
  "even" is an intensifier not in the source but it is carried over from round 1 and
  does not change the claim. See N13 for the one accessibility caveat.

---

## Round-1 fixes — all seven verified still in place

| ID | Location (round-1 label → idx) | Status |
|---|---|---|
| F1 liturgy of witches | ¶8 → idx 7 | **FIXED, in place** |
| F2 delete "almost" / restore "whatsoever" | ¶21 → idx 20 | **FIXED, in place** |
| F3 "nothing else but bread" | ¶21 → idx 20 | **FIXED, in place** (matches source more exactly than the round-1 suggestion) |
| F4 "like those perhaps of Nostradamus" | ¶19 → idx 18 | **FIXED, in place** ("attributed to" removed) |
| F5 mortify / most lively faith | ¶32 → idx 31 | **FIXED, in place** |
| F6 "is very true" | ¶6 → idx 5 | **FIXED, in place** |
| F7 juggling between princes | ¶31 → idx 30 | **FIXED, in place** |

Because the machine diff shows no paragraph outside `{5,7,15,18,20,23,30,31}` changed
at all, every round-1 finding that lived elsewhere is necessarily untouched — that
includes the whole PASS surface of round 1 (proper-noun coverage, negation, causality,
conditions, no omissions, no invented claims, the three bracketed marginal headings,
the bluntness of ¶16/¶20–21/¶32) and the non-blocking notes N1–N11, which remain open
exactly as recorded and remain non-blocking.

---

## Non-blocking notes new in round 2

- **N12 — idx 15:** the added "and" resolves a genuine source ambiguity in favour of
  the three-parallel-items reading (see above). Safe; recorded so the choice is on the
  record rather than silent. Style nit only: two "and"s now in one list.
- **N13 — idx 31:** "mortify" is the source's word and the right fidelity call, but in
  present-day usage "mortify" most often means "embarrass," so a reader can stumble.
  Fidelity says keep it; if the accessibility reviewer objects, "deaden even the most
  lively faith" preserves the mortify/lively opposition without the modern collision.
  Reviewer B does not require a change.
- **N14 — idx 18:** "there were some books in reputation in the time of the Roman
  Republique" is rendered "whose prophecies … were held in some repute during the time
  of the Roman Republic" — the *books* drop out and the repute attaches to the
  prophecies. Carried over from round 1, not introduced by the sentence split. Minor;
  "of which some books were still in repute in the time of the Roman Republic" would
  be tighter.
- **N15 — idx 23:** "to whom God himselfe vouchsafeth to declare his will
  **supernaturally**" is rendered "chooses to reveal his will **directly**".
  "Directly" loses the explicitly supernatural register that the rest of the paragraph
  (and the "probable token of divine Revelation" clause right after it) turns on.
  Carried over from round 1, not a round-2 regression; "supernaturally" or "by
  supernatural revelation" would be truer. Not blocking.

## Coverage statement

- All 32 paragraphs accounted for: 8 re-read clause-by-clause against source this
  round; the remaining 24 machine-verified byte-identical to the round-1 text that
  round 1 read individually.
- idx 18 given the requested full clause-by-clause pass plus an independent ordered
  named-term scan (27 terms, exact order match).
- All 7 round-1 blocking fixes re-verified against the source text, not against the
  round-1 fix suggestion.
- Containment verified mechanically: no paragraph outside the declared set changed;
  `number`, `title`, `section`, paragraph count and paragraph order all unchanged.

**Result: ACCEPT AS-IS.** Ready for the whole-chapter re-read and verify-and-pin
steps of the acceptance procedure in `books/TRANSLATION_PROTOCOL.md`.
