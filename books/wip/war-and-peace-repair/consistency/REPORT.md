# Consistency pass report

Output sha256 99ff04d45d06f0e50247243cf1cc5e6205938c1ee2961178df6b3d70f1212383

Counts: {'title': 4, 'quote-para': 231, 'name:Cyril': 4, 'name:Bolkonski': 149, 'name:Nesvitsky': 21, 'name:Helene': 37, 'name:Kamensky': 2, 'name:Mikhaylovna': 1, 'name:Kozlovsky': 3, 'name:Compans': 8}

Chapters touched: 88; paragraphs touched: 428

## Title changes
- title ch28: 'Book Two (1805) — Chapter 1' -> 'Book Two (1805) — Chapter 28'
- title ch30: 'Book Two (1805) — Chapter 3' -> 'Book Two (1805) — Chapter 2'
- title ch31: 'Book Two (1805) — Chapter 4' -> 'Book Two (1805) — Chapter 3'
- title ch32: 'Book Two (1805) — Chapter 5' -> 'Book Two (1805) — Chapter 4'

## Quote-count parity failures (candidate " count != source curly-quote count) — 4 paragraphs, each needs a human/Opus look
- ch289 p1: source 2 vs candidate 0
- ch296 p4: source 3 vs candidate 4
- ch305 p30: source 6 vs candidate 4
- ch306 p22: source 0 vs candidate 2

## Ruling (2026-09-18)

All four parity mismatches are pre-existing translation choices in the baseline, not conversion errors: ch289 p1 paraphrases the Thiers quotation instead of quoting it (a fidelity MINOR for Gate B when ch289 passes through); ch296 p4 differs only because the source splits the thought around "thought he"; ch305 p30 merged the two French sentences before this pass; ch306 p22 adds scare quotes around "just anyhow". Sampled conversions (ch283 p2, ch296 p9, ch307 p14) are correct, inner quotes swapped to single.

**Accepted as drafting baseline v2**, sha256 `99ff04d45d06f0e50247243cf1cc5e6205938c1ee2961178df6b3d70f1212383`. Not written to the live edition file. Subsequent chapter drafts start from this file; the pilot chapters 274 and 355 (accepted before this pass) contain none of the changed names or quote chapters and remain valid.
