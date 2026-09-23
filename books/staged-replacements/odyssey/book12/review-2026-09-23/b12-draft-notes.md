# Book 12 draft notes

Base: live-baseline-book12.json, repaired against source-book12.json (Butler 1900,
PG #1727) per ODY-RULES.md / GLOSSARY.md / PUNCTUATION.md / WORKFLOW.md.

**Counts: KEPT 0 / CONVENTIONS 21 / REPAIRED 18 / REWRITTEN 0** (39 paragraphs
total). Every paragraph needed at least the frame-quote convention fix (see
defect 1 below), so none qualified as a bare KEEP; none was damaged enough to
require a from-scratch REWRITE. Glosses added: 0.

Live baseline had two systematic defects across nearly every paragraph, matching
the Book 11 finding:
1. Every paragraph had dropped Butler's unclosed frame-quotation convention
   (PUNCTUATION.md §2 / D4): Odysseus's narration to the Phaeacians is one
   speech running from B09-P001 to the end of chapter 12, and every paragraph in
   the source reopens with "“" (with nested speech in single quotes). The live
   baseline used ordinary closed ASCII `"..."` quoting per paragraph instead.
2. Ethnonyms/names were partly flattened or mis-mapped: "Argives" -> "Greeks"
   (P14), "Hyperion" -> the invented name "Helios" (P10, P13, P20 — Butler never
   uses "Helios" anywhere in the poem; this is hazard 6 in GLOSSARY.md), and a
   spelling drift "Lampetie" -> "Lampetia" (P10, P30, Butler's own spelling, no
   Cast entry, so it stands per the Diomed/Idothea precedent).

Per-paragraph disposition (0-indexed, matching source array):

- P0: CONVENTIONS — reopened frame quote "“"; otherwise faithful, kept.
- P1: REPAIRED — frame quote; restored fixed dawn formula "When Dawn, the
  rosy-fingered child of morning, appeared" (live had dropped "child of
  morning"); restored concrete noun "cairn" (live genericized to "burial
  mound"/"mound marker", twice).
- P2: REPAIRED — frame quote; nested Circe speech converted to single quotes;
  restored "maidservants" (live said just "servants", dropping "maid-").
- P3: CONVENTIONS — frame quote only; content faithful.
- P4: CONVENTIONS — frame + nested single quotes; "crosspiece" for the mast's
  crosspiece (see compound note below); otherwise faithful.
- P5: REPAIRED — frame + nested quotes; restored "the deep blue waves of
  Amphitrite" (live dropped the goddess's name entirely, leaving a bare
  description); restored the Wanderers as Butler's own name for these rocks
  (live substituted "the Wandering Rocks", which is a different phrase Butler
  uses later, at P20, for the same rocks — the two forms are kept distinct
  because Butler writes them distinct); restored "timid" doves (live: "gentle");
  restored Butler's spelling "Aetes" and "the house of Aetes" (live: "Aeetes'
  land" — a name not yet in the table, already Greek, no Cast entry, so
  Butler's own spelling and phrasing stand).
- P6: REPAIRED — frame + nested; restored "Erebus" (live dropped the name,
  paraphrasing "turned toward Erebus" as "toward the underworld"); restored
  "Amphitrite" a second time (live: "these waters"); restored "dogfish" (live
  genericized to "sharks" — dogfish is ordinary modern English and a distinct
  concrete noun from shark).
- P7: CONVENTIONS — frame + nested quotes only; content already faithful
  (fig-tree bracket already correctly rendered with the mark dropped, per
  GLOSSARY class-B/C bracket rule).
- P8: CONVENTIONS — frame + nested quotes only.
- P9: CONVENTIONS — frame + nested quotes only; adjective list ("savage, extreme,
  rude, cruel and invincible") rendered with close synonyms, five for five,
  no loss.
- P10: REPAIRED — frame + nested; restored "Hyperion" (live: invented name
  "Helios," and an invented "the nymph" tag on Neaera not in Butler); restored
  Butler's spelling "Lampetie" (live: "Lampetia").
- P11: REPAIRED — frame quote; restored "heaven" (live: "the sky" — for
  consistency with every other bare use of "heaven" as Butler's metonym
  elsewhere in this Book, none of which was changed); restored directional
  precision "blew steady from astern" (live: "blew steadily from behind",
  dropping the nautical "dead aft" sense).
- P12: CONVENTIONS — frame + nested; "crosspiece" (live: "crossbeam").
- P13: REPAIRED — frame quote; restored "the rays of the sun-god, son of
  Hyperion" (live dropped "son of Hyperion" outright — this is Butler
  distinguishing the sun-god from his father Hyperion, an inconsistency with
  P10's "sun-god Hyperion" that is Butler's own and is preserved, not
  resolved); "crosspiece" (live: "crossbeam").
- P14 (Sirens' song): REPAIRED — frame + nested; restored "honor to the
  Achaean name" (the fixed formula from Book 3, recurring here — live:
  "glory of the Greeks", both flattening the ethnonym and dropping the fixed
  formula); restored "Argives" (live: "Greeks"); restored "sufferings" for
  Butler's "ills" (the fixed recurring-word rendering from Book 1 — live had
  "suffering", singular and not the fixed form); restored "before Troy" (live:
  "at Troy"); restored "our two voices" (live dropped the number "two" — the
  Sirens are naming themselves as a pair).
- P15: CONVENTIONS — frame quote only.
- P16: CONVENTIONS — frame quote only.
- P17: CONVENTIONS — frame + nested quotes only.
- P18: CONVENTIONS — frame quote only.
- P19: REPAIRED — frame quote; restored "spear in hand" (live had the
  fisherman holding "his rod", which contradicts the same sentence's "spears
  them with the ox-horn tip of his spear" two clauses later); restored "the
  poor little fish" (live genericized to "small fish", losing the pathos this
  simile is building toward the men's own deaths, mirrored in "munch them up").
- P20: REPAIRED — frame quote; restored "Hyperion" (live: "Helios"); restored
  Butler's own phrase "the Wandering rocks" with lower-case "rocks" (matching
  the bracket-dropped rendering fixed at Book 12's own review precedent,
  distinct from "the Wanderers" at P5); kept "Tiresias" per the Cast's spelling
  (Butler's "Teiresias" superseded the same way "Euryclea" is superseded to
  "Eurycleia" — Cast display name wins).
- P21: REPAIRED — frame + nested; restored the sense of "our lords the gods"
  (live: "the lord gods", which garbles "lord" from a noun in apposition to
  "the gods" into an adjective) as "the gods, our masters".
- P22: CONVENTIONS — frame + nested quotes only.
- P23: CONVENTIONS — frame quote only.
- P24: REPAIRED — frame quote; restored the fixed dawn formula (live had
  dropped "child of morning" again, as at P1).
- P25: REPAIRED — frame + nested; restored "the mighty sun" (live added a
  word Butler does not have, "sun god", where Butler simply personifies "the
  sun" bare).
- P26: CONVENTIONS — frame quote only.
- P27: REPAIRED — frame + nested; restored "ornament" (live: "offering" —
  Eurylochus is talking about decorating a temple with treasure, not making
  sacrificial offerings, which is a different, meaning-changing word).
- P28: REPAIRED — frame quote; restored the fixed rendering "the inner meats"
  both times (live varied it as "inner organs" / "inner meat", breaking the
  Book 3 fixed formula for this recurring pair of words).
- P29: REPAIRED — frame + nested; restored the bitter irony of "fine work"
  (live flattened Odysseus's sarcastic "see what fine work these men of mine
  have been making" into the literal "terrible work", losing the irony the
  line depends on for its tone).
- P30: REPAIRED — frame + nested; restored "Lampetie" (live: "Lampetia");
  restored "the sun" bare (live added "god": "the sun god").
- P31: CONVENTIONS — frame + nested quotes only.
- P32: CONVENTIONS — frame quote only.
- P33: CONVENTIONS — frame quote only.
- P34: REPAIRED — frame quote; restored "Zeus, son of Cronus" / "the son of
  Cronus" both times (live dropped the patronymic entirely both times,
  leaving bare "Zeus").
- P35: CONVENTIONS — frame quote only.
- P36: CONVENTIONS — frame quote only.
- P37 (unclosed class-C bracket, "[The gale from the West..."): CONVENTIONS —
  frame quote added; bracket mark already correctly dropped with the text
  standing and nothing recast across the (never-closed) boundary, per
  GLOSSARY's class-C disposition.
- P38 (closes the four-chapter frame quotation): CONVENTIONS — frame quote
  reopened at the start; closing "”" kept at the very end, since this is the
  first paragraph since B09-P001 to close the frame (PUNCTUATION.md §2).

## Conventions applied throughout (not re-listed per paragraph above)

- American spelling (armor, harbor, gray, favorable, etc.).
- Typographic quotation marks and apostrophes only (“ ” ‘ ’ ’); no ASCII
  quote or apostrophe survives (asserted by script).
- Name mapping: Ulysses -> Odysseus, Jove -> Zeus, Neptune -> Poseidon,
  Mercury -> Hermes, Saturn -> Cronus (in the fixed patronymic), Juno -> Hera.
  Already-Greek names (Amphitrite, Circe, Calypso, Hades, Aetes, Crataiis,
  Lampetie, Phaethusa, Neaera, Thrinacia, Erebus, Aeaea, Argo, Ithaca, Ogygia,
  Scylla, Charybdis) kept exactly as Butler spells them. Ethnonyms (Achaeans /
  Argives / Danaans / Trojans) kept, never flattened to "Greeks".
- "Tiresias", not Butler's "Teiresias", per the Cast's spelling (task
  instruction, same rule class as Eurycleia).
- Hazard 6 enforced: "Hyperion" never expanded to "Helios" (the name never
  appears in Butler and is not introduced here).
- Compound spelling: "crosspiece" (closed, Butler has both "cross piece" and
  "crosspiece" himself — normalized to the closed modern form throughout, a
  typographic decision, not a rendering one); "seashore" (closed); "bowshot"
  (closed); "sea-gulls" kept hyphenated (Butler's own spelling, no rule against
  it, low-risk to leave); "sun-god" kept hyphenated as Butler sets it — no
  Book has yet established a modern form for this compound (checked: absent
  from Books 9 and 10), so it is left as Butler's own setting pending a
  package ruling, rather than guessed at.
- Butler's brackets: the class-B bracket "[Wandering]" (PG 5543, P20) and the
  class-C brackets "[A large fig tree...]" (PG 5410, P7) and the unclosed
  "[The gale from the West..." (PG 5691, P37) are all rendered with the mark
  dropped and the words standing, nothing recast across either boundary, per
  GLOSSARY's settled disposition for both classes.
- Hazards Ops and Arete do not occur in Book 12; not applicable, and confirmed
  absent (not accidentally introduced) by the validation script.

## Glosses added

None. No new gloss was needed in Book 12 — Erebus, Amphitrite, Crataiis, and
the Wanderers are all left as Butler names them, on the "Trito-born"/"Diomed"
precedent (unglossed where nothing in the passage turns on further
explanation and no Cast entry supplies a display form).

## Validation performed

- `python3 build_b12.py` parses/writes the JSON, asserts 39 non-empty
  paragraphs, asserts every paragraph opens with "“", asserts no ASCII
  quote/apostrophe survives anywhere in the text, and asserts none of
  Ulysses/Minerva/Jove/Neptune/Mercury/Saturn/Diana/Venus/Juno/Vulcan/
  Ceres/Mars/Proserpine/Helios/Teiresias/Greeks/Rhea appear anywhere in the
  candidate.
- Confirmed only the final paragraph (P38) carries the closing "”", matching
  PUNCTUATION.md's record that chapter 12's last paragraph is the first since
  B09-P001 to close the frame.
- Re-read the full candidate paragraph-by-paragraph against
  source-book12.json a second time after the repairs above; no further
  omissions found (numbers, named figures, and hedges — e.g. "so far so
  good," "a very long while it seemed," "which so often wreck a ship" —
  all present).
