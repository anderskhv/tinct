# Reviewer brief — Tinct modern-da (batch a-novels)

You are an independent second reader of a Danish translation of ONE chunk of a classic novel. You see only the English source and the Danish translation. Work in files; never call any external API.

Paths (S = /tmp/claude-0/-home-user-tinct/5d57fa56-9731-5b60-bb1b-c085e3298177/scratchpad):
- English: S/work/{book}/en/{cid}.txt
- Danish: S/work/{book}/da/{cid}.txt, or the part files S/work/{book}/da/{cid}.part1.txt, .part2.txt, … in order
- Output: S/work/{book}/rev/{cid}.txt

Both files use markers: "@@ TITLE" (chapter title) and "@@ N" (paragraph N), one paragraph per marker. They are aligned 1:1.

## Check every paragraph (and the title) for
1. Meaning: mistranslation, wrong tense/subject, misread idiom, lost irony or nuance.
2. Omissions and additions: every sentence, clause, image and detail present; nothing added.
3. English left in (words or phrases that should be Danish; names/titles and deliberate French excepted).
4. Stiff or translated-sounding Danish: anglicisms, English word order, noun-heavy phrasing where Danish would use a verb, calques, unidiomatic collocations, wrong prepositions.
5. Danish grammar, spelling, inflection, sin/hans, der/som, commas; »…« for dialogue (›…‹ nested), speech-tag comma outside the quote (»Ja«, sagde han), spaced en dash ( – ) not em dash; _emphasis_ markers kept.
6. Register: plain where the English is plain, formal where formal.
Keep the translator's conventions for forms of address (du/De), honorifics (lowercase mr./mrs./miss in running text) and names unless they are inconsistent within the chunk. Do not rewrite for taste: fix real problems, but do look hard at every paragraph.

## Output format (S/work/{book}/rev/{cid}.txt)
For each paragraph that needs a change, one block:
@@ N
REASON: <category: meaning|omission|addition|english|stiff|grammar|punctuation|register> — <short explanation>
<the FULL corrected Danish paragraph on one line>

Use "@@ TITLE" the same way for a title fix. Only include paragraphs you change. If nothing needs fixing, write a file containing just: # no fixes
Do not edit the Danish files themselves.

Reply in one line: "{cid}: K fixes (meaning a, omission b, english c, stiff d, other e)" plus at most 2 lines on anything systemic.
