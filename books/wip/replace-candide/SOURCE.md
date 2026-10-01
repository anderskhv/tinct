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

## D. Edinburgh 1759 anonymous fallback — screened out

**Candidus; or, All for the Best. By M. de Voltaire. A New Translation.** Edinburgh: Sands, Donaldson, Murray, and Cochran for A. Donaldson, MDCCLIX [1759], ESTC T137620. The title-page/catalogue credits no translator; Folger's record gives only Voltaire as author and identifies the item as a new translation. A contemporary-date anonymous translation is eligible under the assignment's pre-1800 exception, subject to the overlap gate. The second IA volume is the spurious 1761 Part II, not part of Voltaire's novel; it is retained only as an excluded research download.

Bibliographic evidence: [Folger catalogue, ESTC T137620](https://catalog.folger.edu/record/751970), exact record title: “Candidus [electronic resource], or, all for the best. By M. de Voltaire. A new translation.” Imprint and date: “Edinburgh : Printed by Sands, Donaldson, Murray, and Cochran. For A. Donaldson, at Pope's head, MDCCLIX. [1759]”. [Bauman Rare Books, description of the early English translations](https://www.baumanrarebooks.com/rare-books/voltaire-fielding-henry/candid/114098.aspx), exact description: “Finally, an anonymous translation entitled Candidus or, All for the Best was also published by Sands, Donaldson, Murray and Cochran for A. Donaldson.” The first-vol OCR reproduces the title page/imprint; the scan record points to a separate 1761 second part.

Preliminary sample was reconstructed from the first-volume OCR only for screening, not as an edition. At N=10, 2/3 paragraphs flagged; at N=8, 3/3 flagged. It therefore fails the original overlap thresholds. The source was not promoted, and no modern rendering was written from it. Outputs are in `scratch/edinburgh-screening.json`; the word-count coordinates are from the unchanged overlap checker and remain preliminary because this is OCR.

## E. William Walton, 1897–1900 — rights-qualified; rejected by first-paragraph overlap screen

The three-volume collection is titled *The Whole Prose Romances of François-Marie Arouet de Voltaire, now first completely done into English by William Walton*. Volume III includes *Candide; or, Optimism*. The HathiTrust catalogue identifies “Walton, William, tr.” and its full-view item `pst.000000141468` is marked public domain. The title-level catalogue does not identify a separate adapter or narrative editor; illustrations are by separate artists. Before using any text, inspect the source volume's title and apparatus pages to confirm these responsibilities and obtain a complete scan.

Two independent death-date authorities:

1. [Century Association Archives, William Walton](https://centuryarchives.org/staging/member-directory/?PersonID=3148): exact dates “born November 10, 1843” and “died November 13, 1915”. Its 1916 memorial independently states: “Besides, he translated works of Victor Hugo, Flaubert, Lamartine, Dumas fils, Voltaire, and twenty-one volumes of the novels and stories of Balzac.”
2. [Library of Congress, collection record](https://www.loc.gov/item/2005676471/): authority form “Walton, William, 1843-1915.” This is independent corroboration of his death no later than 1954.

The [HathiTrust catalogue record](https://catalog.hathitrust.org/Record/012360957) identifies the book as “now first completely done into English by William Walton” and the related name as “Walton, William, tr.” Its Volume III is `pst.000000141468`, marked public domain. The [Google Books full-view record](https://books.google.com/books?id=DlY6AQAAMAAJ) exposes page images for Volume III; the table of contents locates *Candide; or Optimism* at printed page 35. The first paragraph was read visually from scan sequence 37 in the ordinary page viewer (no bulk download or extraction). A manually prepared one-paragraph screening sample produced one N=10 overlap flag: 26 words inside shared runs. Thus the first paragraph alone fails the zero-flag rule and Walton was rejected at source screening. This was a preliminary visual sample, not a full source transcription or final whole-book gate run; the remaining Walton text was not read or saved. Hathi's [download rules](https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2387247137/What+You+Can+Download+from+the+Collection) distinguish page-at-a-time access to public-domain Google-digitized works from whole-volume downloads for affiliates. Alternate access checks found a [Google Books full-view record for Volume II](https://books.google.com/books?id=pO6Q7lg_or8C) and an [NYPL digital item](https://old-digitalcollections.nypl.org/items/6fde6e16-100a-c6a0-e040-e00a180673f1) that is one still image, not scans of the three-volume text. No text from the screen sample was used in either edition.

## F. Walter Jerrold 1898 lead — not rights-cleared

*Candide; or, All for the Best. A New Translation from the French. With Introduction by Walter Jerrold* (London: G. Redway, 1898) names Jerrold only for the introduction. His death is verified as 1929, but the actual translator is not named or established; post-1800 anonymity does not meet the assignment's exception. The introduction may be omitted, but that does not clear the translator. This scan was inspected only through its title and introductory pages, then removed; it was not used as source text.

## Other candidates not used

Robert Bruce Boswell was investigated bibliographically. Wikidata Q73769944 and Wikisource give 1846–1933, but they are not independent sources; other results contained inconsistent birth years or repeated the same description. A sufficiently independent second date authority has not been established in this package. His translation has not been downloaded or used as a baseline. Do not promote this investigation to rights clearance.

Further catalogue searching on 2026-10-01 surfaced the 1920 Pantheon/Paul Klee edition online at Wikisource. Its own acknowledgment describes the text as Smollett's translation in a special revision by James Thornton. The identified reviser is an additional rights holder whose death date was not verified from two independent sources; this is not a cleared fallback. The 1947 Penguin translation is by John Butt, who is expressly excluded by the assignment. Burton Raffel's translation is a 2006 edition and is also ineligible. These bibliographical leads were not used as source text. References: [Wikisource edition record](https://en.wikisource.org/wiki/Candide); [Yale University Press, Raffel edition](https://yalebooks.yale.edu/book/9780300127782/candide/); [WorldCat, 1947 John Butt edition](https://search.worldcat.org/title/Candide-or-Optimism/oclc/638097930).

Search-result excerpts and catalogue contents were visible during this research. No newly surfaced wording was copied into either edition. The 1920 revision and 1947/2006 named translations were rejected on rights-list grounds before any source text was retrieved.

All expressly rejected translations remain excluded. Bibliographic search occasionally displayed unrequested snippets; see the exposure record in HANDOFF.md. None supplied wording to either pilot edition.

## G. Further source screening (2026-10-01; no candidate promoted)

The 1779 anonymous London edition, *Candidus; or, All for the Best. Part I*, was screened as a new pre-1800 candidate. The Wellcome catalogue identifies the work/date and says it was “Newly translated from the French of M. de Voltaire”; its public-domain ECCO full text is linked there: https://wellcomecollection.org/works/hf429a5t. Internet Archive item `bim_eighteenth-century_candidus-or-all-for-th_voltaire_1779` supplies the scan/OCR: https://archive.org/details/bim_eighteenth-century_candidus-or-all-for-th_voltaire_1779. Part I was screened separately from the spurious continuation (Part II). A conservative OCR-block screen of 437 blocks/35,247 words flagged 54/437 blocks at N=10 and 118/437 at N=8; both exceed the requirements. Its Chapter I pilot alone had 0/17 OCR blocks flagged at either threshold, but this does not rescue the full source. No edition text was drafted from it.

Two further early scans were screened and rejected: a 1760 Cooper printing (`bim_eighteenth-century_candide-english-cand_voltaire_1760`) has an N=10 flag in a single 965-word Chapter-I screening unit; the 1773 Edinburgh printing (`bim_eighteenth-century_candidus-or-all-for-th_voltaire_1773`) has an N=10 flag in a single 1,998-word Chapter-I screening unit. These coarse chapter-wide screens are exclusion tests only, not paragraph-level gate results. Neither was promoted or used in the pilot.

The 1888 Routledge volume *Voltaire’s Candide or the Optimist and Rasselas* was rejected before source use. Its title page credits Henry Morley with the introduction, not the translation. A contemporary account explicitly says the translation was only tentatively attributed to Tobias Smollett, states there was no proof, and says it was unlikely to be his; therefore this post-1800 anonymous translation is not rights-cleared. George Saintsbury, *The Life of Tobias George Smollett* (1897), scan/OCR: https://archive.org/details/lifeoftobiasgeo00saingoog. A brief search-result excerpt was seen during bibliographic discovery, not copied or used; this is disclosed in HANDOFF.md.

The 1945 A.B. Walkey bibliographic lead was not promoted. Langille and Brooks list it as translated by “A.B. Walkey” (2001 bibliography: https://epe.lac-bac.gc.ca/100/201/300/literary_research-ef/n28-n36/no36/articles/ArticlesLangilleBrooks.htm), but no title-page image or independent authority establishing this translator was located. The name may be a misspelling of Arthur Bingham Walkley, whose death is dated 1926 by the National Portrait Gallery: https://www.npg.org.uk/collections/search/person-list?desc=&displayNo=60&firstRun=true&gender=&grp=&name=&occ=&page=1213&place=&search=aas&searchCatalogue=&submitSearchTerm_x=29&submitSearchTerm_y=11. A 1922 *History of Candide* catalogue record says only “Introduction signed: A.B. Walkley” (National Library of Ireland, https://catalogue.nli.ie/Collection/vtls000623424), which does not establish translation authorship. The same bibliography also describes the 1945 text as a private reprint of the 1762 Smollett-and-others version in one entry, leaving the claimed Walkey role unclear. No Walkey/Walkley text was retrieved or used. The separately listed 1945 Maxime Portaz translation was not pursued because biographical references identify Maximine/Maxime Portaz with Maximiani Portas (Savitri Devi, d. 1982); it is not eligible under the date rule.

Across the candidate sources so far, every eligible full translation screened at source level has failed the unchanged original-text overlap requirement; other leads remain rights-unverified or explicitly ineligible. No source meets all assignment gates, so no source has been selected beyond the reproducible Nourse Chapter-I pilot. Retained research OCR and metadata have individual hashes in `source/downloads.json` and `source/SHA256SUMS`; the scanned candidate materials and OCR retained for this research batch are included in the source checksums.

## H. Henry Morley, 1922 — rights-qualified; text access blocked

NYPL's [catalogue record](https://old-digitalcollections.nypl.org/collections/candide-or-the-optimist) gives the responsibility statement “Translated into English with an introduction by the late Henry Morley” and identifies Morley (1822–1894) as translator. Independent death evidence: [Oxford Dictionary of National Biography](https://doi.org/10.1093/ref:odnb/19286), “Morley, Henry (1822–1894)”; and the [Dictionary of National Biography](https://en.wikisource.org/wiki/Dictionary_of_National_Biography%2C_1885-1900/Morley,_Henry), which states he died 14 May 1894. HathiTrust's [catalogue search results](https://catalog.hathitrust.org/Search/Home?lookfor=Candide%20Henry%20Morley&type=all) identify the 1922 item as `mdp.39015003752063`, but label it “Limited (search only).” NYPL exposes only two illustrations, not the narrative pages. Internet Archive's metadata search returned only 1884 and 1888 Morley-associated composite editions; neither is the 1922 translation (the 1888 record credits Morley with an introduction). No public, unrestricted full-text copy of the 1922 translation was found. The source was not accessed or screened. Do not substitute the 1888 composite or the 1948 revised Folio edition. Morley remains a rights-cleared lead, not a source that passed the unchanged overlap gate.

The 1919 *Candide* attributed to Dorset Chambers is ineligible: the pen name identifies Herman Irwell Woolf (1890–1958), past the cutoff. [Open University Reading Experience Database](https://www.open.ac.uk/Arts/reading/UK/record_details.php?id=28940) identifies Chambers as Woolf; [Varshavsky Collection](https://varshavskycollection.com/translator/woolf-herman-irwell-chambers-dorset-british-1890-1958/) gives his dates. This translation was not read or used.

The 1937 Everyman's Library reprint of Smollett's translation is not cleared: a scholarly catalogue identifies the text as “translation by T. Smollett; revised by James Thornton,” and a library authority record dates Thornton 1906–1969. Sources: [CiNii Books](https://ci.nii.ac.jp/ncid/BA19025510) and [Sacred Heart University catalogue authority](https://libcatalog.sacredheart.edu/cgi-bin/koha/opac-detail.pl?biblionumber=5107&shelfbrowse_itemnumber=4183). Thornton is an additional post-cutoff rights holder. No text from this edition was read or used.

The 1896 “new translation by [W.M.T.]” remains unverified. The Langille and Brooks bibliography establishes the imprint and initials but does not identify the translator. No independent identity/death evidence or suitable scan was found; it was not read or used.
