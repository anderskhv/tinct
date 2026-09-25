# Recheck 2: post-review changes, Symposium modern-en, chapters 7–8

- **Role:** independent recheck reviewer. I did not write the text under review or any of the earlier reviews.
- **Packet:** `recheck-packet-2.md`. It covers the 43 paragraphs changed after the reviews: 7.0, 7.44–7.56, 7.59–7.68, 8.0, 8.3–8.5, 8.10–8.11, 8.23–8.24, 8.26, 8.28–8.31, 8.35–8.37, 8.39, 8.43 and 8.45. It lists 117 edit IDs: C 49, D 38, E 24, CAP 5, B 1.
- **v3 sha256:** `72838e2974791827de76d8d65900310541e4146abf71a975eb47d60b570e6ddf`. I recomputed it on `cand/symposium-modern-en.json`, and it matches the packet header.
  - v1: `46fa34ea…113e` (`pkgtest/candidate/`).
  - Source: `3521a12d…95a6`, which matches STYLE §1.
- **Standard:** STYLE.md as revised after the reviews (§1a, §2, §3.4–3.5, §4, §5, §6). I also read SOURCE-NOTES.md, written after the packet was built, for the lead's recorded source decisions.
- **Date:** 2026-09-25

## Verdict: ACCEPT

The post-review changes in chapters 7–8 are sound.

- **Every edit does what its finding asked, or a reasonable equivalent that stays with Jowett.** This includes:
  - all seven BLOCKING items from Reviews 1C and 1D: 7.48 "born", 7.54 speaker attribution, 7.60 "wedded", 7.63 "youth" / "in love with", 7.66 "be able to become", 8.31 "even less" and 8.36 "never";
  - every Review 2 SHOULD-FIX item in these chapters: 7.0; 7.45; 7.46, 7.50 and 7.52; 7.51–7.52; 7.62–7.65; 8.10–8.12; 8.23; 8.28; 8.29;
  - Review 1B #22.
- **No unlisted changes.** Replaying the 117 listed edits on V1 reproduces V3 byte for byte at all 43 coordinates, and there is no v1→v3 change in these chapters outside the packet.
- **No edit introduced a fidelity error.**
  - Diotima's argument is intact at every step: Love's in-between status, correct opinion, love versus the beloved, love of possessing the good forever, birth in beauty, and procreation as mortal immortality.
  - The ascent keeps Jowett's order: one body → all bodies → soul → practices and laws → branches of knowledge → the sea of beauty → the single knowledge. 7.65 recaps it with the same nouns.
  - 7.64 states every attribute of absolute beauty as what it *is* (or is not).
  - "If any mortal can be" stands at 7.66, and "be able to" now governs both results.
  - Alcibiades's claims about Socrates are back at Jowett's strength (8.31, 8.35, 8.36).
- **Quotation continuity and speaker attribution are correct** in every range checked, and every new tag names the right speaker.
- **House style is clean.**

**Counts:** BLOCKING 0 · SHOULD-FIX 0 · OPTIONAL 16.

The 16 findings fall into three groups:

- **v1 Greek-leaning wordings (#1, #7, #10, #13, #14, #15, #16).** Seven places still follow the Greek rather than Jowett, and no review listed them. Each is a small shift of emphasis or connective, not an argument change, but §1a's policy covers them. I recommend deciding them as one batch: either revert them (the wording is supplied) or record them.
- **STYLE wording (#2, #4, #11).** These concern the style guide, not the text.
  - #4 asks that §1a be aligned with SOURCE-NOTES §3 on the two v1 choices the lead deliberately kept.
- **Small clarity or punctuation points (#3, #5, #6, #8, #9, #12).** Each is attached to a post-review edit.

## Documented exceptions, judged on their merits

- **7.0 "that is, whose child Love is": accept.**
  - The gloss gives the only reading under which "that would be ridiculous" makes sense. Read as love *for* a father, "the love of a father" would be a sensible answer, not a ridiculous one.
  - It is also the reading that the following contrast requires: "is a father the father of something? … of a son or a daughter".
  - It is five words, neutral, and placed exactly at the difficulty. Jowett's "the love of a father or the love of a mother" is kept verbatim.
  - The capital in "Love" correctly marks the god whose parentage is meant.
  - It resolves Review 2 #42 and Review 1B #21 without a note. For the frame around it, see #1.
- **8.10 "As Homer says": accept.**
  - Jowett's own note on the line ("from Pope's Homer, Il.") supplies the name, so §5's no-new-name condition holds.
  - It is three words attached to the quotation, and it does two jobs:
    - 8.10 can end with Alcibiades's quotation still open (§3.4), so the verse and 8.12 are visibly still his;
    - a listener is told that a quotation follows.
  - Verse 8.11 keeps Jowett's exact words, "The wise physician skilled our wounds to heal". Only its marks change (`'"…"`), and Jowett's bracketed citation is dropped, as all his notes are.
  - For an optional refinement, see #9.

## Findings

| # | Coordinate | Edit ID | Severity | Finding | Exact V3 wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 7.0 | E42 (frame from v1) | OPTIONAL | The documented gloss is sound, but the frame around it is v1's, not Jowett's. "I am not asking whether …" and "a ridiculous question" follow the Greek, where the *question* is ridiculous. Jowett, and the accepted baseline, say "I do not want you to say that … — that would be ridiculous", so the *answer* is ridiculous. Review 1B #21 accepted the sense. It is listed only because §1a says v1's Greek-based departures were reverted, and no review listed this one. The documented gloss fits Jowett's frame unchanged. | `I am not asking whether love is the love of a father or the love of a mother — that is, whose child Love is; that would be a ridiculous question.` | `I do not want you to say that love is the love of a father or the love of a mother — that is, whose child Love is; that would be ridiculous.` Or keep the frame and record it as accepted. |
| 2 | 7.45, 7.46, 7.52 (also 7.47, 7.51) | E43; E45a, E45b, E45d | OPTIONAL | STYLE wording, not text. (a) §3.5's rule "a change of speaker that follows a tagged line is itself tagged" is broader than the text's practice. The new "she asked" tags leave the replies that follow them untagged: twice at 7.46 and once at 7.52. Older cases are 7.47 `'No.'` after "I asked", 7.51 `'True.'` after "She answered:" and 7.52 `'That is very true.'` after "she said". None can be misattributed, because each is a direct reply to the question just asked. Tagging them all would cascade through every exchange. (b) §3.5's "Nothing else is added" does not cover the new addressee vocative at 7.45. The vocative is accurate: Jowett's "taking my leave of you" is said to Agathon, and later in the paragraph Jowett has "As you, Agathon, suggested". It is recorded only in SOURCE-NOTES §2. | `'Everyone who knows,' she asked, 'or everyone who doesn't know?' 'Everyone.'` · `'And we must add that they love to possess the good?' she asked. 'Yes, we must add that.'` · `And now, Agathon, I will let you go` | No text change. Reword §3.5: "A new question or statement by the other speaker that follows a tagged line is itself tagged; a direct reply ('Yes.', 'Everyone.') needs no tag. Where an unquoted set speech resumes after quoted dialogue, a vocative may name the addressee (7.45)." |
| 3 | 7.49 | C22bc | OPTIONAL | The edit restores Jowett's "he" and his explanatory colon, as asked, but the sentence now has two colons and reads awkwardly. Jowett's own structure avoids this: "herein is the evil of ignorance, that he who … is nevertheless satisfied with himself: he has no desire …". | `For this is what is so bad about ignorance: someone who is neither good nor wise is nevertheless satisfied with himself: he does not desire what he does not feel he lacks.` | `For this is what is so bad about ignorance, that someone who is neither good nor wise is nevertheless satisfied with himself: he does not desire what he does not feel he lacks.` |
| 4 | 7.49, 7.63 | C28 list (kept by the lead) | OPTIONAL | Documentation. §1a says: "Where v1 had followed the Greek instead of Jowett, the change was reverted." SOURCE-NOTES §3, however, records two Review 1C #28 items as kept on purpose, calling them "syntax-only choices": "what loves" and "He will no longer be". Both are acceptable. But "no longer" (Greek *meketi*) is not purely syntactic. It presupposes that the lover was once such a servant, which the ascent implies but Jowett's "being not like a servant" does not state. | `but what loves is of a different nature, the one I have described.` · `He will no longer be like a servant in love with the beauty of one youth or one man or one practice` | No text change needed. Align §1a with SOURCE-NOTES, for example "…was reverted, except the two choices recorded in SOURCE-NOTES §3". Describe 7.63 as "implied by the ascent" rather than "syntax-only", or revert it to `He will not be like a servant in love with …`. |
| 5 | 7.50 | CAP-750 | OPTIONAL | Returning to Jowett's elliptical question ("Of the beautiful in what, …", with "sense" supplied) correctly removes v1's sentence-initial capital "Love". Without v1's dash, though, the question is harder to parse on first hearing. As in Jowett, Diotima rephrases at once ("let me put the question more clearly"). A dash restores the parse without changing a word. | `"Of the beautiful in what sense, Socrates and Diotima?"` | `"Of the beautiful — in what sense, Socrates and Diotima?"` |
| 6 | 7.51 | C28-751 | OPTIONAL | Deleting v1's added "and given the name of the whole" is right, but it leaves three "only"s in one sentence. The first, v1's sentence-initial "Only", has no counterpart in Jowett. His "only" goes with "is termed poetry", which is now the second. The result is repetitive aloud, and the first "Only" slightly over-asserts that just one part was separated off. | `Only one part of making has been separated off from the rest — the part that has to do with music and verse — and only this is called poetry, and only those who practice it are called poets.` | `One part of making has been separated off from the rest — the part that has to do with music and verse — and only this is called poetry, and only those who practice it are called poets.` |
| 7 | 7.60 | C3 | OPTIONAL | C3 restores "wedded" and "mortal children", as asked. The reviewer's suggested wording, however, keeps v1's "firmer friendship", which follows the Greek (*bebaioteran*, "steadier"). Jowett and the baseline have "a closer friendship", so the sense shifts from intimacy to stability. No review listed it, and SOURCE-NOTES §3 does not record it. | `Such people are wedded by a far closer tie, and share a firmer friendship, than those who have mortal children` | `Such people are wedded by a far nearer tie, and share a closer friendship, than those who have mortal children` (Jowett: "a far nearer tie … a closer friendship") |
| 8 | 7.64 | C28-764c | OPTIONAL | The reversion is faithful: beauty "is imparted to" other things, instead of v1's "share in it". But "ever-growing" now usually means "constantly increasing", as in "an ever-growing list". Jowett means beauties that are always growing and perishing, in contrast with "it does not grow and decay" earlier in the paragraph. Moving his own words into a relative clause keeps his sense. | `it is imparted to the ever-growing and perishing beauties of all other things.` | `it is imparted to the beauties of all other things, which are always growing and perishing.` |
| 9 | 8.10 | E58a | OPTIONAL | The documented tag is sound. One refinement: Alcibiades makes the line the subject of his own sentence ("… shall prescribe, and we will obey", 8.12). "As Homer says" therefore attributes that whole statement to Homer. "In Homer's words" would attribute only the borrowed wording. | `'That I leave to you,' said Alcibiades. 'As Homer says,` | Optional: `'That I leave to you,' said Alcibiades. 'In Homer's words,`. If adopted, update the §5 example. |
| 10 | 8.26 | none (v1 wording; paragraph edited by D26) | OPTIONAL | §1a names "hearing him tell what he knew" (8.26) as a Jowett softening that "stays in Jowett's words". V3 instead has "to hear from him everything he knew". "Everything" is the Greek *panta*, not Jowett, and the baseline had Jowett's words. The softening itself is kept, because the favors-for-knowledge bargain is still unstated. But the text and §1a do not match. | `I thought this gave me a wonderful opportunity to hear from him everything he knew` | `I thought this gave me a wonderful opportunity to hear him tell what he knew`, or correct the §1a example. |
| 11 | 8.29 | none (v1 gloss) | OPTIONAL | STYLE wording. Read literally, §5's new sentence ("A gloss does not add a name that Jowett does not give, whether in his text or his notes") conflicts with "Diomedes in Homer" here. It also conflicts with §5's own example at 8.33, "a tale, as Homer puts it". Jowett's 8.29 ("like Diomede, gold in exchange for brass") and his 8.33–8.34 name Homer in neither text nor note, although he names Homer elsewhere (for example 1.19, 2.5, 7.60). The gloss itself is accurate and minimal, and Review 1D verified the direction of the exchange. | `like Diomedes in Homer, who traded bronze armor for gold.` | No text change. Reword §5 as "does not add a name that Jowett's text and notes never use". If the literal reading is intended, drop "in Homer" here and at 8.33. |
| 12 | 8.30 | D20d | OPTIONAL | Removing v1's "to us both" was correct, but it left a stray comma before the scope phrase. | `we will consider and do whatever seems best, about this and about other matters.` | `we will consider and do whatever seems best about this and about other matters.` |
| 13 | 8.37 | none (v1 wording; paragraph edited by D16, D17a/b, D18, D20f, D32a/b) | OPTIONAL | D20f rightly reverted v1's hedge "he always seems to be saying". The same paragraph keeps a hedge of the same kind: Jowett's "they are ridiculous when you first hear them" became "they seem ridiculous", following the Greek "would appear". This softens one of Alcibiades's claims about Socrates. The baseline had "are". | `When you first hear them they seem ridiculous` | `When you first hear them they are ridiculous` |
| 14 | 8.39 | none (v1 wording; paragraph edited by D33) | OPTIONAL | Jowett has two parallel clauses: "you want to get up a quarrel … and your notion is that …". v1 (the baseline kept Jowett's) made the second a cause, "because you think that …", following the Greek participle. That turns Alcibiades's supposed motive into a stated cause. §1a lists connectives among the things not changed from the Greek. | `you want to stir up a quarrel between Agathon and me, because you think that I ought to love you and nobody else` | `you want to stir up a quarrel between Agathon and me, and your idea is that I ought to love you and nobody else` |
| 15 | 8.43 | E68 | OPTIONAL | E68 correctly drops "all over". But v1's "he will have to praise me again" follows the Greek ("he will surely praise me again"). Jowett's "he will be out of order in praising me again" is lost: in Jowett the arrangement is improper, and in V3 it is merely required. The impropriety survives only in "when he ought instead to be praised by me". | `If Agathon lies between us, he will have to praise me again, when he ought instead to be praised by me.` | `If Agathon lies between us, it will be out of order for him to praise me again, when he ought instead to be praised by me.` Or keep "have to", which makes the seating rule explicit, and record it. |
| 16 | 8.45 | D34 | OPTIONAL | D34 restores the attraction sense, as asked. Its wording, Review 1D #34's own, keeps v1's "found a plausible excuse", which follows the Greek: Review 1D noted that "The Greek supports 'found'". Jowett and the baseline have "invented a specious reason". The change weakens Alcibiades's jibe that Socrates made up a deceptive pretext, though "excuse" keeps part of it. | `And look how easily he has found a plausible excuse for drawing Agathon to his side!` | `And look how readily he has invented a specious reason for drawing Agathon to his side!` |

## What was checked

- **Hash.** v3 recomputes to `72838e29…6ddf`, the packet header value.
- **Packet integrity.** At all 43 coordinates, the packet's JOWETT and V3 texts are byte-identical to `base-original-en.json` and `cand/symposium-modern-en.json`. Its V1 text is identical to v1 (`pkgtest/candidate/`).
- **Change set and replay.**
  - The v1→v3 differences in chapters 7–8 are exactly the packet's 43 coordinates.
  - Applying the 117 listed before→after snippets to V1, in order, reproduces V3 exactly. Each "before" snippet occurs exactly once.
- **Structure.** Both the source and v3 have 8 chapters, with 69 paragraphs in chapter 7 and 47 in chapter 8.
- **Quotation continuity.** These ranges open and close correctly: 7.47→7.49, 7.51→7.52, 7.53→7.54, 7.55→7.57, 7.58→7.66, 8.0→8.1, 8.10→8.12 and 8.29→8.30.
  - The narration inside Socrates's speech is unquoted (7.45, 7.50, 7.55, 7.58, 7.67, 7.68).
  - Alcibiades's set speech (8.23–8.38) is unquoted.
- **Speaker attribution.** I checked every transition from a tagged line to an untagged one in the 22 exchange paragraphs, listing them by script and then judging each by hand. Every line is attributed correctly. The only departures from the wording of §3.5 are the direct replies in #2.
- **Glossary and capitalization.** The Love/love sequence matches Jowett in every packet paragraph. The extra lowercase tokens come only from added "love of", and the only added capital is the documented 7.0 gloss. These terms are used as prescribed:
  - "lack", "beautiful" and "self-control";
  - "physical training" (7.52);
  - "barbarians" (7.61);
  - the "X, or Y" names (7.47);
  - the ascent nouns: bodies, soul, practices and laws, branches of knowledge;
  - "my beloved Agathon" (7.44).
- **House style.**
  - The only non-ASCII character is the em-dash, and every em-dash is spaced.
  - There is no "--", and all quotes are straight.
  - There are no British spellings, and no doubled words or spaces.
- **Greek references.** They are from memory and serve only to show where a v1 wording came from. Each finding rests on the Jowett and baseline comparison, which I verified from the files.

## Coverage

| Coordinate | Result |
|---|---|
| 7.0 | 1. Documented gloss accepted |
| 7.44 | OK. B22 as suggested, and "my beloved Agathon" per §4 |
| 7.45 | 2. C17's "must" matches the parallel "Must whatever is not beautiful …". The E44 tag leaves "Don't you see …" correctly with Diotima |
| 7.46 | 2. C18 follows Jowett's lowercase; C19's "or" restored |
| 7.47 | 2 (older untagged "'No.'"). "mysteries", "base" and "On Aphrodite's birthday" restored |
| 7.48 | OK. "no wine", "born", the negation scope, "the beautiful and the good" and "dead" all restored |
| 7.49 | 3, 4. "what loves" was deliberately kept (SOURCE-NOTES §3) |
| 7.50 | 5. E45c tags Diotima's question correctly |
| 7.51 | 2 (older untagged "'True.'"), 6. C8 restores Jowett's definition, and "She went on:" fixes the 7.51→7.52 attribution |
| 7.52 | 2. "are not called lovers" and "physical training" |
| 7.53 | OK |
| 7.54 | OK. The C2 "I asked" matches Jowett's separate quotation and "she replied". E48a restores Jowett's "or"; E48b's "gracious, relaxed and kindly" keeps his three adjectives, with "relaxed" contrasting with "contracts" |
| 7.55 | OK |
| 7.56 | OK |
| 7.59 | OK |
| 7.60 | 7 |
| 7.61 | OK |
| 7.62 | OK. "in general", "out of that love", "soul" and "if you pursue them" |
| 7.63 | 4. "until he is compelled", "is a trifling thing", "youth", "in love with" and "practices" |
| 7.64 | 8. Every attribute present; the "is" framing and "true love" (§1a) kept |
| 7.65 | OK. The negation scope is fixed, the recap nouns match 7.62–7.63, and "the essence of beauty" is Jowett's |
| 7.66 | OK. "in that communion", "has hold of", "be able to become", "if any mortal can be" |
| 7.67 | OK. Jowett's lowercase, and "as I myself honor him" |
| 7.68 | OK |
| 8.0 | OK. Naming Aristophanes twice is heavy but unambiguous |
| 8.3 | OK |
| 8.4 | OK |
| 8.5 | OK |
| 8.10 | 9. Tag accepted |
| 8.11 | OK. Wording exact; only the marks changed |
| 8.23 | OK. "Olympus, Marsyas's pupil" is §5's own example; "take possession of … souls" matches 8.24 |
| 8.24 | OK |
| 8.26 | 10 |
| 8.28 | OK. E62 decodes Jowett's "two proverbs" note while keeping "boys" (§2) and "with boys or without them" |
| 8.29 | 11. E63's "I asked" fixes the attribution; the Diomedes exchange runs the right way |
| 8.30 | 12 |
| 8.31 | OK |
| 8.35 | OK |
| 8.36 | OK |
| 8.37 | 13 |
| 8.39 | 14 |
| 8.43 | 15 |
| 8.45 | 16 |

43 of 43 coordinates checked.

## Other observations (not scored)

- **The staged candidate is still v1.** `books/wip/symposium-accessibility/candidate/symposium-modern-en.json` has hash `46fa34ea…`. v3 exists only in the scratchpad.
- **Two cited documents are missing.** STYLE §1a and SOURCE-NOTES §4 cite `CHANGES.md` and `reviews/RESOLUTION.md` for the documented exceptions, but neither file is in the staging folder yet. I judged 7.0 and 8.10 against STYLE and SOURCE-NOTES only.
- **8.33 is outside this packet.** It is mentioned only as context for #11.
