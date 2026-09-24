# Scan verification: `original-da-corrected.json` against the printed page images

Verifier: independent check, 2026-09-24. No existing file was modified.

## Method

- **Images:** I downloaded `frygtogbvendial00kiergoog_tif.zip` (152 processed TIFF leaves, 2730×4612, bitonal) from the Internet Archive item. For every check below I viewed the leaves as images with the Read tool: whole pages, cropped paragraphs, and single-line crops (zoomed to 2–4×) for letter-level questions. **Every check in this report was done against the images.** The OCR was used only to find lines on the page.
- **Mapping:** `raw.txt` is byte-identical to the IA `_djvu.txt`. I mapped each raw line to its leaf and to its pixel box through `_djvu.xml` (4,781 lines). Leaf *L* is printed page *L − 6* (for example, leaf 38 is p. 32 and leaf 147 is p. 141).
- **Coverage:**
  1. **Whole page, word by word:** I aligned the reconstruction's text to each page and read it against the image for leaves 11–31, 35–66, 67–82, 83, 99, 101, 107, 108, 110, 111, 115–118, 127, 129, 130, 136, 140, 141, 145 and 147. That is more than 80 pages, spread over all 8 chapters.
  2. **Every footnote page and every restoration:** viewed.
  3. **Line crops:** I made one for every Greek, Latin, German, French and name correction, for all 252 substantive token corrections that cite a raw line, and for all 90 raw lines that contain "øj", "Øj" or "ej".
  4. **Second machine reading:** I ran Tesseract 5 (Danish) on all 137 text leaves as an extra comparison. It uses the same engine family as IA, so I did not count it as independent evidence. Every divergence it flagged was settled by eye.

## 1. Footnotes (all 18)

In print every note uses the marker `*)`, or `**)` for the second note on a page. There are 18 notes, and no more. I looked at the foot of every page with a separator rule, and I also searched a fresh OCR of all pages for note openings. The only other line of that shape, p. 103 "1) Skal han tie …", is a numbered item in the main text. No note is missing, and no main text was pulled into a note or left in the wrong place.

| id | page (leaf) | marker in image | note start → end in image | result |
|---|---|---|---|---|
| n4.2a | 32 (38) | "prædiker*)." | "I gamle Dage …" → "… slet ingen." (the note glyph is printed "*(") | PASS |
| n4.21a | 46 (52) | "Realiteten*)." | "Det følger …" → "… ganske Enkelte." | PASS |
| n4.22a | 47 (53) | "normalt*)." | "Dertil hører …" → "… ein seliger Sprung in die Ewigkeit." (set as a centred line) | PASS |
| n5.31a | 76 (82) | "Lidenskab*)," | "Lessing har …" → "Cfr. Sämtliche. W. 30 B. p. **223**." | **FIX NEEDED**: the page number is 223, not 293; see F2 |
| n6.24a | 89 (95) | "Sjæl*)." | "Forskjellen …" → "… ikke en absolut Pligt." | PASS |
| n7.15a | 101 (107) | "Andet*)." | "Disse Bevægelser …" → "… selv har forstaaet." | PASS (the print has "Derved blev **har** staaende"; see E) |
| n7.15b | 101→102 | "ikke**)." | "Den historiske …Tempel-" (p. 101) continues "røver. Dette er … Tempelrøver." (p. 102) | PASS |
| n7.19a | 104→105 | "Valborg*)." | p. 104 "Forøvrigt … det Almene." continues p. 105 "Imidlertid … i Ideen." | PASS |
| n7.27a | 109 (115) | "Foran-/dring*)" | "Ogsaa paa en anden Maade …" → "… med sine Sange." | PASS |
| n7.33a | 111→112 | "ligger*)." | p. 111 "Æsthetiken … Et lyk-" continues p. 112 "keligt Ægteskab! … et *pecus*." | **FIX NEEDED**: "pecus" is lowercase italic; see F4 |
| n7.34a | 113 (119) | "Foregaaende*)." | "I det Foregaaende …" → "… Selvmodsigelse." | PASS |
| n7.37a | 115 (121) | "opdage*)," | "Dette troer man …" → "… ikke at sige." (the Greek is accented "γνῶθι σαυτόν") | PASS |
| n7.47a | 123→124 | "Tvivler*)," | p. 123 "Vil man ikke …" → "… er on Forræder mod" continues p. 124 "Tilværelsen. … noget Saadant." | PASS ("on" is a misprint for "en", and the emendation is correct) |
| n7.67a | 130 (136) | "Liebe*)." | "Cfr. 2. Akt 1. Scene." | PASS for the note. The anchor line is wrong; see F3 |
| n7.77a | 134 (140) | "oppe*)." | "Hvilken Replik …" → "… fra Livet." | PASS |
| n7.81a | 135 (141) | "tale*)." | "Forsaavidt … Cfr. Diogenes 8de Bog § 39." | PASS |
| n8.5a | 141 (147) | "Flod*)." | Greek → "Cfr. *Platos Cratyllus* § 402. Ast. 3die B. Pag. 158." | **FIX NEEDED**: the print spells "Cratyllus"; see F8 |
| n8.5b | 141 (147) | "eengang**)." | "Cfr. Tennemann Gesch. d. Philos. 1ster B. Pag. 220." | PASS |

Every `anchorAfter` matches the word the printed marker follows. The note ids and anchors in the table in CORRECTIONS.md are correct.

## 2. Restorations

| item | image evidence | result |
|---|---|---|
| Weaning passage after variation II (ch2 s6) | p. 13: after "…han saae ikke Glæden mere." there is an asterism "\* \* \*", then the passage as its **own paragraph**. The words are exact. | PASS for the text. For structure, see note S1 |
| Weaning passage after variation III (ch2 s8) | p. 14: after "…forfærdeligere?" comes "\* \* \*", then its own paragraph. The words are exact. | PASS for the text. See S1 |
| ch6 s7 final "fatte." | p. 81, last line: "fatte." sits alone above the signature "Frygt og Bæven. 3. Udg. 6". | PASS |
| ch7 s27 "Havmand **i** Nærheden" | p. 109 ends "…at der er en Havmand". p. 110 begins "Nærheden; thi …". **"i" is not printed.** No word is lost at the page break: this is a misprint in the 1895 edition. | UNCERTAIN (an editorial emendation, not a restoration). The sense requires "i", so keeping it is reasonable, but it should be documented as "absent in print" |
| Opening dash, ch7 s12 "— Æsthetiken" | p. 100: the paragraph begins with an ordinary indent, "Æsthetiken fordrede …". **No dash is printed.** The OCR "—" is a speck to the left of the indent. | **FIX NEEDED** (F9) |
| Opening dash, ch7 s39 "— alene" | p. 116, first line: "— alene denne Forestilling …". The dash is printed. | PASS |
| "Øie-/blik" rejoin | p. 46 ends "thi dette Øie-". p. 47 begins "blik er Liv og Død.". The note n4.21a sits between them. | PASS |
| Section headings I.–IV. in ch2 | pp. 11, 13, 14, 15: centred "I.", "II.", "III.", "IV.". | PASS |

**S1 (structural, advisory).** In print, each of the four Exordium variations is followed by "\* \* \*" and then a separate weaning paragraph. For I and IV (s5, s11) the weaning paragraph has its own slot. For II and III it has been appended to the variation's slot with no break. If the slot count must stay fixed, consider marking the break inside s6 and s8, for example with a paragraph separator, so the four variations render alike. The asterisms themselves are ornaments, category (b).

## 3. Flagged uncertainties in CORRECTIONS.md

| # | item | image | result |
|---|---|---|---|
| 1 | Possible lost line, raw 2592–2600 | p. 67 ends "Hvorfor gjør Abraham det da? For Guds Skyld og", then the signature "5\*". p. 68 begins "aldeles identisk hermed for sin egen Skyld." **Nothing is lost.** The 1895 text reads exactly as reconstructed. The raw ". se" is a speck plus the signature. | PASS: text as printed. Any restoration from the 1843 text ("og, hvad der er aldeles identisk hermed, for …") would be an editorial import, not a scan reading |
| 2a | "Wer sprach von Liebe?" | p. 130: "Wer sprach von Bruderpflicht? Wer sprach von Liebe\*)." No "?" is printed; a full stop follows the marker. | **FIX NEEDED** (F3) |
| 2b | "Havmand i" | See section 2. | UNCERTAIN (an emendation) |
| 3a | "Sämtliche W." | p. 76: "Cfr. Sämtliche. W. 30 B. p. 223." It is spelled "Sämtliche", with a full stop after it. | **FIX NEEDED** (F2) |
| 3b | "Cratylus" | p. 141: italic "*Platos Cratyllus*". | **FIX NEEDED** (F8), to follow print |
| 4 | "nogen-Sinde" | p. 57: "nogen-" at the line end, then "sinde" with a **lowercase s**. | **FIX NEEDED** (F7): "nogensinde" |
| 5 | Kept-as-OCR words | "Vuet", "Tridt", "Ordene skulle tages saa forfærdelige", "hør og bør", "Priset derfor", "Fodfæste?", "Blendværk", "en Lune", "besynderlige Tale", "cras Materialisme" and "skulde / vilde falde" are all **exactly as printed**. "følte om med løs Tale" is **wrong**: the print has "føite om". | PASS, except F6 |
| 6 | Mixed høiere/højere, Øieblik/Øjeblik, Nei/Nej | **Not a feature of the print.** All 90 raw lines with "øj/Øj" were checked in line crops, and every one is printed with **øi** (høiere, Høieste, Øieblik, bøiede, tilføie, fornøiet, tilbøielig, tilløiet, Støi, Møie, øiensynlig, høi, Høibords …). "Nej!" (p. 48) is printed with j and is correct. | **FIX NEEDED** (F1): 85 tokens |
| 7 | Lone line-start hyphens (906, 1616, 3445, 4749, 4904) | The line crops show that all five are specks, small dots of about period size, not printed dashes. | PASS: removing them was correct |
| 8 | "prædiker\*)" marker; "tung." | p. 32: the marker is confirmed. p. 56: "tung." has no closing quote. | PASS |
| 9 | Marker glyphs | Printed "\*)" and "\*\*)". The n4.2a note opening is misprinted "\*(". | PASS |
| — | "værdigen" (4044) | p. 102: "**værdeligen** at smykke den Værdige". This is a real archaic word (værdelig = worthy), not an OCR error. | **FIX NEEDED** (F5) |
| — | "mere godt" (4428) | p. 111: "vis **Forsland** uendeligt meget **mene** godt". Both are misprints in the 1895 edition. The emendations "Forstand" and "mere" are correct in sense, and lowercase "godt" is printed. | UNCERTAIN (an emendation of print misprints) |
| — | "som en" (5010) | p. 124: "som **er** ureflekteret". This is a print misprint. | UNCERTAIN (an emendation) |
| — | "kan/han" (3773/3778) | p. 96: "Jeg **han** desaarsag fatte mig kort …" and "da **kan** nærme sig …". The print swaps them. | UNCERTAIN (an emendation; the sense of the fix is right) |
| — | Greek words | See below. | Letters PASS. Two issues: F10, and a diacritics policy |
| — | Latin, French and German insertions | Every one was checked in crops. All match the image: lumini, potius, methodum, sequi, exponere, juventutis, discendi, magis magisque, dira necessitas, realiter, nihili facio, in discrimine rerum, eo ipso ×2, argumentum, *(Theologia viatorum)*, conditio sine qua non, l'admire, the Schlegel-Tieck verses, "für ihn? Wer kniet' in", "Füssen … überlegen?", "Glücke", Äussere/Entäusserung, "Schäfer-Historier". **Except:** "Pecus" (F4). The print also has "argumentam" and "Baüerin" (the first occurrence), which are misprints; the reconstruction silently corrects them | PASS, except F4 |

**Greek, checked against images.** Every letter sequence is correct. The printing is **mostly unaccented**: "τελος", "σκανδαλον", "μισειν", "per μειωσιν", "κατ᾿ αναλογιαν", "δυο μεν ουν του μυθου μερη, περι ταυτ᾿ εστι, περιπετεια και αναγνωρισις", "αναγνωρισις", "περιπετεια og αναγνωρισις", "κατ᾿ἐξοχην" and "Και ποταμου ροῃ απεικαζων τα οντα λεγει ὡς δις ες τον αυτον ποταμον ουκ εμβαιης". Only the Longus and "γνῶθι σαυτόν" are fully accented.

- **Case forms at 3732:** both words are printed nominative, "περιπετεια og αναγνωρισις", exactly as reconstructed. PASS.
- **Longus:** the print reads "**μέχρι** ἂν κάλλος ᾖ" (FIX F10).
- **Cratylus 402a:** the 16 words match the print.
- **Diacritics policy:** the reconstruction adds standard polytonic accents where the print has none. That departs from the print's diacritics, not from its words. CORRECTIONS.md states the policy but says the 1895 accentuation "cannot be checked". It can: it is largely absent. This is an editorial decision for the caller.

## 4. Classification of all printed matter (leaves 1–152)

| leaf / page | content | class |
|---|---|---|
| 1–2 | Google boilerplate (English, Danish) | (c) |
| 3, 5–7 | blank or endpapers | (c) |
| 4 | "GIFT OF" bookplate (library) | (c) |
| 8 | Series title: "UDVALGTE SKRIFTER AF S. KIERKEGAARD / I / FRYGT OG BÆVEN / KJØBENHAVN / REITZELSKE FORLAG (GEORGE C. GRØN) / 1895" | (b) |
| 9 | Title page: "FRYGT OG BÆVEN / **DIALEKTISK LYRIK** / AF **JOHANNES DE SILENTIO** / TREDIE UDGAVE / imprint 1895" | work title, subtitle and pseudonym = **(a)**; "Tredie Udgave" and imprint = (b) |
| 10 | Epigraph: "**Was Tarquinius Superbus in seinem Garten mit den Mohnköpfen sprach, verstand der Sohn, aber nicht der Bote. Hamann.**"; library stamp specks; "FR. BAGGES BOGTRYKKERI" | epigraph = **(a)**; stamp = (c); printer = (b) |
| 11–14 (pp. 5–8) | "Forord." to "Ærbødigst Johannes de silentio." | (a); present (ch1, signature in s4) |
| 15–21 (pp. 9–15) | "Stemning.", I.–IV., four "\* \* \*" asterisms | (a); asterisms (b) ornament |
| 22–31 (pp. 16–25) | "Lovtale over Abraham." | (a) |
| 32, 34 | blank | — |
| 33 | Part title "**Problemata.**" | **(a)** |
| 35–66 (pp. 29–60) | "Foreløbig Expectoration." | (a) |
| 67–82 (pp. 61–76) | "Problema I." + subtitle | (a) |
| 83–98 (pp. 77–92) | "Problema II." + subtitle | (a) |
| 99–143 (pp. 93–137) | "Problema III." + subtitle | (a) |
| 144–147 (pp. 138–141) | "Epilog." to the final ornament | (a); ornament (b) |
| throughout | page numbers; signatures "Frygt og Bæven. 3. Udg. N" and "N\*" (leaves 23, 39, 55, 71, 73, 87, 103, 119, 135 …); footnote rules | (b) |
| 148–149 | blank | — |
| 150 | "FOURTEEN DAY USE" loan slip | (c) |
| 151–152 | library stamp, back cover | (c) |

**Authorial text (a) absent from the reconstruction:**

1. The subtitle "Dialektisk Lyrik" and the pseudonym "af Johannes de silentio". These appear only inside the `source` string. Put them in a title or front-matter block, for example a book-level `frontMatter` object or the registry metadata.
2. The Hamann epigraph "Was Tarquinius Superbus in seinem Garten mit den Mohnköpfen sprach, verstand der Sohn, aber nicht der Bote. Hamann." It is **entirely missing**. It should precede the Forord as front matter.
3. The part heading "Problemata." It is missing. It stands before "Foreløbig Expectoration." (ch4), so it could be a part heading on ch4 or a book-level `parts` entry.

The chapter titles match the print, including the Problema subtitles. "Ærbødigst Johannes de silentio." is present.

## 5. Spot accuracy (word by word)

Across the pages read in full (listed under Method), the discrepancies between the reconstruction and the image are **only** those in F1–F10 and the emendations in E. There are no other word differences. OCR hyphen rejoins, quotation-mark positions, § signs, ɔ:, 4de, "4 Heste", "(v. 68 7.)" (printed with a space, and normalizing it to 687 is fine) and the numerals all match.

## Consolidated required fixes

| # | slot | current | corrected | evidence |
|---|---|---|---|---|
| F1 | 60 slots (list below) | every "øj/Øj" spelling (85 tokens: højere, Højeste, Øjeblik, bøjede, bøjer, bøjet, tilføje, tilføjede, tilføjes, føje, fornøjet, tilbøjelig, tilløjet, ophøjede, Højene, Højre/højre, Højbords, høj, nøje, øjensynlig, Støj, Møije) | the same words with **øi**: høiere, Høieste, Øieblik, bøiede, tilføie, fornøiet, tilbøielig, tilløiet, ophøiede, Høiene, Høire, Høibords, høi, nøie, øiensynlig, Støi, **Møie** | line crops of all 90 raw lines. The print never uses "øj". Keep "Nej!" (ch4 s24), which is printed with j |
| F2 | n5.31a | "Cfr. Sämtliche W. 30 B. p. 293." | "Cfr. Sämtliche. W. 30 B. p. 223." | p. 76, last line, zoomed: "223" is unmistakable |
| F3 | ch7 s67 | "…Wer sprach von Liebe?" | "…Wer sprach von Liebe." | p. 130: "Liebe\*)." |
| F4 | n7.33a | "…han er og bliver et Pecus." | "…han er og bliver et pecus." (italic) | p. 112, last line |
| F5 | ch7 s17 | "benyttet til værdigen at smykke" | "benyttet til værdeligen at smykke" | p. 102. Reverse the "værdeligen→værdigen" correction |
| F6 | ch7 s58 | "der i vor Tid følte om med løs Tale" | "der i vor Tid føite om med løs Tale" | p. 128 (raw 5172): the print has "føite" |
| F7 | ch4 s34 | "nogen-Sinde" | "nogensinde" | p. 57: the second line begins lowercase "sinde" |
| F8 | n8.5a | "Platos Cratylus § 402." | "Platos Cratyllus § 402." | p. 141: the print spells "Cratyllus" (italic) |
| F9 | ch7 s12 | "— Æsthetiken fordrede …" | "Æsthetiken fordrede …" | p. 100: an indented paragraph, no dash. The raw "—" is a speck |
| F10 | ch7 s40 | "μέχρις ἂν κάλλος" | "μέχρι ἂν κάλλος" | p. 118: "μέχρι ἂν" |

F1 slot list (ch/slot: words):

- 2/4: bøjede
- 3/12: Højene, Højre
- 3/16: højeste
- 4/8: tilføje
- 4/13: Højere, fornøjet, højre
- 4/14: tilbøjelig, højere
- 4/15: bøjer
- 4/18: Øjeblik, Højeste
- 4/24: tilløjet
- 4/28: Højere
- 4/33: Øjeblik
- 4/35: Højere
- 5/0: Højeste
- 5/2: højere ×2, Højeste
- 5/4, 5/6, 5/13, 5/17, 5/20, 5/29, 5/30: højere
- 5/7, 5/14: højere ×2
- 5/12: føje, tilføjede
- 5/18: Højere
- 5/24: ophøjede
- 6/1: højere ×3
- 6/4, 6/6, 6/15, 6/16: højere
- 6/9: Øjeblik
- 6/19: højere ×2
- 6/24: Øjeblik
- n6.24a: højere
- 6/26: Støj
- 7/1: højere ×2
- 7/8: Højere
- 7/24, 7/26: Højeste
- 7/25, 7/33, 7/58, 7/60: højere
- 7/27: bøjede, bøjer
- 7/30: bøjet
- n7.34a: højeste
- 7/37: Højeste ×2
- 7/39: Højeste ×4, højere, Højbords
- 7/42: øjensynlig
- 7/44: tilføjes, højere
- 7/46: høj, Møije
- 7/49, 7/72: bøjer
- 7/53: nøje
- 7/55, 7/77: Øjeblik
- 8/0: Højeste
- 8/2: højeste, Højeste
- 8/3: højeste, Højeste
- 8/5: tilføjede

Remove item 6 of the uncertainty list in CORRECTIONS.md, which says the mixed spellings are in the print. That claim is false.

### E. Emendations of 1895 print misprints (not OCR errors; document them as emendations)

These readings are what the page shows. The reconstruction's corrections are sensible, but CORRECTIONS.md labels them "OCR". Decide per item whether to keep each one, and relabel it as "print misprint emended":

- "Havmand ∅ Nærheden" → "i" added (ch7 s27)
- "han desaarsag" / "kan nærme" swapped (ch7 s4)
- "Kunde kan sige" → "han" (ch7 s72)
- "Forsland … mene godt" → "Forstand … mere" (ch7 s32)
- "som er ureflekteret" → "som en" (ch7 s49)
- "Derved blev har staaende" → "han" (n7.15a)
- "Vreden" → "Verden" (ch4 s0)
- "at Træthed" → "af" (ch2 s12)
- "sjednere" → "sjeldnere" (ch3 s13)
- "et være" → "at være" (ch4 s4)
- "argumentam" → "argumentum" (ch7 s11)
- "Aristotetes" → "Aristoteles" (ch7 s15)
- "Sares" → "Saras" (ch7 s44)
- "magesløs" → "mageløs" (ch7 s44)
- "on Forræder" → "en" (n7.47a)
- "Baüerin" → "Bäuerin" (n5.31a, first occurrence)

The others (Barnel, Etliske, Pigeu, Delte, tabė→tale and so on) are broken or faint type, and the corrections are right.

## Unresolved (for the caller)

1. **Greek diacritics:** the print is unaccented except in the Longus and γνῶθι σαυτόν. The reconstruction adds standard accents. This is a policy choice.
2. **Emendation policy (E):** keep the emendations or restore the printed misprints. "Havmand i" is the most consequential.
3. **Exordium structure (S1):** the weaning paragraphs for II and III are merged into the variation slots, while I and IV have their own slots.
4. **Front matter:** the subtitle, pseudonym, Hamann epigraph and "Problemata." part heading need a home. They are absent from the text.
