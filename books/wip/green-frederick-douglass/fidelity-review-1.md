# Fidelity Review 1 — Narrative of the Life of Frederick Douglass, modern-en

Reviewer: Claude (Sonnet 5), acting as Reviewer B per
`books/prompts/fidelity-review-prompt.md`. Fidelity anchor: locked
`source.json` (= `app/public/data/editions/frederick-douglass-original-en.json`
at time of staging), no other edition or memory of the text consulted.

## Coverage statement

Every one of the 12 chapters (162 paragraphs total) was read as a
complete, single packet per chapter — source paragraph and candidate
paragraph shown side by side in original order, with every paragraph in
the chapter visible together, so neighboring context (before/after) was
always present for every paragraph, not just packet boundaries. This
exceeds the minimum 5–10-paragraph-packet-with-context method: it is
effectively full-chapter, non-sampled, context-complete comparison for
all 162 paragraphs. No paragraph was skimmed or skipped. Chapters
reviewed in this pass, each read as one unit: 1, 2, 3, 4, 5, 6, 7, 8, 9,
10, 11, 12 (Appendix).

Comparison working files: `compare/ch01.txt` through `compare/ch12.txt`
in this directory (generated mechanically from source.json/candidate.json,
not hand-copied, to guarantee exact-text comparison).

## Method applied per paragraph

For every paragraph: actors, negation, causality, certainty/hedging,
conditions, omissions, additions, silent "corrections" of names/
citations/facts, and unmodernized-quotation status, per the prompt's
checklist.

## Findings

**Actors / negation / causality / certainty / conditions / omissions /
additions:** No defects of any of these classes found in any of the 162
paragraphs. Every claim, number, name, condition, and hedge in the source
survives in the candidate with the same subject/object relationships, the
same polarity, and the same causal direction. Examples spot-checked
carefully given the subject matter's sensitivity:

- Ch. 1, para 6: "if the lineal descendants of Ham are alone to be
  scripturally enslaved... slavery at the south must soon become
  unscriptural" — the candidate's "If only the direct descendants of Ham
  may scripturally be enslaved, then slavery in the South must soon
  become unscriptural" preserves the exact conditional structure and the
  irony (Douglass turning the pro-slavery "curse of Ham" argument against
  itself). Correct.
- Ch. 4, paras 3–4 (killing of Demby by Gore): every step of the
  three-calls-then-shoot sequence, the "unpunished by justice" verdict,
  and Gore's continued high standing are preserved with the same actor
  attributions (Gore acts; Demby is acted upon; the community's inaction
  is attributed to the community, not excused).
- Ch. 9, para 4 (Henny): the causal chain — burned as a child → hands
  ruined → cannot work → therefore "an expense" to Master Thomas →
  therefore abandoned — is preserved intact, including the source's own
  bitter irony ("the very charitable purpose of taking care of them").
- Ch. 10, throughout (the Covey chapters): the fight sequence's blow-by-
  blow actor attribution (who grabs whom, who calls for help, who
  refuses to help) matches the source exactly, including the load-
  bearing detail that Bill refuses to assist Covey.

**Names, spellings, quotations — no silent "corrections" found.** Every
proper noun checked against source and left in the source's own printed
form: Tuckahoe, Hillsborough, Talbot, Harriet Bailey, Isaac and Betsey
Bailey, Lee's Mill, Captain Anthony, Plummer, Aunt Hester, Ned Roberts
("Lloyd's Ned"), Colonel Edward Lloyd, Sally Lloyd, Wye Town, New Design,
Noah Willis, Mr. Townsend, Austin Woolfolk, Mr. Severe, Mr. Hopkins, Mr.
M'Durmond, old/young Barney, Edward/Murray/Daniel Lloyd, Winder/
Nicholson/Lowndes, William Wilkes, Jacob Jepson, Mr. Austin Gore, Demby,
Thomas Lanman, Giles Hicks, Beal Bondly, Mrs. Lucretia Auld, Captain
Thomas Auld, Hugh Auld, Sophia Auld, Thomas Hamilton, Henrietta, Mary,
Rowena Hamilton, William Hamilton, Amanda, Rich, Mr. Curtis, Mr. Gardner,
Sheridan, Mr. Waters, Durgin and Bailey, Webster's Spelling Book, Eliza,
Priscilla, Henny, Mr. Storks/Ewery/Humphry/Hickey, George Cookman, Samuel
Harrison, Mr. Wilson, Mr. West, Mr. Fairbanks, Edward Covey, Caroline,
Thomas Lowe, Bill Smith, William Hughes, Eli, Sandy Jenkins, William
Freeland, Daniel Weeden, Rigby Hopkins, Henry Harris, John Harris, Handy
Caldwell, Henry Bailey, Charles Roberts, Betsy Freeland, Tom Graham,
Joseph Graham, David Ruggles, Anna Murray, J. W. C. Pennington, Mrs.
Michaels, Joseph Ricketson, William C. Taber, Nathan Johnson, William C.
Coffin, "Frederick Augustus Washington Bailey" / "Stanley" / "Frederick
Johnson" / "Frederick Douglass," "The Columbian Orator," Whittier, "the
Liberator," Mr. Gore's "d——d b—-h" redaction (candidate paraphrases as
"cursing her with a vile name," which is a reasonable non-slur
modernization of the redacted profanity itself, not a name — see note
below), and the appraisal-scene dialogue. None altered, standardized, or
"corrected." Dates (1835, January 1 1833, August 1833, Christmas 1833,
January 1 1834, 1835, March 1832, August 1832, September 3 1838, August
11 1841, April 28 1845) and figures (thirty slaves, eight pounds of pork,
a bushel of corn meal, seven dollars, thirty lashes, a thousand slaves,
seventy-five men, six/seven/nine dollars a week, a dollar fifty a day,
forty scholars) all match exactly.

**Withheld names (Rule 3 — the specific risk flagged for this book):**
Checked every place the narrator explicitly withholds a name or detail
for safety reasons, to confirm the candidate does not "helpfully" supply
what the source withholds:

- Ch. 7, para 3: "I am strongly tempted to give the names of two or
  three of those little boys... but prudence forbids" — candidate:
  "but prudence forbids it—not that it would harm me, but it might get
  them into trouble." No name supplied. Correct.
- Ch. 10, para 22 [23 in some indexing]: "at the house of a free colored
  man, whose name I deem it imprudent to mention" — candidate: "whose
  name I think it unwise to give." No name supplied. Correct.
- Ch. 11, para 0: the narrator's explicit refusal to detail the means,
  direction, or mode of his escape ("How I did so... I must leave
  unexplained") is fully preserved in the candidate ("How I managed
  it... I must leave unexplained, for the reasons I gave earlier."). No
  detail is invented or filled in anywhere in chapter 11. Correct — this
  is the single highest-risk passage in the book for this failure class,
  and it was checked with particular care.
- Ch. 1, para 2 and ch. 1, para 4: the withheld paternity question
  ("It was also whispered that my master was my father... I know
  nothing... I was kept from any means of finding out") is preserved as
  genuinely unresolved in the candidate, not resolved either way.
  Correct.

No instance found anywhere in the book of the candidate supplying a name,
identity, or fact that the source itself withholds. This is the
governing risk for this specific title and it is clean throughout.

**Unmodernized quotations — one defect found, in the Appendix
(chapter 12), consistent with the accessibility reviewer's independent
finding:**

- **Paragraph 2** (source and candidate both): the ~200-word quotation
  from Matthew 23 ("They bind heavy burdens..." through "...full of
  hypocrisy and iniquity") is byte-identical between source and
  candidate — completely unmodernized KJV English left untouched inside
  an otherwise fully modernized paragraph. Per
  `TRANSLATION_PROTOCOL.md`/`AGENTS.md`: "Quotation marks are not an
  exemption... a quoted formula, oath, definition, epigraph, or line of
  dialogue left in archaic spelling/syntax while the prose around it is
  modern is a defect, not a stylistic choice." This is prose (no meter
  or rhyme constraint), so there is no verse-form reason to preserve the
  archaic diction, and the protocol's caution against "substitut[ing]
  wording from another translation" is satisfied by rendering our own
  modern paraphrase rather than pasting in an existing modern Bible
  translation's wording. **Blocking — requires a fix in step D:**
  re-render this quotation into ordinary contemporary vocabulary in our
  own words, preserving every accusation and image (heavy burdens laid
  on others' shoulders but not carried; seeking status and titles;
  shutting people out of the kingdom of heaven; devouring widows'
  houses under cover of long prayer; converting one person and making
  him "twofold more a child of hell"; tithing minor herbs while
  neglecting justice, mercy, and faith; straining out a gnat while
  swallowing a camel; clean outside, corrupt inside; "whited sepulchres"
  — beautiful outside, full of decay within).

- **Paragraph 1** (the "Just God!" verse) and **paragraph 7** (the "A
  PARODY" song) are also byte-identical between source and candidate —
  left in period diction and, in the parody's case, invented folk
  dialect. Both are rhymed, metered verse quoted by Douglass from other
  sources as documentary evidence of anti-slavery/anti-hypocrisy
  sentiment. I checked the rhyme scheme directly: in the "Just God!"
  poem, "thine" (line 4 of the final stanza) is the rhyme partner for
  "combine" two lines earlier — modernizing "thine" to "yours" would
  break that rhyme outright, and the protocol explicitly forbids
  "add[ing] an idea or chang[ing] an image to land a rhyme," which cuts
  both ways: it is equally wrong to break an existing, source-intended
  rhyme through modernization pressure without a compensating rewrite,
  and any compensating rewrite risks altering the poem's specific
  accusations. The parody song is built entirely around invented
  period/folk dialect ("dona like goats," "gewgaws," "sable sons of
  grief," the "heavenly union" refrain) that IS the song's satirical
  voice — modernizing it would not just update vocabulary but erase the
  literary device Douglass is quoting as evidence. **Recommendation:
  treat as non-blocking, deliberately preserved**, with the
  reader-centered reason that these are quoted, attributed verse
  artifacts whose rhyme/meter and folk-satirical register are
  structural to their function as evidence, not merely archaic phrasing
  incidentally left untouched — distinct in kind from the Matthew 23
  prose quotation, which carries no such constraint. Final call
  deferred to the acceptance record after a correction round confirms
  the Matthew 23 fix doesn't create pressure to also alter these.

## Cross-boundary re-read (chapter 12 / Appendix specifically, and
whole-book terminology check)

Re-read the whole Appendix again after the packet pass, and swept the
whole book for recurring terms this book depends on: "abolition"/
"abolitionist" (consistently introduced and used, ch. 7–11), "class-
leader" (consistently a Methodist lay office throughout, ch. 9–10),
"Great House Farm" (consistently capitalized/italicized as a proper
name, ch. 2–3), "the root" (Sandy's charm, ch. 10, consistently referred
to the same way both times it's raised). No cross-chapter drift found.

## Verdict

**ACCEPT WITH FIXES REQUIRED.** One blocking fix: modernize the Matthew
23 quotation in Appendix paragraph 2 (prose, no meter constraint) into
our own contemporary rendering, preserving every accusation/image, per
protocol. No other paragraph in the 162-paragraph book requires a
fidelity change. The "Just God!" verse and parody song are recommended
non-blocking preservations for the reasons above, to be confirmed in the
acceptance record.
