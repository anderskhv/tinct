# Translator brief — Tinct modern-da (batch a-novels)

You translate ONE chunk of a classic novel from Tinct's modern-English edition into Danish. Work entirely in files; never call any external API.

Paths (S = /tmp/claude-0/-home-user-tinct/5d57fa56-9731-5b60-bb1b-c085e3298177/scratchpad):
- English chunk: S/work/{book}/en/{cid}.txt
- Glossary (names, places, terms, forms of address, conventions — follow it): S/gloss/{book}.md
- Output: S/work/{book}/da/{cid}.txt

## File format
Marker format. "@@ TITLE" (only in the first chunk of a chapter) is followed by the chapter title; each "@@ N" is followed by exactly one paragraph (N = paragraph index within the chapter). Write the output in the SAME format: the same markers in the same order, one Danish paragraph under each marker, the title translated. Never merge, split, drop, reorder or add paragraphs. Paragraphs are single lines; keep it so.
If the chunk is long you may write the output in consecutive part files instead: {cid}.part1.txt, {cid}.part2.txt, … (each holds a consecutive run of blocks; part1 holds the TITLE block if there is one). Use either the single file or parts, not both.

## Style
- Natural, present-day Danish for an adult reader, as if the book had been written in Danish.
- Translate meaning, not words. Prefer verbs to nouns; avoid anglicisms, English word order, calques and English punctuation habits (e.g. no comma before "at"-clauses beyond Danish usage; Danish uses fewer commas — use the new/start-comma-free style consistently: no comma before subordinate clauses unless needed for clarity).
- Keep the book's register: plain where the English is plain, formal where formal. Keep irony, wit, period colour, rhythm.
- »…« for quotations and dialogue; ›…‹ for a quotation inside a quotation. Dialogue punctuation per Retskrivningsordbogen: comma/full stop handling »Ja«, sagde han. / »Kom!« råbte hun. Dashes: spaced en dash ( – ), not the English em dash. Never use "…" or '…' straight quotes as quotation marks.
- Keep the author's paragraphing, verse lines and emphasis. _word_ (underscores) marks emphasis: keep the markers around the Danish equivalent.
- Never summarise, skip or add anything. Every sentence, clause, image and detail must be there.
- Numbers: modern Danish counting (halvtreds, firs). Keep historical units/money (pund, guineas, shilling, fod, yards) — do not convert. An English mile is »en engelsk mil« / »engelske mil« (never bare »mil«, which a Danish reader takes as 7.5–10 km, and never »mile«); after first mention in a paragraph »mil« alone is fine only if »engelsk« is clear from context.
- Names and honorifics exactly as in the glossary. No English words left untranslated except names, titles and deliberate foreign phrases (e.g. French in the source stays French).

## Process
1. Read the whole English chunk and the glossary first. If you need story context, you may read the English of the preceding chunk(s) in S/work/{book}/en/. Do NOT read any other Danish edition.
2. Translate, paragraph by paragraph.
3. Re-read your Danish against the English, paragraph by paragraph: fix omissions, meaning slips, English left in, stiff or translated-sounding sentences.
4. Run: cd S && python3 tools.py check_chunk {book} {cid}
   It must report OK (all paragraphs present, nothing English-looking). The chunk's da/en character ratio should normally be 0.95–1.20; investigate paragraph outliers it lists (very short = likely omission).
5. Reply in at most 3 lines: "{cid} done, N paragraphs, ratio X" plus any real doubts (names, ambiguous meaning).
