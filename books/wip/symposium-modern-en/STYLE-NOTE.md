# Style note: *Symposium* (Plato), Tinct Modern English

- **Book:** `symposium`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note governs every renderer, reviewer and verifier of this book.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: Benjamin Jowett's English translation (1871). The task is a modernization of that English, not a new translation. Consult no other translation and no Greek.

## What this edition is

A paragraph-by-paragraph rendering of Jowett's English into plain contemporary English. It keeps every argument step, every question and answer, every example, myth and figure, every name, and the voice of each speaker. It removes Victorian diction, stock formulae and over-long sentences. It does not explain the dialogue or make it easier than it is. `served-live-modern-en.json` is a convenience only: keep a good rendering, fix drift, and fully render any paragraph it left near-verbatim (12 paragraphs are identical to the source).

## Voice and sentences

- **Register.** Clear, natural spoken English with Plato's dignity: no contractions in the set speeches (Phaedrus to Alcibiades) and the Socrates-Diotima narrative; contractions are allowed only in the brisk one-line exchanges, and sparingly. Never slangy ("guys", "totally").
- **Each speech keeps its own voice.** Phaedrus: orderly, citing authorities (Hesiod, Parmenides, Homer, Alcestis, Achilles) in praise. Pausanias: lawyerly, distinction-making (two loves, laws of cities); keep his "if... then" case-by-case structure. Eryximachus: the physician's technical, self-important tone; keep his professional terms (harmony, opposites, seasons, diet) and his pomposity. Aristophanes: comic and vivid. Keep the plain physical humor of the round people, the cut halves, the hiccough, the "basso-relievo" threat, and his own comic self-mockery. Agathon: ornate, balanced, rhetorical; keep the antitheses and the verse-like close, and do not flatten them into plain prose. Socrates: plain, probing, ironic. Diotima: authoritative and instructive, with the long periodic exposition left long enough to feel it but broken where Jowett's sentence runs past about 60 words. Alcibiades: drunk, vehement, confessional, with abrupt turns and asides.
- **Long sentences.** Break at semicolons and "and... and" chains, but keep the connectives (for, therefore, whereas, yet, nay, whether... or). Keep a rhetorical build (tricolon, antithesis) as a build.
- **Jowett's diction.** Replace stock phrases and archaisms with the plain modern word: "I would fain ask" becomes "I would like to ask"; "pray", "nay", "whither", "whence", "ere", "perchance", "ribands" (ribbons), "intemperate", "sally", "revellers", "discourse", "I should imagine", "I dare say" go to their ordinary modern sense. "Thou" and "thee" (4 occurrences, all Greek address: "thou Phalerian", "thou stranger woman", "thou wise Diotima") become "you", keeping the vocative. Answers in the Socratic chain: "Very true", "Certainly", "Yes", "Quite true", "Nay" become "True", "Certainly", "Yes", "That's right" and so on, varied by sense but never made more emphatic or less.
- **Exchange formulae.** "he replied", "said Agathon", "I said" keep their speaker and place. Do not swap in "answered" for variety if "said" is clear.

## Force

Keep hedges and judgments exactly as strong or mild as served ("I think", "perhaps", "I suppose", "must", "can never", "in my judgment"). Keep Socratic irony as irony: his professions of ignorance, his mock-praise of Agathon, his "I was a master of the art when I had no conception how anything ought to be praised" stay ironic and are not flattened into sincerity or sharpened into sarcasm. Keep Alcibiades' exaggerations as exaggerations.

## No additions

No commentary, bracketed notes, headings, glosses, stage directions, or modern parallels. Do not add "Greek" explanations ("Eros, the Greek god of love"). A period reference may be clarified only inside the sentence in a few words where the text supports it.

## Structure 1:1

8 chapters, 226 paragraphs: ch1 The Gathering 49; ch2 Phaedrus's Speech 8; ch3 Pausanias's Speech 12; ch4 Eryximachus's Speech 10; ch5 Aristophanes's Speech 18; ch6 Agathon's Speech 13; ch7 Socrates & Diotima 69; ch8 Alcibiades 47. Titles exactly as served (including the ampersand). Paragraph N of the output renders paragraph N of the source. Never merge, split, reorder, drop or invent one. Some source paragraphs are a single short line ("He assented.", a verse fragment, "instead of which our proverb will run:--"); each stays its own paragraph with its content. Output length is normally at least 75% of the source's word count.

## Narrative frame and speaker labels

The book has no speaker labels; speakers are identified only by tags ("said Agathon", "he replied"). Add none. Keep the nesting exactly: Apollodorus narrates to a companion (ch1), reporting what Aristodemus told him, who reports the speeches. Phrases such as "Aristodemus said that...", "Aristodemus did not recollect all that was said", "he added", "Phaedrus began by affirming that..." stay as reported speech: do not convert indirect to direct or direct to indirect speech, and do not drop the tags that mark whose report it is. Where Socrates reports Diotima ("she said") and Alcibiades reports what Socrates said to him, keep each layer of tag. Keep tense as served (the narrator may slip between past and present: "they hear").

## Technical terms: one rendering, kept stable

| Term | Rule |
|---|---|
| **Love** (the god, Greek Eros; Jowett writes "Love") | Keep "Love" capitalized when it names the god or personified Eros ("Love is a mighty god"; "Love is the love of beauty"). Never "Eros", "Cupid", "Desire" as a name. |
| **love** (the passion, general) | Keep "love" lowercase for the passion or activity, "in praise of love", "the laws about love". The capital/lowercase distinction is the one Jowett makes; keep it as printed. Never "romance", "attraction", "infatuation", "dating". |
| **lover / beloved** | Keep both exactly; not "partner", "boyfriend", "crush", "admirer", "darling". "Boy", "boys", "youth" stay as printed (not "teenager", "young man" unless "young man" is served). |
| **desire / want / lack** | "Desire" stays "desire". "Want" in the sense of lack ("he who desires something is in want of it") becomes "lack" or "need" only where the sense is lack, and then consistently "lack" in the Socratic chain of ch7. |
| **the beautiful / beauty** | "Beauty" stays "beauty". "The beautiful" stays "the beautiful", especially in ch7's contrast with "deformity" and in "the good also the beautiful". "Fair" meaning beautiful ("the fair and heavenly Muse", "fairest") becomes "beautiful" or "lovely" ("the fairest of the gods" becomes "the most beautiful of the gods"); keep "fair" only where it means just or light-skinned. "Fair and noble thoughts" becomes "beautiful and noble thoughts". |
| **the good** | Keep "the good" and "good"; "the good unbidden" in the proverb keeps the play on "good" (inferior men vs the good). Never "morally good" or "virtue" in its place. |
| **noble / base** | "Noble" stays "noble"; "base" or "mean" may become "shameful" or "low" by sense, consistently. |
| **heavenly love / vulgar (common) love** | Keep Pausanias's contrast as served (heavenly versus common/vulgar, the two Aphrodites). Do not invent "Uranian" or "Pandemian". "Urania the heavenly muse" stays. |
| **temperate / intemperate / temperance** | "Self-controlled" or "self-disciplined" is allowed where Jowett's sense is self-control; keep one choice per paragraph. "Temperance" stays only if it reads as the virtue; do not use "moderation" for both senses. |
| **generation / bring forth / begetting / birth in beauty** | Diotima's key idea: love is "birth in beauty", of body and of soul. Keep "birth" and "give birth". "Generate" (animals, ch5 "the male generated in the female") becomes "begot" or "conceived", "generation" becomes "reproduction" in ch5's physical sense and "generation" in the philosophical sense where it names the passing-on of life ("generation always leaves behind a new existence"). Do not drop the pregnancy and travail imagery. |
| **procreate / creation** | Keep as the same family of "begetting, bringing forth". "Creative" (the poet, the artist) stays "creative". |
| **mortal / immortal / immortality** | Keep exactly. "The mortal nature seeks to be immortal" stays at full force. |
| **daemon / spirit / god** | Keep "spirit" as the Greek "daimon" is glossed in Jowett's text; "god" is lowercase for gods generally, "God" capitalized only where Jowett capitalizes it in the singular ("For God mingles not with man"): keep as served. |
| **the ladder of love** | The word "ladder" does not occur; never add it. Keep Jowett's own images: the "steps", "ascend", "proceed", the "vast sea of beauty", the "mysteries" and the sudden vision of "absolute beauty". Keep "absolute" and "mysteries". |
| **wisdom / philosophy / knowledge / opinion** | "Wisdom" stays; "philosopher" and "love of wisdom" keep that form. "Opinion" for the middle state between wisdom and ignorance keeps "opinion". |
| **Poros / Penia** | Keep "Poros or Plenty" and "Penia or Poverty", "Metis or Discretion" with the glosses as served. |

## Quotations, verse and citations

Verse and proverb quotations (Hesiod, Homer, Euripides, Pope's Homer) keep their served wording except spelling and typography. A quoted line may stay in its own paragraph. Modernize everything outside quoted verse. Jowett's inline editorial notes in parentheses are citation or note data and stay exactly as served in place, including their typos and gaps: "(compare Arist. Pol.)", "(Iliad)", "(Odyssey)", "(supra)", "(compare Gorgias)", "(from Pope's Homer, Il.)", "(A fragment of the Sthenoaoea of Euripides.)", "(Probably a play of words on (Greek), 'bald-headed.')", "(daimon)". Do not translate, repair or move them. By contrast, parentheses that are Socrates' or a speaker's own aside ("(so men say)", "(and here, like Eryximachus, I magnify my art)", "(there was no wine in those days)") are text and are modernized in place.

## Speech, marks and special elements

- Direct speech in short exchanges (tag lines, ch1, ch7 and ch8 question chains) takes single quotation marks around the spoken words with the tag outside, matching the live edition: `'Then it must have been a long time ago,' he said.`
- Where the source has quotation marks, keep them; add none inside them except a nested quote, which takes double quotes.
- Continuous set speeches told in indirect speech (Phaedrus, Pausanias, Eryximachus, Aristophanes, Agathon) and long speech paragraphs after a tag ("Pausanias said, And now, my friends...") are not newly quoted, as the source does not quote them. Do not add quote marks to those.
- No footnote markers occur in the source. Headings-as-paragraphs do not occur. Verse lines and proverbs are short paragraphs and stay in place.

## Names and spellings

Keep Greek names in Jowett's spelling, modernized only where he is archaic: Apollodorus, Aristodemus, Glaucon, Phoenix, Phaedrus, Pausanias, Eryximachus, Aristophanes, Agathon, Socrates, Diotima, Alcibiades, Acumenus, Hephaestus, Aphrodite, Zeus, Hesiod, Dionysus, Potidaea, Delium, Phalerum, Lacedaemon (keep "Lacedaemon" and "Lacedaemonians"), Cydathenaeum, Elis, Boeotia. Do not swap in "Sparta". Keep "deme of Cydathenaeum" (deme is not glossed). British spellings become American: honour to honor, favour to favor, neighbour to neighbor, colour to color, "to-day" to "today", "any one" to "anyone", "revellers" to "revelers", "ribands" to "ribbons".

## Typography (checked against the live edition)

- Straight apostrophes `'` and straight quotes: single quotes `'...'` for speech and quoted verse, double quotes `"..."` for a quote nested inside. No curly quotes.
- Dashes: the source's `--` becomes a spaced em dash ` — `; `:--` introducing a quotation becomes a colon. Hyphens in compounds stay.
- No ellipses unless in the source. No newlines inside a paragraph. American spelling.

## Things that must not happen

- Writing "Eros", or turning "Love" the god into "love" or the reverse.
- Merging Apollodorus's frame into Aristodemus's report, or changing indirect speech to direct (and vice versa).
- Adding quotation marks to continuous speeches, headings, speaker labels or "ladder".
- Changing or fixing Jowett's parenthetical notes.
- Softening Socrates' irony or Aristophanes' comedy; making Agathon's speech plain; making Alcibiades composed.
- Rendering lover or beloved as modern relationship words, or "the beautiful" as "the pretty".
- Dropping the birth, pregnancy and travail imagery in Diotima's speech.
- Leaving "thee", "whither", "ere", "fain" in the output.
