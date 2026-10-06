# Style note: *History of the Peloponnesian War* (Thucydides), Tinct Modern English

- **Book:** `peloponnesian-war`
- **Edition:** `modern-en`
- **Date:** 2026-10-06

This note governs every renderer, reviser, reviewer and verifier of this book. With 45 bundles and many hands, the term table and the typography rules are binding: do not vary them for elegance.

**Fidelity anchor:** `served-original-en.json`, the served `original-en`: Richard Crawley's 1874 translation. The task is a *modernization of that English*, not a new translation. Consult no other translation and no Greek.

## What this edition is

A paragraph-by-paragraph rendering of Crawley into plain contemporary English. It keeps every step of the narrative and every speech argument, every qualification, every name, number and date, and Thucydides' severe, compressed voice. It removes avoidable barriers (archaic diction, very long periodic sentences, stock formulae). It does not simplify the thought or explain it. The live modern-en is only a convenience: its first chapters are partly modernized, most paragraphs are verbatim Crawley, and its typography is mixed (see Typography). Keep a good rendering, fix drift, and fully render every paragraph left verbatim.

## Voice and sentences

- Thucydides is terse, analytical and impersonal. Plain, direct, slightly formal prose; no chattiness, no contractions (even in speeches), no slang, no modern idiom ("at the end of the day", "on the back foot").
- Break long periodic sentences at their natural joints, but keep the connectives that carry the logic (for, but, yet, so, therefore, since, although, while). Do not delete a "for" or "since" and leave two bare sentences. Do not add connectives he lacks.
- **Abstract nouns and compressed syntax are the author's own.** Keep abstract nouns (power, fear, honor, interest, necessity, advantage, empire, safety, aggrandizement) where Crawley has them; do not unpack them into vague verbs or into explanation. Prefer unfolding the syntax (a participle chain becomes two clauses) over replacing the noun.
- Keep sentence order and the order of facts and clauses within a sentence wherever English allows.
- Do not reword a sentence that is already clear modern English just to lower the similarity score.

## Force

Hedges and judgments stay exactly as strong or mild ("I conceive", "it seems", "probably", "I think", "I had almost said of mankind", "at least", "perhaps"). Do not soften atrocity (Plataea, Mitylene, Corcyra, Melos, Mycenae), sharpen doubt, or turn "may" into "will". Thucydides' own first-person remarks ("I", "my") and the statement that Thucydides was the historian stay in the first or third person as served.

**Speeches keep their rhetorical force and are never summarized or shortened.** This covers Pericles' Funeral Oration and later speeches (ch. 6, from p35), the Plague narrative (ch. 7), the Mytilenean debate (Cleon, Diodotus, ch. 9), the Melian Dialogue (ch. 17), and every Corinthian, Spartan, Athenian, Syracusan and other speech. Keep each speaker's argument steps, antitheses, appeals ("you", "we"), questions and imperatives, and the speaker's relation to the listeners. The words of the Melian Dialogue "the strong do what they can and the weak suffer what they must" and similar sharp formulations are rendered with equal bluntness and no softening. Keep antithetical pairs (words/deeds, fear/honor, safety/justice) as pairs.

## No additions

No commentary, no bracketed notes, no headings, no glosses, no dates added in modern terms (no "BC", no "431"), no stage directions. A reference may be clarified only inside the sentence in a few words where the text supports it, and rarely.

## Structure 1:1

- 26 chapters, 998 paragraphs. Chapter `number`, chapter `title` and `sections` (Book 1 to Book 8) exactly as served, character for character, including odd spacing, unspaced dashes and the faulty title of ch. 11 ("Year of the War" with no ordinal). The `section` field ("Book I"...) is also unchanged.
- Output paragraph N renders source paragraph N. Never merge, split, reorder, drop or invent a paragraph. The longest source paragraph is about 800 words; render it whole.
- A paragraph that is a short connective stays short: "Such were the words of the Corinthians." / "Approved by the people." / "The Melian commissioners answered:" Render each in its own paragraph, no more and no less.
- Output length is normally at least 75% of the source's word count.

## Technical terms: one rendering, kept stable

Decided from Crawley's own usage. "Keep" means the served form is the fixed rendering. Never convert between members of a row.

| Term | Rule |
|---|---|
| **Lacedaemon / Lacedaemonians** | Keep. These are Crawley's standard forms (about 700 uses). Do not change them to Sparta/Spartans. Likewise keep "Sparta" and "Spartan" where served (about 60 uses, incl. "Spartan army"), and never convert one family to the other. |
| **Peloponnese; Peloponnesians** | Keep, "Peloponnese" without "the" or "Peloponnesus". "The Peloponnesians" is the Spartan-led side; "Peloponnesian" is never replaced by "Spartan" or "Lacedaemonian". |
| **allies / the allies** | Keep "allies" and "ally" for the members of either alliance. Never "confederates", "partners", "the League" as a substitute. "Confederacy" or "league" stay where Crawley wrote them. |
| **Hellenes, Hellas, Hellenic** | Keep. Never "Greeks", "Greece", "Greek". ("Greece" survives only inside chapter 1's served title.) "Barbarians" and "barbarian" stay as served. |
| **the Mede / the Medes / Persians** | Keep each as served ("overthrew the Mede", "against the Medes"). "The King" (Persian) keeps its capital K; "the king" lower case for other kings. |
| **heavy infantry** | Keep. Crawley's fixed rendering of hoplites. Never "hoplites", "infantrymen", "foot soldiers". "Heavy-armed" (3 uses) stays "heavy-armed". "Light troops", "light-armed", "targeteers", "archers", "darters", "cavalry", "horse" stay as served. |
| **ships, vessels, galleys, men-of-war, fifty-oars, sail** | Keep "ship" as the default, "vessel/galley" where served. "Trireme" is never introduced. Replace only the idiom "a fleet of forty sail" by "a fleet of forty ships". "Men-of-war" (warships) becomes "warships" and "troopships" stays. "Fifty-oars" becomes "fifty-oared ships". |
| **talents, minae, drachmae, obols** | Keep each unit exactly as served with its number ("thirty talents a month", "ten thousand drachmae"; the plural "drachmae" stays, "drachma" singular). No conversions to dollars or modern values. |
| **ephors; archon / archons; archonship** | Keep ("ephors", lowercase; "one of the ephors for that year"; "the nine archons"). |
| **Long Walls, the Long Wall, the Phaleric wall** | Keep exactly: "the Long Walls" for the double wall to Piraeus, "the Long Wall" and "the Phaleric wall" as served. |
| **Decelea** | Keep this spelling (never Deceleia). |
| **Helots, Neodamodes, Perioeci, Thetes, proxenus / proxeni, Boeotarchs, Prytanes, targeteers, scytale** | Keep these Greek terms as served with their existing clarifications ("Neodamodes (or freedmen)"). Never add new glosses. |
| **assembly; Council of Five Hundred / Council of the Bean; senate; the Four Hundred, the Five Thousand** | Keep as served ("assembly", "Assembly" where capitalized, "senate" at Corcyra and Argos). "Generals", "commissioners", "resident aliens", "citizens" stay. |
| **empire, tribute, allies that pay tribute** | Keep. "Tribute" is not "taxes" or "dues". |
| **the plague; the disease** | Keep "the plague" for the Athenian epidemic, and "disease" / "sickness" / "distemper" where served for the illness; "pestilence" may become "plague" only when it means the same epidemic. Never "pandemic" or "epidemic". |
| **oligarchy, democracy, tyrant, faction** | Keep. "Faction" (stasis/party strife) is never "civil war" unless Crawley wrote that. |
| **truce, treaty, armistice, peace** | Keep each as served; "the thirty years' truce" and "the Peace of Nicias" stay as in the text and titles. |
| **furlongs, miles, cubits** | Keep the unit and the number. |

## Dating: summers, winters, years of the war

Thucydides' chronology is by summers and winters and numbered years of the war. Keep every such marker with its number and position at the head of its paragraph: "The next summer", "The same winter", "in the first days of the summer following", "and so the eleventh year of the war ended", "this war of which Thucydides was the historian". Do not replace them with "the following year", do not add or drop ordinal numbers, and never move them to another paragraph. Archon, Spartan ephor and month names (Anthesterion, Elaphebolion), "the fourteenth of the month", Olympic festivals and the bracketed note in ch. 26 p31 stay as served.

## Quotations, speeches and treaties

- **Direct speeches** (about 160 paragraphs begin with “) are quotation. Render them fully. Keep the served quotation-mark pattern exactly: every paragraph of a multi-paragraph speech opens with “ and only the last closes with ”. The "unbalanced" paragraphs are correct, not damage. Do not close or reopen them.
- **Dialogue with speaker labels** (ch. 17, Melian Dialogue): "Athenians." / "Melians." starting the paragraph stay, with the period, exactly as served.
- **Quoted documents** (treaties, truces, oaths, inscriptions, oracles, verse): keep their numbering and order; modernize the language lightly but keep legal precision, formulas of obligation and every party and place name. Numbered clauses stay as separate paragraphs starting "1.", "2." with the number and period unchanged.
- **Quoted poetry and oracles** (Homer and others, oracles): keep the quoted words; change only archaic word forms ("thee", "doth") and typography.
- Everything outside quotation marks (lead-ins, "spoke as follows:") is modernized. Citation data does not occur; numbers are never touched.

## Notes, markers and special elements

There are no footnote markers, asterisks or note paragraphs. Elements that do occur and stay in place: one bracketed editorial sentence (ch. 26 p31, keep brackets and meaning; fix only the stray space before the closing bracket if any); parentheses (about 67), which stay as parentheses around the same words; short paragraphs as above. Headings never occur as paragraphs.

## Names and spellings

- **All proper names, place names, patronymics and numbers stay exactly as served**, including the served spellings: Mitylene, Mitylenians (never "Mytilene"), Potidæa and Potidæans (keep the æ ligature wherever it is printed; Plataea and Plataeans are served without it), Corcyra, Corcyraeans, Epidamnus, Amphipolis, Pylos, Sphacteria, Syracuse, Gylippus, Alcibiades. Never normalize names within or between chapters; use the form the source paragraph uses.
- Never alter fleet and army sizes, casualty figures, sums of money, distances, dates, ordinals or the order of commanders and cities.
- Keep "son of X" naming ("Cleopompus, son of Clinias").
- Gods and festivals as served ("Athene", "Apollo", "the Olympic festival").
- **Spelling is American** throughout the edition: honor, harbor, neighbor, defense, center, armor, labor, valor, vigor, favor, behavior, color, offense, endeavor, splendor, "toward", "among", "while" (not amongst, whilst), "today", "tomorrow", "maneuver", "practice" (verb: "practice"). The live edition mixes both; use American everywhere. Proper names keep their served spelling.

## Typography

- Double curly quotes “ ” for speech and quotation, single curly ‘ ’ for a quotation inside one. **No straight quotes (" or ') anywhere.** Chapter 1 of the live modern-en uses straight quotes: do not copy them.
- Apostrophes curly ’ (including possessives: Agamemnon’s).
- A source unspaced em dash (word—word) becomes a spaced em dash ` — `. Hyphens in compounds stay hyphens ("fifty-oared", "heavy-armed").
- No ellipses except where the source has them; no newlines or double spaces inside a paragraph; numbered clause markers "1." as served.

## Things that must not happen

1. Summarizing, trimming or merging any speech, or flattening an argument into a conclusion.
2. Spartan for Lacedaemonian, Greek for Hellene, hoplite or trireme introduced, "Sparta’s allies" for "the Peloponnesians".
3. Any change to a name, spelling, number, fleet size, sum of money, distance or date; any "Mytilene" for Mitylene.
4. Moving a summer/winter/year marker, dropping a year ordinal, or adding modern dates.
5. Adding a gloss, bracket, explanation, transition or editorial verdict (for instance explaining talents, or "ironically").
6. Closing or reopening a speech’s quotation marks, or changing a speaker label.
7. Softening the Plague, Corcyraean revolution or Melian passages, or sharpening a hedge.
8. Leaving a paragraph verbatim from Crawley when it contains archaisms ("whosoever", "wherefore", "upon the understanding that", "it was not without its grounds"), and conversely rewording clear text only to move the gate score.
9. Straight quotes, British -our/-re spellings, or unspaced em dashes in the output.
