# Independent Fidelity Review — Jerusalem (Part I) Completeness Repair

Reviewer: independent adversarial pass, worked from source text and live/candidate JSON
before reading RELEASE-PACKET.md or the other pre-written summary artifacts.

## Source verification

Fetched `https://www.gutenberg.org/cache/epub/15837/pg15837.txt`.
SHA-256: `cc5df0ba5e17cba5dbfebc6ce71eeb0571d8910a9e981df97cd84dcd1ebcff98` — **matches** the
value given in the task.

Line 6474 of that file is:

```
6473: "That which is needed to make life as easy as death is UNITY,
6474: UNITY, UNITY."
```

This is plainly the second half of a two-line quotation ("...is UNITY, / UNITY, UNITY.")
inside an ordinary narrative paragraph — not a chapter heading. Claim confirmed against
source.

## Defect 1 — chapter split ("UNITY, UNITY." mis-parsed as a heading)

**Live served state (`app/public/data/editions/jerusalem-original-en.json`)** — confirmed
exactly as claimed:
- 18 chapters.
- Chapter 9 ("Book Three — Loss Of L'Univers") ends with the truncated paragraph:
  `"That which is needed to make life as easy as death is UNITY,` (quote left open, no
  closing quotation mark, missing "UNITY, UNITY.").
- Chapter 10 is titled **"Unity, Unity."** (11 paragraphs) and begins with unrelated
  narrative content ("It seemed to her that the Lord of all the earth had converted these
  noises...") that is in fact the direct continuation of chapter 9's cut-off sentence.
- Chapters 11–18 follow after that spurious break.

**Candidate (`books/wip/jerusalem-completeness-repair/editions/{jerusalem-original-en,jerusalem-modern-en}.json`)**:
- Both files are well-formed JSON (parsed successfully with `json.load`).
- Both now have **17 chapters**.
- Chapters 1–8 are byte-for-byte identical to the live file (paragraph arrays compared
  programmatically, no diffs).
- Chapter 9 in the candidate has 86 paragraphs = 75 (live ch.9) + 11 (live ch.10),
  concatenated with the two sentence-halves stitched into one paragraph:
  `'"That which is needed to make life as easy as death is UNITY, UNITY, UNITY."'`
  (original-en) — a complete, correctly quoted sentence. All paragraphs before and after
  the join were compared index-by-index against the live files: **zero paragraphs lost,
  duplicated, or reordered** in the merge.
- Live chapters 11–18 map exactly (programmatically verified, no diffs) onto candidate
  chapters 10–17, i.e. everything from the old chapter 11 onward correctly shifted down
  by one, titles included.
- Chapter 9's title ("Book Three — Loss Of L'Univers") is left unchanged and still fits
  the merged content (it's the continuation of the same shipwreck scene).
- The 17-chapter modern-en candidate has matching per-chapter paragraph counts with
  original-en for **all 17 chapters** (verified: 308/308, 63/63, 42/42, 202/202, 65/65,
  149/149, 122/122, 236/236, 86/86, 95/95, 18/18, 20/20, 43/43, 112/112, 110/110, 21/21,
  95/95 — all equal).

**Verdict on the core mechanics of Defect 1: correct.** No lost/duplicated/reordered
paragraphs, correct renumbering, complete quote.

### Defect found in Defect-1's implementation: stale `sections` metadata (BLOCKING)

Both candidate files carry a top-level `sections` array used for Book/TOC navigation.
It was **not updated** to match the new 17-chapter structure:

```json
{
  "title": "Book Three",
  "chapters": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
}
```

This is unchanged from the live (18-chapter) file's `sections` block. The candidate's
`chapters` array only goes up to chapter 17 — **chapter 18 no longer exists** in the
candidate, so `sections[2].chapters` (Book Three) still lists 10 chapter numbers (9–18)
for what is now a 9-chapter book (9–17). Any UI/TOC code that iterates this `sections`
array (e.g. to build a Book Three chapter picker, or to validate/jump to "chapter 18")
will either show a phantom entry or fail to resolve chapter 18. This is a direct,
mechanical consequence of the renumbering that was missed in both
`jerusalem-original-en.json` and `jerusalem-modern-en.json` candidates. It must be fixed
(Book Three's `chapters` array should read `[9,10,11,12,13,14,15,16,17]`) before this is
release-ready.

### Minor, non-blocking observation near the fix boundary

In the candidate modern-en, chapter 9's merged paragraph renders the triple "UNITY" as
"UNITY, UNITY!" (two repetitions, exclamation mark) instead of "UNITY, UNITY, UNITY."
(three repetitions, period) as in original-en/candidate original-en. This is a
stylistic modernization choice, not a structural defect in the split fix, and not one of
the 17 flagged paragraphs — but it does slightly blunt the rhetorical emphasis of the
book's central refrain ("unity" repeated three times) right at the fix site. Flagging for
awareness, not blocking.

## Defect 2 — 17 truncated + fabricated modern-en paragraphs

For each of the 17 claimed coordinates, I read the full **live served** original-en and
modern-en paragraphs independently, then the **candidate** modern-en paragraph at the
same coordinates (chapters 1, 3, 5, 6, 7, 8 are unrenumbered, so live and candidate
indices for these locations coincide).

### Live served defect — confirmed at all 17 locations

All 17 live modern-en paragraphs are meaningfully shorter than their original-en
counterparts, and in most cases the modern-en text does not merely stop early — it
substitutes different, invented content not present in original-en at that point.
Representative confirmed fabrications (not exhaustive):

- **1.11**: invents "But father says: 'Come in, come in! There is always room for an
  Ingmarsson.'" — not in the original at all.
- **1.17**: invents "'She didn't want you?' 'No.'"
- **1.24**: invents a wholly different exchange ("surely you didn't let the law take its
  course?" / "I reported it to the sheriff... arrested and charged with murder") replacing
  the original's actual dialogue (child in prison for three years, discussion of Ingmar's
  standing in the parish).
- **1.103**: invents a physical description of Ingmar ("small eyes... big red nose... fat
  underlip") and an address ("Mother Martha") absent from the original.
- **1.109**: invents "'No, I'll never see the place again,' she said, and looked as if she
  might collapse."
- **3.33**: invents "They saw a brilliant light and angels swinging their censers... music
  as beautiful as the ringing of silver bells" — this directly **contradicts** the
  original, which states explicitly "what they saw they have never divulged to a soul."
- **5.21**: invents "or there is plague in the country" replacing the original's "or
  perhaps some poor creature has fallen into the river and been drowned."
- **5.22**: invents "We could hardly believe it, but then it happened again" replacing the
  original's specific detail (preaching for two Sundays, neighbours urging him to come).
- **5.50**: invents "It felt like the start of all over again—the commotion over the
  mission house four years earlier. He decided he had heard enough," none of which is in
  the original.
- **7.13**: invents/distorts "Some folk thought he might be someone from America,"
  collapsing and altering the original's more specific claim (the woman, not the man, was
  recognized as one of Strong Ingmar's daughters who emigrated and married in America).
- **8.148**: invents "thick with white blossoms... Gertrude stood in a rain of blossoms"
  — the original explicitly says the bushes were "thick with newly sprung leaves," not
  blossoms; this is an invented and contradictory image.

Other locations (1.115, 5.0, 5.8, 6.59, 7.7, 8.47) show truncation with a paraphrased
close that is less flagrantly invented but still cuts real dialogue/content. The claim's
characterization ("truncated AND, in several cases, fabricated") is accurate.

### Candidate modern-en — verified complete and faithful at all 17 locations

For every one of the 17 coordinates, the candidate modern-en paragraph:
- Is close in length to the original-en paragraph (length ratios ranged 0.89–1.02 across
  all 17, vs. the live file's 0.16–0.65 range at the same spots).
- Covers every plot beat and line of dialogue present in the original (verified by
  reading both side by side for each of the 17 — e.g. 1.24 now correctly includes the
  child being strangled, the three-year prison sentence, Ingmar's standing in the parish,
  and the "proud, not bad" exchange; 3.33 now correctly preserves "what they saw they have
  never divulged to a soul"; 8.148 correctly restores "newly sprung leaves" rather than
  invented blossoms).
- Reads as a genuine sentence-by-sentence modern-English rendering (not a summary) with
  no invented dialogue or plot points introduced.

**Verdict on Defect 2's 17 listed locations: correct and complete.** All 17 fixed
paragraphs in the candidate are faithful, full-length, non-inventive translations.

### Spot-check: other paragraphs with the same pattern, not caught by this repair

Per the task's instruction to spot-check nearby/other chapter 1–9 paragraphs for the same
truncation+fabrication pattern, I scanned all paragraphs >200 chars in chapters 1–9 for a
candidate-modern-en/candidate-original-en length ratio notably below 1 (using the 17 known
fixes, which came in at 0.89–1.02, as a calibration baseline) and manually read the
outliers. Ratio ≈0.57–0.65 (clearly a different, milder profile than the ~0.9+ fixed
locations, but still worth a manual read) turned up at:

- Chapter 1: paragraphs 8, 16, 20, **21**, 47
- Chapter 4: paragraph 9
- Chapter 5: paragraphs 12, 36
- Chapter 7: paragraph 0

None of these are among the 17 claimed/fixed coordinates, and this candidate repair does
not touch them. Manual reading confirms several show the same defect class:

- **Chapter 1, paragraph 21 — most serious finding of the spot-check.** The original has
  Little Ingmar's mother revealing that Brita is pregnant ("Mother said it was because she
  was with child, and she would surely be her old self again once that was over with"),
  the plot detail that sets up the strangled infant / prison sentence recounted a few
  paragraphs later (the fixed 1.24). The candidate modern-en instead invents: *"I put up
  with it all through the summer and fall, but one day I said that I thought it would be
  best for us to part. Then she cried and begged me not to send her away, so I let things
  go on as before."* This is not a compressed paraphrase — it is a different, invented
  scene (a near break-up) that omits the pregnancy reveal entirely and is inconsistent
  with the following, correctly-fixed 1.24 paragraph. This is the same truncation +
  fabrication defect class as the 17 fixed locations, left uncaught, and it is more
  consequential than most of the 17 because it removes a load-bearing plot point.
- **Chapter 5, paragraph 12**: candidate invents a specific quoted text — *"a painted
  text: 'Are your windows open toward Jerusalem?'"* — that does not appear anywhere in
  the original at this point (original describes "highly illuminated Bible texts,
  embellished with flowers and heavenly trumpets and bassoons" plus an oleograph of the
  Good Shepherd; no such quoted line exists there). Thematically apt to the novel's title,
  but fabricated.
- **Chapter 1, paragraph 8**: invents a direct quote ("'It's Big Ingmar I should talk this
  over with,' he murmured") not present in the original at that spot.
- **Chapter 1, paragraph 47**: invents "There was a rumor that a great farmhouse in the
  parish was to be painted that year" (not in the original, which has the painter
  discover the farm on his own and exclaim "Great Caesar!" — that vivid quoted exclamation
  is dropped).
- Chapter 1 paragraphs 16 and 20, and Chapter 7 paragraph 0, show truncation with a
  substituted (rather than merely omitted) closing line, though less severe/plot-altering
  than 1.21 or 5.12.
- Chapter 4 paragraph 9 and Chapter 5 paragraph 36 are truncated but end on a legitimate
  partial-original clause rather than inventing new content — closer to ordinary
  compression than fabrication.

**This is explicitly out of scope for accepting or rejecting the two claimed fixes**
(the task states the book's broader modern-en fidelity gate is a separate, disclosed,
out-of-scope issue, and these are not among the 17 coordinates this candidate claims to
repair). I am not treating these as reasons to reject the two specific fixes under
review. However, they are worth flagging prominently, especially chapter 1 paragraph 21,
because it shows the "17 locations" list is not an exhaustive catalog of this exact
defect pattern even within the same early chapters, and the pregnancy-reveal omission is
a real content/plot-fidelity problem sitting a few paragraphs away from a location this
same repair did fix.

## JSON well-formedness / paragraph-count validation

- `books/wip/jerusalem-completeness-repair/editions/jerusalem-original-en.json` — valid
  JSON.
- `books/wip/jerusalem-completeness-repair/editions/jerusalem-modern-en.json` — valid
  JSON.
- Both have 17 chapters.
- Per-chapter paragraph counts are equal between original-en and modern-en for all 17
  chapters (verified programmatically, see Defect 1 section above).

## Overall verdict

**DO NOT ACCEPT as-is — one blocking defect, plus a disclosure gap worth flagging.**

The two specific fixes this candidate claims are themselves executed correctly:
1. The chapter-9/10 split is correctly merged, chapters correctly renumbered 1:1 with no
   paragraph loss/duplication/reordering, and paragraph counts match between editions for
   all 17 chapters.
2. All 17 listed modern-en paragraphs are now complete, faithful, non-inventive
   renderings of their original-en counterparts.

But:
- **Blocking**: the top-level `sections` metadata in both candidate files was not updated
  for the new 17-chapter structure — "Book Three" still lists chapters 9–18, referencing
  a chapter (18) that no longer exists in the candidate. This must be corrected
  (`[9,10,11,12,13,14,15,16,17]`) before merge/publication, in both
  `jerusalem-original-en.json` and `jerusalem-modern-en.json`.
- **Flag, not blocking for this narrow repair, but should be recorded**: a spot-check of
  nearby chapter 1–9 paragraphs found at least one clearly analogous
  truncation-plus-fabrication instance the repair did not catch and that materially
  affects plot continuity (chapter 1, paragraph 21 — the dropped pregnancy reveal), plus
  a smaller number of milder instances (chapter 1 paragraphs 8, 16, 20, 47; chapter 5
  paragraph 12). These sit within the disclosed, out-of-scope broad modern-en quality
  issue, so they do not by themselves invalidate this narrow repair, but the packet should
  not claim (if it does) that the 17-item list is an exhaustive inventory of this specific
  defect pattern.

Recommendation: fix the `sections` metadata in both candidate files, note the additional
chapter-1/5 fabrication instances found in this review for a future pass, and then this
narrow repair is fit to merge.
