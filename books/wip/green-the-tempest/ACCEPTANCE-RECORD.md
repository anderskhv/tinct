# Acceptance Record — The Tempest (`the-tempest`, modern-en)

**Book id:** `the-tempest`
**Edition:** `modern-en`
**Status: HARD PARKED (2026-09-21, after round 4).** NOT accepted. No
acceptance hash, no `accepted-paragraph-hashes.tsv`, no release packet —
and none should be produced. Round 4's independent pass confirmed every
one of round 3's 23 fixes as present and correct, and confirmed the
proper-noun/deity class is finally closed, but found ~14 further live
items (6 blocking) inside the other defect classes every prior round had
certified as swept. Defects per round: 14 -> 15 -> 23 -> ~14; no plateau.
Full round-4 record: section 6 of `PARKED-RESOLVED.md`. See `PARKED-RESOLVED.md` (formerly
`PARKED.md`) for round 2's findings and `fidelity-review-3.md` for round
3's fix table, fresh location-keyed sweep, lexical policy, and
verification. No acceptance hash / `accepted-paragraph-hashes.tsv` /
release packet has been produced yet — those are for the independent
verifier to write once they confirm this round.

**Model note.**
- Round 1 (blind accessibility review, fidelity review, fixes, whole-book
  re-read, the round-1 record below): **Claude Sonnet 5**
  (`claude-sonnet-5`). Artifacts: `accessibility-review-1.md`,
  `fidelity-review-1.md`.
- Round 2 (independent adversarial fidelity verification, source-based,
  no reuse of round 1's word/character lists): **Claude Opus**
  (`claude-opus-5`). Artifact: `PARKED-RESOLVED.md`. Confirmed round 1's
  structure claim and all 14 of its fixes, then found **15 further
  blocking defects across 5 classes** on its first independent pass —
  including two mythological proper nouns dropped at locations where a
  count-based diff cannot see them (Jove 2.53, Neptune 9.11), a plot-fact
  inversion (Claribel "far away in Italy", 3.72), erasure of Stephano's
  `Coragio` / `bully-monster` (9.74), and a silent standardization of the
  source's printed "you god" → "you gods" (9.53) that contradicts round
  1's own accepted "My mistress" ruling. `candidate.json` was not
  modified by round 2.
- Round 3 (correction round, final under the three-round rule): **Claude
  Sonnet 5** (`claude-sonnet-5`), independent of round 2. Artifact:
  `fidelity-review-3.md`. Fixed all 15 of round 2's blocking items,
  verifying each against `source.json` fresh rather than trusting the
  cited coordinates (all 15 coordinates turned out correct). Built a
  genuinely location-keyed (not count-based) proper-noun/deity sweep and
  found no further drops of that shape beyond the two round 2 already
  found. Ran a fresh sweep of the other four defect classes and found 7
  more real items (a mistranslated "mop and mow," a de-specified
  "stripes," a dropped "worm" epithet, three more drops of Ferdinand's
  "mistress" address, and a unit-to-multiplier distortion of "Ten
  leagues"), fixed all 7. Wrote and applied an explicit lexical policy for
  the ~8 non-blocking items PARKED.md asked this round to rule on. Final
  `candidate.json` sha256: `c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806`.

**Staged files:** `books/wip/green-the-tempest/source.json` (unmodified,
locked, never edited), `books/wip/green-the-tempest/candidate.json` (round-1
+ round-3 corrections applied), `books/wip/green-the-tempest/candidate_readable.txt`
and `source_readable.txt` (linear dumps generated before round 1's fixes;
**stale** — round 1's fix locations/wording are in `fidelity-review-1.md`,
round 3's are in `fidelity-review-3.md`; an independent verifier should
re-derive fresh dumps from the final `candidate.json` rather than trust
these).

**Final file hash (candidate.json, sha256), current:**
`c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806`

(Round 1's hash, superseded: `14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`
— this was the hash round 2 reviewed and parked.)

This is pinned to `candidate.json`'s state after all 14 round-1 fixes, all
15 of round-2's blocking finds fixed in round 3, and 7 further items round
3's own fresh sweep found — every fix independently re-verified against
`source.json` directly (not just against its own stated rationale) — see
`fidelity-review-1.md` and `fidelity-review-3.md` for the full defect
tables and verification method.

No app, registry, audio, or deploy action was taken. This directory only.
No paid API calls.

---

## Source completeness check (done first, per task instructions)

Given this batch's recent history of two structurally-incomplete sources
(Henry V's missing Prologue, Macbeth's two missing soliloquies), `source.json`
was spot-checked against six of the play's best-known passages before any
review work began:

- Prospero's "Our revels now are ended" (Ch8) — present.
- Caliban's "This island's mine" (Ch2 ¶105, 1-based) — present.
- Ariel's "Come unto these yellow sands" and "Full fathom five" songs (Ch2)
  — both present in full.
- Miranda's "O brave new world" (Ch9 ¶47) — present.
- "The red plague rid you" (Ch2 ¶109) — present.
- "Setebos" (Ch2 ¶113 and Ch9 ¶76) — present.

Source is structurally complete. No structural-skip.

## Structure

- 10 chapters in both files, all real Act/Scene reading units: Act 1
  Sc.1–2, Act 2 Sc.1–2, Act 3 Sc.1–3, Act 4 Sc.1, Act 5 Sc.1, Epilogue. No
  apparatus, editorial-note, collation, or scene-crosswalk chapters; titles
  are all reader-facing ("Act 2, Scene 3 — ...").
- Chapter `number` sequence and `title` strings identical between source
  and candidate.
- Per-chapter paragraph counts identical, chapter by chapter: 43, 175, 170,
  58, 29, 74, 39, 98, 102, 2 — **790 paragraphs total in both files**,
  order locked, no empty or whitespace-only paragraph on either side.
- JSON valid (`python3 -m json.tool`) for both `source.json` and
  `candidate.json`.

## Methodology

Full detail is in `fidelity-review-1.md`. Summary:

1. Every one of 790 paragraph pairs read in full, source against candidate,
   no sampling (both files dumped to linear readable text and read start
   to finish by chapter).
2. A verbal-tic audit built fresh from the actual read, not inherited from
   any prior book's defect list (this is the first pass on this book):
   Caliban's cursing register, his drinking-song self-naming stutter,
   Stephano/Trinculo's drunk banter, and Ariel's songs were each checked
   for every occurrence of a repeated marker.
3. A charged/crude-word grep run fresh against the source (filth, vile,
   abhorred, loathsome, villain, wretch, malice, scum, knave, traitor,
   coward, dog, cur, monstrous, whore, wench, unstanched, piss, damn, hell,
   devil, bastard, whoreson, pox, murrain), every hit checked against the
   candidate's matching paragraph.
4. A full capitalized-token cross-reference (Python `Counter` diff) between
   source and candidate to catch dropped proper nouns; every genuine name
   on the resulting list (as opposed to expected archaic-verb noise like
   "Thou"/"Dost") checked in context.
5. An exclamation-mark count diff across all 790 paragraphs; every
   paragraph where the candidate's count was lower than source's was
   individually re-read (all confirmed as legitimate restructuring, not
   lost emphasis).
6. A second full-book re-read after the first fix round, specifically to
   find what the above, list-based checks would structurally miss — this
   is what surfaced the Hymen/Phoebus name drops and the "My mistress" →
   "My mother" silent correction (items not on any prior list, since none
   existed).

## Defects found and fixed (round 1)

14 fixes across 5 chapters. Full table with source/before/after text is in
`fidelity-review-1.md`. Defect classes:

| Class | Count | Examples |
|---|---|---|
| Erasure of a crude/charged word | 3 | "whoreson" dropped; "whores" → "scoundrels"; "malice" (vocative insult) dropped |
| Register-softening (bawdy/crude image replaced with a neutral one) | 2 | "unstanched wench" → "leaked like a sieve"; "horse-piss" → "horse urine" |
| Dropped specific adjective/noun (curse/disease made generic) | 2 | "red plague" → "plague"; "dropsy" → "plague" |
| Dropped image breaking joke coherence | 1 | "an apple"/"kernels" (Antonio's island-in-a-pocket joke) generalized to "a present"/"seeds," breaking the apple→kernel logic |
| Malapropism/deliberate-mangling erasure | 1 | Caliban's drunken self-naming stutter "Cacaliban" flattened to plain "Caliban" |
| Silent "correction" of source's own printed form | 1 | "My mistress" (a well-known editorial crux) silently corrected to "My mother" |
| Meaning alteration | 1 | "Mars's hot minion" (passionate favorite) mistranslated as "hot-tempered mistress" (invents a temper trait) |
| Dropped mythological proper noun | 3 | Hymen (×2), Phoebus — all in the Act 4 masque, where every other deity (Iris, Ceres, Juno, Venus, Cupid, Mars, Dis, Jove) is named |

Verification per fix: `content_edit_helpers.safe_replace()` for every
change; `validate_structure()` after each round; `assert_only_changed()`
confirming each round touched exactly its intended paragraph indices and
nothing else; every fixed paragraph independently re-read against
`source.json` directly after writing it, not just checked against its own
stated rationale.

## Deliberately non-blocking items (reader-centered reasoning)

- **Argier → Algiers, still-vex'd Bermoothes → ever-stormy Bermudas.**
  Both are the source's own archaic spellings of real, identifiable
  present-day places, used consistently; modernized the same way "thou" is
  modernized to "you," not corrected as if an error. No image, claim, or
  distinguishing word is lost — unlike the fixed defects above (red
  plague, dropsy, Hymen, "My mistress"), nothing here is a specific
  detail the text depends on.
- **"Poor-John" → "dried cod."** A period-specific cheap-fish term
  translated to a comparably cheap, recognizable fish name; preserves
  Trinculo's joke without requiring period fishmongering knowledge.
- **"flesh-fly blow my mouth" → "let flies crawl in my mouth" (Ch5 ¶15).**
  Drops the specific carrion/egg-laying entomological detail but keeps the
  core meaning (Ferdinand would rather suffer this than dishonor Miranda);
  the technical specificity is inessential to the claim being made.
- **"pox"/"murrain" occasionally rendered as a different period curse of
  equal force** (e.g. "pox" → "plague" at one Stephano line). Judged
  non-blocking where no specific claim/detail is lost, as distinct from
  the red-plague/dropsy cases (fixed) where a *precisely-once-used*
  distinguishing adjective or disease name was generalized away.
- **Nautical commands simplified** (Ch1: "lay her a-hold" → "hold her
  steady," etc.). Jacobean seamanship jargon with no modern-reader
  meaning even glossed; the dramatic content (crew fighting the storm) is
  fully preserved.

## Accessibility review

No blocking issues found. `accessibility-review-1.md` documents the full
blind read and two non-blocking soft notes (Prospero's long Act 1 Sc.2
narration is inherently dense — a structural feature of the source, not a
rendering defect; the masque scene names several classical figures without
inline glosses, consistent with not inventing interpretation the source
doesn't supply).

## Verdict (round 1 — SUPERSEDED by round 2, see PARKED-RESOLVED.md)

**READY FOR INDEPENDENT VERIFICATION.**

Final `candidate.json` sha256:
`14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`

This is round 1 only. Per task instructions, a separate independent Opus
verification pass follows and will either confirm this acceptance (and
produce `RELEASE-PACKET.md` / `accepted-paragraph-hashes.tsv`), or find
further defects, in which case standard correction-round tracking applies
per `SECOND-BATCH-TRACKER.md`'s process notes.

## Verdict (round 2 — Claude Opus, independent verification)

**NOT ACCEPTED — PARKED 2/3.** 15 blocking defects across 5 classes found
on round 2's first independent pass despite round 1's self-certified clean
whole-book re-read. Full detail: `PARKED-RESOLVED.md`.

## Verdict (round 3 — Claude Sonnet 5, correction round, final under the
three-round rule)

**READY FOR INDEPENDENT VERIFICATION.**

All 15 of round 2's blocking items fixed and independently re-verified
against `source.json` fresh. A genuinely location-keyed proper-noun/deity
sweep found no further instances of the Jove/Neptune drop pattern. A fresh
sweep of the other four defect classes found 7 more real items (fixed). An
explicit lexical policy was written and applied to the ~8 non-blocking
items round 2 flagged. `validate_structure()`, `diff_report()`, and
`assert_only_changed()` confirm exactly the 22 intended paragraphs changed
and nothing else, with no ratio outlier among them. Full detail:
`fidelity-review-3.md`.

Final `candidate.json` sha256:
`c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806`

Per the task's three-correction-round rule, this was the last correction
round, with the stated condition: *if a round-4 independent pass again
finds live instances of classes A-D, this book hard-parks.*

## Verdict (round 4 — Claude Opus `claude-opus-5`, independent verification, FINAL)

**NOT ACCEPTED — HARD PARKED.** That condition was met.

Re-derived from `source.json` and `candidate.json` with no reuse of any
prior round's lists: structure (10 chapters / 790 paragraphs, exact
match); all 790 paragraph pairs read in full; all 23 of round 3's fixes
located by distinctive source wording rather than cited coordinates and
confirmed present and correct; an independently built location-keyed
capitalized-token map (232 tokens) that found **no** dropped proper noun,
deity or epithet anywhere — that class is genuinely closed; a fresh
~190-term charged-word and address-form lexicon; a curated concrete-noun
sweep; and a compression sweep over all 414 paragraphs of >=12 source
words including the moderate 0.85-0.95 band, which came back clean.

What blocks acceptance is class D/E residue that has not plateaued:
6 blocking items (`adders`->"snakes" 4.2; `pard or cat o' mountain`->"a
leopard" 8.95; `chough`->"jackdaw" 3.141; `cubit`->"inch" 3.141;
`Mistress line`->"this clothesline" 8.82; the snow/liver image erasure
8.17) plus 8 sub-blocking items of the same shapes. Every one is
forbidden by the lexical policy **round 3 itself wrote**; one (8.82)
contradicts a policy item written in that same round; another (3.141
`cubit`) sits two paragraphs from the `Ten leagues` unit distortion round
3 found and fixed for the identical reason.

`candidate.json` was not modified by this round. Its sha256 remains
`c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806` —
round 3's self-report was accurate, but this is a file hash, **not** an
acceptance hash.

Recommended disposition: do not open a round-5 correction pass. Revive
only as a re-rendering under a pre-committed concrete-noun and
address-form discipline, per section 6.6 of `PARKED-RESOLVED.md`.

**Model note (all four rounds):** rounds 1 and 3 = Claude Sonnet 5
(`claude-sonnet-5`); rounds 2 and 4 = Claude Opus (`claude-opus-5`).

### Coverage table across all 4 rounds

| Class | R1 | R2 | R3 | R4 (independent) | Status |
|---|---|---|---|---|---|
| Structure (10 ch / 790 ¶ / alignment) | clean | clean | clean | clean | **closed** |
| Source completeness (set-piece speeches) | clean | clean | clean | clean | **closed** |
| Proper nouns / deities / epithets (location-keyed) | count-based, missed 2 | found 2 | swept, clean | independently rebuilt, clean | **closed** |
| Compression / dropped clause / content loss | 1 found | 1 found (E1) | fixed | all 414 ¶ >=12w re-swept, clean | **closed** |
| Meaning alteration / invented content | 3 found | 3 found | fixed | clean | **closed** |
| Printed-form normalization | 1 found | 2 found | fixed | 1 live (`Cacaliban` 4.56) | **open** |
| Charged / crude / violent word softening | 5 found | 5 found | fixed + policy | 2 live (`pox` 6.40, `thrice-double ass` 9.92) | **open** |
| Named animal / plant / unit de-specification | 2 found | 2 found | fixed + policy item 7 | **6 live** (4.2, 8.95, 3.141 x2, 9.11, 8.40) | **OPEN — blocking** |
| Address / epithet forms | 1 found | 3 found | fixed + policy item 4 | **1 live** (`Mistress line` 8.82) | **OPEN — blocking** |
| Image / figure erasure | — | — | 1 found (`Poor worm`) | **1 live** (8.17 snow/liver) | **OPEN — blocking** |
| Idiom / pun loss | — | — | — | 2 live (`line and level` 8.83/8.84, `bat-fowling` 3.108) | **open** |
| Register seam introduced by a fix | — | — | — | 1 live (2.80 `thou`/`you` mix) | **open** |
| Lexical policy (scurvy / sirrah / songs / wench) | — | flagged ~8 | written | spot-checked, **reasoning holds** | **closed** |

Defects found per round: **14 -> 15 -> 23 -> ~14.**
