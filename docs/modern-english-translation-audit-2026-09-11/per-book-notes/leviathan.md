# Leviathan — Thomas Hobbes

- **Book ID:** `leviathan`
- **Scope:** public
- **Core English text:** `original-en` = Hobbes's own 1651 English (label "Hobbes (1651)"). No translator — this is an English original, not a translation. Complete: 49 chapters (Introduction + Hobbes ch1–47 + "A Review and Conclusion").

## Edition snapshot (Phase 1)

| Edition | sha256_16 | Chapters | Paragraphs | Words |
|---|---|---|---|---|
| original-en | `3ec71396aaa6dd37` | 49 | 1337 | 207,403 |
| modern-en | `e3462f5d27dbc2f5` | 49 | 1337 | 209,039 |
| modern-da | `8d4bddbe08112fe2` | 49 | 1337 | 198,526 |

Phase 1 mechanical: mean weighted similarity **0.6194**; identical long paragraphs **0.0%**; truncated 0; empty 0; para-count mismatches 0; `en_editions_aligned: true`; last chapter 3,971 words (not flagged short).

Word-count ratio modern/original = **1.008** — the modern edition is slightly *longer* than the source, the opposite of the "cosmetic edit" signature.

## Headline result: the May 2026 finding is OBSOLETE

`books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23) recorded Leviathan as "23 REAL-HEAVY (intro, ch1–22), remaining mix [LIGHT/MECHANICAL], **27 chapters (ch23–49) needing regen**". That is no longer true.

Re-running the project's own gate, `python3 books/classify-modern-en.py leviathan`:

```
leviathan original-en -> modern-en  (49 chapters)
  weighted similarity : 0.619   (gate: <= 0.75)
  light+mechanical    : 0/49 = 0.0%   (gate: <= 5%)
  identical long paras: 0/1292 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 2  REAL 47  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
```

**PASSES every gate. Zero LIGHT and zero MECHANICAL chapters.** I also computed an independent per-chapter character-level similarity (difflib `SequenceMatcher`, weighted by paragraph word count, paragraphs ≥30 words), which is the same family of metric the May document calibrated its buckets on (MECHANICAL ≥0.97, LIGHT 0.85–0.97, REAL 0.50–0.85, REAL-HEAVY <0.50). Every one of the 49 chapters scores between **0.046 and 0.281** — i.e. REAL-HEAVY on the May scale, with no outliers anywhere. The specific chapters the May audit flagged score: ch23 0.113, ch24 0.046, ch27 0.098, ch31 0.107, ch36 0.253, ch43 0.159, ch45 0.146, ch47 0.090, ch49 0.201.

I then confirmed this by reading, deliberately weighting the ch23–49 range. **The back half is genuinely, comprehensively rewritten.** The repair was completed, not left partial.

## Samples inspected (12)

I read 12 source/modern pairs: 5 in the previously-verified ch1–22 range and 7 in the ch23–49 range the May audit flagged.

### 1. Ch1 (Introduction), para 0 — opening, the artificial-animal conceit

> **SOURCE:** "Nature (the art whereby God hath made and governes the world) is by the art of man, as in many other things, so in this also imitated, that it can make an Artificial Animal. … The Wealth and Riches of all the particular members, are the Strength; *Salus Populi* (the Peoples Safety) its Businesse; Counsellors, by whom all things needfull for it to know, are suggested unto it, are the Memory; Equity and Lawes, an artificiall Reason and Will; Concord, Health; Sedition, Sicknesse; and Civill War, Death."

> **MODERN:** "Nature (the art by which God has made and governs the world) is imitated by the art of man in many things, and in this one too: that human art can make an Artificial Animal. … the wealth and riches of all the particular members are the strength; *Salus Populi* (the people's safety) is its business; counsellors, by whom all things needful for it to know are suggested to it, are the memory; equity and laws are an artificial reason and will; concord is its health; sedition its sickness; and civil war its death."

**Finding:** Strong. The whole body-politic catalogue survives item for item, the Latin tag is kept with its gloss, and the closing tricolon (concord/sedition/civil war) keeps its rhythm. The *Fiat* / *Let Us Make Man* allusion is preserved.

### 2. Ch5 (Hobbes ch4, "Of Speech"), para 3 — the four abuses of speech

> **SOURCE:** "Fourthly, when they use them to grieve one another: for seeing nature hath armed living creatures, some with teeth, some with horns, and some with hands, to grieve an enemy, it is but an abuse of Speech, to grieve him with the tongue, unlesse it be one whom wee are obliged to govern; and then it is not to grieve, but to correct and amend."

> **MODERN:** "Fourth, when they use words to wound one another. For since nature has armed living creatures — some with teeth, some with horns, some with hands — to wound an enemy, it is only an abuse of speech to wound a man with the tongue; unless he is one whom we are obliged to govern, in which case it is not to wound but to correct and amend."

**Finding:** Strong. The four-fold enumeration, the teeth/horns/hands image, and the "correct and amend" qualification all survive. "Grieve" (which now misleads) is correctly rendered "wound".

### 3. Ch14 (Hobbes ch13, state of nature), paras 5–6 — the three causes of quarrel

> **SOURCE:** "The first use Violence, to make themselves Masters of other mens persons, wives, children, and cattell; the second, to defend them; the third, for trifles, as a word, a smile, a different opinion, and any other signe of undervalue, either direct in their Persons, or by reflexion in their Kindred, their Friends, their Nation, their Profession, or their Name."

> **MODERN:** "The first use violence to make themselves masters of other men's persons, wives, children, and cattle; the second, to defend them; the third, for trifles — a word, a smile, a different opinion, and any other sign of low estimation, whether directly aimed at their own persons or by reflection at their kindred, their friends, their nation, their profession, or their name."

**Finding:** Strong. Competition/Diffidence/Glory kept as Hobbes's terms; the full six-item list of reflected insult survives.

### 4. Ch17 (Hobbes ch16, "Of Persons"), para 0 — **Phase 1 mechanical outlier #1**

This is the highest-similarity paragraph in the whole book on my metric (char-sim 0.953):

> **SOURCE:** `A PERSON, is he "whose words or actions are considered, either as his own, or as representing the words or actions of an other man, or of any other thing to whom they are attributed, whether Truly or by Fiction."`

> **MODERN:** `A PERSON is one “whose words or actions are considered, either as his own, or as representing the words or actions of an other man, or of any other thing to whom they are attributed, whether Truly or by Fiction.”`

**Finding: flag DISCONFIRMED as a defect.** This is Hobbes's own formal definition, set in quotation marks in the source. Leaving a quoted definition verbatim is correct editorial behaviour, not a mechanical-edit failure. Only the frame ("is he" → "is one") changes.

### 5. Ch32 (Hobbes ch31), para 29 — **Phase 1 mechanical outlier #2** (char-sim 0.882)

> **SOURCE:** "Fourthly, Not to swear by any but God, is naturally a signe of Honour: for it is a confession that God onely knoweth the heart; and that no mans wit, or strength can protect a man against Gods vengence on the perjured."

> **MODERN:** "Fourth, not to swear by any but God is naturally a sign of honour; for it is a confession that God only knows the heart, and that no man's wit or strength can protect a man against God's vengeance on the perjured."

**Finding: flag DISCONFIRMED.** A short sentence whose syntax is already modern; only spelling and one connective changed. There was nothing to untangle. Not evidence of a mechanical pass.

### 6. Ch24 (Hobbes ch23, "Of the Publique Ministers") — **first chapter of the May-flagged range**

> **SOURCE:** "And whereas every man, or assembly that hath Soveraignty, representeth two Persons, or (as the more common phrase is) has two Capacities, one Naturall, and another Politique … they that be servants to them in their naturall Capacity, are not Publique Ministers; but those onely that serve them in the Administration of the Publique businesse. And therefore neither Ushers, nor Sergeants, nor other Officers that waite on the Assembly, for no other purpose, but for the commodity of the men assembled, in an Aristocracy, or Democracy; nor Stewards, Chamberlains, Cofferers, or any other Officers of the houshold of a Monarch, are Publique Ministers in a Monarchy."

> **MODERN:** "Now since every man, or assembly, that has sovereignty represents two persons — or (as it is more commonly put) has two capacities, one natural and one political — a monarch having the person not only of the commonwealth but also of a man, and a sovereign assembly having the person not only of the commonwealth but also of the assembly — those who serve them in their natural capacity are not public ministers; only those who serve them in the administration of the public business are. So neither ushers, nor sergeants, nor any other officers who wait on the assembly for no other purpose than the convenience of the men assembled, in an aristocracy or a democracy, nor stewards, chamberlains, cofferers, nor any other officers of a monarch's household, are public ministers in a monarchy."

**Finding:** Strong, and decisive for the repair question. This is a genuine clause-level restructure — the long parenthesis is broken out with dashes, the negative list is re-ordered for readability — while every office in the list (ushers, sergeants, stewards, chamberlains, cofferers) survives. Not a dictionary substitution.

### 7. Ch27 (Hobbes ch26, "Of Civill Lawes"), para 5

> **SOURCE:** "For he is free, that can be free when he will: Nor is it possible for any person to be bound to himselfe; because he that can bind, can release; and therefore he that is bound to himselfe onely, is not bound."

> **MODERN:** "For he is free who can be free whenever he wills. Nor is it possible for any person to be bound to himself: for the one who can bind can release; and so the one bound only to himself is not bound at all."

**Finding:** Strong. The logical chain (can bind → can release → therefore not bound) is preserved exactly, including the force of the conclusion.

### 8. Ch31 (Hobbes ch30, "Of the Office of the Soveraign"), para 3

> **SOURCE:** "For he that deserteth the Means, deserteth the Ends; and he deserteth the Means, that being the Soveraign, acknowledgeth himselfe subject to the Civill Lawes; and renounceth the Power of Supreme Judicature; or of making Warre, or Peace by his own Authority; or of Judging of the Necessities of the Common-wealth; or of levying Mony, and Souldiers, when, and as much as in his own conscience he shall judge necessary; …"

> **MODERN:** "For he who deserts the means deserts the end; and he deserts the means who, being the sovereign, acknowledges himself subject to the civil laws, and renounces the power of supreme judicature, or of making war or peace by his own authority, or of judging of the necessities of the commonwealth, or of levying money and soldiers when and as much as in his own conscience he shall judge necessary, …"

**Finding:** Strong. The full seven-item enumeration of essential rights survives intact; the "Secondly" clause about keeping the people informed follows complete.

### 9. Ch43 (Hobbes ch42, "Of Power Ecclesiasticall"), para 70 — from the book's longest chapter (138 paragraphs)

> **SOURCE:** "Christian Doctors are our Schoolmasters to Christianity; But Kings are Fathers of Families, and may receive Schoolmasters for their Subjects from the recommendation of a stranger, but not from the command; especially when the ill teaching them shall redound to the great and manifest profit of him that recommends them: nor can they be obliged to retain them, longer than it is for the Publique good…"

> **MODERN:** "Christian doctors are our schoolmasters to Christianity; but kings are fathers of families, and may receive schoolmasters for their subjects from the recommendation of a stranger, but not from the command — especially when the ill-teaching of them shall redound to the great and manifest profit of the one who recommends them. Nor can they be obliged to retain them longer than it is for the public good…"

**Finding:** Strong. The schoolmaster/father metaphor and the pointed jab at the papacy's self-interest both survive. The recommendation-vs-command distinction (a logical distinction the standard specifically protects) is preserved.

### 10. Ch45 (Hobbes ch44, "Of Spirituall Darknesse"), para 12

> **SOURCE:** "Nor are the other rites, as of Marriage, of Extreme Unction, of Visitation of the Sick, of Consecrating Churches, and Church-yards, and the like, exempt from Charms; in as much as there is in them the use of Enchanted Oyle, and Water, with the abuse of the Crosse, and of the holy word of David, "Asperges me Domine Hyssopo," as things of efficacy to drive away Phantasmes, and Imaginery Spirits."

> **MODERN:** "Nor are the other rites — as of marriage, of extreme unction, of visitation of the sick, of consecrating churches and churchyards, and the like — exempt from charms; inasmuch as in them there is the use of enchanted oil and water, with the abuse of the cross, and of the holy word of David, 'Asperges me Domine hyssopo,' as things of efficacy to drive away phantasms and imaginary spirits."

**Finding:** Good, but **the lightest touch I found.** This is spelling normalisation plus dashes; "extreme unction" and "inasmuch" are left unexplained. It is still a real edit and reads correctly, but it shows the rewrite depth is not perfectly uniform across the back half. Compare sample 11 below, from two chapters later, which is markedly more thorough.

### 11. Ch47 (Hobbes ch46, "Of Darknesse from Vain Philosophy"), para 10 — the attack on the schools

> **SOURCE:** "Their Logique which should bee the Method of Reasoning, is nothing else but Captions of Words, and Inventions how to puzzle such as should goe about to pose them. To conclude there is nothing so absurd, that the old Philosophers (as Cicero saith, who was one of them) have not some of them maintained. And I beleeve that scarce any thing can be more absurdly said in naturall Philosophy, than that which now is called Aristotles Metaphysiques, nor more repugnant to Government, than much of that hee hath said in his Politiques; nor more ignorantly, than a great part of his Ethiques."

> **MODERN:** "Their logic, which should be the method of reasoning, is nothing but tricks of words and devices for puzzling anyone who tries to challenge them. In short, there is nothing so absurd that some of the old philosophers (as Cicero, himself one of them, said) have not maintained. And I believe that scarcely anything can be more absurdly stated in natural philosophy than what is now called Aristotle's Metaphysics, more contrary to government than much of what he says in his Politics, or more ignorant than a great part of his Ethics."

**Finding:** Strong — the deepest rewrite in my sample. Hobbes's contempt survives fully, the Cicero aside keeps its self-deprecating sting, and the triple Aristotle put-down keeps its escalating structure. Note this sample uses unspaced em-dashes and "humankind" elsewhere in the paragraph, versus the spaced em-dashes of ch43/ch49 — evidence of two generation passes, but both meet the standard.

### 12. Ch49 ("A Review and Conclusion"), para 16 — the final paragraph of the book

> **SOURCE:** "And in this hope I return to my interrupted Speculation of Bodies Naturall; wherein, (if God give me health to finish it,) I hope the Novelty will as much please, as in the Doctrine of this Artificiall Body it useth to offend. For such Truth, as opposeth no man profit, nor pleasure, is to all men welcome."

> **MODERN:** "And in this hope I return to my interrupted speculation of natural bodies — in which (if God give me health to finish it) I hope the novelty will as much please as in the doctrine of this artificial body it uses to offend. For such truth as opposes no man's profit, nor pleasure, is welcome to all men."

**Finding:** Strong. The ending is intact, including the wry closing aphorism and the "angry aspect / seeing but the backs" astrological conceit earlier in the paragraph.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| `pct_identical_long_paragraphs: 0.0` | **Confirmed.** My own scan found only 3 paragraphs ≥40 words at char-similarity ≥0.85 in the entire book, and I read all three (samples 4 and 5 above, plus ch16 p25, a short law-of-nature statement). All are legitimately near-identical. |
| `truncated_paragraphs_total: 0` | **Confirmed.** I ran an independent check for paragraphs where the source ends in terminal punctuation but the modern does not — **zero hits** in Leviathan. I also checked for paragraphs shrinking below 0.70× the source word count — **zero hits**. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `para_count_mismatches: 0` / `en_editions_aligned: true` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — ch49 is a genuine 3,971-word "Review and Conclusion". |
| Historical `MODERN-EN-REPAIR-STATUS.md` claim: ch23–49 LIGHT/MECHANICAL | **DISCONFIRMED.** Both mechanically (0/49 LIGHT or MECHANICAL on the project's own classifier) and by reading 7 samples inside that range. |

## Minor defect found (not in the Phase 1 flags)

`modern-en` contains **8 bracketed marginal headings that are absent from `original-en`**, e.g. ch13 p4 opens `[The Natural Cause Of Religion: The Anxiety Of The Time To Come.]`, and similarly at ch13 p19, ch13 p21, ch15 p16, ch16 p2, ch16 p18, ch16 p32, ch16 p37.

These are **not inventions** — they are Hobbes's own marginal summaries, which `original-en` runs straight into the body text ("The Naturall Cause Of Religion, The Anxiety Of The Time To Come The two first, make Anxiety."). Setting them off in brackets is an *improvement*. The defect is that it was applied to only 8 instances out of the many such marginal notes in the text, so the treatment is inconsistent and the two editions differ in a way the split-pane view will expose. Local, cosmetic, cheap to fix (either extend the treatment or drop it).

## Phase 3 — human-edition research

**Is the original already accessible enough?** No. This is the clearest case in my batch for a modern edition. Hobbes's 1651 English combines unfamiliar orthography (`onely`, `Soveraign`, `Common-wealth`, `endeavoureth`, `Joynts`), capitalised-noun convention, and very long periodic sentences. That is a substantial reader barrier, and the modern-en removes it.

**Candidates for a human modern-English Leviathan:**

1. **Jonathan Bennett, *Early Modern Texts* (earlymoderntexts.com)** — a well-regarded modernised Leviathan, freely readable.
   **Rights: NONCOMMERCIAL — RULED OUT.** The site's rights page states verbatim: *"Permission is not **and will not be** given for the texts to be put to any commercial use."* Only two payment exceptions are allowed (covering copy costs for students; college-bookstore course readers). Tinct is a commercial subscription product ($3/mo Premium), so this is unusable, and the wording forecloses seeking permission.
   Source: https://www.earlymoderntexts.com/faqs/rights

2. **Stanlick & Collette, *The Essential Leviathan: A Modernized Edition* (Hackett, 2016)** — in copyright, and *abridged* ("essential"). Not suitable on either count.
   Source: https://www.amazon.com/Essential-Leviathan-Modernized-Thomas-Hobbes/dp/1624665209

3. **David G. Payne, *Leviathan: A Modernized English Edition* (2021)** — in copyright, self-published, no licence for reuse.
   Source: https://www.amazon.com/Leviathan-Modernized-English-Thomas-Hobbes/dp/B09M5KZV9F

4. **Public-domain full texts** — Standard Ebooks (https://standardebooks.org/ebooks/thomas-hobbes/leviathan), Project Gutenberg #3207, and the Molesworth *English Works* vol. III at Liberty Fund (https://oll.libertyfund.org/titles/hobbes-the-english-works-vol-iii-leviathan) are all public domain and complete — but they are the **1651 text itself**, not a modernisation. They would substitute for `original-en`, not for `modern-en`.

**Conclusion:** no rights-clear, complete, human modern-English Leviathan exists. The in-house `modern-en` is the right artefact, and it is now good.

## Ratings

| Dimension | Weight | Score | Note |
|---|---|---|---|
| Fidelity / completeness | 40% | **5** | Zero truncations, zero omissions, zero alignment breaks; word ratio 1.008; 12 samples all complete |
| First-read clarity | 25% | **5** | Removes a genuine, severe 1651 barrier |
| Literary voice | 20% | **4** | Hobbes's dryness, contempt and rhythm survive; slight unevenness in rewrite depth (ch45 lighter than ch47), and the inconsistent bracketed marginalia |
| Restraint / no invention | 10% | **5** | No added interpretation, motive, or fact found in 12 samples |
| Naturalness | 5% | **5** | Reads as connected modern prose, not mechanically chopped |

**Weighted score: 4.8 — band: Strong.**

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **high**. Correction scope: **local** (only the 8 inconsistent bracketed marginalia, which are cosmetic).

The single most important output of this review: **the 2026-05-23 "ch23–49 needs regen" finding is stale and should be retired.** Leviathan's back half was repaired and now passes the project's own similarity gate with zero LIGHT/MECHANICAL chapters. `books/MODERN-EN-REPAIR-STATUS.md` should be annotated so no future session re-does this work.

## Limitations of this review

- I read **12 of 1,337 paragraphs** (~0.9%). "Strong in 12 samples spread across the full chapter range" is not "the whole book is verified line by line."
- Mechanical coverage *is* whole-book: the similarity, truncation, shrinkage, near-identity, and bracket scans above ran over all 1,337 paragraphs, so I can speak with confidence about the *absence of mechanical-failure patterns* everywhere, and with sample-level confidence only about editorial quality.
- I did **not** assess `modern-da` at all. Note that per `MODERN-EN-REPAIR-STATUS.md`, the Danish was generated from `modern-en`; since much of `modern-en` was regenerated after that document was written, `modern-da` may have been produced from the older text and needs its own check. That is out of scope here but worth flagging.
- I did not verify Hobbes's scriptural citations against a Bible, nor his Latin tags against their sources.
- I did not check audio alignment or the reader's split-pane rendering.
