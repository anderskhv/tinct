# Gate results: the-prince

- Source: app/public/data/editions/the-prince-modern-en.json (origin/main)
- Candidate: the-prince-modern-da.json

## 1. Paragraph alignment
- Top-level keys: en=['chapters'] da=['chapters']
- Chapters: en=27 da=27; paragraphs: en=254 da=254
- Chapters with mismatched number/count/keys: none
- **PASS**

## 2. Paragraphs left in English
- Paragraphs identical to the English (more than 2 words): 0 []
- Paragraphs identical to the English that contain only names (no English function words; not untranslated text): 3 [(8, 10, "Ramiro d'Orco: Ramiro de Lorqua."), (18, 6, 'Christopher Pitt.'), (27, 14, 'Edward Dacre, 1640.')]
- Paragraphs whose English function-word count exceeds the Danish, or with ≥3 English function words and >8% of tokens: 0
- **PASS**

## 3. Length ratio da/en per chapter (gate: characters, 0.85–1.25; words shown for reference)

| Ch | Title (da) | en chars | da chars | ratio chars | ratio words | gate |
|---|---|---|---|---|---|---|
| 1 | Tilegnelse: Til Lorenzo de' Medici | 2317 | 2290 | 0.988 | 0.993 | ok |
| 2 | Kapitel 1 — Hvor mange slags fyrstendømmer der findes | 654 | 662 | 1.012 | 0.983 | ok |
| 3 | Kapitel 2 — Arvelige fyrstendømmer | 1275 | 1345 | 1.055 | 1.000 | ok |
| 4 | Kapitel 3 — Blandede fyrstendømmer | 15112 | 15362 | 1.017 | 1.015 | ok |
| 5 | Kapitel 4 — Hvorfor Dareios' rige ikke gjorde oprør mod Alexanders efterfølgere | 4763 | 4522 | 0.949 | 0.968 | ok |
| 6 | Kapitel 5 — Hvordan man styrer byer, der har levet under deres egne love | 2257 | 2383 | 1.056 | 1.102 | ok |
| 7 | Kapitel 6 — Nye fyrstendømmer erhvervet med egne våben og egen evne | 6134 | 5959 | 0.971 | 0.995 | ok |
| 8 | Kapitel 7 — Nye fyrstendømmer erhvervet med andres våben eller ved lykke | 13597 | 13976 | 1.028 | 1.019 | ok |
| 9 | Kapitel 8 — Om dem, der er blevet fyrster ved forbrydelser | 7814 | 7850 | 1.005 | 1.023 | ok |
| 10 | Kapitel 9 — Det borgerlige fyrstendømme | 6369 | 6218 | 0.976 | 1.003 | ok |
| 11 | Kapitel 10 — Hvordan man måler fyrstendømmers styrke | 3384 | 3395 | 1.003 | 1.037 | ok |
| 12 | Kapitel 11 — Gejstlige fyrstendømmer | 4519 | 4537 | 1.004 | 1.003 | ok |
| 13 | Kapitel 12 — Former for soldater og lejetropper | 9988 | 10186 | 1.020 | 1.003 | ok |
| 14 | Kapitel 13 — Hjælpetropper, blandede tropper og egne tropper | 7139 | 7373 | 1.033 | 1.012 | ok |
| 15 | Kapitel 14 — Krigen som fyrstens emne | 4085 | 4169 | 1.021 | 1.007 | ok |
| 16 | Kapitel 15 — Det, som fyrster roses eller dadles for | 2549 | 2635 | 1.034 | 1.110 | ok |
| 17 | Kapitel 16 — Gavmildhed og gerrighed | 3940 | 4031 | 1.023 | 1.079 | ok |
| 18 | Kapitel 17 — Grusomhed og mildhed: om det er bedre at blive elsket end frygtet | 5555 | 5844 | 1.052 | 1.063 | ok |
| 19 | Kapitel 18 — Hvordan fyrster bør holde deres ord | 6681 | 6843 | 1.024 | 1.034 | ok |
| 20 | Kapitel 19 — At undgå at blive foragtet og hadet | 18031 | 18127 | 1.005 | 1.009 | ok |
| 21 | Kapitel 20 — Er fæstninger og andre forsvarsværker til gavn eller skade? | 8150 | 8250 | 1.012 | 1.015 | ok |
| 22 | Kapitel 21 — Hvordan en fyrste bør opføre sig for at vinde ry | 7515 | 7718 | 1.027 | 1.037 | ok |
| 23 | Kapitel 22 — Fyrsternes sekretærer | 2283 | 2309 | 1.011 | 1.040 | ok |
| 24 | Kapitel 23 — Hvordan man bør undgå smigrere | 3665 | 3635 | 0.992 | 1.015 | ok |
| 25 | Kapitel 24 — Hvorfor Italiens fyrster har mistet deres stater | 2660 | 2648 | 0.995 | 0.978 | ok |
| 26 | Kapitel 25 — Hvad lykken formår i menneskenes anliggender | 5997 | 6191 | 1.032 | 1.035 | ok |
| 27 | Kapitel 26 — En opfordring til at befri Italien fra barbarerne | 7236 | 7108 | 0.982 | 0.981 | ok |
| all | | 163669 | 165566 | 1.012 | 1.017 | |

- **PASS**

## 4. books/danish-lint.py
- Run unmodified, by importing books/danish-lint.py and pointing its EDITIONS_DIR (a hard-coded Mac path) at a temporary copy of the live modern-da files with this candidate in place of the old file, so the corpus vocabulary matches a normal run.
- Raw lint hits: 0; of these 0 are STRAY-UNDERSCORE hits on _…_ emphasis markup carried over verbatim from modern-en (same underscore count as the English paragraph; the reader renders it as italics via app/src/lab/emphasisText.ts, and the live modern-da corpus has 1,501 such hits). They are not defects and are listed for transparency.
- Real issues: 0
- **PASS**

## 5. Form checks (extra)
- Paragraphs with " “ ” quote marks (should be »…«): 0 []
- Paragraphs where _emphasis_ marker count differs from the English: 0 []
- Paragraphs whose leading number differs from the English: 0 []
- Copy check against the old the-prince-modern-da.json: 2897 of 27441 distinct 8-word sequences (10.6%) also occur in the old edition (names, fixed quotations and set phrases account for some overlap).

## Summary
- Alignment: PASS
- English left: PASS
- Ratio: PASS
- Lint: PASS
