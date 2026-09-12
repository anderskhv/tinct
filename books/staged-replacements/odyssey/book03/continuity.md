# Continuity sheet — the Odyssey, Book 3 (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`. Describes what the frozen
draft actually did. Paragraph IDs are `B03-Pnnn`, 1-indexed, throughout — no
parallel 0-indexed numbering.

Name forms follow `../GLOSSARY.md`: the **Greek** forms, applied from the
closed seven-row table. Book 3 is the second Book drafted under that decision
from the start.

## Source

`app/public/data/editions/odyssey-original-en.json`, chapter 3 — Samuel
Butler's 1900 prose translation, Project Gutenberg #1727. 38 paragraphs,
4,898 words. Extracted by `chapter.number == 3` into `source-book3.json`,
byte-identical to the served chapter, Butler's own title kept.

## Source verification — the rule, the audit, and what it found

**Re-done from scratch for this Book** (`../scripts/verify_source_book3.py`),
and on a different *kind* of rule from Book 2's drafter — the Book 2
**reviewer's** kind, which that review argued for and this Book adopts.

Book 2's drafting rule identified PG's apparatus in advance (bare-digit runs,
used positionally) and then stripped it. A reconstruction that begins by
deciding what the apparatus is shares that decision's blind spot: it cannot
see a difference of a class nobody thought of. So this one **decides nothing
in advance and strips nothing up front**.

1. **Boundaries, structurally.** `BOOK III` occurs exactly once (PG line 1117)
   and `BOOK IV` exactly once (line 1544); the range is what lies between.
   **`FOOTNOTES:` is never used as an anchor**, and both of its occurrences
   are asserted — line **75**, indented, inside the table of contents, and
   line **10843**, the real section. Anchoring on the first would put the
   "body" at zero lines and make any apparatus check vacuously true. Both
   Book 2's drafter and its reviewer recorded this trap; it is asserted here
   rather than avoided by luck.
2. **Line endings, visibly.** The file is read as **bytes** and decoded, so
   that universal-newline mode cannot silently translate CRLF — the kind of
   normalization this whole method exists to refuse to take on trust. All
   12,246 lines are asserted to end CRLF before the carriage returns are
   stripped; no word changes, and the served original has none.
3. **Paragraphs, mechanically.** Maximal runs of non-blank lines, joined with
   a newline — the served file preserves PG's own line breaks inside a
   paragraph, and negative control 1 below proves that matters. **The count,
   38, is an output of the rule, not an input.**
4. **The chapter opening, by a stopping condition rather than a number.**
   Leading blocks are dropped for as long as they are entirely upper case.
   Book 3's opening is **two** such blocks — `BOOK III` and
   `TELEMACHUS VISITS NESTOR AT PYLOS.` — separated by a blank line, where
   Book 2's was one, so "drop one" would have been wrong and "drop two" would
   have been an assumption. The second is asserted to match the served
   chapter title's tail, case aside.
5. **Audit of the raw range, before anything is trusted.** Indented lines
   **0**; `[Illustration` **0**; in-text Greek **0**; daggers **0**;
   underscores **0**; square brackets **1**, and it is `[on the embers]`;
   digit runs **12**, reading in order as **24…35**, contiguous — consistent
   with PG's own numbered footnote entries, so a stray body digit would break
   the arithmetic instead of vanishing. **Digit runs preceded by whitespace:
   0**, asserted — see the note below on why that clause is not a formality.
6. **The diff, with the apparatus still in.** Character-level `difflib`
   opcodes against `source-book3.json`, printing **every** difference with 28
   characters of context, and requiring each to be put in a named class before
   anything is removed. **14 differences in 11 paragraphs.**
7. **Only then, the removal**, by the one rule the diff itself justified, and
   the re-diff.

### What the diff found — and two of the fourteen are not apparatus

| class | count | what |
|---|---|---|
| apparatus | **12** | pure deletions of a bare digit run: PG footnote markers 24–35 |
| **D-A1** | **1** | B03-P001: PG prints `but as the sun was rising`, the served file `But` |
| **D-A2** | **1** | B03-P038: the served file carries **196 words that PG does not have** |

After removing only the apparatus: **36 of 38 paragraphs byte-identical,
4,690 words compared word-for-word over B03-P001…P037 with 0 mismatches**, and
the two that still differ are exactly the two classified — asserted, so
neither can hide a third difference. **A rule that stripped the apparatus
before diffing would have hidden both.** That is the whole argument for the
reviewer's method, and this Book is where it paid.

Two negative controls, both failing as they should: joining a paragraph's
lines with a space instead of a newline differs in **38 of 38**; leaving the
footnote markers in differs in **11 of 38** — exactly the paragraphs the diff
named.

### The whitespace clause is not a formality

`../scripts/scan_staged_original_vs_pg.py` (written at this step, read-only)
ran the same rule over all 24 Books — 1,027 paragraphs, 117,228 words — and
found that **PG separates some footnote markers from the preceding word with a
space, in Books 1, 4, 5, 8, 15, 17, 21 and 22**. A removal rule that only
strips a digit run *glued* to a preceding non-space character leaves part of
the marker behind in those Books (`others 10` loses the `0` and keeps the
` 1`). Books 2 and 3 have none, which is why the glued-only rule is safe here
and is **asserted rather than assumed**. A later Book's verifier must handle
the whitespace case. `../PROVENANCE.md` §4.

## Names met in Book 3, and how they are rendered

Mapped from the closed table (`../GLOSSARY.md`), each count matching the
source's exactly: **Ulysses → Odysseus 7, Minerva → Athena 18, Jove → Zeus 8,
Neptune → Poseidon 6.** Mercury, Saturn, Diana and Euryclea do not occur.

- **`Apollo` is not a mapping row.** He keeps his Greek name in English, and
  the table is closed at seven. Likewise `Hades` and `Amphitrite`, both of
  which occur once and are already Greek.
- **`heaven` is untouched**: 12 occurrences in the source, 12 in the
  candidate. Butler's metonym for the gods, and hazard 5.
- **`Mycene` → `Mycenae`** at B03-P024. **The first application of D13.** It
  is the city — *"For seven years after he had killed Agamemnon he ruled in
  Mycene"* — and the Cast gives Agamemnon the epithet *"Murdered King of
  Mycenae"*, so **D8** moves it. The woman of B02-P007 is untouched. The build
  asserts that no bare `Mycene` survives in Book 3.
- **`Diomed` (B03-P015) is flagged, not corrected.** Butler's form for
  Diomedes. The Cast has no entry for him, so **D8** is silent and supplies no
  authority; Butler's spelling stands. Third flagged spelling in the package,
  after `Ilius` and `Mycene`, and all three are decided by the same rule.
- **Possessives follow D7**: `Telemachus’s` ×4, `Achilles’s`, `Menelaus’s`,
  where Butler prints the bare `Telemachus’`, `Achilles’`, `Menelaus’` in some
  of those places and `Telemachus’s` in others. He is inconsistent; the
  edition is not.
- Already Greek and left exactly as Butler spells them: Pylos, Neleus, Nestor,
  Pisistratus, Thrasymedes, Echephron, Stratius, Perseus, Aretus, Polycaste,
  Eurydice, Clymenus, Laerceus, Diocles, Ortilochus, Alpheus, Pherae,
  Geraestus, Tenedos, Lesbos, Chios, Psyra, Mimas, Euboea, Sunium, Malean,
  Crete, Cydonians, Iardanus, Gortyn, Phaestus, Egypt, Priam, Ajax, Achilles,
  Patroclus, Antilochus, Neoptolemus, Myrmidons, Poias, Philoctetes,
  Idomeneus, Aegisthus, Clytemnestra, Orestes, Tydeus, Atreus, Lacedaemon,
  Cauconians, Gerene, Phrontis, Trito.

## Recurring formulas fixed in this Book

Rows added to `../GLOSSARY.md` before B03-P001 was drafted; the reasoning is
there. Listed here because Book 3 is where each is first met or first recurs.

| Butler | Modern edition | Where |
|---|---|---|
| "Beg of him to speak the truth, and he will tell no lies, for he is an excellent person." | "Ask him to speak the truth, and he will tell you no lies, for he is an excellent man." | **B03-P002 and B03-P025, identical** — Butler says it twice, of two different hosts |
| "Nestor, knight of Gerene" | "Nestor, the horseman of Gerene" | B03-P008 |
| "honour to the Achaean name" | "honor of the Achaean name" | B03-P011, B03-P017, identical |
| "peer of gods in counsel" | "the equal of the gods in counsel" | B03-P012 (Patroclus), B03-P032 (Neleus), identical |
| "Neptune lord of the Earthquake" | "Poseidon, lord of the Earthquake" | B03-P001 |
| "Minerva, daughter of Aegis-bearing Jove" | "Athena, daughter of aegis-bearing Zeus" | B03-P031 |
| "the Trito-born" | "the Trito-born" — kept, unglossed | B03-P030 |
| "nothing loth" | "readily enough" | B03-P037, **twice**, identical |
| "the inward meats" / "the outer meats" | "the inner meats" / "the outer meats" | ×3 and ×2, the pair kept |
| "hecatomb" / "hecatombs" | plain description, **no number** (D3) | B03-P007, B03-P014 |
| "a barrow heaped up for him" | "no mound heaped up for him" | B03-P022 |
| "tell me, and tell me true" | "tell me truly" | B03-P021 |
| the dawn formula | "When Dawn, the rosy-fingered child of morning, appeared" | B03-P032, B03-P037, identical |

### Carried over from accepted Books 1 and 2

- **"show your mettle and make yourself a name in story"** (B03-P016) is
  word-for-word the tail of accepted **B01-P019**. Butler differs by one word
  between the two — Book 1 has "show your mettle, **then**" — and the
  candidate keeps that difference, because he wrote it.
- **"tell me truly"** (B03-P021), the Book 1 formula row.
- **"mound"** for Butler's *barrow* (B03-P022), the Book 1 / Book 2 row.
- **"in due order"**, **"drink offering"**, **"heaven"** and the possessive
  standard, all unchanged.

## Paragraph-level decisions

- **B03-P001** — `[on the embers]` is **the package's first class-B bracket**;
  see "Base-text defects" below. "the firmament of heaven" → "the vault of
  heaven". **"guilds" → "companies"**, and identically at B03-P005: Butler's
  *guild* is his word for the nine divisions of the Pylian people, and in
  current English *guild* means a craft association. The count — nine
  companies, five hundred men each, nine bulls each — is kept exactly.
- **B03-P002 / B03-P025** — the "excellent man" warranty, identical in both,
  as Butler has it. Athena gives it of Nestor; Nestor gives it of Menelaus.
- **B03-P006** — Butler splits the speech tag between the verb and its object
  (`“Offer a prayer, sir,” said he, “to King Neptune`). Regrouped to
  `“Say a prayer to King Poseidon, sir,” he said, “for it is his feast…`, per
  `../PUNCTUATION.md` §3 — the split is the class a modern reader misreads.
  Same at **B03-P009** (`“Now,” said he, “that our guests…` → `“Now that our
  guests have finished their dinner,” he said, “it will be best…`) and
  **B03-P011** (the split vocative `“Nestor,” said he, “son of Neleus…` →
  `“Nestor, son of Neleus, honor of the Achaean name,” he said, “you ask…`).
  Three instances; **B03-P003**'s `“But how, Mentor,” Telemachus replied,
  “dare I go up to Nestor?` is deliberately **left**, because an interrupted
  question of that shape is ordinary modern English and is not misread.
- **B03-P007** — Athena's prayer: Butler's second person singular (`O thou…
  that encirclest… thy servants that call upon thee`) goes to plain modern
  `you`, with the vocative kept as a vocative. The *hecatomb* is folded per
  **D3** and **no number is supplied**.
- **B03-P009** — "rovers" → "raiders", and the whole formula
  (`with your hand against every man, and every man's hand against you`) kept
  as the formula it is.
- **B03-P012** — Butler's dash-strung aside (`—if indeed you are his son—I can
  hardly believe my eyes—and you talk just like him too—`) is resolved into
  sentences, with every limb kept and in his order. Nestor's naming of the
  dead — Ajax, Achilles, Patroclus, Antilochus — is exact, and Antilochus
  keeps both of his qualities (swift of foot, valiant in a fight).
- **B03-P012 → B03-P016 and B03-P022 → B03-P025** — **D4 applies seven
  times.** Nestor's two long speeches run across paragraph breaks, and Butler
  omits the closing quotation mark at the end of each continuing paragraph,
  opening the next with its own. Reproduced exactly: the candidate's
  unbalanced paragraphs are B03-P012, P013, P014, P015, P022, P023 and P024 —
  **the same seven as the source**, and the totals match it at 42 open / 35
  close. This is by far the package's largest use of D4 so far, and the
  operational point `../PUNCTUATION.md` §2 records for the app applies with
  more force here: seven paragraphs end without a closing quote.
- **B03-P015** — the hardest paragraph in the Book (306 words) and every leg
  of the voyage survives in Butler's order: Tenedos, the second quarrel, the
  ships that turned back under Odysseus, the son of Tydeus, Lesbos, the choice
  between outside Chios by Psyra and inside Chios past Mimas, the sign, the
  crossing to Euboea, the night passage to Geraestus, the sacrifices to
  Poseidon, Diomed's ships at Argos four days later, and the wind that never
  fell light. `Diomed` is Butler's spelling and is flagged, not corrected.
- **B03-P018** — Butler's parenthesis `(for I never yet saw the gods so openly
  fond of any one as Minerva then was of your father)` is kept as a
  parenthesis, matching the practice confirmed at B02-P011. Same at
  **B03-P024** for the steersman aside.
- **B03-P020** — Athena's argument keeps both halves of its trade-off — she
  would rather suffer and arrive safe than arrive fast and be killed — and its
  closing qualification, that death is certain even so. Nothing is upgraded
  into a promise.
- **B03-P024** — the Book's longest paragraph (342 source words). Every
  place-name and every stage survives: Sunium "which is the point of Athens",
  Apollo's painless arrows, Phrontis dead with the helm in his hand, the
  Malean heads, the division of the fleet, the Cydonians on the Iardanus, the
  headland from Gortyn, the south wind as far as Phaestus and the shelter past
  it, the wreck with the crews saved, the five ships carried to Egypt, and the
  seven years, the eighth year, and Orestes back from Athens. `Mycene` →
  **`Mycenae`** here, under D13.
- **B03-P028** — Nestor's refusal. See "Base-text defects" item 2 for the
  defective clause. Butler's interrupted opening (`“Heaven and the immortal
  gods,” he exclaimed, “forbid that…`) is regrouped under `../PUNCTUATION.md`
  §3; his store of "both rugs and cloaks" is kept as *both*, because the
  sentence four words earlier is about cloaks alone.
- **B03-P030** — "vouchsafe to send down thy grace upon myself" → "grant your
  grace to me"; "redoubtable" → "formidable"; "shewed" → "showed". **"the
  Trito-born" is kept and not glossed** — the epithet's sense is disputed among
  scholars, a gloss would either invent a certainty or run to a paragraph, and
  the sentence has already told the reader she is Zeus's daughter, which is
  the information the passage needs. The heifer's four attributes —
  broad-browed, a yearling, unbroken, never yet under the yoke — all survive,
  and so does the gilding promised twice.
- **B03-P032** — "aforetime" → "in former days"; "the public weal" → "the
  public good"; the six sons are named in Butler's order and the sceptre stays
  in his hand.
- **B03-P034 / B03-P035** — the sacrifice is kept whole, object by object:
  anvil, hammer and tongs; the ewer with the flower pattern and the basket of
  barley meal in the same man's two hands; the sharp axe; the bucket; the lock
  of hair thrown on the fire; the stroke through the tendons at the base of
  the neck; the two layers of fat and the raw meat on top; the five-pronged
  spits. **"screamed with delight" is kept** — it is the women's ritual cry,
  Butler's image, and softening it would be a retelling.
- **B03-P036** — "a fair mantle and shirt" → "a fine cloak and shirt";
  "henchmen" → "attendants". Polycaste washing and anointing Telemachus is
  kept as two acts, following the Book 10 pilot's precedent.
- **B03-P037** — the drive to Pherae. "lashed the horses on" is **kept**:
  Butler's word is not archaic, and keeping it removes any question of the
  candidate drifting toward another rendering. "nothing loth" → **"readily
  enough"**, twice, as Butler repeats it. **"corn lands" → "grain lands"** —
  British *corn* means grain, and an American reader reads maize. "steeds" →
  "horses", under the dead-word standard, with Butler's inversion kept
  (*so well did their horses carry them*).
- **B03-P038** — **see "Base-text defects" item 1. This is the Book's one
  unresolved issue and the one thing put to the coordinator.**

## Word ratio, and the retention measure

**Two numbers, because B03-P038 distorts one of them.**

| | with B03-P038 | without it |
|---|---|---|
| word ratio | **0.9561** (4,683 / 4,898) | **0.9959** (4,672 / 4,690) |
| Butler token retention | 0.859 | **0.895** |

**The figure to read is the one without B03-P038**, because that paragraph's
source text is 208 words of which only 12 are Butler's (see below); the
candidate renders the 12. Including it makes the Book look compressed by 4%
when it is not compressed at all.

**Retention — the fraction of Butler's word tokens carried over unchanged and
in order** (name mapping normalized, punctuation and case stripped, `difflib`
matching blocks over word tokens) — is the package's primary signal from Book
2's round 1 onward, because the word-count ratio is satisfied by a light
touch-up and this is not. For comparison, with each Book's accepted or frozen
text:

| Book 1, `candidate-v3.json` | Book 2, `candidate-v2.json` | **Book 3, `candidate-v1.json`** |
|---|---|---|
| 0.721 | 0.902 | **0.895** |

Book 3 sits with Book 2 rather than with Book 1, and for the same reason: it
is mostly speech in plain argument — Nestor talking — and Butler's prose there
is already modern English. The places where his Victorian sentence-chaining
does appear (B03-P012, P015, P024, P030) are the most rewritten. **The
reviewer is asked to treat 0.895 as a question rather than as a pass**: read
the least-changed paragraphs and say whether the lightness is the source's or
the drafter's, as Book 2's reviewer did.

Per-paragraph, excluding B03-P038: minimum **0.950** (B03-P002), maximum
**1.050** (B03-P010). Nothing anomalous at either end.

## Nothing imported from other translations

No wording was taken from any translation other than Butler's. Fagles,
Lattimore, Wilson and Fitzgerald were not read, quoted, or paraphrased from
memory. **Nor was the served `odyssey-modern-en.json`** — which matters more in
this Book than in any other, because its own paragraph 38 is sitting inside
the served *original* (see below), where a careless drafter would have
modernized it without noticing where it came from. The candidate does not
carry one word of it.

## Base-text defects and unresolved source issues

### 1. B03-P038 — the served `original-en` is defective, and this is the decision put to the coordinator

**What PG has.** Butler's Book III ends on a bare half-sentence, PG line 1539:

> `Now when the sun had set and darkness was over the land,`

and his Book IV opens with its other half, lower case, PG line 1549:

> `they reached the low lying city of Lacedaemon, where they drove straight to
> the abode of Menelaus…`

One sentence, split across the Book boundary — the same printing habit that
makes Book III itself open with a lower-case `but` (D-A1 above). PG's Book III
is **not** truncated; it ends where Butler ends it.

**What the served file has.** 208 words. The first 12 are Butler's clause
above. The remaining **196 are taken verbatim from the served
`odyssey-modern-en.json`'s own paragraph 38** — its only divergence is the
opening clause the splice replaced (*darkness covered the land* → *darkness
was over the land*) — and they **duplicate the served paragraph 37**: the same
chariot yoked, the same housekeeper's provisions, the same Pisistratus taking
the reins, the same Pherae, the same Diocles, the same Dawn, the same gateway,
the same corn lands, told twice in succession.

So the served "original" carries, in that one place, the modern rewrite it is
supposed to be the original *of*. `../scripts/scan_staged_original_vs_pg.py`
confirms this is **the only text-level difference in the whole served file** —
1,027 paragraphs, 117,228 words, paragraph counts matching in all 24 Books.

**What the candidate does: renders Butler's half-sentence and nothing else.**

> `Now when the sun had set and darkness lay over the land,`

Three reasons, in order of weight:

1. **Every candidate sentence is built from Butler alone** (`../WORKFLOW.md`),
   and the 196 words are demonstrably the served `modern-en`'s — the one file
   this package is expressly forbidden to reuse. Modernizing them would make
   the replacement carry the replaced file's wording *as its original*.
2. **They duplicate B03-P037.** Rendering them would give the reader the same
   journey twice in two consecutive paragraphs, which is a worse reading
   experience than the fragment.
3. **The half-sentence is not a defect in Butler**; it is how his Book III
   ends, and his Book IV completes it. The served Book 4's ¶1 already begins
   `They reached the low lying city of Lacedaemon`, so the completion is
   present in the product, one paragraph later.

**The cost, stated plainly and not minimized.** Paragraph alignment is
preserved — 38 paragraphs, B03-P038 present and non-empty — but in split-pane
view the reader sees 208 words in the original column against 12 in the
modern one. That is visible and it will look like a bug.

**The alternatives, so the coordinator can rule against this one if they
prefer:**

- **(b) Render the served paragraph in full.** Rejected: it would mean
  modernizing the served `modern-en`'s own prose and presenting it as a
  modernization of Butler.
- **(c) Complete the sentence with Butler's Book IV opening words.** Rejected:
  those words are B04-P001's and would then appear twice in the edition,
  breaking Book 4's own one-to-one alignment.
- **(d) Repair the served `app/public/data/editions/odyssey-original-en.json`**
  so that ¶38 is Butler's clause alone. **This is the right long-term fix** —
  it removes the duplication at its source and the split-pane mismatch with
  it — **and it is outside this package's scope**, which never overwrites a
  served file. Recommended to the coordinator; not done here.

Nothing in this package modifies the served file.

### 2. B03-P028 carries a defect in PG's own text

PG line 1416 prints:

> `or that I have so few cloaks and as to be unable to find comfortable beds`

**`cloaks and as to be` is ungrammatical.** Butler almost certainly wrote
*cloaks and rugs*: two sentences later he says he has `store both of rugs and
cloaks`, and the pair is the natural one.

**The candidate drops the stray `and` and supplies nothing**: `or that I have
so few cloaks as to be unable to find comfortable beds`. This changes nothing
but the error and adds no noun Butler may not have written. The alternative
reading — that a word is missing and it is *rugs* — is stated here so a later
reader has the argument to argue against, on the model of B01-P014's crux.

### 3. B03-P001's `[on the embers]` — the package's first class-B bracket

Butler prints `burning the thigh bones [on the embers] in the name of
Neptune` (PG line 1129). It is an **unflagged explanatory supplement inside
the line** — no footnote attaches to it; footnote 25 belongs to *inward meats*
earlier in the sentence — and it is therefore **class B** under decision
**D12**.

**Disposition: the mark is dropped, the words stand**, exactly as class A's
`[do not]` was disposed of at B02-P004, **but on a weaker warrant, which is
why it is flagged here by class rather than merely recorded.** The warrant:
the supplement *is* the base text — it is printed in the served `original-en`
and every reader of the original column sees it — so dropping the words would
put the modern edition behind the original beside it, which paragraph
alignment makes visible; and dropping the mark asserts nothing Butler does not
already print as part of his sentence, because unlike class C his bracket here
records no doubt about what the poem says.

**Put to the reviewer** for the ruling on class B, which D12 records as
settled-but-weaker rather than as obvious. Book 3 contains **no class-C
bracket**; the first is at PG 1551, in Book 4, and it is open and blocking.

### 4. No other defect

No corrupted, truncated or mid-sentence source paragraph beyond the two above.
No Gutenberg apparatus of any kind appears inside Book 3's paragraphs: zero
indented lines, zero illustration markers, zero Greek spans, zero daggers,
zero underscores. The twelve footnote markers (24–35) are correctly stripped,
with no doubled space and no orphaned punctuation left behind.
