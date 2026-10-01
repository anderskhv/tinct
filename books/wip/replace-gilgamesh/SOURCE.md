# Source verification — replacement blocked

Retrieval date: 2026-10-01. No source is accepted as a complete deliverable under all current requirements.

## Primary: rejected as a complete base

R. Campbell Thompson, *The Epic of Gilgamish: A new translation from a collation of the cuneiform tablets in the British Museum rendered literally into English hexameters*. London: Luzac & Co., 1928.

Thompson himself passes the death cutoff:

- https://en.wikipedia.org/wiki/Reginald_Campbell_Thompson — “Reginald Campbell Thompson (21 August 1876 – 23 May 1941) was a British archaeologist, Assyriologist and cuneiformist.”
- https://www.nli.org.il/en/a-topic/987007268975705171 — exact library authority heading: “R. Campbell Thompson (1876-1941), (Reginald Campbell)”. Verified with the web reader; direct HTML retrieval returned 403.

However, the printed footnote on p.31 credits the Hittite translation to J. Friedrich and Ungnad; p.36 again credits Friedrich and Ungnad. These are translation credits, not merely bibliographic citations. Therefore Thompson’s death date does not clear every translator contributing to this edition.

- https://en.wikipedia.org/wiki/Johannes_Friedrich_%28linguist%29 — exact date clause: “12 August 1972, in Berlin”.
- https://brockhaus.de/ecs/enzy/article/friedrich-johannes — exact supporting biographical entry: “Friedrich, Johannes, Altorientalist, * Leipzig 27. 8. 1893, † Berlin (West) 12. 8. 1972;” (typographic spacing normalized).

Friedrich fails the user’s 1954 cutoff. No claim is made that every part of Thompson’s own translation is protected; the finding is that the complete assigned base fails the all-contributor rule. User rule 1 requires moving to the approved fallback. Earlier drafts are rejected, not publishable editions.

Raw URLs:

- https://archive.org/details/thompson-1928-gilgamesh
- https://archive.org/download/thompson-1928-gilgamesh/Thompson_1928_Gilgamesh_djvu.txt
- https://archive.org/download/thompson-1928-gilgamesh/Thompson_1928_Gilgamesh.pdf
- https://archive.org/metadata/thompson-1928-gilgamesh

The PDF metadata also reports a modern digital compiler and an embedded Sandars HTML attachment. That attachment was never extracted, opened or read. The raw PDF is retained locally for audit but deliberately not pushed or offered for distribution. The raw OCR remains a rejected research source, never an accepted edition.

## Approved fallback investigated

William Muss-Arnolt, “The Gilgamesh Narrative”, in *Assyrian and Babylonian Literature*, Aldine edition, New York: D. Appleton and Company, 1901, pp.324–369. The contents page attributes the translation to William Muss-Arnolt. Robert Francis Harper supplied the critical introduction. The series front matter additionally names Rossiter Johnson as editor-in-chief and a selection committee; their dates are included conservatively below. No introduction or commentary is included in the diagnostic reading passage.

### Translator

- https://en.wikipedia.org/wiki/William_Muss-Arnolt — exact supporting date clause: “June 25, 1927 in New York”.
- https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997013032349805171/NLI — exact contributor authority heading: “Muss-Arnolt, William ,(1860-1927 author)”. Indexed record retrieved through search; direct page returned 403.

### Introduction editor

- https://www.loc.gov/item/01030867/ — exact Names entry: “Harper, Robert Francis, 1864-1914.” The record identifies New York, D. Appleton and company, 1901. Indexed record retrieved; direct open returned 403.
- https://photoarchive.lib.uchicago.edu/db.xqy?show=browse1.xml%7C1241 — exact Subject Terms entry: “Harper, Robert Francis, 1864-1914”. University of Chicago Library photographic archive, apf1-02465.

### Series editor and selection committee

Each of the following also died before 1955. Quoted headings/date clauses are exact supporting excerpts; a heading or clause is identified as such rather than represented as a complete prose sentence.

- Rossiter Johnson: https://en.wikipedia.org/wiki/Rossiter_Johnson — “Rossiter Johnson (27 January 1840 – 3 October 1931) was an American author and editor.” Independent source: https://archives.nypl.org/mss/1576 — “Johnson died on October 3, 1931.”
- Thomas Brackett Reed: https://en.wikipedia.org/wiki/Thomas_Brackett_Reed — date clause “October 18, 1839 – December 7, 1902”. Independent source: https://history.house.gov/HistoricalHighlight/Detail/35912 — “Retiring to pursue a lucrative law practice to support his family, Reed died on December 7, 1902.”
- Ainsworth Rand Spofford: https://en.wikipedia.org/wiki/Ainsworth_Rand_Spofford — “Ainsworth Rand Spofford (September 12, 1825 – August 11, 1908) was the sixth librarian of Congress.” Independent source: https://www.loc.gov/pictures/item/2010649529/ — title “[Ainsworth Rand Spofford (1825-1908). Sixth Librarian of Congress, 1864-97]”.
- Edward Everett Hale: https://en.wikipedia.org/wiki/Edward_Everett_Hale — date clause “April 3, 1822– June 10, 1909”. Independent source: https://findingaids.loc.gov/agents/people/42427 — authority heading “Hale, Edward Everett, 1822-1909--Correspondence.”
- William Rainey Harper: https://en.wikipedia.org/wiki/William_Rainey_Harper — “Harper died on January 10, 1906, of cancer at age 49.” Independent source: https://www.lib.uchicago.edu/collex/exhibits/building-long-future/harper-memorial-library/ — “William Rainey Harper's death in 1906 was a severe blow to the University of Chicago community.”

Ancient authors are anonymous/pre-1800. No modern adapter is credited for the selected diagnostic passage. Other contributors to unrelated translations in the anthology are excluded; their works are not used.

Raw URLs:

- https://archive.org/details/assyrianbabylon00harp
- https://archive.org/metadata/assyrianbabylon00harp
- https://archive.org/download/assyrianbabylon00harp/assyrianbabylon00harp_djvu.txt
- https://archive.org/download/assyrianbabylon00harp/assyrianbabylon00harp.pdf

### Extraction and blocking independence result

`fallback-verified-passage.json` contains one continuous, complete narrative passage from printed p.330, PDF page 446. It was checked visually against the scan. Only line breaks were removed; spelling, names, words and punctuation were retained. No protected live wording was read. The unchanged coordinate-only checker reports N=10: 1/1 flagged, 21 words in shared runs; N=8: 1/1 flagged, 30 words in shared runs.

This demonstrates a requirement conflict: the fallback’s authentic public-domain original text cannot both retain its source wording and pass a zero N=10 overlap rule against the specified live references. Shared runs do not establish infringement or dependence; a later adaptation can retain public-domain source language. Rewriting the diagnostic paragraph would produce an adaptation, not a clean transcription of this original. Splitting it into artificial fragments to evade the gate would violate the coherent-passage requirement. No such evasion was attempted.

The broader `fallback-probe.json` is an OCR diagnostic across Tablets I–VI, including some apparatus; it is NOT a parsed edition. Its 40/315 N=10 flags are superseded as evidence by the single scan-verified passage.

## Checksums

See `source/download-manifest.json` for SHA-256 and retrieval URLs for every successful raw download. Locally retained Thompson PDF is explicitly marked as not pushed. Rendered scan evidence is derived from the fallback PDF, not an additional download.
