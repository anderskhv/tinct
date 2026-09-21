# Acceptance Record — The Manual (Epictetus, *Enchiridion*)

**Book id:** `green-manual`
**Source:** George Long translation of the *Enchiridion of Epictetus* (public domain), as captured in `source.json` — 52 sections.
**Candidate origin:** Recovered from branch `codex/manual-complete-repair-2026-09-17`, commit `01ddd9b2cd721b868cb322444c792affca47c015`.
**Acceptance date:** 2026-09-21
**Procedure followed:** `books/TRANSLATION_PROTOCOL.md` steps A–D (accessibility review first blind, fidelity review second in packets, whole-book cross-boundary re-read third, verify-and-pin fourth).

## Review coverage table

| Round | Scope | Type | Result |
|---|---|---|---|
| Round 1 | All 52 sections, in 3 packets (1–18, 19–35, 36–52) | 3 independent packeted fidelity reviews | Defects found and fixed (see below) |
| Round 1 | All 52 sections | 1 blind accessibility review (candidate-only, no source) | Defects found and logged |
| Round 2 | All 52 sections | Fidelity re-check | Residual issues found (terminology drift, invented gloss) |
| Round 2 | All 52 sections | Accessibility re-check (fresh blind read) | Sec12, Sec24, Sec29 flagged; Sec47 confirmed non-blocking |
| Round 3 | Sections 1, 12, 18, 19, 23, 24, 29, 45 (targeted fix) | Scoped edit against round-2 findings | Fixes applied via exact-match replacement |
| Round 3 | Sections 1, 12, 18, 19, 23, 24, 29, 45 + neighboring context | Independent re-verification (fidelity re-derived from source, not from the fix's own claim; fresh accessibility read of Sec12/Sec24) | Clean — no new defects |
| Final | All 52 sections, straight through, non-sampled | Whole-book cross-boundary fidelity re-read (terminology consistency, actor/pronoun continuity, no repeated/dropped content, argument continuity) | Clean |
| Final | All 52 sections, straight through, non-sampled, candidate-only | Whole-book accessibility re-read (fresh general-adult-reader pass) | Clean, no stumbling blocks beyond accepted residuals |
| Final | Structural | Paragraph/section count vs. source, JSON validity, no apparatus/stub content | Clean — 52/52 chapters, per-chapter paragraph counts match source at every index, valid JSON |

## Defect counts by round

- **Round 1 fidelity (3 packets):** defects found and corrected before round 2 (see `fidelity-review-1-sections1-18.md`, `fidelity-review-1-sections19-35.md`, `fidelity-review-1-sections36-52.md`).
- **Round 1 accessibility:** issues logged, including Section 47's statue reference (see `accessibility-review-1.md`).
- **Round 2 fidelity:** residual terminology-consistency issues and one invented gloss (Euphrates, Section 29) identified (see `fidelity-review-2.md`).
- **Round 2 accessibility:** 3 sections flagged as genuinely awkward on a fresh read — Section 12 (overloaded sentence), Section 24 (circular "no more X than Y" comparison), Section 29 (odd word choice, "dislike things" — assessed by the reviewer as minor, not holding the book); Section 47 statue reference reconfirmed as a real but non-blocking residual (see `accessibility-review-2.md`).
- **Round 3 targeted fix:** 8 sections touched (1, 12, 18, 19, 23, 24, 29, 45) — Sec1 recapitalization, Sec12 sentence clarity, Sec18/19/24 "within X control" terminology alignment, Sec23 phrasing, Sec24 circular-comparison rewrite, Sec29 invented-gloss removal, Sec45 restoring source's "capable of being comprehended" qualifier.
- **Round 3 re-verification:** 0 new defects found; all 8 targeted fixes confirmed faithful to source and confirmed clean on a fresh accessibility read of the two full-paragraph-context sections checked (Sec12, Sec24).
- **Final whole-book re-read:** 0 new fidelity defects, 0 new accessibility defects.

## Deliberately-preserved non-blocking items

- **Section 47 — "Do not embrace statues."** Left bare, not glossed. Reasoning: no accurate gloss can be constructed without inventing unverified historical specifics. The candidate readings (cold-bath statues; embracing/kissing temple statues as an endurance stunt) are not reliably attested enough to state as fact in a reader-facing edition. Confirmed across three separate accessibility passes (round 1, round 2, final) as a real but isolated non-sequitur that does not compromise the section's argument (about not performing self-discipline for an audience) or the book as a whole.
- **Section 29 — "dislike things" (for source's "loathe certain things").** A minor word-choice speed bump identified in round 2's accessibility review; not touched by the round-3 targeted fix (which addressed only Section 29's Euphrates gloss, a fidelity issue). Round 2's reviewer explicitly assessed it as non-blocking ("most readers will infer the sense and move on"); reconfirmed as still present and still minor on the final whole-book read.
- **Unglossed proper names supported by context** — Diogenes and Heraclitus (Sec15), Polynices and Eteocles (Sec31), Chrysippus (Sec49), Anytus, Melitus, and Crito (Sec52). Each sentence carries its own sense without the reader needing to know who these figures are; confirmed across round 1, round 2, and the final accessibility read.

## Final verification

- Structure: 52/52 chapters in both `candidate.json` and `source.json`; paragraph counts match at every index; valid JSON; no textual apparatus, editor notes, or stub content.
- Terminology consistency confirmed whole-book: "impression" for phantasia; "within/outside our control" for the power/in-our-power framing; "will"/"ruling mind" for prohairesis/the ruling faculty; consistent slave/free framing.
- No orphaned pronoun references, no repeated or dropped content, and argument continuity intact across all 52 self-contained sections.

**Final file:** `candidate.json`
**Final sha256:** `f2791351f992aca8951eca00aa33c636bc752edac66c08e87bedcc6b90de12a7`
**Hashed and accepted:** 2026-09-21

**Verdict: TEXT ACCEPTED.**
