# Accessibility Review — "Apology" (modern-en candidate)
**Reviewer A — fresh read, blind to source text**
**Date:** 2026-09-21

## Coverage

I read the entire candidate file start to finish: all 3 chapters, all
paragraphs, in full (no sampling). Paragraph indices below are 0-based
positions within each chapter's `paragraphs` array, matching the order in
`candidate.json`.

- **Chapter 1, "The Defense"** — paragraphs 0–76 (77 paragraphs), full read.
- **Chapter 2, "The Penalty"** — paragraphs 0–5 (6 paragraphs), full read.
- **Chapter 3, "Final Words"** — paragraphs 0–8 (9 paragraphs), full read.

I then went back through each chapter a second time, paragraph by paragraph,
for the issues below.

---

## Chapter 1 — "The Defense"

### Issues

**Paragraph 8** — *"'Evenus of Paros,' he replied. 'Five minae.'"*
"Minae" (plural of mina) is dropped in with zero gloss — a reader who
doesn't already know ancient Greek currency has no way to judge whether
this is a lot or a little, beyond Socrates' own aside that it's "a
reasonable price." This recurs through the book (see Ch. 1 ¶58's
"drachma," Ch. 2 ¶0's "thousand drachmas," and Ch. 2 ¶3–5's "one mina" /
"thirty minas") — currency units are consistently used as bare technical
terms with no anchoring, so a reader can never actually feel the
stakes of a given sum.

**Paragraph 9** — *"He shared your exile and returned with you."*
This refers to the democratic exiles under the Thirty Tyrants (a period
that only gets named and explained much later, in Ch. 1 ¶69–70). At this
point in the text a reader has no idea what exile is being referenced —
it reads as a dangling historical allusion. Since the Thirty Tyrants
material is explained later, a light contextual touch here (or a
forward-pointing phrase) would prevent the reader from just shrugging
past a reference they can't place.

**Paragraph 12** — *"the poets — writers of tragedies, dithyrambs, and
other works."*
"Dithyrambs" is a genuinely obscure genre term (choral hymns to
Dionysus) with no support in the sentence. A general reader will not
know what it means and nothing nearby tells them; it will register as
a word to skip over rather than understand.

**Paragraph 51 (the "son of Thetis" passage, quoting the Achilles
story)** — *"above all the son of Thetis, who despised danger
altogether... When he was eager to slay Hector, his goddess mother said
to him..."*
The passage refers to Achilles only by periphrasis ("the son of
Thetis") for two full sentences before the name "Achilles" finally
appears ("Did Achilles give any thought to death and danger?"). A
reader who doesn't already know Thetis is Achilles' mother has to hold
an unresolved identity for a stretch of text, then retroactively
resolve it. This is an easy fix — using "Achilles" on first mention
loses nothing and removes a needless decoding step.

Also in the same passage, the quoted Homeric lines keep archaic
diction that wasn't modernized along with the rest: *"Let me die
forthwith, and be avenged on my enemy, rather than remain here by the
beaked ships, a laughing-stock and a burden on the earth."* "Forthwith,"
"beaked ships," and "a burden on the earth" are all noticeably more
archaic in register than the surrounding prose. Per the review brief,
being presented as a quotation doesn't exempt this — a reader hits an
abrupt register shift right in the middle of Socrates' own argument.

**Paragraph 52** — *"It would be strange indeed, men of Athens, if I —
who stood my ground at Potidaea, Amphipolis, and Delium when my
generals placed me there, facing death like any other soldier — were
now to desert my post out of fear of death, when God himself has
stationed me to live as a philosopher, examining myself and others."*
Grammatically legal but overloaded: an interrupting appositive clause
("who stood my ground...") is nested inside the main "if...were now to
desert" construction, which is itself followed by a second dependent
clause ("when God himself has stationed me..."). A reader has to hold
the main clause open across two separate insertions before it resolves.
Worth breaking into two sentences.

**Paragraph 53** — *"So if you let me go now, not persuaded by Anytus —
who said that since I had been prosecuted I must be put to death, or
else I ought never to have been prosecuted at all, and that if I
escape now your sons will all be ruined by listening to my words — if
instead you said to me: 'Socrates, this time we will not heed Anytus,
and you shall be released, but on one condition...' — if this were the
condition on which you released me, I would reply..."*
This is the most overloaded sentence in the chapter — three "if"
clauses stacked with a long embedded quotation-within-a-quotation in
the middle. By the time the reader reaches "if this were the condition,"
they've lost track of which "if" is being resolved. This is a strong
candidate for splitting into separate sentences (state Anytus's
position as its own sentence, then pose the hypothetical release
condition, then Socrates' reply).

### What works well

- The cross-examination of Meletus (¶19–59) is genuinely excellent —
  short, natural courtroom exchanges that read like real spoken
  argument, not translated philosophy. The comic escalation ("Well,
  that's wonderful news! Plenty of improvers!") lands Socrates' irony
  cleanly without any explanatory scaffolding needed.
- The horse-trainer analogy (¶37) and the gadfly extended metaphor
  (¶66) are both rendered with real narrative clarity — a reader can
  follow the logic of each analogy without any background knowledge.
- The oracle/Chaerephon story (¶9–15) builds naturally and keeps
  Socrates' characteristic self-deprecating irony intact ("I know I
  have no wisdom, great or small").
- Aristophanes' "Clouds" caricature is handled well (¶5) — instead of
  assuming the reader knows the play, it's described directly enough
  ("walking on air and spouting nonsense") that no outside knowledge
  is needed.

---

## Chapter 2 — "The Penalty"

### Issues

**Paragraphs 1–2** — *"Nothing would be more fitting than free meals at
the Prytaneum..."* / *"If I'm to suggest a fair penalty, I'd say free
meals at the Prytaneum is the right answer."*
"Prytaneum" is never explained — the reader gets no sense of what
kind of institution this is (a civic dining hall for state-honored
citizens) beyond the fact that it's some kind of reward. The Olympic
chariot-winner comparison nearby helps establish that it's an honor,
but the term itself stays opaque on both appearances.

**Paragraphs 3 and 4 — duplicated content.** This is the most serious
issue in the whole book. Paragraph 3 ends with Socrates proposing "let
that be my penalty... let thirty minas be the fine — they're good for
it," fully resolving the mina/thirty-minas beat. Paragraph 4 then
opens with "No, let me reconsider" and re-runs almost the identical
argument beat for beat:

- ¶3: *"Someone would say: 'Can't you just stop talking, Socrates, and
  live quietly in exile?'... Well — perhaps I could manage one mina,
  so let that be my penalty. But wait — Plato, Crito, Critobulus, and
  Apollodorus are telling me to say thirty minas, and they'll
  guarantee it. So let thirty minas be the fine — they're good for
  it."*
- ¶4: *"No, let me reconsider. Someone would say: 'Can't you just keep
  quiet and go somewhere else?'... Perhaps I could scrape together one
  mina. But Plato, Crito, Critobulus, and Apollodorus are urging me to
  say thirty minas — they'll be my guarantors. Let thirty minas be the
  penalty; they're reliable sureties."*

Read as ordinary prose, with no knowledge of any source text, this
reads as an editing artifact — two takes of the same passage left in
back to back, not a deliberate rhetorical restart. It stops the reader
cold: the argument has already concluded once, and then restarts with
"No, let me reconsider" as if nothing had been settled, only to reach
the exact same number. Whatever the cause, this needs to be resolved
into a single passage before the chapter can be called accessible —
it's not a wording problem, it's a structural one that breaks the
chapter's flow at its climax (the actual counter-penalty proposal).

### What works well

- The opening paragraph's arithmetic ("If just thirty votes had gone
  the other way, I would have been acquitted... he wouldn't have
  received a fifth of the votes") is concrete and easy to follow.
- Socrates' refusal to propose exile or silence (¶3, before the
  duplication) — "the unexamined life is not worth living" — lands
  clearly and is probably the single most recognizable line in the
  book; it's rendered plainly and doesn't get overworked.

---

## Chapter 3 — "Final Words"

### Issues

**Paragraph 4** — *"finding the true judges — Minos, Rhadamanthus,
Aeacus, Triptolemus, and every other righteous soul"*
A run of four unglossed mythological names in a row. "The true judges"
gives the reader a functional role, which softens this, but the pileup
of names with no support (compare to "Orpheus, Musaeus, Hesiod, and
Homer" in the next paragraph, which is at least framed as "talk with
[poets]") makes this list land as a wall of proper nouns to skim past
rather than absorb.

**Paragraph 0** — *"they'll call me wise to spite you, even if I'm
not"* is a slightly compressed idea (the "spite" is aimed at the
Athenians, via praising Socrates, which takes a beat to parse) but is
minor and doesn't significantly slow the read.

### What works well

- This is the strongest chapter in the book for natural flow. The
  runners metaphor — *"I am old and slow, and the slower runner —
  death — has caught me. My accusers are young and fast, and the
  faster runner — wickedness — has caught them"* — is clean, memorable,
  and fully accessible without any background knowledge.
- The prophecy to the jurors (¶2) and the meditation on death as
  either dreamless sleep or an afterlife of conversation (¶4–5) both
  read as genuine, unforced literary prose — long sentences that stay
  easy to follow because each clause adds one idea at a time rather
  than nesting.
- Socrates' calm, faintly needling tone ("So be of good cheer about
  death, my judges") survives intact through the whole chapter — this
  is the clearest case in the book of voice and accessibility working
  together rather than trading off.

---

## Overall Verdict: **Needs targeted fixes**

The book is not in "substantially accessible" territory only because
of one structural defect (the duplicated Chapter 2 penalty-proposal
passage, ¶3–4) and a small, consistent set of unglossed technical terms
(mina/drachma, Prytaneum, dithyrambs) and two genuinely overloaded
sentences in Chapter 1 (¶52, ¶53). None of this requires a broader
rewrite pass — the prose itself, sentence by sentence, is already
doing the hard work of making 2,400-year-old courtroom rhetoric read
as natural literary English, and Socrates' voice (the irony in the
Meletus cross-examination, the calm defiance of the final chapter) is
fully intact throughout. Chapter 1 is the strongest sustained piece of
writing in the book once its two overloaded sentences are split, and
Chapter 3 needs almost no intervention at all. Chapter 2 is short but
currently unpublishable as-is because of the duplicated passage, which
reads as an unresolved draft artifact sitting at the emotional center
of the chapter (Socrates' actual counter-penalty) — that one fix,
plus the vocabulary glosses and the two sentence splits in Chapter 1,
would bring the whole book to "substantially accessible."
