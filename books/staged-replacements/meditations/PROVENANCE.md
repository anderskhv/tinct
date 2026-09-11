# Meditations — provenance, edition assessment, and rights

**Prepared:** 2026-09-11, content-only staging work. Nothing here is published,
merged, registered or deployed. All source texts were fetched directly and read;
nothing below is asserted from memory alone unless marked as such.

## 1. What the served `original-en` actually is

`app/public/data/editions/meditations-original-en.json`
(sha256 `4f811221abc8dd107da81c1a1ec7d75107094246c4353cd1884bba2943241afb`)
is registered in `app/src/data/bookRegistry.ts` as **"Long Translation (1862)",
translator George Long**. It is not Long's translation.

**It is Meric Casaubon's 1634 translation**, in the text of Project Gutenberg
ebook #2680 (`https://www.gutenberg.org/cache/epub/2680/pg2680.txt`, fetched
2026-09-11; PG's own front matter credits Casaubon, and Casaubon's numbering and
book divisions are unmistakable). Evidence, all verbatim from the served file:

| served location | served text | Long 1862 (PG #15877) at the same place |
|---|---|---|
| Book 1, ¶0 | "I. Of my grandfather Verus I have learned to be gentle and meek, and to refrain from all anger and passion." | "From my grandfather Verus [I learned] good morals and the government of my temper." |
| Book 1, ¶14 | "XV. In the country of the Quadi at Granua, these. Betimes in the morning say to thyself, This day I shalt have to do with an idle curious man…" | This is Long's **II.1** ("Begin the morning by saying to thyself, I shall meet with the busybody…"). Casaubon puts it in Book I. |
| Book 2, ¶0 | "I. Remember how long thou hast already put off these things, and how often a certain day and hour as it were, having been set unto thee by the gods…" | Long **II.4**: "Remember how long thou hast been putting off these things, and how often thou hast received an opportunity from the gods…" |
| Book 2, ¶13 (last) | "…But nothing that is according to nature can be evil. _Whilst I was at Carnuntum._" | Long II.17 ends "…nothing is evil which is according to nature. This in Carnuntum." |
| Book 4, ¶2 | "They seek for themselves private retiring places, as country villages, the sea-shore, mountains; yea thou thyself art wont to long much after such places." | Long IV.3: "Men seek retreats for themselves, houses in the country, sea-shores, and mountains; and thou too art wont to desire such things very much." |

The 2026-09-11 translation audit (`per-book-notes/meditations.md` on
`claude/upbeat-brown-cuttkn`) reached the same identification independently.

### Completeness of the served file against its real source

The served file is a faithful, complete copy of PG #2680's text body: 12 books,
412 paragraphs, one paragraph per Casaubon section start
(17, 14, 17, 43, 30, 51, 44, 58, 43, 37, 31, 27), verified by re-parsing
PG #2680 and matching section starts book by book. One Casaubon section boundary
is merged inside a paragraph (Casaubon II.IV and II.V share served Book 2 ¶3), as
in the PG text itself.

Against the standard numbering (Gataker/Long/Haines/Farquharson, 487
sections: 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36) the served file is
**complete in content but non-standard in structure**: Casaubon's Book I
contains standard II.1–II.3 as I.15–I.17, so his Book II begins at standard II.4;
elsewhere Casaubon merges and splits sections freely (his Book XII has 27
sections to the standard 36). A reader cross-referencing "Meditations 2.1"
against this file lands on the wrong text.

### Casaubon's text as a base

Casaubon translated Xylander's 1559 Greek text, before Gataker's 1652 critical
edition, in dense 1634 English, with expansions ("as a channel from the spring")
that are Casaubon's, not Marcus's. The served `modern-en`
(sha256 `e551f78e2ed26d47…`) is a word-level modernisation of Casaubon that
keeps Casaubon's numbering and syntax, and even carries "Whilst I was at
Carnuntum" as running text; the audit rated its first-read clarity 2/5.

## 2. Candidate human English translations, assessed

Standard: clear, natural English for a thoughtful modern adult (see
`WORKFLOW.md`). Samples are the opening of Book II.1 unless noted, quoted
from the fetched texts (obvious OCR errors silently corrected in quotations
from scans; nothing else changed).

| Translation | Where read | Sample (II.1 opening) | Rights (US / Denmark) | Meets standard? |
|---|---|---|---|---|
| **Meric Casaubon, 1634** | PG #2680 (served file) | "Remember how long thou hast already put off these things…" (his II.1 = standard II.4); "Betimes in the morning say to thyself, This day I shalt have to do with an idle curious man, with an unthankful man, a railer, a crafty, false, or an envious man" (his I.15) | PD / PD | **No.** 1634 vocabulary and syntax throughout; non-standard numbering. |
| **Jeremy Collier, 1701**, revised Alice Zimmern 1887 | archive.org `meditationsofmar00marc` (djvu text) | "Remember to put yourself in mind every morning, that before night it will be your luck to meet with some busy-body, with some ungrateful, abusive fellow, with some knavish, envious, or unsociable churl or other." | PD / PD (Collier d. 1726; Zimmern d. 1939, EU term expired 2010) | **No.** Uses "you", but a loose 18th-century paraphrase in period idiom. |
| Hutcheson & Moor, 1742 | not located on archive.org by creator search | — | expected PD | **Unverified**, not pursued (18th-century English). |
| **George Long, 1862** | PG #15877 (`source/pg15877-long-1862.txt`, sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b`); cross-checked against Standard Ebooks | "Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil." | PD / PD (Long d. 1879; pre-1930 US publication; EU term expired 1950). Standard Ebooks' production layer is CC0. | **No** as a modern edition (thou/thee/dost, Victorian periods), but the clearest literal public-domain rendering, with standard numbering and a clean digital text. |
| **G. H. Rendall, 1898** ("Marcus Aurelius Antoninus to Himself") | archive.org `marcusaureliusan00marcrich` (djvu text); Book II read in full | "When you wake, say to yourself — To-day I shall encounter meddling, ingratitude, violence, cunning, malice, self-seeking; all of them the results of men not knowing what is good and what is evil." | US: PD (1898). Denmark/EU: PD (Rendall d. 1945; term expired 2016). | **No, but closest.** Mostly "you", yet drops into "thou/thy/thyself" (II.6: "do not violence to thyself, my soul. Not for long will thy day for self-reverence be… thou dost stake thy fortunes"); Victorian diction ("'twill", "withal", "nought", "scathe", "sojourning", "distempered", "heinous", "Nay"); interpretive coinages ("the Inner Self" for the ruling faculty, "mind-power"); freer than Long. Exists only as OCR scans, no clean digital text. |
| **John Jackson, 1906** (Oxford) | archive.org `meditationsmarc00jackgoog` | "Every morning repeat to thyself: I shall meet with a busybody, an ingrate, and a bully; with treachery, envy, and selfishness." | US: PD (1906). EU: translator's death date not verified in this task. | **No.** Thou-form, literary Edwardian. |
| **C. R. Haines, 1916** (Loeb) | archive.org `communingswithhi00marc` | "Say to thyself at daybreak: I shall come across the busy-body, the thankless, the bully, the treacherous, the envious, the unneighbourly." | US: PD (1916). EU: PD (Haines d. 1935; term expired 2006). | **No.** Deliberately archaic diction. Closest to the Greek among the PD set, but no clearer than Long. |
| A. S. L. Farquharson, 1944 (Oxford) | not sampled | — | **Not PD in the US**: Farquharson d. 1942, so the work was still in UK copyright on 1 Jan 1996 and its US copyright was restored (95 years from publication, to 2040). EU/Denmark: PD since 2013. | Not reusable for Tinct's global service. |
| Staniforth 1964, Hays 2002, Hammond 2006, Hard 2011, Waterfield 2021 | — | — | In copyright (both jurisdictions) | Not reusable. |

**Conclusion of the assessment.** No complete, legally reusable human English
translation meets the accessibility standard unchanged. The nearest, Rendall
1898, fails on archaic lapses, Victorian vocabulary, interpretive freedom, and
the absence of a clean text. **Modernisation is therefore justified**, from one
documented source.

## 3. The source chosen for modernisation: George Long, 1862

- **Why Long.** Literal and careful (the audit's own finding: Long unmodernised
  is clearer than the served "modern" Casaubon); standard book and section
  numbering, so numbering can be kept intact as the brief requires; clean
  digital text; rights clear everywhere; and it is the translation the registry
  already promises readers. Haines is comparably faithful but more archaic;
  Rendall is freer; Casaubon is two removes from the Greek and non-standard.
- **One source only.** Every candidate paragraph is drafted from Long's text of
  the same numbered section. No phrasing is imported from Hays, Hard,
  Staniforth, Farquharson, Haines, Rendall or Casaubon. Familiar modern
  quotations from other translations are not used.
- **Text used.** Project Gutenberg #15877, "Thoughts of Marcus Aurelius
  Antoninus", translator George Long, release 2005-05-22, last updated
  2020-12-14. The PG text uses American spelling (honor, vapor, offenses),
  which indicates an American printing of Long's translation; content was
  cross-checked for Book II against Standard Ebooks' Long
  (`https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long`):
  the only differences are spelling convention, punctuation, Standard Ebooks'
  removal of Long's square-bracket supplements, and one word in II.14 (PG
  "that which perish", SE "perishes"; kept as PG has it, noted here).
- **Rights.** George Long died 1879; the translation was published 1862.
  Public domain in the US (pre-1930 publication) and in Denmark/EU (author's
  life plus 70 years, expired 1950). The Project Gutenberg header, footer and
  licence are stripped and the Project Gutenberg trademark is not used, so the
  PG licence terms on trademark use do not attach; the text itself is public
  domain. No attribution obligation exists; the registry should credit Long
  anyway, correctly this time.

## 4. Staged corrected `original-en`

`meditations-original-en.staged.json`
(sha256 `7bf2d1b175854b4adad90984a4bb61226e808a77148ad5f6d06041bacfaff443`),
built by `scripts/build_original_en_from_pg15877.py` from
`source/pg15877-long-1862.txt`. Same schema as the served editions
(`{"chapters":[{"number","title","paragraphs":[…]}]}`), 12 chapters titled
`Book 1` … `Book 12` (the served title style), **487 paragraphs, one per
numbered section** (17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36), 46,088
words. Every paragraph starts with its section number ("1. ", "2. ", …) so
meditation numbering is visible and stable.

Mechanical normalisations applied to Long's PG text (all documented, all
reproducible by running the script):

- PG header, Long's 100-page introduction and essay, all footnotes and the
  indexes are omitted; only the translation body is kept.
- Footnote reference letters `[A]`…`[D]` removed (254 occurrences).
- Long's dagger marks for corrupt Greek, rendered `+` in the PG text, removed
  (50 occurrences; locations: I.9, I.14, I.15, II.6, II.12, II.14, III.3, III.4,
  III.11, IV.18, IV.19 ×3, IV.30, IV.34, IV.46 ×2, IV.50, IV.51, V.9, V.12 ×4,
  V.28 ×2, VI.38, VI.41, VI.50, VII.16 ×2, VII.31 ×2, VII.46 ×2, VII.67,
  VIII.35, VIII.38, VIII.51, IX.6, IX.26, IX.27, X.9, X.19, X.25, X.31, XI.8,
  XI.15, XI.17, XII.16). Drafters and reviewers should treat these passages as
  textually uncertain in the Greek.
- PG illustration captions ("[Illustration: INTERIOR OF THE PARTHENON]" and the
  like) removed. Three had survived the first build, appended to IV.20, V.8 and
  IX.21; found at Book IV step 1 (2026-09-11) and fixed in the script, which
  changed the staged file's sha256 from `7bf2d1b1…` to `b0ecf3da…`. Only those
  three paragraphs changed; the count is still 487; chapters 1–3 byte-identical.
- Long's own square-bracket supplements (e.g. "[I learned]", "[only]",
  "[the world]") are **kept**; they are part of his translation.
- Long's in-text cross-references (e.g. "(vi. 28)" at II.12, "(vi. 44; ix. 28)"
  at VII.75) and his source citations after verse quotations (e.g. "HESIOD,
  Works, etc. v. 197.") are kept as Long printed them.
- PG's `[Greek: …]` transliterations inside the body (VII.13 ×2, VIII.57 ×2)
  rendered as `(Greek: …)`.
- `--` and `---` rendered as an em dash; PG italic underscores removed (one
  case, VII.13 "the letter r").
- Indented verse quotations (V.31, V.33, VII.40, VII.41, VII.43, VII.50, VII.51,
  X.34, XI.6, XI.31, XI.32, XII.3) are joined into the section's paragraph with
  spaces; line breaks are not preserved.
- The manuscript notes "Among the Quadi at the Granua." and "This in
  Carnuntum." are kept as the final sentences of Book 1 §17 and Book 2 §17
  respectively, where Long prints them.
- The first section of each book, unnumbered in Long's layout, is given
  "1. " for uniformity.

## 5. What changes downstream if this replacement is adopted

Recorded for the coordinator and Anders; none of it is done or decided here.

- The served `modern-en`, `modern-da`, the R2 audio for all three editions,
  the static chapter pages under `app/public/read/meditations/`, and any saved
  reading positions key on the served 412-paragraph structure. The corrected
  `original-en` has 487 paragraphs with different boundaries, so adopting it
  means the modern-en staged here replaces the served modern-en wholesale,
  modern-da and audio need regeneration (out of scope, English only), and
  positions for this book will not map across.
- The registry label and translator become true ("Long Translation (1862)",
  George Long). If Anders prefers instead to keep Casaubon and relabel it, the
  modern-en staged here would not align to it; that would be a different task.

## 6. Reproduction

```bash
cd books/staged-replacements/meditations
sha256sum source/pg15877-long-1862.txt    # 6584df7e…
python3 scripts/build_original_en_from_pg15877.py
sha256sum meditations-original-en.staged.json   # 7bf2d1b1…
```
