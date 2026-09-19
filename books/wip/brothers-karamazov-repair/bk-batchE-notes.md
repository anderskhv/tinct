# Batch E — Brothers Karamazov modern-en repair — Notes

Chapters 49–60 (Book Eight "Mitya" chapters IV–VIII, and Book Nine "The
Preliminary Investigation" chapters I–VII). Note: despite the task brief's
heads-up about "Grand Inquisitor" content, this batch does not include that
chapter (it's Book Five) — this batch is the arrest/interrogation material:
Mitya's ride to Mokroe, the Mokroe party, his breakdown, and the marathon
interrogation by the prosecutor and investigating magistrate.

## Paragraph-count verification (programmatic)

Verified with a script comparing `bk-batchE-source.json` against
`bk-batchE-modern-en.json`, chapter by chapter, asserting
`len(source.paragraphs) == len(modern.paragraphs)` for every chapter. All 12
chapters matched exactly; total paragraph count is 1199 on both sides:

- Ch 49 "In The Dark" — 35 / 35
- Ch 50 "A Sudden Resolution" — 190 / 190
- Ch 51 "I Am Coming, Too!" — 89 / 89
- Ch 52 "The First And Rightful Lover" — 226 / 226
- Ch 53 "Delirium" — 137 / 137
- Ch 54 "The Beginning Of Perhotin's Official Career" — 46 / 46
- Ch 55 "The Alarm" — 25 / 25
- Ch 56 "The Sufferings Of A Soul, The First Ordeal" — 61 / 61
- Ch 57 "The Second Ordeal" — 63 / 63
- Ch 58 "The Third Ordeal" — 141 / 141
- Ch 59 "The Prosecutor Catches Mitya" — 77 / 77
- Ch 60 "Mitya's Great Secret. Received With Hisses" — 109 / 109

Final assembled JSON validated with `python3 -m json.tool`.

## Approach

Each paragraph was rewritten sentence-by-sentence for natural present-day
English prose, preserving every claim, beat of dialogue, and piece of
imagery in the Garnett original — not paraphrased/compressed, not a
word-swap pass. This is dialogue-heavy courtroom/tavern/party material, so
most of the work was modernizing register and rhythm (Victorian
formal-indirect phrasing, inversions, "quoth"-style tags) while keeping
content, sequence, and each character's voice intact.

## Judgment calls

- **Character-name spelling convention**: kept Garnett's forms throughout —
  "Fyodor Pavlovitch," "Dmitri Fyodorovitch" ("Mitya"), "Grushenka,"
  "Grigory," "Fenya," "Pyotr Ilyitch Perhotin," "Nikolay Parfenovitch,"
  "Ippolit Kirillovitch," "Mihail Makarovitch," "Trifon Borissovitch,"
  "Katerina Ivanovna" ("Katya") — for consistency with the rest of the
  existing modern-en edition and the other repaired batches.
- **Polish characters' broken Russian ("panie," "pani," "panovie," "lajdak,"
  "pani Agrippina" vs. "Agrafena")**: preserved as-is. This is
  Dostoevsky/Garnett doing dialect comedy and characterization (the Poles'
  pretension, Grushenka's fury at being addressed in Polish) — flattening it
  to plain English would erase a real characterization beat and a plot-load-
  bearing moment (Grushenka's disillusionment hinges partly on the Pole's
  stilted, foreign manner).
- **Verse/song fragments** (the "master/gypsy/soldier/merchant" seduction
  song in ch. 53, the Piron epigrams, "Fickle is the heart of woman," the
  nonsense animal-sound song, "Ci-gît Piron...") — left essentially
  untouched, since these are quoted set-pieces/songs within the text, not
  Garnett's narrative prose, and modernizing verse risks altering rhyme/meter
  Dostoevsky is quoting or parodying. Only trivial punctuation-era spelling
  was normalized.
- **Legal/procedural register** (Nikolay Parfenovitch and the prosecutor's
  dialogue in ch. 56–60): rendered into natural modern spoken English while
  keeping the stiff, formal, slightly pompous quality that characterizes
  both men — this is intentional characterization (their bureaucratic
  fussiness vs. Mitya's raw emotional outbursts), not just period flavor to
  be scrubbed away.
- **Mitya's long confessional monologues** (ch. 58–60, "the vital point,"
  the fifteen-hundred-roubles confession, the "thief vs. scoundrel"
  distinction): these are the emotional and thematic core of this batch —
  rendered in full, at full length, preserving every step of his tortured
  self-justification and the escalating repetitions ("Write it down. I
  consent. I give my full consent..."), since compressing them would flatten
  exactly the moral argument the chapter is built around.
- **"Signal" system, envelope inscription, pestle**: kept exact wording of
  physical evidence details (e.g. "For my little chicken"/"For my little
  chick" rendered as "For my little chick" — same diminutive sense, natural
  modern phrasing) since these are plot-critical facts revisited later in
  the novel (the trial).
- Where Garnett has period-flavored but still-natural phrasing that a
  contemporary reader would understand without friction (e.g. "gendarme,"
  "billiard-room," "samovar"), these were kept as-is rather than forcibly
  modernized, since they're accurate period/cultural terms rather than
  archaic diction.

## Files touched

- Read: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchE-source.json`
- Written: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchE-modern-en.json`
- Written: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchE-notes.md` (this file)

No other files were touched. Nothing was committed or pushed.
