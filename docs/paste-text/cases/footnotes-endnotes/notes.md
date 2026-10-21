# footnotes-endnotes — notes

Synthetic blog post with three note systems in one paste.

Rules tested:

- R22a Calls removed from the running text: `sup[role=doc-noteref]`, `a.footnote`, `a[href^="#fn"]`, bracketed `[<a href="#endnote-3">3</a>]` inside `<sup>` (the brackets go with it), with no space left before the following punctuation.
- R22b The same note called twice (`fnref:2` and `fnref:2:1`) appears once in Notes.
- R22c Note bodies: `role=doc-endnotes` / `.footnotes` list, and a manual "Endnotes" heading followed by `[n]` paragraphs, are both collected; the "Endnotes" heading itself disappears (it is replaced by the single `### Notes`).
- R22d Backlinks removed: `↩`, `↩²`, `[back]`, `role=doc-backlink`.
- R22e Sidenote (Tufte CSS: `label.sidenote-number` + `input.margin-toggle` + `span.sidenote` inline in the paragraph) is lifted out of the paragraph into Notes; without this rule its sentence is glued into the body ("Not everyone agrees.My own mother…").
- R22f Notes are renumbered 1…n in order of first call (the sidenote is the third call, so it becomes [3]; the manual endnote "[3]" becomes [4]). Open question Q1: keep the source numbering instead?
- R22g A note with two paragraphs keeps both; links in notes kept.
- R06 `p.post-meta` with `<time>` and `.p-author` → metadata.
