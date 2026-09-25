# Review 1D: source fidelity, chapter 8 (Alcibiades)

- **Reviewer role:** independent source-fidelity reviewer (not the author of the text under review)
- **Packet reviewed:** `source-packet-D.md`, chapter 8. Its 36 changed paragraphs are 8.0–8.6, 8.8, 8.13–8.14, 8.16–8.17, 8.19, 8.22–8.33 and 8.35–8.45.
- **Candidate sha256:** `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`. I recomputed it on `cand/symposium-modern-en.json` and it matches the packet header. The source hash is `3521a12d…95a6`, matching STYLE.md §1.
- **Method:** I compared each CANDIDATE against its SOURCE sentence by sentence, reading the BEFORE text and the unchanged neighbors (8.7, 8.9–8.12, 8.15, 8.18, 8.20–8.21, 8.34, 8.46) for context. Scripted checks confirmed four things:
  - the packet's SOURCE and CANDIDATE text is byte-identical to both JSON files at all 36 coordinates;
  - every phrase quoted below appears verbatim;
  - house style holds: no curly quotes, no non-ASCII except spaced em-dashes, no British spellings;
  - word-count ratios show no silent compression.
- **Date:** 2026-09-25

## Overall verdict: ACCEPT WITH CHANGES

The candidate is a strong rendering and much easier to follow than the baseline. Apart from the items below, every paragraph keeps the source's claims, names, numbers and images. That includes "more than two quarts", both patronymics in 8.38, all seven names in 8.28, and Potidaea, Delium, Laches, Brasidas, Nestor, Antenor, Ajax, Marsyas and Silenus.

Alcibiades pursues and Socrates refuses throughout, and 8.38's reversal of lover and beloved is correct. The sexual offer, the night under the cloak, "with boys or without them", the attendants and the drinking are all kept without euphemism or added judgment. The quotation levels are applied correctly, including the two continuation points, 8.0→8.1 and 8.29→8.30. Alcibiades's drunk, rambling, funny voice survives.

It should not be accepted as it stands, for three reasons:

- **Two BLOCKING items, each a one-phrase fix.**
  - #1: a comparative is weakened in 8.31 ("much less" became "no more ... than").
  - #2: a negation is softened in 8.36 ("never" became "hardly ever").
- **A set of SHOULD-FIX items, mostly small.**
  - Snags on first hearing: "deny yourself", the unexplained Olympus, "dined on", "rolling his eyes", and the ambiguous "his own".
  - A few lost qualifiers or intensifiers.
  - One glossary slip.
  - An inconsistent Silenus image.
- **A policy question (#20).** The renderer often silently follows Plato's Greek rather than Jowett. Most instances are harmless or improvements. However, STYLE.md §1 pins Jowett as the source, and books/CLAUDE.md says not to mix readings silently. The lead should either document these corrections or revert them.

## Checks that hold

- **Claims about Socrates.** These are complete and correctly attributed, except #1 and #2. They cover:
  - the rejection and the night (8.29–8.31);
  - his endurance of hunger and of cold, barefoot on the ice;
  - the Potidaea vigil and his prayer to the sun;
  - his rescue of Alcibiades and his weapons;
  - the prize for valor (8.35), where the reordered sentence keeps every element: Socrates deserved it; Alcibiades told the generals so; Socrates will not deny it; the generals wanted Alcibiades partly because of his rank; Socrates was keener than the generals;
  - the retreat from Delium with Laches.
- **Roles and directions.**
  - 8.27: "as if he were a beautiful youth and I a lover with designs on him".
  - 8.29: "of all the lovers I have ever had". The Diomedes exchange runs the right way: Alcibiades would be the one gaining gold for bronze.
  - 8.38: "He begins as their lover, and ends by making them court him instead".
  - 8.39: who loves whom is correct.
  - 8.41 and 8.43: the seating logic ("on my other side", "the man on my right", "If Agathon lies between us") works.
- **Quotation and speakers (STYLE §3).**
  - Alcibiades's speech (8.23–8.38) has no enclosing quotation marks, and 8.22 introduces it.
  - His remembered dialogue with Socrates is in single quotes. 8.22's nested "That's a lie!" is in double quotes.
  - 8.38's warning to Agathon is in single quotes, which fixes the baseline's stray `"...'`.
  - Verse 8.34 is unchanged.
  - Every speaker tag in 8.2–8.22 and 8.39–8.45 is right.
- **Glosses (STYLE §5).** Each is accurate, minimal and neutral:
  - "Diomedes in Homer, who traded bronze armor for gold". This is the *Iliad* exchange with Glaucus, and the direction is right.
  - "in your comedy". This is the *Clouds*; it stands in for the bracketed citation, which is omitted by convention.
  - "a Corybant's in the frenzy of the dance", a plain-English version of "Corybantian reveller".
  - "the wrestling school" for "palaestra".
  - "a tale, as Homer puts it" (see #29).
  - "heavy-armed foot soldier", "Ionian soldiers" and "sleeping mats" are also fine.
  - "uninitiated and uncouth" correctly gives the old sense of "profane and unmannered".
- **Substitutions accepted, no change needed.**
  - "my boys" to "my friends" (8.23): an address to adult guests, not an age term under §2.
  - "bully" to "insolent" (8.23): today's "bully" would mislead, and "insolent" matches the contempt described in 8.30.
  - "manliness" to "courage" (8.31): accurate, and avoids a modern reading about gender.
  - "wonderful monster" to "truly extraordinary creature" (8.30): avoids today's "monster".
  - "master of the feast" to "master of the drinking" (8.6).
- **Glossary (STYLE §4).** These are consistent:
  - revelers, ribbons, Diomedes;
  - self-control (8.26, 8.31);
  - beautiful (8.0, 8.3, 8.26, 8.27, 8.37, 8.45);
  - lowercase "god" (8.14);
  - "beloveds" (8.27);
  - "dinner" and "dined", following the pass's practice in 1.25–1.36.

  The exceptions are #5 and #25.
- **Greek references.** These come from my own knowledge of the text; I had no web access. They are here only to show where the candidate appears to follow Plato rather than Jowett. Verify them before relying on them.

## Findings

| # | Coordinate | Severity | Finding | Source wording | Candidate wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 8.31 | BLOCKING | A comparative is weakened. The source argues a fortiori ("much less"), but the candidate says Socrates was exactly as proof against money as Ajax against steel, not more so. Plato's Greek (219e, "much more invulnerable") agrees with Jowett, so this is wrong against both texts. | "For I well knew that if Ajax could not be wounded by steel, much less he by money" | "I knew very well that money could no more wound him than steel could wound Ajax" | "I knew very well that money could wound him even less than steel could wound Ajax" |
| 2 | 8.36 | BLOCKING | A negation is softened. "Never touched" becomes "hardly ever touch", in one of Alcibiades's claims about Socrates at Delium. The sentence is also now at odds with itself ("hardly ever touch ... pursue only those"). The candidate matches Plato's Greek (221b, *schedon ti*, "as a rule"), so this looks like a deliberate correction of Jowett, but it is not recorded (see #20). | "for this is the sort of man who is never touched in war; those only are pursued who are running away headlong" | "for in war people hardly ever touch men like that, and pursue only those who are running away headlong" | "for in war people never touch men like that, and pursue only those who are running away headlong". Alternatively, if the lead allows Greek-based corrections, record this one and change the ending to "and pursue those who are running away headlong instead". |
| 3 | 8.0 | SHOULD-FIX | Whose speech is meant? "His own" most naturally refers to the nearer subject, Socrates, so a first-time listener can take it that Socrates referred to his own speech. The allusion itself (7.52, "people say that lovers are looking for their other half") never names Aristophanes, and chapter 7 never mentions him, so nothing earlier settles it. "In answer to" has also weakened to "about". | "Aristophanes was beginning to say something in answer to the allusion which Socrates had made to his own speech" | "Aristophanes was starting to say something about the reference Socrates had made to his own speech" | "Aristophanes was starting to reply to the reference Socrates had made to Aristophanes's own speech" |
| 4 | 8.4 | SHOULD-FIX | A minor detail is lost. "Bodily" (fear for his physical safety) and "attempts" (Alcibiades's assaults) disappear, so the thing feared shifts from Alcibiades's actions to his feeling. Not BLOCKING, because the physical threat is explicit earlier in the paragraph. | "as I am in bodily fear of his mad and passionate attempts" | "because I am in real fear of his mad passion" | "because I am physically afraid of his mad and passionate attacks" |
| 5 | 8.4 | SHOULD-FIX | Glossary §4 says "fair" becomes "beautiful", which the candidate does everywhere else in chapter 8. "Other" is also dropped. | "I have never been allowed to speak to any other fair one, or so much as to look at them" | "I haven't been allowed to talk to anyone good-looking, or even to look at them" | "I haven't been allowed to talk to anyone else who is beautiful, or even to look at them" |
| 6 | 8.23 | SHOULD-FIX | The new wording is awkward. "You can't deny yourself" is heard first as the idiom "deny yourself" (go without). "Will not" has also become "can't". | "You yourself will not deny, Socrates, that your face is like that of a satyr." | "You can't deny yourself, Socrates, that your face is like a satyr's." | "You yourself will not deny, Socrates, that your face is like a satyr's." |
| 7 | 8.23 | SHOULD-FIX | Olympus is never explained and is likely to be misheard; he appears nowhere else in the book. Coming just before "because the melodies are divine", a first-time listener will probably hear "the melodies of Olympus" as music from Mount Olympus, and then "him" refers to no one. STYLE §5's own example, "Olympus, Marsyas's pupil", fixes this. | "for the melodies of Olympus [citation note omitted] are derived from Marsyas who taught them" | "for the melodies of Olympus come from Marsyas, who taught them to him" | "for the melodies of Olympus, Marsyas's pupil, come from Marsyas, who taught them to him" |
| 8 | 8.23 | SHOULD-FIX | The image has shifted. "Possess" (being taken over by the god, as in the mystery rites the sentence refers to) becomes "cast a spell over", which merges it with "charmed" in the sentence before, and "the soul" is dropped. The candidate keeps possession in 8.24 ("take possession of"), so the thread breaks. | "they alone possess the soul and reveal the wants of those who have need of gods and mysteries" | "they alone cast a spell over people and reveal which of them are in need of the gods and their mysteries" | "they alone take possession of people's souls and reveal which of them are in need of the gods and their mysteries" |
| 9 | 8.28 | SHOULD-FIX | The new wording is awkward. "Dined on" means "ate", so the phrase says he ate the couch. | "the same on which he had supped" | "the same one he had dined on" | "the same one he had lain on at dinner" |
| 10 | 8.28 | SHOULD-FIX | A qualifier is dropped; STYLE §2 says qualifiers stay. "Likely" is Jowett's own (the Greek says only "will understand"), so either restore it or record the change under #20. | "as they alone will be likely to understand him" | "because they alone will understand him" | "because they alone are likely to understand him" |
| 11 | 8.28 | SHOULD-FIX | The content has changed. Jowett's third place ("some other part") becomes a remark about what to call it. This follows the Greek (218a, "or whatever one should call it") but departs from the source without a record (see #20). | "I have known in my soul, or in my heart, or in some other part, that worst of pangs" | "in my soul, or my heart, or whatever you want to call it" | "in my soul, or my heart, or some other part of me". Alternatively, keep it and record it as a documented correction. |
| 12 | 8.29 | SHOULD-FIX | The meaning has shifted. "Say so" points back to "you are the only one worthy of me", so it now reads as Socrates being too modest to claim he is worthy. The source means too shy to speak up, that is, to declare himself. | "and you appear to be too modest to speak" | "and you seem too modest to say so" | "and you seem too modest to speak up" |
| 13 | 8.29 | SHOULD-FIX | A comparative is weakened: "infinitely" becomes "far". The Greek's "vastly" may explain it; see #20. | "some rare beauty of a kind infinitely higher than any which I see in you" | "You must see in me some rare beauty, of a kind far higher than the beauty I see in you" | "of a kind infinitely higher than the beauty I see in you" |
| 14 | 8.36 | SHOULD-FIX | An old phrase is kept whose modern meaning misleads. Today "rolling his eyes" means an exasperated or contemptuous upward look. The source means looking around him, which "calmly surveying" goes on to describe. | "stalking like a pelican, and rolling his eyes, calmly contemplating enemies as well as friends" | "stalking like a pelican and rolling his eyes, calmly surveying friends and enemies alike" | "stalking like a pelican and glancing from side to side, calmly surveying friends and enemies alike" |
| 15 | 8.36 | SHOULD-FIX | A qualifier is dropped (STYLE §2), which makes the stout defense certain rather than likely. This is again Jowett's own hedge; restore it or record it under #20. | "that whoever attacked him would be likely to meet with a stout resistance" | "that whoever attacked this man would meet with a stout defense" | "that whoever attacked this man would be likely to meet with a stout defense" |
| 16 | 8.37 | SHOULD-FIX | The comparison runs the wrong way. The source likens the Homeric pair to Pericles, making Pericles the standard. The candidate likens Pericles to them, apparently to match the Brasidas-to-Achilles comparison. Not BLOCKING, because likeness runs both ways, but the source's construction is reversed. | "or you may imagine Nestor and Antenor to have been like Pericles" | "or that Pericles was like Nestor and Antenor" | "or that Nestor and Antenor were like Pericles" |
| 17 | 8.37 | SHOULD-FIX | The central Silenus image is inconsistent. 8.23 has "busts of Silenus" (and 8.26 "the carved head"), but here the candidate says "statues" and "opens the statue", where the source says "the bust". A reader may wonder whether these are different objects. | "his words are like the images of Silenus which open" ... "but he who opens the bust and sees what is within" | "his words, too, are like the statues of Silenus that open up" ... "But whoever opens the statue and sees what is inside" | "his words, too, are like the busts of Silenus that open up" ... "But whoever opens the bust and sees what is inside" |
| 18 | 8.37 | SHOULD-FIX | The content has changed at the climax of the speech. "Duty" (what a good man must do) becomes "needs to consider" (what he must think about). This follows the Greek (222a, "consider") but departs from the source without a record (see #20). Jowett's phrase is already clear modern English. | "or rather extending to the whole duty of a good and honourable man" | "or rather, extending to everything that a good and honorable man needs to consider" | "or rather, extending to the whole duty of a good and honorable man". Alternatively, keep it and record it as a documented correction. |
| 19 | 8.43 | SHOULD-FIX | STYLE §2 says ages stay as the source states them. Jowett uses "the young man" for Agathon at 6.7 but "the youth" here, a teasing word. "This youth" keeps it and avoids reading "the youth" as young people in general. | "for I have a great desire to praise the youth" | "because I very much want to praise the young man" | "because I very much want to praise this youth" |
| 20 | 8.23–8.37 (pattern) | SHOULD-FIX | The candidate often leaves Jowett to follow Plato's Greek, without saying so. The larger cases are #2, #10, #11, #13, #15 and #18. Smaller ones: 8.23 "He may think it a caricature" (source: "will appear to him"; Greek "perhaps", 215a); 8.23 "the only difference" (source: "the difference"); 8.28 "one of his lofty deeds" (source: "the lofty actions"); 8.30 "whatever seems best to us both" (source: "as seems best"); 8.31 "the only way I had thought I could capture him" (source: "my only chance"); 8.31 "most amazing of all, no one has ever seen" (source: "wonderful to relate! no human being had ever seen"); 8.37 "he always seems to be saying" (source: "he is always repeating"). Most are harmless and several improve accuracy to Plato. But STYLE §1 names Jowett as the source, and books/CLAUDE.md says "do not silently mix their readings; document substantive source variants". | Listed in the Finding column | Listed in the Finding column | The lead decides for the whole pass. Either (a) record in STYLE.md or the pass notes that corrections toward the Greek are allowed, and list them; or (b) revert to Jowett. Under (a), the harmless cases need no change and #2, #11 and #18 are resolved by the record. |
| 21 | 8.3 | OPTIONAL | "Contrived" (schemed) becomes "managed", which loses the charge of scheming that goes with "lying in wait". | "where I perceive that you have contrived to find a place" | "I see you've managed to find a place" | "I see you've contrived to find a place" |
| 22 | 8.5 | OPTIONAL | "Despot" (tyrant) is softened to "master", losing the joking hostility that looks ahead to Alcibiades's theme of being enslaved. | "crown the marvellous head of this universal despot" | "so that I can crown this man's marvelous head too — the head of the master of us all" | "the head of this tyrant over us all" |
| 23 | 8.23, 8.24, 8.26, 8.30 | OPTIONAL | There are contractions in the unquoted set speech, against STYLE §6 ("The set speeches keep a fuller register"). The pass also uses contractions in other set speeches (3.0, 3.4 and 3.6 for Pausanias; 6.4 for Agathon), and Alcibiades is drunk, so this needs one decision for the whole pass. | — | "but I'm using it"; "if you won't admit it"; "And aren't you a flute-player?"; "If I weren't afraid"; "Isn't that just like a Silenus?"; "You won't deny that either, Socrates." | Either amend §6 to allow contractions in Alcibiades's speech, or expand them ("I am", "will not", "are you not", "were not", "Is that not", "will not"). |
| 24 | 8.24 | OPTIONAL | There are small losses in the first sentence. "Of you and your words" (hearing Socrates himself) is reduced to "your words", with hearing him directly left only implied by "even". "The souls of" is dropped. "It has no effect" has no clear subject; the source says "he produces". | "he produces absolutely no effect upon us" ... "the mere fragments of you and your words, even at second-hand, and however imperfectly repeated, amaze and possess the souls of every man, woman, and child who comes within hearing of them" | "it has no effect on us at all, or hardly any" ... "but mere fragments of your words, even at second hand and however badly repeated, amaze and take possession of every man, woman and child who hears them" | "he has no effect on us at all, or hardly any; but you, and even mere fragments of your words at second hand, however badly repeated, amaze and take possession of the souls of every man, woman and child who hears them" |
| 25 | 8.24 | OPTIONAL | Jowett's "wants" here means what the soul lacks; the Greek (*endeēs*) is the "lacking" of Diotima's argument, which glossary §4 renders as "lack". "Needs" is accurate, but "lacks" would keep that echo. | "neglecting the wants of my own soul" | "neglecting the needs of my own soul" | "neglecting what my own soul lacks" |
| 26 | 8.26 | OPTIONAL | "Flouting at" (jeering, scorn) is softened to "teasing". The Greek's "joking" partly supports the change, but "jeering" keeps Jowett's edge. | "all his life is spent in mocking and flouting at them" | "he spends his whole life mocking and teasing them" | "he spends his whole life mocking and jeering at them" |
| 27 | 8.28 | OPTIONAL | The content is kept without euphemism, but the Latin tag is dropped and the quotation marks move from the proverb to "with boys or without them". Readers may now take that phrase to be the proverb. It stays as obscure to a first-time reader as the source is. | "Yet as the proverb says, 'In vino veritas,' whether with boys, or without them" | "Still, as the proverb says, wine — 'with boys or without them' — tells the truth" | "Still, as the proverb says, 'wine tells the truth' — with boys or without them — and so I must speak" |
| 28 | 8.30 | OPTIONAL | "Only" is added. It is implied by "begins", but the source does not have it. | "The mind begins to grow critical when the bodily eye fails" | "The mind's eye begins to see sharply only when the body's eyes begin to fail" | Drop "only". |
| 29 | 8.33 | OPTIONAL | The gloss is accurate (the line is from the *Odyssey*), minimal and neutral. STYLE §5's own example, "as Homer says of Odysseus", would make the comparison of Socrates to Odysseus clear. | "I have told you one tale, and now I must tell you another, which is worth hearing," | "which is worth hearing — a tale, as Homer puts it," | "which is worth hearing — a tale, as Homer says of Odysseus," |
| 30 | 8.35 | OPTIONAL | "Again" is lost. It marks the repeated appeal to Socrates, which the candidate keeps in 8.30 as "either". "Will not" has also become "cannot". | "(this, again, Socrates will not impeach or deny)" | "Socrates cannot dispute that or deny it" | "Socrates will not dispute or deny this either" |
| 31 | 8.37 | OPTIONAL | "Wanton" (unruly and lewd, like the traditional satyr) becomes "insolent", losing the lewd sense. It is consistent with 8.23 and the Greek, so this is optional; "wanton" is still current English. | "he clothes himself in language that is like the skin of the wanton satyr" | "he wraps himself in language like the hide of an insolent satyr" | "he wraps himself in language like the hide of a wanton satyr" |
| 32 | 8.37 | OPTIONAL | There are two small additions. "For" adds a causal link the source lacks ("and they represent"). "Other generals" narrows "others", though it is a defensible gloss, since Brasidas was a general. | "You may imagine Brasidas and others to have been like Achilles" ... "and they represent in a figure not only himself, but his words" | "You might say that Brasidas and other generals were like Achilles" ... "for they represent, in an image, not only the man himself but his words" | "and they represent, in an image, not only the man himself but his words"; optionally "Brasidas and others" |
| 33 | 8.39 | OPTIONAL | "There was a laugh" becomes "everyone laughed", which says more than the source. | "there was a laugh at his outspokenness" | "everyone laughed at his frankness" | "there was laughter at his frankness" |
| 34 | 8.45 | OPTIONAL | "Attracting ... to himself" loses its erotic sense and becomes a matter of position only. The Greek supports "found" and "next to him", and the sentence before still carries the erotic point. | "how readily has he invented a specious reason for attracting Agathon to himself" | "And look how easily he has found a plausible excuse for getting Agathon next to him!" | "And look how easily he has found a plausible excuse for drawing Agathon to his side!" |

**Counts:** BLOCKING 2 (#1–#2); SHOULD-FIX 18 (#3–#20); OPTIONAL 14 (#21–#34).

## Coverage

- 8.0: #3
- 8.1: OK. The continuation quote is correctly reopened after 8.0.
- 8.2: OK
- 8.3: #21
- 8.4: #4, #5
- 8.5: #22
- 8.6: OK
- 8.8: OK
- 8.13: OK
- 8.14: OK
- 8.16: OK. The low word ratio is only Jowett's wordiness.
- 8.17: OK
- 8.19: OK
- 8.22: OK
- 8.23: #6, #7, #8, #20, #23
- 8.24: #23, #24, #25
- 8.25: OK
- 8.26: #23, #26
- 8.27: OK
- 8.28: #9, #10, #11, #20, #27
- 8.29: #12, #13. The Diomedes gloss and the continuation into 8.30 are OK.
- 8.30: #20, #23, #28
- 8.31: #1, #20
- 8.32: OK
- 8.33: #29
- 8.35: #30
- 8.36: #2, #14, #15
- 8.37: #16, #17, #18, #20, #31, #32
- 8.38: OK
- 8.39: #33
- 8.40: OK. The low word ratio is only Jowett's wordiness.
- 8.41: OK
- 8.42: OK
- 8.43: #19
- 8.44: OK
- 8.45: #34
