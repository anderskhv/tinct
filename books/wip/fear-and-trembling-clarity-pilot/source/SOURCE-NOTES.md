# Source used for the pilot, and corrections applied

## Established source

The pilot is translated from the **Danish original**, *Frygt og Bæven. Dialektisk
Lyrik af Johannes de Silentio*, **3rd edition ("Tredie Udgave"), C. A.
Reitzels Forlag (George C. Grøn), Copenhagen, 1895**, issued as volume I of
*Udvalgte Skrifter af S. Kierkegaard*. The copy is a Google scan of a
University of California library volume: Internet Archive item
`frygtogbvendial00kiergoog`. The title pages are at lines 138–168 of
`books/raw/fear-and-trembling/raw.txt`.

Kierkegaard died in 1855, and the 1895 printing is more than 125 years old. The
text is in the public domain everywhere.

- Served file: `app/public/data/editions/fear-and-trembling-original-da.json`,
  sha256 `c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a`
  (git blob `ecbd80a3`). It has not changed since commit `ae1b7cb58`
  (2026-04-25).
- Extract used for review: `source/original-da-sections-5-6.json`.

`books/raw/fear-and-trembling/SOURCE.md` calls the scan a "1980 reprint". That
is wrong. The scanned title page reads 1895. The correction is recorded here and
the shared file is left untouched, because the assignment is content-only.

## Coordinates confirmed

| Reader section | JSON index | Danish title | English title | Slots |
|---|---|---|---|---|
| 5 | `chapters[4]` | Problema I — Gives der en teleologisk Suspension af det Ethiske? | Problema I | 32 (¶0–31) |
| 6 | `chapters[5]` | Problema II — Gives der en absolut Pligt mod Gud? | Problema II | 29 (¶0–28) |

The earlier spot checks covered "sections 5 and 6, the openings of Problema I
and Problema II". Those coordinates are correct: `chapters[4].paragraphs[0]`
begins "Det Ethiske er som saadant det Almene …" and
`chapters[5].paragraphs[0]` begins "Det Ethiske er det Almene, og som saadant
igjen det Guddommelige." The slot counts are the same in `original-da`,
`original-en` and `modern-en`.

## Collation of the served Danish against the raw 1895 OCR

The served paragraphs were collated word by word against raw.txt lines
2301–3634, after running heads, page numbers and end-of-line hyphenation were
stripped. The comparison used Python `difflib`. It found three substantive
losses in the served Danish. The pilot restores all three:

| Where | What the served Danish lacks | Pilot handling |
|---|---|---|
| P-II ¶7, end | The final word **"fatte."** ("… hvilket jeg endnu bedre kan *fatte*"). The page break dropped it, so the served slot ends mid-sentence. | Restored: "which I can grasp even better." |
| P-I ¶31 | Kierkegaard's footnote on "Troen er en Lidenskab": the Lessing / Edward II / Diderot note with its German quotation (raw.txt 2944–2965) | Translated and attached as `notes[paragraph=31]`. The German is kept and an English rendering is given. |
| P-II ¶24 | Kierkegaard's footnote on "af sin ganske Sjæl" about the wish/duty collision (raw.txt 3503–3524) | Translated and attached as `notes[paragraph=24]` |

The served `original-en` and `modern-en` omit both footnotes too, and they
render the truncated P-II ¶7 without the final clause. The footnotes are kept
outside the aligned paragraph array, so the 32/29 alignment is unchanged. How
footnotes should appear in the reader is a separate product decision.

## OCR readings silently normalized

These are mechanical restorations, not translation choices:

- τέλος for "7s4oc", "tsåoc", "rs4os", "7s40s", "z+4os", "rsios"
- σκάνδαλον for "oxavdalov" (P-I ¶21)
- μισεῖν … per μείωσιν for "440&v … per uwwor" (P-II ¶8)
- κατ' ἀναλογίαν for "zar avadoyrar" (P-II ¶9)
- "nihili facio" for "nihili facto"
- das Äussere / die Entäusserung for "das Åussere / die Entåusserung"
- ɔ: ("that is") for "9:" and "2:"
- "v. 687" for "v. 68 7."
- "Secler" read as shekels (thirty pieces of silver)
- "Datter" for "Dailter" (P-II ¶11)
- Bäuerin for "Baderin" in the Lessing quotation

## Slots that begin or end mid-sentence (page-break artefacts)

These are artefacts of the page-break parse, and they are shared by every served
edition: P-I 20/21, 25/26, 30/31; P-II 2/3, 11/12, 13/14, 16/17, 20/21, 24/25.
The pilot keeps each slot's content in that slot. Where a slot would otherwise
begin or end on a fragment, it moves the smallest possible piece across the
boundary (at most one clause) so that both slots read as whole sentences. P-II
13/14 is the exception: the source there is one sentence split into two very
short slots, so the pilot keeps the split with a dash. Every such move is listed
in `comparison/CHANGES.md`.
