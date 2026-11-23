# essay-longform-pullquote — notes

Synthetic magazine long-read (New Yorker / Atlantic style markup). The real `essay-aeon` and `news-guardian-review` cases cover the same rules on live markup.

Rules tested:

- R23 Drop caps: `<span class="dropcap" aria-hidden="true">T</span><span class="visually-hidden">T</span>he` must become "The", not "TThe" and not "T he". When a drop-cap letter is duplicated for screen readers, keep exactly one copy. (The generic "drop `aria-hidden`" rule would leave "The" from the visually-hidden copy; the generic "drop visually-hidden" rule would leave "The" from the drop cap; applying both deletes the letter. The cleaner must treat the pair as one unit.)
- R15 Pull quotes dropped: `aside.PullQuote`. The first one is an exact repeat of a sentence later in the body; the second is a paraphrase ("Inside the cover there were nine dates. Under them, a single word: Again.") that is not an exact substring — it is dropped because of its container class, not by text matching. Open question Q3 covers pull quotes with no class.
- R19/R33 Section-break ornaments (`✦ ✦ ✦`, `* * *`, `⁂`, `§`, a `<hr>`) → one `* * *` scene break.
- R05 Rubric "A Reporter at Large" above the h1 dropped; dek → `subtitle`.
- R06 Byline "By Ruth Adeyemi" → author; `<time>` → date.
- R07 Social icons with only `aria-label` and "Save this story" dropped.
- R08 "Advertisement" dropped.
- R09 "Read more: …" related link block dropped.
- R11 Print-edition line ("Published in the print edition of …"), contributor bio, newsletter sign-up, "Most Popular" list dropped. The bio repeats the author's name and links to the contributor page: rule = trailing block that starts with the author's name and "is a …".
- R20 Lede image kept; caption keeps `Caption__text`, drops `Caption__credit` ("Illustration by …").
