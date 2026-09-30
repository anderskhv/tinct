# Aristotle Politics — incomplete content checkpoint

**NOT READY FOR INTEGRATION. Whole-book gate FAIL.**

## Ownership and provenance

- Repository: anderskhv/tinct.
- Branch: content/modern-en-repair-r8.
- Owned path: books/wip/modern-en-repair-r8/aristotle-politics/.
- Instruction revision inspected: origin/main ab3cc43f2687e6682833db6a66182d150788ffa4.
- Checkout starting revision: 70defe6ef. Existing unrelated changes were preserved and excluded from this checkpoint.
- Original and modern baselines were copied from app/public/data/editions/. Their bytes were verified identical to origin/main at the instruction revision above.
- The staged original is unchanged. The initial modern edition is preserved as aristotle-politics-modern-en.before.json.
- No new source or translation was imported. Rewriting used the pinned original-en only.
- No scripts, configuration, registry, application files, live editions, or synced project references were changed. No deployment, external generation API, or Anthropic API use.

## Changed coordinates and remaining work

Coordinates are one-based chapter/paragraph indices in the edition JSON; chapter entries are Books 1–8, not the smaller sections within them.

| Chapter | Changed paragraphs | Status |
|---|---|---|
| 1 | 24 | Required exception: identical paragraph over 40 words; every other paragraph retained verbatim from modern baseline |
| 2 | 1–75 | Entire chapter rewritten and gate passes |
| 6 | 1–27 | Entire chapter rewritten and gate passes |
| 8 | 1–26 | Entire chapter rewritten and gate passes |

The machine-readable list is changed-paragraphs.json (129 coordinates, original/candidate word counts and ratios). Books 3, 4, 5, and 7 remain byte-for-byte unchanged from the initial modern edition and still require complete rewriting. Book 7 paragraph 33 is the sole remaining identical source paragraph over 40 words. Resume at **Book 3, paragraph 1**. Do not restart Books 2, 6, or 8. No chapter is partly rewritten, apart from the explicitly required isolated exception in otherwise-REAL Book 1.

## Gates

| Measure | Before | Current checkpoint | Required |
|---|---:|---:|---:|
| Weighted similarity | 0.876 | 0.723 | <=0.75 |
| LIGHT + MECHANICAL | 7/8 (87.5%) | 4/8 (50.0%) | <=5% |
| Identical long paragraphs | 4/473 (0.8%) | 1/473 (0.2%) | <=5% |
| Wrapped scaffolding | 0 | 0 | 0 |
| Truncated quotations detected | 0 | 0 | 0 |
| Whole-book outcome | FAIL | FAIL | PASS |

Individual repaired chapter gates: Book 2 0.347 PASS; Book 6 0.331 PASS; Book 8 0.332 PASS. These are REAL-HEAVY under the classifier, whose word sequence similarity is an instrument rather than a semantic acceptance verdict. Book 1 is still REAL at 0.840.

Exact whole-book invocation used:

```text
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r8/aristotle-politics/aristotle-politics --gate --per-chapter
```

The initial required per-chapter classification was also run against aristotle-politics before copying the two live files. Full reports are in gate-before.txt and gate-after.txt; individual reports are in gate-book-02.txt, gate-book-06.txt, and gate-book-08.txt.

Structure checks: 8 chapters, 478 paragraphs, with counts [46, 75, 78, 69, 82, 27, 75, 26] in both editions. All chapter and edition metadata preserved. Every changed paragraph is >=75% of source words; minimum ratio 0.750000. Candidate JSON parses successfully. No new paragraph merges, splits, or omissions. All rewritten content was composed sentence by sentence; no regex, dictionary substitution, or automated paraphrase pass was used.

## Spot-reads

- Book 1 paragraphs 1–3 retain the existing account of political community, kinds of rule, and analysis into parts. Paragraph 24 retains the distinction based on goodness/badness, the human/animal reproduction analogy, and nature's failure to achieve its aim.
- Book 2: opening inquiry (p1), common-land dilemma (p37), and concluding legislator (p75) checked. The dilemma retains all alternatives: soldier-farmers, an unrepresented fourth class, or farmers supporting two households. Named examples throughout the chapter were kept, including Dicaea, Eubulus/Autophradates/Atarneus, Pheidon, Hippodamus, Phaleas, and Androdamas.
- Book 4 paragraphs 1–3 were spot-checked as unchanged pending material. Their discussion of a science of constitutions remains a light rendering and is not accepted as completed work.
- Book 6: p1's retrospective scope, p14's distinction between founding and preserving democracy, and p27's complete office taxonomy checked. P14 retains sacred rather than public confiscation proceeds and penalties against unfounded prosecutions. P27 retains religion, military, financial, market, territorial, judicial, record, enforcement, prison, audit, deliberative, educational, and festival offices, and the aristocratic/oligarchical/democratic distinction.
- Book 8: first three paragraphs, the emotional effects of music (p15–16), and the concluding principles (p26) checked. Leisure remains the purpose of activity, not mere amusement. The final argument retains age, relaxed melodies, Socrates, the Lydian, and the mean/possible/fitting triad. The Homer/Odysseus, Musaeus, and Euripides quotations were rendered without ellipses or summarized-away clauses.
- Longer paragraphs were reread against the displayed source during composition. Word-floor failures were expanded with their own source detail before validation. No independent semantic reviewer was used.

## Known issues and editorial limits

1. Four LIGHT chapters remain (56,145 source words). The whole book is not accepted and must not replace the live modern edition.
2. The pinned original contains OCR debris, embedded editorial notes, damaged Greek references, page headings, lost clause openings, and sentences divided across paragraph boundaries. The source copy was not altered. New prose removes non-content page furniture while retaining substantive notes and all paragraph boundaries; broken Greek readings remain in some bracketed notes. This source apparatus needs editorial review before final acceptance.
3. In Book 2, paragraph continuations include 17/18, 19/20, 32/33, 34/35, 39/40, 42/43, 44/45, 45/46, 67/68, and 70/71. Book 6 and Book 8 also retain inherited continuation boundaries. These are existing paragraph divisions, not new truncations or missing quotations.
4. Minimal grammatical connections were supplied where OCR had lost them: for example the Carthaginian transition in Book 2 p60, Phaleas in Book 2 p73, the retrospective sentence in Book 6 p3, and Book 8 p8's final contrast and p15's imitation/reality transition. These require final source review; no claim is made to have verified a separate scan.
5. Proper names follow the pinned source, including its form 'Diodes' and the title 'Tales'. Suspected source errors were not silently replaced from another edition. Book 2 p25 preserves the source's concluding 'democracy and monarchy' despite the surrounding oligarchy discussion.
6. The classifier detects certain ellipsis-based quotation truncations only. Zero flagged quotations is not an independent proof of complete textual fidelity. Remaining chapters and inherited source damage still require review.
7. books/characters/aristotle-politics/ **does not exist** in this checkout. No character files were created or changed; publication compatibility remains for a later integration task.

8. Seven unchanged paragraphs in pending chapters are already below the 75% word-count floor: 3:7, 3:21, 4:64, 5:54, 5:80, 7:21, 7:25. All must be corrected during the remaining complete chapter rewrites. Every changed paragraph meets the floor.

## SHA-256

- Original: `0bf42e46f4c5c3738c11c437513f104b0e92847432128873d10a49f9fc16c2fc`
- Modern baseline: `8ce0b1f6570584b4ba8168b25cb6ae365afcd0cc157cc4a0f15cd2d3efc62224`
- Current candidate: `71dd3a8604976bb6c171b729a1d52a960792ba99b47397eaee258d6d50f9151e`

SHA256SUMS covers every checkpoint artifact except itself. This is a resumable content checkpoint, not a publication handoff. Continue with Book 3 paragraph 1, then Books 4, 5, 7; rerun the absolute-prefix whole-book gate and update this document before acceptance.
