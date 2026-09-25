# Style note: *A Vindication of the Rights of Woman*, Tinct Modern English

- **Book:** `vindication-rights-of-woman`
- **Edition:** `modern-en`
- **Date:** 2026-09-25

This note applies to every renderer, reviser and reviewer on this candidate. It governs the whole book.

**Fidelity anchor:** `source-original-en.json`. It is byte-identical to the served `original-en` (sha256 `3e168f00…91aac`), which is Wollstonecraft's 1792 English.

## What this edition is

This edition modernizes her English; it is not a translation. It is a sentence-by-sentence rendering of Wollstonecraft's prose into clear present-day English. It keeps every claim, example, qualification, sequence of thought, rhetorical question, exclamation and irony.

- **Voice.** She speaks in the first person as a combative, sardonic and morally earnest essayist. Keep that voice. The register is formal modern essay prose, not casual. Use no contractions, except inside quoted speech where the source has them.
- **Force.** Do not soften her claims, hedge her certainties or tone down her contempt for the writers she attacks, "the sex", rakes, soldiers, courtiers or the rich.
  - Equally, do not sharpen her. Keep her own qualifiers ("I think", "perhaps", "in general", "most", "may") wherever she uses them.
- **Sentence length.** Her periodic sentences may be split for clarity. Keep the logical connectives (therefore, yet, for, but) so that the argument's steps stay visible.
- **No additions.** Add no commentary, bracketed notes, headings or modern framing. A term may be glossed only when a literal rendering would mislead a present-day reader, and the gloss must be woven into the sentence in a few words.
- **Structure.** Keep the structure 1:1.
  - Chapter numbers, chapter titles and the paragraph count of every chapter must match the source exactly.
  - Each output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent paragraphs.
  - Output length is normally at least 75% of the source's word count.
- **Existing work.** Chapters 1, 2 and 4 of the live modern-en (`baseline-live-modern-en.json`) already contain genuine modernization. Revise that text rather than discarding it: keep good renderings and fix drift, and fully render the paragraphs it left verbatim. In the other chapters, keep any paragraph the live edition already rendered well.
- **Clear sentences.** Do not reword a sentence that is already clear modern English just to lower the similarity score. Ordinary 1792 syntax and diction (inversions, "hath", "whilst", "shew", "render", "doubtless", archaic senses of words) are what this edition exists to modernize.

## Quotations: one decision for the whole book

**Decision:** quoted matter stays recognizable. Wollstonecraft quotes Rousseau (in the English translation she cites as *Emilius*), Gregory, Fordyce, Chesterfield, Piozzi, Madame de Staël, Madame de Genlis, Milton, Pope, Dryden, Shakespeare, Swift, Butler, Scripture and others. Keep each quotation in its source wording. The only permitted changes are spelling normalizations that do not change a word, such as "shew" to "show", "compleat" to "complete", "idoliz'd" to "idolized" and "&c." to "etc.", plus the book's typographic conventions below.

Why:

1. Her argument works by seizing on the quoted authors' own words, such as "AGREEABLE", "fine by defect", "to know no more / Is woman's happiest knowledge" and Gregory's "delicacy". She repeatedly mocks Fordyce's and Rousseau's *style*. A paraphrase would put Tinct's words into their mouths and blunt that satire.
2. The quotations are testimony of what these men actually wrote. Readers may cite them, and they should match the published texts.
3. The quoted prose (1760s–1780s) is generally easier than hers, and the original stays one tap away in Compare.

Rules that follow from the decision:

- Everything outside the quotation marks is modernized as her prose: her lead-ins, interjections inside a quotation ("continues Rousseau", "says he"), her bracketed or parenthetical asides, and her commentary on it.
- Citation parentheticals keep their data, for example `(Rousseau's 'Emilius', Volume 3 page 176.)`. Reference wording may be tidied, but titles, volumes and page numbers are unchanged.
- **Verse** (Milton, Pope, Dryden, Butler, Swift, Prior, Cowper, Shakespeare and others) is kept exactly as printed, run-on lines included. Elisions such as *curs'd* may be spelled out.
- **Scripture** is kept in its King James wording.
- Where Wollstonecraft paraphrases rather than quotes (no quotation marks), modernize the paraphrase like her own prose.
- A quotation embedded mid-sentence as a short phrase keeps its wording. The sentence around it is modernized.
- If a word inside a quotation would be misread today, do not change it. She usually comments on it herself.

## Period vocabulary (reviewers check these especially)

| 1792 word | Usual sense in this book | Guidance |
|---|---|---|
| sensibility | Acute emotional and physical responsiveness; susceptibility to feeling, which the age prized in women | Keep "sensibility" when she names the concept. Otherwise "emotional sensitivity" or "susceptibility to feeling". **Never** "good sense" or "sensitivity to others". |
| sense | Good sense, sound judgment; sometimes the physical senses | Disambiguate by context. |
| manners | Conduct, habits of life and moral customs of a people or class, *not* etiquette. "A revolution in female manners" means a transformation in how women live and behave. | Use "conduct", "behaviour", "ways", "morals and customs" or "manners" where the modern sense still fits. |
| virtue | Moral excellence in general. She insists on this against the narrow "female virtue" of chastity and reputation. | Keep "virtue". Do not reduce it to chastity unless she means chastity. |
| understanding | The intellect, the reasoning faculty | Keep "understanding" or use "intellect"/"mind". Never "sympathy". |
| reason | The rational faculty, which for her is God-given | Keep. |
| delicacy | Refined feeling, fastidious modesty; she often uses it ironically of a cultivated weakness | Keep "delicacy", or "refinement" in context. |
| propriety / decorum | Correct conduct, often outward conformity | Keep, or use "correct behaviour" or "outward respectability". |
| the sex / my sex / the fair sex | Women as a class | Keep "the sex" or render "women" as clarity requires. Keep "the fair sex" when ironic. |
| man / mankind | Often generic ("the rights of man"), sometimes male | Keep her words. Do **not** substitute "humankind" or "people", because the man/woman contrast is often her point. |
| cunning | Low craft, manipulative scheming | "Cunning", "craft", "scheming". |
| libertine / rake | A dissolute seducer | Keep. |
| gallantry | Amorous attention and flirtation, or amorous intrigue | Keep, or "flirtation" or "sexual intrigue" in context. |
| condescension | Gracious stooping by a superior (neutral or ironic) | Choose by context. Do not make it contempt unless she means that. |
| fond / fondness | Foolishly doting | "Doting", "indulgent". |
| nice / niceties | Fastidious, over-precise | "Fastidious", "fine distinctions". |
| artless | Unaffected, without guile | "Unaffected", "guileless". |
| romantic | Fanciful, unrealistic | "Fanciful", "unrealistic", "romantic". |
| enthusiasm | Religious or emotional fervour, overheated zeal | Keep the pejorative sense. |
| fancy | Imagination | "Imagination" or "fancy". |
| genius | Natural talent or original creative power | Choose by context. |
| wit | Cleverness, quick intelligence | "Wit" or "cleverness". |
| consequence | Importance, social standing | "Importance", "standing". |
| vulgar | Common, ordinary (people) | "Common", "ordinary", "the common run". Not "crude" unless meant. |
| mean | Base, low | "Base", "low". Not "unkind". |
| want | Lack, need | "Lack", "need". |
| improve / cultivate | Develop, educate | "Develop", "cultivate". |
| passion / affection | Strong emotion / emotional attachment | Choose by context. |
| animal spirits | Physical vitality, liveliness | "High spirits", "physical energy". |
| philosophy / philosopher | Rational inquiry, including natural science / a thinker | Keep, or clarify. |
| politics | Public affairs, the science of government | Keep. |
| prejudice | Received opinion accepted without examination | Keep "prejudice". She uses it in the Burkean debate sense. |
| respectable | Deserving respect, not merely conventional | Choose by context. |
| accomplishments | Showy female attainments (music, drawing, French) | Keep. |
| establishment | A settled marriage or position in life | "A settled position", "a good marriage". |

## Fixed forms (keep as printed)

- **Names and titles as printed:** Emilius and Sophia (Rousseau's *Émile*), M. Talleyrand Perigord, Bishop of Autun, Dr. Gregory (*A Father's Legacy to his Daughters*), Dr. Fordyce (*Sermons to Young Women*), Lord Chesterfield, Mrs. Piozzi, Madame de Stael, Madame Genlis, Mrs. Macaulay (Catharine Macaulay), Dr. Johnson, Mr. Day, Dr. Smith (Adam Smith), Mahometan, Moses, Milton and all others.
- **Emphasis:** the source prints emphasis in CAPITALS (AGREEABLE, DUTY, NATURAL). Keep the same words capitalized in the same places.
- **Section markers:** `SECTION 5.1.` and the like, the `* * * * * * * * * * * * * *` separators and the leading `....` of file chapter 7, paragraph 60 stay exactly as printed.
- **Footnotes:** keep the prefix `(*Footnote. ` and the closing `)`. Modernize the note's text like her prose; quotations inside follow the quotation rule.
- **Dedication close:** "I am, sir," / "Yours respectfully," / "M. W." are kept.
  - Only the salutation "Sir:--" becomes "Sir,", as the live edition already has it.

## Coordinates

This package gives coordinates as the file's chapter `number` (1–15) and a 0-based paragraph index, written `ch7 p60`. File chapter 1 is the Dedication and file chapter 2 is the Introduction. File chapter N (N ≥ 3) is Wollstonecraft's Chapter N−2.

## Typography

- **Quotation marks:** curly double quotes “ ” for quotations and speech, and curly single quotes ‘ ’ for quotations nested inside them.
- **Apostrophes:** curly ’.
- **Dashes:** the source's `--` becomes a spaced em dash ` — `.
- **Ellipses:** use one only where the source has one.
- **Spelling:** British spelling, following the source and the live edition (honour, behaviour, favour, civilize/civilise as the source has it). Consistency matters more than which variant is chosen: prefer *-ize* (civilize, idolize) and *-our*.
