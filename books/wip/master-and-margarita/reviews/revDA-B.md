# Independent review revDA-B: Tinct Modern Danish, chapters 10–18

Scope: `editions/master-and-margarita-modern-da.json` against `editions/master-and-margarita-original-ru.json`, chapters 10–18 (1,166 paragraphs). I read every paragraph against the Russian, after an automated screen (paragraph alignment, length ratio, digits, quote balance, dash and quote typography, ?/! counts and sentence counts). The approved choices (style, glossary, De/du, «kejseren», racial terms, untranslated Bezdomny, «?..») were not reopened. No published translation was consulted. Mechanical fixes are in `revDA-B.json`. Each `old` string occurs exactly once in its paragraph, and each `russian` string was checked against the source paragraph.

## Counts

| Ch. | Paragraphs | Major | Minor | Verdict |
|---|---|---|---|---|
| 10 | 140 | 0 | 2 | Accept with fixes |
| 11 | 26 | 0 | 1 | Accept with fixes |
| 12 | 154 | 0 | 2 | Accept with fixes |
| 13 | 195 | 1 | 3 | Accept with fixes |
| 14 | 71 | 0 | 1 | Accept with fixes |
| 15 | 143 | 0 | 3 | Accept with fixes |
| 16 | 90 | 0 | 4 | Accept with fixes |
| 17 | 119 | 0 | 2 | Accept with fixes |
| 18 | 228 | 0 | 4 | Accept with fixes |
| **Total** | **1,166** | **1** | **22** | |

No chapter needs rework. Alignment is 1:1, nothing is omitted, and every number, name and aside is present. Danish floor numbering (10:2, 10:124, 10:137, 14:15, 18:75, 18:80) and the multi-paragraph quotation in chapter 13 are correct. The narrator's irony (Rimsky's flight, the singing branch, Poplavsky) and Pilate-chapter solemnity both come through. Several hard spots are handled well: «Зрительская / Зрительная масса» (12:128–129), «недаром украденным ножом» (16:87), «а на нет и суда нет» (15:139), and «морда или лицо» (13:14).

## The five most serious problems

1. **13:70 (major), sense inverted.** «А что натворит, это уж будьте благонадежны» ('as for his making mischief, you can count on it') → «så kan De være helt rolig», which reads as 'don't worry'.
2. **18:190, wrong sense.** «Верьте ему!» → «Tro på ham!» ('believe in him') instead of «Tro ham!».
3. **13:33, wrong sense.** «попросил свет оставить» (leave the light on) → «få lyset tændt» (have it switched on).
4. **17:12, wrong idiom.** «хоть убей» ('for the life of me') → «ikke for alverden» ('not for anything'), which is a refusal and not an exasperated assertion.
5. **13:45, glossary break.** гривенник → «tiøren» (a Danish coin) instead of the glossary's «tikopekmønt».

## Systematic patterns

- **Spelling and grammar slips that a proofread would catch:** «bødl» for «bøddel» (16:62), «billetkassereskeren» (17:18), German «Herr» for Danish «hr.» (18:87, 18:111), the ungrammatical «var ligesom at tage» (13:151), the calque «i den midaldrende alder» (18:13), and lower-case »de« at a sentence start (10:84).
- **Russian verbs of voice are flattened to «hvæse».** хрипеть is rendered «hvæse» (12:84, also 10:133), and мычать becomes «brøle» (15:16). Only 12:84 and 15:16 are in the JSON. 10:133 could take «fik hæst frem» if the editor wants consistency.
- **Small additions:** «lige på og hårdt» (11:8), «vred sig» (16:34), «chokoladefabrikken» (15:111).
- **Register in the Yershalaim chapter:** the vocative «О» becomes colloquial «Åh» (16:24, 16:43). The glossary motifs use «O».
- **Not in the JSON (editorial decision):** chapter 18 renders артист as «kunstner(en)» throughout (18:87–18:159), while chapters 10 and 12 use «artist» for the same word and person (10:83, 12:124). It is consistent inside each chapter and not covered by the glossary, but a reader following Woland from chapter 12 to chapter 18 will see the word change. I suggest adding артист → «artist» to GLOSSARY.md and unifying the word in the harmonisation pass.
