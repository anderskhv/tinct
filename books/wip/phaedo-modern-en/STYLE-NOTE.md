# Style note: *Phaedo* (Plato), Tinct Modern English

- **Book:** `phaedo`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note applies to every renderer, reviser and reviewer on this candidate. It governs the whole book.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: Benjamin Jowett's English translation (1871). The task is a *modernization of that English*, not a new translation. No other translation is consulted or copied, and no Greek is used. `served-live-modern-en.json` is a convenience only (see "Existing work").

## What this edition is

A sentence-by-sentence rendering of Jowett's English into plain contemporary English. It keeps every step of every argument, every assent, every qualification, every example, every myth and every name. It does not explain the philosophy, does not make the arguments easier, and does not smooth Socrates into a modern speaker.

## Voice and sentences

- **Voice.** Socrates is patient, ironic, courteous and exact; his interlocutors (Simmias, Cebes, Crito) are friendly and candid. Phaedo, in the frame, tells the story plainly. Keep that tone. Register: clear, natural spoken English, slightly formal, never slangy.
- **Contractions.** Allowed in speech where they sound natural ("I don't", "that's"), but not stacked up and not used to chatty effect. Do not make Socrates breezy: no "Look,", "Okay", "Right,", "Sure", "Come on".
- **Sentences.** Break very long periodic sentences at their natural joints, but keep the logical connectives (then, therefore, for, but, whereas, and yet, if, unless) so the argument's steps stay visible. Keep questions as questions. Keep the conditional wording of each premise ("if... then...") in the same order.
- **Back-and-forth.** Assents render naturally, but **every assent stays as its own turn and keeps its strength**: "Yes", "True", "Certainly", "Quite true", "Very true", "To be sure", "That is also true", "Of course". Fixed renderings: *Quite true / Very true* stay "Quite true" / "Very true" (or "Very true indeed" only if the source has "indeed"); *Certainly* stays "Certainly"; *Yes* stays "Yes". Never merge two turns, never drop a "Yes", never replace an assent by a longer agreement ("I couldn't agree more") or by a shorter one that changes strength ("Sure").
- **Addresses.** "My dear Simmias", "my good friend", "Cebes" stay. Oaths and exclamations ("By heaven", "by the dog") stay as oaths of that strength; do not substitute modern ones.
- Do not reword a sentence that is already clear modern English just to lower the similarity score.

## Force

Keep every hedge and judgment exactly as strong or as mild as served: "I think", "I should say", "perhaps", "may", "must", "necessarily", "I am inclined to believe", "if I remember rightly". Do not turn a "may" into a "will", an "I think" into an assertion, or a hesitant premise into a settled one. Keep Socrates' irony and understatement; do not spell out the joke.

## No additions

No commentary, bracketed notes, headings, stage directions, explanations of Greek customs, or modern framing. A period reference may be clarified only inside the sentence in a few words where the text supports it (for example "the Eleven" may become "the Eleven, the prison officials" only if the sentence already says what they do). Do not add emotion, gesture, tone words or adverbs the source lacks ("sadly", "gently", "calmly").

## Structure 1:1

Keep 9 chapters (numbers and `title` fields exactly as served: The Last Day; The Philosopher and Death; The Argument from Opposites; The Argument from Recollection; The Affinity Argument; The Objections; The Final Argument; The Soul Is Immortal; The Death of Socrates) and 652 paragraphs (61, 73, 51, 23, 169, 3, 211, 48, 13). Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent a paragraph; a one-word turn ("True.") remains a one-word paragraph. Output length is normally at least 75% of the source's word count; short assent paragraphs are exempt.

**Existing work.** The live modern-en is only partly modernized and 259 paragraphs are still identical to the source (mostly the short assents). Keep a good rendering; fix drift; fully render every long paragraph it left verbatim or nearly so. Where it drifted from the source (added colour, "rooster" for effect, merged ideas, "Phlius" for "Phliasian" with a changed reading), check it against the served original.

## Speaker labels and the narrated frame

- **Label format.** Only 34 paragraphs carry labels: `ECHECRATES:` and `PHAEDO:` (ch1 p0-25; ch7 p4-7 and p130-133). Keep the label exactly: capital letters, the colon, one space, no change of name, no new labels. Everything after a label is modernized like any other text.
- **Unlabeled dialogue.** The Socratic dialogue itself (ch2 to ch9) has **no** labels: each paragraph is a turn, and the speaker is known from sense or from an inline "he said", "Cebes said:", "Socrates replied". **Never add** a label such as `SOCRATES:` or `CEBES:` and never delete an inline "said". Keep inline speech tags in place and in the source order ("Yes, said Crito; is there anything else?").
- **The frame.** Phaedo is telling the story to Echecrates at Phlius: first person plural ("we", "us") and "I" in Phaedo's narration stay exactly as served; "he" is Socrates. Keep the address "Echecrates" in the closing paragraph (ch9 p12 "Such was the end, Echecrates, of our friend...") and the label-led return to the frame in ch7. Do not turn indirect narration into direct speech or the reverse.
- **Reported speech inside a paragraph.** The served text has no quotation marks around direct speech. In narrated paragraphs where two or more voices share one paragraph (mainly ch9), direct speech may be enclosed in straight single quotes as the live edition does (see Typography). A paragraph that is a single dialogue turn gets no quotation marks.

## Technical terms: one rendering, kept stable

Chosen from Jowett's actual wording. Do not vary these for elegance.

| Term | Rule |
|---|---|
| **soul** | Always "soul". Never "mind", "spirit", "self" or "psyche". Jowett's "she/her" for the soul becomes "it/its/itself" throughout the book, with no exceptions. |
| **body** | "body"; "bodily pleasures", "the pleasures of the body" as served. Never "flesh" unless served. |
| **idea / ideas** | Jowett's word. Keep "idea" and "the idea of the even", "the idea which is opposed". Do not write "Form(s)", "Forms", "essence" for idea, or "concept". Where served says "form of the idea", keep "form". |
| **absolute** | Keep "absolute beauty / absolute greatness / the absolute" (the thing itself). Never "ideal" or "perfect". |
| **essence / true existence / being / reality** | Keep as served: "essence", "true existence", "being", "the real". Do not interchange. |
| **recollection / recollect / remind** | "Recollection" and "to recollect" stay. "Reminded" and "being reminded" stay as served. Never "memory" for recollection, never "reminiscence". Keep the doctrine's formula "knowledge is recollection". |
| **opposites / generation** | "opposites", "the opposite", "generation" (coming into being from opposites), "alternation". Keep "generation" as served; do not write "creation". Keep "compensation" and "circle in nature" as the served phrase's sense. |
| **harmony** | Always "harmony" (the soul-as-harmony theory, Simmias' lyre). Never "attunement", "tuning", "music". "Lyre" and "strings" stay. |
| **the true philosopher / philosophers** | Keep "true philosopher", "true philosophers", "lover of wisdom" where served. Never drop "true" and never replace by "the wise". |
| **purification / purify / pure** | Keep "purification", "purify", "pure", "impure" and "unclean". Never "cleansing". "Initiated" and "uninitiated", "unsanctified" stay as the served words (modern equivalent "unconsecrated" is not allowed). |
| **dissever, hinderer, impute, asseverate, misologist** | "dissever" -> "separate", "hinderer" -> "hindrance" or "hinders", "impute" -> "hold against", "asseverate" -> "assert". **Misologist / misanthropist** are kept and the in-text definition ("haters of ideas") stays. |
| **participation / partake** | "participate in", "participation" for the relation between things and ideas, one rendering throughout. |
| **imperishable / indestructible / immortal / mortal / deathless** | Keep each as served; never merge "imperishable" with "immortal". |
| **the world below / the other world / Hades / Tartarus** | "the world below", "the other world", "Hades" (and "the true Hades" for Jowett's passage) as served. Keep "Tartarus", "Acheron", "Cocytus", "Pyriphlegethon" (Jowett's spelling). The afterlife myth (ch8) keeps every river, every region and every judgment in order. |
| **poison / the cup / the draught** | "poison" as served (ch1 and ch9). Never "hemlock". "The cup of poison", "the draught" stay. |
| **the cock** | Jowett: "I owe a cock to Asclepius". Render "I owe a rooster to Asclepius" (the plain modern word). "Asclepius" is not changed. |
| **cause / reason / hypothesis / mind (Anaxagoras)** | "cause" stays "cause"; "mind" in the Anaxagoras passage is Jowett's "mind" (intelligence ordering all), do not render it "soul". |
| **the gods / God** | As served; do not change "the gods" to "God" or reverse. |

## Quotations and citations

No citations occur. Quoted lines (Homer, the poets, the Orphic saying, Aesop's fable, the "many are the thyrsus-bearers" line) keep their served wording; modernize only the sentence around them. Short phrases within a sentence keep their words.

## Notes, markers and special elements

There are no footnotes, no markers and no headings-as-paragraphs. Speech tags and dashes (`--`, as in `Socrates said:--`) are handled in Typography. Keep the sentence-initial form of a list ("first... secondly...") if served.

## Names and spellings

Keep as served: Echecrates, Phaedo, Socrates, Simmias, Cebes, Crito, Xanthippe, Apollodorus, Critobulus, Hermogenes, Epigenes, Aeschines, Antisthenes, Ctesippus, Menexenus, Plato, Euclid, Terpison, Aristippus, Cleombrotus, Evenus, Philolaus, Anaxagoras, Theseus, Apollo, Delos, Asclepius, Aegina, Megara, Boeotia, Thebes, Cadmus, Heracles, Iolaus, Glaucus, Homer, Aesop. **"Phaedondes"** (ch1) stays exactly as served. **"Phliasian"** (ch1 p2) becomes "from Phlius" ("no one from Phlius ever goes to Athens"); "Phlius" stays elsewhere. "The Eleven" stays. "The Athenians", "the Theban", "Pythagoreans" as served.

## Typography

Checked against the live modern-en: apostrophes are straight ('); the served `--` is rendered as a spaced em dash ` — `; spelling is American. Rules:

- **Apostrophes:** straight ' (same as live). No curly apostrophes.
- **Reported speech:** straight single quotes ' ' for direct speech inside a narrated paragraph (ch9 and similar), nested double quotes " " inside. A turn paragraph gets no quotes.
- **Dashes:** a source `--` becomes ` — `; `:--` becomes `: —` only where a dash is natural, otherwise a colon. A hyphen in a compound word stays.
- **Spelling:** American (honor, labor, favorite, defense, toward, while, "to-day" -> "today", "any one" -> "anyone", "endeavoured" -> "tried").
- No ellipses unless the source has one. No newlines inside a paragraph. Numbers unchanged.

## Things that must not happen

1. Adding speaker labels to unlabeled turns, or deleting or altering an `ECHECRATES:` / `PHAEDO:` label.
2. Merging, dropping or paraphrasing an assent ("Yes", "Quite true", "Certainly"), or changing its strength.
3. Rendering "idea" as "Form", "soul" as "mind/spirit", "harmony" as "attunement", "recollection" as "memory", "poison" as "hemlock", or varying any fixed rendering in the table.
4. Any added emotion, gesture, tone or comment in the death scene (ch9 p5-12). Render it flatly and literally: Crito's tears, the cup, the cold rising from the feet, "Crito, I owe a rooster to Asclepius. Will you remember to pay the debt?", "The debt shall be paid... is there anything else?", "There was no answer", and Phaedo's closing judgment ("the wisest and justest and best") keep Jowett's sequence and force, with nothing added or removed.
5. Softening or sharpening claims about the soul, death, the afterlife ("I should say", "I think", "something of the kind") or the myth's hedged status ("a man of sense ought not to say... that the description... is exactly true").
6. Changing the order of premises or the conditionals in an argument, or dropping an example (Endymion, the lyre, the even and odd, snow and fire, the swans).
7. Rewording Socrates' playful or ironic lines into plain statements.
