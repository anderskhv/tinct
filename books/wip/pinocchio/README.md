# Pinocchio: content package for integration

Staged 10 Nov 2026 by Claude from Anders's upload `pinocchio-full-2026-11-09.zip`
(sha256 `bc6811d668eb8497739b85eb4c7f28dc8133d791a6bfaf369069b77666875a8e`), prepared by Codex on 9 Nov 2026.
Instruction revision: `books/BOOK-TASK-WORKFLOW.md` on main at `9360a313ea`. Owned path: `books/wip/pinocchio/` only.

**Status: content handed off, not integrated, not published.**

## What is here

- `editions/`: Tinct edition objects (`{chapters: [{number, title, paragraphs}], sections: []}`), unchanged from the package.

  | Edition | sha256 |
  |---|---|
  | `pinocchio-original-it.json` (Collodi's Italian, 1902 Bemporad text) | `74e62151dd56065747527de41732775a549f0e10edc165ba6b4eb81845555e5e` |
  | `pinocchio-modern-en.json` (a fresh English translation from the Italian) | `14bb4f79ffee1ae4a2a7909fd7cd957f46e252d8a86a7052d73566b5c8da92bd` |
  | `pinocchio-modern-da.json` (a fresh Danish translation from the Italian; Danish authorised by Anders) | `6f6a55322652908aff41fb9b084818dc7db801b40635fa46e5f1738e2d6a80b1` |

- `illustrations/`: three original illustrations, with `illustrations.json` giving their placements (1-based chapter, 0-based `afterParagraphIndex`). They are shared by both translations:
  - ch 1 after p 8;
  - ch 23 after p 26;
  - ch 35 after p 5, which is after the reveal ("So you really are my dear Pinocchio?"), so the reunion is not shown early.
- `provenance/source-it.txt`: the Project Gutenberg #52484 download, with its notice. Collodi died in 1890: public domain in the EU, Denmark and the US.
- `package/`: Codex's READ-ME, validation and counts, the plain-text copies, and the per-chapter files. The EPUB and HTML reading copies and preview images were left out: they duplicate the editions and embed the images.

## Checks (Claude, 10 Nov 2026)

- Chapters 1–36 appear in all three editions, in order.
- The paragraph count is equal per chapter across it/en/da: 1,754 paragraphs each.
- There are no empty paragraphs.
- All three illustration indexes fall inside their chapter, after the event they show.

## Editorial issues: reported, not fixed

1. **Mixed apostrophes in the English.** It has 352 straight `'` and 648 curly `’`, for example ch 35 p 5, "aren't". Danish has 1 straight against 34 curly; the Italian is straight throughout, as in the source. A typographic normalisation (straight to curly, outside quotes) needs Anders's OK, because it changes the text.
2. **Reader-age wording.** Codex's brief says "vocabulary accessible to a reader around 11". Per Anders, the book must **not** be labelled by age ("age 9+", "child-safe") anywhere in Tinct. This wording stays internal.
3. **Illustrations are AI-generated** (Codex's built-in image tool), not historical. A credit or acknowledgement line needs a decision at integration.
4. **No human English Compare edition.** Codex notes that a separately cleared human English translation would be the usual Compare partner. The Italian can serve as the original/Compare edition.

## Integration requirements (separate, assigned step)

- Registry entry, with the edition order Original (it) · Modern English · Modern Danish. The default edition is decided by `books/README.md`.
- Edition data in the runtime paths, illustrations converted to the reader's figure format, and figure placements wired.
- A reviewed introduction with an `author` block (Collodi: name, years, occupation, biography), a primer, characters, and a painted cover in the series style (`make-book-cover.mjs`, ~$0.04 per painting). Show Anders the cover.
- **Narration:** check eligibility (Danish streams via Grok, `language da`; English as other modern editions). Generate no audio.
- Visual QA page by page, phone and desktop, every edition, before publishing.
- No age labels anywhere.
