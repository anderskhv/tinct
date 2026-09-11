# Confirmed release-blocker ledger — 2026-09-11 content release

Task 2 deliverable. Every book below was re-verified directly against the current file
content (all confirmed unchanged since the 2026-09-11 translation audit — `git diff
--stat` between the audited commit `cdb6d8b9` and current `origin/main` shows zero changes
to any of these edition files) rather than trusting the prior audit write-up, per the
independent review's corrections. Full evidence for each book is in its own file under
this folder; this is the index and the required-action summary.

**Action taxonomy** (per book, exactly one): retain / patch content / replace edition /
temporarily withhold modern edition / temporarily withhold book.

## Summary table

| Book | Confirmed defect (bounded) | Inherited from source or introduced by modernization? | Original-en safe to keep available? | Action |
|---|---|---|---|---|
| Bible | `modern-en` reproduces copyrighted NIV text at every sampled location (11 verse-groups, 4 genres); ~166 verses missing across 92 chapters; 32 chapters with verse-boundary displacement | Introduced by the modern-en generation (kjv-en/web-en unaffected) | Yes — `kjv-en`/`web-en` unaffected | **Replace edition** — BSB package staged, Task 1 |
| Jane Eyre | Ch. 36 ¶48: fires reversed, Rochester falsely shown asleep in the burning room, plot content deleted. Ch. 27 ¶160: ~300 words replaced with invented imagery. 24 truncations across chs. 27/35/36/37/38 | Introduced by modernization only | Yes — `original-en` clean at all 38 chapters | **Patch content** — chs. 27, 34-38, gated before release |
| Moby-Dick | Ch. 76 ¶1: confirmed factual reversal ("boneless mass... as one wad" → "almost all solid bone"). Chs. 134-135: 44 corrupted find-replace tokens (e.g. "whbefore", "Thbefore") | Introduced by modernization only | Yes, unreservedly — 1851 Melville, complete and correct throughout; recommend as default edition for this book regardless of modern-en's status | **Temporarily withhold modern edition** |
| As You Like It | `original-en` missing all of Act 1 Scene 1 (confirmed against PG #1523, 1,487 words); 16 paragraphs of 1990s CD-ROM copyright boilerplate embedded in the reading text at 4 locations | Inherited — a source-ingestion defect affecting all 3 editions equally | Not yet — same ingestion defect affects original-en directly; becomes yes once re-ingested | **Replace edition** (re-ingest `original-en` from PG #1523/Standard Ebooks; not a rights block on Shakespeare's own text — see book-specific note below) |
| Henry IV, Part 2 | Induction (Rumour's prologue, 288 words) missing from all 3 editions; `original-en` opens directly on Act 1 Scene 1 | Inherited — ingestion-parser bug, affects original-en and modern-da identically | Yes, with a disclosed ~290-word gap | **Patch content** — restore from PG #100 to all 3 editions together (chapter-renumbering operation, app-agent coordination required) |
| Faust, Part One | `original-en` is not Bayard Taylor's credited translation — a corrupted OCR of a bilingual German/English school edition; ~41% of Faust's 64-line opening monologue is missing (59% survives, including its most-quoted line); raw untranslated German in 44/895 paragraphs; a duplicated speech in "Forest and Cavern" traced to the source alternating German/English renderings of the same passage | Inherited — source is broken at the root; modern-en/modern-da faithfully reproduce the break | No — the defect is in original-en itself | **Replace edition** (re-ingest `original-en` from Gutenberg #14591, regenerate modern-en/modern-da; interim: at minimum correct the false `translator: 'Bayard Taylor'` registry attribution) |
| Magna Carta | All 63 clauses are actually present (the "clauses 51-63 missing" claim is withdrawn — clause 61's full security-council text runs ¶61-68, clause 63 ends correctly at Runnymede); editorial clause-numbering stops after clause 50 (a citability defect, not lost text); clause 50 and 53 both show a confirmed, precisely-diagnosed text-corruption bug (a botched encoding repair); no `© The British Library Board` string is actually present anywhere in the file (attribution was stripped, not boilerplate reproduced) | Inherited — encoding-repair damage in the core translation used everywhere | No — every edition traces to the same encumbered lineage | **Temporarily withhold book** — rebuild from Henderson (1892), confirmed complete (all 63 clauses numbered) and public domain in both the US and Denmark |

## Book-specific notes worth surfacing beyond the table

- **Bible:** see `docs/modern-english-translation-audit-2026-09-11/per-book-notes/bible.md`
  for the full NIV-match evidence and `books/staged-replacements/bible-bsb/` for the
  replacement package (Task 1). Calibration correction applied here per the independent
  review: the confirmed finding is substantial, unambiguous NIV matches at every sampled
  location — sufficient on its own to require replacement — not a claim that 100% of the
  file's content is NIV, which was never established and is not asserted here.
- **As You Like It:** the independent review's correction is upheld and the original
  `BLOCKED` verdict is withdrawn. The 1990s CD-ROM boilerplate is contamination in the
  *reading text*, not evidence that Shakespeare's own 1623 words are encumbered — that
  text has been public domain for centuries, and Project Gutenberg itself reclassified the
  underlying etext (#1786) as "Public domain in the USA" as of October 2023. The fix is a
  clean re-ingestion, not a rights resolution.
- **Faust:** the independent review's correction is upheld — the audit's original "the
  opening monologue is missing" was imprecise. What's actually gone is a bounded,
  identifiable block (Goethe lines 354-379, Taylor's "I've studied now Philosophy" through
  "Through spirit-power and spirit-speech") plus the scene heading; everything from line
  380b onward, including the speech's most-quoted line ("what holds the world together in
  its inmost core"), is present and correctly translated. The severity classification
  (replace edition) still holds because the German-contamination and duplication defects
  are structural to how the source file was assembled and reach well beyond the opening
  monologue — not because the opening-monologue claim itself turned out to be as bad as
  first stated.
- **Magna Carta:** the independent review's correction is upheld in full. Both the
  completeness claim and the copyright-boilerplate claim in the original audit were wrong
  in the specific way flagged — content-wise this book is far closer to complete than
  reported, and its actual defect (corrupted text at two specific clauses, traced to a
  reproducible encoding-repair bug, plus missing citability numbering after clause 50) is
  narrower and more precisely bounded than "clauses 51-63 entirely missing" suggested. It
  is still withheld, but for a corruption/provenance reason, not a completeness one.

## Other uncertain-source findings from the 2026-09-11 audit (acknowledged, not re-verified in this pass)

Per the task's framing, these were not re-verified with the same direct-file-reading pass
applied to the 7 books above (out of scope for this release's priority list), but are
still open and should not be treated as resolved. Status as last recorded:

- **Gilgamesh** (`BLOCKED`) — `original-en` shares two verbatim passages with a web
  compilation under an explicit "© 2014 Jason Colavito, all rights reserved" notice;
  translator/year fields are `null` in the registry. See
  `per-book-notes/gilgamesh.md`.
- **Symposium** (moved to `FAIL` after this audit's own follow-up) — confirmed missing the
  dialogue's true 648-word opening in every English edition. See
  `per-book-notes/symposium.md`.
- **Meditations** (`RETRANSLATE`) — `original-en` is misattributed in the registry
  (credited to George Long 1862; the actual text is Meric Casaubon's 1634 translation).
  See `per-book-notes/meditations.md`.
- **Bacchae, Medea** (`BLOCKED`) — both depend on Gilbert Murray's 1906 translation; Murray
  died 1957, so under the EU/Danish life+70 term this may remain in copyright until 1
  January 2028 — needs a legal opinion, not further content research.
- **Aristotle's Politics** (`BLOCKED`) — `original-en` is a raw OCR dump with footnotes and
  running heads rendered as body text; the modernization pass fabricated a paragraph while
  cleaning it up.
- **Henry V** — Prologue missing from both English editions (confirmed against PG #1521),
  an ingestion bug of the same class as Henry IV Part 2's.
- **Taming of the Shrew** — Induction (~11% of the play) missing from all 3 editions.

None of these seven are part of the recommended test-reader starting shelf (Task 4);
listed here so they aren't lost between this release and a future, fuller reconciliation
pass.
