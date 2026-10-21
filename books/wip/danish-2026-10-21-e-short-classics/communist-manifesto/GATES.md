# Gate results: communist-manifesto

- Source: app/public/data/editions/communist-manifesto-modern-en.json (origin/main)
- Candidate: communist-manifesto-modern-da.json

## 1. Paragraph alignment
- Top-level keys: en=['chapters'] da=['chapters']
- Chapters: en=5 da=5; paragraphs: en=213 da=213
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
| 1 | Indledning | 1016 | 995 | 0.979 | 0.911 | ok |
| 2 | I. Bourgeois og proletarer | 25938 | 25169 | 0.970 | 0.943 | ok |
| 3 | II. Proletarer og kommunister | 18311 | 18296 | 0.999 | 0.962 | ok |
| 4 | III. Socialistisk og kommunistisk litteratur | 19511 | 19183 | 0.983 | 0.966 | ok |
| 5 | IV. Kommunisternes stilling til de forskellige eksisterende oppositionspartier | 2814 | 2744 | 0.975 | 0.965 | ok |
| all | | 67590 | 66387 | 0.982 | 0.955 | |

- **PASS**

## 4. books/danish-lint.py
- Run unmodified, by importing books/danish-lint.py and pointing its EDITIONS_DIR (a hard-coded Mac path) at a temporary copy of the live modern-da files with this candidate in place of the old file, so the corpus vocabulary matches a normal run.
- Raw lint hits: 1; of these 1 are STRAY-UNDERSCORE hits on _…_ emphasis markup carried over verbatim from modern-en (same underscore count as the English paragraph; the reader renders it as italics via app/src/lab/emphasisText.ts, and the live modern-da corpus has 1,501 such hits). They are not defects and are listed for transparency.
  - (markup, not a defect) ch4 p41 found=' _Philosophie'
- Real issues: 0
- **PASS**

## 5. Form checks (extra)
- Paragraphs with " “ ” quote marks (should be »…«): 0 []
- Paragraphs where _emphasis_ marker count differs from the English: 0 []
- Paragraphs whose leading number differs from the English: 0 []
- Copy check against the old communist-manifesto-modern-da.json: 506 of 8315 distinct 8-word sequences (6.1%) also occur in the old edition (names, fixed quotations and set phrases account for some overlap).

## Summary
- Alignment: PASS
- English left: PASS
- Ratio: PASS
- Lint: PASS
