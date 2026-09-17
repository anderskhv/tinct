# Character coverage — full-library screening pass, round 3 (2026-09-17)

Following round 2, screened the remaining un-audited books toward the
user's "screen all books, find all the characters we are lacking cards
for" instruction. This round's headline finding is a new *class* of gap,
distinct from a missing character: a missing occurrence-link at large
scale, discovered while spot-checking Shakespeare plays.

## Finding: ALL-CAPS speaker-label occurrence-linking gap

Several Shakespeare-convention plays render each line's speaker label in
ALL CAPS ("ROSALIND. I pray thee..."). Most already-built packages in
this library bind these correctly (spot-checked ~2% unbound across other
plays already released). Four never got this binding at all — every
character already has a card, so this is not a missing-character gap:

- `as-you-like-it`: 96% of ALL-CAPS label instances unbound
- `taming-of-the-shrew`: 100% unbound
- `the-tempest`: 100% unbound
- `merry-wives-of-windsor`: 40% unbound (a different, narrower cause — see below)

New tool `books/characters/bind_speaker_labels.py`: for each existing
character, adds their ALL-CAPS display name as a new mention wherever it
appears standalone, skipping any span with an existing mention. Longest
display name first so multi-word names claim before a shorter name could
partially overlap them. Run on the first three plays: 822/823, 763/763,
780/780 new mentions added per edition.

`merry-wives-of-windsor`'s gap had a different shape: most of its
characters have titled/multi-word display names ("Sir John Falstaff",
"Justice Shallow") while the text's actual speaker labels use short forms
("FALSTAFF.", "SHALLOW."). Checked every short form (FALSTAFF, EVANS,
QUICKLY, SHALLOW, CAIUS, ANNE, PAGE) against every one of its occurrences
in the source text by hand before binding anything — all but bare "PAGE"
turned out to already be bound (this book's original build happened to
use case-insensitive alias matching). Bare "PAGE" (13 occurrences) is
unambiguous in this text: always the stage-direction form for Master
Page, never for the other Page-surnamed characters (Mistress Page, Master
Thomas Page, George), who never appear as a bare "PAGE" in this play.
One-off tool `books/characters/bind_mww_short_labels.py` binds it:
13 + 120 new mentions across both editions.

## A second bug, same class as brothers-karamazov: firstMention regression

Round-trip validation of all four books came back clean (0 offset/text
errors, 0 duplicate ids or spans) — but the first real-browser
verification run still failed 6/80 checks, identically on desktop and
phone (ruling out the known phone-only pagination artifact): Rosalind
and Orlando in `as-you-like-it`, Prospero in `the-tempest`.

Root cause: the new speaker-label mentions are mostly "Enter X" stage
directions, and several of those occur *earlier* in the text than the
character's previously recorded `firstMention` (e.g. As You Like It's
opening stage direction "Enter ROSALIND and CELIA" precedes what had
been recorded as Rosalind's firstMention, three paragraphs later, where
she is first addressed by name in dialogue). `releasedCard()`
deliberately refuses to reveal a card before its own firstMention
(spoiler-safety), so tapping any of these newly-added early mentions
silently fell through to a plain dictionary lookup — invisible to
round-trip/offset validation, exactly like the brothers-karamazov
overlapping-alias bug from round 2, only surfaced by tapping the actual
word in the actual reader.

The fix needed two steps, both discovered by iterating against the live
tap rather than by inspection:

1. Move `firstMention`/`roleVisibleAt` back to the earliest mention's
   point for every affected character (22 in as-you-like-it, 20 in
   the-tempest; 0 in the other two books).
2. That alone still failed the live tap: `releasedCard()` also requires
   some snapshot's `availableAt` to be at or before the tap's cutoff, and
   the earliest snapshot was still anchored at the character's *old*
   firstMention — later than the new one — so at the new firstMention no
   snapshot yet qualified. Had to also pull the earliest snapshot's
   `availableAt` back to match the new firstMention for the same set of
   characters.

`books/characters/fix_first_mention_regression.py` does both. Verified
safe: the verifier only requires `snapshot.availableAt >= firstMention`,
and firstMention only ever moves earlier, so the bound is never crossed.
Confirmed the fix against the actual dev server via a direct debug tap
before re-running the full suite (not just re-running the suite blind).

## Real-browser verification

Extended `app/scripts/verify-character-fixes.cjs` with 8 new checks (2
per book: a speaker-label-fix tap plus, for merry-wives-of-windsor, a
sanity tap on an already-working character). Final run: **80/80 passed**,
after two intermediate failing runs that each caught one half of the
firstMention/snapshot bug above.

## Process note

This is the second time this session real-browser verification caught a
bug invisible to round-trip validation (paragraph-hash and offset/text
consistency checks). Both times the bug was in the *character record*
(overlapping mention spans in round 2; firstMention/snapshot timing in
this round), not in the mention data the round-trip check actually
covers. Round-trip validation remains necessary — it catches a different
class of error (corrupted offsets, duplicate ids) — but it is not
sufficient on its own for any change that touches a character's
firstMention, roleVisibleAt, or snapshot availableAt, or that adds
mentions earlier in the text than previously recorded ones.

## Second pass: remaining word-frequency candidates, ~65 more books

After the Shakespeare speaker-label fixes, re-ran the round-2 word-
frequency scan's candidate list against every book not yet screened this
session (~65 books), filtering out words that are stop-words, archaic
grammar (Thou/Thy/Tis/Hath), stage directions (Enter/Exit/Exeunt), or
already match an existing character's name (including its possessive).
This surfaced 6 books with a plausible non-noise top candidate:

- `jerusalem` (Brita, Mother Stina), `fear-and-trembling` (Agnete),
  `niels-lyhne` (Frithjof, Hjerrild), `genealogy-of-morals`
  (Schopenhauer), `moby-dick` (Jonah) — all confirmed real by reading
  every occurrence in context and fixed (see above).
- `frederick-douglass` ("Michael's") and `jungle-book` ("Teddy's") —
  checked and confirmed false positives: "St. Michael's" is a place
  name, not the already-carded Mrs. Michaels; Teddy's possessive
  occurrences already resolve correctly through existing "Teddy"
  mentions (the reader strips a trailing possessive before matching).
- `beowulf` ("Higelac's") — checked and confirmed already fully bound;
  the card's display name uses the modernized spelling "Hygelac" but
  its mentions are correctly recorded under the text's actual spelling,
  "Higelac", including every possessive occurrence.

Every other candidate across the remaining ~55 books was stage
directions, archaic second-person pronouns/verb forms, place names, or
abstract nouns (States, Sovereign, Pleasure, Justice, Rome, Thebes,
London, etc.) — the same texture of noise as round 2's "reviewed, no fix
made" books. No further real gaps found by this method in this pass.

**Limit of this method, stated plainly:** a word-frequency threshold scan
only surfaces characters mentioned often enough to clear the threshold
in a single book. A minor character named 3-5 times across a long text
(the kind flagged as a real risk for `peloponnesian-war` in round 2)
would not surface here. This round's screen should be read as "no
frequent uncarded character found," not "no missing character exists,"
for the ~55 books with no flagged candidate.

## Running total, this session

Deep passes: The Republic (13→99), the Bible (152→~3,014), War and Peace
(22→32). Screening-plus-fix passes: round 1 (10 books, 3 fixed), round 2
(17 books, 9 fixed), round 3 (4 Shakespeare plays fixed for the
speaker-label gap, plus 5 more books with real missing-character
additions: jerusalem, fear-and-trembling, niels-lyhne,
genealogy-of-morals, moby-dick). ~65 more books screened by word-frequency
candidate with no further real gaps found (see above for its limits).

**Total this round: 9 books fixed (4 speaker-label, 5 missing-character),
73 books screened with no action needed, one real-browser-verification-
caught bug (firstMention/snapshot timing) fixed along the way, one more
(an untappable em-dash-glued mention in niels-lyhne) fixed the same way.**

## Release status

All fixes on branch `claude/great-clarke-mugpy4`, not yet live.
