# Moby-Dick: raw source record

| Item | Value |
|---|---|
| File | `books/raw/moby-dick/raw.txt (local only: `books/raw` is git-ignored by project policy; the committed evidence is `evidence/pg2701-lines-336-843.txt`)` |
| Origin | Project Gutenberg eBook #2701, https://www.gutenberg.org/cache/epub/2701/pg2701.txt, downloaded 2026-09-24 |
| Header check | `Title: Moby Dick; Or, The Whale` · `Author: Herman Melville` · `Release date: July 1, 2001 [eBook #2701]` |
| sha256 | `907420db6c4b68c70e2988cd2ad9c8cf79138667a01b63376d18dd17fef1a18b` |
| Rights | Public domain. Published 1851; Melville died 1891 |
| Relation to Tinct | `app/public/data/editions/moby-dick-original-en.json` (sha `30974242…`) matches this text word for word from Chapter 1 to the Epilogue, apart from chapter-heading tokens. The body was ingested from #2701 |
| Front matter | "Etymology" and "Extracts" are at lines 336–843. They were not ingested originally; they are restored in `books/wip/moby-dick-structural/` |

Independent witnesses used to adjudicate the front matter (evidence only; not ingested):
- Project Gutenberg eBook #15 (1991): https://www.gutenberg.org/cache/epub/15/pg15.txt, sha256 `cca79713fb2eb809daa7da6538018a0190a57d661b59f3a2b68ce4e137bbf8fc`
- Standard Ebooks (CC0), `standardebooks/herman-melville_moby-dick` at commit `013b51e2d9d6bb28b1d054bfc30beeeff4b85480`, files `src/epub/text/etymology.xhtml` and `extracts.xhtml` (copies in `books/wip/moby-dick-structural/evidence/`)

PG #15 evidence excerpt: `evidence/pg15-frontmatter-excerpt.txt` = pg15.txt lines 214–869 (the whole front matter), sha256 `58742eae81d594b515501a2f44bfe43d3171da3011ff3c5a38033b8091bfc4e3`.
