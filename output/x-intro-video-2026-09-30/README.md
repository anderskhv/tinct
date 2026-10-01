# Tinct films for X, 1 October 2026

Three films share one look and one end card: *Tinct · The world's best reading experience · for the world's greatest books · [tinct.app →]*. They are designed for muted autoplay; every beat reads without sound. The main film and the cutdown have a quiet sound-effects track: rain on the window, distant thunder, the book opening, pages, clicks and the fire. There is no music. The characters clip is silent.

All three are 1920×1080, 24 fps, H.264 High (BT.709) with AAC stereo audio, and within X's upload limits.

| File | Length | Use |
|---|---|---|
| `tinct-x-intro-v4.mp4` | 42.6 s | Launch / pinned post |
| `tinct-x-15s.mp4` | 15.5 s | Cutdown for replies, reposts and any paid promotion |
| `tinct-x-characters.mp4` | 15.0 s | Single-feature follow-up: character look-up |

Thumbnails: `poster.jpg` (the Frankenstein room and its question) is for the main film and the cutdown; `poster-characters.jpg` (the names over the garret) is for the characters clip.

## Main film: `tinct-x-intro-v4.mp4`

| Time | Shot | On screen |
|---|---|---|
| 0:00 | Dark | *Nothing you scrolled past today / will be read in 200 years.* |
| 0:03 | Dark | *The most important question about AGI / was raised 200 years ago…* |
| 0:05 | Frankenstein's room fades in on a soft lightning flash and rain; the camera drifts toward the book | MARY SHELLEY · 1818: *What do we owe to the intelligence we create?* |
| 0:10 | The cover swings open in slow motion and the book comes to us; its pages fill the frame | (real library animation, page chrome hidden) |
| 0:13 | The Introduction's words clear from the page, then Letter 1 inks in, top to bottom | |
| 0:15 | Letter 1 in Tinct Modern English; the 1831 original lays in beside it | "Mary Shelley's original…" / "…beside modern English." |
| 0:22 | Select "the seat of frost and desolation" on the 1831 page → Explain | "Stuck on a line? Tinct explains it." |
| 0:28 | Chat: "Is this book really about AI?" | "Ask anything. It knows your page." |
| 0:35 | Reading room by the fire | *Trade one scroll for one chapter.* |
| 0:38 | End card | Tinct · The world's best reading experience · *for the world's greatest books* · tinct.app → |

The bridge line is in Tinct's own words. Quoting a named person in the film would read as his endorsement, so that waits for permission.

**Suggested post**
> Nothing you scrolled past today will be read in 200 years. Frankenstein will.
>
> Tinct is the world's best reading experience for the world's greatest books: the original beside modern English, and a companion that explains any line.
>
> tinct.app

**Alt text:** A 43-second film for Tinct. Text on black: "Nothing you scrolled past today will be read in 200 years." Then: "The most important question about AGI was raised 200 years ago…" A painted gothic library appears in a flash of lightning, with Frankenstein on the table and the question "What do we owe to the intelligence we create?" (Mary Shelley, 1818). The cover swings open and the book comes toward the viewer, into Letter 1 in modern English. Mary Shelley's original lays in beside it. A selected phrase gets an explanation, and a reader asks "Is this book really about AI?" Text: "Trade one scroll for one chapter." End card: Tinct, the world's best reading experience for the world's greatest books. tinct.app.

## 15 s cutdown: `tinct-x-15s.mp4`

The cutdown keeps the opening line, the room and its question, the cover opening, the same clear-and-ink transition, and one Compare beat ("Mary Shelley's original…" / "…beside modern English.") before the end card.

**Suggested post:** *Nothing you scrolled past today will be read in 200 years. Read something that will. tinct.app*

## Characters clip: `tinct-x-characters.mp4`

| Time | Shot | On screen |
|---|---|---|
| 0:00 | Raskolnikov's garret (St. Petersburg in the window) | DOSTOEVSKY · CRIME AND PUNISHMENT: *Raskolnikov. / Rodya. / Rodion Romanovitch.* … *Same man.* |
| 0:05 | Into the book: Part 1, Chapter 3, his mother's letter, "My dear Rodya," | "Who's *Rodya?*" |
| 0:07 | Select "Rodya" → the card opens: *At this passage · Raskolnikov · Central figure · A destitute former student in St. Petersburg* | "Select any name. No spoilers." |
| 0:09 | Select "Dounia" → *Dunya · Major figure · Raskolnikov's younger sister* | |
| 0:12 | End card | as above |

The cards are Tinct's real character cards. They come from the reviewed character data, are gated to the reader's position ("At this passage"), and make no AI call. "Rodya" in the mother's letter is the nickname's first appearance in the book.

**Suggested post**
> Raskolnikov. Rodya. Rodion Romanovitch. Same man.
>
> Select any name in Tinct to see who it is, only as far as you've read. No spoilers.
>
> tinct.app

**Alt text:** A 15-second clip for Tinct. Over a painted St. Petersburg garret, three names appear: Raskolnikov, Rodya, Rodion Romanovitch, then "Same man." In the Tinct reader, his mother's letter begins "My dear Rodya". Selecting the name opens a card: Raskolnikov, a destitute former student in St. Petersburg. Selecting "Dounia" opens a card for Dunya, Raskolnikov's younger sister. End card: Tinct, the world's best reading experience for the world's greatest books. tinct.app.

## What is real and what is staged

- **Real product rendering.** Rooms, covers, the book-opening animation, the reader, Compare, menus, the Explain card, the Chat panel and the character cards were rendered by the current Tinct code in headless Chromium. The clock was frozen and frames were stepped one at a time at 24 fps, so the UI motion is the app's own. The slow-motion opening comes from stepping the app's own clock slower.
- **The main film's AI answers were staged.** The Explain and Chat replies were hand-written and streamed into the real UI through a local mock of `/api/lab-chat`. No Anthropic API was called. The character cards are real content, not staged.
- **The clear-and-ink transition is composited.** It uses two real reader renders of Letter 1: the normal page and the same page with its text hidden (`source/cap-blank.mjs`). They are pixel-identical apart from the text.
- **The lightning flash is added.** It's a grade on top of the Frankenstein room.
- **The audio is synthesized.** It comes from `source/audio*.py`. The rain is built from shaped noise only (a wash, fine patter and a few heavier taps on the glass); there are no tuned drops.
- **The build was local, not production.** The captures came from this branch's code, which can be slightly ahead of tinct.app.

Earlier cuts are in git history: v1 `e494aab8`, v2 `19a26c8c`, v3 `dae66ac8`, v3.1 `6215c916`, v3.2 `15a61b21`, v3.3 `580967d0`, v3.4 (silent) `1bf16747`.

## Regenerating

The work directory (`FILM_WORK`, default is the current directory) holds `cap/`, `comp/` (the `source/comp*.html` files plus `comp/end2/`), `fonts/`, `webm/` and `audio/`.

1. Run the app with `cd app && npx vite --port 3001`.
2. Transcode the library loops you need (`room-wide-v2`, `scene-crime-and-punishment-wide`) from `app/public/lab/library_2/assets/scenes/` to VP9 in `webm/`, because Playwright's Chromium has no H.264. Serve them with `npx http-server webm -p 3002`.
3. Run the captures (set `PLAYWRIGHT_MODULE` if Playwright isn't resolvable):
   - Frankenstein opening: `SPEED_RAMP="122:134:0.6" COVER_AT=130 node cap-scene.mjs "Feature Frankenstein" room-wide-v2.webm 2.0 200 v3-open 0 cover`
   - Frankenstein reader: `node cap-interact.mjs` (into `cap/v2-read`), then `node cap-blank.mjs` for the text-free page `r1-blank.png`
   - Crime and Punishment room: `node cap-scene.mjs "Feature Crime and Punishment" scene-crime-and-punishment-wide.webm 3.0 140 cp-room`
   - Crime and Punishment look-ups: `node cap-interact-characters.mjs` (into `cap/cp-read`)
4. Extract the reading room: `ffmpeg -ss 1 -i table-evening-wide.mp4 -frames:v 180 -q:v 2 comp/end2/e%04d.jpg`. Fetch the fonts with `get.py`.
5. Serve the work directory (`npx http-server . -p 3003`), then render each film with `COMP=<file> node render.mjs <outdir> <range> png`:

   | `COMP` | Range |
   |---|---|
   | `comp.html` | `0-1021` |
   | `comp-15s.html` | `0-371` |
   | `comp-characters.html` | `0-359` |

6. Make and master the audio with the matching script:
   - Main: `FOLEY_ONLY=1 python3 audio.py raw.wav`, then prepend 76 frames (3.167 s) of silence for the bridge before mastering. The music alternate is `audio.py` without `FOLEY_ONLY`.
   - Cutdown: `audio-15s.py`. Characters clip: `audio-characters.py`.
   - Master each with `python3 master.py raw.wav out.wav -18 0.55` (music mix: `-16`).
7. Encode:
   `ffmpeg -framerate 24 -i <frames>/%04d.png -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -shortest -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 18 -tune film -profile:v high -g 48 -maxrate 13M -bufsize 26M -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart <name>.mp4` (with a `.wav` in place of the `anullsrc` input; the characters clip uses `anullsrc` for silence)
