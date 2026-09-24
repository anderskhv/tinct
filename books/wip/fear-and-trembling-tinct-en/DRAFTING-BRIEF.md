# Drafting brief — Fear and Trembling, Tinct Modern English (translated from Danish)

You are translating one part of Søren Kierkegaard's *Frygt og Bæven*
(1843; narrator: the pseudonym Johannes de Silentio). You translate directly
from the Danish into clear modern English, for an intelligent newcomer.

## Inputs

| What | Where |
|---|---|
| **Source** | `source/original-da-corrected.json`: the corrected, slot-aligned Danish (3rd ed., Reitzel/Grøn, 1895). Each slot has `text`, `notes` (Johannes's footnotes), `sectionHeading` and `corrections`. For uncertain spots, the raw OCR is `/home/user/tinct/books/raw/fear-and-trembling/raw.txt`. |
| **Standard** | `STYLE-AND-TERMINOLOGY.md`. Follow it exactly. |
| **Model of register and density** | The accepted pilot, `../fear-and-trembling-clarity-pilot/final/problema-1-final.md` and `problema-2-final.md`. Your English should read like it: clear, full and faithful, with nothing summarized. |

## Hard rules

1. **Do not open or consult any English translation**, including:
   - `app/public/data/editions/fear-and-trembling-original-en.json`;
   - `app/public/data/editions/fear-and-trembling-modern-en.json`;
   - the `baseline/` folder of the pilot;
   - any published translation (Lowrie, Hong, Hannay, Walsh, Payne, Kirmmse, Hollander);
   - any web source.

   The wording must be your own rendering of the Danish.
2. **One English paragraph per source slot.** No merging, splitting,
   reordering or dropping. Handle page-break fragments and footnotes exactly as
   §B of the standard says, and record every boundary move. Translate
   `sectionHeading` numerals as given.
3. **Translate everything:**
   - every clause, qualification, hedge, example, allusion, rhetorical
     question and exclamation;
   - every footnote;
   - any restored text.

   Nothing is summarized, and nothing is added beyond the short first-use
   definitions the standard allows.
4. **Keep Johannes's voice, irony and deliberate ambiguities.** Resolve only
   ambiguities that are merely grammatical.
5. **Do not edit any file outside your two output files.**

## Output

1. `drafts/<part>.json`, shaped as:
   `{"chapter": N, "part": "<part>", "slots": [{"index": i, "sectionHeading": "I."|null, "text": "…", "notes": [{"id": "n7.15a", "anchorAfterEn": "…exact final English words before the marker…", "text": "…"}]}, …]}`.
   Notes are **never** placed in `text`. Own-slot notes keep `text: ""`.
   It covers exactly your slot range. Use UTF-8 and typographic quotes.
2. `drafts/NOTES-<part>.md`, containing:
   - first-use definitions you introduced, and where;
   - every boundary move;
   - footnote placement, with each footnote's anchor;
   - Greek/Latin/German/French glosses;
   - each place where you resolved or deliberately kept an ambiguity, and why;
   - any doubt about the Danish text;
   - proper-name and allusion decisions;
   - anything a reviewer should look at.

## Independence screen (diagnostic, before hand-off)

After drafting, run:

```
python3 /tmp/claude-0/-home-user-tinct/bd7fff78-1f17-5e05-aa5f-7e31b1f55a29/scratchpad/screen.py drafts/<part>.json 14
```

The screen lists runs of 14 or more words that your English shares with two
copyrighted translations. Use it as a diagnostic only, never to decide
wording. For each listed run:

- **Keep it** if it is forced by a close, accurate rendering of a short Danish
  sentence, or by a quotation. Say so in NOTES.
- **Re-render it from the Danish** if you could just as well have phrased it
  another way, and the new wording is equally accurate and clear.

Never distort accurate language to meet a number. Report the screen's summary
lines in NOTES.

## Return

A short summary:

- slots drafted;
- word count;
- footnotes handled;
- boundary moves;
- the screen summary;
- the three things you are least sure of.
