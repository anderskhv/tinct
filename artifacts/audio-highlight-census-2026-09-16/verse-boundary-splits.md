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
