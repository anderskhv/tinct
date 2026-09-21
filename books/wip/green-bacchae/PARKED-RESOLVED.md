# RESOLVED — historical record only

> **RESOLVED 2026-09-21. THE BOOK IS NO LONGER PARKED.**
>
> Defect R3-1 (the 13 all-caps `TEIRESIAS` occurrences) was fixed, and a
> round-4 independent confirmation pass by Claude Opus (`claude-opus-5`)
> verified the fix, re-ran the case-insensitive whole-book proper-noun sweep
> the round-2 miss called for, and found **zero** further defects. The book
> was **ACCEPTED** on 2026-09-21 at sha256
> `19507a56111d7394a028782d42997e75028a0502fec39c97e631f6efc0f799a8`.
>
> The live record is `ACCEPTANCE-RECORD.md` in this directory. Everything
> below is preserved as the round-1-to-round-3 defect history and is **no
> longer a live status**. In particular: the "Status: PARKED" line, the
> superseded-record note about `ACCEPTANCE-RECORD.md`, the candidate hash
> pin, and the "What a round-4 owner must do" section are all now historical
> and have been discharged.

---

# The Bacchae (`bacchae`) — PARKED after 3 correction rounds *(historical)*

**Status:** ~~PARKED. Not accepted. Do not register, deploy, or publish.~~
*(superseded — accepted 2026-09-21, see header above)*
**Parked:** 2026-09-21, by Claude Opus (model id `claude-opus-5`), round-3
independent adversarial verification.

`ACCEPTANCE-RECORD.md` in this directory is a **round-1 artifact and is now
superseded**. It records acceptance on the basis of a sampled review that did
not detect the book-wide defect class described below. It must not be treated
as a live acceptance record.

**Current candidate hash (for reference only, NOT an acceptance pin):**
`8171b4f203e34d5b9c14fb07ab743ef4ab36a54783e371657461c6017001ad43`
Source pin: `fd89db94d47b8a03eb008a7b94752c13145a9d2dcfb17e4e00adff5e474c8539`

Source edition: Gilbert Murray's verse translation (the locked `source.json`).

---

## Defect history

### Round 1 — 2 blocking defects, fixed
Graphic-content softening in the messenger's sparagmos narrative
(chapter 11, paragraph 11):

1. "the shoulder severed" had been softened to "the shoulder came away."
2. "pierced upon a wand, as one might pierce a lion's" had been softened to
   "fixed"/"fix" (both occurrences in one sentence).

Both were fixed. **Round 3 confirms both remain correct and unregressed** —
candidate now reads "the shoulder was severed", "a severed arm", and "pierced
upon a wand as one might pierce a lion's". A fresh sweep of the whole
messenger narrative and the recognition scene found no other softening.

### Round 2 — book-wide silent name normalization, partially fixed
An independent verification pass found that the source's own transliterated
proper nouns had been silently normalized to historically standard forms
throughout the book — the exact failure class the batch tracker's
carried-forward lessons name ("Never silently 'correct' a name/spelling…to a
historically standard form — reproduce the source's own printed form").

Reported and fixed in round 2 (~40 paragraphs across chapters 1, 2, 3, 5, 6,
7, 9, 11):

- Teiresias → Tiresias (×7, mixed-case in-line occurrences)
- Kithaeron → Cithaeron (×11)
- Bromios → Bromius (×12)
- Bacchios → Bacchus (×5)
- The source's own genuine Dionyse/Dionysus variation, flattened to a blanket
  "Dionysus", restored location by location (13 Dionyse / 12 Dionysus)
- Several isolated name corrections: Acheloues, Pierie, Iacchos, Thebe,
  Cadmeian
- A forbidden accessibility gloss naming "Aphrodite" where the source says
  only "the very Cyprian"

### Round 3 — the round-2 sweep was incomplete. **BLOCKING.**

**Defect R3-1 (blocking): `TEIRESIAS` → `TIRESIAS`, 13 occurrences, the
all-caps form only.**

The round-2 fix corrected the 7 mixed-case in-line occurrences of
*Teiresias* but did **not** touch the all-caps form used for speaker tags and
stage directions. Source contains `TEIRESIAS` 13 times; candidate contains
`TIRESIAS` 13 times and `TEIRESIAS` 0 times in that form.

Verified locations (all-caps form, source spelling → candidate spelling):

| Location | Source | Candidate |
|---|---|---|
| ch2 p9 | TEIRESIAS | TIRESIAS |
| ch3 p1 | TEIRESIAS | TIRESIAS |
| ch3 p2 | TEIRESIAS | TIRESIAS |
| ch3 p3 | TEIRESIAS | TIRESIAS |
| ch3 p6 | TEIRESIAS | TIRESIAS |
| ch3 p8 | TEIRESIAS | TIRESIAS |
| ch3 p10 | TEIRESIAS | TIRESIAS |
| ch3 p12 | TEIRESIAS | TIRESIAS |
| ch3 p14 | TEIRESIAS | TIRESIAS |
| ch3 p16 | TEIRESIAS | TIRESIAS |
| ch3 p19 | TEIRESIAS | TIRESIAS |
| ch3 p24 | TEIRESIAS | TIRESIAS |
| ch3 p25 | TEIRESIAS | TIRESIAS |

This is worse than the original defect, because the partial fix left the book
**internally inconsistent**. Chapters 3 p2 and 3 p16 now carry both spellings
inside a single paragraph — the speaker tag reads `TIRESIAS.` while the body
of the same speech reads `Teiresias`. A reader encounters two spellings of the
same character in the same breath. Example, ch3 p2:

> `TIRESIAS. Hello, who keeps the gate? … Tell him Teiresias is asking for
> him.`

An exhaustive comparison of every speaker tag in the book (336 paragraphs)
found this to be the **only** tag affected: DIONYSUS ×75, CHORUS ×34,
CADMUS ×31, PENTHEUS ×59, SOLDIER ×1, THE VOICE ×4, LEADER ×29,
MESSENGER ×7, AGAVE ×41 all match source exactly.

**Why this parks the book.** Under the three-round rule this is a third round
in which the same defect class — silent normalization of the source's own
printed name forms — is still present. The round-2 correction demonstrably did
not "sweep wider when a fix touches a repeated name," which is the explicit
carried-forward lesson this book was already failing against. The remedy is
mechanically trivial, but the process signal is not: two consecutive
verification rounds have now found this class unfixed, and the bar is not to
be lowered by patching it in the acceptance pass itself.

---

## What round 3 verified as clean

These were independently re-derived from `source.json`, not taken on the
round-2 fix report's word.

1. **Structure — clean.** 11 chapters, 336 paragraphs; per-chapter counts
   match source exactly (3/9/26/4/53/19/69/4/30/8/111) and chapter titles and
   numbers match.

2. **Dionyse/Dionysus split — clean, exhaustively.** Rather than sampling 10,
   every paragraph in the book containing any Dionysus-family token was
   compared against source at that exact paragraph: **111 paragraphs, 0
   mismatches**, including the mixed paragraphs (ch3 p18, ch5 p10/p39, ch7
   p15/p28/p51/p68, ch9 p1, ch11 p90) where source switches form within a
   single speech. The 13/12 Dionyse/Dionysus split is correct location by
   location. This was the highest-risk round-2 fix and it holds.

3. **Other round-2 name fixes — clean.** Per-paragraph comparison across the
   whole book found zero divergence for: Kithaeron (no Cithaeron anywhere),
   Bromios (no Bromius), Bacchios, Acheloues, Pierie, Iacchos, Thebe/Thebes,
   Cadmeian (e.g. ch9 p29 "you dark-browed Cadmeian sisters"), Cadmus,
   Semele, Pentheus, Agave, Autonoe, Ino, Echion, Agenor, Dirce, Ismenus,
   Asopus, Tmolus, Rhea, Zeus, Hera, Maenad.

4. **The Cyprian gloss — the forbidden "Aphrodite" naming is gone.** ch3 p18
   now reads "the very light of the Cyprian, goddess of love, herself." See
   non-blocking item N-1 below.

5. **Round-1 violence fixes — intact and unregressed** (ch11 p11), and a
   fresh independent read of the full messenger narrative found no other
   softening of the dismemberment, the impaled head, or the recognition.

6. **Spot checks — clean.** Chapter 9 (the Pentheus cross-dressing and
   ambush-planning scene, p10/p13/p14/p20/p26/p29), ch7 p24/p51, ch11
   p16/p40, ch4 p3. No content softening — Pentheus's dressing, his
   voyeurism, and the "where some lover lies in wait — not God!" accusation
   (ch3 p18) are all carried in full. No wording imported from Dodds,
   Kovacs, Vellacott or any other translation; the candidate consistently
   modernizes Murray's own idiom and imagery rather than substituting
   another translator's phrasing.

7. **Book-wide capitalized-token diff.** Every capitalized token appearing in
   one file and not the other was enumerated and inspected. Apart from
   TEIRESIAS/TIRESIAS, the remaining differences are archaic common words
   correctly modernized (Aye/Nay/Yea/Thou/Thy/'Tis/Howbeit etc.), plus the
   three items listed as non-blocking below.

---

## Deliberately preserved / non-blocking (unchanged, with reader-centered
reasons)

These were examined in round 3 and deliberately left alone. They are recorded
here so a future round does not "fix" them into defects.

- **N-1. "the Cyprian, goddess of love" (ch3 p18).** The gloss no longer
  names Aphrodite, and the term it defines is already explicit in the
  source's own words nine lines earlier in the *same* paragraph ("'Tis more
  to Aphrodite that they pray"). The gloss therefore defines a reference
  source itself has already made explicit rather than resolving an ambiguity
  source preserves. Borderline; judged acceptable, but a future round should
  consider trimming to "the Cyprian herself" if it wants the tighter reading —
  it is not a blocker either way.
- **N-2. "Dian seed" → "divine seed" (ch1 p2).** "Dian" here is Murray's
  archaic adjective meaning *divine / of Zeus*, not the goddess Diana. Left
  modernized because reproducing "Dian" would actively mislead a modern
  reader into seeing a goddess's name where the sense is "of divine descent" —
  the one place where preserving the printed form would create the confusion
  the form was meant to avoid.
- **N-3. "Bactrian war-holds" → "war-strongholds of Bactria" (ch1 p2) and
  "all Barbary" → "all the lands of the Barbarians" (ch5 p25).** Adjectival
  forms of place names turned into the place plus a common noun. The proper
  noun is preserved in both; only the archaic adjectival morphology changed,
  in a passage (Dionysus's list of conquered lands) where the geography is
  the point and the archaic forms obscure it.
- **N-4. "MS." → "manuscript" (ch11 p89, ×2).** An editorial abbreviation in
  a bracketed editorial note about the lacuna, not part of Euripides' text.
  Expanding it keeps the note readable for someone who has never met the
  abbreviation.
- **N-5. Verse lineation.** Murray's verse is set as running prose in both
  files; the candidate does not attempt to restore line breaks. This is a
  structural constraint of the locked paragraph model, not an editorial
  choice.

---

## What a round-4 owner must do

1. Restore `TEIRESIAS` at all 13 all-caps locations listed above. Do not
   touch the mixed-case `Teiresias` occurrences — those are already correct.
2. Re-run a case-sensitive, whole-book, per-paragraph proper-noun diff
   against `source.json` **including all-caps forms**, not only mixed-case
   forms. The round-2 miss was caused by a case-sensitive sweep that never
   considered the uppercase variant of the name it was fixing.
3. Re-pin the hash and write a fresh acceptance record; delete or clearly
   supersede the stale round-1 `ACCEPTANCE-RECORD.md`.

Per the batch's three-round rule, the next eligible book (Ivan Ilyich, or a
backup) should be pulled in this book's place rather than a round 4 being run
immediately.
