# The Shallows — Tinct intro film

A 48-second, 16:9 product film for X. Everything is generated in code: the visuals are a deterministic HTML/WebGL page (`film.html`) rendered one frame at a time in headless Chromium, and the score is synthesised in `score.py`. There is no stock footage and there are no samples.

## Build

```sh
# one-time: Playwright + ffmpeg + numpy/scipy
npm i playwright            # or point PW_PATH at an existing install
pip install imageio-ffmpeg numpy scipy

export FFMPEG=$(python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")
node render.mjs --stills 0,8,20.5,29.8,46   # preview stills -> out/still-*.jpg
node render.mjs --out out/frames.mp4         # full render (~20 min on CPU)
python3 score.py                             # -> out/score.wav
$FFMPEG -i out/frames.mp4 -i out/score.wav -c:v copy -c:a aac -b:a 256k -shortest tinct-the-shallows.mp4
```

`render.mjs` serves `film.html` plus the site fonts and cover art from `app/public`. Nothing here is deployed.

## Cut sheet

| Time | Beat | On screen |
|---|---|---|
| 0.0 | Hook (also the thumbnail) | Feed blurring past. **Your thumb scrolls 300 feet a day.** |
| 3.5 | | **Not one inch of it is deep.** |
| 5.5 | I · The Shallows | Letterbox closes. A man stands ankle-deep in black city water, lit by his phone. *You meant to read more this year. / You read the summary instead.* |
| 11.6 | The slop | Summary, thread and LinkedIn-Hamlet cards slam onto a pile. **This isn’t reading.** |
| 16.2 | Silence | **It’s wading.** A single drop. |
| 18.3 | The dive | The camera tips down and goes through the surface. Bubbles, light shafts. ***Go deep.*** |
| 23.0 | Product | Phone in deep water. Original ↔ Modern (Hamlet) · Ask mid-sentence (Crime and Punishment) · Pick up the thread (Apology). |
| 35.0 | The canon | Hard cuts: Shakespeare, Homer, Plato, Austen, Dostoevsky, Shelley. Then a wall of all 100 covers: **100 of the greatest books ever written.** |
| 40.9 | The sting | **The algorithm won’t miss you.** |
| 43.2 | End card | **Tinct.** *Read something great.* Free to read · tinct.app |

## Choices

- **Works on mute.** X autoplays without sound, so the type tells the whole story and the score is a bonus for people who unmute.
- **Hook on frame 0.** The first frame is the thumbnail, so the hook line is already on screen.
- **The water metaphor carries the story.** Shallow water stands for the feed and deep water for the books. The letterbox closes over the city scene and opens again on the dive.
- **Brand palette.** Deep teal (`--accent`), cream, Playfair Display / EB Garamond / IBM Plex. The cover art comes from the site.
