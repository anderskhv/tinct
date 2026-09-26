# Independent Review — Faust Part I `original-de` transcriber's-note fix

**Reviewer:** independent pass, not the package author. Formed before reading `RELEASE-PACKET.md`.

## Verdict: ACCEPT

## What I checked

1. **Source verification.** No live network fetch was needed/attempted since a local
   raw source already exists at `books/raw/faust-part-1/raw-de.txt` (PG #21000, German
   original). I located the play's actual final lines and the text that follows them:

   ```
   8329  _Stimme_ von innen, verhallend.
   8330
   8331  Heinrich! Heinrich!
   8332
   8333
   8334
   8335  [Anmerkungen zur Transkription: Dieses elektronische Buch wurde auf
   8336  Grundlage der 1808 erschienenen Erstausgabe erstellt. ...
   ...
   8348  [Transcriber's Note: This ebook has been prepared from the first print
   8349  edition published in 1808. ...
   ...
   8365  *** END OF THE PROJECT GUTENBERG EBOOK FAUST: EINE TRAGÖDIE [ERSTER TEIL] ***
   ```

   This confirms the text after "Heinrich! Heinrich!" is unambiguously PG transcriber
   apparatus (German note followed by its English counterpart), not part of the play.
   The play ends at "STIMME. Heinrich! Heinrich!" — Goethe's final stage direction/line.

2. **Candidate JSON vs. live file — exact diff.** Rather than reconstruct the "before"
   state indirectly, I diffed the candidate directly against the currently-live file:
   - Live: `app/public/data/editions/faust-part-1-original-de.json`
   - Candidate: `books/wip/faust-part-1-original-de-fix/editions/faust-part-1-original-de.json`

   Both files have 28 chapters. A full chapter-title and paragraph-by-paragraph
   comparison across all 28 chapters found **exactly one difference**: chapter 28
   ("Kerker"), paragraph index 69 (the last paragraph, 70 total). Live text:

   ```
   STIMME. Heinrich! Heinrich!
   [Anmerkungen zur Transkription: Dieses elektronische Buch wurde auf
   Grundlage der 1808 erschienenen Erstausgabe erstellt. Der Text folgt
   strikt dem Original. Korrekturen in späteren Druckausgaben wurden in
   eckigen Klammern gesetzt.
   Das Originalbuch ist in Frakturschrift gedruckt. Textauszeichnungen
   wurden folgendermaßen ersezt:
   Sperrung:       gesperrter Text
   Antiquaschrift: #Antiquatext# ]
   [Transcriber's Note: This ebook has been prepared from the first print
   edition published in 1808. The text strictly follows the original.
   Corrections made in later print editions have been denoted in square
   brackets.
   The original book is printed in Fraktur font. Marked-up text has been
   replaced by:
   Spaced-out: spaced out text
   Antiqua:    #text in Antiqua font# ]
   ```

   Candidate text: `STIMME. Heinrich! Heinrich!`

   No other chapter title, paragraph count, or paragraph text differs anywhere in the
   file. This directly confirms the package's claimed scope: exactly one paragraph
   trimmed, nothing else touched.

3. **Structural sanity.**
   - `python3 -m json.tool` parses the candidate cleanly — valid JSON.
   - 28 chapters, matching the live file's chapter count.
   - All 28 chapter titles (`Zueignung`, `Vorspiel auf dem Theater`, ... `Kerker`) are
     genuine scene/act divisions of Faust Part I in German, not apparatus, crosswalk,
     or editor-collation artifacts. No blocked-pattern titles (`Ff`, `Capell`, `conj.`,
     `om.`, bracket debris, etc.) present.
   - Paragraph counts per chapter are unchanged everywhere except chapter 28, where the
     count is unchanged too (70 paragraphs in both live and candidate) — only the
     *content* of the last paragraph was trimmed, no paragraph was split, merged, added,
     or removed.

## Conclusion

The fix does exactly what it claims: it removes PG transcriber's-note boilerplate
(German + English) that had been concatenated onto the play's genuine final line in
chapter 28's last paragraph, and touches nothing else in the 28-chapter file. The
removed text is verifiably PG apparatus (confirmed against the raw source, which shows
the identical note text immediately preceding the "*** END OF THE PROJECT GUTENBERG
EBOOK ***" marker). The resulting paragraph is clean and ends exactly where the play
ends.

**ACCEPT.**
