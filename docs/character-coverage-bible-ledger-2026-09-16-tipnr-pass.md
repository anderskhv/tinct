# Character coverage ledger — The Bible (2026-09-16, TIPNR-driven whole-canon pass)

This supersedes the "scoped, not exhaustive" framing of the earlier same-day
ledger (`character-coverage-bible-ledger-2026-09-16.md`). That pass targeted
Zedekiah only and explicitly deferred a full 66-book audit as out of scope.
This pass builds and runs the tooling to do the full-canon audit the
assignment requires, using STEPBible TIPNR as the canonical identity
inventory. Numbers below are the actual before/after state of
`app/public/data/characters/bible.v1.json`.

## Result

| | before this pass | after |
| --- | --- | --- |
| kjv-en cards | 152 | **3,014** |
| web-en cards | 152 | **2,998** |
| kjv-en mentions | 1,506 | **21,016** |
| web-en mentions | 1,499 | **21,229** |

All figures below are from scripts in `books/characters/bible_tipnr/`,
re-run against the final file as a validation gate, not just at generation
time.

## Source: STEPBible TIPNR, verified

- **What it is:** "Translators Individualised Proper Names with all
  References" — every proper noun in the Bible, in Hebrew/Greek, tagged to
  a unique person or place, with all cross-references. Created by Tyndale
  House Cambridge, curated by STEPBible.org.
- **Version/provenance used:** downloaded 2026-09-16 from
  `github.com/STEPBible/STEPBible-Data`, `master` branch, file
  `Proper Nouns/TIPNR - Translators Individualised Proper Names with all
  References - STEPBible.org CC BY.txt`. Saved verbatim as
  `books/characters/bible_tipnr/TIPNR-raw.txt` for provenance/reproducibility.
- **License:** CC BY 4.0. **This is a real publication requirement, not
  optional:** every card with id prefix `tipnr-` (2,900+ of them) carries
  TIPNR-derived identity/description content and must be attributed on
  publication. A `sourceNotices` array was added to the package's top-level
  metadata recording the required attribution line; the app currently has
  no reader-facing credits surface for third-party content licenses (checked
  — no `THIRD-PARTY-NOTICES`-equivalent exists). **Codex must add a visible
  attribution** (settings/about page, or wherever the app already credits
  translation sources) before this content goes live — flagging this
  explicitly rather than letting it be missed.
- **Scope/limitations:** TIPNR targets the ESV text with KJV/NIV variant
  spellings noted per name-form; it is not built against this app's
  specific WEB (World English Bible) edition text. In practice WEB tracks
  ESV/NIV spelling closely enough that the resolver (below) achieved a
  96.5%+ automatic match rate against the live WEB text; residual misses
  are logged, not guessed at (see "Unresolved" below). One specific case
  (Jeremiah 27:1) is a genuine KJV/WEB textual variant that TIPNR's ESV/NIV
  vs. KJV tagging doesn't anticipate — WEB, unlike ESV/NIV, does not emend
  the verse to "Zedekiah," so no mention is bound there in either edition.
  This is documented as a known limit, not silently forced.

## Method (reusable infrastructure, not a one-off)

All in `books/characters/bible_tipnr/`:

1. `parse_tipnr.py` — parses the raw TIPNR text into 3,130 structured PERSON
   records (name forms, Strong codes, verse references, `@Briefest`/`@Brief`/
   `@Short`/`@Article` summaries). PLACE/OTHER records excluded (out of
   scope — this assignment is character-only).
2. `book_map.py` + `resolve.py` — maps TIPNR's book abbreviations to this
   app's chapter titles, and locates any verse's exact text span within a
   paragraph using the KJV-style superscript-digit verse markers already
   embedded in the edition JSON (`¹`, `²`, `³`…). This means every
   reference resolves to a real, checkable `(chapterNumber, paragraphIndex,
   startOffset, endOffset)` span in the actual served edition bytes — not
   an approximate or hand-eyeballed location.
3. `generate.py` — for every TIPNR person, resolves every named-form
   reference **independently in both `kjv-en` and `web-en`**, skips spans
   already correctly bound by an existing card, and logs (never silently
   drops) anything that fails to resolve.
4. `release.py` — turns confirmed gaps into new cards: id = `tipnr-<Strong
   code>` (stable, independent of display name, never collides with a
   hand-authored id), subtitle = TIPNR `@Briefest`, body = TIPNR `@Briefest`
   for reference-tier figures (the vast majority) or `@Brief` for
   supporting/major/central tiers (mention-count-based, see below) —
   matching the assignment's "minor figures need only a concise
   identification" instruction directly, at scale, without inventing prose.
5. `audit_homonyms.py` — the critical check. Cross-references every TIPNR
   *homonym family* (2+ distinct catalogued individuals sharing an English
   display name — **484 such families exist in the Bible**) against the 46
   of those families that also had a pre-existing hand-authored card, to
   find cases where the old card's mentions belonged, at least in part, to
   a *different* person of the same name.
6. `fix_homonym_conflations.py` — rebuilds a legacy card's mentions from
   TIPNR ground truth (discarding the old, sometimes-wrong span list) and
   splits every wrongly-absorbed occurrence into its own correctly-scoped
   card.

Round-trip validation (every mention's `[startOffset,endOffset)` slice of
the live, normalized paragraph text equals its recorded `text`) was re-run
after every batch, both editions, independently — **0 errors** in the
final file. Duplicate-span and duplicate-id checks were also re-run to
**0** after fixing bugs found along the way (see "Bugs found and fixed in
my own pipeline" below).

## The homonym audit: what it found

484 TIPNR homonym families exist; **46 of them are also names this app had
already hand-authored a card for.** Those 46 are exactly the highest-risk
set (an existing card creates an illusion of "already handled" while
potentially binding occurrences that belong to a different person of the
same name) — and this is exactly what the assignment asked to be
rechecked. Of the 46:

**27 were found to be genuinely conflating two or more distinct people**
under one card (confirmed by reading each flagged verse in context, not
just trusting TIPNR's split):

| legacy card | wrongly included | confirmed by reading the verse |
| --- | --- | --- |
| `herod-the-great` / `herod-antipas` | mixed up across ~50% of both cards' mentions | Matt 2:1 "Herod the king" (massacre of the innocents) was bound to **both** the-great and antipas |
| `james-zebedee` / `james-the-just` | mixed, plus both missing "James son of Alphaeus" entirely | Acts 1:13 lists "James the son of Alphaeus" separately from "James the brother of John" in the same verse — both existing cards claimed it |
| `mary-mother-of-jesus` / `mary-of-bethany` | mixed, plus two more Marys (wife of Cleopas; mother of John Mark) absorbed into "mother of Jesus" | Luke 10:39 "a sister called Mary" (explicitly Martha's sister) was bound to `mary-mother-of-jesus` |
| `john-the-baptist` / `john-apostle` | mixed, plus a third John (a member of the high priest's family, Acts 4:6) missing entirely | — |
| `joseph-husband-of-mary` / `joseph-of-arimathea` | mixed | — |
| `noah` | absorbed 1 mention of **a different, female Noah** (one of Zelophehad's daughters, Num 26:33) | — |
| `jeremiah` | absorbed 2 mentions of **Jeremiah of Libnah** (Hamutal's father, 2 Ki 23:31) — a minor, unrelated man, not the prophet | — |
| `jeroboam` | absorbed 2 mentions of **Jeroboam II**, a real second king of Israel with the same name | — |
| `manasseh-king` | absorbed 4 mentions of **Manasseh son of Joseph**, the tribal patriarch — a completely different, much earlier figure | — |
| `nathan-prophet` | absorbed 2 mentions of **Nathan, David's own son** (2 Sam 5:14) | — |
| `pharaoh-exodus` | absorbed 4 mentions of **a different Pharaoh** (the one reigning at Moses's birth, who died before the Exodus events per Exod 2:23) | — |
| `ananias-of-damascus` | absorbed mentions of **Ananias husband of Sapphira** and **Ananias the high priest at Paul's trial** — two much more prominent, unrelated Ananiases | — |
| `gamaliel` | absorbed 8 mentions of an unrelated **Old Testament tribal leader** named Gamaliel (Numbers) | — |
| `nehemiah` | absorbed 6 mentions across two other Nehemiahs (one in an earlier Ezra 2 returnee list, one "son of Azbuk" who repaired a different wall section) | — |
| plus: `ezra`, `jehoshaphat`, `jehu`, `elijah`, `naaman`, `philip-apostle`, `zedekiah-king-of-judah` (see below) | each absorbed 1-2 mentions of an unrelated same-named minor figure | — |

**19 of the 46 were already correctly disambiguated** (e.g., the existing
Joseph-patriarch/Joseph-husband-of-Mary split, the Mary Magdalene split,
several others) — confirming the earlier same-day ledger's read that
*some* of this had already been done right; it was not evenly distributed.

**Zedekiah specifically, since the assignment asked to reconcile a 4-vs-6
count:** TIPNR lists exactly **6** distinct Zedekiahs (search: `grep -c
'^Zedekiah' TIPNR-raw.txt`, verified by direct inspection of all 6
records):
1. King of Judah (`H6667H`) — already had a card from the earlier pass.
2. Son of Chenaanah, false prophet (`H6667G`) — already had a card.
3. Son of Maaseiah, false prophet (`H6667K`) — already had a card.
4. Son of Hananiah (`H6667L`) — the earlier pass explicitly *deferred* this
   one as "too thin to card." This pass reverses that call now that TIPNR
   supplies a real (if brief) description, and also fixes a real bug: the
   earlier pass's custom chapter-range script accidentally included this
   person's one verse (Jer 36:12) inside the *king's* mention range. Now
   split out correctly.
5. Son of Jehoiachin/Jeconiah (`H6667I`, 1 Chr 3:16) — the earlier pass
   flagged this exact verse as a known Kings-vs-Chronicles genealogical
   ambiguity and made an explicit, documented assumption to fold it into
   the king's identity. TIPNR treats it as a separate catalogued record
   with a `(?)` ambiguity marker and a linked ambiguity-decision document.
   **This pass keeps the earlier assumption** (folds it into the king)
   rather than silently overriding a stated editorial decision with a
   different judgment call — but now explicitly documents that TIPNR
   itself flags this as uncertain, so a future reviewer knows exactly
   where the soft spot is.
6. A priest who sealed Nehemiah's covenant (Neh 10:1) — **entirely missed
   by the earlier pass**, because KJV spells this one "**Zidkijah**," a
   spelling variant that a literal "Zedekiah" text search never finds. Now
   added, using the KJV spelling and the WEB "Zedekiah" spelling as
   separate aliases per edition (the exact same technique already used for
   the two Johns).

So: the earlier pass's "4" was actually 3 real cards + 1 deliberately
deferred, and TIPNR's "6" is confirmed correct against the live text. Both
counts are now reconciled into one 6-person inventory, matching the source.

## Bugs found and fixed in my own pipeline along the way

Documented for transparency, since a validation pass that hides its own
false starts isn't a real validation pass:

- **Case-folding id collision:** an early version lowercased Strong codes
  for card ids. TIPNR itself runs out of uppercase disambiguation letters
  for very common names and starts reusing lowercase (Zechariah alone has
  29 distinct people, coded up through `H2148Z` then continuing at
  `H2148y`, `H2148z`) — lowercasing silently merged two of those distinct
  Zechariahs into one id. Fixed by keeping Strong codes case-exact in ids.
- **Comma-separated alternate-spelling bug:** TIPNR sometimes lists
  untagged alternate spellings as `"Israel,Israelite"` in one field. An
  early matcher treated that whole string as one literal search target
  (which never matches anything), producing ~5,700 false "unresolved"
  entries out of an initial ~9,300. Fixed by splitting on comma and trying
  each candidate.
- **Same-verse multiple-occurrence bug:** when a verse names two different
  same-named people at different positions (TIPNR's own `2Ch.23.1a` /
  `...1b` convention), an early version always bound to the *first*
  occurrence for both, causing ~60 genuine cross-record span conflicts.
  Fixed by using the letter suffix as an occurrence index.
- **A key/value inversion bug in the post-hoc deduplication script** caused
  it to silently do almost nothing on its first two runs (it iterated
  `for strong, legacy_id in mapping.items()` against a dict that was
  actually `{legacy_id: strong}`). This left ~774 duplicate-span
  entries (a card id and a `tipnr-*` id both claiming the identical word)
  undetected by the "it printed 0/1 removed" success message. Caught only
  by an independent full-file duplicate-span re-scan after the "fix,"
  which is why that re-scan is now a standing step in this pipeline, not
  a one-off.
- **"Already covered" blind spot:** the bulk gap-filler's definition of
  "already covered" was "some mention already claims this span" — which is
  true even when that mention belongs to the *wrong* person. This is
  exactly why the homonym audit (a separate, identity-aware pass) was
  necessary in addition to the bulk gap-fill; the two together are what
  closed the loop. Left as a known characteristic of the two-pass design,
  not something to "fix away" — it's the reason a second, targeted pass
  exists at all.

## Split-off / newly added identities from the homonym fixes

`tipnr-H0452I` (Elijah, OT genealogical), `tipnr-G3137L` (Mary, mother of
John Mark), `tipnr-G3137K` (Mary, wife of Cleopas — added via the bulk
pass once her spans were freed), `tipnr-H5166G` / `tipnr-H5166I` (two more
Nehemiahs), `tipnr-G5376I` (Philip the tetrarch, Herod's son — distinct
from Philip the apostle), `tipnr-H6667G` / `tipnr-H6667K` / `tipnr-H6667L`
(the other three Zedekiahs — these already existed from the earlier pass
and are now correctly deduplicated against, not recreated), `tipnr-G2264I`
(Herod Agrippa I — entirely new, the third Herod), `tipnr-G2385H` (James
son of Alphaeus — entirely new, the third James), `tipnr-G2491I` (John of
the high priest's family — entirely new, added in kjv-en; no independent
WEB-text match found for this single mention, logged not forced),
`tipnr-G0367I` / `tipnr-G0367G` (Ananias the high priest; Ananias husband
of Sapphira), `tipnr-H1583` (Gamaliel, OT tribal leader), and more — full
list is mechanically derivable from any `tipnr-*` id in the released file
plus its `editorialBasis` field, which states its TIPNR provenance
explicitly on every generated card.

## What was NOT done / explicit limits

- **868 TIPNR references remain unresolved** (logged in
  `books/characters/bible_tipnr/gap_report.json`, not silently dropped):
  mostly hyphenated/compound names with a capitalization or hyphenation
  mismatch between TIPNR's expected spelling and this app's actual edition
  text (`Ben-hadad` vs `Ben-Hadad`, `Cesar` vs `Caesar`, `Non` vs `Nun`,
  etc.), a small number of genuine textual variants like the Jer 27:1 case
  above, and a residual of names TIPNR records that simply do not appear
  in this app's specific edition text as spelled. **These are real,
  visible gaps, not resolved, not guessed at.**
- **No individual spoiler review of ~2,900 mechanically generated cards.**
  Body text is TIPNR's own `@Briefest`/`@Brief` (CC BY licensed, written by
  Tyndale House Cambridge scholars for exactly this purpose — general
  identity, not narrative reveal), assigned to reference/supporting tier
  by mention count, which keeps content conservative by construction for
  the vast majority (most TIPNR figures are 1-4-mention genealogical
  entries whose `@Briefest` is just a relation, e.g. "Son of Chenaanah").
  It was **not** individually re-read by a human or a second model pass
  for subtler spoiler leaks the way the Republic pass's cards were.
  Sampling (30+ entries read directly, spread across tiers and testaments)
  found no narrative spoilers, but this is a sample, not a census.
- **No in-reader/browser verification.** `playwright` is not installed in
  this sandbox and no dev server is running here — the entire click-target
  behavior described by this ledger is validated at the data layer
  (schema, offsets, source-hash round-trip) only. This is the same limit
  stated in every prior ledger this session; repeating it because the
  assignment explicitly requires "actual reader clicks" verification,
  which only Codex, with real app access, can perform.
- **The other 438 homonym families** (2+ distinct TIPNR people sharing a
  name) that do *not* overlap with a pre-existing hand-authored card were
  not individually re-verified beyond the mechanical pipeline's own
  per-record verse-scoped binding — i.e., they were never at risk of the
  "wrong sibling" bug this ledger found and fixed (each got its own
  Strong-code-scoped card from the start), but their *content* (the TIPNR
  `@Briefest`/`@Brief` text itself) was not independently fact-checked
  against the Bible text beyond confirming the bound word is correct.
- **Attribution is not yet live** — see "Source" above. This is a concrete,
  named blocker for Codex before publication, not a vague caveat.

## Validation performed (re-run against the final file, not just at
## generation time)

- UTF-16 span round-trip against live edition bytes: **0 errors**, both
  editions.
- Duplicate character ids: **0**, both editions.
- Duplicate mention spans (any two characters, or the same character
  twice, claiming the identical word): **0**, both editions (774 found and
  fixed along the way — see "Bugs found" above).
- Orphaned characters (a card with zero bound mentions, i.e. unreachable
  by any tap): **0**, both editions.
- Homonym-family re-audit after all fixes: **0** unexplained conflations
  remaining (2 intentional, documented merges: the 1 Chr 3:16 Zedekiah
  case above, and a Hebrew/Greek genealogy-boundary Zerubbabel record pair
  that TIPNR splits but this app treats as the same historical person).
- `python3 -m json.tool` validity: pass.
- `python3 -m unittest discover -s books/characters`: not re-run for this
  specific pass (it exercises only the-awakening pilot contract tests, as
  noted in the earlier ledger; no Bible-specific automated test exists in
  this repo).

## Release status

**Not yet live.** Written to `app/public/data/characters/bible.v1.json` on
branch `claude/great-clarke-mugpy4`. Requires, before publication: Codex's
own app-level verification (including the browser-based checks this
sandbox cannot run), a decision on where the TIPNR attribution notice
displays to readers, and ideally a second independent reviewer's pass over
a sample of the ~2,900 mechanically generated cards given the honest limit
stated above. This ledger does not claim the Bible is now "100% covered" —
it claims a specific, large, validated expansion with a specific,
named list of what remains unresolved or unreviewed.
