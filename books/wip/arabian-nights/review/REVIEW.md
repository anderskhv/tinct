# The Arabian Nights Entertainments (Lang) — review record

Reviewers were in-session helper agents (no external API, no paid service); a native Danish reader has **not** read the Danish edition.

## modern-en

- Rendered paragraph for paragraph from `original-en` in bundles of about 2,800 words by separate helper agents under written instructions, each bundle checked mechanically (paragraph count, `\n` line counts, quote marks, markers, length, similarity to source).
- Independent review in packets of about 5,200 words by fresh helper agents who judged every paragraph against its original for faithfulness (no omission, invention, reversal, softening) and for natural modern English. **70 paragraphs failed review** and were replaced with the reviewer’s minimal corrections. Replacements that restored single quotes inside verse were converted back to curly doubles.
- Consistency pass (US spelling, name swaps) and re-assembly.
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/arabian-nights/editions/arabian-nights" --gate`: **GATE PASS** (weighted similarity ≈ 0.599, 0 LIGHT/MECHANICAL chapters, 0 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations), re-run on the staged files on 2026-10-19.

## modern-da

- Translated from the accepted `modern-en` (not from the English original) in bundles of about 2,800 words, one helper agent per bundle, under `TRANSLATE-DA-INSTRUCTIONS` (natural everyday Danish, fixed terms, same verse line counts, »…« marks). Each bundle passed a mechanical check.
- Independent review of every paragraph: **1826 paragraphs reviewed, 221 failed** (about 12 %) and were replaced with the reviewer’s corrected paragraph; ids are in `review/danish-fixed-paragraphs.json`. Typical defects: word order after *så*, gender/agreement, anglicisms and calques, non-words, and a few omissions or added details. The replacements were re-read on 2026-10-19 (see below).
- Mechanical checks on the final file: same chapters and paragraphs as `modern-en`; `\n` counts equal paragraph by paragraph; no English quote marks, straight double quotes or `--`; dashes spaced.
- Name/term consistency applied by regex after review (see `DANISH-NOTES.md`).

## Open issues (not blockers for handoff, not fixed)

See `DANISH-NOTES.md`. In short: Danish verse is meaning-first and often unrhymed; some folk-tale coinages are the helpers’ own. The address-form and *Sire/Herre* inconsistency was fixed on 2026-10-19.

## modern-da re-review, address pass and read-aloud pass — 2026-10-19

Done in-session by Claude (no API calls, no generation scripts), aimed at reading aloud to a young child. Base: commit `6f4ab42cf9`. Paragraph ids changed: `review/danish-rereview-changed-paragraphs.json` (350 paragraphs).

1. **All 221 reviewer replacements re-read** against `modern-en` (and `original-en` where in doubt): 136 corrections in 104 of them (meaning slips such as an ambiguous subject in the fisherman’s reward, a dangling *så træt*, *storvizir* without article; unidiomatic Danish such as *Store åndernes fyrste*, *fik stor sympati for*, *gult silkeetui*, *prægten*, *Våg ikke*, *Så så han*; grammar such as *sit tamburin*, *i vanvittigt hast*; plus forms of address). The other 117 read correctly and were left alone.
2. **Forms of address made consistent across the whole book** (scheme in `DANISH-NOTES.md`): 205 hand edits in 117 paragraphs (all *De/Dem/Deres*, singular polite *I/jer*, *Sire*, *Deres Majestæt/Højhed*, royal vocative *herre* → *Herre*), plus 14 *Befalingsmand* → *Behersker*.
3. **Read-aloud pass, full text read in Danish**: the frame story (*Tusind og én nat*), *Aladdin og den vidunderlige lampe*, all eight *Sindbad Søfareren* chapters and *Fortællingen om fiskeren*: 85 edits in 78 paragraphs (stiff calques, word order, *Så de sad* → *Så sad de*, *fortryllede ham med behagelige historier* → *underholdt ham med dejlige historier*, *guldbassiner* → *guldfade*, etc.).
4. **Global consistency**: *kaliffen/kaliffens* (33), *Sindbad Søfareren* (13 in text + 8 chapter titles), *Haroun al-Raschid* (19), *den Talende Fugl / det Syngende Træ / det Gyldne Vand* (14).

**Not read in full in this pass:** the remaining stories (the merchant and the genie, the Greek king and Douban, the young king of the Black Isles, the three calenders and the ladies of Baghdad, the envious man, the little hunchback and the barber’s brothers, Camaralzaman and Badoura, Noureddin and the fair Persian, Baba-Abdalla, Sidi-Nouman, Ali Cogia, the enchanted horse, the two sisters). In those, only the reviewer replacements and the address forms were checked. Still no native Danish read.

**Checks re-run:** 35 chapters, 1826 paragraphs, per-chapter paragraph counts equal to `original-en` and `modern-en`; chapter numbers and keys unchanged; `\n` counts equal to `modern-en` in every paragraph; »«/›‹ counts unchanged in every paragraph; no new English quotes, straight double quotes, `--` or double spaces; all JSON valid; `classify-modern-en.py … --gate` still **GATE PASS** (English files untouched). `review/SHA256SUMS.txt` regenerated.
