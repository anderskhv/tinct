# Drafting brief — Fear and Trembling, Tinct Modern English (translated from Danish)

You are translating one part of Søren Kierkegaard's *Frygt og Bæven*
(1843; narrator: the pseudonym Johannes de Silentio). You translate directly
from the Danish into clear modern English, for an intelligent newcomer.

## Inputs

| What | Where |
|---|---|
| **Source** | `source/original-da-final.json`: the scan-verified Danish (3rd ed., Reitzel/Grøn, 1895) in its printed paragraphing. Each paragraph has `text`, `notes` (Johannes's footnotes, each with `anchorAfter`), `sectionHeading` and `dividerBefore`. The per-slot corrections log is `source/original-da-corrected.json`. For uncertain spots, the raw OCR is `/home/user/tinct/books/raw/fear-and-trembling/raw.txt`. |
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
2. **One English paragraph per source paragraph.** No merging, splitting,
   reordering or dropping, and no boundary moves: the paragraphs are the
   printed ones. Handle footnotes, headings, dividers and verse exactly as
   §B of the standard says.
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
   `{"chapter": N, "part": "<part>", "slots": [{"index": i, "sectionHeading": "I."|null, "dividerBefore": "rule"|"asterism"|null, "text": "…", "notes": [{"id": "n7.15a", "anchorAfterEn": "…exact final English words before the marker…", "text": "…"}]}, …]}`.
   Here `index` is the paragraph index in `original-da-final.json`. Notes are **never** placed in `text`.
   It covers exactly your slot range. Use UTF-8 and typographic quotes.
2. `drafts/NOTES-<part>.md`, containing:
   - first-use definitions you introduced, and where;
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

## First-use definitions (whole book, in reading order)

Give the short in-sentence definition **only** at the location listed.
Everywhere else, use the bare term.

| Term | First use | Definition basis |
|---|---|---|
| movement (Bevægelse) | ch1 ¶0 | plain; no gloss needed |
| the System | ch1 ¶2 | capitalized, no gloss |
| spiritual trial (Anfægtelse) | ch4 ¶7 | "an inner assault on a person" (pilot wording) |
| paradox | ch4 ¶9 | defined by the text itself |
| the absurd | ch4 ¶10 | defined by the text itself; do not gloss beyond it |
| incommensurable | ch4 ¶10 | "not measurable by any common standard" |
| the tragic hero | ch4 ¶11 | no gloss |
| the movement of infinity / infinite movement | ch4 ¶11 | no gloss beyond the text |
| the leap; the double movement | ch4 ¶12 | no gloss beyond the text |
| infinite resignation | ch4 ¶13 | brief, from the text: giving up the finite, finding peace in the eternal |
| knight of infinite resignation; philistine | ch4 ¶15 | philistine: "a narrow, comfortable townsman" |
| knight of faith | ch4 ¶16 | no gloss |
| the single individual | ch4 ¶18 | no free-standing definition (pilot decision) |
| the aesthetic | ch4 ¶22 | brief, from context |
| irony | ch4 ¶28 | plain |
| the universal, the ethical, telos, the immediate | ch5 ¶0 | already in the accepted pilot |
| mediation / mediate | ch5 ¶4 | already in the accepted pilot. Corrected 2026-09-24: ch4 ¶2 has *Mediterende* (meditating), not mediation. |
| ethical life | ch5 ¶1 | already in the accepted pilot |
| concealment; disclosure; the interesting | ch7 ¶0; ¶1; ¶2 | brief, from context |
| the demonic | ch7 ¶12 | **No gloss.** It is used bare throughout, and the text develops it (decision 2026-09-24 after R1 reviews of parts F and G). |
