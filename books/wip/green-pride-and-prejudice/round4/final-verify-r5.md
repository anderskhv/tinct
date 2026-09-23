# Final verify — round 5

Independent check of three paragraphs after the last edit round. Each final paragraph was read in full against Austen's 1813 source and cross-checked with python3 against `candidate.json` (`chapters[ch-1].paragraphs[idx]`). The JSON text matches the final-r5 input exactly, the old wording no longer appears, and the neighbouring paragraphs line up with the context given.

## 16.20 — CLEAN

- The edit "disappointing the hopes and disgracing the memory of his father" matches Austen's wording word for word. It is faithful and grammatical, and it follows cleanly from "anything and everything rather than his …".
- Mechanics: 2 straight double quotes, balanced. 8 underscores, making 4 italic pairs (_me_, _he_, _me_, _him_), all kept from the source. 2 em dashes. No doubled words and no double spaces.
- The rest of the paragraph is faithful to the source ("pierced to the heart" renders "grieved to the soul", and "outrageous" renders "scandalous"). Nothing is newly broken.

## 46.4 — CLEAN

- The edit "anxiously repeating his inquiries at all the turnpikes and at the inns in Barnet and Hatfield" renders Austen's "anxiously renewing them" (them = inquiries) faithfully. "His inquiries" picks up "every possible inquiry" from the sentence before, so the pronoun is no longer ambiguous. The splice is grammatical, and "but with no success—nobody matching …" follows cleanly.
- Mechanics: 2 quotes, balanced. 5 em dashes, in three places: "a hackney coach—a London cab—and", "success—nobody", and "family—which is surely unlikely—can". No doubled words and no double spaces.
- The rest of the paragraph has nothing newly broken. One older, non-blocking note that was not caused by this edit: the source italicises _he_ in "even if _he_ could form such a design", but the candidate prints it in roman. You could restore `_he_` if you want to keep the emphasis, but it is optional and not a defect of this round.

## 56.45 — CLEAN

- The edit "These are heavy misfortunes," now matches Austen exactly, and "misfortunes" matches her meaning, where "punishments" had changed it.
- Mechanics: 4 quotes, forming two balanced pairs around the split speech tag. The comma sits inside the closing quote before "replied Elizabeth". No doubled words.
- The rest of the paragraph is faithful ("repine" becomes "have no cause for complaint", and "situation" becomes "position"). The word "necessarily" was dropped, which is acceptable in a modern edition. Nothing is newly broken.

## Coverage

All three paragraphs (16.20, 46.4, 56.45) were read in full against the source. The checks on each were faithfulness, grammar, how the edit is spliced, and quote, dash and italic balance, run by hand and by script. The script also checked for doubled words and double spaces, compared the text with the JSON, and confirmed the old wording is gone. No other files were edited.
