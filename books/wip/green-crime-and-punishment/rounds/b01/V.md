# b01 verification: chapters 1–6

## Coverage
- Changed paragraphs checked (`view.py changed 1 6` reports 67): ch1 7, ch2 18, ch3 6, ch4 14, ch5 13, ch6 9. Total 67. Every one was compared with the source and the baseline.
- 65 are verified clean and 2 have a correction proposed.
- All 8 accessibility items in `A.json` were screened.
- The 2 corrections were checked with `apply.py ... check --dry`: 2 applied, 0 rejected.

## Defects (both non-blocking)
1. **3.38.** "this ridiculous man had been in love" should read "the crazy fellow had been in love". The source reads "Would you believe that the crazy fellow had conceived a passion for Dounia". The fidelity edit later in this paragraph restored "treating the crazy fellow too harshly" on the grounds that it echoes her earlier phrase, but that earlier phrase still said "ridiculous man". The echo was therefore missing, and "ridiculous" shifts her pity toward scorn.
2. **5.54.** "jumped up in terror" should read "stood up in terror". Correcting "sat up" was right, but "jumped" adds an abruptness the source does not have. The source says "stood up".

No other problems were found. The following were confirmed:
- The policy items read correctly: 6.3 "as rich as a Jew", and 4.4 "a slave on a plantation or a Lett with a German master".
- The restored repetitions (Marmeladov's "do you hear, do you hear", "Granted, granted", "together, together"; 4.4 "it will not, it will not") introduce no duplication and break no surrounding sentences.
- Name normalization matches the Garnett forms: Sonia, Dounia, Razumihin, Svidrigaïlov, Lippevechsel, Vassilyevsky, Harkov, Mihailovsky and the -itch patronymics.
- Hesitations are restored and not over-extended (1.10, 2.15, 4.36, 5.59).

## Accessibility verdicts
| # | Where | Verdict | Why |
|---|---|---|---|
| 0 | 2.15 yellow ticket gloss | reject | Marmeladov's euphemism is deliberate; the gloss breaks his voice and is plain from the context |
| 1 | 3.10 "Praskovya Pavlovna, the landlady" | accept | First time the name appears; the source confirms she is the landlady |
| 2 | 3.38 Vassily→Afanasy | reject | The source itself prints Vassily in 3.38 and Afanasy in 3.39 and 4.6 (the author's slip); follow the source |
| 3 | 3.39 "Fast of Our Lady in August" | accept | Accurate (the Dormition fast begins on 1 August) and needs no interpretation |
| 4 | 4.4 Lett→"Latvian peasant" | accept | Accurate for a Latvian peasant bound to a Baltic German landowner; the servitude sense is kept |
| 5 | 6.3 guys→fellows | accept | "Fellows" is the source's own word |
| 6 | 6.4 creature→old woman | reject | The grammar is unambiguous, and "wretched little creature" is the source's wording, just restored |
| 7 | 6.58 first→second floor | reject | The source prints "first floor" and "two storeys above"; follow the source |

Accepted: 4. Modified: 0. Rejected: 4.

## Verdict
**CLEAN AFTER CORRECTIONS.** The 2 corrections are non-blocking.
