# Punctuation standard — the Odyssey modern edition

Settled at Book 1's step 6, 2026-09-12, from round-1 records finding **R1**
and optional finding **R5** (`book01/review/findings-v1.md`). Written as its
own file, on the Meditations package's precedent, because it is a rule every
later Book inherits and the ledger is not the place to look up a character.

## 1. Quotation marks and apostrophes — typographic throughout

**Decision: `“ ” ’` — the typographic forms. The ASCII apostrophe `'` and the
ASCII double quote `"` are not used.**

Book 1's `candidate-v1.json` used curly double quotes for speech (30 opening,
29 closing) and the **straight ASCII apostrophe** for every apostrophe — 22
occurrences across 15 paragraphs (`Agamemnon's`, `Ulysses's`,
`Telemachus's`, `father's`, `mother's`, `Phemius's`, `Neptune's`, `son's`,
`Danaans'`). That is internally inconsistent, and in EB Garamond at reading
size the mixture is visible on the page. Neither neighbouring file is
inconsistent in that way: the served `original-en` is typographic throughout
(and has no ASCII apostrophe at all), and the served `modern-en` being
replaced is ASCII throughout, doubles included.

**Typographic wins over ASCII-throughout** because the candidate's own double
quotes are already typographic and would otherwise have to be downgraded in
thirty places to buy consistency, and because the edition sits beside
`original-en` in split-pane view, where a straight apostrophe in one column
against a curly one in the other is exactly the kind of difference a reader
notices without being able to name.

Applied by `scripts/build_book01_v2.py` as a final pass over the whole
candidate, after the text corrections and the name mapping: every `'`
becomes `’`. Book 1 has no contractions, so all 22 are possessives or the
plural possessive `Danaans’`. **This interacts with the name mapping's
possessive rule** (`GLOSSARY.md`, hazard 3): `Ulysses's` → `Odysseus's` →
`Odysseus’s`. The two were decided in the same pass, as the reviewer asked.

Later Books: the same final pass, and the same assertion — no ASCII
apostrophe and no ASCII double quote survives in any candidate.

## 2. Butler's unclosed quotation at a paragraph break — preserved

Ledger decision **D4**, confirmed by the round-1 reviewer and unchanged.
Where one continuous speech is split by a paragraph break, Butler omits the
closing quotation mark at the end of the first paragraph and opens the second
with its own opening mark. Book 1 does this once, at B01-P018 → B01-P019
(Athena's speech). The candidate reproduces it exactly. "Fixing" it would
tell the reader that Athena stopped speaking and started again.

The reviewer adds one operational point: **the convention has to survive into
the app for the same reason it has to survive here** — in a paginated reader,
a paragraph ending without a closing quote reads as a dropped mark rather
than as a convention if the two paragraphs land on different pages. Recorded,
not acted on; it is an app question, outside this package's scope.

## 3. Two Victorian quotation habits that ARE normalized

Recorded at step 6 from optional finding **R5**, which asked only that these
be stated as a class beside D4, so that D4's preservation reads as a decision
rather than an inconsistency. Both were already done in v1, silently; neither
changes a word of the text.

- **Comma-continuation of an interrupted speech.** Butler:
  `“Is that so?” exclaimed Minerva, “then you do indeed want…`. The candidate:
  `cried Athena. “Then you truly do need…` — a full stop and a capital. The
  Victorian convention is misread by modern readers as a sentence fragment.
- **A split vocative.** Butler: `Then Telemachus spoke, “Shameless,” he
  cried, “and insolent suitors,`. The candidate: `Then Telemachus spoke.
  “Shameless, insolent suitors,” he cried,` — regrouped, because the split is
  genuinely awkward in modern English and the speech-tag interruption falls
  between an adjective and the noun it modifies.

These two account for the candidate carrying one open/close quotation pair
fewer than the source (30/29 against 31/30). **The rule: a quotation
convention that a modern reader would misread as an error is normalized and
recorded here; a convention that carries information — D4's continuous
speech — is preserved.**
