# oedipus-rex — Oedipus Rex (Sophocles)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/oedipus-rex.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `44edb377baee3bf5` | 11 | 474 | 12,439 | Storr (1912), tr. Francis Storr |
| modern-en | `f96170b779e2c9fa` | 11 | 474 | 13,764 | Modern English |
| modern-da | `bd607d8644de54d1` | 11 | 474 | 13,416 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (2,764 words).
**mean_weighted_similarity 0.5592**, **pct_identical_long_paragraphs 0.0**.

## Core English text — provenance, completeness, rights

Francis Storr's 1912 verse translation (Loeb Classical Library, vol. I). Complete
— all eleven structural units present (Prologue, Parodos, four Episodes, four
Stasima, Exodos), ending correctly on the Chorus's "count no man blessed" tag.
**Francis Storr, 1839–1919** → the translation is public domain in the US
(published 1912) and in the EU/Denmark (life+70 expired 1990). No rights issue on
the source.

One structural note that applies to **both** editions equally: Storr's verse
lineation has been flattened into run-on prose paragraphs, so verse-line capitals
survive mid-sentence in `original-en` ("Why sit ye here as suppliants, in your
hands Branches of olive filleted with wool?"). This makes the source materially
harder to read than Storr on the page, and is itself part of the barrier the
modern edition removes.

## Phase 1 flags — confirmed / disconfirmed

There are **no** Phase 1 flags on this book. I verified the negatives myself
rather than trusting them:

- **0 truncated paragraphs — CONFIRMED.** My own sweep of all 474 paragraph pairs
  (source ≥30 words, modern <72% of source length) returned **zero** hits. A
  per-chapter word-ratio sweep (flagging <0.92 or >1.30) also returned zero: every
  chapter sits in the 1.05–1.15 band, i.e. modest, uniform expansion.
- **0 identical long paragraphs — CONFIRMED.** No ≥80-char source paragraph
  survives byte-identical. This is a genuine rewrite, not a copyedit.
- **similarity 0.5592** sits well inside the "verified real modernization" band
  from `books/classify-modern-en.py` (0.60–0.75 for an already-readable Victorian
  source; lower for verse), and my reading confirms the number: this is a real
  line-for-line modernization, not a mechanical one.
- **Archaism residue (my own check, not a Phase 1 metric):** counting a 40-token
  archaism list (thou/thee/ye/hath/doth/'tis/methinks/forsooth/wot/ere/anon/…),
  `original-en` carries **47.4 hits per 1,000 words**; `modern-en` carries **0.22**
  (3 total). The de-archaising pass is essentially complete.

Since there was no mechanical outlier to sample, my 5th/6th required samples are
the two hardest passages I could find: the Third Stasimon (the most compressed
lyric in the play) and the Exodos kommos (broken lyric lament after the
blinding).

## Samples inspected (6)

### Sample 1 — opening. Chapter 1 (Prologue), paras 1–3

Source (para 2, the Priest):
> "Therefore, O King, here at thy hearth we sit, I and these children; not as
> deeming thee A new divinity, but the first of men; First in the common
> accidents of life, And first in visitations of the Gods."

Modern:
> "That is why, O King, we sit here at your hearth, I and these children — not
> because we think you a new god, but because we believe you first among men;
> first in the ordinary misfortunes of life, and first in what the gods send down
> on us."

Finding: **good.** Nothing dropped; the "not a god but first of men" distinction
— the theological hinge of the whole scene — is preserved exactly, including the
two-part "first in… first in…" parallelism.

**One local defect in the same paragraph.** Source:
> "Tried counselors, methinks, are aptest found To furnish for the future pregnant rede."

Modern:
> "Tried counselors, I think, are best equipped to suggest what will come of the future."

"rede" is counsel/advice; Storr means *experienced advisers give the weightiest
counsel for what lies ahead*. The modern turns them into forecasters ("suggest
what will come of the future"). A single-word semantic slip, not a pattern.

Also in that paragraph, Storr's Gutenberg text has the typo "If men to man and
guards to guard them tail" (for "fail"). Modern renders "Neither walls nor ships
are worth anything if the men inside them fail" — the typo is silently corrected,
but the "men to man them / guards to guard them" doubling is lost.

### Sample 2 — choral ode (Parodos). Chapter 2, paras 0–5 (complete ode)

Source (para 3):
> "Wasted thus by death on death All our city perisheth. Corpses spread infection
> round; None to tend or mourn is found. Wailing on the altar stair Wives and
> grandams rend the air— Long-drawn moans and piercing cries Blent with prayers
> and litanies. Golden child of Zeus, O hear Let thine angel face appear!"

Modern:
> "Wasted like this by death on death, our whole city is perishing. Corpses spread
> infection all around; there is no one left to tend them or mourn them. On the
> altar steps, wives and grandmothers wail, tearing the air with long-drawn moans
> and piercing cries, mingled with prayers and litanies. Golden child of Zeus, O
> hear us — let your gracious face appear!"

Finding: **strong, and the choral mode is genuinely preserved as a distinct
register.** The ode stays invocatory and second-person-to-the-gods throughout all
six strophes; it is not flattened into the play's dialogue voice. Vocatives
("Healer of Delos, hear us!", "Golden child of Zeus"), the anaphora of
"swifter than… swifter than…", and the closing antithesis "the joyful god whom we
adore, the god whom the gods abhor" all survive. Storr's anachronistic "thine
angel face" is changed to "your gracious face" — a departure from the source
wording, but one that removes an inserted Christianism rather than adding one.

### Sample 3 — agon / stichomythia. Chapter 5 (Second Episode), paras 28–47

Source:
> "CREON. Thou art not wise. / OEDIPUS. Wise for myself at least. / CREON. Why not
> for me too? / OEDIPUS. Why for such a knave? / CREON. Suppose thou lackest sense.
> / OEDIPUS. Yet kings must rule. / CREON. Not if they rule ill."

Modern:
> "CREON. You are not wise. / OEDIPUS. Wise for my own sake, at least. / CREON. Why
> not for mine too? / OEDIPUS. Why, for such a knave? / CREON. Suppose you have no
> sense. / OEDIPUS. Even so, kings must rule. / CREON. Not if they rule badly."

Finding: **strong.** Stichomythia stays stichomythic — one-line, hammer-blow
exchanges, no padding, no explanatory transitions inserted between turns. Creon's
long self-defence in the same chapter (para 34) is complete down to the offer
"sentence me to death — not by your voice alone, but by mine together with yours."

Hairline defect: "Why for such a knave?" means *why be wise on behalf of such a
knave?*. The modern's added comma ("Why, for such a knave?") converts it into an
exclamation and blurs the sense. One character of punctuation.

### Sample 4 — mid/late lyric + entry of the Corinthian. Chapter 8 (Third Stasimon), paras 0–18

Source (para 1):
> "Of insolence is bred The tyrant; insolence full blown, With empty riches
> surfeited, Scales the precipitous height and grasps the throne. Then topples
> o'er and lies in ruin prone"

Modern:
> "Of insolence is the tyrant bred; insolence full blown, glutted with empty
> riches, scales the precipitous height and grasps the throne. Then topples over,
> and lies in ruin, flat on the ground"

Finding: **strong.** The famous *hybris* ode keeps its aphoristic bite and its
self-questioning close ("If sin like this can rise to honor, why do I still dance
and lead the sacred choir?").

**Consistency defect in the same chapter.** Jocasta's prayer, source:
> "I turn To thee, our present help in time of trouble, Apollo, Lord Lycean"

Modern:
> "I turn to you, our present help in time of trouble — Apollo, Lord of the Wolf's land"

"Lycean" is left as "Lycean King" in the Parodos (ch 2, para 5) but rendered as
"Lord of the Wolf's land" here. Two problems: the epithet is now inconsistent
within one book, and the modern has silently picked one of three disputed
etymologies of *Lykeios* (wolf / light / Lycia) and presented it as translation.
This is the only invention-shaped finding in six samples. Confirmed by a
whole-file name count: `Lycean` appears 2× in `original-en`, 1× in `modern-en`.

### Sample 5 — recognition scene. Chapter 9 (Fourth Episode), paras 120–146

Source:
> "HERDSMAN. Fearing a dread weird. / OEDIPUS. What weird? / HERDSMAN. 'Twas told
> that he should slay his sire."

Modern:
> "HERDSMAN. Fearing a dreadful prophecy. / OEDIPUS. What prophecy? / HERDSMAN. It
> was foretold that he would kill his own father."

Finding: **strong.** "Weird" (= fate/prophecy) is a textbook case of the reading
standard's "prefer a familiar accurate equivalent" — glossed in place, twice,
without a parenthesis. The scene's escalating dread is intact through all 27
paragraphs, ending on "I stand a wretch, cursed in my birth, cursed in my
marriage, a parricide, a man of incest — thrice cursed!" (source: "in birth, in
wedlock cursed, A parricide, incestuously, triply cursed!").

### Sample 6 — ending. Chapter 11 (Exodos), paras 8–13 and 48–55

Source (para 55, closing chorus):
> "Therefore wait to see life's ending ere thou count one mortal blest; Wait till
> free from pain and sorrow he has gained his final rest."

Modern:
> "Therefore, wait to see the ending of a life before you call any mortal blessed
> — wait till, free from pain and sorrow, he has reached his final rest."

Finding: **strong.** The play ends where it should. The broken kommos earlier in
the Exodos (para 10: "Ah me! Ah, woe is me! Where am I being carried? How like a
ghost forlorn my voice flits from me through the air!") keeps its fragmented,
breath-by-breath movement rather than being smoothed into sentences.

## Cross-book name consistency (Theban plays)

Checked programmatically across `oedipus-rex`, `oedipus-at-colonus` and
`antigone` modern-en. **Consistent:** Oedipus, Creon, Antigone, Ismene,
Polyneices, Eteocles, Haemon, Teiresias, Jocasta, Menoeceus, Laius, Thebes,
Theseus, Phoebus, Apollo. Counts match the source exactly in every case except
(a) the `Lycean` inconsistency above, and (b) two instances where the adjective
"Theban" is rendered "of Thebes" — harmless.

## Phase 3 — human-edition research

Sophocles is a translated work, so the "core" English is itself an old
translation and a human alternative is worth researching properly.

**Is the source already accessible enough for SOURCE + GLOSSES?** No. Storr runs
47 archaisms per 1,000 words, with verse lineation flattened into prose. This is
a real barrier, not a stylistic preference.

**Candidates examined (rights + actual text read, not reputation alone):**

| Candidate | Date | Form | Rights | Verdict |
|---|---|---|---|---|
| **Sir Richard C. Jebb** — *Tragedies of Sophocles*, Cambridge; 1917 translation-only reissue | 1888–1917 | complete prose | PD (Jebb 1841–1905; US pre-1929, EU life+70 expired 1975). Perseus's *digitisation* is CC BY-SA 3.0 US; the Wikisource/IA scan is plain PD. | **Rejected on accessibility, not quality.** Read the actual text: "Ismene, sister, mine own dear sister, knowest thou what ill there is, of all bequeathed by Oedipus, that Zeus fulfils not for us twain while we live?"; "thou seest of what years we are who beset thy altars"; "I deemed it unmeet". Jebb is more accurate and better structured than Storr but is **not less archaic** — it would not remove the barrier. |
| E. H. Plumptre (1878), Lewis Campbell (1883/1906 verse), Joseph Edward Harry (1911), E. P. Coleridge *Tragedies of Sophocles* (1905) | 1878–1911 | complete | all PD | Not separately sampled in depth; all are Victorian/Edwardian and on the face of the Wikisource listings share Storr's register. Recorded as **unverified for accessibility** rather than rejected. |
| **Ian Johnston** (Vancouver Island University), *Oedipus the King*, rev. 2014 | 2007/2014 | complete verse | **Permission required.** Read the copyright page verbatim: readers/teachers/students may download and redistribute freely "provided they do not use the material in a commercial publication"; "No commercial publishing of these materials is permitted, without the written permission of Ian Johnston." (One Johnston play, *Philoctetes*, is separately CC BY 4.0 — terms vary per title.) | **Best-reading candidate found, but not rights-clear for Tinct.** Sample read: "My children, latest generation born from Cadmus, why are you sitting here with wreathed sticks in supplication to me, while the city fills with incense, chants, and cries of pain?" Tinct sells a $3/mo Premium tier, so this is commercial use. A written-permission request to ian.johnston@viu.ca is a live option, not a resolved one. |
| George Theodoridis (Bacchicstage) | 2000s | complete | **Noncommercial only**; theatrical/educational/cinematic use requires permission even when non-commercial. | Rejected on rights for commercial distribution. |

**Conclusion:** no complete, readable, rights-clear *human* English Sophocles
exists that would beat the current modern-en. Every PD option is as archaic as
Storr; the one genuinely modern option (Johnston) is copyright-restricted for
commercial use. This is "none found in this search that is both readable and
rights-clear", not "none exists" — Johnston under licence would be a real
upgrade if Anders wanted to ask.

## Ratings

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 5 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 5 |

**Weighted score 4.9 — band: Strong.**

Restraint loses a point solely for the "Lord of the Wolf's land" gloss-as-
translation and its knock-on inconsistency with "Lycean King".

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **medium-high**.

No substantive omission or invention was found in six sampled passages
(~1,900 source words, covering opening, a complete choral ode, stichomythic agon,
lyric stasimon, recognition scene and ending). The mechanical negatives were
independently re-verified across all 474 paragraph pairs. The three defects found
are all single-word/single-mark and local: the "rede" slip, the "Why, for such a
knave?" comma, and the Lycean inconsistency.

**Correction scope: local.** Three named fixes, each a one-line edit.

## Limitations of this review

- I read 6 of 11 chapters in detail; chapters 3, 4, 6, 7 and 10 were checked only
  mechanically (word ratio, paragraph alignment, archaism sweep), not read.
- I did **not** evaluate `modern-da` at all — Danish is out of scope for this
  audit and I made no judgement about it.
- I did not compare either English edition against the Greek. All fidelity claims
  are fidelity *to Storr*, not to Sophocles.
- Jebb was verified by reading actual translated text; the other PD Sophocles
  candidates (Plumptre, Campbell, Harry, Coleridge 1905) were identified but not
  sampled, and are recorded as unverified.
- I did not check rendering in the app (split pane, paragraph alignment in the
  reader UI).
