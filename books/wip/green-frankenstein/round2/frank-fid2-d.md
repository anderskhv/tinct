# Frankenstein fidelity review R2, reviewer D (chapters 24-28, i.e. Chapter 20 to Chapter 24 plus Walton's closing letters)

Source: books/wip/green-frankenstein/source.json (1831, Gutenberg #84). Candidate: candidate.json (read-only, not edited).

## Coverage
I read every paragraph individually, side by side (source and candidate), in packets of about 15-20, with neighbouring paragraphs as context. Nothing was skimmed.
- Ch 24 (Chapter 20): 0-36 (37/37)
- Ch 25 (Chapter 21): 0-48 (49/49)
- Ch 26 (Chapter 22): 0-40 (41/41)
- Ch 27 (Chapter 23): 0-29 (30/30)
- Ch 28 (Chapter 24 + Walton letters): 0-81 (82/82)
Total: 239/239 paragraphs. All paragraphs the R1 repair changed in these chapters (per BASELINE_DIFF) got extra scrutiny: 24.0-3, 7, 11, 17-19, 22, 24, 30, 35-36; 25.1, 10-11, 13, 15, 17, 19, 25, 42, 46-48; 26.0, 3, 13-14, 18-19, 23, 28, 32, 34-35; 27.1, 6-10, 12-18, 21, 23, 26-27; 28.4, 8-13, 15-18, 21, 24-25, 28-29, 34, 43, 46, 54, 60, 62-64.
I then re-read all five chapters as a whole for cross-boundary problems: epithets (dæmon, fiend, wretch, monster, devil, being) and names (Kirwin, Daniel Nugent, Havre-de-Grace, Evian, Tartary, Felix, Safie). Epithets and names are consistent with the source.

## Findings (10: 1 blocking, 9 non-blocking)
Blocking:
- 28.47: "first imagination of danger" became "first real test of your courage". This reverses Frankenstein's taunt that the danger is only imagined.
Non-blocking:
- 24.1: "race of devils" became "monsters".
- 24.18: "fellow creatures" became "civilization".
- 24.24: "sanguinary and merciless passions" is dropped.
- 25.20: "though" makes the "less innocent than Justine" line illogical when read aloud.
- 26.34: the wording implies a night voyage to Evian, but the source has them sail by day and sleep at Evian.
- 27.15: "fierce" is added.
- 28.16: "blue seasons" is silently corrected to "seas".
- 28.45: "might happily have surmounted" became "barely survived".
- 28.64: "untimely" is dropped.
Exact old/new strings are in frank-fid2-d.json. Each "old" string was checked with Python and is unique in its paragraph.

## Verdict
BLOCKING FINDINGS (1).
