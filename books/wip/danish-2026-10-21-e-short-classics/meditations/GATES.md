# Gate results: meditations

- Source: app/public/data/editions/meditations-modern-en.json (origin/main)
- Candidate: meditations-modern-da.json

## 1. Paragraph alignment
- Top-level keys: en=['chapters'] da=['chapters']
- Chapters: en=12 da=12; paragraphs: en=487 da=487
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
| 1 | Bog 1 | 14801 | 14946 | 1.010 | 0.993 | ok |
| 2 | Bog 2 | 12406 | 12232 | 0.986 | 0.982 | ok |
| 3 | Bog 3 | 15475 | 15328 | 0.991 | 0.975 | ok |
| 4 | Bog 4 | 23260 | 23221 | 0.998 | 0.999 | ok |
| 5 | Bog 5 | 22774 | 22853 | 1.003 | 0.987 | ok |
| 6 | Bog 6 | 23550 | 23314 | 0.990 | 0.979 | ok |
| 7 | Bog 7 | 22628 | 22654 | 1.001 | 0.995 | ok |
| 8 | Bog 8 | 24380 | 23951 | 0.982 | 0.987 | ok |
| 9 | Bog 9 | 21952 | 21823 | 0.994 | 1.001 | ok |
| 10 | Bog 10 | 23601 | 23268 | 0.986 | 0.999 | ok |
| 11 | Bog 11 | 20013 | 19891 | 0.994 | 0.981 | ok |
| 12 | Bog 12 | 16505 | 16240 | 0.984 | 0.992 | ok |
| all | | 241345 | 239721 | 0.993 | 0.990 | |

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
