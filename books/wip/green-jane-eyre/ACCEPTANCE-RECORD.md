# Acceptance Record — Jane Eyre (Charlotte Brontë), modern-en

- **Book id:** `jane-eyre` · **Edition:** `modern-en`
- **Date:** 2026-09-23
- **Scope:** content only. No live edition, application, character-card, audio, deployment or shared-instruction file was modified. Everything is staged in `books/wip/green-jane-eyre/`.

**Final sha256 (`candidate.json`):**
```
5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7
```

## Source and baseline

| Item | File | sha256 |
|---|---|---|
| Source (fidelity anchor) | `source.json` — byte-identical copy of the served `app/public/data/editions/jane-eyre-original-en.json` | `055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96` |
| Live baseline (starting point) | `baseline-live-modern-en.json` — byte-identical copy of the served `app/public/data/editions/jane-eyre-modern-en.json` at main `b792a83b` | `bbfe4c30163ecf07291e2fa5faef69d1e57348644afe2ab0dfc96edff3cecad0` |

- **Provenance:** Charlotte Brontë, 1847, Project Gutenberg #1260 (`books/raw/jane-eyre/SOURCE.md`, `raw.txt`).
- **Source completeness:** checked with a word-sequence diff of `source.json` against the body of `books/raw/jane-eyre/raw.txt`. The only unmatched runs are the 38 chapter headings and one Gutenberg duplicate line in chapter 37 ("You are altogether a human being, Jane? You are certain of that?"), which `source.json` correctly keeps only once (37.87). No body text is missing. The Gutenberg preface and dedication are not part of the edition (unchanged scope).
- **Structure:** 38 chapters and 4,047 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are identical to the source and the baseline. The JSON has the same schema and serialization as the live file (`indent=2`, UTF-8, no trailing newline), verified by a byte-for-byte re-dump.

## Recovered earlier work

Earlier repair work existed on branches `claude/friendly-albattani-qgyqfi` and `claude/intelligent-heisenberg-61n7a4` (commit `514aa6c09`, `books/wip/jane-eyre-repair/`). It covered **five units only**: the tail of chapter 27 and chapters 35, 36, 37 and 38, a total of 61 changed paragraphs. It was not a whole-novel review; its own log states that chapters 1–26 and 28–34 had never been close-read.

- Its staged "current" and "source" chapter files still match today's live baseline and source exactly, so the accepted chapter files could be reused as they were. They are kept in `prior-repair/` with their notes and verification reports, unmodified:

| File | sha256 |
|---|---|
| `ch27-accepted.json` | `83957fef2599781772151453ae1359e56c38fac35069e995b04cb797f391dba4` |
| `ch35-accepted.json` | `621a8e2332fd31d905453b83b84381dbc7ff685fad8b00f2ebc9db24b86d0b8c` |
| `ch36-accepted.json` | `a8bb10d7b52a07aaab24fcbffeb37e1364c57828fffbecf3fd37f939d9ee3a86` |
| `ch37-accepted.json` | `a1fe8fde5eb798c3663b1296d1c0beff20b152e70e762d741bf098a040307f35` |
| `ch38-accepted.json` | `8b4703ca1b07b35a9f4154a355dedc8401a5a9bb64d5192e28d52901e58aee85` |

- These hashes match the ones in that work's `PROGRESS.md`. The starting candidate was the live baseline with these five chapters swapped in.
- The earlier work was **not** taken on trust. Every paragraph it touched was re-reviewed in round 1 and round 2, like the rest of the book. Within the earlier pass's own scope, it found 16 further blocking defects in chapters 35–36 and 3 in chapters 37–38. It also found 8 blocking defects in chapter 27, 2 in the tail the earlier pass had covered and 6 in the rest of the chapter (see below).

## The two demonstrated defects

Coordinates in the brief were one-based; this record uses chapter.paragraph with a 0-based paragraph index.

- **Chapter 27, paragraph 161 → 27.160** (Jane's flight at sunrise; 402 source words). The live text had 110 words and an invented "drain … torrent of blood" image. The earlier repair had already restored the passage. Round 1 kept that repair and fixed one remaining distortion: "his self-abandonment—far worse than my abandonment" had become "what he might do to himself … what I was doing to myself", which implied suicide and self-harm that the source does not contain. It also restored "redeemer", "left my master" and "eager".
  - Round 2 checked it clause by clause. The scaffold simile, the longing to return, the barbed arrow-head, the birds as emblems of love, the self-abhorrence, "God must have led me on", and the fall and crawl are all present and in order. Nothing is invented. **Verified.**
- **Chapter 36, paragraph 49 → 36.48** (the innkeeper's account of the fire). The live text reversed the fire's sequence and locations, invented a rescue, and dropped the aftermath. The earlier repair restored the source sequence: the hangings of the room next to her own, then down a storey to the governess's former chamber, the bed kindled with nobody in it. It also restored the aftermath: the search for Jane, Rochester turning savage, Mrs. Fairfax's annuity, Adèle sent to school, and the hermit years.
  - Round 1 and round 2 both compared the whole passage 36.40–36.60 and confirmed it, including its continuity with 36.52 (the attics, the servants, the skylight, "Bertha!") and 36.72.
  - 36.52 itself was damaged. Rochester called her before he climbed, not after, "Bertha!" and the witnesses were dropped, and "We shouted for him to come down" was invented. It was repaired in round 1. **Verified.**

## Method and coverage

Each reviewer was a fresh, independent agent. Round-1 and round-2 fidelity reviewers compared **every** paragraph of their chapters against the source, with neighbouring context. Accessibility reviewers saw the candidate only. The lead screened every proposal against the source before applying it: word-level diffs for all proposals, and full source text wherever a proposal was blocking or looked doubtful.

| Round | Scope | Reviewers | Result |
|---|---|---|---|
| R1 source-based repair review | All 38 chapters, 4,047 paragraphs, in 20 batches. Priority chapters 27 and 34–38 were reviewed first. | 20 independent Opus reviewers, one per batch | 379 proposals (55 blocking, 324 recommended). 378 applied, 5 of them with lead-adjusted wording; 1 rejected. Plus a lead sweep of 9 "Adele"→"Adèle" diacritics. See `round1/` |
| R2 independent fidelity review | All 4,047 paragraphs, same 20 batches, with the 432 paragraphs changed so far flagged together with their baseline text | 20 **fresh** Opus reviewers (none from R1) | 56 findings, **0 blocking**. The reviewers confirmed the R1 changes paragraph by paragraph. Only a handful of R1 edits needed small follow-ups: 11.46 (grammar), 17.108 and 31.24 (punctuation) and 24.172 (gloss). See `round2/r2f-*` |
| R2 candidate-only accessibility review | All 4,047 paragraphs in 10 batches; no source given | 10 fresh Opus reviewers | 97 findings (3 marked blocking: 18.61, 24.125, 15.45). See `round2/r2a-*` |
| R2 merge | 153 findings on 145 paragraphs | Lead, with source checks for every accessibility item that touched content | 137 paragraphs changed (131 as proposed, 6 adjusted); 13 findings rejected; 3 merged into overlapping findings. See `round2/r2-applied.json` |
| R3 independent re-verification | All 137 paragraphs changed in R2: PREVIOUS vs NEW diff, the source, and neighbours | 4 fresh Opus verifiers | 131 VERIFIED, 6 DEFECT (21.154, 24.172, 13.45, 24.67, 17.138, 17.100). All 6 fixed, plus 1 lead continuity fix (21.179). See `round3/r3-V1..V4` |
| R4 final re-verification | The 7 paragraphs changed in R3 | Fresh Opus verifier | 6 VERIFIED. 1 DEFECT (21.179, quotation-mark placement); the verifier's own fix was applied. See `round3/r3-V5-final.*` |
| R5 | 21.179 | Fresh Opus verifier | **VERIFIED** (`round3/r3-V6-21.179.md`) |
| Continuity and structure (whole book) | Names and terms vs source, typography, quote parity, structure, length | Lead (programmatic, followed by reading) | Proper-noun counts track the source. "Hindostanee"/"Hindustani" harmonized to "Hindustani" (7 occurrences). No stray underscores outside chapter 34, no "Adele", no double spaces. Quote parity matches the source except for multi-paragraph speeches. Structure is identical |
| Similarity gate | Whole book | `books/classify-modern-en.py jane-eyre --gate`, run unmodified against the candidate in a scratch tree | **GATE PASS**: weighted similarity 0.687, LIGHT 1/38, identical long paragraphs 0.9% |
| Length screen | Whole book | Lead | Paragraphs under 75% of source length (for sources of 25+ words): 47 in baseline, 8 in candidate (4.23, 4.78, 9.24, 10.25, 10.69, 35.9, 35.40, 36.11). All 8 were read by two independent source-based reviews and are complete, just concise |

**No sampling at any stage.** A per-chapter coverage map follows.

| Chapters | R1 batch | R2 fidelity batch | R2 accessibility batch |
|---|---|---|---|
| 1–3 | B05 | B05 | A01 (1–4) |
| 4–5 | B06 | B06 | A01 / A02 (5–8) |
| 6–8 | B07 | B07 | A02 |
| 9–10 | B08 | B08 | A03 (9–12) |
| 11–12 | B09 | B09 | A03 |
| 13–14 | B10 | B10 | A04 (13–16) |
| 15–16 | B11 | B11 | A04 |
| 17 | B12 | B12 | A05 (17–19) |
| 18–19 | B13 | B13 | A05 |
| 20 | B14 | B14 | A06 (20–22) |
| 21–22 | B15 | B15 | A06 |
| 23–24 | B16 | B16 | A07 (23–26) |
| 25–26 | B17 | B17 | A07 |
| 27 | B01 | B01 | A08 (27–28) |
| 28–29 | B18 | B18 | A08 / A09 (29–33) |
| 30–31 | B19 | B19 | A09 |
| 32–33 | B20 | B20 | A09 |
| 34 | B02 | B02 | A10 (34–38) |
| 35–36 | B03 | B03 | A10 |
| 37–38 | B04 | B04 | A10 |

Every reviewer report (`*.md`) opens with a coverage statement listing each chapter's full paragraph range as compared.

## What was found

- **Summarize-and-patch damage** (dropped source content replaced by invented, similar-length text):
  - Chapter 27: 27.131–27.133, the invented "caged skylark" and "vision" monologue, now rebuilt from the source's cage, captive, clay-dwelling and essence speech ending "Oh! come, Jane, come!".
  - Chapters 35–36: many endings. 35.2 ("marble guardian angel"), 35.3, 35.74, 35.75 (invented Revelation 22), 35.97, 36.5 (Paul and Silas), 36.12, 36.18, 36.19, 36.21, 36.23 ("skeleton" instead of "stone dead"), 36.26, 36.27.
  - Chapter 37: remaining inventions at 37.1, 37.8, 37.11, 37.13, 37.100.
- **Meaning reversals and distortions:**
  - 10.55: "plucked" (failed exams) had become "expelled".
  - 14.56: "free-born".
  - 16.76: "wholesome" had become "harsh".
  - 24.41: invented "and to say yes".
  - 31.20: "imposed"/"opposed"; see the source notes.
  - 32.5: "not absolutely spoilt".
  - 38.6: "noan faâl" means not ugly; it had become "no fool".
- **Hundreds of flattened allusions and images restored:** Eutychus, graven image, Babel, "stony street", the Coming Man, phylactery (not "crown of thorns"), Cuyp, stalled ox, bowstring, "Off, ye lendings!", Ariel, sounding brass, "hewers of wood and drawers of water", Mammon, the Peri, the Indian Messalina, suttee, clothed hyena, and more.
- Chapter 34 was confirmed as the highest-fidelity chapter; it needed only minor accessibility fixes.

`CHANGED-PARAGRAPHS.md` gives every changed paragraph with its old hash, new hash and every reason, round by round.

## Conventions (documented)

- **Italics:** the edition drops the source's underscore emphasis except in chapter 34, which already carried it. No new underscores were introduced. Emphasis that carries meaning is expressed in wording instead.
- **Typography:** each chapter's existing quote style is kept (curly quotes in chapter 34, straight elsewhere), and so are its dash spacing and its existing mixed British/American spelling. Normalizing spelling across the whole book was judged out of scope and is not a fidelity issue.
- **French:** Adèle's French is kept, and restored where it had been silently translated (12.7, 22.35). Brief English echoes or glosses were added only where context gives no clue (17.32, 14.41, 17.63 *minois chiffoné*). Other characters' French follows each chapter's existing practice.
- **Proper nouns:** as in the source, including Lisle, Adèle, Céline, Frédéric and St. John, with two exceptions. First, the standard spelling "Brobdingnag" is kept at 3.20; the source's "Brobdignag" is Brontë's misspelling. Second, "Lady Lynn" is used at 18.61 where the source has "Mrs. Lynn", because Brontë is inconsistent and the character is "Lady Lynn" everywhere else.
  - Mrs. Fairfax and the narrator's "Adela" (11.40, 11.60, 11.64, 11.65) is kept as in the source.
  - St. John's pet name "Die" is spelled "Di" (30.61) so it isn't heard as the verb.
- **Glosses:** brief and accurate, added only where essential. Examples: Collect, phylactery, Eutychus, Resurgam, Guy Fawkes, Bridewell, the Rubric, Cairngorm, Latmos, Danaë, suttee, Messalina, deist, competence, *paysannes/Bäuerinnen*, brownie, "the slip between the cup and the lip".
- **Dated ethnic similes:** where the baseline had already neutralized them, that was left alone: "silent as an Indian" became "statue" (8.2), and "like what the Indian … feels" became "a man" (27.39); the R1 proposal to restore the latter was rejected. "Caffre bush" became "South African bush" (34.30).
- **Brontë's tense shifts** into the historic present are restored where the baseline had flattened them (17.72–17.86), and kept where the source itself slips back (22.15).

## Rejected proposals (with reasons)

- **R1:** 27.39, restoring "the Indian" in the canoe simile (see conventions).
- **R1, adjusted wording:**
  - 3.20: kept "Brobdingnag".
  - 12.7: "Mdlle." became "Mademoiselle" for reading aloud.
  - 18.26: italics dropped.
  - 27.160: "my own abandonment", keeping the source's ambiguity.
  - 31.41: "as she was for a woman".
- **R2:**
  - 29.118 and 29.121: italics convention.
  - 3.29: the source says "in the course of the morning".
  - 17.11 and 15.50: the source says "second storey".
  - 22.15: the source's own past tense.
  - 11.65: the source's "Adela".
  - 15.45: caption artifact.
  - Duplicates or superseded variants: 15.11, 17.63, 31.24 and 32.59 (accessibility versions); 8.0 (fidelity version).
  - Merged: 4.82, 24.125 and 35.96 (fidelity and accessibility combined). Adjusted: 10.33 (dash), 24.172 (gloss), 36.35 (referent wording checked against 36.32–36.34).
- Each reviewer report also lists the borderline items that reviewer considered and rejected.

## Source-text issues (recorded, not fixed; no passage is blocked)

1. **Gutenberg illustration captions and duplicate lines kept as their own paragraphs in `original-en`:** 4.83, 12.46, 15.45, 18.92, 19.78, 25.83, 28.6, 28.51, 28.117, 33.92, 34.114, 36.53 and 38.17. Each repeats a line from a neighbouring paragraph, usually without final punctuation.
   - The modern text mirrors them one-for-one to preserve alignment, so readers see or hear the line twice.
   - At 36.52/36.53 the modern text ends 36.52 at Bertha's leap and lets 36.53 carry "The next moment she lay smashed on the pavement".
   - Removing these needs a coordinated structural change to **both** editions (and to card anchors). That is outside content scope; see the release packet.
2. **31.20:** Gutenberg reads "My father, indeed, imposed the determination". The following "but since his death, I have not a legitimate obstacle" requires "opposed". The modern text reads "opposed". Two independent reviewers agree; neither could confirm a first-edition reading online.
3. **Likely transcription slips in the source** (the modern text already reads correctly): 34.134 "serve your heart" (give), 21.168 "quiet familiar" (quite), 20.121 "balmly", 32.41 "quartet" (quarter), 23.2 "charm or" (of), 27.81 "Grimbsy", 27.27 "a upas-tree", 20.146 "out of the Thornfield" (missing noun), 29.38 (missing closing quote), and 12.53 (verse lines run together).

## Verdict

**ACCEPTED — ready for release handoff.** Every paragraph of the novel was compared against the source by two separate independent source-based reviews (R1 and R2), and a separate candidate-only accessibility review covered every paragraph. Every blocking finding was resolved. Every paragraph changed after R1 was independently re-verified (R3, R4, R5), ending with all of them verified. Structure and alignment are identical to the source, and the similarity gate passes. The one remaining dependency is the source-side caption artifacts above: a structural question for the source/app owner that does not block this text.
