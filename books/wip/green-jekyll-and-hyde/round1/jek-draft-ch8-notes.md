# Chapter 8 — "The Last Night" — rendering notes

Source: 99 paragraphs. Output: 99 paragraphs, 1:1 index correspondence, verified
programmatically (count match, no empty paragraphs, valid JSON) and re-read
side-by-side against source for omissions — none found.

## House-style / consistency choices carried over from the candidate (chs. 1–2, and the rest of ch. 8's own existing choices)

- **"cabinet" → "study"** throughout, for the room where Jekyll/Hyde shuts
  himself away. This was already the candidate's convention for this
  chapter (and consistent with modern readers' sense of "cabinet" as
  furniture, not a room). Not a new decision — kept for consistency.
- **"presses" → "cabinets"** for the glazed chemical cupboards (paras 71, 83),
  since "study" now names the room — this disambiguates without losing
  either image.
- **"cheval-glass" → "tall standing mirror"** (para 83) and **"glass" →
  "mirror"** in the following two lines (84–85): a period furniture term
  translated plainly rather than glossed, since a plain rendering fully
  carries the meaning (a full-length mirror on a swiveling frame) without
  needing an added note.

## Genuine sentence-level rewrites (period syntax / archaic diction rebuilt)

Dialogue lines that were already clear, idiomatic modern English (most of
Poole's and Utterson's short exchanges) were left close to the existing
wording — per the brief, "short lines already clear... may stay." The real
rebuilding work went into:

- **Para 13** — the March-night description ("flying wrack of the most
  diaphanous and lawny texture," "flecked the blood into the face," "borne
  in upon his mind a crushing anticipation of calamity") — fully rebuilt
  into plain present-day description while preserving every image (pale
  moon on her back, ragged/thin clouds, wind stinging color into faces,
  empty streets, Utterson's wish for company, the sense of coming disaster,
  the wind-lashed square, Poole's sweat being anguish not exertion).
- **Para 22, 24, 40, 41, 57, 60–61, 66, 70–74, 80, 82–83, 87, 89** —
  restructured Victorian long-sentence syntax (nested clauses, inverted
  word order, semicolon chains) into clearer present-day sentence
  structure, one-for-one in content.
- **Para 74** — the building-layout paragraph (theatre/study/corridor/
  cellar) — full syntactic rebuild; every structural detail kept (ground
  floor theatre lit from above, study on upper floor at one end
  overlooking the court, corridor to the side-street door, second stair to
  the study, dark closets, spacious cellar, undisturbed cobwebbed cellar
  door, predecessor surgeon's old lumber, no trace of Jekyll).

## Idiom / dialect handling (flagged, not silently normalized)

- **Para 4**: "I wish I may die if I like it" — a period emphatic-denial
  oath ("I'll be hanged/damned if X" = "I certainly don't X"). Rendered as
  "I'll be damned if I like it" to keep the oath's emphatic force
  intelligible aloud, since the literal wording reads as self-contradictory
  to a modern ear.
- **Para 30, 42**: "made away with" → "done away with" — keeps Poole's
  deliberate euphemistic ambiguity (could mean killed, could mean removed/
  replaced) rather than resolving it to "murdered."
- **Para 36**: "main angry" (Poole's dialect intensifier) → "mighty angry" —
  keeps the same colloquial, non-standard register rather than flattening
  to "very angry."
- **Para 56**: "book-learned" → "educated enough to know that"; "my
  bible-word" → "my word on the Bible" — both preserve Poole's specific,
  slightly old-fashioned way of asserting sincerity rather than replacing
  with a generic "I promise."
- **Para 38**: source's broken-grammar "But what matters hand of write?" was
  smoothed to "But what does handwriting matter?" — the ungrammatical
  original is genuinely hard to parse aloud and the sense (dismissing the
  handwriting evidence in favor of his own eyewitness account) survives
  intact; register is kept slightly clipped/impatient rather than made
  fully formal.

## Deliberate word choices kept, not softened

- **Para 72**: "self-destroyer" (Victorian periphrasis/euphemism for
  suicide) rendered plainly as "a man who had killed himself" for aloud
  clarity, rather than kept as an archaic label a listener might not parse
  — but the physical evidence it depends on (crushed vial, smell of
  kernels) is kept exactly, including "kernels" rather than glossing it as
  "bitter almonds" (that identification is not stated by the source and
  would be interpretation, even though a reference work would confirm the
  cyanide/bitter-almond association).
- **Para 92 (Jekyll's letter)**: kept close to the source's formal,
  slightly stiff epistolary register ("under what circumstances I have no
  way of foreseeing," "the end is certain and must come soon") since this
  is Jekyll's own deliberate, controlled voice at a moment of crisis —
  smoothed only the syntax ("When this shall fall into your hands" →
  "By the time this reaches you"), not the tone.
- **Para 34 (Jekyll's note to the chemists)**: kept the formal
  third-person business-letter convention ("Dr. Jekyll presents his
  compliments to Messrs. Maw...") since that formality is the point — it
  makes the sudden emotional break ("For God's sake... find me some of the
  old") land harder by contrast. Only modernized "sedulous care" → "the
  greatest care" and "can hardly be exaggerated" → "can hardly be
  overstated," which lose nothing.

## Glosses added

**None.** No terms in this chapter required an added clarification — every
period word or reference (cheval-glass, presses, kernels, bated breath,
malefactor, disinterred, etc.) was rendered into plain modern wording
directly, rather than needing a bracketed or appended note. No reference
that would stop comprehension was left unglossed and no invented
interpretation was added.

## Validation performed

- `python3` check: paragraph count == source count (99 == 99), JSON parses,
  no empty/whitespace-only paragraphs.
- Full side-by-side re-read of every paragraph (source vs. output) — no
  omissions, no dropped clauses, no actor/negation/causality changes found.
