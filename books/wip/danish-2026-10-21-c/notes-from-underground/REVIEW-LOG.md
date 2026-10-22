# Notes from Underground — modern-da review log (danish-2026-10-21-c)

Source: `app/public/data/editions/notes-from-underground-modern-en.json` on origin/main e8b2703325, blob 64f9f5dc65cd569eb6f3bcefd7291ef3482e5e0d.
Glossary only: old live `notes-from-underground-modern-da.json` (names: Simonov, Zverkov, Ferfitjkin, Trudoljubov, Apollon, Liza, Anton Antonitj Sjetotjkin, Kostanzhoglo, Nevskij, Krystalpaladset). No sentences copied.

## Review method actually used
- Translator pass: paragraph by paragraph, chapter by chapter, by Claude (this session).
- Second pass: **not independent.** This run had no subagent tool (no Agent/Task tool in this agent's toolset), so the required independent reviewer (sees only EN + DA) could not be run. Second pass done by the same translator: automated per-paragraph checks (alignment, English-residue detector, per-paragraph length ratio flag <0.70 or >1.60 for paragraphs over 150 chars — zero flags), plus re-reading while drafting. **Independent review remains outstanding** before acceptance.

## Editorial decisions
- Title of part 1 / the narrator's "underground": »Kælderhullet«, "underground people" = kældermennesker; part 2 title »I anledning af den våde sne« (EN: "Apropos of the Wet Snow").
- Address: narrator → readers "I / mine herrer"; imagined interlocutors → narrator "De"; schoolfellows du among themselves (Zverkov and Ferfitjkin use De to the narrator in the dinner scene to mark distance; Simonov and Trudoljubov du); Apollon → master "De"; narrator ↔ Liza "du".
- Nekrasov epigraph (ch12 ¶1) and the couplet (ch19 ¶17 / ch20 ¶1): new Danish verse rendering; attribution kept as "NEKRASOV (efter Juliet Soskices engelske oversættelse)".
- Imperial units converted where idiomatic: "six feet" → "en meter og firs", "six inches" → "femten centimeter", "a foot of water" → "en halv meter vand". (Flag for reviewer if Anders prefers units kept.)
- " ..." ellipses rendered as "…" (lint SPACE-BEFORE-PUNCT).
- Italic markup `_…_` kept exactly where EN has it.

## Fixes applied during self-review
- ch1 typo brodden; ch17 "et forbandet slaveri"; ch18 "havde skyndt sig", "din beskidte skøge"; ch20 "Hun burde have ladet"; ch20 ¶27 "Var det, hvad du bildte dig ind?" (lint DOUBLE-FILLER).
