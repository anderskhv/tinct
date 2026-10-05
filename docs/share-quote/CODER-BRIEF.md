# Coder brief: share a highlight as an image

Anders assigns this to you (coding + release) on 5 October 2026. He wants it **live when he wakes up on 6 October**. You remain the single serialized deploy owner: finish or park whatever release is in flight first; don't interrupt it. Follow AGENTS.md (build, verify-bundle, GitHub Actions deploy, acceptance, the deploy-safety gate).

**Read first (on branch `claude/dreamy-faraday-30zl0v`):**
- `docs/share-quote/SPEC.md`: the approved spec. Build exactly that; Anders signed off on every detail.
- `docs/share-quote/mockup.html`: the approved look. Open it in a browser. Its fitting script is the reference behaviour.

Don't reopen the design. Ask Anders only where something is truly ambiguous, and if you're blocked overnight, ship what is safe and leave him a clear note.

## What to build
1. **Share action** on a highlight in the live reader (`app/src/lab/`, around `labHighlights.ts` / `useTextRangeHighlights.ts`). It opens a minimal sheet containing:
   - a preview of the image;
   - two remembered toggles, both on by default: **Show surrounding text** and **Add "Read free at tinct.app"**;
   - **Share…** (Web Share API with the image file and the link, where supported) and **Copy link**;
   - on desktop also **Copy image** and **Download**.
2. **The image is the reader's own page**, in the reader's current edition and look (Paper, Night or e-ink):
   - passive italic header (book · chapter) with nothing tappable;
   - justified EB Garamond body;
   - highlight **bold (600)** on the gold highlight colour;
   - surrounding text greyed, and the page opens one sentence before the highlight;
   - the tinct.app tagline and the edition credit in muted italic.

   With surrounding text off, the quote stands alone with "…", centred vertically.
3. **Sizes:**
   - phone: 4:5, 1080×1350;
   - desktop: 16:10, 1600×1000, one page or the two-page spread.
4. **Fitting, in this order:**
   1. reader size on one page;
   2. (desktop) reader size across the spread;
   3. shrink the body text in 1% steps until the whole highlight fits, **never below 75%**;
   4. if it still doesn't fit, keep 75% and cut at a sentence boundary with "…". Never change the words.
5. **Share link** `tinct.app/q/{id}`:
   - Store book, edition, chapter, paragraph, character range, look, format and both toggles.
   - Validate the range server-side against our edition text.
   - Rate-limit link creation per user or anonymous account.
   - Keep no user identity on the public record; keep the creator id privately for analytics.
   - Opening the link puts the reader at the passage with the highlight shown, signed in or out.
   - The new shares table is a schema change, and Anders approved it with this brief.
6. **Unfurl:** server-rendered OG/Twitter meta (`summary_large_image`):
   - title: the highlight excerpt;
   - description: Book, Author · Chapter;
   - `og:image`: a 1200×630 render cropped around the highlight.
7. **Analytics** (if the Wave 1 event pipeline is live; otherwise add the calls behind it):
   - `share_sheet_opened`
   - `share_created`
   - `share_completed`
   - `share_link_opened`
   - `share_link_signup`

## Rendering and dependencies
The spec recommends rendering on the server: one Worker renderer for the download, the OG image and both formats, cached in R2 or the Cache API.
- **DEPENDENCY:** Anders approves `satori` + `@resvg/resvg-wasm` (with the EB Garamond font files) for the Worker. *(Anders: delete this line before pasting if you don't approve; then build the image client-side on a canvas, ship the unfurl with text-only meta, and leave OG images for later.)*
- Check the Worker bundle size limit after adding them. If it doesn't fit, render on the client and say so in your report.

## Acceptance (before you report done)
- Phone and desktop images match the mockup in all three looks and all three edition types (original, modern, translation credit such as "tr. George Long"), with each toggle on and off.
- Fitting test cases:
  - a short highlight stays at reader size on one page;
  - a long highlight moves to the spread and shrinks (the Frankenstein ch. 5 passage in the mockup lands at about 80%);
  - an over-long highlight cuts at a sentence at 75%.
- A `/q/` link unfurls with the image on X, Reddit and iMessage (check with the platforms' card validators or a meta inspector) and opens the exact passage when signed out.
- No user identity appears in the link, the page meta or the image.
- Existing reader tests pass; add tests for the fitting function and the range validation.

## Report to Anders in the morning
Tell Anders what's live, link one phone and one desktop example share, give the acceptance results, and list anything that needs his decision.
