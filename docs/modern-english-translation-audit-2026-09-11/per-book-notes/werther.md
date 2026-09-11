# werther — The Sorrows of Young Werther (Johann Wolfgang von Goethe, 1774)

Reviewer: audit batch agent, 2026-09-11. Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `db7393bfc33628a2` | 84 | 354 | 42,304 | Boylan (1779) — tr. R. D. Boylan |
| modern-en | `f45d353204e356b3` | 84 | 354 | 40,815 | Modern English |
| modern-da | `e97c294c690fe118` | 84 | 354 | 40,617 | Moderne Dansk |
| original-de | `d4e3fb74223af57a` | 83 | 351 | 38,524 | (on disk, **not registered**) |

`en_editions_aligned: true`. Mean weighted similarity original-en → modern-en **0.3714**
(my own recomputation with `difflib` on token sequences, `autojunk=False`, paragraphs ≥15
words: **0.467** across 343 paragraphs, no paragraph above 0.95, zero byte-identical
paragraphs). No truncation flags, no empty paragraphs, no paragraph-count mismatches.

## Provenance of the core English text

The registry (`app/src/data/bookRegistry.ts:3186`) labels `original-en` **"Boylan (1779)",
`year: 1779`**. This is wrong. R. D. Boylan's translation is **1854** (Bohn's Standard
Library); the 1779 English *Werther* is Daniel Malthus's anonymous version made from the
French. Project Gutenberg #2527 and the Standard Ebooks edition both carry the Boylan text
and date it 1854. **Metadata fix required** (label + `year`). Completeness: complete —
Preface, Book One (40 dated letters), Book Two (43 dated letters), "The Editor to the
Reader". Public domain.

Also noted: `werther-original-de.json` exists on disk (83 chapters, 38,524 words) but is
**not listed in the registry's `editions` array**, so readers cannot reach the German.

## Structure / epistolary form

Preserved exactly. Every chapter title in modern-en is the letter date
(`May 4, 1771` … `December 6, 1772`), identical to original-en, and the three `sections`
are `Book One` / `Book Two` / `The Editor to the Reader`. Salutations ("My dear friend",
"Wilhelm") and the editor's framing paragraphs survive. No flattening of the letter form
into continuous narration.

## Samples inspected (7)

### 1. Preface + opening letter — ch1 p0–1, ch2 p0–2

> **original-en (ch1 p1):** "And thou, good soul, who sufferest the same distress as he
> endured once, draw comfort from his sorrows; and let this little book be thy friend,
> if, owing to fortune or through thine own fault, thou canst not find a dearer
> companion."

> **modern-en:** "And you, good soul, feeling the same anguish that once pressed on him —
> take comfort from his sorrows, and let this little book be your friend, if fate or your
> own fault leaves you no closer companion."

Finding: clean de-archaising, every clause preserved, direct address to the reader kept.
The long May 4 letter (ch2 p0, 300+ words of self-accusation) survives clause by clause,
including the self-interrupting "Did I not—but oh! what is man…" → "Didn't I — oh, what is
a man, that he dares accuse himself like this?" The concessive "though God knows why we
are made this way" is moved to the end of its sentence but not dropped.

### 2. ch12 (June 16, 1771) — first sight of Lotte, p8–13

Two places where modern-en **departs from Boylan and agrees with Goethe**:

> **original-en:** "I could not resist giving him a hearty kiss, notwithstanding his
> rather dirty face."
> **modern-en:** "I couldn't help giving him a hearty kiss in spite of his runny nose."
> **original-de (ch10 p8):** "ungeachtet seines kleinen Rotznäschens"

> **original-en:** "a lady of middle height … She was holding a rye loaf"
> **modern-en:** "a girl of middle height … She held a loaf of dark bread"

The modern edition is evidently checked against the German, not merely paraphrased from
Boylan. One small debit in the same block: Boylan's "sitting mute with astonishment"
becomes "sitting there wide-eyed the whole time, **hearing nothing of it**" — the final
clause is an addition, not in Boylan and not obviously in the German. Local, trivial.

### 3. ch32 (August 12, 1771) — the suicide argument with Albert, p6–12

> **original-en:** "he who, under the rage of an insult, attacks and puts to flight half a
> score of his enemies"
> **modern-en:** "the man who in the fury of an insult takes on six others and overpowers
> them" (German ch28 p4 reads "sechse")

> **original-en:** "for we cannot otherwise reason fairly upon the subject."
> **modern-en:** "For only insofar as we can feel a thing with him do we have any right to
> speak of it." (Goethe: "nur insofern wir mitempfinden, haben wir Ehre, von einer Sache
> zu reden")

The whole argumentative chain — limits of human nature, mortal illness analogy, the
healthy man at the sick man's bedside — survives with its logical joints intact. No
softening of the suicide argument, no editorializing.

### 4. ch48 (March 15, 1772) — the humiliation at Count O—'s, p1–4

Full scene preserved: the guest list (Baron F— in coronation clothes, the deaf wife, the
patched coat), the whispering spreading from women to men, the count's aside at the
window, the drive to M—, the Homer reading. Modern-en again corrects Boylan's slips:
"Chancellor N—" → "court councillor R—", "the hospitable herdsmen" → "the noble
swineherd", and it names "Lady von S—" / "Frau von S—" where Boylan leaves her anonymous.
The venomous closing lines keep their bite:

> **modern-en (p3):** "…when I hear my enviers crowing — *There, you see what comes of
> conceited heads who plume themselves on their little wit and think they may flout every
> convention!* — and more such kennel-talk — then I could drive a knife into my heart."

### 5. ch80 (November 30, 1772) — the madman Heinrich

Boylan's errors are silently fixed against the German throughout: "tattered coat" →
"shabby green coat", "easterly wind" → "west wind", "Henry" → "Heinrich", "gay and
contented as a man can be" → "so well, so glad, so light, **like a fish in water**", "kings
and queens" → "kings and emperors", "About dinner-time" → "at noon". Every beat of the
scene, including the mother's account and the closing "It struck me like a thunderclap",
is present.

### 6. ch84 p59–63 — the Ossian songs (hardest passage; verse-like prose, no mechanical flags to use)

> **original-en:** "Colma. It is night: I am alone, forlorn on the hill of storms. The wind
> is heard on the mountain. The torrent is howling down the rock."
> **modern-en:** "Colma. It is night! I am alone, lost on the hill of storms. The wind
> howls on the mountain. The torrent roars down the cliff."

The incantatory register, the vocatives ("Rise moon!" → "Come out, moon"), the proper
names (Lora, Fingal, Ullin, Ryno, Alpin, Minona, Salgar, Colma, Selma) all survive.
**Editorial note for the record:** Boylan restores Macpherson's *English* Ossian here;
modern-en instead renders Goethe's *German* Ossian back into English. Both are defensible;
they are not the same text, and a reader comparing editions will see more divergence in
this section than anywhere else. Not a defect, but worth knowing.

### 7. ch84 p117–121 — the death and burial

> **modern-en:** "The lungs still rattled, fearfully, now weak, now stronger; they waited
> for the end." … "At noon he died." … "The steward and his sons followed the body to the
> grave; Albert couldn't. Charlotte's life was feared for. Laborers carried him. No priest
> attended."

Boylan's "At twelve o'clock Werther breathed his last" is corrected to noon (German
"Mittags um zwölf Uhr"). The flat, clipped final cadence — the most famous ending in
German prose — is preserved, not padded.

## Phase 1 flags: confirmed vs. disconfirmed

- **No truncation / empty-paragraph / count-mismatch flags** — confirmed by independent
  check: lowest target/source word ratio for any paragraph ≥40 words is **0.74**
  (ch84 p24, a compression with no content loss), and there is no systematic shortening.
- **Low mean similarity (0.3714)** — confirmed and benign. This is a genuine
  retranslation, not a light pass. Zero byte-identical paragraphs anywhere in the book.
- `last_chapter_suspiciously_short: false` — confirmed; ch84 is 11,071 words, the editor's
  narration, correctly the longest unit.

## Phase 3 — human-edition research

Goal: is there a complete, readable, rights-clear **human** English *Werther* better than
the current modern-en?

| Candidate | Date | Completeness | Rights | Verdict |
|---|---|---|---|---|
| R. D. Boylan | 1854 | complete | Public domain (PG #2527) | **This is already our `original-en`.** |
| Standard Ebooks, *The Sorrows of Young Werther* | 2010s digitisation | complete | CC0 dedication over a PD text | **Same Boylan translation.** No new text. https://standardebooks.org/ebooks/j-w-von-goethe/the-sorrows-of-young-werther/r-d-boylan |
| Daniel Malthus (anon.) | 1779 | complete but translated *from the French*, not the German | Public domain | Rejected on quality/provenance — a translation of a translation. |
| Bayard Quincy Morgan | 1957 (Alma Classics reissue) | complete | **In copyright** | Not usable. |
| Michael Hulse (Penguin), David Constantine (OUP), Burton Pike (Modern Library) | 1989–2012 | complete | **In copyright** | Not usable. |

**Conclusion: no PD human alternative to Boylan exists.** Standard Ebooks — the usual
"best free modern-feeling edition" fallback — carries Boylan verbatim. Every translation
that would actually read better than Boylan is under copyright in both the US and the
EU/Denmark. That makes the current modern-en the only route to an accessible Werther, and
it is a good one.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 5 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

**Weighted score 4.9 — band: Strong.**

Restraint marked down one point only for the "hearing nothing of it" addition at ch12 p13;
I found no other invention in seven samples.

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **high** on the passages sampled, medium on
the book as a whole (7 samples across 84 letter-chapters; ~4,500 source words read in
pairs). Correction scope: **none** for the text.

Two non-text follow-ups, both outside this audit's write scope:
1. Fix the registry label/year: `Boylan (1779)` → `Boylan (1854)` (`bookRegistry.ts:3186`).
2. Decide whether to expose `werther-original-de.json` as a registered edition — the file
   is on disk and complete but unreachable from the UI.

## Limitations of this review

- 7 sampled passages of 84 chapters. I did **not** read Book Two letters 41–47, 49–79, or
  the bulk of the editor's narration (ch84 p0–56, p64–116).
- I did **not** audit `modern-da` at all.
- German cross-checks were targeted (four specific phrases), not systematic; I did not
  verify the modern edition against Goethe's German end to end, and I did not determine
  whether it follows the 1774 or the 1787 revised German text.
- No rendering/visual QA in the app.
