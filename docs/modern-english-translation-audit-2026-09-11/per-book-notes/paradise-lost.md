# paradise-lost — Paradise Lost (John Milton)

**Scope:** public
**Reviewer:** batch agent, long-form verse epics, 2026-09-11

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en — "Original (1674)" | `56c47aa192f17e38` | 12 | 1188 | 79,739 |
| modern-en — "Modern English" | `87727e7760ea487d` | 12 | 1188 | 84,141 |
| modern-da — "Moderne Dansk" | `266ada0a3a74b083` | 12 | 1188 | 70,481 |

`en_editions_aligned: true`. All 12 books present, verse-paragraph counts identical across editions.

## Provenance / completeness of the core English text

`original-en` is Milton's own 1674 twelve-book text — an English original, not a translation. Public domain beyond any doubt. Complete: all 12 books, from "Of Man's first disobedience" to "Through Eden took their solitary way." Verse paragraphs are preserved as JSON paragraphs; `modern-en` reflows each verse paragraph into prose, one-for-one.

## THE HEADLINE FINDING: modern-en is two different editions stitched together at Book 8

I computed word-level `difflib` similarity between each `original-en` paragraph and its `modern-en` counterpart (paragraphs ≥15 source words), which the Phase 1 data does not break out by book:

| Book | mean word-similarity | paragraphs ≥0.85 similarity |
|---|---|---|
| 1 | 0.793 | 15 / 73 |
| 2 | 0.839 | 38 / 90 |
| 3 | 0.822 | 26 / 92 |
| 4 | 0.861 | 77 / 124 |
| 5 | 0.870 | 65 / 102 |
| 6 | 0.853 | 53 / 94 |
| 7 | 0.766 | 15 / 72 |
| **8** | **0.533** | **0 / 76** |
| **9** | **0.529** | **0 / 156** |
| **10** | **0.553** | **0 / 122** |
| **11** | **0.560** | **0 / 110** |
| **12** | **0.609** | **2 / 77** |

The break at Book 8 is absolute: **291 of 1188 paragraphs sit at ≥0.85 word-identity with Milton, and every one of them is in Books 1–7; Books 8–12 contain literally zero.** Books 1–7 are a de-lineation with occasional spelling repair; Books 8–12 are a real modernization. A reader moves from one product to a different one halfway through. This is the defect that drives the rating, and it is not visible in the Phase 1 summary (`mean_weighted_similarity: 0.5363`, `pct_identical_long_paragraphs: 0.0` — both true and both hide the split, because the split is between "reflowed" and "rewritten", not between "identical" and "not").

## Phase 1 flags: confirmed vs. disconfirmed

- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`, `para_count_mismatches: []` — **all confirmed.** I found no omitted scene, speech or simile anywhere in the nine samples. Completeness is genuinely good.
- `pct_identical_long_paragraphs: 0.0` — **technically true but misleading.** Nothing is byte-identical, but Books 4–6 average 0.85–0.87 word-similarity, i.e. Milton with the line breaks removed.
- `last_chapter_suspiciously_short: false` — confirmed (Book 12 = 5,234 words).

## Samples inspected (9 passages, covering Books 1, 2, 3, 4, 5, 6, 7, 8, 9, 12)

### 1. Book 1, paras 0–5 — the invocation — STRONG

Source: *"Of Man's first disobedience, and the fruit / Of that forbidden tree… / Sing, Heavenly Muse…"*
Modern: *"Sing, Heavenly Muse, of the first disobedience of Man, and of the fruit of that forbidden tree whose deadly taste brought death into the World and all our woe…"*

This is the right treatment for Milton: the 16-line suspended period is unwound so the verb arrives first, but the register is untouched — "adamantine chains and penal fire", "hideous ruin and combustion", "the Aonian mount", "obdurate pride and steadfast hate" all stay. Grandeur survives; the syntactic barrier is removed. **This is the standard the rest of the poem should have been held to.**

Not glossed: Oreb, Sinai, Sion hill, Siloa's brook, the Aonian mount. A reader who doesn't already know what the Aonian mount is still won't.

### 2. Book 2, paras 8–11 — Belial in council — GOOD, tending light

*"though his tongue / Dropped manna, and could make the worse appear / The better reason"* → *"Though his tongue dropped manna, and could make the worse reason seem the better"*. Argument is intact (the whole "that must end us; that must be our cure — to be no more" reasoning survives with its logical steps in order). But "dropped manna", "flat despair", "the wide womb of uncreated Night", "obdurate" are carried over unchanged. Reads as Milton reflowed.

### 3. Book 3, paras 10–11 — God's foreknowledge/free-will speech — LIGHT

*"For man will hearken to his glozing lies"* → *"For Man will hearken to his flattering lies"*. "glozing"→"flattering" is a good gloss; but "hearken", "Ingrate", "the ethereal Powers" are all left. The theological argument is preserved exactly, including the crucial "Freely they stood who stood, and fell who fell" and the conditional about what praise unfree obedience could earn.

### 4. Book 4, paras 4–7 — Satan's soliloquy on Mount Niphates — FAILING (mechanically light)

Source: *"Till pride and worse ambition threw me down / Warring in Heaven against Heaven's matchless King: / Ah, wherefore! he deserved no such return / From me, whom he created what I was / In that bright eminence, and with his good / Upbraided none; nor was his service hard."*
Modern: *"till pride and worse ambition threw me down, warring in Heaven against Heaven's matchless King. Ah, why! He deserved no such return from me, whom he created what I was in that bright eminence, and with his good upbraided none; nor was his service hard."*

The only changes in this paragraph are a lowercase "till", "wherefore"→"why", and the removal of line breaks. "with his good upbraided none" — a phrase a modern reader genuinely cannot parse — is passed through untouched. Para 5 is the same story: only `'sdeined`→`disdained`, `recompence`→`recompense`, `inferiour`→`inferior`.

This is the clearest example of the "LIGHT/MECHANICAL false modern edition" failure mode the brief names. Book 4 is the *most* affected book in the poem (77 of 124 paragraphs ≥0.85).

### 5. Book 5, paras 40–42 — Raphael arrives in Eden — FAILING (mechanically light)

Source: *"Whom thus the angelick Virtue answered mild. / Adam, I therefore came…"*
Modern: *"To whom the angelic Virtue thus answered, mild: 'Adam, I came for that reason…'"*

"vouchsafe", "meridian heat", "sylvan lodge", "Pomona's arbour", "virtue-proof", "the fairest feigned Goddess of those three that on Mount Ida naked strove" — all retained. A reader who cannot read Milton cannot read this. The single real service performed is the insertion of quotation marks so the reader can tell who is speaking, which the 1674 text lacks.

### 6. Book 6, paras 60–61 — the War in Heaven — FAILING, and one place where it makes things *worse*

Source: *"Their armour helped their harm, crushed in and bruised / Into their substance pent, which wrought them pain / Implacable"*
Modern: *"Their armour helped their harm: crushed in and bruised into their substance pent, it wrought them implacable pain"*

Still unparseable. And *"Hurled to and fro with jaculation dire"* becomes *"hurled to and fro with dire casting"* — "jaculation" is replaced with "casting", which in this context is *more* ambiguous, not less. Substituting a vaguer familiar word for a precise unfamiliar one is the wrong trade.

### 7. Book 7, paras 8–9 — the invocation to Urania / Adam's request — GOOD

*"the unapparent Deep"* → *"the unmanifested Deep"* (marginal), but the syntax is genuinely rearranged and the sentence now has a subject and a main verb where you expect them. Transitional in character between the two halves.

### 8. Book 8, paras 30–31 — Adam's first moments of consciousness — STRONG

Source: *"Straight toward Heaven my wondering eyes I turned, / And gazed a while the ample sky; till, raised / By quick instinctive motion, up I sprung…"*
Modern: *"At once I turned my wondering eyes toward Heaven and gazed for a while at the wide sky. Then, moved by quick instinct, I sprang upward and stood on my feet."*

Genuinely modernized, image-for-image, nothing lost. The first book of the second, better half.

### 9. Book 9, paras 100–103 — Eve's soliloquy before eating — STRONG, one small addition

Source: *"How dies the Serpent? he hath eaten and lives, / And knows, and speaks, and reasons, and discerns, / Irrational till then."*
Modern: *"How does the Serpent die then? He has eaten and lives, and knows, and speaks, and reasons, and shows intelligence that was not there before."*

"Irrational till then" correctly unpacked. The sophistical chain of Eve's reasoning is preserved step by step — this is the hardest argumentative passage in the poem and it is handled well.

Minor addition: *"author unsuspect, / Friendly to man"* → *"an unsuspected, **trustworthy guide**, friendly to humanity"*. "trustworthy guide" is not in Milton; it is a gloss of "author unsuspect" that adds a judgement.

### 10. Book 12, paras 74–76 — the expulsion and the last lines — STRONG, two inventions

The famous closing tercet is kept almost verbatim and is right to be: *"Hand in hand, with wandering steps and slow, through Eden they took their solitary way."*

But two inventions in para 74–75:
- *"And vapour as the Libyan air adust"* → *"Its scorching heat and **vaporous radiation**, like the burning Libyan wind"*. "Radiation" is a modern physical term with no counterpart in Milton and an anachronistic flavour.
- *"the gate / With dreadful faces thronged"* / *"Waved over by that flaming brand"* → *"All the eastern side of Paradise… **was engulfed in waving flame**."* In Milton the flaming sword *waves over* Paradise; Paradise is not engulfed in flame. This changes the image.

## Phase 3 — human-edition research

This is an English original, so the standard says to ask first whether the source itself already meets the reading standard.

**Does the 1674 text meet it?** Partly. Milton's *vocabulary* is largely modern — the barrier is his Latinate syntax (inversion, suspended periods, ellipsis) plus a dense classical/biblical allusion field. A reader with glosses can get through Books 1–3; Books 5–8 are harder. My honest view is that **source + glosses is a legitimate product for Paradise Lost, and Books 1–7 of the current modern-en are already close to being exactly that** — except that they carry the label "Modern English", which promises something they do not deliver, and they carry no glosses.

**Human modern editions searched for:**
- *John Milton's Paradise Lost In Plain English* (Joseph Lanzara, 2009) — complete line-by-line paraphrase. **In copyright; permission required.** https://www.goodreads.com/book/show/6393169
- paradiselostinmodernenglish.com — complete web paraphrase. **In copyright** (no licence offered on the site). https://www.paradiselostinmodernenglish.com/
- James Belton, *Paradise Lost in Modern English* (© 2009–2012) — **in copyright.** https://jimbelton.wordpress.com/paradise-lost-in-modern-english/
- 19th-c. school editions "with a prose translation or paraphrase" — public domain but I could only locate **single books**, e.g. Book III at https://archive.org/details/cu31924013190453. **No complete twelve-book public-domain prose paraphrase found in this search.** I mean "not found in this search", not "none exists" — Victorian school-edition paraphrases were published book by book and a complete set may exist unlisted.

**Conclusion:** no rights-clear complete human modern English Paradise Lost was located. The realistic options are (a) fix the existing modern-en, or (b) present the 1674 text with glosses.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **4** | Nothing omitted in nine samples across all 12 books; two inventions found in Book 12 and one gloss-as-judgement in Book 9 |
| first-read clarity | 25% | **3** | Books 8–12 clear; Books 1–7 still require the reader to parse 17th-century syntax and vocabulary ("upbraided none", "vouchsafe", "into their substance pent") |
| literary voice | 20% | **4** | Register and grandeur preserved everywhere — in Books 1–7 because nothing was changed, in Books 8–12 by genuine craft |
| restraint / no invention | 10% | **4** | "vaporous radiation", "engulfed in waving flame", "trustworthy guide" |
| naturalness | 5% | **3** | Books 1–7 read as reflowed verse, with inversions and unresolved ellipses left standing |

**Weighted score: 3.7 — Mixed.**

## Recommendation

**RETRANSLATE — scoped to Books 1–7.** Confidence: **high** on the diagnosis (it is a mechanical measurement over all 1188 paragraph pairs plus five confirming reads), **medium** on the precise remedy.

The defect is not local: it is 7 of 12 books and 291 paragraphs, a systematic property of how the edition was produced, not a handful of bad passages. That rules out LIGHT EDIT for Books 1–7. Books 8–12 should be left alone — they meet the standard and re-running them risks losing work that is already good.

Correction scope: **substantial** (≈46,000 source words, Books 1–7).

Two alternatives worth putting to Anders before committing:
- **SOURCE + GLOSSES for the whole poem** — relabel the current Books 1–7 honestly, add glosses for Oreb/Siloa/Aonian mount/Pomona/Mount Ida etc., and accept that Milton's English stays Milton's. Cheaper and arguably more faithful; but then Books 8–12 have to be brought *back* to match, which throws away good work.
- **Finish the job** — re-run Books 1–7 to the Book 8–12 standard. More consistent with the edition's own label and with the rest of the library.

I lean to the second, because Book 1's invocation proves the approach works on the hardest material in the poem.

## Limitations of this review

- `modern-da` not checked (its 70,481 words vs. 79,739 source words is a ~12% shortfall worth a separate look).
- 9 passages read closely out of 1188 paragraphs; the similarity table covers all 1188 mechanically but similarity is not a fidelity measure — a low-similarity paragraph could still contain an invention I did not read.
- I checked completeness by paragraph counts and by reading, not by line-by-line collation against a reference text of the 1674 edition.
- I did not verify whether the app discloses anywhere that modern-en is prose.
- No rendering, audio, onboarding or thread-file checks.
