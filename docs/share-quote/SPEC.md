# Share a highlight as an image: spec

**Status:** proposed by the PM session on 5 October 2026. The mockup is approved for discussion; the build is not yet assigned. This document is a spec only; the coding agent builds it.
**Mockup:** Anders's private preview page "Tinct Quote Share" (claude.ai artifact). It shows the share sheet, the phone and desktop images, a long-quote example and the link previews.

## What the reader gets (revised after Anders's review, 5 October 2026)
From any highlight, **Share** opens a minimal sheet:
- A **preview** of the image.
- One toggle: **Add "Read free at tinct.app"**, default on.
- **Share…** (phone: the system share sheet with the image and the link) and **Copy link**. Desktop also gets **Copy image** and **Download**.

There are no other options. The image always uses **the edition and the look (Paper, Night or e-ink) the reader is already using**.

## The image is the reader's own page
It is rendered from the live reader's layout, not a separate design:
- **Header:** the reader's bar, with the book title in Playfair bold, a dot, and the chapter pill in italic Garamond. No buttons or icons.
- **Body:** the reader's justified EB Garamond page, with the highlight in the reader's gold highlight colour.
- **Surrounding text, always:** the page starts a sentence or two before the highlight (with "…" if it begins mid-paragraph) and simply runs on until the page ends. If there isn't room for much context, that's fine; text is never shrunk to make more fit.
- **Footer:** where the reader shows page progress, the image shows "Read free at tinct.app" (or nothing, if the toggle is off).

| | Phone | Desktop, short highlight | Desktop, long highlight |
|---|---|---|---|
| Shape | 4:5, 1080 × 1350 | 16:10, 1600 × 1000 | 16:10, 1600 × 1000 |
| Layout | The phone reader page | One reader page, centred | **Both pages of the spread**, with the fold, the text flowing across exactly as in the reader, and page numbers |

The desktop image switches to the two-page spread when the highlight doesn't fit on one page.

A highlight longer than the space available (a full spread on desktop, one page on phone) is cut at a sentence boundary with "…". The text is never changed and never shrunk below the reader's own size.

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
- Desktop uses the two-page spread when the highlight doesn't fit one page; over-long highlights are cut at a sentence with an ellipsis, without changing or shrinking the text.
- The edition credit is correct for all three edition types.
- A shared link unfurls with the preview image on X, Reddit and iMessage, and opens the exact passage, signed out or in.
- No user identity appears in the public link or image.
