# Acceptance Record: Pride and Prejudice (Jane Austen), modern-en

- **Book id:** `pride-and-prejudice` · **Edition:** `modern-en`
- **Date:** 2026-09-23
- **Objective:** a light-touch review and repair of the existing edition. The aim is a faithful, accessible Tinct edition, not maximum rewriting.
- **Source (fidelity anchor):** `source.json`, byte-identical to the served `app/public/data/editions/pride-and-prejudice-original-en.json`. Its sha256 is `5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6`. This is the 1813 text from Project Gutenberg #1342 (see `books/raw/pride-and-prejudice/SOURCE.md`).
  - **Completeness:** a word-sequence diff against `books/raw/pride-and-prejudice/raw.txt` (sha256 `212c4047…eabdb`) finds unmatched runs only in the Gutenberg boilerplate, the Saintsbury preface and table of contents, the 1894 illustration captions, and the printer's margin tags ("nind", "right"). No body text is missing.
- **Starting point:** the live modern-en edition, preserved as `baseline-live-modern-en.json`. Its sha256 is `d914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1`. The work repaired that text; it did not start over.
  - **Earlier repair work:** no earlier Pride and Prejudice text-repair branch or staging exists. The only other Pride branch (`codex/bella-focused-pride-ready-20260921`) is audio work and does not touch modern-en.
- **Structure:** 61 chapters and 2,060 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are identical to the source and to live.
  - Every application step used `content_edit_helpers.safe_replace`, an exact and unique match reused from the Frankenstein/Jekyll repair branch without committing it. After each step, the structure was asserted and the changed-paragraph set was checked against what was expected.
  - The candidate is written in the same JSON serialization as live, so unchanged paragraphs are byte-identical.

**Final sha256 (`candidate.json`):**
```
5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77
```

**Outcome:** 222 of 2,060 paragraphs (10.8%) differ from live. Most changes are one clause or a single word. The other 1,838 paragraphs were read and accepted as they stand.

## The opening (1.0)

The spot check was confirmed. The source says "must be in *want of* a wife", and the live edition had "must be *looking for* a wife".

- **Why the live wording was wrong:** "In want of" means lacking or needing. The irony is that the neighbourhood's "universally acknowledged truth" projects its own wish onto the man, a husband for one of its daughters, and 1.1 pays this off ("the rightful property of some one or other of their daughters"). "Looking for" makes the man the one seeking, which flattens the joke.
- **Final text:** *"It is a truth universally acknowledged that a single man in possession of a good fortune must be in need of a wife."*
  - "In possession of a good fortune" is restored. It is clear today, keeps the cadence, and keeps the double sense of *good fortune* that "a large fortune" had lost.
  - No explanation of the joke was added.
- **Review:** the change was later checked by the independent reviewers of rounds 1 and 2 and found clean.

## Review coverage

| Round | Scope | Reviewer | Method | Result |
|---|---|---|---|---|
| 0 | 1.0 | Lead | Source reading of the reported spot check | 1 repair |
| 1: fidelity | **All 61 chapters, all 2,060 paragraphs**, in 9 batches | 9 independent source-based reviewers, one per batch (`round1/fid1-*.md`) | Protocol from `books/prompts/fidelity-review-prompt.md` (branch `claude/frankenstein-jekyll-modern-en`), adapted as `briefs/FIDELITY-BRIEF.md`. Packets of 5–10 paragraphs with neighbours on each side, then a whole-chapter re-read for cross-boundary issues. Targets: irony and indirect speech, attribution, qualifications and social implications, omissions, additions, genuinely obstructive syntax, and tone. Light-touch rule: no stylistic polish | 189 proposals (179 blocking). The lead checked each one against the source: **188 applied** (a number with adjusted wording) and 1 rejected (41.37, to keep an ambiguity in the source). See `round1/LEAD-SCREENING.md` |
| 1: re-verification | All 162 paragraphs changed so far | 3 fresh independent verifiers with source, baseline and candidate (`round2/reverify-r1-*.md`) | Every changed paragraph was checked for direction of change, grammar, fit, and any new defect | 157 clean, 5 defects, 0 reverts. All 5 fixed, including a broken splice the lead's adjusted wording had introduced at 30.2 |
| 2: accessibility | **All 2,060 paragraphs**, in 5 batches | 5 fresh readers who saw the **candidate only**, never the source (`round2/acc-*.md`) | `briefs/ACCESS-BRIEF.md`, adapted from `books/prompts/accessibility-review-prompt.md`. The readers were told that formality, irony and period flavour are not defects | 105 findings. The lead checked each one against the source: **81 applied** (many reworded to stay faithful), 16 rejected, and 8 deferred as structural. Two consistency edits were also made. See `round2/LEAD-SCREENING-R2.md` |
| 3: re-verification | All 83 paragraphs changed in round 2 | 2 fresh independent verifiers with source (`round3/reverify-r2-*.md`) | Each accessibility clarification was checked against the source for fidelity, attribution, ambiguity and splice damage | 71 clean, 11 defects, 1 revert, plus 1 pre-existing omission. All 13 applied (see `round3/LEAD-SCREENING-R3.md`). Of these, 7 restored nuance an accessibility edit had loosened, 1 removed an added speaker tag, 3 repaired broken splices, and 1 reverted an edit that clashed with the next line |
| 4: final verification | **Every paragraph that differs from live** (223 at the time), in final form | 3 fresh independent verifiers with source, live baseline and final text (`round4/final-verify-*.md`) | The full baseline-to-final difference was judged, with specific attention to splice damage and faithful, brief glosses | 221 clean, 2 defects (16.20 referent, 46.4 "them"). Both fixed. A pre-existing drift flagged by two verifiers was also fixed (56.45 "heavy punishments" back to Austen's "heavy misfortunes") |
| 4b | 16.20, 46.4, 56.45 | Fresh independent verifier (`round4/final-verify-r5.md`) | Full paragraph read against the source, plus mechanical checks | **All clean** |
| Lead net revert | 47.8 | Lead | After the round-3 removal of an added tag, only an inserted "that" remained. The paragraph was restored byte-for-byte to live | 1 change fewer (see `round4/lead-revert-47-8.json`) |
| Whole-book checks | All 2,060 paragraphs | Lead, programmatic (`CONSISTENCY-CHECK.md`) | Structure, quote, italic and dash balance against the source, proper names and numbers against the source, key-term consistency, anachronism sweep, `books/audit-truncation.py` and `books/content-verify.py` (run with local paths) | Clean, or explained case by case |

No sampling at any stage. Every paragraph of the book was read individually against the source in round 1, and read again by a candidate-only reader in round 2. Every changed paragraph was independently verified in its final form.

## Conventions kept

- **Edition conventions:** American spelling (honor, neighbor), straight quotes, em dashes and `_italic_` emphasis. The narration has a few contractions from ch. 36 on; they are recorded, not normalized (see below).
- **Social distinctions:**
  - "Miss Bennet" (the eldest daughter present, including Elizabeth at Rosings), "his lady", "your Ladyship", "ten thousand a year", "the entail", "connections", "condescension", "superior society", "establishment" (glossed at 22.2 as a home and income of her own), "debts of honor", "the militia" and "the Regulars" are all kept.
  - In narration the edition sometimes says "Jane" where Austen writes "Miss Bennet". This is the live edition's existing clarity convention. Forms of address in dialogue are kept.
- **"Living" (the church post)** is rendered "parish" throughout, following the live edition's convention. The last two stray uses (52.29, 52.32) were aligned. "Living" now appears only in its ordinary sense.
- **Character voices:** Mr. Collins's "affability and condescension" and "gracious condescension", Lady Catherine's imperiousness, Mrs. Bennet's "destitute", Mr. Bennet's dry irony, Darcy's "demand" and "objectionable", Lydia's "Lord", and "nasty little freckled thing".
- **Key echoes restored:** "tolerable" (3.13 to 5.8), "sensible" (13.20 / 15.0 / 22.4), "disguise" (34.21 to 35.4), and "impertinent" (6.15).
- **Glosses:** brief and in-line, only where the meaning matters:
  - the card games (vingt-un, lottery tickets, quadrille, casino), the entail, "the hunting and shooting rights of a manor", Cheapside, "an express", Nicholls the housekeeper, "in his gift", "Saturday week", "yesterday se'nnight", traveling post, Dawson and the coachman's box, the hackney coach and cab rank, Michaelmas, "a planted grove" (wilderness), and "the war ended" (restoration of peace).
  - No joke is explained.
- **Source oddities kept as printed:**
  - The Saturday/Sunday discrepancy (46.2 and 46.15).
  - Deliberately oblique or unattributed lines (28.17 "him", 41.7, 47.8, 47.56–57, 57.3 "she added").
  - The "a good deal" ambiguity at 41.37.

## Rejected and deferred findings (summary)

The full reasons are in the screening files.

- **Rejected (17 in total):**
  - 1 fidelity proposal: 41.37.
  - 16 accessibility findings, rejected because the candidate already follows the source, or because the suggestion would settle an ambiguity in the source, explain a joke, or add interpretation. Examples: 2.14, 3.4, 7.28, 9.37, 28.17, 37.4 ("Miss Bennet" is a period convention), 41.7, 43.54, 46.2 (the Saturday/Sunday discrepancy is Austen's), 47.56, 49.28, 55.7, 57.3, 59.44.
  - The narration contractions from ch. 36 on (36.0) are recorded as an observation. Normalizing them would be polishing, not repair.
- **Deferred (8), because they are structural:** see the unresolved dependency below.

## Unresolved dependency (outside this content-only brief)

**Seven paragraph breaks fall mid-sentence, and they are in the source itself.** In `app/public/data/editions/pride-and-prejudice-original-en.json` the following paragraphs end in the middle of a sentence, which continues in the next paragraph:

| Break | Source text at the break |
|---|---|
| 3.3 / 3.4 | "…by starting the idea of his / being gone to London…" |
| 14.12 / 14.13 | "…glad to invite him / to read aloud to the ladies." |
| 22.3 / 22.4 | "…than the matter had ever / excited before…" |
| 30.6 / 30.7 | "…in order to have / the earliest assurance of it…" |
| 36.3 / 36.4 | "…but what he told / himself." |
| 46.10 / 46.11 | "…something indistinctly of his / concern…" |
| 48.11 / 48.12 | "…this licentiousness of behaviour in your / daughter…" |

These breaks match the positions of the 1894 George Allen illustrations in the Gutenberg text. They look like splits made when the source was first parsed.

- **What happens now:** modern-en reproduces the breaks, because it must stay paragraph-aligned. Readers and paragraph-level audio will meet a broken sentence at each one. Three independent accessibility readers flagged them as blocking.
- **Why this work did not fix them:** rejoining them changes the paragraph count and alignment of every Pride and Prejudice edition (original-en, modern-en, modern-da), the character-card anchors and the audio. That is outside a content-only text repair that must keep alignment.
- **The fix:** a coordinated structural change owned by integration. Merge the seven pairs in all editions at once, then re-anchor the character cards and audio.
- **Related structural note:** Darcy's letter (35.4) is a single paragraph of about 2,000 words in the source. It is kept as one paragraph for the same reason.

**Other observations, not blocking:**
- Narration contractions from ch. 36 on (register drift).
- 46.4 "_he_" is not italicized where the source italicizes it.
- 30.7 repeats "respects".

These were deliberately left as they are to avoid polishing accepted passages.

## Verdict

**ACCEPTED: ready for release handoff**, with the structural paragraph-break dependency documented above.

- Complete, independent reviews support acceptance: a source-based fidelity review of every paragraph, and a candidate-only accessibility review of every paragraph.
- Every blocking finding was fixed, or rejected against the source with a recorded reason.
- Every paragraph that differs from live was independently re-verified in its final form, and the last three fixes were verified clean.
- Structure matches the source.
