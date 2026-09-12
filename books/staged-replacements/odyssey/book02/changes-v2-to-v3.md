# The Odyssey, Book 2 — changes from `candidate-v2.json` to `candidate-v3.json`

**One hyphen, in one paragraph.** Book 2 was accepted at v2 on 2026-09-12
(`ACCEPTANCE.md`). It is reopened here on a check raised by a *later* Book's
review round, on the same rule Book 1's v3 was written under: a compound that
the edition prints one way in one accepted Book must not print the other way
in another.

| | |
|---|---|
| Predecessor | `candidate-v2.json`, sha256 `71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126` — **accepted, and untouched on disk** |
| Successor | `candidate-v3.json`, sha256 `dcf1e301d63f2ef462565a66950bcfa51794662080a460c6b9f46846f24088ac` |
| Readable copy | `candidate-v3-readable.md` |
| Built by | `../scripts/build_book02_v3.py` (asserts v2's accepted hash before touching it; re-asserts the `GLOSSARY.md` hazards and the `PUNCTUATION.md` standards afterwards) |
| Finding answered | **27.1**, `../book03/review/findings-v1.md` (Book 3, round 1) — generalized |
| Paragraphs differing v2 → v3 | **1** — `B02-P034` |
| Word count | unchanged (the change closes a space, it does not add or remove a word) |

## The change

**B02-P034 — finding 27.1 (minor, Book 3 round 1), applied by the generalized
check rather than by the finding's own text.**

| | |
|---|---|
| Butler | `mixing bowls` (open here; hyphenated at PG's Book 1 twice and at Book 3) |
| v2 | `mixing bowls` |
| **v3** | `mixing-bowls` |

Finding 27.1 named a two-member drift: accepted Book 1 prints `mixing-bowls`
twice, Book 3's v1 printed `mixing bowls`. Butler himself is inconsistent
(hyphenated at B01-P008, B01-P012 and B03-P027; open at B02-P034), and under
**D7** the edition is not. Applying the finding as written would have fixed
Book 3 and left the split standing between two *accepted* Books, so
`../scripts/build_book3_v2.py` implements the finding's **shape** instead — a
generalized cross-Book typographic-drift check over every compound that any
accepted Book hyphenates — and that check found the **third** member the
finding did not name: Book 2.

Settled the way Book 1's finding 11.1 was: a **recorded successor**, with
Book 2's accepted `candidate-v2.json` and its `ACCEPTANCE.md` left
byte-unchanged. `ACCEPTANCE.md` continues to record the accepted file; this
file and `candidate-v3.json` record what a later round learned.

## What the successor does not change

Nothing else. `build_book02_v3.py` asserts the accepted v2 hash before it
reads, makes exactly one substitution, and then re-asserts the Book's name
census, the Roman-form absences, the possessive standard, the quotation-mark
balance and the archaism list. The drift check is re-run over Books 1, 2 and 3
after the write and must come back empty.

## Reproduction

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book02_v3.py
python3 scripts/build_book3_v2.py      # ends: cross-Book hyphen drift none over Books 1-3
```
