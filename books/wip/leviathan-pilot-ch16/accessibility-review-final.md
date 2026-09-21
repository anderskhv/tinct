# Accessibility Review — Final Pass
## Leviathan, Edition Chapter 16 ("Of Other Laws of Nature") — candidate-sonnet.json

**Reviewer stance:** Blind read. I was not shown source.json, any drafter's notes, or prior review files. I read only `candidate-sonnet.json`.

**Coverage:** All 43 paragraphs read in full, start to finish, indices 0–42 (0-indexed as they appear in the `paragraphs` array — paragraph index 0 is "From the law of nature that obliges us…", paragraph index 42 is "People commonly call these dictates of reason 'laws'…"). No paragraph was sampled or skipped.

---

## Issues found

### Paragraph 2 (index 2) — overloaded sentence
> "So before the words 'just' and 'unjust' can have any meaning, there must be some coercive power to compel people equally to keep their covenants — by threatening a punishment greater than the benefit they'd expect from breaking the covenant — and to secure the property that people acquire by mutual contract in exchange for the universal right they give up."

This is a single sentence carrying four stacked clauses (the condition, the compulsion mechanism, the threat mechanism, and the property-securing function), with two of them nested inside em-dashes. A reader can follow it, but it requires holding a lot of structure in memory before the sentence resolves, and the "in exchange for the universal right they give up" tail is easy to lose the antecedent of on first pass. This matches the "overloaded sentence" already flagged in prior rounds — still present, still real, but it is a single instance in an otherwise dense definitional paragraph, not a pattern repeated elsewhere.

### Paragraph 3 (index 3) — unexplained legal reference
> "…rather like a point of law in Coke's Commentary on Littleton, where he says that if the rightful heir to the crown is convicted of treason, the crown will still pass to him, and the conviction becomes void the instant it does."

"Coke's Commentary on Littleton" is a specific 17th-century legal text (Edward Coke's gloss on Thomas Littleton's *Tenures*) that a general reader today has no reason to recognize. The sentence does explain what the legal point *is* (the treason/succession rule), so the reference isn't opaque — the reader can follow the argument without knowing who Coke was — but the proper noun itself will register as unfamiliar and mildly stalling, the kind of thing a reader either skims past or has to stop and wonder about.

### Paragraph 3 (index 3) — unexplained scriptural allusion
> "The fool has said in his heart that there's no such thing as justice…" and later "The kingdom of God is taken by force — but what if it could be taken by unjust force?"

Both are quotations/allusions to specific biblical passages (Psalm 14:1/53:1, and Matthew 11:12) that Hobbes's contemporary readers would have caught instantly and a modern general reader mostly won't. The text doesn't gloss either one. That said, both function rhetorically even without the reader catching the source — "the fool has said in his heart" reads as a recognizable idiomatic construction even to someone who doesn't place it in the Psalms, and "the kingdom of God is taken by force" is presented as a standalone aphorism Hobbes is examining, so the argument doesn't collapse if the allusion is missed. Real but low-stakes.

### Paragraph 25 (index 25) — triple-qualifier construction
> "…they don't always — or even often, or hardly ever — come out the winners."

This is a stack of three qualifiers running in a descending scale (always → often → hardly ever), all inside one negated clause. The logic is sound (the point is "wise men who try to dominate others rarely succeed, and hardly ever succeed"), but the syntax forces the reader to hold a negation across three time-adverbs and resolve their relative strength before the sentence lands. A reader is more likely to re-read this one than most other sentences in the chapter.

### Paragraph 18 (index 18) — dense but resolved metaphor
> "…much like the stones gathered for building a structure. A stone whose rough, irregular shape takes up more room than it fills, and whose hardness makes it hard to smooth down, gets in the way of the building and so is thrown aside by the builders as useless and troublesome."

This is Hobbes's masonry metaphor for unsociable temperament. It's doing real conceptual work in one image (shape, hardness, being discarded) and asks the reader to map three physical properties onto three social ones (difficult, stubborn, burdensome) without the mapping being spelled out until the next sentence. It reads as legitimately dense rather than a wording problem — a patient reader gets it, but it's the one place in the chapter that asks for real interpretive work rather than just vocabulary tolerance. This is the "dense metaphor" already on record from prior rounds; it hasn't been simplified further, and I don't think it needs to be — flattening it would lose the actual argument (Hobbes is making a point about incompatible temperaments, and the stone image carries that precisely).

---

## What reads well

The chapter's numbered-law structure (third law, fourth law, fifth law COMPLAISANCE, etc.) is very clean — each law is stated as a quoted maxim, then unpacked, which gives the reader reliable landmarks through 43 paragraphs of continuous argument. Technical terms are handled well throughout: "contumely," "pleonexia," "kleronomia," "in foro interno / in foro externo" are all defined in the same sentence they're introduced in, so a reader never has to sit with an undefined term. The master/servant example in paragraph 12 (index 12) and the golden-rule paragraph (index 38, "put them on the other side of the scale") are both genuinely clear, vivid illustrations that land without effort. The commutative/distributive justice paragraphs (indices 14–15) manage to explain a scholastic distinction and then correct it in plain, followable steps — that's a hard passage to render this cleanly.

The bracketed marginal-note fragments (e.g. index 2 "[Justice and property begin with the founding of a commonwealth.]", index 19 "[The seventh law: in taking revenge…]", index 33 "[The eighteenth law: no man should be judge who has in him a cause of bias.]") function as running headers and don't confuse the flow — a reader parses them as signposts, not as sentences needing full grammatical parsing.

Per instruction, I am not flagging the numbering jump to "the eighteenth law" (index 33) — noted as intentionally mirroring the source's own inconsistent numbering, not a defect.

---

## Overall verdict: **substantially accessible**

This chapter has reached the state where remaining difficulty is real but narrow. Two items are genuine, specific wording stumbles worth a light touch if there's still an editing pass to spend: the paragraph-2 overloaded sentence (a legitimate re-read risk) and the paragraph-25 triple-qualifier (also a genuine re-read risk, arguably the sharper of the two since the logic itself is easy to lose track of, not just the sentence length). Both are small, mechanical fixes — splitting a clause, or re-ordering the qualifiers — not rewrites, and neither would take more than a sentence-level edit.

The legal and scriptural references (Coke's Commentary on Littleton; the two biblical allusions) and the masonry metaphor are, in my judgment, not avoidable wording problems — they're inherent conceptual/cultural load in Hobbes's own argument. The text already does the right thing with them (it explains what the Coke reference *means* as a legal point even though it doesn't gloss who Coke was; it lets the biblical lines work as recognizable aphorisms even if the source isn't placed; it fully unpacks the stone metaphor within the same paragraph). Glossing "Edward Coke" or footnoting the Psalm citation would be a different kind of intervention (annotation, not accessibility rewording) and isn't what this pass is for.

**Bottom line for the merge owner:** if you're deciding whether to hold the chapter for one more round, I'd say don't — the two remaining items (paragraph 2, paragraph 25) are genuine stumbles but minor and localized, not evidence of a systemic problem, and the chapter otherwise reads as clear, well-signposted argumentative prose for a general adult reader. If an editor has five minutes to spend, those two sentences are where to spend them; everything else on this list is either unavoidable (the references, the metaphor) or already resolved well (the technical-term handling, the numbered-law structure).
