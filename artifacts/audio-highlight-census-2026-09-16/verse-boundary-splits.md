# The verse barrier is token boundaries, and it needs a decision

**2026-09-16.** This corrects a claim I made yesterday: that the markup fix
reopened the verse-drama corpus. It did not. Eight fresh Priority-1 verse
chapters went **0 for 8** after the fix.

## What actually blocks verse

Those eight chapters failed on 14 paragraphs between them, five of them on a
single paragraph at whole-chapter ratios of 0.97–0.99. Classifying each by
whether the two sides contain the *same characters* in a different whitespace
split:

```
10  identical characters, different token split
 4  genuinely different words
```

The splits, verbatim from the diagnostics:

| edition token | Whisper heard |
|---|---|
| `Re-enter Biondello.` | `Re -enter Biondello.` |
| `befall'n?` | `befall 'n?` |
| `o'erlook` | `o 'erlook` |
| `Here's packing` | `Here 's packing` |

`Re-enter X.` alone accounts for six of the ten. Elizabethan verse is dense
with elided apostrophes and hyphenated stage directions, which is exactly where
Whisper's tokenizer disagrees with whitespace tokenization. The audio is right.
The words are right. Only the spaces differ.

The other four are real and must keep failing — `heaven` heard as `Juliet`,
`and` as `in`, `Is't so` as `Is so`, `Hear'st` as `Here'st`.

## What handling the split class would be worth

Applying it to the same eight chapters, chapter by chapter:

| chapter | failing paragraphs | outcome |
|---|---|---|
| `hamlet` ch14 | 1 split | would pass |
| `much-ado-about-nothing` ch10 | 1 split | would pass |
| `richard-iii` ch13 | 1 split | would pass |
| `taming-of-the-shrew` ch11 | 5 splits | would pass |
| `romeo-and-juliet` ch3 | 1 real | still fails |
| `romeo-and-juliet` ch14 | 1 real | still fails |
| `taming-of-the-shrew` ch9 | 1 real | still fails |
| `taming-of-the-shrew` ch6 | 2 splits, 1 real | still fails |

**4 of 8** — roughly the 50% that prose already achieves.

## The proposed rule, and why I have not shipped it

Merge a heard token into its predecessor only when the concatenation exactly
reconstructs the expected token the text supplies. `befall` + `'n` merges
because the edition says `befall'n`; the merged span takes the first token's
start and the last token's end, which is the correct timing for the word.

The safety property is that the merge is driven by the expected text, so it
cannot invent agreement: if Whisper had heard `befall` + `en`, nothing
reconstructs `befall'n` and the paragraph still fails. The four genuine
differences above stay failures under the rule.

I am not shipping it on my own judgment. The underscore fix was unambiguous — a
comparison of markup against speech, with a control case proving real
mishearings still failed. This one is a quality-bar question: it changes how
many tokens the matcher is willing to consider equal, and I have already made
one gate-adjacent change this session. A rule that merges tokens is the same
shape as a rule that manufactures matches, and the difference between them is a
judgment about the bar, not a bug report.

Anders decides. Until then the split class stands as a known, quantified
failure mode, and the queues avoid verse rather than re-running it.

## The claim this retracts

I said the fix made "808 verse chapters worth running." Both halves were wrong.
The 808 came from a census four days and ~1700 publishes stale (the real
Priority-1 verse backlog is far smaller), and the pass rate on fresh verse is
0 of 8, not the ~50% I implied. What survives is the narrower measured result:
the markup fix took batch E to 12 of 13 with 11 publishes, all verified.

## Update: this is not a verse problem

Batch G is prose and Greek translation — no Shakespeare — and its first four
chapters fail the same way. Of its first ten failing paragraphs, **five are
boundary splits and five are genuine differences**, the same roughly even
division seen in verse.

The splits here come from a third source I had not isolated: the double hyphen
used as an em dash, which Gutenberg writes closed up.

| edition token | Whisper heard |
|---|---|
| `now--'tis no long toil--and` | `now 'tis no long toil and` |
| `Kithaeron. . . .` | `Kithaeron.` |
| `"I dislike him."--Why?--"I am not a match for` | (split at each `--`) |

So the decision in this file is wider than I first described. It is not "should
verse be reachable"; it is that **about half of every remaining gate failure,
across genres, is a whitespace disagreement rather than a misreading.** The
proposed rule and its safety property are unchanged — a merge must exactly
reconstruct a token the edition text supplies — but the payoff is
correspondingly larger and so is the risk surface. Still Anders's call.

## Correction: count chapters, not paragraphs

I said the split class was worth "about half of every remaining gate failure."
That used paragraph counts, and paragraphs are the wrong unit — one bad
paragraph fails a whole chapter, so what matters is how many *chapters* flip.

Batch G's nine analysed exclusions, prose and Greek translation:

```
failing paragraphs   7 splits / 11 genuine   (39% splits)
failing chapters     2 of 9 would pass       (22%)
```

The gap is the point. `bacchae` ch11 has four splits in it and still fails,
because it also has three genuine mishearings. Fixing splits only helps a
chapter where splits are its *only* problem.

Combined with the verse sample:

```
verse    4 of 8 chapters would flip   (50%)
prose    2 of 9 chapters would flip   (22%)
────
total    6 of 17                      (35%)
```

So the honest value of the proposed rule is about a third of currently failing
chapters, concentrated in verse, not the half I implied. That is still worth
having — it would have completed two more editions in this batch alone
(`frankenstein`, `jekyll-and-hyde`, each needing exactly one chapter) — but it
is not the unlock I made it sound like.
