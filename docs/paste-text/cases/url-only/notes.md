# url-only — notes

The clipboard holds only a URL (`text/plain`, and on some platforms also `text/uri-list`). Typical after "Copy link" on a phone.

Rules tested:

- R32b URL-only detection: after trimming, the whole paste is one token matching `^https?://\S+$` (or several URLs, one per line, nothing else). No book is created. Expected output is a refusal record instead of a book, with a one-line explanation and a pointer to Add a book (this particular URL is a Gutenberg ebook that Add a book's catalogue already has: Pride and Prejudice).
- Not done here: fetching the page server-side. That is a different feature (privacy, paywalls, robots, copyright) — open question Q2.
- A URL inside other text is ordinary text (see `twitter-thread`).
