# Consistency pass: Symposium Modern English, candidate v3

**Role.** Independent consistency reviewer. I did not write the text. The pass covers the whole book for terminology, speaker attribution, the quotation convention, house style and general consistency.

**File read.** `/tmp/claude-0/-home-user-tinct/54b00ab4-dad2-52ef-afee-a77495173b29/scratchpad/acc/review-in/v3-full-text.md`. I read all 226 paragraphs in order, 1.0 to 8.46, and checked them against `books/wip/symposium-accessibility/STYLE.md`, which I also read in full.

**Also consulted (read-only):**
- Jowett's source (`scratchpad/acc/base-original-en.json`), for attribution and terminology questions.
- The accepted baseline modern-en (`scratchpad/acc/base-modern-en.json`), only to label each finding as *introduced in v3* or *baseline wording*. 64 paragraphs of v3 are identical to the baseline; 162 were changed by this pass.
- The live character-card file (`app/public/data/characters/symposium.v1.json`), only to check the spelling of Mantineia.

I wrote no file other than this one.

## Verdict: CONSISTENT WITH CHANGES

The edition is consistent in nearly everything the glossary governs:
- lover and beloved are never blurred;
- Heavenly and Common are capitalized only when naming;
- lack and want are separated cleanly;
- "fair" survives only in its "just" sense;
- self-control and moderation, god and gods, Greece and Sparta, and correct opinion all follow the glossary;
- the ascent terms line up between 7.62, 7.63 and 7.65;
- dinner, ribbons, revelers, hiccups, busts of Silenus, "insolent", and servants and attendants all follow the glossary.

The quotation mechanics are sound. Every continuation reopens and closes correctly, verse nesting follows §3.4, and the double quotes balance in every paragraph. House style is clean: American spelling, straight quotes, spaced em-dashes as the only non-ASCII character, and the contraction rule respected.

Six items should still be fixed. Each is a phrase or a tag, and none needs restructuring:
- 8.26 contradicts STYLE §1a's own documented example.
- The Diotima set speech (7.45) opens without the tag §3.1 requires.
- In three places in the Diotima dialogue, §3.5 tagging was applied only partly, so a first-time reader can give a line to the wrong speaker (7.47, 7.51, 7.52).
- One name form was changed without documentation (Mantinea).

## Findings

| # | Coordinate(s) | Category | Severity | Finding | Exact words | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 8.26 | other (source policy) | SHOULD-FIX | STYLE §1a cites 8.26 "hearing him tell what he knew" as a Jowett softening that "stays in Jowett's words". The baseline had those words. v3 replaced them, and "everything" is the Greek *panta*, not Jowett. The text and STYLE now disagree. *Introduced in v3.* | `I thought this gave me a wonderful opportunity to hear from him everything he knew` | `I thought this gave me a wonderful opportunity of hearing him tell what he knew`. If the change is intended, amend §1a instead. |
| 2 | 7.44–7.45 | attribution / quotation | SHOULD-FIX | Socrates's account of Diotima is a §3.1 set speech but has no introducing tag. After 44 paragraphs of quoted exchange, the same speaker goes on unquoted with no cue. Until then, the only unquoted paragraphs mid-exchange were narration (7.3, 7.31 "He assented."). The line before it (7.44) is also untagged. Every other set speech has a tag (2.0, 3.0, 4.0, 5.0), a chapter opening after an announcement (5.17→6.0), or a tagged announcement (8.22→8.23). *Introduced in v3; the baseline kept 7.45 in quotation marks.* | 7.44 `'Say instead, my beloved Agathon, that it is the truth you cannot refute; for Socrates is easily refuted.'` / 7.45 `And now, Agathon, I will let you go, and tell you about love as I once heard it from Diotima of Mantinea` | Open 7.45 with a tag on the 3.0/5.0 pattern: `Socrates went on: And now, Agathon, I will let you go, …`. Optionally tag 7.44 as well: `'Say instead, my beloved Agathon,' said Socrates, 'that it is the truth …'`. |
| 3 | 7.50–7.51 | attribution | SHOULD-FIX | This is the core §3.5 case: an untagged change of speaker straight after a tagged line, here at the start of a paragraph. In this edition a paragraph may open with a continuation mark (7.48, 7.52), so the paragraph break gives no cue. The reader learns the question was Diotima's only at "'All people,' I replied." §3.5 lists 7.51 as tagged, but the only tag added there is the closing "She went on:". *Jowett's layout, carried over.* | end of 7.50 `'You are right,' I said.` → 7.51 `'And is this wish, this desire, shared by everyone? Do all people always desire their own good, or only some? What do you say?' 'All people,' I replied.` | `'And is this wish, this desire, shared by everyone?' she asked. 'Do all people always desire their own good, or only some? What do you say?'` |
| 4 | 7.47 | attribution | SHOULD-FIX | Five untagged changes of speaker in a row within one paragraph, starting right after Socrates's tagged question. §3.5 assumes an untagged line continues the previous speaker, so 'No.' reads as Socrates answering his own question, and the alternation stays uncertain until the vocative "Diotima". 7.47 is not among the paragraphs §3.5 lists as tagged. *Jowett's layout, carried over.* | `'Then what is Love?' I asked. 'Is he mortal?' 'No.' 'What, then?' 'As in the other cases, he is neither mortal nor immortal, but something in between.' 'What is he, then, Diotima?'` | `'No,' she said.` This one tag restores the alternation, and the vocative in "What is he, then, Diotima?" carries the rest. |
| 5 | 7.52 | attribution | SHOULD-FIX | The untagged question about "forever" follows Socrates's untagged reply, so it reads as Socrates continuing. That gives him the key step, "forever", on which 7.54's "love is love of immortality" rests, and turns "We must add that too." into Diotima's assent. *Jowett's layout, carried over.* | `'And we must add that they love to possess the good?' she asked. 'Yes, we must add that.' 'And not only to possess it, but to possess it forever?' 'We must add that too.'` | `'And not only to possess it,' she asked, 'but to possess it forever?'` |
| 6 | 7.45, 7.65 | house style (name forms) | SHOULD-FIX | "Mantinea" replaces Jowett's "Mantineia", which is also the baseline form and the form in the live character-card text ("The wise woman from Mantineia …"). §4 modernizes only Heraclitus and Diomedes and says other names keep Jowett's forms. v3 is consistent with itself, but the change is not documented. *Introduced in v3.* | 7.45 `Diotima of Mantinea`; 7.65 `said the woman from Mantinea` | Restore "Mantineia" in both places. Alternatively, add a §4 row (Mantineia → Mantinea, the standard modern form; onboarding already uses it) and record the mismatch with the card text in the card-impact notes. |
| 7 | 1.14–1.15 | attribution | OPTIONAL | 1.14's §3.5 tag names Aristodemus, which makes him the nearest antecedent of "he said" in 1.15; the speaker there is Socrates. The content ("Follow me") settles it. Jowett's own pronoun tags right after the other speaker's named tag (1.24, 7.9, 7.23, 7.27) are clear from their content and need nothing. *Introduced in v3.* | `'I'll do whatever you tell me,' Aristodemus replied.` / `'Follow me, then,' he said, 'and let's demolish the proverb:` | `'Follow me, then,' said Socrates, 'and let's demolish the proverb:` |
| 8 | 3.0 | terminology (Love/love) | OPTIONAL | Jowett has "as the other love is called heavenly", in lowercase. v3 capitalizes it. This matches "two Loves" and the parallel "the Love who works alongside her", so it reads consistently, but it departs from the rule "as Jowett capitalizes". *Baseline wording.* | `just as the other Love is called Heavenly` | Keep it and note the exception in §4, or lowercase it: `just as the other love is called Heavenly`. |
| 9 | 3.1 | terminology (pronoun for Love) | OPTIONAL | The capitalized Love is called "who" and then "It". The glossary pairs Love (the god) with "he". *Baseline wording, kept when 3.1 was edited.* | `The Love who is the offspring of the Common Aphrodite is essentially common and makes no distinctions. It is the love the baser sort of men feel` | `… makes no distinctions. This is the love the baser sort of men feel`. This also mirrors the paragraph's later "This is the love that is directed toward youths". |
| 10 | 3.4 | terminology (lover/beloved) | OPTIONAL | "his love" names the person being pursued, and the glossary gives "his beloved" for that sense. However, §6 keeps 3.4's accepted wording. *Baseline wording.* | `And in pursuing his love, custom allows him to do many strange things` | Leave it unless the accepted-wording protection is lifted; then `And in pursuing his beloved, …`. |
| 11 | 3.9 | terminology (Love/love) | OPTIONAL | Jowett has "in praise of love", in lowercase. v3 capitalizes it, against the rule "as Jowett capitalizes". Every other "praise/honor of Love/love" follows Jowett (1.0, 1.46, 1.47, 4.5, 5.16, 7.68, 8.13). *Baseline wording.* | `I offer this contribution of mine in praise of Love` | `… in praise of love` |
| 12 | 5.14–5.15; 7.29–7.30 | attribution | OPTIONAL | In both places the speaker changes after a tagged line with no new tag. Each paragraph holds one turn. In 7.30 Socrates's line begins "Yes" straight after "'Yes,' said Agathon.", which invites hearing Agathon continue, especially aloud. In 5.15 the line can briefly pass for Agathon's counter-question until 5.16 corrects it. | `'Yes,' said Agathon.` / `'Yes, my friend, and you were right to say it.`; `'Yes,' said Agathon.` / `'But in front of the crowd you would not be ashamed, if you thought you were doing something disgraceful in front of them?'` | `'Yes, my friend,' said Socrates, 'and you were right to say it. …'`; `'But in front of the crowd,' Socrates went on, 'you would not be ashamed, …'` |
| 13 | 7.0, 7.8 | house style | OPTIONAL | Two questions introduced by a colon begin with a capital letter, following Jowett. Everywhere else such a question begins in lowercase, including later in 7.0 itself and at 7.10, 7.40, 7.50 (three times), 7.53 and 8.0. | 7.0 `may I ask you one more thing: Is love the love of something, or of nothing?` vs 7.0 `if I asked about a father: is a father the father of something?`; 7.8 `'I will ask about Love: Is Love of something, or of nothing?'` | Lowercase "is" in both places. |
| 14 | 7.20 | quotation | OPTIONAL | The imagined man's words are marked with double quotes when first quoted. When Socrates's imagined reply repeats them, at the third level, they are left unmarked. *Baseline wording.* | `So when you say, I desire what I have and nothing else, don't you really mean that you want to have in the future what you have now?` | `So when you say, 'I desire what I have and nothing else,' don't you really mean …` (the third level returns to single marks). |
| 15 | 7.42 | terminology (pronoun for Love) | OPTIONAL | v3 refers to the love under examination as "it". In the same argument the pronoun elsewhere is "he" (7.10, 7.12, and 7.46 "because love is not beautiful and good, he must be ugly and bad"). Jowett avoids a pronoun here. *Introduced in v3.* | `'Then if love lacks what is beautiful, it lacks what is good as well?'` | `'Then if love lacks what is beautiful, love lacks what is good as well?'` (as Jowett: "love wants also the good"). |
| 16 | 7.46; 7.54 | attribution | OPTIONAL | Untagged short replies remain after the §3.5 fixes. Two of them can be read as the other speaker answering her own rhetorical question. In 7.46, "He can't." can pass as Diotima's self-answer, which loses Socrates's concession. In 7.54, "What, then?" and the answer after it can pass as Diotima's own question and answer. The one-word assents are clear from context: 7.46 "Everyone.", "Yes.", "Yes, I have."; 7.51 "True."; 7.52 "Certainly not, I would say.", "Yes, we must add that.", "We must add that too.", "That is very true." | 7.46 `'But how can anyone be a god who has no share in what is good or beautiful?' 'He can't.' 'Then you see that you, too, deny that Love is a god.'`; 7.54 `love of the beautiful only.' 'What, then?' 'The love of procreation and of giving birth in beauty.'` | `'He can't,' I said.`; `'What, then?' I asked.` Leave the assents as they are. |
| 17 | 7.49 | other (punctuation) | OPTIONAL | Two colons in one sentence. The baseline had a dash here. *Introduced in v3.* | `For this is what is so bad about ignorance: someone who is neither good nor wise is nevertheless satisfied with himself: he does not desire what he does not feel he lacks.` | `… satisfied with himself — he does not desire what he does not feel he lacks.` |
| 18 | 8.45 | terminology (beautiful) | OPTIONAL | v3 renders Jowett's "the fair" as "the beautiful ones". The glossary gives "beautiful people / the beautiful", used at 4.0 and 8.26. *Introduced in v3.* | `nobody else has a chance with the beautiful ones` | `nobody else has a chance with beautiful people`, or keep it as a natural variant. |
| 19 | 8.46 | other (source policy) | OPTIONAL | "from left to right" is not in Jowett, who has "a large goblet which they passed round". It is a Greek-based addition of the kind §1a excludes. *Baseline wording, not touched by this pass.* | `drinking from a large bowl that they passed around from left to right` | Delete "from left to right", or document it as a deliberate echo of 1.46 and 8.13. |
| 20 | 8.46 | other (style) | OPTIONAL | "leaving … left" is an awkward repetition. *Baseline wording.* | `Someone leaving had left the front door open` | `Someone on the way out had left the front door open` |

**Counts:** 6 SHOULD-FIX, 14 OPTIONAL.

## 1. Terminology

These glossary items are consistent across the whole book.

**Lover and beloved.**
- The roles are never blurred or swapped: 2.4–2.7, 3.4–3.9, 5.4, 7.49, 8.27, 8.29, 8.38.
- 2.7 states plainly that Patroclus is the lover and Achilles the beloved.
- "Their beloveds" appears at 2.4 and 8.27.
- "My beloved Agathon" appears at 7.44.
- 8.38, "He begins as their lover, and ends by making them court him instead", follows Jowett.
- Aristophanes's "our own true loves" and "his own original true love" (5.6) describe his symmetrical halves, not the lover/beloved pairing, and are left as Jowett has them.
- The only open point is 3.4 (row 10).

**Heavenly and Common.**
- Capitalized only when naming: 3.0, 3.1, and 3.9 ("the Heavenly Goddess", "the Common one").
- Lowercase when descriptive: 3.1 "essentially common", 3.6 "the common lover", 3.9 "heavenly love", and 4.3 "the noble, heavenly love … the common love".

**Love and love.**
- I compared the capitalization with Jowett paragraph by paragraph. The only deviations are 3.0 and 3.9 (rows 8 and 11).
- The other paragraphs with an extra capital are 3.1 "this Love's mother", 6.3 "everyone serves Love" and 7.48 "That is why Love". Each replaces a Jowett pronoun with the name.
- 7.0 "whose child Love is" is the documented gloss.
- A reader will notice Jowett's mixed capitals within a sentence at 6.2 ("belongs to Love above all; gracelessness and love"), at 6.4 ("whom love inspires … anyone Love has not touched") and at 4.0 ("the god of love"). The glossary requires them, so they are not raised.
- The pronoun for Love slips to "it" at 3.1 and 7.42 (rows 9 and 15).

**Lack and want.**
- Every "want" in v3 means desire: 1.0, 1.33, 1.46, 3.1, 5.1, 5.4, 5.5, 6.10, 7.0, 7.20, 7.60, 8.5, 8.12, 8.27, 8.31, 8.35, 8.37, 8.39, 8.43.
- Every Jowett "want" in the sense of lack in the argument is rendered "lack": 7.14, 7.18, 7.24, 7.26, 7.32–7.36, 7.42, 7.46, 7.49 and 8.24, and also 5.4 and 5.13.
- Outside the argument, v3 renders the lack sense without "want" in three places: 7.49 "never without resources" (Jowett "never in want"), 7.55 "I need a teacher" (Jowett "I want a teacher") and 8.23 "in need of the gods". These read naturally and do not blur the lack/desire distinction, so they are not raised.

**Beautiful, noble and base.**
- No "fair" or "foul" in the *kalos* sense remains. "Fair" survives only as "just" (8.13, 8.14) and in "fairly argue" (3.5).
- The moral sense is rendered "noble/base": 4.1 "the noble love from the base", and 4.3, where "noble, heavenly love" sits next to "the beautiful and heavenly Muse". That is one Jowett word rendered two ways in one sentence, correctly by the glossary rule.
- Also 3.8 'uses base' and 7.47 "lowly and base".
- 8.45 is the only variant (row 18).

**Self-control and moderation.**
- "Self-control" appears at 4.3, 4.5, 6.3, 7.59, 8.26 and 8.31.
- "Moderation" appears only in Eryximachus's physics (4.4). No "temperance" or "temperate" remains.

**God and gods.**
- Every Jowett "God" is rendered "a god" (2.7), "the god" (5.5, 5.6), or "the gods"/"gods" (7.47, 7.66, 8.14).
- The only capital is "the God of War" (6.3), as the glossary specifies.

**Places, peoples and doctrine terms.**
- Greece and Greeks: 1.34, 2.6, 7.60, 7.61. Sparta and Spartans: 3.3, 5.5, 7.60. Barbarians: 3.3, 7.61. No "Hellas" or "Lacedaemon" remains.
- "Correct opinion" (7.46) is kept in full.
- "Spirit" is glossed once, at 7.47 ("A great spirit — a daimon —"). Dashes replace Jowett's parentheses, which suits §5. After that it is plain "spirit" (7.47, 7.49).
- "Poros, or Plenty", "Metis, or Prudence" and "Penia, or Poverty" appear at 7.47 exactly as in the glossary, then "Plenty" and "Poverty" at 7.48.
- "Physical training" appears at 3.3, 4.1 and 7.52; "gymnastic" does not appear.

**The ascent.**
- "Bodies" and "bodily beauty": 7.60, 7.62, 7.63, 7.65.
- "Practices and laws" at 7.63, and "practices" at 7.63 ("one practice") and 7.65.
- "Branches of knowledge" at 7.63 and 7.65, and also at 7.56 for Jowett's "sciences", which is consistent.
- "Soul" for Jowett's "mind" at 7.62.
- No "forms" appears in the ascent sense. "Form" elsewhere means shape or kind (6.2, 7.52, 7.64).

**Dinner and dine.**
- Used throughout: 1.25, 1.26, 1.33, 1.35, 1.36, 8.27, 8.28, 8.35.
- "Supper" appears once, at 1.0 ("Agathon's supper"), the glossary's exception for the named meal. A reader may notice "supper" there and "dinner" from 1.25 on. The glossary permits it, so it is not raised.

**Other listed terms.**
- ribbons: 8.0, 8.2, 8.5
- revelers: 8.0, 8.46
- hiccups: 3.10, 3.11, 4.5, 4.6
- busts of Silenus: 8.23, 8.37, with "opens the bust" at 8.37, "a Silenus" and "the carved head of the Silenus" at 8.26, and "this Silenus drama" at 8.39
- insolent: 8.23, 8.37

**Servants and attendants.**
- These match Jowett at every occurrence: 1.25, 1.30, 1.33, 8.0, 8.6, 8.27, 8.28, 8.29.
- "Boy" is used as an address at 1.29.
- "Slave" appears only where Jowett has it (3.5, 7.63).

**Other glossary rows.**
- genitals: 5.0, 5.3
- sex: 5.4
- women who take female lovers: 5.3
- "encomium" once, at 7.68
- Heraclitus (4.1) and Diomedes (8.29)
- "of the deme of Myrrhinus" (1.41) and "of the deme of Cydathenaeum" (1.7)
- Otys, Athene, Kronos and Acusilaus are kept in Jowett's forms.

**Deviations from the glossary:** rows 6, 8, 9, 10, 11, 15 and 18.

## 2. Speaker attribution

**Chapter 1.** The three narrative levels read clearly.
- 1.0–1.7 is Apollodorus's first-person narration, with the Glaucon exchange in single quotes. Both are named: "Apollodorus!" (1.0), "Glaucon," (1.1), "said Glaucon" (1.7).
- 1.8–1.11 use Jowett's speaker labels.
- Aristodemus's retold account starts at 1.12, where "He said that he met Socrates" follows "the exact words of Aristodemus".
- The §3.5 tags at 1.14, 1.26, 1.28 and 1.32 are present, and 1.20 has "said Aristodemus".
- The narrator's later "I/me" (1.48; 3.10 "the wise have taught me") is Apollodorus and reads as the storyteller.
- The only point is 1.15 (row 7).

**Tagged exchanges.** In 1.25–1.47, 3.10–3.11, 4.6–4.9, 5.8–5.17, 6.7–6.12, 8.0–8.19, 8.22 and 8.39–8.45, every change of speaker is tagged, with three exceptions: 5.15 (row 12) and 8.20–8.21 (see the next point).

**7.0–7.44 (Socrates and Agathon).**
- Each paragraph holds one turn, and questions and answers strictly alternate, as in Jowett's layout.
- The speaker changes without a tag after a tagged or narrated line at 7.2, 7.4, 7.6, 7.10, 7.16, 7.24, 7.28, 7.30, 7.32, 7.34, 7.36, 7.41 and 7.44.
- Read literally, §3.5 would tag all of these, but only 7.30 carries a real risk of misreading (row 12). I do not recommend tags for the rest: they would clutter the argument without helping the reader.
- The same applies to 8.20–8.21, where the content identifies the speakers ("if you will permit me" / "I not only permit").

**7.45–7.68 (Socrates's account of Diotima).**
- The tags §3.5 claims for 7.45, 7.46, 7.50, 7.51, 7.52 and 7.54 are all present.
- The tagging was applied only partly. The gaps are 7.47 (row 4), the first line of 7.51 (row 3), 7.52 (row 5) and the remaining short replies (row 16).
- At 7.55, the untagged "But Diotima, …" is identified by its vocative.
- The narrative "I" and "she" are unambiguous, since Diotima is the only woman who speaks.
- The set speech itself opens without a tag (row 2).

**Chapter 8.**
- Alcibiades's set speech is introduced by the tagged line at 8.22.
- His reported exchange with Socrates at 8.29–8.30 is fully tagged, including the §3.5 tag at 8.29.
- The warning to Agathon at 8.38 is clearly his.

## 3. Quotation convention

**Set speeches** are unquoted, each with an introducing tag or chapter context:
- 2.0 "Phaedrus began by declaring"
- 3.0 "Pausanias began:"
- 4.0 "Eryximachus spoke as follows:"
- 5.0 "He began:"
- 6.0 opens the chapter after 5.17's "First I will say how I ought to speak, and then I will speak."
- 7.0 follows 6.12's "Socrates then proceeded as follows:", the accepted design.
- 8.23 follows the tagged "Then I'll begin at once" at 8.22.

The exception is 7.45 (row 2).

**Exchanges** are in single quotes, with nested quotations in double quotes: 1.17, 1.46, 6.10, 7.14, 7.20, 7.50, 7.51, 7.56 and 8.22. The number of double quotes is even in every paragraph. The one gap is the third-level quotation at 7.20 (row 14).

**Single quotes inside unquoted set speeches.**
- Past or imagined conversations: 5.1–5.2 (Zeus), 5.5 (Hephaestus), 7.45–7.66 (Diotima), 8.29–8.30 (Socrates).
- Quoted words and sayings: 3.8 'uses base', 5.0 'androgynous', 6.4 (the Euripides fragment), 8.28 (the proverb), 8.38 (the warning to Agathon).

**Speeches continuing across paragraphs** reopen at each new paragraph and close only where the speech ends: 1.15–1.19, 1.20–1.22, 1.44–1.46, 5.1–5.2, 6.9–6.10, 7.47–7.49, 7.51–7.52, 7.53–7.54, 7.55–7.57, 7.58–7.66, 8.0–8.1, 8.10–8.12 and 8.29–8.30. No quotation closes too early, and every other paragraph balances.

**Verse.**
- Verse inside a quoted conversation is nested in double quotes after the continuation mark: 1.16, 1.18, 1.21, 1.45, 8.11.
- 1.23 is the start of Socrates's own quoted reply, so single quotes are correct there.
- Verse inside an unquoted set speech takes single quotes: 2.1, 2.3, 6.1, 6.5, 8.34.
- The wording of the verse lines is unchanged from the baseline except for the quotation marks §3.4 requires.

**Other.** Jowett's speaker labels at 1.8–1.11 are the only dialogue not in quotation marks. They match the source's frame and are outside §3's scope.

## 4. House style

- **American spelling.** No British forms found. Checked: honor, favor, behavior, splendor, valor, labor(s), colors, marvelous, revelers, theater, defense, offense, armor, gotten, and "practice" as a verb. "Toward" is used throughout.
- **Quotes and dashes.** Only straight quotes are used. The only non-ASCII character is the em-dash (216 occurrences). All are spaced except the closing `—"` at 1.45, which is baseline and correct at a quotation boundary. I found no doubled words, spacing errors, a/an errors or unbalanced double quotes.
- **Contractions.** None appear in the set speeches of Phaedrus, Pausanias (apart from the accepted 3.0 and 3.4), Eryximachus, Aristophanes or Agathon. None appear in Socrates's narrating voice at 7.45–7.68 or in Diotima's long expositions (7.56–7.66). They are used where §6 allows them: in conversation, in the remembered Socrates–Diotima dialogue (7.45, 7.46, 7.53, 7.55) and throughout Alcibiades's speech (8.23–8.30, 8.38).
- **Name forms.** The glossary forms are present, and possessives are uniform ("Socrates's", "Aristophanes's", "Marsyas's", "Harmodius's"). The exception is "Mantinea" (row 6).
- **Colon before a question.** Inconsistent capitalization (row 13).
- **Serial comma (observation, not raised).** Usage is mixed. Most lists have none (2.7, 4.4, 5.1, 6.4, 6.6, 7.47, 7.48, 7.64, 8.24); some do (1.0, 2.4, 3.1, 3.2, 3.7, 4.3, 5.0, 7.58, 8.46). STYLE sets no rule, and the difference is inaudible when read aloud.

## 5. Other consistency

**Voices.** I found no drift. Each set speech keeps its register, and Agathon's balanced ornament is intact (6.6). Apart from Pausanias's accepted wording at 3.0 and 3.4, Alcibiades's is the only set speech with contractions and colloquial turns.

**Images and repeated phrases** are rendered consistently:
- the broken token (5.3, 5.6)
- the Silenus busts (8.23, 8.26, 8.37, 8.39)
- "can hardly keep his hands off me" (8.4, 8.14)
- "at my wit's end" (8.25, 8.31)
- "brought order to the affairs of the gods" (6.4, recalled word for word at 7.28)
- "from left to right" (1.46, 8.13) and "the man on my/his right" (8.13, 8.43)
- Diotima's "in between" for Jowett's "mean" and "intermediate" (7.45–7.49)
- "procreation" and "giving birth in beauty" (7.53–7.55)
- "the porch" (1.30, 1.33)

**Archaisms, typos and grammar.**
- No residual archaisms of note. "Recollect" (1.48) is baseline and plain, and "shall" is used idiomatically.
- No typos or doubled words found.
- Grammar and punctuation points are rows 17 and 20.

**Source policy (§1a).**
- Raised: 8.26 (row 1) and 8.46 (row 19).
- Checked and not raised: 8.28 renders the proverb as "'wine and boys tell the truth' — and wine does, with boys or without them". This spells out the allusion that Jowett's own note flags ("In allusion to two proverbs"). I read it as a §1a/§5 gloss of Jowett's reference rather than a Greek-based departure. The source reviewers should confirm if they read it differently.
