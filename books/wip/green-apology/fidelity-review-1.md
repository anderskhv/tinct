# Fidelity Review 1 — Apology (Plato), modern-en candidate

**Reviewer:** Independent fidelity reviewer (Reviewer B), first review of this text.
**Date:** 2026-09-21
**Source (sole fidelity anchor):** `books/wip/green-apology/source.json` (Jowett translation, 3 chapters, 92 paragraphs)
**Candidate:** `books/wip/green-apology/candidate.json` (3 chapters, 92 paragraphs)
**Method:** `books/prompts/fidelity-review-prompt.md`

---

## Coverage

Full coverage. Every one of the 92 paragraphs was read individually, source
against candidate, in packets with one paragraph of context on each side:

- **Chapter 1 "The Defense"** — paragraphs 0–76 (77 paragraphs), in packets
  0–8, 7–18, 17–29, 28–41, 40–52, 51–60, 59–68, 67–76.
- **Chapter 2 "The Penalty"** — paragraphs 0–5 (6 paragraphs), one packet with
  chapter-boundary context from ch1 p76 and ch3 p0.
- **Chapter 3 "Final Words"** — paragraphs 0–8 (9 paragraphs), one packet with
  boundary context from ch2 p5.

Nothing was skimmed or sampled. After the packets, a whole-book re-read was done
for cross-boundary issues (recurring formulas, the oracle arc, the accuser names,
the "judges" vs "men of Athens" distinction, the public-opinion setup/payoff, the
Prytaneum/Olympic-victor argument). Paragraph counts and order match
(77/6/9 both sides); alignment is intact at the index level, but see **B1** — the
*content* of ch2 p4 is not the content of source ch2 p4.

---

## Blocking defects

### B1. Chapter 2, paragraphs 4 and 5 — one paragraph of source is missing, another is rendered twice

This is the most serious defect in the book.

**Source ch2 p4:**
> "No indeed, men of Athens, that is not very likely. And what a life should I
> lead, at my age, wandering from city to city, ever changing my place of exile,
> and always being driven out! For I am quite sure that wherever I go, there, as
> here, the young men will flock to me; and if I drive them away, their elders
> will drive me out at their request; and if I let them come, their fathers and
> friends will drive me out for their sakes."

**Candidate ch2 p4:**
> "Someone would say: 'Can't you just stop talking, Socrates, and live quietly in
> exile?' … So let thirty minas be the fine — they're good for it."

The candidate's p4 is a rendering of **source p5**, not source p4. The candidate's
p5 is then a *second*, slightly different rendering of the same source p5
("No, let me reconsider. Someone would say: 'Can't you just keep quiet and go
somewhere else?' … Let thirty minas be the penalty; they're reliable sureties.").

Consequences: (a) the whole exile-as-penalty argument of source p4 — the wandering
life, the young men flocking, being driven out by their elders and fathers — is
**absent from the book entirely**; (b) the reader gets the "unexamined life is not
worth living" passage and the thirty-minae proposal **twice in a row**;
(c) "No, let me reconsider." at the head of candidate p5 is an invented bridge with
no source licence, manufactured to paper over the duplication.

**Fix:** Discard candidate p4 and re-draft it from source p4. Then remove the
invented opening "No, let me reconsider." from p5, which should begin at
"Someone would say: …".

### B2. Chapter 1, paragraph 62 — meaning reversed

**Source:** "…and I will never fear or avoid a possible good rather than a certain evil."
**Candidate:** "I will never choose a possible good over a certain evil."

The source says he will never shrink from something that *may* be good (death) in
order to escape something *certainly* evil (injustice). The candidate says the
opposite — that he would never prefer the possible good. This inverts the
conclusion of the entire paragraph and contradicts the sentence before it.

**Fix:** "I will never fear or run from something that may turn out to be good in
order to escape what is certainly evil."

### B3. Chapter 2, paragraph 1 — sentence imported from the next paragraph (unlicensed addition)

**Source ch2 p1** ends: "…whether the chariots were drawn by two horses or by many."
**Candidate ch2 p1** ends: "…far more than an Olympic chariot winner. **That person
gives you the appearance of happiness; I give you the real thing.**"

That sentence belongs to source ch2 p2 ("he only gives you the appearance of
happiness, and I give you the reality"), where the candidate also renders it. The
argument is therefore stated twice, and p1 contains a claim the source does not
make at that point. The source's own trailing detail ("whether the chariots were
drawn by two horses or by many") is dropped in exchange.

**Fix:** Delete the imported sentence from p1 and restore the two-horse/many-horse
detail: "…far more than a citizen who has won at Olympia in the horse race or the
chariot race — with a pair of horses or a full team."

### B4. Chapter 1, paragraph 12 — the payoff of the oracle arc is dropped

**Source:** "I will tell you the tale of my wanderings and of the 'Herculean'
labours, as I may call them, **which I endured only to find at last the oracle
irrefutable**."
**Candidate:** "Let me tell you about my wanderings and labors."

The dropped clause is the conclusion of the whole oracle investigation set up in
p10 and cashed out in p15. Also dropped from the same paragraph: "And there, I
said to myself, you will be instantly detected; now you will find out that you are
more ignorant than they are." (a full sentence, the motive for going to the poets),
and the oath "by the dog I swear!" with its address "Athenians".

**Fix:** Restore: "Let me tell you the tale of my wanderings and of my 'Herculean
labors,' as I might call them — labors I went through only to find, in the end,
that the oracle could not be refuted." Restore the poets sentence: "Here, I told
myself, you will be found out at once; now you'll discover you're more ignorant
than they are." Restore the oath: "And I swear to you, Athenians — by the dog I
swear it, since I have to tell you the truth —".

### B5. Chapter 1, paragraph 16 — the closing clause of the paragraph is dropped

**Source:** "…for they do not like to confess that their pretence of knowledge has
been detected—which is the truth; **and as they are numerous and ambitious and
energetic, and are drawn up in battle array and have persuasive tongues, they have
filled your ears with their loud and inveterate calumnies.**"
**Candidate:** ends at "…making the weaker argument win."

The dropped clause is the explanation of *how* the slander spread — the direct
set-up for p17's "such a mass of calumny."

**Fix:** Append: "And because there are many of them, ambitious and energetic,
drawn up in formation and persuasive when they speak, they have filled your ears
with their loud, long-standing slanders."

### B6. Chapter 1, paragraph 5 — full sentence dropped, and an actor reversal

(a) **Source:** "I should be very sorry if Meletus could bring so grave a charge
against me." — absent from the candidate.
**Fix:** restore after the natural-philosophy sentence.

(b) **Source:** "Speak then, **you who have heard me, and tell your neighbours**
whether any of you have ever known me hold forth… **You hear their answer.**"
**Candidate:** "**Ask your neighbors** whether any of you has ever heard me say a
word about such matters."

The actors are reversed: in the source Socrates tells those who have heard him to
inform their neighbours; the candidate tells the audience to ask their neighbours.
"You hear their answer" is also dropped, which is what licenses the next sentence.
**Fix:** "So speak up, those of you who have heard me, and tell your neighbors
whether any of you has ever heard me discuss such things, at length or in
passing… You hear their answer."

### B7. Chapter 1, paragraph 69 — the point of the anecdote is dropped

**Source:** "Let me relate to you a passage of my own life **which will prove to
you that I should never have yielded to injustice from any fear of death, and that
'as I should have refused to yield' I must have died at once.** I will tell you a
tale of the courts, not very interesting perhaps, but nevertheless true."
**Candidate:** "Let me tell you something from my own life."

The candidate strips the statement of what the Arginusae and Leon stories are
meant to prove, leaving two anecdotes with no stated thesis.
**Fix:** "Let me tell you an episode from my own life that will show you I would
never give way to injustice out of fear of death — and that, refusing to give way,
I would have died on the spot. It's a courtroom story, perhaps not very
interesting, but it's true."

### B8. Chapter 1, paragraph 74 — the Homer allusion is deleted, and the public-opinion setup with it

**Source:** "My friend, I am a man, and like other men, a creature of flesh and
blood, and **not 'of wood or stone,' as Homer says**…"
**Candidate:** "My friend, I am a man too."

An explicit, attributed quotation of Homer is removed. Under the translation
protocol, allusions and quotations are preserved.
**Fix:** "My friend, I am a human being like the rest of you, flesh and blood —
not 'of wood or stone,' as Homer puts it."

Same paragraph: **Source:** "But, **having regard to public opinion**, I feel that
such conduct would be discreditable to myself, and to you, and to the whole
state." The candidate drops "having regard to public opinion." This is the setup
that ch1 p76 pays off ("But, **setting aside the question of public opinion**…"),
which the candidate keeps ("Setting public opinion aside"). The payoff now refers
back to nothing.
**Fix:** restore: "But as a matter of public reputation, I feel such behavior would
be discreditable to me, to you, and to the whole city."

### B9. Chapter 1, paragraph 57 — dropped clause changes the argument's mechanics

**Source:** "…must I not? To be sure I must; **and therefore I may assume that your
silence gives consent.**"
**Candidate:** "I must."

Socrates is explicitly converting Meletus's silence into assent; this is how the
cross-examination proceeds without an answer. Without it, the next question
appears unanchored.
**Fix:** "I must. And since you say nothing, I'll take your silence as agreement."

Same paragraph, minor actor slip: **Source:** "How lucky I am to have extracted
that answer, by the assistance of the court!" (Socrates extracted it, with the
court's help). **Candidate:** "How fortunate that the court got you to answer!"
**Fix:** "How lucky I am to have dragged that answer out of you, with the court's
help!"

### B10. Chapter 1, paragraph 2 — three distinct claims dropped

**Source:** "…and the cause when heard went by default, **for there was none to
answer**. And hardest of all, I do not know and cannot tell the names of my
accusers; unless in the chance case of a Comic poet. **All who from envy and
malice have persuaded you—some of them having first convinced themselves—all this
class of men are most difficult to deal with;** for I cannot have them up here, and
cross-examine them, and therefore I must simply fight with shadows in my own
defence, **and argue when there is no one who answers**."

The candidate drops: the case going by default for want of an answer; the envy and
malice motive; the detail that some of the slanderers convinced themselves first;
and the closing "argue when there is no one who answers."
Also in this paragraph: source says "telling of one Socrates, **a wise man**, who
speculated…" — "a wise man" is dropped, though the whole chapter turns on the
reputation for wisdom; source says "I **do not know and cannot tell the names of my
accusers**" (categorical), candidate hedges to "I don't even know who **most** of
them are"; source says they caught you "**in childhood, or it may have been in
youth**", candidate flattens to "at your most impressionable age."
**Fix:** restore each clause; in particular restore "a wise man" and the
categorical "I don't know their names and can't tell you who they are."

### B11. Chapter 1, paragraph 8 — a stated claim turned into a hedge

**Source:** "…whereas the persons of whom I was speaking **have** a superhuman
wisdom which I may fail to describe, because I have it not myself; **and he who
says that I have, speaks falsely, and is taking away my character.**"
**Candidate:** "But the men I just mentioned **may possess** a superhuman wisdom
that I can't describe, because I don't have it. Anyone who says I do is lying."

The source states it (ironically) as fact; the candidate inserts "may", which
blunts the irony. "…and is taking away my character" is dropped. Also dropped: the
oracle will tell you about my wisdom "**and of what sort it is**".
**Fix:** "…whereas the men I just mentioned have a superhuman wisdom that I can't
describe, since I don't have it myself; and anyone who says I do is lying and
damaging my reputation." Restore "…and what kind of wisdom it is."

### B12. Chapter 1, paragraph 44 — accusation of lying softened away

**Source:** "But either I do not corrupt them, or I corrupt them unintentionally;
and on either view of the case **you lie**."
**Candidate:** "Either I don't corrupt them at all, or I do it unintentionally.
Either way, **your charge fails**."

"You lie" is a direct accusation against Meletus; "your charge fails" is a claim
about the indictment. Different claim, different force.
**Fix:** "…and on either account, you are lying."

Same paragraph: the sarcasm "is that a truth which **your superior wisdom** has
recognized **thus early in life**, and am I, **at my age**, in such darkness and
ignorance…" is flattened to "Am I really so ignorant…", losing the age contrast
that is the joke.

### B13. Chapter 1, paragraph 68 — the daimonion is severed from the indictment

**Source:** "…an oracle or sign which comes to me, **and is the divinity which
Meletus ridicules in the indictment**."
**Candidate:** "…an inner sign — a kind of divine voice — that has come to me since
childhood."

The cross-reference tying the divine sign to Meletus's charge of "new divinities"
is deleted; this is the link between the daimonion passage and the whole second
half of the defense.
**Fix:** "…a sign or oracle that comes to me — the very divinity Meletus mocks in
his indictment."

Same paragraph: **Source:** "no man who **goes to war with you or any other
multitude**, honestly striving against the many lawless and unrighteous deeds
which are done in a state, will save his life." The candidate drops "goes to war
with you or any other multitude", losing the point that it is *the crowd* one is
opposing.
**Fix:** "no one who genuinely fights you — or any other mass of people — honestly
opposing the many lawless and unjust things done in a state, will keep his life."

### B14. Chapter 3, paragraph 3 — the "judges" distinction is deleted

**Source:** "**O my judges—for you I may truly call judges**—I should like to tell
you of a wonderful circumstance."
**Candidate:** "I want to tell you something remarkable."

Throughout the speech Socrates addresses the court as "men of Athens" and pointedly
reserves "judges" for those who voted to acquit. This paragraph is where he says so
explicitly. The candidate deletes the statement but keeps the later usages ("my
judges" in ch3 p6, "my friends and judges" in ch3 p4) — so a distinction the book
still relies on is never established.
**Fix:** "My judges — and you I can truly call judges — I'd like to tell you
something remarkable."

### B15. Chapter 3, paragraph 4 — hedge and content dropped

**Source:** "either death is a state of nothingness and utter unconsciousness, or,
**as men say**, there is **a change and migration of the soul** from this world to
another."
**Candidate:** "either it's a state of complete nothingness and unconsciousness, or
it's a journey to another place where the dead reside."

"As men say" (the hedge marking this as report, not claim) is dropped, and
"migration of the soul" is reduced to "a journey."
**Fix:** "…or, as people say, the soul changes and migrates from this world to
another."

Same paragraph: "and other **sons of God** who were righteous in their own life"
becomes "and every other righteous soul", deleting the demigod status of the
underworld judges — which matters, since the demigod argument is central in ch1
p57–59.
**Fix:** "…and the other sons of God who lived righteous lives."

### B16. Chapter 3, paragraph 5 — the point of the afterlife examination is dropped; one actor pluralized

(a) **Source:** "**Above all, I shall then be able to continue my search into true
and false knowledge; as in this world, so also in the next; and I shall find out
who is wise, and who pretends to be wise, and is not.**"
**Candidate:** "Best of all, I could continue doing what I do now: examining
people."

The specific content — the search into true and false knowledge, continued in the
next world, and finding who is wise and who only pretends — is the closing echo of
the oracle mission. Reduced to "examining people."
**Fix:** "Best of all, I could go on with my search into what is true knowledge and
what is false — in the next world as in this one — finding out who is really wise
and who only pretends to be."

(b) **Source:** "the leader of the great Trojan expedition" (singular: Agamemnon).
**Candidate:** "the leaders of the Trojan War" (plural).
**Fix:** restore the singular: "the leader of the great expedition against Troy".

---

## Non-blocking defects (fidelity losses, patchable individually)

Listed by paragraph. Each is a dropped clause, a changed quantifier, or a silent
change that does not by itself break the argument, but together they form a
systematic pattern of trailing-clause deletion.

| ¶ | Source | Candidate | Problem / fix |
|---|---|---|---|
| ch1 p0 | "but **from me you shall hear the whole truth**" | (absent) | The promise that frames the whole speech. Restore. |
| ch1 p0 | "No, **by heaven!**" | "No" | Oath dropped. |
| ch1 p1 | "**Am I making an unfair request of you?**" | (absent) | Rhetorical question dropped. Restore. |
| ch1 p1 | "whom you would excuse if he spoke **in his native tongue, and after the fashion of his country**" | "speaking in his own way" | Native-tongue image lost. |
| ch1 p1 | "Never mind the manner, **which may or may not be good**" | "Don't worry about my style" | Concessive clause dropped. |
| ch1 p4 | "if to succeed be for my good and yours, **or likely to avail me in my cause**" | "if success is truly good for you and for me" | Second condition dropped. |
| ch1 p6 | "Gorgias **of Leontium**, and Prodicus **of Ceos**, and Hippias **of Elis**" | "Gorgias, Prodicus, and Hippias" | Three proper-noun epithets dropped. Restore. |
| ch1 p6 | "**I came across a man** who has spent a world of money on the Sophists, Callias" | "when **I visited** Callias" | Silent change of how the meeting happened. |
| ch1 p6 | "who understands human **and political** virtue?" | "who understands human excellence?" | "political" dropped; it is the whole point of the question. Restore. |
| ch1 p6 | "improve and perfect them **in their own proper virtue and excellence**" | "who'd improve them" | Dropped. |
| ch1 p9 | "the **Pythian prophetess**" | "the priestess" | Specificity lost (non-blocking). |
| ch1 p9 | "his brother … **will confirm** the truth of what I am saying" | "**can** confirm this" | Modal weakened from assertion to capability. |
| ch1 p10 | "he is a god, and cannot lie; **that would be against his nature**" | "He's a god — he can't lie." | Reason dropped. |
| ch1 p10 | "I might go to the god with a refutation in my hand. **I should say to him, 'Here is a man who is wiser than I am; but you said that I was the wisest.'**" | "I can go back to the oracle with proof." | Quoted speech to the god dropped. |
| ch1 p10 | "his enmity was shared by **several** who were present" | "and so did **everyone** who overheard us" | Quantifier inflated. Fix: "several of the people present." |
| ch1 p12 | "Will you believe me?" | (absent) | Dropped. |
| ch1 p16 | "**This confounded Socrates**, they say; **this villainous misleader of youth!**" | "'This wretched Socrates … this corrupter of the young!'" | Acceptable, noted only for register. |
| ch1 p17 | "I have concealed nothing, **I have dissembled nothing**" | "I've hidden nothing" | Doublet reduced. |
| ch1 p18 | "he pretends to be in earnest when he is only **in jest**" | "pretends to be serious when he's really being **reckless**" | Meaning change: jest ≠ recklessness, and "reckless" duplicates the separate charge in p53. Fix: "when he's only playing." |
| ch1 p29 | "**By the goddess Here**, that is good news!" | "Well, that's wonderful news!" | Oath dropped, while "by Zeus" is kept in p38 and p52 — inconsistent treatment. |
| ch1 p33 | "But **perhaps** the members of the assembly corrupt them?" | "do they corrupt the young?" | Hedge dropped. |
| ch1 p37 | "One man is able to do them good, **or at least not many**" | "Only one person … does them good" | Hedge dropped. |
| ch1 p37 | "**others** who have to do with them rather injure them" | "**most people** who handle them cause harm" | Quantifier inflated. |
| ch1 p37 | "Most assuredly it is; **whether you and Anytus say yes or no**" | "Of course it is." | Dropped; Anytus reference lost. |
| ch1 p49 | "**Why do you think so, Meletus?**" | (absent) | Dropped. |
| ch1 p51 | "**And so, forsooth, the youth are said to be taught them by Socrates**, when there are not unfrequently exhibitions of them at the theatre … **and they might pay their money**, and laugh at Socrates" | "You can find them at the theater for a drachma at most. The young would laugh at me…" | The premise (that the youth are said to learn these from Socrates) and the paying detail are dropped. |
| ch1 p53 | "in a spirit of mere wantonness and **youthful bravado**" | "out of sheer brazenness" | Dropped. |
| ch1 p53 | "**Has he not compounded a riddle, thinking to try me?**" | "He's set himself a riddle" | Actor/purpose slip: the riddle is aimed at Socrates, not at himself. Fix: "Hasn't he cooked up a riddle to test me?" |
| ch1 p59 | "if the demigods are the **illegitimate sons of gods, whether by the nymphs or by any other mothers** … **what human being will ever believe that there are no gods if they are the sons of gods?**" | "demigods … who are gods' children" | The nymphs/mothers detail and the rhetorical question are dropped; the argument survives but is thinned. |
| ch1 p60 | "the envy and **detraction** of the world" | "the world's envy and **malice**" | Detraction (slander) ≠ malice, and slander is the through-line of the speech. Fix: "envy and slander." |
| ch1 p61 | "'Let me die **forthwith**… rather than **abide** here by the **beaked ships**, a **laughing-stock and a burden of the earth**.'" | same, nearly verbatim | **Unmodernized quotation**: an archaic island inside modern prose. Modernize while keeping the sense: "'Then let me die at once, once I've made my enemy pay, rather than stay here beside the curved ships, a joke and a dead weight on the earth.'" |
| ch1 p62 | "when, **as I conceive and imagine**, God orders me" | "when **God himself has stationed me**" | Hedge deleted and upgraded to assertion. Restore: "when, as I understand and believe, God has posted me here." |
| ch1 p62 | "I know but little of **the world below**" | "I know almost nothing about **death**" | Silent interpretive substitution. |
| ch1 p62 | "if I disobeyed the oracle because I was afraid of death, **fancying that I was wise when I was not wise**" | "disobeying the oracle out of fear" | Dropped; it is the link to the conceit-of-knowledge argument that follows. |
| ch1 p64 | "if this is the doctrine which corrupts the youth, **I am a mischievous person**" | "then **I'm guilty**" | Changed claim; "guilty" imports a legal verdict the source does not use here. |
| ch1 p65 | "**there was an understanding between us that you should hear me to the end**" | (absent) | Dropped. |
| ch1 p65 | "the evil of unjustly taking away the life of another—is greater far." | "…is far greater **than any harm done to the victim**." | Comparandum added; the source leaves it as "greater far" relative to the preceding claim. |
| ch1 p66 | "I should not have neglected all my own concerns or patiently seen the neglect of them during all these years" | "no ordinary person would neglect all their own affairs for all these years, **patiently suffering poverty**" | **Addition** — poverty is not in this clause. Delete. |
| ch1 p66 | "such conduct, I say, **would be unlike human nature**" | (absent) | Dropped conclusion. |
| ch1 p67 | "not even **the impudence of** my accusers dares…; **of that they have no witness**" | "not even my accusers dare claim…" | Two drops. |
| ch1 p71 | "for I never **taught or** professed to teach him anything" | "I never **promised** to teach anyone anything" | The stronger denial (never taught at all) is dropped. Restore both verbs. |
| ch1 p71 | "those who are **slanderously** termed my disciples" | "those people some call my 'disciples'" | "Slanderously" dropped. |
| ch1 p72 | "should come forward as accusers, **and take their revenge**" | "should come forward to accuse me" | Dropped. |
| ch1 p72 | "some of their relatives, **fathers, brothers, or other kinsmen**, should say **what evil their families have suffered at my hands. Now is their time.**" | "their relatives should speak up" | Enumeration, the substance of the testimony, and "Now is their time" all dropped. |
| ch1 p72 | "Crito, who is of the same age **and of the same deme** with myself" | "Crito, my contemporary" | Deme dropped. |
| ch1 p73 | "Nicostratus **the son of Theosdotides**" | "Nicostratus" | Patronymic dropped, in a paragraph whose whole effect is the roll-call of patronymics. Restore. |
| ch1 p73 | "**And let him say, if he has any testimony of the sort which he can produce.**" | (absent) | Dropped. |
| ch1 p73 | "as **Meletus and Anytus** call me" | "the **alleged** corrupter" | Attribution to the named accusers dropped. |
| ch1 p74 | "on a similar, **or even a less serious**, occasion" | "in similar situations" | Dropped. |
| ch1 p74 / p75 | p74 ends "…ought not to demean himself."; p75 opens "Whether this opinion of me be deserved or not…" | p74 ends "A man of my age and reputation — **whether deserved or not** — shouldn't demean himself"; p75 opens "**Whether my reputation is deserved or not**…" | The qualifier is moved into p74 *and* left in p75 — it now appears twice. Remove from p74. |
| ch1 p75 | "the man who gets up a doleful scene **and makes the city ridiculous**, than him who **holds his peace**" | "…than the one who **quietly accepts his fate**" | "Makes the city ridiculous" dropped; "holds his peace" (says nothing) becomes "accepts his fate" (an added attitude). |
| ch1 p76 | "by **force of persuasion and entreaty** I could overpower your oaths" | "If I could sway your oaths through **tears and begging**" | "Tears" added. |
| ch1 p76 | "when I am being tried for impiety **on the indictment of Meletus**" | "when I'm being tried for ungodliness" | Dropped. |
| ch1 p76 | "to be determined by you as is best **for you and me**" | "as is best **for all of us**" | Scope widened. |
| ch2 p1 | "the man who has never had **the wit** to be idle during his whole life" | "a man who has never been idle" | The irony (he lacked the *cleverness* to be idle) is lost. |
| ch2 p1 | "look to the state before he looks to the interests of the state" | "improve the state before seeking benefits from it" | **Silent correction** of an odd/corrupt source phrase. The reading may well be right, but it is an editorial decision, not a translation; flag for a decision and record it if kept. |
| ch2 p3 | "be the slave of the magistrates of the year—**of the Eleven**" | "a slave to whatever magistrate happens to hold office" | The named body (the Eleven) is dropped. |
| ch2 p3 | "I will not say of myself that I deserve any evil, **or propose any penalty**" | "I certainly won't wrong myself by admitting I deserve punishment" | Dropped — and it matters, because he goes on to propose one. |
| ch2 p3 | "And if I say exile **(and this may possibly be the penalty which you will affix)**" | "Exile?" | Parenthetical dropped. |
| ch2 p3 | "I cannot in a moment refute **great slanders**" | "I can't refute **years of** slander in a moment" | Minor addition. |
| ch3 p0 | "Not much time **will be gained** … in return for the evil name **which you will get**" | "You **haven't** gained much time … and you've **earned** a terrible reputation" | Future turned into completed past. |
| ch3 p0 | "nor do I now **repent of the style of my defence**" | "and I think now" | Dropped. |
| ch3 p1 | "my accusers are **keen and quick**" | "My accusers are **young and fast**" | Silent change — the source does not call them young here (it does in ch3 p2 of a *different* group). Fix: "sharp and quick." |
| ch3 p1 | "the slower runner has overtaken me" | "the slower runner — **death** — has caught me" | Interpretive gloss added (correct, but an addition; acceptable if kept consistent with "wickedness" gloss in the next clause — note only). |
| ch3 p1 | "I think that they are **well**" | "I think it's **fair**" | Changed claim. |
| ch3 p3 | "while **the magistrates are busy**" | "while we have time" | Dropped detail. |
| ch3 p3 | "had I been going to evil **and not to good**" | "if I had been heading toward harm" | Dropped. |
| ch3 p4 | "**I will not say a private man, but even** the great king" | "even a great king" | The private-man/great-king contrast is lost. |
| ch3 p5 | "Ajax **the son of Telamon**" | "Ajax" | Patronymic dropped. |
| ch3 p5 | "there will be **no small pleasure**, as I think, in comparing…" | "comparing … would be **endlessly fascinating**" | Litotes converted to a strong claim. |
| ch3 p6 | "**He and his** are not neglected by the gods" | "The gods do not neglect **such a person**" | "And his" (his family) dropped. |
| ch3 p7 | "I would ask you, O my friends, **to punish them**; and I would have you trouble them" | "I ask you, my friends, to give them the same trouble I've given you" | "Punish them" dropped — the source's request is deliberately harsher. Restore. |

---

## Cross-boundary findings (whole-book re-read)

1. **The indictment formula is rendered three different ways.** The Greek stock
   charge appears at ch1 p2, p5 (inside the quoted affidavit) and p16 (explicitly
   labelled as one of the "ready-made charges"). Source wording is identical each
   time ("makes the worse appear the better cause"); the candidate gives
   "makes the weaker argument appear stronger" (p2), "makes the weaker argument
   **defeat** the stronger" (p5), and "making the weaker argument **win**" (p16).
   The p5/p16 variants also overstate — the source says *appear* better, not win.
   **Fix:** use one wording throughout: "makes the weaker argument look like the
   stronger."

2. **Oaths are handled inconsistently.** "By the dog" (ch1 p12) and "By the goddess
   Here" (ch1 p29) are deleted, while "by Zeus" (ch1 p38, p52) and "by the gods"
   (ch1 p47) are kept. Pick one policy; the Socratic oaths are characteristic and
   should be kept.

3. **The oracle arc loses its conclusion.** Set up in ch1 p10 (the plan to refute
   the god), it is supposed to close in p12 ("only to find at last the oracle
   irrefutable") before p15 draws the moral. With p12's clause deleted (B4), p15's
   "obedient to the god" arrives without the verdict that licenses it.

4. **"Judges" vs "men of Athens."** The candidate deletes the one place the
   distinction is stated (ch3 p3, B14) but keeps the later dependent usages.

5. **Public opinion: setup deleted, payoff kept** (ch1 p74 → p76, B8).

6. **The Prytaneum/Olympic-victor argument is stated twice** (ch2 p1 imports ch2
   p2's sentence, B3).

7. **Chapter 2 loses a paragraph and gains a duplicate** (B1) — the most
   consequential cross-boundary failure: a reader moving from the penalty proposal
   to the exile discussion reads the same argument twice and never reads the exile
   argument at all.

8. Positive findings: the accuser trio (Meletus/Anytus/Lycon) and their
   constituencies are consistent; Chaerephon and his brother are consistent; the
   gadfly image is intact and not reused elsewhere; paragraph indices align 1:1
   across all three chapters; no chapter titles were altered.

---

## Verdict

**DO NOT ACCEPT.**

A patch list is not the right remedy here, for three reasons.

1. **Chapter 2 is structurally broken.** One source paragraph (ch2 p4) has no
   representation anywhere in the candidate, and its slot is filled by a duplicate
   rendering of the following paragraph, stitched together with an invented
   transition ("No, let me reconsider."). Chapter 2 is six paragraphs long; two of
   six are wrong, and a third (p1) carries an imported sentence. That chapter needs
   a re-draft from the source, not an edit.

2. **The omissions are systematic, not incidental.** Across Chapter 1 the same
   drafting habit recurs in roughly forty paragraphs: the paragraph's final
   subordinate clause — the one carrying the reason, the qualification, or the
   conclusion — is dropped in the interest of brevity (p2, p5, p8, p10, p12, p16,
   p51, p57, p59, p65, p66, p67, p69, p72, p73, p74, p75, p76). Patching them one
   by one leaves the same habit in place in the parts a reviewer happened not to
   weight as blocking. Chapter 1 should be re-drafted against the source with an
   explicit instruction that every clause of every sentence must be represented.

3. **There is at least one outright reversal of meaning** (ch1 p62, B2) and one
   hedge-to-assertion upgrade (ch1 p8, B11), which means the compression is not
   only lossy but occasionally distorting.

Chapter 3 is the strongest of the three and would pass with the fixes listed above
(B14, B15, B16 plus the non-blocking table entries). Chapters 1 and 2 need a new
pass.

**Required before re-review:**
- Re-draft ch2 p4 from source ch2 p4; remove the invented opening from ch2 p5;
  remove the imported sentence from ch2 p1 and restore the chariot detail.
- Re-draft Chapter 1 against the source with clause-level coverage, taking in the
  blocking items B2, B4–B13 and every entry in the non-blocking table.
- Apply B14–B16 and the Chapter 3 table entries.
- Settle the three consistency policies: the indictment formula, the oaths, and
  the treatment of quoted verse (ch1 p61).
