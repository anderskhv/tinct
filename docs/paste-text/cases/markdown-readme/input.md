<p align="center">
  <img src="https://raw.githubusercontent.com/example/marginalia/main/docs/logo.svg" width="120" alt="marginalia logo">
</p>

<h1 align="center">marginalia</h1>

<p align="center">
  <a href="https://github.com/example/marginalia/actions"><img src="https://github.com/example/marginalia/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/marginalia"><img src="https://img.shields.io/npm/v/marginalia.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

> Export your e-reader highlights and margin notes to plain Markdown. 📚✍️

## Table of contents

- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)

## ✨ Features

* Reads Kindle `My Clippings.txt`, Kobo `KoboReader.sqlite` and EPUB annotations
* Groups notes **by book and chapter**
* Never uploads anything — runs entirely offline

## Install

```bash
npm install -g marginalia
```

## Usage

```bash
marginalia export --from kobo --out ~/notes
```

Output looks like this:

```markdown
## Middlemarch — Chapter 20
> that roar which lies on the other side of silence
- note: why does she cry *here*?
```

> [!WARNING]
> Kobo databases are locked while the device is mounted read-only. Copy the file first.

## Configuration

| Option | Default | Meaning |
|--------|---------|---------|
| `--from` | `kindle` | Source format |
| `--out` | `./notes` | Output folder |
| `--group` | `chapter` | `book` or `chapter` |

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) and please run `npm test` first.

---

<sub>Made with ☕ by [@inesv](https://github.com/inesv) · [MIT](LICENSE)</sub>
