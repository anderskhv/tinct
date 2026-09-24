# To the Lighthouse — independent character-content review

Reviewer: independent agent (did not author the content). Review only. No files under review were edited.
Date: 2026-09-24. Content version reviewed: `2026-09-24.1`.

Files reviewed (under `books/wip/to-the-lighthouse/`):
- `characters/editorial.json` (76 entities)
- `characters/characters.v1.json` (original-en 1340 mentions, modern-en 1409 mentions)
- `characters/to-the-lighthouse-threads.json` (17 Cast characters)
- `characters/source-review.md`
- against `editions/to-the-lighthouse-original-en.json` and `editions/to-the-lighthouse-modern-en.json`

Policy applied: `books/characters/EDITORIAL-POLICY.md`, `books/characters/README.md`.

## Method

All checks were run with local Python over the edition JSON. No model or API calls were made.

- **Spoilers.** For every entity, compared each first-encounter subtitle and body with the text up to `firstMention`, allowing ordinary identity as the policy permits. Printed every snapshot gate paragraph in both editions and confirmed that the fact it reveals is in that paragraph or earlier. Checked `roleVisibleAt` (Carmichael 1.17, Minta and Paul 10.2) against the compiled data.
- **Facts.** Grepped each claim on the cards and in the Cast summaries, for example ages, occupations, relationships, the Hume bog story, the greenhouse bill, "Well done!", Golders Green and Hampton Court.
- **Bindings.** Asserted that every mention span's `text` equals the edition substring. Looked for any alias occurrence that has no binding (there are none in either edition). Printed every mention of a short or ambiguous alias with its context in both editions, then listed capitalised names in the text that no alias covers. Compared per-paragraph entity counts between the two editions.
- **Compiled offsets.** Every `firstMention` equals the end of the entity's first bound span. Every later snapshot's `availableAt` equals its paragraph length in that edition. Role gates are at paragraph ends.
- **Threads.** Checked every chapter entry against its chapter text, for future leakage, and for length (all are 2–3 sentences).

## Spoiler check: all gates verified

| Entity | Gate | Fact in the gate paragraph (both editions) |
|---|---|---|
| mrs-ramsay, mr-ramsay, ramsay-family | 22.3 | "[…Mrs. Ramsay having died rather suddenly the night before…]" |
| prue | 25.1 / 25.3 | married "that May" on her father's arm / died "in some illness connected with childbirth" |
| andrew, ramsay-family | 25.6 | shell in France, "death … instantaneous" |
| augustus-carmichael | 25.9 / 40.5 | volume of poems, "unexpected success" / "growing famous", Andrew's death, "lost all interest in life" |
| minta-doyle, paul-rayley | 14.9 | "when he asked Minta to marry him"; the brooch was lost at 14.8 |
| minta-doyle, paul-rayley, rayleys | 34.8 / 34.11 | "the two little boys", "turned out rather badly" / "taken up with another woman" |
| lily-briscoe | 28.12 / 30.9 / 42.2 | arrives by train / "at forty-four" / "I have had my vision" |
| james, cam | 30.8 | "James was sixteen, Cam seventeen, perhaps" |
| james | 41.16 | "Well done!" is at 41.15; 41.16 has "His father had praised him" |
| mr-ramsay | 41.21 | "seventy-one" is at 41.10; he springs onto the rock at 41.21 |
| william-bankes | 31.0 / 34.17 | talk of marriage / Hampton Court (the "loved" line is at 34.16) |
| charles-tansley | 40.9 | the fellowship and Golders Green are at 40.8; the wartime platform is at 40.9 |
| mrs-mcnab, kennedy | 28.3 / 28.8 | letter from "one of the young ladies" / Kennedy's leg |

- Lily's first card says "in her thirties". The text gives "thirty-three years" at 9.11, and "forty-four" is gated at 30.9. This is consistent and is not a spoiler.
- Minta's first card gives her age as twenty-four, which is stated at 10.12. This is ordinary identity and acceptable.
- Every persistent subtitle stays true across all of its snapshots.
- No first-encounter card reveals a death, a marriage, the engagement, Carmichael's later success or any Part III fact early.

## Blocking findings

None.

## Recommended findings

### R1: Overstated wording on Bankes's Part III snapshot
- **File:** `characters/editorial.json`, entity `william-bankes`, snapshot `after: [34, 17]`.
- **Current:** "Lily remembers their long friendship, one of the pleasures of her life: summer outings to Hampton Court where he talked about perspective and architecture. She realizes that she loves him, though they never married."
- **Problem:** The text (34.16) states "She loved William Bankes." as a settled fact in the past tense. It is not a realization.
- **Proposed:** "Lily remembers their long friendship, one of the pleasures of her life: summer outings to Hampton Court where he talked about perspective and architecture. She loved William Bankes, though they never married."

### R2: The same overstatement in the Cast summary
- **File:** `characters/to-the-lighthouse-threads.json`, `william-bankes`, chapter `"34"`.
- **Current:** "Lily remembers their long friendship and summer outings to Hampton Court, where he talked about perspective and architecture. She realizes that she loves William Bankes."
- **Proposed:** "Lily remembers their long friendship and summer outings to Hampton Court, where he talked about perspective and architecture. His friendship, she thinks, has been one of the pleasures of her life; she loved him."

### R3: George Bast's card claims a trait the text does not give
- **File:** `characters/editorial.json`, entity `george-bast`, `body`.
- **Current:** "Mrs. Bast's son, a quiet, hard worker who catches the rats and cuts the grass while the house is put in order."
- **Problem:** The text only says he "caught the rats, and cut the grass" (28.3) and is "scything the grass" (28.8). "Quiet, hard worker" is invented.
- **Proposed:** "Mrs. Bast's son, who catches the rats and cuts the grass while the house is put in order."

### R4: Prue's first-encounter card draws on a Part III memory
- **File:** `characters/editorial.json`, entity `prue`, `body`. The card opens at 1.5.
- **Current:** "One of the older Ramsay daughters, growing into a beauty; she helps keep order among her brothers and sisters."
- **Problem:** "Helps keep order" comes from Lily's Part III memory at 40.15 ("seeing that nothing went wrong"). Part I only says Prue is "a perfect angel with the others" (10.11). This is not a plot spoiler, but it is not Part I identity.
- **Proposed:** "One of the older Ramsay daughters, gentle with the younger children; her mother is sure she will grow into a great beauty."

### R5: Mr. Ramsay's snapshot gives the ten-year gap too early
- **File:** `characters/editorial.json`, entity `mr-ramsay`, snapshot `after: [30, 1]`.
- **Current:** "Ten years after that summer he is back at the house, now a widower, determined to sail to the Lighthouse with Cam and James, and has already lost his temper over the delays."
- **Problem:** "Ten years" first appears at 30.6 ("ten years ago"). The snapshot releases the interval five paragraphs early. This is minor.
- **Proposed:** keep the gate and use "Years after that summer he is back at the house, now a widower, determined to sail to the Lighthouse with Cam and James, and has already lost his temper over the delays." Alternatively, keep the text and move the gate to `[30, 6]`.

### R6: Coverage gap: bare "Ramsay" meaning Mr. Ramsay is not bound in either edition
- **File:** `characters/editorial.json`, entity `mr-ramsay`, `aliases` (compiled output is `characters.v1.json`).
- **Problem:** Bankes and the narrator call him plain "Ramsay" many times, and none of these are bound:
  - **original-en:** 4.1@821, 4.8@56, 4.8@109, 4.8@412, 4.8@695, 4.8@1018, 4.9@156, 4.9@291, 4.9@520, 4.10@324 ("Ramsay's youngest daughter"), 4.11@1065, 4.15@133, 9.0@218, 9.0@320, 9.1@359, 17.20@1068.
  - **modern-en:** 4.1@876, 4.8@65, 4.8@117, 4.8@406, 4.8@696, 4.8@1003, 4.9@150, 4.9@273, 4.9@523, 4.10@336, 4.11@1064, 4.11@1149, 4.15@133, 9.0@236, 9.0@355, 9.1@377, 17.20@1018.
- **Proposed:** add the alias `"Ramsay"` to `mr-ramsay` and rebuild. Longest-alias-wins keeps "Mr. Ramsay", "Mrs. Ramsay", "Andrew Ramsay", "Prue Ramsay" and "James Ramsay" intact. All 16 and 17 occurrences listed above refer to Mr. Ramsay; I checked each.
- The two editions have the same gap, so this is not an edition mismatch.

### R7: The source worksheet's modern counts are stale
- **File:** `characters/source-review.md`, "Alias bindings (original/modern render)" lines.
- **Problem:** The worksheet says it was counted against the in-progress `render/B*.json`, not the accepted modern edition. Nine counts differ from the compiled `characters.v1.json` (worksheet modern vs compiled modern):

  | Entity | Alias | Worksheet | Compiled |
  |---|---|---|---|
  | mrs-ramsay | "Mrs. Ramsay" | 243 | 245 |
  | mr-ramsay | "Mr. Ramsay" | 102 | 107 |
  | lily-briscoe | "Lily" | 132 | 135 |
  | james | "James" | 91 | 92 |
  | william-bankes | "Mr. Bankes" | 56 | 57 |
  | charles-tansley | "Charles Tansley" | 36 | 37 |
  | charles-tansley | "Tansley" | 4 | 5 |
  | mrs-mcnab | "Mrs. McNab" | 15 | 16 |
  | rose | "Rose" | 27 | 28 |

- **Proposed:** regenerate the worksheet against `editions/to-the-lighthouse-modern-en.json`. First mentions do not change: every modern-only mention falls after the entity's first mention.

### R8: First-person plural in a Cast summary
- **File:** `characters/to-the-lighthouse-threads.json`, `william-bankes`, chapter `"5"`.
- **Current:** "Mrs. Ramsay decides Bankes should marry Lily. We learn how moved he once was by Mrs. Ramsay's beauty, even over the telephone."
- **Proposed:** "Mrs. Ramsay decides Bankes should marry Lily. Bankes remembers how moved he once was by her beauty, even over the telephone."

### Optional (not counted as defects)
- The modern edition adds glosses naming **Tennyson** (m 4.0@253, m 6.2@167). The original does not name him, so nothing is missing relative to the original. A `tennyson` reference entry bound in modern only would help modern readers.
- "the Macalisters" (o 37.3@1290, m 37.3@1337) is unbound. It is a generic family reference, so leaving it unbound is acceptable.
- All 17 `wikipediaUrl` values are `https://en.wikipedia.org/wiki/To_the_Lighthouse`. This is valid and consistent with the library convention of linking the book article.

## Bindings: false positives

**No false positives in either edition.** Every span's text matches the edition. Each of the following was checked in context in both editions:

- **Rose:** every instance is Rose Ramsay. The lowercase verb and flower "rose" is never bound.
- **Lily:** always Lily Briscoe; "Brisk" is at 9.8.
- **Cam, James, Paul, Andrew, Charles, Augustus:** all refer to the entity.
- **Uncle James:** 16.7 is bound only to `uncle-james`, never to `james`.
- **George:** 28.3 and 28.8 are both Mrs. Bast's son. "George Manning" and "George Eliot" win as longer aliases.
- **William:** all eleven instances are Bankes.
- **Joseph and Mary:** all are the rooks, 16.5–16.9.
- **Mrs. Rayley:** only at 34.10, the maid's "Mrs. Rayley's out, sir". This is correctly Minta, after the marriage.
- **Mr. Rayley** at 10.1 and **Rayley** at 14.8 are Paul.
- **Maggie** at 28.5 is Mrs. McNab (modern glosses it "Mrs. McNab herself").
- **the Owl** at 10.10 is Mrs. Doyle. "the Owl and the Poker" is correctly bound to `doyle-parents`.
- **Swiss girl** (1.12, 5.3, 17.44) is Marie.
- **Scott aliases:** "Sir Walter" (original) and "Sir Walter Scott" (modern), "Scott", and "Waverley novels" at 17.59, 17.60 and 28.3 all correctly refer to Scott.

## Threads (Cast summaries)

All entries were checked against their chapters.

- **Accurate, no future leakage.** Chapter 25 reports only the bracketed notices. Chapter 27 reports only what Mrs. McNab has heard ("died very sudden at the end", 27.0; "Miss Prue dead too … with her first baby", 27.2).
- **Part III entries** mention "ten years" only from chapter 30, where the text gives it.
- **Individually confirmed details:**
  - Macalister does praise James in ch 41 ("He's doing very well," 41.5).
  - "Mrs. Ramsay!" is cried aloud at 34.22 and again at 36.0.
  - Prue asks Andrew to put out the light at 20.5.
  - Mrs. McNab is unsure whether the old gentleman is alive ("Some said he was dead; some said she was dead", 28.4).
- **Length and style:** every entry is 2–3 sentences of plain modern English. The only style exception is R8.

VERDICT: DEFECTS: 8 (0 blocking)
