# Frankenstein fidelity review R2 — reviewer C (chapters 17–23 = "Chapter 13"–"Chapter 19")

Source: books/wip/green-frankenstein/source.json (1831, Gutenberg #84). Candidate read-only; not edited.

## Coverage
Every paragraph was read individually, source against candidate, in packets with neighbouring context. Nothing was skimmed.
- Ch 17: 17.0–17.21 (22 paras)
- Ch 18: 18.0–18.19 (20)
- Ch 19: 19.0–19.37 (38)
- Ch 20: 20.0–20.36 (37)
- Ch 21: 21.0–21.20 (21)
- Ch 22: 22.0–22.25 (26)
- Ch 23: 23.0–23.22 (23)
Total: 187 paragraphs. Paragraph counts match the source in every chapter.
The paragraphs changed in R1 (from BASELINE_DIFF: 17.0/14/16, 18.0/1/8/9/14/17/19, 19.1–5/8–12/30/32/37, 20.5–7/11/12/15/17/20/35/36, 21.0/4/6–8/11/17/19/20, 22.0/2–4/6–10/12/14–17/21/22, 23.6–10/12–15/17/18) got extra scrutiny.
After the packets, I re-read each chapter in full for cross-boundary issues. The epithets for the Creature are kept consistently: being, fiend, monster, dæmon→demon, wretch. Safie is "the Arabian" throughout. The source spellings Strasburgh, Leghorn, Chamounix, Servox, Coupar and Werter are kept. The glosses (Mont Cenis, sirocco) are accurate.

## Findings (12; 2 blocking)
Blocking:
1. 20.36: "would not deny herself to me" became "wouldn't refuse me". This drops the first signal that the companion is female (omission).
2. 23.14: the source's "St. Andrew's" is silently changed to "St. Andrews".

Non-blocking:
- 17.16 "cursed with" adds a judgment the source's "endued with" does not make.
- 18.15 "too ... to bear" adds a claim; the source only says "more bitter and irreparable".
- 18.17 "might seize him at any moment" weakens and changes "should speedily be delivered up".
- 19.2 "for my protectors" (the firewood) is dropped.
- 19.9 "did not appear rich" loses its hedge.
- 20.17 "revive within me" is dropped.
- 21.9 and 21.10 "evil passions" becomes "violent impulses".
- 21.11 "I thought that" loses its hedge.
- 22.15 "enjoy existence" becomes "truly exist".
Exact fixes are in frank-fid2-c.json. All "old" strings were verified to be unique in their paragraphs.

## Verdict: BLOCKING FINDINGS
Two small fixes are needed: 20.36 and 23.14. Otherwise the chapters are faithful, and none of the R1 repairs introduced a new defect.
