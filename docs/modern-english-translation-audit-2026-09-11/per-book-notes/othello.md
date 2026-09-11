# Othello — modern-en audit (batch B5)

- **Book ID:** `othello`
- **Title / author:** Othello / William Shakespeare
- **Scope:** public (in `BOOKS`)
- **Reviewer:** batch agent B5, 2026-09-11

## Edition snapshot (Phase 1 data)

| Edition | sha256_16 | Chapters | Paragraphs | Words | Label |
|---|---|---|---|---|---|
| original-en | `a8e8ae40b054bce1` | 15 | 1391 | 27,549 | Shakespeare (1622) |
| modern-en | `5beb0f0093ef10f1` | 15 | 1391 | 28,200 | Modern English |
| modern-da | `048b82fecf563ec7` | 15 | 1391 | 28,989 | Moderne Dansk |

Mechanical comparison (original-en vs modern-en): mean weighted similarity **0.6716**;
identical long paragraphs **0.4%**; truncation flags **0**; empty paragraphs **0**;
chapter-count mismatch **false**; per-chapter paragraph mismatches **0**;
`en_editions_aligned: true`. Not in the README's 33-book "closer attention" list.

## Provenance and completeness of the core English text

The 15 chapters are real Act/Scene units with location subtitles (`Act 1, Scene 1 —
Venice. A street` … `Act 5, Scene 2 — Cyprus. A Bedchamber in the castle`). All 15
canonical scenes are present; no editorial-apparatus debris, no dramatis-personae or
front-matter chapter. Stage directions and speaker tags are preserved as their own
paragraphs in both editions and are bracketed consistently (214 bracketed / 0 bare in
both source and modern). Verse is set as run-on prose in the *source* file already, so
the modern edition's prose lineation is a source-file convention, not a modernization
loss.

**Provenance label is wrong.** The registry labels original-en `Shakespeare (1622)`,
i.e. Quarto 1. The file contains Desdemona's Willow Song at `Act 4, Scene 3` (chapter
index 12, paras 25–32: *"The poor soul sat sighing by a sycamore tree, Sing all a green
willow…"*). The Willow Song does not appear in Q1 1622 and first appears in F1 1623
([Folger, *An Introduction to This Text: Othello*](https://www.folger.edu/explore/shakespeares-works/othello/an-introduction-to-this-text/);
[Wikipedia, *Willow song*](https://en.wikipedia.org/wiki/Willow_song)). The text is a
conflated modern-spelling edition of the Globe/Moby lineage (the `[_…_]` italic markers
in the source file are the Project Gutenberg house convention). The delivered text is
*complete* — this is a metadata defect, not a content defect.

## Samples inspected (6)

### 1. Act 1, Scene 1, paras 1–25 (opening) — strong
Source (para 8): *"These fellows have some soul, And such a one do I profess myself.
For, sir, It is as sure as you are Roderigo, Were I the Moor, I would not be Iago: In
following him, I follow but myself. … I am not what I am."*
Modern: *"Those fellows have some spirit, and I count myself one of them. For, sir, as
surely as you are Roderigo, if I were the Moor I wouldn't want to be Iago. In following
him, I follow only myself. … I am not what I am."*

**Finding:** Good. The famous line is left verbatim rather than paraphrased. The racial
register is preserved without softening or editorializing: `"the thick-lips"` →
`"the thick-lipped one"`, `"an old black ram Is tupping your white ewe"` → `"an old
black ram is mounting your white ewe"`, `"his Moorship's ancient"` → `"his Moorship's
ensign"`. Minor compression: *"must be belee'd and calm'd By debitor and creditor, this
counter-caster"* → *"must be left becalmed by this calculator, this bean-counter"*
collapses "debitor and creditor" into "calculator" — a small loss of the bookkeeping
doublet, meaning intact.

### 2. Act 1, Scene 3, paras 84–95 (Iago's "put money in thy purse" + closing soliloquy) — strong
Source (para 95): *"I hate the Moor, And it is thought abroad that 'twixt my sheets He
has done my office. I know not if 't be true, But I, for mere suspicion in that kind,
Will do as if for surety."*
Modern: *"I hate the Moor — and it's rumored about town that between my sheets he has
done my office. I don't know if it's true, but I, on mere suspicion of that kind, will
act as if it were certain."*

**Finding:** This is exactly the restraint the brief asks for. Iago's shifting,
unresolved self-justification survives — the modernization does not diagnose him, does
not resolve "motiveless malignity" into a motive, and does not add a psychological
gloss. The repeated "put money in thy purse" refrain is kept in every one of its eight
occurrences. One small disambiguation: *"to abuse Othello's ear That he is too familiar
with his wife"* → *"to whisper in Othello's ear that **Cassio** is too familiar with his
wife"*. The source pronoun is genuinely ambiguous; the modern edition resolves it to the
standard reading (defensible, and arguably necessary in prose), but "whisper in" is
softer than "abuse" (= poison/deceive).

### 3. Act 3, Scene 1, paras 4–19 (the Clown) — comic/low register, strong
Source: *"CLOWN. O, thereby hangs a tail." / "FIRST MUSICIAN. Whereby hangs a tale,
sir?"* → Modern: identical.
**Finding:** The tail/tale pun is preserved as a pun and *not explained*. `"quillets"` →
`"quibbles"` is a good familiar equivalent. The Naples/nose venereal joke is left
unglossed — correct restraint, at a small cost in first-read comprehension.

### 4. Act 2, Scene 3, paras 30–51 (drinking scene + King Stephen song) — comic, adequate
**Finding:** Prose banter is well modernized (`"swag-bellied Hollander"` →
`"big-bellied Hollander"`; `"exceedingly well cudgelled"` → `"exceedingly well
beaten"`). The interpolated song (para 39) is only lightly touched — `"wight"` →
`"man"`, `"thou art"` → `"you are"`, `"auld"` → `"old"` — leaving `"lown"` (= rogue)
unglossed. Defensible as a song, but it is the one place where the reader is left
stranded on a single word.

### 5. Act 3, Scene 3, paras 95–117 (the temptation scene) — **the weakest sample**
Source (para 96): *"Note if your lady strain his entertainment With any strong or
vehement importunity, Much will be seen in that."*
Modern (para 96): *"Note if your lady strain his entertainment with any strong or
vehement importunity — much will be seen in that."*

Source (para 100): *"If I do prove her haggard, Though that her jesses were my dear
heartstrings, I'd whistle her off, and let her down the wind To prey at fortune. …
And have not those soft parts of conversation That chamberers have…"*
Modern (para 100): *"If I prove her wild, though her jesses were my dear heartstrings,
I'd whistle her off and let her down the wind to prey at fortune. … and don't have those
soft parts of conversation that chamberers have…"*

**Finding:** The single recurring weakness in this book. In the play's highest-register
verse the modernization thins out to a pronoun-and-contraction pass, leaving
`"strain his entertainment"`, `"vehement importunity"`, `"chamberers"`, `"jesses"`,
`"whistle her off"`, `"down the wind"` untouched. It also translates *half* a metaphor:
`"haggard"` (a wild-caught hawk) becomes `"wild"` while the rest of the falconry image
is left in Elizabethan terms — the reader loses the link that made "haggard" mean
anything. This is **local** (concentrated in 3.3 and a handful of other verse
soliloquies), not a book-wide pattern.

### 6. Act 5, Scene 2, paras 178–198 (Othello's last speech and the ending) — strong
Source (para 190): *"Then must you speak Of one that loved not wisely, but too well; Of
one not easily jealous, but being wrought, Perplex'd in the extreme; of one whose hand,
Like the base Judean, threw a pearl away Richer than all his tribe…"*
Modern: *"Then you must speak of one that loved not wisely, but too well; of one not
easily made jealous, but, when worked upon, troubled in the extreme; of one whose hand,
like the base Judean, threw a pearl away richer than all his tribe…"*

**Finding:** Good. The "base Judean" crux is left unresolved rather than adjudicated —
correct restraint. `"the circumcised dog"` is preserved, not sanitized. One small image
loss: `"whose subdu'd eyes, Albeit unused to the melting mood"` → `"whose hardened eyes,
though unused to weeping"` replaces the image with its meaning. The `[Stabs himself.]`
direction is in place. `"Nothing extenuate"` → `"Do not minimise anything"` — note the
British `-ise` in an otherwise American-spelled edition (see below).

## Phase 1 flags: confirmed vs. disconfirmed

- **0 truncation flags, 0 empty paragraphs, 0 chapter/paragraph mismatches** — confirmed
  by direct read; all 15 scenes complete, every stage direction matched 1:1.
- **0.4% identical long paragraphs** — confirmed benign. I ranked all 301 source
  paragraphs ≥25 words by word-token similarity; only 10 (3.3%) exceed 0.90, and every
  one of those is already-plain prose that legitimately needs no change (e.g. `"CASSIO.
  Reputation, reputation, reputation! … My reputation, Iago, my reputation!"`). This is
  not a LIGHT/MECHANICAL edition.
- **Archaic-token sweep (my own check, not Phase 1):** 646 instances of
  thou/thee/thy/hath/doth/ere/prithee/'tis/betwixt/wilt/dost etc. in the source →
  11 in modern-en (**2% retained**). Confirms a genuine modernization pass.
- **Similarity distribution:** mean 0.675, median 0.692; 27% of long paragraphs below
  0.60. Middle of the batch — more thoroughly rewritten than Much Ado, less than Shrew.

## Defects worth fixing (all local)

1. **Provenance label** — `Shakespeare (1622)` is wrong for a text containing the Willow
   Song; it is a conflated/Globe-derived text. Suggest `Shakespeare (Folio, 1623)` or a
   neutral `Shakespeare (original)`.
2. **Act 3 Scene 3 verse pockets** — ~6 opaque terms left unglossed in the play's pivotal
   scene (list above).
3. **Spelling house style** — `honor` 14 / `honour` 2, plus `minimise` against
   `color`/`vapor`/`favor`/`offense`. Pick one and normalize.

## Phase 3 — human-edition research

Othello is an **English original**, so the first question is whether the original already
meets the reading standard. It does not, in the sense the standard means: this is
early-modern dramatic verse, not clear Victorian prose. A modernization removes a real
reader barrier, so SOURCE + GLOSSES alone is not the best result here.

Searched for a complete, readable, legally reusable *human* modern-English rendering:

| Candidate | Completeness | Rights | Verdict |
|---|---|---|---|
| Standard Ebooks Shakespeare | Only histories + *The Winter's Tale*; **Othello not published**. Original language anyway (modern spelling, not a translation). | CC0 dedication for SE-produced content | Not applicable — [standardebooks.org/ebooks/william-shakespeare](https://standardebooks.org/ebooks/william-shakespeare) |
| Wikisource / Project Gutenberg #100 / Globe-Moby | Complete | **Public domain**, commercial reuse permitted ([Wikisource: Reusing content](https://en.wikisource.org/wiki/Wikisource:Reusing_Wikisource_content)) | Original language — this is already what `original-en` is |
| Folger Shakespeare digital texts | Complete, excellent apparatus | **CC BY-NC** — noncommercial only ([Folger, *Free cultural works*](https://www.folger.edu/blogs/collation/free-cultural-works-come-get-your-free-cultural-works/)) | **Rights-blocked** for Tinct (commercial) |
| Internet Shakespeare Editions | Complete, modern-spelling edited texts | "may in all cases be used for educational, non-profit purposes"; editor holds copyright ([ISE copyright](https://internetshakespeare.uvic.ca/Foyer/copyright.html)) | **Rights-blocked** |
| Open Source Shakespeare | Complete | CC BY-NC 4.0 | **Rights-blocked**; original language anyway |
| SparkNotes *No Fear Shakespeare* / LitCharts *Shakescleare* / NoSweatShakespeare | Complete modern-English translations | Proprietary, all rights reserved | **Permission required** — not pursued |
| Durband, *Shakespeare Made Easy* (OUP) | Complete facing-page modern English | © Alan Durband; OUP, 1990/2014, no reproduction without written permission | **Permission required** |
| Oregon Shakespeare Festival *Play On!* | Complete verse translations, 39 plays | Copyrighted; scripts issued only on request via [playonshakespeare.org](https://playonshakespeare.org/) | **Permission required** |
| Lamb, *Tales from Shakespeare* (1807) | **Abridged prose retelling**, 20 tales (Othello included) | Public domain | Fails completeness by design — a children's narrative summary, not the play |

**Conclusion:** no complete, human-authored, rights-clear modern-English Othello was
found in this search. Every rights-clear option is the original language (which we
already ship); every modern-English human rendering is under copyright or NC-restricted.
This is "none found in this search", and I believe it is close to "none exists" for the
rights-clear + complete + modern-English intersection — but I state the former.

## Phase 4 — rating

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 4 |
| Literary voice | 20% | 4 |
| Restraint / no invention | 10% | 5 |
| Naturalness | 5% | 4 |

**Weighted score: 4.5 — band: Strong.**

**Recommendation: LIGHT EDIT.**
No substantive omission and no invention found in six samples. The edition is a real,
skilful modernization that keeps Iago's ambiguity and the play's racial charge intact.
What it needs is a scoped glossing pass over the high-register verse (principally
3.3), a spelling-normalization pass, and a corrected provenance label.

- **Confidence:** medium-high. 6 passages / roughly 1,300 source words read closely,
  plus a full-text mechanical similarity ranking and an archaic-token sweep over all
  1,391 paragraphs. "Strong in samples" — the whole book is not verified line by line.
- **Correction scope:** local.

## Limitations of this review

- I did not read all 15 scenes end to end; Acts 2 and 4 were sampled at 2 points each,
  Act 1 at 2, Acts 3 and 5 at 2 each.
- I did not evaluate `modern-da` at all (out of scope for this audit).
- I did not check audio manifests, `othello-threads.json`, or onboarding JSON.
- I did not verify the app's rendering of the `[_…_]` markers (none survive in
  `othello-modern-en.json`; 7 remain in `othello-original-en.json`, which readers see).
- Rights conclusions are research summaries, not legal advice; the Danish/EU vs. US
  position on the NC-licensed candidates was not separately analysed because they are
  excluded on their face for a commercial service.
