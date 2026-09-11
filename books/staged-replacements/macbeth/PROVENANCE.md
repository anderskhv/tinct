# Macbeth — provenance, source identification, and paragraph format

**Prepared:** 2026-09-11, content-only staging work. Nothing here is
published, merged, registered or deployed. All source texts were fetched
directly and read; nothing below is asserted from memory alone unless marked
as such.

## 1. What the served files are

`app/public/data/editions/macbeth-original-en.json`
(sha256 `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608`)
is registered in `app/src/data/bookRegistry.ts` under `id: 'macbeth'`. The
registry carries no translator/editor credit for this book (correct — it is
Shakespeare's own English, not a translation), so there is no attribution
error to fix here, unlike Meditations.

The served `macbeth-modern-en.json` being replaced by this package's work
has sha256
`0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1`. It is an
existing modernisation, complete (same 28×paragraph structure as
`original-en`, same stage-direction/speaker-label convention), already
readable — e.g. its Act 1 Scene 1 opens "FIRST WITCH. When will the three of
us meet again? In thunder, lightning, or in rain?" This package does not
assess or critique that existing edition; it is simply what
Act 1 Scene 1–2's candidates here are staged to replace.

`macbeth-modern-da.json`
(sha256 `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57`)
and `macbeth-threads.json`
(sha256 `1795b0e7b4765b697c56a7993ab6c4eee4bd8f481a9ae443aa69137da0655cb5`)
are out of scope (Danish; Cast/character data) and untouched.

## 2. Paragraph format of the served `original-en`

`macbeth-original-en.json` has the shape
`{"sections":[{"title","chapters":[N,...]}],"chapters":[{"number","title","paragraphs":[...]}]}`.
`sections` groups the 28 `chapters` into the five acts (Act 1 = chapters
1–7, Act 2 = 8–11, Act 3 = 12–17, Act 4 = 18–20, Act 5 = 21–28). Each
`chapters[i]` is one Shakespeare scene: 28 chapters total, 806 paragraphs,
16,520 words, verified by counting the parsed JSON directly.

Every paragraph is one of two kinds, confirmed by inspecting chapters 1 and
2 in full and spot-checking others:

- **A bracketed stage direction**, e.g. `[Thunder and Lightning. Enter three
  Witches.]`, `[Exeunt.]`, `[Enter Ross and Angus.]`. Already plain modern
  English; identical in `original-en` and the existing `modern-en` (checked
  directly for chapters 1–2).
- **One character's speech**, encoded as `SPEAKER NAME IN CAPS. ` followed
  by the full speech as a single run of prose — verse line breaks are
  already collapsed to plain spaces. The whole file was checked for the
  literal character `\n`: **none exists anywhere in `macbeth-original-en.json`**,
  confirming this is uniform across all 806 paragraphs, not just chapters
  1–2. A speech that in the printed play runs across several verse lines
  (e.g. the Soldier's report in Act 1 Scene 2) is therefore one paragraph,
  one continuous string, with no internal line-break markers to preserve. A
  scene change of speaker within one Folio-style block (rare; not present in
  chapters 1–2) would show as consecutive `SPEAKER.` paragraphs, one per
  speaker turn — this is how Act 1 Scene 2 already encodes Duncan, Malcolm,
  the Soldier, Lennox and Ross alternating.

This is the exact format a candidate paragraph must reproduce: the same
`SPEAKER. ` prefix verbatim (candidate speeches are never re-attributed or
re-split), stage directions copied character-for-character, and — because
the source itself carries no verse lineation — speeches rendered as ordinary
flowing modern prose sentences rather than any attempt at reconstructed line
breaks.

## 3. Source identification

The served `original-en` was compared paragraph-for-paragraph, for Act 1
Scenes 1 and 2 (chapters 1–2, 34 paragraphs), against two Project Gutenberg
texts fetched directly:

- **PG #1533**, standalone *Macbeth* (`https://www.gutenberg.org/cache/epub/1533/pg1533.txt`,
  fetched 2026-09-11, sha256 `1371a47e68246197f7f57017a83386fed75dbfebfd0ff51b4524921a3b38ff5e`).
- **PG #100**, the Moby Shakespeare complete works
  (`https://www.gutenberg.org/cache/epub/100/pg100.txt`, fetched 2026-09-11,
  sha256 `3cf4b3d44ee14cff4e14e78e2ad3318eff76f3f7f2afc3cee6bb925879110a37`),
  Macbeth extracted at lines 96022–100171 of that file
  (`Dramatis Personæ` through the final `[Flourish. Exeunt.]`).

Both PG texts are the same underlying edition (modernised spelling and
punctuation, not First Folio spelling): identical wording, spelling,
hyphenation, and curly-quote/apostrophe convention for Act 1 Scenes 1–2,
checked line by line. This is distinct from a third PG text also checked,
**PG #2264** (`https://www.gutenberg.org/cache/epub/2264/pg2264.txt`, fetched
2026-09-11), which preserves original First Folio spelling ("Actus Primus.
Scoena Prima.", "haue", "liue") — not a match, and not the served file's
source.

**Content match, chapters 1–2:** every word, in order, of the served
`original-en` chapters 1–2 matches PG #1533/#100, **except**:

- The scene 1 location heading. Served chapter 1 title is "Act 1, Scene 1 —
  A Desert Place"; PG #1533 and PG #100 both head the scene "SCENE I. An
  open Place." "A Desert Place" is a real, attested variant heading for this
  scene in other historical editions of the play (it does not appear to be
  invented by whatever process produced the served file), but it is not
  what PG #1533/#100 print. Every other scene heading in the served file's
  28 chapters matches PG #1533/#100 exactly, including the resolution of
  "The same." into the actual carried-forward location (e.g. served chapter
  6 "Before the Castle" for PG's "SCENE VI. The same. Before the Castle.").
  This was checked for all 28 scene headings, not just 1–2.
- **One line is missing.** In Act 1 Scene 2, after "[Exit Captain,
  attended.]" and "[Enter Ross and Angus.]", PG #1533/#100 print an
  unattributed line, "Who comes here?", before Malcolm's "The worthy Thane
  of Ross." The served `original-en` has no paragraph for this line, and the
  phrase does not appear anywhere else in the file (checked by full-text
  search). This is a genuine one-line omission from an otherwise complete
  transcription, not a different edition's deliberate cut — the line is
  editorially unassigned in the Folio (commonly given to Malcolm or left as
  a stage aside in modern editions) and its absence here looks like a
  transcription drop rather than an editorial choice, but this task cannot
  be certain which.

Both anomalies are noted for the record. Per this task's scope (draft
against the served `original-en` exactly as served, not stage a corrected
original), the chapter 1–2 candidates here align 1:1 to the served file as
it stands — 12 and 22 paragraphs respectively, matching the served chapter
titles verbatim, including "A Desert Place" — rather than importing PG's
"An open Place" or restoring the missing line. See "Needs Anders" in
`00-progress-ledger.md`.

## 4. Public domain status

Macbeth (c. 1606) and every English edition consulted (PG #1533, #100,
#2264) are public domain worldwide: Shakespeare died 1616, and the specific
modernised-spelling editorial text underlying PG #1533/#100 is itself a
19th-century (Globe/Cambridge-lineage) edition, long out of copyright in the
US and the EU/Denmark. No rights issue attaches to drafting a modern-English
reading edition from this text.

## 5. Word counts and ratios, chapters 1–2 candidates

| Chapter | Source paragraphs | Source words | Candidate words | Ratio | Min paragraph ratio |
|---|---|---|---|---|---|
| ch01 (Act 1, Scene 1) | 12 | 87 | 89 | 1.023 | 0.857 (one 3→2-word line; see `ch01/continuity.md`) |
| ch02 (Act 1, Scene 2) | 22 | 520 | 551 | 1.060 | 0.983 |

Both chapters' overall ratios and every individual paragraph ratio are
≥0.85; every paragraph below 1.0 is a two-to-four-word exchange between the
Witches where the source itself is that short (`ch01/continuity.md` lists
each). No paragraph drops content; every image, proper name and stage
direction in the source is present in the candidate. Ratio is a screening
signal only, per `WORKFLOW.md`.

## 6. Candidate hashes (frozen v1)

- `ch01/candidate-v1.json` — sha256 `21304f136f17739972fdb7a1f898927a0b06dfc597e0c731a7c3255bf0d394a5`
- `ch02/candidate-v1.json` — sha256 `17ba47fc5c12df039d9c57e46a893de92b20f58f82a8abc3272055086380a0c8`

(Both candidates carry the same `{"number","title","section","paragraphs"}`
schema as the served files — the `section: "Act I"` field, matching the
served `original-en`/`modern-en` chapters 1–2, is included.)
- `ch01/source-ch01.json` — sha256 `279593818be5378c85a917a3b0566a50c7f5808a77f98cde4165726002d1e513`
- `ch02/source-ch02.json` — sha256 `8bd8b0bce8f69e5a929e0b213ebcf0d850c2098de7f1473953d93f9588b615a5`

Both `source-chNN.json` files are extracted verbatim (`chapters[i]` by
0-based index) from the served `macbeth-original-en.json` above; byte
comparison against the served file's own chapters 1 and 2 confirms an exact
match.

## 7. Reproduction

```bash
cd books/staged-replacements/macbeth
python3 - <<'PY'
import json, hashlib
d = json.load(open('../../../app/public/data/editions/macbeth-original-en.json'))
assert len(d['chapters']) == 28
assert sum(len(c['paragraphs']) for c in d['chapters']) == 806
ch1, ch2 = d['chapters'][0], d['chapters'][1]
src1 = json.load(open('ch01/source-ch01.json'))
src2 = json.load(open('ch02/source-ch02.json'))
assert ch1 == src1 and ch2 == src2
print('OK', hashlib.sha256(open('ch01/candidate-v1.json','rb').read()).hexdigest())
print('OK', hashlib.sha256(open('ch02/candidate-v1.json','rb').read()).hexdigest())
PY
```
