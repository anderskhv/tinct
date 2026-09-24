# Frygt og Bæven (3rd ed., Reitzel/Grøn 1895): corrected Danish source

Files in this folder:

- `original-da-corrected.json`: the corrected, slot-aligned Danish text. It has 8 chapters and 5/13/17/42/32/29/88/6 slots, the same as `app/public/data/editions/fear-and-trembling-original-da.json`. Each slot keeps its main text. The main text, footnotes and section numerals were rebuilt from `books/raw/fear-and-trembling/raw.txt`.
- `check_corrected_source.py` and `check-output.txt`: the verification script and its output (result: **PASS**). It removes junk from the raw OCR, applies every documented token correction, and requires the result to equal the corrected main text and notes token for token. It found 0 unexplained differences, 0 lost words and 0 duplicated words.
- Every slot carries its own `corrections` list. Token-level changes use the form `cat: ⟦old⟧→⟦new⟧ (raw LINE)`, and the check script reads that syntax.

Conventions:

- Footnote ids are `n{chapter}.{markerSlot}{a|b}`.
- The marker is `*`, or `**` for the second note on a printed page (n7.15b, n8.5b).
- The OCR renders note markers as `+)`, `”)`, `")`, `>)`, `%")` or `””)`. They are removed from the text, and `anchorAfter` gives the last words before the marker, exactly as they appear in the anchor slot.
- Notes also carry `status` (how the served edition handled them), `rawLines`, `ownSlot`, `anchorSlot`, and `part`/`partsTotal` when a note is split across slots.
- Quotation marks are normalized to „…“. The OCR shows opening quotes as `,` `»` `.,` and closing quotes as `"` `”`. The glyph shape is a normalization; the position of each quote is as printed.

## 1. Footnotes (18 notes)

Summary of how the served edition handled the 18 notes:

- **Spliced** into main text: 5, one of which (n4.22a) was also mostly missing.
- **Own slot** (the whole served slot was note text): 8 notes. Seven sit wholly in own slots; the eighth is n7.47a, whose second part is in an own slot while its first part was missing.
- **Missing** entirely: 5. Two more notes were partly missing (n4.22a and n7.47a).

The caller's list had 15 note bodies. Three more were found:

- **n4.2a**: marker at raw 1078 `prædiker ”).`, body at 1105-1110 (the OCR reads the leading `*)` as `t(`). This is Kierkegaard's note "I gamle Dage sagde man …", and the served edition had spliced it into ch4 slot 4, in the middle of the sentence "…myrde Isaak, det | religieuse er…".
- **n7.15a**: marker at raw 3971 `Andet”)`. This is a real note (body 3982-4007) and occupied ch7 slot 16 on its own.
- **n7.15b**: marker at raw 3979 `ikke%")`. Its body runs from 4009 to 4011 and continues at 4052-4060 on the next page.

Raw line 323 `Ødelæggelse")` is a closing quote followed by a closing parenthesis, not a note. It is kept as `Ødelæggelse“)`.

| id | marker | marker slot | anchorAfter | served edition | raw lines | words | placed in corrected JSON |
|---|---|---|---|---|---|---|---|
| n4.2a | * | ch4 s2 | til i Verden som Præsten prædiker. | spliced into slot 4 | 1105-1110 | 55 | s2 |
| n4.21a | * | ch4 s21 | sig oversætte fra Idealiteten til Realiteten. | spliced into slot 21 ("…thi dette Øie- +) Det følger …") | 1707-1714 | 63 | s21 |
| n4.22a | * | ch4 s22 | det om, at Bevægelsen skeer normalt. | last 6 words (tail "ein seliger Sprung in die Ewigkeit.") spliced at end of slot 22; first 147 words missing | 1740-1758 | 153 | s22 |
| n5.31a | * | ch5 s31 | alt Menneskeliv enes, er i Lidenskab, | missing (Lessing note) | 2944-2965 | 181 | s31 |
| n6.24a | * | ch6 s24 | elsker Isaak af sin ganske Sjæl. | missing (wish/duty note) | 3505-3525 | 207 | s24 |
| n7.15a | * | ch7 s15 | Angst kunne opdage Eet og Andet. | own slot 16 | 3982-4007 | 237 | s16 ownSlot |
| n7.15b | ** | ch7 s15 | holde Bryllup. Mere behøver jeg ikke. | spliced into slot 17 (start of slot, plus "røver. Dette er … Tempelrøver." in the middle of "behjælpelig \| med") | 4009-4011, 4052-4060 | 100 | s15 |
| n7.19a | * | ch7 s19 | samme Stiil som Axel og Valborg. | own slots 20 and 23 (note continues on the next page) | 4142-4149, 4175-4199 | 71+240 | s20 ownSlot part 1/2; s23 ownSlot part 2/2 |
| n7.27a | * | ch7 s27 | har tilladt mig en lille Forandring | own slot 28 | 4340-4371 | 296 | s28 ownSlot |
| n7.33a | * | ch7 s33 | kun fatte, hvori det Grandiose ligger. | spliced into slot 34 (at the start, and "…Et lyk-" / "keligt Ægteskab! … Pecus." later) | 4456-4458, 4491-4507 | 161 | s33 |
| n7.34a | * | ch7 s34 | paa noget Punkt i det Foregaaende. | own slot 36 | 4544-4553 | 68 | s36 ownSlot |
| n7.37a | * | ch7 s37 | med Angst og Gru kan opdage, | own slot 38 | 4633-4640 | 76 | s38 ownSlot |
| n7.47a | * | ch7 s47 | om Faust. Faust er en Tvivler, | first part (322 words, ironist/Aristophanes) missing; continuation (108 words, "Tilværelsen. Jeg fordrer …") in own slot 50 | 4952-4983, 5018-5028 | 322+108 | s47 part 1/2; s50 ownSlot part 2/2 |
| n7.67a | * | ch7 s67 | von Bruderpflicht? Wer sprach von Liebe? | missing ("Cfr. 2. Akt 1. Scene.") | 5293 | 5 | s67 |
| n7.77a | * | ch7 s77 | til pathetisk at holde ham oppe. | own slot 79 | 5460-5470 | 97 | s79 ownSlot |
| n7.81a | * | ch7 s81 | i Tausheden, Abraham kan ikke tale. | own slot 83 | 5517-5521 | 45 | s83 ownSlot |
| n8.5a | * | ch8 s5 | Flod. | missing (Greek Cratylus quotation) | 5729-5731 | 26 | s5 |
| n8.5b | ** | ch8 s5 | kan end ikke gjøre det eengang. | missing (Tennemann reference, not in caller's list) | 5733 | 9 | s5 |

Notes on the table:

- Own-slot notes keep their slot, with `text: ""`. Where a note fills two served slots (n7.19a) or is part missing and part own-slot (n7.47a), each served slot keeps its own portion as `part` n/`partsTotal`. This keeps the slot correspondence with the English editions.
- The anchor of n8.5a is just "Flod." because ch8 slot 5 begins with that word. The sentence starts at the end of slot 4 ("…gjennem den samme").
- The served slots that had note text spliced in record `removed spliced footnote text of …` in their corrections: ch4 s4, ch7 s17 and ch7 s34.

## 2. Restored main text, boundary rejoins, section headings, removed junk

| where | change | raw lines |
|---|---|---|
| ch2 s6 (end of variation II) | restored weaning passage "Naar Barnet er blevet stort og skal vænnes fra … tabte Moderen!" (29 words) | 475-478 |
| ch2 s8 (end of variation III, which spans s7-s8) | restored weaning passage "Naar Barnet skal vænnes fra, da er ei heller Moderen uden Sorg … at sørge mere!" (61 words) | 508-513 |
| ch6 s7 | restored final word "fatte." (lost at a page break) | 3165 |
| ch7 s12 | restored the opening dash "— Æsthetiken fordrede Aabenbarelse …" | 3939 |
| ch7 s39 | restored the opening dash "— alene denne Forestilling …" | 4648 |
| ch7 s27 | **conjectural** insertion "i": "at der er en Havmand **i** Nærheden" (word lost at the page break before a footnote; the sentence requires it; medium-high confidence) | 4337/4377 |
| ch4 s21/s22 | hyphen rejoin across the slot boundary: "Øie-" (s21) + "blik" (s22), with note n4.21a printed between. Kept as "Øieblik" at the end of s21; s22 now begins "er Liv og Død." | 1704/1718 |
| ch2 s3, s6, s7, s9 | `sectionHeading` I., II., III., IV. (OCR "I.", "IT.", "III.", "IV." on their own lines, dropped in served). I. stands before the Genesis motto "„Og Gud fristede Abraham …" in s3. | 390, 455, 484, 516 |

Removed from the served text because it is OCR junk or a printer's signature mark:

- "3?" (ch4 s11)
- "G?" (ch6 s13)
- "9:" (ch7 s71)
- "1ot' > . u '" (ch7 s15)
- "…, NE |" (ch3 s7)
- "nl" (ch3 s12)
- "|" (ch4 s27)
- stray `.` specks

Split-word fragments from spliced notes ("røver." in ch7 s17 and "keligt" in ch7 s34) went with their notes.

Headings dropped from the text stream because they are already carried by the served chapter titles:

- raw 950 "Problemata." This is the part-title that stands above "Foreløbig Expectoration." and Problema I-III, and **no served title carries it**. Translators may want it as a part heading.
- raw 953 "Foreløbig Expectoration."
- Problema I-III with their subtitle lines (2301/2304-05, 2968/2971, 3635/3638-40).

Other slot situations were left as served, following the rule not to move main text. For example, ch7 s15 ends "I Delphi gik denne", and the sentence continues in s17 after the own-slot note s16. ch7 s22 "…at han skal" continues in s24 "tale." after the own-slot note s23.

## 3. OCR corrections of substance

### Greek (18 corrections)

| raw | OCR | corrected | confidence |
|---|---|---|---|
| 2312, 2313, 2316, 2335, 2340, 2562, 2571 | 7s4oc, tsåoc, 7sAog, rs4os, 7s40s, z+4os, rsios | τέλος | high |
| 2730 | oxavdalov | σκάνδαλον | high |
| 3183 | 440&v | μισεῖν (Luke 14:26 "hate") | high |
| 3184 | per uwwor | per μείωσιν (litotes, "betyder: minus diligo …") | medium-high (OCR is badly damaged; the sense is certain) |
| 3199 | zar avadoyrar | κατ’ ἀναλογίαν | medium-high |
| 3722-23 | dvo ur ovv Tov uvdov usQn, TT8Qs TAVT 8071, TTEQITETELG XL VAYVWQLGIS | δύο μὲν οὖν τοῦ μύθου μέρη, περὶ ταῦτ’ ἐστί, περιπέτεια καὶ ἀναγνώρισις (Poetics 1452b) | high for the words (the word count and shapes match); accents and breathings follow the standard text |
| 3725 | &rgyvwgrøs | ἀναγνώρισις | high |
| 3732 | tsgsnsres« og avayvwgss | περιπέτεια og ἀναγνώρισις | medium (the case forms are inferred from "som … carambolere") |
| 4637 (n7.37a) | yvwde oavrov | γνῶθι σαυτόν | high |
| 4736-37 | zavrugs yde ovders ”Eqwru ågvyev 1) pævEstan, MÉyor dv xakkos 1 xæl ogdauo Båtmwoiwv | πάντως γὰρ οὐδεὶς Ἔρωτα ἔφυγεν ἢ φεύξεται, μέχρις ἂν κάλλος ᾖ καὶ ὀφθαλμοὶ βλέπωσιν (Longus, proem 4) | high for the text; μέχρις rather than μέχρι is read from the OCR "MÉyor" (medium) |
| 4993 | xar'soynv | κατ’ ἐξοχήν | high |
| 5729-30 (n8.5a) | Kar Totaeuov Qon arTsx«lwæv TX ovre Åsyst vis dis &5 Tov (vTov motquor ovx sufæins | καὶ ποταμοῦ ῥοῇ ἀπεικάζων τὰ ὄντα λέγει ὡς δὶς ἐς τὸν αὐτὸν ποταμὸν οὐκ ἂν ἐμβαίης (Cratylus 402a) | high: 16 OCR tokens for 16 Greek words, with matching shapes |

The elision mark is written ’ (U+2019). The 1895 accentuation cannot be checked from the OCR, so standard polytonic spelling is used.

### Latin and French (17 corrections)

These are in the Preface's Descartes quotations and elsewhere:

- lumint→lumini
- -potius→potius
- me-/- thodum→methodum (hyphen rejoin)
- sequti→sequi
- exæponere→exponere
- juventulis→juventutis
- discendt→discendi
- magtisque→magisque (read "magis magisque")
- dira mnecessitas→dira necessitas
- realister→realiter
- nihili facto→nihili facio
- én discrimine rerum→in discrimine rerum
- éo ipso→eo ipso (×2)
- arqumentam ad hominem→argumentum ad hominem
- (T'heologia viatorum)→(Theologia viatorum)
- DEeCUS→Pecus
- condtitio→conditio
- French (Boileau): qui Vadmire→qui l'admire

The Latin quotation opened at raw 229 ("(„Memores") has no printed closing quote, and that was left as it is.

### German (26 corrections)

- Umlauts, which the OCR reads as å, i or a, in the Lessing note n5.31a: Bäuerin, Umstände, Ausdrücke, Betrübniss, verständige, wahrscheinlicher, nämlichen, würde, hätte, Königin, können, müssen, König. Also "Såmtliche." became "Sämtliche W.", **low-medium confidence**: the print may have "Sämmtl." or "Sämmtliche".
- Schäfer-Historier; das Äussere / Entäusserung; „Vollmachtbrief zum Glücke“.
- Richard III (Schlegel-Tieck), raw 4861-68: geprägt, brüsten, verkürzt, schönes, Geschändet, tückischen, hink'.
- Richard III 2.1, raw 5279-81: für ihn, kniet', Füssen, überlegen. The last verse ends "Wer sprach von Liebe?". The OCR shows `Liebe").`, so the "?" is restored by analogy with the preceding verses (**medium confidence**).

### Names (6 corrections)

- Åristotetes→Aristoteles
- Aguete, Agne'e→Agnete
- Sares→Saras
- Minchhausen→Münchhausen
- Margrele→Margrete

Also, under OCR: Abrabam→Abraham (×2), Årarat→Ararat, Ågamemnon→Agamemnon, Cilharspiller→Citharspiller, lsaak→Isaak.

### Numbers and sigla

- "paa den åde Dags Morgen" / "paa den åde Dag" / "op paa den åde" became **4de** (the fourth day) at raw 403, 463 and 2274. High confidence.
- `$`→§ at raw 239 and 5521 (n7.81a), and `$8`→§§ at raw 324.
- "(v. 68 7.)"→"(v. 687.)".
- iste→1ste; ister→1ster (n8.5b); Zden→2den.
- "4å Heste"→"4 Heste" (medium).
- ɔ: (id est) is read by the OCR as `9:`, `2:`, `3:`, `a:` or `(2:`. It was restored 14 times.
- "1" read for "i"/"I" was corrected 8 times.
- "0. s. v."→"o. s. v.", and o.s.v. spacing was normalized.

### Other word-level OCR corrections

There are 203 of these, all listed per slot. A sample of those that change meaning:

- Vreden→Verden (957)
- Diu→Din
- define→denne
- lænkt→tænkt
- bavde→havde
- mogen→nogen
- Ildealiteten→Idealiteten
- kunz.e→kunne (n4.21a)
- overhovedet→over Hovedet (2032, "voxe mig over Hovedet")
- reeri→reen
- Besignationens→Resignationens
- ihi→thi
- Sørger→Sorger (2677)
- hån→han
- realister→realiter
- tabé→tale (4205)
- sal→sat
- "han desaarsag"→"kan desaarsag"
- "da kan kan nærme"→"da kan han nærme" (medium)
- Eiskende→Elskende. (a period was also supplied)
- værdeligen→værdigen (medium)
- "mene godt"→"mere godt" (4428, medium; "godt" was left in lowercase)
- "som er ureflekteret"→"som en ureflekteret" (medium)
- tettere→lettere
- heroer→beroer
- ophevaret→opbevaret
- redebvn→redebon
- "Kunde kan sige"→"Kunde han sige"
- "Pige. sum er Idealet"→"Pige, som er Idealet"
- lager→tager
- himinelsk→himmelsk
- Pigeu→Pigen
- Meuneske→Menneske
- Tvivleu→Tvivlen
- "at Træthed"→"af Træthed"
- had→bad
- hlive→blive
- lededen→ledende
- Fen→Een
- "den- kunde, i i Sørgens"→"den kunde, i Sorgens"

Also:

- punct (155): stray specks, doubled periods, and colons, pipes, dashes and quote fragments misread from dirt.
- quote (80): quotation marks normalized to „…“ (see Conventions above).
- marker (34): footnote markers removed from the main text, and the marker glyph removed at the start of each note body.

## 4. Uncertain points left for review (not changed, or changed with low confidence)

1. **Possible lost line at raw 2592/2600** (page 67/68, ch5 s15): "For Guds Skyld og | aldeles identisk hermed for sin egen Skyld." The sentence probably read "og, hvad der er aldeles identisk hermed, for sin egen Skyld". The garbage line 2594 ". se" may be a remnant of it. **No text was inserted**; the translator should check this.
2. The insertion "Havmand **i** Nærheden" (4337) and "Liebe?" (5281) are conjectural (see above).
3. "Sämtliche W." (n5.31a) and "Cratylus" (n8.5a, OCR "Cratyllus"): the double l may be the 1895 printing's own spelling (medium).
4. "nogen-Sinde" (2170-71) was kept as the line-break join shows it, with the capital S. It may be "nogensinde" or "nogen Sinde" in print.
5. Kept as OCR'd and flagged:
   - "Vuet" (1272)
   - "skulde vilde falde paa" (2992-93)
   - "Ordene skulle tages saa forfærdelige" (3192)
   - "følte om med løs Tale" (5172)
   - "Tridt" (5049)
   - "cras Materialisme" (1911)
   - "Blendværk", "en Lune" (1144-45)
   - "besynderlige Tale" (285)
   - "Priset derfor hiin Fortælling" (721)
   - "hør og bør" (3412)
   - "Hans Fodfæste? er kraftigt" (1559)
6. The mixed spellings høiere/højere, Øieblik/Øjeblik, Nei/Nej are kept as the OCR has them; they may reflect the 1895 print's own inconsistency.
7. Lone hyphens at line starts (906, 1616, 3445, 4749, 4904) were treated as specks and removed. Any of them could be a short printed dash (low stakes).
8. "prædiker ”)" (1078) is now a note marker (n4.2a). The unmatched closing quote in "for tung.”" (2114) was removed.
9. The marker glyph `*`/`**` is inferred from the OCR (`+)`, `”)`, `”")`). The printed form is probably "*)", "**)".

---

## Addendum (2026-09-24): fixes from the independent scan verification

An independent verifier checked this reconstruction against all 152 page
images of the Internet Archive item (`SCAN-VERIFICATION.md`). Its fixes are
applied. Each is logged in the slot's `corrections` as `scan:` entries,
which the check script now accepts, and `check_corrected_source.py` again
reports **PASS** with 0 unexplained differences.

| Fix | Change |
|---|---|
| F1 | 85 tokens spelled "øj" → "øi" (høiere, Høieste, Øieblik, bøiede, tilføie, fornøiet, tilbøielig, tilløiet, ophøiede, Høiene, Høire, Høibords, høi, nøie, øiensynlig, Støi, Møie). The print never uses "øj". §1 item 4.6 above ("mixed spellings are in the print") was **wrong**. "Nej!" (ch4 s24) is printed with j and is kept. |
| F2 | n5.31a: "p. 293" → "p. 223" |
| F3 | ch7 s67: "Wer sprach von Liebe?" → "Wer sprach von Liebe." (the n7.67a anchor is updated to match) |
| F4 | n7.33a: "et Pecus" → "et pecus" |
| F5 | ch7 s17: "værdigen" → "værdeligen", the printed archaic word (the earlier "correction" is reversed) |
| F6 | ch7 s58: "følte om" → "føite om" |
| F7 | ch4 s34: "nogen-Sinde" → "nogensinde" |
| F8 | n8.5a: "Cratylus" → "Cratyllus", the print's spelling |
| F9 | ch7 s12: the opening dash is removed (it was a speck, not print) |
| F10 | ch7 s40: "μέχρις" → "μέχρι" |

**Checks that were confirmed:**

- All 18 notes: markers, starts, ends and page continuations.
- The two weaning passages are word-exact, and each is its own printed
  paragraph after an asterism.
- "fatte."
- The Øie-/blik rejoin.
- Section numerals I–IV.
- All Latin, French and German.
- All Greek letters.
- **No line was lost at raw 2592**: the 1895 print reads "For Guds Skyld og
  aldeles identisk hermed …", so the accepted pilot's P-I ¶15 is unaffected.

**Editorial decisions:**

- **Misprint emendations.** Obvious misprints in the 1895 print are corrected
  so that the text can be read and translated. They are labelled as
  emendations here, and the printed form is kept on record:
  - "Havmand ∅ Nærheden" → "Havmand i Nærheden" (ch7 s27; logged as `emend:`);
  - the swap "han desaarsag"/"kan nærme" (ch7 s4);
  - "Kunde kan sige" → "han" (ch7 s72);
  - "Forsland … mene godt" → "Forstand … mere" (ch7 s32);
  - "som er ureflekteret" → "som en" (ch7 s49);
  - "Derved blev har" → "han" (n7.15a);
  - "Vreden" → "Verden" (ch4 s0);
  - "at Træthed" → "af" (ch2 s12);
  - "sjednere" → "sjeldnere" (ch3 s13);
  - "et være" → "at være" (ch4 s4);
  - "argumentam" → "argumentum" (ch7 s11);
  - "Aristotetes" → "Aristoteles" (ch7 s15);
  - "Sares" → "Saras" and "magesløs" → "mageløs" (ch7 s44);
  - "on Forræder" → "en" (n7.47a);
  - "Baüerin" → "Bäuerin" (n5.31a).

  In the per-slot log these appear under "OCR" or "name". **This table is the
  authoritative record that they are print misprints.**
- **Greek accentuation.** The 1895 print sets most Greek unaccented; only the
  Longus quotation and γνῶθι σαυτόν are fully accented. This source and the
  English edition print standard accentuation as an **editorial
  normalization**. The letters are exactly as printed.
- **Authorial front matter** absent from the served text is recorded in
  `../front-matter.json`, with its presentation left to Codex:
  - the subtitle "Dialektisk Lyrik";
  - the pseudonym "af Johannes de silentio";
  - the Hamann epigraph "Was Tarquinius Superbus in seinem Garten mit den
    Mohnköpfen sprach, verstand der Sohn, aber nicht der Bote.";
  - the part heading "Problemata." (before ch4).

## Structure v2 (`original-da-v2.json`, built by `build_v2.py`)

- **Exordium (ch2).** The weaning passages after variations II and III are
  printed as their own paragraphs after an asterism, like those after I and IV.
  They become separate paragraphs, so ch2 goes from 13 to 15 paragraphs.
- **Problema III (ch7).** The nine served slots that held only footnote text
  (s16, s20, s23, s28, s36, s38, s50, s79, s83) are removed. Their text joins
  the note of the paragraph that holds the marker, so ch7 goes from 88 to 79
  paragraphs.
- The per-slot old→new map is in `structure-map.json`.
- The final reading structure also follows the printed paragraphing, which was
  determined from the scans (`PRINTED-PARAGRAPHS.md`). See `../STRUCTURE-MAP.md`.
