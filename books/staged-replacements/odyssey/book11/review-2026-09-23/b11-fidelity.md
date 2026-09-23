# Book 11 fidelity review: "The visit to the dead" (b11-draft.json)

**Reviewer:** an independent source-based fidelity reviewer. I did not draft this Book.
**Candidate:** `scratchpad/ody/b11-draft.json` (read-only, not modified). **Source:** `book11/source-book11.json` (Butler, PG #1727).
**Read first:** ODY-RULES.md; GLOSSARY.md (every section named); PUNCTUATION.md §1–§6; WORKFLOW.md (Accessibility standard, Voice rules); the drafter's notes; accepted Book 10 and Book 9 v2 as style references; ledger D5 (widened) and Book 8 round-1 O-1.

## Coverage

**I read all 54 of the 54 paragraphs** and compared each one with its source paragraph. I worked in packets of 8 or 9 (P0–7, 8–15, 16–26, 27–35, 36–44, 45–53, 0-based), with a neighbouring paragraph on each side. I then read the whole Book through for continuity. The paragraph count, order and indices match the source.

## The three items the coordinator asked me to verify

**1. Quotation structure (D4, nested single quotes).** I compared the opening and closing marks of every paragraph by script and then by reading.
- The frame `“` opens every paragraph that Butler opens with one: P0–26 and P33–53.
- P27 is narration with no opening mark, as in Butler.
- P26 closes the first part of the tale with `”`, as in Butler.
- P28–32 are self-contained double-quoted speeches, as in Butler. The split speech tags in P29 and the "And Ulysses answered" in P31 are normalized under PUNCTUATION §3.
- P33 reopens the frame and stays unclosed, as in Butler.
- Nested speech is in single quotes throughout. The reordered speech tags in P36, P38 and P40 keep the same marks.
- There are no ASCII quotes.
- **One defect, and it blocks: P8.** Butler opens it `“‘When you get home` and ends it `will come true].’`. It is the second paragraph of Tiresias's prophecy. The candidate opens it `“When` and has no closing `’`, so the prophecy reads as Odysseus's own narration. The drafter's note says the source has no mark at the end of P8, and that is incorrect.

**2. Restored ethnonyms.** These are correct, and every instance falls in the same paragraph as Butler's.

| Name | Butler | Candidate |
|---|---|---|
| Achaean | 2 | 2 |
| Achaeans | 2 | 2 |
| Argives | 5 | 5 |
| Danaans | 4 | 4 |
| Hellas | 1 | 1 |

"Greek", "Greeks" and "Greece" appear 0 times. The per-paragraph census of capitalized names is clean.

**3. Restored names.** These are correct:
- Oceanus 4/4, Erebus 2/2, Ilius 1/1 (beside Troy 7/7), Gaia 1/1, Anticlea, Alcmena, Tyndarus, Ceteians and Oedipodes (kept, as the coordinator decided).
- Roman names mapped: Proserpine→Persephone 6/6, Hercules→Heracles 4/4, Mars→Ares 1/1 (P42), Jove→Zeus, Neptune→Poseidon, Minerva→Athena, Mercury→Hermes, Juno→Hera, Diana→Artemis. Bacchus→Dionysus 1/1 under D5, as the coordinator decided.
- Teiresias→Tiresias 7/7, which matches the Cast display name (`odyssey-threads.json` characters/21 name.en "Tiresias") under D8.
- The hazards are clear: Arete is intact, `heaven` is unchanged (the one apparent drop is P8's "gods in heaven" → "heavenly gods"), and Ops, Rhea and Helios appear 0 times.
- **One gap: `Pollux` (P23) was left in its Latin form.** Widened D5 (ledger, 2026-09-13) names "Castor and Pollux (Polydeuces)" among the cases Book 11 would meet, and it is the same case as Bacchus. I have marked it blocking under ODY-RULES' binding wording, but it is the coordinator's call.

## Counts

- **Findings: 23. Blocking: 5. Non-blocking: 18.**
- **Blocking:**
  - P8, the missing `‘` at the opening (convention).
  - P8, the missing `’` at the close (convention).
  - P8, "your people will be blessed" for Butler's "your people shall bless you". The actor is reversed (meaning).
  - P1, "maidens who had died for love" for Butler's "crossed in love". This invents a cause of death (meaning).
  - P23, Pollux→Polydeuces under D5 (name). The coordinator should confirm this one.
- **Non-blocking:**
  - Convention (4): "On this" should be "At this" (GLOSSARY's Book 4 row, held in Books 9 and 10) at P8, P11 and P53. At P35, "cloister" should be "gallery" and "mixing bowl" should be "mixing-bowl".
  - Omission (7): P8, P19, P25, P32, P35, P36, P53.
  - Meaning (5): P1, P2, P21, P42, P46.
  - Addition (1): P17.
  - Aloud (1): P29.
- Every "old" string was checked by Python as exact and unique within its paragraph, and all 23 apply cleanly together.

I found nothing else. Violence, grief and sexuality are not softened: "lay with her", "kill the murderous slut" and "hanged herself" all stand. The class-C bracket (PG 4884–4902) has its marks dropped and every word kept. Numbers survive: a cubit, nine fathoms, nine cubits, nine acres, twelve months, three times. The fixed formulas hold: "Odysseus, noble son of Laertes" ×4, "tell me truly" per R6, "great sacrifices", "covered gallery" at P27 and "the Aeaean island".

## Verdict

**BLOCKING FINDINGS**. There are 5 blocking findings, 3 of them in P8. Findings are in `b11-fidelity.json`.
