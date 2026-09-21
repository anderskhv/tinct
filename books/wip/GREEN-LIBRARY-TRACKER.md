# First-Ten Green Library — Tracker

Goal: 10 complete books reaching **whole-book green acceptance** (fidelity +
accessibility, both required — see `books/TRANSLATION_PROTOCOL.md`) and
handed off for publication. This is the one authoritative tracker for this
programme; do not create a competing status doc.

Stages: **Screening → Repairing → Reviewing → Text accepted → Publication
handoff → Published verified.** "Text accepted" and "Published verified" are
separate totals — accepted staged text is not publication.

Scope: content, review artifacts, and translation documentation only. No app
code, registry changes, deploy, audio generation, or paid API calls. All ten
candidate books are **already present in `app/src/data/bookRegistry.ts`'s live
`BOOKS` export** (confirmed by direct inspection, 2026-09-21) — i.e. they are
technically already "published" in the sense of being in the app's book list,
but none has been through the current `TRANSLATION_PROTOCOL.md` acceptance
procedure (steps A–D), and at least one (Meditations) has content that
actively fails the mechanical-modernization gate. This tracker's "Text
accepted" / "Publication handoff" stages are about the *content actually
meeting the acceptance bar*, independent of the registry's current listing.
That registry/publication-status discrepancy is a finding for Anders, not
something this lane will fix (no registry edits without explicit ask).

## Screening summary (2026-09-21)

Investigated all 10 originally-named candidates. Findings:

| Book | id | Gate sim | Gate buckets | Prior review evidence | Verdict |
|---|---|---|---|---|---|
| The Manual | `the-manual` | 0.340 | REAL-HEAVY 45/REAL 7, 0 LIGHT/MECH | Strong staged repair on branch `codex/manual-complete-repair-2026-09-17` (commit `01ddd9b2cd721b868cb322444c792affca47c015`), hash-verified, NOT yet protocol-compliant (no blind step-A, no packeted step-B, no true whole-book step-C) | **In scope** — reuse candidate text, run missing review steps |
| Descartes' Meditations | `descartes-meditations` | 0.792 | all 9 REAL, 0 LIGHT/MECH | None | **In scope** — fresh A–D |
| The Comedy of Errors | `comedy-of-errors` | 0.605 | 1 REAL-HEAVY/10 REAL | None | **In scope** — fresh A–D |
| Candide | `candide` | 0.730 | 30/30 REAL | None | **In scope** — fresh A–D |
| The Prince | `the-prince` | 0.760 | 27/27 REAL; 1 gate "truncated quotation" flag at ch22p8 confirmed **false positive** (footnote tightened, not truncated) | None | **In scope** — fresh A–D |
| Oedipus Rex | `oedipus-rex` | 0.573 | 1 REAL-HEAVY/10 REAL | None | **In scope** — fresh A–D |
| Oedipus at Colonus | `oedipus-at-colonus` | 0.502 | 5 REAL-HEAVY/6 REAL | None | **In scope** — fresh A–D |
| Antigone | `antigone` | 0.597 | 11/11 REAL | None | **In scope** — fresh A–D |
| The Sorrows of Young Werther | `werther` | 0.371 | REAL-HEAVY 74/REAL 10, 0 LIGHT/MECH | None (staging dir `books/wip/werther/` holds matching modern-en + modern-da drafting chunks, no review) | **In scope** — fresh A–D |
| **Meditations** (Marcus Aurelius) | `meditations` | **0.879 (fails gate)** | **9/12 LIGHT**, 8.1% identical-long-paragraphs | Claimed "prior whole-work acceptance" traced to `qa/reports/meditations-*.md` — those reports cover the **modern-DA** edition only, not modern-en. Independent spot-read confirms modern-en is pronoun/spelling substitution only (one paragraph byte-identical to source) — the documented 2026-05 mechanical-modernization failure class, not a legitimate close-but-clear rendering. | **OUT of first-ten fast path.** Needs a full fresh drafting pass, not review-only repair. Moved to the separate "needs extensive rewrite" lane per programme scope rules. Not started. |

**Substitute selected:** `apology` (Plato, 3 chapters, gate sim 0.361, all
REAL-HEAVY, 0% LIGHT/MECHANICAL) — shortest, cleanest available substitute
checked (crito, phaedo, symposium, phaedrus, poetics also screened; apology
and crito were cleanest, apology is shorter). **Superseded 2026-09-21**:
Apology's round-1 fidelity review returned DO NOT ACCEPT — candidate ch2 is
structurally broken (source paragraph 4 missing entirely, source paragraph 5
rendered twice), plus a meaning reversal and systematic trailing-clause
deletion across ~40 of chapter 1's paragraphs. This is substantial-rewrite
territory, not a patch. Apology is deferred alongside Meditations; **`crito`**
(Plato, 3 chapters, gate sim 0.548, REAL-HEAVY 1/REAL 2) substituted in its
place as book #10.

## The Ten (final)

| # | Book | id | Stage | Owner lane | Notes |
|---|---|---|---|---|---|
| 1 | The Manual | `the-manual` | Reviewing (round 3) | Lane A | Reusing branch candidate as working draft (orig. sha256 `d785f2c99c7f628123b976457303d32143782f4e576e8d81671636e2c1e3bd42`, now modified). Round 1: 13 blocking + 8 required defects (3 fidelity packets), fixed round 2 (20 sections) + terminology sweep. Round-2 re-verification found round-2's own patch introduced 4 new issues (fidelity: invented gloss §29, missed recap §1, unswept terminology §18/19/23/24, dropped qualifier §45) and 2 accessibility snags (§12 overloaded sentence, §24 circular comparison) — all fixed in round 3 (8 sections: 1,12,18,19,23,24,29,45), diff-verified. Round-3 independent re-verification (fidelity + accessibility on just these 8) dispatched |
| 2 | Descartes' Meditations | `descartes-meditations` | Reviewing (round 2, accessibility fix dispatched) | Lane B | Fidelity: round-1 (2 packets) found 16 blocking defects, all fixed round 2, independently re-verified **ACCEPT AS-IS** — fidelity is done pending 2 documentation-only items (S1-S7 editorial decisions, scripture-modernization policy). Accessibility: round-1 verdict "needs targeted fixes" (dense double-negative/nested-conditional sentences, false-friend terms unglossed on repeat use — intuition/accidents/common sense/titillation, two bare Latin parentheticals, sciolists/dropsical ungl); fix pass dispatched, not yet landed |
| 3 | The Comedy of Errors | `comedy-of-errors` | Screening done | queued | Fresh A–D pending, lane opens when Manual or Descartes reaches Text accepted |
| 4 | Candide | `candide` | Screening done | queued | Fresh A–D pending |
| 5 | The Prince | `the-prince` | Screening done | queued | ch22p8 gate flag resolved as false positive |
| 6 | Oedipus Rex | `oedipus-rex` | Screening done | queued | |
| 7 | Oedipus at Colonus | `oedipus-at-colonus` | Screening done | queued | |
| 8 | Antigone | `antigone` | Screening done | queued | |
| 9 | The Sorrows of Young Werther | `werther` | Screening done | queued | |
| 10 | Crito | `crito` | Reviewing (round 1, fix pass dispatched) | Lane C | substitute for Apology (which substituted for Meditations). Accessibility round 1: needs targeted fixes, localized only. Fidelity round 1: ACCEPT WITH FIXES REQUIRED — 2 blocking (2.9 dropped/duplicated paragraph — same failure family as Apology but isolated to one spot, not systemic; 2.6 dropped conditional/reproach/certainty), 11 should-fix, 1 policy call (Jowett editorial cross-refs). Fix pass dispatched |

## Deferred (separate lane, not started, not filling quota)

- **Meditations** (Marcus Aurelius) — needs full fresh modern-en drafting
  (current text is mechanical scaffold, not a repairable rendering). Not
  started under this program per explicit scope instruction.
- **Apology** (Plato) — chapters 1-2 need substantial repair (a dropped
  source paragraph, a duplicated paragraph, ~40 trailing-clause deletions in
  chapter 1). Chapter 3 alone is strong and would pass with minor fixes.
  Not started under this program; candidate for a future targeted-repair
  pass, not fresh drafting.

## Process notes

- Model policy: Sonnet drafting/repair, fresh candidate-only accessibility
  review, independent Opus fidelity review, no paid API calls. Settings
  recorded per book.
- Hardened correction protocol from the Leviathan pilot applies:
  `books/content_edit_helpers.py` for all in-script paragraph edits,
  before/after diffing, structure validation — see
  `TRANSLATION_PROTOCOL.md` → "Applying corrections without introducing new
  defects."
- Up to 3 concurrent book lanes; one editing owner per book; reviewers work
  on frozen candidates only; no overlapping edits to the same candidate.
- A book pauses (not lowers the bar) if repeated revisions keep introducing
  material errors — record the failure, move another eligible title forward.
