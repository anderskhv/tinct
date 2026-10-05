# Style note: *The Iliad*, Tinct Modern English

- **Book:** `iliad`
- **Edition:** `modern-en`
- **Date:** 2026-10-05

This note governs every renderer, reviser and reviewer on this candidate. It is the single place where choices are made once.

**Fidelity anchor:** `source-original-en.json`, byte-identical to the served `original-en` (Samuel Butler's 1898 prose translation; sha256 in `ACCEPTANCE-RECORD.md`). The edition modernizes Butler's English. It is not a new translation, and no other translation, in or out of copyright, is consulted or quoted from memory.

## What this edition is

A paragraph-by-paragraph rendering of Butler's prose into plain contemporary English that a general reader can follow on one read, while keeping the epic's dignity.

- **Register.** Everyday modern English, formal enough for an epic. No contractions in narration or speech. No slang. Prefer short sentences: split Butler's long chained sentences at natural joints, keeping every clause's content and its connection (cause, contrast, sequence).
- **Replace archaisms and stock padding** with natural equivalents (*bade*, *besought*, *wended*, *moreover*, *forthwith*, *whereon*, *sundry*, *rejoice* for *be glad*, "even so did", "Thus did he speak", "he said to him and addressed him"). Do **not** reword a sentence that is already clear modern English just to look different.
- **Everything survives.** Every character, patronymic, place, number, object, wound, weapon, gesture, simile and speech is kept. Nothing is summarized, merged or cut. Violence is as explicit as Butler's. Do not soften deaths, wounds, insults or cruelty, and do not sharpen them.
- **Similes** keep their full image and both halves ("as when… so…"). A simile is never shortened to a comparison.
- **Explain, don't invent.** A reference may be clarified inside the sentence in a few words only where the text itself supports it (e.g. "Hades" may stay "the house of Hades"). Never add a fact, motive, epithet or foreshadowing that Butler does not state. No bracketed notes, footnotes or commentary.
- **Speeches stay speeches** (direct quotation), and narration stays third person.
- **Length.** Output paragraph length is normally within 75–115% of the source's word count. A shorter paragraph needs a reason (formula compressed, padding removed) and must have lost no content.

## Structure (hard constraint)

- 24 chapters (the 24 Books), 1,137 paragraphs, exactly as served: same chapter numbers, titles (`Book N`), `sections: []` and per-chapter paragraph counts. Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or add a paragraph.
- Paragraph 0 of every Book is the served one-sentence **argument** (summary of the Book, dash-separated). Render it like the rest, with the same names, keeping every dash-separated item.
- Coordinates in this package are the file chapter `number` (1–24) and a 0-based paragraph index, written `ch7 p12`.

## Names (one decision, applied everywhere)

Use the Greek forms already used in the served modern text and in the Cast (character) data. Matching is case-sensitive and word-bounded.

| Butler | Modern edition | Notes |
|---|---|---|
| Jove | **Zeus** | "Father Jove" → "Father Zeus" |
| Juno | **Hera** | |
| Minerva | **Athena** | "Pallas Minerva" → "Pallas Athena" |
| Neptune | **Poseidon** | |
| Mercury | **Hermes** | |
| Vulcan | **Hephaestus** | |
| Venus | **Aphrodite** | |
| Mars | **Ares** | |
| Diana | **Artemis** | |
| Ceres | **Demeter** | |
| Bacchus | **Dionysus** | |
| Saturn | **Cronus** | "son of Saturn" → "son of Cronus" (never *Cronos*) |
| Latona | **Leto** | |
| Ulysses | **Odysseus** | possessive "Odysseus’s" |
| Diomed | **Diomedes** | Cast display name |
| Hercules | **Heracles** | |
| Aesculapius | **Asclepius** | |
| Ilius | **Ilium** | the city; Cast uses Ilium. "Troy" stays "Troy" |
| Alexandrus | **Paris** | Same man, two names in Butler; the Cast display name wins. Where Butler writes *Alexandrus* write *Paris*. (Recorded in `ACCEPTANCE-RECORD.md`.) |

Unchanged (already Greek or common English): Achilles, Agamemnon, Menelaus, Hector, Priam, Hecuba, Andromache, Helen, Patroclus, Ajax (both Ajaxes; keep "Ajax son of Telamon" / "Ajax son of Oileus" / "the two Ajaxes"), Nestor, Idomeneus, Aeneas, Sarpedon, Glaucus, Phoenix, Thetis, Apollo, **Phoebus Apollo** (keep "Phoebus" as Butler has it), Iris, Hebe, Dione, Hades, Tartarus, Oceanus, Olympus, Ida, Scamander, Xanthus, Simois, Hellespont, Scaean gates, Titans, Erinyes, Briareus, Rhea, Panic, Strife. Any other name is kept in Butler's spelling. Do not "correct" other spellings.

Peoples: keep Butler's three names for the Greeks, **Achaeans**, **Argives**, **Danaans**, exactly as he varies them, and **Trojans**, **Dardanians**, **Lycians** and every other tribe. Do not unify them and do not replace them with "Greeks".

*Heaven* (as the gods collectively) is not a name and is not changed to Zeus.

## Epithets and fixed phrases (one policy, applied everywhere)

1. **Kept, not dropped and not added.** Wherever Butler gives a god or hero an epithet, a patronymic or a fixed descriptive phrase, the rendering keeps it, so the repeated epithets stay recognizable. Where Butler has no epithet, none is added.
2. **One rendering per Butler phrase**, every time it recurs, in every Book. The table below is the fixed rendering. A Butler phrase not in the table that is already plain modern English is kept unchanged; one that is archaic gets one plain rendering, used identically thereafter, and the renderer reports it so it can be added here.
3. **Patronymics are kept in full** ("Agamemnon son of Atreus", "the son of Peleus", "noble son of Laertes").

| Butler | Modern edition |
|---|---|
| fleet of foot (of a person) | **swift-footed** ("Prothous, swift-footed" → "swift-footed Prothous" or "Prothous, who was swift-footed" by sentence) |
| king of men | **king of men** |
| shepherd of his people | **shepherd of his people** |
| knight of Gerene | **knight of Gerene** |
| lord of the earthquake / lord of the earthquake | **lord of the earthquake** |
| lord of thunder | **lord of thunder** |
| lord of the storm-cloud / gatherer of the thunder-cloud | **lord of the storm cloud** / **gatherer of the thunder cloud** |
| cloud-compelling Jove | **cloud-compelling Zeus** |
| aegis-bearing | **aegis-bearing** |
| god / lord of the silver bow; lord of the bow | **god of the silver bow**, **lord of the silver bow**, **lord of the bow** (as Butler varies them) |
| grey-eyed | **gray-eyed** |
| white-armed | **white-armed** |
| silver-footed Thetis | **silver-footed Thetis** |
| rosy-fingered Dawn; saffron-mantled Dawn | **rosy-fingered Dawn**; **saffron-robed Dawn** where Butler says *robe of saffron*, **saffron-mantled Dawn** where he says that |
| golden-haired / yellow-haired | **golden-haired** / **yellow-haired** |
| lion-hearted | **lion-hearted** |
| of the loud war-cry / of the loud battle-cry | **of the loud war cry** / **of the loud battle cry** (as Butler varies them) |
| Hector of the gleaming helmet | **Hector of the gleaming helmet** |
| tamer of horses | **tamer of horses** |
| slayer of Argus | **slayer of Argus** |
| godlike | **godlike** |
| sire of gods and men / father of gods and men | **father of gods and men** |
| cleaver of the ranks | **cleaver of the ranks** |

## Formulas (rendered once, identically)

| Butler | Modern edition |
|---|---|
| "Thus did he speak" / "Thus did she speak" / "As he spoke" | **"So he spoke"** / **"So she spoke"** / **"As he spoke"** |
| "…answered, saying" / "spoke, saying" / "said to him and addressed him" | plain **"answered"** / **"said"**. The speech is kept whole. |
| "even so did X" (simile close) | **"so X"** or **"in the same way X"**, as the sentence needs |
| "fell heavily to the ground, and his armour rattled round him" | **"fell heavily to the ground, and his armor clattered around him"** |
| "bronze" / "the point of the spear" | kept (concrete detail is never generalized) |
| "the ships of the Achaeans" | kept |
| "hecatomb" | **"a great sacrifice of …"** without supplying a number the text does not give |
| "bade" / "besought" / "wended" | said / told / begged / made her way |
| "Dawn" appearing | formula as in the epithet table |

## Spelling, typography, numbers

- **American spelling** (honor, armor, gray, favor, toward, scepter, defense), following the served modern edition and the accepted Odyssey edition. Never *towards*, never *sceptre*.
- **Quotation marks:** curly “ ” for speech, curly ‘ ’ for a quotation inside a speech. **Apostrophes:** curly ’. Where Butler leaves a long speech unclosed at a paragraph break, keep that convention (open the next paragraph with “).
- **Dashes:** Butler’s unspaced em dash (—) stays an unspaced em dash. Do not add dashes Butler lacks.
- **Possessive** of names ending in -s: "Odysseus’s", "Achilles’s" only where it reads naturally; "Achilles’" is not used. Prefer "Achilles’s".
- **Numbers and measures:** keep every number Butler gives. Keep cubits, talents, tripods, cauldrons, oxen as objects of value, unglossed unless a short gloss is needed to be understood ("a talent of gold").
- **Hyphenated compounds** of Butler's (e.g. *silver-footed*, *aegis-bearing*) are kept as epithet forms; do not break them into phrases.

## Special passages

- **Catalogue of Ships (Book 2) and the Trojan catalogue:** every leader, patronymic, place and ship-count stays, in Butler's order. Lists may be punctuated more clearly. Nothing is condensed.
- **Arming scenes, duels and the funeral games (Book 23) and Priam’s ransom (Book 24):** complete, with every object, prize and wound.
- **Shield of Achilles (Book 18):** every scene on the shield stays.
- **Prayers and oaths:** keep their formal structure and every named god.

## Review checklist (for reviewers)

For each paragraph: omission of any clause, name, patronymic, number or object; reversal of meaning (who struck whom, who spoke to whom, who died); mistaken names or genealogies; flattened or shortened similes; softened violence; added facts; wrong Roman→Greek mapping; inconsistent epithet rendering; leftover archaism; truncation (target under 75% of source words without a stated reason); paragraph misalignment.
