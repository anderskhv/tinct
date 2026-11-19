# Style note: *Utilitarianism* (John Stuart Mill), Tinct Modern English

- **Book:** `utilitarianism`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note applies to every renderer, reviewer and verifier of this edition. It governs the whole book.

**Fidelity anchor:** `served-original-en.json`, Mill's own English (the 1863 text, with Mill's later footnotes). It is English, not a translation. The task is a *modernization of Mill's prose*: no other edition was consulted, nothing is fetched from outside the book.

## What this edition is

Mill's essay in plain contemporary English. It keeps every step of the argument, every qualification, every example, every named opponent and every figure of speech that does work. It removes avoidable barriers (Victorian diction, very long periodic sentences, stock formulae). It does not make the argument easier than Mill made it and it does not explain it. The live `served-live-modern-en.json` is only a starting point: it is mostly good, but it has dropped italics, replaced "I apprehend" with "I think" and "the _summum bonum_" with "the highest good". Keep what is right in it, fix drift, and render fully any paragraph it left almost verbatim.

## Voice and sentences

- Mill is a confident, courteous, exact reasoner who often argues in the first person ("I submit", "I think", "we must observe") and answers imagined objectors. Keep that voice and those pronouns. Plain modern essay prose, a little formal. **No contractions** (outside quoted speech that has them).
- His sentences run to 150 words with nested qualifications. **Split them wherever the grammar allows, but every qualification survives as a clause or a sentence of its own, and the connectives stay**: "but", "yet", "for", "therefore", "now", "if... then", "unless", "at all events", "in other words", "that is", "except", "though", "provided". A split may not turn an "if" into a "when", a "because" into an "and", or a concession ("It is true that... but") into two separate assertions.
- Parentheses and dashes that carry a limitation or a concession stay in the sentence ("(external motives apart)", "(which are as numerous in the utilitarian as in any other scheme)").
- Passives and abstract nouns may become active and concrete only where the sense is unchanged. Do not reword text that is already clear modern English just to lower the similarity score.

## Force

Hedges and judgments keep their exact strength. Do not soften, sharpen or drop them. Fixed renderings:

| Mill | Render as |
|---|---|
| it may be said / it will be said | "it may be said" / "it will be said" (same modality) |
| I apprehend | "I understand" (never plain "I think") |
| I conceive | "I hold" (a considered view; never plain "I think") |
| I think / I believe / I submit / I do not think | unchanged |
| as I collect | "as I gather" |
| in general, commonly, mostly, almost, perhaps, apt to, tends to | keep; never turn "tends" into "does", "may" into "will", "apt to be" into "is" |
| no appeal, final, utterly, must, cannot | as strong as printed |

Mill's irony and contempt in reporting objections ("ignorant blunder", "polite comparisons", "worthy only of swine") stay as sharp as he wrote them.

## No additions

No commentary, bracketed notes, headings, glosses, dates or modern examples. A period reference may be clarified only inside the sentence, in a few words, where the text supports it ("the old Protagoras" stays; "the so-called sophist" stays).

## Structure 1:1

5 chapters, 6 / 27 / 11 / 11 / 39 paragraphs (94 total). Chapter numbers and `title` fields exactly as served (for example "Chapter 5 — On the Connection Between Justice and Utility"). Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent a paragraph. There are no section numbers and no in-text headings in this book; add none. Output length is normally at least 75% of the source's word count.

## Technical terms: one rendering, kept stable

Mill's vocabulary is the argument. Do not vary these for elegance.

| Term | Rule |
|---|---|
| **utility / the principle of utility** | Keep "utility". Never "usefulness", "benefit", "advantage" or "practicality" for his technical sense. In ch. 2 his own paragraph on the vulgar sense (utility opposed to pleasure) stays as he argues it. "Utilitarian", "utilitarianism" stay. |
| **the Greatest Happiness Principle** | Keep this exact phrase and its capitals where he capitalizes it. "Greatest-happiness morality", "the greatest happiness" keep their form. Never "maximizing welfare". |
| **happiness** | Keep. Mill defines it: pleasure and the absence of pain. Never "well-being", "welfare", "fulfillment". "Unhappiness" stays. |
| **pleasure / pain** | Keep both. "Privation of pleasure" becomes "the lack of pleasure" (not "loss"). Never "enjoyment" or "suffering" as a stock substitute. |
| **higher / lower pleasures; higher faculties; quality / quantity** | Keep "higher" and "lower", "faculties" (not "abilities"), "quality" and "quantity", and "_in kind_" with its italics. |
| **competent judges** | Keep "competent judges" and "those qualified by knowledge of both". Never "experts". |
| **"It is better to be a human being dissatisfied than a pig satisfied; better to be Socrates dissatisfied than a fool satisfied."** | Keep this sentence word for word (it is already modern). The "pig" stays a pig, "swine" stays "swine". |
| **expedient / expediency; the Just, the Expedient** | Keep. They are Mill's opposed terms in ch. 5. Never "convenient", "practical" or "useful". |
| **justice / just / unjust** | Keep. "The sentiment of justice", "the idea of justice", "a case of justice". Never "fairness" (that is his word "impartiality" or "fair" only where he wrote it). |
| **right / a right / wrong; legal right, moral right** | Keep. Do not replace "right" (correct) with "correct" or confuse it with "a right" (claim). "To have a right is... to have something which society ought to defend me in the possession of": keep the meaning and the clause structure. |
| **obligation / moral obligation / duty** | Keep both words, as printed. "Obligation" is never "requirement" or "commitment". "Perfect" and "imperfect obligation" keep their wording. |
| **sanction (ultimate, internal, external)** | Keep "sanction". It means the binding force or motive that backs a moral rule. Never "approval" or "penalty". |
| **conscience / conscientious** | Keep. "Conscientious feelings" stay. |
| **moral feelings / moral sentiments / the sentiment of justice** | Keep both words where printed: "feeling(s)" stays "feeling(s)"; "sentiment" stays "sentiment" in "sentiment of justice" and "moral sentiments". Do not merge them into one word and do not use "emotion" for either. |
| **desirable** | Keep "desirable" (ch. 4 depends on its parallel with "visible" and "audible"). Never "worth desiring" or "to be desired" unless he wrote it. |
| **criterion, standard, test, foundation of morality** | Keep each as printed. |
| ***summum bonum*, *à priori*, *sui generis*, *idée mère*, *Recht*, *droit*, *Justum / jussum / Jus / Dichanou / dichae*** | Foreign words stay as printed, with their italics. Do not translate them or replace them with English ("the highest good"). The etymology paragraph in ch. 5 (p11) is an argument about these words; keep every one. |
| **Epicurean, Stoic, Transcendentalist, Christian, utilitarian** | Keep. |
| **self-regarding / social feelings, unity with our fellow creatures** | Keep his wording; "the social state", "the social feelings of mankind" stay. "Mankind" may stay; do not change it to "humanity" except where the sentence needs it. |

## Quotations and citations

**Decision:** quoted matter stays recognizable. Mill's quoted objections ("impracticably dry when the word utility precedes the word utility", Mr. Davis's remark about saving a man from drowning, "Things in themselves", "What is restraining me...") and quoted authors (Bentham, Kant's formula "Act so that...", Bain, Comte, Carlyle, Novalis's "Entsagen") keep their words. Only spelling-level changes (American spelling, "any one" to "anyone", "connexion" to "connection") and the book's typography are allowed inside quotation marks. Everything around the quotation is modernized. A short quoted phrase mid-sentence keeps its words. Titles (*Metaphysics of Ethics*, *Annals of the Parish*, *Système de Politique Positive*, *Nautical Almanack*, "The Ethical Emotions, or the Moral Sense") are not touched. Where Mill paraphrases rather than quotes, modernize as his own prose.

**His objectors and opponents** are named as he names them and keep their roles: the objector who says "life has no higher end than pleasure", the writer who objects in the footnote, Mr. Davis, Mr. Herbert Spencer, Professor Bain, M. Comte, Mr. Carlyle, Mr. Galt, Kant, Bentham, the Stoics, the Epicureans. Never rename them, drop "Mr./M./Professor", attribute a view to a different person, or soften "they designate as utterly mean and grovelling" into neutral reporting.

## Notes, markers and special elements

- **Inline markers** `[A]`, `[B]` (ch. 2, p0 and p18) and `[C]`, `[D]` (ch. 5, p13 and p34) stay exactly in place in the sentence, with their brackets and capital letters.
- **Footnote paragraphs** are separate paragraphs at the end of their chapters and stay at their index (ch. 2 p25 and p26; ch. 5 p37 and p38). Keep the shape `[Footnote A: text.]`: the opening bracket, the word "Footnote", the letter, the colon and space, and the closing bracket. Modernize the prose in the note; keep its quotations and titles per the quotation rule.
- Footnote D (ch. 5 p38) contains a nested bracketed passage ("[Mr. Herbert Spencer, in a private communication ... scientific proof.]") and ends with `]]`. Keep both brackets exactly.
- **Italics** in the source are written `_word_`. Keep the same underscores around the same words or phrases (emphasis does argumentative work: _ought_, _in kind_, _legal rights_, _moral right_, _intention_, _disposition_, foreign words and titles). Do not add underscores and do not remove them. (The live modern edition dropped them; restore them.)

## Names and spellings

Keep proper names exactly: Socrates, Protagoras, Plato, Epicurus, Bentham, Kant, Comte, Spencer, Bain, Carlyle, Galt, Davis, Novalis, Jesus of Nazareth. American spelling as the live edition ("honor"; also "defense", "favor", "judgment", "sympathize"); "to-day" and similar become "today"; "any one" becomes "anyone"; "whilst" and "amongst" become "while" and "among". Capitalized abstractions that he capitalizes for emphasis (the Just, the Expedient, Utility, Happiness, Justice, the Ruler of the Universe, Providence) keep their capitals in the same spots.

## Typography

Match the live modern edition. Straight double quotes `"` for quotations (straight single quotes only for a quotation nested inside), straight apostrophes `'`. A source `--` becomes a spaced em dash ` — `. No ellipses unless the source has them. No newlines inside a paragraph. Numbers and citations unchanged.

## Things that must not happen

1. Dropping or merging a qualification when a long sentence is split ("in some cases", "at least", "apart from", "provided that").
2. Swapping a technical term for a synonym: *utility*, *happiness*, *pleasure*, *sanction*, *obligation*, *sentiment* are each one word throughout.
3. "I apprehend" or "I conceive" rendered as plain "I think", or "I think" rendered as "I know".
4. Rendering "pleasure" as "enjoyment" so the Epicurean charge loses its edge, or removing "swine".
5. Rewriting the Socrates sentence, or "competent judges", or the passage on desirable/visible/audible.
6. Replacing *summum bonum*, *à priori*, *Justum/Dichanou* or other foreign words with English.
7. Changing a quoted objection into a paraphrase, or an objector into an anonymous "some".
8. Moving, renumbering or relettering a footnote marker; adding any explanatory note.
9. Merging "justice" with "fairness" or "right" with "correct".
10. Adding a heading, a summary, a modern example, or any word of commentary.
