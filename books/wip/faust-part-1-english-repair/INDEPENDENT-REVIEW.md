# Independent Review — Faust Part I, Bayard Taylor `original-en` candidate

Reviewer: independent verification pass (no prior-decision docs read beforehand)
Date: 2026-09-26

Source verified: `books/raw/faust-part-1/raw-en.txt`
sha256: `840e94c5694ce6b66ad6e2ebd2ffabea845297bc0cd50604d2587b5c6079791b` — **matches** the value given in the task (Project Gutenberg #14591, Bayard Taylor's translation). File is 9,022 lines, bounded by PG `*** START ***` / `*** END ***` markers at lines 1 and 9022.

Candidate reviewed: `books/wip/faust-part-1-english-repair/editions/faust-part-1-original-en.json`

## 1. Structural / schema checks

- Valid JSON. Top-level key is `chapters` (28 entries).
- **28 chapters, 1061 total paragraphs** — confirmed by direct count, matches the claimed structure.
- Every chapter object has exactly the keys `number`, `title`, `paragraphs` — no extra keys (`sections`, `id`, etc. are absent), matching the live sibling editions' shape.
- All 28 `title` values are the scene's **English** name (Dedication, Prelude on the Stage, Prologue in Heaven, Night, Before the Gate, The Study Part I/II, Auerbach's Cellar in Leipzig, Witch's Kitchen, Street, Evening, Promenade, The Neighbour's House, Street (II), Garden, A Summer House, Forest and Cavern, Margaret's Room, Martha's Garden, At the Well, Zwinger, Night. Street before Margaret's Door, Cathedral, Walpurgis-Night, Walpurgis-Night's Dream, A Gloomy Day. Open Country, Night. Open Field, Dungeon).
- Cross-checked against the **live** `app/public/data/editions/faust-part-1-original-en.json` (28 chapters, same English titles) and the **live** `app/public/data/editions/faust-part-1-original-de.json` (28 chapters, German titles, e.g. "Zueignung", "Trüber Tag. Feld") — the candidate's titles match the English-edition convention exactly, not the German one. German titles do **not** appear anywhere in the candidate.
- One cosmetic naming inconsistency: candidate titles chapters 6/7 **"The Study, Part I" / "The Study, Part II"** (Roman numerals) while the currently-live original-en edition uses **"The Study, Part 1" / "The Study, Part 2"** (Arabic numerals). Trivial to fix if exact-match to the live convention is wanted, but not a fidelity defect.
- Paragraphs are plain strings (speaker name inline, e.g. `"FAUST. ..."`), matching the format of the live original-en/-de editions.

## 2. Completeness — opening and ending

- **Opening confirmed:** Chapter 1 ("Dedication"), paragraph 1: *"Again ye come, ye hovering Forms! I find ye, As early to my clouded sight ye shone!..."* — present, correctly the first paragraph of the book, not attributed to any character (correct; the Dedication has no speaker).
- **Ending confirmed:** Chapter 28 ("Dungeon"), last paragraph: `VOICE (from within, dying away). Henry! Henry!` preceded by `MEPHISTOPHELES (to FAUST). Hither to me!`, `[He disappears with FAUST.]`, `VOICE (from above). She is saved!`, `MEPHISTOPHELES. She is judged!` — the full, correctly-attributed ending sequence is present and in the right order.

## 3. Deep-dive fidelity checks (12 scenes spread across the whole play, word-level diff against raw source)

For each scene below I extracted the exact raw line range and diffed word-for-word against the candidate's paragraphs (case/whitespace-insensitive). "Missing"/"extra" counts below, after correcting for scene-heading/roman-numeral/blank-line noise, were effectively **zero** except where noted.

| Scene | Candidate ch. # | Result |
|---|---|---|
| Prologue in Heaven (Mephistopheles's closing speech + The Lord's final speech) | 3 | **Complete.** Full closing exchange present verbatim, including "I like, at times, to hear The Ancient's word... So humanly to gossip with the Devil!" |
| Night — Easter-morning sequence (goblet monologue, bells, "Christ is arisen", Chorus of Women/Angels/Disciples) | 4 | **Complete**, all four choruses present in full — but see Defect 2 below (stray footnote numerals). |
| The Study, Part I — "In the Beginning was the Word" Bible-translation passage | 6 | **Complete.** All four translation attempts present verbatim: "In the Beginning was the *Word*" → "*Thought*" → "*Power*" → "*Act*", each with Faust's reasoning intact. |
| Auerbach's Cellar in Leipzig | 8 | **Complete** (4 stray word diff = scene-heading noise only). All four named students (Frosch, Brander, Siebel, Altmayer) correctly attributed. |
| Witch's Kitchen | 9 | **Complete** (5 stray word diff = heading noise only). Speaker attribution spot-checked in detail around the Witch/Mephistopheles exchange (lines ~4590–4610) — correct, no misattribution. |
| Forest and Cavern | 17 | **Complete** (5 stray word diff = heading noise only). |
| Cathedral | 23 | **Complete**, zero word diff once scene boundary is set correctly. |
| Walpurgis-Night | 24 | **Complete** (diff is entirely scene-heading/roman-numeral noise). |
| Walpurgis-Night's Dream | 25 | **Complete** (diff is entirely scene-heading noise). |
| A Gloomy Day. Open Country (the play's one prose scene; raw heading reads "DREARY DAY / A FIELD") | 26 | **Complete** and correctly retitled to match the live edition's English convention. One of the scene's two `[Illustration: ...]` captions was correctly stripped here (see Defect 1 for the inconsistency). |
| Night. Open Field | 27 | **Complete.** |
| Dungeon | 28 | **Complete** except for one leaked illustration caption — see Defect 1. |
| Margaret's Room | 18 | **Complete**, verified paragraph-for-paragraph against raw lines 6513–6569 (the full "Meine Ruh ist hin" / "My peace is gone" song, all four stanzas plus the repeated refrain). |

No dropped stage directions, dialogue, or verse were found in any of the above scenes.

## 4. Defects found

### Defect 1 — One leaked Project Gutenberg illustration caption (Dungeon, ch. 28)

Raw source (lines 8887–8890), embedded mid-dialogue between Margaret's speech and Faust's reply:

```
[Illustration: _=If the grave is there,
Death lying in wait, then come=_!]
```

This is a printer's illustration caption (quoting nearby lines as a plate title), not spoken dialogue. In the candidate JSON it survived as its own paragraph:

- **Chapter 28 ("Dungeon"), paragraph index 40** (0-indexed; the 41st paragraph in the array): `'[Illustration: =If the grave is there, Death lying in wait, then come=!]'`

It sits between paragraph 39 (Margaret's speech ending "...Seize it in haste!...") and paragraph 41 (Faust's reply "Recall thy wandering will!..."), breaking the two-character dialogue flow with a duplicate, out-of-place line. This is the **only** surviving instance out of 54 `[Illustration]` markers in the raw file — everywhere else (including the *other* captioned illustration in this same "Gloomy Day" scene's raw text, "Roll the devilish eyes wrathfully in thy head") the caption was correctly stripped. This one should be removed for consistency before publication.

### Defect 2 — Stray footnote reference numerals leaked into reading text (Night, ch. 4)

The raw Gutenberg file itself contains six bare footnote-marker digits (27–32) with no corresponding footnote text elsewhere in the file — likely a relic of the file's OCR/transcription that dropped the actual translator's footnotes but left the superscript reference numbers as inline digits. They all fall within lines 1409–1535, inside the goblet-monologue/Easter-chorus stretch of the "Night" scene. All six survived verbatim into the candidate:

- **Chapter 4 ("Night"), paragraph index 33** (the long Faust monologue) contains, embedded in running prose:
  - `"...A thunder-word hath swept me from my stand.27 With thee I dare not..."`
  - `"...And here and there one happy man sits lonely?28 What mean'st thou..."`
  - `"...Sought once the shining day, and then, in twilight dull,29 Thirsting for Truth..."`
  - `"...Earn it anew, to really possess it!30 What serves not..."`
  - `"...On Earth's fair sun I turn my back 31 Yes, let me dare those gates..."`
  - `"...CHORUS OF ANGELS.32 Christ is arisen!"` (paragraph index 33, immediately preceding paragraph 34's separately-tagged chorus text — the "32" is glued onto "ANGELS." with no space)

These are not part of Taylor's actual verse — they are stray reference numbers with no footnote payload anywhere in this file. They will read as typos/noise to a reader (e.g. "turn my back 31 Yes, let me dare"). This is the same class of defect as the `[Illustration]` leak (uncleaned PG apparatus), just numeric instead of bracketed, and is confined entirely to this one paragraph in this one scene. Recommend stripping the six bare numerals (`.27`, `?28`, `,29`, `!30`, ` 31`, `.32`) from chapter 4.

### Everything else checked and clean

- **No German text** anywhere in the candidate (checked for `äöüÄÖÜß` across all 1061 paragraphs — zero hits).
- **No accidentally duplicated paragraphs.** An exact-string duplicate scan across all 1061 paragraphs found only legitimate, source-faithful repeats: stage-direction headers like `[Faust. Mephistopheles.]` (recurs because the same two characters open several scenes), short common lines like `MARGARET. How so?`, and the "As if he had love in his bosom!" chorus refrain, which is genuinely repeated six times in the raw Auerbach's Cellar song. A consecutive-duplicate scan (same paragraph appearing twice in a row) found zero hits.
- **No other PG boilerplate** (headers, "Produced by...", transcriber's notes, license text) found inside any chapter's paragraphs — only the one illustration-caption leak noted above.
- **Speaker attribution spot-checked and correct** in Auerbach's Cellar, Witch's Kitchen (including the tricky consecutive Witch/Mephistopheles exchange at raw lines 4594–4610), Prologue in Heaven, and the Dungeon closing sequence — no lines or stage directions found assigned to the wrong character.

## 5. Verdict

**ACCEPT, with two small, precisely-located cosmetic defects to fix before publication** (neither affects the play's overall completeness or the specific passages the old defective edition was missing, all of which are now genuinely present and complete):

1. Remove the leaked illustration-caption paragraph in Chapter 28 ("Dungeon"), paragraph index 40: `'[Illustration: =If the grave is there, Death lying in wait, then come=!]'`.
2. Strip the six stray footnote-reference numerals (27–32) from Chapter 4 ("Night"), paragraph index 33.
3. (Optional, purely cosmetic) Rename chapters 6/7 from "The Study, Part I"/"Part II" to "The Study, Part 1"/"Part 2" to exactly match the live edition's existing numeral convention.

Everything the task asked me to specifically re-verify — the real opening, the real ending, Mephistopheles's closing speech in "Prologue in Heaven," the full Easter-morning chorus sequence, and the complete four-attempt "In the Beginning was the Word" Bible-translation passage — is present, complete, and correctly attributed in this candidate. This is a substantial, verified improvement over the currently-live defective edition (which I also spot-checked and confirmed contains OCR corruption, e.g. "bitter sweat, be obliged to speak of what I do no know" and "SPIRIT. Who calls to nie?" in its version of the same "Night" scene passage).
