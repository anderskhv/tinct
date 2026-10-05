# Style note: *Democracy in America* (Tocqueville), Tinct Modern English

- **Book:** `democracy-in-america`
- **Edition:** `modern-en`
- **Date:** 2026-10-05

This note applies to every renderer, reviser and reviewer on this candidate. It governs the whole book.

**Fidelity anchor:** `source-original-en.json`. It is byte-identical to the served `original-en` (sha256 `9fbec200…35a4`), the Reeve/Bowen English of 1862 (Henry Reeve's translation as revised by Francis Bowen, and Bowen's additions). The task is a *modernization of that English*, not a new translation. No other translation was consulted or copied, and no French text was used.

## What this edition is

A sentence-by-sentence rendering of the served English into plain contemporary English. It keeps every step of the argument, every qualification, every example and every figure.

- **Voice.** Tocqueville writes as a reflective, measured, grave observer who sometimes addresses the reader or speaks of himself ("I", "my"). Keep that. The register is everyday modern essay prose that a general reader follows on one reading: clear, direct, a little formal. **No contractions** except inside quoted speech that has them.
- **Sentences.** Break long periodic sentences wherever that helps, but keep the logical connectives (therefore, yet, for, but, whereas) so the argument's steps stay visible. Prefer active constructions and concrete verbs. Replace 1860s diction with its natural modern equivalent. Do not reword a sentence that is already clear modern English just to lower the similarity score.
- **Force.** Keep his hedges and judgments exactly as strong or as mild as he wrote them ("I think", "perhaps", "it appears", "in general", "almost all", "may"). Do not soften his warnings or sharpen his doubts. Do not turn a "tendency" into a law or a "may" into a "will".
- **No additions.** Add no commentary, no bracketed notes, no headings, no modern framing and no facts. A period reference may be clarified only inside the sentence, in a few words, where the text itself supports it.
- **Structure 1:1.** Keep 96 chapters and 2,258 paragraphs, with the chapter numbers, chapter `title` fields and `sections` (volume and part headings) exactly as served. Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent a paragraph. Output length is normally at least 75% of the source's word count.
- **Existing work.** The live modern-en (`baseline-live-modern-en.json`) already contains partial modernization, mostly spelling and a few word swaps. Use it as a convenience only: keep a good rendering, fix drift, and render fully every paragraph it left verbatim or nearly so.

## Technical terms: one rendering, kept stable

Tocqueville's vocabulary is the argument. Do not vary these for elegance.

| Term | Rule |
|---|---|
| **democracy / democratic** | Keep. In his sense it is above all a *social condition* (equality of conditions) and only secondarily a form of government. Keep "democratic nations", "democratic ages", "democratic communities", "democratic institutions", "the government of the democracy". Never replace with "popular rule", "republican", "majority rule" or "egalitarian" where he wrote democracy. "Democratic republic" stays as is. |
| **aristocracy / aristocratic** | Keep. "An aristocratic body, class, age, society" is fine. Never "elite", "upper class" or "nobility" as a substitute unless he says nobles. |
| **equality of conditions** | Keep this exact phrase. Bare "equality" stays "equality". "Condition(s)" is never rendered "status", "circumstances" or "class". |
| **tyranny of the majority** | Keep exactly. "Omnipotence of the majority" and "unlimited power of the majority" keep their own wording. |
| **individualism** | Keep. He introduces it as a new word and defines it in Vol. 2, Part 2, ch. 2. Keep that definition and its contrast with selfishness/egotism. |
| **centralization** | Keep. "Governmental centralization" and "administrative centralization" are his two kinds; keep the adjectives. "Centralized" is fine. |
| **township** | Keep "township" for the New England unit. Also "county" and "municipal body". Do not use "town" for it. |
| **the Union / the States** | "The Union" is the United States as a federation. "The States" and "a State" are the member states, capitalized as in the source. "State" in the sense of the political body or the state apart from society is lowercase "state". "Federal government", "federal courts", "Federal Constitution", "Congress", "the Senate", "the House of Representatives", "the President" keep these forms. "The Government" with a capital becomes lowercase "the government" unless it names the federal government in an explicit contrast with State governments ("the Federal government"). |
| **sovereignty of the people** | Keep. |
| **manners** (Fr. *mœurs*) | In his usage this is the whole set of habits, customs, dispositions of mind and heart of a people, *not* etiquette. Use "customs", "habits and customs" or "mores" where he means that, and "manners" only where he means social behavior or politeness. Keep the passage that defines the term. |
| **sentiments, notions, passions, intelligence, faculties, habits, opinions, beliefs** | "Sentiments" may become "feelings" where "sentiments" would now mislead; "notions" becomes "ideas" or "notions" by context; "passions" stays; "intelligence" is the mind's capacity, not information. |
| **self-interest properly understood** | The fixed rendering of "interest rightly understood". |
| **the Americans / the Anglo-Americans / the English / the French / Europe / the Old World / the New World** | Keep as printed. |
| **equality, liberty, despotism, tyranny, freedom** | Keep each word as he used it. "Liberty" and "freedom" are not interchangeable where he sets them against "independence", "despotism" or "equality". Keep the one he wrote. |
| **race terms (ch. 18 of Part 2 of Vol. 1)** | See "Native Americans and Black Americans" below. |

## Quotations: one decision for the whole book

**Decision:** quoted matter stays recognizable. That covers the text of the Federal Constitution, State constitutions, statutes and charters, the *Federalist*, judges, commentators (Kent, Story, Jefferson, Washington, Madison, Montesquieu and others) and speeches and mottoes. Keep the quotation in its served wording. The only changes permitted inside a quotation are:

- spelling normalization to American spelling, without changing a word ("shew" to "show", "whilst" to "while" where it is spelling-level, "&c." to "etc.");
- the book's typography (below);
- nothing else.

Why: the argument often works on the exact words of a law or a witness, readers may cite them, and the served wording is what the reader can match in Compare. Paraphrasing a clause of the Constitution would change what it says.

Rules that follow:

- Everything outside the quotation marks is modernized: his lead-ins, his interruptions inside a quotation ("says he"), his commentary and his translations of what he reports.
- A paragraph that is wholly quotation (constitutional text, list-like legal clauses) may remain identical except for typography and spelling. Everything else must be modernized.
- Citation data (volume, page, section, act dates, "Ibid.") is not touched. "See" stays "See".
- Where he paraphrases rather than quotes (no quotation marks), modernize like his own prose.
- A short quoted phrase mid-sentence keeps its words. The sentence around it is modernized.
- If a word inside a quotation would be misread today, do not change it. His text usually explains it.

## Native Americans and Black Americans (editorial decision, flagged for Anders)

Chapter 18 of Part 2 of Vol. 1 (file chapter 19, 372 paragraphs) treats "the three races". Use present-day terms for the peoples and keep his analysis exactly:

- "the Indians" / "Indian tribes" becomes "the Native Americans" / "Native American tribes" at first mention in a paragraph and "the Native Americans" or "the tribes" afterward. A specific nation's name (Cherokees, Choctaws, Creeks, Iroquois…) is kept as printed. "Indian" stays inside quotations and in fixed terms ("Indian corn", "Indian Territory", "Indian Department" and the like).
- "the Negroes" / "the negro race" becomes "Black people" / "the Black population" (capital B) and "Black Americans" where he means Americans. "Mulatto" becomes "person of mixed race". "Slave", "slavery", "master", "freed" and "free Negro" (→ "free Black person") stay literal. Do not use "African" unless he does.
- "white(s)" keeps its form. "Race" and "racial prejudice" keep their form. His own words "savage" and "civilized" are **kept** where they carry his argument (the contrast of the hunter life with the settled one) and are not softened or removed. "Barbarous" is kept.
- These are rendering choices for readers. They do not change any claim. Where he reports what white Americans believe about Black people or Native Americans, report it as he does, no more and no less. Do not add editorial distance.

## Fixed forms (keep as printed)

- **Names, titles, places, statutes as printed**: "the *Federalist*", "Kent's *Commentaries*", "Story", "Cotton Mather", "Massachusetts", "Pennsylvania", "Lower Canada" and all others. Figures, dates, statistics, sums of money, weights and measures are not altered in any way (keep "fr. ($40,000,000)", "mile", "league", "pound sterling", every digit).
- **Titles and offices** are modernized only in typography ("M. de Tocqueville" stays). Capitalize "Constitution" and "Federal" when printed so.
- **Chapter titles** in the chapter `title` field stay exactly as served (their old Title Case is retained). **In-text headings** (short paragraphs that are headings, for example "Limits Of The Township" or "Origin of the Anglo-Americans...") keep their wording and take standard modern title case ("Limits of the Township"), nothing else.
- **Footnote and endnote paragraphs** are separate paragraphs in this edition and stay in place, index for index. Two shapes occur: `x [ text.]` (a lowercase letter, a space, an opening bracket, a space, the text, a closing bracket) and `[Footnote a: text.]`. Keep the shape exactly, the letter or number, the spacing and the closing bracket. Modernize the note's own prose like his text, keep every citation and every quotation inside it per the quotation rule. A note that is purely a citation stays identical.
- **Section/part markers and any `(…)` appended text** stay in place.

## Typography

- **Quotation marks:** curly double quotes “ ” for quotations and speech, curly single quotes ‘ ’ for a quotation nested inside. No straight quotes remain.
- **Apostrophes:** curly ’.
- **Dashes:** a source `--` or an unspaced em dash becomes a spaced em dash ` — `. A hyphen in a compound word stays a hyphen. Page ranges ("pp. 358-382") are left alone.
- **Spelling:** American, as in the served edition and the live modern-en: honor, labor, favor, defense, center, civilize, toward, among, while (not amongst, whilst), "to-day" → "today", "to-morrow" → "tomorrow", "any one" → "anyone", "every thing" → "everything".
- **Numbers:** unchanged.
- **Ellipses:** only where the source has one.

## Period vocabulary (reviewers check these especially)

Replace the 1860s sense with the modern word when the old sense is meant; keep the word if the modern sense fits.

| Word | Usual sense in this text | Guidance |
|---|---|---|
| sentiments | feelings, views | "feelings" or "views" by context |
| notion | idea, belief | "idea", "belief" |
| civilization | settled, literate, commercial society | keep "civilization" |
| intelligence | mental capacity or training | "intelligence" or "education", by context |
| enlightened | educated, informed | "educated", "well-informed", or keep |
| public spirit | civic feeling | keep "public spirit" or "civic spirit" |
| interest(s) | advantage, concern | "interest" or "stake", by context |
| agitate | move, stir up | keep if "agitate" still fits, else "stir up" |
| engross, engender | absorb / produce | "absorb", "produce", "give rise to" |
| anomaly, singular | strange, unusual | "anomaly", "unusual", "odd" by context |
| peculiar | particular, distinctive | "particular", "distinctive" |
| commonwealth | a State as a political community | keep "commonwealth" where printed as a title (Massachusetts) |
| the Legislature | the lawmaking body of a State | "the legislature" |
| the Bench / the Bar | judges / lawyers | "the bench", "the bar" or "judges", "lawyers" |
| legist | lawyer | "lawyer", "legal scholar" |
| civil society | the life of society apart from government | keep |
| public functionary | public official | "public official" |
| a species of, a sort of | a kind of | "a kind of" |
| habitual / habits | settled customs | keep; do not merge with "customs" in the manners rule |
| competition, emulation | rivalry / ambition to equal | "rivalry", "emulation" by context |
| vanity | pride in appearance of rank | keep "vanity" |
| honor | code of conduct tied to rank | keep "honor" |
| faction | party acting from passion | keep |
| a fanatical, a restless spirit | as printed | keep the force |

## Coordinates

This package gives coordinates as the file's chapter `number` (1–96) and a 0-based paragraph index in that chapter, written `ch9 p60`. File chapter numbers are the served numbers, not Tocqueville's own chapter numbers (the file's chapter 21 is the "Author's Preface to the Second Volume").

## Format of a batch file

`batches/chNNN_pAAA-BBB.json` (three-digit chapter, three-digit paragraph range, inclusive) holds:

```json
{"book": "democracy-in-america", "edition": "modern-en", "chapter": 9, "start": 0, "end": 29, "paragraphs": ["…", "…"]}
```

`paragraphs` has exactly `end - start + 1` strings: the rendering of source paragraphs `start..end` of that chapter.
