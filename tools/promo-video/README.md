# Tinct promo video

Makes a phone-in-3D promo clip of the real app, in the style of the Grids teaser
(a slow camera glide over a tilted phone, with real, readable UI on screen). No
generative video: every pixel on the screen is Tinct itself.

```
npm install
npm run record     # Playwright walks tinct.app on a 390x790 phone viewport → out/recording/
npm run render     # three.js phone + camera shots → out/tinct-promo-1080x1350.mp4
node render.mjs --preview            # 540x675 @ 15 fps, fast check
node render.mjs --size 1080x1920     # 9:16 for Reels / Shorts / TikTok
```

**What gets recorded** (`record.mjs`, run against production as a guest by default;
`TINCT_ORIGIN` overrides):

1. The library, with Frankenstein as the hero
2. The librarian: a typed question, its real answer and the Frankenstein recommendation
3. The book introduction: Characters, then Pick edition → Original (1831)
4. The reader with narration and word-by-word highlighting
5. A long-press on "Saville" → character card
6. A long-press on "forebodings" → definition

Taps show as soft touch ripples. Each step sets a named marker in
`out/recording/manifest.json`.

**Editing.** `edit.json` is the cut list. Each clip has:
- source range (marker ± seconds)
- speed
- camera shot (the `SHOTS` in `stage.html`)
- optional caption

The last clip pulls back to the end card. Re-render after an edit; there's no need
to re-record.

**Costs and caveats.**
- The librarian step sends one guest message to the production chat. Each run uses
  one of the 10 free guest AI uses per device, and the recorder resets that counter.
- Guest narration only plays cached audio. The Original (1831) opening of
  Frankenstein is cached; the Modern English opening is not, so the recorder
  switches to the original edition.
- Voice Talk needs a signed-in session, so it isn't part of the guest walk-through.
- Rendering uses software WebGL in headless Chromium. It's slow (about 1 s per frame
  per worker at 1080p), so use `--preview` to iterate.
