# Independent review — the Odyssey, Book 1, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer session spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/odyssey-modern-en-20260911`, worktree `/home/user/tinct/.claude/worktrees/agent-a8e2f51d6d57b0437` |
| Candidate | `book01/candidate-v1.json`, sha256 `8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9` — recomputed locally; matches `provenance.json`, `manifest.json` and `README.md` |
| Source | `book01/source-book1.json` sha256 `fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4` (matches), byte-identical to chapter 1 of `app/public/data/editions/odyssey-original-en.json` sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` (matches); PG base `source-texts/pg1727-butler-1900.txt` sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (matches) |
| Source-verification claim | **Verified independently, and it holds.** Not by re-running the build: I wrote my own reconstruction of PG #1727 lines 376–740 from a property of the text the build does not use — the numbered entry list in PG's own `FOOTNOTES:` section — after auditing every apparatus class in the range against the raw lines. It reproduces the staged Book 1 **byte-for-byte in all 32 paragraphs, zero diffs.** Method and audit in `review/README.md` and below. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-11.md`, in order, three paragraphs at a time with the `CONTEXT ONLY` neighbours (coverage `B01-P001`…`B01-P032`, each exactly once); then `candidate-v1-readable.md` read straight through |
| Translations consulted | Butler 1900 only. Fagles, Lattimore, Wilson, Fitzgerald and every other in-copyright translation were **not** read for this review, and no finding claims an import from one. |

## Verdict

**Accept after corrections.**

| Severity | Count |
|---|---|
| standing (book-wide, coordinator decision) | **1** |
| substantive (must be fixed before acceptance) | **3** |
| minor (worth improving) | **33** — 29 paragraph-level, 4 records |
| optional (preference, no defect) | **5** |
| paragraphs with no material issue at all | **5** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Butler's own words and the glossary as it will read after the standing finding is applied. "Also noted" remarks inside an entry are not numbered findings.

**Book 1 is sound in structure and in provenance, and freer in the line than the package's own rules describe.** Paragraph alignment is exact, no paragraph is dropped or merged, every proper name occurs the same number of times in the candidate as in the source, direct speech is direct speech in all thirteen speeches, Butler's unclosed-quotation carry-over at B01-P018 → B01-P019 is reproduced exactly and is the **only** unbalanced paragraph in either file, and the three fixed formulas in `GLOSSARY.md` are applied every time they occur. There is no invented content of any size, no explanatory gloss, no modern interpretation, and nothing traceable to another translation.

What the review does find is a recurring class of small losses at the level of the individual word: Butler's concrete nouns softened to general ones (*damask* → fine linen, *mountain* → hill, *outer court* → courtyard, *an eye of Polyphemus* → nothing), his qualifiers dropped (*unrighteously*, *divine* voice, *fine looking*), his deliberate repetitions broken (*longer* legs / *longer* purse; *chief* in Ithaca / *chief* in my own house), and a handful of intensifiers and clarifiers added that he does not have (*certainly*, *at least*, *his son*, *with an excuse for doing nothing*). Each one is individually small. Together they are the difference between a modernisation and a retelling, and the accessibility standard the package adopted says explicitly that every image, qualification and meaningful repetition survives. The three substantive findings are the three places where the loss changes what the sentence asserts.

Separately, and above all of this, the **name forms are wrong for this product** — see the standing finding. That is not the drafter's error; its brief told it to follow the served original. It is a coordinator decision now recorded here so the corrections step can apply it by script.

---

## Standing finding S1 (substantive, book-wide) — Greek name forms, not Butler's Roman ones

**Coordinator decision, applied here as one standing finding rather than repeated in twenty paragraph entries.** The edition uses **Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus**, not Butler's **Ulysses, Minerva, Jove, Neptune, Mercury, Saturn**.

The drafter's `GLOSSARY.md` decision D1 (keep Butler's forms) was a reasonable reading of its own brief and is correctly reasoned and correctly recorded. It is nevertheless overruled, and the evidence in the repository is one-sided:

- `app/public/data/editions/odyssey-threads.json` — the Cast data the reader sees beside the text — names these characters **Odysseus (319 occurrences), Athena (21), Zeus (24), Poseidon (19), Hermes (12)**, against **one occurrence each** of Ulysses, Minerva, Jove, Neptune and Mercury, and every one of those five is inside a `searchNames` alias array, not a display name.
- `app/public/data/onboarding/odyssey.json` — the Book Onboarding content a first-time reader meets *before* the text — uses **Odysseus 21 times**, Poseidon 4, Athena 1; "Ulysses" appears twice and "Jove" once.
- The served `odyssey-modern-en.json` now being replaced uses the Greek forms throughout.
- The Odyssey Book 10 pilot independently chose the Greek forms.

A reader who meets "Odysseus" in the onboarding, taps a highlighted "Odysseus" in the Cast, and then reads "Ulysses" in the modern edition has been handed two names for one man by the same product on the same screen. Butler's forms stay, correctly, in `original-en`, which is Butler; the modern edition is not Butler and does not owe them.

**One consequence worth saying plainly:** applying this removes the only stated blocker between this package and the Book 10 pilot draft (`PROVENANCE.md` §3, ledger A2). After the remap the two packages agree on names, and Book 10's disposition becomes a question about its unreviewed status alone.

### Roman → Greek mapping table for Book 1

Complete. Every capitalised name in the candidate was enumerated and classified; the six rows below are the entire set that changes. Counts are occurrences in `candidate-v1.json`, verified by case-sensitive word-boundary match.

| # | Butler form | Greek form | plain | poss. | total | paragraphs |
|---|---|---|---|---|---|---|
| 1 | Ulysses | **Odysseus** | 14 | 3 (`Ulysses's`) | **17** | P002, P005, P006, P007, P008, P014, P015, P018, P025, P029 |
| 2 | Minerva | **Athena** | 12 | 0 | **12** | P005, P007, P009, P010, P012, P014, P016, P018, P021, P023, P026, P032 |
| 3 | Jove | **Zeus** | 6 | 0 | **6** | P001, P003, P006, P025, P027, P028 |
| 4 | Neptune | **Poseidon** | 5 | 1 (`Neptune's`) | **6** | P002, P003, P006 |
| 5 | Mercury | **Hermes** | 3 | 0 | **3** | P004, P007 |
| 6 | Saturn | **Cronus** | 2 | 0 | **2** | P005, P007 |

**Total 46 substitutions across 20 of the 32 paragraphs.** Twelve paragraphs carry none of the six at all: P011, P013, P017, P019, P020, P022, P024, P030, P031, and three others.

### Mappings that are not one-to-one, and wordings that depend on the Roman form

Six items. Every one is a way for a naive find-and-replace to corrupt the text, and the first is the one that would actually fire.

1. **`Ops` must NOT be mapped — it is already Greek.** B01-P032: "Euryclea, daughter of Ops, son of Pisenor". Butler's Ops is Ὦψ, Eurycleia's grandfather. *Ops* is **also** the Roman name of Rhea, Cronus's consort, and any mapping table assembled from a general Roman→Greek deity list will contain the row `Ops → Rhea`. Applying it here would replace a man's name with a goddess's and break the genealogy the review instructions single out. **Exclude explicitly, with a comment saying why.**
2. **`Saturn` occurs only inside a fixed epithet, and the epithet's glossary row must be rewritten with it.** Both occurrences are "Father, son of Saturn, king of kings" (B01-P005, B01-P007). After the remap the fixed form is **"Father, son of Cronus, king of kings"**, and `GLOSSARY.md`'s row must be edited, not just the candidate — otherwise the next Book is drafted against a row describing an edition that no longer exists. Note also that `GLOSSARY.md` currently spells the Greek form **"Cronos"** in two places while the coordinator's decision is **"Cronus"**; settle on *Cronus* and make the file say so. There is no Cast entry for this figure, so `odyssey-threads.json` supplies no authority; *Cronus* is the standard English form and is the coordinator's.
3. **The possessive of a name ending in -s is an open decision the script must encode.** Butler writes `Ulysses’`; the candidate writes `Ulysses's` (three times). Both become **`Odysseus's`** or **`Odysseus'`**, and the choice recurs in every Book. Recommend `Odysseus's` — it matches the candidate's existing `Telemachus's`, `Phemius's` and `Agamemnon's`, and is what an English reader says aloud. Decide it once, record it, and have the script assert that no bare `Odysseus'` survives. (See also records finding **R1**: the apostrophe character itself needs a decision.)
4. **Matching must be case-sensitive and word-bounded.** `Same` is the island in B01-P017 ("Dulichium, Same, and wooded Zacynthus"). A case-insensitive pass over a table containing any short name destroys ordinary words; this is the paragraph where it shows.
5. **`heaven` is not a name and must not be touched.** It occurs **ten** times in the candidate as Butler's metonym for the gods collectively ("it rests with heaven to decide", "call heaven to witness", "heaven has laid other sorrows on me", "some message from heaven"). It is not a stand-in for Jove and does not become "Zeus". A remap pass that also "normalises theology" would wreck ten sentences.
6. **`Hyperion` stays as it is.** B01-P001, "the cattle of the sun-god Hyperion". Already Greek; Butler's "Sun-god" is a description, not a Roman name. Do not expand to "Helios".

**Not a mapping, but decide it in the same pass — `Euryclea`.** Butler spells the nurse *Euryclea*; the Cast's display name is **Eurycleia** (`odyssey-threads.json`, with "Euryclea" recorded as a `searchNames` alias, so Cast highlighting works either way). Since the edition is adopting the product's Greek forms, adopt the product's spelling too: **Eurycleia**, one occurrence, B01-P032. Optional in force, but it costs one word and removes the last name on which the text and the Cast disagree.

**Names verified as needing no change** (all already Greek in Butler, all occurring the same number of times in source and candidate): Telemachus, Penelope, Calypso, Laertes, Nestor, Menelaus, Agamemnon, Orestes, Aegisthus, Atlas, Thoosa, Phorcys, Polyphemus, Cyclopes, Mentes, Anchialus, Taphians, Temesa, Rheithron, Neritum, Phemius, Icarius, Antinous, Eupeithes, Eurymachus, Polybus, Pisenor, Ephyra, Ilus, Mermerus, Dulichium, Same, Zacynthus, Ithaca, Troy, Sparta, Pylos, Achaeans, Danaans, Argives, Argos, Hellas, Ogygia, Ethiopians, Olympus/Olympian, Hyperion, Ops. **Diana does not occur in Book 1** (verified: zero occurrences in source and candidate), so `GLOSSARY.md`'s Diana row is correctly marked "not yet met"; it becomes **Artemis** when it is.

### Files the remap touches beyond the candidate

The corrections step should treat this as a package-wide edit, not a candidate edit: `GLOSSARY.md` (the naming decision and the "son of Saturn" row), `PROVENANCE.md` §2 and §3 (which argue *for* Butler's forms), `00-progress-ledger.md` (decision **D1** reversed, **A1** answered — recorded as answered by the coordinator, not deleted), `WORKFLOW.md`'s "Names" voice rule, `book01/continuity.md`, `book01/review-instructions.md`, and the regenerated `candidate-v1-readable.md` and `review-packets/`. `book01/source-book1.json`, the served `original-en`, and this findings file quote Butler and keep his forms.

---

## Verification performed before reviewing

### Hashes and the README's mechanical checks

All four hashes recomputed locally; all four match. The mechanical-check block in `book01/README.md` was extracted and run verbatim. It printed `OK — 32 paragraphs, manifest coverage exact, packets verbatim, ratio 0.943` and the three expected hashes. It covers: `source-book1.json` byte-identity to chapter 1 of the served original; 32 candidate paragraphs one-to-one with 32 source paragraphs; manifest coverage exactly `B01-P001`…`B01-P032` in order; every assigned paragraph reproduced verbatim in its own packet, source and candidate both; the readable copy identical to the JSON; the overall word ratio at or above 0.90; and the unclosed-quotation invariant at source indices 17/18.

I added five checks of my own.

- **Per-paragraph word ratios, all 32.** Overall 4,110 to 3,874 = **0.943**. Minimum **0.858** at B01-P017, as `provenance.json` states; next lowest 0.866 (P011), 0.867 (P016), 0.872 (P009), 0.885 (P001). Five paragraphs are **above** 1.0 (P003 1.045, P013 1.024, P015 1.017, P018 1.016, P029 1.011). Nothing here looks like silent compression; see the ruling on P017 below.
- **Quotation balance, paragraph by paragraph, both files.** Exactly one unbalanced paragraph in each, and it is the same one: source P018 (2 open, 1 close) and candidate P018 (2 open, 1 close). Butler's convention is preserved and no *new* unclosed speech was introduced anywhere. The candidate has one open/close pair fewer than the source overall (30/29 against 31/30), which is entirely accounted for by B01-P027 regrouping Butler's split vocative — see **R5**.
- **Name-token census, all 57 proper names.** Every name occurs the same number of times in candidate and source, with two intended exceptions: `Neptune` 5 to 6 (B01-P006 resolves Butler's pronoun "he will not kill Ulysses outright" to "Neptune will not kill Ulysses outright" — a correct disambiguation, since the referent is genuinely ambiguous after two sentences naming both Neptune and Polyphemus), and `Ogygian` to `Ogygia`. **No name was silently substituted away from Butler's form**; the glossary's naming decision was followed exactly as written. That is what makes S1 a coordinator decision rather than a defect.
- **Formula census.** Butler's insistent-request formula occurs **four** times in Book 1 and the candidate renders all four as the glossary's "tell me truly": B01-P013 twice (`tell me and tell me true` and `Tell me also truly, for I want to know`), B01-P014, B01-P016. `son of Saturn, king of kings` twice, both identical. `father of gods and men` once. **No formula is rendered two ways anywhere.** (One records nit on the glossary's own citation of these: **R4**.)
- **Archaism sweep.** Butler's Book 1 carries eleven dead words and forms (`whatsoever`, `must needs`, `wherewith`, `whereon`, `forthwith` twice, `bade`, `yonder`, `to-morrow`, `hither`, `hied`). **Zero survive in the candidate**, and none was replaced by a different archaism. On the reading standard's own terms this is the candidate's clearest success.

### The source, verified independently — my own reconstruction first, then the audit

The method the Meditations package settled on is explicit that a re-run of the build proves nothing and that a reconstruction sharing the build's blind spot proves nothing either. So, in this order:

**First, I enumerated every apparatus class in the raw range before writing any code**, reading PG #1727 lines 376 to 740 directly.

1. **Indented lines: zero.** Every line in the range is flush left. The entire Meditations family of failures — footnote bodies, verse runs, illustration captions, unmarked continuations — is defined by indentation, and none of it can occur here. This range has no indentation to classify.
2. **Square brackets: zero.** No `[A-D]` opener, no `[N]` marker, no editorial insertion. (Butler's own bracketed passages exist elsewhere in PG #1727 — his footnote 36 discusses "the lines which I have enclosed in brackets" — but none is in Book 1.)
3. **Illustration markers: zero. In-text Greek: zero. Daggers: zero. Underscores: zero.**
4. **Short standalone flush-left lines: twenty-three.** I checked every one by eye against its neighbours. Twenty-one are the last, short, wrapped line of a paragraph followed by a blank line (`let him get home.`, `everything in full.”`, `sitting.`) — body text, not apparatus. The remaining two are `BOOK I` and the two-line all-caps chapter heading, both outside the body range. **No running head, no page number, no catchword.**
5. **Footnote references: sixteen, and they are bare digits glued to the text** — `and the other East.1`, `for her feet,2`, `Temesa4`, `middle Argos.”9`, `mine above all others 10—for it is I`, `cloisters11,`, `in a tower13`. This is the range's **only** apparatus class, and it is exactly the class that can vanish into a word and leave no trace: a marker stripped carelessly leaves `others —for` with a doubled space, or `cloisters ,`.

**Then I derived the marker rule from a property the build does not use.** Rather than pattern-matching digits — which is what any build would do, so a reconstruction doing the same would share its blind spot — I took the rule from **PG's own footnotes section at line 10843**, which numbers its entries 1 to 187. Over the whole translation body (lines 375 to 10842) there are **187 digit runs, and they are the sequence 1, 2, 3 … 187 in order, with no repeats and no gaps** — against 186 bracketed entries numbered up to 187 (entry 29 is absent from PG's list; that gap is in Book III and does not touch Book 1). The two counts reconcile. This establishes as a **relation, not a constant**, that *every digit run in Butler's translation body is a footnote reference, and Butler's body contains no digits of its own* — he writes "twenty men", "twenty oxen", "a couple of blazing torches" in words throughout. Book 1 holds markers 1 to 16.

**I left the class's hardest cases in rather than assuming them away**: the marker after a closing quotation mark (`Argos.”9`), the marker preceded by a space and followed by an em dash (`others 10—`), and the marker before a comma (`cloisters11,`). All three are places a sloppy rule leaves visible damage.

**Then, and only then, I diffed.** My reconstruction: take the lines after the all-caps heading block up to the line before `BOOK II`; paragraph = maximal run of non-blank lines; strip footnote-reference digit runs together with any whitespace immediately preceding them; join the lines of a paragraph with a newline. Result: **32 paragraphs, and all 32 byte-identical to `source-book1.json`. Zero diffs.**

Two things came out of the diff and are worth recording.

- **The staged `original-en` preserves PG's hard line wraps** as literal newlines inside every paragraph (32 of 32 here; 1,023 of 1,027 across the served file). My first reconstruction joined lines with a space and differed from the staged file in all 32 paragraphs for that reason alone — a useful demonstration that the check is capable of failing. Joining with a newline gives byte-identity.
- **The candidate contains no newlines at all**, and that is **correct, not a defect**: the served `odyssey-modern-en.json` and `odyssey-modern-da.json` both contain **zero** embedded newlines across all 1,027 paragraphs. The candidate matches the convention of the file it replaces. No finding; recorded because the difference between the two files is otherwise alarming at first sight, and the next Book's reviewer should not have to rediscover it.

**The source claim holds.** The staged Book 1 is Butler's translation body and nothing of PG's apparatus, confirmed from a property of the text independent of the build.

---

## Rulings on the items the drafter flagged

**1. B01-P017, the minimum-ratio paragraph (0.858) — the drafter's flag is correct. The paragraph is complete. It is not a defect, and it should not be redrafted.**

I did not accept the aggregate explanation. I diffed Telemachus's speech clause by clause against Butler. Every claim the continuity sheet lists is present and in Butler's order: the counterfactual death at Troy, the mound, the inherited renown, the storm-winds, the no-trace image, the "nothing but" inheritance, the escalation to a second kind of sorrow, all three islands by name (Dulichium, Same, Zacynthus) plus Ithaca's own leading men, the pretext of courtship, and Penelope's double refusal. **No claim, no qualification and no name is missing.** The 33-word shortfall is real syntactic compression of Butler's one 232-word sentence-chain — "as regards your question" becomes "to answer your question", "when the days of his fighting were done" becomes "once the fighting was over", "who will neither point blank say that she will not marry, nor yet bring matters to an end" becomes "who will neither flatly refuse to marry nor bring the matter to an end" — which is exactly what the package exists to do, and the last of those is better English than Butler's without losing the double negation.

**But the ratio and the losses do coincide,** and the paragraph carries four of them: `a mound over his ashes` becomes `a burial mound` (the cremation is gone), `I inherit nothing but dismay` becomes `nothing but grief` (see **17.1** — this one matters), `all the principal men of Ithaca` becomes `the leading men of Ithaca`, and `Nor does the matter end simply with grief` becomes `And it does not end there with grief`. Two are findings below. **The ruling is that the low ratio is not evidence of dropped content, and the drafter was right to flag it rather than hide it; the paragraph nonetheless needs two small restorations, for reasons that have nothing to do with its length.**

**2. Butler's unclosed quotation at B01-P018 into B01-P019 — CONFIRMED, and the drafter's reasoning is right.**

Verified mechanically in both files: source P018 and candidate P018 each carry two opening marks and one closing mark, each is the only unbalanced paragraph in its file, and each successor paragraph opens with its own opening mark. This is Butler's printing convention for one continuous speech split by a paragraph break, not a defect, and "fixing" it would tell the reader that Athena stopped speaking and started again. One thing to add to `continuity.md`: the convention has to survive into the app for the same reason it has to survive here — in a paginated reader the alternative reads as a dropped closing quote, not as a convention. **Keep as drafted.**

**3. `hecatomb` folded to "an offering of a hundred sheep and oxen" (D3) — UPHELD, with one caveat offered rather than pressed.** See optional finding **3.1**. The glossary licenses it, the accessibility standard supports it, Book 1 never needs the word again, and I would not reopen it. The caveat is that Butler declines to state a number and the fold states one.

**4. The candidate takes no wording from the served `modern-en` or from any other translation.** I looked for the tell — clusters of vocabulary Butler does not use, or a famous phrase arriving intact. The opening is the passage most exposed to this and the continuity sheet flags it honestly. `Tell me, Muse, about that resourceful man` is built out of Butler's own `Tell me, O Muse, of that ingenious hero`: the verb, the vocative, the demonstrative and the sentence shape are all Butler's, and "resourceful" is a plain modern word for "ingenious" rather than any other translator's choice. **No import found anywhere in the 32 paragraphs.** I do, separately, think `hero` becoming `man` is a loss in its own right and say so at **1.1**, on Butler's evidence alone.
