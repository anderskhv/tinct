# Books — Preparation Workspace

Each book gets a subfolder here with everything needed to prepare it for Tinct.

## Workflow

1. **Download** source text from Project Gutenberg → `raw.txt`
2. **Parse** into edition JSON → `parse.cjs` generates `{bookId}-original-en.json`
3. **Review** chapter structure → `CHAPTERS.md` (editorial review)
4. **Generate editions** via CLI conversation (ZERO API spend):
   - `modern-en` — Modern English
   - `kids-en` — Kids English (ages 10-14)
   - `modern-da` — Moderne Dansk
   - `kids-da` — Dansk for Børn
5. **Generate threads** (character summaries per chapter) via CLI
6. **Register** in `bookRegistry.ts` and `useThreads.ts`
7. **Visual QA** — every edition, every chapter

## Status

| Book | Source | Parsed | Registered | modern-en | kids-en | modern-da | kids-da | Threads | QA |
|------|--------|--------|-----------|-----------|---------|-----------|---------|---------|-----|
| The Odyssey | done | done | done | done | done | done | done | done | done |
| Ulysses | done | done | done | done | done | done | done | done | done |
| War and Peace | done | done | done | pending | pending | pending | pending | skeleton | pending |
