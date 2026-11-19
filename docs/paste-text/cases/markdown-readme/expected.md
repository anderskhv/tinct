---
title: marginalia
author: ''
language: en
source: synthetic (GitHub README, raw Markdown with inline HTML)
sections: 1
words: 81
---

## marginalia

> Export your e-reader highlights and margin notes to plain Markdown. 📚✍️

### ✨ Features

- Reads Kindle `My Clippings.txt`, Kobo `KoboReader.sqlite` and EPUB annotations
- Groups notes **by book and chapter**
- Never uploads anything — runs entirely offline

### Install

```bash
npm install -g marginalia
```

### Usage

```bash
marginalia export --from kobo --out ~/notes
```

Output looks like this:

```markdown
## Middlemarch — Chapter 20
> that roar which lies on the other side of silence
- note: why does she cry *here*?
```

> **Warning**
> Kobo databases are locked while the device is mounted read-only. Copy the file first.

### Configuration

| Option | Default | Meaning |
|---|---|---|
| `--from` | `kindle` | Source format |
| `--out` | `./notes` | Output folder |
| `--group` | `chapter` | `book` or `chapter` |

### Contributing

PRs welcome! See CONTRIBUTING.md and please run `npm test` first.
