# beowulf — Beowulf (Anonymous, c. 1000 AD)

**Scope:** public
**Reviewer:** batch agent, long-form verse epics, 2026-09-11

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en — "Hall (1892)", tr. J. Lesslie Hall | `18c82694331e87f4` | 43 | 375 | 24,338 |
| modern-en — "Modern English" | `e015cde16836f30d` | 43 | 375 | 25,923 |
| modern-da — "Moderne Dansk" | `3f0b1ff0518a7476` | 43 | 375 | 23,690 |

`en_editions_aligned: true`. All 43 fitts present, in order, with their Hall chapter titles.

## Provenance / completeness of the core English text

`original-en` is genuinely J. Lesslie Hall's 1892 imitative-alliterative translation (*Beowulf: An Anglo-Saxon Epic Poem*, D. C. Heath), as labelled — verified against the known opening "Lo! the Spear-Danes' glory through splendid achievements / The folk-kings' former fame we have heard of". Public domain (1892, and Hall d. 1928). Complete.

**Structural note:** Hall's text is verse with hard line breaks, and `modern-en` *keeps the line breaks* — it is verse-to-verse, not verse-to-prose. That is a better structural choice than the prose route taken for divine-comedy and paradise-lost in this same batch, and it lets the alliterative texture survive.

**Digressions are intact.** I specifically checked the material most often cut from popular Beowulfs, and none of it is missing:
- Fitt XVII–XVIII, the Finn/Hnæf episode (the scop's song) — present in full, 1,114 words.
- Fitt XLI, "The Messenger's Retrospect" (the Swedish–Geatish wars, Ongentheow, Wulf and Eofor) — present in full, 902 words, the longest fitt but one.
- Fitt XXXIII–XXXV, Beowulf's reminiscences (Hrethel, Herebeald and Hæthcyn, Higelac's Frisian raid) — present.
- The Scyld funeral, the Sigemund/Heremod digressions, the Unferth flyting and the Breca swim — all present.
- Genealogies (Scyld → Beowulf the Dane → Healfdene → Hrothgar; Hrethel → Herebeald/Hæthcyn/Higelac) — present.

## Phase 1 flags: confirmed vs. disconfirmed

- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`, `para_count_mismatches: []` — **all confirmed.** I found no cut digression, no dropped kenning-cluster, no missing speech.
- `pct_identical_long_paragraphs: 0.0` — confirmed, nothing is byte-identical.
- `mean_weighted_similarity: 0.5231` — **true but it averages over two very different halves.** See below.
- `last_chapter_suspiciously_short: false` — confirmed; Fitt XLIII is 302 words and it is genuinely the last fitt (the barrow, the twelve riders, "the kindest of kings under heaven").

## THE MAIN FINDING: modernization strength decays steadily toward the end

Word-level `difflib` similarity between each `original-en` paragraph and its `modern-en` counterpart, by fitt (paragraphs ≥15 source words):

| Fitts | mean similarity | character |
|---|---|---|
| I–XI | 0.52–0.72 | genuinely modernized |
| XII–XXIII | 0.44–0.63 | **most strongly modernized** (Grendel fight, Grendel's mother) |
| XXIV–XXXII | 0.64–0.76 | middling |
| **XXXIII–XLIII** | **0.75–0.83** | **barely modernized** |

Fitt XXXVII is the worst at 0.826; Fitts XXXVIII, XLI, XLII, XLIII all sit at 0.76–0.81. The last quarter of the poem — the dragon fight, Beowulf's death, Wiglaf's speeches, the messenger's prophecy, the funeral — is essentially Hall with word order tidied. This is the same failure mode as `paradise-lost` in this batch, but here it is a gradient rather than a clean break, which reads like a generation pass losing steam rather than two different passes.

## Samples inspected (7 passages)

### 1. Fitt I, paras 0–5 — the opening and Scyld's ship-funeral — STRONG

Source: *"Lo! the Spear-Danes' glory through splendid achievements / The folk-kings' former fame we have heard of, / How princes displayed then their prowess-in-battle."*
Modern: *"Listen! We have heard of the glory of the Spear-Danes, / of the fame of those folk-kings in days gone by, / and how the princes performed deeds of valor."*

Right call: "Lo!"→"Listen!" (the standard modern rendering of *Hwæt*), and the compound "prowess-in-battle" unpacked. Kennings and compounds kept where they still work: "ring-prowed vessel" (Hall: "ring-stemmèd"), "the giver of rings", "the friend of the Scyldings", "whale-road"-class compounds elsewhere. "atheling"→"prince" in this fitt, which is the correct simplification.

Small blemish (para 4–5): Hall's *"Men are not able / Soothly to tell us"* becomes *"**True men** are not able, / those who dwell in halls, heroes under heaven, / to tell us **for certain**"*. The adverb *soothly* has been rendered twice — once mistakenly as an adjective attached to "men", once correctly as "for certain". "True men" is a mis-parse, not a reading.

### 2. Fitt XII, paras 2–7 — Grendel enters Heorot and is caught — STRONG

Source: *"But on earliest occasion he quickly laid hold of / A soldier asleep, suddenly tore him, / Bit his bone-prison, the blood drank in currents"*
Modern: *"at the first chance he seized hold of / a soldier in his sleep, tore him apart at once, / bit through his **bone-cage**, drank the blood in streams"*

Exactly the right instinct: the kenning is *modernized as a kenning* ("bone-prison"→"bone-cage") rather than flattened to "body". "middle-earth", "hand-grip", "master of malice", "the fell one" all survive. The mechanical clarity of the fight narrative is improved: Hall's *"Forward the foeman foined with his hand; / Caught he quickly the cunning deviser"* is untangled into who-grabs-whom without losing the alliteration.

One small invention (para 2): *"The door quickly opened / On fire-hinges fastened"* → *"The door burst open at once, / **though it was bound with forged iron bands**"*. "iron" is added, and "though" turns a flat description into a concession Hall does not make.

### 3. Fitt XVII, paras 2–5 — the Finn episode (the hardest narrative in the poem) — STRONG

*"Not causeless lamented the daughter of Hoce / The decree of the Wielder"* → *"Not without cause did Hoce's daughter lament / the decree of the Ruler"*. The notoriously compressed political content — the terms of the settlement, the shared hall, the Danes' obligation to follow their own ring-giver's slayer — is fully unpacked and made followable while every named party (Finn, Hengest, Hoce, Folcwalda, the Jutes, the Frisians) is kept. This is the strongest modernization work in the book.

### 4. Fitt XXXVII, paras 0–3 — Beowulf's death-wound — FAILING (mechanically light)

Source: *"To the prince 'twas the last of / His era of conquest by his own great achievements, / The latest of world-deeds. The wound then began / Which the earth-dwelling dragon erstwhile had wrought him / To burn and to swell. He soon then discovered / That bitterest bale-woe in his bosom was raging"*
Modern: *"To the prince this was the last / of his era of conquest by his own great achievements, / the latest of world-deeds. The wound then began / which the earth-dwelling dragon had earlier wrought him / to burn and to swell. He soon discovered / that the bitterest bale-woe was raging in his bosom"*

The entire change is `'twas`→`this was`, `erstwhile`→`earlier`, and moving "in his bosom" to the end. "bale-woe", "world-deeds", "wrought him to burn and to swell", "puissant prowess" (para 2), "liegelord", "the Weder-lord", "the worm" all stand. No modern reader is helped by this paragraph.

### 5. Fitt XLI, paras 0–2 — the Swedish wars, Ongentheow vs. Wulf and Eofor — LIGHT, with one real improvement

Mostly untouched: "fastness", "the field-of-protection", "the swinge of the edges", "age-hoary", "Scylfing" all carried over. `"not fey was he yet then"` → `"he was not yet doomed"` is a genuine and welcome gloss.

One real service: Hall's *"But his head-shielding helmet first hewed he to pieces"* is ambiguous about who hews whom; modern-en names the subject — *"but **Ongentheow** first hewed his head-shielding helmet to pieces"*. That is precisely the kind of clarification this edition ought to be doing everywhere and is doing only occasionally in the last quarter.

### 6. Fitt XLIII, paras 2–4 — the barrow and the closing lines — LIGHT

*"'Round the dead-mound rode then the doughty-in-battle, / Bairns of all twelve of the chiefs of the people"* → *"Then around the death-mound rode the doughty-in-battle, / sons of all twelve of the chiefs of the people"*. `bairns`→`sons`, `'Round`→`around`, `dead-mound`→`death-mound`. "doughty-in-battle", "as it is meet one praise his liegelord", "folk-troops" all remain. The final lines ("the kindest of kings under heaven, the gentlest of men, the most winning of manner, the friendliest to folk-troops, and the fondest of honor") are rightly left nearly verbatim — that one is defensible, because Hall's ending is already both clear and beautiful.

### 7. Fitt XXVI (Hrothgar's sermon) — spot-check only, sim 0.666 — acceptable, middling

## Phase 3 — human-edition research

The poem itself is beyond copyright; the question is which English translation.

**Candidate A — Ernest J. B. Kirtlan, *The Story of Beowulf, Translated from Anglo-Saxon into Modern English Prose* (written Brighton, Nov 1913).**
- Project Gutenberg #50742: https://www.gutenberg.org/ebooks/50742
- Rights: **public domain** (Gutenberg states "Public domain in the USA"; Kirtlan d. 1937, so life+70 expired in Denmark/EU in 2008).
- Complete, prose.
- Sampled: *"Now we have heard, by inquiry, of the glory of the kings of the people, they of the Spear-Danes, how the Athelings were doing deeds of courage."*
- Verdict: **more readable than Hall, but not more readable than our modern-en Fitts I–XXXII, and it still uses "Athelings" untranslated.** Its real advantage would be over Fitts XXXIII–XLIII only. Adopting it would cost the verse lineation and all the alliterative texture that our modern-en currently preserves well — a bad trade for a poem whose form is half its value. **Not recommended as a replacement; useful as a crib when repairing the last quarter.**

**Candidate B — Standard Ebooks edition of Hall** (https://standardebooks.org/ebooks/anonymous/beowulf/john-lesslie-hall), CC0 dedication, US public domain, 26,094 words. Same translation we already carry as `original-en`, cleanly produced. Useful only as a source-file refresh.

**Also public domain, considered and rejected:** Francis B. Gummere (1910, Harvard Classics) — alliterative, *more* archaic than Hall, no gain. J. R. Clark Hall's metrical translation (1914) — a different Hall; public domain in the US; not readable enough to be worth the confusion with our existing "Hall (1892)".

**Not found in this search:** a rights-clear, complete, genuinely contemporary human English Beowulf. Heaney (1999), Liuzza, Headley (2020), Tolkien's prose (2014) are all in copyright.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **5** | All 43 fitts, all digressions and genealogies intact; no omission found in seven samples; only blemish is "iron bands" and the "True men" mis-parse |
| first-read clarity | 25% | **3** | Fitts I–XXXII good; Fitts XXXIII–XLIII still carry "bale-woe", "puissant", "atheling", "liegelord", "swinge of the edges", "fey" |
| literary voice | 20% | **5** | Verse lineation kept, kennings modernized *as kennings* ("bone-cage"), alliteration preserved — the best-handled voice in this batch |
| restraint / no invention | 10% | **4** | Two small additions found ("iron", the concessive "though"); no fabricated content |
| naturalness | 5% | **3** | The last quarter reads as re-ordered 1892 verse |

**Weighted score: 4.3 — Good with fixes.**

## Recommendation

**LIGHT EDIT — scoped to Fitts XXXIII–XLIII.** Confidence: **high** on the diagnosis (measured across all 366 long paragraph pairs and confirmed by three reads in the affected range), **high** on completeness (I checked every commonly-cut digression by name).

Correction scope: **substantial** — "light" in kind (no retranslation, no structural change, no fidelity repair needed), but it covers ~11 of 43 fitts / roughly 6,000 words. The instruction to the editor is narrow and concrete: *bring Fitts XXXIII–XLIII to the same standard as Fitts XII–XXIII*, which means replacing the surviving Hall-isms (bale-woe, puissant, atheling, liegelord, erstwhile, doughty-in-battle, fey, swinge, foined, bairns, folk-troops where unclear) and naming ambiguous subjects, while keeping the line breaks and the kennings. Fitts I–XXXII need nothing.

Also fix, one line each: Fitt I para 4 ("True men are not able" → "Men are not able"); Fitt XII para 2 (drop the added "iron" and the concessive "though").

## Limitations of this review

- `modern-da` not checked.
- I did not compare against the Old English. All judgements are modern-en against Hall 1892, as instructed.
- 7 passages read closely out of 375 paragraphs; the similarity table is mechanical over all 366 long pairs, and similarity is not a fidelity measure.
- Digression completeness was verified by fitt title, word count and by reading Fitts XVII and XLI; I did not read Fitts XVIII, XXXIII–XXXV line by line.
- No rendering, audio, onboarding or `beowulf-threads.json` checks.
- Kirtlan was assessed from a single opening sample plus the Gutenberg rights statement; I did not read his dragon-fight or Finn episode.
