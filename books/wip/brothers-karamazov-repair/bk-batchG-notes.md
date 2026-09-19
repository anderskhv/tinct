# Batch G — Modern English rendering notes (chapters 73–84)

Source: Constance Garnett translation, `bk-batchG-source.json` (Book XI: Ivan's brother
Dmitri / Smerdyakov interviews / Ivan's nightmare, and Book XII: opening of the trial).

## Paragraph-count QA (programmatic)

Verified with a script comparing `len(chapter['paragraphs'])` between source and output,
paragraph-by-paragraph, per chapter. All 12 chapters match exactly:

| Ch  | Title                                          | Paragraphs |
|-----|-------------------------------------------------|-----------:|
| 73  | IV. A Hymn And A Secret                         | 97 |
| 74  | V. Not You, Not You!                            | 85 |
| 75  | VI. The First Interview With Smerdyakov         | 84 |
| 76  | VII. The Second Visit To Smerdyakov             | 67 |
| 77  | VIII. The Third And Last Interview With Smerdyakov | 152 |
| 78  | IX. The Devil. Ivan's Nightmare                 | 111 |
| 79  | X. "It Was He Who Said That"                    | 38 |
| 80  | I. The Fatal Day                                | 22 |
| 81  | II. Dangerous Witnesses                         | 63 |
| 82  | III. The Medical Experts And A Pound Of Nuts    | 23 |
| 83  | IV. Fortune Smiles On Mitya                     | 61 |
| 84  | V. A Sudden Catastrophe                         | 52 |

Total: 855 paragraphs, both files. `json.tool` confirms the output is valid JSON.

Word-count ratio (output words / source words) per chapter ranges 0.96–0.99, overall
0.978. No paragraph of 8+ source words fell under 60% of source length — well clear of
the 75% floor in the standard, since this text is dialogue-heavy and rarely repetitive.

## Judgment calls

- **Name spelling**: kept "Fyodor Pavlovitch" / "Dmitri Fyodorovitch" / "Ivan
  Fyodorovitch" / "Alexey Fyodorovitch" — Garnett's own transliteration convention —
  for consistency with the rest of the already-published modern-en edition, rather than
  switching to "-ovich." Diminutives (Mitya, Alyosha, Ivan, Katya, Katerina Ivanovna,
  Grusha/Grushenka, Smerdyakov, Rakitin, Fetyukovitch, Ippolit Kirillovitch, Trifon
  Borissovitch, Marfa/Marya/Grigory) preserved as in source.
- **Foreign-language interjections** (French, Latin, German) in Ivan's devil dialogue
  (ch. 78) and elsewhere (ch. 76 letter, ch. 82 doctor's German) were left untranslated,
  as in the original — they're meant to sit oddly in the Russian too, and translating
  them would lose Dostoevsky's characterization device (dandyish devil, German-accented
  doctor). E.g. "_c'est charmant_," "_Gott der Vater_," "_De ideabus non est disputandum_."
- **Mitya's drunken letter to Katya** (ch. 76, "FATAL KATYA...") and the swollen-foot
  doggerel verse (ch. 73) were rendered as continuous modern prose/verse but kept
  their fragmented, breathless, all-caps-opening character intact — these are meant to
  read as unhinged, not smoothed into tidy sentences.
- **Legal/courtroom register** (chs. 80–84): modernized the narrator's essayistic
  asides ("I don't intend to describe...") into plainer contemporary narration while
  preserving the 19th-century trial-reportage voice — first-person "I" narrator
  commentary is a structural feature of the novel, not incidental, so it's kept, just
  in contemporary phrasing.
- **Smerdyakov's confession** (ch. 77) is the longest single paragraph in the batch
  (~900 words in source) — rendered as one continuous paragraph per the "no
  splitting" rule, broken only with natural comma/dash pacing matching the source's
  own run-on, confessional rhythm.
- **The devil's monologues** (ch. 78) needed the most sentence-level reworking since
  Garnett's syntax there is especially dense and inverted; content, argument order,
  and every aside (Job, the Grand Inquisitor references, the nose-pulling Jesuit
  anecdote, the Norman girl anecdote) preserved in full — nothing softened or cut,
  per the "do not sanitize" instruction, including the crude confessional anecdotes.
- Untranslated proper nouns/place names kept as-is: Tchermashnya, Mokroe,
  Skotoprigonyevsk, Petersburg, Metropolis (tavern name).
- Footnote marker `[8]` in source ch. 81 (Grigory/nose-pulling reference) — left as
  plain text since there's no accompanying footnote text in this batch file to
  translate; flagging in case the full-book footnote apparatus needs reconciling
  elsewhere.

## Character voice preserved

- Dmitri: volatile, interrupting himself, self-lacerating ("I plead guilty to
  drunkenness and dissipation... but I am not guilty of the death of that old man").
- Ivan: cold, ironic, then disintegrating into raving as the brain fever takes hold —
  the register shift from controlled interrogation of Smerdyakov to fractured courtroom
  outburst is intentional and preserved.
- Alyosha: gentle, direct, "I have never for one instant believed you were the
  murderer!"
- Smerdyakov: flat, insinuating, coldly logical even while confessing murder.
- The devil: affected, chatty, self-pitying, French-inflected.

## Files touched

- Wrote: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchG-modern-en.json`
- Wrote: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchG-notes.md`
- No other files modified.
