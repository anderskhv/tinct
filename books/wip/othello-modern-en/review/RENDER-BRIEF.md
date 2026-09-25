# Othello — Tinct Modern English (modern-en) rendering guide

You are rendering part of Shakespeare's *Othello* into Tinct Modern English. Work only from the
public-domain Shakespeare text given to you (Project Gutenberg #1531) and your own standard
glossing knowledge. **Do not consult, recall or imitate any copyrighted modernization**
(No Fear Shakespeare, Shakespeare Made Easy, etc.). Never fetch anything from the web.

## The target

Plain, natural, present-day English that a curious 16-year-old reads without footnotes:

- **Line-for-line faithful.** Every clause, image, argument, oath, joke and insult is carried over.
  Nothing omitted, nothing added. No summarizing, no editorial comment, no moralizing.
- **Every image and pun made understandable.** Do not leave a hard metaphor or archaic idiom
  sitting untranslated with modern pronouns bolted on. Keep the image AND make its point clear,
  inside the line, as briefly as possible.
  - Bad (too close): "His bed shall seem a school, his board a confession."
  - Good: "His bed will feel like a classroom and his dinner table like a confessional —"
  - Bad: "I am worth no worse a place." → Good: "I deserve a post at least that good."
  - Bad: "must be belee'd and calm'd" → Good: "must be left with the wind stolen out of my sails, dead in the water,"
- **Puns and double meanings:** keep both senses when possible; when one English word can't carry
  both, choose wording that lets the reader see the joke (a short appositive is fine: "lie — lie
  with her, lie about her"). Never quietly drop a pun.
- **Bawdy and insults stay as strong as the original, and become understandable.** Iago's and
  Roderigo's racist and sexual language ("old black ram / Is tupping your white ewe", "the beast
  with two backs", "Barbary horse", "thick-lips", "whore", "strumpet", "cuckold") is kept at
  full force and made clear ("an old black ram is mounting your white ewe"). Do not soften, do
  not coarsen beyond the original, do not add obscenity.
- **Register:** conversational where the character is conversational, formal where the scene is
  formal (the Senate, Othello's great speeches). Othello's grand style should still sound grand in
  plain words. Iago sounds slick and colloquial. Keep exclamations ("O" → "Oh", keep "!").
- **Keep famous lines recognizable when the original is already clear.** Examples to keep nearly
  verbatim (just modern pronouns/verb forms): "I am not what I am." / "Put money in your purse."
  / "Oh, beware, my lord, of jealousy; it is the green-eyed monster, which mocks the meat it feeds
  on." / "Who steals my purse steals trash" / "Reputation, reputation, reputation!" / "Put out the
  light, and then put out the light." / "one that loved not wisely but too well" / "She loved me
  for the dangers I had passed, and I loved her that she did pity them." / "Keep up your bright
  swords, for the dew will rust them." / "Goats and monkeys!" / "Trifles light as air" / "But yet
  the pity of it, Iago! Oh, Iago, the pity of it, Iago!" / "I kissed you before I killed you".
  You may add a short clarifying phrase next to a famous line if its point is otherwise obscure,
  but do not rewrite a clear line just to make it different.
- **Similarity is a symptom, not the goal.** The calibrated register (Tinct's Hamlet/Macbeth)
  lands around 0.40–0.48 word-sequence similarity to the original. The current Othello edition
  (0.69) failed because it kept hard lines intact. Rewrite the hard lines; leave clear ones clear.

## Fixed conventions

- Pronouns/verbs: thou/thee/thy/thine/ye → you/your/yours; -eth/-est → modern; 'tis → it's;
  ne'er → never; ere → before; anon → soon/right away; prithee → please; marry (oath) → "why,"/
  "indeed"; 'Sblood / Zounds → "God's blood" / "By God's wounds" or "Damn it" (keep it an oath).
- Titles and terms, used consistently: ancient → **ensign**; lieutenant stays; the general;
  "Moor" stays "Moor" (a period term the play relies on); "honest Iago" stays "honest";
  napkin (= handkerchief) → **handkerchief**; signior → "sir", or "Signior" only directly before a
  name; the Sagittary → "the Sagittary" (first mention may add "inn"); Ottoman/Turk stay;
  wench → girl; housewife (hussy) → "hussy"; cuckold stays (gloss "horned" jokes as cuckold jokes).
- Keep all proper names, places and allusions (Rhodes, Aleppo, Mauritania, Pontic Sea, Janus,
  Anthropophagi, Egyptian, Saint Peter, Promethean, chrysolite, Indian/Judean pearl…). If an
  allusion is opaque, fold a few clarifying words into the line.
- Punctuation: straight apostrophe `'` for contractions (don't, it's); curly double quotes “ ” for
  quoted speech; em dash with spaces ` — ` for breaks and interruptions. **Never use ellipses
  (... or …)**; the QA gate treats them as truncation.
- Italic markers `_..._` (songs, sung lines) must be preserved: same number of underscores, at
  the same line positions (e.g., if line 0 starts with `_` and the last line ends with `_`, yours
  do too). Stage directions embedded in a line such as `[_To Emilia._]` are copied **verbatim**
  in the same line position.
- Songs: render the words plainly but keep them singable and in the same number of lines; keep
  refrains ("willow, willow, willow"; "clink, clink") as they are.

## Structure — this is strict

Your input is a JSON list of speeches. Each has `id`, `speaker`, and `lines` = the original
split into units. For verse, one unit = one verse line. `prose_units` lists indices of units
that are prose (a whole prose run in one unit).

Output one JSON file with exactly the same speeches, same ids, same order:

```json
{"batch": "b01", "items": [{"id": "1.1", "lines": ["...", "..."]}, ...]}
```

- `lines` must have **exactly as many entries** as the input `lines`. Entry k is the modern
  counterpart of original unit k, so the modern text follows the original line order. A sentence
  may run across line boundaries just as the original does (lines can be fragments). Minor
  movement of a word across an adjacent line boundary is fine if English syntax demands it, but
  the content of line k must not migrate further than its neighbour. Never leave an entry empty,
  never merge two entries into one.
- Do **not** include the speaker prefix in `lines` (it is added automatically). `speaker` =
  `[bracketed]` means a speech continuation that the source parser wrapped in square brackets
  (speaker prefix lost after a mid-speech stage direction). Render its content normally as that
  continuing speaker's words; the brackets are re-added automatically — do not add them yourself.
  If its first unit begins with a bare speaker name (e.g. "SECOND SENATOR", "OTHELLO",
  "DUKE and SENATORS."), keep that name at the start, unchanged.
- No leading/trailing spaces, no double spaces, no newlines inside an entry.
- Stage directions (`stage_directions` in your input) are context only: do not output them.

## Process

1. Read the whole batch first (and the stage directions) so you understand the scene.
2. Render every speech. Take care over dense verse — this is where the old edition failed.
3. Write your result to the output path you were given.
4. Run `python3 <scratch>/check.py <batch>` and fix **every ERROR**. Then look at each flag:
   SHORT = you may have dropped something; LONG = you may have embellished; "close to
   original" = OK only if the original line is already plain modern English.
5. Re-read your whole output once against the original, fixing omissions, invented content,
   wrong glosses, and flattened puns or bawdy. Report the batch similarity and any passages you
   are unsure about (id + why) in your final message.
