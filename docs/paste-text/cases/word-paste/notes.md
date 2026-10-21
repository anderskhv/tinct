# word-paste — notes

Synthetic minutes in the exact shape Word 365 for Windows writes as `text/html` (CF_HTML fragment inside a full document with `<style>`, conditional comments and `mso-` styles).

Rules tested:

- R02/R03 Ignore everything outside `<!--StartFragment-->…<!--EndFragment-->` when the markers exist (head, `<style>` with `@font-face`, `<!--[if gte mso 9]><xml>…`).
- R16a Fake list items: `p.MsoListParagraph*` with `mso-list:lN levelM` → list items. The bullet glyph ("·" in Symbol font, or "1.") sits inside a downlevel-revealed conditional `<![if !supportLists]>…<![endif]>` followed by `&nbsp;` padding. An HTML parser keeps that text, so the cleaner must remove the `mso-list:Ignore` span and use the glyph only to choose bullet vs number. Same list id (`l0`) = same list; `l1` starts a new numbered list.
- R22a Word footnotes: the call (`a[style*=mso-footnote-id]`, "[1]") is removed; `div[style*=mso-element:footnote]` bodies become `### Notes` `[1] …`; the `<hr>` and `<br clear=all>` before them go.
- R14 `<i style='mso-bidi-font-style:normal'>` is still italic (the `mso-bidi-` property applies to right-to-left runs only); `<b style='mso-bidi-font-weight:normal'>` is still bold.
- R05 `p.MsoTitle` → title; the italic line right after it → subtitle (italic-only short paragraph under the title).
- R31 Date from the subtitle ("7 October 2026") — a date in the first lines after the title. Author unknown: empty.
- R17 `<h1>` with "1." + `mso-spacerun` spaces → heading "1. Book donations" (runs of spaces collapse to one).
- R33 `<o:p>`, `<o:p>&nbsp;</o:p>` empty paragraphs, `span.SpellE` (spell-check marks) unwrap/drop; source line breaks inside a `<p>` are spaces, not `<br>`.
- R33 Right-aligned grey "Next meeting" line stays a normal paragraph (alignment and colour are not kept).
