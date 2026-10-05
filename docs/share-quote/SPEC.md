# Share a highlight as an image: spec

**Status:** proposed by the PM session on 5 October 2026. The mockup is approved for discussion; the build is not yet assigned. This document is a spec only; the coding agent builds it.
**Mockup:** Anders's private preview page "Tinct Quote Share" (claude.ai artifact). It shows the share sheet, the phone and desktop images, a long-quote example and the link previews.

## What the reader gets
From any highlight (or a fresh text selection), **Share** opens a small sheet:
- **Preview** of the image, shaped for the device: phone → portrait 4:5; desktop → landscape 16:10.
- **Edition:** the edition the reader was reading is preselected, and the reader can switch to the other edition. The same passage is mapped by paragraph alignment and the highlight range by text match; if the match fails, offer only the edition the highlight was made in.
- **Look:** Paper (light) or Night (dark), defaulting to the reader's current theme. E-ink readers get Paper.
- **Show surrounding lines** (default on): the sentences before and after the highlight, faded, so the image reads as a page of the book.
- **"Read free at tinct.app"** (default on): a small Tinct wordmark and tagline in the page footer.
- **Actions:**
  - Phone: **Share…** opens the system share sheet with the image file and the link.
  - Desktop: **Copy image**, **Download** and **Copy link**.

## The image
| | Phone | Desktop | Link preview (OG) |
|---|---|---|---|
| Size | 1080 × 1350 (4:5) | 1600 × 1000 (16:10) | 1200 × 630 (1.91:1) |
| Use | Reddit, Instagram and X feeds, iMessage | Laptop screen, landscape posts | Unfurls on Reddit, X, Slack, iMessage |

**Layout** (see the mockup):
- **Running head** in IBM Plex Mono caps: book title on the left, chapter on the right, with a hairline below.
- **Body** in EB Garamond: faded context, the highlight in the reader's gold highlight colour, then faded context. The text block is vertically centred.
- **Footer** with a hairline above:
  - Left: the citation. **Title** in Playfair Display, then author and edition credit.
  - Right: the optional wordmark and "Read free at tinct.app".
- **Colours** are the live reader's tokens: paper `#ece7db`, ink `#0b0b0b`, muted `#6a6256`, gold highlight `#f5e6c8`-family. Night uses the reader's dark tokens.
- **Fonts** are all SIL OFL licensed (EB Garamond, Playfair Display, IBM Plex Mono), so they're fine to embed in rendered images.

**Fitting the page:**
1. Start at a comfortable size for the format. Shrink in steps down to a floor (phone ≈ 34 px, desktop ≈ 28 px at full resolution) until the body fits.
2. Drop the surrounding lines before shrinking the highlight itself.
3. If the highlight alone exceeds about 600 characters at the floor size, trim at a sentence boundary with an ellipsis and tell the reader in the sheet ("Trimmed to fit, edit selection?").
4. Never cut mid-word, and never alter the text.

**Attribution (required on every image):**
- **Title, author, chapter or book label.**
- **Edition credit:**
  - **Tinct Modern E:** "Tinct Modern E".
  - **Original-language English text:** the year or source, e.g. "1818 text".
  - **Translation:** "tr. {translator}", e.g. "tr. George Long" for Meditations, taken from the book's source record.

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
- Phone and desktop images match the mockup in both looks, with and without the tagline and context lines.
- Long highlights shrink, then trim at a sentence with an ellipsis, without changing the text.
- The edition credit is correct for all three edition types.
- A shared link unfurls with the preview image on X, Reddit and iMessage, and opens the exact passage, signed out or in.
- No user identity appears in the public link or image.
