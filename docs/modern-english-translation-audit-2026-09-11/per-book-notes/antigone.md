# antigone — Antigone (Sophocles)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/antigone.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `628086763bedd01d` | 11 | 318 | 10,026 | Storr (1912), tr. Francis Storr |
| modern-en | `923ec3c1b9bcc3e1` | 11 | 318 | 10,689 | Modern English |
| modern-da | `5bfac8c577539e95` | 11 | 318 | 10,391 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (1,506 words).
**mean_weighted_similarity 0.5841**, **pct_identical_long_paragraphs 0.0**.

## Core English text — provenance, completeness, rights

Francis Storr's 1912 Loeb verse translation. Complete — Antigone and Ismene
before the palace gates through to the Chorus's closing gnome on wisdom and old
age. **Storr 1839–1919** → public domain in the US and in the EU/Denmark
(life+70 expired 1990). No rights issue on the source.

Same shared presentation problem as the other two Theban plays: Storr's verse is
flattened into run-on prose in `original-en`, stranding verse capitals
mid-sentence.

## Phase 1 flags — confirmed / disconfirmed

No Phase 1 flags. Independently re-verified:

- **0 truncated / 0 empty — CONFIRMED.** My own sweep of all 318 paragraph pairs
  (source ≥30 words, modern <72% of source) returned **zero** hits. No chapter
  fell outside a 0.92–1.30 word-ratio band; no paragraph exceeded 1.40× expansion.
- **0 identical long paragraphs — CONFIRMED.**
- **similarity 0.5841** — the highest of the three Theban plays, but still well
  inside the real-modernization band; my reading confirms a genuine rewrite.
- **Archaism residue (my own metric):** `original-en` 38.9 hits/1,000 words;
  `modern-en` **0.19** (2 total). De-archaising pass complete.

No mechanical outlier existed, so my 5th/6th samples are the two hardest
passages: the Guard's messenger narration (a single 260-word block of tangled
Victorian syntax) and the Teiresias divination speech (thick ritual allusion).

## Shared structural defects (both editions, inherited from the source file)

1. **Chapter titles do not match content.** As in `oedipus-at-colonus`, the 11
   chapters follow a generic tragic template. Chapter 8 "Third Stasimon" is a
   Chorus/Creon dialogue with no ode in it; chapter 10 "Fourth Stasimon" opens
   with straight dialogue rather than the Danaë ode. Chapter 4 "First Stasimon"
   *is* correctly the Ode to Man. This is a source-segmentation problem carried
   into `modern-en`, not a translation defect — but it misleads chapter
   navigation and should be a separate housekeeping ticket covering all three
   Theban plays.

2. **A wrong speaker tag, inherited verbatim.** Chapter 10, paras 2–4 read:
   > "CHORUS. Son of Menoeceus, listen to good advice."
   > "CHORUS. What should I do? Advise me — I will heed you."
   > "CHORUS. Go — free the girl from her rocky cell…"

   The middle line is Creon's, not the Chorus's. The error is in `original-en`
   (Storr's Gutenberg text) and `modern-en` reproduces it faithfully. Because the
   modern edition silently fixes other source typos elsewhere ("Etocles" →
   "Eteocles" in `oedipus-at-colonus`, "no moral" → "no mortal"), the consistent
   thing would be to fix this one too. It does confuse a first read of the scene
   in which Creon finally yields.

## Samples inspected (6)

### Sample 1 — opening. Chapter 1 (Prologue), paras 1–5

Source (para 5):
> "But Polyneices, a dishonored corse, (So by report the royal edict runs) No man
> may bury him or make lament— Must leave him tombless and unwept, a feast For
> kites to scent afar and swoop upon. Such is the edict (if report speak true) Of
> Creon, our most noble Creon"

Modern:
> "But Polyneices, a dishonored corpse — so the royal edict is said to run — no
> man may bury him or mourn for him. He must be left without a tomb and without
> tears, a feast for kites to scent from far away and swoop down upon. That is the
> edict, if the report is true, of Creon, our most noble Creon"

Finding: **strong.** Both hedges ("so by report", "if report speak true") are
preserved — they matter, because Antigone is acting on hearsay. "Our most noble
Creon" keeps its sarcasm without being explained. Nothing is added.

### Sample 2 — the Ode to Man. Chapter 4 (First Stasimon), paras 0–4 (complete ode)

Source (para 2):
> "Speech and the wind-swift speed of counsel and civic wit, He hath learnt for
> himself all these; and the arrowy rain to fly And the nipping airs that freeze,
> 'neath the open winter sky. He hath provision for all: fell plague he hath learnt
> to endure; Safe whate'er may befall: yet for death he hath found no cure."

Modern:
> "Speech, and wind-swift thought, and the civic wit to live by counsel — all
> these he has taught himself. And the arrowy rain to fly from, and the nipping
> airs that freeze beneath the open winter sky. He has provision for everything.
> Even grim plague he has learned to endure. He is safe, whatever befalls. Yet for
> death he has found no cure."

Finding: **strong, and the choral mode is preserved as a distinct register.** The
most famous ode in Greek tragedy keeps its catalogue rhythm, its sequence of
conquests, and — critically — its turn at the end ("Past the wildest flight of
thought are the cunning and skill that lead man now toward the light, now toward
evil counsels"). The ode's moral ambivalence, which a careless modernization
would resolve, is intact. The Chorus is unmistakably not speaking in the
dialogue voice.

### Sample 3 — agon: the unwritten laws. Chapter 5 (Second Episode), paras 8–19

Source (para 17):
> "Yea, for these laws were not ordained of Zeus, And she who sits enthroned with
> gods below, Justice, enacted not these human laws. Nor did I deem that thou, a
> mortal man, Could'st by a breath annul and override The immutable unwritten laws
> of Heaven. They were not born today nor yesterday; They die not; and none knoweth
> whence they sprang."

Modern:
> "Yes — because these laws were not ordained by Zeus, and Justice, who sits
> enthroned with the gods below, did not establish these human laws. Nor did I
> think that you, a mortal man, could with a single breath annul and override the
> immutable, unwritten laws of Heaven. They are not of today or yesterday. They do
> not die, and no one knows from where they sprang."

Finding: **strong.** The pivot of the play. Every clause survives, including the
closing barb "if in this you judge me a fool, perhaps the one who calls me foolish
is a fool himself" (source: "Methinks the judge of folly's not acquit"). Creon's
reply is equally complete, including "then I am the woman and she the man" —
preserved without softening or comment, which is the right call.

### Sample 4 — hardest narrative block. Chapter 5, para 11 (the Guard)

Source:
> "At last it ceased, and lo! there stood this maid. A piercing cry she uttered,
> sad and shrill, As when the mother bird beholds her nest Robbed of its
> nestlings; even so the maid Wailed as she saw the body stripped and bare… I was
> glad—and grieved; For 'tis most sweet to 'scape oneself scot-free, And yet to
> bring disaster to a friend Is grievous. Take it all in all, I deem A man's first
> duty is to serve himself."

Modern:
> "At last it ceased, and look — there stood this girl. A piercing cry she
> uttered, sad and shrill, like a mother bird when she finds her nest robbed of
> its nestlings. Just so this girl wailed when she saw the body stripped and
> bare… I was glad — and grieved. For it is sweet to escape harm yourself, and yet
> grievous to bring disaster on a friend. All in all, I reckon a man's first duty
> is to serve himself."

Finding: **strong.** The Guard's whole vernacular character survives — the
self-interested shrug at the end is the comic/human note of the play and it is
neither flattened nor editorialised. The mother-bird simile is kept as an image,
not converted into an explanation. The whirlwind, the sun, the three libations,
the bronze urn all present.

### Sample 5 — Teiresias. Chapter 9 (Fourth Episode), paras 30–35

Source (para 33):
> "Sitting upon my throne of augury, As is my wont, where every fowl of heaven
> Find harborage, upon mine ears was borne A jargon strange of twitterings, hoots,
> and screams… the God of Fire Came not in flame, and from the thigh bones dripped
> And sputtered in the ashes a foul ooze; Gall-bladders cracked and spurted up"

Modern:
> "Sitting at my throne of augury, as is my custom — the place where every bird of
> heaven finds harborage — I heard on my ears a strange jargon of twitterings,
> hoots, and screams… the God of Fire did not come in flame. From the thighbones a
> foul ooze dripped and sputtered in the ashes. Gall-bladders cracked and spurted
> up."

Finding: **strong.** The full technical detail of the failed sacrifice is kept —
this is where a lazy modernization would compress to "the omens were bad". It
also keeps "as I guide others, so the boy guides me", the proverb "no fool like
an obstinate fool", and Creon's merchant-insult reply ("Exchange Sardis' silver
for the gold of India") complete.

### Sample 6 — ending. Chapter 11 (Exodos), paras 38–42

Source (para 42):
> "Of happiness the chiefest part Is a wise heart: And to defraud the gods in
> aught With peril's fraught. Swelling words of high-flown might Mightily the gods
> do smite. Chastisement for errors past Wisdom brings to age at last."

Modern:
> "The chief part of happiness is a wise heart. To defraud the gods in anything is
> fraught with peril. Swelling words of high-flown might the gods mightily strike
> down. Chastisement for errors past brings wisdom to age at last."

Finding: **good**, with one naturalness lapse two paragraphs earlier. Source:
> "CHORUS. This for the morrow; to us are present needs That they whom it
> concerns must take in hand."

Modern:
> "CHORUS. That is for tomorrow. Today has its own needs, and they who must take
> them in hand must do so."

The rewrite is circular ("they who must take them in hand must do so") and loses
"whom it concerns". This is the single clumsiest sentence I found in the book.

## Cross-book name consistency (Theban plays)

Verified programmatically across `oedipus-rex`, `oedipus-at-colonus`, `antigone`
modern-en: Oedipus, Creon, Antigone, Ismene, Polyneices, Eteocles, Haemon,
Teiresias, Menoeceus, Laius, Thebes all render identically, with counts matching
the source exactly. No drift.

## Phase 3 — human-edition research

Shared with the other Sophocles books; full candidate table in
`per-book-notes/oedipus-rex.md`. In brief:

- **SOURCE + GLOSSES?** No — Storr carries 38.9 archaisms/1k words here, with
  verse flattened to run-on prose. A real barrier.
- **Jebb (1888/1917, complete prose, PD in US and EU)** — I read the actual
  Antigone text on Wikisource: "Ismene, sister, mine own dear sister, knowest thou
  what ill there is…"; "No word of friends, Antigone, gladsome or painful, hath
  come to me…"; the Ode to Man as "Wonders are many, and none is more wonderful
  than man". More accurate and better structured than Storr, **but no less
  archaic** — it would not remove the barrier. Rejected on accessibility, not
  quality. (Perseus's digitisation is CC BY-SA 3.0 US; the underlying 1917 text is
  plain PD via Wikisource/Internet Archive.)
- **Plumptre (1878), Lewis Campbell (1906), Joseph Edward Harry (1911), E. P.
  Coleridge *Tragedies of Sophocles* (1905)** — all PD, all identified on
  Wikisource, none text-sampled: recorded **unverified**.
- **Ian Johnston (VIU)** — clearly the best-reading modern rendering, verified by
  reading his Oedipus; but johnstonia's copyright page states "No commercial
  publishing of these materials is permitted, without the written permission of
  Ian Johnston." **Permission required**, since Tinct sells Premium.
- **George Theodoridis (Bacchicstage)** — noncommercial only.

**Conclusion:** none found in this search that is both readable and rights-clear.

## Ratings

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 4 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 5 |
| Naturalness | 5% | 4 |

**Weighted score 4.7 — band: Strong.**

Clarity loses a point for the inherited CHORUS/CREON speaker-tag error, which
does confuse the scene where Creon yields; naturalness for the circular
"they who must take them in hand must do so".

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **medium-high**.

Six passages sampled (~1,700 source words) covering the opening, the Ode to Man
in full, the central agon, the Guard's narration, Teiresias, and the ending. No
substantive omission and **no invention at all** — this is the cleanest of the
three Theban plays on restraint. All 318 paragraph pairs mechanically re-verified.

Two things are worth a follow-up ticket, neither of them a translation fault:
the wrong speaker tag in chapter 10, and the chapter titles that don't match
which units are odes.

**Correction scope: local.**

## Limitations of this review

- I read 6 of 11 chapters closely (1, 4, 5, 9, 10, 11). Chapters 2, 3, 6, 7 and 8
  were checked mechanically only (word ratio, alignment, archaism sweep) plus a
  short spot-read of ch 8.
- I did **not** read Antigone's disputed final speech (the "a husband could be
  replaced, a brother could not" argument) closely — it sits in ch 9 and I
  sampled the kommos and Teiresias scene from that chapter instead. If anyone
  audits one more passage in this book, make it that one.
- `modern-da` not evaluated; out of scope.
- No comparison against the Greek — fidelity claims are fidelity to Storr.
- PD alternatives other than Jebb were not text-sampled.
- No in-app rendering check.
