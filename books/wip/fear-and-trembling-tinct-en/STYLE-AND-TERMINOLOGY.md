# Style and terminology standard — Fear and Trembling, Tinct Modern English

Edition label: **Tinct Modern English — translated from Danish**. The source is
Kierkegaard's Danish (3rd ed., Reitzel/Grøn, Copenhagen 1895), corrected as
recorded in `source/CORRECTIONS.md`. This standard extends the accepted pilot
policy (`../fear-and-trembling-clarity-pilot/TERMINOLOGY.md`) to the whole book.
The pilot's Problema I and II are the model for register and density.

## A. Principles

1. **Translate from the Danish only.**
   - Never read or rework any English translation. That includes the served
     `original-en` and `modern-en` and every published translation (Lowrie,
     Hong, Hannay, Walsh, Payne, Kirmmse, Hollander).
   - The wording must be our own.
2. **Make the English comprehensible without explaining the book.**
   - Split long periods so that each sentence makes one move.
   - Make logical connectives explicit where the Danish implies them.
   - Resolve pronouns when the referent would otherwise be unclear.
   - Name the subject when a clause changes subject.
   - Do not add interpretation, summaries, examples or conclusions that the
     Danish does not contain.
3. **Keep everything the source keeps.** That means:
   - every argument, qualification and hedge ("perhaps", "in a certain sense",
     "so to speak");
   - every example and allusion;
   - every rhetorical question and every exclamation;
   - irony and deliberate ambiguity;
   - every paradox, left unexplained where Johannes leaves it unexplained.

   A deliberate ambiguity must not be resolved. An ambiguity that is only a
   matter of grammar should be resolved.
4. **The narrator is Johannes de Silentio.**
   - Keep his first person, his self-deprecation ("I cannot understand
     Abraham", "I lack the courage", "I am no poet"), his satire and his
     lyrical passages.
   - Never attribute claims to "Kierkegaard" in the text.
5. **One Danish term gets one English rendering.** See the tables below.
   - Define a technical term once, at its first occurrence in the book,
     inside the sentence, in a few words. Use a dash or a parenthesis.
   - The definition must be supported by the source or by the dictionary
     sense.
   - After that the term stands alone.
   - The first uses of terms from the pilot sections now fall earlier in the
     book (for example, "spiritual trial" and "incommensurable" first appear
     in the Preliminary Expectoration). Where that happens, give the short
     definition at the new first use. Terms that the text defines itself
     ("the absurd", "paradox") and "the demonic" get no gloss. The exact
     locations are in the table in `DRAFTING-BRIEF.md`. The pilot text is then left as
     accepted, unless the book-level review finds a defect.
6. **Keep Kierkegaard's foreign-language insertions** (Latin, Greek, German,
   French) and add a short English gloss beside them. Restore OCR-garbled
   Greek.
7. **Quote the Bible in fresh modern English**, keeping Kierkegaard's Danish
   wording where it differs (e.g. "soul" for *Sjæl*). Do not use the KJV text
   or any modern copyrighted version wholesale.
8. **Keep the register plain, contemporary and literary.**
   - No archaisms ("hath", "doth", "thee"), except inside Kierkegaard's own
     quotations where the archaism *is* the point.
   - No slang.
   - Short epigrams stay short.
9. **Proper names** use their standard English forms: Abraham, Isaac, Sarah,
   Eliezer, Hagar, Agamemnon, Iphigenia, Jephthah, Brutus, Mary, Faust,
   Margaret. There are two exceptions:
   - Danish legend names are kept: Agnete and the merman.
   - Johannes's own period references are kept, with no gloss unless one is
     essential to follow the sentence.

## B. Structure

- **Printed paragraphing.** The final structure follows the printed
  paragraphing of the 1895 edition, determined from the page scans
  (`source/PRINTED-PARAGRAPHS.md`). It has 184 paragraphs:

  | Chapter | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  |---|---|---|---|---|---|---|---|---|
  | Paragraphs | 4 | 15 | 14 | 35 | 29 | 22 | 61 | 4 |

  The mapping from the served 232 slots is in `STRUCTURE-MAP.md`.
- **One English paragraph per paragraph** of `source/original-da-final.json`.
  Never merge, split, reorder or drop paragraphs. Because paragraphs now match
  the print, no boundary moves are needed or allowed.
- **Footnotes** are Johannes's own footnotes (18 of them; see
  `source/CORRECTIONS.md`). They stay **separately identifiable**:
  - Never put note text or markers into the main text.
  - Translate each note into the `notes` of its paragraph, with the same `id`.
  - Give `anchorAfterEn`: the exact final words of your English main text
    after which the marker belongs. These are the English counterpart of the
    source's `anchorAfter`.
  - How notes are presented to readers and in narration is Codex's decision.
    Review copies show each note as ` [* Note: …]` at the end of its
    paragraph.
- **Section numerals and dividers.**
  - `sectionHeading` (I.–IV. in the Attunement) and `dividerBefore` (rule or
    asterism) are structural fields.
  - Keep them as fields, never in the text.
- **Verse.** Where a Danish paragraph has line breaks (`\n`, the two German
  verse blocks in Problema III), keep the German lines with their `\n`.
  - Give a line-by-line English rendering after the German, in square
    brackets. Use ` / ` between lines.
- **Restored text** (the weaning passages after II and III, "fatte",
  "Havmand i Nærheden") is translated like any other text.

## C. Fixed renderings (whole book)

### From the accepted pilot (unchanged)

| Danish | Rendering |
|---|---|
| det Ethiske | **the ethical** |
| Ethiken, Ethik (the discipline) | **ethics** |
| det Almene | **the universal** |
| den Enkelte | **the single individual** (no free-standing definition) |
| Enkelthed | **particularity** |
| ophæve / hæve | **cancel** |
| τέλος | **telos** (first use: "its end: the purpose it exists for") |
| teleologisk Suspension af det Ethiske | **teleological suspension of the ethical** |
| det Sædelige, Sædelighed | **ethical life** (first use: "the ethics lived out in a people's shared customs and institutions") |
| Pligt / Forpligtelse | **duty** / **obligation** |
| det Absolute | **the absolute** |
| Tro / troe | **faith** / **have faith**, **believe**; den Troende is **the believer** |
| Troens Ridder | **the knight of faith** |
| tragisk Helt | **the tragic hero** |
| Paradox / det Paradoxe | **the paradox** / **whatever is paradoxical**, **something paradoxical** |
| det Absurde; i Kraft af det Absurde | **the absurd**; **by virtue of the absurd** |
| Latterlighed, latterlig | **ridiculous** (never "absurd") |
| urimelig, det Urimelige | **unreasonable**, **the unreasonable** (Eulogy). Kept apart from "the absurd" (*det Absurde*) and from "ridiculous". Ruling of 2026-09-24. |
| martre / pine | **torture** / **wring**, **torture** (never "torment", which is reserved for *Qval*) |
| mediere / Mediation | **mediate** / **mediation** |
| Mellembestemmelse; det Mellemliggende | **middle term** |
| incommensurabel | **incommensurable** |
| Anfægtelse | **spiritual trial** |
| Prøvelse / prøve | **test** / **be tested** |
| Fristelse / friste | **temptation** / **tempt** |
| forsøge (passive: forsøges) | **put to the proof** (for trying/testing a person). Exception: the set adjective *en forsøgt Mand* is "a tried (experienced) man". In Gen. 22:1, "Gud fristede Abraham" is Kierkegaard's Bible wording and is rendered "God tempted Abraham". |
| Angest, Angst | **anxiety**; never "fear" |
| Frygt, frygte | **fear** |
| Nød | **distress** |
| Qval | **torment** |
| Lidenskab | **passion** |
| Salighed | **blessedness** |
| Udfaldet | **the outcome** |
| Docenterne | **the lecturers** |
| Udtryk | **expression** |
| offre / opgive | **sacrifice** / **give up** |
| Inderlighed / Yderlighed | **inwardness** / **outwardness** |
| det Umiddelbare, Umiddelbarhed | **the immediate**, **immediacy** |

### New for the rest of the book

| Danish | Rendering | Note |
|---|---|---|
| Bevægelse | **movement**. "Bevægelserne" is **the movements**. | Kierkegaard's dance and gymnastics image. Keep "movement" even where "move" would be idiomatic. |
| Resignationens Bevægelse; den uendelige Resignation | **the movement of resignation**; **infinite resignation** | Define at first use in the Preliminary Expectoration, briefly, from the text itself: giving up the finite, and finding peace in the eternal. |
| Ridderen af den uendelige Resignation | **the knight of infinite resignation** | |
| Troens Bevægelse | **the movement of faith** | |
| Dobbeltbevægelse | **the double movement** | |
| Uendelighedens Bevægelse | **the movement of infinity** (pilot); "den uendelige Bevægelse" is **the infinite movement** | |
| Spring | **leap** | |
| gaae videre | **go further** | A refrain of the Preface and Epilogue. Always "go further", never "go beyond" or "move on". |
| blive staaende ved | **stop at**, **stay with** | e.g. "stop at faith", "stop at doubt" |
| tvivle om Alt; Tvivl; Tvivler | **doubt everything**; **doubt**; **doubter** | |
| Systemet | **the System** (capitalized) | |
| Spidsborger, Spidsborgerlighed | **philistine**, **philistinism** | Define at first use: "a narrow, comfortable townsman" |
| det Endelige / Endelighed | **the finite** / **finitude** | |
| det Uendelige / Uendelighed | **the infinite** / **infinity** | |
| det Timelige / Timelighed | **the temporal** / **temporality** | |
| Umulighed / umulig | **impossibility** / **impossible** | |
| Virkelighed (the concept) | **actuality** | e.g. "incommensurable with actuality". The idiom "i Virkeligheden" (in real life, in fact) may be rendered idiomatically. The adverb *virkelig* is "really". Ruling of 2026-09-24. |
| Realitet | **reality** | "ideality into reality"; "the reality of his deed" (pilot). In n4.21a both occur: "the whole reality of actuality". |
| tør (turde) | **dare** by default. Use **may not** / **must not** only where the Danish is plainly a prohibition (e.g. ethics forbidding in ch7 ¶35). | Ruling of 2026-09-24. |
| en Enkelt (ordinary Danish) | **an individual**, **someone** | Never the fixed term "the single individual", which renders *den Enkelte* only. |
| fatte / gribe | **comprehend**, **understand** / **grasp**, **seize** | *gribe* is the grasp of faith and resignation. Keep *fatte* apart from it. |
| Skjulthed; skjult | **concealment**; **concealed**, **hidden** | The Problema III pair. Keep it opposed to "disclosure". |
| Aabenbarelse; aabenbare (vb) | **disclosure**; **disclose** | Never "revelation", which is reserved for any Danish *Aabenbaring* (divine revelation). |
| Taushed; tie | **silence**; **keep silent**, **be silent** | Problema III's title uses *fortiede*: "keep silent about … to". |
| tale | **speak** | "Abraham cannot speak" |
| det Æsthetiske; Æsthetiken; æsthetisk | **the aesthetic**; **aesthetics**; **aesthetic** | Defined briefly at first use, in the Preliminary Expectoration ¶22. |
| det Dæmoniske; dæmonisk | **the demonic**; **demonic** | No gloss anywhere; the text itself develops the term. |
| det Interessante | **the interesting** | Johannes's ironic category. Keep it. |
| Skyld; Synd; Anger | **guilt**; **sin**; **repentance** | |
| Forfører / forføre | **seducer** / **seduce** | |
| Havmand | **the merman** | |
| Ironi, Ironiker | **irony**, **ironist** | |
| Ansvar | **responsibility** | |
| Samvittighed | **conscience** | |
| Stemning (chapter title) | **Attunement** | The Danish means the tuning or mood set before a piece. See §D. |

## D. Chapter titles (proposed)

| # | Danish | English |
|---|---|---|
| 1 | Forord | Preface |
| 2 | Stemning | Attunement |
| 3 | Lovtale over Abraham | Eulogy on Abraham |
| 4 | Foreløbig Expectoration | Preliminary Expectoration (Kierkegaard's own odd word: getting something off one's chest) |
| 5 | Problema I | Problema I — Is there a teleological suspension of the ethical? (pilot) |
| 6 | Problema II | Problema II — Is there an absolute duty to God? (pilot) |
| 7 | Problema III | Problema III — Was it ethically defensible for Abraham to keep silent about his undertaking to Sarah, to Eliezer and to Isaac? |
| 8 | Epilog | Epilogue |

- **Chapter 2:** the served "Exordium" is changed to "Attunement", which
  renders *Stemning*.
- **Chapter 4:** the gloss in the table is explanation for the packet only. The
  title itself stays "Preliminary Expectoration".

## E. Sensitive terms

Rousseau's figure in Problema II is rendered without the slur (pilot decision).
Any other period term now read as a slur is handled the same way and recorded.
