# Shared instructions for audit batch agents — 2026-09-11

You are doing editorial + rights research for a subset of books in Tinct's
modern-English translation audit. Read this whole file before starting. Your
orchestrator will give you a specific list of book IDs — do only those books.

**This is REVIEW work. Do not modify any file under `app/public/data/editions/`,
`app/src/`, or anywhere else in the app. Do not generate or edit translations.
Do not run any script that calls `api.anthropic.com` or `generate-editions.cjs`.
Do not run `npm run build`/`deploy`/`wrangler`. Your only writes are the audit
output files described below, under
`docs/modern-english-translation-audit-2026-09-11/`.**

## Where things are

- Edition JSON: `app/public/data/editions/{book-id}-{edition-key}.json`.
  Structure: `{"chapters": [{"number": N, "title": "...", "paragraphs": [...]}],
  "sections": [...]}`. Paragraph `i` of chapter `c` in one edition corresponds
  to paragraph `i` of chapter `c` in an aligned edition — that's how you find
  the matching passage across editions.
- Mechanical screening data (already computed, Phase 1):
  `docs/modern-english-translation-audit-2026-09-11/mechanical/{book-id}.json`
  — chapter/paragraph/word counts, sha256 snapshot hash, per-chapter
  similarity, truncation/identical-paragraph/empty-paragraph flags, alignment
  status. Read this first for each book — it tells you where the mechanical
  outliers are (use one as your Phase 2 "mechanical outlier or difficult
  passage" sample) and gives you the snapshot hash to cite.
- Registry metadata (translator names, edition labels, years):
  `app/src/data/bookRegistry.ts` — search for `export const <NAME>: Book = {`
  with the matching `id: '<book-id>'`.
- Danish severity data (if useful context, not your primary job):
  `books/scan-report.md`.
- Prior historical audit findings (treat as historical evidence, not a
  current verdict — recheck the actual files):
  `books/MODERN-EN-REPAIR-STATUS.md`, `books/scan-report.md`.

## Our reading standard

Clear, natural English for a thoughtful modern adult, preserving the work's
complete meaning and literary character.

- Every source claim, image, example, qualification, scene, joke, and
  meaningful repetition must survive. One source sentence may become several
  modern sentences — sentence counts need not match.
- Simplify old vocabulary and tangled syntax without simplifying away the
  ideas. Preserve ambiguity, contradictions, humor, emotional movement, and
  distinctive voice.
- Explain essential unfamiliar terms briefly at the point of need; prefer a
  familiar accurate equivalent when possible.
- Do NOT add interpretations, motives, diagnoses, historical facts, or
  explanatory transitions not in the source.
- Preserve logical distinctions: almost vs. usually, possibility vs.
  certainty, some vs. all, sequence vs. cause.
- Avoid mechanically short sentences and generic explanatory prose.
- Consistent character names where alternate names have no literary
  function; preserve meaningful differences in address, rank, intimacy,
  disguise, cultural setting.
- A separate modern edition is worthwhile only when it removes a substantial
  reader barrier. A readable human edition is preferable to an AI rewrite
  when it meets these criteria. For English originals that are already
  accessible, source + occasional glosses may be the best result.
- Do NOT penalize a translation simply for changing wording. Do NOT treat
  source-derived antithesis or repetition as an "AI tell."

## Phase 2 — editorial sampling (do this for every assigned book)

Inspect **at least 5** distinct source/modern passage pairs per book:
opening, early section, middle, late section/ending, and a mechanical
outlier or especially difficult passage (pick this from the Phase 1 flags —
a truncation hit, a high-identical-paragraph chapter, the flagged short
final chapter, etc.; if a book has no flags, pick the hardest passage you
can find — dense argument, thick allusion, verse-like prose).

Use passages long enough to judge connected prose — normally 250–500 source
words, or a complete shorter unit (e.g. one Bible chapter, one short scene).
**Expand sampling for very long or varied books** — multi-book epics
(Iliad/Odyssey/Aeneid/Paradise Lost/Divine Comedy), sprawling novels (War
and Peace, Brothers Karamazov, Anna Karenina, Don Quixote, Moby-Dick), and
dialogue collections (the Republic, the Plato dialogues as a set) should get
8–12 passages covering each major part/book/canto, including dialogue,
description, argument, and allusion where applicable. For short works
(magna-carta, the-manual, communist-manifesto, crito, medea-length plays,
etc.), inspect the full text when practical.

For each finding, record: chapter/verse/scene location, a short exact
excerpt from BOTH source and modern-en (quote the actual file text, do not
paraphrase what you think it says), and your explanation. Look especially
for:

- Missing substance concealed by fluent prose
- Content shifted into neighboring chapters
- Inventions and altered logical relationships
- Old language left essentially unchanged (a LIGHT/MECHANICAL false "modern"
  edition)
- Images replaced by explanations
- Flattened jokes, ambiguity, or character voice
- Over-explanation and unnecessary glosses
- Inconsistent names or terms

## Phase 3 — human-edition research (do this for every assigned book)

Determine whether a complete, readable, legally reusable human English
edition could serve readers better than the current modern-en.

- For an English original, first assess whether the original itself already
  meets the reading standard (Victorian/Edwardian prose that's still
  perfectly clear counts) before searching for an alternative edition.
- For translated works (non-English originals, or works where the "core"
  English text is itself an old translation, e.g. Jowett's Plato, Garnett's
  Dostoevsky): identify 1–2 promising human translations via WebSearch —
  reputable primary sources, publisher/translator pages, established digital
  libraries (Standard Ebooks, Internet Archive, Project Gutenberg,
  Wikisource), explicit licensing statements. Use WebFetch to actually open
  and read a sample of the candidate text before claiming it's accessible —
  reputation alone is not enough.
- Record: translator, publication date, completeness (complete / abridged /
  selections), exact edition, source URL, and rights evidence.
- Distinguish: public domain, permissive license (e.g. CC-BY, CC0),
  attribution/share-alike requirement, noncommercial restriction, permission
  required, unclear/unresolved status. Free online access does NOT establish
  permission to reuse or redistribute (many "free to read" translations are
  still fully copyrighted). Verify rights for the TRANSLATION itself, not
  just the underlying original work — a public-domain original can still
  have a copyrighted modern translation.
- Consider commercial distribution in Denmark/EU and the US specifically
  (Tinct operates from Denmark, serves globally). Note unresolved
  jurisdictional questions rather than asserting legal certainty you don't
  have.
- Compare candidates on clarity, completeness, literary voice, and useful
  structural alignment with the existing edition set — but do NOT reject a
  good human translation merely because its paragraph structure differs from
  ours; note that separately as "alignment work required" rather than a
  quality strike.
- If you cannot access a candidate, record it as **unverified**, not as
  accessible or as rejected. "No suitable edition found in this search" is
  different from "none exists" — say which one you mean.

## Phase 4 — rating and decision (produce for every assigned book)

Rate the EXISTING modern-en edition on 5 dimensions, integer 1–5, using
these anchors:
- 5 = strong in inspected passages
- 4 = good with limited local issues
- 3 = mixed; recurring issues
- 2 = weak; substantial problems
- 1 = unusable in inspected passages

Dimensions and weights: fidelity/completeness 40%, first-read clarity 25%,
literary voice 20%, restraint/no invention 10%, naturalness 5%. Compute the
weighted score only to sort a queue — do not report it to more than one
decimal, and always attach a plain-language band: Strong / Good with fixes
/ Mixed / Poor / Unusable.

Give ONE recommendation per book:
- **USE HUMAN EDITION** — a specific candidate is both readable and rights-
  clear (or rights-clear enough for the identified use)
- **SOURCE + GLOSSES** — the original/core English is already accessible;
  a full modern rewrite isn't worth maintaining
- **KEEP CURRENT MODERN EDITION** — current modern-en meets the standard
- **LIGHT EDIT** — current modern-en is close; local, scoped fixes needed
- **RETRANSLATE** — current modern-en has recurring, not-local defects
- **BLOCKED** — provenance, rights, or completeness of some prerequisite is
  unresolved; say exactly what's unresolved

A confirmed substantive omission or invention rules out an unqualified KEEP.
Decide whether the defect is local (one or two passages) or recurring
(pattern across samples) before recommending full retranslation over light
edit. State your confidence and how many passages you actually sampled —
"strong in samples" must never be reported as "the whole book is verified."

## Output files (write these for EVERY assigned book)

### 1. `docs/modern-english-translation-audit-2026-09-11/per-book-notes/{book-id}.md`

Free-form but must include: book ID/title/author; edition snapshot (hash
from Phase 1 data, chapter/paragraph/word counts); translator/date/
provenance/completeness of the core English text; every sample you
inspected (location + exact excerpts + finding); which Phase 1 mechanical
flags you confirmed vs. disconfirmed and why; your human-edition research
(candidates, rights evidence, URLs, or "unverified"/"none found in this
search"); the 5 dimension ratings + band + weighted score; recommendation +
confidence + estimated correction scope (none/local/substantial/unknown);
specific limitations of your review (what you did NOT check).

### 2. `docs/modern-english-translation-audit-2026-09-11/review-packet/pairs/{book-id}.json`

A JSON array of 2–4 of your strongest example pairs from this book (mix
strong/borderline/failing where the book has range) for an independent
reviewer, in this shape, with NO ratings, verdicts, or your own commentary
— just the raw material plus a neutral location tag:

```json
[
  {
    "location": "Chapter 3, para 12",
    "source_label": "Candidate A",
    "source_text": "...",
    "modern_label": "Candidate B",
    "modern_text": "..."
  }
]
```

Randomize which of source/modern is "Candidate A" vs "Candidate B" per
book (don't always put source first) so a reviewer can't pattern-match
which one is the source. Do not put your finding/verdict in this file.

### 3. `docs/modern-english-translation-audit-2026-09-11/review-packet/mapping/{book-id}.json`

The answer key for the file above — same order, mapping each `location` to
which label was actually source vs. modern-en, e.g.:

```json
[
  {"location": "Chapter 3, para 12", "Candidate A": "source (original-en)", "Candidate B": "modern-en"}
]
```

## What to return in your final message

For EACH assigned book, one compact JSON object (a JSON array across all
your books), matching this shape exactly — this feeds the master CSV, so
fill in every field:

```json
{
  "id": "book-id",
  "title": "...",
  "scope": "public|staged",
  "snapshot_hash": "sha256_16 from mechanical json",
  "samples_inspected": 7,
  "sample_locations": ["opening ch1", "ch5", "...ending ch40", "..."],
  "rating_fidelity": 4,
  "rating_clarity": 4,
  "rating_voice": 3,
  "rating_restraint": 5,
  "rating_naturalness": 4,
  "weighted_score": 3.9,
  "band": "Good with fixes",
  "recommendation": "LIGHT EDIT",
  "confidence": "medium",
  "why_modernization_needed_or_not": "one sentence",
  "best_human_candidate": "translator/edition name, or null",
  "human_candidate_rights_status": "public domain|permissive|share-alike|noncommercial|permission required|unclear|unverified|not researched (English original already accessible)",
  "human_candidate_url": "url or null",
  "correction_scope": "none|local|substantial|unknown",
  "next_action": "one short sentence"
}
```

Also list, in prose in your final message, the 5 note-file paths you wrote
and confirm each exists.
