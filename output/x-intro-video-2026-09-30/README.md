# Tinct intro film for X (v3.1, 1 October 2026)

`tinct-x-intro-v3.1.mp4` is the version to upload.

| Property | Value |
|---|---|
| Length | 39.4 s |
| Video | 1920×1080, 24 fps, H.264 High (BT.709) |
| Audio | AAC stereo, −18 LUFS. Sound effects only, no music: rain, distant thunder, the book, pages, clicks, fireside room tone |
| File size | 38 MB, within X's upload limits |
| Thumbnail | `poster.jpg` (frame 156: the Frankenstein room and its question) |

The film is designed for muted autoplay: every beat reads without sound.

`audio-with-music.m4a` is the alternative soundtrack: the same sound effects plus a soft synthesized piano and pad score, at −16 LUFS. To use it:
`ffmpeg -i tinct-x-intro-v3.1.mp4 -i audio-with-music.m4a -map 0:v -map 1:a -c copy tinct-x-intro-v3.1-music.mp4`
For a silent cut, run `ffmpeg -i tinct-x-intro-v3.1.mp4 -an -c copy tinct-x-intro-v3.1-silent.mp4`.

Earlier cuts are in git history: v1 in `e494aab8`, v2 in `19a26c8c`, v3 (with music and the "t" mark) in `dae66ac8`.

## Changes in v3 and v3.1

- **The opening is organic.** There is no pull-back to the website and no cursor clicking Read. In one continuous take, the cover on the table swings open in gentle slow motion. The open book comes toward the camera, and the camera sinks into the page and lands on Letter 1.
- **The features are slower.** Each beat now has a moment to orient, then the action, then a 2.5–3 s hold on the result. Camera moves are slower and there are fewer captions. Typing and the streamed answer run at half speed.
- **v3.1:** the end card drops the "t" app-icon mark, so the wordmark leads. The main soundtrack is now sound effects only; the scored mix is the alternate.

## Shot list

| Time | Shot | On screen |
|---|---|---|
| 0:00 | Dark | *Nothing you scrolled past today / will be read in 200 years.* |
| 0:02 | Frankenstein's room fades in on a soft lightning flash; the camera drifts toward the book | MARY SHELLEY · 1818: *What do we owe to the intelligence we create?* |
| 0:07 | The cover swings open (slow motion) and the book comes to us; we sink into the page | (real library animation, page chrome hidden) |
| 0:10 | Letter 1 in Tinct Modern English; the 1831 original lays in beside it; slow look at each | "Mary Shelley's original…" / "…beside plain modern English." |
| 0:19 | Select "the seat of frost and desolation" on the 1831 page → Explain; answer held | "Stuck on a line? Tinct explains it." |
| 0:25 | Chat: "Is this book really about AI?"; answer streams and is held | "Ask anything. It knows your page." |
| 0:32 | Reading room by the fire | *Trade one scroll for one chapter.* |
| 0:35 | End card | Tinct · The world's best reading experience. · *Starting with the greatest books ever written.* · tinct.app · 101 classics, free to read · More coming |

## What is real and what is staged

- **Real product rendering.** The room, cover, book-opening animation, reader, Compare, selection menu, Explain card and Chat panel were rendered by the current Tinct code in headless Chromium. The clock was frozen and frames were stepped one at a time at 24 fps, so the UI motion is the app's own. The opening hides the library's header, hero text and shelf. Its slow motion comes from stepping the app's own clock slower, not from interpolating frames.
- **The AI answers were staged.** The Explain and Chat replies were hand-written and streamed into the real UI through a local mock of `/api/lab-chat`. No Anthropic API was called. Check that they still sound like the live companion.
- **The lightning flash is added.** It's a grade on top; the loop's lightning is painted.
- **The 1818 hook date and the 1831 Compare text differ.** The hook dates the novel to 1818. The Compare edition is Shelley's revised 1831 text, so the caption doesn't name a year.
- **The audio is synthesized.** Everything comes from `source/audio.py`. The sound-effects track was chosen after a listen; the music mix was checked only by measurement.
- **The build was local, not production.** The captures came from this branch's code, which can be slightly ahead of tinct.app.

## Suggested post

> Nothing you scrolled past today will be read in 200 years. Frankenstein will.
>
> Tinct is the world's best reading experience, starting with the greatest books ever written: the original beside plain modern English, and a companion that explains any line.
>
> Free to read → tinct.app

**Alt text:** A 39-second film for Tinct. Text on black reads: "Nothing you scrolled past today will be read in 200 years." A painted gothic library appears in a flash of lightning, with Frankenstein on the table and the question "What do we owe to the intelligence we create?" (Mary Shelley, 1818). The book's cover swings open and the book comes toward the viewer, into Letter 1 in modern English. Mary Shelley's original text lays in beside it. A selected phrase gets an explanation, and a reader asks "Is this book really about AI?" Text: "Trade one scroll for one chapter." End card: Tinct, the world's best reading experience, starting with the greatest books ever written. tinct.app. 101 classics, free to read, more coming.

## Regenerating

The work directory (`FILM_WORK`, default is the current directory) holds `cap/`, `comp/` (with `source/comp.html` and `comp/end2/`), `fonts/`, `webm/` and `audio/`.

1. Run the app with `cd app && npx vite --port 3001`. The public Supabase values are in `vite.config.ts`.
2. Transcode `app/public/lab/library_2/assets/scenes/room-wide-v2.mp4` to VP9 at `webm/room-wide-v2.webm`, because Playwright's Chromium has no H.264. Serve it with `npx http-server webm -p 3002`.
3. Run the captures (set `PLAYWRIGHT_MODULE` if Playwright isn't resolvable):
   - `SPEED_RAMP="122:134:0.6" COVER_AT=130 node cap-scene.mjs "Feature Frankenstein" room-wide-v2.webm 2.0 200 v3-open 0 cover`
   - `node cap-interact.mjs` (Letter 1 stills, Compare, Explain and Chat, frame by frame into `cap/v2-read`)
4. Extract the reading room: `ffmpeg -ss 1 -i table-evening-wide.mp4 -frames:v 180 -q:v 2 comp/end2/e%04d.jpg`. Fetch the fonts with `get.py`.
5. Serve the work directory (`npx http-server . -p 3003`) and render with `node render.mjs final 0-945 png`.
6. Make and master the audio:
   - Main (sound effects only): `FOLEY_ONLY=1 python3 audio.py foley_raw.wav && python3 master.py foley_raw.wav foley.wav -18 0.55`
   - With music: `python3 audio.py raw.wav && python3 master.py raw.wav score.wav -16`
7. Encode:
   `ffmpeg -framerate 24 -i final/%04d.png -i foley.wav -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 18 -tune film -profile:v high -g 48 -maxrate 13M -bufsize 26M -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart tinct-x-intro-v3.1.mp4`
