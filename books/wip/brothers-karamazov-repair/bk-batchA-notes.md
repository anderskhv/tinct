# Batch A — The Brothers Karamazov, chapters 1–12 (Book I & Book II) — modern-en repair notes

## Scope
Full re-render of `bk-batchA-source.json` (Constance Garnett original-en, chapters 1–12) into a genuine
modern-English reading edition, replacing the mechanical/light version that failed the quality gate.
Every sentence was rewritten for present-day clarity and naturalness; nothing was summarized, dropped,
or invented.

## Verification performed
Ran programmatically (not by eye) before finishing:
- **Paragraph counts**: every chapter's paragraph count in `bk-batchA-modern-en.json` matches
  `bk-batchA-source.json` exactly, chapter by chapter (1–12): 4, 4, 13, 15, 17, 44, 41, 54, 54, 37, 69, 68 —
  420 paragraphs total, both files.
- **JSON validity**: `python3 -m json.tool` passes clean.
- **Coverage floor**: checked every paragraph's word count against its source paragraph; none fall below
  75% of the source word count (checked on paragraphs with >15 source words, to avoid noise from one-line
  dialogue beats). No paragraph needed condensing — Garnett's prose renders comfortably at or above
  source length in modern English.

## Judgment calls

- **Name spelling**: kept Garnett's forms consistently — "Fyodor Pavlovitch" (not "Pavlovich"),
  "Adelaïda Ivanovna," "Miüsov" (with diaeresis), "Païssy," "Zossima," "Smerdyakov," "Grushenka,"
  "Katerina Ivanovna." This matches the source file's own spelling, so no cross-batch inconsistency
  should arise as long as later batches also start from Garnett source text with the same names.
- **Register differentiation preserved deliberately**: Fyodor Pavlovitch's dialogue keeps its crude,
  performative, self-interrupting buffoon cadence (run-on jokes, mock-piety, the Diderot story, the
  "hooks in hell" riff) rather than being smoothed into neutral prose. Ivan's theological/legal argument
  in chapter 10 keeps its formal, argumentative register (a real position paper on Church vs. State),
  not colloquialized. Father Zossima's speech keeps its measured, homiletic rhythm. Dmitri's outbursts
  keep their volatile, physically charged energy. Alyosha stays understated and gentle throughout.
  Rakitin's long monologue in chapter 12 keeps its cynical, gossipy, faster-paced voice, distinct from
  Ivan's or Zossima's registers.
- **French phrases** (_un chevalier parfait_, _Il faudrait les inventer_, _arrière-pensée_, the Frenchman's
  hell quip, _coup d'état_) left untranslated, matching source convention — Dostoevsky/Garnett leaves them
  in French for characterization (Miüsov's affected Parisian polish), and a modern English reader edition
  should preserve that choice rather than translate over it.
- **Scripture and liturgical quotations** ("Lord, now lettest thou thy servant depart in peace," "Blessed
  is the womb that bore thee...," "The fool hath said in his heart there is no God," the Rachel allusion,
  "My Lord and my God!") kept in their traditional King James-adjacent English rather than paraphrased,
  since these are direct citations within the text, not narration — modernizing them would misrepresent
  what the characters are actually quoting.
- **Units/measures**: "versts" converted to a plain-English approximate distance ("four miles," "two
  hundred miles," "five miles," "three hundred miles") for reader clarity, consistent with modernizing
  for present-day clarity while the fact/claim (distance traveled) is preserved exactly.
- **No genuinely ambiguous passages** required a guessed reading — the source, while dense, is
  syntactically clear throughout this batch (mostly narration + dialogue, no textual cruxes or corrupted
  passages).

## Not touched
No other files were modified. Nothing was committed or pushed.
