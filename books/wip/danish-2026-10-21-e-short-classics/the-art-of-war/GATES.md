# Gate results: the-art-of-war

- Source: app/public/data/editions/the-art-of-war-modern-en.json (origin/main)
- Candidate: the-art-of-war-modern-da.json

## 1. Paragraph alignment
- Top-level keys: en=['chapters', 'sections'] da=['chapters', 'sections']
- Chapters: en=13 da=13; paragraphs: en=385 da=385
- Chapters with mismatched number/count/keys: none
- **PASS**

## 2. Paragraphs left in English
- Paragraphs identical to the English (more than 2 words): 0 []
- Paragraphs identical to the English that contain only names (no English function words; not untranslated text): 0 []
- Paragraphs whose English function-word count exceeds the Danish, or with ≥3 English function words and >8% of tokens: 0
- **PASS**

## 3. Length ratio da/en per chapter (gate: characters, 0.85–1.25; words shown for reference)

| Ch | Title (da) | en chars | da chars | ratio chars | ratio words | gate |
|---|---|---|---|---|---|---|
| 1 | INDLEDENDE OVERVEJELSER | 2978 | 2951 | 0.991 | 1.026 | ok |
| 2 | KRIGENS FØRELSE | 3130 | 3088 | 0.987 | 0.996 | ok |
| 3 | ANGREB GENNEM LIST | 3494 | 3352 | 0.959 | 1.000 | ok |
| 4 | SLAGORDENEN | 2551 | 2537 | 0.995 | 1.007 | ok |
| 5 | TROPPERNES ÅND | 2858 | 2860 | 1.001 | 1.013 | ok |
| 6 | TOMHED OG STYRKE | 4631 | 4772 | 1.030 | 1.040 | ok |
| 7 | SLAGTAKTIK | 4170 | 4085 | 0.980 | 1.009 | ok |
| 8 | DE NI FORANDRINGER | 1926 | 1888 | 0.980 | 1.054 | ok |
| 9 | TROPPERNES BEVÆGELSER | 6093 | 6254 | 1.026 | 1.056 | ok |
| 10 | TERRÆN | 4333 | 4284 | 0.989 | 1.034 | ok |
| 11 | DE NI TERRÆNER | 8110 | 8062 | 0.994 | 1.038 | ok |
| 12 | ANGREB MED ILD | 2459 | 2477 | 1.007 | 1.014 | ok |
| 13 | BRUGEN AF SPIONER | 3573 | 3510 | 0.982 | 1.009 | ok |
| all | | 50306 | 50120 | 0.996 | 1.026 | |

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

## Summary
- Alignment: PASS
- English left: PASS
- Ratio: PASS
- Lint: PASS
