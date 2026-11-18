# Independent review revDA-A: modern-da, chapters 1–9

I compared every paragraph of chapters 1–9 (1,025 paragraphs) of `editions/master-and-margarita-modern-da.json` with `editions/master-and-margarita-original-ru.json`, using `GLOSSARY.md`, `HARMONISATION.md` and the conventions of the ch. 1 sample. I did not reopen the approved choices: De/du, «kejseren», the racial terms, Bezdomnyj untranslated, and «?..». I consulted no published translation. The machine-readable fixes are in `revDA-A.json`. Each `old` string occurs exactly once in its paragraph, and all 42 fixes have been test-applied in sequence without conflict.

## Counts

| Ch. | Paragraphs | Major | Minor | Of which typography |
|---|---|---|---|---|
| 1 | 144 | 0 | 7 | 0 |
| 2 | 261 | 0 | 3 | 0 |
| 3 | 50 | 0 | 4 | 0 |
| 4 | 65 | 0 | 4 | 0 |
| 5 | 104 | 0 | 4 | 0 |
| 6 | 105 | 0 | 1 | 0 |
| 7 | 104 | 0 | 6 | 4 |
| 8 | 97 | 0 | 8 | 4 |
| 9 | 95 | 0 | 5 | 3 |
| **Total** | **1,025** | **0** | **42** | **11** |

I found no omissions, additions of substance, wrong speakers, negation or tense errors, or number errors. A per-paragraph length check showed no paragraph under 0.69× the Russian word count, and all the low ones are complete. The numbers match the Russian throughout.

## The five most serious problems

1. **8:77, «den besejrede Stravinskij»**. «покоренный» means won over or delighted: Ivan has just handed Stravinsky his case. «besejrede» says the opposite. Fix: «den henrykte Stravinskij».
2. **1:108, «udlændingen, der stod og vrøvlede»**. Woland is sitting between the two writers on the bench (1:45). Fix: «sad og vrøvlede».
3. **3:48, «og så blev der mørkt»**. This is a grammar error in the last line of Berlioz's consciousness, one of the most quoted moments of the book. The same paragraph and 3:47 also use «ustandselig(t)» ('incessant') for «неудержимо/неудержимой» ('unstoppable').
4. **2:175, «trak på skuldrene, som om han frøs»**. A shrug is not a cold shiver. «передернул плечами» is a twitch of the shoulders, and it comes right before Pilate rubs his hands 'as if washing them'.
5. **8:50–51, «kom ud for en sporvogn» / «blev skåret ned af sporvognen»**. The first weakens «погиб» to a mere accident. The second means 'was cut back' in Danish. Fixes: «omkom under», «skåret over».

## Systematic patterns

- **Curly apostrophes in ch. 7–9 only** (11 instances: «Berlioz’», «Hva’?», «be’»). The sample and ch. 1–6 use the straight `'`. The rest of the book mixes them too (ch. 15, 19–21 curly), so a global normalisation pass is advisable beyond this range.
- **Rare-word and term slips at batch seams.** «rybets» (6:104) against «vimme» elsewhere, «altan» for Pilate's balcony (8:59), «Psst» (4:40) against «Kys!» (7:94) for «Брысь!», «orne» against the glossary's «galt» for «боров», and «administrationskontoret» against «husforvaltningen» (9:7).
- **Devil vocabulary drift, both ways.** One «черт» is lost (7:87, «ikke en skid»), and one devil word is invented (9:88, «ved fanden»). README requires the motif to be kept exactly where Bulgakov uses it.
- **Calques with the wrong Danish meaning.** «med et glimt i øjet», «tog sig af ham», «skåret ned», «besejrede», «ustandselig». Each is a real Danish phrase that means something other than the Russian, so a Danish reader will not notice the error but will take the wrong sense.

The register is otherwise strong. The Yershalaim chapter keeps its solemn, concrete cadence, the narrator's mock-official irony survives, and the glossary is followed consistently: floors, «korleder», «tolstovka-kittel», «Forlystelseskommission», «de urene magter», the 1:144 → 2:1 and 2:261 → 3:1 echoes, and «O guder, (mine) guder».

## Verdicts

| Ch. | Verdict |
|---|---|
| 1 | Accept with fixes |
| 2 | Accept with fixes |
| 3 | Accept with fixes |
| 4 | Accept with fixes |
| 5 | Accept with fixes |
| 6 | Accept with fixes (one fix) |
| 7 | Accept with fixes |
| 8 | Accept with fixes |
| 9 | Accept with fixes |
