# Release packet: To the Lighthouse, modern-da

| Item | Value |
|---|---|
| New file | `candidate.json` -> `app/public/data/editions/to-the-lighthouse-modern-da.json` |
| candidate sha256 | `46d3bcafe74b0d6b09b33f4cb6498d7876fce0feb8ab1232c4243eec8449da86` |
| Source (served modern-en) sha256 | `3b20ae3172ec905012082fe0948d81f5e0bee4832ef1c03860708b8ebfa84e22` |
| Chapters / paragraphs | 42 / 495, 1:1 with the source |
| Review coverage | every paragraph reviewed once; all 125 corrections verified (6 verifier-supplied replacements not re-verified) |
| Existing files touched | none (additive new edition file) |

Steps for the coding window: (1) copy `candidate.json` byte for byte to the path above; (2) confirm the registry/edition loader exposes `modern-da` for this book (other books already do); (3) check section/chapter titles render; (4) Danish character cards, audio and onboarding are not part of this package.
