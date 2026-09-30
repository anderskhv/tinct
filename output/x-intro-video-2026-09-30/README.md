# Tinct intro film for X, 30 September 2026

`tinct-x-intro.mp4`: 32 s, 1920×1080, 24 fps, H.264 High (BT.709), AAC stereo at −16 LUFS, 37 MB. The file is within X's upload limits (512 MB, 2 min 20 s). `poster.jpg` is frame 40 (the Frankenstein question). Use it as the thumbnail if the account can set one.

The film is designed for muted autoplay: every beat reads without sound. The score and foley are an extra for anyone who taps for sound.

## Shot list

| Time | Shot | On screen |
|---|---|---|
| 0:00 | Frankenstein room: rain, one lightning flash | MARY SHELLEY · 1818: *What do we owe to the intelligence we create?* |
| 0:03 | Odyssey room | HOMER · c. 700 BC: *Would you refuse to become a god?* |
| 0:05 | The Prince room | NICCOLÒ MACHIAVELLI · 1532: *How good can you afford to be?* |
| 0:07 | Meditations room | MARCUS AURELIUS · c. 170 AD: *Why is it so hard to be the person you mean to be?* |
| 0:10 | Same room, blurred | *You always meant to read them.* / This time, you’ll finish. |
| 0:12 | Pull back to the live library home; Read → the book opens to its Introduction | (real UI) |
| 0:16 | Begin reading → reader, Compare lays the 1862 translation beside Tinct Modern English | "English, as it was in 1862." / "English, as it is *now.*" |
| 0:21 | Select "portion of the divine." → Explain | "Select any line. Tinct explains it." |
| 0:25 | Chat: "Why does he expect the worst of people?" and the streamed answer | "Or ask it anything." |
| 0:28 | End card: the "t" mark draws itself, then Tinct | *Fall in love with the books that matter.* · tinct.app · 101 classics · Free to read |

## What is real and what is staged

- **Real product rendering.** Every room, cover, library screen, book-opening animation and reader screen was rendered by the current Tinct code (library_2 + `/reader`) in headless Chromium. The browser clock was frozen, and the frames were stepped one at a time at 24 fps with the scene films seeked to the same time. The UI motion is the app's own. Hook shots hide the library's text so the questions can be set larger; the questions are the reviewed hooks in `reviewedIntroductions.js`.
- **The two AI answers were staged.** The Explain and Chat replies were written by hand and streamed into the real UI through a local mock of `/api/lab-chat`. No Anthropic API was called, per the API cost ban. Before posting, check that both answers still sound like the live companion.
- **The lightning flash is added.** The Frankenstein loop has rain, but its lightning is painted. The flash is a grade on top of it.
- **The build was local, not production.** The captures came from this branch's code, which is slightly ahead of what tinct.app served on 30 September (for example, the Frankenstein hook adds "to", and the Read button has an arrow).
- **The audio was never listened to.** The score and foley are synthesized in `source/audio.py`: felt piano, pad, a distant bell, rain, thunder, sea, wind, fire, UI clicks and a pen stroke. They were checked only by measurement (loudness, true peak, frequency balance). Listen once before posting. If the audio isn't right, post it muted, or re-mux with `-an`.

## Suggested post

> What do we owe to the intelligence we create?
> Mary Shelley asked in 1818.
>
> The best questions are in books most of us never finished. Tinct gives you each one in plain modern English, with the original beside it and a companion that explains any line.
>
> 101 classics, free to read → tinct.app

A shorter version: *You always meant to read them. This time, you’ll finish. tinct.app*

**Alt text:** A 32-second film for Tinct. Painted reading rooms appear one after another, each with a question from a classic: "What do we owe to the intelligence we create?" (Mary Shelley, 1818), "Would you refuse to become a god?" (Homer), "How good can you afford to be?" (Machiavelli) and "Why is it so hard to be the person you mean to be?" (Marcus Aurelius). Text: "You always meant to read them. This time, you'll finish." The Tinct app opens Meditations. Its modern English page appears beside the 1862 translation, a selected phrase gets an explanation, and a reader asks a question in chat. End card: Tinct. Fall in love with the books that matter. tinct.app. 101 classics, free to read.

## Regenerating

Work in a scratch directory (`FILM_WORK`, default is the current directory) laid out as `cap/`, `comp/`, `fonts/`, `webm/`, `audio/`, with `source/comp.html` copied to `comp/comp.html`.

1. Run the app locally: `cd app && npx vite --port 3001` (public Supabase env values are in `vite.config.ts`).
2. Transcode the library loops in `app/public/lab/library_2/assets/scenes/*.mp4` to VP9 `webm/*.webm`, because Playwright's Chromium has no H.264. Serve them with range support: `npx http-server webm -p 3002`.
3. Run the captures (Playwright; set `PLAYWRIGHT_MODULE` if it isn't resolvable):
   - `node cap-scene.mjs "Feature Frankenstein" room-wide-v2.webm 2.0 84 s1-frank`
   - `node cap-scene.mjs "Feature The Odyssey" scene-odyssey-wide.webm 3.0 66 s2-odyssey`
   - `node cap-scene.mjs "Feature The Prince" scene-the-prince-wide.webm 2.0 66 s3-prince`
   - `node cap-scene.mjs "Feature Meditations" scene-meditations-wide.webm 4.0 144 s4-medit`
   - `node cap-scene.mjs "Feature Meditations" scene-meditations-wide.webm 10.0 104 s6-hero 1 open`
   - `node cap-reader.mjs` (compare stills), then `node cap-interact.mjs` (Explain and Chat, frame by frame)
4. Extract the end-card room: `ffmpeg -ss 2 -i table-evening-wide.mp4 -frames:v 100 -q:v 3 comp/end/e%04d.jpg`. Fetch the fonts with `python3 get.py`, run in `fonts/` with the Google Fonts CSS saved as `fonts.css`.
5. Serve the work directory (`npx http-server . -p 3003`), render with `node render.mjs final 0-767 png`, and synthesize the audio with `python3 audio.py raw.wav`. Then run `ffmpeg -i raw.wav -af loudnorm=I=-16:TP=-1.5 score.wav`.
6. Encode:
   `ffmpeg -framerate 24 -i final/%04d.png -i score.wav -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 17.5 -tune film -profile:v high -g 48 -maxrate 14M -bufsize 28M -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart tinct-x-intro.mp4`
