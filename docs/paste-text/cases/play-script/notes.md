# play-script — notes

Public domain. The opening of Wilde's *The Importance of Being Earnest* (Project Gutenberg #844): title, persons of the play, scenes, first-night cast, and the start of the First Act. Speakers are set as `NAME.<br>speech`. Input and full expected output are in this folder.

Rules tested:

- R24 Speaker labels: a `<p>` whose first line is an upper-case name ending in "." followed by `<br>` becomes one paragraph "ALGERNON. Did you hear…", and the edition is marked `speakers: true` (as `epubEdition.ts` does for plays, `isPlayText`).
- R24 Stage directions in brackets (`[Hands them on a salver.]`, `[<b>Lane</b> is arranging …]`) stay inline as written, bold names kept.
- R19 Lists set with `<br>` (persons of the play, the cast list) → one line per entry.
- R05 `<h1>` title; the `<h3>` directly under it ("A Trivial Comedy for Serious People") → subtitle.
- R30 Act heading "FIRST ACT" is chapter-like → its own section ("First Act" after `chapter-title.js`; note the normaliser does not turn it into "Act 1"); the front-matter `h2`s also become sections because the paste has chapter-like headings. "SCENE" (`h3`) → subheading.
- R14 Internal `#chap01` links in the scene list → plain text.
- R33 `* * * * *` → one scene break.
- R31 Author not in the selection → empty.
