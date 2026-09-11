# Odyssey Book 9 pilot — source-to-candidate coverage record

**Prepared:** 2026-09-11. Content-only staging work — not published, not merged into
`app/public/data/editions/`, no registry change.

## What this is

A single-chapter pilot modernization of the Odyssey (Book 9 — Odysseus tells the story of
the Cicones, the Lotus-eaters, and the Cyclops Polyphemus), produced to test the current
faithful-simplicity reading standard against a real, difficult, dialogue- and name-heavy
passage before any decision to retranslate the rest of the book. Chapter chosen because the
2026-09-11 audit found it one of the current `modern-en` edition's weakest chapters — "a
LIGHT/MECHANICAL false modern chapter" (per-book-notes/odyssey.md), 0.94 similarity to
Butler's 1900 prose, essentially untouched — so it's a real test case, not a cherry-picked
easy one.

## Snapshot identifiers

- Source (`original-en`, Butler 1900), whole file: sha256_16 `da03f6ac9dfd5a19` — from
  `docs/modern-english-translation-audit-2026-09-11/mechanical/odyssey.json`
  (`editions.original-en.sha256_16`), the same hash recorded in the 2026-09-11 audit.
- Current `modern-en`, whole file: sha256_16 `813127d77b4041f6` — same source,
  `editions.modern-en.sha256_16`. Both files confirmed unchanged since that audit: `git
  diff --stat` between the audited commit (`cdb6d8b9`) and current HEAD shows zero changes
  to any Odyssey edition file, so these hashes still identify the exact files this pilot
  was built against.
- New candidate: `books/staged-replacements/odyssey-pilot/odyssey-book9-candidate.json`,
  sha256_16 `10ef71b22be505f5`.

## Structure

44 paragraphs, exactly matching the source and the current `modern-en` chapter's paragraph
count — no merges, splits, reordering, or dropped paragraphs. Every source paragraph has
exactly one corresponding candidate paragraph at the same index.

## Word-count coverage

- Source: 5,800 words. Candidate: 5,135 words. Overall ratio: **0.89**.
- Every paragraph individually at or above 0.75 word ratio (the `books/AGENTS.md`
  truncation-flag floor) — **zero paragraphs flagged**. The lowest individual ratio is 0.79
  (the sailors' warning at paragraph 36, revised once during drafting — see "Local
  compression found and fixed" below).
- A ratio below 1.0 here reflects normal, expected compression from Victorian
  periodic-sentence prose (Butler's semicolon chains, "which," "for," and "so that"
  subordination stacked three and four deep) into natural modern sentence rhythm — not
  omitted content. Every claim, image, and qualification below was checked to have
  survived; see the specific tests below.

## Content-preservation checks (not just word-count — actual claims)

- **All named characters and places preserved and spelled consistently:** Odysseus, Zeus,
  Poseidon, Apollo, Hades (matching the existing `modern-en` convention already used
  elsewhere in the book — see "Naming decisions" below), Agamemnon, Laertes, Telemus,
  Eurymus, Maron, Euanthes, Polyphemus, Ismarus, the Cicones, Cythera, Cape Malea, Ithaca,
  Neritum, Dulichium, Same, Zacynthus, Aeaea/Circe.
- **Every named quantity preserved exactly:** twelve ships, nine goats per ship (ten for
  Odysseus's own), twelve best men chosen, seven talents of gold, twelve jars of wine,
  twenty measures of water to one of wine, six feet of the club cut off, twenty-two wagons,
  three bowls filled and drained, six men lost per ship to the Cicones, three ropes of
  sheep binding.
- **The Nobody/"nobody" pun preserved as a working pun, not glossed away** — paragraphs 23,
  24, 27, 28, 32. Rendered as "Nobody" (capitalized, a proper name) vs. "nobody" (the
  ordinary word), matching the wordplay mechanism exactly as Butler's "Noman"/"no man" does,
  and also matching the existing `modern-en` edition's own choice for this same pun
  (checked directly — the current file already uses "Nobody," so this candidate is
  consistent with established book-wide convention rather than introducing a new one).
- **Formulaic/repeated Homeric phrases preserved as repetition, not varied for style** —
  per the reading standard's explicit protection of meaningful repetition:
  - "struck the grey sea with their oars" — appears 4 times in the source (end of
    paragraphs 4, 10, 33, 43); rendered identically all 4 times in the candidate.
  - "When Dawn's fingers reddened the sky" (Butler: "the child of morning, rosy-fingered
    Dawn") — appears 4 times (paragraphs 8, 19, 31, 43); rendered identically all 4 times.
  - The sacrifice-and-feast formula ("we feasted... to the going down of the sun") appears
    twice (paragraphs 8, 43) and is rendered with the same structure both times.
- **The curse's conditional structure preserved precisely** (paragraph 40) — "if I am
  truly your son... grant that he never reach home. *But if* it is fated that he see his
  own country again... *let* him come late, and badly, having lost all his companions, in
  a ship that is not his own." This is a real either/or logical structure (the "almost vs.
  certainly," "possibility vs. certainty" kind the reading standard flags) — not
  flattened into a single wish.
- **Deliberate ambiguity left alone.** The source never states why Polyphemus drove all
  his sheep inside the one night that mattered (paragraph 20: "whether by some whim of his
  own or because a god prompted him, I cannot say") — kept as Odysseus's own uncertainty,
  not resolved either way.
- **No invented motives, diagnoses, or explanatory transitions added anywhere.** Checked
  specifically because this is the single most common failure mode found across the whole
  101-book audit (e.g. Jane Eyre's invented imagery, Ulysses's invented attribution) — this
  candidate adds no sentence, clause, or claim that is not in the source.

## Local compression found and fixed during drafting

**Paragraph 36** (the sailors begging Odysseus not to taunt the Cyclops again) was drafted
too compressed on first pass (81 → 52 words, 0.64 ratio) and blurred Butler's exact
grammar: the source is a past-hypothetical ("if he *had* heard... he *would have* smashed
us") describing what would have happened right after the first rock, not a forward
warning about a future rock. The first draft accidentally shifted it into a flat future
warning ("if he hears your voice again, he'll smash..."), and dropped "we made sure it had
been the death of us" — the men's own admission of fear. Revised to restore both the
specific claim and the exact conditional tense: "we were sure it meant the death of us...
if he had heard even one more sound from us just then, he would have smashed..." Flagging
this here deliberately, per the task's instruction not to imply whole-chapter verification
from a clean pass — this is exactly the kind of local slip a single unsupervised draft can
produce, and it's why a coverage record and independent review matter even for one
chapter.

## Naming decisions (explicit, not silent)

- **Odysseus, not Ulysses.** Butler's 1900 prose uses the Latin "Ulysses" throughout;
  virtually every reading modern audience knows the character as "Odysseus," and the
  existing `modern-en` edition (all 24 books, checked directly — 585 occurrences of
  "Odysseus," 0 of "Ulysses") already made this switch consistently. This candidate
  matches that established choice rather than reopening it. It's exactly the "alternate
  Greek names where alternate names have no literary function" case in the reading
  standard — Ulysses/Odysseus is a Latin-vs-Greek naming convention with no meaning
  difference in English, not a case (like Butler's own "Neptune" vs. Homer's
  Poseidon-in-Greek, or a disguise name, or a shift in address/rank) where the alternate
  name is doing real work.
- **Zeus (not Jove), Poseidon (not Neptune)** — same reasoning, same check against the
  existing `modern-en` convention (188 "Zeus" / 0 "Jove"; 58 "Poseidon" / 0 "Neptune").
- **Cicones (not "Cicons")** — matches the existing `modern-en` spelling; Butler's
  original-en uses "Cicons."
- Polyphemus is never named in Butler's own text of Book 9 except via the other Cyclopes'
  question ("What ails you, Polyphemus") and Poseidon's paternity — the candidate follows
  the source exactly on when the name is and isn't used; it is not introduced earlier for
  false clarity.

## Glosses — brief, and only where the term is genuinely obscure

Per the standard's "explain unfamiliar terms only briefly and where necessary; prefer a
familiar accurate equivalent when possible," a small number of purely archaic words were
replaced with a plain equivalent rather than kept and glossed, since a full gloss would be
heavier than the term deserves:
- "hoggets" (a specific English farming term for yearling sheep, meaningless to a modern
  reader and not part of the poem's own imagery) → folded into "the older lambs, the
  middle ones, and the very young" — the actual content (age-graded flock separation)
  survives; the obscure single word does not need preserving for its own sake.
- "withies" (willow branches used as cord) → "willow withies—cords the monster used for
  his own bed" — kept the word but glossed it in four words at the point of use, since it's
  doing real work (a specific detail about what Odysseus had on hand), unlike "hoggets."
- "wallet" (archaic for a traveler's sack) → "sack," avoiding the modern coin-purse
  misreading; matches the existing `modern-en` choice ("bag") in spirit.
- "vouchsafed... not one word of answer" → "answered not a word" — same claim, no archaism.

No historical facts, interpretations, or diagnoses were added anywhere — every gloss above
replaces one archaic word with a plain equivalent carrying the same specific content, it
does not add new content.

## What this coverage record does NOT establish

Per the audit's own calibration language: this is one chapter, one careful pass, one
reviewer (mine). It establishes that a Sonnet-Medium pass, disciplined by this specific
reading standard, CAN produce a materially better rendering of a chapter the current
`modern-en` edition handles badly — it does not establish that a full-book retranslation
in this style would hold this quality uniformly across 24 books and ~130,000 words without
drift (the audit found exactly that kind of drift — strong openings, weakening later
chapters — in over a dozen other books). That is precisely why the task calls for
independent review of this pilot before proposing a larger retranslation, not after.
