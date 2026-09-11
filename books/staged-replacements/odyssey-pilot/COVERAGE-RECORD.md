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
  current sha256_16 `d7606655949db23c`, reproduced with
  `python3 -c "import hashlib; print(hashlib.sha256(open('books/staged-replacements/odyssey-pilot/odyssey-book9-candidate.json','rb').read()).hexdigest()[:16])"`.
  This is the file's third state: original draft (`10ef71b22be505f5`), first correction
  round (`662aa2a453f65f81`, 6 fixes, see "First correction round" below), second
  correction round (`d7606655949db23c`, 14 more paragraph-level fixes across 11 reported
  issues, see "Second correction round" below — this is the current, staged state).

## Structure

44 paragraphs, exactly matching the source and the current `modern-en` chapter's paragraph
count — no merges, splits, reordering, or dropped paragraphs. Every source paragraph has
exactly one corresponding candidate paragraph at the same index.

## Word-count coverage

**Method** (so this is reproducible, not just asserted): for each of the 44 paragraphs,
`len(paragraph.split())` on the source paragraph and the corresponding candidate
paragraph, at the same index; summed for the totals below. Recomputed after the second
correction round, against the current candidate file (`d7606655949db23c`).

- Source: 5,800 words. Candidate: 5,144 words. Overall ratio: **0.887**.
- Every paragraph individually at or above 0.75 word ratio (the `books/AGENTS.md`
  truncation-flag floor) — zero paragraphs below that floor.

**What this does and does not establish.** A word-count ratio, even computed correctly and
even with no paragraph below the floor, is a screening signal, not proof of completeness —
this is the audit's own standard and it applies here too. It cannot detect a *substitution*
(one true detail swapped for a different, similar-length invented one), which is exactly
the failure mode most of the corrections below actually were: "spring" for "summer,"
"the crew is ready" for "the wind becomes fair," "adze" for "hatchet," an added epithet in
place of the source's plain name. All of those pass a word-count check cleanly while being
wrong. The word-count numbers above describe paragraph-level compression, nothing more;
the actual content-accuracy checking is the paragraph-by-paragraph comparison work
described in the sections below and in both correction rounds, and that checking is itself
bounded — see "What this coverage record does NOT establish" at the end of this file.

## Content-preservation checks (not just word-count — actual claims)

These are the specific things that were checked and found to hold, as of the current
(second-correction-round) file. They describe the checks actually performed, not a claim
that every clause in all 44 paragraphs has been individually re-verified against the
source — two rounds of external review have now found errors this list's own checks did
not catch (see both correction-round sections below), so this list should be read as
"confirmed for these specific items," not as a completeness guarantee.

- **All named characters and places preserved and spelled consistently:** Odysseus, Zeus,
  Poseidon, Apollo, Hades (matching the existing `modern-en` convention already used
  elsewhere in the book — see "Naming decisions" below), Agamemnon, Laertes, Telemus,
  Eurymus, Maron, Euanthes, Polyphemus, Ismarus, the Cicones, Cythera, Cape Malea, Ithaca,
  Neritum, Dulichium, Same, Zacynthus, Aeaea/Circe.
- **Every named quantity checked against the source and found to match:** twelve ships,
  nine goats per ship (ten for Odysseus's own), twelve best men chosen, seven talents of
  gold, twelve jars of wine, twenty measures of water to one of wine, six feet of the club
  cut off, twenty-two wagons, three bowls filled and drained, six men lost per ship to the
  Cicones, three sheep bound per man. This is a list of the numbers actually compared
  side-by-side against the source, not an automated or exhaustive count of every number in
  the chapter.
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
- **No invented motives, diagnoses, or explanatory transitions at the sentence/plot level**
  — no added interpretation of why a character does something, no new claim about events
  not narrated in the source. This checked out at that scale. It did **not** catch smaller
  invented specifics — a mechanism, a season, a cause-and-effect link, two epithets — which
  is exactly what the two correction rounds below found. Revising the earlier version of
  this record, which claimed "this candidate adds no sentence, clause, or claim that is not
  in the source" outright: that was checked at the wrong grain and turned out to be false
  at a finer one. The corrected, honest claim is the narrower one above.

## First correction round (2026-09-11, post-drafting)

Anders reviewed the first draft directly and found six real errors the drafting pass
missed. All six were verified against the actual source text and corrected. Recorded here
in full rather than silently fixed, per the task's own standard of not implying more
verification than actually happened:

1. **The Nobody pun's capitalization (paragraph 27).** Butler writes "*Noman* is killing me
   by fraud; *no man* is killing me by force" — capitalizing the first instance (invoking
   it as a name) and lowercasing the second (the plain statement). The first draft
   capitalized "Nobody" both times, flattening a distinction Butler's own text makes.
   Fixed to mirror Butler's pattern exactly: "*Nobody* is killing me by treachery; *nobody*
   is killing me by force."
2. **The stake-sharpening action (paragraph 20).** Butler has the men smooth *one end*,
   and Odysseus then sharpens *that same end* to a point. The first draft wrote "I
   sharpened **the other end**," which invents a second end being worked on — a real
   change to the described action. Fixed to "I finished sharpening that same end."
3. **An invented drilling mechanism (paragraph 25).** Butler's simile is an auger turned
   by two men with "a wheel and strap." The first draft added "a bow" — a real but
   different historical drilling method (a bow-drill, not a strap-drill) that isn't in
   Butler's text at all. This was an unprompted intrusion of outside knowledge into the
   translation. Fixed to match Butler's actual mechanism: "which two men can keep turning
   ... with a wheel and strap."
4. **A changed season (paragraph 2).** Butler: the Cicones' reinforcements came "as thick
   as leaves and bloom in **summer**." The first draft wrote "leaves and blossoms of
   **spring**" — a plain factual change with no justification. Fixed to "summer."
5. **A lost condition (paragraph 6).** Butler: ships wait at the harbor "till **the wind
   becomes fair** for putting out to sea again" — an external, weather-based condition.
   The first draft substituted "until **the crew is ready**" — a different, invented
   reason. Fixed to restore the wind condition.
6. **Two invented Homeric epithets (paragraphs 37, 40).** The first draft added "sacker of
   cities" for Odysseus (paragraphs 37 and 40) and "god of the dark hair" for Poseidon
   (paragraph 40) — both real, well-known Homeric epithets, but not ones Butler uses at
   these specific points, and not something a faithful modernization of Butler's *own*
   text should import on its own authority. Butler's paragraph 37 has "the valiant warrior
   Ulysses"; paragraph 40 has plain "Ulysses" with no epithet and no repeated
   "son of Laertes, who lives in Ithaca." Fixed both to match Butler's actual wording
   exactly, dropping the imported epithets rather than deciding unilaterally that they
   belonged.

**Pattern across all six:** every one is a case of the drafting pass supplying something
plausible, sometimes even historically or poetically accurate in a general Homeric sense,
that was not actually present in the specific source text being modernized. This is
exactly the "invention" failure mode the reading standard is built to catch, and it slipped
past the drafter's own first-pass self-check (which caught a different problem, paragraph
36's compression, but missed these).

## Second correction round (2026-09-11, later the same day)

A second, more granular review — checking specific reported issues directly against
Butler's text rather than a general re-read — found 11 more reported issues, resolving to
14 paragraph-level fixes (some issues recurred across more than one paragraph). Every item
below was independently verified against the exact source paragraph before being applied;
none was taken on the reviewer's word alone, and none was rejected — all 11 reported
issues checked out as real on inspection.

| # | Paragraph(s) | Source detail | What the candidate had | Fix |
|---|---|---|---|---|
| 1 | 2 | "put the people to the sword" | narrowed to "killed the men" | restored Butler's actual phrase rather than an inferred paraphrase |
| 2 | 4 | "a third man under them" (i.e. under the two men's command) | invented role, "a third to go along as herald" | "a third man under their command" |
| 3 | 5 | "their wild grapes yield them wine as the sun and the rain may grow them" | wine-production detail dropped, "rain" only (sun dropped) | restored the wine clause and both sun and rain |
| 4 | 9 | "a hospitable and humane race" | "a hospitable, god-fearing race" | restored "humane" |
| 5 | 11 | wine's fine quality and its secrecy are two separate facts | joined with an invented causal link ("so fine that no one ... knew of it") | split into two independent sentences, no causal claim added |
| 6 | 13 | "wicker strainers" (a cheese-making tool, separates whey from curds) | "wicker baskets" (a different object) | restored "wicker strainers" |
| 7 | 14 | mutual hostility — "your hands against every man, and every man's hand against you" | replaced with "ready to risk your own lives and bring death to others" (one-directional) | restored the reciprocal formula |
| 8 | 15 | "all **respectable** travellers"; "avenger of all suppliants **and foreigners in distress**" | qualifier "respectable" dropped; "foreigners in distress" flattened to "strangers" | restored both qualifiers |
| 9 | 18 | "with a sudden clutch he gripped up two of my men" (no prior posture given) | invented "sprang up" (implies he was sitting/lying first) | "with a sudden grab seized" — drops the unsupported posture-change |
| 10 | 19 | "he shouted, and cried 'Shoo, shoo'" | invented "whistled" | restored shouting and the "Shoo, shoo!" cry |
| 11 | 20 | men smooth **one end**; Odysseus sharpens **that same end** | "I sharpened the other end" (a second end) | "I finished sharpening that same end" |
| — | 20 | "an ivy-wood bowl" | genericized to "a wooden bowl" | restored "ivy-wood bowl" |
| 12 | 25 | "two men **with a wheel and strap**" turn the auger | invented "a bow" (a different, real but unrelated drilling method) | restored "a wheel and strap," removed "a bow" |
| — | 25 | "an axe or **hatchet**" | "adze" (a different tool) | restored "hatchet" |
| 13 | 26 | negative rhetorical form, "Surely no man is..."; order "by fraud or by force" | flattened to plain questions ("Is someone..."); reordered "by force or by treachery" | restored the "Surely nobody is..." rhetorical form and the treachery-then-force order (matching paragraph 27's own order) |
| 14 | 32 | "But I will have his life yet" (explicit intent to kill) | softened to "He has not got away yet, I promise you" | restored the explicit kill-intent line |

Two items are listed with `—` in the numbering column because they surfaced in the same
paragraph as a numbered item but weren't separately itemized in the reported list: the
ivy-wood-bowl and hatchet/adze substitutions sit in paragraphs 20 and 25, alongside items
11 and 12. (Paragraphs 37 and 40's invented epithets — "sacker of cities," "god of the
dark hair" — are not part of this round; they were already found and fixed in the first
correction round above and are not re-listed here.)

**No item from the reported list was rejected.** Every one, checked directly against the
exact source paragraph, was a real, verifiable divergence. There is no "found not
supported" item to report for this round.

**Unresolved questions:** none outstanding after this round's fixes. One judgment call
worth flagging rather than treating as fully settled: paragraph 25 keeps "red-hot" before
"axe or hatchet" even though Butler's line is simply "an axe or hatchet into cold water to
temper it" with no "red-hot." This wasn't part of the reported list, and tempering by
definition means quenching hot metal, so it's a defensible implicit detail rather than a
fabricated one — but it is, strictly, a word not in Butler's sentence, and a future review
pass may reasonably decide it should come out. Left as-is per the instruction not to
rewrite prose beyond the reported, verified issues.

**What two rounds of correction, on top of the drafter's own self-check, actually shows:**
three independent look-backs at the same 44 paragraphs (the drafter's own pass, which
caught one compression; a first review pass, which caught six invented/altered details;
and this second, more granular pass, which caught eleven more) each found real problems
the previous pass missed. That is not a comment on this chapter specifically so much as on
what one or two passes can be expected to catch. It reinforces, more strongly than either
correction round alone did, why the task treats this pilot as something to be reviewed
before scaling up, not as a template to apply directly to the other 23 books.

## Drafting-stage self-correction

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

This is one chapter, checked across three passes so far (the drafter's own pass plus two
external correction rounds), not an independent, adversarial line-by-line audit of the
kind the September translation audit ran against the other 100 books. It establishes that
a Sonnet-Medium pass, disciplined by this reading standard and willing to be corrected
twice over, converges toward a materially better rendering of a chapter the current
`modern-en` edition handles badly. It does **not** establish:

- that every one of the 44 paragraphs is now fully accurate — three rounds each found real
  errors the previous round missed, and there is no basis here for assuming a fourth round
  would find nothing;
- that matching word counts, matching paragraph counts, or a passing per-paragraph ratio
  proves completeness — see the word-count section above; several of the actual errors
  found in both correction rounds passed those checks cleanly;
- that a full-book retranslation in this style would hold this quality uniformly across 24
  books and ~130,000 words without drift (the audit found exactly that kind of drift —
  strong openings, weakening later chapters — in over a dozen other books).

That is precisely why the task calls for independent review of this pilot before
proposing a larger retranslation, not after, and why this chapter remains staged pending
acceptance rather than treated as finished.
