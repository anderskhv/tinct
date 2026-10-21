# news-bbc — notes

Real BBC News article (third-party, copyrighted): only an excerpt of the expected output is committed; the simulated clipboard HTML is in the scratchpad corpus (`paste-corpus/news-bbc/input.html`, the article's `<article>` element as a drag selection from headline to tags would copy it).

Rules tested:

- R05 Title from the headline block (a `<div data-component="headline-block">` holding the h1).
- R06 Byline block → author "Ed Thomas, Rebecca Wearn and Patrick Clahane": names come from separate spans with no spaces between them ("Ed Thomas,UK editor,Rebecca WearnandPatrick Clahane" in naive text extraction), job titles ("UK editor") dropped; relative time "7 hours ago" dropped.
- R07 "Share", "Save", "Add as preferred on Google" dropped.
- R20g Video blocks (player `div` + "Play video" button + figcaption) dropped **with** their captions ("Lawyer Mohammad Alias Yousaf advised how…", "Watch: Business owners facing fines…"); a caption without a picture is not text.
- R20a Image blocks: a grey placeholder `<img>` (`grey-placeholder.png`, `aria-label="image unavailable"`) precedes the real `<img>` — skip placeholders; caption from `figcaption`, the credit prefix ("Facebook", "Phill Edwards / BBC") dropped.
- R09 "Watch the full film of Ed Thomas's investigation here" (a list with one promo link) dropped.
- R10/R11 Newsletter promo image + "Get our flagship newsletter… Sign up here." and the topic tag list at the end dropped.
- R14 Italic "Additional reporting by …" kept as the last paragraph (it is part of the article, not chrome).
- R30 1,500 words: one section; the two `<h2>` crossheads ("Unpaid fines", "'I'm not the owner of the shop'") become subheadings.
