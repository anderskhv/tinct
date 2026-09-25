# Whole-book coverage: Symposium against the complete Jowett text

## Scope and method

The baseline `original-en` served at `main` `38a97c63` (217 paragraphs, 21,429 words) was compared in full with the Jowett dialogue in PG #1600 (180 paragraphs, 22,077 words; see `source/SOURCE.md`). Earlier repair commits `c6384c19` and `67aa9c16` were not relied on.

- **Word level, whole book.** Both texts were tokenised on whitespace. Their full token streams were aligned with an exact sequence matcher (no junk heuristics), and every non-equal region was listed.
- **Paragraph level.** Every source paragraph start was checked to be a reader-paragraph start, and every reader-paragraph start was classed as either a source boundary or a split inside a source paragraph.
- **Structure.** Each chapter was mapped to the source paragraphs it contains, and each chapter boundary was read in context.

HTML and TXT were parsed independently and agree, except that the HTML uses `—` where the TXT uses `--`. `passage-coverage.tsv` hashes each source paragraph in both forms.

## Result: one omission, nothing else

| Finding | Baseline | Candidate |
|---|---|---|
| Omission | Source paragraphs **0–8** (648 words) absent: the whole opening, from "Concerning the things about which you ask to be informed…" to the companion's "…raging against yourself and everybody but Socrates." | Restored verbatim at **1.0–1.8** in original-en; rendered at 1.0–1.8 in modern-en |
| Other omissions | None: the remaining 21,429 tokens equal source tokens 648–22,076 in order | None: the candidate token stream equals the full source stream |
| Duplications, reorderings, altered words | None | None |
| Accidental joins (a reader paragraph spanning a source paragraph boundary) | None | None |
| Splits inside a source paragraph | 46 splits in 23 long source paragraphs (≥ 288 words), all at sentence ends | Same 46 splits, kept (`split-inventory.tsv`) |
| Misplaced chapter boundary | Chapter 7 ran into the Alcibiades episode | Corrected (below) |

The missing opening is the part of the frame that:

- has Apollodorus meet Glaucon on the road from Phalerum;
- establishes when the banquet happened ("In our boyhood … when Agathon won the prize with his first tragedy, on the day after … the sacrifice of victory");
- names Aristodemus of Cydathenaeum as the eyewitness source (with Phoenix, son of Philip, as a garbled second-hand source);
- ends with the companion's retort. Without it, the served text opened mid-exchange with "APOLLODORUS: Yes, friend, and the reason why I am said to be mad…", which answers a remark the reader never saw.

Every one of the 180 source paragraphs is listed in `passage-coverage.tsv`, with its section, its hashes, its baseline coordinates (or `MISSING`), its candidate coordinates and its status. The build asserts that the candidate paragraphs listed for each source paragraph, joined with single spaces, reproduce that source paragraph exactly.

## Chapter boundaries (editorial reading aids, not Plato's divisions)

| Ch | Title (candidate) | Source ¶ | Content | Boundary assessment |
|---|---|---|---|---|
| 1 | The Gathering | 0–48 | Frame (Apollodorus, Glaucon, companion); Aristodemus's narrative to the proposal to praise Love | Start restored. Ends at "…what the chief speakers said." ✓ |
| 2 | Phaedrus's Speech | 49–54 | Phaedrus | ✓ |
| 3 | Pausanias's Speech | 55–58 | Transition sentence and Pausanias; Aristophanes's hiccough; Eryximachus agrees to go first | ✓. The transition sentence opens source ¶55 together with the start of the speech, so the boundary must fall at ¶55 |
| 4 | Eryximachus's Speech | 59–64 | Eryximachus; banter with Aristophanes | ✓ |
| 5 | Aristophanes's Speech (was "Agathon & Aristophanes" in original-en only) | 65–75 | Aristophanes's speech (all of ¶65); interlude; Agathon's lead-in "…and then speak:--" | ✓. The lead-in closes the chapter, as 6→7 does. Title harmonised (C-04) |
| 6 | Agathon's Speech | 76–85 | Agathon; applause; Socrates's reply; "Socrates then proceeded as follows:--" | ✓ |
| 7 | Socrates & Diotima | 86–141 | Socrates questions Agathon; Diotima's teaching; Socrates's closing words | **Was ¶86–178. Now ends at ¶141**, "…may call an encomium of love, or anything else which you please." |
| 8 | Alcibiades | 142–179 | Alcibiades's arrival, his speech in praise of Socrates, the aftermath, the dawn closing | **Was ¶179 only. Now starts at ¶142**, "When Socrates had done speaking, the company applauded…" |

**Why ¶142 is the transition.** Socrates's speech ends at ¶140–141. He says Diotima's words are those he is "persuaded of" and hands them to Phaedrus as "an encomium of love". The next paragraph, ¶142, switches to Aristodemus's narration of the applause, Aristophanes's attempted reply, the knocking of revellers and Alcibiades's arrival. That is the conventional start of the Alcibiades section (Stephanus 212c), and it is where the existing chapter title and the SEO chapter summaries already place it. No sentence or quotation straddles the new boundary in either edition: original 7.68 ends without an open quotation, modern 7.68 closes Socrates's quotation, and both 8.0 paragraphs open with narration.

**Other boundaries read and kept.** No other chapter boundary cuts a sentence or a speech in a way that is a defect.

**Split kept (note).** Source ¶142 is split before its last sentence (candidate 8.0 | 8.1; baseline 7.69 | 7.70). The splitter broke at the `?` of Jowett's note "(supra Will you have a very drunken man? etc.)?", which leaves "Will you drink with me or not?'" as a seven-word paragraph finishing Alcibiades's utterance. It is a complete sentence and no text is lost. Merging it would change more coordinates for aesthetics only, so it is kept.

## Modern English completeness (whole book)

`modern-en` was checked paragraph by paragraph against `original-en`:

- word-token alignment of each pair;
- runs of three or more dropped tokens;
- counts of negations (`not`, `no`, `never`, `nor`, `nothing`, `none`, `without` and contractions);
- numerals;
- capitalised names.

In full, the following were read against the original:

- every paragraph with a token similarity below 0.90 (26 paragraphs: 1.0–1.6, 1.8, 1.10, 1.11, 1.20, all of chapter 3, 7.0, 7.80, 8.0 in baseline numbering);
- every flagged drop;
- all of chapter 1.

Findings:

- **Content omissions.** Apart from the restored opening, which was absent from both English editions, the independent review (Review 1, F2 and F8) found two dropped elements in existing modern-en text. My screening had passed both, because they sit inside paragraphs that are otherwise close renderings:
  - the qualification "which custom allows" (3.7);
  - the hedge "done his best" and the quotation 'uses base' (3.8).

  Both are restored by C-06. The same change fixes a garbled clause in 3.3. No other omission was found by either check.
- **Jowett's inline notes are omitted in modern-en, by consistent convention (20 in the baseline):**
  - (Iliad) twice, at 1.10 and 1.15; (Odyssey) at 6.9; the citation inside "(as Euripides would say (Eurip. Hyppolytus))" at 6.10 (the speaker's "as Euripides would say" is kept)
  - (compare Prot.) at 1.34; (compare Rep.) at 2.4; (compare Arist. Politics) at 3.3; (compare Arist. Pol.) twice at 5.5 and once at 7.92
  - (A fragment of the Sthenoaoea of Euripides.) at 6.4
  - (compare 1 Alcibiades), (compare Gorgias) and (supra) at 7.45; (supra Will you have a very drunken man? etc.) at 7.69; (from Pope's Homer, Il.) at 7.80; (In allusion to two proverbs.) at 7.97; (compare supra) at 7.104; (Aristoph. Clouds) at 7.105; (compare Gorg.) at 7.106
- The other 16 parentheses in the baseline are kept in modern-en, some rephrased or without brackets. Fifteen are the speakers' own words: 1.31 "I do not include Socrates…", 2.7 on Aeschylus's error, 3.5 "so men say", 5.2 "the same which is called the navel", 6.3 "and here, like Eryximachus, I magnify my art", the outer "as Euripides would say" at 6.10, 7.46, 7.48 "there was no wine in those days", 7.64, 7.66, 7.93, 7.96, 7.99, and two at 7.104. The sixteenth, "(daimon)" at 7.47, is Jowett's gloss of the Greek word (Review 1, F6).
- Every negation and numeral difference was inspected. All are "any one" becoming "anyone", rephrasings, or dropped note text, and none reverses a meaning.
- **Additions not in Jowett (note).** Baseline modern 8.0 (candidate 8.46) adds "from left to right" and "Aristodemus couldn't remember most of what was said". Both reflect Plato's Greek, not Jowett. This is recorded and not changed.
- **Typography (note, not changed).** Modern 1.24 (candidate 1.33) has doubled quote marks: `''I may touch you,'` … `sought.''`. Modern 1.11 (candidate 1.20) ends with `',` before a verse quotation. Quotation-mark conventions also differ between chapters (chapter 1 quotes direct speech; chapter 3 does not). These are pre-existing, not completeness defects. They are left unchanged so every old paragraph keeps exact offsets for annotations and card mentions.

## Similarity gate (pre-existing failure; decision needed)

`books/classify-modern-en.py symposium --gate` was run read-only on the live files, and on the candidates by pointing the tool's `EDITIONS_DIR` at a scratch copy:

| | Weighted similarity (gate ≤ 0.75) | LIGHT + MECHANICAL chapters (gate ≤ 5%) | Result |
|---|---|---|---|
| Live baseline | 0.877 | 5/8 (ch 2, 4, 5, 6, 7) | FAIL |
| Candidate | 0.866 | 6/8 (ch 2, 4, 5, 6, 7, 8) | FAIL |

The failure is pre-existing. Modern chapters 2 and 4–7 are, paragraph by paragraph, Jowett with typographic normalisation and light word substitution (mean token similarity 0.97–0.99). Chapter 8 turns LIGHT in the candidate only because the unchanged Alcibiades paragraphs move into it.

The nine new modern paragraphs score **0.490** on the gate's own metric (length-weighted), at the boundary of the REAL and REAL-HEAVY bands, and keep 86–119% of source length. Chapter 1 falls from 0.831 to 0.743.

**How it got this way.** The live modern-en is byte-identical to its state after commit `67aa9c16` (2026-04-20, "Symposium modern-en regen complete (59 flags -> 0)"). Against today's Jowett text, the version before that commit (`a3b82787`) was a free modernisation of chapters 1, 2 and 4–7. It had token similarity 0.29–0.40 but was condensed to 68–79% of Jowett's length, which is consistent with the truncation flags then reported. `67aa9c16` cleared the flags by replacing those chapters with near-verbatim Jowett (similarity 0.91–0.95). Neither state is a complete, genuinely modern rendering. Chapter 3 had already been re-rendered in full by `c6384c19`, and chapter 8 was not touched.

Per the assignment, clear existing passages were **not** rewritten to lower the score. Whether Symposium modern-en should get a full modernisation pass is a separate decision for Anders (see `RELEASE-PACKET.md`).
