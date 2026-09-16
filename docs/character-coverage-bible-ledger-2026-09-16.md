# Character coverage ledger — The Bible (2026-09-16, first pass)

Scope: `books/characters/build_bible_zedekiah.py` →
`app/public/data/characters/bible.v1.json`, both `kjv-en` and `web-en`
compiled independently.

## Why this pass is scoped, not exhaustive

The Bible package is 1,189 chapters (both editions) and already has 149
cards from prior work — the largest and most name-dense book in the
library by a wide margin. A full read-every-paragraph audit of the kind
done for The Republic is not achievable in one session without a real risk
of rushed, low-confidence homonym calls on figures like the many minor
Josephs, Marys, Zechariahs/Zedekiahs, and genealogical hapax names. This
pass targets the specific homonym check the assignment calls out by name
("different Johns, Marys, Josephs and Zedekiahs") plus verification of how
the existing package already handles that class of problem, rather than
attempting full-library completion in one step.

## Method note: how disambiguation actually works in this package

There is no `books/characters/entities/bible.py` — the Bible package
predates/bypasses the generic `build_generic.py` alias-regex compiler,
which cannot support same-name disambiguation (giving two different
entities the identical bare-word alias makes every occurrence an exact-span
claim by both, which the generic tool treats as a hard ambiguity error).
Instead, existing entries like `john-the-baptist` vs `john-apostle` are
disambiguated by restricting each entity's bare-name match to an explicit
set of global chapter numbers (confirmed by inspection: John the Baptist's
14 mentions all fall in Matthew 3–John 10; the apostle's 14 all fall in
Acts 1–Revelation 22). `build_bible_zedekiah.py` (new, this pass) follows
that same convention, adding paragraph-level exceptions for the two cases
where two different Zedekiahs are named within the same chapter.

## Homonym check requested by the assignment

Checked all released cards whose display name contains "John," "Mary,"
"Joseph," or "Zedekiah":

| Existing id | Name | Disambiguation |
| --- | --- | --- |
| joseph-patriarch | Joseph | Genesis — Jacob's son |
| joseph-husband-of-mary | Joseph | Gospels — husband of Mary |
| joseph-of-arimathea | Joseph of Arimathea | Gospels — distinct epithet in the name itself |
| mary-mother-of-jesus | Mary | Gospels |
| mary-magdalene | Mary Magdalene | Distinct epithet in the name |
| mary-of-bethany | Mary of Bethany | Distinct epithet in the name |
| john-the-baptist | John the Baptist | Chapter-range restricted (see above) |
| john-apostle | John | Chapter-range restricted (see above) |
| *(none)* | Zedekiah | **Zero existing cards — full gap, see below** |

Conclusion: John/Mary/Joseph were already correctly split into distinct,
non-merged identities before this pass. **Zedekiah had no card at all**,
which is itself a disambiguation failure by omission — a reader tapping
any of the ~150+ Bible instances of "Zedekiah" got nothing, including for
the king of Judah, a major recurring figure across 2 Kings, 2 Chronicles,
and most of Jeremiah 21–52.

## Added this pass (3 of 4 identified Zedekiahs)

| id | role | scope | mentions (kjv-en / web-en) |
| --- | --- | --- | --- |
| `zedekiah-king-of-judah` | major | 2 Kings 24–25, 2 Chronicles 36, 1 Chronicles 3, Jeremiah 1/21/24/27/28/29(excl. one paragraph)/32/34/36(excl. one paragraph)/37/38/39/44/49/51/52 | 56 / 56 |
| `zedekiah-son-of-chenaanah` | reference | 1 Kings 22, 2 Chronicles 18 (false prophet who strikes Micaiah) | 4 / 4 |
| `zedekiah-son-of-maaseiah` | reference | Jeremiah 29 (one paragraph only — false prophet denounced in Jeremiah's letter to the exiles) | 2 / 2 |

Round-trip validated against both live edition files (0 offset errors).
Checked for span overlap against all pre-existing mentions in both
editions (0 collisions).

## Deferred, explicitly not silently dropped

- **`zedekiah-son-of-hananiah`** (Jeremiah 36:12, "Zedekiah the son of
  Hananiah, and all the princes") — a single-mention listed name with no
  independent action or description beyond being present. Genuinely
  thin: a card would say almost nothing. Left unauthored rather than
  padded; flagged here as an explicit, reviewed exclusion (not an
  oversight) rather than merged into either of the other three.
- **1 Chronicles 3:16** ("the sons of Jehoiakim: Jeconiah his son,
  Zedekiah his son") is a genealogical listing that differs from the
  2 Kings 24 account (where Zedekiah is Josiah's son, not Jehoiakim's/
  Jeconiah's). This is a known textual/genealogical difficulty in Kings vs.
  Chronicles scholarship, not something to resolve by editorial guess. This
  pass folded both 1 Chronicles 3 mentions into `zedekiah-king-of-judah`
  on the assumption that this is the same widely-identified historical
  king referenced twice under two accounts of his parentage — **flagged as
  an assumption, not a certainty**, for anyone doing a closer theological
  review.

## Validation performed / limits

- UTF-16 span round-trip: pass, both editions, 0 errors.
- Span-overlap-with-existing-mentions check: pass, 0 collisions.
- `python3 -m unittest discover -s books/characters -p 'test_*.py'`: 135
  pass (the-awakening pilot contract suite; no Bible-specific test exists
  in this repo to run).
- **Not run**: any playwright/browser-based check (`playwright` is not
  installed in this sandbox and no dev server is running here). In-reader
  tap behavior for the new Zedekiah cards is unverified.
- **Not done in this pass**: full-Bible name-frequency audit comparable to
  the Republic pass. The Bible's scale (roughly 30,000+ named-figure
  mentions across 66 books) means "every character mentioned" cannot be
  responsibly certified from one session. Recommend continuing with a
  book-by-book or testament-by-testament pass rather than a single
  full-corpus sweep, prioritizing recurring figures over genealogical
  hapax names per the assignment's own guidance.

## Release status

**Not yet live.** Written to `app/public/data/characters/bible.v1.json` on
branch `claude/great-clarke-mugpy4`, for Codex integration/app-verification
(including the browser checks this sandbox cannot run) and publication.
Does not claim Bible coverage is complete or "100% covered" — see limits
above.
