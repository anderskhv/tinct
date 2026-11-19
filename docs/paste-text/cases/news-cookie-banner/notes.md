# news-cookie-banner — notes

Synthetic local-news page, copied with a drag from above the cookie bar to the footer (the bar is fixed to the viewport, so a long drag selection picks it up).

Rules tested (see ../../RULES.md):

- R04 Drop a consent/cookie region: ids/classes `onetrust`, `cookie`, `consent`, `gdpr`; `role="region"` with `aria-label` containing "cookie"; text "We value your privacy", "Accept all cookies".
- R03 Drop `<header class="site-header">`, `<nav>`, breadcrumbs, `<footer>`, `<form>`, `<button>`.
- R05 Title from the article `<h1>`; the kicker ("Local news") above it is dropped; the standfirst directly under the h1 becomes `subtitle`, not body text.
- R06 Byline → `author` ("By Mara Lindqvist, Transport reporter" → `Mara Lindqvist`; job title dropped); `<time datetime>` → `date`; "Updated 09:40" dropped.
- R07 Share bar ("Share on Facebook", "Copy link", "Email") dropped.
- R08 Ad slot with only the label "Advertisement" dropped.
- R09 "Read more:" inline promo paragraph (bold lead-in + one internal link) dropped.
- R10 Newsletter sign-up box (heading + form) dropped even though it holds an `<h3>`.
- R11 Topic tags, "Related stories", comments section dropped (everything after the article body that is a list of links to the same site).
- R20 Lead image kept as a figure; caption keeps its text but the `.credit` span ("Photograph: …") is removed; emphasis inside a caption is dropped (captions are plain strings in `ChapterFigure.caption`).
- R14 `<i>`/`<em>` → `_…_` emphasis; external link to another domain kept as a link.
- R15 `<blockquote>` kept as a quote paragraph.
- R30 Short paste (< 2,500 words): one section titled with the document title; the `<h2>` becomes a subheading.
