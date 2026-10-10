# Acceptance record: To the Lighthouse, modern-da (new Danish edition)

**Scope note.** Danish is not part of the current strategy (`STRATEGY.md`, language scope). Anders explicitly asked for a Danish edition of this one book in the session of 2026-10-10; nothing else was commissioned. This package is a content artifact only: no registry, app, audio, onboarding, character-card or SEO change, and no deployment.

## What this is
A complete Danish translation of the served `modern-en` edition of *To the Lighthouse* (Woolf, 1927), 42 chapters, 495 paragraphs, about 73015 Danish words, structure 1:1 with `source-modern-en.json` (same chapter numbers, same paragraph counts, same three-part section map). Titles and section names are in Danish (`Del I — Vinduet`, `Del II — Tiden går`, `Del III — Fyret`; chapter titles `Vinduet · n`, `Tiden går · n`, `Fyret · n`).

- `candidate.json` sha256 `adea2203ed23857a8e12c9566f0e2a340cb44f4e52a231c880ac49ec2283ed06`
- Source basis: served `to-the-lighthouse-modern-en.json`, sha256 `3b20ae3172ec905012082fe0948d81f5e0bee4832ef1c03860708b8ebfa84e22` (identical to the accepted candidate in `books/wip/to-the-lighthouse-followup/editions/`).
- Serialization: `json.dumps(indent=2, ensure_ascii=False)`, no trailing newline, the same as the other `*-modern-da.json` files; drop-in as `app/public/data/editions/to-the-lighthouse-modern-da.json` (a new file, nothing replaced).

## Process (all done by agents in this session, no external API)
1. Translation: 16 bundles (3 to about 10,400 English words), each translated into Danish by a separate helper under `process/TRANSLATE-INSTRUCTIONS.md` (literary register, long Woolf sentences kept long, `»…«` and `›…‹` quotes, fru/hr./frøken, Fyret, spaced dashes). First-pass outputs are in `translation-bundles/`.
2. Mechanical checks (`process/check.py`): chapter and paragraph counts, no English quotes, markers (`_`, `[`, line breaks) match the source, no empty paragraph.
3. Independent fidelity review of every paragraph pair by a separate helper per bundle (`reviews/fidelity/`): 125 paragraphs failed (omissions, reversals, mistranslations, non-words, agreement and word-order errors, glossary terms) and were replaced by the reviewer's corrected paragraph (`reviews/reviewer-fixes-applied.json`).
4. Fresh verification of all 125 corrected paragraphs by six new verifiers (`reviews/verify/`): 119 passed; 6 failed again (1:13, 6:2, 6:25, 17:37, 22:0, 34:18) and were replaced by the verifier's own wording. Those 6 final replacements were NOT re-verified.
5. Mechanical normalization at assembly (`process/assemble.py`): trailing spaces stripped, em dashes spaced, one leftover "nogen havde fejlet" aligned to the glossary.

## Not done / open
- The coordinator did not read the whole Danish text; coverage is the independent per-paragraph review above. No native-speaker read.
- Verse (Tennyson, Cowper, the Shakespeare sonnet, nursery rhymes, "Luriana Lurilee") is translated freely by the helpers, not taken from published Danish versions; the lines "Vi omkom, hver for sig" and "Men jeg under et vildere hav" are kept uniform throughout.
- Idioms and allusions flagged by translators as uncertain (for example the Biblical "løve, der søger, hvem den kan opsluge", plant names such as "fakkelliljer", "Fyret" versus "fyret", "Fiskeren og hans kone") follow the glossary in `process/REVIEW-INSTRUCTIONS.md`; a native editor may still want to polish them.
- Straight apostrophes remain only in proper names and Danish genitives after -s (St. John's Wood, hr. Bankes').
- Runtime integration (bookRegistry language entries, character cards for a Danish edition, whether the reader loads a `modern-da` edition for this book) is unverified and belongs to the coding window.

## Quality check (second independent pass, 2026-10-10)
Requested by Anders after the first package. Sixteen fresh reviewers each read one bundle of the FINAL Danish text paragraph by paragraph (first the Danish alone as a native editor, then against the English), without seeing the earlier reviews (`reviews/qc/`, instructions in `process/QC-INSTRUCTIONS.md`).

- Result: 443 of 495 paragraphs passed; 52 failed (46 language, 3 mechanical, 3 meaning). The meaning defects were a plural address in the Shakespeare sonnet lines (ch19), "hovere" for "flaunt" (ch17 p58) and "sårbar" for "touchy" (ch11 p2). No omissions, inventions or reversals were found; the glossary refrains are uniform.
- Reviewer scores (1-5): Danish fluency mean 4.3 (range 4.0-4.5), fidelity mean 4.8 (range 4.5-5.0).
- All 52 corrections were checked by three fresh verifiers: 47 passed, 5 failed again (ch3 p5, ch17 p22, ch34 p15, ch36 p1, ch40 p3) and were replaced by the verifier's wording, which was not re-verified. `candidate.json` above is the post-QC text.
- Not done: no native-speaker read. Style notes the reviewers left on passing paragraphs (for example "stormbyge" for "gale", "Lette kavaleris angreb" for the Tennyson title, "seglformer" for "scimitar shapes") were not applied.
