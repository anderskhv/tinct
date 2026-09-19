# Batch D — Modern English Rendering Notes (Chapters 37–48)

## Scope
Re-rendered all 12 chapters of Batch D (Book V ch. VI–VII, all of Book VI "The Russian Monk," all of Book VII "Alyosha," and Book VIII ch. I–III "Mitya") from the Constance Garnett `original-en` text into genuine modern English prose, sentence-by-sentence, replacing the previous mechanical/light pass.

## Paragraph-count verification (programmatic)
Checked with a script comparing `len(chapter['paragraphs'])` between source and output, chapter by chapter:

| Ch. | Title | Source paragraphs | Output paragraphs | Match |
|-----|-------|---|---|---|
| 37 | VI. For a While, a Very Obscure One | 67 | 67 | ✅ |
| 38 | VII. "It's Always Worth Talking to a Clever Man" | 42 | 42 | ✅ |
| 39 | I. Father Zossima and His Visitors | 56 | 56 | ✅ |
| 40 | II. The Duel | 162 | 162 | ✅ |
| 41 | III. Conversations and Exhortations of Father Zossima | 50 | 50 | ✅ |
| 42 | I. The Breath of Corruption | 55 | 55 | ✅ |
| 43 | II. A Critical Moment | 43 | 43 | ✅ |
| 44 | III. An Onion | 142 | 142 | ✅ |
| 45 | IV. Cana of Galilee | 30 | 30 | ✅ |
| 46 | I. Kuzma Samsonov | 50 | 50 | ✅ |
| 47 | II. Lyagavy | 53 | 53 | ✅ |
| 48 | III. Gold-Mines | 89 | 89 | ✅ |
| **Total** | | **839** | **839** | ✅ |

Whole-file JSON validated with `python3 -m json.tool`.

## Word-count fidelity check
Total source words: 59,367. Total output words: 58,391 (ratio 0.984 — essentially 1:1, well above the 75% floor). Only 3 of 839 paragraphs fall under the 75% single-paragraph threshold, and all three are trivial one-line cases where the ratio is noise, not a content gap:
- Ch. 40 §89: `"I... do you know... I murdered someone."` (short, halting dialogue — the broken cadence is the point).
- Ch. 41 §7: the section subheading `(f) On Masters and Servants, and Whether They Can Be Brothers in Spirit` (title compresses naturally).
- Ch. 46 §43: `"Indeed!"` for `"To be sure!"` — single-word acknowledgment, register-matched.

No paragraph was merged, split, reordered, dropped, or invented; paragraph N of the output corresponds to paragraph N of the source throughout.

## Judgment calls
- **Naming convention**: kept "Fyodor Pavlovitch," "Dmitri," "Ivan," "Alyosha," "Grushenka," "Smerdyakov," "Rakitin," "Katerina Ivanovna," "Father Zossima," "Father Païssy," "Father Ferapont," etc., exactly as spelled in the Garnett source, for continuity with the rest of the book's editions and with proper-noun preservation rules.
- **Scripture quotations**: in Ch. 45 ("Cana of Galilee"), the Gospel of John passages Father Païssy reads aloud were left as the (already-modern-register) King James wording rather than re-translated, since they're direct scriptural quotations within the narrative, not Garnett's own prose — modernizing them further would misrepresent them as paraphrase rather than the liturgical text being read. The surrounding narration and Alyosha's drifting interior monologue around the quotations were fully modernized.
- **Section subheadings**: the manuscript's internal subheadings (e.g. "(c) Recollections of Father Zossima's Youth Before He Became a Monk," "(d) The Mysterious Visitor," "(e) The Russian Monk and His Possible Significance," etc., plus "BIOGRAPHICAL NOTES" and "PART III") were kept as their own paragraphs, per the source structure, with only light modernization of phrasing (e.g. "Of Prayer, of Love, and of Contact with other Worlds" → "On Prayer, Love, and Contact with Other Worlds").
- **Dialect/register**: Smerdyakov's oily, evasive, faux-deferential register; Fyodor Pavlovitch's crude, wheedling talk about money and women; Ivan's cold, clipped irritation; Rakitin's smug, self-interested sneering; Grushenka's volatile, confessional rush of feeling; Mitya's breathless, self-dramatizing extravagance (Ch. 46–48); Madame Hohlakov's scatterbrained, self-admiring digressions (Ch. 48) — all preserved as distinct voices in the modern register rather than flattened to one narrative tone.
- **Zossima's homiletic voice** (Ch. 39–41, the "Russian Monk" material): rendered as elevated but plain contemporary devotional English — avoiding both stiff Victorian formality and anachronistic casualness — since this is the book's doctrinal/spiritual core and needed to read as sincere religious rhetoric, not a lecture.
- **Idioms and period terms**: "versts," "roubles," "kopecks," "samovar," "kaftan," "Tchermashnya," "Cadet Corps," etc. kept as-is (historical/geographic content, not modernized/Americanized). Measures of distance/money were not converted.
- **"Onion" parable (Ch. 44)**: rendered in plain modern storytelling prose to match its folk-tale register, distinct from the surrounding scene's more agitated dialogue.
- Nothing was condensed, summarized, or sanitized; crude, violent, and theologically provocative content (Ferapont's exorcism tirade, the corpse-smell scandal, Grushenka's confession of wanting to "ruin" Alyosha, Mitya's threats and self-loathing, the murdered-widow confession in the Mysterious Visitor story) was rendered faithfully in modern register, not softened.

## Files touched
- Read: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchD-source.json` (untouched)
- Written: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchD-modern-en.json`
- Written: `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchD-notes.md` (this file)

No other files were touched. Nothing was committed or pushed.
