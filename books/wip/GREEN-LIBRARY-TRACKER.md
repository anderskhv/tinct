# First-Ten Green Library — Tracker

**BATCH COMPLETE (2026-09-21): all 10 books reached Text accepted, with a
release packet prepared for each. Nothing in this batch is live —
publication handoff to a release owner is the next step, out of this
lane's scope. See the summary table in this session's final report (or
each book's `RELEASE-PACKET.md`) for hashes and coverage.**

**2026-09-23 featured-edition publication check (Candide, The Prince, and
Julius Caesar, which is tracked in `SECOND-BATCH-TRACKER.md`):**
- The candidates were verified. Candide needed a round-2 name-fidelity repair,
  so its accepted hash changed.
- None of the three is published. All three have released character packages
  pinned to the current live edition bytes. Publishing needs a package
  re-anchor plus a `characterCards.ts` revision bump, which is app code. It
  also needs audio regeneration for the changed paragraphs.
- The exact handoff is in each `RELEASE-PACKET.md` → Publication status.

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
| 1 | The Manual | `the-manual` | **Text accepted** | Lane A (freed) | Reusing branch candidate as working draft (orig. sha256 `d785f2c99c7f628123b976457303d32143782f4e576e8d81671636e2c1e3bd42`, now modified). Full round history in `books/wip/green-manual/ACCEPTANCE-RECORD.md`. Final accepted sha256 `f2791351f992aca8951eca00aa33c636bc752edac66c08e87bedcc6b90de12a7` (2026-09-21). Deliberately-preserved non-blocking items: §47 unglossed "Do not embrace statues", §29 minor word choice, several unglossed-but-context-supported proper names. **Ready for publication handoff** — release packet not yet prepared. |
| 2 | Descartes' Meditations | `descartes-meditations` | **Text accepted** | Lane B (freed) | Full round history in `books/wip/green-descartes-meditations/ACCEPTANCE-RECORD.md`. Final accepted sha256 `8eb4d6b5409f23a2355d39a8cb712937b54876a34afae96e05b0fe40dd33c490` (2026-09-21). S1-S7 editorial repairs to a corrupt Veitch-translation source and the scripture-quotation-modernization policy both documented and ratified. Deliberately-preserved: Ch7/Ch8 dense paragraphs, Ch9 inventory paragraph, one unglossed "hippogryphs". **Ready for publication handoff** — release packet not yet prepared. |
| 3 | The Comedy of Errors | `comedy-of-errors` | **Text accepted** | freed | Full round history in `books/wip/green-comedy-of-errors/ACCEPTANCE-RECORD.md`. Final accepted sha256 `5d00ae65df86709d93c51a10f8d6643a29344641ec467f421e7bf69df7574bcd` (2026-09-21). One blocking defect found and fixed (a directional joke-inversion in a Dromio line). **Ready for publication handoff** — release packet not yet prepared. |
| 4 | Candide | `candide` | **Publication handoff (blocked)** | freed | Full round history in `books/wip/green-candide/ACCEPTANCE-RECORD.md`. **2026-09-23 round 2:** the pre-publication check found silent proper-noun normalization that round 1 missed (Buenos Ayres→Aires, Leibnitz→Leibniz, Abbe→Abbé, Marchioness→Marquise, Mahomet→Muhammad, etc.). Fixed 131 occurrences in 93 paragraphs, independently verified clean (`fidelity-review-2-name-sweep.md`). **Accepted sha256 now `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25`**; the 2026-09-21 hash `a32b2555…` is superseded. English-translation source is the sole fidelity anchor (no French original in repo). Release packet done. **Not published:** needs the released character package re-anchored and its `characterCards.ts` revision bumped (app code), plus audio regeneration for 100 changed paragraphs. Exact handoff in `RELEASE-PACKET.md` → Publication status. |
| 5 | The Prince | `the-prince` | **Publication handoff (blocked)** | freed | Full round history in `books/wip/green-the-prince/ACCEPTANCE-RECORD.md`. Accepted sha256 `fbdf701292f34f01d5c0af0aad55975853de0157a3260ad3ebde164cfb7d1589` (2026-09-21), re-verified 2026-09-23: every recorded correction present, zero residual name normalizations, no repairs needed. ch22p8 gate flag was a false positive. Count corrected to **31 instances across 4 sweeps** per the acceptance record; the earlier "33 / 5 sweeps" had no supporting record. Release packet done. **Not published:** needs the released character package re-anchored and its `characterCards.ts` revision bumped (app code), plus audio regeneration for 31 changed paragraphs. Exact handoff in `RELEASE-PACKET.md` → Publication status. |
| 6 | Oedipus Rex | `oedipus-rex` | **Text accepted** | freed | Full round history in `books/wip/green-oedipus-rex/ACCEPTANCE-RECORD.md`. Final accepted sha256 `0d6ab07adf4ef49de09d9ae8234b9be973568c55400ab06a83c91a67e80f9998` (2026-09-21). Zero blocking defects at any round; accessibility fixes concentrated in choral-ode mythological glossing. **Ready for publication handoff** — release packet not yet prepared. |
| 7 | Oedipus at Colonus | `oedipus-at-colonus` | **Text accepted** | freed | Full round history in `books/wip/green-oedipus-at-colonus/ACCEPTANCE-RECORD.md`. Final accepted sha256 `5da99c2a47365f578fd45d5d930b8aff3dfd57f50f987b11e950a320887862ff` (2026-09-21). 2 minor fidelity fixes + 7 accessibility glosses. **Ready for publication handoff** — release packet not yet prepared. |
| 8 | Antigone | `antigone` | **Text accepted** | freed | Full round history in `books/wip/green-antigone/ACCEPTANCE-RECORD.md`. Final accepted sha256 `67d8ba62af31154733c3c6ccc8242f58d9f261e8738db4865e0ae91ff55b26ab` (2026-09-21). Notable: an early gloss pass invented mythological identities (Niobe, Lycurgus, etc.) for figures the source deliberately leaves unnamed — caught by independent re-verification and reverted before acceptance. **Ready for publication handoff** — release packet not yet prepared. |
| 9 | The Sorrows of Young Werther | `werther` | Screening done | queued | |
| 10 | Crito | `crito` | **Text accepted** | Lane C (freed) | substitute for Apology (which substituted for Meditations). Full round history in `books/wip/green-crito/ACCEPTANCE-RECORD.md`. Final accepted sha256 `511340f43167c290d35cfe89618a07a3afca812412b6b7eefcd69b67f8012ac5` (2026-09-21). Notable: fidelity review caught one isolated instance of the same dropped/duplicated-paragraph defect family that disqualified Apology (2.9), but a full chapter-level recheck confirmed it was NOT systemic — fixed and reverified. **Ready for publication handoff** — release packet not yet prepared. |

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
