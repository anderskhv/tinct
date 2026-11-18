# Try page — build brief (2026-11-18)

Anders approved the concept on 18 Nov 2026: build it, **do not launch**.

Mockups:
- Canvas: https://claude.ai/artifact/QoY6BLEmVEE6B1WqWddwbj (private to Anders).
- Copies of the key boards: `docs/try-page/mockups/` (D = desktop 1440, M = phone 390).
- Every reader pane in the mockups is a screenshot of the real reader: desktop from production at 1600×900, phone at 375×640, with canned AI answers.

## What it is

An about page where the product is the proof. You arrive, read one headline, and use the **real margin reader** right there. Five steps beside it walk you through what Tinct does. Below the fold come features, pricing, questions and the footer (privacy, terms).

It will become `/about` later. For now it lives at **`/try`**:
- unlisted: not in the sitemap, `noindex`, and nothing links to it;
- signed-in readers are redirected to the app, the same way `landing.html` does it.

## "Not launching" means

- Build on a branch and open a PR.
- Verify locally at 1440 and 390, with screenshots in the PR.
- **Do not deploy and do not merge** until Anders says so.
- Nothing in the app, landing page, emails or sitemap points at `/try`.

## First screen

**Desktop** (D1–D9):
- **Top bar:**
  - logo;
  - section links "Try it · Features · Pricing · Questions", with "Try it" marked as the current section;
  - Sign in;
  - "Create free account".
- **Headline only:** "No text is beyond you." No subline.
- **Left column, about 270px:** the book picker (Meditations ▾; Odyssey and Hamlet later), then one step at a time:
  - "1 of 5" with progress dots;
  - the step title in display type, with one line under it;
  - Back and Next →;
  - "Next: …" and "Or just read and play."
- **Right:** the margin reader, Meditations Book 2, original edition, opening at "1. Begin the morning…".
  - Leave out the minimap strip. Keep the margin, because that is where everything lands.
  - The reader needs to be wide enough to show margin **cards**. At 1120px wide it falls back to dots and floating cards, which is wrong for this page. See the open questions below.
- **Original | Modern switch** in the reader's own top bar, next to the chapter chip. Today it sits at Menu → Book settings → Main version. Putting it in the top bar is a proposal for the reader too, so check with Anders before changing it outside demo mode.
- **Peek:** the cream "Everything you can do in Tinct" section shows at the bottom, with "Features · Pricing · Questions ↓".

**Phone** (M1–M9):
- headline;
- a step card (dots, "1. Explain anything", one line, → button);
- a row with the book picker on the left and Original | Modern English on the right, on the dark background, not on top of the reader;
- the reader;
- at the bottom, "Features · Pricing · Questions ↓" as text only, above a hairline. This is strip option D.

**Background:** the Odyssey scene (`public/lab/library_2/assets/scene-odyssey-wide.jpg`, phone version for phones), heavily blurred and darkened.

## The five steps

> **Superseded 18 Nov 2026 (Anders): hints instead of steps.** No Next, no Back and no scripted actions; the page never scrolls the reader. Desktop: a "Try it yourself" checklist of five (Explain a passage · Ask a follow-up · Read it in today's words · Hear it as you read · Get the gist in a minute) that ticks when the visitor does each thing, in any order, with the next one highlighted and a one-line instruction. Phone: a compact "Try it yourself" card with five chips. One small dark hint at a time sits by the real control in the reader, only while that control is on screen, with × to dismiss. Screenshots: `screenshots/hints-*.png`. The table below is kept as the history of the first version.

The title says what you get; the line under it says how.

| # | Title | Line | Next → makes the reader… |
|---|---|---|---|
| 1 | Explain anything | Select a passage. The explanation lands beside it, in the margin, and stays there as a note. | select "Begin the morning … unsocial." and run Explain; the card opens in the margin |
| 2 | Keep asking | Follow up in the same note — type, or talk it through out loud. | focus the card's "Ask a follow-up" field (show a suggested question) |
| 3 | Read it in today's words | Switch to modern English. Switch back any time; you stay on the line. | switch to Modern English at the same place |
| 4 | Hear it as you read | Press play. Every word is marked as it is read. | start Listen |
| 5 | Get the gist in a minute | Tap Summary beside the chapter in the margin. It opens as a card there too. | open the Book 2 Summary card |

- **The steps are optional.** Anything the visitor does on their own also moves the step panel along: selecting text means step 1 is done, switching edition means step 3 is done, and so on.
- **The page talks to the reader** through a small demo-mode API, or `postMessage` if the reader runs in a frame.
- **On phone** the same steps open the reader's bottom sheets (Explain, follow-up, Talk, Summary). Those already exist and look right (M3–M8).

## AI: real, with a safety net

Anders: Talk and follow-ups should be **fully open and live**. The more real it feels, the better.

- **Pre-generate** the scripted parts so they are instant and free:
  - the step 1 Explain of the scripted passage;
  - the Book 2 Summary.
  
  Make both in a CLI session and ship them as files, per the API cost rule. The modern edition already exists. Check that guest narration plays for Meditations Book 2 ("cache-only guest" voices in `worker/routes/narration.ts`). If it doesn't, the Book 2 audio has to be cached ahead of time.
- **Everything else is live:** other Explains, Simplify, follow-ups, Ask and Talk.
- **This page gets its own daily budget**, separate from the guest ceiling. Today all guests share one budget (`DEFAULT_GUEST_AI_DAILY_CENTS = 500`, $5 a day), and a busy day on this page must not drain the reader's guest budget, or the other way round.
- **When the visitor or the day runs out**, the reader never shows an error. It shows the D9/M9 card instead:
  - "Keep the conversation going";
  - "That's the free questions for today. Create an account and carry on right here — this conversation comes with you, and your first month of Premium is free.";
  - "Create a free account" and "I already have an account".
  
  The conversation must really carry over after sign-up.
- **Testing:** use a signed-in test account with `?internal=1`, or local stubs. Never test as a guest against production AI.

## Demo mode must not leave traces

- **No writes:** don't write the visitor's reading position, history, progress or highlights to any account or to local storage that the real reader reads later.
- **No margin opt-in:** don't set the margin preview's sticky opt-in. Today `margin=1` stores `tinct:margin-preview`.
- **The reader's "Back to library" and library chrome** either hide in demo mode or go to `/read`. That's Coder's call.

## Below the fold (D10 / M10)

1. **"Everything you can do in Tinct"**, subtitled "What you just tried works in every book — and in your own." Seven cards:
   - **Your own books and PDFs** (the large dark card): check which file types are supported before writing the copy;
   - 100+ classics, free to read;
   - A companion in the margin;
   - Listen;
   - Highlights and notes;
   - Catch me up;
   - Read your way.
2. **Pricing:**
   - **Free:** $0, every book, original and modern English, highlights and notes, synced place.
   - **Premium:** $5 a month or $50 a year, with a "First month free" tag. Includes explain/simplify/ask, Talk, audiobooks, Catch me up and summaries, and your own books and PDFs.
   
   Take the amounts from the code at build time, not from this brief.
3. **Questions:** five, as an accordion.
   - **"Which AI do you use?"** must match `public/privacy.html`: Anthropic for the companion, xAI for voice and narration. Don't claim "never used for training" beyond what the privacy page says. Today it says that only about your own books.
4. **Closing section:** "Start with the book you put down." with "Create a free account".
5. **Footer:** Library · Pricing · Privacy · Terms · Contact.

## Open questions for Coder (decide, then note it in the PR)

- **Reader width.** Margin cards need a wide reader. Either:
  - give demo mode a lower width threshold for cards; or
  - render the reader at about 1500 CSS px and scale it down, which shrinks the text to about 70%.
  
  The first is preferred.
- **Same document or a frame** for the reader. The choice affects load time, so measure first paint.
- **Hamlet:** plays open in the classic reader, not the margin reader. Hamlet is fine in the book picker only if it opens in the margin reader. Otherwise use Meditations, the Odyssey and one more prose book.

## Done when

- `/try` works at 1440 and 390 and matches the D and M boards.
- All five steps work by Next and by hand.
- The out-of-budget card shows up instead of an error. Prove it with a test that forces the budget to zero.
- Demo mode writes nothing (there's a test for this).
- A signed-in visitor is redirected to the app.
- `noindex` is set, the page is not in the sitemap, and nothing links to it.
- `npm test` and `npm run build` pass, there's a PR with screenshots, and it is **not deployed**.

## Decision status (18 Nov 2026)

**Approved by Anders. Build these:**
- Headline "No text is beyond you." with no subline; the five benefit-led steps above.
- The margin reader on desktop; every action lands in the margin as cards (D1–D9). Use production tinct.app as the visual reference, not older local builds.
- The follow-up continues inside the Explain card, not in a separate chat.
- Meditations Book 2 as the opening passage.
- Desktop: one step at a time on the left. Phone: a step card, then a row with the book picker and Original | Modern English, then the reader, all the same width (M1–M9).
- Phone bottom strip: option D, text only above a hairline.
- Live AI with this page's own budget, and the sign-up card when it runs out.
- Unlisted `/try`, signed-in readers redirected, **not launched**. It becomes `/about` later.

**Proposed. Wait for Anders's OK before building:**
- **Where it lives:** rename to `/about` once tested. Link to it as "See how it works →" from the landing page, from first visits to `/read/{book}`, and from the footers.
- **Launch video:** link to this page, using `?ref=launch` to count visits and sign-ups.
- **Launch-day budget:** a higher daily budget for this page on launch day, around $50–100.
- **Later:** test this page as the home page for signed-out visitors against the current landing page.

## Copy correction (18 Nov 2026)

The FAQ answer in the D10 mockup, "It's an AI rewrite of every line, checked against the original", must **not** ship. We never claim accuracy checks that haven't been done. Use this instead: "It's every page rewritten in modern English with AI — a reading aid, not a scholarly translation. The original is always one tap away." For the 52 books whose "original" is an older English translation, name that translation.
