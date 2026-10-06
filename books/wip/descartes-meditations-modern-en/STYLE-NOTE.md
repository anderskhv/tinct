# Style note: *Meditations on First Philosophy* (Descartes), Tinct Modern English

- **Book:** `descartes-meditations`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note applies to every renderer, reviser and reviewer. It governs the whole book.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: John Veitch's English translation (1901 printing). The task is a *modernization of that English*, not a new translation. No other translation is consulted or copied; no Latin or French text is used.

## What this edition is

A paragraph-by-paragraph rendering of Veitch into plain contemporary English. Every step of every proof, every premise, qualification, example and figure survives. It does not make Descartes easy and does not explain him. Only Veitch's archaic diction, stock formulae and long periodic sentences are removed.

## Voice and sentences

- **Voice.** Descartes writes as a single "I" thinking aloud, one meditator working step by step ("I will now close my eyes", "Let us pass, then, to..."). Keep the first person, the present tense of the meditation, the questions he puts to himself and the occasional "Let us" / "let him deceive me as he may". The Letter, Preface and Synopsis address the reader and the Doctors of Paris in a formal, courteous register; keep that register there, in plain modern form.
- **Sentences.** Split long periodic sentences where it helps, but never so that a premise becomes detached from its conclusion. Keep the connectives that carry the proof: therefore, hence, for, since, because, but, yet, unless, if... then, nevertheless, now, thus, accordingly. Do not drop a "therefore" or a "for". Do not add one that is not there.
- **Archaisms.** Replace period wording with the natural modern equivalent ("whilst", "perchance", "it be", "doth", "I apprehend" in the sense of "I think", "retrenching" for "removing", "essay to" for "attempt to", "sciolists" for "smatterers"). Do not reword a sentence that is already clear modern English just to lower the similarity score.
- **No contractions** in narrative prose.

## Force

Keep hedges and judgments exactly as strong or mild as written: "seems", "perhaps", "I think", "I am certain", "it is manifest", "I cannot doubt", "to speak precisely", "almost", "in some measure". Do not turn "I do not yet know" into "I cannot know", "probably" into "certainly", or a conditional into an assertion. The degrees of certainty are the argument.

## No additions

No commentary, no bracketed notes of your own, no headings, no modern framing (no "Cartesian", "dualism", "ontological argument", "cogito" label) and no facts. A reference may be clarified only inside the sentence in a few words where the text supports it.

## Structure 1:1

- **9 chapters**, with these paragraph counts: Letter of Dedication 7; Preface to the Reader 7; Synopsis of the Six Following Meditations 6; Meditation 1: 12; Meditation 2: 16; Meditation 3: 39; Meditation 4: 17; Meditation 5: 16; Meditation 6: 24. Chapter `title` fields stay exactly as served, including the form "Meditation 1 — Of the Things of Which We May Doubt".
- Every paragraph begins with its Veitch number ("1. ", "2. "...). **Keep each number exactly**; numbers restart in every chapter. The first paragraph of the Letter (ch1 p0) is the unnumbered salutation: "TO THE ... PARIS.\n\nGENTLEMEN,". Keep it as one paragraph with its internal blank line (the only paragraph with a newline), modernizing only the wording, as the live edition did ("VERY SAGE" may become "MOST WISE"). Keep it in capitals.
- Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent a paragraph. Opening words printed in capitals in the source ("1. I WILL now", "1. SEVERAL years", "1. THERE now remains") are rendered in ordinary case: "1. I will now".
- This edition contains no Objections and Replies; the Preface and Synopsis refer to them (the Objections, with the relative Replies). Keep those references as written; do not supply the missing text.
- Output length is normally at least 75% of the source's word count.

## Technical terms: one rendering, kept stable

The terms are the argument. Never paraphrase one into a looser everyday word, and never vary one for elegance. Where Veitch is already modern and exact, leave it.

| Veitch | Fixed rendering and rule |
|---|---|
| clearly and distinctly perceived / conceived / apprehended; clear and distinct perception | Keep "clearly and distinctly" and "clear and distinct" with "perceive/conceive/apprehend" as Veitch has the verb. Never "obviously", "plainly", "vividly", "sharply". Keep both adverbs, in that order. |
| a thinking thing; a thing which thinks | Keep "thinking thing" exactly (also "extended thing", "non-extended thing"). Never "thinking being", "thinker", "person". |
| mind; soul; intellect; understanding; reason | "Mind" and "soul" both stay as printed ("the human soul", "the Soul" for the topic of the Letter, "mind" in the Meditations); do not unify them, and do not use "spirit" or "psyche". "I am a mind (mens sive animus), understanding, or reason" keeps all its terms. "Understanding" (intellectio, the faculty and its act) is never "intellect", "intelligence" or "comprehension" unless Veitch wrote it. "Intellect" and "intellectual" stay where printed. |
| idea | Keep "idea" always (159 uses). Never "image", "concept", "notion", "thought" for it. "Image" is its own word (the imagination forms images; ideas are not all images). |
| objective reality / objectively; formal reality / formally; eminently | Keep these scholastic words and their pairing: "formally or eminently", "objective reality", "contained formally and eminently". Never "actual", "literal", "outwardly", "in a higher form" as substitutes. Veitch's own bracketed glosses ("[i. e., participates by representation...]", "formally (actually)") stay in place and word-for-word in sense. |
| substance; attribute; mode; essence; nature | Keep. "Attribute" is not "property" or "quality". "Mode" is not "way" in the technical sense ("modes of thought"). "Real distinction" and "really distinct" stay. "Essence" and "nature" stay distinct as printed. |
| natural light; what the natural light shows | Keep "natural light" exactly (13 uses). Not "common sense", "intuition", "reason" or "inner light". |
| God; Deity; a supremely good God; the deceiver | Keep "God" for God. Veitch's "Deity" (24 uses) is kept as "God" or as "Deity" per his sentence; where he writes "Deity" in a general sense ("the ascription of human affections to Deity") keep "Deity". "Sovereignly good" becomes "supremely good". The hypothesis of the powerful deceiver: Veitch says "some malignant demon, exceedingly potent and deceitful" and "an extremely powerful ... malignant being". Keep "malignant demon" (not "evil genius", which Veitch's text does not use; also never "devil"). "Deceive", "deceiver", "deceitful" keep their stem. |
| extension; extended; figure; magnitude; corporeal nature | Keep "extension", "extended" and "corporeal" ("corporeal nature", "corporeal things"). "Figure" in the sense of shape stays "figure" (as in "figure, quantity or magnitude"). Never "size", "spatial", "physical" for these. |
| will; understanding; judgment; liberty / freedom | "Will" and "understanding" are the two faculties of Meditation 4; keep both words. "Power of will", "freedom of choice" and "liberty of indifference" keep Veitch's noun; "freedom" and "liberty" are not interchanged. "Judgment" is never "opinion"; "assent" stays "assent". |
| error; falsity; truth | Keep "error" (47 uses) as the topic of Meditation 4; never "mistake" for it where it is the thing explained. "Mistake" stays only where Veitch has it. |
| doubt; suspend judgment; certain; indubitable | Keep. "Doubt" is never "question". "Certain/certainty" is never "sure/likely". "Suspend my judgment" stays. |
| perceive (perceiving, sentire); conceive (intelligo); imagine (imaginatio); apprehend (percipio) | Keep Veitch's verb, because his parentheses mark which Latin word he means. The parenthetical "(sentire)", "(intellectio)", "(imaginatio)", "(cogitatio)", "(pronunciatum)", "(percipio)", "(intelligo)", "(intueor)", "(effingo)", "(inspectio)" stay exactly as printed. |
| consciousness; thought | Veitch's "thought (consciousness)" and "thinking (conscious)": keep "thought" / "thinking" and keep the parenthetical gloss. Never swap one for the other. |
| the wax passage (Meditation 2) | Keep the wax as "the wax", "this piece of wax", with its sequence: taste, smell, color, figure, size, sound; fire brought near; "the same wax remains"; "perceived by the mind alone", "inspection of the mind", "imagination", "senses". Do not replace "wax" or reorder the steps. "I judge" vs "I see" (men passing in the street, hats and cloaks) keeps its point: "I judge by the faculty of judgment in my mind what I thought I saw with my eyes". |
| cause; effect; perfection; being; infinite; finite | Keep: "the cause must contain at least as much reality as the effect", "more perfect", "a being absolutely perfect", "infinite", "finite". No "greater reality" for "more reality". |
| body; corporeal | "Body" for the human body and for material body; "material things" and "corporeal things" both as printed. |
| the cogito | See below. |

## The cogito and Latin

- Veitch **does not** write "I think, therefore I am". His forms are "I am, I exist" and "I am—I exist: this is certain; but how often? As often as I think", and "I exist, since I am deceived", "I am because I doubt". **Keep exactly these**, rendered in modern punctuation ("I am, I exist"; "I am — I exist"). Do not supply "I think, therefore I am", the Latin ergo sum, or the label "cogito". Keep "this proposition (pronunciatum) I am, I exist, is necessarily true each time it is expressed by me, or conceived in my mind."
- Latin appears only as single words in parentheses (listed above) and in "mens sive animus", "conceptus". Keep each exactly as printed and in place, in italics only if the source has them (it has none: plain text). Do not add Latin and do not translate it away.
- The proofs (God's existence in Meditations 3 and 5; the real distinction of mind and body in Meditation 6; the cause of error in Meditation 4) are step-by-step. Every premise, every "now", "but", "therefore" and every numbered paragraph keeps its order. A reviewer checks that no premise is omitted, merged into another, or turned into a conclusion.

## Quotations and citations

**Decision:** quoted matter keeps its served wording. The only quotations are scriptural ("Howbeit they are not to be excused", Romans i, Book of Wisdom xiii) and the title *Discourse on the Method*. Scripture quoted inside the text keeps Veitch's wording (spelling and typography only). The sentence around it is modernized. Citation data ("chapter xiii", "chapter i", "Romans") is not touched. A short quoted phrase mid-sentence keeps its words.

## Notes, markers and special elements

- **Square brackets (92)** are Veitch's own explanatory insertions inside a sentence ("[i. e., participates by representation in so many degrees of being and perfection]", "[who are cognisant of the disorders which doubt of these truths produces]"). Keep every bracketed insertion, in the same place, with the same content and the closing bracket. Modernize its wording lightly like the surrounding prose; never drop, move or fold it into the sentence; never add one.
- **Parentheses** keep their content (Latin words and glosses, above).
- **The asterisk** at the end of a clause in the Letter (ch1, "...produces].*") is a stray marker. Keep it as it stands, in place.
- **Spaced question marks** in the source ("deceived ?") become "deceived?" with no space.
- No headings-as-paragraphs, lists, verse or speaker labels occur. The only multi-line paragraph is ch1 p0.

## Names and spellings

Proper names and titles as printed: the Dean and Doctors of the Sacred Faculty of Theology of Paris, Gentlemen, Scripture(s), the Discourse on Method, the Meditations, the Objections, the Replies. "Meditation" capitalized with its ordinal ("the Third Meditation"). "Gentlemen" stays capitalized in the address. American spelling as in the live edition: "cognizant", "honor", "color", "toward"; "to-day" becomes "today"; "any one" becomes "anyone".

## Typography

Matched to the live modern-en:

- **Apostrophes:** straight `'` (no curly characters occur in the live edition; do not introduce any).
- **Quotation marks:** the served quotations are rendered with straight single quotes `'...'` (as in the live edition's `'Discourse on Method,'`). No double quotes.
- **Dashes:** a spaced em dash ` — ` where the source has an em dash or the live edition uses one. Hyphens in compounds stay.
- **Ellipses:** only where the source has one.
- **Newlines:** none inside a paragraph, except the single blank-line break in ch1 p0.
- Numbers, the "N. " paragraph prefix and the capitalization of the salutation are unchanged.

## Things that must not happen

1. A technical term replaced by a looser word (idea becomes "thought", natural light becomes "reason", objective reality becomes "actual reality", thinking thing becomes "thinker").
2. "I think, therefore I am" appearing (Veitch does not have it); or "evil genius" for the malignant demon.
3. A proof step dropped, merged, reordered or its connective changed so that a premise becomes a conclusion.
4. A hedge sharpened or softened ("perhaps", "I think", "it seems").
5. A bracketed gloss or parenthetical Latin word dropped, moved or added.
6. A paragraph number changed, or a paragraph merged or split; chapter titles altered.
7. Commentary, modern terminology, or invented Objections and Replies text.
8. Collapsing "mind", "soul", "understanding", "intellect" and "reason" into one word.
9. Curly quotes or apostrophes introduced; double quotes introduced.
