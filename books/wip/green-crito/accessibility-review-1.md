# Accessibility Review — Crito (candidate.json)

**Reviewer:** Fresh-read accessibility pass (Reviewer A), per `books/prompts/accessibility-review-prompt.md`.
**Scope:** I read only `/home/user/tinct/books/wip/green-crito/candidate.json`. I did not read `source.json` or any drafter's notes.

**Coverage confirmed:** I read all 3 chapters in full, start to finish, then went back paragraph by paragraph:
- Chapter 1, "The Visit at Dawn" — all 25 paragraphs (indices 0–24).
- Chapter 2, "The Plea and the Argument" — all 61 paragraphs (indices 0–60).
- Chapter 3, "The Laws of Athens Speak" — all 9 paragraphs (indices 0–8).

Paragraph indices below are 0-based positions within each chapter's own `paragraphs` array, matching the order in the JSON.

---

## Chapter 1 — The Visit at Dawn

This chapter reads cleanly. The dawn-visit exchange is short, natural, conversational English with none of the stiffness that dialogue translations often carry — lines like "He knows me — I come often. And I've done him a small kindness" or "Dawn is just breaking" sound like real speech. Flagging only two things:

- **Paragraph 14** — *"What — has the ship come back from Delos? The one whose arrival means I must die?"* The second sentence patches over the gap reasonably well, but a general reader still has no idea what the Delos ship is or why a ship's return would trigger an execution (the Theseus/Minotaub mission and the religious truce suspending executions is real-world context nowhere else supplied). It's *workable* because the second half spells out the practical consequence, but a reader will wonder "why a ship, though?" and the text never answers it. Minor, not blocking.
- **Paragraph 22** — *"A woman appeared to me, beautiful and finely dressed, who called out: 'Socrates — on the third day from now you shall arrive in fertile Phthia.' (Homer, Iliad)"* Two separate issues: (1) the trailing `(Homer, Iliad)` reads like a dropped-in footnote/citation rather than something Socrates would say — it breaks his voice and the scene's realism, since no other line in the dialogue cites a source inline this way. (2) "fertile Phthia" is a reference (Achilles' homeland, quoted from the Iliad to mean "going home") that a general reader has zero context for — they can tell it's a place name but not why it signals death in three days. The next line ("What a strange dream, Socrates!") actually reinforces that the reader is *meant* to be as puzzled as Crito, so this may be partly by design — but the citation parenthetical itself is a clear accessibility/voice problem regardless of that.

**What works well:** the whole chapter, honestly — it's the most accessible stretch in the book. The rhythm of short question/short answer plus one or two longer reflective lines from Socrates ("When a man has reached my age, Crito, he should not complain at the approach of death") lands with real clarity and no syntactic friction.

---

## Chapter 2 — The Plea and the Argument

The short Socratic Q&A stretches (roughly paragraphs 8–38, e.g. "And the good opinions are those of the wise, while the bad opinions are those of the unwise?" / "Yes.") are excellent — clean, short, logically sequential, and the step-by-step "gymnastics trainer" analogy (paragraphs 13–23) is genuinely easy to follow, probably the clearest stretch of argument in the whole book.

Issues:

- **Paragraph 4** — *"...are you afraid that if you escape, we'll get in trouble with the informers for stealing you out..."* "Informers" is used with no framing. A reader can guess roughly what it means from context (people who'd report the escape to the authorities), but it's doing real work without support — a half-clause of context would remove all doubt.
- **Paragraph 6** (Crito's big persuasion speech) — this is the densest single paragraph in the chapter: a long, unbroken run stacking money, reputation, the children's future, and moral shaming into one continuous block. Individually each sentence is readable, but a reader has to hold many separate arguments in sequence with no paragraph breaks to signal the shift between them — it reads as "stitched-together" persuasion rather than one flowing thought, more a function of density than of any single hard sentence. Within it: *"Simmias of Thebes has actually brought a large sum for this very purpose. Cebes and many others are ready to spend their money to help you escape."* — both names are dropped in with zero framing (who are Simmias and Cebes to Socrates?). Not essential to follow the escape plan, but a small hitch.
- **Paragraph 7** (Socrates' reply) — *"Now Crito, you are not going to die tomorrow — at least, not by any human probability. So you are disinterested, not biased by your circumstances."* "Disinterested" is a classic false-friend word for modern readers, who very commonly read it as "uninterested" (bored/indifferent) rather than its intended sense here ("not personally invested in the outcome, hence unbiased"). The next clause ("not biased by your circumstances") does gloss it, so a careful reader recovers — but it's exactly the kind of word this review is meant to flag, since a skimming reader will take the wrong meaning and never notice the correction.
- **Paragraph 39** — *"...those are just the doctrines of the crowd, who would be as quick to bring people back from the dead, if they could, as they are to put them to death — and with as little reason."* Grammatically fine but has to be read twice: the "as quick to X... as they are to Y" comparison is inverted in a way that takes a beat to parse, especially stacked after two em-dash clauses already in the same sentence.

**What works well:** the trainer/expert analogy, the injury/injustice exchanges (paragraphs 43–56), and Crito's honest "I cannot tell, Socrates — I do not know" closing line, which lands with real weight and zero friction.

---

## Chapter 3 — The Laws of Athens Speak

This is the hardest chapter, structurally: it's built from a handful of very long single speeches (the personified Laws), so the accessibility problems here are less about individual word choices and more about sentence and paragraph load.

- **Paragraph 2** — contains nested quotation-within-narration-within-dialogue: *"'And was that our agreement with you?' the Laws would answer. 'Or were you to abide by the verdict of the state?' If I expressed surprise at this, the Laws would probably add: 'Answer, Socrates — instead of staring...'"* Tracking who is "speaking" at each moment (Socrates narrating hypothetically vs. the Laws' quoted words vs. Socrates' own imagined reply) requires real attention. It's not incorrect, but a reader can lose the thread of whether a given sentence is inside or outside the Laws' quoted speech.
- **Paragraph 4** — *"...except once to the Isthmus games..."* — a specific historical reference (the Isthmian Games) with no gloss. The sentence still functions without it ("you left the city only once, for [some event]"), so it's not blocking, but it's a genuine unexplained proper-noun drop.
- **Paragraph 6** — by far the longest and densest paragraph in the book (the Laws' final, sweeping speech). Most of it holds together sentence-by-sentence, but one sentence is a clear case of "grammatically legal but overloaded": *"But if you go forth — returning evil for evil, injury for injury, breaking the covenants and agreements you made with us, wronging those you ought least of all to wrong, namely yourself, your friends, your country, and us — we shall be angry with you while you live."* The subject and main verb ("we shall be angry") are held off across four stacked parenthetical phrases; a reader has to carry all four in memory before the sentence resolves. This is the single clearest example in the whole book of a sentence that's technically correct but asks more of working memory than it needs to.
- Also in paragraph 6, the closing simile — *"like the sound of the flute in the ears of a mystic"* — is vivid but rests on a specific ancient religious-ritual image (Corybantic/mystic rites) that a general reader won't recognize by name. It still communicates the gist (a sound that drowns out everything else) well enough to not be a real blocker.

**What works well:** paragraph 0, which sets up the entire device in plain, natural language — *"Then consider it this way. Imagine I am about to slip out — call it whatever you like — and the Laws and the government come and question me."* — is an excellent, unforced way to introduce a personified abstraction to a modern reader. The three-part "disobedient in three ways" breakdown in paragraph 4 (parents / education / broken agreement) is also cleanly numbered and easy to follow despite sitting inside a long paragraph.

---

## Overall Verdict: **needs targeted fixes**

The dialogue's core argument — Crito's escape plan and Socrates' step-by-step case for why he must submit to the verdict — comes through clearly, and Socrates' calm, methodical, faintly ironic voice survives throughout; the short Q&A stretches in Chapter 2 are genuinely excellent modern prose. The chapter that will most tax a general reader is Chapter 3, where the Laws' speeches are long, single, unbroken paragraphs (an unavoidable structural feature of the source dialogue) and one sentence in particular (paragraph 6) suspends its main clause across four stacked phrases in a way that asks a lot of working memory. Beyond that, the fixes are small and localized rather than systemic: a handful of unglossed proper nouns and references (the Delos ship's significance, "fertile Phthia," Simmias/Cebes, the Isthmus games) that a reader can work around but shouldn't have to, one false-friend vocabulary risk ("disinterested"), one jarring inline citation that breaks Socrates' voice (the "(Homer, Iliad)" parenthetical in Chapter 1), and one instance of nested quotation (Chapter 3, paragraph 2) that risks losing the reader on who's speaking. None of these block comprehension of the escape plan or the Laws argument, but each is a concrete, fixable friction point rather than a matter of taste.
