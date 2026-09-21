# Acceptance Record — *Crito* (Plato), modern-en candidate

**Book ID (staged):** `green-crito`
**Source:** Jowett translation of Plato's *Crito*, public domain. Locked
source file: `books/wip/green-crito/source.json` (3 chapters, 95
paragraphs: 25 / 61 / 9).
**Candidate:** `books/wip/green-crito/candidate.json` (3 chapters, 95
paragraphs, structure and titles matching source exactly — "The Visit at
Dawn" / "The Plea and the Argument" / "The Laws of Athens Speak").
**Candidate origin:** staged from live-app-style edition files for review
under `TRANSLATION_PROTOCOL.md`, not yet published to the app registry.

---

## Review coverage across all rounds

| Round | Type | Scope | Result |
|---|---|---|---|
| 1 | Accessibility (Reviewer A, blind, candidate-only) | All 3 chapters, all 95 paragraphs, full read + paragraph pass | Needs targeted fixes — 6 friction points flagged (see below) |
| 1 | Fidelity (Reviewer B, packet-based, source vs candidate) | All 95/95 paragraphs, packets of 5–10 with cross-boundary context, plus whole-book re-read | Accept with fixes required — 2 blocking, 11 should-fix, 1 policy call |
| — | Fix pass | Applied all 14 fidelity items (D1–D14) from round-1 fidelity review | Applied to candidate.json |
| 2 | Fidelity re-verification (independent, re-derived from source) | The 11 touched paragraphs (1.5, 1.16, 2.6, 2.7, 2.9, 2.22, 2.55, 3.0, 3.2, 3.4, 3.6) re-checked from source, plus a full non-sampled chapter-2 content-level recheck (all 61 paragraphs) for dropped/duplicated content | Accept as-is — all 11 correct, no residual or new defects, no further drop/duplication found |
| — | Accessibility fix pass | Applied 6 accessibility fixes from round-1 accessibility review: (1,22) dropped trailing "(Homer, Iliad)" citation; (2,4) glossed "informers"; (2,7) replaced false-friend "disinterested" with "nothing personally at stake"; (2,39) untangled inverted comparison; (3,4) glossed "the Isthmus games"; (3,6) reordered subject/verb ahead of four stacked qualifying clauses | Applied to candidate.json |
| Final | Fidelity spot-check + whole-book non-sampled pass | (a) All 6 accessibility-edited paragraphs re-derived directly from source.json, independent of the fix's stated intent; (b) all 3 chapters read straight through, candidate vs source, for cross-boundary terminology/reference consistency and boundary drops/duplications; (c) a fresh, candidate-only accessibility read of the whole book as a first-time general-adult reader, without consulting source.json or prior review files | Clean — no fidelity distortion in the 6 edits, no cross-boundary defects, known residuals confirmed still non-blocking |

---

## Defect counts by round

- **Round-1 accessibility review:** 6 friction points (2 unglossed proper nouns/references flagged as the 2 fixed items among them, 1 false-friend word, 1 jarring inline citation, 1 inverted comparison, 1 overloaded sentence structure). All 6 subsequently fixed.
- **Round-1 fidelity review:** 2 blocking (D1: dropped normative step at 2.9, replaced with a duplicate of 2.11; D2: dropped conditional + reproach + flipped certainty at 2.6), 11 should-fix (D3–D13: dropped hedge/attribution clauses, dropped qualifying clauses, tense drift, term-chain breaks, silent proper-noun substitution, added qualifier), 1 policy call (D14: inconsistent dropping of Jowett's editorial cross-references).
- **Round-2 fidelity re-verification:** 0 residual defects, 0 new defects (11/11 touched paragraphs confirmed correct; full chapter-2 content-level recheck found nothing further).
- **Final whole-book pass:** 0 fidelity defects in the 6 accessibility-edited paragraphs; 0 cross-boundary fidelity defects; 0 new blocking accessibility issues.

---

## Deliberately preserved non-blocking items

These were reviewed again on the final pass and confirmed still genuinely
non-blocking — not re-flagged as defects:

1. **Ch1, paragraph 14 (0-indexed) — unglossed Delos-ship significance.**
   *"What — has the ship come back from Delos? The one whose arrival means
   I must die?"* The second sentence supplies the practical consequence; the
   real-world context (the Theseus/Minotaur mission and the religious truce
   suspending executions) is not otherwise explained, but a general reader
   is not blocked from following the scene.
2. **Ch2, paragraph 6 (0-indexed) — unframed Simmias/Cebes names.**
   Dropped into Crito's persuasion speech with no introduction. Not
   essential to following the escape plan.
3. **Ch3, paragraph 2 (0-indexed) — nested quotation structure.**
   Tracking who is "speaking" (Socrates narrating hypothetically / the Laws'
   quoted words / Socrates' imagined reply) requires real attention but is
   not incorrect and does not block comprehension of the Laws' argument.
4. **Editorial cross-reference policy decision.** Jowett's own parenthetical
   scholarly cross-references in the style `(compare Apol.)`, `(compare
   Phaedr.)`, `(E.g. compare Rep.)` are dropped throughout, per the
   round-1 fidelity review's recommendation (D14, option b): these are
   translator/editor apparatus, not part of Plato's or the speakers' own
   words, and are inconsistent with a general-reader edition. The sole
   source attribution retained anywhere was the `(Homer, Il.)` citation at
   1.22, which the round-1 accessibility fix pass subsequently also
   removed (it read as a voice-breaking inline footnote); this final pass
   confirmed that removal preserves the line's meaning ("fertile Phthia" /
   third-day prophecy) with no content loss.

---

## Final verification

- **File:** `books/wip/green-crito/candidate.json`
- **SHA-256:** `511340f43167c290d35cfe89618a07a3afca812412b6b7eefcd69b67f8012ac5`
- **Date:** 2026-09-21
- **Structure at pin:** 3 chapters, 25/61/9 paragraphs, titles "The Visit at
  Dawn" / "The Plea and the Argument" / "The Laws of Athens Speak" — all
  matching `source.json` exactly.

**Verdict: ACCEPTED.** No further fidelity or accessibility fixes required
before this candidate proceeds to the next stage of the book-addition
checklist (registry, onboarding, threads, audio).
