# Style note: *The Federalist Papers*, Tinct Modern English

- **Book:** `federalist-papers`
- **Edition:** `modern-en`
- **Date:** 2026-10-05

This note governs every renderer, reviser and reviewer on this candidate.

**Fidelity anchor:** `source-original-en.json`. It is byte-identical to the served `original-en` (sha256 `c7330111…d7e0509d7e8`, full hash in ACCEPTANCE-RECORD.md). `baseline-live-modern-en.json` is the served modern-en that this repair replaces. It is a prior draft, not an anchor: it is mostly the 1788 text with spelling and punctuation changes, and it contains drift. Reuse a phrase from it only after checking the phrase against the source.

## What this edition is

A modernization of Hamilton's, Madison's and Jay's own prose into plain contemporary English, sentence by sentence. It is not a new translation, a summary or a commentary. A general reader should follow each paragraph on one read.

- **Voice.** Publius is a confident, formal public advocate arguing to fellow citizens. Keep the first person ("I", "we"), the rhetorical questions, the irony and the appeals to the reader. Formal modern essay prose, not chatty. Avoid contractions.
- **Force.** Do not soften his claims, add hedges or sharpen them. Keep his own qualifiers ("perhaps", "in general", "it may be", "I presume", "for the most part") wherever he uses them.
- **Argument.** Keep every step of every argument, every qualification, every enumerated point (First… Second…, "1." lists), every example and every figure. Keep the logical connectives (therefore, yet, for, but, since) so the argument's steps stay visible.
- **Sentences.** Break the long periodic sentences where that helps. Do not reword a sentence that is already clear modern English just to lower the similarity score. 1788 syntax and diction (inversions, "hath", "whence", "wherein", "doth", "pursuant to", "it is to be observed", archaic senses) are what this edition exists to modernize. Gate passing is necessary, not sufficient.
- **No additions.** No commentary, bracketed notes, headings, modern framing or modern political parallels. A period reference (the Amphictyonic Council, a Swiss canton, Montesquieu, a Greek league, the Hanse towns, "the Belgic republic") may be clarified inside the sentence in a few words, only where the text itself supports it. Never add a fact the paragraph does not contain.
- **Structure 1:1.** 85 chapters, 1,279 paragraphs. Chapter numbers, titles (including the authorship tag, e.g. "(Hamilton)") and the paragraph count of every chapter are exactly as served. Paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent paragraphs. Output length is normally at least 75% of the source's word count.
- **Footnote paragraphs.** The served text carries footnotes as separate paragraphs ("1. Aspasia, vide …") with in-text markers "(1)". Keep the markers in the same places, keep each footnote paragraph's number prefix and render the note's text.
- **Address lines and signatures.** The served chapters carry no "To the People of the State of New York" line. The only signature in the served text is inside ch11 p14 ("PUBLIUS …"). Keep it as served. Do not add address lines or signatures.

## Quotations: one decision for the whole book

**Decision:** quoted matter stays in its source wording, with spelling and typography normalized only. Publius's own lead-ins and the commentary around a quotation are modernized.

Applies to:

1. **Legal and constitutional text.** The proposed Constitution, the Articles of Confederation, state constitutions, treaties, statutes, resolutions, Congress's recommendations. Readers may check these word for word, and Publius's argument often turns on the exact words ("necessary and proper", "general welfare", "ordain and establish"). Do not paraphrase them.
2. **Other authors.** Montesquieu, Hume, Blackstone, Locke, Vattel, Plutarch, Rousseau, Abbé Mably, Scripture (King James wording), verse, and quoted opponents of the Constitution. The original stays one tap away in Compare.
3. **Latin and French tags** stay as printed.

Rules:

- Everything outside the quotation marks is modernized as Publius's prose: "says he", "to use the words of…", his glosses and his reply.
- A quotation embedded mid-sentence as a short phrase keeps its wording. The sentence around it is modernized.
- Where Publius paraphrases (no quotation marks), modernize the paraphrase like his own prose, but keep the key terms of the text he is paraphrasing.
- A long quotation may keep archaic spellings ("shew" → "show", "compleat" → "complete", "'tis" stays), but not changed words.
- Capitalization inside legal quotations follows the served text.
- Citation parentheticals and footnote references keep their data (titles, volumes, pages, section numbers).

## Fixed terms (reviewers check these especially)

Keep one rendering per term across all 85 papers. "Keep" means: use the word as printed, in the same form.

| Source term | Rendering | Notes |
|---|---|---|
| faction, factious | **faction**; "factious" → "factional" | Madison's definition in No. 10 is kept in its exact structure: "a number of citizens, whether amounting to a majority or a minority of the whole, who are united and actuated by some common impulse of passion, or of interest, adverse to the rights of other citizens, or to the permanent and aggregate interests of the community". Do not use "party" or "group" for faction. |
| democracy, pure democracy | **democracy** / **pure democracy** | Madison's No. 10 and No. 14 distinction survives exactly: a *democracy* is a society of a small number of citizens who assemble and administer the government **in person**; a *republic* is a government in which the **scheme of representation** takes place. Never use "republic" for a direct democracy, never use "democracy" for a representative government, never swap them. "Democratic" and "republican" follow the same rule. |
| republic, republican | **republic**, **republican** | "Republican government", "republican principles" and "republican form" stay (No. 39: derives its powers directly or indirectly from the great body of the people…). "The Belgic republic", "the Roman republic", "the Swiss republics" stay. |
| federal | **federal** | Printed senses vary: a league of sovereign States (the old Confederation), the new government, and in No. 39 a mixed character. Always keep "federal" as printed. Do not change it to "national" or "central". |
| national | **national** | Keep as printed. No. 39's "partly federal, partly national" distinction, and every passage that contrasts federal with national, must survive in those words. |
| general government / federal government / national government | as printed | Never unify these. They are different phrases in the text. |
| the Union | **the Union** | Capitalized, as printed. Not "the country", "the nation" or "the federation". |
| the States / the several States | **the States**; "the several States" → "the individual States" | Capital S for the American States. "State governments" keep. Lowercase "state" for a generic political community ("a state may be…"). "Several" in the sense of "separate/individual" → "individual" or "separate", used consistently ("the several departments" → "the separate departments"). Plain "several" meaning "a few" stays. |
| confederacy, confederation, the Confederation | **confederacy**; **Confederation** | "The Confederation" = the Articles' union, capitalized as printed. "Confederate republic" stays. "Confederacies of ancient Greece" stays. |
| the Convention | **the Convention** | The Philadelphia Convention. |
| the Constitution, the plan | as printed | "The plan of the Convention" / "the proposed Constitution" / "the new Constitution" stay. A lowercase "constitution" meaning the make-up of a government stays lowercase. |
| Congress, the national legislature, the legislature | as printed | |
| departments (legislative, executive, judiciary) | **departments** | Keep "department" (the Federalist's own word) for the branches. "Judiciary" stays. |
| separation of powers; checks; balance; "partition of power" | keep the words as printed | "Separate and distinct", "checks", "balances" and "blending" appear in Nos. 47–51. Do not translate "checks" as "limits" or "controls". |
| energy, energetic, vigor | **energy**, **energetic**, **vigor** | No. 70: "Energy in the Executive is a leading character in the definition of good government" keeps "energy". Never render it "power" or "activity". No. 23 "a government as energetic as the one proposed" keeps it. |
| executive | **the executive**, **the Executive** where printed capitalized | |
| magistrate, chief magistrate | **chief executive** (the President / a governor) for "chief magistrate"; **public official** for "magistrate" | A modern reader hears "magistrate" as a judge. Use "magistrate" only where Publius uses it for a judge or for a Roman magistrate. "First magistrate" = "chief executive". |
| judicial power; the courts' power to void unconstitutional laws | follow No. 78's own wording | Do **not** import the label "judicial review". Render Hamilton's own phrases ("the courts of justice are to declare all acts contrary to the manifest tenor of the Constitution void") plainly. "Judiciary", "judicial department", "tribunals" (→ "courts") stay in these senses. |
| liberty | **liberty** | Not "freedom" unless a quotation. |
| the people | **the people** | |
| popular government(s) | **popular government(s)** | Government by or from the people. |
| sovereignty, sovereign | **sovereignty**, **sovereign** | |
| mixed government | as printed | |
| militia, standing army | as printed ("standing armies") | |
| impost, excise, duties, requisitions, quotas | **impost** (customs duty), **excise**, **duties**, **requisitions**, **quotas** | "Requisitions" are Congress's formal requests to the States for money or troops. Gloss it in a few words the first time it appears in each paper where the sentence needs it ("requisitions, or formal requests for money"). |
| mischief(s) | **harm(s)** or **ills** | "The mischiefs of faction" → "the harms of faction". |
| inconvenience(s) | **problem(s)** or **drawbacks** | |
| partial, partiality | **biased**, **bias**, or **partisan** by context | |
| candid | **fair**, **open-minded** | |
| sentiments | **views**, **opinions**, or **feelings** by context | |
| interests (landed, manufacturing, mercantile, monied) | **interests** | "Monied interest" → "moneyed interest". |
| commerce | **commerce** or **trade** | Keep "commerce" in "regulate commerce" and "the regulation of commerce". |
| emoluments | **pay**, **compensation** | Keep "emolument" only inside a quotation of the Constitution or in a direct reference to the clause. |
| genius (of a government or people) | **character**, **spirit** | |
| temper (of a people) | **disposition**, **temperament** | |
| sensible (of) | **aware (of)** | |
| enlargement of the orbit / sphere | **enlargement of the sphere** | Keep the image in No. 10. |
| extent (of territory) | **size** or **extent** | No. 14's "extent of territory" keeps "extent". |
| the late war / the late revolution | **the recent war**, **the recent revolution** | Do not add "American". |
| the late Convention | **the recent Convention** | |
| conformably to / pursuant to | **in accordance with** or **under** | |
| efficient, efficacy, inefficacy | **effective**, **effectiveness**, **ineffectiveness** | |
| salutary | **beneficial** | |
| pernicious | **destructive**, **harmful** | |
| tribunals | **courts** | |
| prerogative | **prerogative** | Keep; gloss "(the Crown's special powers)" only where the sentence needs it. |
| animadvert / animadversions | **comment on**, **criticisms** | |
| ex post facto, bill of attainder | as printed | Constitutional terms. |
| Publius | **Publius** | |

## Fixed forms (keep as printed)

- **Names, places, titles and authors as printed:** Montesquieu, Hume, Blackstone, Vattel, Abbé Mably, De Witt, Sir William Temple, Lycurgus, Solon, Pericles, Aspasia, Philip of Macedon, the Amphictyonic Council, the Achæan League, the Hanse towns, the Swiss cantons, the Dutch Stadtholder, Great Britain, Lord Chatham, and all others. Accents stay ("Achæan", "Abbé"). Keep the printed spelling of a name unless the served modern-en and every other source agree on a different one; do not "correct" "SAMMIANS" or "MEGARENSIANS".
- **Emphasis:** the source prints emphasis in CAPITALS (NATIONAL, FEDERAL, UNION, STATES, SAMMIANS). Keep the same words capitalized in the same places. Normalize the *opening word* of a paper (e.g. "AMONG" → "Among") and any all-caps lead-in that is only a typographic convention.
- **Numbered lists and "First, Second":** keep the numbering as printed.
- **Cross-references** ("No. 10", "the ninth number") keep their data. A reference by number may be tidied ("the ninth number" → "No. 9") only if the source gives that number.
- **Figures.** Keep every number, date, sum and proportion exactly. Spell nothing out that the source gives in digits and vice versa, except in the ordinary way a modern sentence reads ("the 4th of July" stays as given).

## Typography and spelling

- **Quotation marks:** straight double quotes `"` for quotations and speech, straight single quotes inside them, as the served editions have them. **Apostrophes:** straight `'`. No curly quotes anywhere (so the file serializes like the served one).
- **Dashes:** the source's `--` becomes an unspaced em dash `—`. Use an em dash only where the sentence needs one.
- **Ellipses:** none unless the source has one.
- **Spelling:** American, matching the source (defense, honor, labor, favor, color, judgment). Consistency matters more than variant; prefer -ize.
- **Capitalization of institutions:** "the Union", "the Constitution", "the Convention", "the Senate", "the House of Representatives", "the Executive" (where the source capitalizes), "Congress", "the States". Lowercase "senate", "legislature", "council" for the generic or state-level body as the source prints it.

## Period references

Clarify only inside the sentence and only when the paragraph supports it. Examples of acceptable help: "the Amphictyonic Council, the Greek league's governing council", "the Stadtholder, the Dutch republic's chief executive", "the Hanse towns, the league of German trading cities". Unacceptable: dates, causes or consequences the paragraph does not state, and modern parallels.

## Coordinates

Coordinates in this package are the file's chapter `number` (1–85, equal to the paper number) and a 0-based paragraph index, written `ch10 p3`.
