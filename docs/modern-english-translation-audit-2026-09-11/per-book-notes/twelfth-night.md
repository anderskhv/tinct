# twelfth-night — Twelfth Night (William Shakespeare)

Batch B5 · reviewed 2026-09-11 · scope: public

## Edition snapshot (from Phase 1 `mechanical/twelfth-night.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `bf69ddee77f588e6` | 18 | 1,120 | 21,028 | Shakespeare (1623) |
| modern-en | `95580e0b935cdfce` | 18 | 1,120 | 21,490 | Modern English |
| modern-da | `6082c3cbef7468f7` | 18 | 1,120 | 21,747 | Moderne Dansk |

`mean_weighted_similarity` 0.6886 · `pct_identical_long_paragraphs` 0.8% ·
0 truncation flags · 0 empty paragraphs · 0 chapter/paragraph mismatches ·
`en_editions_aligned: true` · not on the Phase 1 "closer attention" list.

## Provenance of the core English text

Registry label: **"Shakespeare (1623)", year 1623** — again **not accurate**.
The file is a transcription of **Project Gutenberg #100** (same source family,
conventions and typography as `julius-caesar` and `henry-iv-part-2`): modern
spelling, curly quotes, `[_Exeunt._]` markup, full capitalized speaker names.

Completeness: **complete**. 18 chapters = Acts 1–5, all 18 scenes, real
Act/Scene + location chapter titles, no apparatus debris, no line numbers. The
closing Clown's song is present (ch18 paras 155–161).

Rights: public domain in the US.

## Whole-corpus mechanical check run for this review

Normalized per-paragraph similarity (markup and speaker tag stripped,
punctuation-insensitive, paragraphs ≥25 source words):

- **21.9%** of substantial paragraphs are ≥0.85 similar to the source
  (**18.8%** by word share).

Inspection of the top of that list shows the near-verbatim mass is almost
entirely **songs** (ch8 paras 18/21, ch9 paras 25/26, ch18 paras 156–160) plus
short single-line exchanges that legitimately need no change. This is a real
editorial policy question (below), not a sign of a mechanical "modernization".

## Samples inspected (6 passages, ~3,100 source words)

### 1. Act 1 Scene 1 (ch1, paras 0–9) — opening, high-register verse, full scene

Strong. "surfeiting" → "glutted", "Of what validity and pitch soever" →
"however valid or exalted", "Stealing and giving odour" → "stealing fragrance
and giving it back" (the paradox kept as a paradox, not explained away).

The hart/heart pun is actively protected: source para 5 reads "Why so I do, the
noblest that I have" and modern-en supplies the word — "Why, that is exactly
what I am doing — the noblest hart I have" — so a modern reader can see the
joke Curio set up. A small addition, but in service of the source's wordplay.

### 2. Act 1 Scene 5 (ch5, paras 100–129) — Viola/Olivia, the "willow cabin"
speech; the play's central verse set-piece

Strong overall. "'Tis in grain" → "It is fast-dyed"; "cantons" → "songs";
"reverberate hills" → "echoing hills"; "nonpareil of beauty" → "unrivalled
queen of beauty". Olivia's mock inventory ("item, two lips indifferent red") is
preserved item for item, including the joke's deadpan legal form.

**Confirmed finding (altered logical/semantic relation).** Source para 123:

> VIOLA. If I did love you in my master's flame, With such a suff'ring, such a
> deadly life, In your denial I would find no sense, I would not understand it.

modern-en:

> VIOLA. If I loved you with my master's passion, with such suffering, such a
> dying life, I would find no sense in your denial — I would not accept it.

"I would not understand it" is a claim about *comprehension* (the denial would
be unintelligible to me). "I would not accept it" is a claim about *will* (I
would refuse it). The modern reading changes Viola from baffled to defiant, and
breaks the parallel with the preceding "I would find no sense in your denial".
Local, one clause.

### 3. Act 2 Scene 3 (ch8, paras 50–79) — the midnight revels, "cakes and ale";
comic low register

Strong. Sir Toby's "Th'art i' the right. Go, sir, rub your chain with crumbs" →
"You're right. Go, sir — rub your chain of office with crumbs" — the gloss
"of office" is exactly the "familiar accurate equivalent at the point of need"
our standard asks for. "A stoup of wine" → "A pitcher of wine".

**Minor finding (dropped word).** Source para 75: "If I do not gull him into a
nayword, and make him a common recreation" → modern-en: "If I don't make him a
byword and a common joke". "Gull" (dupe, trick) — the verb the whole Malvolio
plot runs on, and a word the play uses repeatedly — disappears from Maria's
statement of the plan.

**Editorial-policy observation.** The songs in this scene are reproduced with
the source's `_..._` italic markup intact and the text essentially unmodernized
(paras 52, 55, 57, 60, 62, 64, 66 — only "What and if you do?" → "What if you
do?" and "spare not" → "not hold back"). See "song policy" below.

### 4. Act 2 Scene 5 (ch10, paras 40–71) — the letter scene; the play's densest
wordplay and the natural "difficult passage" pick (no Phase 1 flags to draw
from)

Strong, and notably brave. The bawdy acrostic is left intact —

> MALVOLIO. By my life, this is my lady's handwriting. These are her very C's,
> her U's, and her T's, and this is how she makes her great P's.

— rather than being smoothed or footnoted, and Sir Andrew's "Why that?" is kept
so the reader is prompted rather than told. "M.O.A.I. doth sway my life" is
untouched, correctly: the riddle has to stay a riddle. "staniel" → "kestrel",
"fustian riddle" → "pretentious riddle", "The cur is excellent at faults" →
"excellent at false trails" are all good local glosses.

**Data-hygiene observation (inherited, not a translation defect).** Source
paras 53–54 split Malvolio's reading mid-sentence ("…Her very" / "phrases! By
your leave, wax."). modern-en faithfully reproduces the broken split to hold
paragraph alignment. Fixing it would require a paired edit to the source file.

### 5. Act 3 Scene 4 (ch14, paras 100–117) — Sir Toby setting up the duel; the
play's longest scene, prose at speed

Strong. "Dismount thy tuck, be yare in thy preparation" → "Draw your rapier, be
quick in your preparation"; "dubbed with unhatched rapier, and on carpet
consideration" → "dubbed with an unused rapier, on courtly grounds"; "Hob, nob
is his word" kept and framed so the reader can infer it. Register is clearly
differentiated from the verse scenes.

### 6. Act 5 Scene 1 (ch18, paras 145–161) — the ending

Complete, including Malvolio's "I'll be revenged on the whole pack of you", the
Duke's closing couplet, and all five stanzas of the Clown's song. Fabian's
confession keeps the moral ambiguity ("may rather prompt laughter than revenge,
if the injuries that have passed on both sides be justly weighed") without
editorializing.

**Minor finding (normalized textual variant).** Source para 149 has the Clown
misquote the letter — "some have greatness **thrown** upon them" — where the
letter itself (ch10 para 79) reads "thrust". modern-en silently regularizes the
Clown's line to "thrust", removing the variant. Most scholarly editions keep
"thrown". Sub-word-level; flagged for completeness.

## Song policy — the one structural question

18.8% of the modern edition by word share is near-verbatim source, and nearly
all of it is sung verse. "O mistress mine", "Come away, come away, death",
"When that I was and a little tiny boy" reach the modern-en reader with the
archaisms intact ("the rain it raineth every day", "toss-pots", "Youth's a
stuff will not endure") and with Gutenberg's `_` italic markers still in the
text (100 underscore characters survive in `twelfth-night-modern-en.json`; the
other four plays in this batch have 0–2, and the app does **not** render `_` as
italics — `ParagraphRenderer.tsx` has no markdown handling, so they display as
literal underscores).

This looks like a deliberate choice to leave lyrics alone, and it is defensible
— but it is currently undeclared, inconsistently applied (some song lines
*are* modernized), and it ships visible markup. It needs a decision, not a
rewrite.

## Phase 1 flags confirmed / disconfirmed

- `pct_identical_long_paragraphs: 0.8%` — **confirmed**, but this Phase 1
  metric (byte-identical only) understates the picture: my normalization-aware
  measure puts near-verbatim content at 21.9% of paragraphs. Both readings are
  correct; the second is the one that matters editorially.
- `truncated_paragraphs_total: 0` — **confirmed**; no compression observed,
  including in the long prose speeches.
- `last_chapter_suspiciously_short: false` (3,455 words) — **confirmed**; Act 5
  Scene 1 read to its end.
- `en_editions_aligned: true` — **confirmed** across all six sampled chapters.

## Phase 3 — human-edition research

Same conclusion and same search as `julius-caesar`:

- **No complete, readable, rights-clear human modern-English translation of
  Twelfth Night was found in this search.** No Fear Shakespeare and LitCharts
  Shakescleare are complete but fully copyrighted. Folger Shakespeare digital
  texts are **CC BY-NC 3.0** (verified at
  https://www.folger.edu/copyright-policy/) — a noncommercial restriction that
  blocks Tinct's paid tier — and in any case they are modernized-spelling
  editions of the *original*, not translations.
- **Charles and Mary Lamb, *Tales from Shakespeare* (1807)** — public domain,
  and it *does* include Twelfth Night
  (https://www.gutenberg.org/ebooks/573). But it is an abridged third-person
  prose **retelling** of the plot, not a translation: no dialogue structure, no
  Malvolio letter scene as scene, no songs. It fails "completeness" and cannot
  serve as a reading edition of the play. Recorded as researched-and-rejected
  on completeness, not on rights.

Best rights-clear human edition for the **original-language** text:

- **Standard Ebooks, *Twelfth Night*** —
  https://standardebooks.org/ebooks/william-shakespeare/twelfth-night —
  Clark & Wright 1887 Victoria/Globe text, **CC0 1.0**. A lateral move for this
  book; Tinct's PG#100 original-en is already clean. No action needed.

## Phase 4 — rating

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 5 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

**Weighted score 4.8 — band: Strong.**

Clarity is 4, not 5, solely because of the unmodernized songs and the leaked
`_` markup a reader actually sees on the page.

## Recommendation

**LIGHT EDIT** — confidence **medium**, correction scope **local**.

The prose and verse modernization is the best of the five plays in this batch
alongside Julius Caesar; the wordplay-heavy scenes are handled with real
judgement. Scoped fixes:

1. Correct "I would not accept it" → "I would not understand it" (Act 1
   Scene 5, para 123).
2. Decide and apply a **song policy** consistently — either modernize lyrics or
   declare them preserved — and in either case strip the 100 stray `_`
   characters from `twelfth-night-modern-en.json`, which currently render as
   literal underscores.
3. Restore "gull" in Maria's plan (Act 2 Scene 3, para 75).
4. Optional: restore the Clown's "thrown" variant (Act 5 Scene 1, para 149).

Cross-cutting, not book-specific: the registry provenance label
**"Shakespeare (1623)" is wrong** for a PG#100-derived text.

## Limitations of this review

- 6 of 18 scenes sampled (~3,100 of 21,028 source words, ~15%), covering Acts
  1, 2, 3 and 5. **Act 4 was not read** (ch15–ch17: the Sebastian confusions,
  the Sir Topas dark-house scene). The Sir Topas scene in particular is
  wordplay-dense and should be spot-checked before any fix is signed off.
- Whole-corpus near-verbatim measurement is mechanical; it cannot detect
  invention or omission, only non-change.
- `modern-da` not reviewed. Audio alignment, onboarding JSON and cast JSON not
  checked.
- Rights research is a documentary review, not legal advice.
