# Confessions Book 12 — Corrections Log

Source: `book12-source.json` (Pusey 1838, ground truth, 42 paragraphs, 0-indexed)
Candidate: `book12-candidate.json` (frozen, 42 paragraphs)
Output: `book12-corrected.json` (42 paragraphs, same shape)

All paragraph numbers below are **0-indexed array positions**, verified against the actual JSON array (not the review's 1-indexed prose numbering — review "¶N" = array index N−1, confirmed by content match for every finding below).

---

## Moderate findings (4/4 addressed)

### M1 — paragraph 20 — dropped sentence restored

Source (full sentence, present):
> "...because you will not find them? **For that, to which it is ever good to cleave fast to God, surpasses all extension, and all revolving periods of time.** 'It is,' say they."

Candidate (sentence entirely absent):
> "...because you will not find any?" "It is," they say.

Corrected:
> "...because you will not find any? For that which always finds it good to cling fast to God surpasses all extension and all the revolving periods of time." "It is," they say.

Reason: this is the stated reason the house of God escapes time — it clings to God, and what clings to God surpasses spatial extension and cyclical time. Its absence let the "It is" concession float with no premise. Restored as a modern rendering of the source sentence, placed exactly where the source has it (inside the quoted speech, before the objectors' "It is").

### M2 — paragraph 38 — "worth" silently renamed the third sense of "before" back to "choice"

Source: "nor first in choice, for a sound is not better than a tune..."

Candidate (defect): "nor first in worth, since a sound is not better than a tune..."

Corrected: "nor first in choice, since a sound is not better than a tune..."

Reason: Augustine's four-term list ("by eternity... by time... by choice... by original") is being checked term-by-term here; the candidate had silently swapped "choice" for "worth" at this one point, breaking the link back to the list for the reader. The later, unrelated "in worth, it comes last" (rendering source "in value") was left untouched, since that use of "worth" is correct and not part of this collision — it is not preceded by "first," so it does not read as the third sense.

### M3 — global — ASCII `--` replaced with em dash `—`

Before: 142 occurrences of `--` (all spaced as `" -- "`, zero unspaced), 0 em dashes.
After: 0 occurrences of `--` anywhere in the file, 142 em dashes (exact count preserved 1:1).

Method: replaced every `" -- "` with `" — "` (single space each side, matching the confirmed house style in `book10-accepted.json`, which uses `" — "` throughout and never `--`). Verified no accidental `———` or `——` was created by adjacent replacements (0 found), and no unspaced `--` existed to mishandle. This touched all 42 paragraphs at least once except the 13 paragraphs listed under "Minor" below, which also received content edits — every paragraph in the file was touched by this pass in total.

### M4 — paragraph 28 — repeated scripture lemma restored before readings 3, 4, 5

Source repeats the full lemma "The earth was invisible and without form, and darkness was upon the deep" (in slightly varied Pusey phrasing) before **each** of the five readings in this paragraph.

Candidate quoted the lemma in full only before readings 1 and 2, then compressed to "Another takes this reading:" / "Another says that here..." for readings 3, 4, and 5 — softening the intentional rhetorical hammering.

Corrected — restored the lemma before all three:
- Reading 3: `Another takes this reading of "The earth was invisible and without form, and darkness was upon the deep": "this whole, which is called heaven and earth, was still a formless and dark matter...`
- Reading 4: `Another takes this reading of "The earth was invisible and without form, and darkness was upon the deep": "Scripture did not call that formlessness by the name of heaven and earth...`
- Reading 5: `Another takes this reading of "The earth was invisible and without form, and darkness was upon the deep": "there already existed a certain formless matter...`

No propositional content was removed or added; only the lemma-citation frame was restored to match readings 1–2 and the source's fivefold repetition pattern.

---

## Minor findings (9 applied, 1 declined)

### Applied

**Paragraph 0 — "void" avoided.** Candidate: "We hold your promise -- who can void it?" Changed "void" → "annul" ("who can annul it?"). Reason: "void" is the one word this book's terminology policy deliberately avoids (Pusey's Book 12 never uses "void"; the fixed phrase for the Genesis sense is "invisible and without form"). Using it in the opening paragraph invited a false Genesis echo. Left "your promise" (a small possessive addition) as-is — harmless, not a fidelity issue.

**Paragraph 1 — dropped "tongue" image.** Source: "The lowliness of my tongue confesseth unto Thy Highness." Candidate: "In all my lowliness I confess to your greatness." Changed to: "The lowliness of my tongue confesses to your greatness." Reason: restores the image of the *tongue* set against divine Highness/greatness, which the candidate had flattened into a general statement of lowliness.

**Paragraph 2 — "abyss" restored for "chaos."** Source: "there was I know not what depth of abyss." Candidate: "there was some depth of chaos I cannot describe." Changed to: "there was some depth of abyss I cannot name." Reason: "abyss" (*abyssus*) belongs to the same word family the book fixes as "the deep"; "chaos" is a term Augustine does not use here and imports Greek-cosmogonic connotations not present in the source.

**Paragraph 14 — dropped supplied "toward it."** Candidate: "...may be drawn along by degrees toward it -- out of which..." Changed to: "...may be drawn along by degrees -- out of which..." Reason: source states no goal/direction for the gradual drawing-along; "toward it" supplies one the source does not state.

**Paragraph 33 — "brothers and sisters" → "brothers."** Source: "my brethren." Candidate: "my brothers and sisters." Changed to: "my brothers." Reason: for internal consistency — "sons of men" is kept literal elsewhere in this same candidate (paragraphs 1, 7), so widening only this occurrence sat oddly; reverted to the plainer cognate rather than keep an inconsistent one-off expansion.

**Paragraph 35 — "carnal" restored.** Source: "being yet little ones and carnal." Candidate: "still little ones and still of the flesh." Changed "of the flesh" → "carnal": "still little ones and still carnal." Reason: paragraph 39's carve-out ("apart from the carnal ones") refers back to exactly this group; using the same word in both places preserves the reader's ability to make that link, which "of the flesh" obscures.

**Paragraph 36 — two small drops restored.** (a) Source: "deep shady fruit-bowers." Candidate: "shady fruit-groves" (dropped "deep"). Changed to: "deep shady fruit-groves." (b) Source: "made or undergo the beautiful variations of the Universe." Candidate: "undergo the beautiful shifting changes of the universe" (dropped "make or"). Changed to: "make or undergo the beautiful shifting changes of the universe." Reason: both are minor completeness drops; the verb pair "make or undergo" is in the source (Pusey's "made or" is very likely a compositor's error for "make or," but the pairing itself is intentional and present).

**Paragraph 39 — dropped supplied "carnal" qualifier.** Source: "those hopeful little ones who so think" (deliberately ambiguous — the referent is left open). Candidate: "who think in that carnal way." Changed to: "who think in that way." Reason: the candidate's added "carnal" resolves an ambiguity the source leaves open. It is almost certainly the correct reading in context, but restoring the open phrasing keeps faith with the source's actual wording; rated minor, not moderate, per the review.

**Paragraph 40 — relative construction restored.** Source: "why may not he be believed to have seen all these, **through whom** the One God hath tempered the holy Scriptures..." Candidate: "...why should he not be believed to have seen all of these truths -- **since it was through him that** the one God tempered the holy Scriptures..." Changed to: "...why should he not be believed to have seen all of these truths -- **he through whom** the one God tempered the holy Scriptures..." Reason: the candidate's causal "since" hardens a relative clause into an asserted reason; restored the softer relative construction.

**Paragraph 41 — supplied qualifier dropped.** Source: "if man did see less." Candidate: "if a mere man could see less than the whole truth." Changed to: "if a mere man saw less." Reason: "could... than the whole truth" supplies a comparison the source does not make; dropped for fidelity. ("Mere" was left as a harmless intensifier consistent with "man" in context — the substantive addition removed was the "could...than the whole truth" construction.)

### Declined

**Paragraph 30 — "in fellowship with those."** Candidate adds "let me be joined with you, Lord, **in fellowship with** those..." (source: "let me be united in Thee, O Lord, with those..."). Review itself rates this "harmless" and does not propose a specific correction. No propositional content is altered — "in fellowship with" is an elaboration of "united... with," not a substitution or drift. Declined as not a fidelity defect worth touching; logged per instructions.

---

## Findings not touched (per review, no confirmed defect)

Paragraphs 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 29, 30 (structure only, see above), 31, 32, 34, 37 — no confirmed content findings. These received **only** the mechanical em-dash swap (M3), never a wording change.

---

## Note on the diversity/pluralism argument and polemical edge

None of the above edits touch or soften the qualified-pluralism argument (paragraphs 22, 26, 28–35, 38, 40–42) or the polemical edge toward exclusivist readers (paragraphs 21, 33, 34, 37 in this file's indexing — "enemies I hate fiercely," "proud... loving their own," "driven... from truth into a lie"). All qualifiers reviewed as load-bearing ("and yet all of them true," "just not this truth," "apart from the carnal ones," "not being false") were left exactly as the candidate had them, since the review found no defects there.
