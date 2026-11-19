# substack-subscribe-widgets — notes

Synthetic, modelled on Substack's post markup (`data-component-name` widgets). Complements the real `substack-acx` case, whose clipboard has no inline subscribe boxes.

Rules tested:

- R10 Drop `SubscribeWidgetToDOM` / `.subscription-widget*` (preamble "…consider becoming a free or paid subscriber", e-mail input, "Subscribe").
- R10 Drop `CaptionedButtonToDOM` share box ("Thanks for reading Quiet Shelf! This post is public so feel free to share it." + "Share"). The caption text alone, without the widget class, must also be caught by the text rule (`/^Thanks for reading .+[!.]/` + subscribe/share).
- R09 Drop `p.button-wrapper` ("Leave a comment") — a paragraph whose only content is one button-styled link.
- R10/R11 Drop the subscribe footer (title "Subscribe to Quiet Shelf", "Launched 2 years ago", ToS small print) and the like/restack counts.
- R07 Drop the post UFI row (like count, comment count, Share) in the header.
- R17 Heading anchors: the `<button aria-label="Link">` inside each `<h2>` contributes no text; heading text is "Dorothea in the Vatican".
- R22 Footnote anchors (`a.footnote-anchor`, digits, `href="#footnote-n"`) removed from the text with no stray space before the full stop. Footnote bodies (`div.footnote`) collected under `### Notes` as `[n] …`; a note's second paragraph stays a separate paragraph right after it.
- R16 List items wrapping `<p>` stay single items (no empty paragraphs).
- R05 `h3.subtitle` → `subtitle` (a value with a colon is quoted in the front matter).
- R30 One section; h2s become subheadings.
