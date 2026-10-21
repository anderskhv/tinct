# Style note: *Strange Case of Dr Jekyll and Mr Hyde* (Stevenson), Tinct Modern English

- **Book:** `jekyll-and-hyde`
- **Edition:** `modern-en`
- **Scope:** TARGETED repair. Re-render only chapters **1, 2, 5, 7, 8, 9** (slices `ch001_p000-027`, `ch002_p000-049`, `ch005_p000-037`, `ch007_p000-013`, `ch008_p000-079`, `ch008_p080-098`, `ch009_p000-033`). Chapters 3, 4, 6, 10 are already modernized in the served modern-en and are NOT touched. They are the style reference.

**Fidelity anchor:** `served-original-en.json`, Stevenson's English original (1886). The task is a modernization of that English, not a new translation and not a retelling. No other text was consulted.

## What this edition is

A sentence-by-sentence rendering of the served English into plain contemporary English. It keeps every event, clue, qualification, name and figure, and it keeps Stevenson's dread, reticence and Victorian London. It does not explain the mystery and does not make the book breezier than it is.

**First step for every renderer: read chapters 3, 4, 6 and 10 of `served-live-modern-en.json` (paragraph by paragraph against the original) and match their voice, terms and typography.** The rules below are extracted from them. Where this note and those chapters disagree on a small point, follow the chapters. The six chapters to repair are currently only 0.81-0.90 similar to the source (chapter 1: 0.84, 2: 0.90, 5: 0.81, 7: 0.84, 8: 0.82, 9: 0.81); the finished chapters sit at 0.69-0.76.

## Depth requirement

**Target roughly 0.60-0.72 word-sequence similarity to the source for each of these chapters** (hard ceiling 0.75, the classifier gate). Reach it by rendering every paragraph, not by rewording a few. Every narrative and descriptive paragraph must change at several points in nearly every sentence: archaic or Latinate words, stock formulae, inverted or periodic word order, semicolon chains (split, or joined with a dash as the finished chapters do), "which"/"whereof" clause piles. Dialogue paragraphs change too: contractions, "ay", "I fancy", "I dare say", "sir" formulae. A paragraph left identical or with only spelling swaps is a defect unless it is under about 8 words, is a bare signature or date line, or is already plain modern English. Never reword clear text just to lower the number, and never go below about 0.60: that means a paraphrase has drifted from Stevenson. Output length is normally 90-105% of the source's word count per paragraph.

## Voice and sentences

- Stevenson is a lawyer's-eye narrator: dry, measured, reticent, with sudden vivid images. Keep that. Register: clear, slightly formal modern narrative prose with period flavor ("fortnight", "the cab", "the post", "a morning glass", "quite", "rather").
- Break or loosen long sentences, and keep the sentence's logical order and connectives (but, yet, for, and yet, though). The finished chapters often turn a semicolon or a clause hinge into an unspaced em dash; use that device, but not in every sentence.
- Prefer concrete verbs ("quailed" -> "flinched", "contrived that he remained" -> "arranged things so that he stayed", "ken" -> "knowledge"). Replace inversions and archaisms with natural word order.
- **Contractions:** used freely in dialogue (as in ch3 and ch6: "I'm telling you", "I can't find words", "it isn't"), in the narrator's voice only where the finished chapters already do (rarely; narration stays mostly uncontracted). Formal speakers (Lanyon's letter register, Jekyll in solemn passages, the lawyers in grave moments) may stay uncontracted: match the speaker's register in the original.
- First-person chapters 9 (Lanyon) and the letters inside chapters keep their person and tone: Lanyon is stiff and professional, Jekyll's note in ch9 is urgent.

## Force

Hedges, doubts and judgments stay exactly as strong or mild ("I fancy", "it seemed to me", "something wrong", "downright", "not quite"). Do not sharpen the horror or soften Hyde's evil, do not turn suggestion into statement, do not make Utterson say more than he says. Hyde's "deformity" is felt but not named: keep it unnamed.

## No additions

No commentary, bracketed notes, headings, modern framing or facts. A period reference may be clarified inside the sentence in a few words where the text supports it (the finished chapters do "penny numbers" -> "penny novels", "gin palace" -> "gin shop"). Never explain the identity of Hyde or foreshadow.

## Structure 1:1

10 chapters; the chapters to render have 28, 50, 38, 14, 99 and 34 paragraphs (ch1, 2, 5, 7, 8, 9). Chapter numbers and `title` fields exactly as served ("Story of the Door", "Search for Mr. Hyde", "Incident of the Letter", "Incident at the Window", "The Last Night", "Dr. Lanyon's Narrative"). Output paragraph N renders source paragraph N and starts with equivalent content. Never merge, split, reorder, drop or invent a paragraph, including the one-line paragraphs (ch9 p1 `“10_th December_, 18—.`, p4 `“Your friend,`, p5 `“H.J.`, and the signature `HASTIE LANYON.`). There are no headings inside paragraphs. Quotation marks that open a letter or speech paragraph and are not closed in that paragraph (a speech continuing over several paragraphs) stay open exactly as in the source.

## Terms and forms: one rendering, kept stable (as in chapters 3, 4, 6, 10)

| Source | Rendering |
|---|---|
| cabinet (Jekyll's room) | "study" (the finished chapters, and live ch8 mostly, use "study"; use it everywhere in the six chapters) |
| laboratory, dissecting-room, theatre (the operating theatre in Jekyll's house), surgery | Keep as printed. Never "operating room" |
| gin palace; penny numbers | "gin shop"; "penny novels" |
| fellow-men / fellowmen | "fellow men" |
| gaiety (of disposition) | "high-spiritedness" or "cheerfulness" by context |
| ay | "yes" (or "indeed" in mild emphasis). Keep "O" / "Oh" as an exclamation |
| cronies | "friends" |
| maid servant | "maidservant" |
| to-night, to-day, to-morrow | "tonight", "today", "tomorrow" |
| any one | "anyone" |
| whilst, amongst | "while", "among" |
| Mr., Dr., Sir | Keep "Mr.", "Dr.", "Sir" exactly. "Doctor" in direct address stays "Doctor". Never "Mister" |
| the lawyer / the doctor / the butler | Keep these narrator labels |
| London, the cab, the post, fortnight, the Square, Cavendish Square, Soho, the Strand | Keep. "Fortnight" is kept (finished chapters) |
| Bedlam, Hampstead and all place names | As printed |
| the Carew murder, Sir Danvers (Carew) | As printed |
| Hyde / Mr. Hyde / Edward Hyde / Jekyll / Henry Jekyll / Harry Jekyll / Utterson / Enfield / Poole / Lanyon / Hastie Lanyon | As printed. "Harry" for Jekyll stays "Harry" |

Period forms of address stay: "sir", "my dear sir", "my good Utterson", "my dear Lanyon", "Dear Lanyon,—". Servants say "sir" and "Mr. Utterson". Do not turn them into first-name modernisms.

## Spelling: British, matching the finished chapters

The finished chapters keep British spelling: *labour, honour, colour, neighbour, recognise, grey, realise*. Keep British spelling in the six chapters too, with the two changes the finished chapters apply: "to-day" family and "any one" as above. Do not Americanize.

## Quotations and letters

All speech stays in speech marks and is modernized as speech (dialogue is not "quoted matter" here). The letters and documents inside chapters (ch5 Jekyll's note and Hyde's letter, ch9 Jekyll's note and the enclosed instruction) are modernized like the rest, but keep their salutation and closing forms ("Dear Lanyon,—", "Your friend,", "H.J.", "P.S.—"), their dates, times and numbers, and every instruction exactly (addresses, "the fourth drawer from the top", doses). Inscriptions and signs are kept.

## Typography (checked against the live modern-en)

- **Quotation marks:** curly double “ ” for speech; curly single ‘ ’ for a quotation inside speech. No straight quotes.
- **Apostrophes:** curly ’.
- **Dashes:** unspaced em dash — , as in the finished chapters ("nothing new—it had happened"). Never spaced, never `--`. A source "Dear Lanyon,—" keeps comma + em dash.
- **Hyphens:** compounds keep a hyphen ("tut-tut", "nine-tenths").
- **Italics** in the source are written with underscores (`10_th December_`, `_à propos_`, `_dines_`). Keep the underscore markers around the same word(s). Renderers may change `_à propos_` to `_by the way_` only if the sentence is rendered fully; keep `_dines_` as `_dines_`.
- **Ellipses:** the source `...` is `…` in the live edition (ch1 p23 `“My dear sir…”`; ch8 p40, ch9 p19 use `…`). Keep `…` only where the source has one.
- **No newlines** inside a paragraph. Digits and dates unchanged.

## Things that must not happen in these chapters

1. Paragraphs left as they are served (the current 0.81-0.90 state), or copied with only "labour/…" spelling-level or single-word swaps.
2. Dropping, merging or splitting a paragraph, or shifting paragraph N's content into N+1 (ch1 p7 is long: 844 words; ch8 has 99 short paragraphs; ch9 has short signature lines).
3. Losing Victorian atmosphere: no slang like "guy", "freaked", "okay", "cool"; no American vocabulary ("sidewalk", "elevator", "flashlight").
4. Changing the facts: dates, hours, sums, addresses, drawer and drug instructions, the stick and the cheque, the lamp, the knock sequences, who says what.
5. Explaining or hinting at the Jekyll-Hyde identity beyond what the text says at that point.
6. Using "cabinet" in any of these six chapters, or varying the fixed terms above.
7. Using American spellings, spaced dashes, straight quotes, or contractions in grave or formal speech where the original is stiff.
8. Starting to use new vocabulary that the finished chapters avoid, for example replacing "the lawyer" with "the attorney".
