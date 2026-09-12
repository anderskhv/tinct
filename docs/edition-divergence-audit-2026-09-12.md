# Modern English editions: how many are actually modern?

Run `python3 tools/audit/edition_divergence.py 20` to reproduce.

## What was measured

For every book with both `original-en` and `modern-en`, compare the two
paragraph-for-paragraph. Count a paragraph as **verbatim** when the two
editions are identical once curly quotes and whitespace are normalised —
that is, when the modern edition changed nothing but typography.

Only paragraphs of 25 words or more are counted. Short ones carry no signal:
`"Yes."` and a speaker name are legitimately identical in any rendering, and
counting them makes verse and drama look far worse than they are. 100 of the
100 live books had enough substantial paragraphs to measure.

## Result

Nine books leave a fifth or more of their long paragraphs untouched:

| Book | Substantial paragraphs verbatim |
|---|---|
| confessions | 73.8% (336/455) |
| ulysses | 48.4% (1108/2289) |
| heart-of-darkness | 46.2% (78/169) |
| jungle-book | 42.8% (272/636) |
| vindication-rights-of-woman | 33.3% (240/721) |
| the-awakening | 31.9% (216/678) |
| jerusalem | 28.7% (307/1070) |
| walden | 25.2% (115/457) |
| brothers-karamazov | 22.1% (670/3030) |

The remaining 91 books sit below 20%, and 52 sit below 10% on the unfiltered
measure — those read as real editions.

Confessions is the clearest failure: three quarters of its long paragraphs are
the original text with the apostrophes swapped. Overall word count for the
Jungle Book's modern edition is 99.8% of the original (50,675 vs 50,774), which
is the shape of a find-and-replace pass, not a translation.

## What this does not say

A low verbatim rate is not proof of a good edition — it only proves the text
moved. And a high rate on a book whose original is already plain modern English
would be expected. None of the nine are in that category; all nine are pre-1930
prose with genuine period diction.

## Not acted on

Re-translating these is nine full book packages under the Meditations process.
That is a scope decision for Anders, not something to start unilaterally while
the Odyssey loop is running.
