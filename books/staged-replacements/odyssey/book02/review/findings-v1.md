# Independent review — the Odyssey, Book 2, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer session spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/odyssey-modern-en-20260911`, worktree `/home/user/tinct/.claude/worktrees/agent-aed63132833ff4d58` |
| Candidate | `book02/candidate-v1.json`, sha256 `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea` — recomputed locally; matches `provenance.json`, `manifest.json` and `README.md` |
| Source | `book02/source-book2.json` sha256 `3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7` (matches), byte-identical to chapter 2 of `app/public/data/editions/odyssey-original-en.json` sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` (matches); PG base `source-texts/pg1727-butler-1900.txt` sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (matches) |
| Source-verification claim | **Verified independently, and it holds.** Not by re-running `scripts/verify_source_book2.py`. I wrote my own reconstruction on a *different kind of rule*: the drafter's rule identifies the apparatus first (digit runs, used positionally) and then strips it; mine identifies **nothing** in advance, rebuilds Book 2 from raw PG with the apparatus still in it, and then **derives** every difference from the staged file by character-level diff, requiring each one to be explained before anything is stripped. It reproduces the staged Book 2 **byte-for-byte in all 35 paragraphs, zero diffs, 4,184 words**. Method, audit and the two claims I was asked to confirm are below and in `review/README.md`. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-12.md`, in order, three paragraphs at a time (packet 12 two) with the `CONTEXT ONLY` neighbours (coverage `B02-P001`…`B02-P035`, each exactly once); then the candidate read straight through |
| Translations consulted | Butler 1900 only. Fagles, Lattimore, Wilson, Fitzgerald and every other in-copyright translation were **not** read for this review, and no finding claims an import from one. |

## Verdict

**Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must be fixed before acceptance) | **0** |
| minor (worth improving) | **16** — 14 paragraph-level, 2 records |
| optional (preference, no defect) | **11** — 9 paragraph-level, 2 records |
| paragraphs with no material issue at all | **19** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Butler's own words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

**Book 2 is a markedly cleaner draft than Book 1's v1, and nothing in it must be fixed.** No content is dropped or added at the level of a claim, a name, an object, a quantity or a relationship. Every one of the checks the review instructions name passes: the 35 paragraphs are one-to-one and in order; the name census matches the source exactly (Odysseus 17, Athena 8, Zeus 6, Eurycleia 2), `Ops` survives with his genealogy intact and `Rhea` never appears; every direct speech is a direct speech; both quotations-inside-quotations survive as quotations; Butler's unclosed-quotation convention at B02-P006 → B02-P007 is reproduced exactly, with the inner single quotation correctly closed, and it is the only unbalanced paragraph in either file; the four formulas carried over from accepted Book 1 are word-for-word identical to Book 1's accepted text; Athena's chain of conditions at B02-P019 survives intact, hedge by hedge; the eagles' flight **to the right** is unglossed; and Mentor's irony at B02-P014 is neither softened nor signposted. Butler's twenty-two dead words and forms are all gone, and none was replaced by a different archaism — with one exception, `whereupon` at B02-P034, which is finding 34.1.

The findings are of two kinds. Ten are the small-loss class Book 1's review named — a Butler qualifier downgraded (*noble* steeds to *fine* horses), a Butler image replaced (eagles *sailing* become *gliding*), a causal *for* dropped, a deliberate pair broken (*aggrieved* / *grievance*; *many* against Mentor's *you are many and they are few*). Four are small local misreadings that a reader would notice as odd rather than as wrong: `or again from Sparta` reordered into `or from Sparta again`, which turns Butler's discourse *again* into a second visit; `set upon us` softened to `come upon us`, which takes the attack out of Leiocritus's boast; `He, then,` turned into `He too`, which asserts a comparison Butler does not make; and one Victorian construction retained intact where it still obstructs (B02-P026's *after what you are keeping*). The rest are preferences.

One finding, **11.1**, is the one the instructions asked to be ruled on rather than deferred again, and it changes accepted Book 1 as well as Book 2.

---

## Rulings on the decisions the drafter put to the reviewer

### 1. Butler's `[do not]` bracket at B02-P004 (PG #1727 line 802) — **the disposition is upheld; the stated reason is wrong; and yes, it needs a decision row of its own, before Book 3, not after**

Butler prints `I pray you by Jove and Themis, who is the beginning and the end of councils, [do not] hold back, my friends, and leave me singlehanded`. The candidate prints `I beg you, by Zeus and by Themis, who is the beginning and the end of councils: do not hold back, my friends, and leave me single-handed`.

**The mark goes and the words stand. That is right**, and the colon is the right substitute: it carries the pointing Butler's bracket was carrying, and "I beg you, by X and by Y…: do not hold back" reads as one plea in modern English. Keeping `[do not]` on the page in an edition with no apparatus anywhere would read as a printing error inside a plea. Deleting the words would reverse the sentence.

**But the reason `continuity.md` gives for it is not Butler's reason, and the correct one is stronger.** The continuity sheet classifies the bracket as *a textual mark (a mark about the state of the source text, rather than a translator's supplement of a second English word…)*. Butler's own footnote **18**, which is attached to this very sentence, says the opposite in terms (PG #1727 line 10926, verified directly):

> `[18] [ “Il.” xxii. 416. σχέσθε φίλοι, καὶ μ’ οἷον ἐάσατε...... The authoress has bungled by borrowing these words verbatim from the “Iliad”, without prefixing the necessary “do not,” which I have supplied.]`

So this is **a translator's supplement, supplied against the Greek, flagged as supplied, and defended in a note** — the very category the continuity sheet contrasts it with. The disposition does not change, and it gets *better*: Butler himself calls the words **necessary**, so keeping them is not an editorial judgement of ours at all.

**It must become a recorded rule now, and the rule has to be written by class, because Butler uses brackets for at least three different things and the next two Books contain two of them.** I enumerated every bracket in PG #1727's translation body (lines 375–10842): fifteen, in three classes.

| class | example | where | what "drop the mark, keep the words" does to it |
|---|---|---|---|
| **A. Words Butler supplies because the Greek lacks them** | `[do not]` (fn 18) | **Book 2, PG 802** | Correct. The words are required by the sense and Butler says so. |
| **B. Explanatory supplements inside the line** | `burning the thigh bones [on the embers]` (PG 1129); `[to be milked]`, `[to feed]` (PG 3992–3) — the class the Book 10 pilot reports | **Book 3, PG 1129 — the very next Book** | Probably correct, but it is a decision: these are Butler explaining, not Butler translating, and the package's standing rule is that nothing explanatory is added. |
| **C. Whole passages Butler brackets as interpolated or added later** | `[and found him in his own house, feasting with his many clansmen…` (PG 1551, fn 36: *“The lines which I have enclosed in brackets are evidently an afterthought”*); also fns 91, 107 | **Book 4, PG 1551**, and later Books | **Wrong, silently.** Dropping the mark converts Butler's recorded editorial doubt into plain narration; dropping the words loses content. Neither default is right, and a drafter applying "the bracket rule" from Book 2 will do the first without noticing. |

**Ruling:** record the `[do not]` decision as its own row in `GLOSSARY.md` and as a ledger decision, in the form *class A: mark dropped, words kept, pointing supplied where the bracket carried it* — and record classes B and C beside it as **open**, with class C explicitly marked as needing a coordinator decision before Book 4 is drafted. The Meditations package needed its bracket classes for exactly this reason. Book 3 hits class B immediately.

### 2. The gloss `the Erinyes—the spirits of vengeance—to avenge her` (B02-P008) — **upheld, at this size, for this reason**

Three words, folded into the sentence, at first use, on the Book 10 pilot's `cubit → roughly eighteen inches` model. It is accurate (the Erinyes are avengers, and Butler's *avenge her* — Penelope, not punish Telemachus — is kept), it is the right size, and it does not turn into an explanation of Greek religion.

**The reasoning about *the Furies* is sound, and the repository supports it more directly than the drafter knew.** *Furiae* is the Roman name; an edition that has just ruled out Ulysses, Minerva and Jove cannot reach for it. Checked: `odyssey-threads.json` has **no entry for either name**, so decision **D8** (the Cast's display name wins) is silent here and supplies no counter-authority. The served `odyssey-modern-en.json` being replaced uses **Furies** in this chapter — so this is a deliberate departure from the file being replaced, and it is the right one. The remaining alternative was Butler's Greek word bare; the gloss is better, because *Erinyes* is opaque in a way *Furies* is not, and the sentence it sits in is the one that explains why Telemachus will not send his mother away.

### 3. `Ilius` (B02-P002) standing beside Butler's own `Troy` (B02-P010) — **upheld, unglossed**

Butler writes `Ilius` four times in the poem (PG 761, 4929, 6164) and `Troy` constantly; he never writes *Ilium*. The two forms are his, they answer to Homer's own two names, and flattening them would erase a distinction the Greek makes. Checked: the served `modern-en` being replaced **drops `Ilius` entirely** and prints *Troy* twice in this chapter — that is the flattening, and the package is right not to copy it.

**Ruled against a gloss**, which I considered under the accessibility standard: a gloss here would flatten precisely what the decision preserves, and nothing in Book 2 depends on the reader identifying Ilius with Troy — Antiphus's death is at the Cyclops's hands on the voyage home, not at Ilius. `land of fine horses` already tells the reader it is a place men sailed to. (Its epithet is a separate finding, **2.1**.)

### 4. `Mycene` (B02-P007), the woman and not the city — **upheld for Book 2, but the glossary row as written will mislead Book 3, and that is records finding R1**

At B02-P007 she is unmistakably a woman: `Tyro, Alcmena, Mycene and the famous women of old`. Butler's spelling is kept, the list does the disambiguating work, and a reader who mistakes her for the city is in exactly Butler's own reader's position. No change, no gloss.

**What is not safe is the glossary row.** `GLOSSARY.md` lists `Mycene` under "Names that change in no Book", with the Book 2 note attached. But **Butler spells the city `Mycene` too** — PG 1377, Book 3: *“For seven years after he had killed Agamemnon he ruled in Mycene”*; PG 9326, Book 21: *“a woman whose peer is not to be found in Pylos, Argos, or Mycene”*. Book 3's drafter will meet the city four hundred lines from here, holding a glossary row that says Mycene is a woman. And the city has a live **D8** claim that the woman does not: `odyssey-threads.json` gives Agamemnon the epithet **“Murdered King of Mycenae”**, so under the Cast-display-name rule the city may have to be spelled *Mycenae* in the modern edition while the woman stays *Mycene*. That is the right answer in my view — it keeps the two apart for a reader who meets both — but it is a decision, and it belongs in the glossary before Book 3 is drafted, not after.

### 5. The four formulas carried over from accepted Book 1 — three confirmed identical, and the fourth, `a beloved daughter deserves`, is **answered, not deferred again: it should change, in both Books**

Verified mechanically that all four are word-for-word identical between `book01/candidate-v2.json` (accepted) and `book02/candidate-v1.json`, and read both contexts: the Zeus-reckoning close at B01-P027 / B02-P008, the ship-and-crew / message-from-heaven / mound cluster at B01-P019 / B02-P012, `in low spirits` at B01-P009 / B02-P020, and the marriage-gifts phrase at B01-P019 / B02-P011. The consistency discipline is working, and it is the package's best feature.

On the flagged one — see **finding 11.1** for the wording. The ruling: **the objection is correct and the fix is free.** Butler's `all the marriage gifts that so dear a daughter may expect` is a claim about custom and expectation; `a beloved daughter deserves` is a claim about desert, and it is the only place in either Book where a moral judgement is added to a suitor's mouth (at B02-P011 the speaker is **Eurymachus**, mid-threat, which makes the added generosity of sentiment stranger still). The reason it was allowed to stand at Book 1 was that no better wording was proposed; there is one, it is Butler's, and it contains no archaism: **`may expect`**. `all the marriage gifts a beloved daughter may expect` keeps the drafter's good improvement (*so dear a daughter* → *a beloved daughter*, which reads cleanly) and returns the verb.

**It changes in both Books at once**, per the instruction: a `book01/candidate-v3.json` with this single substitution at B01-P019, a matching `ACCEPTANCE.md` amendment, and the `GLOSSARY.md` row rewritten. That is a real cost for one word, and the coordinator may reasonably decline it — but it should be declined **as a decision**, recorded in the ledger, rather than deferred a third time.

### 6. The ratio of 0.9993 — **it reflects faithful compression, not light editing; but the drafter's two counter-checks are weak, and here is a stronger one that I ran**

The instructions were right to be suspicious: 0.9993 is a number a light touch-up produces. The drafter's two counter-checks — *no paragraph is byte-identical to Butler* and *22 dead words are gone* — are both satisfiable by a rewrite that changes one word per paragraph, so neither answers the question. I did not rely on them.

What I did instead, after reading all 35 paragraphs beside Butler: measure **how much of Butler's word-token sequence survives unchanged and in order** (name mapping normalized, punctuation and case stripped, `difflib` matching blocks over word tokens).

| | Book 2 candidate v1 | Book 1 candidate v2 (accepted) |
|---|---|---|
| Butler's word tokens carried over unchanged and in sequence | **0.889** | **0.721** |

**So the suspicion is measurable, and it is real: Book 2's rendering is a substantially lighter touch than the Book the coordinator has already accepted.** Ratio-of-word-counts hid that completely; the two files have near-identical word ratios of intent but very different amounts of actual rewriting.

**Having measured it, I then went and read the paragraphs it points at, and the verdict is that the lightness is the source's and not the drafter's.** The ten least-changed paragraphs are B02-P026 (0.974), P029 (0.975), P034 (0.968), P032 (0.963), P024 (0.947), P023 (0.943), P010 (0.940), P019 (0.934), P031 (0.931), P027 (0.930). Every one of them is either plain dialogue (`“Telemachus,” she said, “the men are on board and at their oars…”`) or plain concrete narration (the launching at P034: hawsers, benches, mast, socket, cross plank, forestays, ox-hide ropes). Butler's Book 2 prose in these places is *already* modern English; there is nothing left to modernize without rewriting him for its own sake, which the package forbids. Where Butler's Victorian sentence-chaining does appear — P001, P003, P004, P012, P015, P019 — the candidate does the work, and those are the most-rewritten paragraphs on exactly this measure (P028 0.759, P003 0.767, P001 0.769, P012 0.770).

**One qualification, and it is finding 26.1.** The light touch did leave one Victorian construction standing where a modern reader stumbles: `draw me off some of the best wine you have, after what you are keeping for my father's own drinking`. It is the only one I found, and it is at 0.974 — the highest-retention paragraph in the Book. That is the measure earning its keep.

**Ruling: the ratio is not evidence of a defect, and the measurement above should replace the two counter-checks in `continuity.md`** so the next Book has a check that can actually fail.

---

## Verification performed before reviewing

### Hashes and the README's mechanical checks

All three hashes recomputed locally; all three match `provenance.json`, `manifest.json` and `README.md`. The mechanical-check block in `book02/README.md` was extracted and run **verbatim**, from the stated directory. It printed, exactly:

```
OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio 0.9993
3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7 book02/source-book2.json
2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea book02/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07 ../../../app/public/data/editions/odyssey-original-en.json
```

That block covers: source extraction byte-identical to the served chapter 2, title included; 35 candidate paragraphs one-to-one with 35 source paragraphs; the chapter title mapped to the Greek form; manifest coverage exactly `B02-P001`…`B02-P035` in order; every assigned paragraph reproduced verbatim in its own packet, source and candidate both; the readable copy identical to the JSON; the name counts and all six glossary hazards; zero ASCII quotes; the D4 unbalanced-paragraph invariant at index 5 with B02-P007 opening its own mark; six British spellings absent; the bracket dropped and its words kept; the Erinyes gloss present; the eight Book-1 fragments present in **both** Books; twenty-two archaisms absent; no candidate paragraph equal to its source with newlines flattened; no newline in any candidate paragraph; and the ratio inside 0.90–1.10.

**Five checks of my own, beyond it.**

- **Per-paragraph word ratios, all 35.** Overall 4,181 to 4,184 = 0.9993, as claimed. Minimum **0.951** (B02-P005), maximum **1.059** (B02-P003) — both exactly as `provenance.json` states. Six paragraphs below 0.97, six above 1.02; nothing anomalous at either end.
- **Capitalized-token census, source against candidate.** The only tokens present in one file and absent from the other are the four mapped names (Ulysses/Minerva/Jove/Euryclea → Odysseus/Athena/Zeus/Eurycleia, counts matching exactly: 17, 8, 6, 2) and sentence-initial words created or destroyed by re-sentencing (`Moreover`, `Every`, `Till`, `Thus`, `On`, `Furthermore`, `Sweet`, `Some`, `West` out; `Who`, `Everyone`, `For`, `So`, `Birds`, `Until`, `Someone`, `Still`, `See`, `Fill`, `Stay`, `Do`, `Sweethearts`, `Antinous’s` in). **No name was silently substituted, dropped, added or mis-mapped.** `Ops` 1, with `daughter of Ops, son of Pisenor` intact; `Rhea` 0; `Helios` 0; `Ilius` 1; `Troy` 1; `Mycene` 1; every Roman form 0.
- **The possessive and case hazards, checked for vacuity rather than assumed.** Butler's Book 2 contains **no** `Ulysses’` possessive and **no** `Same`, so glossary hazards 3 and 4 do not fire here at all — the build's silence on them is correct and means nothing. The possessives that do occur follow **D7** consistently: `Antinous’s`, `Telemachus’s`, plus `another’s`, `boy’s`, `father’s`, `heart’s`, `heaven’s`, `mother’s`. Zero ASCII apostrophes; zero bare `Odysseus’`.
- **Quantity and negation census, paragraph by paragraph.** Every stated number survives (twelve jars with lids, about twenty measures, a crew of twenty men, three years and close on four, the fourth year, the twentieth year, three sons, two eagles, two hounds, ten or twelve days), and none is supplied where Butler gives none. The only negation-count differences are four paragraphs where Butler's Victorian double and triple negatives are resolved into correct modern single ones — `bear no more ill blood neither in word nor deed` → `bear no more ill will, in word or deed` (B02-P020), `neither here nor elsewhere` → `here or anywhere else` (B02-P007) — and one where a negation is correctly **added** to render `there is not one of you but has forgotten Ulysses` as `there is not one of you who has not forgotten Odysseus`, which is right. No negation is lost or reversed anywhere.
- **Full word-level opcode diff of all 35 paragraphs, source against candidate**, name-normalized, read in full. That diff is what every paragraph entry below is built from, and it is why I can say that nothing is dropped: every deletion in it is either a Victorian particle (`thereon`, `whereon`, `moreover`, `save only`, `both`, `also`, `do`), a word replaced in place, or a clause reordered. There is no deletion of a claim, an object, a name or a qualifier that is not listed as a finding below.

### The source, verified independently — a different *kind* of rule, audited first

The drafter's rule identifies the apparatus in advance (bare-digit runs), then verifies the identification arithmetically (the body's 187 digit runs read in order as 1…187 against PG's numbered entry list), then strips. It is a good rule. Re-running it would prove nothing, and a reconstruction that also began by deciding what the apparatus is would share its blind spot: both would be unable to see a difference of a class neither had thought of.

**So I inverted it. My rule decides nothing in advance and strips nothing.**

1. **Boundaries, structurally.** `BOOK II` occurs exactly once in the file (line 741) and `BOOK III` exactly once (line 1117); the range is what lies between. No dependence on footnote numbering, on digits, or on `FOOTNOTES:`.
2. **Paragraphs, mechanically.** Maximal runs of non-blank lines, joined with a newline. The first such block is asserted to be all-caps (it is: the three-line chapter heading) and dropped as the heading. **35 blocks remain** — the count is an output of the rule, not an input.
3. **Audit of the range before trusting anything.** Indented lines **0**; `[Illustration` **0**; in-text Greek **0**; daggers **0**; underscores **0**; square brackets **1**, and it is `[do not]`; digit runs `17 18 19 20 21 22 23`, seven of them.
4. **Then the diff, with the apparatus still in.** Character-level `difflib` opcodes, reconstruction against `source-book2.json`, printing **every** difference with 28 characters of context on each side, and requiring me to classify each one before anything was removed. The output is complete and short: **7 differences in 5 paragraphs, every one a pure deletion of a bare digit run**, and nothing else of any kind:

   ```
   B02-P002 delete raw='17'  ctx='ked his last dinner for him.17\nHe had three sons left, of '
   B02-P004 delete raw='18'  ctx='s, and leave me singlehanded18—unless it be that my\nbrave '
   B02-P004 delete raw='19'  ctx='ereas now I have no remedy.”19'
   B02-P013 delete raw='20'  ctx='ords he sat down, and Mentor20 who had been a friend of\nUl'
   B02-P022 delete raw='21'  ctx='r ready about the buildings,21 jeering at\nhim tauntingly a'
   B02-P034 delete raw='22'  ctx='m a fair\nwind from the West,22 that whistled over the deep'
   B02-P034 delete raw='23'  ctx='led over the deep blue waves23 whereon\nTelemachus told the'
   ```

5. **Only then, the removal**, by the one rule the diff itself had justified — delete a digit run glued to a preceding non-space character — and the re-diff: **0 mismatching paragraphs, byte-identical in all 35**, and a second, independent word-token comparison over all **4,184** words with **0** mismatches.

**The two audit findings I was asked to confirm or refute — both confirmed, from my own run.**

- **`FOOTNOTES:` does occur twice**, at line **75** (inside the table of contents) and line **10843** (the real section). Anchoring on the first would put the "body" at zero lines and make any marker relation vacuously true. My rule never touches `FOOTNOTES:` at all — it anchors on `BOOK II`/`BOOK III` — so the trap cannot fire on my side, which is a second, structural way of establishing the same thing the drafter's assertion establishes.
- **Book 2's markers are never preceded by a space** — the preceding characters in my own extraction are `.`, `d`, `”`, `r`, `,`, `,`, `s`, exactly as recorded. So the drafter's whitespace clause is a genuine **no-op for this Book**, and its silence carries no evidence. This matters more under my rule than theirs: my removal rule requires the glued property, and I only adopted it after the diff had shown me all seven cases. It would have to be revisited for a Book among the nine markers PG-wide that are space-preceded.

**One more thing my method establishes that the drafter's cannot, and it is the reason for inverting the rule.** Because it derives the differences instead of stripping a class, it also proves the *absence* of everything nobody thought to look for: had the staged file dropped a word, normalized a quotation mark, joined a line with a space, or silently repaired Butler's `[do not]`, that would have appeared in the opcode list as a non-digit difference. It did not. **The staged Book 2 is Butler's translation body, complete, and nothing of PG's apparatus.** The source claim holds.

*(Two negative controls, confirming the check can fail, matching the drafter's: joining a paragraph's lines with a space instead of a newline differs in 35 of 35; leaving the markers in differs in 5 of 35 — the five listed above.)*

---

## Findings by paragraph

### B02-P001

**Finding 1.1 (minor).** Current: `He bound his sandals on his shapely feet` … `Athena gave him such divine grace of presence that everyone marveled at him`. Butler: `He bound his sandals on to his comely feet` … `Minerva endowed him with a presence of such divine comeliness that all marvelled at him`. **Butler says *comely* of Telemachus's own feet and *comeliness* of what Athena adds, twenty words apart in one paragraph, and the candidate breaks the pair.** The echo is doing work: the young man is already fair to look at, and the goddess pours more of the same quality over him — which is why the councillors make way for him. `shapely` and `grace of presence` are two unrelated words and the connection is gone. Neither *comely* nor *comeliness* is obscure. **Proposed correction:** `on his comely feet` … `such divine comeliness of presence`. Confidence high on the diagnosis, medium on the second half — `gave him such divine comeliness of presence` is slightly stiff, and `gave him such divine beauty of presence`, with `comely feet` kept, would preserve the pair through a shared sense if not a shared root.

**Finding 1.2 (optional).** Current: `Telemachus got up and dressed`. Butler: `Telemachus rose and dressed himself`. **`rose` is not archaic, and the candidate keeps it three paragraphs later** — B02-P004's `rose at once` is Butler's `rose at once`, unchanged. So one plain Butler verb is rendered two ways inside four paragraphs, and the changed one is the Book's opening sentence, where `got up` lands a register below the dawn formula it follows. **Proposed correction:** `Telemachus rose and dressed`. Confidence medium; this is a preference and the drafter may reasonably keep the plainer verb.

*Also noted, no finding.* The dawn formula's reordering is the glossary row, applied, and it is the right call — Butler's order really does leave a reader parsing *appeared Telemachus rose* as one phrase. `criers` → `town criers` adds a word Butler does not have; I considered a finding and decided against, because the added word is doing the job `continuity.md` claims for it (keeping the criers distinct from the herald Pisenor three paragraphs later) and *town crier* is the ordinary English name for the office. `girded his sword about his shoulder` → `slung his sword over his shoulder`, `so they called them` → `they made the call`, and `were got together` → `had come together` are all right. The two hounds, the spear in hand, and the father's seat are exact.

### B02-P002

**Finding 2.1 (minor).** Current: `had gone with Odysseus to Ilius, land of fine horses`. Butler: `had gone with Ulysses to Ilius, land of noble steeds`. **`steeds` is dead and rightly goes; `noble` is neither dead nor obscure, and it is the epithet.** This is a formal Homeric place-epithet — the same construction as *sea-girt Ithaca*, which the package keeps — and `fine` is the flattest available adjective in English. It also collides with `my fine hothead` (B02-P020): *fine* is the candidate's general-purpose upgrade word, and an epithet should not be built from it. **Proposed correction:** `land of noble horses`. Confidence high.

**Finding 2.2 (optional).** Current: `a man bent double with age and of vast experience`. Butler: `a man bent double with age, and of infinite experience`. `infinite` is Butler's hyperbole and is not archaic; `vast` is the same figure one size smaller, bought for nothing. **Proposed correction:** `of infinite experience`. Confidence medium — a preference, and `vast` is not wrong.

*Also noted, no finding.* `had cooked his last dinner for him` kept verbatim: correct, and the continuity sheet's reason for keeping it (the idiom and the literal fact at once, either of which a paraphrase would drop) is the right reason. The three sons, which two farm and which is a suitor, and Aegyptius still weeping as he begins, all survive as distinct facts.

### B02-P003
No material issue found. `host` → `army`, `matter of public moment` → `matter of public importance`, `convene` → `call together`, and the splitting of Butler's two long interrogatives into three shorter ones all keep the sense, and the *or* alternative between warning the assembly and raising another matter survives as an alternative. `hear my words` → `hear what I have to say` is Butler's own variation on the formula and is correctly kept different from B02-P010 and B02-P014. The 1.059 ratio — the Book's highest — is the cost of unpacking `would he speak upon some other matter of public moment` into a full clause, and buys clarity. *Also noted:* `I am sure he is an excellent person` → `an excellent man` narrows Butler's word for no reason; nothing turns on it, and I let it go. *Records note:* `continuity.md` says "Butler's three questions stay three" — Butler has two question marks here, and the candidate has three. The split is fine; the record is wrong (**R2**).

### B02-P004

**Finding 4.1 (minor).** Current: `it is I who am the most wronged` … `My grievance is purely personal`. Butler: `it is I who am the most aggrieved` … `My grievance is purely personal`. **Butler pairs *aggrieved* with *grievance* one sentence later, and the candidate breaks the pair while keeping the second half of it.** The pair is not decorative: Telemachus is answering Aegyptius's question about who convened the assembly and why, and the answer is *I have the grievance* — a claim about standing, which he then immediately qualifies as personal rather than public. `wronged` asserts instead that a wrong has been done to him, which is what the rest of the speech goes on to argue and has not established yet. `aggrieved` is current English. **Proposed correction:** `it is I who am the most aggrieved`. Confidence high.

**Finding 4.2 (minor).** Current: `instead they hang about my father's house day after day, slaughtering our oxen, sheep and fat goats for their banquets`. Butler: `but day by day they keep hanging about my father's house, sacrificing our oxen, sheep, and fat goats for their banquets`. **`sacrificing` → `slaughtering` removes the religious register from the suitors' central offence.** Butler's word is exact and not accidental: these animals are killed at an altar, the feasts are sacrificial feasts, and part of what makes the suitors' consumption an outrage rather than mere greed is that they are performing another man's sacrifices with another man's animals in another man's house. `slaughtering` makes it a butchery bill. The word is not archaic or unclear. **Proposed correction:** `sacrificing our oxen, sheep and fat goats for their banquets`. Confidence high on the diagnosis; medium on whether the drafter will agree that a modern reader hears the ritual sense in *sacrificing* — I think they do, in this context, and the alternative is to lose it entirely.

*Also noted, no finding.* This is the Book's longest and hardest paragraph and every item of Telemachus's case survives in Butler's order: the staff from Pisenor, both misfortunes, the father who was chief and like a father to all of them, the refusal to approach Icarius, the oxen and sheep and fat goats, the unthought-of wine, `No estate can stand such recklessness`, conscience and public opinion, Zeus and Themis, the counterfactual wrong his father may have done the Achaeans, and the closing preference for being eaten by the assembly `for then I could take action against you to some purpose`. The negation in `do not hold back, my friends, and leave me single-handed` correctly scopes over both limbs. `indeed` → `certainly` is a substitution, not the added intensifier Book 1's review objected to. `ward off harm from our doors` → `keep harm from our doors`, `ere long` → `before long`, `lest the gods should be displeased` → `in case the gods are displeased` are all right. On the bracket, see the ruling above: the disposition is upheld and the colon is right.

### B02-P005
No material issue found. Butler's four beats — the staff dashed down, the tears, the general silence, the one exception — survive as four, and the candidate's `no one ventured to give him an angry answer—no one but Antinous` turns Butler's `save only` into a repetition that tightens the sentence instead of loosening it. `spoke thus:` → `said:` is right; the Book's speech tags are consistent throughout.

### B02-P006

**Finding 6.1 (optional).** Current: `for I would not have my skill in needlework perish unrecorded`. Butler: `for I would not have skill in needlework perish unrecorded`. **`my` is supplied.** Butler's bare `skill in needlework` is general — the art itself, not Penelope's possession of it — and the boast is the more graceful for being impersonal. The addition is tiny and it makes the sentence easier; it also makes Penelope, in the middle of her most famous deception, boast about herself in a way Butler declines to. **Proposed correction:** keep Butler's bare `skill in needlework`. Confidence low — the candidate's reading is defensible and the sentence is clearer with *my* in it. Recorded so it is a choice.

*Also noted, no finding.* `tambour frame` → `embroidery frame` is right: the object survives, and the object is the whole trick. `Sweet hearts` → `Sweethearts`, kept as the address rather than softened, is right for the same reason the continuity sheet gives — the arch tone is Penelope's while she is lying to them. `pall` kept, and the second occurrence teaching it, is right. `This three years past, and close on four` → `For three years now, and close on four` keeps the exact reckoning B02-P007 counts from.

### B02-P007

**Finding 7.1 (optional).** Current: `as long as she stays in the mind heaven has now given her, so long we shall go on eating up your estate`. Butler: `as long as she continues in the mind with which heaven has now endowed her, so long shall we go on eating up your estate`. The correlative `as long as … so long` survives, which is right and is the sentence's spine — but `so long we shall go on` is not a construction modern English makes without the inversion. Butler's own `so long shall we` reads better here than the candidate's flattened order, because the inversion is what signals that `so long` is the correlative and not an adverb wandered out of place. **Proposed correction:** `so long shall we go on eating up your estate` — or, if the inversion is unwanted, `we shall go on eating up your estate for exactly that long`. Confidence medium; the current wording is understandable, merely graceless.

*Also noted, no finding.* The suitors' ultimatum survives as a quotation inside Antinous's speech, and the re-pointing (`understand it: ‘Send your mother away…’`) is cleaner than Butler's dash-and-semicolon without losing the nesting. Butler's unclosed outer quotation is preserved and the inner single quotation closed, exactly as **D4** requires; this is the only unbalanced paragraph in either file. `whereon` → `and after that`, `assented` → `agreed`, `on the score of the accomplishments` → `on the strength of the skills`, `they were nothing to your mother any one of them` → `not one of them was anything to your mother` all right. Butler's three-year deception, the maid's betrayal, and the fourth year are exact. `neither here nor elsewhere` → `here or anywhere else` is the double-negative resolution, correct.

### B02-P008
No material issue found. The Book's hardest paragraph for the package's rules and it holds: the gloss is right-sized (see the ruling), Butler's `avenge her` is kept pointing at Penelope, and the closing Zeus-reckoning is word-for-word Book 1's accepted text, accounting metaphor included. `deal rigorously` → `deal harshly`, `at your own cost` → `at your own expense`, `take offence` → `take offense` (spelling standard) all right. *Also noted:* Butler varies his verb — `If you choose to take offence` … `If, on the other hand, you elect to persist` — and the candidate uses `choose` for both. `elect` is stiff enough to justify it and the repetition does not jar; no finding, recorded because it is the inverse of the pattern Book 1's review punished.

### B02-P009

**Finding 9.1 (minor).** Current: `they flew on and on with the wind, gliding side by side in their own lordly flight`. Butler: `they flew on and on with the wind, sailing side by side in their own lordly flight`. **`sailing` is Butler's image and it is not archaic.** Eagles *sailing* on the wind is ordinary English for exactly this motion, and the word carries a resonance the paragraph is entitled to — Zeus's birds sail over the assembly in the Book that ends with Telemachus's ship sailing out of the harbor, the omen and its fulfilment sharing a verb. `gliding` is accurate and inert. **Proposed correction:** `sailing side by side in their own lordly flight`. Confidence high on the diagnosis; the objection is small but the fix is one word and restores a word Butler chose.

*Also noted, no finding.* The omen is kept whole and unexplained: two eagles, the mountain, the wind, side by side, the wheeling over the middle of the assembly, the beating wings, `glaring death into the eyes of the men below`, the fighting and tearing, and the flight **to the right** — which is the omen, and is rightly unglossed, in a Book where the drafter did gloss the Erinyes. That contrast is the correct one: the direction is what Halitherses interprets, and glossing it would do his job for him. `them that were below` → `the men below` right.

### B02-P010

**Finding 10.1 (minor).** Current: `Let the suitors do it of their own accord; it will be better for them. I am not prophesying without due knowledge: everything has happened to Odysseus as I foretold`. Butler: `Let the suitors do so of their own accord; it will be better for them, for I am not prophesying without due knowledge; everything has happened to Ulysses as I foretold`. **Butler's `for` makes the prophet's credentials the *reason* the suitors should act, and the candidate demotes it to a separate assertion.** This is the same loss Book 1's review recorded at its finding 7.2. Halitherses is not making two remarks; he is making one argument — *do it now, because when I tell you something it comes true* — and the full stop cuts the argument in half. The colon that follows does carry the second link (credentials → evidence) correctly; it is the first link that is gone. **Proposed correction:** `it will be better for them, for I am not prophesying without due knowledge: everything has happened to Odysseus as I foretold`. Confidence high.

*Also noted, no finding.* `mischief brewing` → `trouble brewing` is recorded in `continuity.md`; *mischief* in Butler's sense (harm, not naughtiness) is now genuinely misread by modern readers, so the change is licensed, though `mischief` would have survived. `more particularly` → `above all` is applied here, at B02-P018 and at B02-P034 — one Butler phrase, one rendering, three times. Both halves of the prophecy that later Books depend on survive exactly: the twentieth year, and that no one would know him. The `Hear me, men of Ithaca` formula is identical to B02-P014's.

### B02-P011

**Finding 11.1 (minor — and it changes accepted Book 1 as well).** Current: `who will find her a husband and provide all the marriage gifts a beloved daughter deserves`. Butler: `who will find her a husband and provide her with all the marriage gifts that so dear a daughter may expect`. **`may expect` → `deserves` moves the claim from custom to desert.** Butler's phrase describes what a well-loved daughter can look to receive — a statement about what is customarily given. `deserves` is a statement about merit, and it is spoken here by **Eurymachus**, in the middle of a threat, about a woman he has just called artful and is proposing to evict. The moral warmth is not his and not Butler's. This was raised at Book 1 as an unnumbered remark and carried over here for consistency, which was the right call at the time and is why it is only *minor* now. **Proposed correction:** `provide all the marriage gifts a beloved daughter may expect` — keeping the drafter's genuine improvement (`so dear a daughter` → `a beloved daughter`) and restoring Butler's verb, which contains no archaism. **This changes in both Books at once** (B01-P019, B02-P011), plus the `GLOSSARY.md` row. Confidence high on the diagnosis; the cost — reopening an accepted Book for one word — is a coordinator's call, and if it is declined it should be declined on the record rather than deferred a third time. See the ruling above.

**Finding 11.2 (optional).** Current: `I can read these omens far better than you can`. Butler: `I can read these omens myself much better than you can`. **`myself` is dropped**, and it is the word that makes the line a challenge to Halitherses's standing rather than a comment on his competence: Eurymachus, who is not a seer, is claiming the seer's own ground. **Proposed correction:** `I can read these omens myself far better than you can`. Confidence medium — `myself` is easy to hear as redundant emphasis, which is presumably why it went.

*Also noted, no finding.* Eurymachus's threat keeps both limbs — what the young friend will suffer, and the heavier fine on Halitherses — and Butler's aside survives as a parenthesis, correctly converted from dashes to round brackets. `prating` → `going on`, `on the tiptoe of expectation` → `on tiptoe with expectation`, `talks a young one over` → `talks a young one round`, `in the next` → `in the second` all right. The closing sentence, `And we cannot go after the other women whom we should be marrying in due course, because of the way she treats us`, converts Butler's `but for the way in which she treats us` from a counterfactual into a plain cause; the content is the same, and it is far clearer, though it leaves `because of the way she treats us` momentarily attachable to the wrong verb. I considered a finding and decided against.

### B02-P012
No material issue found. The three Book-1 formulas in this paragraph — `a crew of twenty men`, `or—as often happens—some message from heaven may guide me`, and `hold his funeral rites with full honor, raise a mound to his memory, and give my mother in marriage again` — are word-for-word identical to accepted Book 1's B01-P019, which is precisely what the cross-Book consistency rule demands, and I verified it against `book01/candidate-v2.json` rather than taking the build's word for it. The conditional branch is intact in both directions, and `in quest of` → `in search of`, `hither and thither` → `here and there` are right. *Also noted:* `the waste you suitors will make for yet another twelve months` → `the waste you suitors make for another twelve months` drops Butler's `yet`, which carries the weariness of a thing already endured too long; Book 1's accepted text drops it in the same phrase, so changing it here alone would break the formula, and I make no finding.

### B02-P013

**Finding 13.1 (minor).** Current: `He too spoke to them plainly and in all honesty, and said:`. Butler: `He, then, plainly and in all honesty addressed them thus:`. **`then` is a sequential connective; `too` is a comparison, and it asserts something Butler leaves the formula itself to say.** The point of Butler's repeated tag is that it marks Halitherses and Mentor as the two truth-tellers *without comment* — the reader notices the repetition, or does not. `He too` points at the repetition and tells the reader it is there. That the claim happens to be true is not the issue; the standard forbids the explanatory addition, and the formula is weaker for being announced. **Proposed correction:** `He then spoke to them plainly and in all honesty, and said:`. Confidence medium-high; the fix is one word and loses nothing.

*Also noted, no finding.* Mentor's standing — friend of Odysseus, left in charge of everything with full authority over the servants — is kept in full, which matters twice over: it is why the rebuke carries, and it is why Athena takes his shape. `addressed them thus` → `and said` matches the Book's other tags.

### B02-P014
No material issue found, and this is the paragraph I was most prepared to find damaged. **The irony is intact and unsignposted** from `I hope you may never again have a kind and well-disposed ruler` onward; nothing marks it as irony, and nothing softens it. `there is not one of you but has forgotten Ulysses` → `there is not one of you who has not forgotten Odysseus` is the correct reading of a construction that trips modern readers, and the negation is right. `naughtiness` → `wickedness`, `wager their heads that Ulysses will not return` → `stake their heads on Odysseus never coming back`, `equitably` → `fairly`, `henceforward` → `from now on`, `such scandalous goings on` → `goings-on` all right. The closing accusation, `for you are many and they are few`, is kept as the accusation it is.

### B02-P015

**Finding 15.1 (minor).** Current: `It is a hard thing for one man to fight a crowd over his food`. Butler: `It is a hard thing for one man to fight with many about his victuals`. **`many` → `a crowd` breaks a verbal answer across a paragraph break.** Mentor has just finished, one paragraph earlier, with `for you are many and they are few` — and Leiocritus's opening move is to pick up *many* and turn it round: one man against many is a bad bet, so your numbers prove nothing. Butler's repetition is how the exchange is joined. `victuals` is dead and rightly goes; `many` is not. **Proposed correction:** `for one man to fight with many over his food`. Confidence high.

**Finding 15.2 (minor).** Current: `Even if Odysseus himself were to come upon us while we were feasting in his house, and do his best to drive us out`. Butler: `Even though Ulysses himself were to set upon us while we are feasting in his house, and do his best to oust us`. **`set upon us` is an attack; `come upon us` is finding us there.** The whole of Leiocritus's boast is a picture of Odysseus *attacking* and losing — which is why the next clause reaches for his wife's disappointment and his blood on his own head. With `come upon`, the aggression enters only at `do his best to drive us out`, and the sentence's escalation is flattened at exactly the point it should bite. **Proposed correction:** `were to set upon us while we were feasting in his house`. (`set upon` is current English; if the drafter judges otherwise, `were to attack us`.) Confidence high.

**Finding 15.3 (optional).** Current: `let the boy's father's old friends, Mentor and Halitherses, speed him on his journey`. Butler: `let his father's old friends, Mentor and Halitherses, speed this boy on his journey`. The rearrangement stacks two possessives on one noun phrase, which English reads badly, and it does so to avoid a pronoun that was not ambiguous. **Proposed correction:** `let his father's old friends, Mentor and Halitherses, speed the boy on his journey`. Confidence medium; purely a matter of prose.

*Also noted, no finding.* Leiocritus's closing sneer — `if he goes at all, which I do not think he will, for he is more likely to stay where he is until someone comes and tells him something` — is kept whole, with the reason, which is what makes it a sneer. `his blood would be on his own head` kept as the idiom it still is. `set the people on to stop us` right. `do you people go about your business` → `the rest of you go about your business` introduces a partition Butler does not mark, but it is the sense (the assembly disperses; two named men stay behind), and I let it go.

### B02-P016
No material issue found. `abode` → `home` is the archaism gone, and `On this` → `With this` matches the Book's other transitions.

### B02-P017
No material issue found. **`all alone` is kept**, which is the paragraph — the first time in the poem Telemachus is by himself — and `by the sea side` → `along the sea shore`, `grey` → `gray` (spelling standard) are right.

### B02-P018
No material issue found. Telemachus addresses Athena as `you god`, masculine and unknowing, and the candidate keeps it: he does not know who she is, and a reader who is told would lose the scene. `bade me sail the seas` → `told me to sail the seas`, `more particularly` → `above all` (consistent with B02-P010 and B02-P034), `hindering me that I cannot do so` → `hindering me, so that I cannot` all right.

### B02-P019
No material issue found, and this is the Book's other high-risk paragraph. **Every condition and hedge in Athena's speech survives, in Butler's order and with its force**: *if* you are made of the same stuff; *unless* you have the blood of Odysseus and of Penelope in your veins; sons are *seldom* as good, *generally* worse, not better; *as* you are not going to be fool or coward; *not entirely without some share* of your father's wise discernment. Nothing is upgraded into a promise. The provisioning instructions keep their objects, and `the barley meal, which is the staff of life` is kept as Butler's phrase rather than explained. `beat up volunteers` → `round up volunteers`, `leathern` → `leather` right. At 301 words it is the longest paragraph in the Book and one of the least altered (0.934 on the token measure) — checked closely for that reason, and the reason is that Butler's Athena already speaks plainly. *Also noted:* `Now, however, return home` → `For now, go home` keeps the temporal and drops the contrastive; nothing turns on it.

### B02-P020

**Finding 20.1 (minor).** Current: `Antinous came up to him at once, laughed, and took his hand in his own`. Butler: `Antinous came up to him at once and laughed as he took his hand in his own`. **Butler's laugh and the hand-taking are one gesture; the candidate makes them two acts in a list.** This is Antinous's false friendliness in a single movement — he laughs *while* taking the hand, which is what makes the hand-taking a mockery rather than a greeting, and it is why Telemachus snatches his hand back two paragraphs later. Three items in a row (`came up, laughed, and took`) reads as a sequence of separate civilities. **Proposed correction:** `Antinous came up to him at once and laughed as he took his hand in his own`. Confidence high.

*Also noted, no finding.* `moodily` → `in low spirits` matches accepted B01-P009, and `outer court` matches B01-P032. `my fine fire-eater` → `my fine hothead` is right: *fire-eater* now reads either literally or as a circus act. `bear no more ill blood neither in word nor deed` → `bear no more ill will, in word or deed` resolves Butler's grammar, not his meaning. `The Achaeans will find you in everything` → `will provide you with everything` correctly kills a dead sense of *find*.

### B02-P021
No material issue found. The refusal keeps its three steps in order — he will not eat with them, they wasted his property while he was a boy, he is stronger now — and the closing concession, `must be a passenger and not a captain`, is kept, which matters because the voyage is the answer to it. `with such men as you are` → `in the company of men like you` is a slight expansion that reads naturally and loses nothing.

### B02-P022
No material issue found. `snatched his hand from that of Antinous` → `snatched his hand out of Antinous's` is right, and the jeering is kept as jeering rather than described.

### B02-P023

**Finding 23.1 (minor).** Current: `he can bring friends to help him from Pylos, or from Sparta again, where he seems bent on going`. Butler: `he thinks he can bring friends to help him from Pylos, or again from Sparta, where he seems bent on going`. **Butler's `again` is the discourse word meaning *or else, for another thing*; moved to after `Sparta`, it becomes the ordinary adverb meaning *a second time*.** The candidate's sentence says Telemachus would be fetching friends from Sparta once more — and then contradicts itself four words later with `where he seems bent on going`, which tells the reader he has not been. It is a small thing that makes a reader stop. **Proposed correction:** `or else from Sparta, where he seems bent on going` — or simply `or from Sparta`. Confidence high.

*Also noted, no finding.* `one youngster` → `one young man` is fine, and the two anonymous suitors are kept anonymous and kept distinct.

### B02-P024
No material issue found. `amongst` → `among`, `In this case` → `In that case`, and the semicolon turned into a dash are all right, and the second suitor's calculation — the property divided, the house left to the mother and whoever marries her — survives exactly.

### B02-P025
No material issue found. The store-room keeps its whole inventory and its order: the gold and bronze heaped on the floor, the linen and spare clothes in open chests, the fragrant olive oil, the casks of old well-ripened wine ranged against the wall, the doors opening in the middle, and Eurycleia in charge night and day. `unblended` → `unmixed` is right and the reason matters — Butler means unmixed with water, which is what makes it fit for a god. **`Eurycleia, daughter of Ops, son of Pisenor` is intact**, which is glossary hazard 1 and the one that would actually have fired. `lofty` → `high`, `house-keeper` → `housekeeper` right.

### B02-P026

**Finding 26.1 (minor).** Current: `Nurse, draw me off some of the best wine you have, after what you are keeping for my father's own drinking`. Butler: identical but for punctuation. **This is the one place where a Victorian construction was carried over intact and still obstructs.** `after what you are keeping` means *next best after the wine you are reserving*, and a modern reader meets `after` as temporal — draw the wine *after* doing something else — and has to reread. The clause is doing real work (Telemachus takes the second-best, because his father's wine stays untouched against his return, which is the same tenderness as the casks `in case Odysseus should come home again after all` in the paragraph before), so it cannot simply go. This is also the Book's highest-retention paragraph (0.974 of Butler's word tokens), which is what drew me to it. **Proposed correction:** `draw me off some of the best wine you have apart from what you are keeping for my father's own drinking` — one word, and the ambiguity is gone. Alternative: `the best wine you have after the wine you are keeping…`. Confidence high on the diagnosis, medium on the wording.

*Also noted, no finding.* Every quantity is exact — twelve jars, lids on all of them, about twenty measures, well-sewn leather bags — and none is supplied that Butler does not state. The secrecy instruction stays an instruction.

### B02-P027
No material issue found. Eurycleia's objection keeps all four of its parts in order: the question, the reminder that he is the one hope of the house, the fear of what the suitors will do behind his back, and the plea to stay. `what ever` → `whatever`, `these wicked ones here` → `these wicked men here`, and `the barren ocean` → `the barren sea` are all recorded and defensible; *ocean* would have done as well, and nothing turns on it.

### B02-P028
No material issue found. The oath's terms are exact — ten or twelve days, and the exception if she asks — and `my plan is not without heaven's sanction` keeps the *heaven* metonym, which the package is right to leave alone throughout. The reason Telemachus gives, `for I do not want her to spoil her beauty with crying`, is kept in full; it is the kind of line an edition trying to dignify its hero would quietly drop. `Fear not` → `Do not be afraid` right.

### B02-P029
No material issue found. The oath, the wine drawn off, the meal bagged, the return to the suitors — Butler's order, nothing summarized. `completed her oath` → `finished her oath` right.

### B02-P030
No material issue found. Noemon son of Phronius, the sundown rendezvous, the tackle `that ships generally carry`, and the ship stationed at the end of the harbor all survive; `bethought her of another matter` → `thought of something else` is the archaism gone, and `harbour` → `harbor` is the spelling standard.

### B02-P031

**Finding 31.1 (optional).** Current: `Then she went to the house of Odysseus, and threw the suitors into a deep slumber. … Then she took the form and voice of Mentor`. Butler: `Furthermore she went to the house of Ulysses … Then she took the form and voice of Mentor`. Butler opens with an additive (*furthermore* — one more thing Athena did) and closes with a sequential (*then*); the candidate uses `Then` for both, so the paragraph opens and closes on the same word four sentences apart. **Proposed correction:** `Next she went to the house of Odysseus` — or `She also went`. Confidence medium; a matter of prose, with no loss of sense either way.

*Also noted, no finding.* `She caused their drink to fuddle them` → `She made their drink go to their heads` is the paragraph's real problem solved, and solved well: *fuddle* is dead, and the replacement keeps the agency exactly where Butler puts it — the drink does it, and Athena makes the drink do it. The dropped cups and the heavy eyes survive.

### B02-P032
No material issue found.

### B02-P033
No material issue found. `cloister` → `gallery` matches accepted B01-P023 for the same part of the house — a cross-Book consistency the package predicted and kept. `except one` is kept, and it lands correctly: the one is Eurycleia, and the reader has just watched her swear.

### B02-P034

**Finding 34.1 (minor).** Current: `a fair wind from the west, that whistled over the deep blue waves, whereupon Telemachus told them to catch hold of the ropes`. Butler: `a fair wind from the West, that whistled over the deep blue waves whereon Telemachus told them to catch hold of the ropes`. **Butler's `whereon` is rendered three ways in this Book — `and then` (B02-P009), `and after that` (B02-P007), and here `whereupon`, which is the archaism itself, lightly respelled.** The package's own mechanical check asserts that `whereon` does not survive; it passes, and the word survived anyway under one letter's disguise. `whereupon` is a legalism in current English and is exactly the register the voice rules exclude. **Proposed correction:** `and then Telemachus told them to catch hold of the ropes`, matching B02-P009. Confidence high on the register; medium on which of the two existing renderings to standardize on, and the drafter may reasonably want the connective to vary with the syntax rather than being fixed — in which case say so in `continuity.md`, since `whereon` is a connective and not a content word.

**Finding 34.2 (optional).** Current: `When they had brought the things down as he told them`. Butler: `When they had brought the things as he told them`. `down` is supplied. It is harmless and probably right — the stores come from the gallery to the shore — but it is a physical direction Butler does not give, in the Book's most physically exact paragraph, where the package's own rule is that concrete detail is kept exactly and not supplied. **Proposed correction:** drop `down`. Confidence low; recorded for consistency with the rule rather than because the sentence suffers.

*Also noted, no finding.* The launching survives complete and in order: hawsers loosed, benches taken, the west wind, the ropes, the mast set in its socket in the cross plank, raised, made fast with the forestays, white sails hoisted with ropes of twisted ox hide, the sail bellying, `the foam hissed against her bows as she sped onward`, all made fast, the mixing bowls filled to the brim, the drink offerings `to the immortal gods that are from everlasting` — kept, and rightly: the phrase is elevated but perfectly transparent, and the tautology with *immortal* is Homer's. `grey-eyed daughter of Jove` → `gray-eyed daughter of Zeus` is the glossary row with the American spelling, applied. `West` → `west` is a modern convention and correct.

### B02-P035
No material issue found. `Thus, then,` → `And so` and the Book's one-sentence close kept as one sentence.

---

## Records findings

These are about the package's own files, not about the candidate's text. None blocks acceptance; **R1 should be done before Book 3 is drafted.**

**R1 (minor, records) — `GLOSSARY.md`'s `Mycene` row will mislead the Book 3 drafter, and Book 3 is next.** The row lists `Mycene` under names that change in no Book, annotated with B02-P007's finding that she is *the woman, not the city*. **Butler spells the city `Mycene` too**, at PG 1377 (Book 3: *“he ruled in Mycene”*) and PG 9326 (Book 21: *“Pylos, Argos, or Mycene”*). Split the row by referent; and settle now whether the **city** takes `Mycenae` under decision **D8**, since `odyssey-threads.json` gives Agamemnon the epithet *“Murdered King of Mycenae”* and D8 says the Cast's display name wins. My recommendation is yes — *Mycene* the woman, *Mycenae* the city — because it keeps two identically-spelled referents apart for a reader who meets both, and because it is D8 applied exactly as written rather than by the drafter's judgement of what looks Greek. Either way it is a decision, and it is due before the paragraph that needs it is drafted, per `WORKFLOW.md` step 2.

**R2 (minor, records) — `continuity.md`'s B02-P003 entry is wrong on a countable fact.** It says "Butler's three questions stay three". Butler's B02-P003 has **two** question marks; the candidate has three. The split is a good one and I make no finding against the text — but the continuity sheet is the audit trail, and a reviewer who checks it against the source finds a claim that does not hold. Restate as what actually happened: Butler's second interrogative, which carries three limbs, is split into two questions.

**R3 (optional, records) — the archaism assertion list has a gap the text walked through.** `README.md` asserts that `whereon` does not survive; it does not, but `whereupon` does (finding 34.1). Whatever is decided there, add `whereupon` to the list, and consider the general point: an assert-list of exact dead words cannot catch a dead word respelled, so the list is a regression guard and not a check.

**R4 (optional, records) — the `[do not]` bracket is classified on the wrong grounds, and Butler supplies the right ones.** `continuity.md` calls it "a textual mark … rather than a translator's supplement of a second English word". Butler's footnote 18 says: *"The authoress has bungled by borrowing these words verbatim from the 'Iliad', without prefixing the necessary 'do not,' which I have supplied."* It is a translator's supplement, supplied against the Greek and defended in a note. The disposition is unaffected and is upheld; the record should quote Butler, which is stronger than the classification, and the bracket-class table in the ruling above should go into `GLOSSARY.md`.

---

## Coverage and limitations

**Coverage is complete.** Every paragraph from `B02-P001` to `B02-P035` has exactly one entry above — a numbered finding or "No material issue found." Sixteen paragraphs carry findings; nineteen do not. The twelve packets were read in order, with their `CONTEXT ONLY` neighbours, before any finding was written, and the candidate was then read continuously for voice, pacing, repetition, terminology and transitions. The continuous read produced findings 1.2, 15.1 and 31.1, which are all cross-paragraph, and confirmed that the Book's speech tags, its two `Hear me, men of Ithaca` formulas, its three renderings of `more particularly`, and its four Book-1 carry-overs are each consistent with themselves.

**Limitations, stated plainly.**

- **This review cannot prove that no error remains.** It is one reader's close comparison of 4,184 words against 4,181, plus the mechanical checks listed above. A semantic error that reads naturally in both texts is exactly the kind this method finds least reliably.
- **I did not consult Homer's Greek**, except to confirm two facts of reference that Butler's own apparatus supplies (footnote 18's Iliad parallel, and that Mycene at B02-P007 stands in a list of women). This edition modernizes Butler, and going behind him to the Greek is a different project — the same line Book 1's review drew at its findings 1.1 and 5.1.
- **I did not consult Fagles, Lattimore, Wilson, Fitzgerald or any other in-copyright translation**, and no finding claims or implies an import from one. On the question of imported phrasing I can offer positive evidence rather than an assurance: **88.9% of Butler's word tokens survive in the candidate unchanged and in sequence**, and the two passages most exposed to famous rival renderings — the dawn formula and the launching at B02-P034 — are built from Butler's own words in Butler's own order (`the child of morning, rosy-fingered Dawn`; `the foam hissed against her bows`). A text that reuses nine words in ten of its source has very little room in it for anyone else's.
- **The source verification is as strong as the assumption that `source-texts/pg1727-butler-1900.txt` is PG #1727.** I recomputed its hash and matched `PROVENANCE.md`; I did not re-fetch it from gutenberg.org. Everything downstream of that file I derived myself.
- **No numerical score is assigned**, and no claim is made that the Book is error-free.
