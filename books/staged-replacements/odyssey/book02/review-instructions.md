# Independent Review Instructions — the Odyssey, Book 2

Give this exact text to the independent reviewer, unmodified.

---

You are independently reviewing a proposed modern-English reading edition of Homer's Odyssey, Book 2, against its supplied source: Samuel Butler's 1900 public-domain prose translation, as served in `app/public/data/editions/odyssey-original-en.json` chapter 2 and extracted verbatim into `book02/source-book2.json`.

Read `GLOSSARY.md` first. It fixes: the **naming decision** — the modern edition uses the **Greek** forms (Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus, Artemis), **not** Butler's Roman ones, with a **closed** seven-row mapping table and six enumerated hazards, of which `Ops` (Butler's name for Eurycleia's grandfather, a man, which a general Roman→Greek deity list would turn into Rhea) is the one that fires in this Book; the **spelling standard** (American, so *gray* not *grey*, *honor* not *honour*); and the recurring epithets and formulas, including the ones carried over from accepted Book 1. Then read `PUNCTUATION.md` (typographic quotation marks and apostrophes; which Victorian quotation habits are normalized and which are preserved) and `book02/continuity.md` (the per-paragraph decisions, the source-verification method and audit, the recurring formulas fixed here, and the base-text defects).

A rendering used consistently per the glossary is not a finding; an unrecorded departure from it is. A rendering that **differs from accepted Book 1 for the same Butler formula** is a finding even if it is good English — Book 1's round-1 review found that the package's characteristic defect is one word of Butler's rendered two ways, and Book 2 is the first place that risk runs between Books rather than within one.

Review each packet carefully. Neighbouring context is supplied to help interpret the assigned paragraphs. For every assigned paragraph, return either specific findings or "No material issue found."

Check:

- Who acts, what happens, and where: the calling of the assembly; Telemachus's complaint; Antinous's answer and the story of Penelope's web; the omen of the two eagles and Halitherses's reading of it; Eurymachus's dismissal; Mentor's rebuke and Leiocritus's answer; Telemachus's prayer and Athena in Mentor's likeness; the store-room and Eurycleia's oath; the gathering of the crew, the drugging of the suitors, and the launch.
- Physical arrangements, objects, materials and **quantities** — the staff, the two hounds, the oxen and sheep and fat goats, the embroidery frame and the web, the twelve jars with lids, the twenty measures of barley meal in leather bags, the casks of unmixed wine, the doors that open in the middle, the hawsers, the mast in its socket in the cross plank, the forestays, the ropes of twisted ox hide, the mixing bowls. **A quantity Butler does not state must not be supplied**, and one he does state must not be generalized away.
- Genealogies and relationships stated as fact: Aegyptius's four sons and which of them died and which is a suitor; Eurycleia as daughter of Ops son of Pisenor; Eurymachus son of Polybus; Leiocritus son of Evenor; Noemon son of Phronius; Mentor's standing as a friend of Odysseus left in charge with authority over the servants.
- **Negation, conditions, certainty, frequency, timing and causal relationships** — Athena's chain of conditions at B02-P019 (*if* you are made of the same stuff; *unless* you have the blood of both parents; sons are *generally* worse; *not entirely* without his discernment); Halitherses's claim to prophesy "not without due knowledge" and his two verifiable predictions (the twentieth year, and that no one would know him); Eurymachus's two-limbed threat; Telemachus's conditional branch at B02-P012.
- **Irony left to work.** Mentor's speech at B02-P014 is ironic from its first sentence ("I hope you may never again have a kind and well-disposed ruler"). Check that it is neither softened nor signposted.
- Imagery, formal epithets, and meaningful repetition: the dawn formula; "spoke to them plainly and in all honesty" used of both Halitherses and Mentor; "Hear me, men of Ithaca"; "glaring death into the eyes of the men below"; the eagles flying off **to the right**, which is the omen and is deliberately unglossed; "the gray-eyed daughter of Zeus"; "the foam hissed against her bows".
- **Formulas shared with accepted Book 1**, listed in `book02/continuity.md` with both renderings side by side. One of them is flagged there: Book 1's reviewer noted without making it a finding that "so dear a daughter may **expect**" became "a beloved daughter **deserves**", moving from expectation to desert. It is repeated here for consistency, not because the objection was answered. **Rule on it**; if it should change, it changes in both Books.
- Whether direct speech is kept as direct speech throughout, not paraphrased into indirect or reported speech — and whether the **quotation inside a quotation** survives as one at B02-P006 (Penelope's speech inside Antinous's) and B02-P007 (the suitors' ultimatum inside Antinous's).
- Whether Butler's **unclosed-quotation convention** at the paragraph break between B02-P006 and B02-P007 (one continuous speech by Antinous) is correctly preserved rather than silently "corrected" — and note that the *inner* single quotation at the end of B02-P006 **is** closed, which is Butler and not a slip.
- **The base-text decision at B02-P004.** Butler's own square bracket, `[do not] hold back` (PG #1727 line 802), which the staged original keeps verbatim. The candidate drops the mark and keeps the words, with a colon introduced to carry the pointing. This is the package's first bracket of any kind. Rule on it, and say whether it should become a recorded rule before a later Book produces a second (the Book 10 pilot reports brackets of a different class in its chapter).
- **The Book's one gloss**, at B02-P008: "the Erinyes—the spirits of vengeance—to avenge her". Is three words at first use the right size, and is the alternative English name *the Furies* rightly unavailable to an edition that has just decided against Roman names?
- Two flagged Butler spellings, kept rather than corrected: **`Ilius`** (B02-P002) beside Butler's own **`Troy`** in the same Book at B02-P010, and **`Mycene`** (B02-P007), who is a woman in a list of famous women and not the city.
- **The word ratio is 0.9993** — much closer to 1.0 than Book 1's 0.9462. Judge for yourself whether that is Book 2's plainer, speech-heavy source or a rendering that has not done enough work. `book02/continuity.md` offers two counter-checks (no paragraph byte-identical to Butler; 22 dead Butler words and forms all gone) which are offered, not claimed as proof.
- Missing content and unsupported additions, including any name left in Butler's Roman form (a glossary violation), any name wrongly mapped (especially `Ops`), any modern gloss not licensed by `continuity.md`, and any intensifier, clarifier or explanatory transition Butler does not have.
- Remaining vocabulary or syntax that obstructs a general modern reader.
- Whether suggested corrections preserve natural prose and Butler's meaning.

Please also verify the source claim independently rather than taking it on trust. `book02/continuity.md` and `scripts/verify_source_book2.py` state the rule, the audit, and two negative controls. Re-running that script proves little; a reconstruction built from a different property of the text proves more.

For each finding, provide:

- Stable paragraph ID (B02-P001 … B02-P035).
- Short exact source and candidate quotations.
- The precise difference and why it matters.
- Severity: Must fix / Worth improving / Optional preference.
- The smallest proposed correction.
- Confidence and any plausible alternative reading.

Do not invent objections to fill a quota. Do not equate different wording with an error. Do not claim an addition or a phrase came from another translation unless verified against that translation (Fagles, Lattimore, Wilson, Fitzgerald and other in-copyright translations should not be consulted for this review either). Preserve deliberate ambiguity. Word and paragraph counts do not prove semantic completeness.

Save findings by paragraph ID under `book02/review/`. Make no changes to `candidate-v1.json`.

After reviewing every packet, read the full candidate continuously (`candidate-v1-readable.md`) for voice, pacing, repetition, terminology, and transitions.

Finish with: Accept / Accept after corrections / Substantial revision required. State review coverage and limitations. Do not assign a numerical score or claim that no errors can remain.
