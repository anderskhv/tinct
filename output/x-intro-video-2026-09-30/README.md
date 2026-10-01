# Tinct intro film for X (v2, 1 October 2026)

`tinct-x-intro-v2.mp4`: 30 s, 1920×1080, 24 fps, H.264 High (BT.709), AAC stereo at −16 LUFS, 32 MB, within X's upload limits. `poster.jpg` (frame 150: the Frankenstein room and its question) is the thumbnail.

The film is designed for muted autoplay; every beat reads without sound.

v2 follows feedback on v1 (commit `e494aab8`). The opening is calmer: one question instead of four quick rooms. The reader opens on Letter 1, the page Begin reading actually lands on. The film adds a doomscrolling edge and a call to action, and ends on the "world's best reading experience" positioning.

## Shot list

| Time | Shot | On screen |
|---|---|---|
| 0:00 | Dark | *Nothing you scrolled past today / will be read in 200 years.* |
| 0:02 | Frankenstein's room fades in on a soft lightning flash; slow push | MARY SHELLEY · 1818: *What do we owe to the intelligence we create?* |
| 0:07 | Pull back to the live library (same room, now with the app around it). Read → the book opens to its Introduction → Begin reading | (real UI) |
| 0:11 | Letter 1, Tinct Modern English. Compare lays the 1831 original in beside it | "Mary Shelley's own words." / "And in the English we speak *now.*" |
| 0:16 | Select "the seat of frost and desolation" on the 1831 page → Explain | "Stuck on a line? Tinct explains it." |
| 0:20 | Chat: "Is this book really about AI?" | "Ask anything. It knows your page." |
| 0:23 | Reading room by the fire | *Trade one scroll for one chapter.* |
| 0:25 | End card: the "t" draws itself | Tinct · The world's best reading experience. · *Starting with the greatest books ever written.* · tinct.app · 101 classics, free to read · More coming |

## What is real and what is staged

- **Real product rendering.** The room, cover, library, book-opening animation, reader, Compare, selection menu, Explain card and Chat panel were all rendered by the current Tinct code in headless Chromium. The clock was frozen and frames were stepped one at a time at 24 fps, so the motion is the app's own. The room shot hides the library's text so the question can be set larger. The question is the reviewed hook in `reviewedIntroductions.js`.
- **The AI answers were staged.** The Explain and Chat replies were written by hand and streamed into the real UI through a local mock of `/api/lab-chat`; no Anthropic API was called. Explain: *"Seat" here means home. Walton knows the pole should be a frozen wasteland, yet he can't stop picturing it as a paradise of endless light.* Chat: *Not literally. Shelley wrote it in 1818. But she asks the question we're asking now: what does a creator owe the mind it brings to life? Watch how Victor answers it.* Check both still sound like the live companion before posting.
- **The lightning flash is added.** The Frankenstein loop has rain, but its lightning is painted. The flash is a grade on top.
- **Two edition dates appear.** The hook dates the novel to 1818 (first edition). The Compare edition in the app is Shelley's revised 1831 text, so the caption says "Mary Shelley's own words" rather than naming a year.
- **The audio is synthesized and was not listened to.** `source/audio.py` makes everything (felt piano, pad, rain, distant thunder, fire, UI foley). It was checked only by measurement (−15.8 LUFS, −1.5 dBTP, balanced bands). Listen once before posting.
- **The build was local, not production.** The captures came from this branch's code, which can be slightly ahead of tinct.app.

## Suggested post

> Nothing you scrolled past today will be read in 200 years. Frankenstein will.
>
> Tinct is the world's best reading experience, starting with the greatest books ever written: the original beside plain modern English, and a companion that explains any line.
>
> Free to read → tinct.app

**Alt text:** A 30-second film for Tinct. Text on black: "Nothing you scrolled past today will be read in 200 years." A painted gothic library appears in a flash of lightning, with Frankenstein on the table and the question "What do we owe to the intelligence we create?" (Mary Shelley, 1818). The camera pulls back to the Tinct app. The book opens, and Letter 1 appears in modern English with Mary Shelley's original beside it. A selected phrase gets an explanation, and a reader asks "Is this book really about AI?" Text: "Trade one scroll for one chapter." End card: Tinct, the world's best reading experience, starting with the greatest books ever written. tinct.app. 101 classics, free to read, more coming.

## Regenerating

The work directory (`FILM_WORK`, default is the current directory) holds `cap/`, `comp/` (with `source/comp.html` and `comp/end2/`), `fonts/`, `webm/` and `audio/`.

1. Run the app with `cd app && npx vite --port 3001`. The public Supabase values are in `vite.config.ts`.
2. Transcode `app/public/lab/library_2/assets/scenes/room-wide-v2.mp4` to VP9 at `webm/room-wide-v2.webm`, because Playwright's Chromium has no H.264. Serve it with `npx http-server webm -p 3002`.
3. Run the captures (set `PLAYWRIGHT_MODULE` if Playwright isn't resolvable):
   - `node cap-scene.mjs "Feature Frankenstein" room-wide-v2.webm 2.0 150 v2-room`
   - `node cap-scene.mjs "Feature Frankenstein" room-wide-v2.webm 7.17 92 v2-hero 1 open`
   - `node cap-interact.mjs` (Letter 1 stills, Compare, Explain and Chat, frame by frame into `cap/v2-read`)
4. Extract the reading room: `ffmpeg -ss 1 -i table-evening-wide.mp4 -frames:v 180 -q:v 2 comp/end2/e%04d.jpg`. Fetch the fonts with `get.py`.
5. Serve the work directory (`npx http-server . -p 3003`) and render with `node render.mjs final 0-719 png`. Synthesize the audio with `python3 audio.py raw.wav`, then run `ffmpeg -i raw.wav -af loudnorm=I=-16:TP=-1.5 score.wav`.
6. Encode:
   `ffmpeg -framerate 24 -i final/%04d.png -i score.wav -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 17.5 -tune film -profile:v high -g 48 -maxrate 14M -bufsize 28M -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart tinct-x-intro-v2.mp4`
