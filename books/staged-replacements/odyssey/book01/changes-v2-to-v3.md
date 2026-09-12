# The Odyssey, Book 1 — changes from `candidate-v2.json` to `candidate-v3.json`

**One word, in one paragraph.** Book 1 was accepted at v2 on 2026-09-12
(`ACCEPTANCE.md`). It is reopened here on a finding raised by a *later* Book's
review round, because the phrase in question is a cross-Book formula and the
package's rule is that a formula changes in every Book at once or in none.

| | |
|---|---|
| Predecessor | `candidate-v2.json`, sha256 `f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45` — **accepted, and untouched on disk** |
| Successor | `candidate-v3.json`, sha256 `c97e20f5b929d0e02b4cd1a3cd0ce8dceec86f71c935371360ab3bd14807b57c` |
| Readable copy | `candidate-v3-readable.md` |
| Built by | `../scripts/build_book01_v3.py` (asserts v2's accepted hash before touching it; re-asserts every `GLOSSARY.md` hazard and every `PUNCTUATION.md` standard afterwards) |
| Finding answered | **11.1**, `../book02/review/findings-v1.md` (Book 2, round 1) |
| Paragraphs differing v2 → v3 | **1** — `B01-P019` |
| Word ratio | 0.9462 → **0.9465** (3,889 → 3,890 words against the source's 4,110) |

## The change

**B01-P019 — finding 11.1 (minor, Book 2 round 1).**

| | |
|---|---|
| Butler | `he will find her a husband and provide all the marriage gifts that **so dear a daughter may expect**` |
| v2 | `he will find her a husband and provide all the marriage gifts **a beloved daughter deserves**` |
| **v3** | `he will find her a husband and provide all the marriage gifts **a beloved daughter may expect**` |

Butler's phrase is a statement about **custom** — what a well-loved daughter
can look to receive. `deserves` is a statement about **merit**. The two are not
the same claim, and the second is not in the source.

The objection was raised at Book 1's own round 1, as an unnumbered "also
noted" remark, and was not answered: no better wording had been proposed, so
the rendering stood and the question was carried forward. It was carried
forward a second time when Book 2 reused the formula at B02-P011, where
`continuity.md` and `GLOSSARY.md` both flagged it as *deferred, not answered*.
Book 2's reviewer was asked to rule rather than defer again, and did:

> Butler's `all the marriage gifts that so dear a daughter may expect` is a
> claim about custom and expectation; `a beloved daughter deserves` is a claim
> about desert, and it is the only place in either Book where a moral
> judgement is added to a suitor's mouth (at B02-P011 the speaker is
> **Eurymachus**, mid-threat, which makes the added generosity of sentiment
> stranger still). … There is one [better wording], it is Butler's, and it
> contains no archaism: **`may expect`**.

The fix keeps the drafter's genuine improvement — Butler's `so dear a
daughter` is stiff, and `a beloved daughter` reads cleanly — and restores
Butler's verb. Nothing else in the sentence moves.

## Why a v3 rather than an edit

`candidate-v2.json` is the accepted text and `ACCEPTANCE.md` is the record of
its acceptance. Editing either in place would make an acceptance record cite
text that no longer exists — the same reason decision **D10** freezes a
superseded candidate and its review packets. So this follows the Meditations
package's practice for a correction to an already-accepted book: **the
accepted file and its acceptance record stay exactly as they are, and the
correction is a recorded successor** with its own hash, its own change list
(this file), and pointers from `README.md`, `provenance.json` and
`manifest.json`.

Consequences, all of them recorded rather than silent:

- `candidate-v2.json`, `candidate-v2-readable.md`, `ACCEPTANCE.md`,
  `changes-v1-to-v2.md`, `candidate-v1.json`, `candidate-v1-readable.md`,
  `review/` and `review-packets/` are **byte-unchanged**.
- `README.md` and `provenance.json` gain a v3 section and point to this file;
  `manifest.json` gains `candidate_v3_json_sha256` and moves `accepted_file`
  to `candidate-v3.json`.
- The README's mechanical-check block now runs against v3 as well as v2 and
  asserts the substitution landed in v3 and *not* in v2.
- `../GLOSSARY.md`'s formula row is rewritten from the deferred-and-flagged
  form to the settled one.
- The matching change in Book 2 is `B02-P011` in
  `../book02/candidate-v2.json`; see `../book02/changes-v1-to-v2.md`.

## What did not change, and was asserted not to

The build re-checks, after the substitution, every invariant the v2 build
established: the six name counts (Odysseus 17, Athena 12, Zeus 6, Poseidon 6,
Hermes 3, Cronus 2); no Roman form, no `Rhea`, no `Helios`, no `Cronos`,
no `Euryclea`; `Ops` once with `daughter of Ops, son of Pisenor` intact; the
fixed epithet `son of Cronus, king of kings` exactly twice; three
`Odysseus’s` and no bare `Odysseus’`; `Dulichium, Same, and wooded Zacynthus`;
`heaven` ten times; `Hyperion` once and `Eurycleia` once; no ASCII apostrophe
or double quote and exactly 22 typographic apostrophes; the 30/29 quotation
balance with **D4**'s unclosed quotation at B01-P018 → B01-P019 preserved;
`woolen` and `draughts`; 32 paragraphs, one-to-one, no newlines.

**No second review round is requested for this change.** It substitutes two of
Butler's own words for one, in a sentence a reviewer has read in both Books,
and the reviewer who ruled on it wrote the replacement.
