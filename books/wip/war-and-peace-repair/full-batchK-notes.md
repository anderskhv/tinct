# Batch K Fidelity Review — Chapters 234–259 (excluding gaps)

Method: every paragraph of the Maude source was read against the corresponding
Tinct modern-en paragraph, in full, for all 20 chapters. Checked for omitted
content, invented content, meaning inversions, factual/plot distortions,
placeholder/broken text, and character-name normalization (Andrew, Kutuzov,
Helene, Nicholas, Mary).

## Result: 20 of 20 chapters SOUND. No genuine fidelity defects found.

No changes were made to any chapter. `full-batchK-corrected.json` is
identical in content to `full-batchK-current-modern-en.json`; it is provided
as the required output file per the task spec.

This batch differs from the ~30% defect rate seen elsewhere in the project —
every chapter here is a faithful, complete rendering. The modern-en text
consistently:
- preserves every clause, aside, and quoted proclamation/letter in full
  (e.g., Rostopchin's broadsheets in Ch. 234 and Ch. 239, Napoleon's interior
  monologue in Ch. 248, the bee-hive extended metaphor in Ch. 249, Ramballe's
  long dinner-table monologues in Ch. 258)
- does not invent motives, causes, dialogue, or examples not present in Maude
- does not invert any claims or reverse any character actions
- keeps all place names, dates, numbers, and character attributions correct
  (e.g., Vereshchagin vs. Klyucharev in Ch. 239–240, the "13th Light
  Regiment"/"seventh of September" wound details for Ramballe in Ch. 258,
  the precise timeline "night of September 1" / "ten in the morning of
  September 2" in Ch. 248)
- uses the project's normalized spellings throughout: Andrew, Kutuzov,
  Helene, Nicholas, Mary — with diacritics stripped consistently from all
  other names (Rostopchin, Bezukhov, Vereshchagin, Gerasim, Mavra
  Kuzminichna, etc.)

Two very minor, non-defective stylistic touches were noted and deliberately
left unchanged, per the instruction not to re-translate sound text:
- Ch. 252, P30: MOD adds "Rostopchin's" before "broadsheet of August 31"
  where source just says "the broadsheet of August 31." This is factually
  correct given the surrounding context (the broadsheet quoted is
  Rostopchin's, as confirmed a few lines later) and adds no false content.
- Ch. 253, P8: MOD renders "the more he felt himself to blame" as "because
  he knew he was partly to blame" — a mild interpretive softening, not a
  meaning inversion or omission of substance.

Neither of these rises to the level of a "genuine defect" as defined by the
task (omission, invention, inversion, distortion, placeholder text, or name
inconsistency), so no fix was applied.

## Paragraph-count verification (script-verified)

| Chapter | Source paragraphs | Modern-en paragraphs | Match |
|---------|-------------------|------------------------|-------|
| 234 | 7 | 7 | ✓ |
| 235 | 23 | 23 | ✓ |
| 236 | 38 | 38 | ✓ |
| 237 | 29 | 29 | ✓ |
| 238 | 14 | 14 | ✓ |
| 239 | 30 | 30 | ✓ |
| 240 | 18 | 18 | ✓ |
| 241 | 10 | 10 | ✓ |
| 243 | 31 | 31 | ✓ |
| 246 | 57 | 57 | ✓ |
| 247 | 30 | 30 | ✓ |
| 248 | 25 | 25 | ✓ |
| 249 | 11 | 11 | ✓ |
| 251 | 32 | 32 | ✓ |
| 252 | 45 | 45 | ✓ |
| 253 | 20 | 20 | ✓ |
| 255 | 24 | 24 | ✓ |
| 256 | 28 | 28 | ✓ |
| 258 | 73 | 73 | ✓ |
| 259 | 24 | 24 | ✓ |

All 20 chapters: paragraph counts match exactly, verified with a Python
script comparing `full-batchK-source.json` against
`full-batchK-corrected.json`.

## Per-chapter verdicts

- **234** (Book Eleven, Ch. 5) — SOUND.
- **235** (Ch. 6) — SOUND.
- **236** (Ch. 7) — SOUND.
- **237** (Ch. 8) — SOUND.
- **238** (Ch. 9) — SOUND.
- **239** (Ch. 10) — SOUND.
- **240** (Ch. 11) — SOUND.
- **241** (Ch. 12) — SOUND.
- **243** (Ch. 14) — SOUND.
- **246** (Ch. 17) — SOUND.
- **247** (Ch. 18) — SOUND.
- **248** (Ch. 19) — SOUND.
- **249** (Ch. 20) — SOUND.
- **251** (Ch. 22) — SOUND.
- **252** (Ch. 23) — SOUND.
- **253** (Ch. 24) — SOUND.
- **255** (Ch. 26) — SOUND.
- **256** (Ch. 27) — SOUND.
- **258** (Ch. 29) — SOUND.
- **259** (Ch. 30) — SOUND.
