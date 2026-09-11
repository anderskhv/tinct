# frederick-douglass — Narrative of the Life of Frederick Douglass, Frederick Douglass

**Scope:** public. Audited 2026-09-11. Batch B20.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `64bc808575f55364` | 12 | 162 | 36,168 | "Douglass (1845)", year `1845` |
| modern-en | `695db129557f3393` | 12 | 162 | 35,673 | "Modern English" |
| modern-da | `45495079dc5f8ac4` | 12 | 162 | 36,176 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.658**, identical long paragraphs **3.9%**, 0
truncations, 0 empty paragraphs, alignment intact.

Structure: chapters 1–11 plus ch12 "Appendix". `original-en` is Douglass's own 1845 text and is
correctly attributed.

**Completeness note:** the 1845 book as published opens with **William Lloyd Garrison's Preface**
and **Wendell Phillips's letter to Douglass**; neither is present here. Both are by other hands, so
omitting them is a defensible scoping decision rather than a defect — but it should be a *recorded*
decision, because the Narrative's publication history (a Black author's testimony framed by white
abolitionist vouchers, which Douglass later resented) is part of what the book is. Everything by
Douglass — the eleven chapters and the Appendix, ending "FREDERICK DOUGLASS. / LYNN, _Mass., April_
28, 1845." — is present and intact.

Per-chapter similarity recomputed: **0.11 – 0.49**, with no near-untouched chapter. Chapter 12
(Appendix, 0.49) is highest only because Douglass's two long verse quotations are reproduced
verbatim, which is the correct treatment. Word counts hold steady chapter by chapter (largest drop:
ch11, −167 words on 5,269). This is a consistent, genuine re-expression, not a find-and-replace, and
it is the most evenly-executed modern edition in this batch.

## Samples inspected (7)

### 1. Opening — Chapter 1 ¶0

SRC: *"By far the larger part of the slaves know as little of their ages as horses know of theirs,
and it is the wish of most masters within my knowledge to keep their slaves thus ignorant."*
MOD: *"Most slaves know as little about their ages as horses do about theirs, and nearly every
master I knew of wanted to keep them that ignorant."*

**Finding — borderline.** Faithful in substance, and the horse comparison is kept rather than
softened. But the two quantifiers move in opposite directions in one sentence: *"by far the larger
part"* weakens to *"most"*, and *"most masters"* strengthens to *"nearly every master"*. Each is
small; together they show the quantifier-drift the reading standard warns about ("some vs. all").
The rest of the paragraph is exact, including the master's view that a slave asking his own age is
"improper, impertinent, and a sign of a restless spirit."

### 2. Chapter 1 ¶7–9 — the whipping of Aunt Hester (the brutality test)

SRC ¶7: *"He would whip her to make her scream, and whip her to make her hush; and not until
overcome by fatigue, would he cease to swing the blood-clotted cowskin… It was the blood-stained
gate, the entrance to the hell of slavery, through which I was about to pass."*
MOD ¶7: *"He would whip her to make her scream and whip her to make her hush, and only when overcome
by exhaustion would he stop swinging the blood-clotted cowskin… It was the blood-stained gate, the
entrance into the hell of slavery, through which I was about to pass."*

**Finding on the violence — strong.** Nothing is softened. "Literally covered in blood", "his
bloodied victim", "where the blood ran fastest, there he whipped longest", "the warm red blood was
dripping to the floor" all survive. No explanatory or consoling sentence has been added anywhere in
the scene. On the specific risk the brief raised — that a modern edition would flinch from the
brutality — this passage clears it.

**Finding on restraint — failing, two places in the same scene.**

(a) SRC ¶8: *"Why master was so careful of her, may be safely left to conjecture."*
MOD ¶8: *"Why my master was so **possessive** of her may safely be left to **the imagination**."*
Douglass's whole rhetorical manoeuvre here is to name the sexual motive by refusing to name it —
"careful of her" is a deliberate understatement and "left to conjecture" is an instruction to the
reader to do the work. "Possessive" performs the conjecture on the reader's behalf. The sentence
still says "left to the imagination" while having just removed the thing left to it. This is an
added interpretation of motive, which our standard forbids outright.

(b) SRC ¶9: *"He then told her to cross her hands, calling her at the same time a d——d b—-h… He then
said to her, **"Now, you d——d b—-h, I'll learn you how to disobey my orders!"**"*
MOD ¶9: *"He then told her to cross her hands, **cursing her with a vile name** as he did so… Then
he said to her, **"Now, you cursed wretch, I'll teach you to disobey my orders!"**"*
Two problems. First, the euphemism: Douglass's dashed obscenity is itself testimony — the
self-censored gendered slur is part of the degradation being recorded, and "a vile name" erases what
kind of degradation it was. Second, and worse, the substitution is made **inside quotation marks**.
The modern edition puts words in a named historical person's mouth that he did not say. Third,
smaller: *"I'll learn you"* → *"I'll teach you"* corrects the master's nonstandard grammar, removing
a characterising detail Douglass reproduced on purpose.

This handling is also **internally inconsistent** with chapter 6 (sample 3), where a racial slur
inside quoted speech is preserved verbatim. Whatever policy governs quoted offensive language, it is
not being applied consistently.

### 3. Chapter 6 ¶1–2 — Mrs Auld, and Mr Auld on literacy

SRC ¶1: *"That cheerful eye, under the influence of slavery, soon became red with rage; that voice,
made all of sweet accord, changed to one of harsh and horrid discord; and that angelic face gave
place to that of a demon."*
MOD ¶1: *"That cheerful eye, under the influence of slavery, soon turned red with rage; that voice,
once all sweet harmony, changed to one of harsh and terrible discord; and that angelic face gave way
to the face of a demon."*

SRC ¶2 / MOD ¶2 (Auld's speech, quoted): *"If you give a nigger an inch, he will take an ell. A
nigger should know nothing but to obey his master… Learning would _spoil_ the best nigger in the
world."* — **reproduced verbatim in the modern edition**, italics and all.

SRC ¶2: *"What he most dreaded, that I most desired. What he most loved, that I most hated."*
MOD ¶2: *"What he dreaded most, I desired most. What he loved most, I hated most."*

**Finding — strong.** The three-part rhetorical collapse of Mrs Auld is kept as three parallel
clauses. Auld's speech is left exactly as Douglass set it down, including the slur — which is
correct, and which makes the Aunt Hester substitution harder to defend. The chiasmus survives.
One small slip: *"It was a grand achievement, and I prized it highly"* → *"It was a tremendous
discovery"* — Douglass calls it an achievement (something he won), not a discovery (something he
found).

### 4. Chapter 10 ¶6–8 — the apostrophe to the ships

SRC ¶7: *"You are loosed from your moorings, and are free; I am fast in my chains, and am a slave!
You move merrily before the gentle gale, and I sadly before the bloody whip!… O, why was I born a
man, of whom to make a brute!… I had as well be killed running as die standing."*
MOD ¶7: *"You have slipped your moorings and you are free; I am held fast in my chains, a slave. You
glide along happily before the soft breeze, while I drag along miserably before the bloody whip…
Oh, why was I born a man, only to be made into a brute?… I might as well be killed running as die
where I stand."*

**Finding — strong.** The most rhetorically demanding passage in the book, and it survives: the
antitheses, the escalating questions ("Could I but swim! If I could fly!"), the theological wobble
("Is there any God?" → "Is there even a God?"), the abrupt turn into practical escape logistics, and
the deflating self-consolation at the end ("A better day is coming"). Two small losses in the frame
paragraph: *"whose broad bosom was ever white with sails"* → *"whose wide surface was forever white
with sails"* flattens a personification into a description, and *"so many shrouded ghosts"* → *"so
many ghosts wrapped in burial cloth"* explains an image that did not need explaining.

### 5. Chapter 10 ¶10 — the fight with Covey (2,043 words, the book's longest paragraph)

SRC: *"…but at this moment—from whence came the spirit I don't know—I resolved to fight… He
trembled like a leaf… I considered him as getting entirely the worst end of the bargain; for he had
drawn no blood from me, but I had from him."*
MOD: *"…but at that instant — where the spirit came from I cannot say — I made up my mind to
fight… He shook like a leaf… I reckoned he came out far the worse in the bargain, for he had drawn
no blood from me, while I had drawn his."*

**Finding — strong.** The whole two-hour fight, Hughes's kick, Bill's refusal ("his master had hired
him out to work, not to help whip me"), Covey's face-saving lie and Douglass's flat correction ("The
truth was, he had not whipped me at all") are all present and unhedged. No moralising sentence has
been inserted at the turning point — which is the obvious temptation here, and the edition resists
it. The 2,043-word paragraph loses 78 words, all redundancy.

### 6. Chapter 11 ¶0–1 — the withheld escape route

SRC ¶0: *"…it is not only possible, but quite probable, that others would thereby be involved in the
most embarrassing difficulties."*
MOD ¶0: *"…it is not just possible but quite likely that other people would be dragged into the most
awkward **and dangerous** trouble."*

SRC ¶1: *"I would leave him to imagine himself surrounded by myriads of invisible tormentors, ever
ready to snatch from his infernal grasp his trembling prey."*
MOD ¶1: *"I would let him imagine himself ringed by countless invisible tormentors, always ready to
snatch his trembling prey out of his hellish grip."*

**Finding — borderline.** The argument against the "upperground railroad" survives whole, including
its sting. But *"and dangerous"* is added — not in the source. (1845 "embarrassing" carried the
sense of hampering/entangling, so "awkward" is a fair gloss; "dangerous" is an editorial addition,
and in a chapter explicitly about protecting people from capture it is not a trivial one.) Also
*"guarding a door whereby some dear brother bondman might escape"* → *"slam shut a door through
which some dear fellow slave might have slipped free"* intensifies a neutral image.

Later in the same chapter (¶21): *"It was a severe cross, and I took it up reluctantly."* → *"It was
a heavy burden, and I took it up reluctantly."* — "took it up" is retained but the cross it belongs
to is gone. In a book whose Appendix turns on the difference between the Christianity of Christ and
the Christianity of this land, dissolving Douglass's one Christological self-description is a real,
if small, loss.

### 7. Chapter 12 (Appendix) — the irony test, and the one logical inversion

SRC ¶0: *"I love the pure, peaceable, and impartial Christianity of Christ: I therefore hate the
corrupt, slaveholding, women-whipping, cradle-plundering, partial and hypocritical Christianity of
this land. Indeed, **I can see no reason, but the most deceitful one, for calling the religion of
this land Christianity.** I look upon it as the climax of all misnomers… We have men-stealers for
ministers, women-whippers for missionaries, and cradle-plunderers for church members."*
MOD ¶0: *"I love the pure, peaceable, and impartial Christianity of Christ, and for that very reason
I hate the corrupt, slaveholding, woman-whipping, **cradle-robbing**, partial, and hypocritical
Christianity of this land. In fact, **I can see no honest reason for calling the religion of this
country Christianity at all.** To me it is the worst of all misnamings… Our ministers are
men-stealers, our missionaries are woman-whippers, and our church members are **cradle-robbers**."*

**Finding — failing (one substantive), plus three voice slips.**

(a) **Logical inversion.** Douglass asserts that there *is* a reason for calling it Christianity and
that the reason is deceitful — a direct accusation of bad faith. "I can see no honest reason… at
all" says instead that he finds no good justification, which leaves open that there is simply none.
The accusation is removed and replaced with an absence of warrant. This is the same class of error
as "may require"→"requires" in the Constitution.

(b) *"cradle-plundering"* → *"cradle-robbing"*. In current English "cradle-robber" idiomatically
means someone dating a much younger partner. Douglass is describing men who take infants from
mothers to sell. The substitution imports a wrong and faintly comic connotation into the most
serious sentence in the book.

(c) *"We have men-stealers for ministers…"* → *"Our ministers are men-stealers…"* reverses the
construction. Douglass's "we have X for Y" means *we have installed X in the office of Y* — an
indictment of a system that appoints such men. "Our ministers are men-stealers" is a flat
predication about individuals.

(d) *"the climax of all misnomers"* → *"the worst of all misnamings"* loses the ascent in "climax";
*"the grossest of all libels"* → *"slanders"* swaps a written-defamation term for a spoken one, in a
sentence about what the country *calls* itself.

**Finding on the verse — strong.** Both quoted poems (the 104-word "Just God! and these are they"
and the 414-word "A PARODY") are reproduced **byte-identical**, which is right: they are quotations,
not Douglass's prose. This accounts for nearly all of the chapter's 28% byte-identity and is not a
defect. The Jeremiah quotation ("Shall I not visit for these things? saith the Lord.") is likewise
untouched. One slip in the frame: *"which I soberly affirm is 'true to the life'"* → *"which I
solemnly affirm"* — "soberly" is Douglass insisting he is not writing in heat; "solemnly" makes it
an oath instead.

## Phase 1 flags — confirmed / disconfirmed

- **Mean similarity 0.658 → CONFIRMED**, and unusually *even*: 0.11–0.49 across chapters 1–11, with
  no near-untouched chapter anywhere. This is the healthiest similarity profile in the batch.
- **3.9% identical long paragraphs → CONFIRMED and EXPLAINED AWAY.** Recomputed: 737 of 36,168
  source words are byte-identical, and **527 of them are in ch12** — the two verse quotations. The
  only other hit is ch8 ¶6 (65 words). This flag is a false positive for this book: quoted verse
  *should* be identical.
- **0 truncations, 0 empty paragraphs, 12/12 chapters, 162/162 paragraphs → CONFIRMED.**
- **"last chapter suspiciously short" false → CONFIRMED**; ch12 is the Appendix and complete.
- **Not visible to Phase 1:** the Garrison preface and Phillips letter are absent from `original-en`
  itself.

## Phase 3 — human-edition research

**English original; rights clean; no alternative edition needed for rights reasons.** Douglass's
1845 Narrative is public domain worldwide. Clean reference texts:
- **Standard Ebooks**, *Narrative of the Life of Frederick Douglass* — released under **CC0 1.0**,
  scan-checked against HathiTrust, and it **includes Garrison's preface and Phillips's letter**.
  https://standardebooks.org/ebooks/frederick-douglass/narrative-of-the-life-of-frederick-douglass
  Useful if we decide to restore the front matter.
- Project Gutenberg #23 (the likely ancestor of our `original-en`).

The applicable Phase 3 question: **does Douglass's own prose meet our reading standard?** Largely
yes. It is 19th-century — "whilst", "commenced", "I deem it proper", periodic sentences of 60–80
words — but it is famously lucid, concrete and forward-moving, and it was written to be read aloud
to mixed audiences. A capable modern adult can read it unaided. The case *for* our modern edition is
modest but real (it removes friction in chapters 10–11's long paragraphs); the case *against*
maintaining one is that this is a text whose exact words are historically and morally load-bearing,
and every defect I found is of exactly that kind — a softened obscenity, a supplied motive, an
inverted accusation, an anachronistic compound.

## Ratings

| dimension | score | note |
|---|---|---|
| fidelity/completeness (40%) | **4** | Structurally complete and consistently re-expressed; violence and testimony never softened. Marked down for the quoted-speech substitution in ch1 ¶9 and the logical inversion in ch12 ¶0. |
| first-read clarity (25%) | **5** | Genuinely easier than the source throughout, with no dead spots. The best clarity work in this batch. |
| literary voice (20%) | **4** | Rhetorical set-pieces (ships, Covey, the Appendix) survive intact; a few images flattened ("broad bosom", "severe cross", the "we have X for Y" construction). |
| restraint / no invention (10%) | **3** | "Possessive" supplies a motive Douglass withholds; "and dangerous" is added; "cursed wretch" is invented inside quotation marks. |
| naturalness (5%) | **5** | Excellent, idiomatic, unmechanical prose. |

**Weighted score: 4.2 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT** — confidence **medium-high**. Correction scope: **local** (6 identified passages).

The edition is good and evenly executed; every defect I found is a specific sentence, not a pattern
of method. Fix list, in priority order:

1. **ch1 ¶9** — restore Douglass's dashed obscenity (or a marked editorial note) in both the
   narration and the quotation, and restore *"I'll learn you"*. Never substitute words inside
   quotation marks.
2. **ch12 ¶0** — restore *"I can see no reason, but the most deceitful one, for calling the religion
   of this land Christianity."*
3. **ch12 ¶0** — revert *cradle-robbing* → *cradle-plundering* (both occurrences) and restore the
   *"We have men-stealers for ministers…"* construction.
4. **ch1 ¶8** — revert *"possessive"* → *"careful of her"*.
5. **ch11 ¶0** — delete the added *"and dangerous"*.
6. **ch11 ¶21** — restore *"a severe cross"*.

Also worth a decision (not a defect): whether to restore Garrison's preface and Phillips's letter
from the Standard Ebooks CC0 text.

**Dissenting note, recorded honestly:** a defensible alternative reading of our own standard is
**SOURCE + GLOSSES** — Douglass's 1845 prose is accessible enough that a rewrite may not be worth
maintaining, and the six defects above are all of the class that a rewrite of a testimonial text is
prone to. I did not choose it because the existing modern edition is measurably good and the fixes
are cheap, but if the library ever trims modern editions for accessible English originals, this book
is a stronger candidate for trimming than its 4.2 score suggests.

**Next action:** apply the six local fixes above and set an explicit rule for quoted offensive
language (ch6 preserves a slur verbatim, ch1 euphemises one — pick one policy).

## Limitations of this review

- 7 passages sampled, ≈12,000 of 36,168 source words. Chapters 2, 3, 4, 5, 7, 8, 9 were **not**
  read; my "even quality" claim for those rests on the recomputed per-chapter similarity and word
  counts, not on reading them.
- I did not read `modern-da`.
- I did not collate `original-en` against a scan of the 1845 first edition, so I cannot certify its
  fidelity beyond the passages quoted.
- I did not check the threads/Cast file (`frederick-douglass-threads.json`), the onboarding JSON, or
  the audio.
