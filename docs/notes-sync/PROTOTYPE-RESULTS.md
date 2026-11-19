# Linked notes folder: retrieval prototype (21 October 2026)

A throwaway test of the retrieval in [`LINKED-FOLDER.md`](LINKED-FOLDER.md). Nothing in `app/` was touched. The code lives in the session scratchpad (`notes-proto/`): about 150 lines of dependency-free JS in `notes-search.mjs`, plus a vault generator, the questions, the evaluation and a scaling test.

## Method

- **Walk:** `.md` files only. Dot-folders are skipped, and so are the excluded folders `Private/` and `Daily/`.
- **Parse:** tags (front matter and `#inline`), `[[links]]`, title and headings.
- **Chunks:** text packed by paragraph within heading sections, about 800 characters each, every chunk carrying its heading.
- **Ranking:** BM25 with field weights title ×3, tags ×2, heading ×1.5 and links ×1.5. Light stemming. At most one chunk per note, top 3.
- **Payload limits:** 1,200 characters per passage, 2,400 in total.

## Variants

| Variant | Query | Threshold rule |
|---|---|---|
| A (concept as written) | Flat: question + book title + author + selection | Minimum on the total score |
| A0 | As A, without field boosts | As A |
| B (gated) | Weighted: question 1, selection 0.5, title/author 0.35 | Only question and selection terms count toward it, so the book name can reorder notes but never attach one alone |
| C | As B, with 400-character chunks | As B |
| E | As B | B's rule, plus ≥2 distinct question/selection terms matched, and the score normalised by the question's idf mass so it does not drift with vault size |
| E0 | As E, without boosts | As E |

## Vault

237 `.md` files:

- **Hidden folders:** `.obsidian/`, `.trash/` and `.git/`, seeded with matching words to catch leaks.
- **Excluded folders:** 95 `Daily/2026` notes and 4 `Private/` notes. These deliberately match three of the questions.
- **Work:** 40 meeting notes, including "Project Odyssey" and PRINCE2.
- **Reading and ideas:** about 60 notes on the 10 books and on Stoicism, praemeditatio, free will, utilitarianism, Romanticism, attention and habits.
- **Highlights:** Kindle and Readwise exports.
- **Danish:** 3 notes.
- **Distractors:** Prince the musician, a Honda Odyssey, free software, attention metrics in advertising, a garden pond, whale watching.

**133 notes indexed** (48 KB of text, 260 chunks).

## Questions

29 questions, 9 with a selected passage:

- **21 should attach notes.** Each has its right notes listed, plus "acceptable" notes that count as neutral.
- **8 should attach nothing:** Hamlet's "Prince", Eurycleia, the Bennet daughters, Fedallah, Jane Eyre, Justine, mercenaries and Razumikhin.

## Results

The 5k column is the same questions with 4,870 synthetic notes added (5,003 notes in all).

| Variant | P@3 | Recall | Hit@3 | Attached something when none expected | Attached a wrong note when none expected | Leaks | 5k: P@3 / wrong attaches |
|---|---|---|---|---|---|---|---|
| A, min 7 | 0.76 | 0.89 | 95% | 6/8 | 4/8 | 0 | n/a |
| A0, min 12 | 0.92 | 0.75 | 86% | 4/8 | 1/8 | 0 | n/a |
| B, min 6 | 0.96 | 0.78 | 90% | 3/8 | 2/8 | 0 | 0.69 / **7/8** |
| C, min 6 | 0.93 | 0.80 | 90% | 3/8 | 2/8 | 0 | n/a |
| **E, 0.3** | **0.93** | **0.83** | **95%** | **0/8** | **0/8** | **0** | **0.80 / 0/8** |
| E0, 0.3 | 0.93 | 0.83 | 95% | 0/8 | 0/8 | 0 | n/a |

- **No leaks:** nothing from `Private/`, `Daily/` or a dot-folder was ever indexed. With exclusions off, `Private/` notes were attached 2 to 6 times, so the exclusion does real work.
- **A cannot return "nothing":** the book title in the query always matches the book's own note.
- **Absolute thresholds drift:** at 5k notes, a single rare word ("delay", "living") scores about 10, so B's false attaches rose to 7/8. The 2-term rule fixes this.
- **Boosts and chunk size:** boosts were neutral under E. 400-character chunks were slightly worse.

**Speed and size:**

| Vault | Read | Index | Query | Stored index |
|---|---|---|---|---|
| 133 notes | 10 ms | 19 ms | 0.1 ms | 159 KB |
| 5,000 notes (8.8 MB) | 87 ms | 1.2 s | 16 ms (linear scan) | 23 MB as JSON; an inverted index would roughly halve it |

These are Node timings. Reading through the browser's File System Access API will be slower.

## Failures (E)

- **Q3 "things 'up to us'":** "up" and "us" are stopwords, and the note calls it the *dichotomy of control*. It found Epictetus but missed the main note. This is a paraphrase gap.
- **Q17 "suitors punished":** the note says "punishment" and the light stemmer does not join the two, so nothing was attached. A Porter stemmer fixes this.
- **Q20 "cultivate our garden":** attached `Recipes/Garden salad.md`. Right word, wrong sense.
- **Q18:** sent a Readwise `## Metadata` block as a passage. That boilerplate should be stripped.
- **Danish notes were never retrieved**, because "Dostojevskij" does not match "Dostoevsky".
- **Prince, Odyssey and PRINCE2 distractors never got through E.**

## Worked payloads (E)

`notes: [{ path, text }]`, each text starting with "Title › Heading".

| Question | Passages sent | Characters | Tokens |
|---|---|---|---|
| Q1 *Meditations* (selection 2.1): why expect the worst from people each morning? | `Marcus Aurelius.md › The morning passage`, `Meditations (Kindle).md`, `Praemeditatio malorum.md › Versions` | 1,442 | ~361 |
| Q5 *Crime and Punishment* (selection "Kill her, take her money…"): is the argument utilitarian? | `Crime and Punishment (Kindle).md` (includes the note "utilitarian calculus, Bentham"), `Crime and Punishment.md › The utilitarian justification`, `Utilitarianism.md › In literature` | 1,329 | ~332 |
| Q18 *Walden* (selection "Simplify, simplify"): would Thoreau mind smartphones? | `Walden.md › Where I Lived…`, `Walden (Readwise).md › Metadata` (wasted), `Attention.md › Threads` | 1,049 | ~262 |

The largest payload across all 29 questions was 1,442 characters, and the largest single passage was 756.

## Recommended settings

- **Chunks:** about 800 characters, paragraph-packed within a heading. Strip front matter and highlight-export metadata.
- **Query:** question 1, selection 0.5, title and author 0.35. **Only question and selection terms count toward the threshold.**
- **Attach a chunk only if:**
  - it matches at least 2 distinct question or selection terms;
  - its score divided by the question's idf mass is at least 0.3.
- **Cap:** 1 chunk per note, top 3, 1,200 characters each and 2,400 in total.
- **Boosts:** keep the current ones (title ×3, tags ×2). They are cheap, and harmless here.
- **Matching:** a Porter stemmer, and an inverted index for large vaults.

## Verdict

**Local keyword search is good enough for v1, but only with the gating above.** With it, a right note was attached for 95% of the questions that should have one, nothing was attached for the 8 that should get nothing, and there were no leaks, at both 133 and 5,000 notes. The concept's literal design (a flat query with a minimum score) attaches the book note to almost every question and breaks down at scale.

Embeddings would fix paraphrase and cross-language misses. In the browser, though, they would cost a model download of tens of megabytes, or uploading notes to an API, which breaks "notes stay on the computer". They are not needed now.

**Caveats:** I wrote both the vault and the questions, the threshold was tuned on these same 29 questions, and the 5k noise is synthetic. Before building, run `eval.mjs` locally on one real vault.
