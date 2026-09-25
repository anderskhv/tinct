# Source-completeness audit: G09-political-historical

- **Group:** G09-political-historical
- **Books (priority order):** wealth-of-nations, essays-montaigne, democracy-in-america, discourse-on-inequality, social-contract, communist-manifesto, second-treatise, federalist-papers, us-founding-documents, magna-carta, vindication-rights-of-woman
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (read-only)
- **Date:** 2026-09-25
- **Status of every finding:** PROPOSED. A separate reviewer confirms them.
- **Machine-readable companion:** `G09-political-historical.findings.json` (39 findings)

## Summary

| Book | Source edition(s) checked | Verdict | Main findings |
|---|---|---|---|
| wealth-of-nations | original-en vs PG #3300 | DEFECTS | **S1** Introduction and Plan of the Work missing. **S2** the modern-en chapter shards serve mostly original text. S3: the Book II and IV introductions are misplaced, the Books are unlabelled, and modern-en 11.207 is truncated |
| essays-montaigne | original-en vs PG #3600 (Cotton/Hazlitt) | DEFECTS | **S1** "The Author to the Reader" missing. S3: 15 editorial notes are served as text |
| democracy-in-america | original-en vs PG #815 + #816 | COMPLETE-VS-SOURCE | S3 (scope uncertain): Tocqueville's Appendix notes A–Z are not served. S4: labels and structure. The ending is intact |
| discourse-on-inequality | original-fr vs fr.wikisource (1823 text); original-en vs PG #46333 (Cole) | DEFECTS | **S2**: modern-da serves Part 2 in English. S3: Rousseau's 19 notes absent; Cole's Appendix and footnotes absent; French footnotes appended to chapter ends |
| social-contract | original-en vs PG #46333 (Cole) | DEFECTS | **S2** the first line of all 47 footnotes is lost, leaving 43 mid-sentence fragments. S3: the Foreword is missing |
| communist-manifesto | original-en vs PG #61 | COMPLETE-VS-SOURCE | none (Engels's 1888 prefaces and notes are absent from the source itself; open question) |
| second-treatise | original-en vs PG #7370 | DEFECTS | S3: the final 4 characters of all 18 chapter endings are cut, usually mid-word (already known to a package); Locke's Preface not served |
| federalist-papers | original-en vs PG #1404 | DEFECTS | **S1/S2** 10 body paragraphs beginning "From the…/From these…" dropped (1,514 words), including the No. 47 Montesquieu paragraph |
| us-founding-documents | original-en vs National Archives transcriptions (+ PG #1, #2, #5) | COMPLETE-VS-SOURCE | S3 (scope uncertain): Bill of Rights preamble. S4: "In Congress, July 4, 1776" heading |
| magna-carta | original-en vs PG #10000 (version 1, BL translation) | COMPLETE-VS-SOURCE | S4: clause 50 merged into 49; name damage from the source |
| vindication-rights-of-woman | original-en vs PG #3420 + Standard Ebooks | DEFECTS | **S2** modern-en chapters 7–9 are unmodernized (fixed by an unpublished package); **S2** modern-da is ~500 paragraphs of English |

**Verdict counts:** DEFECTS 7 · COMPLETE-VS-SOURCE 4 · SCREENED 0 · NEEDS-INVESTIGATION 0 · SOURCE-NOT-IDENTIFIED 0.
**Severity counts (39 findings):** S1 3 · S2 11 · S3 16 · S4 9.
Every source edition in the group received a whole-text alignment.

### Top findings
1. **G09-federalist-papers-01..10 (S1 + 6×S2 + 3×S3).** Every body paragraph whose first words are "From the…" or "From these…" is missing. That is 10 paragraphs and 1,514 words in Nos. 4, 5, 9, 26, 40, 47, 52, 63 and 83 (twice). The parser apparently treats these paragraphs as newspaper datelines ("From the New York Packet…"); paragraphs starting "From this / From such / From a / From what" survive. The losses include the paragraph in No. 47 about Montesquieu's "partial agency" and the opening paragraph of No. 52.
2. **G09-wealth-of-nations-01 (S1).** Smith's "Introduction and Plan of the Work" (1,060 words) is missing in all three editions. The edition starts at Book I, ch. I.
3. **G09-essays-montaigne-01 (S1).** Montaigne's "The Author to the Reader" ("Au lecteur", 238 words) is missing in all three editions.
4. **G09-social-contract-01 (S2).** The first line of all 47 footnotes is lost; most of these are Rousseau's own notes. The remainders are served as 43 separate paragraphs that begin mid-sentence (e.g. 13.10 "contradicting myself…"), and 4 notes vanish entirely.
5. **Derived editions under the wrong label (S2).** The Wealth of Nations modern-en chapter shards, which the reader loads by default, are 81% identical to original-en. Vindication modern-en chapters 7–9 are byte-identical to the original. Vindication modern-da is mostly English. Discourse modern-da Part 2 is English.

## Method and tool caveats
- I fetched each source once into scratch (`…/scratchpad/groups/G09-political-historical/src/`) and recorded its sha256 and UTC retrieval time (see `fetchlog.txt`). Before aligning I stripped CRs (`tr -d '\r'`), which does not change line numbers. Line numbers refer to the downloaded files.
- I ran `align.py` (k=6, `--min 12`; `--min 8/6/4` and `k=4` for the short texts and small-gap sweeps) for every source edition. For each run of 25 or more tokens I mapped it to source lines with a helper (`runctx.py`) and read it, and I scanned the shorter runs.
- **Additional checks:**
  - paragraph-level coverage (`paracov.py`: source paragraphs with less than 50% 6-gram coverage);
  - a footnote-survival scan (`fnscan.py`) for `[n]` footnotes;
  - chapter-final truncation checks;
  - modern-en versus original-en truncation and duplicate heuristics for all 11 books;
  - modern-en and modern-da "identical-to-another-edition" scans (a label check);
  - a shard-versus-whole-JSON comparison for every chapter-sharded edition in the group.
- **Chapter shards:** the primary reader loads chapter shards by default for editions listed in `editionShardRegistry` (`App.tsx` `loadEditionWindow` → `editionLoader`). That is why the shard content was checked too. The shards of the WoN, Montaigne, Democracy and Federalist original-en editions are identical to their JSON.
- **Network:**
  - fr.wikisource's API refused requests (rate limit), so I fetched the plain page HTML instead.
  - The British Library's Magna Carta translation page now returns 404, and web.archive.org was unreachable through the proxy. Magna Carta was therefore checked against PG #10000 plus a clause-structure check.
  - I sent no personal data in any request.
- My scratch artifacts are the alignment JSONs (`*-orig.json`, `doi-*.json`, `usfd-nara*.json`, `vind-se.json`) and the helper scripts, all in the group scratch folder.

---

## wealth-of-nations — The Wealth of Nations (Adam Smith)
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `986785410f5c74e8` | Smith (1776) |
| modern-en | `d894aec39397bf2a` | Modern English |
| modern-da | `0aaf422e8430f357` | Moderne Dansk |

The original-en and modern-en editions are chapter-sharded.

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/3300/pg3300.txt, retrieved 2026-09-25T11:55:47Z, sha256 `e91d52dca43fd0fd69baf7776b00a5d8e74b69675b6b608ca8a0378aaf3ae58d`. Title: *An Inquiry into the Nature and Causes of the Wealth of Nations*; credits: Colin Muir and David Widger.
- **No local raw:** `books/raw/wealth-of-nations` does not exist.
- **Edition of the text:** it contains later-edition matter (Book IV ch. VIII was added in 1784), so the label year is conventional.

**Body delimitation:** from "INTRODUCTION AND PLAN OF THE WORK." (l.110) to the PG end marker.

**Alignment (original-en):**
| Measure | Result |
|---|---|
| Source covered | 99.79% |
| Edition covered | 100.0% |
| Missing runs of 12+ tokens | 20 (682 tokens); 12 of them are 25+ tokens |
| EXTRA / ORDER / DUPLICATE runs | 0 / 0 / 0 |

Every missing run lies within source tokens 0–1092, which is the Introduction (pieces of its 6-grams recur by chance elsewhere). The DUP_ADJ flag at 26.24~25 is authorial.

**Structure:**
- 32 chapters are served: 11 + 5 + 4 + 9 + 3, matching Books I–V.
- The Book II and Book IV introductions are present but sit in the wrong chapters.
- The Book III and Book V titles are served as the last paragraphs of the preceding chapters.
- There is no Book grouping. The titles restart at "Chapter 1" four times, and the real chapter headings are served as body paragraph 0.
- The price tables are served as run-on numeric paragraphs (cosmetic).
- The "Appendix to Book IV" (herring bounty) is at 29.53–29.70, as in PG.

**Modern editions:**
- Paragraph-aligned with the original; they inherit the same gaps and placements.
- modern-en 11.207 is truncated mid-word. The package on origin/claude/friendly-albattani-qgyqfi, `books/wip/wealth-of-nations-repair/wn-batchC-notes.md`, already records and fixes it (not released).
- **The modern-en shards** (`app/public/data/editions-chapters/wealth-of-nations-modern-en/`) are an older text:
  - 1,751 of 2,173 paragraphs are byte-identical to original-en; shard 1.0 is "OF THE DIVISION OF LABOUR.";
  - 2,145 paragraphs differ from the whole-book modern-en JSON;
  - the reader's default chapter-window path serves these shards.

**Packages:**
- wealth-of-nations-repair (friendly-albattani) checks modern-en against the already-incomplete original-en. This is the Symposium failure mode: it records neither the Introduction nor the misplacements. wn-batchC-review lists the Book II heading and INTRODUCTION inside ch11 as "Nothing dropped or reordered".
- origin/codex/emergency-checkpoint-2026-08-29 `books/wip/wealth-of-nations` contains 16 bare chapter JSONs and no notes.

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-wealth-of-nations-01 | MISSING | S1 | all 3 | before 1.0 | 1,060 w (pg3300 ll.110–218) | "Introduction and Plan of the Work" and the Book I title are absent. Missing text: "The annual labour of every nation is the fund…" to "…the annual produce of the land and labour of the society." The edition resumes at 1.0 "OF THE DIVISION OF LABOUR." |
| G09-wealth-of-nations-02 | MISPLACED | S3 | all 3 | 11.290–11.297 | 873 w (ll.9660–9745) | The Book II title and Introduction ("In that rude state of society…") are served as the tail of Book I ch. XI, after the wheat-price table (11.289), instead of opening ch12 "OF THE DIVISION OF STOCK." |
| G09-wealth-of-nations-03 | MISPLACED | S3 | all 3 | 20.25–20.27 | 156 w (ll.14930–14948) | The Book IV title and Introduction ("Political economy, considered as a branch of the science of a statesman…") are served at the end of Book III ch. IV instead of opening ch21 |
| G09-wealth-of-nations-04 | MISLABELED | S3 | all 3 | titles ch1–32; 16.38; 29.71 | — | There are no Books I–V: the titles restart at "Chapter 1" at ch12, 17, 21 and 30, with sections=0, and the Book III and V titles are body text at the ends of chapters. The modern-en titles are inconsistent (ch14/19/20/24/26 carry uppercase source headings) |
| G09-wealth-of-nations-05 | MISSING | S3 | modern-en | 11.207 tail | 64 w | Stops at "…as a result of these im". The source continues "improvements, he can afford to sell cheaper…" and ends "…about the beginning of the last century." Fixed in the unreleased wn-batchC package |
| G09-wealth-of-nations-06 | MISLABELED | S2 | modern-en (shards) | all 32 shards | — | The shards that the primary reader loads are about 81% original-en text, so "Modern English" shows mostly the original. This is a delivery-path defect; verify in production |

**Open questions:** Which modern-en text does production actually show (shards or the JSON)?

---

## essays-montaigne — Essays (Michel de Montaigne)
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `2d7353e85164e3a1` | Cotton/Hazlitt (1877) |
| modern-en | `b9a1d95cff1ad62b` | Modern English |
| modern-da | `2648f8229519686a` | Moderne Dansk |

All three editions are sharded.

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/3600/pg3600.txt, retrieved 2026-09-25T11:55:48Z, sha256 `1b4c87312f0890e04cecee48e3a5fa263de65743230b819e16cb1bd72f7aee59`. Title: *Essays of Michel de Montaigne — Complete*. Translator: Charles Cotton; editor: William Carew Hazlitt (1877).
- **No local raw.**

**Body delimitation:**
- **Aligned:** from "THE AUTHOR TO THE READER" (l.2028) to the end marker.
- **Excluded:**
  - Hazlitt's Preface, "The Life of Montaigne" and "The Letters of Montaigne" (ll.53–2027);
  - the 19 repeated volume title/contents blocks and the "ETEXT EDITOR'S BOOKMARKS" lists, which are noise.

**Alignment (original-en):**
| Measure | Result |
|---|---|
| Source covered | 98.488% |
| Edition covered | 99.997% |
| Missing runs of 12+ tokens | 123 (4,361 tokens); 49 of them are 25+ tokens |
| EXTRA / ORDER / DUP runs | 0 |

The 123 missing runs break down as follows:
- 1 is "The Author to the Reader" (483 tokens, including the following header block);
- 79 are editorial notes (Coste, Hazlitt, D.W., Florio) that the edition strips on purpose (the bracket-depth classifier agrees);
- 44 are headings, volume blocks and bookmark lists.

No authorial body text is missing.

**Structure:**
- All 107 essays (57 + 37 + 13) are served, in order.
- The served ending (107.239) matches the source's last authorial words.
- There is no Book grouping.
- 12 original-en sentences are split across two paragraphs where notes were removed (the MIDSPLIT flags). No words are lost.
- ch28 "Nine and twenty sonnets" consists only of editorial notes. The sonnets are absent in PG too (scope).

**Modern editions:**
- The same absences, and the same editorial notes rendered as text.
- The heuristics found no truncated or duplicated paragraphs.
- The modern-en/da shards differ from the JSON only by "[" bracket characters (117/178 paragraphs).

**Packages:** montaigne-repair (friendly-albattani) uses the served original-en as "locked ground truth" and does not record the missing preface.

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-essays-montaigne-01 | MISSING | S1 | all 3 | before 1.0 | 238 w (pg3600 ll.2028–2051) | "The Author to the Reader" is absent: "READER, thou hast here an honest book…" to "…Therefore farewell. From Montaigne, the 12th June 1580". Cotton omitted it; Hazlitt, who is named in the label, restores it. The edition resumes at 1.0 "The most usual way of appeasing the indignation…" |
| G09-essays-montaigne-02 | EXTRANEOUS | S3 | all 3 | 24.59, 28.1–2, 36.0, 38.51, 54.1, 57.11, 67.25, 68.1, 94.39, 99.99, 100.49, 100.52, 103.1, 107.70 | 914 w | At least 15 editorial notes are served as reading text. Essay "Of Cato the Younger" opens (36.0) with Florio's version "[“I am not possessed with this common errour…" before Cotton's 36.1 |
| G09-essays-montaigne-03 | MISPLACED | S4 | all 3 | 29.4\|5, 29.5\|6, 69.10\|11 … 106.114\|115 (12 places) | — | Sentences are split into two paragraphs at the positions of removed notes. There is no Book I–III grouping |

**Open questions:** none beyond confirming the severity.

---

## democracy-in-america — Democracy in America (Tocqueville)
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `9fbec200460aebc0` | Reeve / Bowen (1862) |
| modern-en | `347cc8f0729f7fe0` | Modern English |
| modern-da | `667bddd4728ecb4c` | Moderne Dansk |

**Source.**
- **Volume 1:** https://www.gutenberg.org/cache/epub/815/pg815.txt, retrieved 2026-09-25T11:55:50Z, sha256 `734b3b03…9e2d`.
- **Volume 2:** https://www.gutenberg.org/cache/epub/816/pg816.txt, retrieved 11:55:51Z, sha256 `1c9c7472…ccf4`.
- **Translator:** Henry Reeve. The text carries Reeve's "Translator's Note, 1874" and no Bowen revision (G09-democracy-in-america-04).
- **Local raw:** `books/raw/democracy-in-america/raw.txt` (`149e7dd1…`) is pg815 + one separator line + pg816, line-identical.

**Body delimitation:**
- **Main text:** vol. 1 ll.123–19417 plus vol. 2 ll.30–11660, up to the end of Book Four ch. VIII.
- **Checked separately:** vol. 2 ll.11661–13735 (Appendices A–Z and the Constitution).

**Alignment (original-en):**
| Measure | Result |
|---|---|
| Source covered | 99.437% |
| Edition covered | 100.0% |
| Missing runs of 12+ tokens | 45 (1,037 tokens); 13 of them are 25+ tokens |
| EXTRA / ORDER / DUP runs | 0 |

- **Main text:** every missing run is a chapter heading or one of the 12 Vol. 1 "Chapter Summary" lists (~790 words; scope).
- **Appendix block:** 3.6% covered, meaning it is not served.

**Structure:**
- The Author's Introduction, all 18 Vol. 1 chapters, the three-races chapter (372 paragraphs, all 10 PG parts), the Vol. 1 Conclusion, the Author's Preface to Vol. 2 and all 75 Vol. 2 chapters are present.
- **Group-note check:** the ending is intact. 96.3 begins "But as yet these things are imperfectly understood" and ends "…to prosperity or to wretchedness."
- **The 87 MIDSPLIT flags** are footnotes served as separate paragraphs after raw markers ("…incapable. *h" / "g [ With the progress…"). They are cosmetic, and no text is lost.

**Verdict: COMPLETE-VS-SOURCE** (main text), with the following cosmetic and scope findings.

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-democracy-in-america-01 | UNCERTAIN | S3 | all 3 | after 96.3 | 12,225 w (pg816 ll.11661–12930) | Tocqueville's notes Appendix A–Z are not served, but 9 paragraphs still say "See Appendix X" (6.147, 72.5, 73.2, 78.2, 86.5, 91.2, 91.8, 94.3, 94.7) |
| G09-democracy-in-america-02 | MISLABELED | S4 | all 3 | sections | — | The Vol. 1 "Part 2" section starts at ch9 (The Federal Constitution), but Tocqueville's Part I ends with that chapter |
| G09-democracy-in-america-03 | MISPLACED | S4 | all 3 | 19.76, 42.10, 62.8, 88.10, 3.0, 43.0 | — | Book and part headings are served as the last paragraph of the previous chapter, and split titles are served as body text. Footnotes are separate paragraphs with raw markers |
| G09-democracy-in-america-04 | MISLABELED | S4 | original-en | label | — | The label says "Reeve / Bowen (1862)", but the text is Reeve's with his 1874 notes (pg815 l.2239, l.4364) |

**Scope:** the Vol. 1 Chapter Summaries and the appended U.S. Constitution (6,206 words) are not served. **Open question:** do Tocqueville's Appendix notes belong in the edition?

---

## discourse-on-inequality — Discourse on the Origin of Inequality (Rousseau)
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-fr | `6d62dac119c1f5ce` | Original (1755) |
| original-en | `d3e7e7975ac634b9` | Cole (1913) |
| modern-en | `78356e4ffdf62ec2` | Modern English |
| modern-da | `383db95bbf30559d` | Moderne Dansk |

**Sources.**
- **original-fr:** fr.wikisource, *Discours sur l'origine et les fondements de l'inégalité parmi les hommes*. This is the text of *Rousseau – Philosophie*, 1823 (`Livre:Rousseau - Philosophie, 1823.djvu`), which matches the served orthography ("très-honorés").
  - Pages: "À la République de Genève", /Préface, /Première_partie, /Seconde_partie and /Notes.
  - Retrieved 2026-09-25T12:06:15–12:06:29Z. Page sha256: `050266be…`, `22e1f6cc…`, `8b5f979f…`, `44bc89fa…`, `ca606b02…`; extracted text `d158e2c3…`.
- **original-en:** PG #46333, *The Social Contract & Discourses* (tr. G. D. H. Cole), retrieved 11:55:52Z, sha256 `65b006fe…03de`. The Discourse is at ll.7543–10855.
- **Local raw:** none. The repo records no provenance for either text.

**Alignment:**
| Edition | Source covered | Edition covered | Missing runs of 25+ tokens | What is missing |
|---|---|---|---|---|
| original-fr (Dédicace…Seconde partie) | 99.725% | 99.963% | 0 | Only my page separators |
| original-fr vs Wikisource Notes page | 0.8% | — | — | The notes are not served |
| original-en | 88.908% | 100.0% | 4 | See below |

The four missing runs in original-en are:
- the title page with the Academy question and the Aristotle epigraph (77 tokens);
- Cole's footnotes [1]–[4] (344 tokens) and [5]–[8] (76 tokens);
- Cole's APPENDIX, which is Rousseau's Note IX (3,112 words).

Everything else is covered, with no EXTRA, ORDER or DUP runs.

**Structure:**
- Dedication, Preface, exordium, Part 1 and Part 2 are complete in both source languages.
- The Discourse's own title (2.16–2.17) and its exordium (2.18–2.24) are served inside the chapter labelled "Preface".
- The English footnote markers [1]–[8] are left dangling.

**Modern editions:**
- modern-en: no truncations.
- **modern-da: ch4 (Part 2, all 67 paragraphs) is the English modern-en text, byte-identical.**

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-discourse-on-inequality-01 | UNCERTAIN | S3 | all 4 | after 4.66 | ~15,000 w (Wikisource /Notes) | Rousseau's 19 authorial endnotes (Notes I–XIX) are served in no edition |
| G09-discourse-on-inequality-02 | MISSING | S3 | original-en (+ modern) | after 4.66; footnotes | 3,560 w (pg46333 ll.10563–10855, 9351–9385, 10515–10530) | Cole's Appendix ("A famous author, reckoning up the good and evil of human life…") and his 9 footnotes are absent, including Rousseau's Notes XV and XIX. The markers remain, and note [1] read "See Appendix." |
| G09-discourse-on-inequality-03 | MISPLACED | S3 | original-fr | 3.51 (+87 w), 4.66 (+39 w) | 126 w | The 1823 page footnotes are appended to the Part-final paragraphs with "↑" glyphs. The French text now ends "« Ce chien est à moi… » Pascal, Pensées, Ire partie, art. 9, §. 53." Whether that note is Rousseau's or the 1823 editor's is unverified |
| G09-discourse-on-inequality-04 | MISLABELED | S2 | modern-da | 4.0–4.66 | 12,092 w | Part 2 of the Danish edition is served in English ("The first man who, having enclosed a piece of ground…"). Danish is currently out of scope, but the edition is still served |
| G09-discourse-on-inequality-05 | MISLABELED | S4 | all | before 1.0; 2.16–2.24 | 77 w | original-en lacks the title page and epigraph ("Non in depravatis…"). The exordium "It is of man that I have to speak" is filed under "Preface" |

**Open questions:** Should Rousseau's notes be served? Is the Pascal footnote authorial?

---

## social-contract — The Social Contract (Rousseau, tr. Cole)
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `7bf5ababb7c4dfe1` | Cole (1913) |
| modern-en | `cf7facb77bfc5baf` | Modern English |
| modern-da | `2b6fcfad924735d9` | Moderne Dansk |

**Source.**
- **Matched source:** PG #46333 (see above), ll.1662–6504.
- **Local raw:** `books/raw/social-contract/raw.txt` (`d79e0c9d…`) is pg46333 without the PG header and footer, line-identical.
- **SOURCE.md** says parsing began with the text "following" the Foreword.

**Alignment (original-en):**
| Measure | Result |
|---|---|
| Source covered | 97.952% |
| Edition covered | 99.991% |
| Missing runs of 12+ tokens | 39 (597 tokens); 2 of them are 25+ tokens |
| EXTRA / ORDER / DUP runs | 0 |

The missing runs are the title, epigraph and Foreword (75 tokens), plus the first line of each footnote. `fnscan.py` confirms the footnote damage:
- all 47 footnotes lost their "[n]" first line (521 words);
- 43 footnote remainders are served as separate paragraphs at chapter ends, beginning mid-sentence;
- 4 one-line notes are gone entirely;
- 47 body paragraphs keep their "[n]" markers.

**Structure:**
- All 48 chapters (9 + 12 + 18 + 9) are present, in order.
- The Book I preamble is served under the "Chapter 1" title.

**Modern editions:** modern-en and modern-da contain the same fragments (e.g. modern-en 13.10 "of contradicting myself…").

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-social-contract-01 | MISSING | S2 | all 3 | 47 notes; fragments at 2.9 … 47.35–41 (43 paragraphs) | 521 w | Each note's first line is dropped. Example: after 13.9 "…as soon as we lost it?", the line "[1] Attentive readers, do not, I pray, be in a hurry to charge me with" is missing, and 13.10 is "contradicting myself. The terminology made it unavoidable…". The four notes gone entirely are Plutarch, Montesquieu, "In the Politicus" and "Custodes…" |
| G09-social-contract-02 | MISSING | S3 | all 3 | before 1.0 | 60 w (ll.1670–1683) | The Foreword ("This little treatise is part of a longer work…" to "…The rest no longer exists.") and the epigraph "Fœderis æquas Dicamus leges" are absent |
| G09-social-contract-03 | MISLABELED | S4 | all 3 | 1.0–1.2 | — | The Book I preamble sits inside "Book 1, Chapter 1", so "Man is born free" is 1.3 |

---

## communist-manifesto — The Communist Manifesto (Moore 1888)
**Served editions:**
| Key | sha256 (first 16) |
|---|---|
| original-en | `8b5b839176167eef` |
| modern-en | `909c7496f66b1314` |
| modern-da | `6c4fafb667b40f26` |

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/61/pg61.txt, retrieved 11:55:54Z, sha256 `ba4623f0…cb59`.
- **Local raw:** `books/raw/communist-manifesto/raw.txt` is line-identical to it.

**Alignment:**
| Measure | Result |
|---|---|
| Source covered | 99.775% |
| Edition covered | 100.0% |
| Missing runs | One, of 13 tokens: the Section IV heading, which the chapter title carries |

**Structure:** the preamble, Sections I–IV with the III.1–3 subsections, and the final "WORKING MEN OF ALL COUNTRIES, UNITE!" are all present. modern-en has no truncations.

**Package:** origin/codex/bella-focused-communist-boundaries-20260921 is audio timing work, not a text package.

**Verdict: COMPLETE-VS-SOURCE.** No findings.

**Open question:** the label "Moore (1888), edited by Engels" implies the 1888 edition. That edition carries Engels's 1888 Preface and his footnotes (e.g. "That is, all written history…"). PG #61 and the edition have neither. The group notes put Engels's prefaces in scope; the footnotes need a decision.

---

## second-treatise — Second Treatise of Government (Locke)
**Served editions:**
| Key | sha256 (first 16) |
|---|---|
| original-en | `efbd7cabd14ed99f` |
| modern-en | `177b364414c437af` |
| modern-da | `7f5a7c98a4b9fe1a` |

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/7370/pg7370.txt, retrieved 11:55:55Z, sha256 `3cd2baa0…43bb`. It is based on Macpherson's Hackett edition (1980).
- **Local raw:** `books/raw/second-treatise/raw.txt` is line-identical to it.

**Alignment (original-en, from PREFACE):**
| Measure | Result |
|---|---|
| Source covered | 97.439% |
| Edition covered | 99.955% |
| Missing runs of 25+ tokens | 2, both in the Preface (783 words) |

- Every other missing run is a chapter heading or a "Sect. n." label (stripped by design, per SOURCE.md), except for the last 4 characters of each of chapters 1–18.
- A paragraph-level check at k=4 found no other gaps.

**Structure:** all 19 chapters are present, and the ending "…as they think good." is intact.

**Modern editions:** modern-en and modern-da have the same chapter-end truncations.

**Package:** the modern-en package on origin/claude/gracious-fermat-bjef6w, `books/wip/second-treatise-modern-en`, records the truncations in HANDOFF.md item 6 and REVIEW-RECORD.md. It completes them in its modern-en candidate and says original-en still needs a parser fix. It also records the PG corruption at §2.

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-second-treatise-01 | MISSING | S3 | all 3 | last paragraph of ch1–18 | 18 w | Every chapter loses its final 4 characters, usually mid-word: "public g[ood.]", "very cl[ear.]", "Exod. [xxi.]", "housh[old.]", "usur[ped.]", "would let [him?]" and so on. Already documented in the gracious-fermat package (not fixed in original-en) |
| G09-second-treatise-02 | UNCERTAIN | S3 | all 3 | before 1.0 | 783 w (ll.81–150) | Locke's Preface ("Reader, thou hast here the beginning and end of a discourse concerning government…") was stripped as "pre-chapter boilerplate" according to SOURCE.md, but it is authorial |
| G09-second-treatise-03 | MISSING | S4 | original-en | 1.6 (§2) | ~11 w | Source corruption: "distinguish these powers one from wealth," is missing "another, and shew the difference betwixt a ruler of a common-". modern-en has the standard reading |

---

## federalist-papers — The Federalist Papers
**Served editions:**
| Key | sha256 (first 16) |
|---|---|
| original-en | `c733011184b5b42d` |
| modern-en | `1974574ebce6859b` |
| modern-da | `0f4dc8cf0faeb96a` |

All three are sharded; the shards match their JSON.

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/1404/pg1404.txt, retrieved 11:55:56Z, sha256 `0b92fadc…b65d`.
- **Local raw:** `books/raw/federalist-papers/raw.txt` is line-identical to it.

**Alignment (original-en):**
| Measure | Result |
|---|---|
| Source covered | 98.332% |
| Edition covered | 99.995% |
| Missing runs of 12+ tokens | 105; 37 of them are 25+ tokens |
| EXTRA / ORDER / DUP runs | 0 |

- Missing by design: the subtitles, datelines, author lines and "PUBLIUS" signatures.
- A paragraph-level check (`paracov.py`) finds exactly 10 whole body paragraphs absent, and nothing else.
- The pattern: the 10 absent paragraphs all begin "From the…" or "From these…" (including one in capitals, "FROM the more general inquiries…"). The seven surviving "From…" paragraphs begin "From this/such/a/what".

**Structure:** all 85 papers are present, in order.

**Modern editions:** modern-en and modern-da lack the same 10 paragraphs.

**Verdict: DEFECTS**

| ID | Sev | Location | Words (pg1404 lines) | Missing paragraph → paragraph served after it |
|---|---|---|---|---|
| G09-federalist-papers-01 | S1 | after 47.5 | 342 (10552–10581) | No. 47: "From these facts, by which Montesquieu was guided…" ("he did not mean that these departments ought to have no PARTIAL AGENCY…") → 47.6 "The reasons on which Montesquieu grounds his maxim…" |
| G09-federalist-papers-02 | S2 | after 26.4 | 296 (5445–5469) | No. 26: "From the same source, the people of America may be said to have derived…" → 26.5 "It is remarkable, that even in the two States…" |
| G09-federalist-papers-03 | S2 | after 83.8 | 237 (18282–18302) | No. 83: "From these observations it must appear unquestionably true, that trial by jury…" → 83.9 "The friends and adversaries of the plan…" |
| G09-federalist-papers-04 | S2 | after 63.12 | 145 (13892–13905) | No. 63: "From these facts, to which many others might be added…" → 63.13 "In answer to all these arguments…" |
| G09-federalist-papers-05 | S2 | after 40.4 | 120 (8442–8451) | No. 40: "From these two acts, it appears, 1st, that the object of the convention…" → 40.5 "From a comparison and fair construction…" |
| G09-federalist-papers-06 | S2 | after 9.0 | 110 (1612–1622) | No. 9: "From the disorders that disfigure the annals of those republics…" → 9.1 "But it is not to be denied that the portraits they have sketched…" (whose "they" now has no antecedent) |
| G09-federalist-papers-07 | S2 | after 83.4 | 106 (18229–18237) | No. 83: "From these observations this conclusion results…" → 83.5 "Having now seen that the maxims relied upon…" |
| G09-federalist-papers-08 | S3 | after 4.7 | 68 (621–626) | No. 4: "From these and such like considerations…" → 4.8 "The people of America are aware…" |
| G09-federalist-papers-09 | S3 | after 5.7 | 56 (833–838) | No. 5: "From these considerations it appears that those gentlemen are greatly mistaken…" → 5.8 "When did the independent states…" |
| G09-federalist-papers-10 | S3 | before 52.0 | 34 (11472–11474) | No. 52 opening: "FROM the more general inquiries pursued in the four last papers…" → 52.0 "The first view to be taken of this part…" |

All ten are type MISSING and affect all three editions. The local raw has every paragraph. No package covers them.

---

## us-founding-documents — The US Founding Documents
**Served editions:**
| Key | sha256 (first 16) |
|---|---|
| original-en | `0972836459be1c06` |
| modern-en | `4c6888a7cc0b24e1` |
| modern-da | `cfd2e1fea5633659` |

**Sources.**
- **National Archives transcriptions** (https://www.archives.gov/founding-docs/): declaration-transcript, constitution-transcript, bill-of-rights-transcript and amendments-11-27.
  - Retrieved 2026-09-25T12:14:26–32Z.
  - Page sha256: `b791fdf8…`, `8e33e6ad…`, `25c59257…`, `95560fca…`; extracted text `ebc4618b…`.
- **Also fetched:** PG #1, #5 and #2.
- **Local raws:**
  - raw-declaration, raw-constitution and raw-bill-of-rights are line-identical to PG #1, #5 and #2.
  - **raw-amendments.txt is a Gutenberg "404" HTML page** (`8d27d026…`). Amendments XI–XXVII therefore have no raw provenance, although the served wording matches NARA.

**Alignment (original-en vs NARA):**
| Measure | Result |
|---|---|
| Source covered | 83.781% |
| Edition covered | 99.573% |
| Missing runs of 25+ tokens | 16 |

- **Everything missing is explained:**
  - NARA page furniture, and NARA's "Passed by Congress / ratified / Note" annotations;
  - the signers of both documents, which SOURCE.md excludes;
  - the Constitution's interlineation note;
  - the Bill of Rights preamble and "Article the first".
- **Edition-only text:** 3 runs of 2–4 tokens, all spelling variants ("attention/British" against NARA's "attentions/Brittish").

**Structure:** the Declaration, the Constitution (Preamble, Articles I–VII, "Done in Convention…"), Amendments I–X and XI–XXVII are all present.

**Verdict: COMPLETE-VS-SOURCE**

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-us-founding-documents-01 | UNCERTAIN | S3 | all 3 | before 3.0 | ~170 w | The "Bill of Rights" chapter omits the 1789 joint resolution's preamble ("THE Conventions of a number of the States…") and its attestation, starting at "Amendment I." |
| G09-us-founding-documents-02 | MISSING | S4 | all 3 | before 1.0 | 5 w | The heading "In Congress, July 4, 1776" is absent |

**Scope:**
- The signer lists are excluded by design.
- The Constitution's article headings are inconsistent ("Article 1", "ARTICLE 2", "ARTICLE THREE"…); this comes from PG #5.

---

## magna-carta — Magna Carta
**Served editions:**
| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `ca7447fb99a427bd` | English Translation |
| modern-en | `cf7d388da295fff5` | Modern English |
| modern-da | `2f92e891bba2460c` | Moderne Dansk |

**Source.**
- **Matched source:** https://www.gutenberg.org/cache/epub/10000/pg10000.txt, retrieved 11:56:00Z, sha256 `69785cf3…5a33`. The edition uses version 1 of the file (the British Library translation), ll.59–529.
- **Local raw:** line-identical to PG.
- **No second-source check:** the British Library's page returns 404, and web.archive.org was unreachable.

**Alignment:**
| Measure | Result |
|---|---|
| Source covered | 99.694% |
| Edition covered | 100.0% |
| Missing runs | Only the two PG transcriber notes ("here were some strange characters…"), which are correctly excluded |

**Structure:** a clause check confirms clauses 1–63:
- clauses 1–49 are numbered;
- clause 50 is merged into 1.50;
- clauses 51–60 are present;
- clause 61 (the security clause) is present with its sub-clauses;
- clauses 62 and 63, the witness clause and the Runnymede dating are present.

**Verdict: COMPLETE-VS-SOURCE**

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G09-magna-carta-01 | MISPLACED | S4 | all 3 | 1.50 | Clause (50) is merged into (49)'s paragraph. The source's damage survives in the names "Gerard de Ath" and "Engelard de Cigogn" |

---

## vindication-rights-of-woman — A Vindication of the Rights of Woman
**Served editions:**
| Key | sha256 (first 16) |
|---|---|
| original-en | `3e168f00ba7901f8` |
| modern-en | `4e7e6143670a4ca2` |
| modern-da | `41ec7c251015ca80` |

**Sources.**
- **Matched source:** https://www.gutenberg.org/cache/epub/3420/pg3420.txt, retrieved 11:56:01Z, sha256 `7d79652f…86a8`.
- **Cross-check:** Standard Ebooks single-page text, retrieved 12:23:45Z, sha256 `d58a09d2…`.
- **No local raw.**

**Alignment (original-en):**
| Source | Source covered | Edition covered | Notes |
|---|---|---|---|
| PG #3420 (from the dedication) | 99.802% | 100.0% | Only chapter headings are missing |
| Standard Ebooks body | 99.539% | — | The only edition-only text is Wollstonecraft's footnotes, which the edition serves inline and SE places as endnotes |

**The original-en is complete.** The dedication, the Introduction and Chapters 1–13 (with Sections 5.1–5.5 and 13.1–13.6) are all present.

**Modern editions:**
- modern-en: chapters 7–9 are byte-identical to original-en (234 of 234 paragraphs).
- modern-da: about 500 paragraphs in chapters 1–6 and 10–15 are the English original.

**Package:** the modern-en package on origin/claude/sleepy-hamilton-0f1kqi, `books/wip/vindication-modern-en` (commit `1748c0aa6`), is accepted but not published. Its candidate (sha256 `6a398f5b…`) re-renders 752 of 778 paragraphs and fixes the modern-en defect.

**Verdict: DEFECTS** (in the derived editions only)

| ID | Type | Sev | Editions | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G09-vindication-rights-of-woman-01 | MISLABELED | S2 | modern-en | ch7–ch9 | 23,392 w | Wollstonecraft's Chapters 5–7 are served unmodernized under "Modern English". The unpublished sleepy-hamilton package fixes this |
| G09-vindication-rights-of-woman-02 | MISLABELED | S2 | modern-da | ch1–6, ch10–15 | ~500 paragraphs | The Danish edition serves the English original (e.g. ch4 76/76, ch11 33/33). Danish is out of current scope |

**Open question:** the 1792 "Advertisement" is absent from PG #3420, from Standard Ebooks and from the edition. It should be checked against a 1792 scan.
