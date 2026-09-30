# Wuthering Heights — WH2 complete; combined edition pending

## WH2 gate and handoff — 2026-09-30

- Branch: `content/wuthering-heights-codex-wh2`, created from `content/wuthering-heights-codex` at `3f18d283`.
- Assigned range: Chapters XII–XXIII (12–23), complete: 12 chapters, 712 paragraphs, 40,933 modern words against 43,101 original words (94.97%).
- Owned content: `books/wip/wuthering-heights/parts/modern-en.wh2.json`; this branch also updates this status file as requested. No other tracked files changed.
- Schema: `chapters` and `sections`; original chapter titles, real chapter numbers 12–23, original paragraph counts and ordering; empty `sections` retained. No placeholders or chapters outside the assignment.
- Baseline: committed `editions/wuthering-heights-original-en.json`, originally committed at `a070424d`; read directly, not re-parsed or modified. Original SHA-256: `1466e339c924109d4dd250143f8e7eae66bceef2f384c93d3f708ff01a58a0a2`.
- Candidate SHA-256: `0cb5bb9ddce628b28de377383893b8dd0b06a698d6f2695cad0842242db78451`.
- Changed paragraph coverage (1-based, inclusive): 12:1–84; 13:1–66; 14:1–35; 15:1–49; 16:1–20; 17:1–92; 18:1–55; 19:1–31; 20:1–50; 21:1–118; 22:1–34; 23:1–78. Each source position was rendered individually; none merged, split or omitted.
- Editorial review against the committed source during rendering: preserved Nelly's judgments and unreliable assurances, Lockwood's framing, Isabella's letter and escape narrative, Catherine's final meeting and death, the inheritance threats, Hareton's treatment, and Cathy's developing relationship with Linton. Joseph retains readable Yorkshire vocabulary and grammar, including “nay”, “nowt”, “owt”, “mun”, “thee”, “thou”, “wi'”, and “t'”.
- Structural checks: PASS — JSON schema, numbers, titles, per-chapter paragraph counts, nonempty paragraphs, at least 75% of source word count in every paragraph, and no reduction in paragraph exclamation counts.
- Unchanged `books/classify-modern-en.py` run once for the complete assigned batch with `--gate --per-chapter`, using the absolute stem `/var/folders/zx/rn3bhrf971d2xfn4_915v7dr0000gn/T/tinct-wh2-gate-o3x_pxup/wuthering-heights`. Temporary matching original/modern snapshots contain only chapters 12–23; their real numbers and titles are preserved. The classifier's display rows 1–12 correspond to actual chapters 12–23. No shared/runtime edition paths were written.
- Gate: PASS — weighted similarity 0.488; light/mechanical 0/12; identical long paragraphs 0/601; wrapped scaffolding 0; truncated quotations 0. Nine REAL-HEAVY chapters and three REAL chapters.
- Per actual chapter similarity: 12=0.483; 13=0.460; 14=0.481; 15=0.489; 16=0.476; 17=0.490; 18=0.472; 19=0.524; 20=0.509; 21=0.498; 22=0.483; 23=0.513.
- Assigned-range acceptance: PASS. No remaining WH2 chapters and no resume point within this assignment.
- Integration: merge this part by its real chapter numbers with the separately owned parts; run the whole-book gate on the assembled edition. Combined-edition acceptance is not claimed here. Onboarding, characters and taxonomy were skipped as instructed. No integration, deployment, audio generation or publication performed.

## Inherited baseline status (at branch point; sibling progress not assessed)

- Branch: `content/wuthering-heights-codex`.
- Original-en: complete, 34/34 chapters, 1,931 paragraphs; source reconstruction and JSON validation pass. Committed before modern rendering at `a070424d`.
- Modern-en: completed Chapters I–VIII, 8/34 chapters, 375 paragraphs. Remaining IX–XXXIV (26 chapters). The modern JSON intentionally contains only completed chapters.
- Gate on completed range 1–2: PASS; weighted similarity 0.478; light/mechanical 0/2; identical long paragraphs 0/88; no wrapped scaffolding or truncated quotations.
- Gate on new range 3–6: PASS; weighted similarity 0.511; light/mechanical 0/4; identical long paragraphs 0/110; no wrapped scaffolding or truncated quotations.
- Gates: new range 7–8 PASS (0.480); cumulative 1–8 PASS (0.495), zero light/mechanical chapters, zero identical long paragraphs, no wrapped scaffolding or truncated quotations.
- Whole-book gate: NOT RUN / NOT READY — 26 modern chapters absent.
- Companion content: pending.
- Content accepted: NO — incomplete package.
- Published: NO. No integration, registry changes, audio, deployment or publication performed.
- Exact resume point: Chapter IX, paragraph 1. Continue reading and rendering from the validated original; do not insert placeholders.
