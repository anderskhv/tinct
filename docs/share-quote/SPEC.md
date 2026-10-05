# Share a highlight as an image: spec

**Status:** approved by Anders on 5 October 2026 and assigned to the coding agent (brief: `CODER-BRIEF.md`). This document is a spec only; the coding agent builds it.
**Mockup:** `mockup.html` in this folder (open it in a browser). It shows the share sheet, the phone and desktop images, the surrounding-text toggle and the shrink-to-fit long quote. The fitting logic in its script is the reference behaviour.

## What the reader gets (revised after Anders's review, 5 October 2026)
From any highlight, **Share** opens a minimal sheet:
- A **preview** of the image.
- Two toggles, each remembered per reader:
  - **Show surrounding text**, default on.
  - **Add "Read free at tinct.app"**, default on.
- **Share…** (phone: the system share sheet with the image and the link) and **Copy link**. Desktop also gets **Copy image** and **Download**.

There are no other options. (Revised 5 October 2026: the quote is bold, and surrounding text became a toggle.) The image always uses **the edition and the look (Paper, Night or e-ink) the reader is already using**.

## The image is the reader's own page
It is rendered from the live reader's layout, not a separate design:
- **Header:** a passive version of the reader's bar. It has the book title, a dot, and the chapter, all in the same muted italic EB Garamond as the footer tagline, as plain text: no pill background, no chevron, no buttons or icons. It must not look tappable.
- **Body:** the reader's justified EB Garamond page, with the highlight **bold (EB Garamond 600)** on the reader's gold highlight colour.
- **Surrounding text (toggle, default on), greyed:** every word that isn't part of the highlight is shown in a light grey, and the highlight is in full ink on the gold highlight colour. **The quote always sits near the top:** the page opens one sentence before the highlight (with "…" if that is mid-paragraph), on phone and desktop alike, so nobody has to scan for it. The page then runs on until it ends; Surrounding text never makes the type smaller; only the highlight decides the size (see Fitting).
- **Surrounding text off:** the highlight stands alone, with "…" where it starts or ends mid-sentence, centred vertically on the page (phone and one-page desktop).
- **Footer:** where the reader shows page progress, the image shows "Read free at tinct.app" in the page's own serif (EB Garamond italic, muted), not the mono UI font. It shows nothing if the toggle is off. Remember each reader's last toggle choice, so readers who post on Reddit don't have to switch it off every time.

| | Phone | Desktop, short highlight | Desktop, long highlight |
|---|---|---|---|
| Shape | 4:5, 1080 × 1350 | 16:10, 1600 × 1000 | 16:10, 1600 × 1000 |
| Layout | The phone reader page | One reader page, centred | **Both pages of the spread**: the left page opens one sentence before the highlight, and the text flows across the fold as in the reader, with page numbers |

## Fitting (in this order; stop at the first that shows the whole highlight)
1. **Reader size, one page** (phone, or desktop single page).
2. **Desktop only: reader size, two-page spread.**
3. **Shrink the text** in small steps (1%) until the whole highlight fits: on desktop in the spread, on phone on the one page. The floor is **75% of the reader's size** (about 22 px body text in the 1600 px image; the floor exists so the image stays readable in a Reddit or X feed).
4. **Still too long at 75%:** keep 75% and cut the highlight at a sentence boundary with "…". The text itself is never changed.

The whole image uses one size: header and footer stay at their normal size; only the body text scales.

**Attribution:** the header carries the book and chapter. The edition credit (for example "tr. George Long" or "Tinct Modern E") goes in small type next to the footer tagline, and is always shown, even when the tagline is off.

**Link preview (OG, 1200 × 630):** the same page treatment cropped around the highlight.

## The share link
- **Format:** `https://tinct.app/q/{id}`, where `{id}` is a short random id. Store book, edition, chapter, paragraph, character range, look, format and tagline flag. Store **no** user identity on the public record; keep the creator's user id privately for analytics only.
- **Opening the link:**
  - It opens the reader at that passage with the highlight shown.
  - A signed-out visitor gets the normal anonymous allowance (5 questions, 5 minutes of Talk, 5 minutes of listening).
  - The book's library introduction is one tap away.
- **Unfurling:** server-rendered OG/Twitter meta.
  - `og:image` is the 1.91:1 render.
  - Title: `"…{highlight excerpt}…"`.
  - Description: `{Book}, {Author} · {Chapter}`.
  - `twitter:card=summary_large_image`.
- **Abuse limits:** only text that exists in our editions can be shared (ranges are validated server-side). Rate-limit link creation per user or anonymous account.

## How to build it (coding agent's choice; new dependencies need Anders's OK)
1. **Server render (recommended):** a Worker route renders the PNG from the stored record (e.g. Satori + resvg-wasm, or Cloudflare's image rendering) and caches it in R2 or the Cache API. One renderer serves the downloadable image, the OG preview and both formats. **A new dependency needs Anders's approval.**
2. **Client render:** draw on a canvas in the reader at share time. No new server work, but it can't produce OG previews by itself.

## Measure (with the Wave 1 analytics)
Track these events:
- `share_sheet_opened`
- `share_created` (format, look, tagline, edition)
- `share_completed` (copy, download or native share, where available)
- `share_link_opened` (referrer domain)
- `share_link_signup`

The question to answer: do shared links bring readers who keep reading?

## Reddit note
Most book subreddits remove self-promotion; a branded quote image may be deleted in r/books. Subs that welcome quote images, and replies in discussions, work better. Keep the tagline toggle visible. The link, with its passage preview, does most of the work.

## Acceptance
- Phone and desktop images look like the live reader page in the reader's current edition and look, with and without the tagline.
- The quote is bold. Surrounding text can be switched off, and both toggles are remembered.
- Fitting follows the order above: one page, then the spread, then smaller text down to 75%, then a cut at a sentence with an ellipsis. The text is never changed.
- The edition credit is correct for all three edition types.
- A shared link unfurls with the preview image on X, Reddit and iMessage, and opens the exact passage, signed out or in.
- No user identity appears in the public link or image.
