# Acceptance Record — Coriolanus (`coriolanus`, modern-en)

**Book id:** `coriolanus`
**Edition:** `modern-en`
**Status: NOT ACCEPTED — PARKED at round 2 of 3.** See `PARKED.md`.

Round 1's "final state: clean" verdict is **withdrawn**. This file previously
recorded an acceptance based on a single reviewer's self-certification; round-2
independent verification found a recurring blocking defect class that pass
missed, plus three false verification claims in its own report.

## Model note

| Round | Model | Role | Outcome |
|---|---|---|---|
| 1 | Claude Sonnet 5 (`claude-sonnet-5`) | drafting-adjacent review + fix, self-certified | Found and fixed 1 defect (ch25 ¶30, imported scholarly emendation). Reported "no other defects found anywhere in the book." |
| 2 | Claude Opus 5 (`claude-opus-5`) | independent adversarial fidelity verification, did not do the round-1 work | **PARKED.** 12 blocking defects across 3 classes, ~30 occurrences. |

## Files

- `source.json` — locked, unmodified copy of
  `app/public/data/editions/coriolanus-original-en.json`.
  sha256 `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`
- `candidate.json` — sha256
  `daabd24d383433a8d906801698ba74b133e2f950316c57b21fb3ae8a50ab5e13`
  **Independently re-computed in round 2; matches round 1's claimed hash
  exactly — no discrepancy.** Not edited in round 2.

No app, registry, audio, or deploy action was taken in any round. This
directory only.

## Round 2 — what was independently re-derived, and what it found

**Verified clean (re-derived from the JSON, not taken from round 1):**

- **Structure exact.** 29 chapters, all real Act/Scene units, no apparatus or
  crosswalk chapters, chapter numbers/titles/per-chapter paragraph counts
  matching source one-for-one, 1,379 paragraphs on both sides, no empty
  paragraphs. Round 1's structural claim holds.
- **Round 1's fix is real and correctly located.** Re-located by searching
  source for `Another word, Menenius` rather than trusting the cited index: it
  occurs once, at ch25 ¶30, exactly as claimed (no off-by-one). The candidate
  now matches source and no longer carries the editorial `Not`.
- **Hash matches.**
- **No compression or content loss.** Independent per-paragraph word-count
  ratio sweep: full range 0.80–1.36 for paragraphs ≥12 words. Extreme bands and
  the moderate-compression band both read in full. No dropped clauses, no
  invented content.
- **Class-contempt and violent content fully intact and unsoftened**, confirmed
  by word-for-word reads of the belly fable (ch1), the plebeian-contempt
  speeches, `the mutable, rank-scented many` (ch14 ¶44), the gown-of-humility
  scene (ch13), the banishment speech (ch16 ¶62), Volumnia's supplication
  (ch26) and the assassination (ch29). Round 1's class-language claim holds.
- **Martius → Coriolanus naming transition correct**, and every character and
  place proper noun (Martius, Aufidius, Menenius, Sicinius, Brutus, Volumnia,
  Corioles, Antium, and 70+ others) matches location-for-location.

**Blocking defects found — see `PARKED.md` for the full inventory:**

- **Class A — proper-noun / demonym / spelling form drift (24 occurrences, 12
  locations):** `Volsces`→`Volscians` at 10 locations (inconsistently — the
  candidate keeps `Volsces` at 13 others, and at ch29 ¶42 flattens a contrast
  the source prints inside one speech); `Volsce`→`Volscian`; the
  `VOLSCE`→`VOLSCIAN` speaker tag ×9; `Afric`→`Africa`; `Dian`→`Diana`;
  **`Pebleians`→`Plebeians`** (source's own non-standard spelling, unreported by
  round 1); `Amazonian chin`→`beardless chin`.
- **Class B — deliberate coinage erasure (5 locations):** `empiricutic`,
  `Jack guardant`, `bisson conspectuities`, `Embarquements`, `'Sdeath`.
- **Class C — meaning error:** ch17 ¶5, `cautelous` (deceitful) rendered
  `cautious`, breaking the set-up whose payoff is Aufidius's conspiracy.

**False verification claims in `fidelity-review-1.md`:** it states that
`empiricutic` and `Jack guardant` are "kept, not corrected to plain words"
(both were changed), that "No genuine proper-noun substitution,
case-sensitivity gap, or dropped name [was] found anywhere in the book" (six
were), and cites ch17 ¶5 as verified consistent with its later payoff (it
carries defect C1).

## Why this is parked rather than fixed in round 2

Class A is the **"erasure of the source's own printed forms"** class that
already parked Twelfth Night, The Merchant of Venice and A Midsummer Night's
Dream in this same batch, and two of its items (`Dian`→`Diana`,
`Amazonian chin`→`beardless chin`, `VOLSCE`→`VOLSCIAN`) are round-1
*defended positions*, not slips. Reversing a prior round's reasoned editorial
policy across three sub-classes and ~26 occurrences is substantive judgment
work, not the narrow mechanical correction the Bacchae/Taming precedents let a
verifier apply directly. Round 3 is the last round before a hard park.
