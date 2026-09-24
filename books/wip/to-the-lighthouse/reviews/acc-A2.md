# Acceptance review A2: *To the Lighthouse*, Tinct Modern E (ch. 20–42)

**Reviewer stance:** first-time adult reader and listener. I judged the modern edition on its own terms and did not open the original text.
**File reviewed:** `editions/to-the-lighthouse-modern-en.json`
**Findings:** `reviews/acc-A2.json`. It has 40 items: 1 blocking and 39 recommended. 24 are content items and 16 are mechanical dash-style items. Every `find` string occurs exactly once in its paragraph (checked by script).

## Coverage

- Ch. 19 (end of The Window): skimmed for context.
- Ch. 20–29 (Time Passes): read in full, in order. That covers all 52 paragraphs, including the nine square-bracketed reports.
- Ch. 30–42 (The Lighthouse): read in full, in order. That covers all 134 paragraphs.
- Mechanical sweep of ch. 20–42 for straight quotes, stray markup, doubled words, spacing before punctuation, dash style and bracket use.
- Refrain sweep across the whole edition:
  - "We perished, each alone"
  - "women can't paint / can't write"
  - "Someone had blundered"
  - "Life stand still here"
  - "the long steady stroke"
  - "fine tomorrow"
  - "I have had my vision"
  - the Cowper lines

## Overall assessment

This is a highly readable and faithful-feeling modern edition. Part III works especially well aloud. The shifts between Lily on the lawn and Cam and James in the boat are clearly signposted, the long painting meditations have been split into sentences a listener can follow, and the brief glosses are just enough:

- Cowper's "The Castaway"
- Michaelmas
- ducks and drakes

In Time Passes the lyrical register holds without turning purple. The bracketed reports are flat and factual, as they should be. Mrs. McNab's and Mrs. Bast's dialect is light, and it works.

There is one blocking problem. The bracketed report of Mrs. Ramsay's death (22.3) repeats itself ("stretched out his arms … he stretched his arms out"). It sounds like a copy error at the most important moment in the book.

Everything else is polish:

- **Pronoun referents at viewpoint changes.** These are the most common issue: 31.0, 34.20, 37.2, 37.10, 40.7, 40.16, 41.1. In each case a bare "he"/"she" points to the wrong person, and naming the right person fixes it without losing Woolf's ambiguity where it matters.
- **Unexplained names or objects.**
  - "Maggie" is never tied to Mrs. McNab.
  - "red-hot poker" will be heard as the fireplace tool, not the flower.
  - The newsboy calls "_Standard, News_" with no hint that these are evening papers.
- **Small internal inconsistencies.**
  - "You find us" / "You will find us much changed"
  - eleven / ten ships
  - compact / pact
  - War / war
  - summer heat / "softer spring light"

## Mechanical notes

- No straight quotes, stray HTML/markdown or doubled words anywhere in ch. 20–42. Every "had had" is grammatical.
- `_underscores_` mark italics (per the brief): _them_, _that_, _Standard, News_, _The Times_. They are not stray markup.
- **Dash style:** ch. 18–24 use spaced em dashes (` — `). Ch. 1–17 and 25–42 use closed-up em dashes (`—`). JSON items cover the 16 spaced instances in ch. 20–24. Ch. 18–19 (outside my range) have 41 more and need the same normalization.
- 37.3 has a dash-plus-parenthesis collision.
- 40.15 has spaced ellipses (`… ?`).

## Refrains

- **"We perished, each alone"** is consistent at 30.6 ("Alone" / "Perished" as fragments), 33.4, 33.9, 39.2 and 41.19. It slips to "we perish" at 33.11 (flagged as recommended, with a note to keep it if the source's present tense is deliberate).
- **"Women can't paint, women can't write"** changes its word order (17.10 and 40.9 "can't write, … can't paint"; 32.3 and 32.4 "can't paint, can't write"). It stays recognizable every time, so I left it as it is.
- **The other refrains** are consistent and clear:
  - "Someone had blundered"
  - "Life stand still here"
  - the Cowper couplet, with its line breaks preserved
  - the Lighthouse (capital L)
  - "I have had my vision" (verbatim)

## Considered and left alone (deliberate Woolf effects)

- "The hand dwindles in his hand" (22.2)
- flies spinning a web (25.4)
- boat / cork / cask / lobster pot variations in Lily's memory (32.4, 34.4–5)
- "half unwilling, half reluctant" (32.2)
- the unnamed "three of them" and the Prue/Mrs. Ramsay flower-dropping ambiguity (40.16–17)
- "They look down at their knitting" (33.11)
- "Chinese eyes" and "savages" (period voice, which the brief preserves)
