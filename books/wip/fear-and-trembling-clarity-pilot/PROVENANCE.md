# Source provenance: Fear and Trembling English text

**Date:** 2026-09-24. **Status:** finding established. Two decisions for Anders
remain open (listed at the end).

## Finding

**The served English "original" (`original-en`, labelled "Original (English)"
in the reader) is not any published English translation. It is a 2026 AI
translation from the Danish. It is not a public-domain source and does not
meet the project's public-domain source requirement.**

**No complete English translation of *Fear and Trembling* is in the public
domain in the United States.** The only clean public-domain source for the
whole work is Kierkegaard's Danish. This pilot therefore uses the Danish
3rd edition (Reitzel/Grøn, Copenhagen 1895) as its established source. See
`source/SOURCE-NOTES.md`.

## Evidence

### 1. What the repository record shows (primary, verified in git)

| File | Added in | Commit message (quoted) | Changed since? |
|---|---|---|---|
| `fear-and-trembling-original-da.json` | `ae1b7cb58`, 2026-04-25 | "First Tinct book with Danish as the source language and no PD English translation bridge … original-da: Kierkegaard 1843, 'Frygt og Bæven' (3rd-edition reprint, IA scan)" | No (blob `ecbd80a3`) |
| `fear-and-trembling-modern-en.json` | `ae1b7cb58`, 2026-04-25 | "modern-en: Opus translation directly from Danish" | No (blob `f00ab3d7`, sha256 `152776f1…`) |
| `fear-and-trembling-original-en.json` | `b76fa5649`, 2026-05-04 | "Formal/period English translation of Frygt og Bæven, generated from the 1843 Danish source in a Lowrie/Hannay-adjacent register … No PD historical translation exists for this work (Lowrie 1941, Hannay 1985, Hong 1983 all in copyright), so original-en is freshly authored. Co-Authored-By: Claude Opus 4.7" | No (blob `2f56f993`, sha256 `d6f7ab72…`) |

The registry entry (`app/src/data/bookRegistry.ts`, `fear-and-trembling`) gives
`original-en` the label "Original (English)" with no translator credit.

The provenance is therefore known and documented. The file is a Tinct AI
translation made ten days after the Danish was added. The earlier staging
branch (`claude/fear-and-trembling-modern-en-20260911`,
`PROVENANCE.md`) reached the same conclusion from the git record and rated the
rights question "UNCERTAIN". The evidence below settles the questions that were
still open: whether it corresponds to any published edition, and whether any
public-domain alternative exists.

### 2. Comparison with verifiable editions

Full texts were compared for Lowrie (1941 text, Anchor 1954 printing) and Hong
& Hong (1983), both archive.org OCR. Passage-level wording was compared for
Hannay 1985 and Hollander 1923. Seven representative passages were checked
word by word:

- the Preface "Marqueur" sentence;
- the Problema I opening;
- "Faith is precisely this paradox";
- "The difference between the tragic hero and Abraham";
- "Why then does Abraham do it";
- the Problema II opening;
- Luke 14:26 and the "kept in tension" passage.

| Passage | Served `original-en` | Nearest published wording | Judgment |
|---|---|---|---|
| Preface, *Marqueur* | "Every speculative score-keeper, who conscientiously points up…" | Hannay: "Every speculative score-keeper who conscientiously marks up…". Lowrie has "price-fixer", Hong "monitor", Hollander "waiter with a speculative turn". | Independent structure, but shares one distinctive coinage with Hannay |
| Problema I opening | "It reposes immanent in itself, hath nothing without it which is its τέλος … abolish his singularity … spiritual trial" | Lowrie: "reposes immanently … nothing without itself … abolish his particularity". Hong: "rests immanent in itself … annul his singularity … spiritual trial" | A blend of Lowrie and Hong diction; no single source |
| "Faith is precisely this paradox" | "…is justified over against it … inaccessible to thought … too prolix" | Lowrie: "justified over against it … inaccessible to thought … too prolix". Hong: "single individual as the single individual … bear … in mente" | Clause-level borrowing from both |
| Tragic hero vs Abraham | "remaineth still within the ethical … a feeling that hath its dialectic" | Lowrie: "still remains … reduces". Hong: "to a feeling that has its dialectic" | Composite |
| "Why then does Abraham do it" | "…the ethical itself, which would hold him back from doing God's will" | Hong has the same 27-word run | Near-verbatim fragment (Hong) |
| Problema II opening | "…in turn, the divine … an impotent thought; His power is only in the ethical, which fills out existence" | Hong: "an impotent thought, his power is only in the ethical, which fills…" | Opening independent; 16-word Hong run later |
| Luke 14:26 | KJV-style verse with "his own soul" | Lowrie and Hong both have "life" | Largely independent (the shared wording comes from the Bible) |

Whole-text 8-word overlap:

| Pair | Share of 8-word sequences |
|---|---|
| Lowrie vs Hong (two human translations) | 5.0% |
| `original-en` vs Lowrie | 7.3% |
| `original-en` vs Hong | 5.8% |
| `modern-en` vs Lowrie | 9.9% |
| `modern-en` vs Hong | 10.3% |

Terminology counts:

| Term | `original-en` | Hong | Lowrie |
|---|---|---|---|
| "single individual" | 108 | 94 | 0 |
| "spiritual trial" | 20 | 21 | 0 |

The commit message claims a "Lowrie/Hannay-adjacent register". In fact the
archaic "hath/doth" layer is applied unevenly:

| Chapter | "hath/doth" count |
|---|---|
| Preface | 0 |
| Exordium | 0 |
| Eulogy | 0 |
| Preliminary Expectoration | 64 |
| Problema I | 47 |
| Problema II | 0 |
| Problema III | 168 |
| Epilogue | 16 |

**Conclusion.** Neither served English file corresponds to any edition. They
contain no verbatim paragraphs from a published translation outside quoted
matter. They do carry recognizable phrasing from copyrighted translations, and
`modern-en` carries more than `original-en`. This pattern fits model output
shaped by memorized translations. It does not fit transcription of a book.
Payne 1939 and Walsh 2006 could not be compared, because no text was
reachable, so echoes of those cannot be ruled out.

**Uncertainty.** This is a similarity finding, not a legal opinion. Whether any
passage crosses from influence into reproduction of protected expression is a
legal question. The measured overlap is above the level that two independent
human translations share.

### 3. Copyright status of the published translations

| Translation | Status | Evidence |
|---|---|---|
| Hollander 1923, *Selections* (about a third of the book; **no Problemata**) | Public domain in the US; in copyright in the EU until the end of 2042 | Published 1923; Wikisource PD-US |
| Payne 1939, Oxford UP, London/New York | In copyright | HathiTrust rights `ic` (LCCN 39023889). No renewal was found in the 1966–67 CCE by OCR search. As a UK-first publication it was most likely restored under the URAA, which would protect it through 2034. |
| **Lowrie 1941, Princeton UP** | **In copyright; renewed** | CCE 1969 renewal: "Fear and trembling; a dialectical lyric. Translation, introd. & notes by Walter Lowrie … © 10Dec41; A160177. Howard Johnson (E of W. Lowrie); 26Mar69; R458284." (archive.org `catalogofcop196932312libr`). US copyright runs through 2036. |
| Hong & Hong 1983; Hannay 1985; Walsh 2006; Kirmmse 2023 | In copyright | — |

The Stanford renewal database and HathiTrust full-text search could not be
reached (both blocked by bot challenges), so the Payne result rests on OCR
search of the printed catalogs. The Lowrie result does not: the renewal entry
itself was found.

### 4. The source actually used

The source is the Danish 3rd edition, Reitzel/Grøn, Copenhagen 1895: *Udvalgte
Skrifter* I (the title page is in `books/raw/fear-and-trembling/raw.txt`). It is
public domain everywhere. `books/raw/fear-and-trembling/SOURCE.md` calls the
scan a "1980 reprint"; that is a misreading, and the title page says 1895.
Collation against the raw OCR found three losses in the served Danish for these
sections: one dropped word and two omitted footnotes. The pilot restores all
three (`source/SOURCE-NOTES.md`).

## Source options and the decisions needed

| Option | Coverage | Status | Notes |
|---|---|---|---|
| **A. Danish 1843/1895 as the sole source; English editions are Tinct translations** | Whole work | PD worldwide | Used by this pilot. It needs an explicit independence check (`review/independence-check.md`), because drafting from Danish did not by itself prevent memorized phrasing. |
| B. Hollander 1923 as a historical English edition | About a third of the book; no Problemata | PD in the US only | Cannot serve as a complete baseline |
| C. Lowrie 1941 or Payne 1939 | Whole work | In copyright (through 2036 / most likely 2034) | Not usable without a licence |
| D. License a modern translation | Whole work | Copyright | A cost and permissions decision |

**Decision 1: the `original-en` edition.** The project rule (`books/AGENTS.md`)
asks for a public-domain human English translation for non-English originals.
None exists for this work, so the rule cannot be met. Anders needs to choose one
of the following:

- (a) Record a documented exception for *Fear and Trembling*. The book ships
  with `original-da` as the original and a Tinct `modern-en`, and `original-en`
  is either removed or relabelled as a Tinct translation. "Original (English)"
  misstates what the file is.
- (b) Keep the book out of the complete-package standard until a
  public-domain translation exists (Payne most likely 2035, Lowrie 2037).
- (c) License a translation.

**Decision 2: the served English text in the meantime.** Both served English
files share measurable phrasing with Hong and Lowrie (see §2). Anders needs to
decide whether to replace them section by section, using this pilot's method
(Danish source, independence check, independent review), or whether to leave
them live while that work proceeds.

This pilot does not change any live edition. Nothing is published or
registered.
