# Punctuation — the classes, collated across the twelve books

Written at the cross-book pass, 2026-09-12, after Book XII was accepted.

Every book decided its own pointing and recorded it in its own `continuity.md`.
Eleven sheets, eleven tallies, and **no place where the classes could be compared
with one another** — which is how Book XII came to capitalise after a question
mark that Book XII itself keeps lowercase eight sections earlier (round-1 finding
36.1), and how two of Long's commas before an em dash came to survive in Book VII
when the other thirty-eight in the work had gone. This file is the missing place.
It is a record of decisions already taken, not a new rule: where a class is
settled, the ruling and the book that made it are named.

The whole-work table it describes is derived, not transcribed:
`scripts/punctuation_classes.py` aligns each of the 487 candidate paragraphs with
its source word by word and reports every difference in the mark that follows an
aligned pair. **Its limit is stated here rather than left to be discovered:** a
mark inside a span whose wording changed cannot be aligned and is not in the
table — those changes are the ones each book's sheet records at its paragraph —
and a mark that Long prints mid-token (his `,—` before an em dash, for instance)
is counted by the separate assertion named under that class.

## The classes

### 1. Long's comma before an em dash — removed. **Settled; now uniform.**

Long prints `,—` forty times in the work. **All forty are now `—`.** The
practice was set in Book II and followed by every book that met one (II ×3,
III ×4, V ×4, VI ×3, VIII ×12, IX ×2, XI ×6, XII ×2). Books I, IV and X meet
none. **Two were left standing in Book VII** (VII.49 "Consider the past,—such
great changes", VII.55 "the persuasions of the body,—for it is the peculiar
office") and are removed in the cross-book v3 pass, class **G**. They were
oversights, not decisions: Book VII's sheet records no reason, and the same
paragraph type is repunctuated everywhere else.

### 2. Long's lowercase after his own question mark — kept. **Settled; now uniform.**

Long writes "? for that which is conformable…", "? and why do I care…". He does
this **36 times** in the work, and **all 36 now stand**. The ruling is Book IX's
finding 7.1 — *Long's uneven punctuation is not normalised for evenness alone* —
applied to this class at Book XII acceptance (finding 36.1), which restored his
lowercase twice at XII.36. Eleven more had been capitalised in Books IV–VII
(IV.20, V.5, V.11, V.23, V.28, VI.10 ×2, VI.44, VI.55, VII.18, VII.58) and are
restored in the v3 pass, class **E**. Twenty-five already stood (III.4, VIII.17
×2, VIII.20, VIII.36, VIII.37 ×2, VIII.45, VIII.53, IX.29, IX.40, IX.42 ×2, X.1
×2, X.24 ×5, X.30, XII.15, XII.33). `scripts/punctuation_classes.py` asserts the
count in Long and in the work are the same number, so this class cannot drift
again without failing a check.

### 3. A comma between a long subject and its verb — removed. **Settled.**

Long often points a long subject off from its verb ("he who would not have the bad
man do wrong**,** is like…"). The modern edition removes it. Decided at Book X
(X.6, X.20, X.33 ×2) and followed at XI.10, XI.21 ×2 (the second at Book XI
acceptance, finding 21.1, which ruled that two identical constructions in one
paragraph must be decided alike) and at XII.2 and XII.16. **Nine removals, none
retained** — except inside a dagger clause, class 7 below. Book XII's finding
15.1 is this class applied to an *added* comma: a comma the draft had put between
a compound subject and its verb was removed, because the book removes that comma
elsewhere.

### 4. Commas added — only where a fold or a real ambiguity needs one. **Settled
as a standard; the practice is uneven in a way this file records rather than
mends.**

The rule every sheet states is that a comma is added only where a folded bracket
needs it (XI.20's apposition, XII.16's "[say]", XII.36's "[the world]") or where
Long's unpunctuated words are genuinely ambiguous (XII.15's long relative, XII.30's
elliptical second subject). Books IX–XII add commas in single figures and list
every one.

**But the derived table shows 147 added commas in the work, 127 of them in Books
IV–VIII**, and they are overwhelmingly one thing: commas round Long's
postpositive connectives, above all "then" ("Why, then, do you too choose…" for
his "Why then dost thou too choose…"). Books IV–VIII point it that way as a
habit; Books IX–XII follow Long. **Disposition: recorded, not normalised.** Three
reasons. Each comma was a local pointing decision made by a drafter reading that
sentence, and no reader is misled either way. Normalising in either direction
would change something over a hundred marks across five books, which is exactly
the cost the Book XII reviewer's caution is about — eleven closed acceptances are
the asset. And unlike classes 1 and 2, the mark in question is **not Long's**: it
is the edition's own pointing of its own sentence, where the work of the class is
already done by the reader's ear. A later editor who wants uniformity has the
table to work from; this pass does not think the trade is worth making.

### 5. Marks supplied where dropped apparatus carried them. **Settled.**

Long's cross-references and verse citations are dropped as apparatus, and some of
them carry the sentence's own terminal mark ("(v. 11)?"). The mark is supplied
where the sentence now ends: 66 full stops and 5 question marks across the work.
This is bookkeeping, not pointing, and every book records its own count.

### 6. A comma raised to a colon or a semicolon. **Local; nine and three.**

Where Long splices two independent clauses with a comma (X.7, "the particular
quality of change; this is nothing in fact") or where a list needs a stronger
break, the comma is raised. Nine colons and three semicolons in the whole work,
each recorded at its paragraph. Book IX's finding 1.2 is the governing ruling:
the mark is raised where two independent clauses are spliced, and **not** to make
Long's pointing even.

### 7. Punctuation inside a dagger clause — untouched. **Settled, and absolute.**

Where Long prints a dagger for corrupt Greek, his clause stands as he has it,
his commas included, even where the comma is one the edition removes elsewhere:
X.25 ("who is grieved or angry or afraid, is discontented"), XI.15, XI.17,
XII.16. Ruled at Book X (X.25) and confirmed at every book since. The class
matters because the alternative — tidying a sentence whose text is in doubt —
would make the candidate read as if it understood a passage nobody understands.

### 8. Long's ellipses at his lacunae — kept. **Settled.**

Five in the work (I.17, IV.19, V.29, VII.58, XI.18), every one where Long's Greek
breaks off. They are kept, on the same ground as XII.17's broken clause: a defect
the reader is entitled to meet is neither mended nor hidden. **D14** governs the
typography: the build closes up the space before them, and any rebuild or
reconstruction preserves that.

### 9. Spaced em dashes inherited from a verse join — recorded, not authored.

VII.31, X.34 and XI.6 carry a spaced em dash that comes from the staged original's
join of an indented verse line, not from the drafter. Recorded at Book X (finding
34.1) and Book XI; VII.31's is recorded here, which is the first time.

### 10. PG's own stray marks — dropped, and each one named.

A compositor's comma between a verb and its object or adverb is not Long's
pointing: V.1 ("that which, is"), VI.16, VII.54 ("to behave, justly"), VIII.6
("to take, them away hence"). Each is dropped and each is recorded as a base-text
point in its book's sheet, with Standard Ebooks' reading noted. This is the same
discipline as a departure from PG's letters, at a lower threshold, because a
stray comma names nothing.

## What this file changes

Nothing in the text by itself. Classes **E** and **G** of the v3 pass were found
by writing it — eleven capitalisations and two commas — and are applied there.
Everything else above is a description of what the twelve books already do, in
one place, so that the thirteenth reader does not have to hold eleven sheets in
mind at once.
