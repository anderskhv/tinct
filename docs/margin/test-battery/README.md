# Margin reader test battery

The full set of tests run on 15 October 2026 against the PDF reader's margin, and against Gloss (usegloss.io) for comparison. Run it after every release train. Reports so far are in `../gloss-test/`: `report.html`, `deep.html`, `deep-gan.html`, `edge.html`, `retest.html` and `full-battery.html`.

Never write the test account's password into a file. Sign in by hand once per browser profile (below).

## Setup

1. Install Playwright with Chromium (`npm i playwright`; in Claude's cloud the browser is already at `/opt/pw-browsers`).
2. **Profiles.** `lib.mjs` opens a persistent Chromium profile, `./profile` by default (`PROFILE=` overrides it). Use one profile per parallel run.
   - Sign in to tinct.app once in each profile as the test account.
   - Gloss runs signed out, in `./gprofile` (`GPROFILE=` overrides it).
   - Behind a TLS-intercepting proxy, pass the proxy's certificate flag in `CHROME_ARGS`.
3. **Exempt the test account from limits.** In each profile, while signed in, open `https://tinct.app/library?internal=1`. The account is then flagged internal, so neither the AI allowance nor the chat limit refuses it (#456). See CLAUDE.md, "Test accounts".
4. **Make the test files.** Outputs are not committed; recreate them:
   - Attention: https://arxiv.org/pdf/1706.03762. GAN: https://arxiv.org/pdf/1406.2661. ResNet: https://arxiv.org/pdf/1512.03385v1.
   - Scan: `python3 make/mkscan.py`, which turns the GAN PDF into an image-only scan. Change the seed for a never-seen file.
   - Long book: http://incompleteideas.net/book/RLbook2020.pdf (548 pages, 73 MB).
   - Literature: `python3 make/mkpdf.py` builds `yellow-wallpaper.pdf` (13 pages, no outline) and `metamorphosis.pdf` (71 pages, outline Part I–III) from Project Gutenberg #1952 and #5200. The EPUB is https://www.gutenberg.org/ebooks/5200.epub3.images.
5. **Upload.**
   - Tinct: `node up3.mjs <file> <tag>`. It prints the `?userBook=` URL; the reader may open at `/reader` (book reader) instead of `/lab/addbook`.
   - Gloss: `node gup.mjs <file> <tag>`. Over 20 pages, Gloss asks for the reader's own Together key, so the long book cannot be compared.

**Literature PDFs open in the book reader ("Tinct text") by default.** To test the margin on them, open `/lab/addbook/?userBook=…&pages`. The first open in a fresh profile sometimes still redirects to `/reader`; open once more and it stays.

## Runs

| Run | Command | What it covers |
|---|---|---|
| Deep test, desktop | `TURL=<reader url> TS=sets/<set>.json OUTD=<dir> node deep-tinct.mjs` | Explain, Simplify, Define (double-click), Fact-check, Counterpoint, Ask, Quiz me (answer, Show answer, wrong answer), whole document, primer. One JSON line per action, with timings: `first` is the first words, `last` is the last change. |
| Same set on Gloss | `GURL=<gloss url> TS=sets/<set>.json OUTD=<dir> node deep-gloss.mjs` | The same actions in Gloss's margin. Gloss has no quiz. |
| Whole-document questions | `TS=sets/<set>.json OUT=<file> node wholeq.mjs` | Waits until the thread stops loading before asking, so answers are not mixed up between questions. |
| Phone (390×844, touch) | `TURL=… TS=… OUTD=… node phone.mjs` | Selection by `selectionchange`, the phone bar `.mr-pbar` and `.mr-pmore`, every action, a screenshot and `checkLayout` after each, primer, and Librarian from the t menu. |
| Phone Librarian | `TURL=… node phlib.mjs` | A whole-document question through t menu → Librarian. |
| Figures | `TURL=<ResNet> node fig-tinct.mjs` (set `sets/resnet-figures.json`) | Hover above each caption until the figure chip shows, then Explain and a question that can only be answered by looking. Ground truth is in the set. |
| Figure routes | `TURL=<Attention> CAP=… Q1=… Q2=… OUT=… node fig-route.mjs` | A question asked on a caption, and a whole-document question naming a figure. Both should see the picture. |
| Long book | `ui-rl.mjs`, and `mlate.mjs` for jumping to late pages | Go to page by printed number, header label, reading order around figures, the TD-Gammon figure chip, a primer in chapter 16, and search across the book (Sarsa → Ch. 6, §6.4, p. 129). |
| Scans | `scan-r2.mjs` (new file), `scan-r2b.mjs` | Offer on first open, recognition time, staying in the PDF reader with a text layer, Explain, Table 1 question, primer. Score recognition with `make/wer.py` (Tinct 85%, Gloss 96% before the fixes). |
| UI checks | `ui5.mjs` | One scrollbar at the right edge, no foot bar, primer opening in place (frame heights), bar icons, delete with Undo, the Aa panel, Focus view with an Explain card. |

Run Tinct and Gloss in parallel if you like, but never two Tinct runs on the same book in the same profile.

## Scoring

Score every answer 1–5 on five criteria and take the mean:
- **Accurate:** right about the document and the world.
- **Grounded:** uses the passage and the document, and shows where.
- **Useful:** helps beyond the text.
- **Fits the action:** length for a margin card; does what the button says.
- **Speed (time to last word):** ≤2 s = 5, ≤4 s = 4, ≤7 s = 3, ≤12 s = 2, slower = 1.

Score Quiz me on its own merits: questions on the passage, good questions, marking quality, speed. A failed load ("The answer could not be loaded") scores 1 and is reported separately.

## Always check

- **Answer text:**
  - no pipeline wording ("the text I have", "supplied", "search note", "excerpt");
  - no raw tags (`{p. 1}`, `{pp. 5}`, `(p. 2)`, "p. 5p. 6");
  - no Markdown;
  - Fact-check states its verdict once;
  - Simplify never returns the passage unchanged or repeats a line.
- **Define:** "In this text" comes first for technical or story-specific senses (transduction, ensemble, perplexity, saturate, smooch).
- **Fiction:**
  - the primer uses Where we are / People / Threads to watch, with no spoilers past the reader's place;
  - Fact-check says once that the passage is fiction, then checks the real-world facts (Weir Mitchell);
  - Counterpoint gives an alternative reading, without "the author's reply" templating.
- **Whole document:** the answer covers the whole file, is right about who people are (Jennie is John's sister), finds the pages of named sections in long books, and reads the full section rather than its first lines.
- **Speed targets:**
  - Explain, Simplify and Define: under 2.5 s.
  - Ask, Counterpoint and Quiz me's first question: under 5 s.
  - Fact-check: first words under 4 s.
  - Primer: under 15 s.
- **Reliability:** zero "could not be loaded" across a full run. Watch for `502 /api/chat`.
- **Layout:** `checkLayout` reports no `overlap`, `offscreen` or `squeezed`. On the phone, `clipped` inside scrolling sheets is expected.
