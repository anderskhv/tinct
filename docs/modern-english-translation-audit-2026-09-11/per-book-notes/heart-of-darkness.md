# heart-of-darkness — Heart of Darkness, Joseph Conrad (1899)

Batch B14. Reviewer: audit subagent, 2026-09-11.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Conrad (1899)" | `9d7234592e087f7d` | 3 | 198 | 37,904 |
| modern-en "Modern English" | `169c288c26f0c8c0` | 3 | 198 | 37,897 |
| modern-da "Moderne Dansk" | `b0d43952a120819a` | 3 | 198 | 37,898 |

`en_editions_aligned: true`; no count mismatches; 0 truncated; 0 empty; mean
weighted similarity 0.9531; `pct_identical_long_paragraphs` **0.5**.

## Provenance of the core English text

English original (Conrad's third language; he wrote it in English). Serialised
in *Blackwood's* 1899, revised for *Youth: A Narrative; and Two Other Stories*
1902. Public domain worldwide. Three-part division matches the standard text.

## Phase 1 flags: confirmed / DISCONFIRMED — the headline number is wrong

The Phase 1 `pct_identical_long_paragraphs` of **0.5% is a measurement
artifact and materially understates how little was changed.** `modern-en`
flattens every curly quote and apostrophe to ASCII (`"` and `'`) across the
whole file, while `original-en` uses curly throughout. Because Conrad's text is
almost entirely Marlow speaking inside quotation marks, essentially every
paragraph begins with a quote character and therefore fails a byte comparison
even when not one word differs.

Re-measuring after normalizing quotes, dashes and underscores:

```
                         raw identity      after typographic normalization
whole book                 0.3% of words              40.3% of words
  Chapter 1                                            11%
  Chapter 2                                            42%
  Chapter 3                                            74%
```

**Two-fifths of the book, and three-quarters of Chapter 3, is the 1899 text
with the punctuation re-encoded and nothing else.** The same tapering shape as
`the-awakening` in this batch: the pass is strongest in Chapter 1 and has
almost stopped by Chapter 3 — which is exactly backwards from where a reader
needs help, since Chapter 3 (Kurtz, the Intended, "The horror! The horror!") is
the densest prose in the book.

Other Phase 1 flags disconfirmed: no truncation, no empty paragraphs, no
paragraph drift. A length-ratio scan of every paragraph ≥40 source words found
**zero** outliers — nothing omitted, nothing padded.

## Samples inspected (6)

### 1. Opening — Chapter 1, paras 0–7

Source p0: "The flood had made, the wind was nearly calm, and being bound down
the river, the only thing for it was to come to and wait for the turn of the
tide." Modern p0: "The tide was full, the wind was nearly calm, and since we
were headed downriver, the only thing to do was anchor and wait for it to
turn."

Source p5: "the **_Golden Hind_** returning with her **rotund** flanks full of
treasure… to the **_Erebus_** and **_Terror_**". Modern p5: "the Golden Hind
returning with her **rounded** flanks full of treasure… to the Erebus and
Terror."

Finding: **strong, where it acts.** Nautical idiom is genuinely unglossable to
a modern reader ("the flood had made", "come to") and is correctly rendered.
Every image, ship name, place name and clause of the Thames catalogue survives.
Note the italic markup on ship names is dropped in `modern-en` (a production
loss, not editorial).

### 2. Chapter 1, para 8 — Conrad's declared method (the ambiguity test case)

Source: "to him the meaning of an episode was not inside like a kernel but
outside, enveloping the tale which brought it out only as a glow brings out a
haze, in the likeness of one of these misty halos…"

Modern: "to him the meaning of an episode was not inside **it** like a kernel
but outside **it**, enveloping the tale that brought it out only as a glow
brings out a haze, in the likeness of one of those misty halos…"

Finding: **strong.** This is the paragraph a careless modernizer would
"clarify" into a statement about unreliable narration. It is left intact; the
only changes are two clarifying pronouns, "yarns of seamen" → "stories sailors
tell", and "spree" → "binge". Conrad's declaration that his meanings are
peripheral rather than central — the licence for the whole book's murk —
survives untouched.

### 3. Chapter 1, paras 47 and 66 — colonial-violence content

Source p47: "…the other, bent over his books, was making correct entries of
perfectly correct transactions; and fifty feet below the doorstep I could see
the still tree-tops of the **grove of death**."

Modern p47: identical but for "turned **back** to his work" and "**on** going
out".

Source p66 / modern p66: both read "And every week the messenger, a long
**negro**, letter-bag on shoulder and staff in hand, left our station for the
coast."

Finding: **strong on the sensitivity question.** Counted across the whole file:
`original-en` and `modern-en` both contain **10** instances of the n-word, **25**
of "savage/savages", **4** of "brute/brutes" — identical counts. Nothing is
softened, nothing is deleted, and no anachronistic editorial commentary or
diagnosis has been added anywhere I read. Conrad's indictment of the Company
("correct entries of perfectly correct transactions" fifty feet above the dying)
is delivered exactly as written.

### 4. Chapter 2, paras 14–17 — middle, the fog and the attack

Source p15 and modern p15 are word-for-word identical: "…they had given me an
irresistible impression of sorrow. The glimpse of the steamboat had for some
reason filled those savages with unrestrained grief."

Source p17: "Now, as far as I **did** see, I could go to the right or to the
left of this." Modern p17: "Now, as far as I **could** see, I could go to the
right or to the left of this."

Finding: **one genuine fidelity slip.** Conrad's "as far as I did see" reports
what Marlow actually observed; "as far as I could see" reports his capacity to
observe. Marlow's reliability turns on exactly this distinction and the
sentence is about a navigational choice he gets wrong. Local, one word, but it
is the "altered logical relationship" failure mode. Otherwise the sample is
identical to the source.

### 5. Chapter 3, paras 60–65 — the Intended

Source p61 and modern p61 differ **only** in quote characters:
`"'Yes, I know,' I said with something like despair in my heart, but bowing my
head before the faith that was in her, before that great and saving illusion
that shone with an unearthly glow in the darkness…"`

Finding: **failing as an edition.** Six consecutive paragraphs of the novel's
final scene reach the reader as the 1899 text with worse typography.

### 6. Chapter 3, paras 42 / 44 / 47 / 50 — the climax

"'The horror! The horror!'" and "'Mistah Kurtz—he dead.'" are verbatim (correct
— neither should be touched). p47 ("Droll thing life is—that mysterious
arrangement of merciless logic for a futile purpose…") and p50 ("a shadow
insatiable of splendid appearances, of frightful realities…") are verbatim
across several hundred words each.

Finding: **failing as an edition, strong as fidelity.** The hardest, most
allusive prose in the book is passed through unchanged.

## Editorial judgement

The brief warned that clarifying Conrad's deliberate ambiguity into plain
statement would be a serious failure. **That failure has not occurred** — and
the reason is that the edition barely intervenes. Where it does intervene
(Chapter 1) the work is good and restrained; Conrad's fog, his circling
narration, his symbolic doubling and his unreliability are all intact. There is
no invention, no diagnosis, no over-explanation, no sanitization.

But the corollary is that this "Modern English" edition is, for two-thirds of
its length, the source text with the smart quotes stripped out. It does not
remove a substantial reader barrier, because Conrad's barrier is not vocabulary
— it is syntax, symbolism and deliberate withholding, none of which a faithful
modernization may touch. Maintaining it as a separate edition costs shelf
space, splits the compare pane into two near-identical columns for Chapter 3,
and imports a typographic regression the source does not have.

## Production notes (not editorial)

`modern-en` uses ASCII straight quotes and apostrophes throughout all three
chapters; `original-en` uses curly throughout. Within the batch, the only other
book with this defect is `around-the-world-80-days` (chapters 11–30 only). In
Tinct's reader this renders as visibly worse typography in the edition the
product presents as the improved one. It also broke the Phase 1 mechanical
screen for this book.

## Human-edition research

English original, public domain worldwide; no translation involved, so no
alternative human translation is in scope. For a cleaner base text: **Standard
Ebooks, *Heart of Darkness*, Joseph Conrad** —
https://standardebooks.org/ebooks/joseph-conrad/heart-of-darkness — Standard
Ebooks production work is dedicated to the public domain via CC0 1.0; the
underlying text is PD. Also mirrored at
https://archive.org/details/joseph-conrad_heart-of-darkness. Our `original-en`
has no evident defect (consistent curly typography, no PG boilerplate), so no
replacement is indicated.

**Status: not researched further (English original already accessible).**

## Ratings

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 5 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **4.5** — band **Good with fixes**.

The score is high because fidelity and voice dominate the weighting and this
edition is maximally faithful — largely by not acting. Read the score together
with the recommendation: it measures "does this text betray Conrad" (no), not
"is this edition worth having" (marginal).

## Recommendation

**SOURCE + GLOSSES.**

Serve `original-en` as the English reading text and invest the modern-en
maintenance budget in targeted glosses instead — nautical idiom ("the flood had
made", "come to", "sea-reach", "offing", "lugger"), Congo Free State / Company
context, the French phrases, and the Victorian trade vocabulary ("interlopers",
"'Change", "men on 'Change"). Conrad's difficulty is not the kind a
modernization can honestly remove, and the current modern-en has already
concluded as much in practice for two-thirds of its length.

If the team prefers to keep a modern-en for product-consistency reasons
(split-pane, Danish alignment base), the minimum fixes are: restore curly
typography, restore the dropped italics on ship names, and correct ch2 p17
"could see" → "did see".

- **Confidence: medium-high.** The identity measurement is exhaustive across
  all 198 paragraph pairs; 6 passages read closely across all three chapters.
  The sensitivity check (racial-language counts) is exhaustive by token count
  but I read only three of those passages in context.
- **Correction scope: local** if kept (three fixes); **none** if the
  SOURCE + GLOSSES route is taken, since no text needs repair.

## Limitations of this review

- I did not read Chapter 2's opening or Chapter 3's opening as connected prose.
- I did not review `modern-da` beyond confirming it is genuinely Danish prose
  (ch1 p1: "Themsens flodmunding strakte sig foran os som begyndelsen på en
  uendelig vandvej…"). Its 37,898-word count against a 37,904-word source is
  coincidence, not a pass-through.
- I did not verify our `original-en` against the 1902 *Youth* volume text
  (Conrad revised between the 1899 serial and the 1902 book); I accepted it as
  the core text.
- I did not check onboarding/cast JSON or audio.
