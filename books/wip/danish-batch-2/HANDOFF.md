# Danish batch 2 — modern-da for ten live books (content handoff)

- Branch: `claude/inspiring-ritchie-zi00fu`. Content only: no PR, no merge, no deploy, no registry, app, audio, tool or test edits.
- Requested by Anders in this session (21–22 Oct 2026), in Gutenberg-popularity order. Danish is not a launch requirement under the 2026-09-21 language scope; these are optional extra editions.
- Each edition is a drop-in `modern-da` for a book that is already live: same chapters and paragraph ids as the live `modern-en`, with `\n` line breaks, `_italics_` and `[n]` markers preserved. Source: a copy of the live `modern-en` edition taken in this session.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** Translated by helper agents, then fully re-read paragraph by paragraph by a second set of helper agents (631 review packets). **No native Danish read.**
- Published: **NO.**

## Contents

| File | Chapters | Paragraphs | Words | Paragraphs corrected in review | SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| `books/wip/alice-in-wonderland/editions/alice-in-wonderland-modern-da.json` | 12 | 789 | 24,690 | 67 | `1683a43b53096dbab47e2b9fcd81cc0ccb11e8e88789927fa735200071733e9e` |
| `books/wip/adventures-of-sherlock-holmes/editions/adventures-of-sherlock-holmes-modern-da.json` | 12 | 2527 | 91,998 | 208 | `58f05b5126b88695e592f6a6ad6939199299545b3785ec753d2dafe486d9e500` |
| `books/wip/middlemarch/editions/middlemarch-modern-da.json` | 88 | 4674 | 298,139 | 671 | `964adedfdf3613fb95bf14e6b8623092d5d74090ff102933ab9a12afe536a3fa` |
| `books/wip/meditations/editions/meditations-modern-da.json` | 12 | 487 | 45,116 | 75 | `c8abc04f4a30589f29c202be7182d220a0ff76b7165c674400884c0c3cfd773c` |
| `books/wip/wuthering-heights/editions/wuthering-heights-modern-da.json` | 34 | 1931 | 119,952 | 293 | `d444a2133ca0490dcc6bf0c97fd06119be782dd063ce08cebd8c605c35c82d12` |
| `books/wip/sense-and-sensibility/editions/sense-and-sensibility-modern-da.json` | 50 | 1806 | 113,219 | 251 | `6120dd8f823fc02496950863a0dcade09e463238a03db8535657981fcdce13e5` |
| `books/wip/the-art-of-war/editions/the-art-of-war-modern-da.json` | 13 | 385 | 8,573 | 20 | `cf5cc1224f1be2a1214e2e93b0e2f333d38184d11d91593ba37507719c433dcb` |
| `books/wip/medea/editions/medea-modern-da.json` | 7 | 238 | 12,875 | 27 | `5f7d1fa5c4013fd9482cd4ee4e1ecfa68fafcdbf0911cfda5516b943d91859df` |
| `books/wip/bacchae/editions/bacchae-modern-da.json` | 11 | 324 | 11,646 | 26 | `a83da6b0cf8bf1fde94bef50c362b02b73b48d72ee967eb005199b07919d1003` |
| `books/wip/magna-carta/editions/magna-carta-modern-da.json` | 1 | 65 | 4,522 | 10 | `11e3b4de2820772b5258b1981f783b80dfb14db4667d9e8d6358004e6cc99009` |

Verify from the repository root: `shasum -a 256 -c books/wip/danish-batch-2/SHA256SUMS.txt`.

Chapter titles are Danish (`Kapitel N`, `Bog N`, `Prolog`, `Første episode`, and so on; Sherlock Holmes and Alice story titles are translated). Titles in the `modern-en`/`original-en` editions are unchanged.

## What was checked

- Every paragraph reviewed against the English by an independent helper for meaning (omissions, additions, reversals), Danish grammar and idiom, and the conventions below. About 1,650 of 17,600 paragraphs were rewritten after review (largest share: Middlemarch 671, Wuthering Heights 293, Sense and Sensibility 251, Sherlock Holmes 208).
- Scripted structure check on the final files: chapter and paragraph counts equal the English, `\n` and underscore counts equal per paragraph, no straight or English quote marks, no `--`, no stray curly apostrophes, no spaced-dash errors beyond interrupted speech that mirrors the English, no *neger/negre*.
- A cross-packet consistency pass fixed: Middlemarch *Theresa/Cyrus* (English spellings), Sense and Sensibility *cottagen*, Wuthering Heights *bakker* for hills and *papa* in Cathy's speech to her father (a first set of spots), Sherlock Holmes *Den Rødhårede Liga*, *diademet* and *chatol*.

## Conventions

Dialogue »…« with ›…‹ inside; spaced ` — `; Mr./Mrs./Miss/Sir/Lady/Lord kept in English; *oberst*, *doktor*, *unge herre* (Master); English miles marked *engelske mil*; *du* within families and to servants, *De* to strangers and social superiors, one form per speaker pair.

## Open points for Anders

- **No native Danish read** for any of the ten editions. Reviewer replacements were not re-verified by a second pass.
- **du/De** is consistent inside most packets but was not harmonised book-wide for every pair. Known spots: Middlemarch (Dorothea ↔ Casaubon, Mr. Brooke ↔ Chettam/Ladislaw), Wuthering Heights (Nelly ↔ Heathcliff, Cathy ↔ father, *papa* vs *far* in chapters XXI–XXVII), Sense and Sensibility (Mrs. Jennings ↔ Elinor).
- **Names**: Meditations and the two tragedies use Danish forms for Greek names (Sokrates, Heraklit, Sisyfos, Skylla) where the glossary says to keep the English; Bacchae spelling choices were left as translated. Middlemarch keeps *enkelady* for Dowager Lady Chettam.
- **Wuthering Heights**: Joseph's dialect is not marked; *frøken* / *madamen* / *fruen* for the young mistress vary between servants' speech passages.
- Each packet's remaining style notes (stiff phrasings, long sentences) are in the scratch results and were not acted on.
- No onboarding, characters, or audio for Danish. These editions are text only.
- The ten books' English packages (taxonomy, onboarding, integration) are unchanged.
