# Candide replacement source research — not an accepted edition

Retrieval/review date: 2026-10-01. All raw files are retained under `source/`; `source/downloads.json` records their URLs, dates, and SHA-256 hashes. `source/SHA256SUMS` also covers locally assembled retrieval records. Screening samples are not complete editions.

## A. Verified source used for the chapter-I pilot

Voltaire, **Candid: or, All for the Best. Translated from the French of M. de Voltaire. The Second Edition, carefully revised and corrected.** London: printed for J. Nourse at the Lamb opposite Katherine-Street in the Strand, MDCCLIX [1759]. ESTC T137685. Anonymous English translator and contemporary reviser; no named editor or adapter appears on the title page. No modern introduction, notes, or editorial apparatus is included.

Raw scan: https://archive.org/details/candidorallforb00voltgoog — Oxford University copy digitized by Google, Google Books ID 40cGAAAAQAAJ. The actual title page (PDF page 8) was inspected visually. Printed text begins on PDF page 14 / printed page 1. The scan has 149 PDF pages; the novel has 132 printed pages and thirty chapters. The Google automatic contents metadata is unreliable; use the printed contents and text.

Independent rights/provenance evidence:

1. [Bauman Rare Books, first English edition description](https://www.baumanrarebooks.com/rare-books/voltaire-fielding-henry/candid/114098.aspx), exact supporting sentence: “That anonymous translation, entitled Candid, or, All for the Best was first announced to the public by Nourse on May 22, 1759.” This identifies the Nourse translation as anonymous and pre-1800; its following discussion identifies the same-year revised second edition.
2. [Angelo State University collection guide, Table 4, item 0923](https://www.angelo.edu/live/files/24790-wall-public-rtpdf), exact supporting sentence: “It was translated anonymously and published by Jean Nourse.” Author-date evidence on the same entry: “Born 1694 in France and died in 1778 in France”. The web research service retrieved this PDF; a direct local download returned HTTP 404, so no local raw PDF or fictitious hash is supplied.
3. [ESTC record reproduced by the Grub Street Project](https://www.grubstreetproject.net/publications/T137685/), exact imprint: “London: printed for J. Nourse at the Lamb opposite Katherine-Street in the Strand, MDCCLIX. [1759]”. Edition field records the second edition. Neither the translator nor a separate reviser is identified.
4. [Folger catalogue, record 752034](https://catalog.folger.edu/record/752034), exact authority label: “Voltaire, 1694-1778. author.” Same ESTC number, title, imprint and extent. The Folger/Grub Street records reproduce the same ESTC data and are **not counted as two independent authorities**.
5. The actual scan title page independently confirms the 1759 imprint and anonymous attribution. Its exact edition statement is “The Second Edition, carefully revised and corrected.”

Application of the assignment's rights rule: Voltaire died in 1778; the unnamed translator and unnamed contemporary reviser belong to the documented 1759 edition, satisfying the explicit anonymous/pre-1800 exception. No modern editor's prose is reproduced. This is a source-provenance decision, not a conclusion that later overlapping editions have been cleared.

The second IA witness, `bim_eighteenth-century_candid-or-all-for-the-_voltaire_1759_0`, also identifies ESTC T137685. Its OCR was consulted as an aid, never substituted for visual inspection of the Oxford scan.

### Extraction decisions and pilot verification

Only Chapter I has been transcribed and freshly rendered. Its eight source paragraphs were checked visually against printed pp. 1–4 / PDF pp. 14–17. Opening and ending were checked; the rest of the novel has **not** been transcribed or certified complete. Chapter title is taken from the text, with the label expanded from CHAP. I. to Chapter I.

Preserve original vocabulary, punctuation, spelling (including `mastifs`, `docil`, and `eat`), character names, and paragraph boundaries. Retain the source's omission of quotation marks around reported dialogue. Long s is transcribed as ordinary s, ligatures as their component letters, and typographical line-break hyphens/catchwords/page signatures are removed. Apostrophes use curly U+2019 consistently; repeated ellipsis dots and the em dash are retained. Italic/small-cap styling is flattened without changing words. These are transcription conventions, not paraphrasing. The same conventions apply to the modern pilot.

The original paragraph about the baroness's weight does not state a unit; the modern pilot deliberately does not invent one. No wording from another translation was used to fill the source's ambiguity.

**Not acceptable under current overlap gate:** Chapter I flags 8/8 original paragraphs at both N=10 and N=8. The fresh modern rendering flags 0/8 at both thresholds. See saved coordinate-only outputs. Altering the source paragraphs to remove these matches would contradict the requirement to preserve the printed translation.

## B. Smollett/Francklin fallback research

The 1762 edition is documented at [Google Books, spSDhGhnusIC](https://books.google.com/books?id=spSDhGhnusIC) and [Wikimedia catalogue description of the 1762 frontispiece](https://commons.wikimedia.org/wiki/File:VoltaireCandidFrontis%2BChap01-1762.jpg). Google PDF/plain-text access failed (web service HTTP 403; direct request HTTP 429). No bypass was attempted.

Named contributors' date evidence:

- [Wikipedia, Tobias Smollett](https://en.wikipedia.org/wiki/Tobias_Smollett): “Tobias George Smollett (bapt. 19 March 1721 – 17 September 1771) was a Scottish writer and surgeon.”
- [Spanish state archives, PARES authority 273131](https://pares.cultura.gob.es/ParesBusquedas20/catalogo/autoridad/273131): “Persona - Smollett, Tobias (1721-1771)” and death field “Livorno (Toscana, Italia) en 1771-09-17”. Retrieved through web research; direct download timed out.
- [Wikisource, Thomas Francklin](https://en.wikisource.org/wiki/Author:Thomas_Francklin): “Thomas Francklin (1721–1784)”.
- [Wellcome Collection catalogue](https://wellcomecollection.org/works/b97tpcyh): “Francklin, Thomas 1721-1784.” This independently corroborates the date.

IA item `worksmdevoltair01unkngoog` is volume XVIII of the **dramatic** works, not the requested prose volume. Its opening is *Zara*. Excluded; not used as a Candide source.

IA microfilm identifiers dated `1765` are misleading: the OCR title pages for `_1765_18` and `_1765_23` print **MDCCLXXX (1780)**. Volume XXIII contains historical additions, not Candide. Volume XVIII contains Candide plus a spurious second part. The named translators are Francklin and Smollett, “and others”; any unnamed original contributors are pre-1800. Only the first part's contents and opening text were screened. Notes, the second part, and other works are excluded from any candidate edition. A final baseline would require visual verification of the actual imprint and text, rather than relying on the catalogue date.

The 1780 volume-XVIII chapter-I paragraph 2 sample flags at N=10 and N=8. `scratch/smollett-screening.json` contains that one paragraph; its reported candidate coordinate 1:1 means source I:2. This is a preliminary exclusion test, not a complete verified edition.

## C. William Rider fallback

**Candidus: or, the Optimist. By Mr. de Voltaire. Translated into English by W. Rider, M.A. Late Scholar of Jesus College, Oxford.** London: J. Scott and J. Gretton, 1759. IA `bim_eighteenth-century_candidus-or-the-optimi_voltaire_1759_0`. A separate Dublin 1759 witness is `bim_eighteenth-century_candidus-or-the-optimi_voltaire_1759` (ESTC T153254), printed for James Hoey, jun. and William Smith, jun. The witnesses are kept distinct; no composite text has been made.

Independent date/attribution evidence, reviewed before reading the translation:

1. [Wikipedia, William Rider](https://en.wikipedia.org/wiki/William_Rider), exact sentence: “William Rider (1723 – 30 November 1785) was an English historian, priest and writer.” Its works section identifies his 1759 Candide translation.
2. [American Antiquarian Society Proceedings, printed p. 170, entry 1295](https://www.americanantiquarian.org/proceedings/44497994.pdf), exact sentence: “William Rider (1723–1785) was a minor English author.” This is independently published bibliographical scholarship.
3. The 1759 source's title-page OCR expressly credits W. Rider and his Jesus College affiliation. The translator's dates and identity are corroborated above. No later editor or adapter is credited in this contemporary edition.

The initial three reconstructed London paragraphs have zero N=10 flags but two N=8 flags. Whole-file **uncorrected OCR screening** finds 31/951 OCR blocks flagged at N=10. OCR blocks are NOT source paragraphs and must not be presented as a final paragraph count or final gate. This screening retains OCR errors; it is useful only for locating likely disqualifying exact matches. It does not certify that every match survives scan verification.

## Other candidates not used

Robert Bruce Boswell was investigated bibliographically. Wikidata Q73769944 and Wikisource give 1846–1933, but they are not independent sources; other results contained inconsistent birth years or repeated the same description. A sufficiently independent second date authority has not been established in this package. His translation has not been downloaded or used as a baseline. Do not promote this investigation to rights clearance.

All expressly rejected translations remain excluded. Bibliographic search occasionally displayed unrequested snippets; see the exposure record in HANDOFF.md. None supplied wording to either pilot edition.
