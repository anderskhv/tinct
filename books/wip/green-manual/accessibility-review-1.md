# Accessibility Review — "The Manual" (Epictetus, *Enchiridion*), modern-en candidate

**Reviewer role:** Fresh reader, blind to source text and drafter's notes, per `books/prompts/accessibility-review-prompt.md`.

**Coverage confirmed:** I read all 52 sections in `candidate.json` in full, start to finish (Sections 1–52, every paragraph in every section, including the 2-paragraph Section 1, the 11-paragraph Section 33, and the 4-paragraph Section 52), then went back through section by section for this review. I did not read `source.json`, `BRANCH-README.md`, or any other file.

---

## Issues found (exact wording, why it's hard, location)

**Section 11, paragraph 0:**
> "What does it matter to you who the giver used to reclaim it?"

Syntactically overloaded for its length — "who the giver used to reclaim it" asks the reader to parse "used [as an instrument] to reclaim it," which reads on first pass like "who the giver used to [habitually] reclaim it" or "who used to be the giver that reclaimed it." Likely a stumble/re-read point even though the surrounding passage (property being "returned," not "lost") is otherwise very clear.

**Section 15, paragraph 0:**
> "This is how Diogenes and Heraclitus and those like them deserved to be called divine, and were."

Two proper names dropped in with no gloss. Not fatal — the sentence's point (these people are held up as exemplary) comes through regardless of who they are — but a general reader has no way to place either name, and the passage doesn't need the reader to know them, so a one-clause gloss (e.g., "philosophers like Diogenes and Heraclitus") would remove the doubt entirely.

**Section 29, paragraph 0:**
> "Some people see a philosopher and hear someone speak as Euphrates does—and who can speak like him?—and want to become philosophers themselves."

"Euphrates" (a real Stoic teacher, contemporary of Epictetus) is unglossed and, unlike most other names in this text, isn't given any identifying context ("as Euphrates does" tells the reader nothing about who that is). A general reader will likely just skip past it without being sure whether it's a person, a place, or something else — worth at least "a teacher like Euphrates" or similar.

**Section 31, paragraph 0:**
> "The belief that royal power was good made Polynices and Eteocles enemies."

Unglossed mythological reference (the warring sons of Oedipus) dropped into an otherwise abstract theological argument. The reader can follow the surrounding logic without knowing who they are, but the sentence itself will read as a non sequitur — two unexplained names doing an unexplained thing — and briefly stalls the argument's momentum.

**Section 36, paragraph 0:**
> "In logic, \"It is day or it is night\" works as an either-or statement, but not as a both-and statement. In the same way, taking the larger share at a dinner serves your body well but does nothing to preserve good relations with others."

The logical example is glossed well on its own terms ("either-or" / "both-and" are clear), but the leap from a logic lesson to table manners is not bridged — nothing in the sentence explains *how* the two are "the same way." A reader will likely have to stop and reverse-engineer the analogy (the point being: something can satisfy one aim while failing another). This is baked into the aphorism's original terseness, but as prose it's a place a general reader will double back.

**Section 42, paragraph 0:**
> "If someone thinks a true combined statement—claims joined by \"and\"—is false, the statement is not harmed; the person mistaken about it is."

Same pattern as Section 36: the logic-puzzle aside is individually clear (the "claims joined by 'and'" gloss does real work), but its connection to the main point — that someone who wrongs you is the one who's actually harmed by their own bad judgment — requires the reader to hold both halves in mind and infer the parallel themselves. A short bridging clause would help.

**Section 47, paragraph 0:**
> "Do not embrace statues."

This is the single hardest stumble in the whole text. It arrives with zero context — no explanation that this refers to an ascetic hardship-training practice (deliberately embracing cold marble/stone statues, alongside spitting out water when thirsty, as a discipline exercise). A general contemporary reader will simply be baffled by the sentence; nothing before or after it supplies the missing frame. This is the clearest case in the whole review of a line that needs either a light gloss or slightly fuller phrasing (e.g., "don't take up cold, hard exercises just to prove your toughness" — or whatever best preserves the original point) rather than the bare instruction.

**Section 52, paragraph 3:**
> "Crito, if this pleases the gods, let it be. Anytus and Melitus can indeed kill me, but they cannot harm me."

The three names (Crito, Anytus, Melytus/Melitus) are unglossed, and — more importantly — the speaker is never identified. A reader who doesn't already know this is Socrates (addressing his friend Crito, naming his prosecutors) will read this as an unattributed quotation with no anchor. The core meaning ("they can kill me but not harm me") still lands because it echoes the book's central thesis, but the reader is missing who is speaking and why, which a first-time reader of this closing section would reasonably want.

---

## Where the prose works well

- **Section 1** does real accessibility work up front: "An impression is how something first appears to you" is a clean, unforced definition that pays off for the rest of the book — every later use of "impression" (Sections 10, 16, 18, 19, 20, 48) reads clearly because this section banked the term early. This is the single most important accessibility choice in the text, and it succeeds.
- **"Ruling mind"** (glossed in Section 29 as "the part that judges and chooses," reused plainly in Sections 30, 38, 48) is another well-handled recurring term — defined once, then trusted.
- **Section 7** (the ship-and-shellfish passage) and **Section 43** (the "two handles") are the strongest passages in the book: concrete, vivid, and the metaphor is left to do its own work without over-explaining. These read as genuine literary prose, not paraphrase.
- **Section 25** (the lettuce/obolus passage) is a good model for handling an ancient reference: it names the coin, then immediately glosses it ("An obolus—a small coin—perhaps") without breaking stride, and the analogy is fully worked through rather than dropped.
- **Section 22** and **Section 46** (the philosopher-as-performance sections) have real comic and rhetorical energy — natural dialogue, well-placed short sentences, no sense of mechanical translation.
- **Section 24**, despite being the longest section by far, stays legible throughout via its back-and-forth question/answer structure ("What do you mean by 'without help'?"); the length doesn't produce fatigue because each exchange is short and self-contained.
- **Section 5** ("People are not disturbed by events but by their opinions about events...") is the book's thesis statement and lands with real force — plain, declarative, unpadded.
- Throughout, sentence rhythm varies naturally and avoids the choppy, mechanically-chopped feel that can afflict literal renderings of aphoristic source material; even Section 33's long list of discrete rules reads as a natural list (appropriate to its content) rather than as fragmented prose.

---

## Verdict

**Needs targeted fixes.**

The text is, on the whole, genuinely accessible: the core Stoic vocabulary ("within our control," "impression," "will," "ruling mind") is introduced plainly and reused consistently, the voice is natural and literary rather than academic, and several passages (Sections 1, 5, 7, 22, 24, 25, 43, 46) are strong, confident prose that a first-time adult reader will follow without friction. The issues found are narrow and countable rather than pervasive: a handful of unglossed proper names from Greek myth/history (Polynices and Eteocles, Euphrates, the unattributed Crito/Anytus/Melitus quotation) that stall a sentence without derailing the surrounding argument; two places (Sections 36 and 42) where a terse logical aside isn't bridged back to its ethical point; one syntactically tangled sentence (Section 11); and one genuine, isolated confusion point with no supporting context at all (Section 47's "Do not embrace statues," which will read as a non sequitur to any reader unfamiliar with ancient ascetic practice). None of these require a structural rewrite — they're the kind of fix that can be made sentence-by-sentence without touching paragraph alignment or the book's overall voice.
