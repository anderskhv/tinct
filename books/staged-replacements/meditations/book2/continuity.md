# Continuity sheet — Meditations, Book II (candidate v1)

Written alongside drafting `candidate-v1.json` and describing what the frozen
draft actually did. Term renderings follow `../GLOSSARY.md`; this sheet records
only what is specific to Book II.

## Source

- `../meditations-original-en.staged.json`, chapter `number: 2`, title `Book 2`,
  17 paragraphs, one per numbered meditation (II.1–II.17). Extracted verbatim
  into `source-book2.json` (sha256 in `provenance.json`).
- George Long's 1862 translation, Project Gutenberg #15877 text. See
  `../PROVENANCE.md` for identification, rights and the mechanical
  normalisations applied to the whole staged file.
- Book II was read in full before any paragraph was drafted. It is the book
  Marcus headed "Written among the Quadi at the Granua" (Long prints that note
  at the end of Book I) and closes with "This in Carnuntum".

## Glossary terms met in Book II, and how they were rendered

| Long (Book II) | Candidate | Where |
|---|---|---|
| the ruling part | the ruling part | II.2 (twice) |
| the daemon within him / the daemon within a man | the god within him / the god within a man | II.13 (twice), II.17 |
| the Deity; portion of the divinity | the divine; portion of the divine | II.12, II.1 |
| the nature of the whole; the nature of the universe | the nature of the whole | II.3, II.9, II.11 |
| the whole universe; the universe | the whole universe; the universe | II.3, II.11, II.12, II.16 |
| according to nature; contrary to nature | according to nature; against nature | II.9, II.17; II.1 |
| providence | providence | II.3, II.11 |
| rational animals | rational beings | II.16 |
| unsocial; unsocial movements | unsocial; unsocial impulses | II.1, II.2 |
| movement (= impulse) | impulse | II.7, II.16; but "the movements of their own minds" kept in II.8 (mental motion, not *hormē*) |
| opinion; all is opinion | opinion; everything is opinion | II.15; "fixed opinions" II.3 |
| principles | principles | II.3 |
| intelligence; intellectual faculty | intelligence; intellectual faculty | II.1, II.12 |
| vexed | resent | II.1, II.16 |
| felicity | happiness | II.6 |
| kinsman; akin to me; kinship | kinsman; akin to me; kinship | II.1, II.13 |
| fame; after fame; vapory fame | fame; fame after death; empty fame | II.12, II.17 |
| the most ancient city and polity | the oldest city and commonwealth | II.16 |
| the elements; dissolution | the elements; dissolution | II.3, II.17 |
| philosophy | philosophy | II.17 |

## Paragraph-level decisions

- **II.1** — Long's bracketed supplements "[only]", "[the same]", "[the same]"
  folded into plain prose ("not only of the same blood or seed, but sharing the
  same intelligence and the same portion of the divine"); brackets not
  reproduced. "Co-operation" → "cooperation" (spelling only). The final clause
  keeps Long's order and logic: acting against one another is against nature,
  and resentment and turning away *are* acting against one another.
- **II.2** — "network, a contexture of nerves" → "a mesh, a weave of nerves":
  two images kept as two. "It is not allowed" kept verbatim (Long's terse
  rendering; nothing added to say what is not allowed). "Sent out and again
  sucked in" → "breathed out and sucked in again".
- **II.3** — "interweaving and involution" → "interweaving and entanglement"
  (two nouns kept). Long's "as by the changes of the elements so by the changes
  of things compounded of the elements" rendered "as much by … as by …", which
  is the sense of Long's correlative. "Die murmuring" → "die complaining".
- **II.4** — "administrator of the universe" kept as "administrator" (Long's
  word, still ordinary English); "efflux" → "flows from". Long's "it will go and
  thou wilt go, and it will never return" kept in that shape and rhythm.
- **II.5** — Long's list "perfect and simple dignity, and feeling of affection,
  and freedom, and justice" kept as a four-part list. "Passionate aversion from
  the commands of reason" → "passionate turning away from the commands of
  reason". "The which if a man lays hold of" → "which, if a man lays hold of
  them".
- **II.6** — Long marks "Every man's life is sufficient" as a corrupt passage
  (dagger in his edition, see `../PROVENANCE.md` §4). Kept as Long has it, not
  repaired from other translations. The doubled opening "Do wrong to thyself, do
  wrong to thyself, my soul" kept doubled. "Reverences not itself" → "does not
  reverence itself".
- **II.7** — Long's "triflers" kept. "Wearied themselves in life by their
  activity" → "worn themselves out in life with activity".
- **II.8** — Sentence reordered for modern English ("A man has seldom been seen
  to be unhappy because he failed to observe…"); the contrast and the
  "must of necessity" are unchanged.
- **II.9** — Marcus's shift from "thou" to "my nature" inside one sentence is
  kept ("what the nature of the whole is, and what my nature is"). "There is no
  one who hinders thee" kept as "there is no one who hinders you" (a statement
  of fact, not "can stop").
- **II.10** — "Womanish" kept (Long's rendering of Marcus's own word;
  softening it would be an imposition). "Unconscious contraction" →
  "involuntary contraction". "Blamable" → "blameworthy". "Intemperate" kept.
- **II.11** — Long's long negative sentence ("But neither through ignorance,
  nor—having the knowledge but not the power…") restructured with the same
  three branches: not overlooked through ignorance, not through knowing but
  lacking power, and no mistake through want of power or skill. "The nature of
  the universe" → "the nature of the whole" (glossary). "Devoid of gods or
  devoid of providence" → "empty of gods or empty of providence" (repetition
  kept).
- **II.12** — "Sensible things" (things perceived by the senses) → "the things
  the senses perceive": a modern reader would read "sensible" as "reasonable".
  "Noised abroad by vapory fame" → "trumpeted about by empty fame". "Abstractive
  power of reflection" → "separating power of reflection". Long's cross-reference
  "(vi. 28)" **dropped** (apparatus). The closing clause "and when this part of
  man is so disposed" (dagger-marked in Long) rendered "and how that part of him
  is disposed when it does"; the obscurity is Long's and the Greek's, and no
  interpretation was supplied.
- **II.13** — "Traverses everything in a round" → "goes the round of
  everything". "The things beneath the earth, as the poet says" kept without
  added quotation marks (Long prints none). "Seeks by conjecture" → "tries to
  guess". "Reverence of the daemon" → "reverence for the god within".
- **II.14** — Long's "three thousand years and as many times ten thousand
  years" means 3,000 × 10,000; rendered "three thousand years, or ten thousand
  times as many" (not "thirty thousand"). Long's "though that which perish is
  not the same" is obscure and dagger-marked; rendered "though what perishes is
  not the same" to preserve Long's distinction between what *perishes* and what
  is *lost*, without resolving it. "The longest liver and he who will die
  soonest" → "the longest-lived man and the one who will die soonest".
- **II.15** — Four-line meditation kept to four lines; nothing added about
  what Monimus said (Long does not say either).
- **II.16** — The five numbered ways the soul does violence to itself are kept
  as five, in order, with Long's repetition of "the soul does violence to
  itself" kept where Long repeats it and dropped where he drops it. "Separation
  of ourselves from nature" → "to separate yourself from nature" (Marcus's
  self-address; Long's "ourselves" is the only first-person plural in the
  section and the candidate follows the section's "you").
- **II.17** — Long's list of seven predicates kept as a list. "Subject to
  putrefaction" → "liable to rot"; "hard to divine" → "hard to foresee";
  "a warfare and a stranger's sojourn" → "a war and a stranger's stay"; "after
  fame is oblivion" → "fame after death is oblivion". "Conduct a man" → "guide a
  man". "From thence, wherever it is, from whence he himself came" → "from that
  same place, wherever it is, from which he himself came". Manuscript note
  "This in Carnuntum." → "Written at Carnuntum." as a separate final sentence,
  per the glossary rule.

## Nothing imported from other translations

No wording was taken from Hays, Hard, Hammond, Staniforth, Farquharson,
Haines, Rendall, Jackson, Collier or Casaubon. Where a familiar modern phrasing
exists for a Book II sentence (for example the openings of II.1, II.5 and
II.14), the candidate was built from Long's sentence, not from memory of the
familiar version.

## Unresolved source issues (Long's text)

- II.6 "Every man's life is sufficient" and II.12 "when this part of man is so
  disposed" and II.14 "though that which perish is not the same" are
  dagger-marked in Long (corrupt Greek). Kept as Long has them; reviewers
  should not expect the candidate to make them clearer than the source.
- II.14 PG reading "perish" vs Standard Ebooks "perishes" (see
  `../PROVENANCE.md` §3); the candidate's "what perishes" fits either.
- No truncated or fragmentary source paragraphs in Book II; every source
  paragraph ends in terminal punctuation.
