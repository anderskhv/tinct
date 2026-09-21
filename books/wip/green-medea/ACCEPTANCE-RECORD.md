# Acceptance Record — Medea (Euripides), modern-en

**Book / id:** Medea, `medea`
**Source (fidelity anchor):** `app/public/data/editions/medea-original-en.json`
(Gilbert Murray's public-domain verse translation), staged unmodified as
`books/wip/green-medea/source.json`.
**Candidate origin:** `app/public/data/editions/medea-modern-en.json`,
staged as `books/wip/green-medea/candidate.json`, repaired in place per
`books/TRANSLATION_PROTOCOL.md`.
**Drafting / round-1 repair model:** Claude Sonnet 5 (`claude-sonnet-5`) —
drafter-repair, blind accessibility reviewer and packet fidelity reviewer
were all the same model/session in that pass.
**Final independent verifier:** Claude Opus (`claude-opus-5`), a different
model from the drafting pass. Rounds 2 and 3 below were performed by this
verifier.
**Date of acceptance:** 2026-09-21

## Structure

7 chapters (Prologue, Parodos, First Episode, Second Episode, Third
Episode, Fourth Episode, Exodos) — real dramatic units, no textual
apparatus, no stub chapters. Paragraph counts match `source.json` exactly,
chapter by chapter, and paragraph order/indices are unchanged through
every round.

| Chapter | Title | Source ¶ | Candidate ¶ |
|---|---|---|---|
| 1 | Prologue | 20 | 20 |
| 2 | Parodos | 8 | 8 |
| 3 | First Episode | 25 | 25 |
| 4 | Second Episode | 79 | 79 |
| 5 | Third Episode | 10 | 10 |
| 6 | Fourth Episode | 32 | 32 |
| 7 | Exodos | 67 | 67 |
| — | **Total** | **241** | **241** |

## Review coverage — honest accounting

| Round | Model | What was done | Coverage actually achieved | Result |
|---|---|---|---|---|
| 1 | Sonnet 5 | Blind accessibility review + packet fidelity review + cross-boundary re-read | **Claimed** "all 7 chapters, all 235 paragraphs" for the accessibility step. The book has **241** paragraphs. The coverage claim was inaccurate, and round 1's "clean" findings are therefore not evidence of full coverage. | 4 paragraph fixes applied |
| 2 | Opus | Independent spot verification against source | Targeted, not whole-book | 2 defects round 1 missed, both fixed |
| 3 | Opus | **Full whole-book fidelity read (candidate vs. source, every paragraph) + fresh candidate-only accessibility read + cross-boundary/terminology sweep** | **All 7 chapters, all 241 paragraphs, both halves, no sampling** | 13 paragraph-level fixes applied; no remaining blockers |

Round 3 is the pass that actually delivered full 241-paragraph coverage.
It was run as a genuinely fresh read, not as a confirmation of round 1 —
round 1's clean verdicts were treated as unverified.

## Defects by round

### Round 1 (Sonnet 5) — 4 fixes

1. Ch.1 ¶1 — certainty/timing overstatement about Medea being "locked out
   from any home" before the exile order.
2. Ch.3 ¶0 — unmodernized archaism "forsooth" in modern prose.
3. Ch.5 ¶9 — tone reversal of the Chorus's "'Twill be well!".
4. Ch.6 ¶14 — clarity fix to the blood-over-gold line.

### Round 2 (Opus, independent verification) — 2 defects round 1 missed

5. **Ch.1 ¶1 and Ch.4 ¶4 — silent spelling normalization.** Source's
   "Iolcos" had been silently corrected to the standard "Iolcus". Fixed;
   both occurrences now reproduce the source's own printed form.
6. **Ch.1 ¶1 — dropped word.** Source's "the blue Symplegades" had become
   "the dark Symplegades". Round 1 had recorded this as a *deliberately
   preserved non-blocking item*; that rationale was wrong — it was a
   dropped/substituted word, not a defensible choice. Fixed.

### Round 3 (Opus, full 241-paragraph pass) — 13 fixes

**Blocking-class fidelity defects (5):**

7. **Ch.4 ¶4 — negation/logic inversion.** Source: "Since **not** my
   passioning, **but** thine own heart, doth cry thee for a thing
   Forsworn" (exclusive). Candidate had "It cannot be **only** my passion
   … your own heart must say it **too**" (inclusive) — a different claim.
   Fixed to "It is not my passion that calls you forsworn — it is your own
   heart."
8. **Ch.5 ¶8 — attribute attached to the wrong bearer.** Source: Medea is
   "foul among thy kind, With the tears of children **blind**" — she is
   the one blinded. Candidate had "with the tears of **blinded children**
   on you", moving blindness onto the children. Fixed to "blind with the
   tears of children".
9. **Ch.6 ¶3 — condition dropped + person switched.** Source (Jason, of
   himself in the third person): "**If God but help him**, **he** hath
   wrought a strong deliverance". Candidate asserted it flatly and in the
   first person: "**With God's help I have worked out** …". Fixed to "If
   God will only help him, he has worked out …".
10. **Ch.1 ¶1 — added causal claim.** Source: the daughters of Pelias
    acted "**knowing not**". Candidate had "**deceived**", which asserts a
    deceiver the source's words do not name here. Fixed to "not knowing
    what they did".
11. **Ch.3 ¶4 — cross-paragraph terminology break.** Source has Creon call
    Medea "a wise-woman confessed" and Medea pick the term straight back
    up in ¶5 ("A wise-woman I am"). Candidate rendered Creon's line as "a
    known **witch**", breaking the echo and loading the term. Fixed to "an
    acknowledged wise-woman"; whole book swept — "witch" now appears
    nowhere, "wise-woman" twice, matching source.

**Minor fidelity / accessibility fixes (8):**

12. Ch.1 ¶1 — "to win the Fleece **for King Pelias**" restored to "and
    **make good King Pelias's vow**" (source: "to save King Pelias' vow").
13. Ch.2 ¶2 — "his bride, who **came after my grief**" (ambiguous: could
    read as temporal) → "who **set out to bring me grief**".
14. Ch.3 ¶19 — Creon's rhetorical question had become a flat statement;
    restored as a question.
15. Ch.4 ¶3 — "in **better** days than these" (asserts the past was
    better) → "on **other** days than these" (source: "in other days").
16. Ch.4 ¶6 — Jason's opening had become "I had better not be a poor
    **pilot**", pre-empting the simile and losing his pick-up of Medea's
    word "evil". Restored to "I must show myself **not evil**"; the pilot
    simile still follows.
17. Ch.4 ¶6 — "let any ill chance **break** the thirst" (not idiomatic) →
    "**thwart that** thirst" (source: "baulk that thirst").
18. Ch.4 ¶65 — Medea's sarcasm "He **loveth to** bear bravely ills like
    these!" had been flattened to a plain statement. Irony restored.
19. Ch.4 ¶65 — "**Do not, do not let me** stand here and be cast out"
    (imperative, wrong actor) → "**You will never stand there and watch
    me** cast out" (source: "Thou never wilt stand there And see me cast
    out").
20. Ch.7 ¶11 — "Fierce are the **strikes back of** blood once shed"
    (awkward) → "the **blows that come back for** blood once shed".
21. Ch.7 ¶21 — "the **dead king's** kinsmen" narrowed the source's plural
    "the kinsmen of **the dead**" (Creon *and* the princess). Restored.
22. Ch.7 ¶52 — "your **beguiled friends**" (ambiguous about who beguiled
    them) → "**the friends you beguiled**".

All round-3 fixes were applied with
`content_edit_helpers.safe_replace()` (each target string verified unique
before replacement), gated with `validate_structure()` and
`assert_only_changed()` (exactly 13 paragraphs changed, no others), and
then **each changed paragraph was re-printed side by side with its source
paragraph and re-derived from the source directly**, not checked against
the fix's own stated rationale. Name/term fixes were swept book-wide by
regex, not just at the edit site.

## Verification checks run in round 3

- Full proper-noun frequency diff, source vs. candidate — every divergence
  individually traced and justified. Source's own spellings are preserved
  throughout, including the non-standard ones: **Iolcos** (2/2),
  **Trozen**, **Skylla**, **Symplegades** (2/2), **Cephisus**,
  **Pelion**, **Hellas**.
- **Unnamed figures stay unnamed.** Medea's murdered brother is
  referenced twice (Ch.2 ¶2 "the voice of my brother's blood"; Ch.7 ¶31
  "a brother murdered on your hearth") and is never given a name the
  source withholds. Whole-book grep confirms "Absyrtus"/"Apsyrtus" appear
  0 times. Creon's daughter is likewise never named (no "Glauce",
  "Creusa").
- Stage directions: all 6 `[Enter …]` and 2 `[Exit …]` cues checked
  against the source's italic-markup equivalents — all present in source,
  none invented, none dropped.
- Speaker labels checked across all 241 paragraphs (NURSE, ATTENDANT,
  MEDEA, LEADER, CHORUS, SOME WOMEN, OTHERS, OTHER WOMEN, A WOMAN, WOMEN
  AT THE DOOR, CREON, JASON, AEGEUS, MESSENGER, A CHILD WITHIN, THE OTHER
  CHILD) — consistent with source throughout, no drift.
- Chapter boundaries 1→2, 2→3, 3→4, 4→5, 5→6, 6→7 read across: no
  repeated content, no dropped content, dialogue hands off correctly
  (e.g. Ch.5 ends "[Enter JASON.]", Ch.6 opens with Jason answering).
- Fresh candidate-only accessibility read of the whole play, done without
  consulting source: reads as natural literary English throughout. Every
  passage that gave the first-time reader pause is either fixed above
  (items 13, 17, 20, 22) or listed below with a reason.

## Deliberately preserved, non-blocking (reader-centered reasons)

- **Ch.7 ¶32, "My claws have gripped your heart, and everything is
  shining."** Murray's line is genuinely elliptical — Medea's exultation
  outruns her syntax. Rewriting it into a tidy sentence would resolve an
  obscurity that belongs to the character at that moment, and would tell
  the reader what to feel instead of letting the image do it.
- **Ch.5 ¶9, the Chorus's closing "it will be well."** Deliberately
  ambiguous in the source (hope that Medea will relent, read against what
  the audience knows is coming). Preserved because the double edge *is*
  the effect; an explanatory rendering would spoil it.
- **Ch.6 ¶10, "Bid her — for your sake, ask the daughter for this
  favour."** The source line ("for a daughters boon") is textually rough.
  One defensible reading is carried through; the candidate does not invent
  a smoother line the source cannot support, and Jason's reply ("Her I can
  shape to my mind") keeps the reader oriented either way.
- **Ch.6 ¶15, "She takes the gold band and opens it."** Source's "bounden
  gold" is ambiguous between the casket and the ornament. The ambiguity is
  kept rather than silently decided for the reader.
- **Classical epithets left unglossed** — "the Cyprian", "Pallas' plain",
  "Pandion's son", "Maia's guiding Son", "the Lords of Death", Erechtheus,
  Cephisus, Phoebus, Pittheus. These are period colour and allusion the
  genre runs on; none blocks following the plot, and glossing them would
  mean adding identifying claims (a specific deity, a specific cult site)
  beyond what the source's own words state — the exact failure mode this
  programme guards against.
- **Stage directions rendered as plain bracketed text** rather than the
  source's underscore-italic markup. Structural constraint of the edition
  JSON format, which has no inline styling; wording and content are
  unchanged.
- **241-paragraph structure locked**, including several very long compound
  verse paragraphs (Ch.4 ¶4 and ¶6, Ch.6 ¶29, Ch.7 ¶6 each run to a full
  page). They are not split, because paragraph indices must stay aligned
  with `source.json` and the other editions for split-pane reading and
  audio.

## Final file

- **File:** `books/wip/green-medea/candidate.json` (post-round-3, final)
- **sha256:** `8aafd12a4c3fab2c24dd6776b00ba42da12c3bc2bf2a10ebe01e348dda699381`
- **Chapters / paragraphs:** 7 / 241, matching `source.json` exactly,
  chapter by chapter, order preserved.
- **JSON validity:** `python3 -m json.tool` clean.

## Verdict

**ACCEPTED** after three correction rounds (19 paragraph-level defects
fixed in total). No blocking defects remain after round 3's full
241-paragraph fidelity read, fresh accessibility read, and cross-boundary
sweep, each fix having been independently re-verified against the source.
