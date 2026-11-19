# Style note: *Phaedrus* (Plato), Tinct Modern English, chapter 6 repair

- **Book:** `phaedrus`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note governs every renderer, reviewer and verifier of this targeted repair. Only **chapter 6, "On Writing" (55 paragraphs)** is re-rendered. Chapters 1-5 are already modernized and are not touched.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: Benjamin Jowett's English translation (1871). The task is a modernization of that English, not a new translation. Consult no other translation and no Greek.

## What this edition is

A paragraph-by-paragraph rendering of Jowett's English into plain contemporary English. It keeps every argument step, question and answer, example, myth and name, and the voice of both speakers. It removes Victorian diction, stock formulae and over-long sentences. It does not explain the dialogue or make it easier than it is.

**Why this repair exists.** In the served `modern-en`, chapter 6 is too close to the source: 24 of 55 paragraphs are identical to the original, and about 21 more are 83-95% word-for-word (e.g. p2, the 360-word Theuth and Thamus myth, is almost unchanged; only `--` was converted to a dash). Chapters 1-5 are the standard. `served-live-modern-en.json` chapters 1-5 are the reference for level and voice: read at least ch1 p0-10, ch2 p1, ch5 p0-40 before rendering. Render chapter 6 to **that same level of modernization**: every long paragraph is genuinely re-expressed, not lightly edited. The chapter 6 text in the live file is a convenience only: keep a good rendering, fully re-render any paragraph left near-verbatim. Short exchanges ("Let us go.", "Yes.") stay as they are when already modern.

## Voice and sentences (match chapters 1-5)

- **Register.** Natural spoken English, warm and slightly formal, never slangy. **Contractions are used in the dialogue as chapters 1-5 use them** ("I'm coming from Lysias", "He's right about that", "they don't all agree"), but not stacked and not breezy. Socrates stays plain, probing, ironic and playful; Phaedrus brisk and a little impatient. No "Look,", "Okay", "Sure", "Come on".
- **Long sentences.** Break periodic sentences at semicolons and "and... and" chains into two or three sentences, as ch1-5 do, but keep the connectives (for, then, therefore, whereas, yet, because, if... then) so the steps of the argument stay visible. Keep rhetorical builds (the series of "they will be hearers of many things... they will appear... they will be tiresome company") as a build, in parallel clauses.
- **Dialogue turns.** Keep every question a question and every assent its own turn: ch1-5 render "Yes", "Certainly", "True", "Very true", "Quite true", "Of course", "Exactly" in the same strength, not longer, not shorter. "Very true" stays "Very true". A one-word or one-line paragraph stays a paragraph.
- **Diction.** Replace Jowett's archaisms and stock phrases with the plain modern word, as ch1-5 do: "whither" to "where", "thou" to "you", "enquire" to "inquire", "specific" for the Thamus word is kept (see table), "ye" to "you", "husbandman" to "farmer", "draughts" to "checkers", "enumerated" to "listed", "it would take a long time to repeat" stays in plain form, "pray" becomes "please" or "I ask you" by sense. Do not reword clear modern text just to lower the similarity number.

## Force

Keep every hedge and judgment exactly as strong or mild as served ("I think", "perhaps", "if there be such an art", "I should say", "surely", "may"). Keep Socrates' irony (his mock-deference to "the ancients", "whether true or not they only know") and Phaedrus' retort ("you can easily invent tales of Egypt") at their served force: neither softened nor sharpened. Thamus' verdict on writing keeps its full severity.

## No additions

No commentary, bracketed notes, headings, glosses, stage directions or modern parallels (no "like a modern textbook", no "the Greek word pharmakon means"). A period reference may be clarified only inside the sentence in a few words where the text supports it. Do not add emotion or tone words.

## Structure 1:1

Chapter 6 only: number 6, title exactly `On Writing`, **55 paragraphs**. Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent one. Output length is normally at least 75% of the source word count (source chapter is about 2,325 words); short turns are exempt. The rest of the book (ch1 By the Ilissus 35; ch2 Lysias's Speech 6; ch3 Socrates's First Speech 59; ch4 The Palinode 27; ch5 Rhetoric and the True Art of Speech 226) is unchanged and must not be output.

## Speaker labels

Every dialogue paragraph begins `SOCRATES: ` or `PHAEDRUS: ` (capital name, colon, one space), as served and as ch1-5 keep them. Keep the label of each paragraph exactly; add none to unlabeled text and change none. Everything after the label is modernized. The label is not counted as a quotation.

## Technical terms: one rendering, kept stable

Chosen from the actual chapter 6 text and from what chapters 1-5 already do.

| Term | Rule |
|---|---|
| **letters / writing / written words** | "Letters" for Theuth's invention stays "letters"; "writing", "written characters", "written words" as served. Never "alphabet", "texts" or "books". |
| **memory / reminiscence** | Keep the Thamus contrast exactly: letters are "an aid not to memory, but to reminiscence". "Reminiscence" stays "reminiscence" (it is what the live edition kept); never turn it into "recollection" or "reminder" in one place and not in another. "Forgetfulness" stays. |
| **specific** (Theuth: "a specific both for the memory and for the wit") | Keep "specific" (live edition). Never "cure", "remedy", "drug" or "medicine". |
| **semblance / truth / show of wisdom** | "The semblance of truth", "the show of wisdom without the reality" stay. Never "illusion" or "appearance of knowledge" as a swap. |
| **soul** | Always "soul" (ch1-5). Never "mind", "spirit" or "self". |
| **art** | "Art" for a skilled craft (rhetoric, arithmetic, letters) stays "art"; never "skill" or "technique" for it. |
| **rhetoric / rhetorician / dialectic / dialectician** | Exactly as served and as ch1-5: "rhetoric", "dialectic". Never "oratory" or "debate". |
| **word / speech / discourse** | Keep "word" for logos where Jowett has "word" ("another kind of word or speech", "a living word"). "Discourse" may become "speech" or "argument" by sense, as ch1-5 do, one choice per paragraph. |
| **Greeks** | Jowett's "Hellenes" becomes "Greeks" (live edition ch1-5 and ch6). |
| **lawfully begotten / bastard** | Keep the image of the legitimate son, the spurious word and the seed sown in the living soul; keep "seed", "garden", "sow", "harvest" and the Adonis gardens. Never replace the farming image with a plain abstraction. |
| **the gods** | Theuth is "a famous old god", Thamus is "the god Thamus" and "king", Ammon is his Greek name: keep Jowett's wording; do not call them "deities" or rewrite their relation. |

## Quotations and citations

One decision, matching ch1-5 and the live ch6: **a quoted speech, tale or recited line inside a turn takes straight single quotes**, with the tag outside: `'This,' said Theuth, 'will make the Egyptians wiser...'` and `Thamus replied: 'O most ingenious Theuth...'`. A whole paragraph that is only a turn gets no marks. Nested quotes take double quotes. A quote that Jowett marks with single quotes keeps them. No citation data occurs (no Stephanus numbers, no parenthetical notes); if one appears in the source, keep it exactly in place. Keep wording of quoted verse and proverbs except spelling and typography.

## Notes, markers and special elements

No footnote markers and no headings-as-paragraphs occur. Do not add any. Source `--` and the `Thamus replied:` style of direct speech are handled in Typography and Quotations.

## Names and spellings

Keep as served: Socrates, Phaedrus, Theuth, Thamus, Ammon, Naucratis, Egyptian Thebes, Upper Egypt, Dodona, Lysias, Isocrates, Ibis (capital as served), Adonis, Pan, the Nymphs, the Egyptians. British spellings become American (honor, favor, "to-day" to "today", "any one" to "anyone", "quarrelled" to "quarreled", "enquire" to "inquire").

## Typography (checked against the live modern-en, ch1-6)

- Straight apostrophes `'` and straight quotes: single `'...'` for quoted speech, double `"..."` only for a quote nested inside. No curly quotes.
- The source `--` becomes a spaced em dash ` — `, as in ch1-5; `:--` introducing speech becomes a colon.
- Hyphens in compounds stay. No ellipses unless in the source. No newlines inside a paragraph. American spelling.

## Things that must not happen

- Leaving a long paragraph at 80%+ word-for-word with the source, or changing only dashes and a few words (the failure of the served ch6).
- Changing the level, voice or fixed terms away from chapters 1-5 ("Greeks", "soul", "reminiscence", "specific", "art").
- Dropping or changing a speaker label; adding a label.
- Merging or splitting paragraphs, or dropping any item in Thamus' list of what writing does (hearers of many things, learned nothing, omniscient, tiresome company).
- Softening Thamus' judgment, Socrates' irony or the "written word is like a painting" comparison; adding explanation of what the myth means.
- Output for chapters 1-5, or changing a chapter title.
- Leaving "whither", "thou", "ye", "husbandman" or "enquire" in the output.
