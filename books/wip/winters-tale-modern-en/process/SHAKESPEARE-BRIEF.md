# Shakespeare — Tinct Modern English: shared rendering brief

Applies to every play in this batch (Henry IV Part 2, Henry V, Coriolanus, Richard III, The Winter's Tale).
Each play also has a PLAY-NOTE.md (names, terms, cautions). Where PLAY-NOTE and this brief differ on a
point specific to that play, PLAY-NOTE wins.

**Sources and independence.** Work only from the public-domain play text you are given and your own standard
glossing knowledge. Do NOT consult, recall or imitate any copyrighted modernization (No Fear Shakespeare,
Shakespeare Made Easy, etc.). Never fetch anything from the web.

## What the served edition is

One paragraph per speech (or per stage direction), speaker prefix included ("MARCELLUS. Horatio says ..."),
chapter = scene. The modern edition must keep this structure exactly 1:1: same number of paragraphs per scene,
paragraph N renders source paragraph N. Saved places, highlights and notes depend on it.

There is **no line-for-line alignment requirement** (the modern text is a block of prose per speech). Verse
lines may be run together. Order of ideas inside a speech stays the same.

## The target

Everyday spoken modern English that a curious 16-year-old follows on one read, without footnotes. The register
of Tinct's Hamlet and Julius Caesar is the calibration: close in sense, simpler in words, with sentences a
person could say aloud.

1. **Short, speakable sentences.** Average roughly 13 words per sentence. Split Shakespeare's long periodic
   sentences into two or three sentences wherever the meaning allows, even if the sentence shape changes. Keep
   the logical connectives (because, so, but, if) so the argument's steps stay visible.
2. **Say who and what.** When a speech refers to someone by epithet or pronoun that a modern reader would lose
   ("him that comes in triumph ...", "the Dauphin's father's ...", "he"), name the person in the line when the
   context makes it certain. When a figure of speech would be missed, unpack it in a few words next to the
   image. Example of the move (from Julius Caesar): "over Pompey's blood" becomes "over Pompey's sons". Keep the
   main image when it is clear (a plague stays a plague; do not paraphrase an image into abstraction).
3. **Do not invent.** Glosses that unpack the original's meaning are the job. Added motives, facts, emotions,
   stage business or editorial comment are not. Do not add specifics the text does not state (no "kings" for
   "tributaries").
4. **Nothing omitted.** Every clause, image, argument, oath, joke and insult is carried over. No summarizing.
5. **Puns and double meanings:** keep both senses where possible; if one English word cannot carry both, choose
   wording that lets the reader see the joke (a short appositive is fine). Never silently drop a pun.
6. **Bawdy, insults and violence stay as strong as the original, and become understandable.** Do not soften; do
   not coarsen beyond the original; do not add obscenity.
7. **Replace stock archaisms** with their natural modern forms ("many a time and oft" becomes "many times").
   Keep famous lines recognizable when the original is already clear ("To be, or not to be", "a horse! a horse!
   my kingdom for a horse"): modern pronouns and verb forms only, plus at most a few clarifying words. Do not
   rewrite a clear line just to make it different.
8. **Register follows the speaker and scene.** Kings and set-piece speeches stay dignified in plain words;
   clowns, soldiers and servants sound colloquial; prose stays prose-like; verse speeches may keep a heightened
   rhythm but never at the cost of clarity. Keep exclamations ("O" becomes "Oh"; keep "!").
9. **Similarity is a symptom, not the goal.** The gate wants the whole edition clearly different from the
   original (about 0.40-0.55 word-sequence similarity is the calibrated range). Rewrite the hard lines; leave
   clear ones clear. Never reword a plain line only to move the number.

## Fixed conventions

- thou/thee/thy/thine/ye -> you/your/yours; -eth/-est -> modern; 'tis -> it's; ne'er -> never; ere -> before;
  anon -> soon; prithee -> please; marry (oath) -> "why" / "indeed"; 'sblood, zounds -> an oath of the same
  strength ("By God's blood", "Damn it").
- Proper names, places, titles and allusions are kept exactly (never anglicize or drop). If an allusion is
  opaque, fold a few clarifying words into the line. Keep each character's name form consistent through the play
  (see PLAY-NOTE).
- **Speaker prefix:** every speech paragraph starts with its speaker prefix copied exactly from the source
  (e.g. "KING HENRY. "). The validator checks this.
- **Bracketed stage directions** such as `[_Aside._]`, `[_Exit._]`, `[_To Emilia._]` and whole stage-direction
  paragraphs (`[_Exeunt._]`) are copied **verbatim**, including the underscores. Standalone stage directions
  without brackets in the source (for example "Enter King Henry and Exeter.") are also copied verbatim.
- **Italic markers** `_..._` (songs, emphasis): keep the same number of underscores at corresponding places.
- **Songs and rhymed set pieces:** render the words plainly; keep refrains and keep the same number of sentences
  where the original is a song. No rhyme-forcing.
- **Foreign-language passages** (French in Henry V, Latin tags, dialect spellings): keep the original words and
  add the plain English meaning in brackets-free apposition only where PLAY-NOTE says so; dialect speakers
  (Welsh, Irish, Scottish, French) are rendered in plain English that keeps a light flavor of their idiom, not
  phonetic spelling.
- **Typography** follows the live modern edition: straight apostrophe `'` for contractions and possessives,
  straight double quotes `"` for quoted speech, spaced em dash ` — ` for breaks. **Ellipses:** keep an ellipsis only where the SOURCE paragraph has one; never introduce one the source lacks (the QA gate treats a new, content-eliding ellipsis as truncation). No newlines inside a paragraph.

## Output format

For each slice file `src/<id>.json` write `out/<id>.json`:

```json
{"book": "<same as input>", "chapter": <same>, "start": <same>, "paragraphs": ["...", "..."]}
```

`paragraphs` has exactly as many strings as the input, in order. Then run the validator and fix every ERROR:
`python3 .../night/check_bundle.py <book> <bundle>` (it prints ERROR and WARN lines; WARN needs your judgement).
