# oresteia — The Oresteia (Aeschylus)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/oresteia.json`)

| edition | sha256_16 | chapters | paragraphs | words | sections | label |
|---|---|---|---|---|---|---|
| original-en | `c6189c462535c358` | 26 | 771 | 34,061 | 3 | Morshead (1881), tr. E. D. A. Morshead |
| modern-en | `861b154ade471832` | 26 | 771 | 36,797 | 3 | Modern English |
| modern-da | `c131aa0ae927e741` | 26 | 771 | 35,572 | 3 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (1,973 words).
**mean_weighted_similarity 0.6064** (the highest in this batch — see the headline
finding), **pct_identical_long_paragraphs 2.2** (the only Phase 1 flag in the
batch; disconfirmed below).

## Trilogy structure — verified

The `sections` array correctly reflects the genuine three-part trilogy, and each
chapter title is prefixed with its play:

```
Agamemnon                        chapters 1–10   (Prologue … Exodos)
The Libation Bearers (Choephori) chapters 11–18  (Prologue … Exodos)
The Eumenides                    chapters 19–26  (Prologue … Exodos)
```

All three parts are present and complete: Agamemnon runs from the Watchman to
Clytemnestra and Aegisthus standing over the bodies; the Choephori from Orestes
at the tomb to the matricide and the onset of the Furies; the Eumenides from the
Pythia at Delphi through the Areopagus trial to the torchlit procession. I
sampled from all three, not just Agamemnon.

Chapter 18 ("The Libation Bearers — Exodos") is only 4 paragraphs / 111 words,
which looks alarming; it is not truncation — the bulk of the closing action sits
in chapter 17 (105 paragraphs / 3,628 words), and the trilogy-level
`last_chapter_suspiciously_short` check correctly reads false.

## Core English text — provenance, completeness, rights

E. D. A. Morshead's 1881 rhymed/metred verse translation. Complete.
**E. D. A. Morshead, 1849 – 24 Oct 1912** → public domain in the US (pub. 1881)
and in the EU/Denmark (life+70 expired 1983). **No rights issue on the source.**

Unlike the Sophocles files, `original-en` here **preserves verse lineation**
(real newlines inside paragraphs). `modern-en` flattens every verse paragraph to
continuous prose. That is a defensible choice, but it means the two editions
differ structurally as well as lexically, which is worth knowing for split-pane
reading.

## Phase 1 flags — confirmed / disconfirmed

- **pct_identical_long_paragraphs 2.2 — DISCONFIRMED as a defect.** I enumerated
  every ≥80-char source paragraph that survives byte-identical in `modern-en`.
  There are exactly **10**, and **all 10 are stage directions**:
  > "[The scene opens, disclosing Clytemnestra, who comes forward. The body of
  > Agamemnon lies, muffled in a long robe, within a silver-sided laver; the
  > corpse of Cassandra is laid beside him]" (ch 10, para 21)
  >
  > "[The twelve judges come forward, one by one, to the urns of decision; the
  > first votes; as each of the others follows, the Chorus and Apollo speak
  > alternately]" (ch 24, para 40)

  Morshead's stage directions are already plain modern English. Leaving them
  untouched is correct, not lazy. **No spoken line is byte-identical anywhere in
  the trilogy.**
- **0 truncated / 0 empty — CONFIRMED.** My own sweep of all 771 paragraph pairs
  (source ≥30 words, modern <72% of source) returned **zero** hits; no paragraph
  exceeded 1.40× expansion either; every chapter sits inside a 0.92–1.30
  word-ratio band.
- **similarity 0.6064 — CONFIRMED and it is meaningful.** It is the highest in
  this batch, and my reading explains why: this is the *least* thoroughly
  modernized of the six (see headline finding). It is still a real rewrite, not a
  copyedit — just an unfinished one.

## Headline finding — the modernization pass is incomplete

The Oresteia's `modern-en` reliably updates **pronouns and verb inflections**
(thou → you, hath → has) but leaves a meaningful residue of **opaque Victorian
vocabulary** and **inverted verse syntax** in place. Measured against a 40-token
archaism list, per 1,000 words:

| book | source | modern-en |
|---|---|---|
| oedipus-rex | 47.4 | 0.22 |
| oedipus-at-colonus | 53.1 | 0.00 |
| antigone | 38.9 | 0.19 |
| medea | 51.1 | 0.07 |
| bacchae | 44.0 | 0.84 |
| **oresteia** | **35.2** | **1.20** |

44 residual hits, broken down: `behold` ×26, `hark` ×7, `anon` ×3, `ere` ×2,
`hither` ×2, `forsooth` ×1, `glozes` ×1, `whence` ×1. "Behold" and "hark" are
arguably live English in an elevated tragic register and I would not touch most
of them. The genuinely opaque ~15 — *glozes, forsooth, anon, ere, hither, whence*,
plus *meed*, *rede*, *sains*, *skills it*, *targe* and friends outside my token
list — are the problem.

The syntax residue is broader than the word list shows. Examples I hit while
sampling:

- ch 24, para 32: "All else there is, he molds and shifts at will, **not scant of
  strength or breath, whatever he do**." — an ungrammatical Victorian subjunctive
  left untouched.
- ch 9, para 45: "**what skills it** whether you believe or not?" — *skills* =
  avails/profits. Opaque.
- ch 9, para 45: "how her speech **glozes** and slicks her purpose smooth" —
  unglossed archaism.
- ch 17, para 64: "the **meed** for hate where love, and love where hate, was due!"
- ch 14, para 0: "how strong shall the new tree of our home spring up **from a
  seed how small**!" — inversion retained.
- ch 9, para 46: "Yet for the rest, **far from the trail I roam**, and know no more."

This is a **pattern across samples, not two isolated passages** — but it is also
enumerable and fixable in place. It does not require re-deriving the edition.

## Samples inspected (7 — expanded past the 5 minimum for a trilogy)

### Sample 1 — opening. Agamemnon, chapter 1 (Prologue), paras 0–3

Source:
> "And now, as ever, am I set to mark / When shall stream up the glow of
> signal-flame, / The bale-fire bright, and tell its Trojan tale— / _Troy town is
> ta'en:_ such issue holds in hope / She in whose woman's breast beats heart of man."

Modern:
> "And now, as always, I am stationed here to watch for the moment when the
> signal-flame will blaze up — the beacon-fire that will tell its Trojan tale: Troy
> is taken. So she hopes, the one with a woman's body and a man's heart beating in
> her breast."

Finding: **strong.** The Watchman's whole opening survives: the dog-on-the-roof
posture, the star-lore, Fear standing in for sleep, the song that turns to tears,
the "no longer governed by honor as it once was". The famous Clytemnestra
epithet is preserved rather than explained away ("woman's breast" → "woman's
body" is a small loosening).

### Sample 2 — choral ode. Agamemnon, chapter 2 (Parodos), paras 12–21

Source (para 20):
> "_At home there tarries like a lurking snake, / Biding its time, a wrath
> unreconciled, / A wily watcher, passionate to slake, / In blood, resentment for a
> murdered child._"

Modern:
> "For at home, like a lurking snake, there waits a wrath unreconciled, biding its
> time — a cunning watcher, passionate to slake in blood its vengeance for a
> murdered child."

Finding: **strong, and the choral mode is genuinely preserved.** Morshead's
rhymed quatrains become unrhymed prose stanzas, but each quatrain stays its own
paragraph, the Calchas prophecy sequence keeps its ominous forward movement, and
the recurring refrain-parenthesis is kept as a parenthesis ("(Ah, sorrow and
sorrow! but may the outcome be fair!)"). Artemis's anger, the eagles-and-hare
omen, the Iphigenia foreshadowing all intact. The ode reads as lyric and is not
flattened into the dialogue register.

Minor: Morshead's "Ah woe and well-a-day!" becomes "Ah, sorrow and sorrow!" —
the idiom is lost rather than translated, and "Danaans" is quietly glossed to
"Greeks".

### Sample 3 — hardest passage. Agamemnon, chapter 9 (Fourth Episode), paras 40–55 (Cassandra)

Source (para 45):
> "…he, the lord of ships, who trod down Troy, / Knows not the fawning treachery of
> tongue / Of this thing false and dog-like—how her speech / Glozes and sleeks her
> purpose, till she win / By ill fate's favour the desired chance, / Moving like Atè
> to a secret end."

Modern:
> "And he, the lord of ships who trod down Troy, knows not the fawning, dog-like
> treachery of this false thing's tongue — how her speech glozes and slicks her
> purpose smooth, until by ill fate's favor she wins the moment she desires, moving
> like Ate to a secret end."

Finding: **fidelity strong, clarity weak.** Nothing is lost — the Thyestean
banquet, the spectre-children on the roof, the Scylla/double-snake comparison,
the "believe me not" turn. But *glozes*, *knows not*, *forsooth* and *what skills
it* all survive into the "modern" edition, which is precisely where a reader
struggling with Aeschylus needs help most. This is the strongest single exhibit
for the headline finding.

### Sample 4 — Libation Bearers kommos. Chapter 14, paras 0–4 (Electra)

Source:
> "Yet to affirm, as utterly made sure, / That this adornment cometh of the hand /
> Of mine Orestes, brother of my soul, / I may not venture, yet hope flatters fair!"

Modern:
> "Yet to affirm with utter certainty that this offering comes from the hand of my
> Orestes, brother of my soul — that I cannot venture, though hope flatters fair."

Finding: **strong.** Electra's whole forensic sequence over the lock of hair and
the footprints is complete and keeps its hesitancy — "It is all only guessing" —
without the modern resolving what the source leaves open. The imagined
alternative speeches of the hair are preserved as quoted speech.

### Sample 5 — the matricide. Libation Bearers, chapter 17, paras 55–69

Source:
> "CLYTEMNESTSA / Stay, child, and fear to strike. O son, this breast / Pillowed
> thine head full oft, while, drowsed with sleep, / Thy toothless mouth drew
> mother's milk from me."

Modern:
> "CLYTEMNESTRA. Stay, child, and fear to strike. O son, this breast pillowed your
> head full often, when, drowsed with sleep, your toothless mouth drew mother's milk
> from me."

Finding: **strong.** The trilogy's central moment, complete: the bared breast,
Orestes's appeal to Pylades, Pylades's three-line answer, the stichomythic
descent to "Beware, O my child, a parent's dying curse." Source typo
"CLYTEMNESTSA" is silently corrected. "the meed for hate where love, and love
where hate, was due" retains *meed*.

### Sample 6 — the trial. Eumenides, chapter 24, paras 30–43

Source (para 34, Apollo):
> "Not the true parent is the woman's womb / That bears the child; she doth but
> nurse the seed / New-sown: the male is parent; she for him, / As stranger for a
> stranger, hoards the germ / Of life"

Modern:
> "The mother is not the true parent of the child she bears: she does but nurse the
> seed newly sown. The male is parent; she, as a stranger for a stranger, hoards the
> germ of life"

Finding: **strong on restraint — this is the test case and it passes.** Apollo's
embryology argument is the passage most likely to attract a modernizer's
editorial comment, and there is none: no hedge, no "as was believed at the time",
no softening. Athena's foundation of the Areopagus is complete, including "Let no
man live uncurbed by law, nor curbed by tyranny" and the muddied-spring simile.
The Chorus's counter-argument about Zeus chaining Cronos is intact.

Clarity residue in the same block: "not scant of strength or breath, whatever he
do"; "We too have shot every shaft of speech we have".

### Sample 7 — ending. Eumenides, chapter 26, paras 26–32

Source (para 30):
> "With loyalty we lead you; proudly go, / Night's childless children, to your home
> below! / (_O citizens, awhile from words forbear!_)"

Modern:
> "With loyalty we lead you; proudly go, childless children of Night, to your home
> below! (O citizens, awhile from words forbear!)"

Finding: **good, with residue.** The trilogy ends where it should, with the
torchlit procession into the cave under the Areopagus and the final acclamation.
The processional chant keeps its interrupted, ritual structure with the
parenthetical calls to silence. But "awhile from words forbear" is carried across
verbatim — an inverted archaic clause inside the very last page of the work.

## Phase 3 — human-edition research

Aeschylus is a translated work and the core English is itself an 1881
translation, so a human alternative is worth researching seriously. This is the
one book in the batch where a rights-clear, genuinely *more accessible* human
edition actually exists.

| Candidate | Date | Form | Rights evidence | Verdict |
|---|---|---|---|---|
| **Herbert Weir Smyth**, *Aeschylus*, Loeb Classical Library vols 145–146 | 1922/1926 | **complete prose**, all three plays | **Public domain.** Published 1926 → US PD (pre-1929). **Smyth 1857–1937** → EU/Denmark life+70 expired 2008. Two independent sources assert PD: ToposText labels the text "public domain"; Perseus hosts it (Perseus's *digitisation* is CC BY-SA 3.0 US, but the underlying 1926 Loeb text is PD and available as clean scans via Internet Archive). | **Genuine candidate — verified by reading.** Watchman: *"Release from this weary task of mine has been my plea to the gods throughout this long year's watch, in which, lying upon the palace roof of the Atreidae, upon my bent arm, like a dog, I have learned to know well the gathering of the night's stars…"* Chorus: *"This is now the tenth year since Priam's mighty adversary, king Menelaus, and with him king Agamemnon, the mighty pair of Atreus' sons, joined in honor of throne and sceptre by Zeus, set forth from this land with an army of a thousand ships manned by Argives…"* No thou/hath, no inversions, plain modern syntax. **Meaningfully more accessible than Morshead, and more accessible than our current `modern-en`.** |
| Anna Swanwick (1873), Lewis Campbell (1890), Walter Headlam / C. E. S. Headlam (1900s) | 19th c. | complete verse | PD | Not sampled. Recorded **unverified**; all are contemporaries of Morshead and likely share his register. |
| **Ian Johnston** (VIU), *Oresteia* | 2000s, rev. | complete verse | **Permission required.** johnstonia copyright page: readers may redistribute "provided they do not use the material in a commercial publication"; "No commercial publishing of these materials is permitted, without the written permission of Ian Johnston." | Best-reading modern verse rendering found, but not rights-clear for a paid product. |
| George Theodoridis (Bacchicstage) | 2000s | complete | Free for non-commercial reproduction only; theatrical/educational/cinematic use needs permission. | Rejected on rights. |

**Why I am not recommending USE HUMAN EDITION (Smyth) anyway.** Three reasons,
stated as trade-offs rather than disqualifications:

1. Smyth is flat scholarly crib prose. The choral odes — which are the reason to
   read Aeschylus — become dense continuous paragraphs with no lyric movement.
   Our current `modern-en`, whatever its archaism problem, reads the odes far
   better (see Sample 2).
2. Smyth is Loeb line-numbered prose keyed to the Greek. Dropping it in would be
   **full alignment work**, not a swap: 771 paragraphs across 26 chapters, with
   three editions (`modern-da` too) to re-align. Per the brief I am recording
   this as "alignment work required", not as a quality strike against Smyth.
3. The defect in our `modern-en` is enumerable and local-in-kind. Finishing the
   modernization is much cheaper than an alignment project.

Smyth remains the right **fallback** if the light edit is ever judged not worth
doing, and the right source for glosses on individual hard lines.

## Ratings

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 3 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 5 |
| Naturalness | 5% | 3 |

**Weighted score 4.4 — band: Good with fixes.**

Fidelity and restraint are the strongest in the batch: nothing omitted across
771 paragraph pairs, no invention found in seven samples, and the hardest
restraint test in all of Greek tragedy (Apollo on motherhood) passed cleanly.
Clarity and naturalness carry the whole deduction, and they carry it for one
reason: the modernization stopped halfway.

## Recommendation

**LIGHT EDIT.** Confidence: **medium-high**.

Seven passages sampled (~2,900 source words) across all three plays — opening,
a full choral ode, the Cassandra scene, the Electra kommos, the matricide, the
Areopagus trial, and the closing procession. No substantive omission or
invention. The Phase 1 identical-paragraph flag was run to ground and is a false
positive (stage directions only).

The edit is well-defined: a **vocabulary and inversion pass** that (a) replaces
the ~15 genuinely opaque archaisms (*glozes, forsooth, anon, ere, hither, whence,
meed, skills it, targe, rede, sains*, plus their neighbours), (b) un-inverts the
retained Victorian clause orders flagged above, and (c) leaves *behold* and
*hark* alone where the register earns them. It does **not** require re-deriving
the edition — the underlying rendering is faithful and well-voiced.

**Correction scope: local** — enumerable, in-place fixes, though spread thinly
across all 26 chapters rather than concentrated in two passages. Budget for a
sweep of the whole file, not a two-paragraph patch.

## Limitations of this review

- I read 7 of 26 chapters closely (1, 2, 9, 14, 17, 24, 26). The other 19 were
  checked mechanically only (word ratio, paragraph alignment, byte-identity,
  archaism sweep) — in particular I did not closely read the carpet scene
  (ch 5–7), the Choephori recognition (ch 15), or the Pythia's prologue (ch 19).
- The archaism residue figure (44) is from a fixed 40-token list; the true count
  including *meed*, *rede*, *targe*, *sains*, *skills it* etc. is higher. I did not
  produce an exhaustive list — that is the first task of the light edit.
- `modern-da` not evaluated; out of scope.
- No comparison against the Greek — fidelity claims are fidelity to Morshead.
- Smyth was verified by reading two substantial passages via ToposText, not by
  reading the whole trilogy; my "meaningfully more accessible" claim rests on
  those samples. The Swanwick/Campbell/Headlam alternatives are **unverified**.
- I did not investigate whether a clean, correctly-licensed machine-readable
  Smyth text actually exists at the quality Tinct would need — only that the
  translation is PD.
- No in-app rendering check; I did not test how the verse-lineation asymmetry
  (source keeps line breaks, modern does not) looks in split pane.
