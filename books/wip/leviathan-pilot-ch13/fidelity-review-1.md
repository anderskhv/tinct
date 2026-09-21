# Fidelity Review 1 — Leviathan, edition chapter 13 (Hobbes ch. 12, "Of Religion")

**Reviewer:** Reviewer B (independent fidelity pass), per `books/prompts/fidelity-review-prompt.md`
**Date:** 2026-09-21
**Fidelity anchor:** `books/wip/leviathan-pilot-ch13/source.json` (locked source, 32 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch13/candidate-sonnet.json`

## Verdict

**ACCEPT WITH FIXES REQUIRED** — 7 required fixes, all local patches. No re-draft
needed; the rendering is a genuine modern-English translation, paragraph-faithful,
with no invented claims and no dropped examples.

## Coverage

Every one of the 32 paragraphs was read individually, source against candidate, in
five packets with one paragraph of overlap context on each side:

- Packet A: 1–7 (context: 8)
- Packet B: 8–13 (context: 7, 14)
- Packet C: 14–19 (context: 13, 20)
- Packet D: 20–25 (context: 19, 26)
- Packet E: 26–32 (context: 25)
- Whole-chapter re-read pass for cross-boundary consistency (recurring terms:
  Gentiles/pagans, Powers Invisible, Prognostiques, the four seeds, the
  Wisdom/Sincerity/Love triad in ¶25–27 paid off from ¶24).

Nothing was skimmed or sampled.

## Structure check — PASS

| Field | Source | Candidate |
|---|---|---|
| `number` | 13 | 13 |
| `title` | "Chapter 12. Of Religion" | "Chapter 12. Of Religion" (identical) |
| `section` | "Part I — Of Man" | "Part I — Of Man" (identical) |
| paragraph count | 32 | 32 |

Paragraph order and boundaries match one-for-one; nothing merged, split,
reordered, or dropped. The three running marginal headings embedded in the source
prose (¶5 "The Naturall Cause Of Religion…", ¶20 "The Designes Of The Authors…",
¶22 "The True Religion, And The Lawes Of Gods Kingdome The Same") are each rendered
in the candidate as a bracketed lead-in — consistently applied in all three places,
none dropped.

## Proper-noun / named-term coverage — PASS (complete)

Every named person, place, deity, text and divination practice in the source is
present in the candidate. Checked term by term:

- **¶8:** Lepanto ✓, Phormio ✓, Scipio ✓, Africa ✓, Athenians ✓, Pompeian faction ✓
- **¶16:** Pan ✓, Panises ✓, satyrs ✓, fauns ✓, nymphs ✓, Tritons ✓, Lares ✓,
  Genius ✓, Charon ✓, Cerberus ✓, Furies ✓, Larvae ✓, Lemures ✓, fairies ✓,
  bugbears→"bogeymen" ✓, Muses ✓, Fortune ✓, Cupid ✓, Priapus ✓, Incubi ✓,
  Succubae ✓; full deification catalogue intact (men, women, bird, crocodile, calf,
  dog, snake, onion, leek); full abstract-deity list intact (Time, Night, Day,
  Peace, Concord, Love, Contention→Strife, Virtue, Honor, Health, Rust, Fever)
- **¶17:** Venus ✓, Apollo ✓, Mercury ✓, Aeolus ✓ (each with its correct domain)
- **¶18:** Bacchus ✓, Hercules ✓; vice list intact (fraud, theft, adultery, sodomy)
- **¶19 (highest density — all present):** Delphi ✓, Delos ✓, Ammon ✓, Sibyls ✓,
  Nostradamus ✓, Roman Republic ✓, Enthusiasm ✓, Theomancy ✓, horoscopy ✓,
  judiciary/judicial astrology ✓, Thumomancy ✓, necromancy ✓, conjuring ✓,
  witchcraft ✓, augury ✓, Aruspicina ✓, Metoposcopy ✓, palmistry ✓, Omina ✓
  (anglicized — see N3), Portenta ✓, Ostenta ✓, Cross and Pile ✓, counting holes in
  a sieve ✓, dipping of verses in Homer and Virgil ✓
- **¶20:** Numa Pompilius ✓, Egeria ✓, Peru ✓, Mahomet→"Muhammad" ✓ (see N1)
- **¶21:** Rome ✓, the Jews ✓
- **¶29–30:** Moses ✓, Aaron ✓, Joshua ✓, Egypt ✓, golden calf ✓, Exod. 32:1–2 ✓,
  Judges 2:11 ✓, Baal ✓, Samuel ✓, 1 Sam. 8:3 ✓, Bersabee→"Beersheba" ✓ (see N2),
  "40 dayes"→"forty days" ✓
- **¶31:** France ✓, Holland ✓, England ✓, Aristotle ✓, schoolmen ✓, Church of Rome ✓
- **¶32:** Chilperic ✓, Pope Zachary ✓, England ✓, Purgatory ✓

**No named term was silently dropped or generalized away.**

## Bluntness check — mostly PASS

- **¶6 (religion's origin in fear):** "some of the old Poets said, that the Gods were
  at first created by humane Feare" is rendered flatly, hedge ("perhaps") preserved
  in the right place. One softening in the follow-up clause — see F6.
- **¶16 (deification catalogue):** rendered at full, unsparing length; the onion and
  leek, the genitals-as-Priapus line, and the "nothing a poet could bring into his
  poem that they did not make a god or a devil" close are all as blunt as the source.
- **¶20–21 (religion as statecraft):** "whose whole purpose was simply to keep the
  people obedient and at peace" and "this is how the religion of the pagans
  functioned as a part of their statecraft" are unhedged. Good.
- **¶32 (closing thesis):** "priests who make themselves disliked — and this holds
  not only among Catholics, but even within the church that has claimed the most
  credit for reforming itself." This is the correct, unsoftened rendering of
  "unpleasing Priests"; the self-implicating Protestant jab survives. Good.

Where softening did creep in, it is in intensifiers and absolutes (F2, F3, F5, F6),
not in the theses themselves.

---

## Required fixes (blocking)

**F1 — ¶8: named term lost, anticlerical edge blunted**
- Source: "as Charming, and Conjuring (the Leiturgy of Witches;)"
- Candidate: "as in charms and conjuring (the standard practice of witches)"
- Problem: "Liturgy" is the whole point of the aside — Hobbes is equating witches'
  formulas with church liturgy. "Standard practice" generalizes the loaded term away
  and removes the barb. Also an omission under the named-term rule.
- Fix: "…as in charms and conjuring (the liturgy of witches)".

**F2 — ¶21: unlicensed hedge added**
- Source: "made no scruple of tollerating any Religion whatsoever in the City of Rome
  it selfe; unlesse it had somthing in it, that could not consist with their Civill
  Government"
- Candidate: "saw no difficulty in tolerating almost any religion within the city of
  Rome itself, unless it contained something incompatible…"
- Problem: "almost" is not in the source and is not needed — the "unless" clause
  already carries the only qualification Hobbes allows. Adding a second hedge weakens
  a deliberately absolute claim.
- Fix: delete "almost": "…tolerating any religion whatsoever within the city of Rome
  itself, unless…".

**F3 — ¶21: absolute softened**
- Source: "needed nothing else but bread, to keep them from discontent, murmuring, and
  commotion against the State"
- Candidate: "they needed little else besides bread to keep them from discontent…"
- Problem: "nothing else but" → "little else besides" converts an absolute (the
  bread-and-circuses claim in its hardest form) into a hedge.
- Fix: "needed nothing but bread to keep them from discontent, grumbling, and revolt
  against the state".

**F4 — ¶19: hedge relocated, turning a comparison into an attribution**
- Source: "of whose Prophecyes (like those perhaps of Nostradamus; for the fragments
  now extant seem to be the invention of later times)"
- Candidate: "whose prophecies, like those attributed to Nostradamus (the surviving
  fragments look like the invention of a later age)"
- Problem: Hobbes hedges the *comparison* ("like those perhaps of Nostradamus"); the
  candidate drops that "perhaps" and instead inserts a hedge on *authorship*
  ("attributed to"), which the source does not say. Certainty is moved, not preserved.
- Fix: "whose prophecies — like those, perhaps, of Nostradamus (the fragments now
  surviving look like the invention of a later age) — …".

**F5 — ¶32: verb softened**
- Source: "enough to mortifie the most lively Faith"
- Candidate: "enough to weaken even the strongest faith"
- Problem: "mortify" = kill/deaden, and "lively" is its deliberate opposite; "weaken /
  strongest" loses both the force and the pairing.
- Fix: "enough to deaden even the liveliest faith".

**F6 — ¶6: blunt endorsement softened**
- Source: "which spoken of the Gods, (that is to say, of the many Gods of the
  Gentiles) is very true"
- Candidate: "which, said of the gods (that is, of the many gods of the pagans), is
  quite true"
- Problem: in current usage "quite true" reads as a partial concession; Hobbes is
  endorsing the fear-origin claim without reservation for the pagan gods. This is
  exactly the sentence the bluntness mandate covers.
- Fix: "is perfectly true" (or "is entirely true").

**F7 — ¶31: actor relation changed**
- Source: "by their uncleannesse, avarice, and jugling between Princes"
- Candidate: "through their impurity, greed, and collusion with rulers"
- Problem: "juggling between Princes" is the priests playing rulers off against each
  other — trickery worked *between* princes, with the priests as the third party.
  "Collusion with rulers" makes the priests the rulers' partners, a different
  accusation.
- Fix: "…their impurity, greed, and double-dealing between rulers".

---

## Non-blocking notes (no fix demanded)

- **N1 — ¶20:** "Mahomet" → "Muhammad". Spelling modernization of a proper noun,
  consistent with the modernization mandate; flagged only because the prompt asks for
  silent name normalizations to be surfaced.
- **N2 — ¶30:** "Bersabee" (Vulgate form) → "Beersheba". Same category as N1; the
  referent is unchanged.
- **N3 — ¶19:** "in casuall words, called Omina" → "in chance remarks, called omens".
  The Latin technical term is anglicized where its neighbours (Portenta, Ostenta,
  Aruspicina) are kept in Latin. Slightly inconsistent; keeping "Omina" would match.
- **N4 — ¶19:** "the leaves of the Sibills" → "the writings of the Sibyls". Loses the
  concrete Sibylline-leaves image; meaning survives.
- **N5 — ¶19:** two explanatory glosses added — "Cross and Pile — that is, heads or
  tails" and "opening Homer or Virgil at random and reading whatever line the eye fell
  on" for "dipping of Verses in Homer, and Virgil". Both are accurate and keep the
  named terms; acceptable as modernization, not invention.
- **N6 — ¶16:** "Hell, with Ghosts, and spirituall Officers" → "the underworld with
  ghosts and spirit officials". Defensible in a pagan catalogue; the source word is
  "Hell". Also "every man, with his Genius" → "his own guardian genius" adds
  "guardian" as a gloss.
- **N7 — ¶32:** "Vales of Purgatory" → "payments made to shorten time in Purgatory" —
  a gloss on an obsolete word ("vails" = gratuities); accurate.
- **N8 — ¶5:** "especially those that are over provident" → "especially the overly
  cautious ones". "Provident" is foresight, not caution; "those who look furthest
  ahead" would track the Prometheus image better. Minor.
- **N9 — ¶28:** "as in naturall things, men of judgement require naturall signes" →
  "in ordinary matters, sensible people demand natural evidence". The
  natural/supernatural pairing that the sentence turns on is slightly blurred by
  "ordinary"; "natural matters" would keep it.
- **N10 — small intensifiers added without source warrant, none meaning-changing:**
  ¶10 "reliable signs" (source: "Prognostiques"); ¶26 "far smaller faults" (source:
  "lesser faults"); ¶31 "leads directly to" (source: "maketh … faile").
- **N11 — ¶24/27:** "Love" is rendered "goodwill" in the headline uses but "love" in
  the closing clause of ¶27. This is arguably correct (the last use is literal), but
  worth a deliberate decision rather than drift.

## Categories checked with no defects found

- **Actors / subject-object swaps:** clean throughout except F7.
- **Negation:** all preserved, including the tricky double negatives — ¶1 "no cause to
  doubt", ¶7 "could never enter into the mind of any man by nature", ¶20 "men were not
  forbidden to deny" → "were free to deny" (correctly inverted), ¶25 "of many things
  above, but of nothing against naturall reason" → "beyond … but never … opposed to
  it".
- **Causality:** all "for / therefore / because / insomuch as / in spite of" relations
  point the same direction, including the long causal chain in ¶6 (First Mover) and
  the two-part cause structure in ¶31 (priestly vice *and* scholastic Aristotle).
- **Conditions:** ¶24 "(without the feare of the Civill Sword)", ¶21 "unless it had
  something in it…", ¶32 "were it not for the mutuall emulation of those Princes" —
  all survive with the same scope and consequence.
- **Omissions:** no clause, example, number, or aside missing. Numbered/ordinal
  scaffolding ("first / secondly / thirdly / lastly") preserved in ¶2–4, ¶9–11, ¶19,
  ¶20, ¶28.
- **Additions:** no invented claim or image; the only additions are the glosses at N5
  and the intensifiers at N10.
- **Silent corrections:** none of substance. "Lepanto" is retained in ¶8 even though
  the Athenian battle is historically Naupactus — correctly left as Hobbes wrote it.
  N1/N2 are spelling modernizations, not factual corrections.
- **Unmodernized quotations / archaic islands:** none. No archaic passage survives
  inside the modern prose; the bracketed marginal headings are modernized too.
