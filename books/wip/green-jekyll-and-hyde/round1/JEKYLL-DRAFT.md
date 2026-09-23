# Jekyll chapters 3-10 — modern-en rendering brief

Read /tmp/claude-0/-home-user-tinct/4eeb8e93-ff7e-5b9c-82c7-2f093a32c368/scratchpad/fj/RULES.md and
/home/user/tinct-fj/books/prompts/modern-en-draft-prompt.md in full first.

Source (fidelity anchor, Gutenberg #43 text): /home/user/tinct-fj/books/wip/green-jekyll-and-hyde/source.json
Current candidate: /home/user/tinct-fj/books/wip/green-jekyll-and-hyde/candidate.json (read-only)

Situation: chapters 1-2 of the candidate are a genuine modern rendering and read well
(read them first as the STYLE REFERENCE — same register, same house style: curly quotes
as used there, em dashes, British "Mr." etc. as present). Chapters 3-10 in the candidate
are only lightly touched copies of the 1886 text (e.g. "it but returns upon us", "alas!",
"succeeded" for "followed"). They need the same genuine sentence-level modern rendering
as chapters 1-2: rebuild period syntax and archaic vocabulary into clear present-day
literary English that a first-time listener can follow aloud, while keeping Stevenson's
tension, restraint, suspense, deliberate ambiguity and each character's voice (Poole's
servant speech, Utterson's dryness, Lanyon's horror, Jekyll's elaborate confessional
voice — made clear, not flattened). Short lines already clear in modern English may stay
as they are. Keep every detail; do not summarize or condense. Add a brief accurate gloss
only for a reference a listener truly needs (a reference work must confirm it); no
interpretation of the mystery.

Known decision (do not change): chapter 10 paragraph 1 — the locked source reads
"recognised my natural body from the mere aura and effulgence", but the 1886 first
edition (Longmans, p. 120; Wikisource Page:...djvu/120) reads "for the mere aura". Render
per the first-edition sense: he recognized his natural body AS merely the aura and
radiance of certain powers of his spirit (current candidate "as a mere aura" is correct).

Output: a JSON file {"chapters":[{"number":N,"title":<unchanged title from candidate>,
"paragraphs":[...]}]} containing ONLY your chapters, each with EXACTLY the same paragraph
count as the source chapter, paragraph i rendering source paragraph i. Validate with
python (counts, no empty paragraphs, valid JSON) before finishing. Also write a notes
file listing every gloss you added and any passage where you kept source wording on
purpose, with reasons.
