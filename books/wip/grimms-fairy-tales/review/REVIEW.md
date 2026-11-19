# Grimms’ Fairy Tales — review record

Reviewers were in-session helper agents (no external API, no paid service); a native Danish reader has **not** read the Danish edition.

## modern-en

- Rendered paragraph for paragraph from `original-en` in bundles of about 2,800 words by separate helper agents under written instructions, each bundle checked mechanically (paragraph count, `\n` line counts, quote marks, markers, length, similarity to source).
- Independent review in packets of about 5,200 words by fresh helper agents who judged every paragraph against its original for faithfulness (no omission, invention, reversal, softening) and for natural modern English. **89 paragraphs failed review** and were replaced with the reviewer’s minimal corrections. Replacements that restored single quotes inside verse were converted back to curly doubles.
- Consistency pass (US spelling, name swaps) and re-assembly.
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/grimms-fairy-tales/editions/grimms-fairy-tales" --gate`: **GATE PASS** (weighted similarity ≈ 0.598, 0 LIGHT/MECHANICAL chapters, 0 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations), re-run on the staged files on 2026-10-19.

## modern-da

- Translated from the accepted `modern-en` (not from the English original) in bundles of about 2,800 words, one helper agent per bundle, under `TRANSLATE-DA-INSTRUCTIONS` (natural everyday Danish, fixed terms, same verse line counts, »…« marks). Each bundle passed a mechanical check.
- Independent review of every paragraph: **902 paragraphs reviewed, 108 failed** (about 11 %) and were replaced with the reviewer’s corrected paragraph; ids are in `review/danish-fixed-paragraphs.json`. Typical defects: word order after *så*, gender/agreement, anglicisms and calques, non-words, and a few omissions or added details. **The replacements themselves were not independently re-read.**
- Mechanical checks on the final file: same chapters and paragraphs as `modern-en`; `\n` counts equal paragraph by paragraph; no English quote marks, straight double quotes or `--`; dashes spaced.
- Name/term consistency applied by regex after review (see `DANISH-NOTES.md`).

## Open issues (not blockers for handoff, not fixed)

See `DANISH-NOTES.md`. In short: Danish verse is meaning-first and often unrhymed; the address forms *du / De / I* and the royal vocatives *Herre / Sire* vary between passages in the Arabian Nights; some folk-tale coinages are the helpers’ own.

## modern-da re-review and read-aloud pass — 2026-10-19

Done in-session by Claude (no API calls, no generation scripts), reading the Danish against `modern-en` and, where wording or verse was in doubt, against `original-en`. Changed ids are listed in `review/danish-rereview-2026-10-19.json`.

**Step 1: the 108 replaced paragraphs.** All 108 ids in `danish-fixed-paragraphs.json` were re-read paragraph for paragraph. **70 were corrected** (67 in the first pass, 3 more in the read-aloud pass); 38 were accepted unchanged. One meaning error was fixed: 13:11 now says that Falada might tell what the false bride had done *to* the princess, not tell *the princess*. The other fixes: word order after *så* (*Så greb min madmor mig*, not *Så min madmor greb mig*), wrong words (*tenspindel* → *ten*, *sloges* → *blev kastet*, *skrålede* → *skrydede* for the donkey, *missede*, *tjekke*), calques (*for alt, hvad jeg ved*, *når som helst*, *velbekomme*, *Gør dit værste*), agreement and gender (*kister fulde*, *et nøgle*, *dens/dets*), “engelske mil” and “yard” turned into units a listener can follow, and stiff phrasings. The decisions in step 1 were then applied to the rest of the same tales: 18 more paragraphs, for example *gudmor* instead of *fadder* throughout Cat and Mouse, *Syv med ét slag* throughout the Valiant Little Tailor, *Ikke stakkel nok endnu!* as the refrain in the Dog and the Sparrow, and *Trine* for Kate.

**Step 2: read-aloud pass.** All 65 chapters were read through for spoken flow, starting with the best-known tales: Hans og Grete, Askepot, Rødhætte, Tornerose, Sneblomst, Rapunzel, Rumleskaft, Frøprinsen, De rejsende musikanter (Bremen) and Den tapre lille skrædder. **229 more paragraphs** were changed. Each was checked against `modern-en`, but this pass was about how the Danish sounds read aloud rather than a second full meaning check. Main changes:
- Verses and refrains now rhyme where the English rhymes, with the same number of lines and the same meaning. Examples: the witch's *Knasker, knasker, mus*, the duck verse in Hans og Grete, Askepot's bird call, hazel-tree and dove songs, the mirror verses in Sneblomst (*Spejl, spejl på væggen der*), both spinning verses and the song in Rumleskaft (the two spinning verses are now the same, as in the English), the frog's song, Curdken and Falada in the Goose-Girl (*…af sorg hendes hjerte ville briste*), the Juniper-Tree song (one wording everywhere, including where it is split across paragraphs), Jorinde og Joringel, Hans i lykke, Mutter Holle's rooster, Mr Korbes, Mrs Fox, the Seven Ravens and Snow-White and Rose-Red.
- A few dozen more cases of wrong word order after *så*, all corrected; a final regex sweep found no remaining sentence-initial *Så* + subject + verb.
- Misprints and wrong words: *sydende* → *syende*, *hekseens*, *sidende*, *kroggen*, *låsede*, *amboltten*, *spidden* → *spiddet*, *for* → *fór*, *taler* → *daler*, *lædercaps* and *kogeplade* (out of period).
- Idioms made natural: *ude godt, men hjemme bedst*, *med hud og hår*, *Gråben*, *kaste øjne på* (which keeps the pun in Clever Hans), *Det var som pokker!*, *Hyp, Brunen!*.

**Validation after editing.** Edition JSON parses; 65 chapters, 902 paragraphs, same chapter numbers, chapter keys and per-chapter paragraph counts as `original-en` and `modern-en`; `\n` counts equal to `modern-en` paragraph by paragraph; no straight or English quote marks and no `--`. `python3 books/classify-modern-en.py … --gate`: GATE PASS (modern-en unchanged). `review/SHA256SUMS.txt` regenerated; `shasum -a 256 -c` passes.

**Still open.** A native Danish adult has still not read the edition aloud. Step 2 changed sound and flow and did not re-check meaning line by line outside the 108. *Chanticleer/Partlet*, *Curdken*, *Kehrewit* and *Kywitt* are still the English names (see `DANISH-NOTES.md`). “Engelske mil” is still used in two places in the Fisherman (the park and the throne).
