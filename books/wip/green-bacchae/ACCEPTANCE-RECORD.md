# ACCEPTANCE RECORD — The Bacchae (`bacchae`), modern-en

**Status:** ACCEPTED.
**Date:** 2026-09-21.
**Accepted by:** Claude Opus (model id `claude-opus-5`), round-4 independent
confirmation pass.
**Final file:** `books/wip/green-bacchae/candidate.json`
**Final sha256:** `19507a56111d7394a028782d42997e75028a0502fec39c97e631f6efc0f799a8`
**Source pin:** `fd89db94d47b8a03eb008a7b94752c13145a9d2dcfb17e4e00adff5e474c8539`
(Gilbert Murray's verse translation, the locked `source.json`)

This record **replaces** the round-1 acceptance record, which claimed
acceptance on the basis of a sampled review and is void. The full
round-by-round defect history is preserved in `PARKED-RESOLVED.md` in this
directory; this record summarizes it rather than repeating it.

Programme: green-library second batch (`books/wip/SECOND-BATCH-TRACKER.md`,
book #6). Acceptance procedure per `books/TRANSLATION_PROTOCOL.md`.

---

## Honest history — four rounds

This book took four rounds. Three of them found real, blocking defects. That
is the record, and it should stay visible.

**Round 1 (Claude Sonnet 5 — draft + both reviews).** Two blocking defects,
both softening of the sparagmos narrative in ch11 p10 (0-indexed): "the
shoulder severed" weakened to "came away", and "pierced upon a wand, as one
might pierce a lion's" weakened to "fixed"/"fix". Both fixed. The round-1
acceptance record issued here was premature — its reviews were sampled, and
it explicitly *endorsed* as a "documented convention" the name normalization
that round 2 would find to be a defect.

**Round 2 (independent verification).** Found book-wide silent normalization
of Murray's own printed transliterations to historically standard forms —
the exact failure class the batch's carried-forward lessons name. ~40
paragraphs across chapters 1, 2, 3, 5, 6, 7, 9, 11 were corrected:
Teiresias, Kithaeron, Bromios, Bacchios, Acheloues, Pierie, Iacchos, Thebe,
Cadmeian, plus the source's genuine Dionyse/Dionysus variation restored
location by location, plus removal of a forbidden gloss naming "Aphrodite"
where source says only "the very Cyprian".

**Round 3 (independent adversarial verification).** Found the round-2 sweep
was **case-sensitive and incomplete**: it fixed the 7 mixed-case in-line
`Teiresias` occurrences but never touched the 13 all-caps `TEIRESIAS`
speaker-tag/stage-direction occurrences, which remained normalized to
`TIRESIAS`. Two paragraphs (ch3 p1 and p15, 0-indexed) carried both
spellings of one character inside a single speech. The book was PARKED.

**Round 4 (this pass — confirmation only, no fixes made here).** The 13
all-caps occurrences were reverted to `TEIRESIAS` before this pass began.
This pass verified that fix and re-ran the sweep the round-2 miss called for.

---

## Round-4 verification performed

All checks re-derived from `source.json` directly, not taken on any prior
report's word.

| Check | Method | Result |
|---|---|---|
| The 13 all-caps fixes | Per-paragraph `\bTEIRESIAS\b` count, source vs candidate, every paragraph in the book | 13/13, identical locations: ch2 p8; ch3 p0/1/2/5/7/9/11/13/15/18/23/24 (0-indexed). Zero per-paragraph divergence. |
| `TIRESIAS` anywhere | Raw-file grep of `candidate.json` | **0 occurrences** (source: 0) |
| `TEIRESIAS` anywhere | Raw-file grep of both files | **13 / 13**, matching source exactly |
| Mixed-case `Teiresias` | Per-paragraph count | 7 / 7 (ch3 p1/p3/p15/p17/p20, ch11 p48), matching source exactly |
| Structure | Chapter count, per-chapter paragraph counts, numbers, titles | 11 chapters, 336 paragraphs, `3/9/26/4/53/19/69/4/30/8/111`, all titles and numbers identical to source |
| JSON validity | `python3 -m json.tool` | Valid |

**On the "internal inconsistency" noted in round 3 — resolved, and the
understanding is confirmed against source.** Source itself uses two forms:
all-caps `TEIRESIAS` for speaker tags and stage directions (13×) and
mixed-case `Teiresias` for in-line prose reference (7×). Source's own ch3 p1
and ch3 p15 each contain **both** forms in one paragraph — that is Murray's
typographic convention, not an error. The round-3 defect was never that the
two forms differ from each other; it was that the all-caps form had been
normalized to `TIRESIAS` while the mixed-case form had been restored, leaving
`TIRESIAS.` as a speaker tag above a body that read `Teiresias`. The
candidate now reproduces source's two-form convention exactly, paragraph for
paragraph.

**The case-sensitivity gap, swept properly.** Because the round-2 miss was
caused by a sweep that never considered uppercase variants, this pass
enumerated **every all-caps token in both files** and diffed the counts:

```
AGAVE 52/52   CADMUS 39/39   CHORUS 40/40   DIONYSUS 98/98
LEADER 33/33  MAIDENS 1/1    MESSENGER 12/12 PENTHEUS 95/95
PENTHEUS' 1/1 SOLDIER 3/3    TEIRESIAS 13/13 THE 5/5  VOICE 4/4  OF 1/1
```

Every proper-noun token matches. Source contains **no** all-caps form of
Kithaeron, Bromios, Bacchios or Dionyse — `DIONYSUS` (98×, the speaker tag)
is the only all-caps Dionysus-family token and matches exactly — so no
analogous case-sensitivity miss is possible for those names. The only
all-caps diffs in the whole book are `MS` (2→0, non-blocking item N-4) and
two emphasis renderings recorded as N-6 below.

**Round-2 name fixes re-confirmed, case-insensitively, per paragraph:**
Kithaeron 11/11 (Cithaeron 0), Bromios 12/12 (Bromius 0), Bacchios 5/5
(Bacchus 0), Dionyse 13/13, Dionysus 110/110, Acheloues 1/1, Pierie 1/1,
Iacchos 1/1, Thebe 1/1, Cadmeian 1/1, Aphrodite 2/2, Cyprian 1/1. Zero
per-paragraph mismatches for the Dionyse/Dionysus split across the whole
book, including the paragraphs where source switches form mid-speech.

**Round-1 violence fixes re-confirmed intact** at ch11 p10: "and the shoulder
was severed", "a severed arm", "pierced upon a wand as one might pierce a
lion's". No softening found elsewhere in the messenger narrative, the
recognition scene, or the ch7 cattle-massacre speech.

---

## Defect count

| Round | Blocking defects found | Status |
|---|---|---|
| 1 | 2 (violence softening, one paragraph) | Fixed |
| 2 | 1 defect class, ~40 paragraphs (silent name normalization) | Fixed |
| 3 | 1 (same class, all-caps form, 13 occurrences) | Fixed before round 4 |
| 4 | **0** | — |

**Total: 4 blocking findings across 3 detection rounds. All resolved. Round 4
found none.**

---

## Deliberately preserved / non-blocking

Recorded so a future round does not "fix" these into defects. N-1 through N-5
are carried forward unchanged from `PARKED-RESOLVED.md` and were re-examined
this round; N-6 is new to this round.

- **N-1. "the Cyprian, goddess of love" (ch3 p18).** The gloss no longer names
  Aphrodite. The term it defines is already explicit in source's own words
  nine lines earlier in the *same* paragraph ("'Tis more to Aphrodite that
  they pray"), so it defines a reference source has already made plain rather
  than resolving an ambiguity source preserves. Borderline; judged acceptable.
  A future round may trim to "the Cyprian herself" for the tighter reading —
  not a blocker either way.
- **N-2. "Dian seed" → "divine seed" (ch1 p2).** "Dian" is Murray's archaic
  adjective meaning *divine / of Zeus*, not the goddess Diana. Left modernized
  because reproducing "Dian" would actively mislead a modern reader into
  seeing a goddess's name where the sense is "of divine descent" — the one
  place where preserving the printed form creates the very confusion the form
  was meant to avoid.
- **N-3. "Bactrian war-holds" → "war-strongholds of Bactria" (ch1 p2), "all
  Barbary" → "all the lands of the Barbarians" (ch5 p25).** The proper noun is
  preserved in both; only archaic adjectival morphology changed, in a passage
  (Dionysus's list of conquered lands) where the geography is the point and
  the archaic forms obscure it.
- **N-4. "MS." → "manuscript" (ch11 p89, ×2).** An editorial abbreviation in a
  bracketed editorial note about the lacuna — not Euripides' text. Expanding
  it keeps the note readable for someone who has never met the abbreviation.
- **N-5. Verse lineation.** Murray's verse is set as running prose in both
  files; the candidate does not attempt to restore line breaks. This is a
  structural constraint of the locked paragraph model, not an editorial
  choice.
- **N-6. Two emphasis renderings raised to all-caps: "say He IS!" (ch3 p20)
  and "that to LIVE is happiness" (ch8 p2).** Source marks these with
  initial-caps emphasis ("say He Is!", "That To Live is happy") — a
  nineteenth-century typographic convention a modern reader no longer reads as
  emphasis at all. The candidate carries the same emphasis in the form a
  modern reader recognizes. No name, meaning, or content is altered; these are
  the only two all-caps tokens in the book that are not speaker tags.

---

## Scope note

Work was confined to `books/wip/green-bacchae/`. Nothing was copied to
`app/public/data/editions/bacchae-modern-en.json`; no registry, app, audio,
onboarding, or deploy change was made. Publication (registry entry, taxonomy,
audio, onboarding, deploy) remains outstanding and is handled separately per
`books/AGENTS.md`.

`PARKED.md` has been renamed `PARKED-RESOLVED.md` and carries a RESOLVED
header. The book is no longer parked.
