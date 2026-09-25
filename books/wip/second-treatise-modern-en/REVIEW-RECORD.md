# Second Treatise modern-en: review record

Book `second-treatise`, edition `modern-en`, repair of the served text.
Instruction revision: remote main `8a50db7d`. The book files are identical to
`0a306caf`. The package date is 2026-09-25.

## Process

| Stage | Who | Scope |
|---|---|---|
| Style note, term list, Hooker/Latin policy, § map | coordinator (this session) | whole book |
| Rendering b1 | renderer agent 1 | ch 1–5, revising the prior REAL text |
| Rendering b2 | renderer agent 2 | ch 6–7 |
| Rendering b3 | renderer agent 3 | ch 8–11 (ch 10 revised) |
| Rendering b4 | renderer agent 4 | ch 12–16 |
| Rendering b5 | renderer agent 5 | ch 17–19 |
| Fidelity review r1–r5 | 5 further agents, none of which rendered | ch 1–5, 6–7, 8–11, 12–16, 17–19 |
| Recheck of every post-review edit | a separate agent (no rendering or review) | 30 edited paragraphs, then its own 4 follow-ups |

Every renderer and reviewer was a separate agent context. No reviewer saw the
renderer's reasoning; each worked from the source, the candidate and the style
note. No external API was called and no mechanical or regex rendering was used.
Helper scripts (JSON assembly, checks, gate runner) live in the session
scratchpad, not in the repository.

## Review coverage and results

The sample is `REVIEW-SAMPLE.json` (seed 1689). It covers the first and last
paragraph of every chapter, every Hooker, Barclay and footnote paragraph, the
§2 repair, both leaked-label paragraphs, and a random fill to about 35% of
each chapter. Reviewers were told to read further, and most read whole
chapters.

| Review | Chapters | Paragraphs compared | Major | Minor | Notes | Verdicts |
|---|---|---|---|---|---|---|
| r1 | 1–5 | 45 | 0 | 6 | 5 | 1 pass, 2 pwf, 3 pwf, 4 pass, 5 pwf |
| r2 | 6–7 | 49 (all) | 0 | 7 | 8 | 6 pwf, 7 pwf |
| r3 | 8–11 | 43 | 0 | 7 | 15 | 8 pwf, 9 pass, 10 pass, 11 pwf |
| r4 | 12–16 | 56 (all) | 0 | 5 | 12 | 12 pass, 13 pwf, 14 pass, 15 pwf, 16 pwf |
| r5 | 17–19 | 31 + most of ch 18–19 | 0 | 6 | 7 | 17 pass, 18 pwf, 19 pwf |

(pwf = pass with fixes.) Each reviewer checked four things: omissions,
reversals, dropped conditions and qualifications, and term drift. Each also
scanned its chapters for "possessions", "legislature", "natural state", "state
of warfare" and leftover archaisms. Every "possessions" in the candidate
matches a "possession(s)" in Locke. Broad-sense "property" is never replaced.
"legislature" appears once, where Locke himself writes it (ch 7 p19). The
Latin (ch 19 p27 tail, p33 phrase, p34, p37, p38) was verified by program to be
character-identical to the source.

**All 31 minor findings were fixed or resolved.** The findings are in
`reviews/review-r*.json`, and each entry carries its suggested fix. Two
findings were resolved by an explicit policy instead of a text change: glosses
on Latin were removed, and Scripture references were kept in Locke's form (see
the addendum to `STYLE-NOTE.md`). The recheck
(`reviews/recheck-postreview.json`) confirmed 26 of the 30 edits and found 4
problems: new tense drift in ch 8 p16, a sentence fragment in ch 19 p42, a
split causal clause in ch 7 p19, and a "though" that had been missing since
rendering in ch 8 p13. All four were fixed using the rechecker's wording. Its second pass
confirmed 4 of 5 and asked for one more punctuation change in ch 8 p13 (a
dash to a comma), which was applied exactly as given. The result is recorded
in the same file.

## Source corrections (Gutenberg #7370 → rendered reading)

Indexes are 0-based paragraph positions within the chapter.

| Where | Source | Rendered as | Basis |
|---|---|---|---|
| last paragraph of ch 1–18 | truncated mid-word, e.g. "public g", "housh", "usur", "would let" | completed | `books/raw/second-treatise/raw.txt` has the full endings. **The served original-en has the same truncation; see the integration notes.** |
| ch 4 p3 | "…set him free, Exod." | "(Exod. xxi.)" | raw.txt |
| ch 1 p6 (§2) | "distinguish these powers one from wealth, a father…" | "…one from another, and show the difference between a ruler of a commonwealth, a father…" | standard reading; the old modern-en already had it |
| ch 2 p8, ch 19 p12 | leaked labels "Sect, 10." and "Sec. 219." | dropped (section content kept) | the served convention strips all § labels |
| ch 5 p21 | "feed to be sown" | "seed" | misprint |
| ch 6 p1 | "founded but oddly" | "sounded" | long-s misreading |
| ch 7 p2, p15, p16, p20 | "thisconjunction", "inconviency", "govemment" | read correctly | OCR |
| ch 7 p21 | truncated "Hooker, ib" | full citation, book I, section 10 | the ibid. points to the preceding note |
| ch 8 p9, p11 | "1. i. c. 25", "1. iii. c. 4" | book I / book III | OCR of "l." |
| ch 8 p21 | "lure Divino" | "jure divino" | OCR |
| ch 9 p9 | "whatsoever he thought for the preservation" | "thought fit" | dropped word (compare p7) |
| ch 11 p2 | "such men" (Hooker) | "since" | Hooker's "sith" |
| ch 11 p6 | "propperties" | "properties" | typo |
| ch 12 p2 | "as such as governed" | "are governed" | standard reading |
| ch 13 p7 | "eminent hazard" | "imminent danger" | period spelling |
| ch 14 p9 | "made a right use of one answer:" | "…used rightly? I answer:" | standard reading |
| ch 19 p35 | "desire for his pains" | "deserve" | standard reading |

## Open issues (not resolved in this package)

1. **ch 17 p1 (§198) duplicated clause.** Gutenberg gives "the anarchy being
   much alike, to have no form of government at all; or to agree that it
   shall be monarchical, but to appoint no way to design the person…" twice.
   The second has "know or design". Reviewer r5 believes that the corrected
   text prints it once, but was only fairly confident and worked from memory.
   The candidate renders both occurrences to keep 1:1 fidelity with the served
   original-en. Settling this needs a check against a pinned critical edition.
2. **ch 16 p6 is Locke's own anacoluthon.** raw.txt confirms that the source
   sentence has no main clause, so this is Locke, not corruption. It is rendered
   "But we should consider that…", which is grammatical and adds no claim.
3. **ch 11 p2 "Ibid.)" and ch 11 p8 "Ibid., book I, section 10."** keep
   Locke's ibid. references. ch 7 p21 gives the full citation because the
   source is truncated there. This inconsistency is cosmetic.
4. **Per-batch gate for ch 17–19** reports identical long paragraphs at 3/58 =
   5.2%, just over the 5% line. All three are Latin paragraphs (ch 19 p34, p37,
   p38) that are verbatim by policy. The whole-book gate passes at 1.4%.
