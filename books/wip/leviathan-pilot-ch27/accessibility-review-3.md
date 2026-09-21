# Accessibility Review — Round 3 (Reviewer A, fresh read)

**Book/chapter:** Leviathan, Chapter 26, "Of Civil Laws" (candidate-sonnet.json, chapter object numbered 27)

**Coverage:** Read all 48 paragraphs in `candidate-sonnet.json`, start to finish, in full (paragraph indices 1–48 in array order, none skipped or sampled). I did not read source.json, current-modern-en.json, or any prior review file — per instructions I have no visibility into what Round 2 flagged, so I cannot state directly which Round 2 items were fixed. What follows is a fully independent fresh-eyes pass; a merge owner can diff this against Round 2's list to see what closed and what's new/still open.

---

## Paragraph-by-paragraph issues

**Paragraph 5** — "none but the sovereign can **abrogate** a law once made; because a law is not **abrogated** except by another law." "Abrogate" is unglossed legal vocabulary that will stop general readers; the chapter uses the plain word "repeal" elsewhere (same paragraph area: "repealing the laws," paragraph 6), so this isn't a case where no simpler word was available — it's an inconsistency. Recurs at paragraphs 37, 38, and 48 ("has now been **abrogated**"). This is the single most avoidable recurring issue in the chapter: five unglossed uses of a word a general reader may not know, sitting alongside a simpler synonym already in use nearby.

**Paragraph 9** — "they are now laws not by virtue of **prescription of time**, but by the constitutions of their present sovereigns." "Prescription" here is a legal term of art (a right acquired through long, unchallenged use) with no relation to its common modern meaning (a doctor's prescription). Ungwlossed, a general reader will either misread it or stall. Easy fix: gloss inline the first time ("prescription of time — that is, a right created merely by long custom") or replace with plain language.

**Paragraph 11** — "(as Sir Edward Coke makes it, upon Littleton, lib.2, ch.6, fol.97.b)". This is a citation a general reader won't be able to parse (abbreviated volume/chapter/folio format). I'm flagging it per the prompt's instruction to note references readers won't recognize, but I don't think this is fixable by rewording — it's a factual citation to a specific historical text, not translatable prose. I'd class this as unavoidable (the alternative is dropping scholarly precision), not a wording problem.

**Paragraph 18** — "the sentence of the judge who, by commission, has authority to take **cognisance** of such cases." "Cognisance" (= authority to hear/decide) is unglossed and moderately obscure; "authority to hear such cases" would carry the same meaning with zero loss and no stumble.

**Paragraph 21** — "there is still another very important condition **still** lacking before they are binding." Two "still"s in one clause read as a typo/redundancy rather than intentional emphasis — this is a natural-flow snag, not a vocabulary one. Easy fix: drop one "still."

**Paragraph 22** — "The unwritten law of nature, though easy to those who without partiality or passion make use of their natural reason — and therefore leaves its violators without excuse — has nevertheless, considering that there are very few, perhaps none, who in some cases are not blinded by self-love or some other passion, now become the most obscure of all laws." This is the single most overloaded sentence in the chapter: a parenthetical dash-clause interrupts subject and verb ("The unwritten law... has... become"), and inside that gap sits a double/triple-negative construction ("very few, perhaps none, who... are not blinded") that requires real backtracking to parse. This is a case where the *content* is genuinely dense (Hobbes's real argument), but the sentence *shape* is avoidably hard — it could be split into two sentences and the negative-stacking resolved (e.g., "...because almost everyone is blinded by self-love or some other passion in at least some cases") without losing meaning.

Same paragraph — "a perfect understanding of the **final causes** for which the law was made." "Final cause" is Aristotelian technical vocabulary (meaning "purpose" or "end goal") that a general reader is likely to misread as "the last cause in a sequence," which is close to the opposite of the intended sense. Worth a light gloss or a plain-language swap ("the purposes for which the law was made").

**Paragraph 28** (the long flight/forfeiture example, inside the direct quotation from "a great lawyer"): "he shall, notwithstanding his innocence, forfeit all his goods, **chattels**, debts, and dues." Per the prompt's instruction not to exempt quoted material, this sentence is genuinely hard: "chattels" is unglossed archaic legal vocabulary (personal property, as distinct from real estate) that most contemporary readers won't reliably know, and "notwithstanding" (used twice in this paragraph, both inside and outside the quote) is a stiff, faintly archaic connective that a plainer "despite" would clear up without changing register noticeably.

**Paragraph 30** — "he shall procure of the sovereign that another be made judge." "Procure of" (meaning "procure from") is an archaic preposition pairing that doesn't exist in contemporary English — a modern reader parses "procure of the sovereign" as a stumble, likely rereading it as "procure of" = "make sure of." Should be "procure from the sovereign" or "obtain from the sovereign."

**Paragraph 31** — "The abilities required in a good interpreter of the law... are not the same as those of an advocate; namely, the study of the laws." The "namely" clause is ambiguous on first read: it's unclear whether "the study of the laws" is (a) restating what an advocate's abilities consist of, or (b) naming the thing a judge doesn't need. The intended reading is (a), but the sentence doesn't disambiguate, and a reader has to reread the following sentences to resolve it. A small restructure ("...are not the same as an advocate's — namely, deep study of the laws" or "are not, namely, the deep study of the laws that an advocate needs") would remove the ambiguity.

---

## What reads well

Several of the hardest conceptual stretches in this chapter are rendered cleanly and deserve to be flagged as working, not just flagged for problems:

- **Paragraph 44–45** (divine positive law and the Abraham/Sinai argument) is dense, abstract political theology, but the prose stays legible sentence-by-sentence — short declaratives interleaved with the harder compound ones, and the rhetorical questions ("how can a man... be assured of the revelation received by the one who declares it?") read naturally rather than as translated Latin syntax.
- **Paragraph 47**, defining a "fundamental law," uses the building-foundation analogy to carry real conceptual weight in plain language — this is exactly the kind of move that makes 17th-century legal abstraction land for a modern reader.
- **Paragraph 46** ("but I have never seen, in any author, what a fundamental law actually means") has an almost conversational, first-person candor that reads as genuinely contemporary without breaking voice.
- The chapter's many Latin/technical terms (*Persona Civitatis*, *viva voce*, *Lex Civilis* vs. *Jus Civile*, the seven Institutes-of-Justinian categories in paragraphs 37–40, *jubeo/injungo* vs. *dedi/concessi*) are almost all glossed immediately and cleanly on first use — this is the right pattern and it's applied consistently except for the "abrogate" and "prescription" lapses noted above.

---

## Overall readability summary

This is a long, argument-dense chapter (numbered propositions, nested legal reasoning, Latin terminology, biblical citation, and one extended quoted case study), and the great majority of that density is unavoidable — it's the actual content of a 17th-century treatise on legal theory, and the rendering doesn't manufacture extra difficulty out of it. Most paragraphs read as clear, well-paced modern prose with technical terms glossed in place. The remaining friction is narrow and fixable: one recurring unglossed vocabulary word ("abrogate") used inconsistently against a simpler synonym already in the text, two or three other isolated vocabulary items ("prescription of time," "cognisance," "final causes," "chattels"/"notwithstanding" in the quoted forfeiture passage), one archaic preposition construction ("procure of"), one ambiguous "namely" clause, one redundant "still...still," and one paragraph (22) whose sentence shape — not its content — is genuinely overloaded and would benefit from a split.

## Verdict: needs targeted fixes

The issues above are real but narrow — none require restructuring beyond a paragraph, and none touch the chapter's overall argument or voice. This does not read as "needs a broader pass." Once the ~9 items above are addressed, I'd expect the remaining difficulty in this chapter to be entirely the unavoidable kind: Hobbes's own dense legal-philosophical reasoning, multi-clause argumentation inherent to the propositions themselves, and historical/legal citations that can be glossed but not simplified away.
