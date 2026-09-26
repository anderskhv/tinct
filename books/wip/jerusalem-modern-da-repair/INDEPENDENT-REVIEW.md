# Independent Review — Jerusalem, modern-da whole-edition repair

Reviewer: independent pass, formed before reading `RELEASE-PACKET.md`,
then compared against it.

## Verdict: DO NOT ACCEPT (yet)

The structural fix and the 61 paragraphs the package claims to have
retranslated are all correct and faithful. But this review's own
independent whole-edition sample — deliberately using a different
method than the package's own length-ratio/digit-token scan — found
**10 additional genuine defects (fabrications and dropped content) in
paragraphs the package left untouched**, several of them plot-relevant.
This means the package's whole-edition fidelity claim cannot be relied
on as exhaustive. The book should not ship until these are fixed and a
further pass is done, given how many turned up in a comparatively small
sample.

## 1. Structure — PASS

- 17 chapters, 1787 paragraphs total, per-chapter counts match
  `jerusalem-modern-en.json` exactly: 308, 63, 42, 202, 65, 149, 122,
  236, 86, 95, 18, 20, 43, 112, 110, 21, 95.
- `sections` array: `Book Three` reads `[9,10,11,12,13,14,15,16,17]`. Correct.

## 2. Merge seam (end of ch. 9 / start of ch. 10) — PASS

Read the last four and first three paragraphs across the boundary.
Continuous narrative (the *L'Univers* sinking into the "old woman
walking to church" vignette that opens the Hellgum's-letter chapter),
no repetition, no discontinuity. The previously-truncated quote is now
complete and correctly rendered:

> »Det, der skal til for at gøre livet lige så let som døden, er ENHED,
> ENHED, ENHED!«

matching the corrected English's "UNITY, UNITY, UNITY," in the same
place (Mrs. Gordon's drowning vision, ch. 9 idx 74). Live (defective)
Danish had only "ENHED, ENHED!" (twice) — this is a genuine, correctly
executed fix, additional to the 61 claimed (it's part of the structural
merge, not double-counted).

## 3. The 61 claimed retranslated paragraphs — PASS

Reconstructed the full retranslated-paragraph set independently by
diffing the candidate against the live (old-structure) Danish file via
`PARAGRAPH-MAP.json`, rather than trusting the package's own list. Found
exactly 56 paragraphs where candidate Danish text differs from live
Danish text. These 56 break down as:

- 20 of the "28 known" locations (ch. 3: 16, 35, 36; ch. 5: 16, 17, 38,
  40, 41, 42, 43, 45, 46, 49, 50, 51, 53, 56, 57, 58, 60) actually
  differ from live text — all read faithful and complete against
  `jerusalem-modern-en.json`, matching every plot point, name, number
  and quoted line I checked (Big Ingmar's death scene, the mission-house
  dispute).
- The remaining 8 of the "28 known" locations (ch. 5: 39, 44, 47, 48,
  52, 54, 55, 59) turn out to be byte-identical between candidate and
  live — i.e. the Danish text at those specific coordinates was already
  faithful (matches the corrected English closely), so "retranslating"
  it reproduced equivalent text. Not a defect; the package's claim that
  "it did [carry the defect], at all 28 locations" is imprecise but
  harmless.
- 33 further diffs matching the package's claimed "33 more" — all read
  as faithful restorations against the corrected English (chapters 1,
  3, 4, 5, 6, 7, 8), including a fabricated-schoolmaster-thought fix in
  ch. 5 idx 12 (added illustrated Bible-verse border / Good Shepherd
  print, correctly restoring dropped detail) and several Karin/Halvor
  courtship-letter paragraphs in ch. 1.
- 3 incidental diffs not part of the "61": the merge-seam quote
  completion (ch. 9 idx 74, covered above) and two name-consistency
  fixes (old ch. 11 idx 12, 27 — old live Danish alternated between
  "Kuglegunner" and "Bullet Gunner" for the same character, 6 vs 2
  occurrences; candidate is consistently "Bullet Gunner" throughout, 8/8).

20 + 33 + 3 = 56, which reconciles exactly with the package's own count
(28 known, of which 8 needed no actual text change, + 33 new = 61
"retranslated," 56 of which produced an actual text diff). No problems
found in any of the 61 claimed fixes.

## 4. Independent whole-edition fidelity sample of the ~1731 untouched paragraphs

The package's own scan was a 100%-coverage length-ratio + digit-token
automated scan plus a ~25% manual stride sample. Per the task, I used a
**different mechanism** rather than a different stride of the same
idea: for every paragraph, I compared (a) digit/number tokens, (b) a
crude sentence-count split, and (c) proper-noun capitalization sets,
between the candidate Danish and the corrected English, across **all
1787 paragraphs** (100% automated coverage, not a sample), specifically
to catch same-length paraphrases with altered facts, names, dialogue,
or motivations — the class of defect a length-ratio scan is blind to.

- Number-token check (100% of paragraphs): 1 mismatch, a false
  positive (Danish "1880'erne" vs English "the early eighteen-eighties"
  — same fact, numeral vs spelled out). No real number/date/count
  fabrications found.
- Sentence-count-mismatch flag (≥2 sentences different, same-ish
  length): 43 paragraphs flagged across chapters 1, 2, 4, 6, 7, 8, 9,
  10, 12. I manually read all 43 against the corrected English, and
  followed up ambiguous cases against `jerusalem-original-en.json` (the
  literal-translation ground truth) to confirm intent. I also ran a
  second, lower-threshold pass (≥1 sentence different) restricted to
  chapter 4 (where the first pass had found a cluster of problems) and
  spot-checked several more paragraphs there.

This turned up **10 genuine defects, all confirmed byte-identical
between the live (defective) file and the candidate — i.e. pre-existing
defects the repair did not catch or fix**:

1. **Ch. 4, idx 6** (0-based) — plot-altering fabrication. Candidate:
   the Halvor/Karin engagement is broken because Big Ingmar dies and
   Karin must run the farm ("Nu er far død, og jeg kan ikke overlade
   gården til de yngre børns omsorg"). Corrected English and the
   original-English ground truth: the engagement is broken **before**
   Big Ingmar's death, because Karin gets cold feet after Halvor got
   drunk once and she fears he'll turn out like his alcoholic father —
   a trip to Falun for the wedding ring, Big Ingmar's advice to Karin,
   Halvor being "dismissed." This is a different causal chain for a
   plot point, not a paraphrase.
2. **Ch. 4, idx 130** — fabricated dialogue. Candidate has Karin
   uttering a despairing interior monologue ("Endnu en sommer!...
   sorg og skam, dag ud og dag ind" — "Another summer!... sorrow and
   shame, day in day out"). Both English versions instead describe her
   practical dread of the specific spring workload ahead (sowing,
   haymaking, baking, cleaning, weaving, sewing) — no such quoted
   despair line exists in the source.
3. **Ch. 4, idx 172** — dropped content. Candidate ends after Karin's
   wish that Halvor had waited longer; both English versions have two
   further sentences ("Why does he have to be in such a rush?... Surely
   he must know I don't want anyone but him.") that are simply absent
   from the Danish.
4. **Ch. 4, idx 191** — fabricated closing line. Candidate ends with an
   invented rhetorical question ("Du, som har stået ved en drukkenbolts
   sengekant i alle disse år — skal du give efter for en flok
   sladderhanke?"). Both English versions end instead with Karin
   recalling her father's actual saying: "The Ingmarssons need have no
   fear of men; they have only to walk in the ways of God" — a named,
   quoted family motto, replaced with different invented content.
5. **Ch. 4, idx 39** — dropped content. Candidate cuts the paragraph
   after Halvor ignores little Ingmar's handshake; both English
   versions have two more sentences (Ingmar sitting down, sighing "just
   as Karin had done").
6. **Ch. 4, idx 116** — altered characterization/motivation. Candidate
   has Elof feeling jealous that Big Ingmar's memory is associated with
   Halvor rather than himself. Both English versions instead have Elof
   not begrudging Halvor the watch at all, just privately amused at
   everyone's solemnity over "a battered old silver watch" — a
   different motivation invented for the same character in the same
   scene.
7. **Ch. 4, idx 196** — dropped content. Candidate ends after Karin's
   declaration to the wedding guests that she'd rather marry Halvor;
   both English versions have a further quoted sentence ("She paused to
   steady her voice, then finished: 'Say what you like about it, but
   Halvor and I have done nothing wrong.'") that is missing from the
   Danish.
8. **Ch. 6, idx 0** — dropped detail. Candidate says only that Ingmar's
   20,000 kronor "was also lost" ("var også tabt"). Both English
   versions specify Elof was "sole trustee" of the money and give two
   competing rumors about what happened to it (buried it / gave it
   away) — dropped, not fabricated, but a specific factual detail is
   missing.
9. **Ch. 7, idx 72** — fabrication by addition. Candidate adds an
   entire extra passage not present in either English version:
   "Vi har profetiens gave, tungegaven, helbredelsens gave,
   fortolkningens gave. Men disse ting ville jeg aldrig have kunnet nå
   alene — aldrig, Halvor! Jeg har altid haft brug for andres støtte for
   at vandre retfærdighedens vej." Both English texts end this Hellgum
   speech mid-list ("...others still heal the sick—"), deliberately cut
   off; the Danish invents a false completion and additional sentiment
   with no source counterpart.
10. **Ch. 8, idx 49** — dropped content. Candidate ends the paragraph
    after "...she can hardly be expected to look cheerful," omitting the
    closing quoted line present in both English versions: "'I'd like to
    give them a good beating!' said the old man."

All 10 are confirmed byte-identical between the live defective file and
the candidate (checked programmatically), meaning the repair's own
scan — 100% automated length-ratio/digit-token plus ~25% manual stride
— did not catch any of them. Several (1, 2, 4, 6, 9) are exactly the
"same-length paraphrase with altered facts/dialogue/motivation" failure
mode the automated scan structurally cannot catch, since none of them
show an outlier length ratio.

Six of the ten defects cluster in chapter 4 (the Karin/Halvor courtship
and remarriage storyline) — notably in the immediate vicinity of
paragraphs the repair DID fix correctly (idx 8, 9, 73, 76 in the same
chapter are among the "33 new" fixes and read faithfully). This strongly
suggests the repair's coverage of chapter 4 specifically was incomplete
rather than that these are isolated one-offs — i.e., a further pass
focused on chapter 4 in particular, and a broader look at other
chapters using a fact/dialogue-comparison method rather than
length-ratio, is warranted before this can be considered a genuine
whole-edition fidelity repair.

No other clear defects were found in the ~30 additional flagged
paragraphs read across chapters 1, 2, 6, 7, 8, 9, 10, 12 (idx 18, 138,
210, 1, 11, 28, 34, 50, 0, 1, 6, 37, 41, 65, 128, 136, 139, 1, 29, 54,
58, 26, 150, 182, 187, 36, 39, 40, 44, 46, 83, 84, 21, 6, 11, 16 per
chapter) — these read as normal modernization paraphrase (sentence
splitting/combining, contraction, minor synonym swaps) with full
content and fact preservation.

## Coverage note

This review's fact/dialogue-comparison method ran over 100% of the
book's paragraphs (not a sample) for the number-token check, and the
sentence-count heuristic likewise ran over all 1787 paragraphs, with 43
paragraphs manually read in full against both English editions, plus a
further chapter-4-focused low-threshold pass and spot checks. This is a
different mechanism from the package's own length-ratio/digit-token
scan and 25% manual stride, as requested, and it independently surfaced
defects that scan missed — which is itself evidence the remaining
~1700 or so paragraphs not covered by either this review's manual reads
or a fact-comparison pass should not be assumed clean.

## Recommendation

1. Fix the 10 defects listed above (retranslate fresh from
   `jerusalem-modern-en.json`, matching the register of the surrounding
   already-fixed paragraphs).
2. Do a further, more careful fidelity pass on chapter 4 specifically —
   the concentration of problems there (6 of 10 new defects) is a
   pattern, not noise.
3. Do not publish on this pass. Once the above is done, this reviewer
   would expect a smaller follow-up spot-check (not necessarily a full
   third whole-edition pass) to confirm, then accept.

Everything else — structure, merge seam, the UNITY quote, the 61
originally-claimed retranslated paragraphs, and the name-consistency
cleanup (Kuglegunner → Bullet Gunner) — is sound and does not need
further work.
