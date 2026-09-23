# acc19 accessibility successors: independent verification (Books 2, 5, 6, 7, 8, 9)

**Verdict: DEFECTS FOUND**

Two edits bring in a new listening problem. Both are small and each has a one-line fix. The other five edits are clean.

## Defects and fixes

### D1. Book 6 `candidate-v4.json` ¶1: the Dymas relative clause (non-blocking edit)
The new wording puts "a famous sea captain" directly before "who was a bosom friend of Nausicaa and just her own age". A listener attaches "who" to the nearest noun, so it sounds as if **Dymas, the sea captain**, is Nausicaa's friend. Only "just her own age" corrects this, and it comes late. The old wording ("Dymas's daughter, who…") had no such problem. The edit's reason also misquotes Butler. Butler's text is "the famous sea captain Dymas's daughter", which is the construction the edit removed, not "daughter of the famous sea captain Dymas". Book 6 continuity also records `Dymas’s` as "Butler's own, kept". The finding was not blocking, so revert it:

- old: `Athena took the form of the daughter of Dymas, a famous sea captain, who was`
- new: `Athena took the form of the famous sea captain Dymas’s daughter, who was`

(This matches v3 exactly, so ¶1 goes back to its accepted text.)

### D2. Book 5 ¶29: a false "as … so" pairing in the reordered simile (blocking edit, the reorder itself is good)
The reorder solves the problem it was meant to solve: "sent him by some angry spirit" now sits next to "affliction". But Butler's "**but** the gods deliver him" has become "**as** the gods deliver him", and that "as" comes right before "so was Odysseus thankful". Aloud, the listener hears a second correlative "as … so" ("as the gods deliver him from evil, so was Odysseus thankful") inside the simile's own "as children rejoice … so". Butler's clause is a coordinate verb governed by the same "when", so use "and":

- old: `begins to get better as the gods deliver him from evil, so`
- new: `begins to get better and the gods deliver him from evil, so`

After the fix: "as children rejoice when their dear father, who has long borne a sore affliction sent him by some angry spirit, begins to get better and the gods deliver him from evil, so was Odysseus thankful…". Every element of Butler's simile is kept: the children, rejoicing, the dear father, long, the sore affliction, the angry spirit, getting better, and the gods delivering him from evil. No new punctuation is added.

Both "old" strings above occur exactly once in their v4 files.

## Mechanical check (item 1)
For each (book, from, to), I applied the listed replacements to `from` and compared the result with `to`: same keys, the same `number` and `title`, and all paragraphs equal. All six file pairs **MATCH**. Each `old` string occurs exactly once in its paragraph and once in the whole Book. The paragraph counts are unchanged (B2 35, B5 37, B6 26, B7 29, B8 50, B9 44). None of the edits touches a quotation mark, so the quote counts are unchanged.

## Per-edit results (item 2)
| Book ¶ | Edit | Result |
|---|---|---|
| B2 ¶10 | "take nothing by it" → "gain nothing by it" | **PASS.** Butler's idiom means "get no benefit". Faithful and clearer. The parentheses were already there. |
| B5 ¶29 | Simile reordered | **Reorder PASS; connective defect D2.** Every element is kept. "for a long time" → "long" and "a sore affliction" (article added) are both fine. The only problem is the "as" connective. |
| B6 ¶1 | "the daughter of Dymas, a famous sea captain" | **DEFECT D1.** Revert. |
| B6 ¶12 | "after me" → "following me" | **PASS.** This is exactly Butler's "much people after me", a retinue and not pursuers. It is grammatical and clearer aloud. |
| B7 ¶6 | "But he left" → "But Rhexenor left" | **PASS.** In Butler, "he" is "the first of them", which is Rhexenor. Nothing else is added, and the reviewer's "his brother … later" was rightly not taken. |
| B8 ¶16 | "an hereditary" → "a hereditary" | **PASS.** American article usage (D9). No other change. |
| B9 ¶25 | "round and round, as though … with an auger that two men with a wheel and strap can keep turning as long as they choose." | **PASS.** "that" now attaches to "auger". "can keep turning" is Butler's "can keep on turning" with "on" dropped, and the meaning is unchanged. The added comma before "as though" is a plain clause comma. There is no run-on and no new colon, semicolon or dash. |

I found no spaced dashes, new colons or semicolons, British spellings, lost causal "for", or quote-count changes in any edited paragraph.

## Screening rejections of blocking findings (item 3)
- **B1 ¶30 "chief" vs ¶13 "king": defensible.** Butler himself writes "chief of the Taphians" in ¶7 and ¶30 and "King of the Taphians" in ¶13, and the candidate follows him in all three places. Making them uniform would change Butler's words.
- **B5 ¶33 "riverhood": defensible.** `book05/continuity.md` records it as KEPT under B05-P034, and round-1 findings-v1 confirms that ("riverhood correctly kept"). "draw near to your stream" in the same sentence explains it.
- **B7 ¶25 Euboea/Rhadamanthus/Tityus: defensible.** The proposed rewrite deletes Rhadamanthus, Tityus and Gaia and invents "ferrying a passenger there and back", which breaks the screening rule. *Optional note, not a defect:* in the current split, "those of them who saw it told me it is the furthest place of any" sits right after "Tityus the son of Gaia", so the listener may attach "it" to Tityus rather than Euboea. If the coordinator wants to improve this, a minimal fix that names Butler's referent is "who saw it" → "who saw Euboea".
- **B8 ¶5 Pytho: defensible.** The rewrite drops Butler's "crossed the stone floor to consult the oracle", and "the oracle" already tells the listener what Pytho is.

## Round 2 (after the D1 and D2 fixes)

I re-checked the updated `acc19-edits.json` against the regenerated files, applying each Book's edits to its `from` file and comparing the result with the `to` file (number, title and every paragraph).

1. **book05 v4 = v3 plus the revised ¶29 edit: MATCH.** `old` occurs once. ¶29 now reads "as children rejoice when their dear father, who has long borne a sore affliction sent him by some angry spirit, begins to get better and the gods deliver him from evil, so was Odysseus thankful". That is exactly the D2 fix. There is no second "as … so", every element of Butler's simile is kept, and no punctuation is added.
2. **book06 v4 = v3 plus only the ¶12 edit: MATCH.** The ¶1 edit is gone, so ¶1 is identical to v3 ("the famous sea captain Dymas’s daughter, who was…"). That closes D1. ¶12 "following me" is unchanged from the version I passed in Round 1.
3. **B2 v7, B7 v3, B8 v3 and B9 v4: MATCH.** Their edit entries are word for word the ones verified in Round 1, and each regenerated `to` file equals its `from` file plus those edits and nothing else.

The optional Book 7 ¶25 note from Round 1 ("who saw it" → "who saw Euboea") stays optional and is not a defect.

**Verdict: VERIFIED CLEAN**
