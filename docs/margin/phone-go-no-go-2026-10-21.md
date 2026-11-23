> **Update 14:20 UTC: likely cause of the "AI is resting" errors.** Signed-out AI has a daily spend ceiling of $5 per UTC day (`DEFAULT_GUEST_AI_DAILY_CENTS = 500`, `app/src/worker/lib/aiSpend.ts`). Every test profile was signed out, so this run did all its AI actions as a guest, three runs in parallel. It most likely used up today's guest budget at about 14:04.
> - **Who is affected:** signed-out visitors get "AI is resting" until 00:00 UTC.
> - **Signed-in readers:** probably unaffected, because they have their own allowance and are not under the guest ceiling. That is unverified, since no signed-in profile was available.
> - **Fix:** Coder releases today's guest-spend row or raises `GUEST_AI_DAILY_CENTS` for today.
> - **Next time:** test runs must sign in as the test account flagged `?internal=1`, never as a guest.

# Phone go/no-go: `?margin=1` phone reader on production (21 Oct 2026)

**Verdict: GO WITH FIXES.** The phone reader with the selection bar, chapter pills and cards is ready to launch once the items under "Must fix before launch" are fixed. Turn it on only when AI is answering again.

1. All 12 selection-bar and pill actions worked at 390×844 on six Tinct books, including Danish (To the Lighthouse, Moderne Dansk). Times were close to the default reader (table below). checkLayout found no overlapping, offscreen or clipped elements in any portrait step.
2. The reading place was kept every time: after every card opened and closed, after reloads, and after switching edition and back. 16 of 16 cold loads succeeded, with text showing in a median of 2.8 s.
3. Recap is unreliable. `/api/lab-chapter-notes` returned 502 on 5 of 11 Recap requests (Hamlet and Crime and Punishment failed twice in a row, including Retry, about 15 s each). The card then shows only a bulleted "Retry".
4. **AI was down on production from about 14:04 UTC.** Every `/api/lab-chat`, `/api/lab-chapter-notes` and `/api/lab-catch-up` request returned 503 "AI is resting", and it was still down at the last check at 14:15 UTC. This affects every reader, not only this preview, so it needs an owner now. The Worker returns that response for a provider budget error or a sustained provider 429 (`chatUpstream.ts`).
5. A few smaller problems in the cards themselves: after a follow-up, the first tap on the bin does not close the card in Chromium; quiz feedback refers to "paragraph 2", which the reader never sees; the colour swatches are 20 px tap targets.

**How it was tested.** All four profiles (profile, profile2, profile3 and profile4) were signed out, so **nothing was tested signed in.** I ran every AI action as a guest. A guest gets 10 AI actions per device, so the harness reset the device counter `tinct:lab-ai-actions` before each step; the account sheet did appear correctly on the 11th action. The browser was Playwright Chromium, not WebKit, with an iPhone 13 user agent, touch, an emulated keyboard (shrunk `visualViewport`) and no CPU or network throttling. Each book used a fresh guest profile. The harness is in the scratchpad (`cmp/gng/battery.mjs`).

---

## Must fix before launch

### B1. Recap fails often with 502 from `/api/lab-chapter-notes`, and Retry usually fails too
- **Steps:** open `/reader?book=hamlet&margin=1&chapter=3` → page to the end of the scene → tap ✧ Recap.
- **Result:** after about 15 s, `502 POST /api/lab-chapter-notes`. The card shows a bulleted "Retry" and no message. Tapping Retry gave another 502 after about 15 s.
- **Rate:** 5 failures in 11 Recap requests: Pride and Prejudice ch. 3 once, Hamlet 1.3 twice, Crime and Punishment 1.2 twice.
  - A later separate try of Hamlet 1.3 worked in 6.4 s.
  - Primer uses the same route and did not fail in 7 tries, though it uses the "start" kind.
  - The 15 s wait points to an upstream timeout or connection error mapped to 502.
- **Device and books:** 390×844; Hamlet and Crime and Punishment.
- **Screenshots:** `23-hamlet-390-recap-502-retry.jpg`, `25-cp-390-recap-502-retry.jpg`
- **Why it blocks:** Recap is one of three pills on every chapter end. A failure every second or third tap undermines the feature being launched.
- **Not caused by this preview:** the default reader's chapter end also has "Recap this chapter", so it probably fails there too. I did not measure that.
- **Also fix:** the error state should give one line of text ("Couldn't make the recap. Try again"), not a list bullet holding only "Retry".

### B2. Production AI is down, needs an owner today
- **What happened:**
  - From about 14:04 UTC every AI request returned 503 `{AI is resting}`, in about 0.4–16 s.
  - Cards then show "AI is resting — try again later."
  - The last check at 14:15 UTC still returned 503.
  - The run before it (To the Lighthouse, finished 14:03) had no AI failures.
- **Possible cause:** three test runs had started in parallel at about 14:04, which may have triggered the provider rate limit. I then stopped all AI testing. The 0.4 s answers look like the provider-budget path and the 16 s ones like the 429 retry path.
- **Not a phone-reader bug,** but a launch should not go out while AI is resting.
- **Screenshot:** `34-meditations-375x667-ai-resting.jpg`
- **Effect on testing:** the AI parts of the small-screen passes (375×667 and 360×740) were done during the outage. They show the resting state, not real answers.

## Should fix

### S1. After a follow-up, the first tap on the bin does not close the card (Chromium; check on iPhone)
- **Steps** (Meditations Book 3, 390×844):
  1. Select a sentence → Explain → wait for the answer.
  2. Type "Say it in one sentence." in Ask a follow-up → send. The field keeps the focus.
  3. Tap the bin.
- **Result:**
  - While the field has the focus the card fills the screen. Its top is at 12 px, height 832/844, and it covers the top bar (`30-…-followup-full-height.jpg`).
  - The first tap only drops the focus. The card shrinks to 70% and stays open with the thread (`31-…-bin-first-tap-card-stays.jpg`).
  - A second tap closes it.
- **How often:** 4 of 4 books where the bin was tried after a follow-up (Meditations, Odyssey, Hamlet, Crime and Punishment). The bin works on the first tap when no follow-up was typed.
- **Possible cause:** this may come from Chromium focus handling. On iOS the keyboard is up, so the card's full-height state is correct there. Check on a real iPhone whether the first tap on the bin closes the card. If it does not, close on `pointerdown` or keep the bin in place while the field loses the focus.

### S2. Quiz feedback refers to paragraph numbers the reader cannot see
- **Example:** Pride and Prejudice ch. 3, quiz from a selection, answer marked "Not yet. … Reread paragraph 2 with that in mind."
- **Second case:** Meditations, "Reread paragraph 2: Marcus is dividing himself…".
- **Scan:** I checked 896 AI texts for pipeline words ("excerpt", "the text I have", `{p. N}`, Markdown, tags). This was the only leak.
- **Fix:** the `quiz_check` prompt should quote or point to words, not to paragraph indices.
- **Screenshot:** `09-pp-390-quiz-marked-paragraph-leak.jpg`

### S3. Colour swatches in the highlight bar are 20×20 px
- They have a 4 px margin, so the tap area is about 28×20 px (`marginPhone.css` `.lab-pbar-swatch`). The other bar items and every pill are 44 px tall.
- They are easy to miss with a thumb, on every book and size.
- **Fix:** give each swatch a 44 px hit area with padding or a pseudo-element, and keep the visible 20 px dot.
- **Screenshot:** `10-pp-390-highlight-bar-swatches.jpg`

### S4. Deleting a note has no Undo on the phone
- **What happens:**
  - The bin in a note card deletes the note at once (`deletePhoneCard`).
  - Remove highlight on a tapped highlight also deletes it at once.
  - No Undo appeared in any of the 9 runs.
- The desktop margin cards have Undo (DECISIONS, 19 Oct). A mis-tap loses the reader's own words.
- **Fix:** add a short Undo toast for note and highlight deletes. AI cards are not stored, so their bin only puts the card away and is fine as it is.

### S5. The Bible stays on the old phone reader with `?margin=1`
- `/reader?book=bible&margin=1` opens the normal reader. Selecting text shows the old popup (Explain · Chat · Highlight · Copy), not the bar.
- **Cause:** `isPreviewBook` excludes the Bible (#490).
- Launching "to everyone" therefore leaves the Bible as the one book with the old popup and no pills. Decide whether the launch includes it.
- **Screenshot:** `29-bible-390-not-margin.jpg`

### S6. Chapter-end Quiz me takes about 12 s to its first question
- **Times:** median 11.8 s, max 15.9 s over 6 books. A quiz from a selection takes 5.1 s median.
- "Writing questions…" shows at once, so the card does not feel broken, but this is the slowest action by far. PR #531 measured 7.9 s with a mocked latency model; real Sonnet with adaptive thinking is slower.
- Leave it as it is unless Anders wants a quality check of a lower-effort model.

## Nice to have

- **N1. The bold lead sentence stops at "Mrs.":**
  - In To the Lighthouse (Danish), the bold lead sentence was only "**Mrs.**". The rest of the sentence was in regular weight.
  - The first-sentence split treats "Mrs."/"Mr." as the end of a sentence. The Pride and Prejudice answers were not affected because they did not start with a title.
  - Screenshot: `27-lighthouse-da-390-explain-mrs-lead.jpg`
- **N2. A reload after a chapter link drops margin mode (preview only):**
  - `…&margin=1&chapter=N` rewrites the address to `/reader?margin=1`, dropping `book=`. A reload then opens the normal reader (the place is kept).
  - Opening `/reader?book=<id>&margin=1` without `chapter` and reloading keeps margin mode and the place (9 of 9 books).
  - This goes away once the reader is the default.
- **N3. Ask opens with the field unfocused.** You need a second tap to type. This matches the "no caret" decision; it is noted only because #496's description says "a focused field".
- **N4. The passage underline is drawn word by word,** with gaps at the spaces (`05`, `27`). This is cosmetic.
- **N5. Define accepts punctuation and function words:**
  - Selecting a single "—" or "and" gives a grammar definition, for example "Punctuation (em dash)…".
  - It works correctly, but a word-only Define, or snapping to the nearest word, would be tidier.
- **N6. Danish:**
  - AI answers come back in English for the Danish edition. That matches the English-only strategy.
  - Catch me up in Danish was still showing skeleton bars when the screenshot was taken (`28`); its time was not measured.
  - A deep link `?edition=modern-da` shows an unstyled "Temporarily unavailable — Danish editions are no longer offered" page in both readers, while the in-reader edition list still offers "Moderne Dansk" (`38`). This happens on the current reader too.
- **N7. The page total in "N / M of book" changes between loads:**
  - Pride and Prejudice ch. 3 showed 769 on one load and 2,026 on another.
  - The default reader shows the same numbers, so this preview did not cause it.

## Timings (390×844, guest, Chromium, no throttling)

| Action | n | First words (median / max) | Last words (median / max) | Notes |
|---|---|---|---|---|
| First load, fresh profile (text visible) | 16 | 2.8 s / 3.9 s | ready 3.3 s / 4.6 s | warm reload 1.9 s / 2.8 s; default reader cold 3.2 s (same) |
| Primer (pill) | 6 | 4.0 s / 5.0 s | 4.2 s / 5.1 s | not streamed; follow-up 2.3 s / 2.9 s |
| Catch me up (pill) | 5 | 0.1 s (headings) | 2.3 s / 2.9 s | |
| Explain | 6 | 0.9 s / 1.6 s | 4.5 s / 5.5 s | follow-up 3.6 s / 7.7 s |
| Simplify | 6 | 1.3 s / 1.7 s | 1.5 s / 1.8 s | |
| Ask (typed question) | 6 | 1.2 s / 1.4 s | 3.5 s / 6.9 s | |
| Define (one word) | 6 | 0.5 s / 0.6 s | 2.2 s / 2.7 s | dictionary first, then sense |
| Fact-check | 6 | 2.4 s / 5.5 s | 3.2 s / 7.8 s | |
| Counterpoint | 6 | 1.6 s / 1.8 s | 5.1 s / 6.1 s | |
| Quiz me (selection) | 6 | 5.1 s / 7.2 s (first question) | 6.5 s / 7.3 s | marking an answer 2.4 s / 3.0 s |
| Quiz me (chapter end) | 6 | 11.8 s / 15.9 s (first question) | — | "Writing questions…" at once |
| Recap (pill, successful requests only) | 5 | 6.5 s / 7.5 s | 6.7 s / 7.7 s | 5 of 11 requests failed with 502 (B1) |
| Explain in dark theme | 6 | 1.3 s / 1.9 s | 5.0 s / 5.2 s | |
| Page turn (tap at the edge) | 9 | 0.7–0.8 s with settle | — | swipe works too |

The books were Pride and Prejudice ch. 3, Meditations Book 2, Odyssey Book 2 (Butler's prose, so there is no verse layout to test), Hamlet 1.3, Crime and Punishment 1.2, and To the Lighthouse "Vinduet · 3" in Moderne Dansk.

## Results per check

- **Selection bar:**
  - Shows Ask · Explain · Simplify · ••• · highlight · note.
  - ••• opens Define, Fact-check, Counterpoint, Quiz me and Copy, fully on screen, above the bar for a selection low on the page (`02`–`04`).
  - Copy placed the selected text on the clipboard and closed the bar.
  - No old popup appeared and no native selection was shown.
- **Highlights and notes:**
  - Highlight → the bar becomes the highlight bar (colours, note, ✕); changing the colour keeps the bar open.
  - Note → the note card is fully visible above an emulated 336 px keyboard (`11`).
  - Tapping the highlight again shows "Edit note", and the note text is kept.
  - The bin deletes the note, and Remove deletes the highlight.
  - Worked on all 9 runs, including 375×667, 360×740 and landscape.
- **Cards:**
  - Each card is as tall as its content, at most 70%.
  - The follow-up field sits directly under the content, 10–28 px below it.
  - Primer, Catch me up and Recap show the field and no bin; the passage cards have both.
  - Cards close by tapping outside, by dragging down, or with the bin (except S1).
  - With the emulated keyboard (336 px), Ask's field bottom was at 488 of 508 visible px on every book, so it was visible.
- **Pills:**
  - The start of each chapter shows "✧ Primer · ✧ Catch me up" on the heading's line. Catch me up is left out on the first chapter.
  - The end shows "✧ Recap · ✧ Quiz me · Note · Next chapter →". All four are 44 px tall and 8 px apart.
  - At 375 px and 360 px wide, "Next chapter →" wraps onto its own line, which is fine (`32`).
- **Reading place:**
  - Opening and closing every card kept the same page (checked 9 times per book).
  - Reload kept the exact first word, 9 of 9 times.
  - Switching to the other edition kept the same passage on screen; switching back returned to the exact same word, 6 of 6 times (`17`).
  - Chapter change worked by paging past the end and with Next chapter →.
- **Dark theme:** the bar and cards follow the theme and stay readable (`15`, `16`).
- **Listen:** as a guest, Play shows "Create a free account to keep listening" (`/api/narration/ensure` 401). That is expected because audiobooks are Premium. Playback itself was not tested.
- **Layout (checkLayout):**
  - Portrait steps had no overlap, offscreen, clipped or overflow findings at 390×844, 375×667 and 360×740.
  - The only "squeezed" finding was the swatches (S3).
  - Landscape (844×390): the bar spans the width, the note card takes 42% of the height, and nothing is off screen (`35`, `36`).
- **Default reader (no `margin=1`):**
  - Same top bar, paging, progress and load time.
  - Its old popup offers Explain · Chat · Highlight · Copy (`37`).
  - No regressions in the basics.

## Reliability

- **Loads:** 16 of 16 cold loads and 16 of 16 warm reloads worked, across 8 books. Each of the 9 battery runs also loaded. No failed loads.
- **Network failures seen:**
  - **Recap:** `/api/lab-chapter-notes` 502, 5 times (B1).
  - **AI outage:** every AI route returned 503 from about 14:04 UTC (B2).
  - **Ask:** `/api/lab-chat` net::ERR_CONNECTION_RESET once (Hamlet); the answer still arrived.
  - **Listen as a guest:** `/api/narration/ensure` 401, which is expected.
  - **Macbeth:** `/api/audio-manifest` 404 once on load; Macbeth ch. 1 has no audio manifest.
- **Console:** no page errors and no React errors, only the failed-resource lines for the requests above.

## Not tested, and why

- **Signed in:** all four profiles were signed out, and I did not type a password. Untested as a result:
  - cloud sync of the place, highlights and notes;
  - the internal flag (`?internal=1` was opened but means nothing for a guest);
  - Premium Listen;
  - Talk;
  - Primer made ahead of time.
- **Real iOS and WebKit:** Chromium emulation only. Still to check on a real iPhone:
  - the card on the real keyboard;
  - the iOS callout suppression;
  - the `touchend` taps on highlights;
  - S1.
- **Talk and dictation (mic):** not tested. Talk needs an account, and there is no microphone in the harness.
- **AI at the small sizes:** the AI answers at 375×667 and 360×740, and the Danish Catch me up time, came after the outage began, so they show the resting state. Layout, pills, notes and the reading place were tested at those sizes.
- **Macbeth:** I ran the battery on Hamlet instead; Macbeth only had the load test.
- **Odyssey verse layout:** the Tinct edition of the Odyssey is Butler's prose. A real verse book (Paradise Lost, Iliad in verse) was not run.
- **Android/Capacitor app, throttled CPU and network:** not tested.
- **Cleanup:** every test highlight, note and chapter note was deleted in the run that made it. A scan of the profiles found no "GNG" text left. They were guest profiles, so nothing was written to any account, and the throwaway profiles were deleted afterwards.
