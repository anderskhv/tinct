---
title: Importing a library
author: ''
date: 2026-09-14
language: en
source: synthetic (Docusaurus documentation page)
sections: 1
words: ~170
---

## Importing a library

Shelfkeeper can import a library from a spreadsheet, another catalogue app, or a folder of e-books. This page covers all three.

> **Note**
> Imports never delete books that are already in your library.

### Before you start

Check that:

- you are signed in as the library owner;
- the file is one of:
  - CSV (UTF-8, comma or semicolon separated)
  - a Goodreads or StoryGraph export
  - a ZIP of EPUB files, at most 2 GB
- nobody else is editing the library.

### Steps

1. Open **Settings → Library → Import**.
2. Choose the source:
  a. **Spreadsheet** — map your columns to Title, Author, ISBN.
  b. **Another app** — pick it from the list.
  c. **E-books** — drop the ZIP file.
3. Review the preview. Rows with problems are marked:
  - ⚠️ _duplicate_ — already in your library
  - ❌ _unreadable_ — will be skipped
4. Press `Import`. You can keep working while it runs.

```bash
shelfkeeper import --file books.csv --dry-run
shelfkeeper import --file books.csv
```

### Column reference

**`title`**
Required. The book's title as it should appear on the shelf.

**`author`**
Optional. Several authors separated by `;`.

**`isbn`**
Optional. ISBN-10 or ISBN-13; used to find covers.
