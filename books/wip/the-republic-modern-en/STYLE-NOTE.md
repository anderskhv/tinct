# Style note: *The Republic* (Plato), Tinct Modern English (targeted repair)

- **Book:** `the-republic`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note governs every renderer, reviewer and verifier of this repair.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: Benjamin Jowett's English translation (1871 and later editions). The task is a modernization of that English, not a new translation. Consult no other translation and no Greek.

## What this edition is, and what this job is

A paragraph-by-paragraph rendering of Jowett's English into plain contemporary English. It keeps every argument step, every question and answer, every example, myth and image, every name, and the voices of the speakers. It does not explain the dialogue or make it easier than it is.

**This is a targeted repair.** The served `modern-en` is already modernized except for 237 paragraphs (170 slices in `slices.json`, source files in `src/`, each with `source` and `live_modern`), where it left Jowett's text identical to the source. Render only those. Every one lies in Books 3-10. Your task is to modernize them **the way the served modern-en already modernizes its neighbors**, not in a new voice: read the paragraphs just before and after each slice in `served-live-modern-en.json` and match their register, terms and typography. Where this note and a neighbor disagree, this note rules (the live edition is inconsistent in a few places, listed below).

## What the identical paragraphs are

111 of the 237 are under 30 words; about 40 are over 60.
- **Short assents and replies** ("True.", "Yes.", "Certainly.", "Impossible.", "Clearly.", "How?", "He will."): often already plain modern English. If the source is already modern, the output may stay identical; do not invent a variant just to differ. Change only what is archaic (see Voice). Keep each as its own paragraph with its own strength.
- **Questions of the dialogue chain** ("And a State was thought by us to be just when...?"): modernize into a natural question, keeping its logical form and every term.
- **Long expository answers** (the cave, the education of the guardians, the laws on marriage, the drone and the tyrant, the myth of the metals, the imitation arguments): the main work. Break at semicolons and long "and... and" chains; keep the connectives.
- **Verse or quotation fragments** are few (poetry lines in Book 3 are already modern in the live text); keep their wording.

## Voice and sentences

- **Register.** Clear, natural spoken English with the dignity the live edition gives Socrates: contractions are allowed in brisk exchanges ("That's true", "He can't", "What's that?"), never stacked; no slang, no "Look,", "Okay", "Sure", "Guys".
- **Long sentences.** Split sentences over about 50 words at their joints. Keep the logical connectives (for, therefore, then, whereas, but yet, if... then) so each step shows; keep a rhetorical build as a build. Keep questions as questions.
- **Jowett's archaisms.** "Nay" becomes "No"; "Aye" becomes "Yes"; "such an one" becomes "such a person"/"such a man" (as served: man/men stay, no forced gender-neutral rewrite); "I dare say" becomes "I imagine"; "enquire" becomes "inquire"; "whither" becomes "where"; "Assuredly" becomes "Certainly"; "Most true" becomes "Very true"; "Exactly so/Just so" may become "Exactly". "I should imagine" may stay.
- **Assents keep their strength and their own turn.** "Very true" stays "Very true", "Quite true" stays "Quite true", "Certainly" stays "Certainly", "True" stays "True". Do not merge turns, drop a "Yes", or inflate to "Absolutely", "Of course not" or "I couldn't agree more" (the live edition sometimes does; do not copy that).
- **Speech tags.** Keep "I said", "he said", "he replied" and their place in the sentence as served ("Very true, he said."). Do not swap said and replied for variety.

## Force

Keep every hedge and judgment exactly as strong or mild as served: "I think", "I should say", "I suppose", "perhaps", "must", "necessarily", "I am certain". Keep Socrates' irony and the courtesy of Glaucon and Adeimantus. Do not sharpen or soften.

## No additions

No commentary, bracketed notes, headings, stage directions, glosses, modern parallels or tone words. A period reference may be clarified only inside the sentence in a few words where the text supports it.

## Structure 1:1

10 chapters titled exactly "Book 1" to "Book 10"; 4,308 paragraphs (492, 349, 497, 457, 563, 408, 372, 447, 405, 318). A slice `chNNN_pAAA-BBB` renders source paragraphs AAA to BBB, one output paragraph each, in order; paragraph N renders source paragraph N. Never merge, split, reorder, drop or invent. A one-word paragraph stays a paragraph. Long paragraphs (over 30 words) normally keep at least 75% of the source's word count.

## Speakers and dialogue form

Books 1-2 of the live edition use quoted direct speech; **Books 3-10 do not**, and neither do you. The source has no speaker labels and no quotation marks around turns. Each paragraph is one turn with an inline tag ("I said", "he replied"); keep the tags in place and add no label ("Socrates:") and no quotation marks around the turn. Socrates narrates in the first person ("I said"); the interlocutor (Glaucon or Adeimantus, as the context shows) is "he". Do not turn indirect speech into direct or the reverse.

## Technical terms: one rendering, kept stable

| Term | Rule |
|---|---|
| **State / city** | Copy the source: "State" (capital) stays "State" and "state" stays "state"; "city", "cities" stay. The live edition uses both capitalizations; do not normalize to "country" or "society" and do not turn "State" into "city". |
| **justice / injustice / just / unjust** | Always these words; never "fairness". "The just man" stays (gender as served). |
| **temperance / temperate** | Keep "temperance", "temperate" (the virtue of Book 4, as the live edition does) and "self-mastery". Never "moderation" or "restraint" for the virtue. |
| **courage / valiant / brave** | Keep as served; "valiant" may stay in the list "temperate and valiant and wise". |
| **wisdom / wise** | Keep. "Knowledge" stays "knowledge", "opinion" stays "opinion" (the faculty between knowledge and ignorance; never "belief" there). |
| **guardians / auxiliaries / rulers / husbandmen / artisans** | Keep "guardian(s)", "auxiliaries", "rulers". "Husbandmen" may become "farmers"; "artisan" stays. |
| **Form (Jowett's "idea")** | Where "idea" names the Platonic idea or "the idea of good", render "Form" and "the Form of the Good", as the live edition does in Books 6, 7 and 10. Ordinary "idea" or "notion" ("under the idea that...") becomes a plain word ("thinking", "notion"), never "Form". |
| **the Good** | Jowett's "the good" as the supreme principle (6.313-322, 7) becomes "the Good" (capital). Ordinary "good", "the good" of men or parents stays lowercase. |
| **essence / being** | Keep "essence", "being", "absolute", "dialectic", "dialectician". Never "substance". |
| **soul** | Always "soul" (it/its for the soul if the source uses "she/her"; the source's "her" for justice or the State as a person may stay as served). |
| **harmony / music / gymnastic** | Keep as served. |
| **democratical / oligarchical** | "democratic", "oligarchic"; keep "tyrannical", "timocracy", "oligarchy", "democracy", "tyranny". |
| **fair** | Becomes "beautiful" where it means beautiful ("fair friend"), "fair" only for fair play. "Honorable" for "honourable". |
| **"metals" myth** | Keep gold, silver, brass, iron; "brass" stays (the live edition uses it). |

## Quotations and citations

No citation data. Verse and quoted speech in a paragraph (Homer, Hesiod, the poets, the proverbs, an imagined objector) keep their served wording; modernize only the words around them. Short quoted phrases keep their words.

## Notes, markers and special elements

No footnotes, no markers, no headings-as-paragraphs. A paragraph ending ":--" or ":—" introducing verse or a list becomes a colon ("And again:"). Verse lines stay in their own paragraph.

## Names and spellings

Keep Jowett's names: Socrates, Glaucon, Adeimantus, Polemarchus, Thrasymachus, Cephalus, Homer, Hesiod, Achilles, Ajax, Er, Piraeus, Hades. American spelling: honour to honor, colour to color, favour to favor, "any one" to "anyone", "to-day" to "today", "marvellous" to "marvelous", "enquire" to "inquire", "cobblers" stays.

## Typography (checked against the live edition, Books 3-10)

- Straight apostrophes `'` only (source `’` becomes `'`).
- Quoted phrases or verse inside a paragraph take **straight single quotes** `'...'` on both sides (the live edition often shows an opening curly `‘`; do not copy that, use `'` both sides). A nested quote takes double straight quotes `"..."`. Do not use curly double quotes `“ ”` (they occur only in Books 1-2).
- Dashes: source `—` (unspaced) becomes spaced ` — ` where a dash is wanted; a source `,—` or `;—` is usually better as a period or comma; `:—` becomes a colon.
- No ellipses unless in the source. No newlines in a paragraph. No leading or trailing spaces (a few source paragraphs have a trailing space; drop it).

## Things that must not happen

- Adding quotation marks, speaker labels, or a narrator to Books 3-10 turns.
- Merging, dropping or reordering turns; inflating an assent ("Certainly" to "Absolutely").
- Rendering "idea of good" as "idea of the good", or "the Good" in ordinary uses; "Form" for plain "idea".
- Varying fixed terms (State/city, temperance, soul, opinion, brass).
- Leaving "Nay", "Aye", "Assuredly", "such an one", "whither", "enquire" or British spellings.
- Changing a "State" into "city" or "the best State" into something else; adding commentary on the guardians, women, poets or the Good.
- Softening Socrates' hedges or the severity of the laws proposed.
