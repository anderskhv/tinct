# Batch F (chapters 61–72) — modern-en rendering notes

## Paragraph-count verification (programmatic)

Ran a script comparing `bk-batchF-source.json` against
`bk-batchF-modern-en.json` chapter by chapter:

| Chapter | Title | Source paragraphs | Modern-en paragraphs |
|---|---|---|---|
| 61 | VIII. The Evidence Of The Witnesses. The Babe | 67 | 67 |
| 62 | IX. They Carry Mitya Away | 38 | 38 |
| 63 | I. Kolya Krassotkin | 12 | 12 |
| 64 | II. Children | 59 | 59 |
| 65 | III. The Schoolboy | 133 | 133 |
| 66 | IV. The Lost Dog | 36 | 36 |
| 67 | V. By Ilusha's Bedside | 123 | 123 |
| 68 | VI. Precocity | 72 | 72 |
| 69 | VII. Ilusha | 47 | 47 |
| 70 | I. At Grushenka's | 66 | 66 |
| 71 | II. The Injured Foot | 43 | 43 |
| 72 | III. A Little Demon | 97 | 97 |
| **Total** | | **793** | **793** |

All 793 paragraphs match 1:1, in order, no merges/splits/drops/inventions.
Also checked: no output paragraph fell below 60% of its source paragraph's
word count (none did — the closest was well above threshold). Overall word
count: source 37,686 words → modern-en 36,924 words, ratio 0.98 — this is a
full sentence-by-sentence rendering, not a condensation.

JSON validated with `python3 -m json.tool`.

## Approach

Each paragraph was rewritten sentence-by-sentence into natural, contemporary
English prose, preserving every claim, example, and beat of dialogue from the
Garnett translation, while replacing Victorian diction and syntax
(inversions, "would you believe it," archaic connectives, etc.) with how a
present-day writer would phrase the same content. This is a genuine
rendering, not a lemma-substitution pass over the Garnett text.

## Judgment calls

- **Character-name spelling**: kept Garnett's own spellings throughout
  (Dmitri Fyodorovitch, Mussyalovitch, Ilusha, Krassotkin, Hohlakov, etc.)
  for consistency with the rest of the existing modern-en edition, rather
  than switching to a different transliteration convention mid-book.
- **Dialogue voicing preserved**: Fyodor Pavlovitch does not appear in this
  batch. Voicing distinctions maintained: Mitya's dialogue in ch. 61–62 is
  passionate/broken; Kolya Krassotkin is postured, bookish, and
  self-consciously grown-up, with his affectations (Latin tags, political
  posturing, "apothecary" for doctor) kept intact; Alyosha stays gentle and
  measured; Grushenka's speech stays emotionally headlong and run-on, as in
  the source; Lise's dialogue keeps its manic, provocative edge; Madame
  Hohlakov's rambling, self-interrupting monologue style (ch. 71) is
  preserved as a single flowing paragraph, since breaking it up would
  falsify her characterization.
- **French/Latin phrases** (`_sine qua non_`, `_cette charmante personne_`,
  `_vous comprenez, cette affaire et la mort terrible de votre papa_`, `Les
  femmes tricottent`, `Ici, Perezvon`) were kept in the original language,
  as in the source, since Kolya and Madame Hohlakov's use of them is
  characterizing (affectation/social class), not merely period diction.
- **"Sine qua non," "apothecary," "Coventry" (send to Coventry)**: kept as
  idioms recognizable to a modern reader; these are the characters'
  own vocabulary choices (Kolya being pedantic/showing off), not narrator
  filler, so I preserved them rather than replacing with paraphrase.
- **The verse fragments** ("Astounding news has reached the class..." and
  "A captivating little foot." / "Long will you remember / The house at the
  Chain bridge.") were left as quoted verse, unmodernized, since they are
  quoted "found text" (schoolboy epigram, Rakitin's poem, a revolutionary-era
  rhyme) rather than narrative prose — modernizing doggerel verse would
  falsify it as a documentary quotation.
- **Bible quotation** ("If I forget thee, Jerusalem...") kept as the
  traditional English rendering (Psalm 137) rather than modern-paraphrased,
  since it's presented as scripture being quoted/explained in-story (Alyosha
  glosses it for Kolya immediately after).
- **"PART IV"** (end of ch. 62) kept as-is — it's a structural marker in the
  source Dostoevsky text (start of a new Part), not prose to translate.
- **Footnote marker** `[7]` after "Perezvon" in ch. 69 source (a
  translator's footnote reference in Garnett) was dropped from the modern-en
  paragraph, since Tinct editions don't carry Garnett's footnote apparatus
  elsewhere in the book either; the content of the joke ("He hears the bell,
  but where it is he cannot tell") is preserved in full immediately after.
- **Register**: Kept the crude/violent/theologically provocative content
  faithfully rendered without softening — notably Lise's chapter (72), which
  stays intact: the blood libel passage, the pineapple-compote sadism, the
  fire-setting and self-harm material, and Grushenka/Mitya's jealousy fights
  in ch. 70, are all rendered in full, matching tone.
- **Long single-paragraph monologues** (Kolya's Zhutchka backstory in ch. 66,
  Madame Hohlakov's ch. 71 ramble) were kept as single paragraphs matching
  the source's paragraph boundaries exactly, even though a modern editor
  might break them up — paragraph-count parity is the harder constraint.

## Status

All 12 chapters (61–72) of Batch F are complete and paragraph-aligned.
No other files were touched. Not committed.
