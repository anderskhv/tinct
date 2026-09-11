# candide — Candide (Voltaire, 1759)

Reviewer: audit batch agent, 2026-09-11. Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `fd3eff9b64e01756` | 30 | 709 | 32,209 | Fleming (1901) — tr. William F. Fleming |
| modern-en | `136767b698e00213` | 30 | 709 | 31,563 | Modern English |
| modern-da | `5d461138e1b097dd` | 30 | 709 | 31,191 | Moderne Dansk |

`en_editions_aligned: true`, no count mismatches, **no truncations**, no empty paragraphs,
`last_chapter_suspiciously_short: false`. Mean weighted similarity **0.7289**,
`pct_identical_long_paragraphs 0.7`.

My recomputation (`difflib`, token sequences, `autojunk=False`, paragraphs ≥15 words):
mean **0.786** over 529 paragraphs, **3 byte-identical paragraphs** in the whole book,
only 19 paragraphs above 0.95, spread evenly across all 30 chapters (per-chapter means
range 0.64–0.89, lowest in ch11/ch16, highest in ch28/ch30). No chapter is untouched and
no region of the book is more lightly handled than another — the editing is uniform.

## Provenance and completeness of the core English text

"Fleming (1901)" is the text of *The Works of Voltaire*, ed. William F. Fleming, E. R.
DuMont, New York, 1901 — a lightly revised descendant of Tobias Smollett's 1759/1762
translation rather than an independent Fleming rendering. Public domain. Complete: all 30
chapters, with the full chapter-heading apparatus ("Chapter 1 — How Candide Was Brought Up
in a Magnificent Castle, and How He Was Expelled Thence") preserved verbatim in both
editions.

**One defect in `original-en`, not in `modern-en`:** the Fleming file carries **35 orphaned
footnote markers** (`_auto-da-fe_[6]`, `ten patagons[20]`, `a boiled condor[19]` …) whose
footnotes are not in the file, plus **36 Gutenberg `_italic_` markers** that the reader
body text does not render (only `Chat.tsx`, `Feed.tsx`, `Notes.tsx` render markdown). The
modern edition strips **all** of both, cleanly — that is a real, if unglamorous,
reader-facing improvement over the source text we ship.

## Satire-specific checks requested for this book

- **The Pangloss refrain.** Present and verbatim in modern-en, 6 occurrences of "best of
  all possible worlds" against 5 in Fleming (modern-en expands Fleming's "best of possible
  worlds" at ch6 p3 to the full formula). ch1 p3 — "in this best of all possible worlds the
  Baron's castle was the most magnificent of castles, and his lady the best of all possible
  Baronesses" — is preserved with its cascade intact. ch30 p31's "concatenation of events
  in this best of all possible worlds" is preserved. The running gag survives.
- **Ironic understatement / cheerful tone over atrocity.** Preserved. ch3 p0: "so dashing,
  so smart, so brilliant, and so well-ordered as the two armies … music such as Hell itself
  had never heard … Candide, who trembled like a philosopher, hid himself as well as he
  could during this heroic butchery." The deadpan accounting of corpses ("The total might
  come to thirty thousand souls") and the phrase "in accordance with the laws of war" both
  land.
- **Named historical/geographic targets.** Checked and preserved by name, not vagued:
  Coimbra, Lisbon, Biscayan, *auto-da-fe*, *sanbenito*, Guinea, Surinam, Mynheer
  Vanderdendur, Brundisium, Rabirius, Cluentius, Maecenas, Tasso, Ariosto, the Academy of
  Sciences, Lemnos/Mytilene/Erzurum, the Sublime Porte, and the whole 30-name catalogue of
  murdered rulers in ch30 p25 (Eglon/Ehud … Mary Stuart, Charles I, the three Henrys of
  France). The Latin tag `ut operaretur eum` is kept. Nothing is glossed away or
  generalised.

## Samples inspected (6)

### 1. ch1 p3–7 — Pangloss's demonstration and the expulsion

> **original-en p4:** "Observe, that the nose has been formed to bear spectacles--thus we
> have spectacles. Legs are visibly designed for stockings--and we have stockings."
> **modern-en p4:** "Notice that noses were made to wear spectacles—and so we have
> spectacles. Legs are clearly designed for stockings—and we have stockings."

Finding: faithful. The closing sophistry — "those who claim that all is well have said
something foolish; they should have said that all is for the best" — keeps its precise
logical distinction. The screen scene (p7) keeps every clause of the famous asyndeton
("their lips met, their eyes sparkled, their knees trembled, their hands wandered") and
the "cause and effect" pun.

### 2. ch3 p0–3 — the battle and the burned villages

> **original-en p1:** "…there, their daughters, disembowelled and breathing their last
> after having satisfied the natural wants of Bulgarian heroes; while others, half burnt in
> the flames, begged to be despatched. The earth was strewed with brains, arms, and legs."
> **modern-en p1:** "…there, their daughters, disemboweled and drawing their last breath
> after satisfying the natural needs of Bulgarian heroes; while others, half-burned in the
> flames, begged to be finished off. The ground was strewn with brains, arms, and legs."

Finding: nothing softened, nothing added. "Te Deum", "the laws of war", the Abare/Bulgarian
symmetry all intact.

### 3. ch6 p0–3 — the auto-da-fé

> **original-en p0:** "…the burning of a few people alive by a slow fire, and with great
> ceremony, is an infallible secret to hinder the earth from quaking."
> **modern-en p0:** "…the burning of a few people alive over a slow fire, with great
> ceremony, is an infallible secret for keeping the earth from quaking."

Finding: the joke's mechanism (a solemnly reported absurd causal claim) is untouched, and
the punchline — "The same day the earth suffered another violent tremor" — is preserved,
including the "another" that Fleming leaves implicit. The costume detail (inverted flames
and tail-less devils for Candide, upright flames and clawed devils for Pangloss) survives
intact; this is exactly the kind of specific that a lazy modernization drops.

### 4. ch19 p3–11 — the mutilated slave at Surinam (hardest passage: the book's one
unironic moment, and the one with a terminology problem)

> **original-en p7:** "When we work at the sugar-canes, and the mill snatches hold of a
> finger, they cut off the hand; and when we attempt to run away, they cut off the leg;
> both cases have happened to me. This is the price at which you eat sugar in Europe."
> **modern-en p7:** "When we work at the sugar canes, and the mill catches hold of a
> finger, they cut off the hand. When we try to run away, they cut off the leg. Both have
> happened to me. That's the price at which you eat sugar in Europe."

Finding: complete and unflinching — the mother's speech, the "ten patagons", the fetishes,
the second-cousins argument, and Candide's definition of optimism ("the madness of
insisting that everything is well when it is wrong") all survive. Fleming's archaic
second-person ("what art thou doing there") is correctly modernised.

**The one defect I found in this book.** `modern-en` systematically replaces Fleming's
"negro" with "Black" / "the man" (ch3, ch11, ch12, ch14, ch19, ch26 — 10 sites), but
leaves **one instance unconverted**:

> **modern-en ch30 p2:** "I want to know which is worse: to be ravished a hundred times by
> **negro** pirates, to have a buttock cut off…"

This is an internal consistency failure, not a fidelity failure — the edition made an
editorial decision and then applied it to 10 of 11 sites. One-line fix.

### 5. ch25 p8–19 — Pococurante's library (thickest allusion density in the book)

> **original-en p10:** "…yet it was necessary to have it in their library as a monument of
> antiquity, or like those rusty medals which are no longer of use in commerce."
> **modern-en p10:** "…but they still felt they had to have it in their library, as a
> monument of antiquity, or like those rusty old coins that no longer circulate."

Finding: every name and judgement preserved — Homer's repetitive battles, the specific
Aeneid books (second, fourth, sixth), "his bourgeois Amata, his insipid Lavinia", Horace's
journey to Brundisium and the Rupilius quarrel, Cicero on Rabirius and Cluentius, "four-
score volumes" correctly rendered as "eighty". The one substitution ("rusty medals" →
"rusty old coins") replaces an image with a clearer equivalent image, not with an
explanation. Pococurante's exhausted hauteur is intact.

### 6. ch30 — the conclusion

> **modern-en p26:** "'I know also,' said Candide, 'that we must cultivate our garden.'"
> **modern-en p32:** "'All that is very well,' answered Candide, 'but let us cultivate our
> garden.'"

Finding: both closing formulations are verbatim — the modern edition wisely does not
"improve" the most famous line in the Enlightenment. Martin's "Let us work without arguing;
it is the only way to make life tolerable" is preserved; so is the uncomfortable
antisemitic clause "the Jews cheated him so thoroughly that he had nothing left but his
little farm", which is in Voltaire and is correctly not sanitised away. The final roster
(Cunegonde the pastry cook, Paquette embroidering, Friar Giroflée the carpenter) is complete.

## Phase 1 flags: confirmed vs. disconfirmed

- `truncated_paragraphs_total: 0` — **confirmed independently.** Lowest target/source word
  ratio for any paragraph ≥40 words is **0.80** (ch24 p32), a compression with no content
  loss (verified by reading it).
- `pct_identical_long_paragraphs: 0.7` — **confirmed.** Only 3 byte-identical paragraphs in
  709, all short exchanges where no change was warranted (e.g. ch6 p5, "'My son, take
  courage and follow me.'").
- `mean_weighted_similarity: 0.7289` — **confirmed** (my figure 0.786 on a stricter
  measure). This is a genuine but *light* modernization: de-archaising rather than
  rewriting. Appropriate for this source text.
- `last_chapter_suspiciously_short: false` — correct; ch30 is the conclusion at 1,560 words.

## Phase 3 — human-edition research

| Candidate | Date | Completeness | Rights | Verdict |
|---|---|---|---|---|
| Fleming (Smollett-derived), *Works of Voltaire* vol. I | 1901, E. R. DuMont | complete | Public domain — Online Library of Liberty, PG | **Already our `original-en`.** |
| Modern Library / Boni & Liveright *Candide*, "introduction by Philip Littell" | 1918 | complete | Public domain (pre-1929) — PG #19942 | **Same translation text.** I fetched PG #19942 and compared: its ch3 reads "There was never anything so gallant, so spruce, so brilliant, and so well disposed as the two armies. Trumpets, fifes, **hautboys**, drums, and cannon made music such as Hell itself had never heard." — word-for-word our Fleming. Littell contributed the **introduction only**; the "Littell translation" widely cited online is a misattribution. No new text. |
| Standard Ebooks, *Candide* | digitisation | complete | CC0 dedication over the PD text | Carries the **Modern Library 1918 text**, i.e. the same translation again. https://standardebooks.org/ebooks/voltaire/candide |
| Tobias Smollett | 1759/1762 | complete | Public domain | The ancestor of the above; more archaic, not an improvement. |
| Adams (Norton 1966), Wootton (Hackett 2000), Cuffe (Penguin 2005), Pearson (OUP) | 20th–21st c. | complete | **In copyright** in both US and EU/DK | Not usable. As briefed: most 20th-century *Candide* translations are still protected. |

**Conclusion: every rights-clear English *Candide* is the same Smollett→Fleming line of
text.** The apparent abundance of free *Candide* editions is an illusion — Standard Ebooks,
Project Gutenberg, Online Library of Liberty and the Modern Library reprints all serve the
same translation Tinct already ships. There is no better human PD option, so the light
modernization is the right instrument, and the current one does the job.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

**Weighted score 4.8 — band: Strong.**

Voice is a 4 rather than a 5 for the one terminology inconsistency at ch30 p2 and because
in the lightest passages the edition adds little beyond punctuation. Fidelity and restraint
are 5s: across six samples and ~2,800 source words read in pairs I found no omission and
no invention.

## Recommendation

**LIGHT EDIT.** Confidence: **high** on the passages sampled, medium-high for the book
(6 samples of 30 chapters, plus exhaustive mechanical comparison of all 709 paragraph
pairs, which found no truncation anywhere). Correction scope: **local**.

The only required change is one word: convert the surviving "negro pirates" at
`candide-modern-en.json` ch30 p2 to match the treatment used at the other 10 sites. Without
that, this edition would be an unqualified KEEP.

Optional, and arguably more valuable than the modern edition itself: strip the 35 orphaned
footnote markers and 36 `_italic_` markers from `candide-original-en.json`, which currently
render as literal `[6]` and `_sufficient reason_` on the page.

## Limitations of this review

- 6 sampled locations of 30 chapters. I did **not** read chapters 2, 4, 5, 7–18, 20–24 or
  26–29 in pairs; the Eldorado chapters (17–18) and the Paris satire (ch22, the longest
  chapter at 65 long paragraphs) were checked only mechanically.
- I did **not** check the modern edition against Voltaire's French; no French original is
  in the repo. All fidelity judgements here are fidelity *to Fleming*, and any error
  Fleming/Smollett made is inherited silently.
- I did **not** audit `modern-da`.
- No rendering/visual QA in the app.
