# Accessibility assessment of the accepted Symposium Modern English

## Question

Does the accepted Tinct Modern English (`modern-en`, `1e970b7b…`, completeness repair commit `bebe95b4`) work for a first-time reader or listener?

The measure is the corrected source, Jowett (`original-en`, `3521a12d…`).

The repaired text fails the similarity gate at a weighted **0.866**. That score is a **screening signal, not proof**, so the question was decided paragraph by paragraph.

## Round 1: independent assessment (`symp-assess-SA1.json`, `symp-assess-SA2.json`)

Two independent assessors read every paragraph beside Jowett. SA1 took chapters 1–4 and SA2 chapters 5–8, working from `ASSESS-BRIEF.md`. For each paragraph they decided:

- **KEEP:** clear present-day English, and faithful;
- **REPAIR:** with the problem phrases quoted and a one-line fix goal.

| Chapter | KEEP | REPAIR |
|---|---|---|
| 1 The Gathering | 33 | 16 |
| 2 Phaedrus | 2 | 6 |
| 3 Pausanias | 10 | 2 |
| 4 Eryximachus | 1 | 9 |
| 5 Aristophanes | 7 | 11 |
| 6 Agathon | 5 | 8 |
| 7 Socrates and Diotima | 34 | 35 |
| 8 Alcibiades | 23 | 24 |
| **Total** | **115** | **111** |

A paragraph can have more than one problem. The problems tagged in the REPAIR paragraphs were:

| Problem | Tags |
|---|---|
| Archaic wording | 84 |
| Shifted historical sense | 54 |
| Opaque syntax | 51 |
| Misleading wording | 45 |
| Unclear argument | 14 |

Recurring shifted senses were collected in a shared glossary (`../render/GLOSSARY.md`), applied the same way everywhere:

- *fair / foul* → beautiful / ugly;
- *want* → lack;
- *temperance* → self-control;
- *generation / beget* → reproduction / give birth;
- *vulgar* → common;
- *mean* → base;
- *encomium* → a speech of praise.

The assessors marked the **protected** passages KEEP: 1.0–1.8 (the restored opening) and 3.3, 3.7 and 3.8 (the C-06 corrections).

## Round 1 rendering

Five independent renderers (R1–R5) re-rendered the 111 REPAIR paragraphs from Jowett, following `../render/RENDER-BRIEF.md` and the glossary.

## Round 2: what the blind readers showed

The first-round successor was read by two blind readers (BL1, BL2) with no access to Jowett, and reviewed for fidelity by F1–F4. The blind readers showed that the assessment's KEEP line had been **too lenient** in two places.

1. **Short linking dialogue.** Replies, banter and hand-offs had been kept because each line was short. Heard together, they were still in 19th-century English, what BL2 called "two speeds of English". The worst clusters were 5.8–5.17, 6.11–6.12, 7.4–7.22 and 8.6–8.44.
2. **Chapter 3 and parts of chapter 1.** Pausanias's key word, "yield", was never explained. Shifted senses remained in kept paragraphs: "meaner", "play the fool with them", "wantonness", "forswear" and "shoot your bolt".

Round 2 therefore repaired kept paragraphs where a blind reader showed an obstacle. It also applied the glossary to kept paragraphs, and fixed the fidelity findings. Each round-2 edit is in `../LEDGER.json`, with its source and reason and an independent re-check verdict (`../review/`).

The protected passages stayed untouched. The blind-reader findings on them are recorded as optional proposals in `../PROTECTED-NOTES.md`.
