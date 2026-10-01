# HANDOFF: a-little-princess modern-en re-render

Branch: `content/rerender-a-little-princess` (cut from `origin/integration/release-candidate-3`).
Artifact: `books/wip/rerender/a-little-princess/a-little-princess-modern-en.json`
SHA-256: `c47540c17dd567bafe0934392b31a8d236e15e809244e419080e8abf3c4fa1b6`

Content only; nothing under `app/**` was touched. No API calls, no generate-editions.cjs, no regex or dictionary passes.

## What changed

1. Base = the integrated modern-en (release-candidate-3). Its curly quotes and apostrophes (354 curly apostrophes, 1207 curly quote pairs, 16 opening single quotes) were converted to straight marks, the style of the original-en. Nothing else was altered in the REAL chapters.
2. Chapters that were LIGHT once typography was folded were rewritten by hand, paragraph by paragraph: **3, 5, 6, 7, 15, 16, 17, 18**. Every paragraph of those chapters was re-rendered (changed paragraphs vs the folded base: ch3 64/68, ch5 71/79, ch6 72/81, ch7 184/208, ch15 219/260, ch16 102/120, ch17 72/95, ch18 100/110; the remaining paragraphs are very short lines such as "Why?" that are identical to the source by nature). Paragraph counts are identical to the original in all 19 chapters.
3. Chapters 1, 2, 4, 8-14, 19 are unchanged apart from the quote normalisation (REAL / REAL-HEAVY already; ch8 is REAL at 0.844, left as instructed).

Dashes: the rewritten chapters use the em dash (U+2014), matching the rest of the current modern-en, instead of the original's `--`.

## Gate numbers (classifier unchanged: `books/classify-modern-en.py`)

Before (current integrated modern-en, typography folded to straight):
- weighted similarity 0.667, light+mechanical 8/19 = 42.1%, identical long paragraphs 99/1224 = 8.1% -> GATE FAIL
- LIGHT chapters: 3 (0.877), 5 (0.893), 6 (0.918), 7 (0.894), 15 (0.885), 16 (0.885), 17 (0.897), 18 (0.907)

After (candidate):
- Folded copies (both editions through the curly-to-straight map): weighted similarity 0.601, light+mechanical 0/19, identical long 7/1224 = 0.6%, wrapped 0, truncated quotations 0 -> GATE PASS
- Unfolded candidate vs the original: identical numbers (the candidate is already all-straight) -> GATE PASS
- Rewritten chapter similarities: ch3 0.626, ch5 0.702, ch6 0.732, ch7 0.782, ch15 0.780, ch16 0.799, ch17 0.797, ch18 0.805

Other checks on the whole file: no paragraph below 75% of source words in the rewritten chapters, zero `!` shortfall per paragraph across all 19 chapters, no bracketed notes, only ASCII plus the em dash, and every quote balanced inside the rewritten paragraphs.

## Spot reads (original -> modern)

- ch3 p0: "Having wept hopeless tears for weeks in her efforts to remember that "la mere" meant "the mother," ... --when one spoke sensible English--it was almost too much" -> "For weeks she had cried hopeless tears over trying to remember that "la mere" meant "the mother" and "le pere" meant "the father"—when any sensible person spoke plain English. ... It was nearly too much for her."
- ch6 p59 (Captain Crewe's letter): "Perhaps, if I was not feverish I should not be awake, tossing about, one half of the night" -> "Perhaps if I weren't feverish, I wouldn't lie awake tossing half the night and spend the other half in troubled dreams."
- ch15 p259: "drew her into the warm, glowing midst of things which made her brain reel" -> "drew her into the warm, glowing heart of it all, which made her head swim and her starved senses reel ... the Magic that never lets the very worst things QUITE happen."

## Known issues

- ch15 p79 originally ended with an etext editorial note `{another ed. has "No-no,"}`; it was dropped (not content) and a few words were added so the paragraph stays above 75% of source length.
- ch16 p66 and ch15 p120 had unbalanced quotation marks in the source; they are balanced in the rewrite.
- ch17 p49 had the typo "Carrrisford"; rewritten as "Carrisford".
- ch7 p146 had the typo "'and and foot"; rewritten as "hand an' foot" in Becky's dialect.
- Becky's and Ram Dass's dialect is kept on purpose (characterisation), so those paragraphs sit nearer the source than the narration.
- Chapter 8 (0.844) is the closest REAL chapter to the LIGHT line; it was left unchanged per the brief and could be a candidate if the integrator wants more margin.
- The em dash is U+2014 throughout (the original uses `--`), as in the current modern-en; convert in the integration step if strict parity is wanted.
