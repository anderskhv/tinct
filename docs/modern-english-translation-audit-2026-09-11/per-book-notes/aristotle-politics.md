# aristotle-politics — Politics, Aristotle

**Scope:** public. Audited 2026-09-11.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | sections | label |
|---|---|---|---|---|---|---|
| original-en | `0bf42e46f4c5c373` | 8 | 478 | 90,701 | 8 | "Jowett (1885)", translator `Benjamin Jowett`, year `1885` |
| modern-en | `8ce0b1f6570584b4` | 8 | 478 | 86,194 | 8 | "Modern English" |
| modern-da | `57d699612aa360b0` | 8 | 478 | 79,838 | 0 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.8763** (the highest in this batch), identical
long paragraphs **0.8%**, **6 truncation flags**, 0 empty paragraphs, 0 paragraph-count mismatches,
aligned.

## CRITICAL: `original-en` is an uncleaned raw OCR dump

The core English text is not a prepared edition. It is the **unprocessed `_djvu.txt` OCR output** of
a scanned printing of *Aristotle's Politics*, translated by Benjamin Jowett, with introduction,
analysis and index by **H. W. C. Davis** (Oxford, at the Clarendon Press).

**Provenance established by direct string match.** I downloaded
`https://archive.org/stream/aristotlespoliti00arisuoft/aristotlespoliti00arisuoft_djvu.txt` and
found our source text's distinctive corruptions present verbatim in it:

| our `original-en` | archive.org djvu.txt |
|---|---|
| ch2 ¶31: *"Hippodamus, the son of Euryphon, a native of Miletus, the Or, reading with Bernays a«i;, ' the remedy for such evils.'"* | *"Hippodamus, the son of Euryphon, a native of Miletus, the … ? Or, reading with Bernays aan, 'the remedy for such evils.'"* |
| ch3 ¶6: *"An untranslatable play upon the word Srjiuovpyoi, which means either ' a magistrate ' or ' an artisan.' When is a State the Same? be called citizens"* | *"'An untranslatable play upon the word Symsovpyot, which means either 'a magistrate' or 'an artisan.'"* |
| ch5 ¶79: *"Bekker in his 2nd edition has altered the reading of the MSS. tia rt TOW xpovov to 5«i riv xP o …"* | *"Bekker in his 2nd edition has altered the reading of the MSS. da 7e Tov xpovov to bd ye Tov xpovov…"* |
| ch5 ¶80 opens: *"Criticism of Plato 235says the ruling class are lovers…"* | running head *"Criticism of Plato 235"* |

So the `original-en` file contains, interleaved into Aristotle's text:
- Davis's textual-criticism footnotes (Bekker, Bergk, Bernays, MSS readings, mangled Greek);
- printed running heads and page numbers (*"Criticism of Plato 235"*, *"Hippodamus—His Constitution"*, *"Democracy and Oligarchy i y i"*);
- marginal section numbers dropped into the prose (*"the state or political community 3"*, *"2 1300"*, *"V,"*).

**Measured extent:**
- **74 of 478 paragraphs (15.5%)** of `original-en` contain editorial-apparatus markers
  (Bekker / MSS / Bergk / Bernays / "reading with" / "Omitting" / "the old translator" / stray Greek
  sigils). In `modern-en` this drops to **5 of 478** — the modernization pass did a substantial and
  largely successful clean-up.
- **94 of 478 `original-en` paragraphs (19.7%)** and **78 of 478 `modern-en` paragraphs (16.3%)**
  end without terminal punctuation — i.e. they break mid-sentence, because paragraph boundaries were
  taken from scanned page breaks rather than from sentences.

Registry says "Jowett (1885)". The scan's own title page is dated 1908 (Clarendon Press, Davis ed.),
with the 1920 reprint also in circulation. Jowett's translation first appeared 1885, so the
attribution is not *wrong*, but the file is a later Davis-edited printing and the label does not say
so.

## Samples inspected (10)

### 1–6. All six Phase 1 truncation flags, checked directly

| flag | ratio | verdict |
|---|---|---|
| ch2 ¶31 | 0.42 | **DISCONFIRMED** — modern-en correctly drops the Bernays footnote and the dangling *"Hippodamus, the son of Euryphon, a native of Miletus, the"* fragment |
| ch3 ¶6 | 0.42 | **DISCONFIRMED** — drops the *"untranslatable play upon the word Srjiuovpyoi"* footnote and the *"When is a State the Same?"* running head |
| ch4 ¶63 | 0.38 | **DISCONFIRMED** — drops *"These words are bracketed by Bekker in both editions. ' Omitting «at with some MSS. and the old translator."* |
| ch7 ¶24 | 0.60 | **DISCONFIRMED** — drops the Bergk conjecture footnote |
| ch8 ¶3 | 0.49 | **DISCONFIRMED** — drops the *"Or, 'to invite Thalia to the feast'… - Od. xvii. 385"* footnote; both Homeric quotations are retained and correctly quote-marked |
| ch5 ¶79 | 0.56 | **CONFIRMED as a defect — but as an invention, not a truncation** (below) |

Five of six flags are therefore artifacts of correct editorial hygiene. This is the same pattern as
`poetics` and the same reason: the mechanical screen measures word loss, and removing garbage is
word loss.

### 7. The ch5 ¶78–80 failure (Book 5, criticism of Plato's cycle of revolutions)

This is the one place where the clean-up went wrong, and it produced three linked problems.

**SRC ¶78** (515 w) ends mid-sentence with footnote text spliced in:
*"…And it is absurd to suppose that the state changes into oligarchy merely because **[as Plato in
the period of time which, as he says, makes all things change, things which did not begin together
change together.'**"*

**MOD ¶78** (468 w) ends:
*"…It is absurd to suppose that the state changes into oligarchy merely because **the ruling class
are lovers and makers of money, as Plato**"*
→ the editor bridged the broken sentence forward by pulling in wording that lives in ¶80.

**SRC ¶79** is *pure footnote*, containing no Aristotle at all:
*"Bekker in his 2nd edition has altered the reading of the MSS. tia rt TOW xpovov to 5«i riv xP o -
The rendering of the text agrees with either reading; that of the note with the reading of the MSS,
only."*

**MOD ¶79** reads:
*"**claims in the period of time which, he says, makes all things change — when things which did not
begin together nevertheless change together.**"*

→ **Confirmed invention.** Rather than deleting an empty paragraph, the editor manufactured
continuous prose for it out of the neighbouring footnote fragment. The output is plausible-sounding
Aristotle that is not a rendering of anything in ¶79.

**SRC ¶80** opens with the running head: *"Criticism of Plato 235says the ruling class are lovers and
makers of money…"*
**MOD ¶80** opens: *"**It is also absurd because Plato says the ruling class are lovers and makers of
money**…"*

→ **Confirmed duplication.** The phrase *"the ruling class are lovers and makers of money"* now
appears twice — once at the end of ¶78 and again at the start of ¶80 — with the invented ¶79 between
them. A reader moving through this stretch hits the same clause twice and an orphan sentence in
between.

Note the clean-ups that *did* work in the same neighbourhood: SRC ¶78's OCR *"the )erfect state"* →
*"the perfect state"*; SRC ¶81's stray marginal *"V,"* is dropped. The editor was working carefully;
this specific three-paragraph sequence defeated the approach.

### 8. Opening — Book 1 ¶0–2

SRC ¶1: *"Now there is an erroneous opinion that a statesman, king, householder, and **master** are
the same"*
MOD ¶1: *"There is a mistaken view that the statesman, the king, the head of a household, and the
**master of slaves** are all the same"*

SRC ¶2: *"As in other departments of science, so in politics, the compound should always be resolved
into the simple elements or least parts of the whole… **3**"*
MOD ¶2: *"As in other branches of inquiry, so in politics, the compound should always be resolved
into its simplest elements or smallest parts."*

**Finding — good.** *"master"* → *"master of slaves"* correctly disambiguates *despotês* at the point
of need, and the stray marginal *"3"* is stripped. But note how little else changes: Jowett's 1885
prose passes through almost untouched because it is already clear.

### 9. Book 3 ¶40–41 (who should rule; the potluck argument) and Book 4 ¶10–12 (defining democracy and oligarchy; the biology analogy)

SRC 4¶11: *"Suppose the whole population of a city to be **2 1300**, and that of these 1000 are rich"*
MOD 4¶11: *"Suppose the whole population of a city to be **1300**, and that of these 1000 are rich"*

SRC 4¶10: *"the better and more exact way is to **Not in what has preceded, but cp. vii. 8. Democracy
and Oligarchy i y i** distinguish, as I have done…"*
MOD 4¶10: *"the better and more exact way is to distinguish, as I have done…"*

SRC 4¶12: *"A fourth class is that of the serfs or **laboureis**… For how can a state which **1 1** has
any title to the name be of a slavish nature?"*
MOD 4¶12: *"A fourth is the class of serfs or **labourers**… How can a state with any title to the
name be of a slavish nature?"*

**Finding — strong clean-up, near-zero modernization.** Every proper name and example survives
exactly (Apollonia, Thera, Colophon, the Lydian War, Ethiopia-by-stature, the animal-organs analogy,
Socrates' weaver/husbandman/shoemaker/builder list and the later smith, herdsman, merchant, retail
trader). The OCR noise *"2 1300"*, *"laboureis"*, *"1 1"* and the embedded cross-reference footnote
are all correctly repaired. But apart from de-noising, this is Jowett with semicolons turned into
em-dashes.

### 10. Ending — Book 8 ¶23–25 (musical modes; the close of the work)

SRC ¶24: *"the Dorian is a mean between the other harmonies **[the Phrygian and the Lydian ,** it is
evident…"*
MOD ¶24: *"the Dorian is a mean between the other harmonies **(the Phrygian and the Lydian)**, it is
evident…"*

SRC ¶25: *"clearly **[we ought to use it, for]** education should be based upon three principles"*
MOD ¶25: *"we ought to use it. Education should be based upon three principles: the mean, the
possible, and the becoming, these three."*

**Finding — good.** Philoxenus and his *Tales*, the dithyramb, Bacchic frenzy, the flute, Socrates on
relaxed harmonies — all preserved. Broken editorial brackets are repaired into readable text. The
book's famously abrupt ending is left abrupt, correctly.

## Phase 1 flags: confirmed vs. disconfirmed

- **Mean similarity 0.8763 — confirmed, and diagnostic.** Outside the de-noising, modern-en is
  Jowett with light repunctuation. The high similarity is not an artifact.
- **6 truncation flags — 5 DISCONFIRMED** (footnote/running-head removal, correct behaviour);
  **1 CONFIRMED as a different defect** (ch5 ¶79: fabricated paragraph, plus duplication into ¶80).
- **0.8% identical long paragraphs — confirmed** (4 paragraphs ≥25 words byte-identical; e.g. ch1
  ¶23, ch2 ¶71, ch6 ¶15, ch7 ¶32). Consistent with the light-touch approach.
- **0 empty paragraphs / alignment intact — confirmed.**
- **Not in the Phase 1 data, found here and material:** 15.5% of `original-en` paragraphs carry
  scholarly-apparatus debris; 19.7% of `original-en` and 16.3% of `modern-en` paragraphs end
  mid-sentence.

## Phase 3 — human-edition research

The need here is not a better *translation* — Jowett is clear, complete and rights-clear. The need is
a **clean digitisation of the translation we already have**.

**Candidate A — Jowett, Internet Classics Archive (MIT).**
- `https://classics.mit.edu/Aristotle/politics.html`. Fetched Book 1: clean, complete, **no footnote
  apparatus at all**, no OCR damage. Textually the best-presented Jowett I found.
- **Rights: REJECTED on rights, not on quality.** The site's own notice reads: *"World Wide Web
  presentation is copyright (C) 1994-2009, Daniel C. Stevenson, Web Atomics. All rights reserved
  under international and pan-American copyright conventions, including the right of reproduction in
  whole or in part in any form,"* and directs reuse to `classics@classics.mit.edu`. Jowett's
  underlying translation is public domain, but this *digitisation* asserts all rights reserved.
  Status: **permission required.** Free to read ≠ free to reuse.

**Candidate B — Wikisource, *Politics (Jowett)*.**
- `https://en.wikisource.org/wiki/Politics_(Jowett)` — the 1920 Oxford/Clarendon Jowett with Davis's
  introduction, analysis and index. Same edition family as our OCR.
- Rights: Wikisource text CC BY-SA 4.0 on the transcription layer; the underlying 1920 translation is
  PD in the US (pre-1931) and PD worldwide for Jowett himself (d. 1893). Status: **public domain
  (translation) / share-alike (transcription layer)**.
- **Completeness: INCOMPLETE.** Only **Book 1** is transcribed; Books II–VIII are red links. There is
  a scan-backed `Index:Aristotle's Politics.djvu` behind it, but the proofreading is unfinished. Not
  a drop-in replacement today.

**Candidate C — re-derive from the Internet Archive scan we already used.**
- `https://archive.org/details/aristotlespoliti00arisuoft` (and the parallel
  `archive.org/details/aristotlespolit00aris`). PD. Complete.
- This is the *same* source our broken file came from — the fix is not a new source but a proper
  extraction pass: strip footnotes by position, strip running heads and page numbers, and rejoin
  paragraphs across page breaks. That is mechanical, verifiable work.

**Candidate D — William Ellis (1776/1912), PG #6762, "A Treatise on Government".**
- Fetched. PD, complete, a genuinely different translation. Opening: *"As we see that every city is a
  society, and every society is established for some good purpose; for an apparent good is the spring
  of all human actions…"*
- Assessment: **rejected on readability** — Ellis's 18th-century periodic sentences are markedly
  harder than Jowett's. It also carries inline `[Bekker 1252a]` markers of its own.

**Not viable:** Carnes Lord (Chicago, 1984/2013), Trevor Saunders/T. A. Sinclair (Penguin, 1981),
C. D. C. Reeve (Hackett, 1998), the Rackham Loeb — all in copyright.

**Conclusion:** a rights-clear, complete, clean Jowett is achievable but **does not exist ready-made
in the places I searched**. The ICA has the quality but not the rights; Wikisource has the rights but
not the completeness; the Internet Archive has both but needs the extraction work that was skipped
the first time.

## Ratings

| dimension | weight | score | note |
|---|---|---|---|
| fidelity / completeness | 40% | 3 | Jowett's substance and every named example preserved, and 69 of 74 debris paragraphs correctly cleaned — but one confirmed fabricated paragraph (5¶79) with an adjacent duplicated clause (5¶80), and 78/478 paragraphs still end mid-sentence |
| first-read clarity | 25% | 4 | Jowett is already clear and the de-noising is a large net gain over `original-en`; broken paragraph boundaries pull it back |
| literary voice | 20% | 4 | Jowett's voice essentially intact — which is also why this barely reads as a separate edition |
| restraint / no invention | 10% | 3 | 5¶79 is an invention; *"master"* → *"master of slaves"* is a good point-of-need gloss on the other side of the ledger |
| naturalness | 5% | 4 | fluent where the paragraph boundaries allow it |

**Weighted score: 3.5.** **Band: Mixed.**

## Recommendation

**BLOCKED** — confidence **high**.

What is unresolved, precisely: **the integrity of the core English text.** `aristotle-politics-
original-en.json` is a raw `_djvu.txt` OCR dump in which 15.5% of paragraphs contain scholarly
footnotes, running heads or page numbers presented to the reader as Aristotle's words, and 19.7% of
paragraphs break mid-sentence. `modern-en` is derived from that file and inherits its paragraph
boundaries (16.3% still break mid-sentence), and in the one place where the debris was densest
(Book 5 ¶78–80) the derivation produced a fabricated paragraph and a duplicated clause.

No rating of the modern edition can be acted on until the base text is rebuilt, because the modern
edition's main contribution *is* cleaning up the base text, and any re-clean changes it.

**Correction scope: substantial.**

Sequence:
1. Re-extract Jowett from the Internet Archive scan with footnotes, running heads and page numbers
   stripped, and paragraphs rejoined across page breaks. Verify by asserting 0 paragraphs ending
   mid-sentence and 0 paragraphs matching the apparatus-marker regex.
2. Re-align the 478-paragraph array to the rebuilt text.
3. Re-derive `modern-en` from the clean base. Given how light the current modernization is, the real
   decision at that point is whether a separate modern edition is warranted at all — Jowett, cleanly
   presented, may already meet our standard, in which case **SOURCE + GLOSSES** becomes the right
   answer for this book.
4. Delete the fabricated 5¶79 and the duplicated clause in 5¶80 regardless of what else happens.
5. Correct the registry label to name the Davis-edited Clarendon printing actually used.

## Limitations of this review

- 10 passages, roughly 2,700 source words of 90,701 (~3%), covering Books 1, 2, 3, 4, 5, 7 and 8.
  Book 6 was checked only by the automated debris scan, not read.
- The 74 / 5 / 94 / 78 counts come from regex and punctuation heuristics over the full files, not
  from reading all 478 paragraphs. Individual counts may be off by a few either way; the order of
  magnitude is solid, and every instance I opened by hand was a true positive.
- I checked the ch5 ¶78–80 failure in detail but did **not** systematically look for other invented
  bridges at the remaining ~69 cleaned-debris paragraphs. There may be more; this needs a dedicated
  pass, not a sample.
- English-to-English only; no comparison against the Greek.
- I did not audit `modern-da` (note: it carries `sections: 0` where both English editions carry
  `sections: 8` — worth a separate look).
- I did not attempt the re-extraction myself, so I have not proven the archive.org scan is clean
  enough to yield a good text — only that it is the source of the current one.
